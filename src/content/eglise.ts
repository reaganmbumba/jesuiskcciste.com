/**
 * Contenus réels de l'EBNM/KCC, repris des textes transmis par
 * l'administrateur (messages de Reagan Mbumba, 2025-2026).
 * Ils sont recopiés tels quels, avec seulement des corrections de frappe.
 * Aucune donnée personnelle (téléphone, e-mail, membre) n'y figure.
 */

export interface Teaching {
  id: string;
  title: string;
  meta: { label: string; value: string }[];
  paragraphs: string[];
  quote?: string;
  closing?: { title: string; paragraphs: string[] };
}

export const teachings: Teaching[] = [
  {
    id: 'sabbat-nlemba-2012',
    title: 'Prédication du Prophète au Sabbat de Nlemba',
    meta: [
      { label: 'Date', value: '12 mai 2012 – Sabbat' },
      { label: 'Lieu', value: 'Paroisse de Nlemba' },
      { label: 'Motif', value: 'Réception du Prophète' },
      { label: 'Effectif', value: '1 250 âmes' },
      { label: 'Heure', value: '19 h – 6 h' },
      { label: 'Texte de base', value: 'Ésaïe 43 : 9-11' },
    ],
    paragraphs: [
      'Il existe encore une vérité cachée que le monde n’a ni reconnue ni proclamée. Pourtant, cette vérité est essentielle et attend toujours un témoin pour l’affirmer.',
      'L’Éternel appelle toutes les nations et leurs témoins à s’unir pour examiner les événements passés, mais aucun d’eux n’a été capable de révéler cette vérité cachée.',
      'C’est pourquoi Dieu choisit Israël comme son serviteur et témoin. Il ne confie pas cette mission à tout le monde, mais à un peuple spécifique.',
      'Cette vérité dissimulée par Satan, c’est que l’Éternel est le seul vrai Dieu et Sauveur, et elle doit être connue de tous. Celui qui la découvre trouve la sécurité pour sa vie.',
      'Toute personne qui l’ignore est exposée à l’idolâtrie. En tant que KCCiste, Dieu a tout mis à ta disposition. Tu dois le reconnaître comme unique. Mais beaucoup, malgré les bienfaits de Dieu, ne reconnaissent pas l’Éternel.',
      'Ainsi, toi KCCiste, tu dois proclamer que l’Éternel est le seul Dieu et l’enseigner à tes enfants. L’oracle nous a révélé cette connaissance. Sans elle, nous serions encore dans les ténèbres.',
      'Tu ne dois pas avoir honte de prêcher l’Éternel. Ce message doit atteindre l’humanité entière. Chaque Congolais doit le connaître et le porter fièrement. Et puisque nous avons été choisis pour cette mission, n’ayons pas peur, allons de l’avant et tenons ferme.',
    ],
    quote: '« C’est toi que j’ai choisi, pour que tu connaisses et que tu croies que c’est moi, l’Éternel. Avant moi, aucun Dieu n’a existé, et après moi, il n’y en aura pas. C’est moi, l’Éternel, votre seul Sauveur. »',
    closing: {
      title: 'Mot de la fin',
      paragraphs: [
        'Certains disent que DIZOLELE se prend pour Dieu. Ce n’est là qu’un discours de sabotage. En réalité, ces personnes savent pertinemment que ce n’est pas le cas.',
        'Heureusement, l’Éternel vous a fortifiés face à ces propos décourageants. En vérité, je suis venu enseigner la connaissance de l’Éternel, le Dieu créateur du ciel, de la terre et de tout ce qui s’y trouve.',
      ],
    },
  },
];

export const minuteToLearn = {
  title: 'Une Minute pour Apprendre',
  concept: '« Une Minute pour Apprendre » est une rubrique pédagogique et spirituelle qui, en seulement une minute, enseigne un point essentiel du KCCisme. Elle s’adresse à tous les fidèles, néophytes ou anciens, qui souhaitent approfondir leur foi et leur compréhension du Message du KCC, un point à la fois.',
  objectives: [
    'Approfondir la connaissance des enseignements du KCCisme.',
    'Encourager la méditation quotidienne sur les principes fondamentaux de la foi.',
    'Permettre aux croyants de mieux comprendre et de vivre leur foi au quotidien.',
  ],
  format: [
    { label: 'Durée', value: '1 minute, ou un texte court à lire en 1 minute' },
    { label: 'Contenu', value: 'Un extrait de doctrine, une explication, une anecdote historique ou un verset commenté' },
    { label: 'Support', value: 'Texte, audio ou vidéo' },
  ],
};

export interface HistoryChapter { id: string; title: string; paragraphs: string[]; hymn?: { lines: string[]; note: string } }

/** Récits de la préparation spirituelle de DIZOLELE Isaac avant son ministère. */
export const prophetHistory: HistoryChapter[] = [
  {
    id: 'tentation',
    title: 'La tentation avec la plus belle femme du monde',
    paragraphs: [
      'Un jour, pendant qu’il priait dans sa chambre, il tomba en extase et vit qu’il était couché sur un lit à côté de la plus belle femme du monde. Du mur apparurent les visages de deux hommes, l’un à gauche et l’autre à droite.',
      'La figure de gauche lui dit : « Isaac, prends car elle est la plus belle femme du monde, elle te convient. » Quand il voulut tendre la main vers cette femme, la figure de droite réagit : « Isaac, ne touche pas car tu es oint une seule fois. » Aussitôt, il s’abstint.',
      'Trois fois la figure de gauche insista, et trois fois la figure de droite répéta avec la même insistance : « Ne touche pas car tu es oint une seule fois. » Revenu à lui-même après cette vision, il constata qu’il n’était pas couché sur un lit, mais à genoux en train de prier.',
    ],
  },
  {
    id: 'betes-feroces',
    title: 'Le combat avec des bêtes féroces',
    paragraphs: [
      'Un soir qu’il priait dans sa chambre, il tomba en extase et vit une vallée pleine de buffles. Ordre lui fut donné d’y pénétrer. Au milieu de la vallée, les buffles devinrent furieux et l’attaquèrent. Il les combattit avec une telle force que, se sentant vaincus, ils s’enfuirent tous. Revenu à lui-même, il rendit grâce à l’Éternel.',
      'Isaac persévérait toujours dans la prière. Certains dimanches, il participait au culte protestant de la « Christian and Missionary Alliance » (C.M.A), mais il préférait garder l’incognito et rentrait discrètement chez lui après la prière.',
      'Un autre jour, en vision, il entra dans une vallée remplie de boas. Une voix lui dit : « Va et marche sur eux. » Au milieu de la vallée, les reptiles se dressèrent contre lui ; investi d’une force extraordinaire, il les vainquit et tous s’enfuirent.',
      'Il vit encore une grande ville montagneuse semblable à Matadi, remplie de chiens méchants. L’Éternel lui ordonna d’y pénétrer. Les chiens l’attaquèrent avec une rage inouïe, mais Isaac réussit puissamment à les repousser et à les disperser.',
      'Toutes ces choses, il ne les révéla à personne. Ainsi, DIZOLELE Isaac combattit les bêtes féroces et fut soumis à diverses épreuves pour son affermissement spirituel.',
    ],
  },
  {
    id: 'consecration',
    title: 'La consécration de DIZOLELE Isaac',
    paragraphs: [
      'Poursuivant sa vie solitaire au n° 13 de l’avenue Albert à Boma, loin des plaisirs mondains, Isaac se consacrait quotidiennement à la prière.',
      'Un soir, s’apprêtant à dormir, il se mit à genoux pour prier. Soudain, il vit sa chambre remplie de gens, surtout de vieilles personnes avec des barbes, jusque sur les murs. Isaac fut placé au milieu de la chambre et tous se mirent à chanter, en frappant des mains et en secouant la tête.',
      'Le plus âgé d’entre eux prit la parole : « Tu dois conserver l’onction que tu viens de recevoir, car si tu négliges cette grâce, voici ce que tu seras. » Aussitôt, on lui présenta un homme amaigri comme un squelette. Puis ils reprirent le chant et quittèrent la chambre à la manière d’un vol d’oiseaux.',
      'Revenu à lui, il était seul, à genoux, en train de prier. Il se gardait pur et juste. Ainsi, il fut soutenu par la force de l’Éternel avant d’entrer dans l’exercice du ministère.',
    ],
    hymn: {
      note: 'Cantique chanté lors de la consécration (kikongo)',
      lines: [
        'Ngeye kuasololo kua mutu ko',
        'E E ludi mu kiadi beni',
        'Lukaya meso mu lusambulu',
        'Salu ka kiena kia muntu ko',
        'E E ludi mu kiadi beni',
        'Lukaya meso mu lusambulu',
        'Ngeye solua kuaku wasolua',
        'E E ludi mu kiadi beni',
        'Lukaya meso mu lusambulu',
      ],
    },
  },
];

/** Axes proposés pour la Présidence Générale de la Musique (PGM). */
export const pgmVision = {
  title: 'Vision de la Présidence Générale de la Musique',
  intro: 'Propositions de travail pour structurer et faire rayonner la mission musicale de l’EBNM/KCC.',
  axes: [
    { t: 'Gouvernance et relève', d: 'Mécanismes de continuité institutionnelle de la PGM, préparation de la relève et transmission des responsabilités, dans le respect des textes organiques.' },
    { t: 'Patrimoine musical numérisé', d: 'Numérisation, conservation, archivage et diffusion contrôlée des cantiques, partitions, enregistrements, vidéos, productions des antennes et documents historiques.' },
    { t: 'Recueil officiel', d: 'Élaboration et adoption d’un Recueil officiel des chants, partitions et références musicales de l’EBNM/KCC.' },
    { t: 'Fonds de solidarité des artistes', d: 'Un fonds pour apporter une assistance sociale aux artistes-musiciens confrontés à des situations exceptionnelles.' },
    { t: 'Centre de production', d: 'Un Centre national de production musicale et audiovisuelle pour l’enregistrement, la documentation et la diffusion des productions de l’Église.' },
    { t: 'Formation continue', d: 'Tonic Solfa, direction chorale, technique vocale, pédagogie musicale et administration des chorales dans toutes les antennes.' },
    { t: 'Suivi des antennes', d: 'Évaluation, suivi et accompagnement permanents des antennes, chorales et organes de la PGM.' },
    { t: 'Jeunes talents', d: 'Détection, encadrement et promotion des jeunes talents pour assurer la pérennité de la mission musicale.' },
  ],
};

export interface Song { id: string; title: string; language: string; credit?: string; stanzas: { label?: string; lines: string[] }[] }

export const songs: Song[] = [
  {
    id: 'n-abandonne-pas',
    title: 'N’abandonne pas le KCC',
    language: 'Français et lingala',
    stanzas: [
      { label: 'Introduction', lines: ['Allô… allô, allô !', 'Allô Papa Sielo ? Oui, je t’entends.', 'Allô Prédi ? Tu es là ?', 'Allô Disciple, est-ce que tu me reçois ?', 'Allô Maman Diaconesse… oui, c’est moi, je parle avec vous !'] },
      { lines: ['J’ai entendu dimanche', 'La lecture de ta suspension.', 'Mon frère, ma sœur, je sais que ton cœur est lourd,', 'Mais sache que Yahwé connaît tes intentions.'] },
      { label: 'Refrain', lines: ['N’abandonne pas… N’abandonne pas !', 'N’abandonne pas le KCC !', 'Oza déjà Mo-pona-mi !', 'Yahwé akobatela yo !'] },
      { lines: ['Ne laisse pas la douleur éteindre ta flamme,', 'Car le Seigneur t’a appelé par ton nom.', 'Même si les hommes t’ont mis de côté,', 'L’Éternel, Lui, ne t’a pas rejeté.'] },
      { lines: ['Souviens-toi de Joseph dans la prison,', 'Rejeté par les siens, oublié par les hommes.', 'Mais à l’heure fixée par Dieu,', 'Il a été relevé pour sauver des nations.'] },
      { lines: ['Souviens-toi de David dans les champs,', 'Méprisé par ses frères, rejeté par sa maison.', 'Mais c’est lui que Dieu a choisi', 'Pour devenir roi et berger d’Israël.'] },
      { lines: ['Alors, mon frère, prends courage ! (Chœur : prends courage !)', 'Ce que tu vis n’est qu’un passage. (Chœur : n’est qu’un passage !)', 'Ne laisse pas la honte briser ta foi. (Chœur : kotika te !)'] },
      { label: 'Refrain final', lines: ['N’abandonne pas…', 'N’abandonne pas le KCC…', 'Oza déjà Mo-pona-mi !', 'Yahwé aza fidèle !', 'Akosala lisusu !'] },
    ],
  },
  {
    id: 'ngolu-ekutaki-ngai',
    title: 'Ngolu ekutaki ngai',
    language: 'Lingala',
    stanzas: [
      { label: 'Introduction', lines: ['Eh Yaweh na ngai…', 'Soki nazali na bomoi, ezali Ngolu na Yo…'] },
      { label: 'Couplet 1', lines: ['Nazalaki eloko te… (chœur : eloko te)', 'Bato batikalaki mosika… (chœur : mosika)', 'Na mbeto ya maladi, motema na ngai ebebaki,', 'Kasi Ngolu na Nzambe ekutaki ngai.'] },
      { label: 'Refrain', lines: ['Ngolu ekutaki ngai… (solo)', 'Ngolu ekutaki ngai… (chœur)', 'Ngolu ekutaki ngai… (solo)', 'Ngolu ekutaki ngai… (chœur)'] },
      { label: 'Couplet 2', lines: ['Bana bazalaki kolia miso ya kolela,', 'Na ndako eloko moko te ya kolia…', 'Bandeko, baninga, batikaki ngai,', 'Kasi Nzambe, Yo otikaki ngai te.'] },
      { label: 'Pont', lines: ['Soki yo mpe ozali na pasi… (chœur : na pasi)', 'Soki yo mpe ozali kolela… (chœur : kolela)', 'Tala ngai oyo Nzambe abikisaki,', 'Azali na nzela mpo na yo mpe !'] },
      { label: 'Final', lines: ['Ngolu… Ngolu… Ngolu na Nzambe…', 'Ezali se yango nde ebikisaki ngai.', 'Na pasi, na mpasi, na kolela nyonso…', 'Ngolu epesaki ngai bomoi lisusu.'] },
    ],
  },
  {
    id: 'aza-nzete',
    title: 'Aza nzete alonama na pembeni ya mayi',
    language: 'Lingala',
    credit: 'Je suis KCCiste · Reagan Mbumba',
    stanzas: [
      { lines: ['Aza nzete alonama na pembeni ya mayi…', 'Biso nde ba etape.'] },
      { label: 'À propos', lines: ['Une chanson de foi, d’espérance et de reconnaissance à Nzambe.'] },
    ],
  },
];

/** Règlement de la Caisse d'Assistance Sociale (projet, en attente d'adoption). */
export const socialFund = {
  title: 'Caisse d’Assistance Sociale',
  status: 'Projet de statuts et règlement intérieur — en attente d’adoption par les membres',
  preamble: 'Dans un esprit de fraternité, d’amour du prochain, de solidarité et d’entraide, les membres du groupe « Je suis KCCiste 3 Mariage », consacré aux mariages et fiançailles, mettent en place une Caisse d’Assistance Sociale pour se soutenir mutuellement en cas de deuil et de maladie, conformément aux principes KCCistes d’amour, de compassion et de solidarité.',
  keyFacts: [
    { label: 'Cotisation', value: '1 USD par mois' },
    { label: 'Couvre', value: 'Deuil et maladie grave' },
    { label: 'Gestion', value: 'Comité de 5 membres' },
    { label: 'Contrôle', value: 'État de caisse périodique' },
  ],
  principles: ['Solidarité', 'Fraternité', 'Équité', 'Transparence', 'Confidentialité', 'Responsabilité', 'Respect de la dignité de chaque bénéficiaire'],
  titles: [
    { t: 'I. Dispositions générales', items: ['Art. 1 — La structure se nomme « Caisse d’Assistance Sociale », mécanisme interne de solidarité entre les membres.', 'Art. 2 — Elle soutient les membres en cas de décès, de maladie grave ou d’hospitalisation, ou de toute situation sociale exceptionnelle soumise au comité.', 'Art. 3 — Elle fonctionne sans aucune discrimination, selon les principes ci-dessus.'] },
    { t: 'II. Membres et cotisation', items: ['Art. 4 — Chaque membre participant contribue à hauteur de 1 USD par mois, destiné exclusivement à l’assistance.', 'Art. 5 — La cotisation est payée chaque mois par le moyen communiqué par les responsables ; une liste de suivi est tenue.', 'Art. 6 — Tout retard doit être régularisé ; le comité peut définir de manière claire et équitable les conséquences d’un retard prolongé.', 'Art. 7 — Les fonds servent uniquement aux assistances approuvées et aux frais directement liés ; jamais à des fins personnelles.'] },
    { t: 'III. Assistance en cas de deuil', items: ['Art. 8 — Décès du membre, de son conjoint, d’un enfant ou d’un parent direct, selon les critères adoptés par les membres.', 'Art. 9 — Contribution financière, remise d’un bien, participation aux frais d’obsèques, présence et accompagnement moral.', 'Art. 10 — Tout décès est communiqué rapidement aux responsables, qui peuvent vérifier le cas.'] },
    { t: 'IV. Assistance en cas de maladie', items: ['Art. 11 — Hospitalisation, intervention chirurgicale, maladie grave ou situation médicale exceptionnelle.', 'Art. 12 — Le comité peut demander une preuve (hospitalisation, ordonnance, facture) ; ces informations restent confidentielles.', 'Art. 13 — L’aide est fraternelle et ponctuelle : elle ne couvre pas l’intégralité des frais médicaux.'] },
    { t: 'V. Organisation et gestion', items: ['Art. 14 — Un comité : un Coordonnateur, un Secrétaire, un Trésorier et deux conseillers ou contrôleurs.', 'Art. 15 à 17 — Le Coordonnateur supervise, le Secrétaire tient le registre des cas, le Trésorier tient les comptes et présente un rapport financier.', 'Art. 18 — Les membres reçoivent périodiquement l’état de la caisse : cotisations reçues, dépenses, assistances accordées, solde.'] },
    { t: 'VI. Procédure d’assistance', items: ['Art. 19 — Déclaration du cas par le membre ou un proche.', 'Art. 20 — Vérification par le comité.', 'Art. 21 — Décision selon les ressources ; les cas importants peuvent être soumis à tous les membres.', 'Art. 22 — Priorité aux cas les plus urgents et les plus graves.'] },
    { t: 'VII. Transparence et discipline', items: ['Art. 23 — Toute dépense est enregistrée et justifiée.', 'Art. 24 — Les informations personnelles, familiales et médicales sont traitées avec discrétion et jamais diffusées sans accord.', 'Art. 25 — Respect des responsables et des bénéficiaires, pas d’accusations non fondées ni de fausses informations, préserver l’unité du groupe.'] },
    { t: 'VIII. Dispositions finales', items: ['Art. 26 — Toute modification est proposée, discutée et approuvée par les membres.', 'Art. 27 — Le règlement entre en vigueur à sa date d’adoption.', 'Art. 28 — La Caisse est avant tout un moyen d’exprimer concrètement notre fraternité, notre compassion et notre solidarité.'] },
  ],
  verse: '« Portez les fardeaux les uns des autres. »',
};
