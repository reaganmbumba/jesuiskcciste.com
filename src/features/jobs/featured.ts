import type { Tri } from '@/i18n';

/**
 * Offres « à la une » de la rubrique Opportunités et emplois : avis de
 * recrutement reçus sur papier (photo de l'affiche officielle) et recopiés
 * mot pour mot. Chaque offre disparaît d'elle-même après sa date limite.
 */
export type FeaturedIcon = 'lab' | 'care' | 'training' | 'helmet' | 'shield' | 'leaf' | 'wrench' | 'bolt' | 'flame' | 'heart' | 'anchor';

export interface FeaturedPost {
  /** Nombre de places (absent quand l'affiche ne le précise pas). */
  count?: number;
  title: string;
  tasks: string[];
  qualifications: string[];
  /** Référence propre au poste, quand chaque poste a sa propre affiche. */
  reference?: string;
  icon?: FeaturedIcon;
}

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
  email?: string;
  phone?: string;
  /** Adresse où déposer le dossier sous pli fermé. */
  depositAt: string;
  /** Texte « Comment postuler » (par défaut : e-mail, téléphone ou pli fermé). */
  applyText?: string;
  /** Ville affichée dans le titre du message WhatsApp. */
  city: string;
  headerIcon?: FeaturedIcon;
  closingDate: string;
  /** Heure limite le dernier jour, ex. « 12 h 00 ». */
  closingTime?: string;
  /** Date exacte de prise de fonction ; sinon startLabel est affiché. */
  startDate?: string;
  conditions: string[];
  signedAt: string;
  signedBy: string;
  poster: string;
  summary: Tri;
}

export const FEATURED_OFFERS: FeaturedOffer[] = [
  {
    id: 'mota-engil-banana',
    organization: 'Mota-Engil RDC SAS',
    establishment: 'Port en eau profonde de Banana',
    reference: 'Réf. ME/RH/EM/…/12-13/11/2026',
    intro: 'Mota-Engil RDC SAS recrute pour le site du projet du Port en eau profonde, à la Pointe de Banana (commune de Moanda, Kongo Central). Huit offres d’emploi ont été affichées, visées par l’ONEM (antenne de Moanda). Prise de fonction en décembre 2026.',
    location: 'Pointe de Banana, commune de Moanda (Kongo Central, RD Congo)',
    city: 'Banana, Moanda',
    headerIcon: 'anchor',
    startLabel: 'Décembre 2026',
    classification: 'TBD (à déterminer)',
    posts: [
      {
        title: 'Agent de formation HSE', icon: 'training', reference: 'ME/RH/EM/OT/12/11/2026',
        tasks: [
          'Organiser et dispenser les séances d’induction HSE pour les nouveaux travailleurs, visiteurs et sous-traitants.',
          'Assurer la formation et la sensibilisation du personnel sur les règles de santé, sécurité et environnement.',
          'Identifier les besoins en formation HSE du personnel et élaborer un programme de formation adapté.',
          'Veiller à ce que tous les travailleurs disposent des formations et autorisations nécessaires avant d’exécuter leurs tâches.',
          'Préparer les rapports périodiques sur les activités d’induction et de formation HSE.',
        ],
        qualifications: [
          'Être titulaire d’un diplôme universitaire ou technique en HSE, QHSE, gestion des risques, pédagogie ou domaine similaire.',
          'Justifier d’une expérience professionnelle préalable en entreprise, idéalement dans le secteur de la construction, du génie civil ou industriel.',
          'Être organisé, pédagogue, dynamique et capable de travailler en équipe.',
          'Avoir une expérience dans l’animation de formations et de séances de sensibilisation.',
        ],
      },
      {
        title: 'HSE Assistant', icon: 'helmet', reference: 'ME/RH/EM/AS/12/11/2026',
        tasks: [
          'Assister le responsable HSE dans la mise en œuvre des règles d’hygiène, de sécurité et d’environnement sur le chantier.',
          'Veiller à l’application des procédures de sécurité et à l’utilisation correcte des équipements de protection individuelle (EPI).',
          'Sensibiliser le personnel aux risques professionnels et aux mesures de prévention.',
          'Effectuer des inspections régulières des zones de travail et identifier les situations dangereuses.',
          'Participer aux réunions de sécurité et aux causeries HSE (Toolbox Talks).',
        ],
        qualifications: [
          'Être titulaire d’un diplôme ou d’une formation en HSE, santé et sécurité au travail ou domaine similaire.',
          'Justifier d’une expérience professionnelle préalable en entreprise, idéalement dans le secteur de la construction ou industriel.',
          'Avoir une bonne connaissance des règles de santé et sécurité au travail.',
          'Être rigoureux, vigilant, organisé et proactif.',
        ],
      },
      {
        title: 'Ingénieur Sécurité', icon: 'shield', reference: 'ME/RH/EM/IS/12/11/2026',
        tasks: [
          'Superviser les activités de sécurité et veiller au respect des normes et réglementations HSE.',
          'Élaborer, mettre en œuvre et suivre les plans et procédures de santé et sécurité au travail.',
          'Superviser les inspections et audits de sécurité sur le chantier.',
          'Élaborer les statistiques et rapports périodiques de sécurité.',
          'Superviser les enquêtes sur les accidents, incidents et presque-accidents.',
          'Contrôler les travaux à haut risque : levage, excavation, travaux en hauteur, espaces confinés.',
        ],
        qualifications: [
          'Être titulaire d’un diplôme universitaire ou technique en santé et sécurité au travail, ingénierie, HSE ou domaine similaire.',
          'Justifier d’une expérience professionnelle confirmée en entreprise, idéalement dans les secteurs de la construction, du génie civil ou industriel.',
          'Avoir une bonne connaissance des procédures d’analyse des accidents et de prévention des risques.',
          'Avoir de bonnes capacités de leadership, de communication et de prise de décision.',
        ],
      },
      {
        title: 'Technicien en surveillance et suivi environnemental', icon: 'leaf', reference: 'ME/RH/EM/MMO/13/11/2026',
        tasks: [
          'Effectuer les inspections et observations environnementales sur le terrain.',
          'Assurer le suivi des impacts des activités du chantier sur l’environnement.',
          'Surveiller la faune et la flore dans les zones de travaux.',
          'Participer aux activités de sensibilisation environnementale du personnel.',
          'Collecter, enregistrer et analyser les données environnementales.',
        ],
        qualifications: [
          'Être titulaire d’un diplôme en sciences de l’environnement, biologie, écologie, sciences naturelles ou domaine similaire.',
          'Justifier d’une expérience professionnelle de 2 à 3 ans dans le suivi environnemental sur chantier ou projet industriel.',
          'Avoir des connaissances en surveillance de la faune et de la flore.',
          'Être disponible pour travailler sur le terrain et dans des conditions parfois difficiles.',
        ],
      },
      {
        title: 'Mécanicien Industriel', icon: 'wrench', reference: 'ME/RH/EM/MC/12/11/2026',
        tasks: [
          'Assurer l’entretien, la maintenance et la réparation des machines et équipements industriels.',
          'Diagnostiquer les pannes mécaniques et identifier les dysfonctionnements des équipements.',
          'Effectuer le démontage, le montage et le remplacement des pièces mécaniques défectueuses.',
          'Réaliser des travaux de maintenance préventive et corrective sur les installations industrielles.',
          'Intervenir sur les moteurs, pompes, réducteurs, roulements, compresseurs et systèmes de transmission.',
          'Effectuer les réglages, alignements et contrôles des équipements mécaniques.',
        ],
        qualifications: [
          'Être titulaire d’un diplôme ou d’une formation technique en mécanique industrielle ou maintenance mécanique.',
          'Justifier d’une expérience professionnelle confirmée en entreprise ou dans un environnement industriel.',
          'Savoir diagnostiquer et réparer les pannes des équipements industriels.',
          'Avoir une bonne connaissance des machines et installations industrielles.',
        ],
      },
      {
        title: 'Superviseur ELM (électromécanique)', icon: 'bolt', reference: 'ME/RH/EM/ELM/13/11/2026',
        tasks: [
          'Organiser et planifier les travaux de maintenance des équipements.',
          'Assurer le suivi des interventions électriques, mécaniques et hydrauliques.',
          'Coordonner les équipes de techniciens et mécaniciens.',
          'Diagnostiquer les pannes et proposer des solutions techniques.',
          'Préparer les rapports techniques et les rapports d’intervention.',
        ],
        qualifications: [
          'Être titulaire d’un diplôme en électromécanique, génie électrique ou maintenance industrielle.',
          'Avoir une expérience professionnelle de 3 à 5 ans minimum dans un poste similaire.',
          'Avoir de solides connaissances en électricité industrielle, mécanique et hydraulique.',
          'Avoir une bonne maîtrise des équipements de chantier, engins lourds et groupes électrogènes.',
        ],
      },
      {
        title: 'Infirmier', icon: 'care', reference: 'ME/RH/EM/INF/13/11/2026',
        tasks: [
          'Assurer les premiers soins aux travailleurs.',
          'Effectuer les consultations et les soins infirmiers.',
          'Gérer les urgences médicales et organiser les évacuations sanitaires si nécessaire.',
          'Participer aux campagnes de sensibilisation à l’hygiène et à la sécurité.',
          'Veiller à la disponibilité des médicaments et du matériel médical.',
        ],
        qualifications: [
          'Être titulaire d’un diplôme universitaire en sciences infirmières.',
          'Avoir une expérience professionnelle de 2 à 3 ans minimum.',
          'Maîtriser les gestes de premiers secours.',
          'Avoir le sens de la responsabilité, de la confidentialité et de la discipline.',
        ],
      },
      {
        title: 'Soudeur', icon: 'flame', reference: 'ME/RH/EM/SD/12/11/2026',
        tasks: [
          'Réaliser des travaux de soudage sur différents types de structures et pièces métalliques (tôles, tubes, tuyauteries, profilés et structures métalliques).',
          'Réaliser des travaux de réparation, de renforcement et de maintenance des équipements et structures métalliques.',
          'Effectuer des soudures dans différentes positions : à plat (1G), horizontale (2G), verticale montante et descendante (3G), ainsi qu’au plafond (4G).',
          'Effectuer le soudage de différentes épaisseurs et catégories de métaux selon les exigences techniques.',
          'Respecter les normes de qualité, les procédures de soudage et les exigences techniques du chantier.',
        ],
        qualifications: [
          'Avoir une formation en soudure ou une expérience professionnelle équivalente.',
          'Avoir une expérience professionnelle confirmée en entreprise ou sur des chantiers industriels.',
          'Maîtriser les techniques de soudure.',
          'Être capable de travailler en équipe et sous pression.',
        ],
      },
    ],
    documents: [
      'CV et lettre de motivation',
      'Copie des diplômes et attestations de travail',
      'Preuve d’identité (copie de la carte d’électeur ou du passeport)',
      'Carte ONEM (photocopie)',
    ],
    depositAt: 'Mota-Engil RDC SAS, Pointe de Banana, site du projet du Port en eau profonde, commune de Moanda, Province du Kongo Central (RD Congo)',
    applyText: 'Le dossier se dépose uniquement sous pli fermé, à l’adresse ci-dessous. Écrivez sur l’enveloppe vos noms complets, votre numéro de téléphone et le poste visé (un pli par poste).',
    closingDate: '2026-11-27',
    closingTime: '12 h 00',
    conditions: [
      'Dépôt du dossier sous pli fermé avec noms complets, téléphone et poste sur l’enveloppe.',
      'Mota-Engil RDC SAS s’engage en faveur de l’égalité des chances et s’oppose à toutes formes de discrimination. Les candidatures féminines sont fortement encouragées.',
      'Recrutement gratuit, sans aucun frais à aucune étape.',
      'Toute falsification d’informations ou de documents entraînera le rejet de la candidature ainsi qu’une mise sur liste noire (« blacklistage »).',
      'Sans retour de la société après 30 jours, considérez que votre candidature n’a pas été retenue. Vous êtes toutefois encouragés à postuler à de futures opportunités correspondant à votre profil.',
    ],
    signedAt: 'Affiches visées par l’ONEM, antenne de Moanda',
    signedBy: 'Mota-Engil RDC SAS',
    poster: '/images/emplois/mota-engil-banana-recrutement.jpg',
    summary: {
      fr: 'Mota-Engil RDC recrute 8 profils pour le Port en eau profonde de Banana (Moanda) : HSE, sécurité, environnement, mécanique, électromécanique, soins infirmiers et soudure. Dépôt sous pli fermé avant le vendredi 27 novembre 2026 à 12 h 00.',
      en: 'Mota-Engil DRC is hiring 8 profiles for the Banana deep-water port (Moanda): HSE, safety, environment, mechanics, electromechanics, nursing and welding. Sealed applications before Friday 27 November 2026 at 12:00.',
      pt: 'A Mota-Engil RDC recruta 8 perfis para o Porto de águas profundas de Banana (Moanda): HSE, segurança, ambiente, mecânica, eletromecânica, enfermagem e soldadura. Candidaturas em envelope fechado até sexta-feira, 27 de novembro de 2026, às 12h00.',
    },
  },
  {
    id: 'la-grace',
    organization: 'Fondation La Grâce (FOGRA)',
    establishment: 'Centre Hospitalier La Grâce',
    reference: 'N/Réf. : FG/CH/MIS/304/PXMK/JNL/2026',
    intro: 'Dans le cadre du renforcement de son personnel et de l’amélioration continue de la qualité des soins, la Fondation La Grâce, à travers son Centre Hospitalier LA GRÂCE situé à Muanda, lance un avis de recrutement pour les postes ci-après.',
    location: 'Av. Apenela n°586, Q/ Océan, Muanda Ville (Kongo Central, RD Congo)',
    city: 'Muanda',
    headerIcon: 'heart',
    startLabel: 'Décembre 2026',
    classification: 'À déterminer après recrutement',
    posts: [
      {
        count: 3,
        title: 'Laborantins / Laborantines',
        icon: 'lab',
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
        icon: 'care',
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
    applyText: 'Envoyez votre dossier à la direction administrative et des ressources humaines par e-mail, appelez le numéro ci-dessous, ou déposez-le sous pli fermé au secrétariat administratif du Centre Hospitalier La Grâce, Muanda (Kongo Central, RD Congo).',
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
