/**
 * Logique du « Jeu des trois balles » : des tubes de 3 places remplis de balles
 * portant les trois signes K (Nkanda), C (Wambote) et C (Wampa). On déplace la
 * balle du haut d'un tube vers un autre tube qui a de la place. Dès qu'un tube
 * se lit K-C-C de bas en haut (Nkanda au fond, puis Wambote, puis Wampa), il
 * s'écrase et rapporte des points. Le niveau est gagné quand tout est écrasé.
 * Module pur (sans React), testé dans src/test/threeBalls.test.ts.
 */
import type { Sign } from './threeSigns';

/** Chaque tube : du fond (index 0) vers le haut. */
export type Tubes = Sign[][];

export const CAPACITY = 3;
export const POINTS_PER_TUBE = 50;

export type Rand = () => number;

const isKccTube = (t: Sign[]) => t.length === CAPACITY && t[0] === 0 && t[1] === 1 && t[2] === 2;

export const cloneTubes = (tubes: Tubes): Tubes => tubes.map((t) => [...t]);

/** Peut-on déplacer la balle du haut de `from` vers `to` ? */
export function canMove(tubes: Tubes, from: number, to: number): boolean {
  return from !== to && tubes[from]?.length > 0 && (tubes[to]?.length ?? CAPACITY) < CAPACITY;
}

/** Résultat d'un déplacement : les tubes après coup, et ceux qui se sont écrasés. */
export interface MoveResult {
  tubes: Tubes;
  crushed: number[];
}

export function move(tubes: Tubes, from: number, to: number): MoveResult {
  if (!canMove(tubes, from, to)) return { tubes, crushed: [] };
  const next = cloneTubes(tubes);
  next[to].push(next[from].pop() as Sign);
  const crushed = next.flatMap((t, i) => (isKccTube(t) ? [i] : []));
  for (const i of crushed) next[i] = [];
  return { tubes: next, crushed };
}

export const isCleared = (tubes: Tubes) => tubes.every((t) => t.length === 0);

/** Nombre de KCC (et donc de tubes pleins) d'un niveau : 2 au niveau 1, puis +1 tous les deux niveaux, jusqu'à 7. */
export const setsForLevel = (level: number) => Math.min(7, 2 + Math.floor(level / 2));
/** Tubes vides en plus : 2 au début, 1 seul à partir de 6 KCC pour corser. */
export const emptyTubesFor = (sets: number) => (sets >= 6 ? 1 : 2);

const key = (tubes: Tubes) => tubes.map((t) => t.join('')).sort().join('|');

/**
 * Une suite de coups qui écrase tout (recherche en profondeur, les coups qui
 * écrasent un tube d'abord ; les tubes sont interchangeables, d'où le tri dans
 * la clé). null si impossible, undefined si la recherche est trop longue.
 */
export function solve(tubes: Tubes, maxStates = 200000): [number, number][] | null | undefined {
  const seen = new Set<string>();
  let budgetHit = false;
  const path: [number, number][] = [];
  const dfs = (cur: Tubes): boolean => {
    if (isCleared(cur)) return true;
    const k = key(cur);
    if (seen.has(k)) return false;
    if (seen.size >= maxStates) { budgetHit = true; return false; }
    seen.add(k);
    const moves: { a: number; b: number; score: number; next: Tubes }[] = [];
    for (let a = 0; a < cur.length; a++) {
      for (let b = 0; b < cur.length; b++) {
        if (!canMove(cur, a, b)) continue;
        // Déplacer la seule balle d'un tube vers un tube vide ne sert à rien.
        if (cur[b].length === 0 && cur[a].length === 1) continue;
        const r = move(cur, a, b);
        const target = r.tubes[b];
        // Priorité : écraser, puis poser sur un début de KCC correct.
        const good = target.every((s, i) => s === i);
        moves.push({ a, b, next: r.tubes, score: r.crushed.length * 10 + (good ? 2 : 0) - (cur[b].length === 0 ? 1 : 0) });
      }
    }
    moves.sort((x, y) => y.score - x.score);
    for (const m of moves) {
      path.push([m.a, m.b]);
      if (dfs(m.next)) return true;
      path.pop();
    }
    return false;
  };
  if (dfs(tubes)) return path;
  return budgetHit ? undefined : null;
}

export const isSolvable = (tubes: Tubes) => Array.isArray(solve(tubes));

/** Un niveau mélangé, sans tube déjà KCC, et qu'on peut terminer. */
export function createLevel(sets: number, rand: Rand = Math.random): Tubes {
  for (let attempt = 0; attempt < 200; attempt++) {
    const balls: Sign[] = [];
    for (let i = 0; i < sets; i++) balls.push(0, 1, 2);
    for (let i = balls.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [balls[i], balls[j]] = [balls[j], balls[i]];
    }
    const tubes: Tubes = [];
    for (let i = 0; i < sets; i++) tubes.push(balls.slice(i * CAPACITY, i * CAPACITY + CAPACITY));
    for (let i = 0; i < emptyTubesFor(sets); i++) tubes.push([]);
    if (tubes.some(isKccTube)) continue;
    if (isSolvable(tubes)) return tubes;
  }
  // Repli : chaque tube à l'envers (Wampa, Wambote, Nkanda), toujours faisable avec un tube vide.
  return [...Array.from({ length: sets }, () => [2, 1, 0] as Sign[]), [], []];
}

/** Un coup utile pour l'indice : le premier coup d'une solution, sinon un coup qui écrase un tube. */
export function findHint(tubes: Tubes): [number, number] | null {
  const path = solve(tubes);
  if (path && path.length > 0) return path[0];
  for (let a = 0; a < tubes.length; a++) {
    for (let b = 0; b < tubes.length; b++) {
      if (canMove(tubes, a, b) && move(tubes, a, b).crushed.length > 0) return [a, b];
    }
  }
  return null;
}
