/**
 * « Mon Appel », livre du Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac (juillet
 * 2010, préface de la Commission scientifique de l'EBNM), résumé chapitre par
 * chapitre. Les citations sont reprises du livre ; les noms des personnes
 * privées citées dans le récit (amis, hôtes, collègues) ont été retirés.
 */

export interface CallingChapter { id: string; date: string; place: string; title: string; paragraphs: string[]; quote?: string }

export const callingBook = {
  title: 'Mon Appel',
  author: 'DIZOLELE-MPUNGU WAFIDUSWA Isaac, Prophète de l’Éternel',
  published: 'Juillet 2010 · 87 pages · préface de la Commission scientifique de l’EBNM',
  intro: [
    'Dans ce livre, le Prophète décrit les faits spirituels qu’il a vécus du 8 mars 1955 au début de l’année 1956 dans le Bas-Congo, sa province natale : des apparitions, des visions, des songes et des épreuves par lesquels l’Éternel l’a préparé à sa mission.',
    '« Après plus d’un demi-siècle de vie sacerdotale, le moment est venu, sur ordre du Très-Haut, de livrer au monde, par un support écrit, ce qu’il a semé en moi et de décrire le début de mon parcours. »',
  ],
  preface: 'Le genre humain est de nature complexe. Parmi les personnages d’apparence ordinaire se distinguent des sujets dits exceptionnels : par la singularité des faits qui marquent leur existence, les prophètes de l’Éternel en font partie. L’appel de DIZOLELE-MPUNGU WAFIDUSWA Isaac retentit comme le signe d’un homme élu et consacré pour une mission divine avant sa naissance, comme le fut le prophète Jérémie (Jr 1 : 5).',
  prefaceAuthor: 'Commission scientifique de l’EBNM',
};

export const callingChapters: CallingChapter[] = [
  {
    id: 'contexte',
    date: '1953 – février 1955',
    place: 'Nlemba, Matadi, Seke-Banza',
    title: 'Le contexte de l’appel',
    paragraphs: [
      'Le 9 janvier 1953, le jeune Isaac est engagé pour deux ans comme distributeur à l’Agrifor de Nlemba. À la fin de son contrat, il cherche du travail à Matadi, puis un ami lui conseille de le rejoindre à la FORAKAM, une grande scierie du territoire de Seke-Banza.',
      'Arrivé au camp « Teli » en février 1955, il doit attendre le retour du patron parti en Europe. « C’est pendant cette période d’attente qu’il se produisit quelque chose d’extraordinaire pour moi : l’heure venait de sonner où l’Éternel Dieu devait accomplir son dessein. »',
    ],
  },
  {
    id: 'premiere-apparition',
    date: 'Nuit du 7 au 8 mars 1955',
    place: 'Camp Teli (FORAKAM)',
    title: 'La première apparition',
    quote: '« Regarde bien, c’est dans cette eau que se trouve ton bonheur. »',
    paragraphs: [
      'Vers une heure du matin, une voix l’appelle : « Isaac ! » Il se retrouve dehors aux côtés d’un homme qui lui dit : « Suis-moi. » Ils traversent une forêt et une vaste brousse jusqu’à un carrefour de trois chemins ; un second homme venu de l’Orient le conduit au sommet d’une colline et lui montre une vaste étendue de terre : « Regarde bien ce lieu, car tu devras le fréquenter quotidiennement. »',
      'Il lui montre ensuite un puits très profond, d’une eau limpide comme le cristal et brillante comme le soleil, où nagent de gros poissons. « Quand tu as faim et si tu veux nourrir les étrangers, tu viendras ici. » Le Prophète comprend qu’il aura de lourdes responsabilités et qu’il accueillera beaucoup de monde. Plus loin coule une rivière aux eaux noires : « Tu n’en toucheras point les poissons et tu ne boiras jamais de cette eau. » (L’eau limpide, c’est l’Éternel : Jérémie 17 : 13.)',
      'De retour au carrefour, l’homme s’agenouille, prie en silence pour lui une bénédiction sans fin, et une grande lumière descend du ciel sur eux.',
    ],
  },
  {
    id: 'deuxieme-apparition',
    date: '8 mars 1955',
    place: 'Camp Teli',
    title: 'La deuxième apparition et la tentative de fuir',
    paragraphs: [
      'À peine recouché, il voit le même homme près de son lit. Un arbre fruitier pousse et porte des fruits ; chaque fois qu’il tend la main, l’arbre s’élève et les fruits s’éloignent, et quand il baisse le bras, ils redescendent sur sa poitrine, jusqu’au matin.',
      'Bouleversé et effrayé par la grandeur de ce qui l’attend, il décide de pécher pour que l’Éternel le rejette : il fixe un rendez-vous à une jeune fille pour le soir même. Mais il s’endort tôt et oublie complètement le rendez-vous. « Ainsi, l’Éternel Dieu me préserva du mal. Ses plans sont, certes, intangibles. »',
    ],
  },
  {
    id: 'troisieme-apparition',
    date: 'Nuit du 9 au 10 mars 1955',
    place: 'Camp Teli',
    title: 'La troisième apparition',
    paragraphs: [
      'Au milieu d’une foule assise en cercle, un grand objet métallique, semblable à une maison et portant en lettres dorées le mot « FORAKAM », descend du ciel au-dessus de sa tête. Lorsqu’il tire sur la corde avec deux hommes pour savoir d’où il vient, le ciel s’ouvre sur une grande lumière : « Cessons de tirer, car cet objet vient du ciel, d’auprès de l’Éternel Dieu ! »',
      'À partir du 11 mars, il constate en lui un changement profond : les passions de ce monde se dissipent, et il éprouve une soif ardente de l’Éternel et de sa Parole.',
    ],
  },
  {
    id: 'psaume-136',
    date: 'Nuit du 12 au 13 mars 1955',
    place: 'Camp Teli',
    title: 'Le Psaume 136 et la pluie providentielle',
    quote: '« Louez l’Éternel, car il est bon ; car sa miséricorde dure à toujours. »',
    paragraphs: [
      'Saisi du désir de lire la Bible, il en emprunte une. La nuit, la même voix lui ordonne : « Isaac, ouvre ta Bible et lis le Psaume 136. » Il en lit les premiers versets… et s’aperçoit qu’il fait déjà jour.',
      'Comme Gédéon avec la toison (Juges 6 : 36-40), il demande un signe : la région n’a pas reçu de pluie depuis deux mois. À 7 h 30, il prie l’Éternel de faire tomber la pluie avant 8 heures. À 7 h 45, le ciel s’obscurcit ; à 7 h 50, une pluie torrentielle s’abat sur toute la contrée jusqu’après 9 heures et remplit les rivières. Il sait désormais que tout ce qu’il a vu vient de l’Éternel.',
    ],
  },
  {
    id: 'priere',
    date: '13 mars 1955',
    place: 'Camp Teli',
    title: 'La prière et le « oui » à l’Éternel',
    quote: '« Pardonne ton serviteur, Seigneur. Me voici, prends-moi maintenant. »',
    paragraphs: [
      'Effrayé par sa jeunesse, il supplie l’Éternel de confier cette mission à des personnes plus âgées et plus sages, ou d’attendre qu’il ait vieilli. L’Éternel lui répond avec sévérité : « Isaac, si tu n’acceptes pas aujourd’hui, je te tuerai. »',
      'Rempli de crainte, il répond : « Me voici, prends-moi maintenant. Je confie à ta puissante main non seulement mon âme et mon esprit, mais aussi mon corps, afin que tu les utilises et qu’ils servent à ta gloire. »',
    ],
  },
  {
    id: 'voyage',
    date: 'Mars 1955',
    place: 'Seke-Banza, Kinzao-Mvuete, Kimbuandi, Matadi',
    title: 'Le voyage vers l’inconnu',
    paragraphs: [
      'L’Éternel lui ordonne : « Lève-toi et quitte ce milieu. Va au carrefour : tu verras un véhicule s’arrêter là où tu seras, tu y prendras place et tu iras là où je t’enverrai. » Sans argent ni provisions, il part avec un compagnon ; des camions s’arrêtent d’eux-mêmes et les transportent sans rien leur demander.',
      'À Kimbuandi, un songe l’avertit : « Prends ton sac et pars d’ici, car ce milieu ne t’est pas destiné. » Le lendemain, son compagnon est engagé mais lui est renvoyé. À Matadi, une promesse d’emploi n’aboutit pas : divinement averti, il part pour Boma.',
    ],
  },
  {
    id: 'corde',
    date: 'Mars 1955',
    place: 'Route de Matadi à Boma',
    title: 'La corde aux vingt-six nœuds',
    paragraphs: [
      'En chemin, un songe lui interdit de partir avec le camion qui devait l’emmener : le véhicule passe sans qu’il entende le klaxon. La troisième nuit, un ange lui montre une corde de vingt-six parties séparées par des nœuds, la plie en deux et lui dit : « Demain matin, tu prendras ton sac et tu te rendras à Boma à pied. »',
      'Sur la route, un camion de grumes tombe en panne trois fois juste devant lui ; ses occupants, intrigués par ce « jeune homme mystérieux », finissent par le prendre à bord, et le camion ne tombe plus en panne. Le trajet a bien été réduit de moitié. Il arrive à Boma le 28 mars 1955.',
    ],
  },
  {
    id: 'boma',
    date: 'Avril 1955',
    place: 'Boma, Luozi',
    title: 'Protégé à Boma',
    paragraphs: [
      'Le 2 avril 1955, il est engagé à la société « Source de Boma ». Le lendemain, la ville est encerclée par des militaires qui arrêtent tous les travailleurs en situation irrégulière ; lui qui n’a pas de papiers passe le contrôle sans être inquiété.',
      'Condamné ensuite à une amende de cinq francs pour séjour irrégulier – exactement la somme qu’il possède –, il obtient de l’administrateur, contre toute attente, l’autorisation d’aller au village chercher sa mutation définitive pour Boma. Il se rend à Luozi, obtient le document et revient prendre son poste.',
    ],
  },
  {
    id: 'boissons',
    date: '1955',
    place: 'Matadi et Boma',
    title: 'L’interdit des boissons enivrantes',
    quote: '« Isaac, désormais, tu ne boiras plus de boissons enivrantes ; tu ne boiras que de la boisson sucrée. »',
    paragraphs: [
      'À Matadi, dans un songe, il voit des tables chargées de boissons, et la voix de l’Éternel lui donne cet ordre. Il refuse dès lors la bière qu’on lui offre.',
      'Plus tard, à Boma, il demande à l’Éternel la permission de boire « ne serait-ce qu’un peu ». En songe, la boisson coule le long de ses joues sans entrer dans sa bouche, le verre se brise en deux, et l’Éternel lui dit d’une voix forte : « Tu ne boiras plus jamais de boissons enivrantes. » Depuis, il observe ce précepte, devenu le premier commandement de l’Église.',
    ],
  },
  {
    id: 'onction',
    date: '1955 – 1956',
    place: 'Boma',
    title: 'La particularité de son onction',
    paragraphs: [
      'Un soir de prière, il voit sa chambre remplie de vieillards barbus qui chantent autour de lui en frappant des mains : « Toi, tu n’as pas été choisi par un homme… Ce travail n’appartient pas à un homme… Il faut beaucoup prier. » Le plus âgé l’avertit : « Tu dois conserver l’onction que tu as reçue. »',
      'Dans une autre extase, il se voit à côté de la plus belle femme du monde ; une voix l’invite à la prendre, l’autre répète trois fois : « Isaac, ne touche pas, car tu as été oint une seule fois. » Il s’abstient. À la Source de Boma, ceux qui l’observent le surnomment « Mupepe », l’homme de l’Esprit, et « Oncle », pour son humilité.',
    ],
  },
  {
    id: 'serment',
    date: '1956',
    place: 'Boma',
    title: 'Le serment de l’Éternel et les victoires annoncées',
    quote: '« Ngeye wena bamvela tadi » : toi, tu ressembles à une pierre incassable.',
    paragraphs: [
      'Craignant de chuter comme tant d’hommes de Dieu qui avaient bien commencé, il demande à l’Éternel une garantie. L’Éternel lui répond en kikongo : « Ngeye wena bamvela tadi. » Il comprend que l’Éternel a juré de le soutenir à jamais.',
      'En extase, il traverse une vallée pleine de buffles, une vallée pleine de boas et une ville pleine de chiens furieux ; chaque fois, il est attaqué au milieu du chemin et finit vainqueur. Ce sont les difficultés et les victoires qui l’attendent dans son ministère. Le 28 janvier 1957, il quitte la Source de Boma pour se consacrer à la prière et à l’œuvre de l’Éternel.',
    ],
  },
];

export const callingConclusion: string = 'Ce récit authentique de quelques faits spirituels marquant mon appel par l’Éternel Dieu démontre, une fois de plus, la grandeur de son attachement à ses élus, la profondeur de sa fidélité à ses promesses et son souci majeur pour le salut de l’homme. Sa volonté est que l’humanité entière Le connaisse, Le craigne, Le serve et L’adore, Lui, le seul vrai Dieu.';

/** Note biographique officielle (Direction du Siège, 2015). Données familiales et adresses retirées. */
export const biography = {
  title: 'Note biographique',
  facts: [
    { label: 'Naissance', value: '1er mars 1930 à Makaba (secteur de Kinkenge, territoire de Luozi, Bas-Congo)' },
    { label: 'Études', value: 'Écoles de Makaba (1940-1943), de Luangu (1943-1945) et de Kidima (1946-1949) ; sténo-dactylographie par correspondance, Institut national de sténographie de Bruxelles (1957-1961)' },
    { label: 'Vie professionnelle', value: 'Pointeur, clerc et secrétaire sténo-dactylographe à Nlundu, Mombo, Nlemba et Boma (1950-1968), notamment à l’actuel Office congolais de contrôle' },
    { label: 'Appel', value: '8 mars 1955, à 25 ans' },
    { label: 'Ministère', value: 'Depuis 1969, entièrement au service de l’Éternel : Fondateur visible, Chef Spirituel et Représentant légal de l’EBNM' },
    { label: 'Formation', value: 'Séminaire international d’agriculture moderne en Israël (juillet-septembre 1989)' },
    { label: 'Distinctions', value: 'Médailles d’or du Mérite civique et de la Paix' },
  ],
  missions: [
    { date: '1976', place: 'Kisangani' },
    { date: '1980', place: 'Bukavu' },
    { date: '1983', place: 'Lubumbashi ; Belgique, Suisse, Allemagne' },
    { date: '1990', place: 'Angola' },
    { date: '1994-1995', place: 'Suisse, France, Londres' },
    { date: '1996', place: 'Angola' },
    { date: '1999', place: 'France' },
    { date: '2001', place: 'États-Unis, Canada' },
    { date: '2002', place: 'Angola : Luanda, Bengo, Soyo, Cabinda, Landana' },
    { date: '2004-2005', place: 'Afrique du Sud : Pretoria, Johannesburg, Centurion, Le Cap, Atlantis' },
  ],
  missionsNote: 'Sans compter d’innombrables missions à l’intérieur du pays, surtout dans le Bas-Congo.',
  works: ['L’Éternel Dieu et le Salut de l’Humanité, Oracle (janvier 2005)', 'Mon Appel (juillet 2010)', 'Le KCCisme (livre de la doctrine)'],
};
