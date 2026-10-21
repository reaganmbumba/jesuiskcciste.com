/**
 * Prédications et séminaires du Chef Spirituel, résumés d'après les rapports
 * et notes conservés dans le dossier « Documents Église DIPARVIE »
 * (predication/, MISSION PROPHETE SEMINAIRE/). Seuls les passages
 * d'enseignement sont repris ; les textes polémiques envers d'autres
 * confessions, les noms de fidèles et les affaires internes sont écartés.
 */

export interface Sermon {
  id: string;
  title: string;
  text: string;
  date?: string;
  place?: string;
  theme: 'alliance' | 'prophete' | 'salut' | 'parole';
  paragraphs: string[];
  keyPoint: string;
}

export const sermonThemes: Record<Sermon['theme'], string> = {
  alliance: 'L’Alliance',
  prophete: 'Le Prophète',
  salut: 'Le salut',
  parole: 'La Parole',
};

export const sermons: Sermon[] = [
  {
    id: 'notion-alliance',
    title: 'La notion d’Alliance',
    text: 'Exode 24 : 1-11',
    place: 'Temple Central KCC (Kinshasa)',
    theme: 'alliance',
    keyPoint: 'Le sang n’est pas l’Alliance : ce sont les dix Paroles qui constituent l’Alliance.',
    paragraphs: [
      'Dans sa souveraineté, l’Éternel a établi avec Israël, par Moïse, une Alliance régie par les dix commandements. Moïse en a fait la lecture au peuple qui, comprenant que traiter avec l’Éternel est une grâce et un sujet de joie, l’a acceptée librement.',
      'Pour l’Alliance, l’Éternel n’impose personne : il laisse au peuple la liberté d’accepter ou de refuser. Le sang des animaux offerts, que Moïse répandit sur le peuple et sur l’autel, est le symbole prouvant que l’Alliance a été acceptée ; mais ce sont les dix Paroles qui constituent l’Alliance.',
      'Après les offrandes, Israël mangea au cours d’une grande fête en mémoire de l’Alliance. Dans notre génération, nous mangeons un repas symbolique, le « pain d’Alliance », pour exprimer notre reconnaissance, puis nous donnons une offrande. Ouvrons nos cœurs pour recevoir cette Alliance et les bénédictions de l’Éternel.',
    ],
  },
  {
    id: 'fete-alliance-2013',
    title: 'La fête de l’Alliance',
    text: 'Deutéronome 1 : 1-4',
    date: '7 juillet 2013',
    theme: 'alliance',
    keyPoint: 'C’est dans la loi que se trouve le ciel.',
    paragraphs: [
      'Quarante ans après la sortie d’Égypte, Moïse rappelle la Loi à une nouvelle génération qui n’avait pas assisté au Sinaï : « Cette loi n’a pas été donnée seulement à ceux qui étaient à Horeb, mais à vous tous qui êtes ici », c’est-à-dire à toute l’humanité.',
      'La sortie d’Égypte n’avait apporté à Israël qu’un salut matériel ; l’Alliance lui a apporté le salut spirituel. Par Alliance, il faut entendre la Loi de l’Éternel : les dix commandements, mais aussi ses préceptes, ses règles et ses statuts. On peut connaître le Nom de l’Éternel sans accepter sa Loi ; pour avoir le salut, il faut accepter sa Loi.',
      'Le Prophète rappelle qu’au début de son appel, il avait voulu fuir la Loi, mais que l’Éternel l’a retenu. Nous sommes devenus son peuple parce que nous aimons sa Loi : réjouissons-nous de l’Alliance et sachons-en la valeur.',
    ],
  },
  {
    id: 'precision-alliance',
    title: 'Précision sur l’Alliance de l’Éternel',
    text: 'Genèse 9 : 9-11 ; Genèse 17 : 9-14 ; Exode 20 : 1-14',
    date: '2012 (lettre circulaire)',
    theme: 'alliance',
    keyPoint: 'L’Alliance de l’Horeb est la racine principale du salut de toute créature humaine.',
    paragraphs: [
      'Depuis la création, l’Éternel a conclu plusieurs alliances : avec Noé, tous les êtres vivants et la terre ; avec Abraham ; avec Israël ; avec David. Dans la voie du KCC, il a aussi conclu des alliances avec nous.',
      'Mais l’Alliance conclue au mont Horeb avec Israël reste la plus importante, parce qu’elle est la racine du salut de tous les hommes sans distinction. « La raison même de mon arrivée parmi vous est de vous introduire, à travers l’Oracle du 15 avril 2003, dans cette Alliance. » Chacun est invité à y demeurer et à commémorer chaque année la fête de l’Alliance.',
    ],
  },
  {
    id: 'ezechiel-2',
    title: 'Ne crains pas, prêche cette parole',
    text: 'Ézéchiel 2 : 6-10 et 3 : 1-8',
    place: 'Temple Central KCC',
    theme: 'prophete',
    keyPoint: 'Recevez gratuitement ce message, sans sacrifice, et obéissez-y.',
    paragraphs: [
      'À Ézéchiel, l’Éternel annonce qu’il rencontrera des épines et des scorpions, une maison rebelle : « Ne les crains pas. Qu’ils écoutent ou qu’ils refusent, toi, prêche. » Cette bonne parole a le goût du miel.',
      'Le Prophète témoigne que l’Éternel l’a préparé de la même manière : en vision, il l’a fait passer au milieu des boas, des buffles et des chiens méchants, images des cœurs résistants qu’il rencontrerait. Sur le chemin, on lui a jeté des pierres et on l’a enfermé ; il a risqué la mort, mais l’Éternel l’a protégé afin que le message arrive. Trois ans après son appel, l’Éternel lui donna le KCC : Nkanda Wambote Wampa.',
      '« C’est pour votre salut que j’ai tant risqué. Recevez ce message gratuitement, sans sacrifice, et ne le sabotez pas par vos comportements. Le message, c’est faire connaître au monde qui est l’Éternel, qui est Dieu : craignons-le, obéissons-lui et croyons en lui. »',
    ],
  },
  {
    id: 'mer-rouge-2015',
    title: 'L’Éternel, notre Dieu et notre salut',
    text: 'Exode 14 : 30-31 et 15 : 1-2',
    date: 'Sabbat du 4 mai 2015',
    place: 'Paroisse de l’Ozone (Kinshasa)',
    theme: 'salut',
    keyPoint: 'À l’exemple d’Israël, nous louons l’Éternel et le prenons pour notre Dieu et notre salut.',
    paragraphs: [
      'Devant la mer Rouge, Israël, poursuivi par les Égyptiens, vit l’Éternel le délivrer ; il eut foi en l’Éternel et en Moïse son serviteur, et chanta : « L’Éternel est ma force et ma louange, il a été mon salut. »',
      'Le Chef Spirituel rapproche ce récit du long combat pour la reconnaissance juridique de l’Église : la demande fut d’abord rejetée et beaucoup voulaient briser le projet ; en chemin, l’Éternel l’avertit de ne pas confier le dossier à une personne mal intentionnée. Finalement, la personnalité civile fut obtenue : « C’est l’Éternel qui nous a aidés ; par nous-mêmes, c’était pratiquement impossible. »',
      'Le salut dont parle la profession de foi est le salut spirituel, offert par l’Alliance : connaître ce que l’on peut faire et ce que l’on ne doit pas faire. Celui qui pratique la loi, la justice et la vertu vivra (Ézéchiel 18 : 21-22).',
    ],
  },
  {
    id: 'paque-kcciste',
    title: 'La Pâque KCCiste, fête de la délivrance',
    text: 'Deutéronome 16 : 1 ; Exode 12 : 2 ; Exode 13 : 4-7',
    theme: 'salut',
    keyPoint: 'La Pâque KCCiste se célèbre par les Actes d’Alliance et le pain de l’Alliance.',
    paragraphs: [
      'Dans la Torah, la Pâque est une fête recommandée par l’Éternel aux Hébreux en souvenir de leur libération de l’Égypte : un repas en l’honneur de l’Éternel. Le mot « Pâque » a le sens de sortie, de délivrance spirituelle, politique, sociale et religieuse.',
      'Par l’Oracle du 15 avril 2003, l’Éternel a révélé qu’un homme ne peut être Dieu, quels que soient les miracles qu’il opère. Cet oracle a fait sortir l’Église du culte de l’homme pour entrer dans celui de l’Éternel et dans son Alliance : une grande libération spirituelle.',
      'C’est cette sortie que les KCCistes commémorent par la fête de la délivrance. Elle se célèbre à travers les Actes d’Alliance, au cours desquels on mange le pain de l’Alliance en souvenir de l’Alliance conclue entre l’Éternel et son peuple par les dix Paroles.',
    ],
  },
  {
    id: 'lumiere-eternel',
    title: 'Marchons à la lumière de l’Éternel',
    text: 'Isaïe 2 : 5',
    date: '14 août 2012',
    place: 'Temple Central KCC, ouverture du séminaire de la jeunesse d’Europe',
    theme: 'parole',
    keyPoint: 'Tout ce que l’Éternel nous enseigne à travers le Prophète pour notre salut s’appelle le KCCisme.',
    paragraphs: [
      '« Maison de Jacob, allons, marchons à la lumière de l’Éternel. » Par lumière de l’Éternel, il faut entendre sa doctrine : ses paroles, ses enseignements et sa loi. Israël s’engage à ce que sa façon d’agir, de parler et de se comporter soit conforme à la doctrine de l’Éternel.',
      'Le KCCiste, à l’exemple d’Israël, doit vivre dans sa génération ce que l’Éternel lui apprend à travers le Prophète placé parmi nous. Le serment du Prophète le dit : « Mena mu bibila, mena mu kia » ; « kia », c’est la lumière dont il s’agit. Nous sommes appelés à devenir disciples de l’Éternel et de personne d’autre.',
    ],
  },
  {
    id: 'quel-livre',
    title: 'Quel livre pour prêcher la Parole ?',
    text: 'Isaïe 2 : 5',
    date: '26 avril 2014',
    place: 'Séminaire de formation des serviteurs, Kinshasa',
    theme: 'parole',
    keyPoint: 'L’EBNM prêche avec la Torah, la Bible hébraïque, de la Genèse au deuxième livre des Chroniques.',
    paragraphs: [
      'Tout serviteur (apôtre, prédicateur, disciple, diaconesse) doit savoir quel livre utiliser pour prêcher. C’est la Bible ; mais il existe plusieurs bibles et plusieurs traductions.',
      'Pour éviter les confusions créées par les traducteurs, l’Église a adopté la Torah, la Bible hébraïque, qui commence par la Genèse et se termine par le deuxième livre des Chroniques, le livre des accomplissements. Le Chef Spirituel précise que les autres bibles ne sont pas mauvaises et que les utiliser n’est pas un péché : ce choix sert l’unité et la fiabilité de l’enseignement.',
    ],
  },
];

/** Séminaires animés par le Chef Spirituel, d'après les rapports et programmes conservés. */
export const seminars = [
  { date: '19 et 25 avril 2003', title: 'Séminaire avec les chefs d’entités', place: 'Direction du Siège, Kinshasa', d: 'Enseignements qui suivent l’Oracle du 15 avril 2003 : la vie après la mort et le pardon des péchés.' },
  { date: '16 juin 2008', title: 'Séminaire des mamans sur la doctrine', place: 'Paroisse de Masina, Kinshasa', d: 'Les commandements de l’Église et l’Alliance du Sinaï : « Le 15 avril 2003, nous avons reçu notre constitution religieuse. »' },
  { date: '14 – 17 août 2012', title: 'Séminaire de la jeunesse d’Europe', place: 'Temple Central KCC, Kinshasa', d: 'Thème : « Le KCCisme, fruit d’une révélation divine ». Origine de l’Église et des signes KCC, profession de foi, sacrements.' },
  { date: '26 avril 2014', title: 'Séminaire de formation des serviteurs', place: 'Kinshasa', d: 'Le livre de travail de l’Église (la Torah) et la notion de salut dans le KCCisme.' },
  { date: '1er – 4 avril 2015', title: 'Séminaire de formation des serviteurs de la ville de Kinshasa', place: 'Temple Central KCC', d: 'Quatre journées animées par Son Éminence le Chef Spirituel.' },
];

export const sermonsSource: string = 'Rapports de séminaires et notes de prédications, Direction du Siège de l’EBNM (2003-2015).';
