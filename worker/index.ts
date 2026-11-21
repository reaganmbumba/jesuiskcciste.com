/**
 * Worker Cloudflare du site : sert les fichiers de dist/ et, pour les robots des
 * réseaux sociaux, ajoute l'aperçu (titre, résumé, photo) des contenus publiés
 * dans Supabase : annonces, événements, projets, formations, prédications audio,
 * profils des Révérends Apôtres et photos de la galerie. Sans photo, l'image habituelle du site reste.
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

import { serveMedia } from './media';
import { handleSouffleur } from './souffleur';
import { findApostleBiography } from '../src/content/apotres-biographies';
import { handleLive } from './live';
import { handleJobs } from './jobs';
import { handleNotifications, runScheduled } from './notifications';

interface Fetcher { fetch(input: Request | string | URL, init?: RequestInit): Promise<Response> }
interface Env { ASSETS: Fetcher; SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string; CALLS_APP_ID?: string; CALLS_APP_SECRET?: string; RELIEFWEB_APPNAME?: string; SUPABASE_SERVICE_KEY?: string; VAPID_PRIVATE_KEY?: string; PUSH_BATCH?: string; PUSH_SUBREQUESTS?: string; ANTHROPIC_API_KEY?: string }

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
const ROUTES: { re: RegExp; table: string; key: 'id' | 'slug'; select: string; filter: string; meta: (r: Row) => Meta | null; where?: (value: string) => string }[] = [
  { re: /^\/actualites\/([^/]+)$/, table: 'announcements', key: 'id', select: 'title,summary,image_url', filter: '&status=eq.published&audience=eq.public', meta: (r) => simple(r.title, r.summary, r.image_url) },
  { re: /^\/agenda\/([^/]+)$/, table: 'events', key: 'id', select: 'title,description,poster_url', filter: '&audience=eq.public', meta: (r) => simple(r.title, r.description, r.poster_url) },
  { re: /^\/solidarite\/projets\/([^/]+)$/, table: 'projects', key: 'slug', select: 'name,summary,image_url', filter: '', meta: (r) => simple(r.name, r.summary, r.image_url) },
  { re: /^\/academie\/formations\/([^/]+)$/, table: 'courses', key: 'slug', select: 'title,summary,cover_url', filter: '&status=eq.published', meta: (r) => simple(r.title, r.summary, r.cover_url) },
  // Prédication audio : photo du prédicateur, son titre, sa paroisse et le passage lu.
  { re: /^\/predications\/audio\/([^/]+)$/, table: 'audio_sermons', key: 'id', select: 'title,preacher_name,preacher_title,parish,bible_text,preacher_photo_url', filter: '&published=eq.true',
    meta: (r) => simple(r.title, [[r.preacher_title, r.preacher_name].filter(Boolean).join(' '), r.parish, r.bible_text].filter(Boolean).join(' · '), r.preacher_photo_url) },
  { re: /^\/apotres\/([^/]+)$/, table: 'apostles', key: 'id', select: 'title,full_name,place,bio,photo_url', filter: '',
    // Sans photo enregistrée, on prend celle de sa biographie (rubrique Biographies des apôtres).
    meta: (r) => {
      const bio = r.full_name ? findApostleBiography(r.full_name) : undefined;
      return simple(r.full_name && `${r.title ?? ''} ${r.full_name}`.trim(), [r.place, r.bio, bio?.sections[0]?.paragraphs[0]?.fr].filter(Boolean).join(' · '), r.photo_url || bio?.image);
    } },
  // Photo de la galerie (table site_content) retrouvée par le nom de son fichier : /galerie/photo/<clé>.
  { re: /^\/galerie\/photo\/([^/]+)$/, table: 'site_content', key: 'slug', select: 'src:data->>src,caption:data->caption->>fr', filter: '&collection=eq.gallery&published=eq.true',
    where: (v) => `data->>src=ilike.*/${v}.*`,
    meta: (r) => simple(r.caption || 'Galerie photo de l’Église', 'Cultes, mamans, temples et archives anciennes de l’Église Bon Nouveau Message.', r.src) },
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
    const api = `${env.SUPABASE_URL}/rest/v1/${r.table}?select=${r.select}&${r.where ? r.where(value) : `${r.key}=eq.${encodeURIComponent(value)}`}${r.filter}&limit=1`;
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

/** Redirige vers le fichier de la dernière version GitHub dont l'étiquette commence par `prefix` (gardé 10 min en cache). */
async function latestApp(prefix: string, file: string): Promise<Response> {
  const fallback = 'https://github.com/reaganmbumba/jesuiskcciste.com/releases';
  const key = new Request(`https://jesuiskcciste.com/__appli/${prefix}${file}`);
  const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
  const hit = cache ? await cache.match(key) : undefined;
  let target = hit ? await hit.text() : '';
  if (!target) {
    try {
      const r = await fetch('https://api.github.com/repos/reaganmbumba/jesuiskcciste.com/releases?per_page=40', { headers: { 'User-Agent': 'jesuiskcciste.com', Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(5000) });
      const list = r.ok ? ((await r.json()) as { tag_name: string; published_at: string; assets: { name: string; browser_download_url: string }[] }[]) : [];
      const rel = list.filter((x) => x.tag_name.startsWith(prefix) && /^\d+$/.test(x.tag_name.slice(prefix.length)) && x.assets.some((a) => a.name === file))
        .sort((a, b) => b.published_at.localeCompare(a.published_at))[0];
      target = rel?.assets.find((a) => a.name === file)?.browser_download_url ?? '';
      if (target && cache) await cache.put(key, new Response(target, { headers: { 'Cache-Control': 'max-age=600' } }));
    } catch { /* GitHub injoignable : page des versions */ }
  }
  return Response.redirect(target || fallback, 302);
}

export default {
  async fetch(request: Request, env: Env, ctx?: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/emplois') return handleJobs(request, env, ctx);
    if (url.pathname === '/api/souffleur') return handleSouffleur(request, env);
    // Dernières versions des applications de la radio (versions GitHub « radio-apk-N », « studio-apk-N », « radio-N »).
    const appli = ({ '/radio/android.apk': ['radio-apk-', 'KCC-Radio.apk'], '/radio/studio.apk': ['studio-apk-', 'KCC-Studio-Radio.apk'], '/radio/windows.exe': ['radio-', 'KCC-Radio-Setup.exe'] } as Record<string, [string, string]>)[url.pathname];
    if (appli) return latestApp(appli[0], appli[1]);
    // Ville et pays approximatifs de l'auditeur (d'après le réseau), pour le compteur du Studio.
    if (url.pathname === '/api/ou') {
      const cf = (request as Request & { cf?: { city?: string; country?: string } }).cf;
      return new Response(JSON.stringify({ city: cf?.city ?? '', country: cf?.country ?? '' }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    }
    const push = /^\/api\/notifications\/([a-z]+)$/.exec(url.pathname);
    if (push) return handleNotifications(request, env, push[1]);
    // Émissions de la radio : lecture par morceaux, pour rejoindre le direct en cours de route
    if (url.pathname.startsWith('/radio/emissions/') || url.pathname.startsWith('/audio/') || url.pathname.startsWith('/predications/')) return serveMedia(request, env.ASSETS);
    const live = /^\/api\/live\/(publish|watch|answer|call)$/.exec(url.pathname);
    if (live) return handleLive(request, env, live[1]);
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

  /** Toutes les minutes : notifications des directs, communiqués et prédications (worker/notifications.ts). */
  async scheduled(_event: unknown, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    ctx.waitUntil(runScheduled(env));
  },
};
