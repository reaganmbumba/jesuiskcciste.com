/**
 * Émissions enregistrées de Radio Je suis KCCiste, programmées à heure fixe.
 * À l'heure dite, la radio de chaque auditeur bascule sur l'émission, au même
 * moment pour tous (comme un direct), puis revient aux chants à la fin.
 * Heures en UTC : Kinshasa = UTC+1 (11 h 30 à Kinshasa = 10:30Z).
 * Fabrication : tools/journal-radio/ (texte validé → voix → montage).
 */
export interface Emission { id: string; title: string; startsAt: string; audioUrl: string; durationSeconds: number }

export const EMISSIONS: Emission[] = [
  { id: 'musique-2026-10-27', startsAt: '2026-10-27T10:30:00Z', title: 'Du ghetto au monde : la musique KCCiste', audioUrl: '/audio/emissions/emission-musique-2026-10-27.mp3', durationSeconds: 902 },
  { id: 'jeunes-prophete-2026-10-29', startsAt: '2026-10-29T17:00:00Z', title: 'La jeunesse parle du Prophète', audioUrl: '/audio/emissions/emission-jeunes-prophete.mp3', durationSeconds: 1685 },
];
