import type { Tri } from '@/i18n';

/**
 * Biographies des Révérends Apôtres (rubrique « Biographies », /apotres/biographies).
 *
 * Chaque biographie est rattachée à la fiche de l'apôtre (table `apostles`) par
 * les mots de son nom : tous les mots de `match` doivent figurer dans le nom
 * enregistré (sans accents ni apostrophes, en majuscules). Pour ajouter un apôtre,
 * copier un bloc ci-dessous et le compléter. La plus récente en premier.
 */
export interface ApostleBiography {
  slug: string;
  /** Nom tel qu'il est publié dans la biographie. */
  name: string;
  match: string[];
  /** Photo(s) d'accompagnement, affichée en tête de la biographie et dans l'aperçu de partage. */
  image?: string;
  title: Tri;
  /** Repères affichés en tête (naissance, consécration…). */
  facts: { label: Tri; value: Tri }[];
  sections: { heading: Tri; paragraphs: Tri[] }[];
  /** Source ou mention de la rédaction. */
  credit: string;
  addedAt: string;
}

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

export const APOSTLE_BIOGRAPHIES: ApostleBiography[] = [
  {
    slug: 'nsongo-bernard',
    name: 'N’SONGO Bernard',
    match: ['NSONGO', 'BERNARD'],
    image: '/images/apotres/nsongo-bernard.jpg',
    title: T('Le Révérend Apôtre N’SONGO Bernard', 'Reverend Apostle N’SONGO Bernard', 'O Reverendo Apóstolo N’SONGO Bernard'),
    facts: [
      { label: T('Naissance', 'Born', 'Nascimento'), value: T('15 mai 1948 à Vunda (Kongo-Central)', '15 May 1948 in Vunda (Kongo-Central)', '15 de maio de 1948 em Vunda (Kongo-Central)') },
      { label: T('Entrée dans l’Église', 'Joined the Church', 'Entrada na Igreja'), value: T('1979', '1979', '1979') },
      { label: T('Consécration', 'Consecration', 'Consagração'), value: T('1995, paroisse de Masina', '1995, Masina parish', '1995, paróquia de Masina') },
    ],
    sections: [
      {
        heading: T('Origines et famille', 'Origins and family', 'Origens e família'),
        paragraphs: [
          T(
            'Le Révérend Apôtre N’SONGO Bernard est né le 15 mai 1948 à Vunda, dans la province du Kongo-Central (anciennement Bas-Congo). Il est le fils unique de sa mère, Nelly Wafwemono. Son père avait d’autres enfants : du côté paternel, il a une sœur, elle aussi diaconesse, et neuf frères.',
            'Reverend Apostle N’SONGO Bernard was born on 15 May 1948 in Vunda, in Kongo-Central province (formerly Bas-Congo). He is the only son of his mother, Nelly Wafwemono. His father had other children: on his father’s side he has a sister, also a deaconess, and nine brothers.',
            'O Reverendo Apóstolo N’SONGO Bernard nasceu a 15 de maio de 1948 em Vunda, na província do Kongo-Central (antigo Baixo-Congo). É o filho único da sua mãe, Nelly Wafwemono. O seu pai tinha outros filhos: do lado paterno, tem uma irmã, também diaconisa, e nove irmãos.',
          ),
        ],
      },
      {
        heading: T('Études et carrière', 'Studies and career', 'Estudos e carreira'),
        paragraphs: [
          T(
            'Il commence ses études primaires à l’internat de Ngombe Matadi, dans le Kongo-Central, où ses parents sont installés. En 1970, il part à l’Université de Kisangani pour y faire des études d’agronomie.',
            'He began primary school at the Ngombe Matadi boarding school in Kongo-Central, where his parents lived. In 1970 he went to the University of Kisangani to study agronomy.',
            'Começou os estudos primários no internato de Ngombe Matadi, no Kongo-Central, onde os seus pais viviam. Em 1970 foi para a Universidade de Kisangani estudar agronomia.',
          ),
          T(
            'Entré dans la fonction publique, il devient chef chargé de trois parcs nationaux dans l’Est du pays. À la demande de son père, il quitte ce poste et revient à Kinshasa pour reprendre des études : la gestion des entreprises à l’ISC, puis le management et la gestion informatique. Ce parcours est couronné par l’obtention de son diplôme en gestion. Déjà, parmi ceux de sa génération, il était distingué et encouragé pour ses études.',
            'Having joined the civil service, he became the officer in charge of three national parks in the east of the country. At his father’s request he left this post and returned to Kinshasa to study again: business management at the ISC, then management and computer management. This path was crowned by his degree in management. Already, among his generation, he was recognised and encouraged for his studies.',
            'Tendo entrado na função pública, tornou-se chefe responsável por três parques nacionais no leste do país. A pedido do seu pai, deixou esse cargo e regressou a Kinshasa para voltar a estudar: gestão de empresas no ISC, depois gestão e informática. Este percurso foi coroado com o seu diploma em gestão. Já entre os da sua geração, era distinguido e encorajado pelos seus estudos.',
          ),
        ],
      },
      {
        heading: T('La conversion', 'Conversion', 'A conversão'),
        paragraphs: [
          T(
            'Vers 1978, la Diaconesse Colette Miangana aborde son épouse, Béatrice Lufingu, en raison des liens de famille qui les unissent. La conversion de son épouse est suivie, en 1979, de la sienne.',
            'Around 1978, Deaconess Colette Miangana approached his wife, Béatrice Lufingu, through the family ties between them. His wife’s conversion was followed, in 1979, by his own.',
            'Por volta de 1978, a Diaconisa Colette Miangana abordou a sua esposa, Béatrice Lufingu, devido aos laços de família entre elas. A conversão da sua esposa foi seguida, em 1979, pela sua.',
          ),
          T(
            'Il est alors encadré par les Révérends Apôtres Mata et Manenga, à l’époque Prédicateur et Disciple, sous la supervision des Révérends Apôtres Lukanu, Muanda Kimbanza, Tutuma, Nsakala et Binda, et du Prophète lui-même. Devenu membre effectif de l’Église, il voit sa vie changer radicalement : le jeune homme décide d’abandonner ses rêves et ses passions personnelles pour servir l’Éternel.',
            'He was then mentored by Reverend Apostles Mata and Manenga, at the time a Preacher and a Disciple, under the supervision of Reverend Apostles Lukanu, Muanda Kimbanza, Tutuma, Nsakala and Binda, and of the Prophet himself. Once a full member of the Church, his life changed radically: the young man decided to give up his personal dreams and passions to serve the Lord.',
            'Foi então acompanhado pelos Reverendos Apóstolos Mata e Manenga, na altura Pregador e Discípulo, sob a supervisão dos Reverendos Apóstolos Lukanu, Muanda Kimbanza, Tutuma, Nsakala e Binda, e do próprio Profeta. Tornado membro efetivo da Igreja, a sua vida mudou radicalmente: o jovem decidiu abandonar os seus sonhos e paixões pessoais para servir o Senhor.',
          ),
        ],
      },
      {
        heading: T('Au service de l’Église', 'In the service of the Church', 'Ao serviço da Igreja'),
        paragraphs: [
          T(
            'En 1980, il est le secrétaire du premier Comité paroissial créé dans la paroisse de Masina, à l’initiative du Prophète, sous la présidence du Révérend Apôtre Tutuma.',
            'In 1980 he was secretary of the first Parish Committee created in the Masina parish, at the Prophet’s initiative, chaired by Reverend Apostle Tutuma.',
            'Em 1980 foi secretário do primeiro Comité paroquial criado na paróquia de Masina, por iniciativa do Profeta, presidido pelo Reverendo Apóstolo Tutuma.',
          ),
          T(
            'En 1991, lorsque la section autonome de N’djili est élevée au rang de paroisse, il en devient le secrétaire paroissial et le chef de la section Centre. De 1993 à 1995, il est chef de paroisse adjoint, après le départ du Révérend Apôtre Mata de N’djili pour Kisenso ; le Révérend Apôtre Ngudi Claude est alors chef de paroisse.',
            'In 1991, when the autonomous section of N’djili was raised to the rank of parish, he became its parish secretary and head of the Centre section. From 1993 to 1995 he was deputy head of the parish, after Reverend Apostle Mata left N’djili for Kisenso; Reverend Apostle Ngudi Claude was then head of the parish.',
            'Em 1991, quando a secção autónoma de N’djili foi elevada a paróquia, tornou-se o seu secretário paroquial e chefe da secção Centro. De 1993 a 1995 foi chefe de paróquia adjunto, depois da partida do Reverendo Apóstolo Mata de N’djili para Kisenso; o Reverendo Apóstolo Ngudi Claude era então chefe de paróquia.',
          ),
          T(
            'Lorsque le Révérend Apôtre Ngudi Claude annonce au Prophète son projet de départ pour l’Angola, le Prophète décide de titulariser le Révérend Apôtre N’SONGO comme chef de paroisse. C’est le Révérend Apôtre Mata Albert qui vient procéder à son installation.',
            'When Reverend Apostle Ngudi Claude told the Prophet of his plan to leave for Angola, the Prophet decided to confirm Reverend Apostle N’SONGO as head of the parish. Reverend Apostle Mata Albert came to install him.',
            'Quando o Reverendo Apóstolo Ngudi Claude anunciou ao Profeta o seu projeto de partir para Angola, o Profeta decidiu titularizar o Reverendo Apóstolo N’SONGO como chefe de paróquia. Foi o Reverendo Apóstolo Mata Albert quem veio proceder à sua instalação.',
          ),
        ],
      },
      {
        heading: T('La consécration', 'Consecration', 'A consagração'),
        paragraphs: [
          T(
            'Le Révérend Apôtre N’SONGO Bernard fait partie des plus anciennes promotions d’apôtres consacrés par le prophète Dizolele Mpungu Wafiduswa Isaac. Il a été consacré Apôtre en 1995, dans la paroisse de Masina, dans la même promotion que les Révérends Apôtres MANENGA MAMPUYA Gabriel, NGUBI, DOKOLO NGOMA Philippe et MATA MATUNDU Frédéric Albert.',
            'Reverend Apostle N’SONGO Bernard belongs to the oldest groups of apostles consecrated by the prophet Dizolele Mpungu Wafiduswa Isaac. He was consecrated Apostle in 1995 in the Masina parish, in the same group as Reverend Apostles MANENGA MAMPUYA Gabriel, NGUBI, DOKOLO NGOMA Philippe and MATA MATUNDU Frédéric Albert.',
            'O Reverendo Apóstolo N’SONGO Bernard faz parte das mais antigas promoções de apóstolos consagrados pelo profeta Dizolele Mpungu Wafiduswa Isaac. Foi consagrado Apóstolo em 1995, na paróquia de Masina, na mesma promoção que os Reverendos Apóstolos MANENGA MAMPUYA Gabriel, NGUBI, DOKOLO NGOMA Philippe e MATA MATUNDU Frédéric Albert.',
          ),
        ],
      },
    ],
    credit: 'Je suis KCCiste',
    addedAt: '2026-11-02',
  },
];

const key = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`\-.]/g, '').toUpperCase();

/** Biographie correspondant au nom enregistré d'un apôtre, s'il y en a une. */
export function findApostleBiography(fullName: string): ApostleBiography | undefined {
  const words = key(fullName).split(/\s+/);
  return APOSTLE_BIOGRAPHIES.find((b) => b.match.every((m) => words.includes(key(m))));
}

export const findBiographyBySlug = (slug?: string) => APOSTLE_BIOGRAPHIES.find((b) => b.slug === slug);
