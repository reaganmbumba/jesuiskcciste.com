import { buildRound, isRecent, type RadioItem, type RadioMode } from './radio';

/**
 * Antenne commune : comme une vraie radio, tous les auditeurs entendent le même titre
 * au même moment, toute la journée, même hors direct.
 *
 * Il n'y a pas de serveur de diffusion : chaque navigateur calcule la même grille à partir
 * de la même liste de titres et de l'heure. La journée commence à minuit (heure de Kinshasa) ;
 * l'ordre de chaque tour est tiré au sort avec un hasard « fixé » par la date, donc identique
 * pour tout le monde. Celui qui arrive à 14 h 07 entend ce qui passe à 14 h 07, à la seconde près.
 *
 * Les émissions programmées et les directs passent par-dessus cette grille (voir effectiveLive) ;
 * à leur fin, chacun retombe au même endroit de la grille.
 */

/** Kinshasa : UTC+1 toute l'année (pas d'heure d'été). */
const KINSHASA_OFFSET_MS = 3600_000;
const DAY_MS = 86_400_000;
/** Garde-fou : une journée de grille ne compte jamais plus de tours que ça. */
const MAX_ROUNDS = 2000;

/** Un passage dans la grille : tel titre, à telle heure. */
export interface RadioSlot {
  item: RadioItem;
  /** Début du passage (ms depuis 1970). */
  startsAt: number;
  /** Fin du passage (ms depuis 1970). */
  endsAt: number;
}

/** Minuit à Kinshasa pour le jour de `t` (ms depuis 1970). */
export function kinshasaDayStart(t: number): number {
  return Math.floor((t + KINSHASA_OFFSET_MS) / DAY_MS) * DAY_MS - KINSHASA_OFFSET_MS;
}

/** Petit hasard reproductible : la même graine donne la même suite chez tout le monde. */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Titres qui peuvent passer dans la grille : il faut connaître leur durée. Triés pour être identiques partout. */
/**
 * Ce qui passe tout seul entre les émissions : les chants (et le journal, les vocaux).
 * Les prédications ne passent que lorsqu'elles sont programmées — sauf si l'auditeur a
 * choisi lui-même d'écouter « Prédications ».
 */
export function schedulable(items: RadioItem[], mode: RadioMode = 'all'): RadioItem[] {
  return items
    .filter((i) => i.kind !== 'live' && !!i.url && (i.durationSeconds ?? 0) > 0 && (i.kind !== 'sermon' || mode === 'sermons'))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/** Empreinte de la liste : deux auditeurs avec la même empreinte ont la même grille. */
export function scheduleFingerprint(items: RadioItem[], mode: RadioMode): string {
  return `${mode}|${schedulable(items, mode).map((i) => `${i.key}:${Math.round(i.durationSeconds ?? 0)}`).join(',')}`;
}

/**
 * La grille autour de l'instant `now` : le passage en cours, puis les `after` suivants.
 * Vide quand rien ne peut passer.
 */
export function scheduleAt(items: RadioItem[], mode: RadioMode, now: number, after = 3): RadioSlot[] {
  const list = schedulable(items, mode);
  if (!list.length) return [];
  const day = kinshasaDayStart(now);
  const out: RadioSlot[] = [];
  let t = day;
  let last: string | null = null;
  for (let r = 0; r < MAX_ROUNDS; r++) {
    const round = buildRound(list, seededRandom(`${day}|${mode}|${r}`), last, (i) => isRecent(i, day));
    if (!round.length) return out;
    for (const item of round) {
      const end = t + Math.round((item.durationSeconds ?? 0) * 1000);
      if (end > now || out.length) {
        out.push({ item, startsAt: t, endsAt: end });
        if (out.length > after) return out;
      }
      t = end;
      last = item.key;
    }
  }
  return out;
}

/** Où en est le passage en cours (secondes depuis son début). */
export const slotOffset = (slot: RadioSlot, now: number) => Math.max(0, (now - slot.startsAt) / 1000);

/** Jingle de la station : toutes les `everyMs` depuis minuit, le même pour tous (numéro du créneau). */
export function stationSlot(now: number, everyMs: number): number {
  return Math.floor((now - kinshasaDayStart(now)) / everyMs);
}
