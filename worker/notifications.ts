/**
 * Notifications sur le téléphone (Web Push) : abonnement, envoi et alertes automatiques.
 *
 *   POST /api/notifications/abonnement     { subscription, topics, lang }  → enregistre le téléphone (+ message de bienvenue)
 *   POST /api/notifications/desabonnement  { endpoint }                    → l'efface
 *   POST /api/notifications/essai          { endpoint }                    → notification d'essai sur ce seul téléphone
 *   POST /api/notifications/renouvellement { oldEndpoint, subscription }   → le navigateur a changé d'adresse d'abonnement
 *   POST /api/notifications/envoyer                                        → envoie un lot de la file (appelé par /admin/notifications)
 *   GET  /api/notifications/etat                                           → { pret } : les clés secrètes sont-elles en place ?
 *
 * Toutes les minutes (déclencheur « crons » de wrangler.jsonc), le Worker :
 *   1. ajoute à la file les directs qui commencent (cultes et radio), les nouveaux communiqués et
 *      les nouvelles prédications (base Supabase + contenu livré avec le site,
 *      lu dans /notifications-nouveautes.json, écrit au build) ;
 *   2. envoie la file par lots.
 *
 * Réglages Cloudflare (Worker jesuiskcciste-com › Paramètres › Variables et secrets) :
 *   VAPID_PRIVATE_KEY (secret)        clé privée des notifications
 *   SUPABASE_SERVICE_KEY (secret)     clé secrète Supabase (sb_secret_…)
 * La clé publique VAPID est dans src/features/notifications/config.ts.
 *
 * Le forfait gratuit de Cloudflare limite chaque passage à 50 appels sortants :
 * les envois se font donc par lots (PUSH_BATCH, 25 par défaut) et la suite part
 * au passage suivant.
 */

import { VAPID_PUBLIC_KEY, VAPID_SUBJECT, TOPICS, type Topic } from '../src/features/notifications/config';
import type { NotificationFeed as Feed } from '../src/features/notifications/feed';
import { isPushEndpoint, newServerKey, sendPush, type ServerKey, type VapidKeys } from './webpush';

interface Fetcher { fetch(input: Request | string | URL, init?: RequestInit): Promise<Response> }
export interface PushEnv {
  ASSETS: Fetcher;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  PUSH_BATCH?: string;
  PUSH_SUBREQUESTS?: string;
}

type Lang = 'fr' | 'en' | 'pt';
type Texts = Partial<Record<Lang, string>> & { fr: string };

interface Subscription { id: number; endpoint: string; p256dh: string; auth: string; lang: Lang }
interface Message { id: number; key: string | null; topic: Topic | 'general'; title: Texts; body: Texts; url: string; image: string | null; cursor: number; status: string }
type NewMessage = Pick<Message, 'key' | 'topic' | 'title' | 'body' | 'url' | 'image'>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const LANGS: Lang[] = ['fr', 'en', 'pt'];
const SITE = 'https://jesuiskcciste.com';

/** Compteur des appels sortants permis pendant ce passage du Worker. */
class Budget {
  constructor(public left: number) {}
  take(n = 1) { if (this.left < n) throw new Error('budget'); this.left -= n; }
}

function ready(env: PushEnv): boolean {
  return !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY && env.VAPID_PRIVATE_KEY);
}

function vapid(env: PushEnv): VapidKeys {
  return { publicKey: VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY!.trim(), subject: VAPID_SUBJECT };
}

/** Appel REST Supabase avec la clé secrète (contourne les règles d'accès : uniquement côté serveur). */
async function sb(env: PushEnv, budget: Budget, path: string, init: RequestInit & { prefer?: string } = {}): Promise<Response> {
  budget.take();
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_SERVICE_KEY!,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY!}`,
    'Content-Type': 'application/json',
  };
  if (init.prefer) headers.Prefer = init.prefer;
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers, signal: AbortSignal.timeout(8000) });
}

const cut = (s: string | null | undefined, n: number) => {
  const t = (s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

function pick(t: Texts | null | undefined, lang: Lang): string {
  if (!t) return '';
  return t[lang] || t.fr || '';
}

function payloadFor(m: Message, lang: Lang): string {
  const image = m.image ? new URL(m.image, SITE).toString() : undefined;
  return JSON.stringify({ title: pick(m.title, lang), body: pick(m.body, lang), url: m.url || '/', tag: `kcc-${m.key ?? m.id}`, image });
}

/* ---------- Abonnement ---------- */

interface SubscriptionJson { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }

function readSubscription(s: SubscriptionJson | undefined) {
  if (!s || !isPushEndpoint(s.endpoint)) return null;
  const p256dh = typeof s.keys?.p256dh === 'string' ? s.keys.p256dh : '';
  const auth = typeof s.keys?.auth === 'string' ? s.keys.auth : '';
  if (!/^[A-Za-z0-9_-]{60,120}$/.test(p256dh) || !/^[A-Za-z0-9_-]{16,64}$/.test(auth)) return null;
  return { endpoint: s.endpoint, p256dh, auth };
}

function readTopics(t: unknown): Topic[] {
  return Array.isArray(t) ? TOPICS.filter((k) => t.includes(k)) : [...TOPICS];
}

const readLang = (l: unknown): Lang => (LANGS.includes(l as Lang) ? (l as Lang) : 'fr');

const WELCOME: Record<Lang, [string, string]> = {
  fr: ['Notifications activées 🔔', 'Vous serez prévenu ici des cultes et de la radio en direct, des communiqués et des nouvelles prédications. Paix à vous !'],
  en: ['Notifications turned on 🔔', 'You will be told here about live services and radio, announcements and new sermons. Peace be with you!'],
  pt: ['Notificações ativadas 🔔', 'Será avisado aqui dos cultos e da rádio em direto, dos comunicados e das novas pregações. Paz a si!'],
};
const TEST: Record<Lang, [string, string]> = {
  fr: ['Essai réussi ✅', 'Les notifications de JE SUIS KCCiste arrivent bien sur cet appareil.'],
  en: ['Test successful ✅', 'JE SUIS KCCiste notifications reach this device.'],
  pt: ['Teste bem-sucedido ✅', 'As notificações de JE SUIS KCCiste chegam a este aparelho.'],
};

async function sendOne(env: PushEnv, target: { endpoint: string; p256dh: string; auth: string }, texts: [string, string], url: string, tag: string) {
  const server = await newServerKey();
  return sendPush(target, JSON.stringify({ title: texts[0], body: texts[1], url, tag }), vapid(env), server, new Map(), { ttl: 3600 });
}

async function subscribe(request: Request, env: PushEnv): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { subscription?: SubscriptionJson; topics?: unknown; lang?: unknown; welcome?: unknown } | null;
  const sub = readSubscription(body?.subscription);
  if (!sub) return json({ error: 'abonnement invalide' }, 400);
  const topics = readTopics(body?.topics);
  const lang = readLang(body?.lang);
  const budget = new Budget(5);
  const res = await sb(env, budget, 'push_subscriptions?on_conflict=endpoint', {
    method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
    body: JSON.stringify({ ...sub, topics, lang, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) return json({ error: 'enregistrement impossible', detail: await res.text().catch(() => '') }, 502);
  if (body?.welcome) await sendOne(env, sub, WELCOME[lang], '/notifications', 'kcc-bienvenue');
  return json({ ok: true, topics });
}

async function unsubscribe(request: Request, env: PushEnv): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { endpoint?: unknown } | null;
  if (!isPushEndpoint(body?.endpoint)) return json({ error: 'adresse invalide' }, 400);
  const res = await sb(env, new Budget(2), `push_subscriptions?endpoint=eq.${encodeURIComponent(body!.endpoint as string)}`, { method: 'DELETE' });
  return res.ok ? json({ ok: true }) : json({ error: 'suppression impossible' }, 502);
}

async function findSubscription(env: PushEnv, budget: Budget, endpoint: string): Promise<(Subscription & { topics: string[] }) | null> {
  const res = await sb(env, budget, `push_subscriptions?select=id,endpoint,p256dh,auth,lang,topics&endpoint=eq.${encodeURIComponent(endpoint)}&limit=1`);
  if (!res.ok) return null;
  return ((await res.json()) as (Subscription & { topics: string[] })[])[0] ?? null;
}

async function test(request: Request, env: PushEnv): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { endpoint?: unknown } | null;
  if (!isPushEndpoint(body?.endpoint)) return json({ error: 'adresse invalide' }, 400);
  const sub = await findSubscription(env, new Budget(2), body!.endpoint as string);
  if (!sub) return json({ error: 'inconnu' }, 404);
  const r = await sendOne(env, sub, TEST[sub.lang] ?? TEST.fr, '/notifications', 'kcc-essai');
  if (r === 'gone') await sb(env, new Budget(1), `push_subscriptions?id=eq.${sub.id}`, { method: 'DELETE' });
  return json({ ok: r === 'ok', result: r, topics: sub.topics });
}

async function renew(request: Request, env: PushEnv): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { oldEndpoint?: unknown; subscription?: SubscriptionJson } | null;
  const sub = readSubscription(body?.subscription);
  if (!sub) return json({ error: 'abonnement invalide' }, 400);
  const budget = new Budget(4);
  let topics: Topic[] = [...TOPICS];
  let lang: Lang = 'fr';
  if (isPushEndpoint(body?.oldEndpoint)) {
    const old = await findSubscription(env, budget, body!.oldEndpoint as string);
    if (old) {
      topics = readTopics(old.topics);
      lang = readLang(old.lang);
      await sb(env, budget, `push_subscriptions?id=eq.${old.id}`, { method: 'DELETE' });
    }
  }
  const res = await sb(env, budget, 'push_subscriptions?on_conflict=endpoint', {
    method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: JSON.stringify({ ...sub, topics, lang, updated_at: new Date().toISOString() }),
  });
  return res.ok ? json({ ok: true }) : json({ error: 'enregistrement impossible' }, 502);
}

/* ---------- Envoi de la file ---------- */

async function pool<T, R>(items: T[], size: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

export interface FlushReport { sent: number; failed: number; removed: number; pending: boolean }

/** Envoie autant de lots que le budget le permet. pending = il reste des envois pour un prochain passage. */
export async function flushQueue(env: PushEnv, budget: Budget, server?: ServerKey): Promise<FlushReport> {
  const report: FlushReport = { sent: 0, failed: 0, removed: 0, pending: false };
  const batchMax = Math.max(1, Math.min(200, Number(env.PUSH_BATCH) || 25));
  const v = vapid(env);
  const vapidCache = new Map<string, Promise<string>>();
  for (;;) {
    // Il faut au moins : la file, les abonnés, la réservation, les compteurs, l'effacement et 1 envoi.
    if (budget.left < 6) { report.pending = true; return report; }
    const mres = await sb(env, budget, 'push_messages?select=id,key,topic,title,body,url,image,cursor,status&status=in.(pending,sending)&order=id.asc&limit=1');
    if (!mres.ok) return report;
    const msg = ((await mres.json()) as Message[])[0];
    if (!msg) return report;

    const limit = Math.max(1, Math.min(batchMax, budget.left - 4));
    const topicFilter = msg.topic === 'general' ? '' : `&topics=cs.%7B${msg.topic}%7D`;
    const sres = await sb(env, budget, `push_subscriptions?select=id,endpoint,p256dh,auth,lang&id=gt.${msg.cursor}${topicFilter}&order=id.asc&limit=${limit}`);
    if (!sres.ok) return report;
    const subs = (await sres.json()) as Subscription[];
    const done = subs.length < limit;
    const next = subs.length ? subs[subs.length - 1].id : msg.cursor;

    // Réserve ce lot (si un autre passage l'a déjà pris, le curseur a bougé : on recommence).
    const claim = await sb(env, budget, `push_messages?id=eq.${msg.id}&cursor=eq.${msg.cursor}&status=in.(pending,sending)`, {
      method: 'PATCH', prefer: 'return=representation',
      body: JSON.stringify({ cursor: next, status: done ? 'done' : 'sending', ...(done ? { finished_at: new Date().toISOString() } : {}) }),
    });
    if (!claim.ok) return report;
    if (!((await claim.json()) as unknown[]).length) continue;
    if (!subs.length) continue;

    server ??= await newServerKey();
    const serverKey = server;
    const urgent = msg.topic === 'direct';
    const results = await pool(subs, 6, (s) => {
      budget.left -= 1;
      return sendPush(s, payloadFor(msg, s.lang), v, serverKey, vapidCache, { ttl: urgent ? 3600 : 86400 * 2, urgency: urgent ? 'high' : 'normal', topic: msg.key ? undefined : `m${msg.id}` });
    });
    const gone = subs.filter((_, i) => results[i] === 'gone').map((s) => s.id);
    const sent = results.filter((r) => r === 'ok').length;
    const failed = results.filter((r) => r === 'error').length;
    report.sent += sent; report.failed += failed; report.removed += gone.length;
    if (gone.length && budget.left > 0) await sb(env, budget, `push_subscriptions?id=in.(${gone.join(',')})`, { method: 'DELETE' });
    if (budget.left > 0) await sb(env, budget, 'rpc/push_add_counts', { method: 'POST', body: JSON.stringify({ p_id: msg.id, p_sent: sent, p_failed: failed, p_removed: gone.length }) });
  }
}

/* ---------- Alertes automatiques ---------- */


const LIVE_TITLE: Texts = { fr: '🔴 Culte en direct maintenant', en: '🔴 Live service now', pt: '🔴 Culto em direto agora' };
const RADIO_TITLE: Texts = { fr: '📻 Radio en direct maintenant', en: '📻 Radio live now', pt: '📻 Rádio em direto agora' };
const SERMON_TITLE: Texts = { fr: '🎙️ Nouvelle prédication', en: '🎙️ New sermon', pt: '🎙️ Nova pregação' };

/** Rappel envoyé avant une émission ou un culte programmé (minutes). */
export const REMINDER_MINUTES = 15;
const REMINDER_TITLE: Texts = { fr: '⏰ Bientôt en direct', en: '⏰ Live soon', pt: '⏰ Em direto em breve' };
/** Heure de Kinshasa (UTC+1), ex. « 14:00 ». */
const hourOf = (iso: string) => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kinshasa' }).format(new Date(iso));
/** Message de rappel : commence par « Paix » et invite à être à l'heure. */
function reminderBody(title: string, iso: string, where: Record<Lang, string>): Texts {
  const h = hourOf(iso);
  return {
    fr: cut(`Paix à vous ! « ${title} » commence à ${h} (heure de Kinshasa) ${where.fr}. Soyez à l'heure pour suivre !`, 300),
    en: cut(`Peace be with you! “${title}” starts at ${h} (Kinshasa time) ${where.en}. Be on time to follow it!`, 300),
    pt: cut(`Paz a si! «${title}» começa às ${h} (hora de Kinshasa) ${where.pt}. Seja pontual para acompanhar!`, 300),
  };
}
const ON_RADIO = { fr: 'sur Radio Je suis KCCiste', en: 'on Radio Je suis KCCiste', pt: 'na Rádio Je suis KCCiste' };
const ON_SITE = { fr: 'en direct sur Je suis KCCiste', en: 'live on Je suis KCCiste', pt: 'em direto no Je suis KCCiste' };
/** Commence dans plus d'1 min et au plus REMINDER_MINUTES min. */
const soon = (iso: unknown, now: number) => { const t = typeof iso === 'string' ? Date.parse(iso) : NaN; return !Number.isNaN(t) && t > now + 60000 && t <= now + REMINDER_MINUTES * 60000; };

const all = (s: string): Texts => ({ fr: s, en: s, pt: s });
const mapTexts = (t: Texts, f: (s: string) => string): Texts => ({ fr: f(t.fr), en: f(t.en || t.fr), pt: f(t.pt || t.fr) });

/** Ce qui vient de commencer ou de paraître, d'après l'heure « now ». Exporté pour les tests. */
export function candidatesFrom(feed: Feed, db: { lives: Feed['lives']; announcements: { id: string; title: string; summary: string; image_url: string | null; published_at: string }[]; sermons: { id: string; title: string; preacher_title: string | null; preacher_name: string; created_at: string }[] }, now = Date.now()): NewMessage[] {
  const out: NewMessage[] = [];
  const within = (iso: string, before: number, after = 5 * 60000) => { const t = Date.parse(iso); return t <= now + after && t >= now - before; };

  const seenVideos = new Set<string>();
  const reminded = new Set<string>();
  for (const l of [...db.lives, ...feed.lives]) {
    if (reminded.has(l.id) || !soon(l.startsAt, now)) continue;
    reminded.add(l.id);
    out.push({ key: `rappel-direct:${l.id}`, topic: 'direct', title: REMINDER_TITLE, body: reminderBody(cut(l.title, 120), l.startsAt, ON_SITE), url: '/direct', image: null });
  }
  for (const l of [...db.lives, ...feed.lives]) {
    if (seenVideos.has(l.id) || !within(l.startsAt, 30 * 60000, 60000)) continue;
    seenVideos.add(l.id);
    out.push({ key: `direct:${l.id}`, topic: 'direct', title: LIVE_TITLE, body: all(cut(l.title, 300)), url: '/direct', image: null });
  }
  for (const a of feed.articles) {
    if (!within(a.date, 48 * 3600000)) continue;
    out.push({ key: `article:${a.id}`, topic: 'communiques', title: mapTexts(a.title, (s) => cut(`📢 ${s}`, 110)), body: mapTexts(a.summary, (s) => cut(s, 300)), url: `/actualites/${a.id}`, image: a.image });
  }
  for (const a of db.announcements) {
    if (!within(a.published_at, 6 * 3600000)) continue;
    out.push({ key: `article:${a.id}`, topic: 'communiques', title: all(cut(`📢 ${a.title}`, 110)), body: all(cut(a.summary, 300)), url: `/actualites/${a.id}`, image: a.image_url });
  }
  const sermonIds = new Set<string>();
  for (const s of [...db.sermons.map((r) => ({ id: r.id, date: r.created_at, title: r.title, preacher: [r.preacher_title, r.preacher_name].filter(Boolean).join(' ') })), ...feed.sermons]) {
    if (sermonIds.has(s.id) || !within(s.date, (feed.sermons.includes(s as Feed['sermons'][number]) ? 48 : 6) * 3600000)) continue;
    sermonIds.add(s.id);
    out.push({ key: `sermon:${s.id}`, topic: 'predications', title: SERMON_TITLE, body: all(cut(`« ${s.title} » — ${s.preacher}`, 300)), url: `/predications/audio/${s.id}`, image: null });
  }
  return out;
}

/**
 * Radio : alerte quand un animateur passe à l'antenne (/admin/radio, /admin/radio/antenne)
 * ou quand une émission programmée commence (lue par le robot radio). Même sujet que les
 * cultes (« direct ») : les abonnés aux directs sont prévenus. radio = valeur « radio »
 * du réglage public (snake_case, telle qu'en base). Exporté pour les tests.
 */
export function radioCandidates(radio: unknown, now = Date.now()): NewMessage[] {
  if (!radio || typeof radio !== 'object') return [];
  const r = radio as { live?: Record<string, unknown>; programmes?: unknown };
  const within = (iso: unknown) => { const t = typeof iso === 'string' ? Date.parse(iso) : NaN; return !Number.isNaN(t) && t <= now + 60000 && t >= now - 30 * 60000; };
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const out: NewMessage[] = [];
  const progs = (Array.isArray(r.programmes) ? r.programmes : []).filter((p): p is Record<string, unknown> => !!p && typeof p === 'object');
  // Rappel avant chaque émission programmée.
  for (const o of progs) {
    const startsAt = o.starts_at ?? o.startsAt;
    if (!soon(startsAt, now) || !/^https:\/\//.test(str(o.url))) continue;
    out.push({ key: `rappel-radio:${str(o.id) || str(startsAt)}`, topic: 'direct', title: REMINDER_TITLE, body: reminderBody(cut(str(o.title) || 'Émission programmée', 120), str(startsAt), ON_RADIO), url: '/radio', image: null });
  }
  const l = r.live ?? {};
  const started = l.started_at ?? l.startedAt;
  if (l.on_air === true || l.onAir === true) {
    if ((str(l.url) || str(l.rtc)) && within(started)) {
      const title = str(l.title) || 'Émission en direct';
      return [...out, { key: `radio:${str(started)}`, topic: 'direct', title: RADIO_TITLE, body: all(cut(`${title} — Radio Je suis KCCiste`, 300)), url: '/radio', image: null }];
    }
    // Un direct déjà en cours garde l'antenne : pas d'alerte pour une émission programmée.
    if (str(l.url) || str(l.rtc)) return out;
  }
  for (const p of progs) {
    if (!p || typeof p !== 'object') continue;
    const o = p as Record<string, unknown>;
    const startsAt = o.starts_at ?? o.startsAt;
    if (!within(startsAt) || !/^https:\/\//.test(str(o.url))) continue;
    const title = str(o.title) || 'Émission programmée';
    out.push({ key: `radio-prog:${str(o.id) || str(startsAt)}`, topic: 'direct', title: RADIO_TITLE, body: all(cut(`${title} — Radio Je suis KCCiste`, 300)), url: '/radio', image: null });
    break;
  }
  return out;
}

async function rows<T>(res: Response): Promise<T[]> {
  return res.ok ? ((await res.json()) as T[]) : [];
}

async function enqueueNew(env: PushEnv, budget: Budget, now = Date.now()) {
  let feed: Feed = { articles: [], sermons: [], lives: [] };
  try {
    const r = await env.ASSETS.fetch(new Request(`${SITE}/notifications-nouveautes.json`));
    if (r.ok) feed = { ...feed, ...((await r.json()) as Partial<Feed>) };
  } catch { /* fichier absent : seulement la base */ }

  const iso = (ms: number) => encodeURIComponent(new Date(ms).toISOString());
  const [lives, announcements, sermons, radio] = await Promise.all([
    sb(env, budget, `livestreams?select=id,title,starts_at,duration_minutes&is_cancelled=eq.false&ended_at=is.null&starts_at=gte.${iso(now - 30 * 60000)}&starts_at=lte.${iso(now + REMINDER_MINUTES * 60000)}&limit=10`)
      .then((r) => rows<{ id: string; title: string; starts_at: string; duration_minutes: number }>(r)).catch(() => []),
    sb(env, budget, `announcements?select=id,title,summary,image_url,published_at&status=eq.published&audience=eq.public&published_at=gte.${iso(now - 6 * 3600000)}&published_at=lte.${iso(now + 5 * 60000)}&limit=5`)
      .then((r) => rows<{ id: string; title: string; summary: string; image_url: string | null; published_at: string }>(r)).catch(() => []),
    sb(env, budget, `audio_sermons?select=id,title,preacher_title,preacher_name,created_at&published=eq.true&created_at=gte.${iso(now - 6 * 3600000)}&limit=5`)
      .then((r) => rows<{ id: string; title: string; preacher_title: string | null; preacher_name: string; created_at: string }>(r)).catch(() => []),
    sb(env, budget, 'site_settings?select=value&key=eq.public&limit=1')
      .then((r) => rows<{ value: { radio?: unknown } | null }>(r)).then((x) => x[0]?.value?.radio ?? null).catch(() => null),
  ]);
  const list = [
    ...candidatesFrom(feed, { lives: lives.map((l) => ({ id: l.id, title: l.title, startsAt: l.starts_at, durationMinutes: l.duration_minutes })), announcements, sermons }, now),
    ...radioCandidates(radio, now),
  ];
  if (!list.length) return;
  await sb(env, budget, 'push_messages?on_conflict=key', { method: 'POST', prefer: 'resolution=ignore-duplicates,return=minimal', body: JSON.stringify(list) });
}

/* ---------- Points d'entrée ---------- */

function budgetFor(env: PushEnv) {
  return new Budget(Math.max(10, Number(env.PUSH_SUBREQUESTS) || 45));
}

export async function handleNotifications(request: Request, env: PushEnv, action: string): Promise<Response> {
  if (action === 'etat') return json({ pret: ready(env) });
  if (request.method !== 'POST') return json({ error: 'POST attendu' }, 405);
  if (!ready(env)) return json({ error: 'notifications pas encore configurées' }, 503);
  try {
    switch (action) {
      case 'abonnement': return await subscribe(request, env);
      case 'desabonnement': return await unsubscribe(request, env);
      case 'essai': return await test(request, env);
      case 'renouvellement': return await renew(request, env);
      case 'envoyer': return json(await flushQueue(env, budgetFor(env)));
      default: return json({ error: 'inconnu' }, 404);
    }
  } catch (e) {
    return json({ error: 'erreur', detail: e instanceof Error ? e.message : String(e) }, 500);
  }
}

/** Passage automatique (toutes les minutes). */
export async function runScheduled(env: PushEnv, now = Date.now()) {
  if (!ready(env)) return;
  const budget = budgetFor(env);
  try { await enqueueNew(env, budget, now); } catch { /* on envoie quand même la file */ }
  try { await flushQueue(env, budget); } catch { /* budget épuisé : suite au prochain passage */ }
}
