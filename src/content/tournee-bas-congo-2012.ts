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
  "En 2012, le 32ᵉ anniversaire de l’obtention de la personnalité civile de l’Église Bon Nouveau Message (KCC) a été une année de grâce et de bénédiction au sein de notre Église.",
  "Pour exprimer à l’Éternel ses actions de grâce, le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac, en accord avec le Comité exécutif de l’Église, a tenu à fêter cet anniversaire avec ses enfants de la province du Bas-Congo, précisément à Mbanza-Ngungu, en passant d’abord par la paroisse d’Inkisi.",
  "Alors qu’il avait quitté Kinshasa le 28 avril 2012, un accident s’est produit à son domicile : sous la pression d’une forte pluie, la charpente s’est déplacée.",
  "Heureusement, personne n’a été victime de cette catastrophe, car l’Éternel est intervenu pour protéger son serviteur, le Prophète DIZOLELE, contre tous ces dangers.",
  "La réparation de cette charpente n’a pas permis au Prophète de retourner à Kinshasa. Il en a donc profité pour nourrir ses enfants spirituellement en attendant la fin des travaux.",
  "Ce séjour lui a permis de visiter successivement les paroisses de Lukala et de Kimpese, la sous-section de Kiemba (Kimpese), la section de Kenge, la ville de Matadi, celle de Boma ainsi que la paroisse de Nlemba.",
  "Ci-après sont présentées toutes les prédications que le Chef spirituel a prononcées dans chacune des paroisses citées ci-dessus. À la fin, une conclusion clôt l’ensemble de ces récits."
 ],
 "conclusion": [
  "Pendant la semaine des fêtes de la personnalité civile, le Chef spirituel a pris le temps de nous montrer que c’est l’Éternel Dieu lui-même, et non un autre, qui nous a permis d’obtenir la personnalité civile.",
  "Il a tenu à souligner que lui-même, le Prophète, n’a consulté ni devin ni autre dieu pour obtenir la personnalité civile, et qu’aucun féticheur ne peut lever le doigt pour dire que le Prophète DIZOLELE l’a consulté pour l’obtenir.",
  "Par ailleurs, il a clairement expliqué à tous que c’est l’Éternel lui-même qui, depuis longtemps, avait commencé à traiter avec lui pour que nous puissions obtenir la personnalité civile.",
  "Indispensable, la personnalité civile a mis fin à tous les outrages, les injures et les sabotages que l’Église avait subis à cause de sa prière. Le 30 avril 1980, l’EBNM a obtenu, sur le plan politique, la liberté de prier l’Éternel Dieu. Cette personnalité civile a également permis l’expansion de l’Église aux quatre coins du monde.",
  "Le Prophète a souligné que, sans l’intervention de l’Éternel, il aurait été impossible de recevoir cette liberté.",
  "D’autre part, l’Éternel a pensé à nous libérer sur le plan spirituel par l’Oracle du 15 avril 2003. L’Éternel a ouvert la voie qui conduit à la découverte de la loi de l’Éternel Dieu, laquelle nous introduit paisiblement dans l’Alliance qu’il a conclue sur l’Horeb pour l’humanité entière.",
  "C’est dans ce cadre que le Prophète a exhorté ses enfants à entrer tous dans l’Alliance de l’Éternel Dieu. C’est une invitation qui concerne toute l’humanité, enracinée dans de multiples alliances de Satan qui n’accordent aux peuples que des cadeaux empoisonnés.",
  "L’Alliance de l’Éternel nous accorde toutes les bonnes choses sur la terre, les bénédictions ainsi que la vie éternelle.",
  "Cette Alliance nous oblige à reconnaître l’Éternel comme l’unique Dieu, de qui découle toute vie. Il doit être adoré et glorifié par toute l’humanité.",
  "Ainsi, ce voyage très bénéfique a réveillé chez tous les KCCistes le désir de s’attacher définitivement à l’Éternel, d’entrer et de demeurer dans son Alliance."
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
      "attendance": "300 personnes",
      "time": "17 h – 20 h 30",
      "text": "Exode 20 : 1-4",
      "dateLabel": "28 avril 2012",
      "iso": "2012-04-28"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "1. Alors Dieu prononça toutes ces paroles, savoir :",
        "2. « Je suis l’Éternel, ton Dieu, qui t’ai fait sortir du pays d’Égypte, d’une maison d’esclavage.",
        "3. Tu n’auras point d’autre dieu que moi.",
        "4. Tu ne te feras point d’idole, ni une image quelconque de ce qui est en haut dans le ciel, ou en bas sur la terre, ou dans les eaux au-dessous de la terre. »"
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Dans ce texte, il s’agit de l’histoire de la sortie d’Israël de la servitude en Égypte. En effet, après cette sortie, l’Éternel promulgua à l’intention de ce peuple la loi que nous venons de lire.",
        "Humainement parlant, il est curieux de constater que c’est bien le prophète Moïse qui a libéré et sauvé Israël de la servitude en Égypte. D’ailleurs, dans sa conception, Israël ne considérait que Moïse comme son sauveur et son libérateur.",
        "Mais, de toute évidence, c’est l’Éternel, l’Invisible, qui, par sa grande puissance, a sauvé Israël par l’intermédiaire de Moïse.",
        "Sans l’Éternel, Moïse ne pouvait rien faire, et Israël serait resté dans son état de servitude.",
        "Étant son serviteur, Moïse savait bien que c’est l’Éternel qui est le Sauveur, car il traitait avec lui seul pour libérer ce peuple. C’était un secret dont il n’avait ni l’autorité ni l’autorisation de parler, parce que le moment n’était pas encore venu.",
        "Au temps marqué, l’Éternel a lui-même proclamé que c’est lui qui a fait sortir Israël de la maison de servitude en Égypte, comme nous venons de le dire ci-dessus.",
        "Ce message était nécessaire pour Israël parce que, d’un côté, il avait perdu son histoire à cause de l’influence idolâtrique de l’Égypte : on lui imposait des dieux étrangers à côté du Dieu de ses pères Abraham, Isaac et Jacob.",
        "De l’autre côté, Israël vivait avec beaucoup de dieux en Égypte, et même au désert lors de sa sortie. Moïse le savait, mais il lui manquait l’autorisation de reprocher cette pratique.",
        "Quand l’Éternel s’est présenté comme le Sauveur d’Israël, celui-ci en a été heureux et a rapidement accepté cette Parole. La preuve en est qu’aujourd’hui encore, en Israël, l’Éternel reste l’unique Dieu.",
        "Par ailleurs, pour réussir cette œuvre de libération, Moïse est resté en contact assidu avec l’Éternel. Il connaissait parfois le découragement, mais l’Éternel l’encourageait toujours.",
        "En ce qui nous concerne, le problème de la personnalité civile de l’EBNM nous renvoie à cette recommandation qu’avait reçue Israël.",
        "Le 30 avril 1980 est, pour l’EBNM, la date à laquelle nous avons reçu la liberté de servir l’Éternel. C’est pourquoi nous sommes en fête : pour nous souvenir de l’intervention que l’Éternel a faite en notre faveur.",
        "Effectivement, de 1955 au 30 avril 1980, sur le plan politique, l’Église n’avait pas le droit de servir l’Éternel. N’importe qui pouvait venir nous injurier ou nous saboter, et comme nous n’avions pas la personnalité civile, nous n’avions même pas la possibilité de nous défendre contre ces outrages.",
        "Dans notre pays, c’était une période où le droit de célébrer un culte en public était dur à obtenir : il n’était pas facile de prier librement. Nous étions soumis à de multiples arrestations. C’est pourquoi il fallait nécessairement une grande puissance invisible pour agir afin que nous puissions avoir cette personnalité civile. Cette puissance, c’est l’Éternel Dieu lui-même.",
        "En toute vérité, malgré ces difficultés, je ne suis jamais allé consulter les morts, les marabouts, les féticheurs ou les magiciens pour obtenir la personnalité civile.",
        "Et aucun magicien, féticheur ou marabout ne peut lever le doigt pour dire que c’est lui que je suis allé consulter pour obtenir la personnalité civile.",
        "Depuis Forakam, j’ai mon Dieu, l’Éternel, et je traite avec lui : je le prie, je m’agenouille devant lui. Il m’encourage, me fait des promesses et réalise toutes ses promesses. Chaque fois qu’il annonce un événement, je l’annonce, et les résultats sont là.",
        "Un jour, devant les difficultés de ce problème, il m’a promis qu’il m’aiderait, et il l’a fait. Évidemment, dans ce cas, il n’avait pas encore donné la date de réalisation de cette promesse. Curieusement, certains serviteurs de Matadi ont réagi en voulant chercher la cause de notre échec à la sortie de la première liste des Églises retenues pour la personnalité civile. Je leur ai demandé de rentrer, en leur disant que l’Éternel n’avait pas donné la date à laquelle il m’aiderait.",
        "Le 30 avril 1980, il a réalisé sa promesse. L’Éternel nous a libérés à cette date sur le plan politique, comme il l’a fait pour Israël. Par moi-même, ces résultats auraient été impossibles : c’est ce Dieu que nous devons d’abord reconnaître.",
        "De plus, il a constaté que, sur le plan spirituel, nous étions dans l’idolâtrie. Il a donné l’Oracle, qui nous ramène au texte biblique que nous avons lu ci-dessus.",
        "En effet, l’expression « Quels que soient les miracles qu’il opère, un homme ne peut être Dieu » signifie qu’il ne faut pas avoir un autre dieu à côté de l’Éternel. Cet Oracle nous ramène évidemment à la loi de l’Éternel, comme il l’a fait pour Israël.",
        "Nous devons aujourd’hui nous attacher à l’Éternel. C’est pourquoi, dans la Première Onction, on dit : « L’Éternel est notre Dieu. » Nous sommes sur une voie sûre. L’Oracle nous conduit définitivement vers l’Éternel.",
        "Ainsi, nous devons reconnaître l’Éternel, qui nous a aidés par sa force à obtenir la personnalité civile pour nous sauver sur le plan politique. Nous devons également nous attacher à l’Éternel, qui nous a sauvés spirituellement par l’Oracle."
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
      "occasion": "32ᵉ anniversaire de la reconnaissance juridique",
      "attendance": "229 personnes",
      "time": "19 h – 22 h",
      "text": "Exode 33 : 18-20",
      "dateLabel": "28 avril 2012",
      "iso": "2012-04-28"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "18. Moïse reprit : « Découvre-moi donc ta gloire ! »",
        "19. Il répondit : « C’est ma bonté tout entière que je veux dérouler à ta vue, et, toi présent, je nommerai de son vrai nom l’Éternel ; alors je ferai grâce à qui je devrai faire grâce, et je serai miséricordieux pour qui je devrai l’être. » 20. Il ajouta : « Tu ne saurais voir ma face ; car nul homme ne peut me voir et vivre. »"
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Moïse fut un prophète, un serviteur exceptionnel de l’Éternel, et aussi le tout premier messie en Israël ; on parle beaucoup de lui partout où l’on prêche le nom de l’Éternel.",
        "L’Éternel Dieu se manifestait fréquemment à lui, et l’on dit qu’« il lui parlait face à face ». En réalité, il est difficile d’expliquer cela, car c’est impossible. L’Éternel était le Maître de Moïse, et Moïse son serviteur.",
        "Dans toutes les manifestations de l’Éternel à son égard, Moïse se rendit compte qu’il lui manquait quelque chose de très important : il tenait à voir l’Éternel.",
        "En disant à l’Éternel « Montre-moi ta gloire », Moïse cherchait à voir et à connaître comment est l’Éternel, d’autant plus qu’ils collaboraient depuis très longtemps. Il lui arrivait de passer auprès de l’Éternel quarante jours et quarante nuits sans manger ni boire.",
        "En réponse, l’Éternel lui dit : « Ce que tu demandes est impossible, mais je te ferai voir ma bonté et mon vrai nom, car personne ne peut me voir et vivre. Je suis invisible ; les autres dieux peuvent être mis dans la poche et transportés, mais pas moi. »",
        "L’homme croit davantage aux dieux visibles et moins à l’Éternel, parce qu’il ne le voit pas ; or c’est lui le vrai Dieu. Connaître son nom est une grâce, une chance, un privilège et aussi une grande bénédiction qui n’est pas donnée à tout le monde.",
        "L’Éternel n’est pas un Dieu que l’on peut assimiler ou égaler à un autre. Il n’est pas non plus un esprit, ni un vent, ni un ange. C’est un Dieu merveilleux que l’on ne peut jamais comparer à aucune de ses créatures visibles ou invisibles. Il est partout et connaît tout. On ne plaisante jamais avec lui. Il ne sert à rien de faire des efforts pour le voir.",
        "L’Éternel a fait voir sa bonté à Moïse. C’est un Dieu à part : c’est lui, notre Dieu. Il me dirige et m’a conduit durant les 57 ans que je viens de passer avec lui. Son nom, c’est l’Éternel.",
        "En ce qui nous concerne, nous devons seulement nous attacher à lui, qui nous donne tout. Il nous sauvera par sa bonté."
       ]
      },
      {
       "title": "Exposé dans la résidence",
       "kind": "text",
       "paras": [
        "L’Apocalypse 5 : 6 dit : « Et je vis, au milieu du trône et des quatre êtres vivants et au milieu des vieillards, un agneau qui était là comme immolé. Il avait sept cornes et sept yeux, qui sont les sept esprits de Dieu envoyés par toute la terre. »",
        "Les textes chrétiens nous parlent ici d’un dieu qui a sept yeux. En réalité, l’Église chrétienne parle de trois personnes divines : le Père, le Fils et le Saint-Esprit. Malheureusement, elle ne nous a pas présenté les quatre esprits restants.",
        "La vérité est que l’Éternel Dieu n’a pas sept esprits. Il n’a qu’un seul Esprit, comme il le dit bien dans Joël 2 : 9 : « Ils se répandent à travers la ville, franchissent les murailles, montent dans les maisons, entrent par les fenêtres comme des larrons », et dans Ésaïe 42 : 1 : « Voici mon serviteur, que je tiens par la main, mon élu, en qui mon âme se complaît ; sur lui, j’ai répandu mon esprit, pour qu’il révèle aux nations ce qui est juste. »",
        "« Je répandrai mon esprit. » Même si l’on trouve des textes qui disent le contraire, moi qui suis prophète, je ne les retiens pas. L’Éternel n’a qu’un seul Esprit. D’ailleurs, le fait de dire, dans Genèse 1, « Faisons l’homme à notre image » n’a pas sa raison d’être. Quand j’ai rédigé le Syllabus de formation apostolique, j’avais bien souligné : « Ntumua kalendi kala mpeve za zingi ko. »",
        "Étant Prophète, je suis en mesure de vous donner la lumière : personne ne peut nous faire connaître l’Éternel s’il n’y a pas été préparé. D’ailleurs, le livre des Proverbes 30 : 1-3 dit que la connaissance de Dieu ne peut jamais être acquise par la sagesse humaine : c’est l’Éternel lui-même qui forme la personne pour qu’elle le connaisse.",
        "Moi, j’ai été formé par l’Éternel pour le connaître et pour le faire connaître à l’humanité. L’Éternel est très puissant ; d’ailleurs, il n’a pas de fils, comme l’indiquent ces versets des Proverbes. L’Éternel Dieu n’est pas un homme et il n’a pas non plus de fils. Sa sagesse est si grande que, pour le connaître, il faut nécessairement la présence d’un homme créé pour donner la lumière et expliquer la sagesse divine.",
        "L’Éternel n’a pas sept yeux, car il n’est pas un homme. Même s’il avait sept yeux, comment pourrait-il voir le monde entier ? L’Éternel lui-même est la vie : c’est pourquoi il voit partout. C’est ce que nous devons comprendre."
       ]
      }
     ],
     "id": "predication-2"
    },
    {
     "meta": {
      "place": "Paroisse de Mbanza-Ngungu",
      "occasion": "32ᵉ anniversaire de la personnalité civile",
      "attendance": "1 010 personnes",
      "time": "13 h 20 – 19 h 10",
      "text": "Deutéronome 5 : 6-10",
      "dateLabel": "29 avril 2012",
      "iso": "2012-04-29"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "6. « Je suis l’Éternel, ton Dieu, qui t’ai fait sortir du pays d’Égypte, d’une maison d’esclavage. 7. Tu n’auras point d’autre Dieu que moi. 8. Tu ne te feras point d’idole, l’image de quoi que ce soit dans les eaux au-dessous de la terre. 9. Tu ne te prosterneras point devant elles, tu ne les adoreras point ; car moi seul, l’Éternel, je suis ton Dieu, un Dieu jaloux, qui poursuis le crime des pères sur la troisième et la quatrième génération pour ceux qui m’offensent, 10. et qui étends mes faveurs à la millième pour ceux qui m’aiment et gardent mes commandements. »"
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Israël a passé plus de 400 ans en Égypte à prier les dieux égyptiens. Cette influence lui a fait totalement oublier le Dieu de ses pères Abraham, Isaac et Jacob. Ce problème pesait à l’Éternel. Par sa volonté, il a trouvé la solution : libérer ce peuple de cette servitude.",
        "Depuis l’époque coloniale jusqu’en 1980, nous avons toujours eu des problèmes avec le droit de prêcher la Parole de l’Éternel. En réalité, il fallait que le chef de l’État nous donne l’autorisation de prier, sans quoi les difficultés allaient se multiplier.",
        "Pendant cette période de souffrance, beaucoup de serviteurs ont été mis en prison sans motif valable. Tout cela parce que nous n’avions pas la liberté. Obtenir la personnalité civile semblait impossible, mais pour nous la situation est devenue possible grâce à l’Éternel, qui a agi.",
        "Je suis le mieux placé, et le seul, pour vous parler du Dieu qui nous a sauvés, parce que j’ai traité avec lui comme Moïse en Israël.",
        "Quand j’étais en prison à Kalamu, par exemple, à 5 h 30, l’Éternel est venu me dire : « Isaac, dis à tes gens de ne plus rester ici ; qu’ils t’attendent à la maison ce soir, car aujourd’hui tu vas sortir. » Le soir, à 17 h, on est venu me chercher pour m’emmener à l’Hôtel de ville, et l’on m’a libéré.",
        "Il a pensé également à notre situation spirituelle en nous libérant de l’idolâtrie par l’Oracle. Moi, j’ai opéré beaucoup de miracles et je continue à en opérer, mais je ne suis pas Dieu. L’Éternel reste l’unique Dieu qui sauve.",
        "En somme, nous devons retenir que c’est l’Éternel qui a tout fait pour que nous puissions obtenir la personnalité civile. Aucun groupe n’était d’accord pour que notre Église soit libérée. Mais l’Éternel a tout fait, et il a également pensé à notre salut spirituel par l’Oracle. Nous lui devons de la reconnaissance."
       ]
      },
      {
       "title": "Exposé du Prophète sur la notion de Pâque",
       "kind": "text",
       "paras": [
        "La Pâque est une fête juive qui était célébrée en l’honneur de l’Éternel pour avoir libéré Israël de la servitude en Égypte. C’est l’Éternel Dieu qui avait prescrit cette fête à ce peuple. Pour le repas, on immolait une bête domestique comme sacrifice pascal, ou agneau pascal, le tout pour la gloire de l’Éternel Dieu. On fêtait la Pâque pendant sept jours et l’on mangeait cette bête avec des pains sans levain, en mémoire de la sortie précipitée d’Égypte.",
        "Les chrétiens, eux, célèbrent la Pâque pour se souvenir de la mort et de la résurrection de Jésus. En ce qui concerne les KCCistes, la Pâque n’a pas de raison d’être célébrée dans notre Église, parce que nous n’avons pas vécu les mêmes circonstances que les Juifs. Nous n’avons aucune circonstance qui nous pousse à célébrer la Pâque.",
        "La conception pascale ne nous concerne pas. Ce qui nous concerne, c’est notre sortie de l’idolâtrie. Nous fêtons l’Oracle, qui exprime notre sortie du culte de Baal. C’est une clé qui nous conduit à la délivrance, qui consiste en la connaissance de la loi de Dieu. Nous ne sommes pas obligés de l’appeler Pâque : nous l’appelons fête de l’Oracle.",
        "À côté de cette fête, nous avons aussi la fête de l’Alliance, qui intervient 50 jours après l’Oracle. Dans l’Oracle, Dieu a parlé. Nous avons quitté l’idolâtrie pour entrer dans l’Alliance que l’Éternel a conclue avec l’humanité représentée par Israël.",
        "Les Juifs ont fêté la Pâque non pas pour aller au ciel, mais pour exprimer leur reconnaissance à l’Éternel. Notre cas a une portée très grande et très différente : sans l’Oracle, nous ne pouvions ni entrer dans l’Alliance de l’Éternel ni avoir le salut. Nous serions restés éternellement dans l’idolâtrie.",
        "Par ailleurs, la reconnaissance juridique a permis à notre Église de se développer à l’étranger. Aujourd’hui, on trouve l’Église un peu partout. C’est un grand travail que nous avons accompli.",
        "Aujourd’hui, nous avons le devoir d’apporter la lumière, comme le dit Ésaïe 49 : 5-6 : « 5. Et maintenant, s’adressant à moi, l’Éternel qui m’a créé pour être son serviteur, pour lui ramener Jacob et grouper Israël autour de lui — car grand est mon prix aux yeux de l’Éternel, et mon Dieu est ma force —, 6. l’Éternel me dit : C’est trop peu que tu sois mon serviteur pour relever les tribus de Jacob et rétablir les ruines d’Israël : je veux faire de toi la lumière des nations, mon instrument de salut jusqu’aux confins de la terre. »",
        "En effet, par « lumière », il faut entendre la connaissance du nom de l’Éternel. Par « Yahvé », il faut entendre le nom puissant, le Dieu Créateur. Ce nom constitue une grande lumière : ceux qui ne l’ont pas sont dans le noir.",
        "Notre travail est d’apporter la lumière. Le travail est grand. À travers notre comportement, les gens doivent connaître l’Éternel Dieu, comme il est dit dans Ésaïe 49 : 3 : « Et il m’a dit : Tu es mon serviteur ; Israël, c’est par toi que je me couvre de gloire », c’est-à-dire : c’est par ton comportement que je serai honoré. C’est une élection.",
        "C’est une réalité : nous sommes ses serviteurs pour apporter la lumière. À travers notre comportement, cette lumière, qui est le nom de Dieu, sera répandue partout dans le monde. C’est pourquoi nous devons nous réjouir à tout moment.",
        "En 1966, par exemple, j’ai subi une grande pression de la part des autorités religieuses pour changer ma manière de prêcher. Devant une foule de 800 personnes, on m’a demandé de jurer publiquement de changer ma façon de prêcher.",
        "L’Éternel m’a donné la parole à travers ce cantique que nous appelons le « Serment du Prophète ». Quoi qu’il en soit, je n’ai pas cédé. J’ai tenu à prêcher la vérité, qui est la lumière dont nous parlons. C’est ce qui a permis à cette œuvre de grandir et de se développer comme vous la voyez.",
        "Ainsi, soyons sérieux dans notre comportement pour bien faire connaître le nom de l’Éternel dans le monde."
       ]
      }
     ],
     "id": "predication-3"
    },
    {
     "meta": {
      "place": "Paroisse de Mbanza-Ngungu",
      "occasion": "Culte d’action de grâce pour le 32ᵉ anniversaire de la personnalité civile",
      "attendance": "598 personnes",
      "time": "19 h – 22 h",
      "text": "Ésaïe 45 : 21-22",
      "dateLabel": "30 avril 2012",
      "iso": "2012-04-30"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "21. « Faites votre récit, avancez vos raisons, délibérez ensemble : qui, dans un passé lointain, a annoncé tout cela ? Qui l’a révélé depuis longtemps ? N’est-ce point moi, l’Éternel, à côté de qui il n’est pas de Dieu, moi, le Dieu juste et secourable, qui n’ai point de rival ?",
        "22. Tournez-vous vers moi, et vous serez sauvés, vous tous qui habitez les confins de la terre ; car moi, je suis Dieu, et personne d’autre. »"
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "En Israël, il y a eu un grand problème qui pesait sur le peuple : celui de la connaissance de l’Éternel. En ce temps-là, ce problème pesait surtout sur la vie spirituelle de l’homme, jusqu’à ce que l’Éternel Dieu vienne lui-même en apporter la solution.",
        "En effet, il dit : « Assemblez-vous et examinez dans les écrits d’où vient ce problème : n’est-ce pas moi qui ai dit depuis longtemps que je suis l’Éternel et qu’il n’y en a pas d’autre ? Vous allez voir que c’est bien moi, l’Éternel. »",
        "Ni Ésaïe ni un autre, mais c’est moi qui suis Dieu, le seul Dieu qui sauve. Devant moi, il n’y a pas de rival, c’est-à-dire qu’il n’y a pas d’autre Dieu. C’est pourquoi je vous dis : « Tournez-vous vers moi et vous serez sauvés, car moi, l’Éternel, je suis le seul Dieu, et il n’y en a point d’autre. »",
        "Vérifiez et vous verrez. Justement, ce problème se pose aussi à notre époque : jusqu’à présent, la connaissance de l’Éternel reste une question dans l’esprit de beaucoup de personnes.",
        "L’Éternel vient de nous demander de nous réunir aujourd’hui pour voir ensemble que c’est lui le Dieu qui sauve. Nous devons comprendre qu’il n’y a pas d’autre Dieu qui sauve. C’est vrai, nous voyons ce salut et nous en sommes tous témoins.",
        "Nous célébrons la personnalité civile. Pour l’obtenir, c’est l’Éternel qui a joué son rôle de Sauveur. Il nous a sauvés par sa main puissante. C’est un grand signe qui montre que cette parole est juste : l’Éternel est le Dieu qui sauve, et il n’y en a point d’autre.",
        "À partir de cette intervention de l’Éternel pour la personnalité civile, nous pouvons affirmer que nous sommes tous des témoins, comme le dit l’Éternel dans Ésaïe : « Vous êtes mes témoins… » Nous avons des preuves tangibles du salut de l’Éternel. Il n’est pas nécessaire que je fasse une longue analyse sur ce sujet.",
        "Nous devons simplement comprendre que c’est l’Éternel Dieu qui sauve. Tournons-nous vers lui : en lui, nous continuerons toujours à être sauvés en toute chose. Cette parole est juste, parce que c’est lui-même qui l’a dite et qui l’a défendue.",
        "En somme, nous devons seulement retenir que l’Éternel est le Dieu qui sauve. Ce témoignage est juste, parce qu’il a dit qu’il nous aiderait, et il l’a fait."
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
      "time": "14 h 03 – 14 h 45",
      "text": "Psaume 136 : 1-4",
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
        "4. À celui qui accomplit, lui seul, de grandes merveilles, car sa grâce est éternelle."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "À Forakam, lors de la quatrième apparition, j’entendis une voix me dire : « Isaac, lis le Psaume 136. » À cette époque, je n’avais pas l’habitude de lire la Bible. En l’ouvrant, je suis tombé justement sur les Psaumes. Il était 22 heures ; aussitôt après la lecture, il était déjà 6 heures du matin, et j’ai découvert que je n’avais lu que deux versets.",
        "Aujourd’hui, nous étudions ces quatre versets. Il est certain que c’est l’Éternel lui-même qui fait des merveilles. Au départ, je ne savais pas pour quelle raison on m’avait recommandé de lire ces versets.",
        "En effet, dans la vie, il faut avoir l’habitude de dire merci et, surtout, il faut savoir à qui l’on doit présenter ses remerciements. C’est à lui, le Dieu des dieux, que l’on doit rendre hommage et reconnaissance, car sa grâce est éternelle. Nous n’avons pas donné un seul sou, mais voyez ce qu’il nous a donné ! C’est une grâce immense. Il nous a montré la voie du salut. Le 30 avril 1980, nous avons été placés sous la protection de l’État pour garder cette voie du salut dans laquelle nous avons été introduits.",
        "Dans tout cela, l’Éternel ne nous a jamais demandé de sacrifices, mais seulement de la reconnaissance et des actions de grâce. À notre tour, nous avons le devoir de le faire, car l’Éternel Dieu est bon et très miséricordieux.",
        "Par ailleurs, au cours de nos démarches pour obtenir la personnalité civile, nous avons perdu espoir, mais l’Éternel nous a fait des promesses et, à la fin, il les a réalisées.",
        "D’une manière générale, tout vient de Dieu : les conjoints, les enfants, le salaire, la santé, la vie viennent de lui.",
        "Si vous recevez quelque chose de la part de l’Éternel, vous devez toujours avoir l’habitude de lui présenter vos remerciements.",
        "Un jour, par exemple, en 1957, j’étais réuni avec un papa dans sa maison. L’Éternel me dit : « Ce papa va tout laisser, sa femme, ses biens, puis il va fuir. » Je le lui ai dit. C’était vers 20 h ; le lendemain, à 11 h, il le fit. Il est allé à Brazzaville, il s’est marié avec une autre femme et ils ont eu des enfants. Ainsi, si Dieu donne, il faut dire merci, car il peut aussi reprendre tout ce qu’il a donné.",
        "Il nous a donné la voie du salut et il a permis que l’État nous accorde la personnalité civile pour bien œuvrer. Nous devons donc nécessairement remercier l’Éternel et les autorités qui gouvernent notre pays. Ces remerciements s’exprimeront par notre amour et notre fidélité à demeurer dans sa voie, en faisant toujours le bien pour l’honneur de l’Éternel."
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
      "occasion": "Visite du Chef spirituel",
      "attendance": "301 personnes",
      "time": "20 h – 23 h",
      "text": "1 Rois 18 : 7-21",
      "dateLabel": "2 mai 2012",
      "iso": "2012-05-02"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "7. Comme Obadia suivait sa route, il vit venir Élie à sa rencontre ; le reconnaissant, il se jeta sur sa face et dit : « Est-ce toi, Élie, mon seigneur ? » 8. Il lui répondit : « C’est moi. Va dire à ton maître : Voici Élie. » 9. Obadia repartit : « Quel mal ai-je fait, pour que tu exposes ton serviteur à être mis à mort par Achab ? 10. Par l’Éternel, ton Dieu ! Il n’est peuple ni royaume où mon maître n’ait envoyé pour te chercher ; et quand ils disaient qu’on ne savait rien de toi, il obligeait royaume et peuple à jurer qu’on ne t’avait point trouvé. 11. Et maintenant tu me dis : Va dire à ton maître : Voici Élie ! 12. Mais à peine t’aurai-je quitté que le souffle du Seigneur te portera vers un lieu que j’ignore ; j’irai t’annoncer à Achab, il ne te trouvera pas et il me tuera ! Or, ton serviteur révère l’Éternel depuis son enfance. 13. Mon seigneur n’a-t-il pas appris ce que je fis lorsque Jézabel mit à mort les prophètes de l’Éternel ? J’en cachai une centaine — cinquante dans chaque souterrain — et je les nourris de pain et d’eau. 14. Et maintenant tu dis : Va dire à ton maître : Voici Élie ! Mais il me tuera ! » 15. Élie répondit : « Par l’Éternel Cebaot, dont je suis le serviteur ! Aujourd’hui même je paraîtrai à sa vue. » 16. Obadia alla rejoindre Achab, qu’il mit au courant, et Achab alla au-devant d’Élie. 17. En apercevant Élie, Achab lui dit : « Te voilà donc, perturbateur d’Israël ? » 18. Il répondit : « Ce n’est pas moi qui ai jeté le trouble en Israël, c’est toi et la maison de ton père, puisque vous avez déserté les lois de l’Éternel et que tu as adopté le culte des Baals. 19. Et maintenant, fais rassembler autour de moi tout Israël vers le mont Carmel, avec les quatre cent cinquante prophètes de Baal et les quatre cents prophètes d’Achèra, qui vivent de la table de Jézabel. » 20. Achab envoya des ordres parmi tous les enfants d’Israël et rassembla les prophètes sur le mont Carmel. 21. Élie s’avança devant tout le peuple et s’écria : « Jusqu’à quand clocherez-vous entre les deux partis ? Si l’Éternel est le vrai Dieu, suivez-le ; si c’est Baal, suivez Baal ! » Mais le peuple ne lui répondit mot."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Israël avait abandonné l’Éternel pour servir Baal. Aux yeux de l’Éternel, c’était le péché le plus grave qu’Israël avait commis. Cette situation irrita l’Éternel au point qu’il ordonna, par la bouche du prophète Élie, l’arrêt total de la pluie sur tout Israël pendant trois ans.",
        "Cette catastrophe de sécheresse provoqua une très forte mortalité : les hommes, les animaux et les plantes ne vivaient plus à leur rythme normal. Le roi Achab cherchait la cause de cette sécheresse, et on lui dit qu’Élie en était la cause.",
        "En réaction, le roi Achab écrivit à tous les pays étrangers pour qu’on recherche Élie afin de le tuer, mais toutes les réponses furent négatives.",
        "En Israël, Obadia servait Achab tout en croyant en Élie. Comme par hasard, Obadia et Élie se rencontrèrent quelque part, et il lui raconta toutes les démarches qu’Achab était en train d’effectuer pour le tuer.",
        "Élie envoya Obadia chercher Achab pour lui dire de venir le voir. Mais Obadia dit à Élie : « Mon seigneur, tu sais que j’ai caché cent prophètes, cinquante dans chaque souterrain, et que je les ai nourris parce que Jézabel cherchait à les tuer. Si je vais chercher Achab et que, par la puissance de ton Dieu, tu disparais, c’est moi qu’on tuera. »",
        "Élie lui dit : « En vérité, je te le dis, il ne te fera rien. Vas-y. » Et Obadia y alla. Achab vint calmement vers Élie et lui dit : « C’est toi le perturbateur d’Israël. » Élie lui répondit : « Ce n’est pas moi, c’est toi et la maison de ton père, car vous avez rejeté la loi de l’Éternel et le nom de l’Éternel ; vous avez préféré le culte de Baal. Pour prouver que ce n’est pas moi, rassemble tous les enfants d’Israël, ainsi que les 450 prophètes de Baal et les 450 prophètes de Jézabel, sur le mont Carmel pour une épreuve. » Achab le fit. Élie dit : « Jusqu’à quand clocherez-vous des deux côtés ? »",
        "« Si l’Éternel est le vrai Dieu, suivez-le ; si c’est Baal, suivez Baal ! » Le peuple garda le silence. Élie demanda aux prophètes d’invoquer Baal pour que le feu descende du ciel et consume le taureau. Pendant toute la journée, les 900 prophètes échouèrent. Élie fit verser de l’eau sur son taureau et sur le bois, et ils le firent. Puis Élie invoqua le vrai Dieu pour faire descendre du ciel le feu qui consumerait le taureau.",
        "À l’instant même, l’Éternel le fit. Puis Élie égorgea tous les 900 prophètes. Tout Israël crut que l’Éternel est le vrai Dieu.",
        "En réalité, le roi Achab, à son rang, ne pouvait jamais rejeter l’Éternel ni son Alliance. Il ne pouvait pas non plus ignorer la loi, le nom et l’Alliance de l’Éternel. Élie lui a demandé de bien réfléchir : c’est pour cette raison qu’il a provoqué, comme preuve, la rencontre du Carmel.",
        "À notre époque, nous sommes dans la même situation. Satan, de son côté, a plusieurs dieux : c’est lui qui les dirige. Tous les faux dieux portent chacun un nom. La vraie divinité n’a qu’un seul nom : l’Éternel, et il est un. C’est Yahvé. C’est lui le Créateur et le Sauveur. Tous les dieux qui n’ont pas créé le ciel et la terre sont de faux dieux.",
        "C’est ce que dit Jérémie 10 : 10-11 : « Tandis que l’Éternel, Dieu, est vérité : lui seul est un Dieu vivant et un Roi éternel ; sa colère fait trembler la terre, et les peuples ne peuvent soutenir son courroux. 11. Vous leur parlerez ainsi : Les dieux qui n’ont créé ni le ciel ni la terre disparaîtront de la terre et de dessous ces cieux. »",
        "L’Éternel est Dieu ; lui seul est le Dieu vivant. C’est pourquoi on l’appelle l’Éternel : il n’a ni commencement ni fin. Il est roi et reste roi éternellement. S’il se fâche, aucun peuple ne peut tenir devant son courroux (sa colère).",
        "Tous les faux dieux disparaîtront : c’est une grande erreur de quitter l’Éternel. Israël a commis une grave erreur en quittant l’Éternel pour s’attacher à Baal.",
        "Si nous choisissons l’Éternel, nous serons sauvés. Ne mélangeons pas l’Éternel avec les fétiches, les marabouts…, de peur de mourir. C’est le moment de choisir. Si c’est Baal, suivez-le : l’Éternel ne vous regrettera pas. Il faut être sincère, réaliste et sérieux. Israël n’avait pas de réponse à donner à Élie, parce qu’il était déjà avec Baal.",
        "Israël écoutait la voix de l’Éternel, mais il l’a oubliée. Si nous nous attachons à l’Éternel, nous serons plus heureux que la nation d’Israël. Même moi, je ne suis pas un dieu. Le vrai Dieu, c’est l’Éternel : c’est lui qui fait tout pour vous. Ne l’abandonnons pas. C’est lui qui a tout mis à notre disposition, c’est-à-dire les eaux, la terre, les poissons, la forêt, l’air, pour que nous puissions bien vivre. Pourquoi ne pourrions-nous pas le prendre comme notre Dieu ? C’est lui qui a créé jusqu’au ciel : si nous l’abandonnons, où irons-nous ? Attachons-nous à l’Éternel et obéissons à sa loi."
       ]
      },
      {
       "title": "Exposé",
       "kind": "text",
       "paras": [
        "Vous n’êtes pas sans savoir que notre Église est née en 1955 par la volonté de l’Éternel. Ce n’est pas la création d’une personne. J’ai commencé ce travail de prédication en 1956. C’était l’époque coloniale, où la tenue du culte était interdite. Même les kimbanguistes ne priaient pas, parce que l’époque était très dure. Mais j’ai pris tous les risques pour annoncer le nom de l’Éternel. L’Église n’était qu’un petit groupe : quand il fallait chanter, il fallait baisser la voix.",
        "Nous avons commencé à prier publiquement juste après la reconnaissance juridique de l’Église kimbanguiste.",
        "En 1965, le professeur Guy Bernard est venu de Kinshasa me voir à Boma pour me conseiller. Après avoir examiné mon travail, il m’a conseillé de demander à l’État la personnalité civile.",
        "En 1967, j’ai introduit une demande à cet effet. En réponse, on m’a autorisé à travailler, parce que l’État avait momentanément suspendu ce dossier.",
        "Le 24/04/1971, je fus arrêté parce que j’avais créé une Église. Le gouverneur NZOKU me jugea et me garda en détention jusqu’à ma libération.",
        "Les persécutions persistèrent jusqu’au 30 avril 1980, date à laquelle nous avons obtenu la personnalité civile, et nous sommes entrés sous le contrôle de l’Église du Christ.",
        "Si nous avons obtenu cette personnalité civile, c’est grâce à l’Éternel Dieu. Moïse avait reçu l’ordre de libérer Israël, et il a tout fait pour Israël. Dans tout cela, Israël ne voyait que Moïse comme libérateur ; il ignorait que c’était Dieu qui avait agi. Une fois sorti d’Égypte, Israël continuait à prier les statues, jusqu’à ce que l’Éternel parle en disant : « C’est moi, l’Éternel, qui vous ai fait sortir du pays d’Égypte. » C’est à partir de là qu’Israël a su et compris que c’était l’Éternel qui avait opéré tous ces miracles.",
        "De même pour nous, c’est l’Éternel lui-même qui nous a aidés à obtenir la personnalité civile. Moi, je n’étais qu’un instrument qu’il a utilisé."
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
      "occasion": "Visite du Chef spirituel",
      "attendance": "349 personnes",
      "time": "20 h – 23 h",
      "text": "Deutéronome 29 : 9-12",
      "dateLabel": "3 mai 2012",
      "iso": "2012-05-03"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Au cours de sa mission, Moïse avait transmis la Parole au peuple d’Israël en lui communiquant la volonté de l’Éternel en ces termes : « Vous êtes tous placés devant l’Éternel, bien qu’il soit invisible. Grands et petits, hommes et femmes…, vous êtes tous invités à entrer dans l’Alliance. Il traitera avec vous et il vous élèvera, afin que vous soyez son peuple et qu’il soit votre Dieu, comme il l’a juré à vos pères Abraham, Isaac et Jacob… »",
        "Il s’agit ici d’une invitation de l’Éternel qui s’adresse non seulement à Israël, mais à toute l’humanité. Il est le même Dieu qui a créé Israël et tous les peuples du monde.",
        "L’Éternel veut faire d’Israël son peuple et en faire un peuple de grande valeur. Mais la seule condition est d’entrer dans son Alliance.",
        "Cette recommandation constitue une loi perpétuelle, c’est-à-dire une loi qui ne peut jamais être modifiée.",
        "Même dans l’Église, plusieurs membres sont là, mais refusent d’entrer dans l’Alliance. Ils fuient la loi qui dit : « Tu n’auras pas d’autre dieu à côté de moi. » Cette loi est exigeante, et c’est une grande insécurité si, dans un foyer, quelqu’un refuse d’entrer dans l’Alliance de l’Éternel. D’abord la première loi, et le reste suivra. C’est cette loi qui pèse le plus.",
        "L’Éternel nous invite à entrer dans son Alliance sans rien demander. Ailleurs, dans les alliances de Satan, on exige la vie, les enfants, la femme, les parents et d’autres choses. Si l’on refuse, c’est un problème.",
        "L’Éternel, lui, ne demande que de dire oui avec un cœur ouvert. Il sera avec vous d’ici-bas jusqu’au ciel.",
        "L’Éternel a tout mis à notre disposition : pourquoi ne pas accepter d’entrer dans son Alliance pour traiter avec lui ?",
        "L’Éternel ne force personne, mais moi, il m’a forcé en me disant : « Si tu refuses, je te tuerai. » Un jour, je suis allé au village avec mon grand frère MBAMBUKULU pour enterrer notre père. Arrivé près du village, quelqu’un me dit : « Ton père n’est pas mort », et il était réellement vivant.",
        "J’ai décidé d’aller rendre visite à ma famille. Ils m’ont bien reçu. La nuit, on m’a offert une place pour dormir, et une voix m’a dit à plusieurs reprises : « Attention, Isaac, bisi Kibangu bazolele kumbunga », c’est-à-dire : « Les gens de Kibangu veulent te tuer. »",
        "Le matin, j’ai appelé tous les gens de Kibangu pour leur demander pourquoi ils avaient voulu me détruire. Ils me répondirent : « Non, nous sommes seulement venus vous rendre visite. »",
        "Pourquoi l’Éternel m’a-t-il sauvé ? Parce que, depuis 1955, je traite avec lui. Il me garde et me protège.",
        "Il n’est pas bon de porter sur le corps des chaînettes qui ne peuvent jamais vous sauver, alors que le Créateur est présent.",
        "Ainsi, entrons tous dans l’Alliance de l’Éternel pour traiter avec lui."
       ]
      }
     ],
     "id": "predication-7"
    },
    {
     "meta": {
      "place": "Paroisse de Kimpese",
      "occasion": "Culte d’au revoir à Kimpese",
      "attendance": "350 personnes",
      "time": "14 h – 15 h 30",
      "text": "Ésaïe 45 : 24-25",
      "dateLabel": "4 mai 2012",
      "iso": "2012-05-04"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "24. En l’Éternel seul, qui m’a parlé, résident le salut et la force ; vers lui reviendront, couverts de honte, tous ceux qui s’étaient emportés contre lui. 25. En l’Éternel seront justifiés et glorifiés tous les descendants d’Israël."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Il s’agit de la parole du prophète Ésaïe, exprimée en ces termes : c’est en l’Éternel seul, qui m’a parlé, que résident le salut et la force ; c’est en l’Éternel que seront justifiés et glorifiés les descendants d’Israël.",
        "Moi, j’ai écouté la Parole de Dieu, et je vous redis que le salut se trouve en l’Éternel. Cette Parole est juste : il faut bien la garder dans son cœur.",
        "Si vous voulez être délivrés de vos maladies et de vos problèmes, vous devez seulement chercher l’Éternel. Il détient la force et la victoire ; il détient tout. C’est lui notre vie et notre espérance en toute chose. C’est vers lui qu’il faut crier, c’est en lui qu’il faut se confier si vous avez un problème. À son tour, il vous sauvera, car il est votre salut. Il n’est pas bon de perdre son temps à aller chercher un autre dieu ailleurs.",
        "Ainsi, il faut chercher seulement l’Éternel pour tout problème, car il est le salut, la force et la victoire. Si vous abandonnez l’Éternel pour aller ailleurs, vous serez en difficulté, et ce sera une difficulté éternelle."
       ]
      }
     ],
     "id": "predication-8"
    },
    {
     "meta": {
      "place": "Paroisse de Kimpese",
      "occasion": "Visite du temple et de l’Institut Manenga",
      "attendance": "",
      "time": "11 h – 12 h 30",
      "text": "",
      "dateLabel": "4 mai 2012",
      "iso": "2012-05-04"
     },
     "sections": [
      {
       "title": "Causerie du Prophète avec les élèves de l’Institut Manenga",
       "kind": "text",
       "paras": [
        "Je suis très content de me retrouver en ce lieu et de voir les œuvres dont je suis l’initiateur. C’est une occasion que l’Éternel vient de nous donner aujourd’hui ; c’est aussi un don de l’Éternel Dieu.",
        "En effet, quand j’ai quitté Kinshasa le samedi 28 avril 2012 pour venir fêter le 32ᵉ anniversaire de la reconnaissance juridique à Mbanza-Ngungu, je ne pensais pas arriver ici, dans cet institut. Je suis agréablement surpris de me retrouver à Kimpese. Vous venez de me réserver un accueil chaleureux, et je vous en remercie ; j’en suis très content. C’est une bénédiction pour vous.",
        "L’Éternel ne m’a pas envoyé pour parler uniquement de son nom, mais aussi pour penser à la vie du peuple.",
        "J’ai construit cet institut pour que vous soyez en paix et que notre pays, la RDC, trouve des cadres capables de bien le gérer.",
        "Vos parents se battent pour vous payer le minerval. À votre tour, je vous invite à prendre vos études au sérieux et surtout à vous occuper profondément de votre formation. En outre, je vous demande le respect envers les autorités, vos collègues et tout le monde. Je demanderai à l’Éternel qu’il vous accorde à tous la réussite dans vos études.",
        "Je vous apprends que le KCC est un mystère. Par mystère, il faut entendre ce qui ne peut jamais être expliqué par l’intelligence humaine, mais seulement par la puissance de l’Éternel Dieu lui-même."
       ]
      }
     ],
     "id": "predication-9"
    },
    {
     "meta": {
      "place": "Sous-section de Kiemba (paroisse de Kimpese)",
      "occasion": "Visite du Chef spirituel",
      "attendance": "29 personnes",
      "time": "17 h – 17 h 30",
      "text": "",
      "dateLabel": "Vendredi",
      "iso": "2012-05-04"
     },
     "sections": [
      {
       "title": "Exposé",
       "kind": "text",
       "paras": [
        "C’est une surprise pour moi de vous voir aujourd’hui. Mon cœur est très heureux de voir que, même dans ce coin du Bas-Congo, le nom de l’Éternel est proclamé.",
        "Dans ce monde, parler du nom de l’Éternel est une grande affaire. C’est une grâce pour laquelle nous devons rendre hommage à l’Éternel. Nous avons reçu ce grand travail : annoncer le nom de l’Éternel en expliquant que c’est lui qui nous a tous créés et qu’il est notre Sauveur.",
        "C’est bien la toute première leçon qui a été gardée. Malheureusement, le monde l’a cachée et a préféré parler des fausses divinités, qui n’ont rien fait.",
        "Heureusement, l’Éternel nous a confié ce travail : proclamer le nom de l’Éternel dans le monde.",
        "Ainsi, continuons à faire ce travail afin d’être bénis et protégés par l’Éternel. Je viendrai un jour voir le travail de construction que vous avez déjà réalisé."
       ]
      }
     ],
     "note": "Kiemba est une sous-section de la paroisse de Kimpese, dirigée par le Disciple Liévin et le Disciple Anto. Cette entité dispose déjà d’un temple construit, mesurant 9 m sur 4 m. Ce village se trouve entre Kimpese et Kenge, sur la route de Matadi.",
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
      "occasion": "Visite du Chef spirituel",
      "attendance": "44 personnes",
      "time": "18 h 50 – 19 h 40",
      "text": "Ésaïe 45 : 24-25",
      "dateLabel": "4 mai 2012",
      "iso": "2012-05-04"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "24. En l’Éternel seul, qui m’a parlé, résident le salut et la force ; vers lui reviendront, couverts de honte, tous ceux qui s’étaient emportés contre lui.",
        "25. En l’Éternel seront justifiés et glorifiés tous les descendants d’Israël."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Toutes ces paroles ont été prononcées par le prophète Ésaïe à l’intention du peuple d’Israël. Aujourd’hui, c’est moi qui vous les transmets.",
        "En effet, toute personne qui veut avoir le salut, la force et la victoire n’a qu’à chercher l’Éternel, et pas un autre.",
        "Toute personne qui a besoin du salut, sur tous les plans, n’a qu’à chercher l’Éternel seul.",
        "Parmi vous tous, je suis le seul à avoir écouté la voix de l’Éternel, car c’est à moi que l’Éternel a parlé, lui en qui résident le salut, la force et la victoire.",
        "Ceux qui abandonnent ou fuient l’Éternel finissent par revenir à lui avec honte.",
        "Cet enseignement est gratuit. Toute personne qui veut être sauvée, même pour aller au ciel, n’a qu’à chercher l’Éternel. Il résout tous les problèmes de ceux qui le cherchent, il guérit toutes leurs maladies et les protège en toutes circonstances.",
        "Aller ailleurs, c’est se tromper, comme le dit Ésaïe 43 : 10-11 : « Vous, vous êtes mes témoins, dit l’Éternel, et le serviteur choisi par moi pour reconnaître, pour croire en moi et être convaincu que je suis ; qu’avant moi, nul Dieu n’a existé, et qu’après moi, il n’y en aura point. C’est moi, moi, l’Éternel, et en dehors de moi il n’est point de sauveur. » Aller ailleurs, c’est une perte.",
        "Ainsi, invoquez l’Éternel : il vous sauvera. Je viens de totaliser 67 ans de vie sacerdotale. Si je n’avais pas été avec lui, je serais déjà mort. Je vous invite à le chercher, car c’est en lui que se trouvent le salut, la victoire et la force."
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
      "attendance": "1 300 personnes",
      "time": "18 h 30 – 22 h 00",
      "text": "Jérémie 17 : 13-14",
      "dateLabel": "5 mai 2012",
      "iso": "2012-05-05"
     },
     "sections": [
      {
       "title": "Texte biblique (version Torah)",
       "kind": "verses",
       "paras": [
        "13. Ô espérance d’Israël, Éternel ! tous ceux qui te délaissent seront confondus ; oui, ceux qui se tiennent éloignés de moi seront inscrits sur la poussière, car ils ont abandonné la source d’eau vive, l’Éternel."
       ]
      },
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Israël fait une déclaration à l’Éternel en ces termes : « L’Éternel est mon espérance ; tous ceux qui s’éloignent de toi seront confondus. »",
        "À cela, l’Éternel lui-même ajoute : « Oui, ceux qui me délaissent, leurs noms seront inscrits sur la terre, parce qu’ils ont abandonné la source d’eau vive, l’Éternel. » On ne verra jamais leurs noms dans le livre de vie.",
        "Il s’agit ici des conséquences fixées par l’Éternel pour toute personne qui s’éloignera de lui.",
        "En effet, écrire un nom par terre est dangereux, parce que la pluie, les piétons, le vent et d’autres choses effaceront forcément ce nom.",
        "Quand l’Éternel inscrit le nom d’une personne par terre, c’est qu’il l’efface de son cœur. Cette personne sera sans protection divine et elle sera complètement oubliée dans la mémoire de l’Éternel.",
        "Israël a compris cela. C’est la raison pour laquelle il a pris l’Éternel comme son espérance, sa joie, son bonheur et son salut.",
        "À notre tour, nous devons mettre notre espérance en l’Éternel. Moi, par exemple, j’ai mon grand-père MAKUNDA et mon père MANEKA. Ce n’est pas en eux que je dois espérer si j’ai un problème. Ce serait très grave si je le faisais : je deviendrais comme une personne qui n’existe pas. Je dois espérer en l’Éternel, qui est la source de vie de toutes les créatures.",
        "Nous devons être sages. Moi, je suis un instructeur qui vous enseigne qu’il ne faut jamais s’éloigner de l’Éternel. Mon espérance, c’est l’Éternel.",
        "Je ne peux jamais m’éloigner de lui ; d’ailleurs, le seul nom qui doit demeurer dans mon cœur jusqu’à ma mort, c’est celui de l’Éternel. Je ne peux jamais accepter que mon nom soit inscrit dans la poussière, et je suis très heureux de rester dans cette position.",
        "C’est bon si l’Éternel est votre salut : il vous guérira de toute maladie et vous sauvera dans tous vos problèmes.",
        "Ce conseil est précieux et gratuit : il n’a pas de prix. C’est vraiment une grâce. En toute vérité, je ne vous trompe pas : c’est la Bible qui le dit, et non pas moi. Prenez-le comme votre Sauveur.",
        "Ainsi, prenez l’Éternel comme votre espérance. Qu’il soit l’espoir de l’EBNM."
       ]
      }
     ],
     "id": "predication-12"
    },
    {
     "meta": {
      "place": "Paroisse de Minkondo (Matadi)",
      "occasion": "Réception du Prophète",
      "attendance": "2 536 âmes",
      "time": "12 h – 16 h",
      "text": "Deutéronome 29 : 9-12",
      "dateLabel": "6 mai 2012",
      "iso": "2012-05-06"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Moïse a rassemblé tout le peuple d’Israël, de toutes catégories, pour lui transmettre les paroles suivantes : « Vous êtes tous placés aujourd’hui devant l’Éternel, le Dieu invisible, mais présent partout. »",
        "Votre plus grande préoccupation doit être d’entrer dans l’Alliance de l’Éternel afin de devenir une nation très élevée. L’Éternel sera votre Dieu, et vous serez son peuple. À travers cette Alliance, il traitera avec vous comme il l’a fait avec vos pères Abraham, Isaac et Jacob.",
        "En effet, l’invitation que l’Éternel adresse à Israël constitue une grâce extraordinaire, car dans cet appel, c’est le Créateur lui-même qui veut traiter avec Israël à travers son Alliance.",
        "Israël a examiné cette invitation et a fini par l’accepter docilement (Exode 14 : 7).",
        "Étant le Créateur, l’Éternel est libre de faire alliance avec tous les peuples, et aujourd’hui il vous introduit, vous, KCCistes, dans cette Alliance. Si Israël a accepté, que dites-vous, vous, KCCistes ?",
        "L’Éternel veut traiter avec tout KCCiste, avec tout Congolais, à travers son Alliance. Il est prêt à nous recevoir tous dans son Alliance. Il veut faire de chacun un membre de son peuple de grande valeur, pour nous diriger, nous protéger et nous sauver. La seule chose à faire est d’accepter son Alliance. Il n’y a pas de frais à payer.",
        "En Israël, il n’a pas demandé de frais, mais seulement une réponse positive. Ailleurs, on demande les enfants, la vie, et vous-mêmes.",
        "Quand l’Éternel m’a appelé, j’ai senti que cette charge était lourde et j’ai dit non. En réaction, l’Éternel m’a dit : « Si tu refuses, je te tuerai. »",
        "Devant cette situation, j’ai prié en disant : « Prends-moi, mon corps, mon âme. » Et à partir de ce moment, c’est-à-dire en 1955, je suis entré dans son Alliance, et je traite avec lui nuit et jour. Si l’Éternel traite avec vous, il vous protégera et sera avec vous partout où vous serez.",
        "Dans l’Église, certains membres sont assidus, mais malheureusement ils n’aiment pas entrer dans l’Alliance de l’Éternel. C’est une grande erreur, car le jour où ils auront un problème, ils finiront toujours par chercher l’Éternel, et les résultats seront alors négatifs.",
        "En 1959, nous sommes allés à la chasse dans la forêt du village du Révérend MAKITU. Papa MU MPAKA André m’emmena dans cette forêt que je ne connaissais pas. Ceux qui nous précédaient ont rencontré un buffle blessé par balles, qui courait en colère pour attaquer n’importe qui. Il venait droit dans ma direction, et l’on criait pour me demander de monter dans un arbre, mais malheureusement ces arbres étaient tous très grands. En quelques minutes à peine, il s’est approché de moi ; j’ai tiré trois fois, mais sans résultat. Le buffle tremblait de colère à quelques mètres de moi, puis il fit rapidement demi-tour.",
        "Dans cette situation, si je n’avais pas été dans l’Alliance de l’Éternel, je serais déjà mort. L’Éternel sait garder ceux qui sont dans son Alliance. Il est bon d’entrer dès maintenant dans son Alliance, car le temps est court."
       ]
      },
      {
       "title": "Mot du Prophète",
       "kind": "text",
       "paras": [
        "C’est une erreur de dire que l’Éternel a envoyé le Prophète DIZOLELE pour les KCCistes. L’Éternel m’a envoyé pour l’humanité, mais en commençant d’abord par la RDC.",
        "Si vous êtes ici, c’est parce que l’Éternel vous a choisis pour recevoir la Parole ; mais à côté de vous, beaucoup de gens sont encore dans le noir et attendent le moment de leur appel.",
        "Je suis le prophète de l’humanité, car l’Éternel, en m’envoyant, avait en vue le monde entier, en passant par la RDC. Même l’invitation à entrer dans l’Alliance concerne l’humanité entière."
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
      "time": "22 h – 01 h 30",
      "text": "Ésaïe 49 : 5-6",
      "dateLabel": "7 mai 2012",
      "iso": "2012-05-07"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Dans ce texte, on parle de la personne qui est formée dans le ventre de sa mère pour être le serviteur de l’Éternel.",
        "Cette personne, c’est Israël ; sa valeur, son prix ne sont connus que de l’Éternel. Aujourd’hui, c’est nous tous qui avons été formés dès le ventre de nos mères pour devenir serviteurs de l’Éternel ; c’est-à-dire que l’Éternel nous avait déjà préparés quand nous étions encore dans le ventre de nos mères.",
        "Même si, dans ce monde, nous n’avons pas de valeur, aux yeux de l’Éternel nous valons très cher.",
        "Être choisi comme serviteur de l’Éternel n’est pas peu de chose : c’est une charge très lourde, car l’Éternel est très grand.",
        "Le plus grand travail est de relever devant l’Éternel sa tribu, qui est dispersée partout. J’ai déjà commencé à rassembler et à relever cette tribu. Ce travail n’est pas seulement le mien, il est aussi le vôtre.",
        "Israël est lumière. Tout KCCiste devient aussi lumière, parce que l’Éternel vous a montré sa vérité, son secret et son salut. Le nom de l’Éternel n’est plus connu, et les gens ignorent que c’est par lui que l’on doit être sauvé.",
        "Le serviteur est un instrument de salut jusqu’aux confins de la terre : c’est vraiment un grand travail. Toute personne qui prétend transmettre la lumière doit professer le nom de l’Éternel, car c’est lui qui est lumière et vérité.",
        "C’est une grande erreur de prétendre faire le travail de l’Éternel sans présenter son nom. Être l’instrument de l’Éternel est une mission très précieuse. Si l’on est choisi pour ce travail et que l’on est sage, on se mettra à tout moment à genoux pour demander à l’Éternel la réussite de ce travail, afin d’aller jusqu’au bout.",
        "Notre valeur réside dans ce choix : c’est pourquoi nous devons être forts. Ce travail n’est pas une petite chose, car nous connaissons son début et son développement. Je vous assure qu’il deviendra encore plus grand.",
        "De 1955 à 2003, ce n’était qu’un travail de rassemblement. Mais à partir de 2003, nous sommes vraiment entrés dans le travail de proclamation du nom de l’Éternel.",
        "Ne plaisantons pas, soyons plus responsables. Ma récompense est auprès de l’Éternel, mon Dieu. Ce travail est très lourd. Il ne faut pas y chercher des intérêts matériels : là, nous ne savons rien. Il faut davantage se confier à l’Éternel ; pour le reste, il vous récompensera.",
        "Ainsi, sans hypocrisie, soyons forts pour apporter la lumière jusqu’aux confins de la terre, afin de recevoir le vrai salaire auprès de l’Éternel."
       ]
      }
     ],
     "id": "predication-13"
    },
    {
     "meta": {
      "place": "Paroisse de Minkondo (Matadi)",
      "occasion": "Culte d’au revoir",
      "attendance": "1 427 âmes",
      "time": "12 h – 17 h",
      "text": "Jérémie 26 : 1-6",
      "dateLabel": "8 mai 2012",
      "iso": "2012-05-08"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "La parole de l’Éternel, par le prophète Jérémie, s’adresse au peuple d’Israël qui venait se prosterner dans la maison de l’Éternel.",
        "En effet, aller adorer l’Éternel et se prosterner devant lui au temple est un comportement qui l’honore.",
        "Mais ce qui est mieux, c’est d’avoir une bonne conduite, en mettant en pratique tout ce que prêchent les prophètes de l’Éternel.",
        "Israël allait au temple pour se prosterner devant l’Éternel sans penser à se convertir. L’Éternel, en réalité, n’avait pas apprécié cette façon de faire : c’est ainsi qu’il a finalement détruit cette nation.",
        "L’Éternel est un Dieu très saint. Il n’agit pas brutalement, mais il avertit toujours d’abord, en commençant par envoyer ses prophètes.",
        "Ici, il envoie le prophète pour tout dire au peuple concernant la doctrine de l’Éternel, sans rien retrancher ni ajouter.",
        "Il veut voir si l’on peut trouver quelques personnes dociles qui acceptent de changer de conduite pour obéir à cette doctrine.",
        "S’il ne trouve personne pour obéir à cette doctrine, une sanction sévère sera réservée au peuple.",
        "Tout cela constitue, à juste titre, le message que l’Éternel a donné à Jérémie pour qu’il le transmette à Israël.",
        "Cette parole est bien la loi qu’il a promulguée publiquement devant le peuple, et pour laquelle il continue sans cesse à envoyer ses prophètes : c’est bien la parole du salut.",
        "Aujourd’hui, l’Éternel m’envoie parmi vous pour la même mission. C’est dans cette perspective qu’à mon tour, je vous demande d’écouter ma doctrine, mieux encore les dix commandements, qui constituent la parole de l’Éternel, comme je l’ai dit précédemment. Il s’agit de la parole du salut, telle qu’elle est écrite dans Exode 34 : 27-28.",
        "Nous avons tous la chance de recevoir la parole de l’Éternel : nous ne pouvons pas nous risquer à remplacer cette parole par une autre doctrine. L’Éternel n’a pas prévu d’autre doctrine à côté de la sienne. Toute doctrine et toute parole qui n’émanent pas de l’Éternel doivent être rejetées.",
        "Pour être épargné de la colère de l’Éternel, il est nécessaire d’entrer dans sa parole, c’est-à-dire dans son Alliance. Il est bon de se retrouver dans le groupe de ceux qui écoutent la voix de l’Éternel.",
        "Si moi, DIZOLELE, je vous donne une doctrine qui ne vient pas de l’Éternel, après examen, je vous demande de me quitter.",
        "L’Éternel savait bien que, dans ce monde, il y aurait plusieurs doctrines sataniques. C’est pourquoi il insiste auprès de son peuple pour qu’il suive sa propre doctrine, celle qu’il a fixée au mont Horeb et transmise par ses prophètes.",
        "Que toute personne qui a sa doctrine vienne me prouver qu’elle vient de l’Éternel. Puisque nous sommes proches de l’Éternel par sa doctrine, je vous demande d’obéir à cette parole. C’est une grande joie d’être dans cet état.",
        "Ainsi, mes enfants, je vous demande d’écouter la doctrine de l’Éternel que je vous donne, pour que vous soyez sauvés en toute chose."
       ]
      },
      {
       "title": "Mot de la fin",
       "kind": "text",
       "paras": [
        "Je suis très content de voir que tout s’est très bien passé. Je sais que l’Éternel est également d’accord.",
        "Moïse a passé 40 jours et 40 nuits avec l’Éternel sans manger ni boire, et il n’a rien ressenti. Spirituellement, c’est possible ; charnellement, non.",
        "Je vous promets que je reviendrai encore vers vous. Priez pour moi, afin que l’Éternel m’aide à travailler encore, car le travail devient très grand.",
        "Toutefois, si un visiteur vient séjourner chez vous, vous devez le recevoir une fois seulement, et non chaque jour comme vous venez de le faire pour moi.",
        "Je constate que la doctrine prend une grande place, et que l’Éternel prend également place dans vos cœurs. La compréhension se développe beaucoup dans l’Église. L’Éternel est avec nous.",
        "Le culte est un moment très saint. Plus tard, nous développerons ce grand sujet de notre doctrine qu’est la sainteté du culte. Éteindre son téléphone ne suffit pas à respecter la sainteté du culte : tout le monde sait que, lorsqu’on entre dans l’église, on éteint ses appareils.",
        "La cérémonie des Actes d’Alliance prouve que nous sommes dans l’Alliance de l’Éternel : c’est un signe de notre attachement à cette Alliance. Il n’est pas bon de manquer ce culte chaque fois qu’il est programmé. Rendez-vous disponibles pour y assister."
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
      "occasion": "Culte d’au revoir",
      "attendance": "400 âmes",
      "time": "19 h – 22 h",
      "text": "Exode 14 : 26-31",
      "dateLabel": "10 mai 2012",
      "iso": "2012-05-10"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Israël, en servitude en Égypte pendant 430 ans, fut libéré par l’Éternel par l’intermédiaire de Moïse. Israël a vu lui-même comment l’Éternel l’a libéré des mains de Pharaon, et comment les Égyptiens furent noyés dans la mer Rouge. Au fond, l’eau n’est pas rouge : on dit « rouge » parce qu’on y trouva le sang des Égyptiens qui y avaient été noyés. La traversée était impossible, et pourtant elle a eu lieu. Israël fut sauvé, sain et sauf.",
        "En réalité, on ne joue pas avec le mot « salut ». Au départ, Israël doutait de l’Éternel et de son prophète ; mais avec cet événement, il vit la grande puissance de l’Éternel et finit par croire aussitôt en l’Éternel et en son prophète Moïse.",
        "En ce qui nous concerne, il est bon aujourd’hui de comparer là où nous étions et là où nous sommes.",
        "À travers l’Oracle, nous venons de saisir la main de l’Éternel. Au départ, on boudait, mais aujourd’hui nous sommes heureux de cette nouvelle, car nous avons vu le salut de l’Éternel. Ainsi, croyons en l’Éternel et en son prophète afin de bénéficier du salut éternel."
       ]
      }
     ],
     "id": "predication-16"
    },
    {
     "meta": {
      "place": "Paroisse de Kiveve (Boma)",
      "occasion": "Culte de réception du Prophète",
      "attendance": "1 300 âmes",
      "time": "20 h – 23 h 00",
      "text": "Exode 15 : 1-12",
      "dateLabel": "11 mai 2012",
      "iso": "2012-05-11"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "C’est vrai, l’Éternel est notre Dieu. Il est grand, et en lui résident le salut, la victoire et la gloire. Ce texte est un cantique de joie qu’Israël avait chanté après avoir goûté au salut que l’Éternel lui avait accordé.",
        "En effet, l’Éternel était venu sauver Israël de sa servitude en Égypte. Dans ce cantique, l’aspect le plus important que nous pouvons dégager est la reconnaissance.",
        "Israël a reconnu la grâce que l’Éternel lui a faite en lui accordant le salut. De là, Israël a compris que c’est l’Éternel qui est Dieu au-dessus de tous les dieux, car il a fait tomber dans l’eau les hommes forts et colériques.",
        "Sous l’influence des Égyptiens, Israël avait beaucoup de dieux, mais il a vu le véritable Dieu, qui est l’Éternel.",
        "Devant cette réalité, Israël ne pouvait que proclamer la puissance et l’unicité de Dieu. Avec beaucoup de joie, il chantait pour l’Éternel, afin d’exprimer qu’en dépit des nombreux dieux, il avait compris que le Dieu de Moïse est le véritable. Il mérite la gloire.",
        "En ce qui nous concerne, c’est vrai : au départ, nous étions contents du salut, mais malheureusement ce salut était mal présenté.",
        "Aujourd’hui, l’Éternel vient de nous sauver par l’Oracle. C’est une grande bénédiction. Nous aussi, à notre tour, par la bonté de l’Éternel, nous avons reçu son salut. Sans lui, nous serions toujours dans la servitude des idoles. C’est pourquoi, quand il en est temps, il vaut mieux aller dans le temple de l’Éternel pour le louer. Il est le Dieu de tous les peuples ; il sauve dans sa bonté. Cette lumière, nous devons la transmettre à nos enfants.",
        "Ainsi, comme l’Éternel nous a sauvés par son Oracle, nous devons, à l’exemple d’Israël, manifester notre joie par des cantiques et par nos actes, en le reconnaissant comme l’unique Sauveur.",
        "Dans la nuit du 12 au 13 mars, alors que nous étions éloignés de ce Dieu, il nous a dirigés jusqu’à nous ramener vers lui. Il est donc clair que la grandeur de sa bonté pour nous sauver est immense. En retour, nous lui devons exclusivement notre reconnaissance, par nos actes et nos cantiques."
       ]
      }
     ],
     "id": "predication-17"
    },
    {
     "meta": {
      "place": "Paroisse de Kabondo (Boma)",
      "occasion": "Réception du Prophète",
      "attendance": "2 000 âmes",
      "time": "12 h – 17 h",
      "text": "Deutéronome 6 : 4-5",
      "dateLabel": "12 mai 2012",
      "iso": "2012-05-12"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "« Écoute, Israël, l’Éternel est notre Dieu, l’Éternel est un. »",
        "Cette parole renvoie à la recommandation de l’Éternel à Israël en particulier et à l’humanité entière en général.",
        "La parole de l’Éternel, qui est sainte, présente l’Éternel comme notre Dieu. De notre côté, l’Oracle du 15 avril 2003, donné par le Prophète, nous assure que l’Éternel est venu se présenter à nous comme notre Dieu, et nous l’avons accepté comme tel.",
        "Reconnaître l’Éternel comme notre Dieu nous oblige donc à croire qu’il est un. L’Éternel lui-même s’est présenté comme l’unique Dieu.",
        "En effet, Israël avait beaucoup de dieux, mais l’Éternel veut ici apporter une précision sur le nombre : il veut souligner qu’il n’y en a pas plusieurs.",
        "Il s’agit donc d’un seul Dieu, qui a créé le ciel et la terre, les anges, les hommes et les animaux. Il est le Dieu de toutes les nations de la terre, le seul Créateur de tout ce qui existe, visible et invisible.",
        "On ne peut pas le partager en morceaux pour en faire plusieurs ; d’ailleurs, il est indivisible.",
        "« Tu aimeras l’Éternel, ton Dieu, de tout ton cœur et de toute ton âme. » Cette recommandation est également indispensable. Comme nous venons de le dire, l’Éternel est un : on ne peut jamais le partager. Si on le faisait, il faudrait aussi partager son amour avec ces dieux.",
        "On pourrait bien le faire, mais on aimerait l’un davantage et l’on haïrait l’autre. Comme l’Éternel ne veut pas cela, tout notre cœur ne doit être donné qu’à Dieu. Puisqu’il est un, tout notre cœur et tout notre amour ne doivent être donnés qu’à lui. Il n’a pas besoin de rivaux.",
        "Dans Deutéronome 6 : 13-15, l’Éternel se proclame un Dieu jaloux : il peut t’exterminer de la surface de la terre à cause de ce mélange de divinités.",
        "L’Éternel est un et restera un. Il n’est pas bon de placer quelqu’un à côté de lui : il restera toujours un. Ajouter un autre dieu devant lui, c’est chercher de multiples problèmes. N’en mettez pas d’autre.",
        "À côté de lui, il ne faut ajouter ni aimer aucun autre dieu, ni une personne, ni un esprit, ni même une chose pour l’égaler. Vous risqueriez de troubler les relations de l’Alliance. C’est l’Éternel seul que tu dois adorer et prier ; c’est en son nom seulement que tu dois jurer (Ésaïe 45 : 4).",
        "Dans Proverbes 30 : 4-6, il est dit que l’Éternel serre les eaux dans son vêtement, que sa parole est parfaite, et qu’il ne faut rien ajouter à ses paroles, de peur d’être trouvé menteur : il n’a pas de fils. À la parole de l’Éternel, on n’ajoute rien.",
        "Il n’est pas là pour qu’on lui ajoute quelqu’un. D’ailleurs, si tu le fais, tu ne sauras pas l’aimer de tout ton cœur et de toute ton âme. C’est l’Éternel que tu dois servir, adorer et prier.",
        "Faire le contraire, c’est compromettre son salut ; c’est donc très dangereux. La Première Onction est conforme à la parole de l’Éternel. Même dans la mort, même dans la souffrance, prononce le nom de l’Éternel, car il est un : il t’aidera. Qu’il reste ton salut, car le salut est assuré à tous ceux qui s’abritent en lui. Dites cette parole à tout le monde."
       ]
      },
      {
       "title": "Mot de la fin",
       "kind": "text",
       "paras": [
        "Mon passage me montre que vous avez réellement compris, et je vous demande de continuer à comprendre comme vous venez de le faire.",
        "Si une créature n’arrive pas à connaître son Créateur, elle doit en réalité se sentir mal à l’aise dans son cœur.",
        "L’Éternel est grand : s’il était comme les autres, il aurait déjà exterminé tous les êtres. Mais il continue à nous donner la vie, la nourriture, et il met tout à notre disposition.",
        "C’est ce qu’il dit dans Osée 11 : 9. Le message que je vous ai apporté est entré dans vos cœurs, il a été accepté et continue à se répandre : qu’il soit glorifié ! C’est une joie pour moi.",
        "Partout, nos temples deviennent trop petits, parce que ceux qui acceptent le message deviennent très nombreux.",
        "Vous n’avez pas rejeté l’Éternel. Je ne viendrai pas comme un voleur : ce serait une mauvaise façon de faire, et l’Éternel avertit toujours. Je reviendrai, et je vous tiendrai informés.",
        "Nous serons parmi les 7 000 qui seront sauvés en Israël (1 Rois 19 : 18) : il s’agit de ceux qui m’adorent et qui ne se sont pas agenouillés devant Baal."
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
      "attendance": "1 250 âmes",
      "time": "19 h – 6 h",
      "text": "Ésaïe 43 : 9-11",
      "dateLabel": "12 mai 2012",
      "iso": "2012-05-12"
     },
     "sections": [
      {
       "title": "Interprétation",
       "kind": "text",
       "paras": [
        "Jusqu’à présent, il y a quelque chose de caché que le monde n’a pas encore découvert ni dit. Et l’on cherche qui peut le dire et en témoigner, parce que c’est indispensable.",
        "En effet, l’Éternel demande à toutes les nations, ensemble avec leurs témoins, de se réunir pour examiner les événements du passé et d’autrefois, afin d’affirmer que cette chose cachée est vraie. Malheureusement, personne n’a découvert cette vérité.",
        "Cependant, l’Éternel prend Israël comme témoin. Il le choisit en le considérant comme son serviteur. Il ne prend pas tout le monde.",
        "Il lui confie la tâche de témoigner de lui à l’humanité, et il dit : « Je t’ai choisi pour que tu saches que c’est moi l’Éternel. Depuis les origines, il n’y a pas eu de Dieu avant moi, et il n’y en aura pas d’autre après moi. C’est moi, l’Éternel, le Sauveur, et il n’y en a point d’autre. » Israël, tu es choisi pour dire cela.",
        "C’est cette vérité que Satan cache. Cette vérité doit être connue de tout homme : c’est une sécurité pour la vie de celui qui vient de la connaître.",
        "Toute personne qui ignore cette vérité est fortement exposée à l’idolâtrie. L’Éternel a tout mis à la disposition de chaque KCCiste, et tu dois arriver à le reconnaître, car l’homme, malgré cela, n’arrive pas à reconnaître l’Éternel comme l’unique Dieu.",
        "KCCiste, tu dois reconnaître que c’est l’Éternel qui est le seul Dieu, le seul Sauveur. Il est normal que toute créature le reconnaisse comme tel. Si tu veux être sauvé, il faut reconnaître l’Éternel et l’enseigner aussi à tes enfants.",
        "L’Oracle nous a permis de connaître l’Éternel ; sans lui, nous serions encore dans l’obscurité. KCCiste, tu ne dois pas avoir honte de prêcher l’Éternel. Ce message doit être transmis à l’humanité. Tout Congolais doit le connaître et aller de l’avant pour présenter l’Éternel.",
        "Ainsi, puisque nous avons été choisis par l’Éternel pour cette mission, ne reculons pas : allons de l’avant et n’ayons pas peur."
       ]
      },
      {
       "title": "Mot de la fin",
       "kind": "text",
       "paras": [
        "Beaucoup disent que DIZOLELE s’est fait Dieu. C’est seulement une manière de saboter l’œuvre. En réalité, ils savent bien que je ne me suis pas fait Dieu.",
        "Heureusement, l’Éternel vous a soutenus face à toutes ces paroles décourageantes. Au contraire, DIZOLELE est venu apprendre aux gens la connaissance de l’Éternel, Dieu Créateur du ciel, de la terre et de tout ce qui s’y trouve.",
        "Les temps étaient très difficiles, mais, grâce à l’Éternel, nous sommes quand même arrivés à ce point. Aujourd’hui, le nom de l’Éternel est glorifié : les gens l’acceptent et croient. Cette confusion sera balayée : je ne suis pas Dieu.",
        "La connaissance de l’Éternel aide la vie spirituelle et matérielle. Je sais que je vieillis — c’est une bénédiction —, mais prions afin que l’Éternel me donne le temps de travailler.",
        "La sortie de ce message a provoqué le départ de beaucoup de gens. D’ailleurs, certains ont voulu en profiter pour détruire ce travail, mais l’Éternel les a tous confondus, et le travail a progressé. Partout où je suis passé, l’affluence est impressionnante : cela prouve, à juste titre, que ce travail vient de l’Éternel."
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
