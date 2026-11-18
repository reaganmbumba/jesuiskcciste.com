import type { Locale } from '@/i18n';

type L = Record<Locale, string>;
const L = (fr: string, en: string, pt: string): L => ({ fr, en, pt });

/**
 * Fiches du Mémorial livrées avec le site : elles s'affichent même avant le
 * collage du SQL dans Supabase. Une fiche ajoutée dans l'administration avec
 * le même « slug » la remplace (pour la compléter ou la corriger).
 */
export interface ShippedMemorial {
  slug: string;
  fullName: string;
  honorific: L;
  parish: string;
  city: string;
  birthDate?: string | null;
  deathDate?: string | null;
  burialDate?: string | null;
  photoUrl: string;
  epitaph: L;
  biography: L;
  articleUrl?: string | null;
  /** Date d'ajout, pour l'ordre d'affichage. */
  createdAt: string;
}

export const SHIPPED_MEMORIALS: ShippedMemorial[] = [
  {
    slug: 'malonda-mvumbi-ruth',
    fullName: 'MALONDA MVUMBI Ruth',
    honorific: L('Maman Diaconesse', 'Mother Deaconess', 'Mamã Diaconisa'),
    parish: 'Paroisse de Mbungu',
    city: 'Boma',
    burialDate: '2026-11-14',
    photoUrl: '/images/memorial/malonda-mvumbi-ruth.jpg',
    epitaph: L('Ton amour et ta bonté resteront à jamais dans nos cœurs.', 'Your love and kindness will remain in our hearts forever.', 'O teu amor e a tua bondade ficarão para sempre nos nossos corações.'),
    biography: L(
      'Maman Diaconesse MALONDA MVUMBI Ruth servait l’Église Bon Nouveau Message (KCC) à la Paroisse de Mbungu, à Boma. Mère, tante et grand-mère aimée de la Famille DINASIA, elle laisse le souvenir d’une femme de foi, douce et dévouée.\n\nElle a été conduite à sa dernière demeure le samedi 14 novembre 2026, au cimetière Ciel Ouvert de Boma, après la veillée et le recueillement à la Salle Mont Sinaï.\n\n« Que son âme repose en paix ! »',
      'Mother Deaconess MALONDA MVUMBI Ruth served the Bon Nouveau Message Church (KCC) at the Mbungu Parish in Boma. A beloved mother, aunt and grandmother of the DINASIA Family, she is remembered as a gentle and devoted woman of faith.\n\nShe was laid to rest on Saturday 14 November 2026 at the Ciel Ouvert cemetery in Boma, after the wake and time of contemplation at the Mont Sinaï Hall.\n\n“May her soul rest in peace!”',
      'A Mamã Diaconisa MALONDA MVUMBI Ruth servia a Igreja Bon Nouveau Message (KCC) na Paróquia de Mbungu, em Boma. Mãe, tia e avó amada da Família DINASIA, deixa a memória de uma mulher de fé, meiga e dedicada.\n\nFoi sepultada no sábado, 14 de novembro de 2026, no cemitério Ciel Ouvert de Boma, após o velório e o recolhimento na Sala Mont Sinaï.\n\n« Que a sua alma descanse em paz! »',
    ),
    articleUrl: '/actualites/edito-ann-communique-deces-malonda-mvumbi-ruth',
    createdAt: '2026-11-08T17:30:00Z',
  },
];
