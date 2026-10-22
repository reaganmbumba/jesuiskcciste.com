import type { Tri, TranslationKey } from '@/i18n';

export interface NavLinkItem { label: Tri; to: string; description?: Tri }
export interface NavGroup { key: TranslationKey; to: string; children?: NavLinkItem[] }

const l = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

export const MAIN_NAV: NavGroup[] = [
  { key: 'nav.home', to: '/' },
  {
    key: 'nav.community', to: '/communaute', children: [
      { label: l('Communauté KCCiste', 'KCCist community', 'Comunidade KCCista'), to: '/communaute', description: l('Vie et organisation de la communauté', 'Life and organisation of the community', 'Vida e organização da comunidade') },
      { label: l('Forum de discussion', 'Discussion forum', 'Fórum de discussão'), to: '/forum', description: l('Sujets et commentaires des membres', 'Topics and members’ comments', 'Temas e comentários dos membros') },
      { label: l('Annuaire des membres', 'Member directory', 'Diretório de membros'), to: '/communaute/annuaire', description: l('Retrouver les membres', 'Find members', 'Encontrar membros') },
      { label: l('Paroisses', 'Parishes', 'Paróquias'), to: '/paroisses', description: l('La liste officielle, par pays', 'The official list, by country', 'A lista oficial, por país') },
      { label: l('Sections', 'Sections', 'Secções'), to: '/sections', description: l('Les sections rattachées', 'Affiliated sections', 'As secções associadas') },
      { label: l('À propos de l’Église', 'About the Church', 'Sobre a Igreja'), to: '/a-propos', description: l('Présentation officielle', 'Official presentation', 'Apresentação oficial') },
    ],
  },
  {
    key: 'nav.faith', to: '/doctrine', children: [
      { label: l('Doctrine et histoire', 'Doctrine and history', 'Doutrina e história'), to: '/doctrine', description: l('Le KCC, la profession de foi, l’Alliance et le Prophète', 'The KCC, the profession of faith, the Covenant and the Prophet', 'O KCC, a profissão de fé, a Aliança e o Profeta') },
      { label: l('Catéchisme', 'Catechism', 'Catecismo'), to: '/catechisme', description: l('Questions et réponses de la foi KCCiste', 'Questions and answers of the KCCist faith', 'Perguntas e respostas da fé KCCista') },
      { label: l('Rites et célébrations', 'Rites and celebrations', 'Ritos e celebrações'), to: '/liturgie', description: l('Sabbat, onction, Alliance, mariage, deuil…', 'Sabbath, anointing, Covenant, marriage, mourning…', 'Sábado, unção, Aliança, casamento, luto…') },
      { label: l('L’appel du Prophète', 'The Prophet’s calling', 'O chamamento do Profeta'), to: '/appel-du-prophete', description: l('Le livre « Mon Appel » et sa biographie', 'The book “Mon Appel” and his biography', 'O livro «Mon Appel» e a sua biografia') },
      { label: l('Prédications et séminaires', 'Sermons and seminars', 'Pregações e seminários'), to: '/predications', description: l('L’enseignement du Chef Spirituel', 'The Spiritual Leader’s teaching', 'O ensino do Chefe Espiritual') },
      { label: l('Enseignements et histoire', 'Teachings and history', 'Ensinamentos e história'), to: '/enseignements', description: l('Parole du Prophète et récits de son appel', 'The Prophet’s word and the story of his calling', 'Palavra do Profeta e relatos do seu chamamento') },
      { label: l('Les Révérends Apôtres', 'The Reverend Apostles', 'Os Reverendos Apóstolos'), to: '/apotres', description: l('En vie et décédés, avec leur photo', 'Living and deceased, with their photo', 'Vivos e falecidos, com a sua foto') },
      { label: l('Galerie photo', 'Photo gallery', 'Galeria de fotos'), to: '/galerie', description: l('Cultes, mamans, temples et archives', 'Services, mothers, temples and archives', 'Cultos, mamãs, templos e arquivos') },
    ],
  },
  {
    key: 'nav.trainings', to: '/academie', children: [
      { label: l('Académie KCC', 'KCC Academy', 'Academia KCC'), to: '/academie', description: l('Apprendre et progresser', 'Learn and grow', 'Aprender e progredir') },
      { label: l('Catalogue des formations', 'Course catalogue', 'Catálogo de formações'), to: '/academie/formations', description: l('Toutes les formations', 'All courses', 'Todas as formações') },
      { label: l('Vérifier un certificat', 'Verify a certificate', 'Verificar um certificado'), to: '/academie/verifier', description: l('Authenticité par identifiant', 'Check authenticity by ID', 'Autenticidade por identificador') },
    ],
  },
  {
    key: 'nav.activities', to: '/agenda', children: [
      { label: l('Agenda et événements', 'Calendar and events', 'Agenda e eventos'), to: '/agenda', description: l('Cultes, réunions, séminaires…', 'Services, meetings, seminars…', 'Cultos, reuniões, seminários…') },
      { label: l('Actualités et annonces', 'News and announcements', 'Notícias e anúncios'), to: '/actualites', description: l('Les dernières publications', 'Latest posts', 'As últimas publicações') },
    ],
  },
  {
    key: 'nav.media', to: '/musique', children: [
      { label: l('KCC Music', 'KCC Music', 'KCC Music'), to: '/musique', description: l('Chants, albums et lecteur', 'Songs, albums and player', 'Cânticos, álbuns e leitor') },
      { label: l('Vidéos YouTube', 'YouTube videos', 'Vídeos YouTube'), to: '/videos', description: l('La chaîne « Je suis KCCiste »', 'The “Je suis KCCiste” channel', 'O canal «Je suis KCCiste»') },
      { label: l('Artistes et chorales', 'Artists and choirs', 'Artistas e coros'), to: '/musique/artistes', description: l('Les voix de la communauté', 'The voices of the community', 'As vozes da comunidade') },
      { label: l('Bibliothèque numérique', 'Digital library', 'Biblioteca digital'), to: '/bibliotheque', description: l('Documents et supports', 'Documents and resources', 'Documentos e materiais') },
      { label: l('Recueil de cantiques', 'Hymn book', 'Hinário'), to: '/cantiques', description: l('Cantiques lingala et kikongo', 'Hymns in Lingala and Kikongo', 'Hinos em lingala e kikongo') },
      { label: l('Paroles de chants', 'Song lyrics', 'Letras de cânticos'), to: '/enseignements#chants', description: l('Chants de la communauté', 'Songs of the community', 'Cânticos da comunidade') },
    ],
  },
  {
    key: 'nav.solidarity', to: '/solidarite', children: [
      { label: l('Solidarité KCC', 'KCC Solidarity', 'Solidariedade KCC'), to: '/solidarite', description: l('Agir ensemble', 'Acting together', 'Agir juntos') },
      { label: l('Projets de solidarité', 'Solidarity projects', 'Projetos de solidariedade'), to: '/solidarite/projets', description: l('Projets en cours et bilans', 'Current projects and reports', 'Projetos em curso e balanços') },
      { label: l('Caisse d’assistance sociale', 'Social assistance fund', 'Caixa de assistência social'), to: '/enseignements#caisse', description: l('Règlement deuil et maladie', 'Bereavement and illness rules', 'Regulamento de luto e doença') },
    ],
  },
];
