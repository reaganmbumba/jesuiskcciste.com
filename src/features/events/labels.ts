import type { EventCategory, EventStatus } from '@/types';
import type { Locale, Tri } from '@/i18n';

const CATEGORY: Record<EventCategory, Tri> = {
  culte: { fr: 'Cultes', en: 'Services', pt: 'Cultos' },
  reunion: { fr: 'Réunions', en: 'Meetings', pt: 'Reuniões' },
  formation: { fr: 'Formations', en: 'Training', pt: 'Formações' },
  seminaire: { fr: 'Séminaires', en: 'Seminars', pt: 'Seminários' },
  conference: { fr: 'Conférences', en: 'Conferences', pt: 'Conferências' },
  mariage: { fr: 'Mariages', en: 'Weddings', pt: 'Casamentos' },
  consolation: { fr: 'Cérémonies de consolation', en: 'Consolation ceremonies', pt: 'Cerimónias de consolação' },
  deuil: { fr: 'Deuils', en: 'Bereavements', pt: 'Lutos' },
  concert: { fr: 'Concerts', en: 'Concerts', pt: 'Concertos' },
  chorale: { fr: 'Activités de chorales', en: 'Choir activities', pt: 'Atividades de coros' },
  solidarite: { fr: 'Actions de solidarité', en: 'Solidarity actions', pt: 'Ações de solidariedade' },
  autre: { fr: 'Autres événements', en: 'Other events', pt: 'Outros eventos' },
};

const STATUS: Record<EventStatus, { label: Tri; tone: 'green' | 'amber' | 'red' | 'neutral' }> = {
  scheduled: { label: { fr: 'Programmé', en: 'Scheduled', pt: 'Programado' }, tone: 'green' },
  postponed: { label: { fr: 'Reporté', en: 'Postponed', pt: 'Adiado' }, tone: 'amber' },
  cancelled: { label: { fr: 'Annulé', en: 'Cancelled', pt: 'Cancelado' }, tone: 'red' },
  archived: { label: { fr: 'Archivé', en: 'Archived', pt: 'Arquivado' }, tone: 'neutral' },
};

export const eventCategoryLabel = (c: EventCategory, l: Locale = 'fr') => CATEGORY[c][l];
export const eventStatus = (s: EventStatus, l: Locale = 'fr') => ({ label: STATUS[s].label[l], tone: STATUS[s].tone });

export const EVENT_CATEGORY_LABELS = Object.fromEntries(Object.entries(CATEGORY).map(([k, v]) => [k, v.fr])) as Record<EventCategory, string>;
export const EVENT_STATUS = Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, { label: v.label.fr, tone: v.tone }])) as Record<EventStatus, { label: string; tone: 'green' | 'amber' | 'red' | 'neutral' }>;
