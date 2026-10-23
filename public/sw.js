/*
 * Service worker de l'application JE SUIS KCCiste (site installé sur le téléphone).
 * - Pages : toujours le réseau d'abord (le site reste à jour), la dernière version
 *   enregistrée sert de secours hors connexion.
 * - Fichiers du site (/assets, icônes, images) : gardés sur le téléphone pour ouvrir plus vite.
 * - Sons, vidéos, Supabase et autres sites : jamais interceptés.
 */
const VERSION = 'kcc-v1';
const SHELL = `${VERSION}-pages`;
const STATIC = `${VERSION}-fichiers`;
const PRECACHE = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.svg'];
const SKIP = /^\/(app|audio|videos|livres)\/|\.(mp3|m4a|mpeg|ogg|wav|mp4|webm|pdf|apk|aab)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || SKIP.test(url.pathname)) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(SHELL).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/')) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/') || /\.(png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname)) {
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
