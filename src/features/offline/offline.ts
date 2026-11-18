import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Mode hors connexion : la personne choisit ce qu'elle garde sur son téléphone
 * (livre audio « Le KCCisme », chants gratuits de KCC Music, recueil de cantiques).
 *
 * - Rien n'est téléchargé sans un geste de la personne, et la taille est affichée avant.
 * - Les fichiers vont dans le Cache Storage « kcc-hors-ligne » : public/sw.js les sert
 *   (avec la reprise au milieu d'un fichier) quand il n'y a pas internet, et il ne vide
 *   jamais ce cache lors d'une mise à jour du site.
 * - La liste (titres, tailles) est gardée dans localStorage ; elle est recalée sur le
 *   contenu réel du cache à chaque lecture.
 * - Le texte du livre écrit (chiffré, protégé par un code) n'est jamais mis ici.
 */

export const OFFLINE_CACHE = 'kcc-hors-ligne';
const LIST_KEY = 'kcc.horsligne';

export type OfflineKind = 'livre' | 'chant' | 'recueil';

export interface OfflineItem {
  /** Adresse complète du fichier (clé du cache). */
  url: string;
  title: string;
  kind: OfflineKind;
  /** Nom du groupe affiché, ex. « Le KCCisme (livre audio) » ou le nom de l'artiste. */
  group?: string;
  /** Page où retrouver l'élément en ligne. */
  page?: string;
  bytes: number;
  seconds?: number;
  savedAt: number;
  /** Fichiers techniques gardés avec l'élément (ex. sommaire du livre audio). */
  extra?: string[];
}

export const offlineSupported = () => typeof window !== 'undefined' && 'caches' in window && 'serviceWorker' in navigator;

export const absolute = (url: string) => new URL(url, window.location.origin).href;

// ——— Liste observable (pour rafraîchir tous les boutons en même temps) ———
let items: OfflineItem[] = read();
const listeners = new Set<() => void>();
function read(): OfflineItem[] {
  try { const v = JSON.parse(localStorage.getItem(LIST_KEY) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function write(next: OfflineItem[]) {
  items = next;
  try { localStorage.setItem(LIST_KEY, JSON.stringify(next)); } catch { /* stockage indisponible */ }
  listeners.forEach((l) => l());
  // Le service worker garde en mémoire la liste des fichiers enregistrés : on le prévient.
  navigator.serviceWorker?.ready.then((r) => r.active?.postMessage({ type: 'kcc-hors-ligne' })).catch(() => {});
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useOfflineItems(): OfflineItem[] {
  return useSyncExternalStore(subscribe, () => items, () => items);
}

export const isSaved = (url: string) => items.some((i) => i.url === absolute(url));

/** Retire de la liste ce qui n'est plus dans le cache (téléphone nettoyé, etc.). */
export async function reconcile() {
  if (!offlineSupported()) return;
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const keys = new Set((await cache.keys()).map((r) => r.url));
    const kept = items.filter((i) => i.kind === 'recueil' || keys.has(i.url));
    if (kept.length !== items.length) write(kept);
  } catch { /* cache indisponible */ }
}

// ——— Tailles ———
const sizes = new Map<string, number>();
/** Taille d'un fichier en octets, demandée au serveur sans le télécharger (requête HEAD). */
export async function remoteSize(url: string): Promise<number | null> {
  const key = absolute(url);
  if (sizes.has(key)) return sizes.get(key)!;
  try {
    const res = await fetch(key, { method: 'HEAD' });
    const n = Number(res.headers.get('content-length'));
    if (res.ok && n > 0) { sizes.set(key, n); return n; }
  } catch { /* hors connexion */ }
  return null;
}

export function formatBytes(n: number, locale = 'fr') {
  const dec = locale === 'en' ? '.' : ',';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} ${locale === 'en' ? 'KB' : 'Ko'}`;
  const mb = n / (1024 * 1024);
  return `${(mb < 10 ? mb.toFixed(1) : String(Math.round(mb))).replace('.', dec)} ${locale === 'en' ? 'MB' : 'Mo'}`;
}

// ——— Téléchargement ———
const running = new Map<string, { progress: number; listeners: Set<(p: number) => void>; abort: AbortController }>();

/** Progression (0 à 1) d'un téléchargement en cours, ou null. */
export function useDownloadProgress(url: string): number | null {
  const key = absolute(url);
  const [p, setP] = useState<number | null>(() => running.get(key)?.progress ?? null);
  useEffect(() => {
    const job = running.get(key);
    setP(job?.progress ?? null);
    if (!job) return subscribe(() => setP(running.get(key)?.progress ?? null));
    const l = (v: number) => setP(v);
    job.listeners.add(l);
    const off = subscribe(() => setP(running.get(key)?.progress ?? null));
    return () => { job.listeners.delete(l); off(); };
  }, [key]);
  return p;
}

async function persist() {
  try { if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch { /* facultatif */ }
}

async function putFile(cache: Cache, url: string, signal: AbortSignal, onProgress: (p: number) => void): Promise<number> {
  const res = await fetch(url, { signal, cache: 'no-store' });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    if (total) onProgress(Math.min(0.99, got / total));
  }
  const type = res.headers.get('content-type') || 'audio/mpeg';
  const blob = new Blob(chunks as BlobPart[], { type });
  await cache.put(url, new Response(blob, { headers: { 'Content-Type': type, 'Content-Length': String(blob.size), 'Accept-Ranges': 'bytes' } }));
  return blob.size;
}

/** Télécharge un fichier sur le téléphone et l'ajoute à la liste. */
export async function saveOffline(item: Omit<OfflineItem, 'savedAt' | 'bytes' | 'url'> & { url: string; bytes?: number }): Promise<void> {
  if (!offlineSupported()) throw new Error('unsupported');
  const url = absolute(item.url);
  if (running.has(url)) return;
  const job = { progress: 0, listeners: new Set<(p: number) => void>(), abort: new AbortController() };
  running.set(url, job);
  listeners.forEach((l) => l());
  void persist();
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const extra = (item.extra ?? []).map(absolute);
    for (const e of extra) if (!(await cache.match(e))) await putFile(cache, e, job.abort.signal, () => {});
    const bytes = await putFile(cache, url, job.abort.signal, (p) => { job.progress = p; job.listeners.forEach((l) => l(p)); });
    write([...items.filter((i) => i.url !== url), { ...item, url, extra, bytes, savedAt: Date.now() }]);
  } finally {
    running.delete(url);
    listeners.forEach((l) => l());
  }
}

export function cancelDownload(url: string) { running.get(absolute(url))?.abort.abort(); }

/** Garde une page de textes (ex. le recueil de cantiques) : sa page et son code sont mis en réserve par le service worker. */
export function keepPage(item: Omit<OfflineItem, 'savedAt'>) {
  write([...items.filter((i) => i.url !== absolute(item.url)), { ...item, url: absolute(item.url), savedAt: Date.now() }]);
  void persist();
  void warmPages();
}

export async function removeOffline(url: string) {
  const key = absolute(url);
  const gone = items.find((i) => i.url === key);
  const rest = items.filter((i) => i.url !== key);
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.delete(key);
    // Un fichier technique (sommaire) n'est retiré que si plus aucun élément n'en a besoin.
    for (const e of gone?.extra ?? []) if (!rest.some((i) => i.extra?.includes(e))) await cache.delete(e);
  } catch { /* déjà parti */ }
  write(rest);
}

export async function removeAll() {
  try { await caches.delete(OFFLINE_CACHE); } catch { /* rien */ }
  write([]);
}

/** Place occupée et place libre sur le téléphone (estimation du navigateur). */
export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    return e?.quota ? { usage: e.usage ?? 0, quota: e.quota } : null;
  } catch { return null; }
}

// ——— Pages à garder prêtes ———
/**
 * Les pages du site sont découpées en morceaux de code. Quand la personne a des
 * téléchargements, on charge (une fois, en connexion) le code des pages utiles hors
 * ligne : le service worker le garde, et ces pages s'ouvrent ensuite sans internet.
 * Après une mise à jour du site, seuls les morceaux changés sont rechargés.
 */
export async function warmPages() {
  if (!items.length || !navigator.onLine) return;
  const kinds = new Set(items.map((i) => i.kind));
  const jobs: Promise<unknown>[] = [import('@/pages/public/OfflinePage')];
  if (kinds.has('livre')) jobs.push(import('@/pages/public/KccismeBookPage'));
  if (kinds.has('recueil')) jobs.push(import('@/pages/public/HymnalPage'));
  if (kinds.has('chant')) jobs.push(import('@/pages/music/MusicPage'));
  await Promise.allSettled(jobs);
}

// ——— État de la connexion ———
const onlineSub = (l: () => void) => {
  window.addEventListener('online', l);
  window.addEventListener('offline', l);
  return () => { window.removeEventListener('online', l); window.removeEventListener('offline', l); };
};
export function useOnline() {
  return useSyncExternalStore(onlineSub, () => navigator.onLine, () => true);
}

/** Au démarrage : recale la liste, puis prépare les pages hors ligne quand le site est au repos. */
export function setupOffline() {
  if (!offlineSupported()) return;
  const idle = (cb: () => void) => ('requestIdleCallback' in window ? window.requestIdleCallback(cb, { timeout: 8000 }) : setTimeout(cb, 4000));
  window.addEventListener('load', () => idle(() => { void reconcile().then(warmPages); }));
  window.addEventListener('online', () => idle(() => void warmPages()));
}
