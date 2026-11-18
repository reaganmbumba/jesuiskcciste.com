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
  /** Vidéo facultative (image + son du sujet) : affichée et partagée à la place de l'audio. */
  video?: string;
  image: string;
  /** Image d'aperçu 1200×630 avec bouton ▶ pour WhatsApp et Facebook. */
  shareImage: string;
  host: string;
  hostRole: Tri;
  whatsappGroup: string;
  /** Questions de débat affichées sous l'audio (facultatif). */
  questions?: Tri[];
}

const HOST = 'Maman Mam’s';
const HOST_ROLE: Tri = {
  fr: 'Administratrice du groupe WhatsApp « Je suis KCCiste 3 Mariage », une femme de valeur',
  en: 'Administrator of the “Je suis KCCiste 3 Mariage” WhatsApp group, a woman of worth',
  pt: 'Administradora do grupo WhatsApp «Je suis KCCiste 3 Mariage», uma mulher de valor',
};

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    id: 'histoire-serment-du-prophete-1966',
    date: '2026-11-18T09:30:00Z',
    title: { fr: 'Histoire : le Serment du Prophète (1966)', en: 'History: the Prophet’s Oath (1966)', pt: 'História: o Juramento do Profeta (1966)' },
    intro: {
      fr: 'En 1966, des autorités religieuses missionnaires exigent que le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac jure, devant plus de 500 personnes, qu’il changera sa manière de prêcher. La même nuit, des anges lui enseignent un cantique… Écoutez l’histoire, puis répondez aux questions : en vocal, en audio ou par écrit, dans la paix et le respect.',
      en: 'In 1966, missionary religious authorities demand that the Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac swear, before more than 500 people, that he will change the way he preaches. That same night, angels teach him a hymn… Listen to the story, then answer the questions: by voice, audio file or in writing, in peace and respect.',
      pt: 'Em 1966, autoridades religiosas missionárias exigem que o Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac jure, diante de mais de 500 pessoas, que mudará a sua maneira de pregar. Nessa mesma noite, anjos ensinam-lhe um cântico… Ouça a história e responda às perguntas: por voz, por áudio ou por escrito, em paz e com respeito.',
    },
    questions: [
      { fr: 'Si 500 personnes vous demandaient de changer votre foi, que feriez-vous ?', en: 'If 500 people asked you to change your faith, what would you do?', pt: 'Se 500 pessoas lhe pedissem para mudar a sua fé, o que faria?' },
      { fr: 'Pourquoi le Prophète a-t-il choisi de chanter un cantique plutôt que de se disputer avec ces chefs ?', en: 'Why did the Prophet choose to sing a hymn rather than argue with those leaders?', pt: 'Porque escolheu o Profeta cantar um cântico em vez de discutir com esses chefes?' },
      { fr: 'Aujourd’hui, qu’est-ce qui peut pousser un prédicateur à changer son enseignement ? Comment rester fidèle à ce serment ?', en: 'Today, what can push a preacher to change his teaching? How can we stay faithful to this oath?', pt: 'Hoje, o que pode levar um pregador a mudar o seu ensino? Como permanecer fiel a este juramento?' },
    ],
    audio: '/audio/debats/histoire-serment-du-prophete-1966.mp3',
    image: '/images/debats/serment-du-prophete-1966.jpg',
    shareImage: '/images/debats/partage-serment-du-prophete-1966.jpg',
    host: 'Rédaction Je suis KCCiste',
    hostRole: {
      fr: 'Histoire de l’Église racontée à partir du récit officiel du Serment du Prophète.',
      en: 'Church history told from the official account of the Prophet’s Oath.',
      pt: 'História da Igreja contada a partir do relato oficial do Juramento do Profeta.',
    },
    whatsappGroup: 'Je suis KCCiste',
  },
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
    video: '/videos/debats/sujet-du-jour-30-octobre-2026.mp4',
    image: '/images/debats/je-suis-kcciste-3-mariage.jpg',
    shareImage: '/images/debats/partage-sujet-30-octobre-2026.jpg',
    host: HOST,
    hostRole: HOST_ROLE,
    whatsappGroup: 'Je suis KCCiste 3 Mariage',
  },
];

export const findDebateTopic = (id?: string) => DEBATE_TOPICS.find((t) => t.id === id);
