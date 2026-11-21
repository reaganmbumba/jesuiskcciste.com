import { describe, expect, it } from 'vitest';
import { groupPlaces } from '@/features/radio/listeners';

describe('lieux des auditeurs', () => {
  it('regroupe par ville, du plus grand au plus petit, le pays seulement hors RD Congo', () => {
    const p = groupPlaces([
      { city: 'Kinshasa', country: 'CD' }, { city: 'Muanda', country: 'CD' }, { city: 'Kinshasa', country: 'CD' },
      { city: 'Luanda', country: 'AO' }, { country: 'FR' }, {},
    ]);
    expect(p[0]).toEqual({ name: 'Kinshasa', n: 2 });
    expect(p.map((x) => x.name)).toContain('Luanda (Angola)');
    expect(p.map((x) => x.name)).toContain('France');
    expect(p.map((x) => x.name)).toContain('Lieu inconnu');
  });
});
