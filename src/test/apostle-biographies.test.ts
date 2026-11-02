import { describe, expect, it } from 'vitest';
import { APOSTLE_BIOGRAPHIES, findApostleBiography, findBiographyBySlug } from '@/content/apotres-biographies';

describe('biographies des apôtres', () => {
  it('rattache la biographie au nom enregistré, même écrit autrement', () => {
    expect(findApostleBiography('NSONGO MAMVIVILA Bernard')?.slug).toBe('nsongo-bernard');
    expect(findApostleBiography('N’SONGO Bernard')?.slug).toBe('nsongo-bernard');
  });
  it('ne rattache pas un autre apôtre', () => {
    expect(findApostleBiography('MANENGA MAMPUYA Gabriel')).toBeUndefined();
  });
  it('a des identifiants uniques et trouvables', () => {
    const slugs = APOSTLE_BIOGRAPHIES.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(findBiographyBySlug(s)).toBeTruthy();
  });
});
