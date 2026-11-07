/**
 * Tournée du Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac au Bas-Congo
 * (28 avril – 12 mai 2012), à l’occasion du 32ᵉ anniversaire de la
 * personnalité civile : ses prédications, réparties par paroisse, d’après le
 * rapport de la tournée. Texte des prédications repris tel quel.
 */

export interface TourSection { title: string; kind: 'verses' | 'text'; paras: string[] }
export interface TourSermon {
  id: string;
  meta: { dateLabel: string; iso: string; place: string; occasion?: string; attendance?: string; time?: string; text?: string };
  sections: TourSection[];
  note?: string;
}
export interface TourParish { id: string; name: string; sermons: TourSermon[] }

export const prophetTour2012: { intro: string[]; conclusion: string[]; totalAttendance: number; parishes: TourParish[] } = {
 "intro": [
  "L’an 2012, le 32ᵉ anniversaire de l’obtention de la Personnalité Civile de l’Eglise Bon Nouveau Message (KCC), c’est une année de grâce et de bénédiction au sein de notre Eglise.",
  "Pour exprimer à l’Eternel les actions de grâce, le Prophète DIZOLELE-MPUNGU WAFIDUSUA Isaac en accord avec le Comité Exécutif de l’Eglise a pris plaisir de fêter ensemble avec ses enfants de la Province du Bas-Congo précisément à MBANZA-NGUNGU. Mais en passant d’abord à la paroisse d’INKISI.",
  "Ayant quitté le sol de Kinshasa le 28 Avril 2012, un accident s’est produit dans son domicile sous la pression d’une grande pluie qui occasionna à cet effet le déplacement de sa charpente.",
  "Heureusement, personne n’était victime de cette catastrophe car l’Eternel s’est impliqué pour protéger son serviteur, le Prophète DIZOLELE contre tous ces dangers.",
  "La réparation de cette charpente n’a pas permis au Prophète de retourner à Kinshasa. Il était donc obligé de profiter à nourrir ces enfants en attendant que les travaux prennent fin.",
  "Ce séjour lui a facilité la tâche de visiter successivement les paroisses de Lukala, Kimpese, la S/s Kiemba de Kimpese, la Section de Kenge, la ville de Matadi, celle de Boma ainsi que la paroisse de Nlemba.",
  "Ci-après, se trouvent développées toutes les prédications que le Chef Spirituel a prêchées dans chacune des paroisses citées ci-haut. A la fin, une conclusion sanctionnera la fin de toutes ces détailles."
 ],
 "conclusion": [
  "Pendant la semaine des fêtes de la personnalité civile, le Chef Spirituel a pris son temps pour nous faire voir que c’est l’Eternel Dieu lui-même qui nous a facilité la tâche d’octroyer la Personnalité Civile et pas un autre.",
  "Il a insisté à souligner que lui-même le Prophète n’a pas consulté un devin ou un autre dieu pour avoir la Personnalité Civile et aucun féticheur peut soulever son doigt pour dire que le Prophète DIZOLELE lui a consulté pour octroyer la Personnalité Civile.",
  "Par ailleurs, il a expliqué clairement à tous que c’est lui-même l’Eternel qui a depuis longtemps commencé à traiter avec lui pour que nous puissions avoir la Personnalité Civile.",
  "Etant indispensable, la Personnalité Civile a stoppé toutes les indignations, les injures, des sabotages qu’avait subi l’Eglise pour prier. Le 30 Avril 1980 l’EBNM a pris la liberté de prier l’Eternel Dieu sur le plan Politique. Cette Personnalité a permis également l’expansion de l’Eglise dans tous les quatre coins du monde.",
  "Le Prophète à souligner que sans l’intervention de l’Eternel, il serait impossible de recevoir cette liberté.",
  "De l’autre côté, l’Eternel a pensé à nous libérer sur le plan Spirituel à travers l’Oracle du 15 Avril 2003. L’Eternel a ouvert la voie conduisant à la découverte de la loi de l’Eternel Dieu qui nous introduit paisiblement dans son Alliance qu’il a conclue sur Horeb pour l’humanité entière.",
  "C’est dans ce cadre là que le Prophète a prêché ses enfants d’entrer tous dans l’Alliance de l’Eternel Dieu. C’est une invitation qui concerne toute l’humanité qui est enracinée, par des multiples alliances de Satan qui n’accordent aux peuples que des cadeaux empoissonnés.",
  "L’Alliance de l’Eternel nous accorde toutes les bonnes choses sur la terre, les bénédictions, ainsi que la vie Eternelle.",
  "Cette Alliance nous oblige à reconnaitre l’Eternel comme l’unique Dieu de qui toute vie découle. Il doit être adoré et glorifié par toute l’humanité.",
  "Ainsi, ce voyage très bénéfique a réveillé la mémoire de tous les KCCISTES à s’attacher définitivement à l’Eternel, à entrer et à demeurer dans son Alliance."
 ],
 "parishes": [
  {
   "id": "inkisi",
   "name": "Inkisi",
   "sermons": [
    {
     "meta": {
      "place": "Paroisse d’Inkisi",
      "occasion": "Réception du Prophète",
      "attendance": "300 Personnes",
      "time": "17 h – 20 h30",
      "text": "Exode 20 :1 – 4",
      "dateLabel": "28 avril 2012",
      "iso": "2012-04-28"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "1. Alors Dieu prononça toutes ces paroles, savoir :",
        "2. « je suis l’Eternel, ton Dieu, qui t’ai fait sortir du pays d’Egypte, d’une maison d’esclavage.",
        "3. Tu n’auras point d’autre dieu que moi.",
        "4. Tu ne te feras point d’idole, ni une image quelconque de ce qui est en haut dans la Ciel, ou en bas sur la terre, ou dans les eaux au – dessous de la terre."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Dans ce texte, il s’agit de l’histoire de la sortie d’Israël dans la servitude en Egypte. En effet, après cette sortie, l’Eternel promulgua cette loi que nous avons lue à l’intension de ce peuple.",
        "Physiquement parlant, il est curieux de réaliser que c’est bien le Prophète Moïse qui a libéré et sauvé Israël de la servitude en Egypte. D’ailleurs dans sa conception, Israël ne considérait que Moïse comme son sauveur et son libérateur.",
        "Mais, en toute évidence, c’est l’Eternel, l’invisible qui par sa haute puissance a sauvé Israël à travers Moïse.",
        "Sans l’Eternel, Moïse ne pouvait rein faire et Israël resterait toujours dans son état de la servitude.",
        "Etant son serviteur, Moïse connaissait bien que c’est l’Eternel qui est sauveur car il traite seulement avec lui pour libérer ce peuple. C’est un secret dont il n’avait pas l’autorité et l’autorisation d’en parler parce que le moment n’était pas encore là.",
        "Au temps marqué, l’Eternel s’est mis lui-même à prononcer que c’est lui qui a fait sortir Israël dans la maison de la servitude en Egypte tel que nous venons de le dire ci haut.",
        "Ce message étant nécessaire pour Israël parce que d’un côté, il a perdu son histoire suite à l’influence Egyptienne sur le plan idolâtrique. On lui imposait des dieux étrangers à côté de Dieu de son Père Abraham, Isaac et Jacob.",
        "De l’autre côté, Israël évoluait avec beaucoup des dieux en Egypte et même au désert lors de sa sortie. Moïse en avait connaissance mais il lui manquait l’autorisation de reprocher cette pratique",
        "Quand l’Eternel s’est présenté comme sauveur d’Israël, celui – ci en était heureux et s’est mis à accepter rapidement cette Parole. La preuve en est qu’aujourd’hui, en Israël, l’Eternel y reste l’unique Dieu.",
        "Par ailleurs, pour réussir cette opération de libération, Moïse a été d’une manière assidu en contact avec l’Eternel. Parfois, il connaissait des découragements mais l’Eternel l’encourageait toujours.",
        "En ce qui nous concerne, le problème de la personnalité civile dans l’EBNM nous égorge dans cette recommandation qu’avait reçue Israël.",
        "Le 30 Avril 1980 constitue pour l’EBNM, la date à la quelle nous avons eu la liberté de servir l’Eternel. C’est pourquoi nous sommes en fête pour penser à l’intervention que l’Eternel a faite en notre faveur.",
        "Effectivement, de 1955 à 1980, précisément le 30 Avril, sur le plan politique, l’Eglise manquait le droit de servir l’Eternel. Parfois, n’importe qui pouvait venir nous injurier, saboter mais comme l’on manquer la personnalité civile, on n’avait même pas la possibilité de se défendre devant ces indignations.",
        "Dans notre pays, c’était une période où le droit de célébrer un culte en public était dur ce n’était pas facile de prier librement. Nous étions soumis aux multiples arrestations. C’est pourquoi, il fallait nécessairement une forte puissance invisible pour jouer enfin que nous puissions avoir cette personnalité civile. Cette puissance c’est l’Eternel Dieu lui-même.",
        "En toute vérité, malgré ces difficultés, je ne suis même pas allé consulter les morts, les marabouts, les féticheurs ou les magiciens pour avoir la personnalité civile.",
        "Et aucun magicien, féticheur, marabout ne peut soulever son doigt pour dire que c’est lui que je suis allé consulter pour avoir la personnalité civile.",
        "De puis Forakam, j’ai eu mon Dieu l’Eternel et je traite avec lui je le prie, je m’a genoux devant lui. Il m’encourage, me promet et réalise toutes ces promesses. Chaque fois qu’il promet un événement, j’annonce et les résultats sont là.",
        "Un jour devant les difficultés de ce problème, il m’a promit qu’il m’aidera et il le fit. Evidement pour ce cas, il n’avait pas encore donné la date de réalisation de cette promesse. Curieusement certains serviteurs de Matadi ont réagi en voulant chercher la cause de notre échec à la sorti de la 1ʳᵉ liste des Eglises retenues pour la personnalité Civile. Je les ai demandé de retourner en leur disant que l’Eternel n’a pas don",
        "né la date à la quelle il m’aidera.",
        "Le 30 Avril 1980, il a réalisé sa promesse. L’Eternel nous a libérés en cette date sur le plan politique comme il a fait à Israël. De moi-même, les résultats seraient impossibles, c’est ce Dieu que nous devons d’abord reconnaitre.",
        "En plus, il a réalisé que sur le plan spirituel, nous étions dans l’idolâtrie. Il a lancé l’oracle qui nous ramène à ce texte biblique que nous avons lu ci-haut.",
        "En effet l’expression : « quelque soit le miracle qu’il opère un homme ne peut être Dieu » signifie qu’il ne faut pas avoir un autre Dieu à coté de l’Eternel. Cet oracle nous ramène évidemment à la loi de l’Eternel comme il a fait à Israël.",
        "Nous devons aujourd’hui nous attacher à l’Eternel. C’est pourquoi dans la première onction, l’on dit : « l’Eternel est notre Dieu ». Nous sommes sur une voix qui est sure. L’oracle nous introduit définitivement vers l’Eternel.",
        "Ainsi, nous devons reconnaitre l’Eternel qui nous a aidés par sa force à octroyer la personnalité civile pour nous sauver sur le plan politique. Nous devons également songer à nous attacher à l’Eternel qui nous a sauvés spirituellement à travers l’oracle."
       ]
      }
     ],
     "id": "predication-1"
    }
   ]
  },
  {
   "id": "mbanza-ngungu",
   "name": "Mbanza-Ngungu",
   "sermons": [
    {
     "meta": {
      "place": "Paroisse de Mbanza-Ngungu",
      "occasion": "32 Anniversaire de Reconnaissance - Juridique",
      "attendance": "229 personnes",
      "time": "19h – 22 h",
      "text": "Exode 33 :18 – 20",
      "dateLabel": "28 avril 2012",
      "iso": "2012-04-28"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "18. Moïse reprit : « Découvre – moi donc ta gloire »",
        "19. Il répondit : « c’est ma bonté tout entière que  je veux dérouler à ta vue, et toi, présent, je nommerai de son vrai nom l’Eternel, alors je ferai grâce à qui je devrai faire grâce, et je serai miséricordieux pour qui je devrai l’être 20. Il ajouta : « Tu ne saurais voir ma face ; car nul homme ne peut me voir, et vivre. »."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Moïse fut un prophète, un serviteur exceptionnel de l’Eternel et aussi le tout premier Messie en Israël dont le nom se parle beaucoup partout où l’on prêche le nom de l’Eternel.",
        "L’Eternel Dieu se faisait fréquemment manifester en lui et l’on dit : « il se parlait tête à tête avec lui ». En réalité, il est difficile d’expliquer cela car c’est impossible. L’Eternel utilisait Moïse comme son Patron et Moïse serviteur.",
        "Dans toutes les manifestations de l’Eternel à son endroit, Moïse réalisa qu’il lui manquait quelque chose de très importante. Il tenait à voir l’Eternel.",
        "Le fait de dire à l’Eternel : «  Montre moi ta gloire : Moïse chercher voir et connaître comment l’Eternel est surtout que depuis très longtemps ils collaboraient ensemble ». Parfois il faisait à côté de l’Eternel, 40 jours et 40 nuit sans manger ni boire.",
        "En réponse, l’Eternel lui dit : « ce que tu demandes est impossible mais je te ferai voir ma bonté et mon vrai nom car personne ne peut me voir et vivre. Je suis invisible, et le reste des dieux peuvent être mis dans la poche, transportés, mais pas moi ».",
        "L’homme croit plus aux dieux visibles et moins à l’Eternel car il ne se voit pas or c’est celui le vrai Dieu. Connaître son nom c’est une grâce, une chance, un privilège et aussi une grande bénédiction qui n’est pas donnée à tout le monde.",
        "L’Eternel n’est pas un Dieu à assimiler à un autre ni à l’égaler. Il n’est pas non plus un esprit, ni un vent et ni un ange. C’est un Dieu merveilleux que l’on ne peut jamais comparer à aucune de ses créatures visibles ou invisibles. Il est partout et connait tout. On ne blague jamais avec lui. Rien ne sert à aménager un effort pour le voir.",
        "L’Eternel a fait vivre à Moïse sa bonté. Il est un Dieu spécial c’est celui notre Dieu. Il me dirige et m’a conduit durant les 57 ans que je viens de faire avec lui. Son nom c’est l’Eternel.",
        "En ce qui nous concerne, nous devons seulement nous attacher en lui qui nous donne tout. Il nous sauvera par sa bonté."
       ]
      },
      {
       "title": "Exposé dans la résidence",
       "kind": "text",
       "paras": [
        "L’Apocalypse 5.6  dit : « Et je vis, au milieu du trône et des quatre êtres vivants et au milieu des vieillards, un agneau qui était là comme immolé. Il avait sept cornes et sept yeux, qui sont les sept esprits de Dieu envoyés par toute la terre ».",
        "Les textes chrétiens nous parlent ici d’un dieu qui porte sept yeux. En réalité, l’Eglise chrétienne parle de trois dieux : Père, Fils et Saint Esprit, Malheureusement, il ne nous a pas présenté le quatre esprits restant.",
        "Ce qui est juste, l’Eternel Dieu n’a pas sept esprits. Il n’a qu’un seul Esprit comme il le dit bien dans Joël 2.9 : « Ils se répandent à travers la ville, franchissent les murailles montent dans les maisons, entre par les fenêtres comme des larrons. » et Isaïe 42.1 : « Voici mon serviteur, que je tiens par la main, mon élu, en qui mon âme se complaît ; sur lui, j’ai répandu mon esprit, pour qu’il révèle aux nations ce qui est juste. ».",
        "Je rependrai mon esprit. Comme par hasard, même si l’on trouve le contraire moi étant prophète, je déconsidère cela. L’Eternel n’a qu’un seul esprit. D’ailleurs, le fait de dire dans Gn : 1.1 faisons l’homme à notre image n’a pas sa raison d’être. Quand j’ai fait le Syllabus de Formation apostolique, j’avais bien souligne « Ntumua kalendi kala mpeve za zingi ko ».",
        "Etant Prophète, je suis à mesure de vous donner la lumière, personne ne peut nous faire connaître l’Eternel s’il n’est pas préparé. D’ailleurs, le livre de Prov. 30 :1-3 dit : « la nation de Dieu ne peut jamais être connue par la sagesse humaine. C’est lui-même l’Eternel qui forme la personne pour le connaître ».",
        "Moi j’ai été formé par l’Eternel pour le connaitre et pour le faire connaitre à l’humanité. L’Eternel est très puissant, et d’ailleurs, il n’a pas de fils comme l’indique ces versets de Proverbes. L’Eternel Dieu n’est pas un homme et n’a pas non plus un fils. Sa sagesse est toujours grande jusqu’à tel point que pour le connaître il faut nécessairement la présence d’un homme crée pour donner la lumière et expliquer la sagesse divine.",
        "L’Eternel n’a pas sept yeux car il n’est pas un homme. Même s’il avait sept yeux, comment pourrait – il voir le monde entier. Lui-même l’Eternel est la vie c’est pourquoi il voit partout. C’est ce que nous devons comprendre."
       ]
      }
     ],
     "id": "predication-2"
    },
    {
     "meta": {
      "place": "Paroisse de Mbanza-Ngungu",
      "occasion": "32ᵉ Anniversaire de la Personnalité Civil",
      "attendance": "1010 personnes",
      "time": "13h20 – 19 h10",
      "text": "Deut. 5 :6 - 10",
      "dateLabel": "29 avril 2012",
      "iso": "2012-04-29"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "6. Je suis l’Eternel, ton Dieu, qui t’a fait sortir du pays d’Egypte, d’une maison d’esclavage. 7. Tu n’auras point d’autre Dieu que moi. 8. Tu ne te feras point d’idole, l’image de quoi que ce soit dans les eaux au-dessous de la terre. 9. Tu ne te prosterneras point devant elles, tu ne les adoreras point, car moi seul, l’Eternel je suis ton Dieu, jaloux. Qui poursuit le crime des pères sur le troisième et la quatrième génération, pour ceux qui m’offensent. Et qui étends mes faveurs à la millième, pour ceux qui m’aiment et gardent mes commandements."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Israël a fait plus de 400 ans en Egypte entrain de prier les dieux Egyptiens. Cette influence a fait qu’il puisse oublier totalement le Dieu de son père Abraham, Isaac et Jacob. Ce problème pesait sur l’Eternel. Par sa volonté il a trouvé la solution. Celle de libérer ce peuple dans cette servitude.",
        "Depuis l’époque coloniale jusqu’au 1980, nous avons toujours eu des problèmes sur le droit de prêcher la Parole de l’Eternel. En réalité, il était nécessaire que le chef de l’Etat puisse nous donner l’autorisation de prier sans quoi les difficultés pourraient se multiplier.",
        "Pendant cette époque des souffrances, beaucoup des serviteurs étaient mis en prisons sans motif valable. Tout cela c’est parce qu’on manquait la liberté. Alors pour avoir la personnalité civile, ce n’était pas possible mais à notre tour la situation est devenue possible grâce à l’Eternel qui a agit.",
        "Je suis le mieux placé et le seul pour vous parler de Dieu qui nous a sauvés parce que j’ai traité avec lui comme Moïse en Israël.",
        "Quand j’étais par exemple en prions de Kalamu. A 5 h 30’, l’Eternel est venu me dire Isaac, dit à tes gens de ne plus rester ici, qu’ils t’attendent à la maison le soir car aujourd’hui tu vas sortir. Le soir à 17 h, on est venu me prendre pour aller en Hôtel de Ville et on m’a fait sortir.",
        "Il a pensé également à notre situation spirituelle en nous libérant de l’idolâtrie à travers l’oracle. Moi, j’ai opéré beaucoup des miracles et je continue à opérer mais je ne suis pas Dieu. L’Eternel reste l’unique Dieu qui sauve.",
        "En somme, nous devons retenir que c’est l’Eternel qui a fait tout pour que nous puissions octroyer la personnalité civile. Aucun groupe n’était d’accord pour que notre Eglise soit libérée. Mais l’Eternel a fait tout et il a également pensé à notre salut spirituel à travers l’oracle. Nous lui devons de reconnaissance."
       ]
      },
      {
       "title": "Exposé du Prophète sur la notion de Pâque",
       "kind": "text",
       "paras": [
        "La Pâque c’est une fête juive qui était célébrée en l’honneur de l’Eternel pour avoir libéré Israël de la servitude en Egypte. C’est l’Eternel Dieu qui avait recommandé cette fête à ce peuple. Comme repas, ils immolaient une bête domestique comme sacrifice pascal ou agneau pascal. Tout cela pour la gloire de l’Eternel Dieu. C’est pendant sept jours qu’ils fêtaient la pâque et ils mangeaient cette bête avec des pains sans levain en mémoire de leur sortie précipitée.",
        "Pour les chrétiens, ils célèbrent la pâque pour penser à la mort et à la résurrection de Jésus. En ce qui concerne les KCCISTES la pâque n’a pas la raison d’être célébrée dans notre Eglise. Parce que nous n’avons pas subit les mêmes conditions que les juifs. Nous ne disposons aucunes circonstances poussant à célébrer la pâque.",
        "La conception pascale ne nous regarde pas. Ce qui nous concerne, c’est notre sortie de l’Idolâtrie. Nous fêtons l’oracle qui exprime notre sortie du culte de baal. C’est une clé qui nous conduit à la délivrance qui consiste à la connaissance de la loi de Dieu. Nous ne sommes pas obligés de l’appeler pâque mais nous l’appelons fête de l’oracle.",
        "A côté de cette Fête, nous avons aussi la fête de l’Alliance. Cette fête intervient 50 jours après l’oracle. Dans l’oracle, Dieu a parlé. Nous avons quitté l’idolâtrie pour entrer dans l’Alliance que l’Eternel a faite avec l’humanité représentée par Israël.",
        "Les juifs ont fêté la pâque non pas pour aller au ciel mais pour exprimer des reconnaissances à l’Eternel. Notre cas a un impact très grand et très différent. Sans oracle on ne pouvait pas entrer dans l’Alliance de l’Eternel et on ne pouvait pas non plus avoir le salut. On allait Eternellement rester dans l’idolâtrie.",
        "Par ailleurs, la reconnaissance juridique a permis à notre Eglise d’évoluer à l’Etranger. Aujourd’hui, par ci – par là, l’Eglise se retrouve. C’est un grand travail que nous avons abattu.",
        "Aujourd’hui, nous sommes obligés d’apporter la lumière comme dit Isaïe 49 :5-6. « 5. Et maintenant, s’adressant à moi, l’Eternel qui m’a crée pour être son serviteur, pour lui ramener Jacob et grouper Israël autour de lui. Car grand est mon prix aux yeux de l’Eternel et mon Dieu est ma force. 6. L’Eternel me dit : c’est trop peu que tu sois mon serviteur, pour relever les tribus de Jacob et rétablir les ruines d’Israël : je veux faire de toi la lumière des nations, mon instrument de salut jusqu’aux confins de la terre. »",
        "En effet, par lumière, il faut faire allusion à la connaissance de nom de l’Eternel. Par Yawe, il faut entendre le nom puissant, un Dieu créateur. Ce nom, constitue une grande lumière. Ceux qui en manquent sont dans le noir.",
        "Notre travail est d’apporter la lumière. Le travail est grand. A partir de notre comportement, les gens doivent connaitre l’Eternel Dieu comme cela est dit dans Isaïe 49 :3 : « Et il m’a dit : « tu es mon serviteur ; Israël, c’est par toi que je me couvre de gloire » c’est-à-dire c’est à travers ton comportement que je serai honoré. C’est une élection.",
        "Ceci est une réalité. Nous sommes son serviteur pour apporter la lumière. A travers notre comportement cette lumière qui est le nom de Dieu sera rependue partout dans le monde. Ce pourquoi nous devons nous réjouir à tout moment.",
        "En 1966 par exemple, j’étais soumis à une grande pression par les autorités religieuses pour changer ma manière de prêcher. Devant une masse de 800 personnes on m’a recommandé de jurer publiquement pour changer ma façon de prêcher.",
        "L’Eternel m’a donné la parole à travers ce cantique que nous appelons « Serment du Prophète ». Qu’à cela ne tienne, je n’ai pas céder. J’ai tenu à prêcher la vérité qui est la lumière dont nous parlons. C’est ce qui a fait que cette œuvre puisse grandir et évoluer telle que vous la voyez.",
        "Ainsi soyons sérieux dans notre comportement pour bien faire connaitre le nom de l’Eternel dans le monde."
       ]
      }
     ],
     "id": "predication-3"
    },
    {
     "meta": {
      "place": "Paroisse de Mbanza-Ngungu",
      "occasion": "Culte d’action de grâce pour 32ᵉ Anniversaire de la Personnalité Civile",
      "attendance": "598 personnes",
      "time": "19h – 22 h",
      "text": "Isaïe 45 : 21-22",
      "dateLabel": "30 avril 2012",
      "iso": "2012-04-30"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "21. Faites votre récit, avancez vos raisons, délibérez ensemble : qui a dans un passé lointain, annoncé tout cela ? qui l’a révélé des longtemps ? n’est – ce point moi l’Eternel, à côté de qui il n’est pas de Dieu, moi le Dieu juste et secourable, qui n’a point de rival ?",
        "22. Tournez – vous vers moi, et vous serez sauvés, vous tous qui habitez les confins de la terre ; car moi, je suis Dieu et personne d’autre."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "En Israël il y a eu un grand problème qui pesait sur le peuple. C’est celui de la connaissance de l’Eternel. Dans ce temps là ce problème pesait plus sur la vie spirituelle de l’homme jusqu’à ce que l’Eternel Dieu est venu lui-même en trouver la solution.",
        "En effet, il dit : « Assemblez – vous et examinez sur la provenance de ce problème dans les écrits, n’est – ce pas moi qui l’avait dit depuis longtemps que je suis l’Eternel ? Et il n’y a pas un autre ? Vous allez voir que c’est bien moi l’Eternel ».",
        "Ni Isaïe, ni un autre mais c’est moi qui suis Dieu. Le seul Dieu qui sauve. Devant moi, il n’y a pas un rival c’est-à-dire, il n’y a pas un autre Dieu. C’est pourquoi, je vous dis  « Tournez – vous vers moi et vous serez sauvé car moi l’Eternel je suis le seul Dieu et il n’y en à point d’autre ».",
        "Vérifiez et vous verrez. Justement, ce problème vient de prendre place dans notre époque. Jusque là, la connaissance sur l’Eternel pèse dans la tête de plusieurs personnes.",
        "L’Eternel vient de nous demander de nous réunir aujourd’hui pour voir ensemble que c’est lui qui est le Dieu qui sauve. Nous sommes sensés de réaliser qu’il n’y a pas un autre Dieu qui sauve. C’est vrai, nous voyons ce salut et nous en sommes tous des témoins.",
        "Nous sommes entrain de penser à la personnalité civile. Pour en avoir, c’est l’Eternel qui a joué son rôle de sauveur. Il nous a sauvés par sa main puissante. C’est un grand signe pour réaliser que cette parole est juste. L’Eternel est le Dieu qui sauve et il n’y en a point d’autre.",
        "A partir de cette intervention de l’Eternel sur la personnalité civile, nous nous permettrons d’affirmer que nous sommes tous des témoins comme dit l’Eternel dans Isaïe 45.43-12 « Vous êtes tous mes témoins … » Nous avons des preuves tangibles du salut de l’Eternel. Ce n’est pas à moi de faire beaucoup d’analyse sur ce sujet.",
        "Nous devons simplement saisir que c’est l’Eternel Dieu qui sauve. Tournons nous vers lui. En lui, nous allons toujours continuer à être sauvé en tout. Cette parole est juste parce que c’est lui-même qui avait dit cela et il l’a défendue.",
        "En sommes, nous devons seulement retenir que l’Eternel est le Dieu qui sauve. Ce témoignage est juste parce qu’il a dit qu’il nous aidera et il l’a fait."
       ]
      }
     ],
     "id": "predication-4"
    },
    {
     "meta": {
      "place": "Paroisse de Mbanza-Ngungu (résidence)",
      "occasion": "Culte d’au revoir",
      "attendance": "105 personnes",
      "time": "14h03 – 14 h45",
      "text": "Psaume 136 :1-4",
      "dateLabel": "1 mai 2012",
      "iso": "2012-05-01"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "1. Rendez hommage au Seigneur, car il est bon, car sa grâce est éternelle.",
        "2. Rendez hommage au Dieu des dieux, car sa grâce est éternelle.",
        "3. Rendez hommage au Maître des maîtres, car sa grâce est éternelle.",
        "4. A celui qui accomplit lui seul, de grandes merveilles, car sa grâce est éternelle ;"
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "A Forakam, lors de la 4ᵉ apparition, J’entendis une voix me dit : « Isaac lit le Psaume. 136 »  à cette époque Je n’avais pas l’habitude de lire la Bible. En ouvrant, je suis tombé aussi dans le Psaumes. C’était 22 heures et Immédiatement après la lecture, il faisait déjà 6 h du matin et j’ai découvert que je n’ai lu que deux versets.",
        "Aujourd’hui, nous étudions les 4 versets. Il est certain que c’est lui-même l’Eternel qui fait des merveilles. Au départ, je ne savais pas la raison pour la quelle on m’a recommandé de lire ces versets.",
        "En effet, dans la vie, il faut avoir l’habitude de dire merci et surtout, il faut connaître à qui l’on doit présenter des remerciements. C’est à lui le Dieu des dieux que l’on doit rendre hommage, et reconnaitre car sa grâce est éternelle. Nous n’avons donné aucun sous mais il faut voir ce qu’il nous a donné ? C’est trop comme grâce. Il nous a montré la voie du salut. Le 30 Avril 1980, nous sommes devenus couverts par l’Etat pour garder cette voie du salut dans la quelle nous sommes introduits.",
        "Dans tout cela, l’Eternel ne nous a jamais demandé des sacrifices mais seulement des reconnaissances, et des actions de grâce. A notre tour nous sommes obligés de le faire car l’Eternel Dieu est Bon et très miséricordieux.",
        "Par ailleurs, Au cours de nos démarches pour obtenir la personnalité civile, nous avons perdu notre espoir mais l’Eternel s’est mis à nous promettre et à la fin il a réalisé.",
        "D’une manière générale, tout vient de Dieu. Les conjoints, les enfants, le salaire, la santé, la vie, viennent de lui.",
        "Si vous recevez quelque chose de la part de l’Eternel, vous devez toujours avoir l’habitude de lui présenter des remerciements.",
        "Un jour par exemple, j’étais réussi chez un papa en 1957 dans sa maison. L’Eternel me dit : « ce papa va tout laisser, sa femme, ses bien puis il va fuir ». Je le lui ai dit cela. C’était vers 20 h le jour suivant à 11 h, il le fit. Il est allé se marier à Brazzaville et il a eu une autre femme avec qui ils ont fait des enfants. Ainsi, si Dieu donne, il faut dire merci car il peut aussi ravir tout ce qu’il a donné.",
        "Comme il nous a donné la voix du salut et il a autorisé l’Etat de nous donner la personnalité civile pour bien œuvrer. Nous devons nécessairement remercier l’Eternel et les autorités qui gouvernent notre pays. Ces remerciements seront exprimés par notre amour de demeurer dans sa voix en faisant toujours des biens pour l’honneur de l’Eternel."
       ]
      }
     ],
     "id": "predication-5"
    }
   ]
  },
  {
   "id": "lukala",
   "name": "Lukala",
   "sermons": [
    {
     "meta": {
      "place": "Paroisse de Lukala",
      "occasion": "Visite Chef Spirituel",
      "attendance": "301 personnes",
      "time": "20h-23h",
      "text": "I R 18 : 7 – 21",
      "dateLabel": "2 mai 2012",
      "iso": "2012-05-02"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "7. Comme Obadia suivant sa route, il vit venir Elie à sa rencontre : le reconnaissant, il se jeta sur la face et dit : «  Est – ce toi, Elie, mon Seigneur ? 8. Il lui répondit : »C’est moi. Va dire à ton maître : voici Elie » 9.Obadia repartit : « Quel mal ai-je part, pour que tu exposes ton serviteur à être mis à mort par Achab ? 10. Par l’Eternel, ton Dieu ! Il n’est peuple ni royaume où mon maître n’ait envoyé pour te chercher : Et quand ils disaient qu’on ne savait rien de toi, il obligeait royaume et peuple à jurer qu’on ne t’avait point trouvé. 11. Et maintenant tu me dis : Va dire à ton maître : Voici Elie ! 12. Mais à peine t’aurais – je quitté, que le souffle du Seigneur te portera vers un lieu que j’ignore : j’irai t’annoncer à Achab, et il ne te trouvera pas et il me tuera ! Or, ton serviteur révère l’Eternel depuis son enfance. 13. Mon Seigneur n’a – t – il pas apprit ce que je fis, lors que Jézabel mis à mort les prophètes de l’Eternel ? J’en cachai une centaine – cinquante dans chaque souterrain – et je les nourris de pain et d’eau. 14. Et maintenant tu dis : Va dire à ton maitre : Voici Elie ! Mais il ne tuera ! » 15. Elie répondit : « Par l’Eternel cebaot, dont je suis le serviteur ! Aujourd’hui même je paraîtrai à sa vue. » 16. Obadia alla rejoindre Achab, qu’il mit au courant, et Achab alla au devant d’être. 17. En apercevant Elie, Achab lui dit : « Te voilà donc, perturbateur d’Israël ? » 18. Il répondit : «  ce n’est pas moi qui ai jeté le trouble en Israël, c’est toi et la maison de ton père, puis que vous avez déserté les lois de l’Eternel, puis que tu as adopté le culte de baal. 19. Et maintenant, fais rassembler autour de moi tout Israël vers le mont Carmel, avec les quatre cent cinquante prophètes de baal et les quatre cents prophètes d’Achèra, qui vivent de la table de Jézabel. 20. Achab envoya des ordres parmi tous les enfants d’Israël, et rassembla les prophètes sur le mont carmel. 21. Elie s’avance devant tout le peuple et s’écria : « Jusqu’à quand clocherez – vous entre les deux partis ? Si l’Eternel est le vrai Dieu, suivez – le ; si c’est baal, suivez Baal ! » Mais le peuple ne lui répondit mot."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Israël avait abandonné l’Eternel pour servir les dieux de baal. Aux yeux de l’Eternel, c’est le péché le plus grave qu’avait commis Israël. Cette situation irrita l’Eternel jusqu’à ordonner pendant 3 ans par le canal du Prophète Elie qu’il ait l’arrêt total de pluie sur tout Israël.",
        "Cette catastrophe de sécheresse provoqua un taux très élevé de mortalité. Les hommes, les animaux et les plantes ne vivaient plus dans le rythme normal. Le Roi Achab cherchait la cause de cette sécheresse et on lui dit que c’est Elie l’agent causal.",
        "En guise de réaction, le roi Achab écrivit à tous les pays étrangers de chercher Elie pour le tuer mais toutes les réponses à ces lettres étaient négatives.",
        "En Israël, Obadia servait Achab et en même temps croyait à Elie. Comme para hasard, Obadia se sont rencontrés quelque part avec Elie et il lui rencontra toutes les démarches que Achab est entrain d’effectuer pour le tuer.",
        "Elie envoya Obadia pour cherche d’Achab et lui dire de venir auprès de lui. Mais Obadia dit à Elie : «  Mon Seigneur tu sais que j’ai gardé 100 prophètes dont 50 dans chaque citerne souterraine et je les nourrissais parce que Jézabel cherchait à les tuer. Si je pars chercher Achab et que par la puissance de ton Dieu tu disparais, moi, on me tuera ».",
        "Elie lui dit : « En vérité, je te dis, il ne te fera rien. Vas – y ». Et Obadia le fit. Achab alla calmement vers Elie. Et lui dit : « C’est toi le perturbateur d’Israël ». Elie lui répondit : « ce n’est pas moi mais c’est toi et les enfants de ton père. Car vous avez rejeté la loi de l’Eternel et le nom de l’Eternel. Vous avez préféré le culte de baal. Pour prouver que ce n’est pas moi, réuni tous les enfants d’Israël y compris les 450 prophètes de baal et les 450 prophètes de Jézabel sur le mot carmel pour un examen ». Achab le fit. Elie dit : « Jusqu’à quand vous clocherez – vous entre les deux partis ? ».",
        "Si l’Eternel est le vrai Dieu, suivez-le : si c’est baal, suivez Baal ! Le peuple a gardé silence. Elie leur demanda d’invoquer baal pour consumer le taureau avec le feu qui doit descendre du ciel. Pendant toute la journée, tous les 900 prophètes ont échoué. Elie recommanda de jeter de l’eau sur son taureau et sur les bois .Ils le firent. Puis Elie invoqua le vrai Dieu pour faire descendre du ciel le feu qui pourra consumer le taureau",
        "A la munites, l’Eternel le fit. Puis Elie égorgea et tua tous les 900 prophètes. Tout Israël, cru que l’Eternel est le vrai Dieu.",
        "En réalité, le roi Achab en son rang, ne pouvait jamais rejeter l’Eternel ni son Alliance. Il ne pouvrait pas non plus ignorer la loi, le nom et l’Alliance de l’Eternel. Elie lui a demandé de bien réfléchir. C’est pour cette raison qu’il a occasionné pour preuve la rencontre au carmel.",
        "Dans notre temps nous sommes dans la même situation. Satan de son côté à plusieurs dieux. C’est celui qui les dirigé. Tous les faux dieux portent chacun un nom.la vrai divinité n’a qu’un seul nom c’est l’Eternel et il est un. C’est Yahvé. C’est lui le créateur, et sauveur. Tous les dieux qui n’ont pas crée le ciel et la terre sont des faux dieux.",
        "C’est ce qui dit Jérémie 10 : 10 – 11. « Tandis que l’Eternel, Dieu, est vérité : lui seul est un Dieu vivant et un Roi Eternel : sa colère fait trembler la terre et les peuples ne peuvent soutenir son courroux. 11. Vous leur parlerez ainsi : «  Les dieux qui n’ont crée ni le ciel ni la terre disparaîtront de la terre et de dessous ces cieux ».",
        "L’Eternel est le Dieu, lui seul est le Dieu vivant. C’est pourquoi on l’appelle l’Eternel. Il n’a ni commencement et ni fin. Il est un roi et reste un roi éternellement. S’il se fâche, aucun peuple ne peut se tenir devant son courroux (sa colère).",
        "Tous les faux dieux disparaitront c’est une grande erreur si l’on quitte l’Eternel. Israël a commis une grosse erreur de quitter l’Eternel pour s’attacher à Baal.",
        "Si nous choisissons l’Eternel, nous serons sauvés ? Ne mélangeons pas l’Eternel avec les fétiches, les marabus… de peur que l’on ne meurt. C’est le moment de choisir. Si c’est baal, suivez – le. L’Eternel ne va pas te regretter. Il faut être sincère, réaliste et sérieux. Israël n’avait pas de réponse à donner à Elie, parce qu’il était déjà avec Baal.",
        "Israël écoutait la voie de l’Eternel mais il l’a oublié. Si nous nous attachons à l’Eternel nous serons plus heureux que la nation d’Israël. Même moi, je ne suis pas un Dieu. Le vrai Dieu c’est l’Eternel. C’est celui qui fait tout pour vous. Ne l’abandonnons pas. C’est celui qui a tout mis a notre disposition c’est-à-dire les eaux, la terre, les poissons, la forêt, l’air pour que nous puisons bien vivre. Pourquoi ne pouvons-nous pas le prendre comme notre Dieu. C’est celui qui a crée même le ciel, si nous l’abandonnons ou irons nous ? Attachons nous à l’Eternel et obéissons à sa loi."
       ]
      },
      {
       "title": "Exposé",
       "kind": "text",
       "paras": [
        "Vous n’êtes pas ignorant que notre Eglise est née en 1955 par la volonté de l’Eternel. Ce n’est pas la création d’une personne. J’ai commencé ce travail de prêcher en 1956. C’était une époque coloniale où la tenue du culte était prohibée. Même les Kimbanguistes, ne priaient pas parce que le moment était très dur. Mais j’ai engagé tous les risques pour annoncer le nom de l’Eternel. L’Eglise n’était qu’un petit groupe. S’il faut chanter a lors il faut abaisser la voix.",
        "Nous avons commencé à prier publiquement juste après la reconnaissance juridique de l’Eglise Kimbanguiste.",
        "En 1965, à partir de Kinshasa, le Professeur Guy Bernard est venu me voir à Boma pour me conseiller. Après avoir examiné mon travail, il m’a conseillé de chercher auprès de l’Etat la personnalité civile.",
        "En 1967, j’ai introduit une demande pour la dite situation. En réponse, on m’a autorisé de travailler parce que l’état avait momentanément suspendu ce dossier.",
        "Le 24/04/1971 je fis arrêté parce que j’ai crée une Eglise. Le gouverneur NZOKU me jugea et m’arrêta jusqu’à me libérer.",
        "Les persécutions persistèrent jusqu’au 30 Avril 1980, date à la quelle, nous avons eu la personnalité civile. Et nous sommes entrées sous le contrôle de l’Eglise du christ.",
        "Si nous avons eu cette personnalité civile c’est l’Eternel Dieu. Moïse a eu l’ordre de libérer Israël. Il a tout fait pour Israël. Israël dans tout cela ne voyait que Moïse comme libérateur. Il ignorait que c’est Dieu qui a agit. Quand Israël fut sorti, il continuait à prier les statuts jusqu’à ce que l’Eternel avait parlé en disant : c’est moi l’Eternel qui vous a fait sortir de pays de l’Egypte. C’est à partir de là que Israël a su et compris que c’est l’Eternel qui a opère tous ces miracles.",
        "De même pour nous, c’est lui-même l’Eternel qui nous a aidés pour avoir la personnalité civile. Moi je n’étais qu’un Instrument qu’il a utilisé."
       ]
      }
     ],
     "id": "predication-6"
    }
   ]
  },
  {
   "id": "kimpese",
   "name": "Kimpese",
   "sermons": [
    {
     "meta": {
      "place": "Paroisse de Kimpese (maison du prédicateur FOFO)",
      "occasion": "Visite Chef Spirituel",
      "attendance": "349 personnes",
      "time": "20h – 23 h",
      "text": "Deut 29 :9 -12",
      "dateLabel": "3 mai 2012",
      "iso": "2012-05-03"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Au cours de sa mission, Moïse avait transmis la Parole au peuple d’Israël en leur communiquant la volonté de l’Eternel en ces termes : « vous tous, vous êtes placés devant l’Eternel malgré qu’il est invisible. Grand et petit, homme et femme,…. êtes tous invités à entrer dans l’Alliance. Il traitera avec vous et il vous élèvera enfin que vous soyez son peuple et lui votre Dieu comme il a juré à vos pères Abraham, Isaac et Jacob… ».",
        "Il s‘agit ici d’une invitation de l’Eternel qui s’adresse non seulement à Israël mais à toute l’humanité. Il est le même Dieu qui créa Israël et tous les peuples du monde.",
        "L’Eternel veut devenir propriétaire d’Israël et veut également le rendre un peuple de grande valeur. Mais la seule condition c’est d’entrer dans son Alliance.",
        "Cette recommandation constitue une loi à perpétuité c’est-à-dire une loi qui ne peut jamais connaitre des modifications.",
        "Même dans l’Eglise, plusieurs membres sont là mais ils refusent d’entrer dans l’Alliance. Ils sont entrain de fuir la loi qui dit : « il ne faut pas avoir un autre Dieu à côté de moi ». Cette loi pèse et c’est une grande insécurité si dans un foyer il y a un qui refuse d’entrer dans l’Alliance de l’Eternel. D’abord la 1ʳᵉ loi et le reste suivront. C’est cette loi qui pèse plus.",
        "L’Eternel nous invite à entrer dans son Alliance sans rien demander. Ailleurs, dans les alliances de Satan, on demande la vie, les enfants, la femme, les parents et autres. Si l’on refuse c’est un problème.",
        "Pour l’Eternel, il ne demande que l’on dise oui avec un cœur ouvert. Il sera avec vous à partir d’ici bas jusqu’au ciel.",
        "L’Eternel à tout mis à notre disposition et pour quoi ne pas accepter d’entrer dans son Alliance pour traiter avec lui ?",
        "L’Eternel ne force pas mais à moi il a forcé en me disant : si tu refuses, je te tuerai. Un jour, je suis allé au village avec mon grand frère MBAMBUKULU pour entrer notre père. Arrivé près du village, quelqu’un me dit « Ton père n’est pas mort » et réellement il était vivant.",
        "Je me suis décider d’aller visiter m’a famille. Ils m’ont bien reçu. La nuit on m’a offert une place pour dormir et une voie me dit à plusieurs reprise  « Attention Isaac, bisi kibangu bazolele kumbunga » c’est-à-dire, les gens de Kibangu veulent me tuer.",
        "Le matin, j’ai appelé tous les gens de Kibangu pour leur demander la raison pour la quelle ils ont voulu me détruire. En réponse, ils me dirent : « non, nous sommes seulement venus vous rendre visite ».",
        "Pourquoi l’Eternel m’a sauvé ? C’est parce que depuis 1955, je traite avec lui. Il me sécurise et me protège.",
        "Il n’est pas bon de gérer les chainettes dans le corps qui ne peuvent jamais vous sauver et pourtant le créateur est présent.",
        "Ainsi, entrons tous dans l’Alliance de l’Eternel pour traiter avec lui."
       ]
      }
     ],
     "id": "predication-7"
    },
    {
     "meta": {
      "place": "Paroisse de Kimpese",
      "occasion": "Culte d’aurevoir à Kimpese",
      "attendance": "350 personnes",
      "time": "14h-15h30",
      "text": "Isaïe 45 : 24 – 25",
      "dateLabel": "4 mai 2012",
      "iso": "2012-05-04"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "24. En l’Eternel seul, qui m’a parlé, résident le salut et la force ; vers lui reviendront, couverts de honte, tous ceux qui s’étaient emportent contre lui. 25. En l’Eternel seront justifiés et glorifiés tous les descendants d’Israël."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Il s’agit de la parole du Prophète Isaïe exprimée en ces termes : en l’Eternel seul qui m’a parlé que résident le salut et la force. C’est en Eternel que seront justifiés et glorifiés les peuples d’Israël.",
        "Moi, j’ai écouté la Parole de Dieu, je vous dis encore que le salut se trouve en l’Eternel. Cette Parole est juste il faut bien la garder au cœur.",
        "Si vous voulez être sauvés dans vos maladies et vos problèmes, vous devez seulement chercher l’Eternel. Il détient la force, et la victoire. Il détient également tout en lui. C’est celui notre vie notre espérance en tout. C’est auprès de lui qu’il faut crier. C’est à lui qu’il faut se confier si vous avez un problème. A son tour il vous sauvera car il est votre salut. Il n’est pas bon de perdre tout le temps pour aller chercher un autre dieu ailleurs.",
        "Ainsi, il faut chercher seulement l’Eternel pour tout problème, car il est le salut, la force et la victoire. Si vous abandonnez l’Eternel pour aller ailleurs, vous serez en difficulté. Alors, une difficulté Eternelle."
       ]
      }
     ],
     "id": "predication-8"
    },
    {
     "meta": {
      "place": "Paroisse de Kimpese",
      "occasion": "Visite du temple et de l’institut Manenga",
      "attendance": "",
      "time": "11h-12h30",
      "text": "",
      "dateLabel": "4 mai 2012",
      "iso": "2012-05-04"
     },
     "sections": [
      {
       "title": "Causerie du Prophète avec les élèves de l’Institut Manenga",
       "kind": "text",
       "paras": [
        "Je suis très content de me retrouver dans ce lieu et voir les œuvres dont je suis l’initiateur. C’est une opportunité que l’Eternel vient de nous donner aujourd’hui. C’est aussi un don de l’Eternel Dieu.",
        "En effet, quand j’ai quitté Kinshasa le samedi 28/04/2012 pour venir fêter le 32ᵉ anniversaire de la Reconnaissance Juridique à Mbanza Ngungu, je ne pensais pas arriver ici dans cette institut. Spontanément, je suis surpris de me retrouver à Kimpese. Qu’à cela ne tienne, vous venez de me réserver un accueil chaleureux ce dont je vous en remercie et j’en suis très content. C’est une bénédiction pour vous.",
        "L’Eternel ne m’a pas envoyé pour ne parler que de son nom mais pour penser aussi à la vie de peuple.",
        "J’ai construit cet institut pour que vous soyez en paix et que notre pays le RDC trouve des cadres qui peuvent bien le gérer.",
        "Vos parents se battent pour vous payez le minerval. A votre tour, je vous invite à prendre le sérieux dans les études et surtout à vous occuper profondément de votre formation. A côté de ceci, je vous demande le respect envers les autorités, vos collègues et tout le monde. Et je demanderai à l’Eternel qu’il vous accorde tous la réussite dans vos études.",
        "Je vous apprends que le KCC c’est un mystère. Par mystère il faut penser à ce qui ne peut jamais être expliqué par l’intelligence humaine si ce n’est que par la puissance de l’Eternel Dieu lui-même."
       ]
      }
     ],
     "id": "predication-9"
    },
    {
     "meta": {
      "place": "Sous-section de Kiemba (paroisse de Kimpese)",
      "occasion": "Visite Chef Spirituel",
      "attendance": "29 personnes",
      "time": "17h – 17h30",
      "text": "",
      "dateLabel": "Vendredi",
      "iso": "2012-05-04"
     },
     "sections": [
      {
       "title": "Exposé",
       "kind": "text",
       "paras": [
        "C’est une surprise pour moi de vous voir aujourd’hui. Je suis très heureux dans mon cœur de voir que même dans ce coin du Bas-Congo le nom de l’Eternel est proclamé.",
        "C’est un grand problème dans ce monde de parler du nom de l’Eternel. C’est une grâce pour laquelle nous devons rendre hommage à l’Eternel. Nous avons reçu ce grand travail, celui de prononcer le nom de l’Eternel en expliquant que c’est celui qui nous a tous crée, il est notre sauveur.",
        "Ceci constitue bien la toute première leçon qui a été gardée. Malheureusement le monde l’a caché et a préféré parler des fausses divinités qui n’ont fait rien.",
        "Heureusement l’Eternel nous a donné ce travail, celui de proclamer le nom de l’Eternel dans le monde.",
        "Ainsi, continuions à faire ce travail afin que nous soyons bénits et protégés par l’Eternel. Et je viendrai un jour voir le travail de construction que vous avez déjà fait."
       ]
      }
     ],
     "note": "Kiemba c’est une sous – section de la Paroisse de Kimpese dirigée par le Disciple Liévin et le Disciple Anto. Cette entité dispose déjà un temple construit mesurant 9/4 m. ce village est juste situé entre Kimpese et Kenge vers Matadi.",
     "id": "predication-10"
    }
   ]
  },
  {
   "id": "kenge",
   "name": "Kenge",
   "sermons": [
    {
     "meta": {
      "place": "Section de Kenge (route de Matadi)",
      "occasion": "Visite Chef Spirituel",
      "attendance": "44 personnes",
      "time": "18h50 – 19 h40",
      "text": "Esaïe 45 :24 - 25",
      "dateLabel": "4 mai 2012",
      "iso": "2012-05-04"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "24. En l’Eternel seul, qui m’a parlé, résident le salut et la force, vers lui reviendront, couvert de honte, tous ceux qui s’étaient emportés contre lui ;",
        "25. En l’Eternel seront justifiés et glorifiés tous les descendants d’Israël."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Toutes ces paroles ont été prononcées par le Prophète Isaïe, à l’intention des peuples d’Israël. Aujourd’hui, c’est moi qui vous le transmets.",
        "En effet, toute personne qui veut avoir le salut, la force et la victoire, n’a qu’à trouver l’Eternel et pas un autre.",
        "Toute personne qui a un besoin du salut sur tout le plan n’a qu’à trouver seulement l’Eternel.",
        "Je suis le seul qui ai écouté la voix de l’Eternel parmi vous tous, car c’est à moi que l’Eternel a parlé et celui en qui résident le salut, la force et la victoire.",
        "Ceux qui abandonnent ou fuient l’Eternel finissent par rentrer chez lui avec honte.",
        "Cet enseignement est gratuit. Toute personne qui veut être sauvé, même pour aller au ciel, n’a qu’à chercher l’Eternel. Il resoud tous les problèmes de ceux qui le cherche. Il guéri toutes leurs maladies et les protège, dans toutes les circonstances.",
        "Aller ailleurs, c’est se tromper comme dit Isaïe 43 : 10 – 11, « Vous, vous êtes mes témoins, dit l’Eternel, et le serviteur choisi par moi pour reconnaitre, pour croire en moi et être convaincu que je suis ; qu’avant moi, nul Dieu n’a existé, et qu’après moi, il n’y en aura point. C’est moi, moi, l’Eternel, et en dehors de moi il n’est point de sauveur ». Allez ailleurs c’est une perte.",
        "Ainsi, invoquez l’Eternel, il vous sauvera. Je viens de totaliser 67 ans de vie sacerdotale. Si ce n’était pas avec lui, je serai déjà mort. Je vous invite à le chercher car c’est à lui que se trouve le salut, la victoire et la force."
       ]
      }
     ],
     "id": "predication-11"
    }
   ]
  },
  {
   "id": "matadi",
   "name": "Matadi",
   "sermons": [
    {
     "meta": {
      "place": "Paroisse de Minkondo (Matadi)",
      "occasion": "Réception du Prophète",
      "attendance": "1300 personnes",
      "time": "18h30 – 22 h00",
      "text": "Jérémie 17 : 13 - 14",
      "dateLabel": "5 mai 2012",
      "iso": "2012-05-05"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "9. O espérance d’Israël, Eternel, tous ceux qui te délais sert seront confondus ! oui, ceux qui tiennent éloigné de moi seront inscrit sur la poussière, car ils ont abandonné la source d’eau."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Israël fait une déclaration à l’Eternel en ces termes : «  L’Eternel est mon espérance, tous ceux qui s’éloignent de toi seront confus ».",
        "A cela, l’Eternel lui-même ajoute ceci : «  oui, ceux qui ne de laissent, leur noms seront inscrits sur la terre parce qu’ils ont abandonné la source d’eau vive l’Eternel ». On ne verra jamais leurs noms dans le livre de la vie.",
        "Dans ces détailles, il s’agit des conséquences fixées par l’Eternel à l’endroit de toute personne qui se mettra à s’éloigner de lui.",
        "En effet, écrire un nom par terre c’est un danger parce que la pluie, les piétons, le vent et autres choses effaceront ce nom obligatoirement.",
        "Quand l’Eternel inscrit le nom d’une personne par terre ce qu’il l’efface dans son cœur. Cette personne sera sans protection devine et il sera exclusivement oublié dans la mémoire de l’Eternel.",
        "Israël a compris cela. C’est la raison pour la quelle il a pris l’Eternel comme son espérance, sa joie, son bonheur et son salut.",
        "A notre tour, nous devons avoir notre espérance à l’Eternel. Moi par exemple, j’ai mon grand père MAKUNDA ou MANEKA mon père. Ce n’est pas à eux que je dois espérer si j’ai un problème. C’est très grave si je fais cela, je deviendrai comme une personne qui n’existe pas. Je dois espérer à l’Eternel qui est la source de vie de toutes les créatures.",
        "Nous devons être sages, moi je suis un instructeur qui vous apprend qu’il ne faut jamais être éloigné de l’Eternel. Moi, mon espérance c’est l’Eternel.",
        "Je ne peux jamais être éloigné de lui d’ailleurs, un seul nom qui doit demeurer dans mon cœur jusqu’à ma mort c’est celui de l’Eternel. Je ne peux jamais accepter que mon nom soit inscrit dans la poussière. Et je suis très heureux de rester dans cette position.",
        "Ce bon si l’Eternel est votre salut. Il vous guérira de toute maladie et vous sauvera dans tous les problèmes.",
        "Ce conseil est précieux et gratuit, qui n’a aucun prix. C’est vraiment une grâce. En toute vérité, je ne vous trompe pas. C’est la Bible qui dit cela mais pas moi. Prenez-lui comme votre sauveur.",
        "Ainsi, prenez l’Eternel comme votre espérance. Qu’il soit l’espoir de l’EBNM."
       ]
      }
     ],
     "id": "predication-12"
    },
    {
     "meta": {
      "place": "Paroisse de Minkondo (Matadi)",
      "occasion": "Réception du Prophète",
      "attendance": "2.536 âmes",
      "time": "12h-16h",
      "text": "Deut 29 : 9 – 12",
      "dateLabel": "6 mai 2012",
      "iso": "2012-05-06"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Moïse a rassemblé tous les peuples d’Israël de diverses catégories pour leurs donner les paroles ci-après : « Vous êtes tous placés aujourd’hui devant l’Eternel, le Dieu invisible, mais présent partout ».",
        "Votre plus grande préoccupation est celle d’entrer dans l’Alliance de l’Eternel afin de devenir une nation très élevées. Lui l’Eternel sera votre Dieu et vous son peuple. A travers cette Alliance, il va traiter avec vous comme il a fait à vos pères Abraham, Isaac et Jacob.",
        "En effet, l’invitation de l’Eternel à adresser à Israël constitue une grâce extraordinaire car dans cet appel, c’est lui le créateur qui veut traiter avec Israël à travers son Alliance.",
        "Cette invitation a été analysé par Israël et celui-ci a conclu par accepter docilement Exode : 14 :7.",
        "Etant le créateur, l’Eternel est libre de faire son alliance avec tout le peuple et aujourd’hui, il vous introduit vous KCCISTES dans cette alliance. Si Israël a accepté alors que dites vous KCCISTES ?",
        "L’Eternel, veut traiter avec tout KCCISTE, tout congolais à travers son Alliance. L’Eternel est disponible de nous recevoir tous dans son Alliance. Il veut rendre tout le monde, son peuple de grande valeur pour nous diriger, protéger et sauver. La seule possibilité qui est là c’est d’accepter son alliance. Il n’y a pas des frais à payer.",
        "En Israël, il n’a pas demandé des frais mais seulement la réponse positive. Ailleurs, on demande les enfants, la vie et vous même.",
        "Quand l’Eternel m’a appelé, j’ai réalisé que ce problème pesait et j’ai dit non. En réaction, l’Eternel m’a dit si tu refuses, je te tuerai.",
        "Devant cette situation, j’ai prié en disant : prend moi, mon corps, mon âme. Et à partir de ce moment c’est-à-dire en 1955, je suis entré dans son Alliance et je traite avec lui, nuit et jours. Si l’Eternel traite avec vous, il vous protègera et sera avec vous partout où vous serez.",
        "Dans l’Eglise, certains membres sont fréquents mais malheureusement, il n’aime pas entrer dans l’Alliance de l’Eternel. C’est une grande erreur car le jour où ils auront un problème, ils finiront toujours par chercher l’Eternel alors les résultats seront négatifs.",
        "En 1959, nous sommes allés en chasse dans la forêt du village de Révérend MAKITU. Papa MU MPAKA André m’amena dans cette forêt que je ne connaissais pas. Ceux qui nous ont précédé ont rencontré un buffle ayant des coups de balle et courrait en colère pour attaquer n’importe qui. Il venait juste à ma direction et on criait pour me demander de monter dans un arbre, mais malheureusement ces arbres étaient toutes grandes. Quelques minutes seulement, il s’est approché de moi j’ai tiré 3 fois mais le résultat était négatif. Le buffle tremblait en colère à quelque mètre de moi. Puis il retourna vite.",
        "Devant cette situation, si je n’étais pas dans l’Alliance de l’Eternel, je serai déjà mort. L’Eternel sait garder ceux qui sont dans son Alliance. C’est bon d’entrer déjà dans son Alliance car le temps est court."
       ]
      },
      {
       "title": "Mot du Prophète",
       "kind": "text",
       "paras": [
        "C’est une erreur de dire que l’Eternel a envoyé le prophète DIZOLELE pour les KCCISTES. Moi, l’Eternel m’a envoyé pour l’humanité mais en commerçant d’abord par la R.D.C.",
        "Si vous êtes ici, c’est parce que l’Eternel vous a choisi pour recevoir la parole mais à côté de vous beaucoup de gens sont encore dans le noir et attendent le moment de leur appel.",
        "Je suis le prophète de l’Humanité car l’Eternel en en m’envoyant, il a vu le monde mais par la R.D.C. même l’invitation d’entrer dans l’Alliance concerne l’humanité entière."
       ]
      }
     ],
     "id": "predication-14"
    },
    {
     "meta": {
      "place": "Résidence du Prophète à Matadi",
      "occasion": "Réunion des serviteurs de Matadi",
      "attendance": "44 personnes",
      "time": "22h – 01 h30",
      "text": "Esaïe 49 : 5 - 6",
      "dateLabel": "7 mai 2012",
      "iso": "2012-05-07"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Dans ce texte, on parle de la personne qui est construite dans le ventre de sa mère pour être serviteur de l’Eternel.",
        "Cette personne c’est Israël sa valeur, son prix n’est connu que de l’Eternel. Pour le moment, c’est nous tous qui sommes construit à partir de ventres de nos mères pour devenir serviteurs de l’Eternel, c’est-à-dire, l’Eternel nous a déjà préparé quand nous étions encore de les ventres de nos mères.",
        "Même si dans ce monde, nous n’avons pas de valeur mais aux yeux de l’Eternel, nous coutons très chers.",
        "Pour être choisi serviteur de l’Eternel, ce n’est pas peu de chose. c’est trop pesant car l’Eternel est trop grand.",
        "Le plus grand travail c’est d’élever devant l’Eternel sa tribu qui est dispersée partout. Je viens déjà de rassembler et élever cette tribu. Ce n’est pas seulement à moi ce travail mais à vous également.",
        "Israël est lumière. Tout KCCISTES aussi de vient lumière parce que l’Eternel vous a montré sa vérité, son secret et son salut. Le nom de l’Eternel n’est plus connu et les gens ignorent que par lui on doit être sauvé.",
        "Le serviteur est un instrument du salut jusqu’aux confis de la c’est vraiment un grand travail. Toute personne qui prétend transmettre la lumière ne doit professer le nom de l’Eternel car c’est lui qui est lumière et vérité.",
        "C’est une grande erreur de prétendre faire le travail de l’Eternel sans présenter son nom. Etre instrument de l’Eternel c’est une mission très chère. Si l’on est choisi pour ce travail, et que l’on est sage, on se mettra à se mettre à tout moment a genoux pour demander à l’Eternel la réussite à ce travail afin que l’on arrive jusqu’au bout.",
        "Notre valeur réside dans le choix ce pourquoi, nous devons être forts. Ce travail n’est pas une petite chose car nous connaissons sont début et son développement. Alors je vous assure que ça sera grand encore.",
        "De 1955 à 2003, c’était seulement un travail de réassemblage. Mais à part de 2003, nous sommes entrés vraiment dans le travail de proclamer le nom de l’Eternel.",
        "Ne blaguons pas, soyons plus responsables. Mon prix est auprès de l’Eternel mon Dieu. Ce travail pèse beaucoup. Il ne faut pas y voir les intérêts matériels. Là nous ne saurons pas. Il faut plus se confier à l’Eternel et pour le reste il vous récompensera.",
        "Ainsi, sans hypocrisie, soyons forts pour apporter la lumière jusqu’aux confins de la terre afin de bénéficier le vraie salaire auprès de l’Eternel."
       ]
      }
     ],
     "id": "predication-13"
    },
    {
     "meta": {
      "place": "Paroisse de Minkondo (Matadi)",
      "occasion": "Culte d’aurevoir",
      "attendance": "1.427 âmes",
      "time": "12h-17h",
      "text": "Jérémie 26 : 1 - 6",
      "dateLabel": "8 mai 2012",
      "iso": "2012-05-08"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "La parole de l’Eternel par le prophète Jérémie s’adresse au peuple d’Israël qui se prosterner dans la maison de l’Eternel.",
        "En effet, aller adorer l’Eternel et se prosterner devant lui dans l’Eglise c’est un comportement qui l’honore.",
        "Mais, ce qui est mieux c’est d’afficher une bonne conduite. En Mettant en pratique tout ce que prêchent les prophètes de l’Eternel.",
        "Israël allait à l’Eglise pour se prosterner devant l’Eternel sans penser à sa conversion. L’Eternel en réalité n’avait pas apprécié cette façon de faire. C’est ainsi qu’il a finalement détruit cette nation.",
        "L’Eternel c’est un Dieu très Saint. Il n’agit pas brutalement mais toute fois il averti d’abord en commençant par envoyer ces prophètes.",
        "Ici, il envoie le prophète pour tout dire au peuple en ce qui concerne la doctrine de l’Eternel sans retrancher ou ajouter quelque chose.",
        "Il veut voir si peut-être, on peut trouver quelques personnes dociles qui peuvent changer des conduites pour obéir à cette doctrine.",
        "Au cas où, il ne trouvera personne pour obéir cette doctrine, une sanction sévère sera mise à leur disposition.",
        "Tout ceci constitue à juste titre, le message que l’Eternel a donné à Jérémie pour transmettre à Israël.",
        "Cette parole constitue bien la loi qu’il a promulgué publiquement d’avant le peuple et pour laquelle il continue sans cesse à envoyer ces prophètes c’est bien le parole du salut.",
        "Aujourd’hui, l’Eternel m’envoie parmi vous pour la même mission. C’est dans cette perspective qu’à mon tour, je vous demande d’écouter ma doctrine mieux les dix commandements qui constituent la parole de l’Eternel comme je l’ai dit précédemment. Il s’agit de la parole du salut tel qu’il est écrit dans Exode 34.27-28.",
        "Nous avons tous la chance de recevoir la parole de l’Eternel, nous ne pouvons pas nous hasarder de remplacer cette parole par une autre doctrine. L’Eternel n’a pas prévus une autre doctrine à coté de la sienne. Toute doctrine et parole qui n’émane pas de l’Eternel doit être rejeté.",
        "Pour être épargné de la colère de l’Eternel, il est nécessaire d’entrer dans sa parole ou son alliance. C’est bon de se retrouver dans le groupe de ceux qui écouter la voie de l’Eternel.",
        "Si moi DIZOLELE, je vous donne une doctrine qui n’est pas de l’Eternel, après analyse, je vous demande de me quitter.",
        "L’Eternel savait bien que dans ce monde, il y aura plusieurs doctrines, sataniques. C’est pourquoi il insiste à son peuple de suivre sa propre doctrine qu’il a fixée à travers ses prophètes au mont-Horeb.",
        "Que toute personne qui a sa doctrine, vienne me la prouver si celle -ci vient de l’Eternel. Etant proches de l’Eternel, à travers sa doctrine, je vous demande d’obéir à cette parole. C’est une grande joie d’être dans cet état.",
        "Ainsi, mes enfants, je vous demande d’écouter la doctrine de l’Eternel que je vous donne pour que vous soyez sauvés en tout."
       ]
      },
      {
       "title": "Mot de la fin",
       "kind": "text",
       "paras": [
        "Je suis très content de voir que tout vient de se passer très bien. Je sais que l’Eternel est également d’accord.",
        "Moïse a fait 40 jours et 40 nuits avec l’Eternel sans manger ni boire et il n’a rien senti. Spirituellement c’est possible mais charnellement non.",
        "Je vous promets que je veux encore Vous revenir. Veuillez prier pour moi enfin que l’Eternel puisse m’aider à travailler encore car le travail devient trop grand.",
        "Toutefois, si un visiteur vient faire un séjour chez vous, vous devez le recevoir une fois seulement mais pas tout le jour comme vous venez de faire pour moi.",
        "Je réalise que la doctrine prend une grande place et l’Eternel également prend place dans vos cœurs. La compréhension se développe beaucoup dans l’Eglise. L’Eternel est avec nous.",
        "Le culte est un lieu très saint plus tard, nous développerons le grand sujet de notre doctrine qui est la sainteté du culte. Fermer le téléphone n’est pas respecter la sainteté du culte. Toute personne connait que si l’on entre dans l’Eglise on ferme les appareils.",
        "La cérémonie d’actes d’alliance prouve que nous sommes dans l’alliance de l’Eternel. C’est un signe de notre attachement dans cette alliance. Ce n’est pas bon de manquer dans ce culte chaque fois que l’on fixe un programme de ce culte. Faites vous disponibles pour y assister."
       ]
      }
     ],
     "id": "predication-15"
    }
   ]
  },
  {
   "id": "boma",
   "name": "Boma",
   "sermons": [
    {
     "meta": {
      "place": "Boma (maison du prédicateur KUMBU)",
      "occasion": "Culte d’aurevoir",
      "attendance": "400 âmes",
      "time": "19h-22h",
      "text": "Exode 14.26-31",
      "dateLabel": "10 mai 2012",
      "iso": "2012-05-10"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Israël en servitude en Egypte pendant 430 ans fut libéré par l’Eternel à travers Moïse. Israël, a lui-même vu comment l’Eternel lui a libéré entre les mains de Pharaon, comment les Egyptiens furent noyés dans la mère rouge. Au fond la couleur n’est pas rouge, on dit rouge parce que l’on y trouva des sangs des Egyptiens qui y étaient noyés. La traversée était impossible mais vraie. Israël était sauvé saint et sauf.",
        "En réalité, on ne s’amuse pas avec le mot salut. Au départ, il doutait de l’Eternel et de son prophète mais avec cet événement Israël vit la grande puissance de l’Eternel, il a fini par croire immédiatement à l’Eternel à son prophète Moïse.",
        "En ce qui nous concerne, il est mieux aujourd’hui de faire une étude comparative de là où nous étions et de là où nous sommes.",
        "A travers l’Oracle, nous venons de saisir la main de l’Eternel, au départ ou boudait mais aujourd’hui, nous sommes joyeux de cette nouvelle car nous avons vu le salut de l’Eternel. Ainsi, croyons à l’Eternel et à son prophète afin bénéficier du salut éternel."
       ]
      }
     ],
     "id": "predication-16"
    },
    {
     "meta": {
      "place": "Paroisse de Kiveve (Boma)",
      "occasion": "Culte de réception du Prophète",
      "attendance": "1300 âmes",
      "time": "20h-23h00",
      "text": "Exode 15.1-12",
      "dateLabel": "11 mai 2012",
      "iso": "2012-05-11"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "C’est vrai, l’Eternel est notre Dieu. Il est grand et en lui réside le salut, la victoire et la gloire. Ce texte n’est qu’un cantique de joie qu’avait chanté Israël après avoir senti le salut que l’Eternel leur avait accordé.",
        "En effet, l’Eternel était venu sauver Israël dans sa servitude en Egypte. Dans ce cantique, le plus grand aspect que nous pouvons dégagé c’est la reconnaissance.",
        "Israël, a reconnu la grâce que l’Eternel a faite en sa faveur en lui accordant le salut. De là, Israël a réalisé que c’est l’Eternel qui est Dieu au dessus de tous les dieux car il a fait tombé les hommes forts et colériques dans l’eau.",
        "Sous l’influence des Egyptiens, Israël a eu beaucoup des dieux mais il a vu le véritable qui est l’Eternel.",
        "Devant cette réalité, Israël était obligé de déclarer la puissance et l’unicité de Dieu. Avec beaucoup de joie, il chantait pour l’Eternel dans le souci d’exprimer qu’en dépit de plusieurs Dieu, il a compris que le Dieu de Moïse est le véritable. Il mérité la gloire.",
        "En ce qui nous concerne, c’est vraie au départ, nous étions contents du salut mais malheureusement ce salut était mal présenté.",
        "Aujourd’hui, l’Eternel vient de nous sauver à travers l’Oracle. C’est une grande bénédiction. Nous également à notre tous, par la bonté de l’Eternel, nous avons son salut. Sans lui, nous serions toujours dans la servitude des idoles. C’est pourquoi, s’il est temps c’est mieux d’aller dans le temple de l’Eternel pour le louer. Il est le Dieu de tous les peuples. Il sauve dans sa bonté. Cette lumière, nous devons la donner à nos enfants.",
        "Ainsi, comme l’Eternel nous a sauvé, à travers son Oracle, nous devons à l’exemple d’Israël, par des cantiques, et nos actes manifester notre joie en le reconnaissant comme l’unique sauver.",
        "Dans les nuits du 12-13 Mars, nous étions écartés de ce Dieu, il nous a dirigé jusqu’à nous nous ramener encore vers lui. Voilà donc, il est clair que la dimension de sa bonté pour nous sauver est grande. Et en retours, nous lui devons exclusivement des reconnaissances à travers nos actes et nos cantiques."
       ]
      }
     ],
     "id": "predication-17"
    },
    {
     "meta": {
      "place": "Paroisse de Kabondo (Boma)",
      "occasion": "Réception du Prophète",
      "attendance": "2000 âmes",
      "time": "12h-17h",
      "text": "Deut 6 :4-5",
      "dateLabel": "12 mai 2012",
      "iso": "2012-05-12"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "« Ecoute, Israël, l’Eternel est notre Dieu, l’Eternel est un ».",
        "Cette expression fait allusion à la recommandation de l’Eternel à Israël, en particulier et l’humanité entière en générale.",
        "La parole de l’Eternel qui est sainte présente l’Eternel comme notre Dieu. Dans notre côté, l’oracle du 15 Avril 2003 à travers le prophète nous rassure que l’Eternel est venu se présenter en nous comme notre Dieu. Et nous l’avons accepté comme tel.",
        "Cette considération de l’Eternel comme notre Dieu nous oblige donc à croire qu’il est un. Lui-même l’Eternel s’est présenté comme l’unique Dieu.",
        "En effet Israël avait beaucoup des dieux mais l’Eternel veut ici donner une précision sur le nombre. Il veut souligner qu’il n’y a pas un certain nombre.",
        "Il s’agit donc d’un seul Dieu qui a crée le ciel et la terre, les anges, les hommes et les animaux. Il est le Dieu de toutes les nations de la terre. Le seul créateur de tout ce qui existe visible et invisible.",
        "On ne peut pas le partager pour autant des morceaux par en faire plusieurs et d’ailleurs il est indivisible.",
        "Tu aimeras l’Eternel ton Dieu de tout ton cœur et de toute ton âme. Cette recommandation est également indispensable. Comme nous venons de le dire que l’Eternel est un, on ne peut jamais lui partager. S’il faut le faire alors il faut partager aussi l’amour à ces dieux.",
        "On peut bien le faire mais on aimera plus un pour haïr l’autre. L’Eternel comme il ne veut pas cela, tout notre cœur ne doit être donné qu’à Dieu. Étant un, tout notre cœur, tout notre amour ne doit être donné qu’à lui. Il n’a pas besoin des rivales.",
        "Dans Deut : 6.13-15. Il est écrit : « Ici, l’Eternel se proclame comme un Dieu jaloux. Il peut t’éliminer sur la terre à cause de ce comportement de mélange de divinité ».",
        "L’Eternel est un et restera un. Ce n’est pas bon de prendre un à côté de lui, il restera seulement un. Ajouter devant lui un autre c’est chercher des multiples problèmes. Ne mettez pas un autre.",
        "A côté de lui, ne faut pas ajouter, ni aimer, un autre Dieu, ni une personne, un esprit, ni même une chose par l’égaler. Vous risquerez de déranger les relations de l’alliance. Seul l’Eternel que tu dois adorer et prier. C’est en son nom seulement que tu dois jurer. Isaïe 45.4.",
        "Dans le Prov. 30.4-6 : «  l’Eternel prend toutes les eaux comme un homme prend le mentaux de chemise sa parole est parfait, il n’a pas de fils. On ne lui ajoute pas un enfant sinon l’on dira de mensonge ». A la parole de l’Eternel, on n’ajoute rien.",
        "Il n’est pas là pour être additionner. D’ailleurs si tu le fais tu ne sauras pas l’aimer de tout ton cœur et de tout ton âme. C’est l’Eternel que tu dois servir, adorer et prier.",
        "Faire le contraire c’est déranger son salut alors c’est très dangereux. La 1ʳᵉ Onction est conforme à la parole de l’Eternel. Même dans la mort, dans la souffrance prononcer le nom de l’Eternel car il est un il t’aidera. Qu’il reste ton salut. Car le salut se trouve à tous ceux qui s’abritent en lui. Dites cette parole à tout le monde."
       ]
      },
      {
       "title": "Mot de la fin",
       "kind": "text",
       "paras": [
        "Mon passage m’apprend que réellement vous avez compris. Et je vous demande de continuer à comprendre comme vous venez de faire.",
        "Si une créature n’arrive pas à connaître son créateur, en réalité, il doit se sentir mal alaise dans son cœur.",
        "L’Eternel est grand s’il était comme les autres, il devrait exterminer tous les êtres. Mais il continue à nous donner la vie, la nourriture et il met tout à notre disposition.",
        "Comme il dit dans Osée 11.9. Le message que je vous ai apporté est entré et accepté et continue à entrer qu’il soit glorifié. C’est une joie pour moi.",
        "Nos temples deviennent partout trop petits parce que ceux qui acceptent le message deviennent très nombreux.",
        "Vous n’avez pas rejeté l’Eternel je ne viendrai pas comme un voleur, c’est une mauvaise qualification, l’Eternel averti toujours. Je reviendrai et je vous tiendrai informé.",
        "Nous serons parmi les 7000 qui seront sauvé en Israël : Ir.19 :18, il s’agit là de ceux qui m’adorent ni s’a genouant devant balle."
       ]
      }
     ],
     "id": "predication-19"
    }
   ]
  },
  {
   "id": "nlemba",
   "name": "Nlemba",
   "sermons": [
    {
     "meta": {
      "place": "Paroisse de Nlemba",
      "occasion": "Réception du Prophète",
      "attendance": "1250 âmes",
      "time": "19h-6h",
      "text": "Isaïe 43 :9-11",
      "dateLabel": "12 mai 2012",
      "iso": "2012-05-12"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Jusqu’à présent, il y a quelque chose de caché que le monde n’a pas encore découvert et dit. Et l’on cherche, qui peut la dire et la témoigner parce que c’est indispensable.",
        "En effet, l’Eternel demande à toutes les nations ensemble avec leur témoins, de se réunir pour analyser les événements du passé et jadis pour affirmer que c’est vrai cette chose cachée. Malheureusement, personne n’a de couvert cette vérité.",
        "Cependant, l’Eternel prend Israël comme témoins. Il le choisi et en le considérant comme son serviteur. Il ne veut pas prendre tout le monde.",
        "Il lui confie la tâche de lui témoigner à l’humanité et dit : « Je te choisi pour connaitre que c’est moi l’Eternel. Depuis les origines, il n’y avait pas de Dieu et il n’en aura pas un autre que moi. C’est moi l’Eternel le sauveur et il n’en aura point d’autre ». Israël, tu es choisi pour dire cela",
        "C’est cette vérité qui est cachée par Satan. Cette vérité doit être connue par tout homme. C’est une sécurité de la vie pour la personne qui vient de le connaître.",
        "Toute personne ignorante de cette vérité est vivement exposée à l’idolâtrie. Pour tout KCCISTE, l’Eternel a mis tout à sa disposition, et tu dois arriver à le reconnaître car l’homme malgré cela, n’arrive pas à reconnaitre l’Eternel comme l’unique Dieu.",
        "KCCISTE tu dois reconnaitre que c’est l’Eternel qui est le seul Dieu. Le seul sauveur. C’est normal pour toute créature de le reconnaitre comme tel. Si tu veux être sauvé il faut reconnaître l’Eternel et enseignera cela aussi à tes enfants.",
        "L’Oracle nous a permis de connaitre l’Eternel. Au cas contraire, nous aurions été dans l’obscurité. KCCISTE, tu ne dois pas avoir honte de prêcher l’Eternel. Ce message doit être transmis à l’humanité. Tout congolais doit le connaitre et doit aller en avant pour présenter l’Eternel.",
        "Ainsi, étant choisi par l’Eternel pour cette mission, ne reculons pas, allons en avant et n’ayons pas peur."
       ]
      },
      {
       "title": "Mot de la fin",
       "kind": "text",
       "paras": [
        "Nombreux disent que DIZOLELE s’est fait Dieu. C’est une façon seulement de saboter. En réalité, ils savent bien que je ne suis pas fait Dieu.",
        "Heureusement, l’Eternel vous a soutenu à l’égard de toutes ces paroles décourageantes. Au contraire, DIZOLELE est venu apprendre aux gens la connaissance de l’Eternel, Dieu créateur, du ciel, de la terre et de tout ce qui s’y trouve.",
        "Le temps étant très difficile, grâce à l’Eternel, nous sommes quand même arrivés à ce point. Aujourd’hui, le nom de l’Eternel est glorifiés, les gens acceptent et croient. Cette confusion sera balayée, je ne suis pas Dieu.",
        "La connaissance de l’Eternel aide la vie Spirituelle et matérielle. Je sais que je deviens vieux, c’est une bénédiction mais prions afin que l’Eternel me donne le temps de travailler.",
        "La sortie de ce message a occasionné le départ des beaucoup des gens. D’ailleurs, certains ont voulu profiter pour détruire ce travail mais l’Eternel les a tous confondus et le travail a évolué. Partout ou je suis passé, la situation est terrible ceci prouve à juste titre que ce travail vient de l’Eternel."
       ]
      }
     ],
     "id": "predication-18"
    }
   ]
  }
 ],
 "totalAttendance": 13572
};
