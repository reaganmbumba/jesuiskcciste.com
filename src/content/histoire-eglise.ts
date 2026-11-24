import type { Tri } from '@/i18n';

/**
 * « Histoire de l'Église : grandes dates et personnalités » (/histoire).
 *
 * Chaque fait vient d'un texte de l'Église déjà publié sur le site, cité dans
 * `source` (voir SOURCES). Ne rien ajouter sans source : les faits qui
 * manquent encore sont listés dans TO_CONFIRM et affichés comme tels.
 */

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

export type SourceKey = 'kccisme' | 'monAppel' | 'noteBio' | 'serment' | 'civil' | 'tournee' | 'pageRose';

export const SOURCES: Record<SourceKey, { label: Tri; to: string }> = {
  kccisme: { label: T('Livre « Le KCCisme » du Prophète', 'The Prophet’s book “Le KCCisme”', 'Livro «Le KCCisme» do Profeta'), to: '/livre-kccisme' },
  monAppel: { label: T('Livre « Mon Appel » (juillet 2010)', 'Book “Mon Appel” (July 2010)', 'Livro «Mon Appel» (julho de 2010)'), to: '/appel-du-prophete' },
  noteBio: { label: T('Note biographique officielle (Direction du Siège, 2015)', 'Official biographical note (Head Office, 2015)', 'Nota biográfica oficial (Direção da Sede, 2015)'), to: '/doctrine' },
  serment: { label: T('Récit du Serment par le Chef Spirituel', 'The Spiritual Leader’s account of the Oath', 'Relato do Juramento pelo Chefe Espiritual'), to: '/doctrine' },
  civil: { label: T('Document historique sur la personnalité civile', 'Historical document on legal status', 'Documento histórico sobre a personalidade civil'), to: '/histoire/reconnaissance-juridique' },
  tournee: { label: T('Rapport de la tournée du Prophète (2012)', 'Report of the Prophet’s tour (2012)', 'Relatório da digressão do Profeta (2012)'), to: '/predications/tournee-bas-congo-2012' },
  pageRose: { label: T('Page rose du 12 novembre 2026', 'Pink page of 12 November 2026', 'Página rosa de 12 de novembro de 2026'), to: '/actualites/edito-ann-page-rose-anniversaire-dizolele-mpungu-isaac' },
};

export type Era = 'naissance' | 'mission' | 'reconnaissance' | 'oracle';

export const ERAS: { id: Era; title: Tri; period: string }[] = [
  { id: 'naissance', title: T('L’appel et la naissance de l’Église', 'The calling and the birth of the Church', 'O chamamento e o nascimento da Igreja'), period: '1930 – 1958' },
  { id: 'mission', title: T('La mission et le Serment', 'The mission and the Oath', 'A missão e o Juramento'), period: '1958 – 1968' },
  { id: 'reconnaissance', title: T('Le chemin de la reconnaissance', 'The road to recognition', 'O caminho do reconhecimento'), period: '1966 – 1994' },
  { id: 'oracle', title: T('L’Oracle et l’Église d’aujourd’hui', 'The Oracle and the Church today', 'O Oráculo e a Igreja de hoje'), period: '2003 – ' },
];

export interface HistoryDate {
  id: string;
  era: Era;
  /** Date affichée (déjà traduite). */
  date: Tri;
  title: Tri;
  text: Tri;
  source: SourceKey[];
  /** Date majeure : mise en avant (fête ou tournant). */
  major?: boolean;
}

export const HISTORY_DATES: HistoryDate[] = [
  {
    id: 'naissance-prophete', era: 'naissance', major: true,
    date: T('1er mars 1930', '1 March 1930', '1 de março de 1930'),
    title: T('Naissance du Prophète', 'Birth of the Prophet', 'Nascimento do Profeta'),
    text: T(
      'DIZOLELE-MPUNGU WAFIDUSWA Isaac naît à Makaba, secteur de Kinkenge, territoire de Luozi (Bas-Congo, aujourd’hui Kongo-Central). Le 1er mars est un jour de fête dans l’Église.',
      'DIZOLELE-MPUNGU WAFIDUSWA Isaac is born in Makaba, Kinkenge sector, Luozi territory (Bas-Congo, now Kongo-Central). 1 March is a feast day in the Church.',
      'DIZOLELE-MPUNGU WAFIDUSWA Isaac nasce em Makaba, setor de Kinkenge, território de Luozi (Baixo Congo, hoje Kongo-Central). O 1 de março é dia de festa na Igreja.',
    ),
    source: ['noteBio', 'kccisme'],
  },
  {
    id: 'appel-1955', era: 'naissance', major: true,
    date: T('8 – 13 mars 1955', '8 – 13 March 1955', '8 – 13 de março de 1955'),
    title: T('L’appel du Prophète, naissance de l’Église', 'The Prophet’s calling, birth of the Church', 'O chamamento do Profeta, nascimento da Igreja'),
    text: T(
      'Au camp Teli de la société Forakam (territoire de Seke-Banza), il reçoit apparitions, visions et révélations. Il a 25 ans. Le 8 mars 1955 est la date de naissance de l’Église Bon Nouveau Message (KCC) : c’est un jour saint.',
      'At the Teli camp of the Forakam company (Seke-Banza territory), he receives apparitions, visions and revelations. He is 25 years old. 8 March 1955 is the birth date of the Église Bon Nouveau Message (KCC): it is a holy day.',
      'No acampamento Teli da empresa Forakam (território de Seke-Banza), recebe aparições, visões e revelações. Tem 25 anos. O 8 de março de 1955 é a data de nascimento da Église Bon Nouveau Message (KCC): é um dia santo.',
    ),
    source: ['kccisme', 'monAppel', 'noteBio'],
  },
  {
    id: 'predication-1956', era: 'naissance',
    date: T('1956', '1956', '1956'),
    title: T('Début de la prédication à Boma', 'Preaching begins in Boma', 'Início da pregação em Boma'),
    text: T(
      'Après un temps d’affermissement par l’Éternel, il commence à prêcher la Parole à Boma.',
      'After a time of strengthening by the Eternal, he begins to preach the Word in Boma.',
      'Depois de um tempo de fortalecimento pelo Eterno, começa a pregar a Palavra em Boma.',
    ),
    source: ['noteBio', 'monAppel'],
  },
  {
    id: 'kcc-1958', era: 'naissance', major: true,
    date: T('12 avril 1958', '12 April 1958', '12 de abril de 1958'),
    title: T('Apparition du KCC à Boma', 'The KCC appears in Boma', 'Aparição do KCC em Boma'),
    text: T(
      'Les trois signes KCC lui apparaissent en lettres d’or. L’Éternel les interprète en kikongo : « Nkanda Wambote Wampa », le Bon Nouveau Message. Ces signes donnent à l’Église son nom et son identité.',
      'The three signs KCC appear to him in golden letters. The Eternal interprets them in Kikongo: “Nkanda Wambote Wampa”, the Good New Message. These signs give the Church its name and identity.',
      'Os três sinais KCC aparecem-lhe em letras de ouro. O Eterno interpreta-os em kikongo: «Nkanda Wambote Wampa», a Boa Nova Mensagem. Estes sinais dão à Igreja o seu nome e a sua identidade.',
    ),
    source: ['kccisme', 'noteBio'],
  },
  {
    id: 'manianga', era: 'mission',
    date: T('1958 – 1962', '1958 – 1962', '1958 – 1962'),
    title: T('Mission dans le Manianga', 'Mission in Manianga', 'Missão no Manianga'),
    text: T('Mission religieuse du Prophète dans le Manianga.', 'The Prophet’s religious mission in Manianga.', 'Missão religiosa do Profeta no Manianga.'),
    source: ['noteBio'],
  },
  {
    id: 'tata-nkulutu-1964', era: 'mission',
    date: T('1964', '1964', '1964'),
    title: T('« Tata Nkulutu » à Matadi', '“Tata Nkulutu” in Matadi', '«Tata Nkulutu» em Matadi'),
    text: T(
      'Lors d’une assemblée tenue à Matadi, l’Éternel inspire qu’on appelle le Prophète « Tata Nkulutu », c’est-à-dire l’aîné de tous ceux qui croiraient en lui par son enseignement.',
      'At an assembly held in Matadi, the Eternal inspires that the Prophet be called “Tata Nkulutu”, the elder of all who would believe in Him through his teaching.',
      'Numa assembleia realizada em Matadi, o Eterno inspira que o Profeta seja chamado «Tata Nkulutu», o mais velho de todos os que creriam n’Ele pelo seu ensino.',
    ),
    source: ['kccisme'],
  },
  {
    id: 'serment-1966', era: 'mission', major: true,
    date: T('1966', '1966', '1966'),
    title: T('Le Serment du Prophète', 'The Prophet’s Oath', 'O Juramento do Profeta'),
    text: T(
      'Sommé par des autorités religieuses missionnaires de changer sa manière de prêcher, il chante, au lieu de céder, le cantique reçu des anges à Muakasa, devant près de 500 personnes réunies à Luangu, avec l’Apôtre UNKEBA : ne prêcher que la vérité de la Bible. Ce « Serment du Prophète » est chanté avant la prédication dans tout grand culte.',
      'Ordered by missionary religious authorities to change the way he preached, instead of giving in he sings the hymn received from the angels at Muakasa, before nearly 500 people gathered at Luangu, with the Apostle UNKEBA: to preach only the truth of the Bible. This “Prophet’s Oath” is sung before the sermon at every major service.',
      'Intimado por autoridades religiosas missionárias a mudar a sua maneira de pregar, em vez de ceder canta o hino recebido dos anjos em Muakasa, diante de cerca de 500 pessoas reunidas em Luangu, com o Apóstolo UNKEBA: pregar só a verdade da Bíblia. Este «Juramento do Profeta» é cantado antes da pregação em todo o grande culto.',
    ),
    source: ['kccisme', 'serment'],
  },
  {
    id: 'consecration-1968', era: 'mission',
    date: T('27 février 1968', '27 February 1968', '27 de fevereiro de 1968'),
    title: T('Entièrement au service de l’Éternel', 'Wholly at the service of the Eternal', 'Inteiramente ao serviço do Eterno'),
    text: T(
      'Il quitte la vie professionnelle (il était secrétaire sténodactylographe à la Société congolaise de surveillance, l’actuel OCC, à Boma) et se consacre entièrement à l’Église comme Fondateur visible, Chef Spirituel et Représentant légal.',
      'He leaves professional life (he was a shorthand secretary at the Société congolaise de surveillance, today’s OCC, in Boma) and devotes himself entirely to the Church as visible Founder, Spiritual Leader and Legal Representative.',
      'Deixa a vida profissional (era secretário estenodactilógrafo na Société congolaise de surveillance, a atual OCC, em Boma) e dedica-se inteiramente à Igreja como Fundador visível, Chefe Espiritual e Representante legal.',
    ),
    source: ['noteBio', 'kccisme'],
  },
  {
    id: 'guy-bernard', era: 'reconnaissance',
    date: T('Mars 1966', 'March 1966', 'Março de 1966'),
    title: T('Premier conseil : demander la personnalité civile', 'First advice: apply for legal status', 'Primeiro conselho: pedir a personalidade civil'),
    text: T(
      'À Boma, le sociologue canadien Guy Bernard conseille au Prophète de demander à l’État la personnalité civile. La première requête est déposée en 1968.',
      'In Boma, the Canadian sociologist Guy Bernard advises the Prophet to apply to the State for legal status. The first application is filed in 1968.',
      'Em Boma, o sociólogo canadiano Guy Bernard aconselha o Profeta a pedir ao Estado a personalidade civil. O primeiro pedido é apresentado em 1968.',
    ),
    source: ['civil', 'tournee'],
  },
  {
    id: 'arrestation-1971', era: 'reconnaissance',
    date: T('12 septembre 1971', '12 September 1971', '12 de setembro de 1971'),
    title: T('Arrestation du Prophète à Lemba', 'The Prophet arrested in Lemba', 'Prisão do Profeta em Lemba'),
    text: T(
      'Au sortir du culte, l’Apôtre Suprême et Représentant légal est arrêté sur ordre du bourgmestre de Lemba, puis libéré quelques jours plus tard.',
      'Leaving the service, the Supreme Apostle and Legal Representative is arrested on the orders of the burgomaster of Lemba, then released a few days later.',
      'À saída do culto, o Apóstolo Supremo e Representante legal é preso por ordem do burgomestre de Lemba, sendo libertado alguns dias depois.',
    ),
    source: ['civil'],
  },
  {
    id: 'dissolution-1972', era: 'reconnaissance',
    date: T('28 mars 1972', '28 March 1972', '28 de março de 1972'),
    title: T('Dissolution et clandestinité', 'Dissolution and clandestine life', 'Dissolução e clandestinidade'),
    text: T(
      'Par l’ordonnance n° 72-195, l’Église, non agréée, est dissoute de plein droit. Elle continue dans la clandestinité ; l’Éternel promet au Prophète : « Je vous aiderai ».',
      'By ordinance no. 72-195, the Church, not being approved, is dissolved by law. It carries on in secret; the Eternal promises the Prophet: “I will help you”.',
      'Pelo decreto n.º 72-195, a Igreja, não aprovada, é dissolvida de pleno direito. Continua na clandestinidade; o Eterno promete ao Profeta: «Eu vos ajudarei».',
    ),
    source: ['civil'],
  },
  {
    id: 'cdaz-1977', era: 'reconnaissance',
    date: T('Octobre 1977', 'October 1977', 'Outubro de 1977'),
    title: T('Nouveau nom : C.D.A.Z.', 'New name: C.D.A.Z.', 'Novo nome: C.D.A.Z.'),
    text: T(
      'L’Église, appelée jusque-là Église Universelle de Douze Apôtres, adhère à l’Église du Christ au Zaïre et devient la « Communauté de Douze Apôtres au Zaïre » (C.D.A.Z.).',
      'The Church, until then called Église Universelle de Douze Apôtres, joins the Church of Christ in Zaire and becomes the “Communauté de Douze Apôtres au Zaïre” (C.D.A.Z.).',
      'A Igreja, até então chamada Église Universelle de Douze Apôtres, adere à Igreja de Cristo no Zaire e torna-se a «Communauté de Douze Apôtres au Zaïre» (C.D.A.Z.).',
    ),
    source: ['civil'],
  },
  {
    id: 'empoisonnement-1979', era: 'reconnaissance',
    date: T('17 janvier 1979', '17 January 1979', '17 de janeiro de 1979'),
    title: T('Le Prophète échappe à l’empoisonnement', 'The Prophet survives poisoning', 'O Profeta escapa ao envenenamento'),
    text: T(
      'À Mbanza-Ngungu, un repas empoisonné est servi au Chef de l’Église. L’Éternel le lui avait annoncé : il vomit le poison et en réchappe.',
      'In Mbanza-Ngungu, a poisoned meal is served to the Head of the Church. The Eternal had foretold it to him: he vomits the poison and survives.',
      'Em Mbanza-Ngungu, é servida uma refeição envenenada ao Chefe da Igreja. O Eterno tinha-lho anunciado: vomita o veneno e sobrevive.',
    ),
    source: ['civil'],
  },
  {
    id: 'personnalite-civile-1980', era: 'reconnaissance', major: true,
    date: T('30 avril 1980', '30 April 1980', '30 de abril de 1980'),
    title: T('La personnalité civile', 'Legal status granted', 'A personalidade civil'),
    text: T(
      'Après quatre requêtes (1968, 1972, 1976, 1979), l’ordonnance n° 128/80 du Président de la République accorde la personnalité civile à l’Église, après 25 ans d’existence. Le 30 avril est fêté chaque année, partout dans le monde.',
      'After four applications (1968, 1972, 1976, 1979), ordinance no. 128/80 of the President of the Republic grants the Church legal status, after 25 years of existence. 30 April is celebrated every year, all over the world.',
      'Depois de quatro pedidos (1968, 1972, 1976, 1979), o decreto n.º 128/80 do Presidente da República concede a personalidade civil à Igreja, após 25 anos de existência. O 30 de abril é celebrado todos os anos, em todo o mundo.',
    ),
    source: ['civil', 'kccisme', 'noteBio'],
  },
  {
    id: 'palais-du-peuple-1980', era: 'reconnaissance',
    date: T('20 juillet 1980', '20 July 1980', '20 de julho de 1980'),
    title: T('Fête de la sortie officielle', 'Official celebration', 'Festa da saída oficial'),
    text: T(
      'Grande fête au Palais du Peuple, à Kinshasa, devant de nombreux invités et fidèles.',
      'Great celebration at the Palais du Peuple in Kinshasa, before many guests and faithful.',
      'Grande festa no Palais du Peuple, em Kinshasa, perante muitos convidados e fiéis.',
    ),
    source: ['civil'],
  },
  {
    id: 'independance-1994', era: 'reconnaissance',
    date: T('1994', '1994', '1994'),
    title: T('L’Église reprend son indépendance', 'The Church regains its independence', 'A Igreja retoma a sua independência'),
    text: T(
      'Pour exprimer sa réelle indépendance et consolider son identité, l’Église se détache de l’Église du Christ au Zaïre et quitte le nom C.D.A.Z.',
      'To express its real independence and strengthen its identity, the Church leaves the Church of Christ in Zaire and drops the name C.D.A.Z.',
      'Para exprimir a sua real independência e consolidar a sua identidade, a Igreja separa-se da Igreja de Cristo no Zaire e deixa o nome C.D.A.Z.',
    ),
    source: ['civil'],
  },
  {
    id: 'oracle-2003', era: 'oracle', major: true,
    date: T('15 avril 2003', '15 April 2003', '15 de abril de 2003'),
    title: T('L’Oracle', 'The Oracle', 'O Oráculo'),
    text: T(
      '« Quels que soient les miracles qu’il opère, un homme ne peut être Dieu. » Par cet oracle, l’Église sort du culte des dieux étrangers pour ne s’attacher qu’à l’Éternel. C’est l’accomplissement du KCC de 1958. Le 15 avril, Fête de la Délivrance, est un jour saint ; la Fête de l’Alliance suit 50 jours après.',
      '“Whatever miracles he performs, a man cannot be God.” Through this oracle, the Church leaves the worship of foreign gods to hold only to the Eternal. It is the fulfilment of the KCC of 1958. 15 April, the Feast of Deliverance, is a holy day; the Feast of the Covenant follows 50 days later.',
      '«Sejam quais forem os milagres que opere, um homem não pode ser Deus.» Por este oráculo, a Igreja sai do culto dos deuses estrangeiros para se apegar só ao Eterno. É o cumprimento do KCC de 1958. O 15 de abril, Festa da Libertação, é um dia santo; a Festa da Aliança segue-se 50 dias depois.',
    ),
    source: ['kccisme', 'noteBio'],
  },
  {
    id: 'enregistrement-2005', era: 'oracle',
    date: T('11 octobre 2005', '11 October 2005', '11 de outubro de 2005'),
    title: T('Enregistrement au Ministère', 'Registration with the Ministry', 'Registo no Ministério'),
    text: T(
      'L’Église est enregistrée au Ministère des Affaires intérieures sous le n° 0182. La même année paraît le livre du Prophète « L’Éternel Dieu et le Salut de l’Humanité, Oracle ».',
      'The Church is registered with the Ministry of the Interior under no. 0182. The same year, the Prophet’s book “L’Éternel Dieu et le Salut de l’Humanité, Oracle” is published.',
      'A Igreja é registada no Ministério dos Assuntos Internos sob o n.º 0182. No mesmo ano, é publicado o livro do Profeta «L’Éternel Dieu et le Salut de l’Humanité, Oracle».',
    ),
    source: ['noteBio'],
  },
  {
    id: 'mon-appel-2010', era: 'oracle',
    date: T('Juillet 2010', 'July 2010', 'Julho de 2010'),
    title: T('Le livre « Mon Appel »', 'The book “Mon Appel”', 'O livro «Mon Appel»'),
    text: T(
      'Le Prophète publie à Kinshasa le récit de son appel : les faits vécus du 8 mars 1955 au début de 1956.',
      'The Prophet publishes in Kinshasa the account of his calling: what he lived from 8 March 1955 to early 1956.',
      'O Profeta publica em Kinshasa o relato do seu chamamento: o que viveu de 8 de março de 1955 ao início de 1956.',
    ),
    source: ['monAppel', 'kccisme'],
  },
  {
    id: 'tournee-2012', era: 'oracle',
    date: T('28 avril – 12 mai 2012', '28 April – 12 May 2012', '28 de abril – 12 de maio de 2012'),
    title: T('Tournée du Prophète au Bas-Congo', 'The Prophet’s tour of Bas-Congo', 'Digressão do Profeta no Baixo Congo'),
    text: T(
      'Pour le 32e anniversaire de la personnalité civile, il prêche à Inkisi, Mbanza-Ngungu, Lukala, Kimpese, Kenge, Matadi, Boma et Nlemba.',
      'For the 32nd anniversary of legal status, he preaches in Inkisi, Mbanza-Ngungu, Lukala, Kimpese, Kenge, Matadi, Boma and Nlemba.',
      'No 32.º aniversário da personalidade civil, prega em Inkisi, Mbanza-Ngungu, Lukala, Kimpese, Kenge, Matadi, Boma e Nlemba.',
    ),
    source: ['tournee'],
  },
  {
    id: 'aujourdhui', era: 'oracle', major: true,
    date: T('Aujourd’hui', 'Today', 'Hoje'),
    title: T('La mission continue', 'The mission goes on', 'A missão continua'),
    text: T(
      'L’Éternel a rappelé le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac dans son royaume. Son Éminence DIZOLELE MPUNGU Isaac, Chef de l’Église Bon Nouveau Message (KCC), assure la continuité de l’œuvre qui lui a été confiée.',
      'The Eternal has called the Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac home to His kingdom. His Eminence DIZOLELE MPUNGU Isaac, Head of the Église Bon Nouveau Message (KCC), carries on the work entrusted to him.',
      'O Eterno chamou o Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac para o seu reino. Sua Eminência DIZOLELE MPUNGU Isaac, Chefe da Église Bon Nouveau Message (KCC), assegura a continuidade da obra que lhe foi confiada.',
    ),
    source: ['pageRose'],
  },
];

export interface Personality {
  id: string;
  name: string;
  role: Tri;
  text: Tri;
  source: SourceKey[];
  link?: { to: string; label: Tri };
}

export const PERSONALITIES: Personality[] = [
  {
    id: 'prophete',
    name: 'DIZOLELE-MPUNGU WAFIDUSWA Isaac',
    role: T('Le Prophète, Fondateur visible de l’Église', 'The Prophet, visible Founder of the Church', 'O Profeta, Fundador visível da Igreja'),
    text: T(
      'Né le 1er mars 1930 à Makaba (Luozi), appelé par l’Éternel le 8 mars 1955 à 25 ans. Il reçoit le KCC (1958), chante le Serment (1966), devient Chef Spirituel et Représentant légal (1968), obtient la personnalité civile (1980) et reçoit l’Oracle (2003). Appelé « Tata Nkulutu » depuis 1964. Auteur de « L’Éternel Dieu et le Salut de l’Humanité, Oracle », « Mon Appel » et « Le KCCisme ».',
      'Born on 1 March 1930 in Makaba (Luozi), called by the Eternal on 8 March 1955 at the age of 25. He receives the KCC (1958), sings the Oath (1966), becomes Spiritual Leader and Legal Representative (1968), obtains legal status (1980) and receives the Oracle (2003). Called “Tata Nkulutu” since 1964. Author of “L’Éternel Dieu et le Salut de l’Humanité, Oracle”, “Mon Appel” and “Le KCCisme”.',
      'Nascido a 1 de março de 1930 em Makaba (Luozi), chamado pelo Eterno a 8 de março de 1955 aos 25 anos. Recebe o KCC (1958), canta o Juramento (1966), torna-se Chefe Espiritual e Representante legal (1968), obtém a personalidade civil (1980) e recebe o Oráculo (2003). Chamado «Tata Nkulutu» desde 1964. Autor de «L’Éternel Dieu et le Salut de l’Humanité, Oracle», «Mon Appel» e «Le KCCisme».',
    ),
    source: ['noteBio', 'kccisme', 'monAppel'],
    link: { to: '/appel-du-prophete', label: T('Lire « Mon Appel »', 'Read “Mon Appel”', 'Ler «Mon Appel»') },
  },
  {
    id: 'chef-actuel',
    name: 'DIZOLELE MPUNGU Isaac',
    role: T('Son Éminence, Chef actuel de l’Église', 'His Eminence, current Head of the Church', 'Sua Eminência, atual Chefe da Igreja'),
    text: T(
      'Chef de l’Église Bon Nouveau Message (KCC), il porte la lourde responsabilité qui lui a été léguée : assurer la continuité de la mission que l’Éternel a confiée au Prophète. À ne pas confondre avec le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac.',
      'Head of the Église Bon Nouveau Message (KCC), he carries the heavy responsibility handed down to him: ensuring the continuity of the mission the Eternal entrusted to the Prophet. Not to be confused with the Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac.',
      'Chefe da Église Bon Nouveau Message (KCC), carrega a pesada responsabilidade que lhe foi legada: assegurar a continuidade da missão que o Eterno confiou ao Profeta. Não confundir com o Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac.',
    ),
    source: ['pageRose'],
    link: { to: '/actualites/edito-ann-page-rose-anniversaire-dizolele-mpungu-isaac', label: T('Lire la page rose', 'Read the pink page', 'Ler a página rosa') },
  },
  {
    id: 'unkeba',
    name: 'Apôtre UNKEBA',
    role: T('Témoin du Serment (1966)', 'Witness of the Oath (1966)', 'Testemunha do Juramento (1966)'),
    text: T(
      'C’est avec lui que le Prophète chanta, les larmes aux yeux, le cantique du Serment devant l’assemblée, au lieu de renoncer à prêcher la vérité de la Bible.',
      'It was with him that the Prophet sang, with tears in his eyes, the hymn of the Oath before the assembly, instead of giving up preaching the truth of the Bible.',
      'Foi com ele que o Profeta cantou, com lágrimas nos olhos, o hino do Juramento diante da assembleia, em vez de renunciar a pregar a verdade da Bíblia.',
    ),
    source: ['serment'],
  },
  {
    id: 'khonde-kinkela',
    name: 'Prédicateur KHONDE KINKELA',
    role: T('Secrétaire Général de l’Église (1979)', 'Secretary General of the Church (1979)', 'Secretário-Geral da Igreja (1979)'),
    text: T(
      'Il accompagnait le Chef de l’Église à Mbanza-Ngungu le 17 janvier 1979 ; c’est à lui que le Prophète raconta la prophétie de l’empoisonnement, qui venait de s’accomplir.',
      'He was with the Head of the Church in Mbanza-Ngungu on 17 January 1979; it was to him that the Prophet told the prophecy of the poisoning, which had just come true.',
      'Acompanhava o Chefe da Igreja em Mbanza-Ngungu a 17 de janeiro de 1979; foi a ele que o Profeta contou a profecia do envenenamento, que acabara de se cumprir.',
    ),
    source: ['civil'],
  },
  {
    id: 'guy-bernard',
    name: 'Guy Bernard',
    role: T('Sociologue canadien, ami de l’Église', 'Canadian sociologist, friend of the Church', 'Sociólogo canadiano, amigo da Igreja'),
    text: T(
      'Venu de Kinshasa voir le Prophète à Boma, il examina son travail et lui conseilla de demander à l’État la personnalité civile : le début d’un chemin de quatorze ans.',
      'Coming from Kinshasa to see the Prophet in Boma, he examined his work and advised him to apply to the State for legal status: the start of a fourteen-year road.',
      'Vindo de Kinshasa ver o Profeta em Boma, examinou o seu trabalho e aconselhou-o a pedir ao Estado a personalidade civil: o início de um caminho de catorze anos.',
    ),
    source: ['civil', 'tournee'],
  },
];

/** Les noms successifs de l'Église. */
export const CHURCH_NAMES: { period: Tri; name: string; text: Tri }[] = [
  {
    period: T('Jusqu’en 1977', 'Until 1977', 'Até 1977'),
    name: 'Église Universelle de Douze Apôtres (EUDA, EUDAC)',
    text: T('Nom porté pendant les premières années et les premières démarches.', 'Name used in the early years and first applications.', 'Nome usado nos primeiros anos e nos primeiros pedidos.'),
  },
  {
    period: T('1977 – 1994', '1977 – 1994', '1977 – 1994'),
    name: 'Communauté de Douze Apôtres au Zaïre (C.D.A.Z.)',
    text: T('Nom reçu à l’entrée dans l’Église du Christ au Zaïre ; c’est sous ce nom que la personnalité civile est obtenue en 1980.', 'Name received on joining the Church of Christ in Zaire; legal status was obtained under this name in 1980.', 'Nome recebido ao entrar na Igreja de Cristo no Zaire; foi com este nome que se obteve a personalidade civil em 1980.'),
  },
  {
    period: T('Aujourd’hui', 'Today', 'Hoje'),
    name: 'Église Bon Nouveau Message (EBNM / KCC)',
    text: T('Le nom vient des trois signes KCC, « Nkanda Wambote Wampa » : le Bon Nouveau Message.', 'The name comes from the three signs KCC, “Nkanda Wambote Wampa”: the Good New Message.', 'O nome vem dos três sinais KCC, «Nkanda Wambote Wampa»: a Boa Nova Mensagem.'),
  },
];

/** Les dates fêtées chaque année. */
export const FEAST_DAYS: { date: Tri; name: Tri; holy?: boolean }[] = [
  { date: T('1er mars', '1 March', '1 de março'), name: T('Naissance du Prophète', 'Birth of the Prophet', 'Nascimento do Profeta') },
  { date: T('8 mars', '8 March', '8 de março'), name: T('Naissance de l’Église (Actes d’Alliance)', 'Birth of the Church (Acts of Covenant)', 'Nascimento da Igreja (Atos de Aliança)'), holy: true },
  { date: T('12 avril', '12 April', '12 de abril'), name: T('Apparition du KCC', 'Appearance of the KCC', 'Aparição do KCC') },
  { date: T('15 avril', '15 April', '15 de abril'), name: T('Fête de la Délivrance (Oracle)', 'Feast of Deliverance (Oracle)', 'Festa da Libertação (Oráculo)'), holy: true },
  { date: T('30 avril', '30 April', '30 de abril'), name: T('Fête de la Reconnaissance juridique', 'Feast of Legal Recognition', 'Festa do Reconhecimento jurídico') },
  { date: T('15 avril + 50 jours', '15 April + 50 days', '15 de abril + 50 dias'), name: T('Fête de l’Alliance', 'Feast of the Covenant', 'Festa da Aliança'), holy: true },
];
