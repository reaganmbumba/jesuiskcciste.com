/*
 * Service worker de l'application JE SUIS KCCiste (site installé sur le téléphone).
 * - Pages : toujours le réseau d'abord (le site reste à jour), la dernière version
 *   enregistrée sert de secours hors connexion.
 * - Code du site (/assets, noms qui changent à chaque version) : gardé sur le téléphone,
 *   jamais redemandé (économie de données). Icônes et images : gardées, mises à jour en fond.
 * - Mode hors connexion : les sons que la personne a choisi de télécharger (cache
 *   « kcc-hors-ligne », rempli par src/features/offline/offline.ts) sont servis depuis le
 *   téléphone, même au milieu d'un fichier (requêtes Range). Ce cache n'est jamais vidé ici.
 * - Autres sons, vidéos, Supabase et autres sites : jamais interceptés.
 */
const VERSION = 'kcc-v2';
const SHELL = `${VERSION}-pages`;
const STATIC = `${VERSION}-fichiers`;
const OFFLINE = 'kcc-hors-ligne';
const APP_SHELL = '/__page-application';
const PRECACHE = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.svg'];
const SKIP = /^\/(app|audio|videos|livres)\/|\.(mp3|m4a|mpeg|ogg|wav|mp4|webm|pdf|apk|aab)$/i;
const MEDIA = /\.(mp3|m4a|mpeg|mpga|ogg|oga|opus|aac|wav|webm)$|^\/livres\/audio-kccisme\/index\.json$/i;

// Adresses enregistrées pour l'écoute hors ligne (gardées en mémoire, rechargées sur demande de la page).
let savedReady = null;
let saved = null;
function loadSaved() {
  savedReady = caches.open(OFFLINE)
    .then((c) => c.keys())
    .then((keys) => (saved = new Set(keys.map((r) => r.url))))
    .catch(() => (saved = new Set()));
  return savedReady;
}
loadSaved();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'kcc-hors-ligne') event.waitUntil(loadSaved());
});

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION) && k !== OFFLINE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Réponse 206 (morceau demandé) découpée dans le fichier enregistré. */
async function partial(req, res) {
  const blob = await res.blob();
  const size = blob.size;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  let start = 0;
  let end = size - 1;
  if (m && m[1]) { start = Number(m[1]); if (m[2]) end = Math.min(Number(m[2]), size - 1); }
  else if (m && m[2]) start = Math.max(0, size - Number(m[2]));
  if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

async function fromOffline(req) {
  const hit = await caches.match(req.url, { cacheName: OFFLINE });
  if (!hit) return fetch(req);
  return req.headers.has('range') ? partial(req, hit) : hit;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 1. Sons téléchargés pour l'écoute hors ligne (ce site ou stockage Supabase).
  if (saved) {
    if (saved.has(req.url)) { event.respondWith(fromOffline(req)); return; }
  } else if (MEDIA.test(url.pathname)) {
    event.respondWith(savedReady.then((s) => (s.has(req.url) ? fromOffline(req) : fetch(req))));
    return;
  }

  if (req.headers.has('range')) return;
  if (url.origin !== self.location.origin || SKIP.test(url.pathname)) return;

  // 2. Pages : réseau d'abord, la dernière page reçue sert hors connexion.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const a = res.clone();
            const b = res.clone();
            caches.open(SHELL).then((c) => Promise.all([c.put(req, a), c.put(APP_SHELL, b)]));
          }
          return res;
        })
        .catch(async () => (await caches.match(req, { cacheName: SHELL }))
          || (await caches.match(APP_SHELL, { cacheName: SHELL }))
          || (await caches.match('/', { cacheName: SHELL }))
          || Response.error()),
    );
    return;
  }

  // 3. Code du site : chaque nom de fichier ne change jamais de contenu, on ne le redemande pas.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // 4. Icônes, images et polices : gardées, mises à jour en arrière-plan.
  if (/\.(png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(req);
        const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
        if (hit) { event.waitUntil(net.catch(() => {})); return hit; }
        return net;
      }),
    );
  }
});
