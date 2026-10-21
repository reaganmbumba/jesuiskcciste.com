/**
 * « Je suis KCCiste » : caractéristiques qui font de DIZOLELE-MPUNGU WAFIDUSWA
 * Isaac un Prophète de l'Éternel. Texte transmis par Reagan Mbumba
 * (2026-10-21), publié en plusieurs parties : ajouter les suivantes à
 * `prophetTraitParts` (mêmes champs en EN et PT).
 */

export interface ProphetTrait {
  id: string;
  title: string;
  /** Terme lingala donné entre parenthèses dans le texte. */
  term: string;
  intro: string;
  /** Références bibliques : `who` est facultatif (ex. « Moïse »). */
  bible: { who?: string; ref: string; quote?: string }[];
  prophet: string[];
  signs?: string[];
  conclusion?: string;
}

export interface ProphetTraitPart { id: string; label: string; traits: ProphetTrait[] }

export const prophetTraitsIntro = {
  title: 'Caractéristiques qui font de lui un Prophète de l’Éternel',
  photoAlt: 'S. Em. DIZOLELE-MPUNGU WAFIDUSWA Isaac en 1955, en 1980 et en 2005',
  photoCaption: 'S. Em. DIZOLELE-MPUNGU WAFIDUSWA Isaac, Prophète et Fondateur, Chef spirituel et Représentant légal : à la naissance de l’Église (8 mars 1955), à sa reconnaissance juridique (30 avril 1980) et à la promulgation des changements (21 août 2005).',
};

export const prophetTraitParts: ProphetTraitPart[] = [
  {
    id: 'partie-1',
    label: 'Première partie',
    traits: [
      {
        id: 'appel',
        title: 'Appel',
        term: 'Kobiangama',
        intro: 'Un Prophète doit d’abord être appelé par l’Éternel. Pour les anciens Prophètes, on peut le voir dans la Bible :',
        bible: [
          { who: 'Moïse', ref: 'Exode 3.6' },
          { who: 'Samuel', ref: '1 Samuel 3.3-10' },
        ],
        prophet: [
          'Pour le Prophète DIZOLELE, son appel est remarquable, avec les apparitions du 8 au 13 mars 1955 à la FORAKAM, à Seke-Banza (cf. livre « Mon Appel », pages 13 à 23).',
        ],
      },
      {
        id: 'election',
        title: 'Élection',
        term: 'Koponama',
        intro: 'Le Prophète est choisi par l’Éternel avant même sa naissance. On peut le voir dans la Bible :',
        bible: [
          { ref: 'Jérémie 1.4-5', quote: '« … avant que je t’eusse formé dans le sein de ta mère, je te connaissais ; avant que… »' },
        ],
        prophet: ['Pour le Prophète DIZOLELE, plusieurs faits témoignent de cette élection :'],
        signs: [
          'Son nom : de MPUTU (qui signifie « pauvre en progéniture ») à DIZOLELE (« ce que Dieu veut »), cette dénomination est un mystère dont seul Dieu connaissait le sens.',
          'À l’enregistrement de l’enfant à l’état civil, au secteur de Kinkenge, malgré la présence des parents, l’agent territorial écrivit que l’enfant DIZOLELE est du « clan X » ! Cela signifie un enfant qui n’a pas de clan, en d’autres termes qui appartient à tous les clans, et l’on voit aujourd’hui des gens venant des quatre coins de la terre.',
          'La guérison de son petit frère NGITUKULU par imposition des mains, de manière instinctive. L’Éternel voulait ce miracle et l’a inspiré, car comment imaginer qu’un petit enfant pense à imposer les mains, et à examiner l’effet contraire d’un acte instinctif ?',
          'Dans la maison de Monsieur LUEMBA, il se passa quelque chose : M. THAMBA Justin, son grand frère, venu déposer sa femme, voulut déranger le jeune DIZOLELE la nuit, mais fut sérieusement molesté par des anges.',
        ],
        conclusion: 'Tous ces éléments montrent que DIZOLELE est un personnage élu de Dieu.',
      },
      {
        id: 'resistance',
        title: 'Résistance',
        term: 'Koboya',
        intro: 'Vu la grandeur, l’effort spirituel et physique que requiert le travail de Dieu, on observe d’emblée chez tous les prophètes un refus de s’y lancer. On peut le voir dans la Bible :',
        bible: [
          { who: 'Jonas', ref: 'Jonas 1.1-3' },
          { who: 'Jérémie', ref: 'Jérémie 1.6-7' },
        ],
        prophet: [
          'Pour le Prophète DIZOLELE, son refus avait pour argument son âge (« je suis encore trop jeune, trouve un adulte… »). On le voit dans « Mon Appel », pages 28-29.',
        ],
      },
    ],
  },
];
