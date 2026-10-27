/**
 * Émissions enregistrées de Radio Je suis KCCiste, programmées à heure fixe.
 * À l'heure dite, la radio de chaque auditeur bascule sur l'émission, au même
 * moment pour tous (comme un direct), puis revient aux chants à la fin.
 * Heures en UTC : Kinshasa = UTC+1 (11 h 30 à Kinshasa = 10:30Z).
 * Fabrication : tools/journal-radio/ (texte validé → voix → montage).
 */
export interface Emission { id: string; title: string; startsAt: string; audioUrl: string; durationSeconds: number }

export const EMISSIONS: Emission[] = [];
