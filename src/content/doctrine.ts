/**
 * Doctrine de l'EBNM/KCC (le KCCisme), reprise des documents officiels de
 * l'Église conservés dans les archives de Reagan Mbumba (dossier « Documents
 * Église DIPARVIE » : catéchisme, textes liturgiques 2014, circulaires du
 * Chef Spirituel, préface et postface du livre « Le KCCisme »).
 * Textes recopiés avec seulement des corrections de frappe. Aucune adresse,
 * aucun nom de membre ni aucune donnée familiale ou financière n'y figure.
 */

export const doctrineSource = 'Documents officiels de l’EBNM/KCC, Direction du Siège, Kinshasa (2004-2015).';

/** « Spécificités doctrinales » de l'EBNM. */
export const specificities = [
  { label: 'Livre de travail', value: 'La Bible (Torah)' },
  { label: 'Religion', value: 'Le KCCisme' },
  { label: 'Doctrine', value: 'Le KCCisme' },
  { label: 'Adhérent', value: 'Le KCCiste' },
  { label: 'Ligne maîtresse', value: 'Le monothéisme radical' },
  { label: 'Dieu', value: 'L’Éternel, unique vrai Dieu' },
];

/** Apparition des signes KCC (12 avril 1958) et leur interprétation. */
export const kccApparition = {
  title: 'L’apparition du KCC',
  date: '12 avril 1958, Boma',
  paragraphs: [
    'Dans la soirée du 12 avril 1958, se trouvant dans sa chambre à Boma, le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac eut une vision : le ciel s’ouvrit et trois signes, KCC, écrits en or, apparurent.',
    'Aussitôt, il entendit une voix lui dire : « Lis et interprète ces signes. » Comme il ne le put, la même voix se mit à les lire et à les interpréter, dans sa langue maternelle, le kikongo. Après l’interprétation, les signes disparurent.',
    'Ces trois signes prophétiques forment un tout indivisible : il y a le MESSAGE et ses deux qualités, BON et NOUVEAU. La couleur dorée exprime la valeur de ce message. Quelle que soit la langue, la prononciation « kasese » de ces trois consonnes reste invariable.',
    'Le KCCisme, doctrine et religion de l’Église, émane du KCC. Il n’est pas un mot forgé par la raison humaine : c’est l’Éternel lui-même qui a présenté ces signes à son Prophète pour le salut de l’humanité.',
  ],
  letters: [
    { letter: 'K', kikongo: 'Nkanda', fr: 'Lettre, livre, message' },
    { letter: 'C', kikongo: 'Wambote', fr: 'Bon' },
    { letter: 'C', kikongo: 'Wampa', fr: 'Nouveau' },
  ],
  meaning: 'KCC = « Nkanda Wambote Wampa » : Bon Nouveau Message.',
};

/** L'Oracle du 15 avril 2003. */
export const oracle = {
  title: 'L’Oracle du 15 avril 2003',
  quote: '« Quels que soient les miracles qu’il opère, un homme ne peut être Dieu. »',
  paragraphs: [
    'C’est le 15 avril 2003 que l’Éternel adressa cet oracle à son Prophète. Aussitôt, son intelligence s’ouvrit et il reçut la lumière sur la connaissance de l’unique vrai Dieu.',
    'L’Éternel lui ordonna de proclamer cet oracle, comme il le recommanda au Prophète Ésaïe (Es. 8 : 11-16). Par lui, l’Église est sortie du culte des dieux étrangers pour ne s’attacher qu’à l’Éternel et entrer dans sa sainte Alliance.',
    'L’Oracle annonce l’accomplissement de ce que le KCC avait prédit (Es. 42 : 9) : la restauration de la croyance en un Dieu unique, Créateur du ciel, de la terre et de tout ce qui s’y trouve, seul Rédempteur, que l’on doit glorifier, adorer, prier et en qui l’on doit se confier (Es. 43 : 10-11 ; 45 : 20-22).',
  ],
  attributes: ['Créateur', 'Invisible', 'Immatériel', 'Incomparable', 'Sans image ni représentation', 'Sauveur', 'Souverain', 'Seigneur', 'Rédempteur', 'Omnipotent', 'Omniscient', 'Omniprésent', 'Immuable', 'Éternel', 'Un'],
};

/** Profession de foi officielle (textes liturgiques 2014). */
export const professionOfFaith = {
  title: 'La Profession de foi',
  rite: 'L’assemblée se lève, la main droite levée, et déclare :',
  articles: [
    'Je crois en l’Éternel Dieu de qui toute vie découle. Il est Un, Seigneur des seigneurs, Créateur du ciel, de la terre et de tout ce qui s’y trouve.',
    'Je crois au salut que, par sa grâce, sa miséricorde et à son Nom, l’Éternel Dieu a offert à toute l’humanité par son Alliance et sa Loi.',
    'Je crois à la Sainte Parole de Dieu révélée à ses prophètes pour le salut de l’humanité.',
    'Je crois à l’immortalité de l’âme et à la vie éternelle.',
    'Je crois à la rémission des péchés par l’Éternel, par l’exécution de sa Loi et à son Nom.',
    'Je crois au jugement divin, à la récompense des justes et au châtiment éternel des incrédules.',
    'Je crois que l’Oint de Dieu DIZOLELE-MPUNGU WAFIDUSWA Isaac est Prophète venu de l’Éternel Dieu.',
    'Je crois que l’Église Bon Nouveau Message (KCC) vient de Dieu, qu’elle est une, sainte et prophétique.',
  ],
  church: [
    { t: 'Une', d: 'Parce que son fondateur invisible, l’Éternel, est un, et que son fondateur visible est un.' },
    { t: 'Sainte', d: 'Parce qu’elle est le fruit de l’inspiration de Dieu, qui est saint.' },
    { t: 'Prophétique', d: 'Parce que son fondateur est Prophète et que ses enseignements émanent de la lignée des prophètes de l’Éternel.' },
  ],
};

export interface MultilingualList { id: string; title: string; intro?: string; versions: { lang: string; items: string[] }[] }

/** Les Paroles de l'Alliance, les commandements de l'Église et les objectifs de l'enseignement. */
export const lawTexts: MultilingualList[] = [
  {
    id: 'alliance',
    title: 'Les dix Paroles de l’Alliance',
    intro: 'Le peuple entre dans l’Alliance de l’Éternel en reconnaissant l’Éternel comme l’unique vrai Dieu et en acceptant ses Paroles.',
    versions: [
      { lang: 'Français', items: [
        'C’est moi l’Éternel qui suis votre Dieu : tu n’auras point d’autres dieux que moi.',
        'Tu ne te feras point d’images taillées, tu ne te prosterneras point devant elles et tu ne les serviras point.',
        'Tu n’invoqueras point le nom de l’Éternel ton Dieu en vain ou à l’appui du mensonge.',
        'Souviens-toi du jour du sabbat pour le sanctifier.',
        'Honore ton père et ta mère.',
        'Tu ne tueras point.',
        'Tu ne commettras point d’adultère.',
        'Tu ne voleras point.',
        'Tu ne mentiras point.',
        'Tu ne convoiteras ni l’homme, ni la femme, ni quoi que ce soit qui appartienne à ton prochain.',
      ] },
      { lang: 'Lingala', items: [
        'Okozala na banzambe mosusu te bobele ngai.',
        'Okomisalela bikeko te mpo na kofukamela to kosalela biango.',
        'Okotanga nkombo na Yawe Nzambe na pamba to pona kosimbisa lokuta te.',
        'Tosa mokolo mwa sabata mpe bulisa yango.',
        'Tosa tata na yo mpe mama na yo.',
        'Okoboma te.',
        'Okosala ekobo te.',
        'Okoyiba te.',
        'Okobuka lokuta te.',
        'Okolula soko mobali, soko mwasi, soko eloko ya mozalani na yo te.',
      ] },
      { lang: 'Kikongo', items: [
        'Kukalanga ye nzambi zankaka ko, nkasi mono kaka.',
        'Kukivanganga nzambi za biteki ko, kufukamananga bio vo sadila bio ko.',
        'Kusadilanga nkumbu a Yave Nzambi aku mu nkatu ko, vo mu nungisa luvunu.',
        'Banzila lumbu kia lumingu ye bieka kio kia nlongo.',
        'Vumina se diaku ye ngudi aku.',
        'Kuvondanga ko.',
        'Kuyanganga ko.',
        'Kuyibanga ko.',
        'Kuvovanga luvunu ko.',
        'Kuzinininga bakala, vo nkento, vo lekua kia mfinangani aku ko.',
      ] },
      { lang: 'English', items: [
        'You shall have no other gods except me.',
        'You shall make no graven images; you shall not bow down before them nor serve them.',
        'You shall not take the name of the Lord your God in vain or in support of lies.',
        'Remember the Sabbath day and keep it holy.',
        'Honour your father and your mother.',
        'You shall not kill.',
        'You shall not commit adultery.',
        'You shall not steal.',
        'You shall not lie.',
        'You shall not covet a man, nor a woman, nor anything that belongs to your neighbour.',
      ] },
    ],
  },
  {
    id: 'commandements',
    title: 'Les sept commandements de l’Église',
    intro: 'Arrêtés par le Chef Spirituel à Kinshasa, le 18 février 2015.',
    versions: [
      { lang: 'Français', items: [
        'Ne pas boire de boissons enivrantes ni fumer.',
        'Ne point consulter les féticheurs, les devins ni les morts.',
        'Participer au culte du sabbat et des jours saints.',
        'Participer à la communion fraternelle et aux dons pacifiques annuels.',
        'Reconnaître que le mariage est une union sacrée à sauvegarder.',
        'Demeurer saint.',
        'Aimer l’Église, la protéger et la soutenir.',
      ] },
      { lang: 'Lingala', items: [
        'Komela masanga ya kolangwisa te to likaya.',
        'Kokende epai ya banganga nkisi te, epai na bango bakolobaka na milimo te, mpe epai ya bakufi te.',
        'Sambela mokolo mwa sabata mpe mikolo mya mosanto.',
        'Pesa makabo ya lisanga ya mbula mpe ya matondi.',
        'Okondima ete libala ezali lisanga ya bulee mpe ya kobatela.',
        'Wumela mosanto.',
        'Linga lingomba, batela mpe salisa yango.',
      ] },
      { lang: 'Kikongo', items: [
        'Kanua nduinu zi nsansisanga vo nsunga ko.',
        'Kuendanga kua zinganga za minkisi vo kua bavovilanga muzi mpeve vo kua bafua ko.',
        'Sambila mu lumbu bia lumingu ye bia nlongo.',
        'Vana mbundulu a ntuadi ya mvu ye matondo ma mvu.',
        'Zaya vo dikuela diena kintuadi kia nlongo ye kifueni mu tanunua.',
        'Zingila mu lunungu.',
        'Zola dibundu, keba ye sadisa dio.',
      ] },
    ],
  },
  {
    id: 'objectifs',
    title: 'Les cinq objectifs de l’enseignement religieux',
    intro: 'Toute prédication, quel que soit l’auditoire, doit viser l’un de ces cinq objectifs (circulaire du Chef Spirituel, 2014).',
    versions: [
      { lang: 'Français', items: [
        'Révéler à l’humanité l’unique vrai Dieu, l’Éternel.',
        'Convertir les âmes perdues à l’Éternel Dieu.',
        'Amener les hommes à obéir à la Parole de l’Éternel Dieu et à exécuter sa loi.',
        'Préserver les adeptes contre les fausses doctrines.',
        'Apprendre aux fidèles à vivre dans la crainte de l’Éternel afin de mériter le royaume des cieux.',
      ] },
      { lang: 'Lingala', items: [
        'Kotalisa na mokili, Nzambe se moko ya solo, Yawe.',
        'Kobongola bato babunga epai na Yawe.',
        'Koteya bato batosa liloba na Yawe Nzambe mpe basalela mibeko na ye.',
        'Kobatela bandimi na mateya ya lokuta.',
        'Koteya bandimi kowumela na bobangi na Yawe Nzambe mpo ete bakoka koyingela na bokonzi na likolo.',
      ] },
      { lang: 'Kikongo', items: [
        'Songa kua nza, Nzambi yimosi kaka ya kedika, i Yave.',
        'Tuala miela mia vila kua Yave Nzambi.',
        'Luengisa bantu mu tumamana mpova za Yave Nzambi ye sadila nsiku miandi.',
        'Tanina baleka minu mu lembua tumamana malongi ma luvunu.',
        'Longa kua bavilula madiela mu zingila ku nsia vumi kia Yave Nzambi mpasi bafuanana mu kota mu kimfumu kia mazulu.',
      ] },
      { lang: 'Swahili', items: [
        'Kuonyesha wazi kwa ulimwengu ya kwamba Mungu ni mmoja wa kweli na wa milele.',
        'Kuokoa mioyo iliyopotea, imugeukie Mungu wa milele.',
        'Kuhubiri watu washike neno la Mungu na kutumikisha amri zake.',
        'Kufundisha waamini wafanye angalisho juu ya mahubiri ya uongo.',
        'Kuhubiri waamini juu ya kutembea kati ya kuogopa Mungu kwa ajili ya kurithi ufalme wa Mungu.',
      ] },
      { lang: 'Tshiluba', items: [
        'Leja kudi bantu bonso, Yopowa, Nzambi umue mulelela.',
        'Kudiumuna mitshima ya bantu bijimine, kudi Yopowa Nzambi.',
        'Ambila bantu banemeke diyi dia Yopowa ne benze mikenji yende.',
        'Dimuisha bena kuitabuisha ku malongesha a dishima.',
        'Leja bena kuitabuisha ditshina dia Yopowa bua babuele mu diulu.',
      ] },
    ],
  },
];

/** Sacrements administrés par l'EBNM. */
export const sacraments = [
  { t: 'La confession', d: 'L’Éternel ne demande aucun sacrifice pour pardonner : il demande la décision de cesser définitivement de pécher et la sincérité dans l’aveu. Il pardonne en son propre Nom.' },
  { t: 'La Première Onction', d: 'Sacrement par lequel l’homme reconnaît l’Éternel comme son unique Dieu et s’engage à l’aimer et à le servir de tout son cœur, de toute son âme et de toute sa force (Dt 29 : 9-12). Il ne se reçoit qu’une seule fois : il est irréversible.' },
  { t: 'Les Actes d’Alliance', d: 'Cérémonie au cours de laquelle le peuple reconnaît l’Éternel comme l’unique vrai Dieu, accepte les Paroles de l’Alliance et s’engage à n’honorer que l’Éternel et à pratiquer ses ordonnances, préceptes et commandements.' },
];

/** Fêtes ecclésiastiques et jours saints. */
export const feasts = [
  { date: '1er mars', t: 'Naissance du Prophète', d: 'Né le 1er mars 1930 à Makaba (Luozi). Jour saint.' },
  { date: '8 mars', t: 'Naissance de l’Église', d: 'Appel du Prophète, le 8 mars 1955. Jour saint.' },
  { date: '12 avril', t: 'Apparition du KCC', d: 'Les signes KCC apparaissent à Boma, le 12 avril 1958.' },
  { date: '15 avril', t: 'Fête de la Délivrance (Oracle)', d: 'Proclamation de l’Oracle, le 15 avril 2003. Jour saint.' },
  { date: '30 avril', t: 'Reconnaissance juridique', d: 'Personnalité civile accordée par l’Ordonnance n° 128-80 du 30 avril 1980.' },
  { date: 'Chaque année', t: 'Fête de l’Alliance', d: 'Commémoration annuelle de l’entrée dans l’Alliance de l’Éternel.' },
];

/** Ordre ordinaire du culte du sabbat (textes liturgiques 2014). */
export const sabbathService = [
  { part: 'I. Introduction', steps: ['Souhait de paix', 'Cantique d’ensemble', 'Prière d’invocation', 'Réception', 'Lecture de la lettre', 'Chorale(s)', 'Cantique d’ensemble', 'Profession de foi'] },
  { part: 'II. Parole de l’Éternel', steps: ['Lecture biblique', 'Serment du Prophète (cantique)', 'Cantique d’ensemble', 'Prédication', 'Prière d’action de grâces', 'Chorale(s)', 'Diverses bénédictions'] },
  { part: 'III. Offrandes et divers', steps: ['Cantiques d’ensemble', 'Chorale(s)', 'Prière pour les offrandes', 'Annonces'] },
  { part: 'IV. Fin du culte', steps: ['Cantique d’ensemble', 'Mot et prière ou bénédiction finale'] },
];

/** Le Serment du Prophète (récit du Chef Spirituel). */
export const prophetOath = {
  title: 'Le Serment du Prophète',
  paragraphs: [
    'En 1966, un groupe d’autorités religieuses missionnaires demanda au Prophète de jurer publiquement, devant une assemblée de plus de 500 personnes, qu’il changerait sa manière de prêcher.',
    'La même nuit, le ciel réagit : un groupe d’anges vint lui enseigner un cantique. Au moment fixé, au lieu de céder, il chanta ce cantique, les larmes aux yeux, avec l’Apôtre UNKEBA. Son contenu est un serment : ne prêcher que la vérité qui se trouve dans la Bible. Avec l’Oracle du 15 avril, l’Église a compris que cette Bible est la Torah.',
    'Ce serment est une recommandation divine que tout serviteur doit méditer avant de prêcher. C’est pourquoi, dans tout grand culte, ce cantique est chanté avant la prédication.',
  ],
};

/** Le nom de Dieu. */
export const nameOfGod = {
  title: 'Précision sur le nom de notre Dieu',
  paragraphs: [
    'Lorsque Moïse demanda à Dieu son nom, Dieu répondit : « Je suis l’Être invariable. » Et il ajouta : « Je suis l’Éternel, le Dieu de vos pères, le Dieu d’Abraham, d’Isaac et de Jacob. Tel est mon nom à jamais, tel sera mon attribut de génération en génération » (Exode 3 : 14-15).',
    'À notre époque, pour sauver les âmes de l’idolâtrie, le même Dieu est apparu au Prophète DIZOLELE et lui a indiqué son nom en lui recommandant de lire le Psaume 136 : « Rendez grâce à l’Éternel, car il est bon, car sa miséricorde dure à toujours. »',
    'Depuis le 8 mars 1955, le Prophète enseigne au monde l’Éternel : comment l’adorer, le servir, le craindre et s’appuyer sur lui. Pour le KCCiste, notre Dieu s’appelle l’Éternel.',
  ],
};

/** Repères biographiques du Prophète (note biographique officielle et postface du « KCCisme »). */
export const prophetTimeline = [
  { year: '1930', t: 'Naissance', d: 'Le 1er mars 1930 à Makaba, secteur de Kinkenge, territoire de Luozi (Bas-Congo, aujourd’hui Kongo-Central).' },
  { year: '1940-1949', t: 'Études', d: 'Écoles protestantes de Makaba et de Luangu, puis mission catholique de Kidima. Plus tard, sténodactylographie par correspondance (Institut national de sténographie de Bruxelles, 1957-1961).' },
  { year: '1950-1968', t: 'Vie professionnelle', d: 'Pointeur, clerc puis secrétaire sténodactylographe dans plusieurs sociétés du Mayombe et de Boma, jusqu’à la Société congolaise de surveillance (actuel OCC).' },
  { year: '1955', t: 'L’appel', d: 'Du 8 au 13 mars 1955, au camp Teli de la société Forakam (Seke-Banza), il reçoit apparitions, visions et révélations. Il a 25 ans. Le 8 mars 1955 est la date de naissance de l’Église.' },
  { year: '1956', t: 'Début de la prédication', d: 'Après un temps d’affermissement par l’Éternel, il commence à prêcher la Parole à Boma.' },
  { year: '1958', t: 'Apparition du KCC', d: 'Le 12 avril 1958 à Boma, les trois signes KCC lui apparaissent en lettres d’or.' },
  { year: '1958-1962', t: 'Mission dans le Manianga', d: 'Mission religieuse dans le Manianga.' },
  { year: '1966', t: 'Le Serment', d: 'Sommé de changer sa manière de prêcher, il chante le cantique reçu des anges, devenu le « Serment du Prophète ».' },
  { year: '1968', t: 'Au service de l’Éternel', d: 'Il quitte la vie professionnelle le 27 février 1968 et se consacre entièrement à l’Église naissante, comme Fondateur visible, Chef Spirituel et Représentant légal.' },
  { year: '1980', t: 'Reconnaissance juridique', d: 'L’Église obtient la personnalité civile par l’Ordonnance n° 128-80 du 30 avril 1980, après 25 ans d’existence.' },
  { year: '1976-2005', t: 'Missions', d: 'Kisangani, Bukavu, Lubumbashi ; Belgique, Suisse, Allemagne, France, Royaume-Uni ; Angola (Luanda, Bengo, Soyo, Cabinda, Landana) ; États-Unis et Canada ; Afrique du Sud. Séminaire international d’agriculture moderne en Israël (1989).' },
  { year: '2003', t: 'L’Oracle', d: 'Le 15 avril 2003 : « Quels que soient les miracles qu’il opère, un homme ne peut être Dieu. »' },
  { year: '2005', t: 'Enregistrement', d: 'L’Église est enregistrée au Ministère des Affaires intérieures sous le n° 0182 du 11 octobre 2005.' },
  { year: '2010', t: '« Mon Appel »', d: 'Publication du récit de son appel, après « L’Éternel Dieu et le Salut de l’Humanité, Oracle » (2005).' },
];

export const prophetPortrait = [
  'L’histoire du Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac ne peut être dissociée de celle de l’Église Bon Nouveau Message (KCC), dont il est le Fondateur visible et le Chef Spirituel.',
  'À son appel, il n’appartenait à aucune Église. Comme tous ceux que l’Éternel appelle, il résista d’abord, prétextant qu’il n’était qu’un enfant ; il dut accepter. Comme les prophètes avant lui, il connut persécutions, calomnies, trahisons et arrestations.',
  'Il savait qu’il était Prophète mais ne s’est jamais proclamé comme tel : ce sont sa vie, ses actions et son œuvre qui l’ont fait reconnaître comme l’élu et le serviteur de l’Éternel (Es. 42 : 1).',
];

/** Annexe EBNM hors RD Congo mentionnée dans les documents (lieux uniquement). */
export const internationalPresence = ['Angola : Luanda, Cabinda, Soyo', 'Congo-Brazzaville : Brazzaville, Pointe-Noire', 'Europe', 'Afrique du Sud', 'Amérique du Nord'];
