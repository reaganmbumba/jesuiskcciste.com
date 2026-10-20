import type { TranslationKey } from '@/i18n';

export interface NavLinkItem { label: string; to: string; description?: string }
export interface NavGroup { key: TranslationKey; to: string; children?: NavLinkItem[] }

export const MAIN_NAV: NavGroup[] = [
  { key: 'nav.home', to: '/' },
  {
    key: 'nav.community', to: '/communaute', children: [
      { label: 'Communauté KCCiste', to: '/communaute', description: 'Vie et organisation de la communauté' },
      { label: 'Annuaire des membres', to: '/communaute/annuaire', description: 'Retrouver les membres' },
      { label: 'Paroisses', to: '/paroisses', description: 'Les paroisses enregistrées' },
      { label: 'Sections', to: '/sections', description: 'Les sections rattachées' },
      { label: 'À propos de l’Église', to: '/a-propos', description: 'Présentation officielle' },
      { label: 'Doctrine et histoire', to: '/doctrine', description: 'Le KCC, la profession de foi, l’Alliance et le Prophète' },
      { label: 'Enseignements et histoire', to: '/enseignements', description: 'Parole du Prophète et récits de son appel' },
    ],
  },
  {
    key: 'nav.trainings', to: '/academie', children: [
      { label: 'Académie KCC', to: '/academie', description: 'Apprendre et progresser' },
      { label: 'Catalogue des formations', to: '/academie/formations', description: 'Toutes les formations' },
      { label: 'Vérifier un certificat', to: '/academie/verifier', description: 'Authenticité par identifiant' },
    ],
  },
  {
    key: 'nav.activities', to: '/agenda', children: [
      { label: 'Agenda et événements', to: '/agenda', description: 'Cultes, réunions, séminaires…' },
      { label: 'Actualités et annonces', to: '/actualites', description: 'Les dernières publications' },
    ],
  },
  {
    key: 'nav.media', to: '/musique', children: [
      { label: 'KCC Music', to: '/musique', description: 'Chants, albums et lecteur' },
      { label: 'Artistes et chorales', to: '/musique/artistes', description: 'Les voix de la communauté' },
      { label: 'Bibliothèque numérique', to: '/bibliotheque', description: 'Documents et supports' },
      { label: 'Recueil de cantiques', to: '/cantiques', description: 'Cantiques lingala et kikongo' },
      { label: 'Paroles de chants', to: '/enseignements#chants', description: 'Chants de la communauté' },
    ],
  },
  {
    key: 'nav.solidarity', to: '/solidarite', children: [
      { label: 'Solidarité KCC', to: '/solidarite', description: 'Agir ensemble' },
      { label: 'Projets de solidarité', to: '/solidarite/projets', description: 'Projets en cours et bilans' },
      { label: 'Caisse d’assistance sociale', to: '/enseignements#caisse', description: 'Règlement deuil et maladie' },
    ],
  },
];
