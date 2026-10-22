/**
 * Worker Cloudflare du site : sert les fichiers de dist/ et, pour les robots des
 * réseaux sociaux, ajoute l'aperçu (titre, résumé, photo) des contenus publiés
 * dans Supabase : annonces, événements, projets, formations, prédications audio
 * et profils des Révérends Apôtres. Sans photo, l'image habituelle du site reste.
 *
 * Les navigateurs ne passent pas par ici : en mode « single-page-application »,
 * Cloudflare leur sert index.html directement. Le Worker n'est appelé que pour
 * les requêtes qui ne sont pas des navigations (c'est le cas des robots de
 * Facebook, WhatsApp, Instagram ou X) et qui ne correspondent à aucun fichier.
 * Le contenu de base (src/content/editorial.ts) a déjà ses pages statiques,
 * générées au build par scripts/prerender-meta.ts.
 *
 * En cas d'erreur ou de contenu introuvable, on sert le site normalement.
 */

interface Fetcher { fetch(input: Request | string | URL, init?: RequestInit): Promise<Response> }
interface Env { ASSETS: Fetcher; SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string }

/* Types minimaux de l'API HTMLRewriter du runtime Workers. */
interface ElementLike { setAttribute(name: string, value: string): void; setInnerContent(content: string): void; remove(): void }
declare class HTMLRewriter {
  on(selector: string, handler: { element(el: ElementLike): void }): HTMLRewriter;
  transform(response: Response): Response;
}

const NAME = 'JE SUIS KCCiste';

interface Meta { title: string; description: string; image: string | null }

type Row = Record<string, string | null>;

/** Rubrique → table Supabase, colonne de recherche, colonnes lues et aperçu construit à partir de la ligne. */
const ROUTES: { re: RegExp; table: string; key: 'id' | 'slug'; select: string; filter: string; meta: (r: Row) => Meta | null }[] = [
  { re: /^\/actualites\/([^/]+)$/, table: 'announcements', key: 'id', select: 'title,summary,image_url', filter: '&status=eq.published&audience=eq.public', meta: (r) => simple(r.title, r.summary, r.image_url) },
  { re: /^\/agenda\/([^/]+)$/, table: 'events', key: 'id', select: 'title,description,poster_url', filter: '&audience=eq.public', meta: (r) => simple(r.title, r.description, r.poster_url) },
  { re: /^\/solidarite\/projets\/([^/]+)$/, table: 'projects', key: 'slug', select: 'name,summary,image_url', filter: '', meta: (r) => simple(r.name, r.summary, r.image_url) },
  { re: /^\/academie\/formations\/([^/]+)$/, table: 'courses', key: 'slug', select: 'title,summary,cover_url', filter: '&status=eq.published', meta: (r) => simple(r.title, r.summary, r.cover_url) },
  // Prédication audio : photo du prédicateur, son titre, sa paroisse et le passage lu.
  { re: /^\/predications\/audio\/([^/]+)$/, table: 'audio_sermons', key: 'id', select: 'title,preacher_name,preacher_title,parish,bible_text,preacher_photo_url', filter: '&published=eq.true',
    meta: (r) => simple(r.title, [[r.preacher_title, r.preacher_name].filter(Boolean).join(' '), r.parish, r.bible_text].filter(Boolean).join(' · '), r.preacher_photo_url) },
  { re: /^\/apotres\/([^/]+)$/, table: 'apostles', key: 'id', select: 'title,full_name,place,bio,photo_url', filter: '',
    meta: (r) => simple(r.full_name && `${r.title ?? ''} ${r.full_name}`.trim(), [r.place, r.bio].filter(Boolean).join(' · '), r.photo_url) },
];

function simple(title: string | null | undefined, description: string | null | undefined, image: string | null | undefined): Meta | null {
  return title ? { title, description: description ?? '', image: image ?? null } : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;

async function findMeta(url: URL, env: Env): Promise<Meta | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  for (const r of ROUTES) {
    const m = r.re.exec(url.pathname);
    if (!m) continue;
    const value = decodeURIComponent(m[1]);
    if (!(r.key === 'id' ? UUID : SLUG).test(value)) return null;
    const api = `${env.SUPABASE_URL}/rest/v1/${r.table}?select=${r.select}&${r.key}=eq.${encodeURIComponent(value)}${r.filter}&limit=1`;
    const res = await fetch(api, {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Row[];
    return rows[0] ? r.meta(rows[0]) : null;
  }
  return null;
}

function withMeta(page: Response, meta: Meta, url: URL): Response {
  const desc = meta.description.replace(/\s+/g, ' ').trim().slice(0, 300);
  // Les réseaux sociaux n'affichent pas les SVG : on garde alors l'image du site.
  const image = meta.image && !/\.svg(\?|$)/i.test(meta.image) ? new URL(meta.image, `https://${url.host}`).toString() : null;
  const set = (selector: string, value: string) => ({ selector, handler: { element: (el: ElementLike) => el.setAttribute('content', value) } });
  const rules = [
    set('meta[name="description"]', desc),
    set('meta[property="og:title"]', meta.title),
    set('meta[property="og:description"]', desc),
    set('meta[property="og:url"]', url.origin + url.pathname),
    set('meta[name="twitter:title"]', meta.title),
    set('meta[name="twitter:description"]', desc),
  ];
  if (image) {
    rules.push(set('meta[property="og:image"]', image), set('meta[name="twitter:image"]', image), set('meta[property="og:image:alt"]', meta.title), set('meta[property="og:type"]', 'article'));
  }
  let rw = new HTMLRewriter()
    .on('title', { element: (el) => el.setInnerContent(`${meta.title} — ${NAME}`) })
    .on('link[rel="canonical"]', { element: (el) => el.setAttribute('href', url.origin + url.pathname) });
  // Les dimensions de l'image par défaut ne valent pas pour la photo du contenu.
  if (image) rw = rw.on('meta[property="og:image:width"], meta[property="og:image:height"]', { element: (el) => el.remove() });
  for (const r of rules) rw = rw.on(r.selector, r.handler);
  const res = rw.transform(page);
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(res.body, { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'GET') {
      try {
        const meta = await findMeta(url, env);
        if (meta) {
          const page = await env.ASSETS.fetch(new Request(new URL('/', url), { headers: request.headers }));
          if (page.ok) return withMeta(page, meta, url);
        }
      } catch {
        /* Supabase indisponible : on sert la page sans aperçu particulier. */
      }
    }
    return env.ASSETS.fetch(request);
  },
};
