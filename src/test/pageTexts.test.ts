import { describe, expect, it } from 'vitest';
import { diffPage, plainModule } from '@/features/content/pageTexts';
import * as doctrine from '@/content/doctrine';

describe('textes des pages', () => {
  it('ne garde que les données du module', () => {
    const v = plainModule({ a: 1, f: () => 2 });
    expect(v).toEqual({ a: 1 });
    expect(Object.keys(plainModule(doctrine))).toContain('lawTexts');
  });
  it('n’enregistre que les parties modifiées', () => {
    const base = plainModule(doctrine);
    expect(diffPage(base, { ...base })).toEqual({});
    expect(diffPage(base, { ...base, doctrineSource: 'Autre' })).toEqual({ doctrineSource: 'Autre' });
  });
});
