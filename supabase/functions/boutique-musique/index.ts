// =====================================================================
// KCC Music — Boutique : Edge Function `boutique-musique` (Deno).
//
// Paiement Mobile Money (M-Pesa, Orange Money, Airtel Money) via FlexPay.
// Les secrets restent ici, côté serveur (Supabase > Edge Functions > Secrets) :
//   FLEXPAY_MERCHANT   code marchand fourni par FlexPay
//   FLEXPAY_TOKEN      jeton d'autorisation (Bearer) fourni par FlexPay
//   FLEXPAY_ENV        « prod » (défaut) ou « dev » (bac à sable FlexPay)
//   CALLBACK_SECRET    une longue chaîne aléatoire choisie par vous
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement.
//
// Fichier unique (aucun import relatif) pour pouvoir être collé tel quel dans
// l'éditeur du tableau de bord Supabase. « Verify JWT » doit être DÉSACTIVÉ :
// FlexPay appelle le webhook sans jeton ; les autres actions vérifient
// elles-mêmes la session de l'utilisateur.
//
// Actions (POST JSON { action, ... }) :
//   checkout  { itemType: 'track'|'album', itemId, provider, phone } → { orderId, status }
//   status    { orderId }  → { status, message }
//   download  { orderId }  → { files: [{ title, url }] }
//   ecoute    { trackId }  → { url } chant entier (acheteur ou responsable musique), sinon { url: null }
//   callback  (appelé par FlexPay : ?action=callback&order=…&secret=…)
// Un paiement n'est JAMAIS marqué payé sur la foi du webhook : la fonction
// interroge toujours FlexPay (« check ») avant de valider.
// =====================================================================
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

type Provider = 'mpesa' | 'orange_money' | 'airtel_money';
type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

const env = (k: string) => Deno.env.get(k)?.trim() ?? '';
const SUPABASE_URL = env('SUPABASE_URL');
const SERVICE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');
const FLEXPAY_BASE = env('FLEXPAY_BASE_URL') || (env('FLEXPAY_ENV') === 'dev' ? 'https://beta-backend.flexpay.cd/api/rest/v1' : 'https://backend.flexpay.cd/api/rest/v1');
const SITE_URL = env('SITE_URL') || 'https://jesuiskcciste.com';
const ANON_KEY = env('SUPABASE_ANON_KEY');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }

// Préfixes RDC (après 243) par opérateur. Africell (90/91) n'est pas pris en charge par FlexPay.
const PREFIXES: Record<Provider, string[]> = { mpesa: ['81', '82', '83', '86'], orange_money: ['80', '84', '85', '89'], airtel_money: ['97', '98', '99'] };
const PROVIDER_LABEL: Record<Provider, string> = { mpesa: 'M-Pesa', orange_money: 'Orange Money', airtel_money: 'Airtel Money' };

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

async function currentUserId(req: Request, db: SupabaseClient): Promise<string> {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Connectez-vous pour acheter.');
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, 'Session expirée : reconnectez-vous.');
  return data.user.id;
}

// ---------- FlexPay ----------
function flexpayCredentials() {
  const merchant = env('FLEXPAY_MERCHANT');
  const token = env('FLEXPAY_TOKEN');
  if (!merchant || !token) throw new HttpError(503, 'La boutique n’est pas encore ouverte (compte FlexPay non configuré).');
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

/** Interroge FlexPay et met la commande à jour. Retourne le nouveau statut. */
async function refreshFromGateway(db: SupabaseClient, order: { id: string; status: OrderStatus; gateway_order_number: string | null }): Promise<OrderStatus> {
  if (order.status !== 'pending' || !order.gateway_order_number) return order.status;
  const data = await flexpay(`/check/${encodeURIComponent(order.gateway_order_number)}`, { method: 'GET' });
  const tx = (data.transaction ?? null) as Record<string, unknown> | null;
  if (String(data.code) !== '0' || !tx) return 'pending';
  const st = String(tx.status);
  // 0 = réussi, 1 = échoué ; toute autre valeur = toujours en attente de confirmation sur le téléphone.
  const next: OrderStatus = st === '0' ? 'paid' : st === '1' ? 'failed' : 'pending';
  if (next === 'pending') return next;
  const { error } = await db.from('music_orders').update({
    status: next,
    paid_at: next === 'paid' ? new Date().toISOString() : null,
    provider_reference: (tx.provider_reference ?? tx.providerReference ?? null) as string | null,
    gateway_message: String(data.message ?? ''),
  }).eq('id', order.id).eq('status', 'pending');
  if (error) throw new HttpError(500, error.message);
  return next;
}

// ---------- Actions ----------
async function checkout(req: Request, db: SupabaseClient, body: Record<string, unknown>) {
  const userId = await currentUserId(req, db);
  const itemType = body.itemType === 'album' ? 'album' : body.itemType === 'track' ? 'track' : null;
  const itemId = String(body.itemId ?? '');
  const provider = body.provider as Provider;
  if (!itemType || !itemId) throw new HttpError(400, 'Article invalide.');
  if (!(provider in PREFIXES)) throw new HttpError(400, 'Choisissez M-Pesa, Orange Money ou Airtel Money.');
  const phone = normalizePhone(String(body.phone ?? ''));
  if (!phone) throw new HttpError(400, 'Numéro invalide : saisissez un numéro congolais, par exemple 081 234 5678.');
  if (!PREFIXES[provider].includes(phone.slice(3, 5))) throw new HttpError(400, `Ce numéro n’est pas un numéro ${PROVIDER_LABEL[provider]}.`);
  const { merchant } = flexpayCredentials();

  // Le prix est TOUJOURS lu en base, jamais reçu du navigateur.
  const { data: item, error } = itemType === 'track'
    ? await db.from('tracks').select('id, title, price_amount, price_currency, broadcast_rights').eq('id', itemId).maybeSingle()
    : await db.from('albums').select('id, title, price_amount, price_currency').eq('id', itemId).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!item || !item.price_amount || !item.price_currency) throw new HttpError(404, 'Cet article n’est pas en vente.');
  if (itemType === 'track' && (item as { broadcast_rights?: string }).broadcast_rights !== 'authorized') throw new HttpError(403, 'Ce titre n’est pas autorisé à la vente.');

  // Déjà acheté : on ne fait pas payer deux fois.
  const col = itemType === 'track' ? 'track_id' : 'album_id';
  const { data: owned } = await db.from('music_orders').select('id').eq('user_id', userId).eq(col, itemId).eq('status', 'paid').limit(1).maybeSingle();
  if (owned) return { orderId: owned.id, status: 'paid' as OrderStatus };

  const { data: order, error: insErr } = await db.from('music_orders').insert({
    user_id: userId, [col]: itemId, item_title: item.title, amount: item.price_amount, currency: item.price_currency, provider, phone,
  }).select('id').single();
  if (insErr) throw new HttpError(500, insErr.message);

  const secret = env('CALLBACK_SECRET');
  const callbackUrl = `${SUPABASE_URL}/functions/v1/boutique-musique?action=callback&order=${order.id}${secret ? `&secret=${encodeURIComponent(secret)}` : ''}`;
  try {
    const res = await flexpay('/paymentService', { method: 'POST', body: {
      merchant, type: '1', phone, reference: `KCC-${order.id.replace(/-/g, '').slice(0, 20)}`,
      amount: String(Number(item.price_amount)), currency: item.price_currency, callbackUrl,
      description: `JE SUIS KCCiste – ${item.title}`.slice(0, 120),
    } });
    if (String(res.code) !== '0' || !res.orderNumber) throw new HttpError(502, String(res.message || 'Paiement refusé par l’opérateur.'));
    await db.from('music_orders').update({ gateway_order_number: String(res.orderNumber), gateway_message: String(res.message ?? '') }).eq('id', order.id);
  } catch (e) {
    await db.from('music_orders').update({ status: 'failed', gateway_message: e instanceof Error ? e.message : String(e) }).eq('id', order.id);
    throw e;
  }
  return { orderId: order.id, status: 'pending' as OrderStatus };
}

async function loadOwnOrder(req: Request, db: SupabaseClient, orderId: string) {
  const userId = await currentUserId(req, db);
  const { data, error } = await db.from('music_orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data || data.user_id !== userId) throw new HttpError(404, 'Commande introuvable.');
  return data;
}

async function status(req: Request, db: SupabaseClient, body: Record<string, unknown>) {
  const order = await loadOwnOrder(req, db, String(body.orderId ?? ''));
  const next = await refreshFromGateway(db, order).catch(() => order.status as OrderStatus);
  return { status: next, message: order.gateway_message ?? '' };
}

async function download(req: Request, db: SupabaseClient, body: Record<string, unknown>) {
  const order = await loadOwnOrder(req, db, String(body.orderId ?? ''));
  if (order.status !== 'paid') throw new HttpError(402, 'Paiement non confirmé.');
  const q = db.from('tracks').select('id, title, audio_url, sale_file_path').order('title');
  const { data: tracks, error } = order.track_id ? await q.eq('id', order.track_id) : await q.eq('album_id', order.album_id);
  if (error) throw new HttpError(500, error.message);
  const files: { title: string; url: string }[] = [];
  for (const t of tracks ?? []) {
    if (t.sale_file_path) {
      const { data: signed } = await db.storage.from('music').createSignedUrl(t.sale_file_path, 60 * 60, { download: `${t.title}.mp3` });
      if (signed?.signedUrl) files.push({ title: t.title, url: signed.signedUrl });
    } else if (t.audio_url) {
      files.push({ title: t.title, url: /^https?:\/\//.test(t.audio_url) ? t.audio_url : `${SITE_URL}${t.audio_url.startsWith('/') ? '' : '/'}${t.audio_url}` });
    }
  }
  return { files };
}

/**
 * Chant entier pour l'écoute : le site public ne contient que la première moitié
 * (audio_url). Le fichier complet (sale_file_path, bucket privé) n'est délivré,
 * par lien signé de courte durée, qu'à un responsable musique ou à un acheteur
 * du titre ou de son album. Sinon : { url: null } et le lecteur garde l'extrait.
 */
async function ecoute(req: Request, db: SupabaseClient, body: Record<string, unknown>) {
  const userId = await currentUserId(req, db);
  const { data: track, error } = await db.from('tracks').select('id, album_id, sale_file_path').eq('id', String(body.trackId ?? '')).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!track?.sale_file_path) return { url: null };

  // has_permission() lit auth.uid() : on l'appelle avec la session de l'utilisateur.
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const asUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: manager } = ANON_KEY ? await asUser.rpc('has_permission', { p_permission: 'music.manage' }) : { data: false };

  let allowed = manager === true;
  if (!allowed) {
    const ors = [`track_id.eq.${track.id}`, ...(track.album_id ? [`album_id.eq.${track.album_id}`] : [])].join(',');
    const { data: owned } = await db.from('music_orders').select('id').eq('user_id', userId).eq('status', 'paid').or(ors).limit(1).maybeSingle();
    allowed = !!owned;
  }
  if (!allowed) return { url: null };
  const { data: signed } = await db.storage.from('music').createSignedUrl(track.sale_file_path, 60 * 60 * 3);
  return { url: signed?.signedUrl ?? null };
}

async function callback(url: URL, db: SupabaseClient) {
  const secret = env('CALLBACK_SECRET');
  if (secret && url.searchParams.get('secret') !== secret) throw new HttpError(403, 'Accès refusé.');
  const { data: order } = await db.from('music_orders').select('id, status, gateway_order_number').eq('id', url.searchParams.get('order') ?? '').maybeSingle();
  if (order) await refreshFromGateway(db, order);
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
      case 'checkout': return json(await checkout(req, db, body));
      case 'status': return json(await status(req, db, body));
      case 'download': return json(await download(req, db, body));
      case 'ecoute': return json(await ecoute(req, db, body));
      default: throw new HttpError(400, 'Action inconnue.');
    }
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    console.error(e);
    return json({ error: e instanceof Error ? e.message : 'Erreur inattendue.' }, status);
  }
});
