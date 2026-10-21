/**
 * Rites et célébrations de l'EBNM, repris des « Textes liturgiques 2014 »
 * (brochure du Chef Spirituel) et des programmes officiels de 2014-2016 :
 * première onction (03/03/2015), bénédiction des enfants (18/02/2015),
 * déclaration des Actes d'Alliance (02/07/2014), circulaire sur le culte de
 * mariage (2016), dédicace d'un temple (2013). Corrections de frappe
 * uniquement ; aucun nom de fidèle n'y figure.
 */

export interface RiteText { title: string; lines: string[]; lang?: string; /** Variante linguistique d'un même texte, présentée en onglets. */ tab?: boolean }
export interface Rite {
  id: string;
  title: string;
  when?: string;
  summary: string;
  programme?: { part?: string; steps: string[] }[];
  texts?: RiteText[];
  notes?: string[];
  bible?: string;
}

export const liturgyIntro = {
  title: 'Les rites et les cérémonies',
  quote: 'Dans le KCCisme, les rites et les cérémonies constituent des actes sacrés qui confèrent à la liturgie de l’Église Bon Nouveau Message (KCC) la solennité et la gloire destinées à l’Éternel Dieu.',
  paragraphs: [
    'L’officiant consacré à ces actes doit les intérioriser et les exécuter avec compétence et inspiration, sous la guidance de l’Éternel Dieu. C’est pourquoi le Chef Spirituel les a regroupés dans une brochure, outil de travail pour le culte sabbatique, la purification, la première onction, l’inhumation, la bénédiction des enfants, la bénédiction nuptiale, les Actes d’Alliance et la dédicace des temples.',
    'Les fondements bibliques et doctrinaux de chacune de ces cérémonies sont définis dans le grand livre du KCCisme. Toutes les prières se terminent par l’acclamation de l’assemblée.',
  ],
  acclamation: 'Alléluia ! Viens Seigneur Éternel, par Ton Saint Nom.',
  source: 'Textes liturgiques 2014, Église Bon Nouveau Message (KCC), le Chef Spirituel.',
};

export const rites: Rite[] = [
  {
    id: 'sabbat',
    title: 'Le culte sabbatique',
    when: 'Chaque sabbat',
    summary: 'Le culte ordinaire du sabbat se déroule en quatre parties, de la prière d’invocation à la bénédiction finale. La Profession de foi est déclarée par toute l’assemblée, debout, la main droite levée.',
    programme: [
      { part: 'I. Introduction', steps: ['Souhait de paix', 'Cantique d’ensemble', 'Prière d’invocation', 'Réception', 'Lecture de la lettre', 'Chorale(s)', 'Cantique d’ensemble', 'Profession de foi'] },
      { part: 'II. Parole de l’Éternel', steps: ['Lecture biblique', 'Serment du Prophète', 'Cantique d’ensemble', 'Prédication', 'Prière d’action de grâces', 'Chorale(s)', 'Diverses bénédictions'] },
      { part: 'III. Offrandes et divers', steps: ['Cantiques d’ensemble', 'Chorale(s)', 'Prière pour les offrandes', 'Annonces'] },
      { part: 'IV. Fin du culte', steps: ['Cantique d’ensemble', 'Mot et prière ou bénédiction finale'] },
    ],
  },
  {
    id: 'purification',
    title: 'La purification (confession)',
    when: 'Premier sacrement du néophyte',
    summary: 'Le confessant avoue ses péchés devant l’Éternel et devant des témoins, puis l’officiant prononce l’absolution au Nom de l’Éternel. L’Éternel ne demande aucun sacrifice : seulement la décision sincère de ne plus pécher.',
    programme: [{ steps: ['Cantique', 'Prière d’ouverture', 'Appel du confessant', 'Début de l’aveu', 'Aveu des péchés', 'Fin de l’aveu', 'Mot de l’officiant', 'Absolution des péchés', 'Sortie du confessant', 'Cantique', 'Prière de clôture'] }],
    texts: [
      { title: 'Début de l’aveu', lines: ['Par Ton Saint Nom, Éternel Dieu,', 'je m’agenouille devant Toi', 'pour confesser mes péchés', 'afin que je sois pardonné.'] },
      { title: 'Fin de l’aveu', lines: ['Par Ton Saint Nom, Éternel,', 'pour tout ce que je connais', 'et tout ce que je ne me rappelle plus,', 'je Te demande, ô Éternel Dieu, de me pardonner par Ton Saint Nom,', 'ainsi qu’à vous, ses témoins,', 'car j’ai résolu de ne plus y revenir.', 'Oui, qu’il en soit ainsi par Ton Saint Nom.'] },
      { title: 'Absolution', lines: ['Certes, nous avons cru que Toi, Éternel Dieu, notre Créateur, Tu es saint, et que Tu veux que Ton peuple soit saint.', 'Notre frère (notre sœur) vient de confesser tous ses péchés afin d’obtenir Ton pardon. Oui, je crois que Tu le lui as accordé par Ton Nom.', 'Aux témoins : « Voulez-vous aussi qu’il soit pardonné ? » – « Oui, nous voulons qu’il soit pardonné au Nom de l’Éternel Dieu. »', 'Lève-toi, crois et réjouis-toi, car tes péchés sont pardonnés par l’Éternel Dieu. Oui, qu’il en soit ainsi par Son Saint Nom.'] },
    ],
  },
  {
    id: 'onction',
    title: 'La Première Onction',
    when: 'Le samedi à 15 h, au cours d’un culte paroissial (circulaire du 3 mars 2015)',
    bible: 'Deutéronome 29 : 9-12 ; Nombres 6 : 22-27',
    summary: 'Par la Première Onction, l’homme entre dans l’Alliance de l’Éternel et porte dans son âme le Nom de l’Éternel. Elle n’est reçue qu’une seule fois. Le conseil paroissial organise ce culte après une bonne préparation des néophytes ; pour une ou deux personnes, l’onction peut être donnée à la fin du culte sabbatique. Chaque bénéficiaire reçoit une « Carte de la Première Onction », numérotée et enregistrée à la paroisse.',
    programme: [{ steps: ['Cantique', 'Prière d’invocation', 'Cantique', 'Prédication (Deut. 29 : 9-12)', 'Prière d’action de grâces', 'Appel nominal', 'Réception de l’officiant', 'Déclaration', 'Applaudissements', 'Onction', 'Présentation', 'Annonces', 'Bénédiction finale'] }],
    texts: [
      { title: 'Déclaration du bénéficiaire', lang: 'Français', tab: true, lines: ['L’Éternel est notre Dieu, l’Éternel est un !', 'J’aimerai et servirai l’Éternel mon Dieu', 'de tout mon cœur,', 'de toute mon âme', 'et de toute ma force.', 'Qu’il en soit ainsi au Nom de l’Éternel !'] },
      { title: 'Litatoli', lang: 'Lingala', tab: true, lines: ['Yawe azali Nzambe na biso, Yawe azali se moko', 'Nakolinga mpe kosalela Yawe Nzambe na ngai', 'na motema na ngai mobimba,', 'na molimo na ngai mobimba', 'mpe na makasi na ngai nyonso.', 'Tika ete ezala bongo na nkombo na Yawe !'] },
      { title: 'Mpova', lang: 'Kikongo', tab: true, lines: ['Yave i Nzambi eto, Yave wena umosi kaka', 'Mono ngina zola ye sadila Yave Nzambi ami', 'mu ntim’ami wa mvimba,', 'mu muel’ami wa mvimba', 'ye mu ngolo zami zazo.', 'Bika buakala bobo mu nkumbu a Yave !'] },
      { title: 'Onction (bénédiction)', lang: 'Français', lines: ['Que l’Éternel te bénisse et te protège !', 'Que l’Éternel fasse rayonner sa face sur toi et te soit miséricordieux !', 'Que l’Éternel dirige son regard vers toi et t’accorde la paix, aujourd’hui et à jamais !', 'Qu’il en soit ainsi au Nom de l’Éternel !'] },
      { title: 'Présentation à l’assemblée', lang: 'Français', lines: ['Ces frères et sœurs ont déclaré devant l’Éternel et son peuple que l’Éternel notre Dieu est un, et se sont engagés à l’aimer et à le servir de tout leur cœur et de toute leur force.', '« Voulez-vous les recevoir et les accueillir ? » – « Oui ! »'] },
    ],
  },
  {
    id: 'alliance',
    title: 'Les Actes d’Alliance',
    when: 'Fête de l’Alliance, célébrée chaque année',
    bible: 'Exode 24 : 3-8',
    summary: 'Au cours des Actes d’Alliance, le peuple reconnaît l’Éternel comme l’unique vrai Dieu, accepte les Paroles de l’Alliance et s’engage à pratiquer ses ordonnances, préceptes et commandements. On y fait mémoire de la conclusion de l’Alliance au Sinaï et l’on mange le « pain d’Alliance », repas symbolique de reconnaissance. C’est aussi la Pâque KCCiste, la fête de la délivrance.',
    programme: [
      { part: 'Louange', steps: ['Entrée de l’officiant', 'Cantique « Yawe yo Mokeli na biso »', 'Prière d’invocation', 'Chorale', 'Cantique « Nzela na Yawe ezali sembo »'] },
      { part: 'Mémoire de l’Alliance', steps: ['Lecture d’Exode 24 : 3-8', 'Interprétation', 'L’Alliance de l’Éternel par Israël pour toute l’humanité', 'Déclaration de la divinité de l’Éternel', 'Intercession', 'Renouvellement du pardon de l’Éternel'] },
      { part: 'Pain d’Alliance', steps: ['Prière de consécration', 'Présentation', 'Distribution', 'Ordre de manger le pain d’Alliance', 'Prière individuelle'] },
      { part: 'Clôture', steps: ['Offrandes', 'Cantiques', 'Prière finale', 'Mot du responsable', 'Clôture'] },
    ],
    texts: [
      { title: 'Prière d’invocation', lines: ['Seigneur Éternel, nous Te rendons grâce de nous avoir offert l’occasion de nous rassembler devant Toi, dans ce lieu saint, afin de commémorer Ta bonté et Ta bienveillance, Toi qui nous as indiqué le chemin du salut.', 'Par Ta sainte Alliance, nous sommes devenus Ton peuple, par qui Ton saint Nom doit être glorifié et Ton Alliance honorée. Daigne, Seigneur Éternel, recevoir nos actions de grâces.', 'Sois avec nous dans cette célébration, et que Ta divine puissance nous accompagne. Qu’il en soit ainsi par Ton Saint Nom.'] },
      { title: 'Déclaration au peuple (2 juillet 2014)', lines: ['Prenez conscience et reconnaissez que cette Alliance a été acceptée avec joie par l’assemblée des enfants d’Israël, qui s’est exprimée en ces termes : « Nous obéirons et mettrons en pratique tout ce qu’a recommandé l’Éternel, notre Dieu. »', 'Sachez qu’après la consécration par Moïse, les Paroles de cette Alliance ont été sanctifiées et rendues éternellement immuables au profit de l’humanité tout entière.', 'Qu’il soit également retenu que le sang n’est pas l’Alliance de l’Éternel : ce sont les dix commandements. Cette Alliance demeure éternellement.'] },
    ],
  },
  {
    id: 'enfants',
    title: 'La bénédiction des enfants',
    when: 'Présentation des nouveau-nés (programme du 18 février 2015)',
    summary: 'Selon la Parole de l’Éternel, tout nouveau-né doit être présenté à l’Éternel Dieu afin qu’il Lui appartienne. Les parents amènent l’enfant au lieu saint ; l’officiant le bénit, le présente à l’assemblée, remet une attestation de bénédiction et prodigue des conseils aux parents.',
    programme: [{ steps: ['Appel nominal', 'Réception de l’officiant', 'Déclaration', 'Cantique', 'Bénédiction', 'Présentation des enfants', 'Remise des attestations', 'Conseils de l’officiant aux parents', 'Retour des parents à leur place', 'Fin de la cérémonie'] }],
    texts: [
      { title: 'Déclaration', lines: ['Selon la Parole de l’Éternel, « il est recommandé que tout nouveau-né soit présenté à l’Éternel Dieu afin qu’il Lui appartienne ».', 'Ainsi, l’enfant ici présent, devant l’Éternel et en ce lieu saint, a été amené pour qu’Il l’accueille et le bénisse. Que cela s’accomplisse par Son Saint Nom, Éternel !'] },
      { title: 'Bénédiction', lines: ['Seigneur Éternel, nous Te rendons grâce de nous avoir donné cette progéniture. Nous savons que les enfants sont les fruits de Ta grâce.', 'Nous Te prions de bénir cet enfant par Ta grâce et en Ton Saint Nom, Éternel, afin qu’il T’appartienne et Te serve toute sa vie.', 'Qu’il en soit ainsi par Ton Saint Nom !'] },
    ],
  },
  {
    id: 'mariage',
    title: 'Le culte de mariage',
    summary: 'La bénédiction nuptiale comprend deux interrogatoires des époux, la bénédiction et le port des anneaux. Le culte est centré sur la gloire de l’Éternel seul : il ne doit pas devenir une soirée musicale.',
    programme: [
      { part: 'Louange et méditation', steps: ['Cantique', 'Prière d’invocation', 'Chorale', 'Prédication', 'Prière d’action de grâces', 'Offrandes'] },
      { part: 'Bénédiction nuptiale', steps: ['Présentation du couple', 'Premier interrogatoire (l’époux, puis l’épouse)', 'Deuxième interrogatoire (l’épouse, puis l’époux)', 'Bénédiction des anneaux et port des anneaux', 'Bénédiction du couple à genoux'] },
      { part: 'Fin', steps: ['Annonces', 'Signature des documents du mariage', 'Mot et bénédiction finale', 'Animation et remise des cadeaux'] },
    ],
    texts: [
      { title: 'Les questions aux époux', lines: ['As-tu vu ton épouse (ton époux) ?', 'Veux-tu qu’elle (qu’il) devienne ton épouse (ton époux) en l’Éternel ?', 'Veux-tu réellement qu’elle (qu’il) soit unie à toi au Nom de l’Éternel, afin que vous deveniez un ?', 'Continueras-tu à l’aimer toute ta vie, dans les difficultés comme dans les souffrances ?'] },
      { title: 'Bénédiction des anneaux', lines: ['Éternel, que ces anneaux deviennent les signes de leur union par le mariage. Qu’il en soit ainsi par Ton Saint Nom !'] },
      { title: 'Bénédiction du couple', lines: ['Éternel Dieu saint, nous savons que le mariage vient de Toi depuis le commencement, selon Ta parole : « L’homme quittera son père et sa mère, s’attachera à sa femme, et tous deux deviendront un. »', 'Ceux-ci sont présents en ce lieu saint, devant Toi et devant de nombreux témoins, pour être unis. Par Ta grâce, bénis-les durant toute leur vie ; bénis les fruits de leur travail et les fruits de leurs entrailles ; bénis leur mariage et protège-le jusqu’à la fin de leur vie.', 'Désormais, ils ne sont plus deux mais un. Qu’il en soit ainsi au Nom de l’Éternel !'] },
    ],
    notes: [
      'Le nombre de chorales qui interviennent ne doit pas dépasser sept, et l’heure du début et de la fin doit être respectée (circulaire de 2016).',
      'Après la bénédiction nuptiale, le couple KCCiste n’invite pas les membres de l’Église à chanter les cantiques religieux dans une fête où se mêlent la gloire à l’Éternel, les divinités étrangères et les danses profanes.',
      'L’alliance du mariage, ce sont les paroles d’engagement prononcées devant Dieu, l’Église et le conjoint : s’aimer définitivement malgré les difficultés.',
    ],
  },
  {
    id: 'deuil',
    title: 'La veillée mortuaire et l’inhumation',
    bible: 'Genèse 3 : 19',
    summary: 'La veillée à domicile alterne animation, méditation et témoignages. Le jour de l’inhumation, après le culte et la levée du corps, l’officiant prononce au cimetière les paroles d’inhumation, à haute voix. Si la famille souhaite s’exprimer, on lui laisse d’abord tout le temps nécessaire.',
    programme: [
      { part: 'Veillée à domicile', steps: ['Animation : souhait de paix, mot de circonstance, cantiques', 'Méditation : cantique de louange, prière, prédication, action de grâce', 'Lecture biographique et témoignages', 'Recueillement'] },
      { part: 'Programme de la journée', steps: ['Souhait de paix', 'Cantique et prière', 'Prédication', 'Intervention de la famille', 'Lecture biographique et témoignages', 'Dépôt des gerbes et couronnes', 'Recueillement', 'Levée du corps'] },
      { part: 'Au cimetière', steps: ['Mot de la famille', 'Souhait de paix', 'Cantique', 'Paroles d’inhumation', 'Cantique', 'Souhait de paix'] },
    ],
    texts: [
      { title: 'Paroles d’inhumation', lines: ['Au Nom de l’Éternel Dieu.', 'Il faut que ce corps mortel et corruptible meure, conformément à la Parole de l’Éternel : « Tu retourneras dans la terre d’où tu as été tiré, car tu es poussière, et tu redeviendras poussière. »', 'Celui qui meurt sans avoir reçu l’Éternel dans son âme et sans avoir mis ses lois en pratique, son âme ira au châtiment éternel.', 'Mais celui qui aura reçu l’Éternel dans son âme et aura mis ses lois en pratique, son âme sera sauvée et reçue dans la gloire éternelle.', 'Ainsi, que ton âme soit sauvée et reçue dans la gloire de l’Éternel. Oui, qu’il en soit ainsi au Nom de l’Éternel Dieu. Alléluia !'] },
    ],
    notes: ['Après les paroles d’inhumation, plus aucune intervention n’a lieu, sauf les cantiques d’ensemble pendant que l’on recouvre la tombe.'],
  },
  {
    id: 'dedicace',
    title: 'La dédicace d’un temple',
    when: 'Exemple : dédicace du temple de Malweka (Kinshasa), 11 août 2013',
    summary: 'Un nouveau temple est consacré à l’Éternel au cours d’un culte présidé par le Chef Spirituel, suivi de la cérémonie de dédicace proprement dite.',
    programme: [
      { part: 'Le culte', steps: ['Cantique d’ensemble', 'Prière', 'Mot de bienvenue', 'Chorales', 'Profession de foi', 'Lecture biblique', 'Serment du Prophète', 'Prédication du Chef Spirituel', 'Offrandes'] },
      { part: 'La dédicace', steps: ['Cantique « Ngolu monene ekiti na mokili oyo »', 'Allocution de la paroisse', 'Données techniques du bâtiment', 'Coupure du ruban', 'Lecture du mot de dédicace', 'Bénédiction de la chaire', 'Bénédiction finale', 'Signature du livre d’or'] },
    ],
  },
];
