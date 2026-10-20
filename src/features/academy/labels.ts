import type { CourseAccess, CourseLevel } from '@/types';
export const LEVEL_LABELS: Record<CourseLevel, string> = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };
export const ACCESS_LABELS: Record<CourseAccess, { label: string; tone: 'green' | 'blue' | 'amber' | 'red' }> = {
  open: { label: 'Accès libre', tone: 'green' },
  members: { label: 'Réservé aux membres', tone: 'blue' },
  on_request: { label: 'Sur demande', tone: 'amber' },
  closed: { label: 'Inscriptions fermées', tone: 'red' },
};
