/**
 * Envoi d'une notification « Web Push » (normes RFC 8291 et RFC 8292), avec la
 * cryptographie intégrée au Worker (WebCrypto) : aucune bibliothèque extérieure.
 *
 * - Le message est chiffré pour le seul téléphone abonné (clés p256dh et auth
 *   données par son navigateur) : le service de Google, Apple ou Mozilla qui le
 *   transporte ne peut pas le lire.
 * - L'en-tête VAPID prouve que l'envoi vient bien du site (clé privée gardée en
 *   secret dans Cloudflare, clé publique connue du navigateur).
 */

export interface PushTarget { endpoint: string; p256dh: string; auth: string }

export interface VapidKeys { publicKey: string; privateKey: string; subject: string }

const enc = new TextEncoder();

export function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function b64urlEncode(bytes: Uint8Array | ArrayBuffer): string {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < u.length; i++) bin += String.fromCharCode(u[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, data));
}

/* ---------- VAPID (RFC 8292) ---------- */

let signingKey: { pem: string; key: Promise<CryptoKey> } | null = null;
function vapidSigningKey(v: VapidKeys): Promise<CryptoKey> {
  if (signingKey?.pem === v.privateKey) return signingKey.key;
  const pub = b64urlDecode(v.publicKey);
  if (pub.length !== 65 || pub[0] !== 4) throw new Error('VAPID_PUBLIC_KEY invalide');
  const jwk: JsonWebKey = { kty: 'EC', crv: 'P-256', d: v.privateKey, x: b64urlEncode(pub.slice(1, 33)), y: b64urlEncode(pub.slice(33, 65)), ext: true };
  const key = crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  signingKey = { pem: v.privateKey, key };
  return key;
}

/** Jeton VAPID valable 12 h pour un service de notification (ex. https://fcm.googleapis.com). */
export async function vapidHeader(audience: string, v: VapidKeys, now = Date.now()): Promise<string> {
  const header = b64urlEncode(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64urlEncode(enc.encode(JSON.stringify({ aud: audience, exp: Math.floor(now / 1000) + 12 * 3600, sub: v.subject })));
  const unsigned = `${header}.${claims}`;
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, await vapidSigningKey(v), enc.encode(unsigned));
  return `vapid t=${unsigned}.${b64urlEncode(sig)}, k=${v.publicKey}`;
}

/* ---------- Chiffrement du message (RFC 8291, aes128gcm) ---------- */

/** Clé éphémère du serveur : une par lot d'envois (le secret partagé reste propre à chaque téléphone). */
export interface ServerKey { pair: CryptoKeyPair; publicRaw: Uint8Array }

export async function newServerKey(): Promise<ServerKey> {
  const pair = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair;
  const publicRaw = new Uint8Array((await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer);
  return { pair, publicRaw };
}

export async function encryptPayload(target: PushTarget, payload: Uint8Array, server: ServerKey, salt = crypto.getRandomValues(new Uint8Array(16))): Promise<Uint8Array> {
  const uaPublic = b64urlDecode(target.p256dh);
  const authSecret = b64urlDecode(target.auth);
  if (uaPublic.length !== 65 || authSecret.length < 16) throw new Error('clés de l’abonnement invalides');
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey } as EcdhKeyDeriveParams, server.pair.privateKey, 256));

  // IKM = HKDF(auth_secret, ecdh, "WebPush: info\0" || ua_public || as_public, 32)
  const prkKey = await hmac(authSecret, ecdh);
  const ikm = (await hmac(prkKey, concat(enc.encode('WebPush: info\0'), uaPublic, server.publicRaw, new Uint8Array([1])))).slice(0, 32);
  // Clé et nonce du contenu (RFC 8188).
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, concat(enc.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, concat(enc.encode('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);

  const aes = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, concat(payload, new Uint8Array([2]))));

  // En-tête : sel (16) · taille d'enregistrement (4) · longueur de la clé (1) · clé publique du serveur (65).
  const rs = new Uint8Array([0, 0, 16, 0]); // 4096
  return concat(salt, rs, new Uint8Array([server.publicRaw.length]), server.publicRaw, cipher);
}

/** Services de notification acceptés (évite qu'on fasse appeler n'importe quelle adresse au Worker). */
const PUSH_HOSTS = /^(fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com|[a-z0-9.-]+\.push\.samsungosp\.com)$/i;

export function isPushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string' || endpoint.length > 1000) return false;
  try {
    const u = new URL(endpoint);
    return u.protocol === 'https:' && PUSH_HOSTS.test(u.hostname);
  } catch { return false; }
}

export type SendResult = 'ok' | 'gone' | 'error';

/** Envoie un message ; « gone » = abonnement expiré ou retiré, à effacer. */
export async function sendPush(target: PushTarget, body: string, v: VapidKeys, server: ServerKey, vapidCache: Map<string, Promise<string>>, opts: { ttl?: number; urgency?: 'normal' | 'high'; topic?: string } = {}): Promise<SendResult> {
  if (!isPushEndpoint(target.endpoint)) return 'gone';
  const audience = new URL(target.endpoint).origin;
  let auth = vapidCache.get(audience);
  if (!auth) { auth = vapidHeader(audience, v); vapidCache.set(audience, auth); }
  let data: Uint8Array;
  try { data = await encryptPayload(target, enc.encode(body), server); } catch { return 'gone'; }
  const headers: Record<string, string> = {
    Authorization: await auth,
    'Content-Encoding': 'aes128gcm',
    'Content-Type': 'application/octet-stream',
    TTL: String(opts.ttl ?? 86400),
    Urgency: opts.urgency ?? 'normal',
  };
  if (opts.topic) headers.Topic = opts.topic.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
  try {
    const res = await fetch(target.endpoint, { method: 'POST', headers, body: data, signal: AbortSignal.timeout(8000) });
    if (res.status === 404 || res.status === 410) return 'gone';
    return res.ok ? 'ok' : 'error';
  } catch { return 'error'; }
}
