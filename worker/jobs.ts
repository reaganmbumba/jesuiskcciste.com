/**
 * Offres d'emploi du jour : GET /api/emplois
 *
 * Le Worker rassemble chaque jour jusqu'à 50 offres RÉELLES de la RD Congo et
 * de l'Angola, publiées sur des sites d'emploi de ces pays, avec le lien de
 * l'offre d'origine. Rien n'est inventé : une offre sans titre ou sans lien
 * est écartée.
 *
 *  1. mediacongo.net (RD Congo) : la page publique des offres d'emploi.
 *  2. Jobartis (Angola) : les premières pages publiques des offres.
 *  3. ReliefWeb (ONU / OCHA) : offres des ONG et des agences de l'ONU en RD
 *     Congo et en Angola. Gratuit, mais ReliefWeb exige un « appname » demandé
 *     sur apidoc.reliefweb.int : tant que la variable RELIEFWEB_APPNAME n'est
 *     pas réglée dans le Worker, cette source est ignorée.
 *
 * La réponse est gardée en cache 3 heures : ces sites ne sont lus que
 * quelques fois par jour. /api/emplois?diagnostic=1 indique ce que chaque
 * source a donné (sans cache).
 */

export interface JobsEnv { RELIEFWEB_APPNAME?: string }

interface CacheLike { match(req: Request): Promise<Response | undefined>; put(req: Request, res: Response): Promise<void> }
interface Ctx { waitUntil(p: Promise<unknown>): void }

export interface JobItem {
  id: string;
  title: string;
  organization: string | null;
  location: string | null;
  /** « RD Congo » ou « Angola ». */
  country: string | null;
  remote: boolean;
  category: string | null;
  contract: string | null;
  url: string;
  source: JobSource;
  postedAt: string | null;
  closingAt: string | null;
}

export type JobSource = 'mediacongo.net' | 'Jobartis' | 'ReliefWeb';

export const DAILY_JOBS = 50;
const CACHE_SECONDS = 3 * 3600;
const TIMEOUT = 8000;

const json = (body: unknown, maxAge = 0) =>
  new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': maxAge ? `public, max-age=${maxAge}` : 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
const first = (v: unknown): Record<string, unknown> | null => (Array.isArray(v) ? (v[0] as Record<string, unknown>) ?? null : v && typeof v === 'object' ? (v as Record<string, unknown>) : null);
const names = (v: unknown): string | null => {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  const out = list.map((x) => str((x as Record<string, unknown>)?.name)).filter(Boolean);
  return out.length ? out.join(', ') : null;
};
const httpUrl = (v: unknown): string | null => {
  const s = str(v);
  return s && /^https?:\/\//i.test(s) ? s : null;
};
/** Les textes des API arrivent parfois avec des entités HTML (&amp;…). */
const clean = (s: string | null) => (s ? s.replace(/&amp;/g, '&').replace(/&#0?39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : s);

/** ReliefWeb : offres encore ouvertes en RD Congo et en Angola. */
export async function fetchReliefWeb(appname: string, now = new Date()): Promise<JobItem[]> {
  const body = {
    limit: 100,
    sort: ['date.created:desc'],
    filter: { field: 'country.iso3', value: ['cod', 'ago'], operator: 'OR' },
    fields: { include: ['title', 'url', 'url_alias', 'source.name', 'source.shortname', 'date.created', 'date.closing', 'city.name', 'country.name', 'type.name', 'career_categories.name', 'experience.name'] },
  };
  const r = await fetch(`https://api.reliefweb.int/v2/jobs?appname=${encodeURIComponent(appname)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!r.ok) throw new Error(`ReliefWeb ${r.status}`);
  const data = (await r.json()) as { data?: { id?: string | number; fields?: Record<string, unknown> }[] };
  return parseReliefWeb(data, now);
}

export function parseReliefWeb(data: { data?: { id?: string | number; fields?: Record<string, unknown> }[] }, now = new Date()): JobItem[] {
  const out: JobItem[] = [];
  for (const row of data.data ?? []) {
    const f = row.fields ?? {};
    const title = clean(str(f.title));
    const url = httpUrl(f.url_alias) ?? httpUrl(f.url);
    if (!title || !url) continue;
    const date = first(f.date) ?? {};
    const closingAt = str(date.closing);
    if (closingAt && new Date(closingAt).getTime() < now.getTime() - 86400000) continue; // offre déjà close
    const src = first(f.source);
    out.push({
      id: `rw-${row.id ?? url}`,
      title,
      organization: clean(str(src?.name) ?? str(src?.shortname)),
      location: names(f.city),
      country: /angola/i.test(names(f.country) ?? '') ? 'Angola' : 'RD Congo',
      remote: false,
      category: names(f.career_categories),
      contract: names(f.type),
      url,
      source: 'ReliefWeb',
      postedAt: str(date.created),
      closingAt,
    });
  }
  return out;
}

const UA = 'Mozilla/5.0 (compatible; JesuisKCCisteBot/1.0; +https://jesuiskcciste.com/emplois)';

async function getHtml(url: string): Promise<string> {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html', 'Accept-Language': 'fr,pt;q=0.8,en;q=0.5' }, signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) throw new Error(`${new URL(url).host} ${r.status}`);
  return r.text();
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', eacute: 'é', egrave: 'è', ecirc: 'ê', agrave: 'à', ccedil: 'ç', ocirc: 'ô', atilde: 'ã', otilde: 'õ', aacute: 'á', oacute: 'ó', iacute: 'í', uacute: 'ú' };
/** Texte d'un morceau de HTML : sans balises, entités décodées, espaces réduits. */
export function textOf(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * mediacongo.net : chaque offre est une ligne dont toutes les cellules sont des
 * liens vers la même page « emploi-societe-<n°>_….html » : fonction (avec le
 * code OEM), organisme, lieu, date de publication (JJ.MM.AAAA).
 */
export function parseMediacongo(html: string): JobItem[] {
  const re = /<a\b[^>]*href=["']((?:https?:\/\/(?:www\.)?mediacongo\.net)?\/?emploi-societe-(\d+)_[^"'#?]*\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const byId = new Map<string, { url: string; texts: string[] }>();
  for (const m of html.matchAll(re)) {
    const id = m[2];
    const url = new URL(m[1], 'https://www.mediacongo.net/').toString();
    const entry = byId.get(id) ?? { url, texts: [] };
    const t = textOf(m[3]);
    if (t) entry.texts.push(t);
    byId.set(id, entry);
  }
  const out: JobItem[] = [];
  for (const [id, { url, texts }] of byId) {
    const date = texts.find((t) => /^\d{2}\.\d{2}\.\d{4}$/.test(t));
    const rest = texts.filter((t) => t !== date && !/^OEM\d+$/i.test(t));
    const title = rest[0]?.replace(/\bOEM\d+\b/gi, '').trim();
    if (!title) continue;
    const [d, mo, y] = date ? date.split('.') : [];
    out.push({
      id: `mc-${id}`,
      title,
      organization: rest[1] ?? null,
      location: rest[2] ?? null,
      country: 'RD Congo',
      remote: false,
      category: null,
      contract: null,
      url,
      source: 'mediacongo.net',
      postedAt: date ? `${y}-${mo}-${d}T00:00:00Z` : null,
      closingAt: null,
    });
  }
  return out;
}

/**
 * Jobartis (Angola) : chaque offre a un titre lié à « /emprego-… », le lien de
 * l'employeur (« /empregadores/… »), le lieu (« Ville, Province »), puis le
 * type de contrat. Avant l'offre : « Já só tem N dias para se candidatar ».
 */
export function parseJobartis(html: string, now = new Date()): JobItem[] {
  const re = /<a\b[^>]*href=["']((?:https?:\/\/(?:www\.)?jobartis\.com)?\/emprego-[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const hits: { url: string; title: string; index: number }[] = [];
  for (const m of html.matchAll(re)) {
    const title = textOf(m[2]);
    if (!title || title.length < 3) continue;
    const url = new URL(m[1], 'https://www.jobartis.com/').toString();
    if (hits.some((h) => h.url === url)) continue;
    hits.push({ url, title, index: m.index ?? 0 });
  }
  return hits.map((h, k) => {
    const chunk = html.slice(h.index, hits[k + 1]?.index ?? h.index + 6000);
    const before = html.slice(hits[k - 1]?.index ?? Math.max(0, h.index - 3000), h.index);
    const company = /<a\b[^>]*href=["'][^"']*\/empregadores\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/i.exec(chunk);
    const items = [...chunk.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => textOf(x[1]));
    const location = items.find((t) => /^[^,]{2,40}, [^,]{2,40}$/.test(t) && !/experi|anos/i.test(t)) ?? null;
    const contract = location ? items[items.indexOf(location) + 1] ?? null : null;
    const days = /tem\s*(?:<[^>]+>\s*)*(\d{1,3})\s*(?:<[^>]+>\s*)*dias/i.exec(before);
    return {
      id: `ja-${h.url.split('/').pop()}`,
      title: h.title,
      organization: company ? textOf(company[1]) || null : null,
      location,
      country: 'Angola',
      remote: false,
      category: null,
      contract: contract && contract.length < 40 && !/experi/i.test(contract) ? contract : null,
      url: h.url,
      source: 'Jobartis' as const,
      postedAt: null,
      closingAt: days ? new Date(now.getTime() + Number(days[1]) * 86400000).toISOString().slice(0, 10) : null,
    };
  });
}

export async function fetchMediacongo(): Promise<JobItem[]> {
  return parseMediacongo(await getHtml('https://www.mediacongo.net/emplois.html'));
}

export async function fetchJobartis(): Promise<JobItem[]> {
  const pages = await Promise.all([1, 2, 3].map((p) => getHtml(`https://www.jobartis.com/vagas-emprego${p > 1 ? `?page=${p}` : ''}`).catch((e) => (p === 1 ? Promise.reject(e) : ''))));
  const seen = new Set<string>();
  return pages.flatMap((h) => parseJobartis(h)).filter((j) => (seen.has(j.url) ? false : (seen.add(j.url), true)));
}

const time = (s: string | null) => (s ? new Date(s).getTime() || 0 : 0);

/**
 * Les 50 offres du jour : environ 30 pour la RD Congo et 20 pour l'Angola,
 * les plus récentes d'abord ; si un pays en a moins, l'autre complète.
 */
export function pickDaily(rdc: JobItem[], angola: JobItem[], max = DAILY_JOBS): JobItem[] {
  const seen = new Set<string>();
  const uniq = (list: JobItem[]) => list.filter((j) => (seen.has(j.url) ? false : (seen.add(j.url), true)));
  const a = uniq([...rdc].sort((x, y) => time(y.postedAt) - time(x.postedAt)));
  const b = uniq(angola);
  const share = Math.round(max * 0.6);
  const takeA = Math.min(a.length, Math.max(share, max - b.length));
  return [...a.slice(0, takeA), ...b.slice(0, max - takeA)];
}

export async function handleJobs(request: Request, env: JobsEnv, ctx?: Ctx): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'GET seulement' });
  const diag = new URL(request.url).searchParams.has('diagnostic');
  const today = new Date().toISOString().slice(0, 10);
  const cache = (globalThis as unknown as { caches?: { default?: CacheLike } }).caches?.default;
  const key = new Request(`https://cache.jesuiskcciste.com/api/emplois/v2/${today}/${env.RELIEFWEB_APPNAME ? 'rw' : 'nrw'}`);
  if (!diag) {
    const hit = await cache?.match(key).catch(() => undefined);
    if (hit) return hit;
  }

  const status: Record<string, string> = { mediacongo: 'off', jobartis: 'off', reliefweb: 'off' };
  const run = (name: string, p: Promise<JobItem[]>) => p.then(
    (l) => { status[name] = l.length ? `ok (${l.length})` : 'vide'; return l; },
    (e: unknown) => { status[name] = `erreur : ${e instanceof Error ? e.message : String(e)}`; return [] as JobItem[]; },
  );
  const [mc, ja, rw] = await Promise.all([
    run('mediacongo', fetchMediacongo()),
    run('jobartis', fetchJobartis()),
    env.RELIEFWEB_APPNAME ? run('reliefweb', fetchReliefWeb(env.RELIEFWEB_APPNAME)) : Promise.resolve([] as JobItem[]),
  ]);
  const jobs = pickDaily([...mc, ...rw.filter((j) => j.country !== 'Angola')], [...ja, ...rw.filter((j) => j.country === 'Angola')]);
  const res = json({ date: today, generatedAt: new Date().toISOString(), sources: status, jobs }, jobs.length && !diag ? 600 : 0);
  // Une liste vide (sites injoignables) n'est pas gardée : on réessaiera à la prochaine visite.
  if (cache && jobs.length && !diag) {
    const stored = new Response(res.clone().body, res);
    stored.headers.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    const p = cache.put(key, stored).catch(() => undefined);
    if (ctx) ctx.waitUntil(p); else await p;
  }
  return res;
}
