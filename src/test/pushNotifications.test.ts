// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { b64urlDecode, b64urlEncode, encryptPayload, isPushEndpoint, newServerKey } from '../../worker/webpush';
import { candidatesFrom, flushQueue, handleNotifications, runScheduled } from '../../worker/notifications';
import { buildNotificationFeed } from '@/features/notifications/feed';
import { VAPID_PUBLIC_KEY } from '@/features/notifications/config';

const NOW = Date.parse('2026-11-18T12:00:00Z');
const emptyDb = { lives: [], announcements: [], sermons: [] };
const emptyFeed = { articles: [], sermons: [], lives: [] };

describe('Web Push : outils', () => {
  it('base64url aller-retour', () => {
    const b = crypto.getRandomValues(new Uint8Array(65));
    expect(b64urlDecode(b64urlEncode(b))).toEqual(b);
    expect(b64urlDecode(VAPID_PUBLIC_KEY)).toHaveLength(65);
  });

  it('accepte seulement les vrais services de notification', () => {
    expect(isPushEndpoint('https://fcm.googleapis.com/fcm/send/abc')).toBe(true);
    expect(isPushEndpoint('https://updates.push.services.mozilla.com/wpush/v2/x')).toBe(true);
    expect(isPushEndpoint('https://web.push.apple.com/QG')).toBe(true);
    expect(isPushEndpoint('https://wns2-par02p.notify.windows.com/w/?token=x')).toBe(true);
    expect(isPushEndpoint('http://fcm.googleapis.com/x')).toBe(false);
    expect(isPushEndpoint('https://evil.example.com/x')).toBe(false);
    expect(isPushEndpoint('https://fcm.googleapis.com.evil.com/x')).toBe(false);
  });

  it('chiffre au format aes128gcm (en-tête de 86 octets + 16 de contrôle)', async () => {
    const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']) as CryptoKeyPair;
    const p256dh = b64urlEncode(await crypto.subtle.exportKey('raw', ua.publicKey) as ArrayBuffer);
    const out = await encryptPayload({ endpoint: 'https://fcm.googleapis.com/x', p256dh, auth: b64urlEncode(crypto.getRandomValues(new Uint8Array(16))) }, new TextEncoder().encode('abc'), await newServerKey());
    expect(out.length).toBe(86 + 3 + 1 + 16);
    expect(out[20]).toBe(65);
  });
});

describe('alertes automatiques', () => {
  it('direct qui commence : de 1 min avant à 30 min après le début', () => {
    const live = (min: number) => ({ id: 'L', title: 'Culte du dimanche', startsAt: new Date(NOW + min * 60000).toISOString(), durationMinutes: 120 });
    expect(candidatesFrom(emptyFeed, { ...emptyDb, lives: [live(0)] }, NOW)).toMatchObject([{ key: 'direct:L', topic: 'direct', url: '/direct' }]);
    expect(candidatesFrom(emptyFeed, { ...emptyDb, lives: [live(-29)] }, NOW)).toHaveLength(1);
    expect(candidatesFrom(emptyFeed, { ...emptyDb, lives: [live(-31)] }, NOW)).toHaveLength(0);
    expect(candidatesFrom(emptyFeed, { ...emptyDb, lives: [live(5)] }, NOW)).toHaveLength(0);
  });

  it('article du site : 48 h, titres dans les 3 langues, lien vers l’article', () => {
    const a = (h: number) => ({ id: 'edito-ann-x', date: new Date(NOW - h * 3600000).toISOString(), title: { fr: 'Communiqué', en: 'Notice', pt: 'Comunicado' }, summary: { fr: 'Résumé' }, image: '/images/a.jpg' });
    const [m] = candidatesFrom({ ...emptyFeed, articles: [a(2)] }, emptyDb, NOW);
    expect(m).toMatchObject({ key: 'article:edito-ann-x', topic: 'communiques', url: '/actualites/edito-ann-x', image: '/images/a.jpg' });
    expect(m.title).toEqual({ fr: '📢 Communiqué', en: '📢 Notice', pt: '📢 Comunicado' });
    expect(m.body.en).toBe('Résumé');
    expect(candidatesFrom({ ...emptyFeed, articles: [a(49)] }, emptyDb, NOW)).toHaveLength(0);
  });

  it('annonce et prédication de la base : 6 h', () => {
    const db = {
      lives: [],
      announcements: [{ id: 'u1', title: 'Annonce', summary: 's', image_url: null, published_at: new Date(NOW - 3600000).toISOString() }],
      sermons: [{ id: 's1', title: 'La foi', preacher_title: 'Pasteur', preacher_name: 'MBUMBA', created_at: new Date(NOW - 7 * 3600000).toISOString() }],
    };
    const list = candidatesFrom(emptyFeed, db, NOW);
    expect(list.map((m) => m.key)).toEqual(['article:u1']);
    db.sermons[0].created_at = new Date(NOW - 3600000).toISOString();
    expect(candidatesFrom(emptyFeed, db, NOW).find((m) => m.topic === 'predications')).toMatchObject({ key: 'sermon:s1', url: '/predications/audio/s1', body: { fr: '« La foi » — Pasteur MBUMBA' } });
  });

  it('les titres trop longs sont coupés (limite de la table : 120)', () => {
    const long = 'x'.repeat(300);
    const [m] = candidatesFrom({ ...emptyFeed, articles: [{ id: 'edito-ann-l', date: new Date(NOW).toISOString(), title: { fr: long }, summary: { fr: long }, image: null }] }, emptyDb, NOW);
    expect(m.title.fr.length).toBeLessThanOrEqual(110);
    expect(m.body.fr.length).toBeLessThanOrEqual(300);
  });

  it('le fichier des nouveautés contient les articles récents du site', () => {
    const feed = buildNotificationFeed(Date.parse('2026-11-18T12:00:00Z'));
    const a = feed.articles.find((x) => x.id === 'edito-ann-livres-encadrement-neophytes');
    expect(a?.title.en).toMatch(/Two free books/);
    expect(feed.sermons.every((s) => s.id && s.date)).toBe(true);
  });
});

/* ---------- Envoi par lots, avec une fausse base Supabase et un faux service de notification ---------- */

interface FakeSub { id: number; endpoint: string; p256dh: string; auth: string; lang: string; topics: string[] }

async function fakeSub(id: number, topics = ['direct', 'communiques', 'predications'], host = 'fcm.googleapis.com'): Promise<FakeSub> {
  const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']) as CryptoKeyPair;
  return { id, endpoint: `https://${host}/fcm/send/${id}`, p256dh: b64urlEncode(await crypto.subtle.exportKey('raw', ua.publicKey) as ArrayBuffer), auth: b64urlEncode(crypto.getRandomValues(new Uint8Array(16))), lang: 'fr', topics };
}

function fakeWorld(subs: FakeSub[], messages: Record<string, unknown>[]) {
  const pushes: { url: string; headers: Record<string, string> }[] = [];
  let calls = 0;
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    calls += 1;
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const method = init?.method ?? 'GET';
    const q = url.searchParams;
    if (url.hostname.endsWith('supabase.co')) {
      const table = url.pathname.replace('/rest/v1/', '');
      if (table === 'push_messages' && method === 'GET') {
        return Response.json(messages.filter((m) => m.status === 'pending' || m.status === 'sending').slice(0, 1));
      }
      if (table === 'push_messages' && method === 'PATCH') {
        const m = messages.find((x) => `eq.${x.id}` === q.get('id') && `eq.${x.cursor}` === q.get('cursor'));
        if (!m) return Response.json([]);
        Object.assign(m, JSON.parse(String(init!.body)));
        return Response.json([m]);
      }
      if (table === 'push_messages' && method === 'POST') {
        for (const m of JSON.parse(String(init!.body))) if (!messages.some((x) => x.key === m.key)) messages.push({ ...m, id: messages.length + 1, cursor: 0, status: 'pending', sent: 0 });
        return new Response(null, { status: 201 });
      }
      if (table === 'push_subscriptions' && method === 'GET') {
        const after = Number(q.get('id')?.replace('gt.', '') ?? 0);
        const topic = q.get('topics')?.replace(/^cs\.\{|\}$/g, '');
        const limit = Number(q.get('limit') ?? 1000);
        return Response.json(subs.filter((s) => s.id > after && (!topic || s.topics.includes(topic))).slice(0, limit));
      }
      if (table === 'push_subscriptions' && method === 'DELETE') {
        const ids = (q.get('id') ?? '').replace(/^in\.\(|\)$/g, '').split(',').map(Number);
        for (const id of ids) subs.splice(subs.findIndex((s) => s.id === id), 1);
        return new Response(null, { status: 204 });
      }
      if (table === 'rpc/push_add_counts') {
        const b = JSON.parse(String(init!.body));
        const m = messages.find((x) => x.id === b.p_id)!;
        m.sent = Number(m.sent ?? 0) + b.p_sent;
        return new Response(null, { status: 204 });
      }
      return Response.json([]);
    }
    // Service de notification : l'abonnement n° 3 a expiré.
    pushes.push({ url: url.href, headers: init?.headers as Record<string, string> });
    return new Response(null, { status: url.pathname.endsWith('/3') ? 410 : 201 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { pushes, messages, subs, calls: () => calls };
}

const env = {
  ASSETS: { fetch: async () => new Response('{}', { status: 404 }) },
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_KEY: 'sb_secret_test',
  // Paire VAPID de test (pas celle du site) : seule la signature est vérifiée ailleurs.
  VAPID_PRIVATE_KEY: '',
  PUSH_BATCH: '4',
};

describe('envoi de la file', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  async function withKeys() {
    // La clé privée doit correspondre à VAPID_PUBLIC_KEY : on ne l'a pas ici, on remplace donc l'import de la clé.
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']) as CryptoKeyPair;
    const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
    const realImport = crypto.subtle.importKey.bind(crypto.subtle);
    vi.spyOn(crypto.subtle, 'importKey').mockImplementation(((format: string, data: unknown, alg: unknown, ext: boolean, uses: KeyUsage[]) =>
      format === 'jwk' ? realImport('jwk', { ...jwk, key_ops: undefined }, alg as EcKeyImportParams, ext, uses) : realImport(format as 'raw', data as BufferSource, alg as AlgorithmIdentifier, ext, uses)) as typeof crypto.subtle.importKey);
    return { ...env, VAPID_PRIVATE_KEY: jwk.d! };
  }

  it('envoie par lots aux abonnés du sujet, retire les abonnements expirés et ne renvoie jamais deux fois', async () => {
    const subs = await Promise.all([1, 2, 3, 4, 5, 6, 7].map((i) => fakeSub(i, i === 6 ? ['communiques'] : undefined)));
    const w = fakeWorld(subs, [{ id: 1, key: 'direct:L', topic: 'direct', title: { fr: 'En direct', en: 'Live' }, body: { fr: 'Culte' }, url: '/direct', image: null, cursor: 0, status: 'pending', sent: 0 }]);
    const e = await withKeys();
    // Petit budget : 1 lot par passage.
    const r1 = await flushQueue({ ...e, PUSH_SUBREQUESTS: '10' }, new (class { left = 10; take(n = 1) { if (this.left < n) throw new Error('budget'); this.left -= n; } })() as never);
    expect(r1.pending).toBe(true);
    const r2 = await handleNotifications(new Request('https://x/api/notifications/envoyer', { method: 'POST' }), e, 'envoyer').then((r) => r.json());
    expect(r2.pending).toBe(false);
    const sentTo = w.pushes.map((p) => p.url.split('/').pop());
    expect(sentTo).toEqual(['1', '2', '3', '4', '5', '7']); // pas le n° 6 (autre sujet), chacun une seule fois
    expect(w.subs.map((s) => s.id)).not.toContain(3);
    expect(w.messages[0]).toMatchObject({ status: 'done', sent: 5 });
    const h = w.pushes[0].headers;
    expect(h['Content-Encoding']).toBe('aes128gcm');
    expect(h.Urgency).toBe('high');
    expect(h.Authorization).toMatch(/^vapid t=.+, k=/);
  });

  it('le passage automatique ajoute le direct qui commence puis l’envoie', async () => {
    const subs = [await fakeSub(1)];
    const w = fakeWorld(subs, []);
    const e = await withKeys();
    const feed = { ...emptyFeed, lives: [{ id: 'yt-1', title: 'Fête du 15 avril', startsAt: new Date(Date.now() - 60000).toISOString(), durationMinutes: 60 }] };
    await runScheduled({ ...e, ASSETS: { fetch: async () => Response.json(feed) } });
    expect(w.messages).toMatchObject([{ key: 'direct:yt-1', status: 'done', sent: 1 }]);
    await runScheduled({ ...e, ASSETS: { fetch: async () => Response.json(feed) } });
    expect(w.messages).toHaveLength(1);
    expect(w.pushes).toHaveLength(1);
  });

  it('sans clés secrètes, le Worker répond « pas encore configuré »', async () => {
    const r = await handleNotifications(new Request('https://x/api/notifications/abonnement', { method: 'POST', body: '{}' }), { ...env, VAPID_PRIVATE_KEY: undefined }, 'abonnement');
    expect(r.status).toBe(503);
    expect(await handleNotifications(new Request('https://x/api/notifications/etat'), env, 'etat').then((x) => x.json())).toEqual({ pret: false });
  });
});
