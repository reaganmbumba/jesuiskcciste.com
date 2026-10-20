import type { EventCategory, EventStatus } from '@/types';

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  culte: 'Cultes', reunion: 'Réunions', formation: 'Formations', seminaire: 'Séminaires', conference: 'Conférences',
  mariage: 'Mariages', consolation: 'Cérémonies de consolation', deuil: 'Deuils', concert: 'Concerts',
  chorale: 'Activités de chorales', solidarite: 'Actions de solidarité', autre: 'Autres événements',
};

export const EVENT_STATUS: Record<EventStatus, { label: string; tone: 'green' | 'amber' | 'red' | 'neutral' }> = {
  scheduled: { label: 'Programmé', tone: 'green' },
  postponed: { label: 'Reporté', tone: 'amber' },
  cancelled: { label: 'Annulé', tone: 'red' },
  archived: { label: 'Archivé', tone: 'neutral' },
};
