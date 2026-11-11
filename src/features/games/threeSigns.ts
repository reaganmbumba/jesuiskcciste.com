/**
 * Logique du « Jeu des trois signes » : une grille faite uniquement des trois
 * signes prophétiques K, C, C (Nkanda, Wambote, Wampa). On échange deux signes
 * voisins ; dès qu'une ligne se lit K-C-C (de gauche à droite) ou une colonne
 * K-C-C (de haut en bas), les trois signes s'écrasent et rapportent des points.
 * Le module est pur (aucun React) pour être testé facilement.
 */

/** 0 = K (Nkanda, message), 1 = C (Wambote, bon), 2 = C (Wampa, nouveau). */
export type Sign = 0 | 1 | 2;
export type Board = Sign[][];
export type Cell = readonly [row: number, col: number];

export const SIZE = 7;
/** L'ordre à construire : le MESSAGE puis ses deux qualités, BON et NOUVEAU. */
export const KCC: readonly Sign[] = [0, 1, 2];
export const POINTS_PER_KCC = 30;

export type Rand = () => number;

const randomSign = (rand: Rand): Sign => Math.floor(rand() * 3) as Sign;

/** Vrai si les trois signes se lisent K, C (Wambote), C (Wampa). */
const isKcc = (a: Sign | undefined, b: Sign | undefined, c: Sign | undefined) => a === 0 && b === 1 && c === 2;

/** Chaque KCC trouvé : ses trois cases. Un même signe peut servir à deux KCC (ligne et colonne). */
export function findKccs(board: Board): Cell[][] {
  const found: Cell[][] = [];
  const n = board.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (c + 2 < n && isKcc(board[r][c], board[r][c + 1], board[r][c + 2])) found.push([[r, c], [r, c + 1], [r, c + 2]]);
      if (r + 2 < n && isKcc(board[r][c], board[r + 1]?.[c], board[r + 2]?.[c])) found.push([[r, c], [r + 1, c], [r + 2, c]]);
    }
  }
  return found;
}

/** Grille de départ sans aucun KCC déjà formé, avec au moins un coup possible. */
export function createBoard(rand: Rand = Math.random, size = SIZE): Board {
  for (let attempt = 0; attempt < 50; attempt++) {
    const board: Board = [];
    for (let r = 0; r < size; r++) {
      const row: Sign[] = [];
      board.push(row);
      for (let c = 0; c < size; c++) {
        let s = randomSign(rand);
        // On retire le signe qui fermerait un KCC (seul le Wampa peut en fermer un).
        while (s === 2 && ((c >= 2 && row[c - 2] === 0 && row[c - 1] === 1) || (r >= 2 && board[r - 2][c] === 0 && board[r - 1][c] === 1))) {
          s = randomSign(rand);
        }
        row.push(s);
      }
    }
    if (findHint(board)) return board;
  }
  // Repli très improbable : une grille fixe qui a un coup.
  return Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => ((r + c * 2) % 3) as Sign));
}

export const cloneBoard = (b: Board): Board => b.map((row) => [...row]);

export const areNeighbours = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

export function swapCells(board: Board, a: Cell, b: Cell): Board {
  const next = cloneBoard(board);
  next[a[0]][a[1]] = board[b[0]][b[1]];
  next[b[0]][b[1]] = board[a[0]][a[1]];
  return next;
}

/** Un échange qui construit au moins un KCC, ou null s'il n'y en a aucun. */
export function findHint(board: Board): [Cell, Cell] | null {
  const n = board.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const a: Cell = [r, c];
      for (const b of [[r, c + 1], [r + 1, c]] as Cell[]) {
        if (b[0] >= n || b[1] >= n || board[r][c] === board[b[0]][b[1]]) continue;
        if (findKccs(swapCells(board, a, b)).length > 0) return [a, b];
      }
    }
  }
  return null;
}

/** Une étape d'écrasement : les cases écrasées, puis la grille après chute et remplissage. */
export interface CrushStep {
  crushed: Cell[];
  kccCount: number;
  /** Cases qui ont reçu un nouveau signe ou un signe tombé d'en haut. */
  moved: Cell[];
  board: Board;
}

/** Écrase les KCC, fait tomber les signes, remplit par le haut et recommence (cascades). */
export function resolve(board: Board, rand: Rand = Math.random): CrushStep[] {
  const steps: CrushStep[] = [];
  let current = board;
  const n = board.length;
  for (let guard = 0; guard < 30; guard++) {
    const kccs = findKccs(current);
    if (kccs.length === 0) break;
    const crushedKeys = new Set(kccs.flat().map(([r, c]) => `${r}:${c}`));
    const crushed = [...crushedKeys].map((k) => k.split(':').map(Number) as unknown as Cell);
    const next: Board = Array.from({ length: n }, () => new Array<Sign>(n));
    const moved: Cell[] = [];
    for (let c = 0; c < n; c++) {
      const kept: Sign[] = [];
      for (let r = n - 1; r >= 0; r--) if (!crushedKeys.has(`${r}:${c}`)) kept.push(current[r][c]);
      let fromBottom = 0;
      for (let r = n - 1; r >= 0; r--, fromBottom++) {
        const s = fromBottom < kept.length ? kept[fromBottom] : randomSign(rand);
        next[r][c] = s;
        if (fromBottom >= kept.length || s !== current[r][c] || crushedKeys.has(`${r}:${c}`)) moved.push([r, c]);
      }
    }
    steps.push({ crushed, kccCount: kccs.length, moved, board: next });
    current = next;
  }
  return steps;
}

/** Points d'une étape : 30 par KCC, multipliés par le rang de la cascade (×1, ×2, ×3…). */
export const stepPoints = (step: CrushStep, index: number) => step.kccCount * POINTS_PER_KCC * (index + 1);

/** Lettres comparables : majuscules sans accents ni espaces. */
export function normalizeWord(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
}

/** Positions des lettres à découvrir (les espaces et tirets restent visibles). */
export const letterIndexes = (word: string) => [...word].flatMap((ch, i) => (/\p{L}/u.test(ch) ? [i] : []));

/** Découvre `count` lettres encore cachées, au hasard. */
export function revealLetters(word: string, revealed: ReadonlySet<number>, count: number, rand: Rand = Math.random): Set<number> {
  const next = new Set(revealed);
  const hidden = letterIndexes(word).filter((i) => !next.has(i));
  for (let k = 0; k < count && hidden.length > 0; k++) {
    const pick = Math.floor(rand() * hidden.length);
    next.add(hidden.splice(pick, 1)[0]);
  }
  return next;
}

/** Coups accordés pour un mot : une lettre par coup, plus une marge. */
export const movesForWord = (word: string) => letterIndexes(word).length + 5;
