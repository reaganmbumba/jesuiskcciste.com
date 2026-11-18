/**
 * Parcours néophyte en ligne (/parcours-neophyte).
 *
 * Les douze leçons reprennent mot pour mot le livret « Mon carnet de néophyte »
 * (collection « Accueillir, enseigner, affermir », Prédicateur Reagan MBUMBA,
 * novembre 2026) et ses versions anglaise et portugaise. Les questions des quiz
 * et leurs réponses viennent du carnet, de son annexe B (« Le Catéchisme »,
 * Direction du Siège de l'EBNM) et des textes officiels déjà sur le site
 * (src/content/doctrine*.ts, catechisme*.ts). Aucune doctrine nouvelle.
 *
 * Dans chaque question, la PREMIÈRE réponse est la bonne : la page les mélange.
 */
import type { Tri } from '@/i18n';

const l = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

/** Textes officiels à apprendre, affichés depuis le contenu « Doctrine » du site. */
export type NeophyteText = 'attributes' | 'oracle' | 'alliance' | 'commandements' | 'profession' | 'objectifs' | 'declaration' | 'feasts';

export interface NeophyteQuestion { q: Tri; options: Tri[]; explain: Tri }

export interface NeophyteLesson {
  n: number;
  title: Tri;
  body: Tri;
  read?: Tri;
  learn?: Tri;
  practice?: Tri;
  reflect?: Tri;
  check?: Tri;
  step?: Tri;
  texts?: NeophyteText[];
  questions: NeophyteQuestion[];
}

/** Nombre de bonnes réponses (sur 4) pour réussir une leçon. */
export const PASS_MARK = 3;

export const NEOPHYTE_BOOK = {
  title: l('Mon carnet de néophyte', 'My neophyte notebook', 'O meu caderno de neófito'),
  author: 'Prédicateur Reagan MBUMBA · Paroisse de Pika Pende, Muanda (Kongo-Central)',
  pdf: l('/livres/mon-carnet-de-neophyte.pdf', '/livres/my-neophyte-notebook.pdf', '/livres/o-meu-caderno-de-neofito.pdf'),
  article: '/actualites/edito-ann-livres-encadrement-neophytes',
};

export const NEOPHYTE_STEPS: { name: Tri; text: Tri }[] = [
  {
    name: l('1. La Purification', '1. Purification', '1. A Purificação'),
    text: l(
      'Je confesse mes péchés devant l’Éternel et devant des témoins, et l’officiant prononce le pardon au Nom de l’Éternel. L’Éternel ne me demande aucun sacrifice : il me demande la décision sincère de ne plus pécher.',
      'I confess my sins before the Eternal and before witnesses, and the officiant pronounces forgiveness in the Name of the Eternal. The Eternal asks no sacrifice of me: he asks the sincere decision to sin no more.',
      'Confesso os meus pecados diante do Eterno e diante de testemunhas, e o oficiante pronuncia o perdão em Nome do Eterno. O Eterno não me pede nenhum sacrifício: pede-me a decisão sincera de não pecar mais.',
    ),
  },
  {
    name: l('2. La Première Onction', '2. The First Anointing', '2. A Primeira Unção'),
    text: l(
      'Je déclare devant l’Éternel et son peuple que l’Éternel est mon unique Dieu, et je m’engage à l’aimer et à le servir de tout mon cœur, de toute mon âme et de toute ma force. Je ne la reçois qu’une seule fois.',
      'I declare before the Eternal and his people that the Eternal is my only God, and I commit to love and serve him with all my heart, all my soul and all my strength. I receive it only once.',
      'Declaro diante do Eterno e do seu povo que o Eterno é o meu único Deus, e comprometo-me a amá-lo e servi-lo de todo o meu coração, de toda a minha alma e com todas as minhas forças. Recebo-a uma só vez.',
    ),
  },
  {
    name: l('3. Les Actes d’Alliance', '3. The Acts of Covenant', '3. Os Atos de Aliança'),
    text: l(
      'Chaque année, à la Fête de l’Alliance, le peuple reconnaît l’Éternel comme l’unique vrai Dieu, accepte les Paroles de l’Alliance et s’engage à pratiquer ses commandements. On mange le pain d’Alliance.',
      'Every year, at the Feast of the Covenant, the people recognise the Eternal as the only true God, accept the Words of the Covenant and commit to keep his commandments. The bread of the Covenant is eaten.',
      'Todos os anos, na Festa da Aliança, o povo reconhece o Eterno como o único Deus verdadeiro, aceita as Palavras da Aliança e compromete-se a praticar os seus mandamentos. Come-se o pão da Aliança.',
    ),
  },
];

/** Déclaration du bénéficiaire de la Première Onction (textes liturgiques 2014). */
export const ANOINTING_DECLARATION = l(
  'L’Éternel est notre Dieu, l’Éternel est un ! J’aimerai et servirai l’Éternel mon Dieu de tout mon cœur, de toute mon âme et de toute ma force. Qu’il en soit ainsi au Nom de l’Éternel !',
  'The Eternal is our God, the Eternal is one! I will love and serve the Eternal my God with all my heart, with all my soul and with all my strength. May it be so in the Name of the Eternal!',
  'O Eterno é o nosso Deus, o Eterno é um! Amarei e servirei o Eterno meu Deus de todo o meu coração, de toda a minha alma e com todas as minhas forças. Que assim seja em Nome do Eterno!',
);

export const NEOPHYTE_LESSONS: NeophyteLesson[] = [
  {
    n: 1,
    title: l('L’Éternel, l’unique vrai Dieu', 'The Eternal, the only true God', 'O Eterno, o único Deus verdadeiro'),
    body: l(
      'Notre Dieu s’appelle l’Éternel. De lui découle toute vie. Il est Un : à côté de lui il n’y en a point d’autre et rien ne lui ressemble. Je le comprends par ses attributs.',
      'Our God is called the Eternal. From him all life flows. He is One: beside him there is no other and nothing is like him. I understand him through his attributes.',
      'O nosso Deus chama-se o Eterno. Dele brota toda a vida. Ele é Um: ao lado dele não há outro e nada se lhe compara. Compreendo-o pelos seus atributos.',
    ),
    read: l('Exode 3 : 13-15 ; Psaume 136 : 1-9 ; Ésaïe 43 : 10-11 ; Ésaïe 45 : 20-22.', 'Exodus 3:13-15; Psalm 136:1-9; Isaiah 43:10-11; Isaiah 45:20-22.', 'Êxodo 3:13-15; Salmo 136:1-9; Isaías 43:10-11; Isaías 45:20-22.'),
    learn: l('Les attributs de l’Éternel.', 'The attributes of the Eternal.', 'Os atributos do Eterno.'),
    check: l('Comment s’appelle notre Dieu ? Cite cinq de ses attributs.', 'What is our God called? Name five of his attributes.', 'Como se chama o nosso Deus? Cita cinco dos seus atributos.'),
    texts: ['attributes'],
    questions: [
      {
        q: l('Comment s’appelle notre Dieu ?', 'What is our God called?', 'Como se chama o nosso Deus?'),
        options: [l('L’Éternel', 'The Eternal', 'O Eterno'), l('Le Prophète', 'The Prophet', 'O Profeta'), l('Les ancêtres', 'The ancestors', 'Os antepassados')],
        explain: l('Notre Dieu s’appelle l’Éternel. De lui découle toute vie.', 'Our God is called the Eternal. From him all life flows.', 'O nosso Deus chama-se o Eterno. Dele brota toda a vida.'),
      },
      {
        q: l('Que veut dire « Il est Un » ?', 'What does “He is One” mean?', 'O que quer dizer «Ele é Um»?'),
        options: [
          l('À côté de l’Éternel il n’y en a point d’autre et rien ne lui ressemble', 'Beside the Eternal there is no other and nothing is like him', 'Ao lado do Eterno não há outro e nada se lhe compara'),
          l('Il est le premier de plusieurs dieux', 'He is the first of several gods', 'É o primeiro de vários deuses'),
          l('Il a une image que l’on peut voir', 'He has an image that can be seen', 'Tem uma imagem que se pode ver'),
        ],
        explain: l('À côté de l’Éternel, il n’y en a point d’autre et rien ne lui ressemble (Catéchisme).', 'Beside the Eternal there is no other and nothing is like him (Catechism).', 'Ao lado do Eterno não há outro e nada se lhe compara (Catecismo).'),
      },
      {
        q: l('Lequel de ces mots est un attribut de l’Éternel ?', 'Which of these words is an attribute of the Eternal?', 'Qual destas palavras é um atributo do Eterno?'),
        options: [l('Omniprésent', 'Ever-present', 'Omnipresente'), l('Visible', 'Visible', 'Visível'), l('Changeant', 'Changing', 'Mutável')],
        explain: l('L’Éternel est Invisible, Immuable et Omniprésent, sans image ni représentation.', 'The Eternal is Invisible, Unchanging and Ever-present, without image or likeness.', 'O Eterno é Invisível, Imutável e Omnipresente, sem imagem nem representação.'),
      },
      {
        q: l('Comment peut-on comprendre l’Éternel ?', 'How can we understand the Eternal?', 'Como se pode compreender o Eterno?'),
        options: [l('À travers ses attributs', 'Through his attributes', 'Através dos seus atributos'), l('Par une statue ou une image', 'Through a statue or an image', 'Através de uma estátua ou de uma imagem'), l('Par les esprits des morts', 'Through the spirits of the dead', 'Através dos espíritos dos mortos')],
        explain: l('On comprend l’Éternel à travers ses attributs (Catéchisme).', 'We understand the Eternal through his attributes (Catechism).', 'Compreende-se o Eterno através dos seus atributos (Catecismo).'),
      },
    ],
  },
  {
    n: 2,
    title: l('L’Oracle du 15 avril 2003', 'The Oracle of 15 April 2003', 'O Oráculo de 15 de abril de 2003'),
    body: l(
      '« Quels que soient les miracles qu’il opère, un homme ne peut être Dieu. » Le 15 avril 2003, l’Éternel a donné cet oracle à son Prophète. Depuis, l’Église ne s’attache qu’à l’Éternel, l’unique vrai Dieu à prier, servir, glorifier et vénérer. Le 15 avril est la fête de la Délivrance.',
      '“Whatever miracles he performs, a man cannot be God.” On 15 April 2003, the Eternal gave this oracle to his Prophet. Since then the Church holds fast to the Eternal alone, the only true God to pray to, serve, glorify and worship. 15 April is the Feast of Deliverance.',
      '«Sejam quais forem os milagres que realize, um homem não pode ser Deus.» A 15 de abril de 2003, o Eterno deu este oráculo ao seu Profeta. Desde então a Igreja apega-se só ao Eterno, o único Deus verdadeiro a quem se ora, se serve, se glorifica e se adora. O 15 de abril é a festa da Libertação.',
    ),
    read: l('Ésaïe 8 : 11-16 ; Ésaïe 42 : 9.', 'Isaiah 8:11-16; Isaiah 42:9.', 'Isaías 8:11-16; Isaías 42:9.'),
    learn: l('Le texte de l’Oracle et sa date.', 'The text of the Oracle and its date.', 'O texto do Oráculo e a sua data.'),
    check: l('Que dit l’Oracle ? Que veut l’Éternel dans cet Oracle ?', 'What does the Oracle say? What does the Eternal want in this Oracle?', 'O que diz o Oráculo? O que quer o Eterno neste Oráculo?'),
    texts: ['oracle'],
    questions: [
      {
        q: l('Que dit l’Oracle ?', 'What does the Oracle say?', 'O que diz o Oráculo?'),
        options: [
          l('« Quels que soient les miracles qu’il opère, un homme ne peut être Dieu. »', '“Whatever miracles he performs, a man cannot be God.”', '«Sejam quais forem os milagres que realize, um homem não pode ser Deus.»'),
          l('« Celui qui fait des miracles est Dieu. »', '“Whoever performs miracles is God.”', '«Quem faz milagres é Deus.»'),
          l('« Il faut prier les ancêtres. »', '“We must pray to the ancestors.”', '«É preciso orar aos antepassados.»'),
        ],
        explain: l('C’est l’Oracle de l’Éternel à son Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac.', 'This is the Oracle of the Eternal to his Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac.', 'É o Oráculo do Eterno ao seu Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac.'),
      },
      {
        q: l('Quand l’Éternel a-t-il donné cet Oracle ?', 'When did the Eternal give this Oracle?', 'Quando deu o Eterno este Oráculo?'),
        options: [l('Le 15 avril 2003', 'On 15 April 2003', 'A 15 de abril de 2003'), l('Le 8 mars 1955', 'On 8 March 1955', 'A 8 de março de 1955'), l('Le 12 avril 1958', 'On 12 April 1958', 'A 12 de abril de 1958')],
        explain: l('L’Oracle date du 15 avril 2003.', 'The Oracle dates from 15 April 2003.', 'O Oráculo é de 15 de abril de 2003.'),
      },
      {
        q: l('Que veut l’Éternel dans cet Oracle ?', 'What does the Eternal want in this Oracle?', 'O que quer o Eterno neste Oráculo?'),
        options: [
          l('Se présenter comme l’unique vrai Dieu à prier, servir, glorifier et vénérer', 'To present himself as the only true God to pray to, serve, glorify and worship', 'Apresentar-se como o único Deus verdadeiro a quem se ora, se serve, se glorifica e se adora'),
          l('Que l’on prie un homme qui fait des miracles', 'That we pray to a man who performs miracles', 'Que se ore a um homem que faz milagres'),
          l('Que l’on ajoute d’autres dieux à côté de lui', 'That we add other gods beside him', 'Que se acrescentem outros deuses ao lado dele'),
        ],
        explain: l('L’Éternel s’est présenté comme l’unique vrai Dieu à prier, servir, glorifier et vénérer (Catéchisme).', 'The Eternal presented himself as the only true God to pray to, serve, glorify and worship (Catechism).', 'O Eterno apresentou-se como o único Deus verdadeiro a quem se ora, se serve, se glorifica e se adora (Catecismo).'),
      },
      {
        q: l('Quelle fête célèbre-t-on le 15 avril ?', 'Which feast is celebrated on 15 April?', 'Que festa se celebra a 15 de abril?'),
        options: [l('La fête de la Délivrance', 'The Feast of Deliverance', 'A festa da Libertação'), l('La naissance du Prophète', 'The birth of the Prophet', 'O nascimento do Profeta'), l('La reconnaissance juridique', 'The legal recognition', 'O reconhecimento jurídico')],
        explain: l('Le 15 avril est la fête de la Délivrance, un jour saint.', '15 April is the Feast of Deliverance, a holy day.', 'O 15 de abril é a festa da Libertação, um dia santo.'),
      },
    ],
  },
  {
    n: 3,
    title: l('Le KCC, Bon Nouveau Message', 'The KCC, Good New Message', 'O KCC, Boa Nova Mensagem'),
    body: l(
      'Le 12 avril 1958, à Boma, trois signes en or apparurent au Prophète : K C C. Une voix les interpréta en kikongo : Nkanda (message), Wambote (bon), Wampa (nouveau). On les prononce « kasese ». La religion qui en vient s’appelle le KCCisme ; son adhérent est le KCCiste.',
      'On 12 April 1958, in Boma, three golden signs appeared to the Prophet: K C C. A voice interpreted them in Kikongo: Nkanda (message), Wambote (good), Wampa (new). They are pronounced “kasese”. The religion that comes from them is called KCCism; its follower is the KCCist.',
      'A 12 de abril de 1958, em Boma, apareceram ao Profeta três sinais de ouro: K C C. Uma voz interpretou-os em kikongo: Nkanda (mensagem), Wambote (boa), Wampa (nova). Pronunciam-se «kasese». A religião que deles nasce chama-se KCCismo; o seu adepto é o KCCista.',
    ),
    learn: l('KCC = Nkanda Wambote Wampa : Bon Nouveau Message.', 'KCC = Nkanda Wambote Wampa: Good New Message.', 'KCC = Nkanda Wambote Wampa: Boa Nova Mensagem.'),
    check: l('Quand et où le KCC est-il apparu ? Que veut dire chaque lettre ?', 'When and where did the KCC appear? What does each letter mean?', 'Quando e onde apareceu o KCC? O que quer dizer cada letra?'),
    questions: [
      {
        q: l('Quand et où le KCC est-il apparu ?', 'When and where did the KCC appear?', 'Quando e onde apareceu o KCC?'),
        options: [l('Le 12 avril 1958, à Boma', 'On 12 April 1958, in Boma', 'A 12 de abril de 1958, em Boma'), l('Le 8 mars 1955, à Makaba', 'On 8 March 1955, in Makaba', 'A 8 de março de 1955, em Makaba'), l('Le 30 avril 1980, à Kinshasa', 'On 30 April 1980, in Kinshasa', 'A 30 de abril de 1980, em Kinshasa')],
        explain: l('Les trois signes en or sont apparus au Prophète le 12 avril 1958, à Boma.', 'The three golden signs appeared to the Prophet on 12 April 1958, in Boma.', 'Os três sinais de ouro apareceram ao Profeta a 12 de abril de 1958, em Boma.'),
      },
      {
        q: l('Que veut dire KCC ?', 'What does KCC mean?', 'O que quer dizer KCC?'),
        options: [l('Bon Nouveau Message (Nkanda Wambote Wampa)', 'Good New Message (Nkanda Wambote Wampa)', 'Boa Nova Mensagem (Nkanda Wambote Wampa)'), l('Les trois noms de Dieu', 'The three names of God', 'Os três nomes de Deus'), l('Le nom d’une ville', 'The name of a town', 'O nome de uma cidade')],
        explain: l('KCC = Nkanda Wambote Wampa : Bon Nouveau Message.', 'KCC = Nkanda Wambote Wampa: Good New Message.', 'KCC = Nkanda Wambote Wampa: Boa Nova Mensagem.'),
      },
      {
        q: l('Que veut dire le mot kikongo « Nkanda » ?', 'What does the Kikongo word “Nkanda” mean?', 'O que quer dizer a palavra kikongo «Nkanda»?'),
        options: [l('Message', 'Message', 'Mensagem'), l('Bon', 'Good', 'Boa'), l('Nouveau', 'New', 'Nova')],
        explain: l('Nkanda (message), Wambote (bon), Wampa (nouveau).', 'Nkanda (message), Wambote (good), Wampa (new).', 'Nkanda (mensagem), Wambote (boa), Wampa (nova).'),
      },
      {
        q: l('Comment s’appelle l’adhérent de la religion du KCC ?', 'What is the follower of the KCC religion called?', 'Como se chama o adepto da religião do KCC?'),
        options: [l('Le KCCiste', 'The KCCist', 'O KCCista'), l('Le Bomais', 'The Boman', 'O Bomense'), l('Le kasesien', 'The Kasesian', 'O kasesiano')],
        explain: l('La religion s’appelle le KCCisme ; son adhérent est le KCCiste.', 'The religion is called KCCism; its follower is the KCCist.', 'A religião chama-se KCCismo; o seu adepto é o KCCista.'),
      },
    ],
  },
  {
    n: 4,
    title: l('Le Prophète et la naissance de l’Église', 'The Prophet and the birth of the Church', 'O Profeta e o nascimento da Igreja'),
    body: l(
      'Le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac est né le 1er mars 1930 à Makaba (Luozi). Du 8 au 13 mars 1955, il reçut son appel : le 8 mars 1955 est la naissance de l’Église. C’est par le prophète que l’Éternel trace la voie du salut en donnant sa Parole.',
      'The Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac was born on 1 March 1930 in Makaba (Luozi). From 8 to 13 March 1955 he received his call: 8 March 1955 is the birth of the Church. It is through the prophet that the Eternal marks out the way of salvation by giving his Word.',
      'O Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac nasceu a 1 de março de 1930 em Makaba (Luozi). De 8 a 13 de março de 1955 recebeu o seu chamamento: 8 de março de 1955 é o nascimento da Igreja. É pelo profeta que o Eterno traça o caminho da salvação, dando a sua Palavra.',
    ),
    read: l('Ésaïe 42 : 1 ; Jérémie 1 : 4-9.', 'Isaiah 42:1; Jeremiah 1:4-9.', 'Isaías 42:1; Jeremias 1:4-9.'),
    learn: l('1er mars 1930 · 8 mars 1955 · 12 avril 1958 · 30 avril 1980 · 15 avril 2003.', '1 March 1930 · 8 March 1955 · 12 April 1958 · 30 April 1980 · 15 April 2003.', '1 de março de 1930 · 8 de março de 1955 · 12 de abril de 1958 · 30 de abril de 1980 · 15 de abril de 2003.'),
    check: l('Pourquoi faut-il croire au Prophète ?', 'Why must we believe in the Prophet?', 'Porque devemos crer no Profeta?'),
    texts: ['feasts'],
    questions: [
      {
        q: l('Quand et où est né le Prophète ?', 'When and where was the Prophet born?', 'Quando e onde nasceu o Profeta?'),
        options: [l('Le 1er mars 1930, à Makaba (Luozi)', 'On 1 March 1930, in Makaba (Luozi)', 'A 1 de março de 1930, em Makaba (Luozi)'), l('Le 12 avril 1958, à Boma', 'On 12 April 1958, in Boma', 'A 12 de abril de 1958, em Boma'), l('Le 15 avril 2003, à Kinshasa', 'On 15 April 2003, in Kinshasa', 'A 15 de abril de 2003, em Kinshasa')],
        explain: l('Le Prophète est né le 1er mars 1930 à Makaba (Luozi).', 'The Prophet was born on 1 March 1930 in Makaba (Luozi).', 'O Profeta nasceu a 1 de março de 1930 em Makaba (Luozi).'),
      },
      {
        q: l('Quelle est la date de naissance de l’Église ?', 'What is the date of the birth of the Church?', 'Qual é a data do nascimento da Igreja?'),
        options: [l('Le 8 mars 1955', '8 March 1955', '8 de março de 1955'), l('Le 1er mars 1930', '1 March 1930', '1 de março de 1930'), l('Le 30 avril 1980', '30 April 1980', '30 de abril de 1980')],
        explain: l('Du 8 au 13 mars 1955, le Prophète reçut son appel : le 8 mars 1955 est la naissance de l’Église.', 'From 8 to 13 March 1955 the Prophet received his call: 8 March 1955 is the birth of the Church.', 'De 8 a 13 de março de 1955 o Profeta recebeu o seu chamamento: 8 de março de 1955 é o nascimento da Igreja.'),
      },
      {
        q: l('Pourquoi faut-il croire au Prophète ?', 'Why must we believe in the Prophet?', 'Porque devemos crer no Profeta?'),
        options: [
          l('Parce que c’est par le prophète que l’Éternel trace la voie du salut en donnant sa Parole', 'Because it is through the prophet that the Eternal marks out the way of salvation by giving his Word', 'Porque é pelo profeta que o Eterno traça o caminho da salvação, dando a sua Palavra'),
          l('Parce que le Prophète est Dieu', 'Because the Prophet is God', 'Porque o Profeta é Deus'),
          l('Parce qu’il faut le prier à la place de l’Éternel', 'Because we must pray to him instead of the Eternal', 'Porque é preciso orar-lhe em vez do Eterno'),
        ],
        explain: l('C’est une recommandation que l’Éternel fait depuis les temps anciens pour le salut. Et l’Oracle le rappelle : un homme ne peut être Dieu.', 'It is a recommendation the Eternal has made since ancient times for salvation. And the Oracle reminds us: a man cannot be God.', 'É uma recomendação que o Eterno faz desde os tempos antigos para a salvação. E o Oráculo lembra: um homem não pode ser Deus.'),
      },
      {
        q: l('Quelle est la date de la reconnaissance juridique de l’Église ?', 'What is the date of the Church’s legal recognition?', 'Qual é a data do reconhecimento jurídico da Igreja?'),
        options: [l('Le 30 avril 1980', '30 April 1980', '30 de abril de 1980'), l('Le 8 mars 1955', '8 March 1955', '8 de março de 1955'), l('Le 15 avril 2003', '15 April 2003', '15 de abril de 2003')],
        explain: l('La reconnaissance juridique date du 30 avril 1980.', 'The legal recognition dates from 30 April 1980.', 'O reconhecimento jurídico é de 30 de abril de 1980.'),
      },
    ],
  },
  {
    n: 5,
    title: l('La Bible de l’Église', 'The Bible of the Church', 'A Bíblia da Igreja'),
    body: l(
      'Le livre de travail de l’Église est la Bible (Torah), la Bible hébraïque, de la Genèse au deuxième livre des Chroniques. Les sources de l’enseignement sont la Bible et le Prophète.',
      'The Church’s book of work is the Bible (Torah), the Hebrew Bible, from Genesis to the second book of Chronicles. The sources of the teaching are the Bible and the Prophet.',
      'O livro de trabalho da Igreja é a Bíblia (Torá), a Bíblia hebraica, do Génesis ao segundo livro das Crónicas. As fontes do ensino são a Bíblia e o Profeta.',
    ),
    read: l('Josué 1 : 8 ; Psaume 1 : 1-3 ; Psaume 119 : 105.', 'Joshua 1:8; Psalm 1:1-3; Psalm 119:105.', 'Josué 1:8; Salmo 1:1-3; Salmo 119:105.'),
    practice: l('Trouver un livre, un chapitre et un verset. Commencer mon plan de lecture (chapitre 3 du carnet).', 'Finding a book, a chapter and a verse. Starting my reading plan (chapter 3 of the notebook).', 'Encontrar um livro, um capítulo e um versículo. Começar o meu plano de leitura (capítulo 3 do caderno).'),
    questions: [
      {
        q: l('Quel est le livre de travail de l’Église ?', 'What is the Church’s book of work?', 'Qual é o livro de trabalho da Igreja?'),
        options: [l('La Bible (Torah), la Bible hébraïque', 'The Bible (Torah), the Hebrew Bible', 'A Bíblia (Torá), a Bíblia hebraica'), l('Un livre de contes', 'A book of tales', 'Um livro de contos'), l('Le journal', 'The newspaper', 'O jornal')],
        explain: l('Le livre de travail de l’Église est la Bible (Torah), la Bible hébraïque.', 'The Church’s book of work is the Bible (Torah), the Hebrew Bible.', 'O livro de trabalho da Igreja é a Bíblia (Torá), a Bíblia hebraica.'),
      },
      {
        q: l('De quel livre à quel livre va la Bible de l’Église ?', 'From which book to which book does the Church’s Bible go?', 'De que livro a que livro vai a Bíblia da Igreja?'),
        options: [l('De la Genèse au deuxième livre des Chroniques', 'From Genesis to the second book of Chronicles', 'Do Génesis ao segundo livro das Crónicas'), l('Des Psaumes à Ésaïe seulement', 'From Psalms to Isaiah only', 'Dos Salmos a Isaías apenas'), l('De l’Exode au livre de Ruth seulement', 'From Exodus to the book of Ruth only', 'Do Êxodo ao livro de Rute apenas')],
        explain: l('La Bible hébraïque, de la Genèse au deuxième livre des Chroniques.', 'The Hebrew Bible, from Genesis to the second book of Chronicles.', 'A Bíblia hebraica, do Génesis ao segundo livro das Crónicas.'),
      },
      {
        q: l('Quelles sont les sources de l’enseignement de l’Église ?', 'What are the sources of the Church’s teaching?', 'Quais são as fontes do ensino da Igreja?'),
        options: [l('La Bible et le Prophète', 'The Bible and the Prophet', 'A Bíblia e o Profeta'), l('Les rêves de chacun', 'Everyone’s dreams', 'Os sonhos de cada um'), l('Les féticheurs et les devins', 'Fetish priests and soothsayers', 'Os feiticeiros e os adivinhos')],
        explain: l('Les sources de l’enseignement sont la Bible (Torah) et le Prophète.', 'The sources of the teaching are the Bible (Torah) and the Prophet.', 'As fontes do ensino são a Bíblia (Torá) e o Profeta.'),
      },
      {
        q: l('Que veut dire « Josué 1 : 8 » ?', 'What does “Joshua 1:8” mean?', 'O que quer dizer «Josué 1:8»?'),
        options: [l('Le livre de Josué, chapitre 1, verset 8', 'The book of Joshua, chapter 1, verse 8', 'O livro de Josué, capítulo 1, versículo 8'), l('Le livre de Josué, page 18', 'The book of Joshua, page 18', 'O livro de Josué, página 18'), l('Le 1er jour du 8e mois', 'The 1st day of the 8th month', 'O 1.º dia do 8.º mês')],
        explain: l('On écrit le livre, puis le chapitre, puis le verset.', 'We write the book, then the chapter, then the verse.', 'Escreve-se o livro, depois o capítulo, depois o versículo.'),
      },
    ],
  },
  {
    n: 6,
    title: l('Les dix Paroles de l’Alliance', 'The ten Words of the Covenant', 'As dez Palavras da Aliança'),
    body: l(
      'J’entre dans l’Alliance de l’Éternel en le reconnaissant comme l’unique vrai Dieu et en acceptant ses dix Paroles. Celui qui pratique la loi, la justice et la vertu vivra (Ézéchiel 18 : 21-22).',
      'I enter the Covenant of the Eternal by recognising him as the only true God and accepting his ten Words. Whoever practises the law, justice and virtue shall live (Ezekiel 18:21-22).',
      'Entro na Aliança do Eterno reconhecendo-o como o único Deus verdadeiro e aceitando as suas dez Palavras. Quem pratica a lei, a justiça e a virtude viverá (Ezequiel 18:21-22).',
    ),
    read: l('Exode 20 : 1-17 ; Deutéronome 5 : 6-21.', 'Exodus 20:1-17; Deuteronomy 5:6-21.', 'Êxodo 20:1-17; Deuteronómio 5:6-21.'),
    learn: l('Les dix Paroles de l’Alliance, par cœur.', 'The ten Words of the Covenant, by heart.', 'As dez Palavras da Aliança, de cor.'),
    texts: ['alliance'],
    questions: [
      {
        q: l('Comment entre-t-on dans l’Alliance de l’Éternel ?', 'How do we enter the Covenant of the Eternal?', 'Como se entra na Aliança do Eterno?'),
        options: [
          l('En reconnaissant l’Éternel comme l’unique vrai Dieu et en acceptant ses dix Paroles', 'By recognising the Eternal as the only true God and accepting his ten Words', 'Reconhecendo o Eterno como o único Deus verdadeiro e aceitando as suas dez Palavras'),
          l('En offrant un sacrifice d’animal', 'By offering an animal sacrifice', 'Oferecendo um sacrifício de animal'),
          l('En portant un objet sacré', 'By wearing a sacred object', 'Usando um objeto sagrado'),
        ],
        explain: l('Le peuple entre dans l’Alliance en reconnaissant l’Éternel comme l’unique vrai Dieu et en acceptant ses Paroles.', 'The people enter the Covenant by recognising the Eternal as the only true God and accepting his Words.', 'O povo entra na Aliança reconhecendo o Eterno como o único Deus verdadeiro e aceitando as suas Palavras.'),
      },
      {
        q: l('Quelle est la première Parole de l’Alliance ?', 'What is the first Word of the Covenant?', 'Qual é a primeira Palavra da Aliança?'),
        options: [
          l('C’est moi l’Éternel qui suis votre Dieu : tu n’auras point d’autres dieux que moi.', 'I am the Eternal your God: you shall have no other gods but me.', 'Eu sou o Eterno, o vosso Deus: não terás outros deuses além de mim.'),
          l('Tu ne voleras point.', 'You shall not steal.', 'Não furtarás.'),
          l('Honore ton père et ta mère.', 'Honour your father and your mother.', 'Honra teu pai e tua mãe.'),
        ],
        explain: l('La première Parole : « C’est moi l’Éternel qui suis votre Dieu : tu n’auras point d’autres dieux que moi. »', 'The first Word: “I am the Eternal your God: you shall have no other gods but me.”', 'A primeira Palavra: «Eu sou o Eterno, o vosso Deus: não terás outros deuses além de mim.»'),
      },
      {
        q: l('Quelle Parole parle du sabbat ?', 'Which Word speaks of the Sabbath?', 'Que Palavra fala do sábado?'),
        options: [l('Souviens-toi du jour du sabbat pour le sanctifier.', 'Remember the Sabbath day and keep it holy.', 'Lembra-te do dia de sábado para o santificar.'), l('Tu ne tueras point.', 'You shall not kill.', 'Não matarás.'), l('Tu ne mentiras point.', 'You shall not lie.', 'Não mentirás.')],
        explain: l('C’est la quatrième Parole de l’Alliance.', 'It is the fourth Word of the Covenant.', 'É a quarta Palavra da Aliança.'),
      },
      {
        q: l('Où lit-on les dix Paroles dans la Bible ?', 'Where do we read the ten Words in the Bible?', 'Onde se leem as dez Palavras na Bíblia?'),
        options: [l('Exode 20 et Deutéronome 5', 'Exodus 20 and Deuteronomy 5', 'Êxodo 20 e Deuteronómio 5'), l('Genèse 1 et Psaume 136', 'Genesis 1 and Psalm 136', 'Génesis 1 e Salmo 136'), l('Ruth 1 et Daniel 6', 'Ruth 1 and Daniel 6', 'Rute 1 e Daniel 6')],
        explain: l('Exode 20 : 1-17 ; Deutéronome 5 : 6-21.', 'Exodus 20:1-17; Deuteronomy 5:6-21.', 'Êxodo 20:1-17; Deuteronómio 5:6-21.'),
      },
    ],
  },
  {
    n: 7,
    title: l('Les sept commandements de l’Église', 'The seven commandments of the Church', 'Os sete mandamentos da Igreja'),
    body: l(
      'Pas de boissons enivrantes ni de tabac ; pas de féticheurs, de devins ni de consultation des morts ; le culte du sabbat et des jours saints ; la communion fraternelle et les dons pacifiques annuels ; le mariage, union sacrée ; demeurer saint ; aimer l’Église, la protéger et la soutenir.',
      'No intoxicating drinks and no tobacco; no fetish priests, soothsayers or consulting the dead; the Sabbath service and holy days; fraternal communion and the annual peace offerings; marriage, a sacred union; remaining holy; loving the Church, protecting and supporting it.',
      'Nada de bebidas embriagantes nem de tabaco; nada de feiticeiros, adivinhos nem consulta dos mortos; o culto do sábado e os dias santos; a comunhão fraterna e as ofertas pacíficas anuais; o casamento, união sagrada; permanecer santo; amar a Igreja, protegê-la e apoiá-la.',
    ),
    read: l('Lévitique 19 : 31 ; Deutéronome 18 : 10-13.', 'Leviticus 19:31; Deuteronomy 18:10-13.', 'Levítico 19:31; Deuteronómio 18:10-13.'),
    learn: l('Les sept commandements de l’Église, par cœur.', 'The seven commandments of the Church, by heart.', 'Os sete mandamentos da Igreja, de cor.'),
    reflect: l('Quel commandement est le plus difficile pour moi ? J’en parle à mon accompagnateur.', 'Which commandment is hardest for me? I talk about it with my mentor.', 'Que mandamento é mais difícil para mim? Falo dele com o meu acompanhante.'),
    texts: ['commandements'],
    questions: [
      {
        q: l('Combien l’Église a-t-elle de commandements ?', 'How many commandments does the Church have?', 'Quantos mandamentos tem a Igreja?'),
        options: [l('Sept', 'Seven', 'Sete'), l('Trois', 'Three', 'Três'), l('Douze', 'Twelve', 'Doze')],
        explain: l('Les sept commandements de l’Église (18 février 2015).', 'The seven commandments of the Church (18 February 2015).', 'Os sete mandamentos da Igreja (18 de fevereiro de 2015).'),
      },
      {
        q: l('Quand je suis malade ou dans l’épreuve, puis-je aller chez un féticheur ou un devin ?', 'When I am ill or in trouble, may I go to a fetish priest or a soothsayer?', 'Quando estou doente ou em provação, posso ir a um feiticeiro ou a um adivinho?'),
        options: [l('Non : je prie l’Éternel et j’appelle mon accompagnateur', 'No: I pray to the Eternal and call my mentor', 'Não: oro ao Eterno e chamo o meu acompanhante'), l('Oui, si c’est grave', 'Yes, if it is serious', 'Sim, se for grave'), l('Oui, pendant un deuil', 'Yes, during a mourning', 'Sim, durante um luto')],
        explain: l('Ne point consulter les féticheurs, les devins ni les morts, même dans la maladie ou l’épreuve (Lévitique 19 : 31).', 'Do not consult fetish priests, soothsayers or the dead, even in illness or trouble (Leviticus 19:31).', 'Não consultar feiticeiros, adivinhos nem mortos, mesmo na doença ou na provação (Levítico 19:31).'),
      },
      {
        q: l('Que dit le premier commandement de l’Église ?', 'What does the first commandment of the Church say?', 'O que diz o primeiro mandamento da Igreja?'),
        options: [l('Ne pas boire de boissons enivrantes ni fumer', 'Do not drink intoxicating drinks or smoke', 'Não beber bebidas embriagantes nem fumar'), l('Boire seulement le jour du sabbat', 'Drink only on the Sabbath day', 'Beber só no dia de sábado'), l('Fumer seulement à la maison', 'Smoke only at home', 'Fumar só em casa')],
        explain: l('Pas de boissons enivrantes ni de tabac.', 'No intoxicating drinks and no tobacco.', 'Nada de bebidas embriagantes nem de tabaco.'),
      },
      {
        q: l('Que dit l’Église du mariage ?', 'What does the Church say about marriage?', 'O que diz a Igreja do casamento?'),
        options: [l('C’est une union sacrée à sauvegarder', 'It is a sacred union to be safeguarded', 'É uma união sagrada a salvaguardar'), l('C’est une affaire sans importance', 'It is of no importance', 'É um assunto sem importância'), l('On peut le défaire quand on veut', 'It can be undone at will', 'Pode-se desfazer quando se quer')],
        explain: l('Reconnaître que le mariage est une union sacrée à sauvegarder (5e commandement de l’Église).', 'Recognise that marriage is a sacred union to be safeguarded (5th commandment of the Church).', 'Reconhecer que o casamento é uma união sagrada a salvaguardar (5.º mandamento da Igreja).'),
      },
    ],
  },
  {
    n: 8,
    title: l('La Profession de foi et les cinq objectifs', 'The Profession of faith and the five aims', 'A Profissão de fé e os cinco objetivos'),
    body: l(
      'Au culte, je déclare la Profession de foi debout, la main droite levée. L’Église est une, sainte et prophétique. Toute prédication vise l’un des cinq objectifs de l’enseignement religieux.',
      'At the service I declare the Profession of faith standing, right hand raised. The Church is one, holy and prophetic. Every sermon aims at one of the five aims of religious teaching.',
      'No culto declaro a Profissão de fé de pé, com a mão direita levantada. A Igreja é una, santa e profética. Cada pregação visa um dos cinco objetivos do ensino religioso.',
    ),
    learn: l('La Profession de foi · les cinq objectifs · la prière de purification (page « Rites et célébrations »).', 'The Profession of faith · the five aims · the prayer of purification (“Rites and celebrations” page).', 'A Profissão de fé · os cinco objetivos · a oração de purificação (página «Ritos e celebrações»).'),
    step: l('Contrôle de mes connaissances, puis Purification.', 'Check of what I know, then Purification.', 'Verificação dos conhecimentos, depois a Purificação.'),
    texts: ['profession', 'objectifs'],
    questions: [
      {
        q: l('Comment déclare-t-on la Profession de foi au culte ?', 'How is the Profession of faith declared at the service?', 'Como se declara a Profissão de fé no culto?'),
        options: [l('Debout, la main droite levée', 'Standing, right hand raised', 'De pé, com a mão direita levantada'), l('Assis, les bras croisés', 'Seated, arms folded', 'Sentado, de braços cruzados'), l('Couché par terre', 'Lying on the ground', 'Deitado no chão')],
        explain: l('L’assemblée se lève, la main droite levée, et déclare la Profession de foi.', 'The assembly stands, right hand raised, and declares the Profession of faith.', 'A assembleia levanta-se, com a mão direita levantada, e declara a Profissão de fé.'),
      },
      {
        q: l('Comment est l’Église Bon Nouveau Message (KCC) ?', 'What is the Good New Message Church (KCC)?', 'Como é a Igreja Boa Nova Mensagem (KCC)?'),
        options: [l('Une, sainte et prophétique', 'One, holy and prophetic', 'Una, santa e profética'), l('Riche, grande et ancienne', 'Rich, large and old', 'Rica, grande e antiga'), l('Secrète et fermée', 'Secret and closed', 'Secreta e fechada')],
        explain: l('« Je crois que l’Église Bon Nouveau Message (KCC) vient de Dieu, qu’elle est une, sainte et prophétique. »', '“I believe that the Good New Message Church (KCC) comes from God, that it is one, holy and prophetic.”', '«Creio que a Igreja Boa Nova Mensagem (KCC) vem de Deus, que é una, santa e profética.»'),
      },
      {
        q: l('Pourquoi l’Église est-elle « une » ?', 'Why is the Church “one”?', 'Porque é a Igreja «una»?'),
        options: [
          l('Parce que son fondateur invisible, l’Éternel, est un, et que son fondateur visible est un', 'Because its invisible founder, the Eternal, is one, and its visible founder is one', 'Porque o seu fundador invisível, o Eterno, é um, e o seu fundador visível é um'),
          l('Parce qu’elle n’a qu’une seule paroisse', 'Because it has only one parish', 'Porque só tem uma paróquia'),
          l('Parce qu’elle n’a qu’une seule chorale', 'Because it has only one choir', 'Porque só tem um coro'),
        ],
        explain: l('Une, parce que son fondateur invisible, l’Éternel, est un et que son fondateur visible est un (Catéchisme).', 'One, because its invisible founder, the Eternal, is one and its visible founder is one (Catechism).', 'Una, porque o seu fundador invisível, o Eterno, é um e o seu fundador visível é um (Catecismo).'),
      },
      {
        q: l('Quel est le premier objectif de l’enseignement religieux ?', 'What is the first aim of religious teaching?', 'Qual é o primeiro objetivo do ensino religioso?'),
        options: [l('Révéler à l’humanité l’unique vrai Dieu, l’Éternel', 'To reveal to humanity the only true God, the Eternal', 'Revelar à humanidade o único Deus verdadeiro, o Eterno'), l('Construire de grands temples', 'To build large temples', 'Construir grandes templos'), l('Raconter des histoires amusantes', 'To tell funny stories', 'Contar histórias divertidas')],
        explain: l('Les cinq objectifs commencent par : révéler à l’humanité l’unique vrai Dieu, l’Éternel.', 'The five aims begin with: to reveal to humanity the only true God, the Eternal.', 'Os cinco objetivos começam por: revelar à humanidade o único Deus verdadeiro, o Eterno.'),
      },
    ],
  },
  {
    n: 9,
    title: l('Le salut, le pardon et l’immortalité de l’âme', 'Salvation, forgiveness and the immortality of the soul', 'A salvação, o perdão e a imortalidade da alma'),
    body: l(
      'Le salut est le salut de l’âme, offert à toute l’humanité par l’Alliance. L’Éternel pardonne les péchés par l’exécution de sa Loi et en son Nom. L’âme est immortelle : à la mort, le corps retourne à la terre et l’âme retourne à l’Éternel ; celle de l’incrédule va au châtiment éternel.',
      'Salvation is the salvation of the soul, offered to all humanity through the Covenant. The Eternal forgives sins through keeping his Law and in his Name. The soul is immortal: at death the body returns to the earth and the soul returns to the Eternal; that of the unbeliever goes to eternal punishment.',
      'A salvação é a salvação da alma, oferecida a toda a humanidade pela Aliança. O Eterno perdoa os pecados pela observância da sua Lei e pelo seu Nome. A alma é imortal: na morte o corpo volta à terra e a alma volta ao Eterno; a do incrédulo vai para o castigo eterno.',
    ),
    read: l('Ézéchiel 18 : 21-23 ; Ésaïe 1 : 16-18.', 'Ezekiel 18:21-23; Isaiah 1:16-18.', 'Ezequiel 18:21-23; Isaías 1:16-18.'),
    check: l('Quel sacrifice l’Éternel demande-t-il pour pardonner ? Qu’est-ce que la récompense des justes ?', 'What sacrifice does the Eternal ask in order to forgive? What is the reward of the righteous?', 'Que sacrifício pede o Eterno para perdoar? Qual é a recompensa do justo?'),
    questions: [
      {
        q: l('Quel sacrifice l’Éternel demande-t-il pour pardonner ?', 'What sacrifice does the Eternal ask in order to forgive?', 'Que sacrifício pede o Eterno para perdoar?'),
        options: [
          l('Aucun : la décision de cesser définitivement tout péché et la sincérité dans la confession', 'None: the decision to stop all sin for good and sincerity in confession', 'Nenhum: a decisão de deixar definitivamente todo o pecado e a sinceridade na confissão'),
          l('Le sacrifice d’un animal', 'The sacrifice of an animal', 'O sacrifício de um animal'),
          l('Une grosse somme d’argent', 'A large sum of money', 'Uma grande soma de dinheiro'),
        ],
        explain: l('Aucun sacrifice. Il demande la décision de cesser définitivement tout péché et la sincérité dans la confession (Catéchisme).', 'No sacrifice. He asks the decision to stop all sin for good and sincerity in confession (Catechism).', 'Nenhum sacrifício. Pede a decisão de deixar definitivamente todo o pecado e a sinceridade na confissão (Catecismo).'),
      },
      {
        q: l('Au nom de qui l’Éternel pardonne-t-il ?', 'In whose name does the Eternal forgive?', 'Em nome de quem perdoa o Eterno?'),
        options: [l('En son propre Nom', 'In his own Name', 'No seu próprio Nome'), l('Au nom d’un esprit', 'In the name of a spirit', 'Em nome de um espírito'), l('Au nom d’un ancêtre', 'In the name of an ancestor', 'Em nome de um antepassado')],
        explain: l('L’Éternel ne pardonne pas au nom d’un esprit, d’une personne ou d’une chose : il pardonne en son propre Nom.', 'The Eternal does not forgive in the name of a spirit, a person or a thing: he forgives in his own Name.', 'O Eterno não perdoa em nome de um espírito, de uma pessoa ou de uma coisa: perdoa no seu próprio Nome.'),
      },
      {
        q: l('Que se passe-t-il à la mort ?', 'What happens at death?', 'O que acontece na morte?'),
        options: [
          l('Le corps retourne à la terre et l’âme retourne à l’Éternel', 'The body returns to the earth and the soul returns to the Eternal', 'O corpo volta à terra e a alma volta ao Eterno'),
          l('L’âme meurt avec le corps', 'The soul dies with the body', 'A alma morre com o corpo'),
          l('L’âme devient un esprit que l’on consulte', 'The soul becomes a spirit to be consulted', 'A alma torna-se um espírito que se consulta'),
        ],
        explain: l('L’âme reste immortelle : le corps retourne à la terre et l’âme retourne à l’Éternel ; celle de l’incrédule va au châtiment éternel.', 'The soul remains immortal: the body returns to the earth and the soul returns to the Eternal; that of the unbeliever goes to eternal punishment.', 'A alma permanece imortal: o corpo volta à terra e a alma volta ao Eterno; a do incrédulo vai para o castigo eterno.'),
      },
      {
        q: l('Qu’est-ce que la récompense des justes ?', 'What is the reward of the righteous?', 'O que é a recompensa dos justos?'),
        options: [
          l('Ce que le juste reçoit de l’Éternel après l’avoir servi avec justice', 'What the righteous receive from the Eternal after serving him with justice', 'O que o justo recebe do Eterno depois de o ter servido com justiça'),
          l('L’argent que l’on gagne au marché', 'The money earned at the market', 'O dinheiro que se ganha no mercado'),
          l('Un titre donné par la paroisse', 'A title given by the parish', 'Um título dado pela paróquia'),
        ],
        explain: l('C’est ce que le juste reçoit de l’Éternel après l’avoir servi avec justice (Catéchisme).', 'It is what the righteous receive from the Eternal after serving him with justice (Catechism).', 'É o que o justo recebe do Eterno depois de o ter servido com justiça (Catecismo).'),
      },
    ],
  },
  {
    n: 10,
    title: l('La Première Onction : mon engagement', 'The First Anointing: my commitment', 'A Primeira Unção: o meu compromisso'),
    body: l(
      'Par la Première Onction, je m’engage pour toute ma vie à aimer et servir l’Éternel seul. L’Éternel imprime son Nom dans mon âme. Je ne la reçois qu’une fois : avant de la recevoir, je m’assure que j’ai abandonné tout autre culte.',
      'Through the First Anointing I commit for my whole life to love and serve the Eternal alone. The Eternal imprints his Name in my soul. I receive it only once: before receiving it, I make sure I have given up every other worship.',
      'Pela Primeira Unção comprometo-me para toda a vida a amar e servir só o Eterno. O Eterno imprime o seu Nome na minha alma. Recebo-a uma só vez: antes de a receber, certifico-me de que abandonei qualquer outro culto.',
    ),
    read: l('Deutéronome 29 : 9-12 ; Deutéronome 6 : 4-9 ; Nombres 6 : 22-27.', 'Deuteronomy 29:9-12; Deuteronomy 6:4-9; Numbers 6:22-27.', 'Deuteronómio 29:9-12; Deuteronómio 6:4-9; Números 6:22-27.'),
    learn: l('La déclaration du bénéficiaire.', 'The declaration of the recipient.', 'A declaração do beneficiário.'),
    step: l('Entretien avec un responsable, puis Première Onction.', 'Interview with a leader, then First Anointing.', 'Entrevista com um responsável, depois a Primeira Unção.'),
    texts: ['declaration'],
    questions: [
      {
        q: l('Combien de fois peut-on recevoir la Première Onction ?', 'How many times can the First Anointing be received?', 'Quantas vezes se pode receber a Primeira Unção?'),
        options: [l('Une seule fois', 'Only once', 'Uma só vez'), l('Chaque année', 'Every year', 'Todos os anos'), l('Chaque sabbat', 'Every Sabbath', 'Todos os sábados')],
        explain: l('Une seule fois dans l’Église, parce que ce sacrement a un caractère irréversible : c’est un engagement pour toute la vie.', 'Only once in the Church, because this sacrament is irreversible: it is a commitment for life.', 'Uma só vez na Igreja, porque este sacramento tem caráter irreversível: é um compromisso para toda a vida.'),
      },
      {
        q: l('Par la Première Onction, que fait l’Éternel ?', 'Through the First Anointing, what does the Eternal do?', 'Pela Primeira Unção, o que faz o Eterno?'),
        options: [l('Il imprime son Nom dans l’âme du bénéficiaire', 'He imprints his Name in the soul of the recipient', 'Imprime o seu Nome na alma do beneficiário'), l('Il donne une richesse immédiate', 'He gives immediate wealth', 'Dá uma riqueza imediata'), l('Il efface la Loi', 'He erases the Law', 'Apaga a Lei')],
        explain: l('De son côté, l’Éternel imprime son Nom dans l’âme du bénéficiaire (Catéchisme).', 'For his part, the Eternal imprints his Name in the soul of the recipient (Catechism).', 'Por seu lado, o Eterno imprime o seu Nome na alma do beneficiário (Catecismo).'),
      },
      {
        q: l('Avant de recevoir la Première Onction, de quoi dois-je m’assurer ?', 'Before receiving the First Anointing, what must I make sure of?', 'Antes de receber a Primeira Unção, de que me devo certificar?'),
        options: [l('Que j’ai abandonné tout autre culte', 'That I have given up every other worship', 'De que abandonei qualquer outro culto'), l('Que j’ai acheté une tenue neuve', 'That I have bought new clothes', 'De que comprei roupa nova'), l('Que j’ai consulté un devin', 'That I have consulted a soothsayer', 'De que consultei um adivinho')],
        explain: l('Je ne la reçois qu’une fois : avant, je m’assure que j’ai abandonné tout autre culte.', 'I receive it only once: before, I make sure I have given up every other worship.', 'Recebo-a uma só vez: antes, certifico-me de que abandonei qualquer outro culto.'),
      },
      {
        q: l('Comment commence la déclaration du bénéficiaire ?', 'How does the declaration of the recipient begin?', 'Como começa a declaração do beneficiário?'),
        options: [l('« L’Éternel est notre Dieu, l’Éternel est un ! »', '“The Eternal is our God, the Eternal is one!”', '«O Eterno é o nosso Deus, o Eterno é um!»'), l('« Je suis le plus fort de la paroisse ! »', '“I am the strongest in the parish!”', '«Sou o mais forte da paróquia!»'), l('« Mes ancêtres sont mes dieux ! »', '“My ancestors are my gods!”', '«Os meus antepassados são os meus deuses!»')],
        explain: l('« L’Éternel est notre Dieu, l’Éternel est un ! J’aimerai et servirai l’Éternel mon Dieu… »', '“The Eternal is our God, the Eternal is one! I will love and serve the Eternal my God…”', '«O Eterno é o nosso Deus, o Eterno é um! Amarei e servirei o Eterno meu Deus…»'),
      },
    ],
  },
  {
    n: 11,
    title: l('Le sabbat, le culte et les fêtes', 'The Sabbath, worship and the feasts', 'O sábado, o culto e as festas'),
    body: l(
      '« Souviens-toi du jour du sabbat pour le sanctifier. » Le culte a quatre parties : introduction, Parole de l’Éternel, offrandes et divers, fin du culte. Le Serment du Prophète est chanté avant la prédication. Les jours saints : 1er mars, 8 mars et 15 avril. Les autres fêtes : 12 avril et 30 avril, et la Fête de l’Alliance chaque année.',
      '“Remember the Sabbath day and keep it holy.” The service has four parts: introduction, Word of the Eternal, offerings and other matters, end of the service. The Prophet’s Oath is sung before the sermon. The holy days: 1 March, 8 March and 15 April. The other feasts: 12 April and 30 April, and the Feast of the Covenant every year.',
      '«Lembra-te do dia de sábado para o santificar.» O culto tem quatro partes: introdução, Palavra do Eterno, ofertas e diversos, fim do culto. O Juramento do Profeta é cantado antes da pregação. Os dias santos: 1 de março, 8 de março e 15 de abril. As outras festas: 12 de abril e 30 de abril, e a Festa da Aliança todos os anos.',
    ),
    read: l('Exode 20 : 8-11 ; Ésaïe 56 : 6-7 ; Ésaïe 58 : 13-14.', 'Exodus 20:8-11; Isaiah 56:6-7; Isaiah 58:13-14.', 'Êxodo 20:8-11; Isaías 56:6-7; Isaías 58:13-14.'),
    learn: l('Les dates des fêtes de l’Église.', 'The dates of the Church’s feasts.', 'As datas das festas da Igreja.'),
    texts: ['feasts'],
    questions: [
      {
        q: l('Quels sont les jours saints de l’Église ?', 'What are the holy days of the Church?', 'Quais são os dias santos da Igreja?'),
        options: [l('Le 1er mars, le 8 mars et le 15 avril', '1 March, 8 March and 15 April', '1 de março, 8 de março e 15 de abril'), l('Le 12 avril et le 30 avril seulement', '12 April and 30 April only', '12 de abril e 30 de abril apenas'), l('Le 1er janvier et le 1er mai', '1 January and 1 May', '1 de janeiro e 1 de maio')],
        explain: l('Les journées saintes sont le 1er mars, le 8 mars et le 15 avril (Catéchisme).', 'The holy days are 1 March, 8 March and 15 April (Catechism).', 'Os dias santos são 1 de março, 8 de março e 15 de abril (Catecismo).'),
      },
      {
        q: l('Combien de parties le culte du sabbat a-t-il ?', 'How many parts does the Sabbath service have?', 'Quantas partes tem o culto do sábado?'),
        options: [l('Quatre', 'Four', 'Quatro'), l('Deux', 'Two', 'Duas'), l('Sept', 'Seven', 'Sete')],
        explain: l('Introduction, Parole de l’Éternel, offrandes et divers, fin du culte.', 'Introduction, Word of the Eternal, offerings and other matters, end of the service.', 'Introdução, Palavra do Eterno, ofertas e diversos, fim do culto.'),
      },
      {
        q: l('Que chante-t-on avant la prédication ?', 'What is sung before the sermon?', 'O que se canta antes da pregação?'),
        options: [l('Le Serment du Prophète', 'The Prophet’s Oath', 'O Juramento do Profeta'), l('Un chant de mariage', 'A wedding song', 'Um cântico de casamento'), l('Rien, on reste toujours silencieux', 'Nothing, we always stay silent', 'Nada, fica-se sempre em silêncio')],
        explain: l('Le Serment du Prophète est chanté avant la prédication.', 'The Prophet’s Oath is sung before the sermon.', 'O Juramento do Profeta é cantado antes da pregação.'),
      },
      {
        q: l('Que fête-t-on le 12 avril ?', 'What is celebrated on 12 April?', 'O que se festeja a 12 de abril?'),
        options: [l('L’apparition du KCC', 'The appearance of the KCC', 'O aparecimento do KCC'), l('La naissance du Prophète', 'The birth of the Prophet', 'O nascimento do Profeta'), l('La Fête de l’Alliance', 'The Feast of the Covenant', 'A Festa da Aliança')],
        explain: l('Le 12 avril rappelle l’apparition du KCC à Boma, en 1958.', '12 April recalls the appearance of the KCC in Boma, in 1958.', 'O 12 de abril lembra o aparecimento do KCC em Boma, em 1958.'),
      },
    ],
  },
  {
    n: 12,
    title: l('L’Alliance et la vie dans l’Église', 'The Covenant and life in the Church', 'A Aliança e a vida na Igreja'),
    body: l(
      '« Le sang n’est pas l’Alliance de l’Éternel : ce sont les dix commandements. Cette Alliance demeure éternellement. » Dans ma famille : le mariage est une union sacrée ; tout nouveau-né est présenté à l’Éternel afin qu’il lui appartienne.',
      '“Blood is not the Covenant of the Eternal: the ten commandments are. This Covenant stands for ever.” In my family: marriage is a sacred union; every newborn is presented to the Eternal so that it may belong to him.',
      '«O sangue não é a Aliança do Eterno: são os dez mandamentos. Esta Aliança permanece para sempre.» Na minha família: o casamento é uma união sagrada; cada recém-nascido é apresentado ao Eterno para que lhe pertença.',
    ),
    read: l('Exode 24 : 3-8 ; Deutéronome 30 : 15-20.', 'Exodus 24:3-8; Deuteronomy 30:15-20.', 'Êxodo 24:3-8; Deuteronómio 30:15-20.'),
    step: l('Actes d’Alliance, à la prochaine Fête de l’Alliance.', 'Acts of Covenant, at the next Feast of the Covenant.', 'Atos de Aliança, na próxima Festa da Aliança.'),
    questions: [
      {
        q: l('Qu’est-ce que l’Alliance de l’Éternel ?', 'What is the Covenant of the Eternal?', 'O que é a Aliança do Eterno?'),
        options: [l('Les dix commandements', 'The ten commandments', 'Os dez mandamentos'), l('Le sang', 'Blood', 'O sangue'), l('Un objet que l’on porte sur soi', 'An object worn on oneself', 'Um objeto que se traz consigo')],
        explain: l('« Le sang n’est pas l’Alliance de l’Éternel : ce sont les dix commandements. Cette Alliance demeure éternellement. »', '“Blood is not the Covenant of the Eternal: the ten commandments are. This Covenant stands for ever.”', '«O sangue não é a Aliança do Eterno: são os dez mandamentos. Esta Aliança permanece para sempre.»'),
      },
      {
        q: l('Quand reçoit-on les Actes d’Alliance ?', 'When are the Acts of Covenant received?', 'Quando se recebem os Atos de Aliança?'),
        options: [l('Chaque année, à la Fête de l’Alliance', 'Every year, at the Feast of the Covenant', 'Todos os anos, na Festa da Aliança'), l('Une seule fois dans la vie', 'Only once in a lifetime', 'Uma só vez na vida'), l('Seulement le jour du mariage', 'Only on the wedding day', 'Só no dia do casamento')],
        explain: l('Chaque année, à la Fête de l’Alliance, le peuple reconnaît l’Éternel comme l’unique vrai Dieu et accepte les Paroles de l’Alliance.', 'Every year, at the Feast of the Covenant, the people recognise the Eternal as the only true God and accept the Words of the Covenant.', 'Todos os anos, na Festa da Aliança, o povo reconhece o Eterno como o único Deus verdadeiro e aceita as Palavras da Aliança.'),
      },
      {
        q: l('Que mange-t-on lors des Actes d’Alliance ?', 'What is eaten at the Acts of Covenant?', 'O que se come nos Atos de Aliança?'),
        options: [l('Le pain d’Alliance', 'The bread of the Covenant', 'O pão da Aliança'), l('La viande d’un sacrifice', 'The meat of a sacrifice', 'A carne de um sacrifício'), l('Rien du tout', 'Nothing at all', 'Nada')],
        explain: l('On fait mémoire de l’Alliance du Sinaï (Exode 24 : 3-8) et l’on mange le pain d’Alliance.', 'We remember the Covenant of Sinai (Exodus 24:3-8) and eat the bread of the Covenant.', 'Faz-se memória da Aliança do Sinai (Êxodo 24:3-8) e come-se o pão da Aliança.'),
      },
      {
        q: l('Que fait-on pour un nouveau-né ?', 'What is done for a newborn?', 'O que se faz por um recém-nascido?'),
        options: [l('Il est présenté à l’Éternel afin qu’il lui appartienne', 'It is presented to the Eternal so that it may belong to him', 'É apresentado ao Eterno para que lhe pertença'), l('On le présente aux ancêtres', 'It is presented to the ancestors', 'É apresentado aos antepassados'), l('On lui met une amulette', 'An amulet is put on it', 'Põe-se-lhe um amuleto')],
        explain: l('Tout nouveau-né est présenté à l’Éternel afin qu’il lui appartienne.', 'Every newborn is presented to the Eternal so that it may belong to him.', 'Cada recém-nascido é apresentado ao Eterno para que lhe pertença.'),
      },
    ],
  },
];
