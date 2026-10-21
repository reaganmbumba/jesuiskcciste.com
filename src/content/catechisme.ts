/**
 * Catéchisme du KCCisme, repris du document « LE CATÉCHISME » de la Direction
 * du Siège (dossier « Documents Église DIPARVIE », service/CATECHISME.docx) et
 * de la circulaire « Préparation des Néophytes » (2014).
 * Corrections de frappe uniquement ; la réponse sur le salut (vide dans le
 * brouillon) reprend la prédication du Chef Spirituel du sabbat du 4 mai 2015.
 */

export interface CatechismItem { q: string; a: string; list?: string[] }
export interface CatechismGroup { id: string; title: string; intro?: string; items: CatechismItem[] }

export const catechismIntro = {
  title: 'Le Catéchisme du KCCisme',
  paragraphs: [
    'Le catéchisme est une instruction religieuse : le résumé des vérités, des croyances et des principes fondamentaux d’une religion, tels qu’ils ont déjà été écrits ou prononcés par une autorité religieuse reconnue.',
    'L’Église Bon Nouveau Message (KCC) est une œuvre d’origine divine, née le 8 mars 1955. L’Éternel Dieu a utilisé le Prophète DIZOLELE, à travers diverses révélations, pour réaliser cette œuvre : il a mis en lui sa Parole, comme il l’a toujours fait avec ses prophètes, pour sauver l’humanité.',
    'Cette Parole lui est apparue le 12 avril 1958 à Boma, par le signe KCC que l’Éternel a lui-même interprété et qualifié de Message Bon et Nouveau. La doctrine qui en émane s’appelle le KCCisme. Pour en faciliter l’étude et l’initiation, l’Église en a fait ce résumé en questions et réponses.',
  ],
};

export const catechism: CatechismGroup[] = [
  {
    id: 'croyances',
    title: 'Les croyances',
    items: [
      { q: 'Qu’entend-on par croyance ?', a: 'Une croyance est une ferme conviction en l’existence, au rôle et au pouvoir de l’être ou de l’objet sur la vie de celui qui y fonde sa foi.' },
      { q: 'Quelle est l’origine des croyances de l’EBNM ?', a: 'Elles sont d’origine divine : ce sont les inspirations de l’Éternel à son Prophète et les révélations de l’Éternel aux prophètes bibliques.' },
      { q: 'Que dit la première croyance ?', a: 'Je crois en l’Éternel Dieu de qui toute vie découle. Il est Un, Seigneur des seigneurs, Créateur du ciel, de la terre et de tout ce qui s’y trouve.' },
      { q: 'Que veut dire « de qui toute vie découle » ?', a: 'Il s’agit de la vie spirituelle et de la vie matérielle.' },
      { q: 'Que veut dire « Créateur du ciel, de la terre et de tout ce qui s’y trouve » ?', a: 'Il s’agit de tout ce qui existe, le visible et l’invisible.' },
      { q: 'Quel est le sens de « Il est Un » ?', a: 'À côté de l’Éternel, il n’y en a point d’autre et rien ne lui ressemble. Il connaît tout ce qui est, il couvre toute existence ; lui seul peut tout sur tout, et rien ne lui résiste.' },
      { q: 'Que dit la deuxième croyance ?', a: 'Je crois au salut que, par sa grâce, sa miséricorde et en son Nom, l’Éternel a offert à l’humanité.' },
      { q: 'De quel salut s’agit-il ?', a: 'Du salut spirituel, le salut de l’âme. L’Éternel l’a offert à toute l’humanité par l’Alliance conclue avec Israël : elle nous fait connaître ce que nous pouvons faire et ce que nous ne devons pas faire. Celui qui pratique la loi, la justice et la vertu vivra (Ézéchiel 18 : 21-22).' },
      { q: 'Que dit la troisième croyance ?', a: 'Je crois à la Sainte Parole de Dieu révélée à ses prophètes pour le salut de l’humanité.' },
      { q: 'De quelle Parole s’agit-il ?', a: 'De la Parole que l’Éternel a lui-même transmise à l’humanité par ses prophètes, consignée dans les Saintes Écritures (la Bible hébraïque).' },
      { q: 'Que dit la quatrième croyance ?', a: 'Je crois à l’immortalité de l’âme et à la vie éternelle.' },
      { q: 'Que signifie l’immortalité de l’âme ?', a: 'L’âme reste immortelle. Au jour de la mort, le corps physique et l’âme se séparent : le corps retourne à la terre et l’âme retourne à l’Éternel pour y vivre éternellement ; celle de l’incrédule va au châtiment éternel.' },
      { q: 'À quoi fait allusion la vie éternelle ?', a: 'À la gloire de Dieu : une vie où les âmes des justes vivront éternellement.' },
      { q: 'Que dit la croyance sur la rémission des péchés ?', a: 'Je crois à la rémission des péchés par l’Éternel, par l’exécution de sa Loi et en son Nom.' },
      { q: 'Quel sacrifice l’Éternel demande-t-il pour pardonner ?', a: 'Aucun sacrifice. Il demande la décision de cesser définitivement tout péché et la sincérité dans la confession.' },
      { q: 'L’Éternel pardonne-t-il au nom d’un esprit, d’une personne ou d’une chose ?', a: 'Non. L’Éternel pardonne en son propre Nom.' },
      { q: 'Que dit la croyance sur le jugement ?', a: 'Je crois au jugement divin, à la récompense des justes et au châtiment éternel des incrédules.' },
      { q: 'Qu’est-ce que le jugement divin ?', a: 'C’est le pouvoir que l’Éternel a sur l’homme de le récompenser ou de le châtier, quand, où et comme il le veut.' },
      { q: 'Qu’est-ce que la récompense des justes ?', a: 'C’est ce que le juste reçoit de l’Éternel après l’avoir servi avec justice.' },
      { q: 'Qu’est-ce que le châtiment éternel ?', a: 'C’est l’enfer : les punitions spirituelles que reçoit de l’Éternel l’incrédule qui a méprisé sa Loi durant toute sa vie sur la terre.' },
      { q: 'Que dit la croyance sur le Prophète ?', a: 'Je crois que l’Oint de l’Éternel, DIZOLELE-MPUNGU WAFIDUSWA Isaac, est Prophète venu de l’Éternel Dieu.' },
      { q: 'Pourquoi faut-il croire au Prophète ?', a: 'Parce que c’est une recommandation que l’Éternel fait depuis les temps anciens pour le salut : c’est par le prophète que l’Éternel trace la voie du salut en donnant sa Parole.' },
      { q: 'Que dit la dernière croyance ?', a: 'Je crois que l’Église Bon Nouveau Message (KCC) vient de Dieu, qu’elle est une, sainte et prophétique.' },
      { q: 'Pourquoi l’Église est-elle une, sainte et prophétique ?', a: 'Une, parce que son fondateur invisible, l’Éternel, est un et que son fondateur visible est un. Sainte, parce qu’elle est le fruit de l’inspiration de Dieu, qui est saint. Prophétique, parce que son fondateur est Prophète et que ses enseignements émanent de la lignée des prophètes de l’Éternel.' },
    ],
  },
  {
    id: 'enseignement',
    title: 'L’enseignement',
    items: [
      { q: 'Dans la doctrine, qu’entend-on par enseignement ?', a: 'Ce sont les statuts, ordonnances, préceptes et disciplines définis par l’Éternel à travers ses prophètes pour régler les relations entre l’Éternel et les hommes.' },
      { q: 'Quelles sont les sources de l’enseignement de l’EBNM ?', a: 'La Bible (Torah) et le Prophète : ses révélations, recommandations et oracles sur le sens réel des concepts religieux, les innovations liturgiques et l’interprétation des Écritures.' },
    ],
  },
  {
    id: 'fetes',
    title: 'Fêtes et sacrements',
    items: [
      { q: 'Quelles sont les fêtes ecclésiastiques de l’EBNM ?', a: 'Les fêtes de l’Église sont :', list: ['La naissance du Prophète : 1er mars', 'La naissance de l’Église : 8 mars', 'L’apparition du KCC : 12 avril', 'La fête de la délivrance (l’Oracle) : 15 avril', 'La reconnaissance juridique : 30 avril'] },
      { q: 'Quelles sont les journées saintes parmi ces fêtes ?', a: 'Le 1er mars, le 8 mars et le 15 avril.' },
      { q: 'Quelle est la date de naissance du Prophète ?', a: 'Le 1er mars 1930.' },
      { q: 'Quelle est la date de naissance de l’Église ?', a: 'Le 8 mars 1955.' },
      { q: 'Quelle est la date de l’apparition du KCC ?', a: 'Le 12 avril 1958.' },
      { q: 'Quelle est la date de la reconnaissance juridique ?', a: 'Le 30 avril 1980.' },
      { q: 'Quelle est la date de l’Oracle ?', a: 'Le 15 avril 2003.' },
      { q: 'Combien de sacrements l’EBNM administre-t-elle ?', a: 'Trois sacrements :', list: ['La confession (purification)', 'La Première Onction', 'Les Actes d’Alliance'] },
      { q: 'Que signifie la Première Onction ?', a: 'C’est le sacrement par lequel l’homme reconnaît l’Éternel comme son unique Dieu et s’engage à l’aimer et à le servir de tout son cœur, de toute son âme et de toute sa force ; de son côté, l’Éternel imprime son Nom dans l’âme du bénéficiaire.' },
      { q: 'Combien de fois peut-on recevoir la Première Onction ?', a: 'Une seule fois dans l’Église, parce que ce sacrement a un caractère irréversible.' },
      { q: 'Qu’entend-on par sacrement des Actes d’Alliance ?', a: 'C’est la cérémonie au cours de laquelle le peuple reconnaît l’Éternel comme l’unique vrai Dieu, accepte les Paroles de l’Alliance et s’engage à n’honorer que l’Éternel et à pratiquer ses ordonnances, préceptes et commandements.' },
    ],
  },
  {
    id: 'alliance',
    title: 'L’Alliance et les commandements',
    items: [
      { q: 'Quelles sont les Paroles de l’Alliance ?', a: 'Les dix Paroles de l’Alliance sont :', list: ['C’est moi l’Éternel qui suis votre Dieu : tu n’auras point d’autre dieu que moi.', 'Tu ne te feras point d’images taillées, tu ne te prosterneras point devant elles et tu ne les serviras point.', 'Tu n’invoqueras point le Nom de l’Éternel ton Dieu en vain ou à l’appui du mensonge.', 'Souviens-toi du jour du sabbat et sanctifie-le.', 'Honore ton père et ta mère.', 'Tu ne tueras point.', 'Tu ne commettras point d’adultère.', 'Tu ne voleras point.', 'Tu ne mentiras point.', 'Tu ne convoiteras ni l’homme, ni la femme, ni rien de ce qui appartient à ton prochain.'] },
      { q: 'Quels sont les commandements de l’Église ?', a: 'Les sept commandements de l’Église sont :', list: ['Ne pas boire de boissons enivrantes ni fumer.', 'Ne point consulter les féticheurs, les devins ni les morts.', 'Participer au culte du sabbat et des jours saints.', 'Participer à la communion fraternelle et aux dons pacifiques annuels.', 'Reconnaître que le mariage est une union sacrée à sauvegarder.', 'Demeurer saint.', 'Aimer l’Église, la protéger et la soutenir.'] },
    ],
  },
  {
    id: 'vrai-dieu',
    title: 'Le vrai Dieu, l’Éternel',
    items: [
      { q: 'Quel est l’Oracle de l’Éternel Dieu au Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac ?', a: '« Quels que soient les miracles qu’il opère, un homme ne peut être Dieu. »' },
      { q: 'Quand l’Éternel a-t-il donné cet Oracle ?', a: 'Le 15 avril 2003.' },
      { q: 'Que veut l’Éternel Dieu dans cet Oracle ?', a: 'L’Éternel s’est présenté comme l’unique vrai Dieu à prier, servir, glorifier et vénérer.' },
      { q: 'Comment peut-on comprendre l’Éternel ?', a: 'À travers ses attributs.' },
      { q: 'Quels sont ces attributs ?', a: 'L’Éternel est :', list: ['Créateur', 'Invisible', 'Immatériel', 'Incomparable, semblable à aucun être', 'Sans image ni représentation, sans forme concevable par l’intelligence humaine', 'Sauveur', 'Souverain', 'Seigneur', 'Rédempteur', 'Omnipotent', 'Omniscient', 'Omniprésent', 'Immuable', 'Éternel', 'Un'] },
    ],
  },
];

/** Circulaire « Préparation des Néophytes » (Direction du Siège, 2014). */
export const neophytePath = {
  title: 'Le parcours du néophyte',
  intro: 'Pour devenir adepte, tout nouveau converti reçoit trois sacrements. Voici ce que les responsables paroissiaux lui enseignent avant chacun d’eux.',
  steps: [
    { name: 'La Purification', learn: ['Les dix Paroles de l’Alliance', 'Les sept commandements de l’Église', 'La Profession de foi', 'La prière de purification', 'Les cinq objectifs de l’enseignement religieux'] },
    { name: 'La Première Onction', learn: ['Les engagements à prendre envers l’Éternel, en présence de son peuple'] },
    { name: 'Les Actes d’Alliance', learn: ['Les prières des cérémonies, telles qu’elles figurent dans les textes liturgiques'] },
  ],
  source: 'Circulaire de la Direction du Siège aux responsables paroissiaux, 2014.',
};

export const catechismSource: string = 'Le Catéchisme, Direction du Siège de l’EBNM, Kinshasa.';
