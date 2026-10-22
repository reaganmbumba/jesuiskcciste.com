// =====================================================================
// Solidarité — Dons en ligne : Edge Function `dons-solidarite` (Deno).
//
// Le donateur saisit son numéro : FlexPay envoie la demande de paiement sur
// son téléphone, il confirme avec son code PIN, l'argent arrive sur le compte
// marchand FlexPay de l'initiative (retrait ensuite vers le numéro de Reagan).
// Mêmes secrets que la boutique (Supabase > Edge Functions > Secrets) :
//   FLEXPAY_MERCHANT, FLEXPAY_TOKEN, FLEXPAY_ENV (« prod » ou « dev »), CALLBACK_SECRET
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement.
//
// Fichier unique (aucun import relatif) pour pouvoir être collé tel quel dans
// l'éditeur Supabase. « Verify JWT » doit être DÉSACTIVÉ : on peut donner sans
// compte et FlexPay appelle le webhook sans jeton.
//
// Actions (POST JSON { action, ... }) :
//   donate  { operation, provider, phone, amount, currency, donorName? } → { donationId, token, status }
//   status  { donationId, token } → { status, message }
//   callback (appelé par FlexPay : ?action=callback&donation=…&secret=…)
// Un don n'est JAMAIS marqué payé sur la foi du webhook : la fonction
// interroge toujours FlexPay (« check ») avant de valider.
// =====================================================================
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

type Provider = 'mpesa' | 'orange_money' | 'airtel_money';
type DonationStatus = 'pending' | 'paid' | 'failed';

const env = (k: string) => Deno.env.get(k)?.trim() ?? '';
const SUPABASE_URL = env('SUPABASE_URL');
const SERVICE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');
const FLEXPAY_BASE = env('FLEXPAY_BASE_URL') || (env('FLEXPAY_ENV') === 'dev' ? 'https://beta-backend.flexpay.cd/api/rest/v1' : 'https://backend.flexpay.cd/api/rest/v1');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }

// Opérations ouvertes aux dons (mêmes clés que DONATION_OPERATIONS côté site).
const OPERATIONS: Record<string, string> = { ngidinga: 'Opération 100 chaises — Ngidinga', general: 'Solidarité' };
// Préfixes RDC (après 243) par opérateur. Africell (90/91) n'est pas pris en charge par FlexPay.
const PREFIXES: Record<Provider, string[]> = { mpesa: ['81', '82', '83', '86'], orange_money: ['80', '84', '85', '89'], airtel_money: ['97', '98', '99'] };
const PROVIDER_LABEL: Record<Provider, string> = { mpesa: 'M-Pesa', orange_money: 'Orange Money', airtel_money: 'Airtel Money' };
const LIMITS: Record<string, [number, number]> = { USD: [1, 2000], CDF: [1000, 5_000_000] };
// Anti-abus : pas plus de 3 demandes par numéro en 10 minutes.
const MAX_PER_PHONE = 3;
const WINDOW_MS = 10 * 60 * 1000;

/** 0812345678, +243 81 234 5678, 812345678 → 243812345678 (ou null). */
function normalizePhone(raw: string): string | null {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('243')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^\d{9}$/.test(d) ? `243${d}` : null;
}

function admin(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new HttpError(500, 'Configuration Supabase manquante.');
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

// ---------- FlexPay ----------
function flexpayCredentials() {
  const merchant = env('FLEXPAY_MERCHANT');
  const token = env('FLEXPAY_TOKEN');
  if (!merchant || !token) throw new HttpError(503, 'Le paiement en ligne n’est pas encore ouvert (compte FlexPay non configuré).');
  return { merchant, token };
}

async function flexpay(path: string, init: { method: 'GET' | 'POST'; body?: unknown }) {
  const { token } = flexpayCredentials();
  const res = await fetch(`${FLEXPAY_BASE}${path}`, {
    method: init.method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(502, `FlexPay a refusé la demande (${res.status}) ${data?.message ?? ''}`.trim());
  return data as Record<string, unknown>;
}

/** Interroge FlexPay et met le don à jour. Retourne le nouveau statut. */
async function refreshFromGateway(db: SupabaseClient, d: { id: string; status: DonationStatus; gateway_order_number: string | null }): Promise<DonationStatus> {
  if (d.status !== 'pending' || !d.gateway_order_number) return d.status;
  const data = await flexpay(`/check/${encodeURIComponent(d.gateway_order_number)}`, { method: 'GET' });
  const tx = (data.transaction ?? null) as Record<string, unknown> | null;
  if (String(data.code) !== '0' || !tx) return 'pending';
  const st = String(tx.status);
  // 0 = réussi, 1 = échoué ; toute autre valeur = toujours en attente de confirmation sur le téléphone.
  const next: DonationStatus = st === '0' ? 'paid' : st === '1' ? 'failed' : 'pending';
  if (next === 'pending') return next;
  const { error } = await db.from('online_donations').update({
    status: next,
    paid_at: next === 'paid' ? new Date().toISOString() : null,
    provider_reference: (tx.provider_reference ?? tx.providerReference ?? null) as string | null,
    gateway_message: String(data.message ?? ''),
  }).eq('id', d.id).eq('status', 'pending');
  if (error) throw new HttpError(500, error.message);
  return next;
}

// ---------- Actions ----------
async function donate(db: SupabaseClient, body: Record<string, unknown>) {
  const operation = String(body.operation ?? '');
  if (!(operation in OPERATIONS)) throw new HttpError(400, 'Opération inconnue.');
  const provider = body.provider as Provider;
  if (!(provider in PREFIXES)) throw new HttpError(400, 'Choisissez M-Pesa, Orange Money ou Airtel Money.');
  const phone = normalizePhone(String(body.phone ?? ''));
  if (!phone) throw new HttpError(400, 'Numéro invalide : saisissez un numéro congolais, par exemple 081 234 5678.');
  if (!PREFIXES[provider].includes(phone.slice(3, 5))) throw new HttpError(400, `Ce numéro n’est pas un numéro ${PROVIDER_LABEL[provider]}.`);
  const currency = body.currency === 'CDF' ? 'CDF' : body.currency === 'USD' ? 'USD' : null;
  if (!currency) throw new HttpError(400, 'Devise invalide.');
  const amount = Math.round(Number(body.amount) * 100) / 100;
  const [min, max] = LIMITS[currency];
  if (!Number.isFinite(amount) || amount < min || amount > max) throw new HttpError(400, `Montant entre ${min} et ${max} ${currency === 'USD' ? '$' : 'FC'}.`);
  const donorName = String(body.donorName ?? '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Anonyme';
  const { merchant } = flexpayCredentials();

  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await db.from('online_donations').select('id', { count: 'exact', head: true }).eq('phone', phone).gte('created_at', since);
  if ((count ?? 0) >= MAX_PER_PHONE) throw new HttpError(429, 'Trop de demandes pour ce numéro. Réessayez dans quelques minutes.');

  const { data: row, error: insErr } = await db.from('online_donations').insert({
    operation, donor_name: donorName, amount, currency, provider, phone,
  }).select('id, access_token').single();
  if (insErr) throw new HttpError(500, insErr.message);

  const secret = env('CALLBACK_SECRET');
  const callbackUrl = `${SUPABASE_URL}/functions/v1/dons-solidarite?action=callback&donation=${row.id}${secret ? `&secret=${encodeURIComponent(secret)}` : ''}`;
  try {
    const res = await flexpay('/paymentService', { method: 'POST', body: {
      merchant, type: '1', phone, reference: `DON-${row.id.replace(/-/g, '').slice(0, 20)}`,
      amount: String(amount), currency, callbackUrl,
      description: `JE SUIS KCCiste – Don ${OPERATIONS[operation]}`.slice(0, 120),
    } });
    if (String(res.code) !== '0' || !res.orderNumber) throw new HttpError(502, String(res.message || 'Paiement refusé par l’opérateur.'));
    await db.from('online_donations').update({ gateway_order_number: String(res.orderNumber), gateway_message: String(res.message ?? '') }).eq('id', row.id);
  } catch (e) {
    await db.from('online_donations').update({ status: 'failed', gateway_message: e instanceof Error ? e.message : String(e) }).eq('id', row.id);
    throw e;
  }
  return { donationId: row.id, token: row.access_token, status: 'pending' as DonationStatus };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function status(db: SupabaseClient, body: Record<string, unknown>) {
  if (!UUID.test(String(body.donationId ?? '')) || !UUID.test(String(body.token ?? ''))) throw new HttpError(404, 'Don introuvable.');
  const { data, error } = await db.from('online_donations').select('id, status, gateway_order_number, gateway_message, access_token').eq('id', String(body.donationId ?? '')).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data || data.access_token !== String(body.token ?? '')) throw new HttpError(404, 'Don introuvable.');
  const next = await refreshFromGateway(db, data).catch(() => data.status as DonationStatus);
  return { status: next, message: data.gateway_message ?? '' };
}

async function callback(url: URL, db: SupabaseClient) {
  const secret = env('CALLBACK_SECRET');
  if (secret && url.searchParams.get('secret') !== secret) throw new HttpError(403, 'Accès refusé.');
  const { data } = await db.from('online_donations').select('id, status, gateway_order_number').eq('id', url.searchParams.get('donation') ?? '').maybeSingle();
  if (data) await refreshFromGateway(db, data);
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const url = new URL(req.url);
    const db = admin();
    if (url.searchParams.get('action') === 'callback') return json(await callback(url, db));
    if (req.method !== 'POST') throw new HttpError(405, 'Méthode non autorisée.');
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    switch (body.action) {
      case 'donate': return json(await donate(db, body));
      case 'status': return json(await status(db, body));
      default: throw new HttpError(400, 'Action inconnue.');
    }
  } catch (e) {
    const code = e instanceof HttpError ? e.status : 500;
    console.error(e);
    return json({ error: e instanceof Error ? e.message : 'Erreur inattendue.' }, code);
  }
});
