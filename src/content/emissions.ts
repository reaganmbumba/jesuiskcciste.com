/**
 * Émissions enregistrées de Radio Je suis KCCiste, programmées à heure fixe.
 * À l'heure dite, la radio de chaque auditeur bascule sur l'émission, au même
 * moment pour tous (comme un direct), puis revient aux chants à la fin.
 * Heures en UTC : Kinshasa = UTC+1 (19 h à Kinshasa = 18:00Z).
 * Fabrication : tools/journal-radio/ (texte validé → voix → montage).
 */
export interface Emission {
  id: string; title: string; startsAt: string; audioUrl: string; durationSeconds: number;
  /** Bande-annonce : passe entre les chants dans les 24 h qui précèdent l'émission. */
  teaserUrl?: string; teaserSeconds?: number;
}

export const EMISSIONS: Emission[] = [
  { id: 'musique-2026-10-27', startsAt: '2026-10-28T18:00:00Z', title: 'Du ghetto au monde : la musique KCCiste', audioUrl: '/audio/emissions/emission-musique-2026-10-27.mp3', durationSeconds: 902,
    teaserUrl: '/audio/emissions/annonce-musique-2026-10-28.mp3', teaserSeconds: 75 },
];
