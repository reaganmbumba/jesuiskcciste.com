import type { Tri } from '@/i18n';

/**
 * Sujets de l'espace « Débats audio ». Chaque sujet a un audio d'ouverture
 * de l'animatrice ; les commentaires (vocal, fichier audio ou texte) sont
 * enregistrés en base dans `debate_comments`, rattachés à l'identifiant.
 * Le plus récent en premier.
 */
export interface DebateTopic {
  id: string;
  date: string;
  title: Tri;
  intro: Tri;
  audio: string;
  image: string;
  host: string;
  hostRole: Tri;
  whatsappGroup: string;
}

const HOST = 'Maman Mam’s';
const HOST_ROLE: Tri = {
  fr: 'Administratrice du groupe WhatsApp « Je suis KCCiste 3 Mariage », une femme de valeur',
  en: 'Administrator of the “Je suis KCCiste 3 Mariage” WhatsApp group, a woman of worth',
  pt: 'Administradora do grupo WhatsApp «Je suis KCCiste 3 Mariage», uma mulher de valor',
};

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    id: 'sujet-30-octobre-2026',
    date: '2026-10-30T13:00:00Z',
    title: { fr: 'Sujet du jour — 30 octobre 2026', en: 'Topic of the day — 30 October 2026', pt: 'Tema do dia — 30 de outubro de 2026' },
    intro: {
      fr: 'Écoutez le sujet présenté par Maman Mam’s, puis donnez votre avis : enregistrez un message vocal, envoyez un audio ou écrivez votre commentaire.',
      en: 'Listen to the topic presented by Maman Mam’s, then share your view: record a voice message, send an audio file or write your comment.',
      pt: 'Ouça o tema apresentado pela Maman Mam’s e dê a sua opinião: grave uma mensagem de voz, envie um áudio ou escreva o seu comentário.',
    },
    audio: '/audio/debats/sujet-30-octobre-2026.mp3',
    image: '/images/debats/je-suis-kcciste-3-mariage.jpg',
    host: HOST,
    hostRole: HOST_ROLE,
    whatsappGroup: 'Je suis KCCiste 3 Mariage',
  },
];

export const findDebateTopic = (id?: string) => DEBATE_TOPICS.find((t) => t.id === id);
