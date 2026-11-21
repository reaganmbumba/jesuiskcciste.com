import { describe, expect, it } from 'vitest';
import { rubriqueOf } from '@/features/radio/rediffusions';

describe('rubriques des rediffusions', () => {
  it('classe d’après le titre et le fichier', () => {
    expect(rubriqueOf({ title: 'Journal-KCC-20-11-2026', url: 'https://x/chants/journal.mp3' })).toBe('Journal KCC');
    expect(rubriqueOf({ title: 'Tosungana : la réponse de Maman Mam’s', url: 'https://x/a.mp3' })).toBe('Tosungana');
    expect(rubriqueOf({ title: 'Le choix du mariage', url: 'https://jesuiskcciste.com/predications/x.mp3' })).toBe('Prédications');
    expect(rubriqueOf({ title: 'Mabondeli ya ntongo', url: 'https://x/a.mp3' })).toBe('Prière');
    expect(rubriqueOf({ title: 'À la découverte de Échos du Ciel', url: 'https://jesuiskcciste.com/radio/emissions/a.webm' })).toBe('Émissions');
  });
});
