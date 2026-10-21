import { describe, expect, it } from 'vitest';
import { parseApostleList, sortApostles } from '@/features/apostles/apostles';

describe('Liste des apôtres', () => {
  it('lit une liste collée : numéros, titre et décès', () => {
    const rows = parseApostleList('1. Révérend Apôtre NZUZI Paul (en vie)\n2) MBAKI Jean (+)\n\n- Apôtre LUTETE Marc', 10);
    expect(rows.map((r) => [r.fullName, r.status, r.sortOrder])).toEqual([
      ['NZUZI Paul', 'living', 11],
      ['MBAKI Jean', 'deceased', 12],
      ['LUTETE Marc', 'unknown', 13],
    ]);
  });

  it('trie par ordre puis par nom', () => {
    const base = { title: 'Révérend Apôtre', status: 'living' as const };
    const out = sortApostles([{ ...base, id: 'b', fullName: 'B', sortOrder: 1 }, { ...base, id: 'a', fullName: 'A', sortOrder: 1 }, { ...base, id: 'c', fullName: 'C', sortOrder: 0 }]);
    expect(out.map((a) => a.id)).toEqual(['c', 'a', 'b']);
  });
});
