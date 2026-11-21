/**
 * Assistant d'antenne du Studio (« souffleur IA ») : l'animateur écrit ce qu'il veut dire
 * (en lingala, en français approximatif…) et reçoit des phrases prêtes à lire, en bon français.
 * Réservé aux animateurs (vérifié auprès de Supabase avec leur jeton). La clé ANTHROPIC_API_KEY
 * est un secret Cloudflare ajouté par l'administrateur ; sans elle, réponse 503 « no_key ».
 */
type Env = { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string; ANTHROPIC_API_KEY?: string };

const MODES: Record<string, string> = {
  reformuler: 'Reformule ce que l’animateur veut dire en bon français parlé, simple et chaleureux, prêt à lire à l’antenne. Garde exactement le sens. Si le texte est en lingala ou mélangé, traduis-le en français.',
  idees: 'Propose des idées concrètes pour développer ce sujet à l’antenne pendant quelques minutes (points à aborder, exemple de la vie courante, question à poser aux auditeurs).',
  questions: 'Propose des questions à poser à l’invité du plateau sur ce sujet, de la plus simple à la plus profonde.',
  transition: 'Propose des phrases de transition pour passer de ce sujet à un chant, puis pour revenir au sujet après le chant.',
  cloture: 'Propose des phrases pour conclure l’émission sur ce sujet et saluer les auditeurs.',
};

const SYSTEM = `Tu aides l’animateur de « Radio Je suis KCCiste », la radio de la communauté de l’Église Bon Nouveau Message (EBNM/KCC), pendant ses directs.
Règles :
- Français simple, oral, chaleureux, phrases courtes faciles à lire à voix haute.
- La salutation est toujours « Paix à vous ».
- On prie l’Éternel (Yahwé). Ne parle jamais de Jésus, du Christ ni du Nouveau Testament, et ne cite pas d’autres confessions.
- N’invente aucun fait sur l’Église, ses responsables, ses dates ou ses décisions ; reste général si tu ne sais pas.
- Pas de politique, pas de jugement sur des personnes.
Réponds uniquement avec 3 propositions numérotées (1., 2., 3.), chacune de 1 à 3 phrases, sans introduction ni commentaire.`;

export async function handleSouffleur(request: Request, env: Env): Promise<Response> {
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (request.method !== 'POST') return json({ error: 'method' }, 405);
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'no_key' }, 503);
  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return json({ error: 'auth' }, 401);
  // animateur de la radio ?
  const ok = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/can_host_radio`, {
    method: 'POST', headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}',
  }).then((r) => (r.ok ? r.json() : false)).catch(() => false);
  if (ok !== true) return json({ error: 'auth' }, 403);

  let p: { mode?: string; text?: string; title?: string; topic?: string };
  try { p = await request.json(); } catch { return json({ error: 'bad' }, 400); }
  const mode = MODES[p.mode ?? ''] ? p.mode! : 'reformuler';
  const text = String(p.text ?? '').slice(0, 1500).trim();
  const ctx = [p.title ? `Émission : ${String(p.title).slice(0, 120)}` : '', p.topic ? `Sujet affiché : ${String(p.topic).slice(0, 600)}` : ''].filter(Boolean).join('\n');
  if (!text && !ctx) return json({ error: 'vide' }, 400);
  const content = `${MODES[mode]}\n\n${ctx}${text ? `\n\nCe que l’animateur a écrit :\n${text}` : ''}`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 700, system: SYSTEM, messages: [{ role: 'user', content }] }),
    signal: AbortSignal.timeout(25000),
  }).catch(() => null);
  if (!r || !r.ok) return json({ error: 'ia' }, 502);
  const data = (await r.json()) as { content?: { type: string; text?: string }[] };
  const out = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n').trim();
  return json({ text: out });
}
