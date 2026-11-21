/**
 * Co-animateur Claude du studio radio (/admin/radio/antenne et application Studio).
 *
 *   POST /api/radio/assistant   (jeton Supabase d'un administrateur : permission settings.manage)
 *   { kind, demande?, emission: {...}, fil: [{ h, type, texte }] }
 *   → { texte, ensuite }
 *
 * L'animateur note le fil de l'émission (ce qui a été dit, joué, les appels, les sujets de prière) ;
 * Claude propose le texte suivant à lire à l'antenne, comme s'il animait lui-même.
 * La clé de l'API Claude est un secret Cloudflare (ANTHROPIC_API_KEY) : elle ne quitte jamais le Worker.
 */
import Anthropic from '@anthropic-ai/sdk';

export interface AssistantEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  /** Facultatif : autre modèle Claude (par défaut claude-opus-5-5). */
  ASSISTANT_MODEL?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

/** Ce que l'animateur demande ; chaque type a sa consigne. */
export const KINDS: Record<string, string> = {
  suite: 'Propose la prochaine prise de parole la plus utile maintenant, d’après le fil (transition, relance, prière, annonce… à toi de choisir).',
  accueil: 'Ouverture de l’émission : salutation chaleureuse, nom de l’émission, sujet du jour, invitation à appeler et à partager.',
  transition: 'Transition naturelle vers ce qui suit (chanson, appel, rubrique), en reprenant ce qui vient d’être dit ou joué.',
  chanson: 'Présentation ou désannonce de la chanson notée dans le fil (titre et artiste tels qu’ils sont écrits), avec une phrase sur son message.',
  appel: 'Accueil de l’auditeur qui vient de passer à l’antenne (prénom et ville tels qu’ils sont notés), puis une question pour le lancer.',
  merci: 'Remerciement de l’auditeur qui vient de parler, en reprenant en une phrase ce qu’il a partagé, puis relance.',
  priere: 'Prière à dire à l’antenne pour les sujets de prière notés dans le fil (ou, sans sujet noté, pour les auditeurs et le sujet du jour).',
  annonce: 'Annonce : comment appeler, écouter la radio et rejoindre le groupe WhatsApp officiel.',
  relance: 'Relance pour faire réagir les auditeurs : une question simple sur le sujet, invitation à appeler ou à écrire.',
  cloture: 'Clôture de l’émission : résumé en deux ou trois phrases, remerciements (auditeurs, appelants notés), prière courte de fin, rendez-vous.',
  libre: 'Fais exactement ce que l’animateur demande dans « demande ».',
};

const SYSTEM = `Tu es le co-animateur de « Radio Je suis KCCiste », la radio en ligne des fidèles KCCistes de l’Église Bon Nouveau Message (EBNM, « KCC »). Tu travailles en direct avec l’animateur, à côté de lui dans le studio.

Ton rôle : à chaque demande, écrire le texte exact que l’animateur va LIRE À L’ANTENNE, maintenant, comme s’il parlait déjà aux auditeurs. Tu t’appuies sur le fil de l’émission (ce qui a été dit, joué, les appels, les sujets de prière, les chansons et artistes) pour que tout s’enchaîne naturellement.

Règles d’écriture :
- Français parlé, chaleureux, simple et respectueux ; phrases courtes, faciles à lire à voix haute. Tutoiement interdit envers les auditeurs : « vous », « chers auditeurs », « frères et sœurs ».
- Uniquement le texte à dire : pas de titre, pas de liste, pas de markdown, pas d’indications de mise en scène. Tu peux écrire « (pause) » là où l’animateur doit respirer.
- Longueur : 40 à 120 mots pour une transition, une relance ou une annonce ; 80 à 180 mots pour une prière, une ouverture ou une clôture ; sauf si l’animateur demande autre chose.
- Ne répète pas mot pour mot ce qui a déjà été lu (lignes « lu » du fil) ; varie les formules.
- Noms, villes, titres de chansons et artistes : seulement ceux qui sont écrits dans le fil ou les informations de l’émission, orthographiés à l’identique. N’invente jamais un nom, un chiffre, une date, un événement, un témoignage ou une citation.
- Doctrine : n’invente pas d’enseignement ni de parole attribuée au Prophète ou aux responsables. Reste sur la louange, l’encouragement, la prière et ce qui est noté dans le fil. Pour une question de foi précise, invite à consulter les textes officiels sur jesuiskcciste.com ou un prédicateur.

Coutumes KCC à respecter (textes liturgiques 2014) :
- On s’adresse à Dieu en disant « Seigneur Éternel », « Éternel Dieu saint », « Éternel notre Dieu ».
- Toute prière se termine par : « Qu’il en soit ainsi par Ton Saint Nom. »
- Après une prière, on peut inviter les auditeurs à répondre : « Alléluia ! Viens Seigneur Éternel, par Ton Saint Nom. »
- Le chef actuel de l’Église est Son Éminence DIZOLELE MPUNGU Isaac ; on le nomme avec ce titre, seulement si c’est utile.

Informations pratiques de la radio (à donner dans les annonces, jamais déformées) :
- Écouter : jesuiskcciste.com/radio (aussi dans l’application « Je suis KCCiste »).
- Appeler l’émission : le bouton « Appeler » sur jesuiskcciste.com/radio, ou le numéro 0840238592 (zéro huit cent quarante, vingt-trois, quatre-vingt-cinq, quatre-vingt-douze).
- Rejoindre le groupe WhatsApp officiel « Je suis KCCiste » : le lien est sur le site jesuiskcciste.com.

Réponds toujours dans le format demandé : « texte » = ce que l’animateur lit maintenant ; « ensuite » = une seule phrase courte, pour l’animateur seulement (pas à lire), qui anticipe ce qu’il pourrait faire juste après (ex. « Lancer la chanson notée, puis prendre l’appel en attente »).`;

const SCHEMA = {
  type: 'object',
  properties: {
    texte: { type: 'string', description: 'Texte à lire à l’antenne, maintenant.' },
    ensuite: { type: 'string', description: 'Une phrase pour l’animateur : ce qui pourrait suivre.' },
  },
  required: ['texte', 'ensuite'],
  additionalProperties: false,
} as const;

/** Le jeton a-t-il cette permission ? (fonction has_permission de la base) */
async function hasPermission(env: AssistantEnv, token: string, permission: string): Promise<boolean> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !token) return false;
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/has_permission`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_permission: permission }),
  });
  return r.ok && (await r.json()) === true;
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Construit le message envoyé à Claude à partir de la demande du studio (tailles bornées). */
export function buildPrompt(body: Record<string, unknown>): string | null {
  const kind = str(body.kind, 20);
  if (!KINDS[kind]) return null;
  const e = (body.emission && typeof body.emission === 'object' ? body.emission : {}) as Record<string, unknown>;
  const fil = (Array.isArray(body.fil) ? body.fil : []).slice(-80).map((x) => {
    const l = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>;
    return `[${str(l.h, 5)}] ${str(l.type, 12)} : ${str(l.texte, 600)}`;
  });
  const demande = str(body.demande, 800);
  if (kind === 'libre' && !demande) return null;
  const info = [
    `Émission : ${str(e.titre, 120) || 'Émission en direct'}`,
    `Sujet du jour : ${str(e.sujet, 1500) || '(non précisé)'}`,
    `Animateur : ${str(e.animateur, 80) || '(non précisé)'}`,
    `État : ${str(e.etat, 40) || 'hors antenne'}${e.minutes != null ? ` depuis ${Number(e.minutes) || 0} min` : ''}`,
    `Heure (Kinshasa) : ${str(e.heure, 5)}`,
    e.auditeurs != null ? `Auditeurs connectés : ${Number(e.auditeurs) || 0}` : '',
    str(e.programme, 160) ? `Émission programmée qui passe sous la voix : ${str(e.programme, 160)}` : '',
    str(e.musique, 160) ? `Musique de fond en cours : ${str(e.musique, 160)}` : '',
    str(e.antenne, 300) ? `Auditeurs à l’antenne maintenant : ${str(e.antenne, 300)}` : '',
    str(e.attente, 300) ? `Appels en attente : ${str(e.attente, 300)}` : '',
  ].filter(Boolean).join('\n');
  return `<emission>\n${info}\n</emission>\n\n<fil>\n${fil.join('\n') || '(rien noté pour le moment)'}\n</fil>\n\nDemande : ${KINDS[kind]}${demande ? `\nPrécision de l’animateur : ${demande}` : ''}`;
}

export async function handleAssistant(request: Request, env: AssistantEnv): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method' }, 405);
  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!(await hasPermission(env, token, 'settings.manage'))) return json({ error: 'forbidden' }, 403);
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'not-configured' }, 503);
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return json({ error: 'json' }, 400); }
  const prompt = buildPrompt(body);
  if (!prompt) return json({ error: 'input' }, 400);

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 60_000 });
  try {
    const res = await client.beta.messages.create({
      model: env.ASSISTANT_MODEL || 'claude-opus-5-5',
      max_tokens: 4000,
      // En direct, la rapidité compte : réflexion courte.
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      // Si le modèle refuse par erreur, l'API passe à un autre modèle dans le même appel.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    });
    if (res.stop_reason === 'refusal') return json({ error: 'refusal' }, 422);
    const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    let out: { texte?: unknown; ensuite?: unknown };
    try { out = JSON.parse(text) as typeof out; } catch { out = { texte: text, ensuite: '' }; }
    const texte = typeof out.texte === 'string' ? out.texte.trim() : '';
    if (!texte) return json({ error: 'empty' }, 502);
    return json({ texte, ensuite: typeof out.ensuite === 'string' ? out.ensuite.trim() : '' });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return json({ error: 'bad-key' }, 503);
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429);
    if (e instanceof Anthropic.APIError && e.status === 400 && /credit|billing/i.test(e.message)) return json({ error: 'credit' }, 402);
    return json({ error: 'claude', detail: e instanceof Error ? e.message.slice(0, 200) : '' }, 502);
  }
}
