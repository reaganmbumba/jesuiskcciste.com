/**
 * Progression du parcours néophyte, gardée sur le téléphone (localStorage) :
 * pas de compte ni de base de données, et cela marche même hors connexion.
 */
import { NEOPHYTE_LESSONS, PASS_MARK } from '@/content/parcours-neophyte';

const KEY = 'kcc-parcours-neophyte';

export interface LessonResult { score: number; at: string }
export interface NeophyteProgress {
  lessons: Record<number, LessonResult>;
  name: string;
  parish: string;
  mentor: string;
  /** Date de la fin du parcours (12 leçons réussies), ISO. */
  doneAt?: string;
}

const EMPTY: NeophyteProgress = { lessons: {}, name: '', parish: '', mentor: '' };

export function readProgress(): NeophyteProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as Partial<NeophyteProgress>;
    return { ...EMPTY, ...p, lessons: p.lessons && typeof p.lessons === 'object' ? p.lessons : {} };
  } catch {
    return { ...EMPTY };
  }
}

export function writeProgress(p: NeophyteProgress) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* navigation privée */ }
}

export function clearProgress() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export const isPassed = (p: NeophyteProgress, n: number) => (p.lessons[n]?.score ?? 0) >= PASS_MARK;
export const passedCount = (p: NeophyteProgress) => NEOPHYTE_LESSONS.filter((l) => isPassed(p, l.n)).length;
export const allPassed = (p: NeophyteProgress) => passedCount(p) === NEOPHYTE_LESSONS.length;

/** Enregistre le meilleur score d'une leçon et date la fin du parcours. */
export function recordLesson(p: NeophyteProgress, n: number, score: number): NeophyteProgress {
  const prev = p.lessons[n];
  const lessons = prev && prev.score >= score ? p.lessons : { ...p.lessons, [n]: { score, at: new Date().toISOString() } };
  const next: NeophyteProgress = { ...p, lessons };
  if (!next.doneAt && allPassed(next)) next.doneAt = new Date().toISOString();
  return next;
}

/** Mélange stable (même ordre pour une même graine). */
export function shuffled<T>(items: T[], seed: number): { item: T; index: number }[] {
  const out = items.map((item, index) => ({ item, index }));
  let s = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
