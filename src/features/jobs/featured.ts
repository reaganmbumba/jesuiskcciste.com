import type { Tri } from '@/i18n';

/**
 * Offres « à la une » de la rubrique Opportunités et emplois : avis de
 * recrutement reçus sur papier (photo de l'affiche officielle) et recopiés
 * mot pour mot. Chaque offre disparaît d'elle-même après sa date limite.
 */
export interface FeaturedPost { count: number; title: string; tasks: string[]; qualifications: string[] }

export interface FeaturedOffer {
  /** Ancre de la carte sur /emplois (lien à partager : /emplois#id). */
  id: string;
  organization: string;
  establishment: string;
  reference: string;
  intro: string;
  location: string;
  startLabel: string;
  classification: string;
  posts: FeaturedPost[];
  documents: string[];
  email: string;
  phone: string;
  /** Adresse où déposer le dossier sous pli fermé. */
  depositAt: string;
  closingDate: string;
  startDate: string;
  conditions: string[];
  signedAt: string;
  signedBy: string;
  poster: string;
  summary: Tri;
}

export const FEATURED_OFFERS: FeaturedOffer[] = [
  {
    id: 'la-grace',
    organization: 'Fondation La Grâce (FOGRA)',
    establishment: 'Centre Hospitalier La Grâce',
    reference: 'N/Réf. : FG/CH/MIS/304/PXMK/JNL/2026',
    intro: 'Dans le cadre du renforcement de son personnel et de l’amélioration continue de la qualité des soins, la Fondation La Grâce, à travers son Centre Hospitalier LA GRÂCE situé à Muanda, lance un avis de recrutement pour les postes ci-après.',
    location: 'Av. Apenela n°586, Q/ Océan, Muanda Ville (Kongo Central, RD Congo)',
    startLabel: 'Décembre 2026',
    classification: 'À déterminer après recrutement',
    posts: [
      {
        count: 3,
        title: 'Laborantins / Laborantines',
        tasks: [
          'Réaliser les analyses biologiques conformément aux prescriptions médicales.',
          'Assurer la réception, l’identification et le traitement des prélèvements.',
          'Garantir la fiabilité et la confidentialité des résultats.',
          'Veiller à l’entretien des équipements et matériels de laboratoire.',
          'Respecter les normes d’hygiène, de biosécurité et de qualité.',
          'Assurer une bonne collaboration avec les autres services médicaux.',
        ],
        qualifications: [
          'Être détenteur d’un diplôme reconnu en techniques de laboratoire médical.',
          'Justifier, de préférence, d’une expérience professionnelle dans un établissement de santé.',
          'Maîtriser les techniques de prélèvement et d’analyses biologiques.',
          'Savoir assurer les rendus des résultats.',
          'Faire preuve de rigueur, de discrétion et d’esprit d’équipe.',
        ],
      },
      {
        count: 4,
        title: 'Infirmiers / Infirmières A1 et A2',
        tasks: [
          'Assurer les soins infirmiers aux patients conformément aux prescriptions médicales.',
          'Participer à l’accueil, à l’orientation et à la surveillance des malades.',
          'Administrer les traitements prescrits et assurer le suivi des patients.',
          'Tenir correctement les fiches et dossiers de soins.',
          'Veiller au respect des règles d’hygiène, de prévention et de sécurité.',
          'Travailler en collaboration avec l’équipe médicale et paramédicale.',
        ],
        qualifications: [
          'Être détenteur d’un diplôme d’infirmier A1 ou A2 reconnu.',
          'Avoir le numéro d’ordre d’infirmier.',
          'Une expérience professionnelle dans les soins infirmiers constitue un atout.',
          'Faire preuve de professionnalisme, de disponibilité et de discipline.',
          'Avoir le sens de l’écoute, de la responsabilité et du respect des patients.',
        ],
      },
    ],
    documents: [
      'Une lettre de demande d’emploi adressée au Président Administrateur Général de la Fondation LA GRÂCE',
      'Un curriculum vitae actualisé',
      'Une copie du diplôme',
      'Une copie de la pièce d’identité',
      'Les attestations de services rendus, le cas échéant',
      'Les documents professionnels requis pour l’exercice de la fonction',
    ],
    email: 'lagrace.pservice@live.fr',
    phone: '+243 898 389 099',
    depositAt: 'Secrétariat administratif du Centre Hospitalier La Grâce, Muanda (Kongo Central, RD Congo)',
    closingDate: '2026-11-30',
    startDate: '2026-12-10',
    conditions: [
      'Le recrutement est gratuit et ne donne lieu à aucun paiement de frais de candidature.',
      'La Fondation La Grâce garantit l’égalité des chances aux candidats.',
      'Seuls les candidats présélectionnés seront contactés pour la suite du processus de recrutement.',
      'La Fondation se réserve le droit de procéder à des entretiens et tests de sélection.',
    ],
    signedAt: 'Fait à Muanda, le 12 novembre 2026',
    signedBy: 'Joël NKASA LUSALA, Directeur Administratif & RH',
    poster: '/images/emplois/la-grace-recrutement.jpg',
    summary: {
      fr: 'Le Centre Hospitalier La Grâce de Muanda recrute 3 laborantins et 4 infirmiers A1/A2. Date limite : 30 novembre 2026.',
      en: 'La Grâce Hospital Centre in Muanda is hiring 3 laboratory technicians and 4 A1/A2 nurses. Deadline: 30 November 2026.',
      pt: 'O Centro Hospitalar La Grâce de Muanda recruta 3 técnicos de laboratório e 4 enfermeiros A1/A2. Prazo: 30 de novembro de 2026.',
    },
  },
];

/** Offres à la une encore ouvertes (la date limite est incluse). */
export function openFeaturedOffers(now = new Date()): FeaturedOffer[] {
  const today = now.toISOString().slice(0, 10);
  return FEATURED_OFFERS.filter((o) => o.closingDate >= today);
}
