/**
 * Offres d'emploi du jour : GET /api/emplois
 *
 * Le Worker rassemble chaque jour jusqu'à 50 offres RÉELLES publiées par des
 * sites d'emploi reconnus, avec le lien de l'offre d'origine. Rien n'est
 * inventé : une offre sans titre ou sans lien est écartée.
 *
 *  1. ReliefWeb (ONU / OCHA) : offres des ONG, des agences de l'ONU et des
 *     organisations en RD Congo, en Angola et au Congo-Brazzaville. Gratuit,
 *     mais ReliefWeb exige un « appname » demandé sur apidoc.reliefweb.int.
 *     Tant que la variable RELIEFWEB_APPNAME n'est pas réglée dans le Worker,
 *     cette source est simplement ignorée.
 *  2. Jobicy : offres en télétravail du monde entier (API publique sans clé,
 *     https://jobicy.com/jobs-rss-feed). Jobicy demande d'être cité comme
 *     source avec un lien vers l'offre : c'est ce que fait la page.
 *
 * La réponse est gardée en cache 3 heures : les sites d'emploi ne sont
 * interrogés que quelques fois par jour, et la liste change chaque jour.
 */

export interface JobsEnv { RELIEFWEB_APPNAME?: string }

interface CacheLike { match(req: Request): Promise<Response | undefined>; put(req: Request, res: Response): Promise<void> }
interface Ctx { waitUntil(p: Promise<unknown>): void }

export interface JobItem {
  id: string;
  title: string;
  organization: string | null;
  location: string | null;
  /** Pays (RD Congo, Angola…) ou « Télétravail ». */
  country: string | null;
  remote: boolean;
  category: string | null;
  contract: string | null;
  url: string;
  source: 'ReliefWeb' | 'Jobicy';
  postedAt: string | null;
  closingAt: string | null;
}

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

/** ReliefWeb : offres encore ouvertes en RD Congo, Angola et Congo-Brazzaville. */
export async function fetchReliefWeb(appname: string, now = new Date()): Promise<JobItem[]> {
  const body = {
    limit: 100,
    sort: ['date.created:desc'],
    filter: { field: 'country.iso3', value: ['cod', 'ago', 'cog'], operator: 'OR' },
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
      country: names(f.country),
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

/** Jobicy : offres en télétravail publiées ces 7 derniers jours. */
export async function fetchJobicy(): Promise<JobItem[]> {
  const r = await fetch('https://jobicy.com/api/jobs?count=100', {
    headers: { Accept: 'application/json', 'User-Agent': 'jesuiskcciste.com (rubrique emplois)' },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!r.ok) throw new Error(`Jobicy ${r.status}`);
  return parseJobicy((await r.json()) as { jobs?: Record<string, unknown>[] });
}

/** Zones où une personne vivant en Afrique ou dans la diaspora peut postuler. */
const OPEN_GEO = /anywhere|worldwide|world|global|emea|africa|afrique|europe|france|belgi|portugal|brazil|angola|congo/i;

export function parseJobicy(data: { jobs?: Record<string, unknown>[] }): JobItem[] {
  const out: JobItem[] = [];
  for (const j of data.jobs ?? []) {
    const title = clean(str(j.jobTitle));
    const url = httpUrl(j.url);
    if (!title || !url) continue;
    const geo = clean(str(j.jobGeo));
    const industry = Array.isArray(j.jobIndustry) ? (j.jobIndustry as unknown[]).map(str).filter(Boolean).join(', ') : str(j.jobIndustry);
    const type = Array.isArray(j.jobType) ? (j.jobType as unknown[]).map(str).filter(Boolean).join(', ') : str(j.jobType);
    out.push({
      id: `jy-${j.id ?? url}`,
      title,
      organization: clean(str(j.companyName)),
      location: geo,
      country: 'Télétravail',
      remote: true,
      category: clean(industry),
      contract: clean(type),
      url,
      source: 'Jobicy',
      postedAt: str(j.pubDate),
      closingAt: null,
    });
  }
  // D'abord les offres ouvertes au monde entier, à l'Afrique ou à l'Europe.
  return [...out.filter((j) => OPEN_GEO.test(j.location ?? '')), ...out.filter((j) => !OPEN_GEO.test(j.location ?? ''))];
}

const time = (s: string | null) => (s ? new Date(s).getTime() || 0 : 0);

/** Les 50 offres du jour : d'abord la RD Congo et la région (les plus récentes), puis le télétravail. */
export function pickDaily(local: JobItem[], remote: JobItem[], max = DAILY_JOBS): JobItem[] {
  const seen = new Set<string>();
  const uniq = (list: JobItem[]) => list.filter((j) => (seen.has(j.url) ? false : (seen.add(j.url), true)));
  const loc = uniq([...local].sort((a, b) => time(b.postedAt) - time(a.postedAt)));
  // Toujours au moins 15 offres en télétravail quand il y en a, pour varier les métiers.
  const keepLocal = Math.min(loc.length, Math.max(max - 15, max - remote.length));
  const rem = uniq(remote);
  return [...loc.slice(0, keepLocal), ...rem].slice(0, max);
}

export async function handleJobs(request: Request, env: JobsEnv, ctx?: Ctx): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'GET seulement' });
  const today = new Date().toISOString().slice(0, 10);
  const cache = (globalThis as unknown as { caches?: { default?: CacheLike } }).caches?.default;
  const key = new Request(`https://cache.jesuiskcciste.com/api/emplois/${today}/${env.RELIEFWEB_APPNAME ? 'rw' : 'nrw'}`);
  const hit = await cache?.match(key).catch(() => undefined);
  if (hit) return hit;

  const status: Record<string, 'ok' | 'off' | 'error'> = { reliefweb: 'off', jobicy: 'off' };
  const [rw, jy] = await Promise.all([
    env.RELIEFWEB_APPNAME
      ? fetchReliefWeb(env.RELIEFWEB_APPNAME).then((l) => { status.reliefweb = 'ok'; return l; }, () => { status.reliefweb = 'error'; return []; })
      : Promise.resolve([] as JobItem[]),
    fetchJobicy().then((l) => { status.jobicy = 'ok'; return l; }, () => { status.jobicy = 'error'; return []; }),
  ]);
  const jobs = pickDaily(rw, jy);
  const res = json({ date: today, generatedAt: new Date().toISOString(), sources: status, jobs }, jobs.length ? 1800 : 0);
  // Une liste vide (sites injoignables) n'est pas gardée : on réessaiera à la prochaine visite.
  if (cache && jobs.length) {
    const stored = new Response(res.clone().body, res);
    stored.headers.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    const p = cache.put(key, stored).catch(() => undefined);
    if (ctx) ctx.waitUntil(p); else await p;
  }
  return res;
}
