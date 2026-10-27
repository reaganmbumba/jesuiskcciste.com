/**
 * Journaux parlés de Radio Je suis KCCiste. Le plus récent passe à l'antenne
 * au début de chaque tour de radio pendant JOURNAL_DAYS jours.
 * Fabrication : tools/journal-radio/ (texte validé → voix → montage).
 */
export interface Journal { id: string; date: string; title: string; audioUrl: string; durationSeconds: number }

export const JOURNAUX: Journal[] = [
  { id: '2026-10-27', date: '2026-10-27T06:00:00Z', title: 'Le journal du mardi 27 octobre 2026', audioUrl: '/audio/journal/journal-2026-10-27.mp3', durationSeconds: 437 },
];
