import type { CourseAccess, CourseLevel } from '@/types';
import type { Locale, Tri } from '@/i18n';

const LEVEL: Record<CourseLevel, Tri> = {
  debutant: { fr: 'Débutant', en: 'Beginner', pt: 'Iniciante' },
  intermediaire: { fr: 'Intermédiaire', en: 'Intermediate', pt: 'Intermédio' },
  avance: { fr: 'Avancé', en: 'Advanced', pt: 'Avançado' },
};
const ACCESS: Record<CourseAccess, { label: Tri; tone: 'green' | 'blue' | 'amber' | 'red' }> = {
  open: { label: { fr: 'Accès libre', en: 'Open access', pt: 'Acesso livre' }, tone: 'green' },
  members: { label: { fr: 'Réservé aux membres', en: 'Members only', pt: 'Reservado aos membros' }, tone: 'blue' },
  on_request: { label: { fr: 'Sur demande', en: 'On request', pt: 'Mediante pedido' }, tone: 'amber' },
  closed: { label: { fr: 'Inscriptions fermées', en: 'Enrolment closed', pt: 'Inscrições fechadas' }, tone: 'red' },
};

export const levelLabel = (v: CourseLevel, l: Locale = 'fr') => LEVEL[v][l];
export const accessLabel = (v: CourseAccess, l: Locale = 'fr') => ({ label: ACCESS[v].label[l], tone: ACCESS[v].tone });

export const LEVEL_LABELS = Object.fromEntries(Object.entries(LEVEL).map(([k, v]) => [k, v.fr])) as Record<CourseLevel, string>;
export const ACCESS_LABELS = Object.fromEntries(Object.entries(ACCESS).map(([k, v]) => [k, { label: v.label.fr, tone: v.tone }])) as Record<CourseAccess, { label: string; tone: 'green' | 'blue' | 'amber' | 'red' }>;
