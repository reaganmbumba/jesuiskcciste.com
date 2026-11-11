import { describe, expect, it } from 'vitest';
import { createBoard, findHint, findKccs, letterIndexes, normalizeWord, resolve, revealLetters, stepPoints, swapCells, type Board } from '@/features/games/threeSigns';
import { GAME_WORDS } from '@/content/jeu-trois-signes';

/** Générateur pseudo-aléatoire reproductible. */
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}

describe('jeu des trois signes', () => {
  it('ne reconnaît que K-C-C dans l’ordre Nkanda, Wambote, Wampa', () => {
    const b: Board = [
      [0, 1, 2, 2],
      [1, 0, 0, 1],
      [2, 2, 1, 0],
      [0, 1, 2, 1],
    ];
    const found = findKccs(b);
    // Lignes 0 et 3 (gauche → droite), colonnes 0 et 2 (haut → bas).
    expect(found).toHaveLength(4);
    // L'ordre inverse C-C-K ne compte pas.
    expect(findKccs([[2, 1, 0], [1, 1, 1], [0, 0, 0]])).toHaveLength(0);
  });

  it('crée des grilles sans KCC tout fait, avec au moins un coup', () => {
    for (let i = 1; i < 40; i++) {
      const b = createBoard(seeded(i));
      expect(b).toHaveLength(7);
      expect(findKccs(b)).toHaveLength(0);
      expect(findHint(b)).not.toBeNull();
    }
  });

  it('l’indice donne un échange qui construit un KCC, puis la grille s’écrase et se remplit', () => {
    const rand = seeded(7);
    const b = createBoard(rand);
    const [a, c] = findHint(b)!;
    const swapped = swapCells(b, a, c);
    const steps = resolve(swapped, rand);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].crushed.length).toBeGreaterThanOrEqual(3);
    const last = steps[steps.length - 1].board;
    expect(findKccs(last)).toHaveLength(0);
    expect(last.flat().every((s) => s === 0 || s === 1 || s === 2)).toBe(true);
    expect(stepPoints(steps[0], 0)).toBe(30 * steps[0].kccCount);
    expect(stepPoints({ ...steps[0], kccCount: 1 }, 1)).toBe(60);
  });

  it('découvre les lettres et compare les mots sans accents', () => {
    expect(normalizeWord('Moïse')).toBe('MOISE');
    expect(normalizeWord(' all-knowing ')).toBe('ALLKNOWING');
    expect(letterIndexes('ALL-KNOWING')).toHaveLength(10);
    const r = revealLetters('NKANDA', new Set(), 4, seeded(3));
    expect(r.size).toBe(4);
    expect(revealLetters('NKANDA', r, 9, seeded(3)).size).toBe(6);
  });

  it('a des mots en français, anglais et portugais, avec indice et leçon', () => {
    expect(GAME_WORDS.length).toBeGreaterThanOrEqual(15);
    for (const w of GAME_WORDS) {
      for (const lang of ['fr', 'en', 'pt'] as const) {
        expect(w.word[lang]).toMatch(/^[\p{Lu}-]+$/u);
        expect(w.clue[lang].length).toBeGreaterThan(5);
        expect(w.lesson[lang].length).toBeGreaterThan(5);
      }
    }
    expect(new Set(GAME_WORDS.map((w) => w.family))).toEqual(new Set(['bible', 'attribut', 'foi']));
  });
});
