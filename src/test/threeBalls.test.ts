import { describe, expect, it } from 'vitest';
import { canMove, createLevel, findHint, isCleared, move, setsForLevel, solve, type Tubes } from '@/features/games/threeBalls';

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}

describe('jeu des trois balles', () => {
  it('écrase un tube dès qu’il se lit K-C-C de bas en haut', () => {
    const t: Tubes = [[0, 1], [2], []];
    const r = move(t, 1, 0);
    expect(r.crushed).toEqual([0]);
    expect(r.tubes[0]).toEqual([]);
    // L'ordre inverse ne s'écrase pas.
    expect(move([[2, 1], [0], []], 1, 0).crushed).toEqual([]);
  });

  it('refuse de poser dans un tube plein ou de prendre dans un tube vide', () => {
    const t: Tubes = [[2, 2, 1], [0], []];
    expect(canMove(t, 1, 0)).toBe(false);
    expect(canMove(t, 2, 1)).toBe(false);
    expect(canMove(t, 0, 2)).toBe(true);
  });

  it('crée des niveaux mélangés qu’on peut terminer', () => {
    for (let level = 0; level < 12; level++) {
      const sets = setsForLevel(level);
      const t = createLevel(sets, seeded(level + 1));
      expect(t.flat()).toHaveLength(sets * 3);
      const path = solve(t);
      expect(Array.isArray(path)).toBe(true);
      // Rejouer la solution écrase tout.
      let cur = t;
      for (const [a, b] of path as [number, number][]) cur = move(cur, a, b).tubes;
      expect(isCleared(cur)).toBe(true);
    }
  });

  it('l’indice donne un coup permis', () => {
    const t = createLevel(3, seeded(9));
    const h = findHint(t);
    expect(h).not.toBeNull();
    expect(canMove(t, h![0], h![1])).toBe(true);
  });
});
