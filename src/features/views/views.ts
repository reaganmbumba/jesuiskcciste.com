import { supabase } from '@/lib/supabase';

/**
 * Compteur de lectures (« 👁 N lectures ») : un total par adresse de page,
 * ou par élément écouté (« /predications/audio/<id> »).
 *
 * Une même personne n'est comptée qu'une fois toutes les 12 heures par page,
 * pour qu'un simple rafraîchissement ne gonfle pas le total.
 * Sans la table en base (SQL pas encore collé), rien n'est affiché.
 */

const RECOUNT_AFTER_MS = 12 * 60 * 60 * 1000;
const STORAGE_PREFIX = 'kcc-lu:';
const VALID_PATH = /^\/[A-Za-z0-9/_.~%:-]{0,299}$/;

/** Adresse de page comparable : sans « / » final ni paramètres. */
export function viewPath(pathname: string): string {
  const p = pathname.split(/[?#]/)[0].replace(/\/+$/, '');
  return p || '/';
}

const counts = new Map<string, number>();
const listeners = new Map<string, Set<(n: number) => void>>();
let pending = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let disabled = false;

function publish(path: string, n: number) {
  counts.set(path, n);
  listeners.get(path)?.forEach((fn) => fn(n));
}

export function subscribeViews(path: string, fn: (n: number) => void): () => void {
  let set = listeners.get(path);
  if (!set) listeners.set(path, (set = new Set()));
  set.add(fn);
  const known = counts.get(path);
  if (known !== undefined) fn(known);
  return () => { set!.delete(fn); };
}

/** Lit les totaux de plusieurs pages en une seule requête (regroupées pendant 30 ms). */
export function requestViews(path: string) {
  if (!supabase || disabled || !VALID_PATH.test(path) || counts.has(path)) return;
  pending.add(path);
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    const paths = [...pending];
    pending = new Set();
    flushTimer = null;
    try {
      const { data, error } = await supabase!.from('page_views').select('path, views').in('path', paths);
      if (error) throw error;
      const found = new Map((data ?? []).map((r) => [r.path as string, Number(r.views)]));
      paths.forEach((p) => { if (!counts.has(p)) publish(p, found.get(p) ?? 0); });
    } catch {
      disabled = true; // table absente : on n'affiche rien
    }
  }, 30);
}

function seenRecently(path: string): boolean {
  try {
    const t = Number(localStorage.getItem(STORAGE_PREFIX + path));
    return Number.isFinite(t) && t > 0 && Date.now() - t < RECOUNT_AFTER_MS;
  } catch {
    return false;
  }
}

function markSeen(path: string) {
  try { localStorage.setItem(STORAGE_PREFIX + path, String(Date.now())); } catch { /* navigation privée */ }
}

const recording = new Set<string>();

/** Compte une lecture de cette page (au plus une fois toutes les 12 h par appareil). */
export async function recordView(path: string) {
  if (!supabase || disabled || !VALID_PATH.test(path) || recording.has(path)) return;
  if (seenRecently(path)) { requestViews(path); return; }
  recording.add(path);
  markSeen(path);
  try {
    const { data, error } = await supabase.rpc('record_page_view', { p_path: path });
    if (error) throw error;
    if (typeof data === 'number' || typeof data === 'string') publish(path, Number(data));
  } catch {
    disabled = true;
  } finally {
    recording.delete(path);
  }
}
