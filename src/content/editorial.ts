/**
 * Contenu éditorial de base du site public.
 *
 * Affiché uniquement quand la base Supabase ne contient encore rien pour une
 * rubrique (annonces, agenda, paroisses, musique, bibliothèque, formations).
 * Dès que l'administration publie son premier élément dans une rubrique, ce
 * contenu de base disparaît de cette rubrique. Tout est tiré des sources
 * officielles de l'Église (doctrine, archives, cantiques) : aucune coordonnée,
 * aucun montant ni aucun nom de responsable n'est inventé.
 */
import type { Album, Announcement, Artist, Course, KccEvent, MediaItem, Parish, Track } from '@/types';
import type { Locale } from '@/i18n';
import * as fr from './doctrine';
import * as en from './doctrine.en';
import * as pt from './doctrine.pt';

/** Préfixe des identifiants du contenu de base (jamais présents en base). */
export const EDITORIAL_PREFIX = 'edito-';
export const isEditorial = (id?: string | null) => !!id && id.startsWith(EDITORIAL_PREFIX);

type L = Record<Locale, string>;
const L = (fr: string, en: string, pt: string): L => ({ fr, en, pt });

export function currentLocale(): Locale {
  try {
    const v = localStorage.getItem('kcc.locale');
    if (v === 'en' || v === 'pt') return v;
  } catch { /* stockage indisponible */ }
  return 'fr';
}

const at = (iso: string) => new Date(iso).toISOString();

const ANNOUNCEMENTS: { id: string; date: string; category: L; title: L; summary: L; content: L; image: string; pinned?: boolean }[] = [
  {
    id: 'site', date: '2026-10-20T09:00:00Z', pinned: true, image: '/images/hero-communaute.jpg',
    category: L('Communauté', 'Community', 'Comunidade'),
    title: L('JE SUIS KCCiste : la maison numérique de la communauté est en ligne', 'JE SUIS KCCiste: the community’s digital home is online', 'JE SUIS KCCiste: a casa digital da comunidade está online'),
    summary: L('Actualités, agenda, paroisses, formations, musique et solidarité réunis en un seul lieu, en français, anglais et portugais.', 'News, calendar, parishes, courses, music and solidarity in one place, in French, English and Portuguese.', 'Notícias, agenda, paróquias, formações, música e solidariedade num só lugar, em francês, inglês e português.'),
    content: L(
      'Le site JE SUIS KCCiste rassemble les KCCistes de la RD Congo et de la diaspora. Créez votre compte, rattachez-vous à votre paroisse et à votre section, suivez l’agenda et les formations, écoutez les cantiques et participez aux projets de solidarité.\n\nLe site est disponible en français, en anglais et en portugais, sur ordinateur, sur téléphone et en application Android.',
      'The JE SUIS KCCiste website brings together KCCists in the DR Congo and across the diaspora. Create your account, link it to your parish and section, follow the calendar and courses, listen to the hymns and take part in solidarity projects.\n\nThe site is available in French, English and Portuguese, on computer, on phone and as an Android app.',
      'O site JE SUIS KCCiste reúne os KCCistas da RD Congo e da diáspora. Crie a sua conta, associe-se à sua paróquia e secção, acompanhe a agenda e as formações, ouça os hinos e participe nos projetos de solidariedade.\n\nO site está disponível em francês, inglês e português, no computador, no telemóvel e como aplicação Android.'),
  },
  {
    id: 'doctrine', date: '2026-10-19T09:00:00Z', image: '/images/archives/archive-assemblee-noir-et-blanc.jpg',
    category: L('Enseignement', 'Teaching', 'Ensino'),
    title: L('La doctrine et l’histoire de l’Église désormais en trois langues', 'The Church’s doctrine and history now in three languages', 'A doutrina e a história da Igreja agora em três línguas'),
    summary: L('Le KCC, la profession de foi, les Paroles de l’Alliance, les fêtes et la vie du Prophète, à lire en ligne.', 'The KCC, the profession of faith, the Words of the Covenant, the feasts and the life of the Prophet, to read online.', 'O KCC, a profissão de fé, as Palavras da Aliança, as festas e a vida do Profeta, para ler online.'),
    content: L(
      'Les textes officiels de l’Église Bon Nouveau Message (KCC) sont maintenant consultables sur le site : l’apparition du KCC, l’Oracle du 15 avril 2003, la profession de foi, les dix Paroles de l’Alliance, les sacrements, les fêtes et la vie du Prophète.\n\nRendez-vous dans la rubrique « Doctrine et histoire ».',
      'The official texts of the Église Bon Nouveau Message (KCC) can now be read on the site: the apparition of the KCC, the Oracle of 15 April 2003, the profession of faith, the ten Words of the Covenant, the sacraments, the feasts and the life of the Prophet.\n\nSee the “Doctrine and history” section.',
      'Os textos oficiais da Église Bon Nouveau Message (KCC) podem agora ser lidos no site: a aparição do KCC, o Oráculo de 15 de abril de 2003, a profissão de fé, as dez Palavras da Aliança, os sacramentos, as festas e a vida do Profeta.\n\nConsulte a secção «Doutrina e história».'),
  },
  {
    id: 'musique', date: '2026-10-18T09:00:00Z', image: '/images/accueil/musique.svg',
    category: L('Musique', 'Music', 'Música'),
    title: L('KCC Music : écoutez et soutenez les chorales', 'KCC Music: listen to and support the choirs', 'KCC Music: ouça e apoie os coros'),
    summary: L('Cantiques d’ensemble et chants de la communauté à écouter en ligne, avec paiement par mobile money.', 'Congregational hymns and community songs to listen to online, with mobile money payment.', 'Hinos de conjunto e cânticos da comunidade para ouvir online, com pagamento por mobile money.'),
    content: L(
      'Retrouvez les cantiques d’ensemble de l’EBNM/KCC et les chants des artistes de la communauté dans KCC Music. Les titres et albums proposés à la vente se règlent par M-Pesa, Orange Money ou Airtel Money.',
      'Find the congregational hymns of the EBNM/KCC and the songs of community artists in KCC Music. Titles and albums for sale can be paid with M-Pesa, Orange Money or Airtel Money.',
      'Encontre os hinos de conjunto da EBNM/KCC e os cânticos dos artistas da comunidade no KCC Music. Os títulos e álbuns à venda pagam-se com M-Pesa, Orange Money ou Airtel Money.'),
  },
  {
    id: 'youtube', date: '2026-10-17T09:00:00Z', image: '/images/kcc-explication-apparition-poster.jpg',
    category: L('Vidéos', 'Videos', 'Vídeos'),
    title: L('Abonnez-vous à la chaîne YouTube « Je suis KCCiste »', 'Subscribe to the “Je suis KCCiste” YouTube channel', 'Subscreva o canal YouTube «Je suis KCCiste»'),
    summary: L('Chants, enseignements et moments de la communauté en vidéo.', 'Songs, teachings and community moments on video.', 'Cânticos, ensinamentos e momentos da comunidade em vídeo.'),
    content: L(
      'La chaîne YouTube « Je suis KCCiste » publie régulièrement des chants, des enseignements et des moments de la communauté. Abonnez-vous, activez la cloche et partagez les vidéos autour de vous.',
      'The “Je suis KCCiste” YouTube channel regularly publishes songs, teachings and community moments. Subscribe, turn on the bell and share the videos with others.',
      'O canal YouTube «Je suis KCCiste» publica regularmente cânticos, ensinamentos e momentos da comunidade. Subscreva, ative o sino e partilhe os vídeos.'),
  },
  {
    id: 'cantiques', date: '2026-10-16T09:00:00Z', image: '/images/accueil/parole.svg',
    category: L('Cantiques', 'Hymns', 'Hinos'),
    title: L('Le recueil de cantiques en lingala et kikongo', 'The hymn book in Lingala and Kikongo', 'O hinário em lingala e kikongo'),
    summary: L('Les paroles des cantiques d’ensemble, consultables sur téléphone pendant le culte.', 'The words of the congregational hymns, readable on your phone during the service.', 'As letras dos hinos de conjunto, para consultar no telemóvel durante o culto.'),
    content: L(
      'Le recueil de cantiques est disponible dans la rubrique « Cantiques ». Recherchez un cantique par numéro, titre ou langue et suivez les paroles sur votre téléphone.',
      'The hymn book is available in the “Hymns” section. Search for a hymn by number, title or language and follow the words on your phone.',
      'O hinário está disponível na secção «Hinos». Procure um hino por número, título ou língua e acompanhe as letras no telemóvel.'),
  },
  {
    id: 'academie', date: '2026-10-15T09:00:00Z', image: '/images/accueil/formation.svg',
    category: L('Formation', 'Learning', 'Formação'),
    title: L('Académie KCC : premières formations en accès libre', 'KCC Academy: first courses with free access', 'Academia KCC: primeiras formações em acesso livre'),
    summary: L('Le KCC, la profession de foi et l’histoire du Prophète, leçon par leçon.', 'The KCC, the profession of faith and the history of the Prophet, lesson by lesson.', 'O KCC, a profissão de fé e a história do Profeta, lição a lição.'),
    content: L(
      'L’Académie KCC propose ses premières formations en accès libre, construites à partir des textes officiels de l’Église. D’autres parcours, avec examens et certificats, seront ajoutés par les formateurs.',
      'The KCC Academy offers its first free-access courses, built from the Church’s official texts. More learning paths, with exams and certificates, will be added by the trainers.',
      'A Academia KCC propõe as primeiras formações em acesso livre, construídas a partir dos textos oficiais da Igreja. Outros percursos, com exames e certificados, serão acrescentados pelos formadores.'),
  },
];

/** Jours saints à date fixe (doctrine) : prochaine occurrence calculée. */
const FEASTS: { id: string; month: number; day: number; title: L; text: L }[] = [
  { id: 'naissance-prophete', month: 3, day: 1, title: L('Naissance du Prophète', 'Birth of the Prophet', 'Nascimento do Profeta'), text: L('Né le 1er mars 1930 à Makaba (Luozi). Jour saint.', 'Born on 1 March 1930 in Makaba (Luozi). Holy day.', 'Nascido a 1 de março de 1930 em Makaba (Luozi). Dia santo.') },
  { id: 'naissance-eglise', month: 3, day: 8, title: L('Naissance de l’Église', 'Birth of the Church', 'Nascimento da Igreja'), text: L('Appel du Prophète, le 8 mars 1955. Jour saint.', 'Calling of the Prophet, 8 March 1955. Holy day.', 'Chamamento do Profeta, 8 de março de 1955. Dia santo.') },
  { id: 'apparition-kcc', month: 4, day: 12, title: L('Apparition du KCC', 'Apparition of the KCC', 'Aparição do KCC'), text: L('Les signes KCC apparaissent à Boma, le 12 avril 1958.', 'The KCC signs appeared in Boma on 12 April 1958.', 'Os sinais KCC aparecem em Boma, a 12 de abril de 1958.') },
  { id: 'delivrance', month: 4, day: 15, title: L('Fête de la Délivrance (Oracle)', 'Feast of Deliverance (Oracle)', 'Festa da Libertação (Oráculo)'), text: L('Proclamation de l’Oracle, le 15 avril 2003. Jour saint.', 'Proclamation of the Oracle, 15 April 2003. Holy day.', 'Proclamação do Oráculo, a 15 de abril de 2003. Dia santo.') },
  { id: 'reconnaissance', month: 4, day: 30, title: L('Anniversaire de la reconnaissance juridique', 'Anniversary of legal recognition', 'Aniversário do reconhecimento jurídico'), text: L('Personnalité civile accordée par l’Ordonnance n° 128-80 du 30 avril 1980.', 'Legal personality granted by Ordinance No. 128-80 of 30 April 1980.', 'Personalidade civil concedida pela Ordenança n.º 128-80 de 30 de abril de 1980.') },
];

const PARISHES: { id: string; name: string; country: L; city: string; text: L }[] = [
  { id: 'kinshasa', name: 'Kinshasa — Siège', city: 'Kinshasa', country: L('RD Congo', 'DR Congo', 'RD Congo'), text: L('Siège et direction de l’Église Bon Nouveau Message (KCC).', 'Head office of the Église Bon Nouveau Message (KCC).', 'Sede e direção da Église Bon Nouveau Message (KCC).') },
  { id: 'matadi', name: 'Matadi', city: 'Matadi', country: L('RD Congo', 'DR Congo', 'RD Congo'), text: L('Paroisse historique du Kongo-Central.', 'Historic parish in Kongo-Central.', 'Paróquia histórica do Kongo-Central.') },
  { id: 'boma', name: 'Boma', city: 'Boma', country: L('RD Congo', 'DR Congo', 'RD Congo'), text: L('Ville de l’apparition des signes KCC, le 12 avril 1958.', 'The town where the KCC signs appeared on 12 April 1958.', 'Cidade da aparição dos sinais KCC, a 12 de abril de 1958.') },
  { id: 'luanda', name: 'Luanda', city: 'Luanda', country: L('Angola', 'Angola', 'Angola'), text: L('Présence de l’Église en Angola.', 'The Church’s presence in Angola.', 'Presença da Igreja em Angola.') },
  { id: 'cabinda', name: 'Cabinda', city: 'Cabinda', country: L('Angola', 'Angola', 'Angola'), text: L('Présence de l’Église en Angola.', 'The Church’s presence in Angola.', 'Presença da Igreja em Angola.') },
  { id: 'soyo', name: 'Soyo', city: 'Soyo', country: L('Angola', 'Angola', 'Angola'), text: L('Présence de l’Église en Angola.', 'The Church’s presence in Angola.', 'Presença da Igreja em Angola.') },
  { id: 'brazzaville', name: 'Brazzaville', city: 'Brazzaville', country: L('Congo-Brazzaville', 'Congo-Brazzaville', 'Congo-Brazzaville'), text: L('Présence de l’Église au Congo-Brazzaville.', 'The Church’s presence in Congo-Brazzaville.', 'Presença da Igreja no Congo-Brazzaville.') },
  { id: 'pointe-noire', name: 'Pointe-Noire', city: 'Pointe-Noire', country: L('Congo-Brazzaville', 'Congo-Brazzaville', 'Congo-Brazzaville'), text: L('Présence de l’Église au Congo-Brazzaville.', 'The Church’s presence in Congo-Brazzaville.', 'Presença da Igreja no Congo-Brazzaville.') },
];

const id = (k: string) => `${EDITORIAL_PREFIX}${k}`;

export function editorialAnnouncements(locale = currentLocale()): Announcement[] {
  return ANNOUNCEMENTS.map((a) => ({
    id: id(`ann-${a.id}`), title: a.title[locale], summary: a.summary[locale], content: a.content[locale], author: 'JE SUIS KCCiste',
    category: a.category[locale], publishedAt: at(a.date), status: 'published', audience: 'public', pinned: !!a.pinned, imageUrl: a.image,
  }));
}

export function editorialEvents(locale = currentLocale(), now = new Date()): KccEvent[] {
  return FEASTS.map((f) => {
    let year = now.getUTCFullYear();
    if (Date.UTC(year, f.month - 1, f.day, 23) < now.getTime()) year += 1;
    // Journée entière à Kinshasa (UTC+1) : 8 h à 18 h.
    const start = new Date(Date.UTC(year, f.month - 1, f.day, 7));
    const end = new Date(Date.UTC(year, f.month - 1, f.day, 17));
    return {
      id: id(`evt-${f.id}`), title: f.title[locale], description: f.text[locale], startsAt: start.toISOString(), endsAt: end.toISOString(),
      timezone: 'Africa/Kinshasa', location: { fr: 'Toutes les paroisses', en: 'All parishes', pt: 'Todas as paróquias' }[locale], parishId: null,
      category: 'culte', posterUrl: null, organizer: 'EBNM / KCC', status: 'scheduled',
      participation: { fr: 'Ouvert à tous. Le programme est précisé par chaque paroisse.', en: 'Open to all. Each parish announces its own programme.', pt: 'Aberto a todos. O programa é indicado por cada paróquia.' }[locale],
      registrationEnabled: false, audience: 'public',
    } as KccEvent;
  }).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function editorialParishes(locale = currentLocale()): Parish[] {
  return PARISHES.map((p) => ({ id: id(`par-${p.id}`), name: p.name, description: p.text[locale], country: p.country[locale], city: p.city, address: null, unitId: null, leaderName: null }));
}

export const editorialArtists = (): Artist[] => [
  { id: id('art-ebnm'), name: 'Ensemble EBNM / KCC', kind: 'choir', bio: { fr: 'Cantiques d’ensemble de l’Église Bon Nouveau Message (KCC).', en: 'Congregational hymns of the Église Bon Nouveau Message (KCC).', pt: 'Hinos de conjunto da Église Bon Nouveau Message (KCC).' }[currentLocale()], parishId: null, imageUrl: '/images/logo-kcc.png' },
  { id: id('art-patrick-beckham'), name: 'Patrick Beckham', kind: 'artist', bio: { fr: 'Artiste de la communauté KCCiste.', en: 'Artist from the KCCist community.', pt: 'Artista da comunidade KCCista.' }[currentLocale()], parishId: null, imageUrl: '/images/accueil/musique.svg' },
];

export const editorialAlbums = (): Album[] => [
  { id: id('alb-cantiques-5'), title: 'Sélection cantiques d’ensemble – Volume 5', artistId: id('art-ebnm'), year: null, coverUrl: '/images/logo-kcc.png', priceAmount: null, priceCurrency: null },
];

export const editorialTracks = (): Track[] => [
  { id: id('trk-cantiques-5'), title: 'Sélection cantiques d’ensemble – Volume 5', author: 'EBNM / KCC', artistId: id('art-ebnm'), albumId: id('alb-cantiques-5'), category: 'Cantiques', durationSeconds: 618, audioUrl: '/audio/cantiques-ensemble-volume-5.mp3', broadcastRights: 'authorized', lyrics: null },
  { id: id('trk-masina'), title: 'Masina', author: 'EBNM / KCC', artistId: id('art-ebnm'), albumId: null, category: 'Chants', durationSeconds: 332, audioUrl: '/audio/masina-ebnm-kcc.mp3', broadcastRights: 'authorized', lyrics: null },
  { id: id('trk-merci-maman'), title: 'Merci Maman', author: 'Patrick Beckham', artistId: id('art-patrick-beckham'), albumId: null, category: 'Chants', durationSeconds: 231, audioUrl: '/audio/merci-maman-patrick-beckham.mp3', broadcastRights: 'authorized', lyrics: null },
  { id: id('trk-seigneur-gueris'), title: 'Seigneur, guéris ce qu’ils ont détruit en moi', author: 'EBNM / KCC', artistId: id('art-ebnm'), albumId: null, category: 'Chants', durationSeconds: 61, audioUrl: '/audio/seigneur-gueris-ce-quils-ont-detruit-en-moi.mp3', broadcastRights: 'authorized', lyrics: null },
];

export function editorialMedia(locale = currentLocale()): MediaItem[] {
  const items: [string, MediaItem['kind'], L, L, L, string][] = [
    ['doctrine', 'document', L('Doctrine et histoire de l’Église', 'Doctrine and history of the Church', 'Doutrina e história da Igreja'), L('Enseignement', 'Teaching', 'Ensino'), L('Le KCC, la profession de foi, l’Alliance, les fêtes et la vie du Prophète.', 'The KCC, the profession of faith, the Covenant, the feasts and the life of the Prophet.', 'O KCC, a profissão de fé, a Aliança, as festas e a vida do Profeta.'), '/doctrine'],
    ['alliance', 'document', L('Les dix Paroles de l’Alliance', 'The ten Words of the Covenant', 'As dez Palavras da Aliança'), L('Enseignement', 'Teaching', 'Ensino'), L('Texte officiel en plusieurs langues.', 'Official text in several languages.', 'Texto oficial em várias línguas.'), '/doctrine#loi'],
    ['cantiques', 'document', L('Recueil de cantiques (lingala, kikongo)', 'Hymn book (Lingala, Kikongo)', 'Hinário (lingala, kikongo)'), L('Cantiques', 'Hymns', 'Hinos'), L('Les paroles des cantiques d’ensemble.', 'The words of the congregational hymns.', 'As letras dos hinos de conjunto.'), '/cantiques'],
    ['enseignements', 'document', L('Enseignements et récits de l’appel du Prophète', 'Teachings and accounts of the Prophet’s calling', 'Ensinamentos e relatos do chamamento do Profeta'), L('Enseignement', 'Teaching', 'Ensino'), L('Parole du Prophète, histoire et chants.', 'The Prophet’s word, history and songs.', 'Palavra do Profeta, história e cânticos.'), '/enseignements'],
    ['caisse', 'document', L('Règlement de la caisse d’assistance sociale', 'Social assistance fund rules', 'Regulamento da caixa de assistência social'), L('Solidarité', 'Solidarity', 'Solidariedade'), L('Entraide en cas de deuil et de maladie.', 'Mutual aid in case of bereavement and illness.', 'Entreajuda em caso de luto e doença.'), '/enseignements#caisse'],
    ['video-kcc', 'video', L('Le KCC expliqué en animation', 'The KCC explained in animation', 'O KCC explicado em animação'), L('Vidéos', 'Videos', 'Vídeos'), L('Courte vidéo sur l’apparition des signes KCC.', 'Short video on the apparition of the KCC signs.', 'Vídeo curto sobre a aparição dos sinais KCC.'), '/videos/kcc-explication-apparition.mp4'],
  ];
  return items.map(([k, kind, title, cat, desc, url]) => ({ id: id(`med-${k}`), title: title[locale], kind, category: cat[locale], description: desc[locale], url, audience: 'public', publishedAt: at('2026-10-20T09:00:00Z') }));
}

/** Formations en accès libre construites à partir des textes officiels. */
export function editorialCourses(locale = currentLocale()): Course[] {
  const d = { fr, en, pt }[locale];
  const lesson = (k: string, title: string, body: string, minutes = 5) => ({ id: id(`les-${k}`), title, kind: 'text' as const, durationMinutes: minutes, body });
  const base = { level: 'debutant' as const, access: 'open' as const, status: 'published' as const, trainerName: null, quizId: null };
  return [
    {
      ...base, id: id('crs-kcc'), slug: 'le-kcc-bon-nouveau-message', category: L('Doctrine', 'Doctrine', 'Doutrina')[locale], estimatedHours: 1, coverUrl: '/images/accueil/parole.svg',
      title: d.kccApparition.title, summary: d.kccApparition.meaning, description: d.kccApparition.date,
      modules: [
        { id: id('mod-kcc-1'), title: d.kccApparition.title, lessons: d.kccApparition.paragraphs.map((p, i) => lesson(`kcc-${i}`, `${d.kccApparition.title} (${i + 1})`, p)) },
        { id: id('mod-kcc-2'), title: d.oracle.title, lessons: [lesson('oracle-q', d.oracle.title, `${d.oracle.quote}\n\n${d.oracle.paragraphs.join('\n\n')}`, 10)] },
      ],
    },
    {
      ...base, id: id('crs-foi'), slug: 'profession-de-foi-et-alliance', category: L('Doctrine', 'Doctrine', 'Doutrina')[locale], estimatedHours: 1, coverUrl: '/images/accueil/formation.svg',
      title: `${d.professionOfFaith.title} · ${d.lawTexts[0].title}`, summary: d.lawTexts[0].intro ?? '', description: d.professionOfFaith.rite,
      modules: [
        { id: id('mod-foi-1'), title: d.professionOfFaith.title, lessons: [lesson('foi', d.professionOfFaith.title, d.professionOfFaith.articles.map((a, i) => `${i + 1}. ${a}`).join('\n\n'), 10)] },
        { id: id('mod-foi-2'), title: d.lawTexts[0].title, lessons: d.lawTexts[0].versions[0].items.map((it, i) => lesson(`alliance-${i}`, `${d.lawTexts[0].title} — ${i + 1}`, it, 3)) },
      ],
    },
    {
      ...base, id: id('crs-prophete'), slug: 'histoire-du-prophete', category: L('Histoire', 'History', 'História')[locale], estimatedHours: 1, coverUrl: '/images/archives/temple-construction.jpg',
      title: L('Histoire du Prophète', 'History of the Prophet', 'História do Profeta')[locale], summary: d.prophetTimeline[0].d, description: d.prophetTimeline.map((x) => x.year).join(' · '),
      modules: [{ id: id('mod-pro-1'), title: L('Les grandes étapes', 'The key stages', 'As grandes etapas')[locale], lessons: d.prophetTimeline.map((x, i) => lesson(`pro-${i}`, `${x.year} — ${x.t}`, x.d)) }],
    },
  ];
}
