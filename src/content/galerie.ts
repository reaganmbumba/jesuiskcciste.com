/**
 * Photos d'archives du dossier « Documents Église DIPARVIE »
 * (predication/photos de son eminence), recadrées et marquées du filigrane
 * « JE SUIS KCCiste » (scripts/watermark-photos.py). Photos montrant des
 * croix, des obsèques ou des scènes familiales écartées.
 */
import type { Tri } from '@/i18n';

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

export type GalleryTheme = 'culte' | 'mamans' | 'temples' | 'histoire';

export interface GalleryPhoto { src: string; w: number; h: number; theme: GalleryTheme; caption: Tri }

export const galleryThemes: Record<GalleryTheme, Tri> = {
  culte: T('Cultes et assemblées', 'Services and gatherings', 'Cultos e assembleias'),
  mamans: T('Les mamans', 'The mothers', 'As mamãs'),
  temples: T('Temples et dédicaces', 'Temples and dedications', 'Templos e dedicações'),
  histoire: T('Archives anciennes', 'Early archives', 'Arquivos antigos'),
};

const g = (file: string, w: number, h: number, theme: GalleryTheme, caption: Tri): GalleryPhoto => ({ src: `/images/galerie/${file}`, w, h, theme, caption });

export const galleryPhotos: GalleryPhoto[] = [
  g('foule-assemblee.jpg', 1001, 675, 'culte', T('Une grande foule de fidèles rassemblée autour des serviteurs', 'A large crowd of believers gathered around the servants', 'Uma grande multidão de fiéis reunida à volta dos servos')),
  g('prophete-lecture-dedicace.jpg', 951, 1400, 'temples', T('Son Éminence le Chef Spirituel lisant un texte lors d’une dédicace', 'His Eminence the Spiritual Leader reading a text at a dedication', 'Sua Eminência o Chefe Espiritual lendo um texto numa dedicação')),
  g('paroisse-belvedere-matadi.jpg', 1400, 950, 'temples', T('Le temple de la paroisse de Belvédère, à Matadi', 'The temple of the Belvédère parish in Matadi', 'O templo da paróquia de Belvédère, em Matadi')),
  g('mamans-pagne-kcc.jpg', 1400, 944, 'mamans', T('Des mamans en pagne KCC', 'Mothers wearing KCC cloth', 'Mamãs com pano KCC')),
  g('procession-des-mamans.jpg', 1400, 934, 'mamans', T('Procession des mamans', 'Procession of the mothers', 'Procissão das mamãs')),
  g('maman-pagne-kcc.jpg', 948, 1400, 'mamans', T('Une maman en tenue aux lettres KCC', 'A mother in an outfit bearing the KCC letters', 'Uma mamã com traje com as letras KCC')),
  g('priere-des-anciens.jpg', 673, 1001, 'culte', T('Les anciens réunis dans la prière', 'Elders gathered in prayer', 'Os anciãos reunidos em oração')),
  g('assemblee-attentive.jpg', 1013, 686, 'culte', T('Une assemblée attentive', 'An attentive gathering', 'Uma assembleia atenta')),
  g('repas-fraternel.jpg', 984, 712, 'culte', T('Un repas de communion fraternelle', 'A meal of fraternal communion', 'Uma refeição de comunhão fraterna')),
  g('serviteurs-en-uniforme.jpg', 1010, 713, 'culte', T('Des serviteurs en uniforme devant la table du culte', 'Servants in uniform in front of the service table', 'Servos de uniforme diante da mesa do culto')),
  g('seance-de-travail.jpg', 975, 680, 'culte', T('Une séance de travail des responsables', 'A working session of the leaders', 'Uma sessão de trabalho dos responsáveis')),
  g('archive-serviteurs-noir-et-blanc.jpg', 1383, 949, 'histoire', T('Archive en noir et blanc : un groupe de serviteurs', 'Black-and-white archive: a group of servants', 'Arquivo a preto e branco: um grupo de servos')),
  g('archive-groupe-sepia.jpg', 1383, 910, 'histoire', T('Archive ancienne : une communauté rassemblée', 'Early archive: a community gathered together', 'Arquivo antigo: uma comunidade reunida')),
];

/**
 * Clé d'une photo dans son lien partagé /galerie/photo/<clé> : le nom du fichier
 * sans extension (« foule-assemblee », « 2026-10-22-3f9a1c2b7d4e » pour une photo
 * ajoutée dans l'administration). Le Worker retrouve la photo par cette clé.
 */
export const photoKey = (src: string) =>
  (src.split(/[?#]/)[0].split('/').pop() ?? '').replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
