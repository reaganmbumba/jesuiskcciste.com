/**
 * Relais vidéo du direct (Cloudflare Realtime SFU).
 *
 * Le studio (administrateur) envoie son image une seule fois au relais de
 * Cloudflare ; chaque spectateur de la page Direct la reçoit de ce relais.
 * Le secret de l'application Realtime reste ici, côté serveur.
 *
 *   POST /api/live/publish  { sdp, tracks:[{mid, trackName}] }  (jeton Supabase d'un administrateur)
 *   POST /api/live/watch    { sessionId, tracks:[trackName] }   → offre à accepter
 *   POST /api/live/answer   { sessionId, sdp }                  → réponse du spectateur
 *
 * Réglage : variables secrètes CALLS_APP_ID et CALLS_APP_SECRET du Worker.
 */

export interface LiveEnv { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string; CALLS_APP_ID?: string; CALLS_APP_SECRET?: string }

const RTC = 'https://rtc.live.cloudflare.com/v1/apps/';
const TRACKS = new Set(['video', 'audio']);
const SID = /^[A-Za-z0-9_-]{8,128}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function rtc(env: LiveEnv, path: string, method: string, body?: unknown) {
  const r = await fetch(RTC + env.CALLS_APP_ID + path, {
    method,
    headers: { Authorization: `Bearer ${env.CALLS_APP_SECRET}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok || data.errorCode) throw new Error(String(data.errorDescription ?? data.errorCode ?? r.status));
  return data;
}

/** Le jeton appartient-il à un administrateur central du site ? (fonction has_permission de la base) */
async function isAdmin(env: LiveEnv, token: string): Promise<boolean> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !token) return false;
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/has_permission`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_permission: 'settings.manage' }),
  });
  return r.ok && (await r.json()) === true;
}

export async function handleLive(request: Request, env: LiveEnv, path: string): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method' }, 405);
  if (!env.CALLS_APP_ID || !env.CALLS_APP_SECRET) return json({ error: 'not-configured' }, 503);
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return json({ error: 'json' }, 400); }
  try {
    if (path === 'publish') {
      const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
      if (!(await isAdmin(env, token))) return json({ error: 'forbidden' }, 403);
      const sdp = typeof body.sdp === 'string' ? body.sdp : '';
      const tracks = Array.isArray(body.tracks) ? body.tracks as { mid?: unknown; trackName?: unknown }[] : [];
      if (!sdp || sdp.length > 100000 || !tracks.length || tracks.some((t) => typeof t.mid !== 'string' || !TRACKS.has(String(t.trackName)))) return json({ error: 'input' }, 400);
      const s = await rtc(env, '/sessions/new', 'POST');
      const sessionId = String(s.sessionId);
      const res = await rtc(env, `/sessions/${sessionId}/tracks/new`, 'POST', {
        sessionDescription: { type: 'offer', sdp },
        tracks: tracks.map((t) => ({ location: 'local', mid: t.mid, trackName: t.trackName })),
      });
      const desc = res.sessionDescription as { sdp: string };
      return json({ sessionId, sdp: desc.sdp });
    }
    if (path === 'watch') {
      const source = String(body.sessionId ?? '');
      const names = (Array.isArray(body.tracks) ? body.tracks : ['video', 'audio']).map(String).filter((n) => TRACKS.has(n));
      if (!SID.test(source) || !names.length) return json({ error: 'input' }, 400);
      const s = await rtc(env, '/sessions/new', 'POST');
      const sessionId = String(s.sessionId);
      const res = await rtc(env, `/sessions/${sessionId}/tracks/new`, 'POST', {
        tracks: names.map((trackName) => ({ location: 'remote', sessionId: source, trackName })),
      });
      const desc = res.sessionDescription as { sdp: string; type: string } | undefined;
      if (!desc) return json({ error: 'no-offer' }, 502);
      return json({ sessionId, sdp: desc.sdp, renegotiate: !!res.requiresImmediateRenegotiation });
    }
    if (path === 'answer') {
      const sessionId = String(body.sessionId ?? '');
      const sdp = typeof body.sdp === 'string' ? body.sdp : '';
      if (!SID.test(sessionId) || !sdp || sdp.length > 100000) return json({ error: 'input' }, 400);
      await rtc(env, `/sessions/${sessionId}/renegotiate`, 'PUT', { sessionDescription: { type: 'answer', sdp } });
      return json({ ok: true });
    }
    return json({ error: 'not-found' }, 404);
  } catch (e) {
    return json({ error: 'relay', detail: e instanceof Error ? e.message : '' }, 502);
  }
}
