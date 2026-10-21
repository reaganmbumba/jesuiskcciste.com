/**
 * Worker Cloudflare du site : sert les fichiers de dist/ et, pour les robots des
 * réseaux sociaux, ajoute l'aperçu (titre, résumé, photo) des contenus publiés
 * dans Supabase : annonces, événements, projets et formations.
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

/** Rubrique → table Supabase, colonne de recherche et colonnes de l'aperçu. */
const ROUTES: { re: RegExp; table: string; key: 'id' | 'slug'; title: string; description: string; image: string; filter: string }[] = [
  { re: /^\/actualites\/([^/]+)$/, table: 'announcements', key: 'id', title: 'title', description: 'summary', image: 'image_url', filter: '&status=eq.published&audience=eq.public' },
  { re: /^\/agenda\/([^/]+)$/, table: 'events', key: 'id', title: 'title', description: 'description', image: 'poster_url', filter: '&audience=eq.public' },
  { re: /^\/solidarite\/projets\/([^/]+)$/, table: 'projects', key: 'slug', title: 'name', description: 'summary', image: 'image_url', filter: '' },
  { re: /^\/academie\/formations\/([^/]+)$/, table: 'courses', key: 'slug', title: 'title', description: 'summary', image: 'cover_url', filter: '&status=eq.published' },
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;

async function findMeta(url: URL, env: Env): Promise<Meta | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  for (const r of ROUTES) {
    const m = r.re.exec(url.pathname);
    if (!m) continue;
    const value = decodeURIComponent(m[1]);
    if (!(r.key === 'id' ? UUID : SLUG).test(value)) return null;
    const api = `${env.SUPABASE_URL}/rest/v1/${r.table}?select=${r.title},${r.description},${r.image}&${r.key}=eq.${encodeURIComponent(value)}${r.filter}&limit=1`;
    const res = await fetch(api, {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Record<string, string | null>[];
    const row = rows[0];
    if (!row?.[r.title]) return null;
    return { title: row[r.title]!, description: row[r.description] ?? '', image: row[r.image] ?? null };
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
