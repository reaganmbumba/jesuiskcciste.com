/**
 * Rites et célébrations de l'EBNM, repris des « Textes liturgiques 2014 »
 * (brochure du Chef Spirituel) et des programmes officiels de 2014-2016 :
 * première onction (03/03/2015), bénédiction des enfants (18/02/2015),
 * déclaration des Actes d'Alliance (02/07/2014), circulaire sur le culte de
 * mariage (2016), dédicace d'un temple (2013). Corrections de frappe
 * uniquement ; aucun nom de fidèle n'y figure.
 */

export interface RiteText { title: string; lines: string[]; lang?: string; /** Variante linguistique d'un même texte, présentée en onglets. */ tab?: boolean; /** Texte en plusieurs parties (début, fin, absolution…). */ parts?: { title: string; lines: string[] }[]; /** Déroulement détaillé : chaque partie s'ouvre comme un volet. */ detail?: boolean }
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
      { title: 'Maloba ya ntubela', lang: 'Lingala', tab: true, lines: [], parts: [
        { title: 'Maloba ya ebandeli', lines: ['Na kombo nayo Monsantu Yawe,', 'na fukami liboso bua yo pona ko ntubela masumu nanga', 'mpo tete na zua bilimbisi.'] },
        { title: 'Maloba ma bosilisi', lines: ['Na kombo nayo Mosantu, oh Yawe, na sengi,', 'olimbisa ngai na mabunga ma ngai manso.', 'Tika ete ejala bongo na kombo nayo Mosantu.'] },
        { title: 'Maloba ma bolimbisi', lines: ['Solo, tondimi ete yo Yawe Njambe Mokeli mwa biso, ojali bulee,', 'pe olimbisi ye na mabunga naye manso.', 'Tika ete ezala bango na kombo nayo Mosantu.', 'Alléluia !! Yaka Nkolo Yawe na nkombo nayo Mosantu.'] },
      ] },
      { title: 'Mpova za mpedoso', lang: 'Kikongo', tab: true, lines: [], parts: [
        { title: 'Mpova ya ntete', lines: ['Mu nkumbu aku ya nlongo, oh Yaveh,', 'mfukamene va ntadisi aku mukulomba ngiambudulu mu ntulumunu zami', 'mu tambula ngiambudulu kua ngeye.'] },
        { title: 'Mpova mu manisi', lines: ['Mu nkumbu aku ya nlongo, ngieti kulomba mutu', 'ngiambudila masumu mami mamosono mayavengi.', 'Bika buakala bobo mu nkumbu aku ya nlongo.'] },
        { title: 'Mpova ya ngiambudulu', lines: ['Mukedika, tulekele minu vo ngeye Yave Nzambi eto, wena wa nlongo', 'ye meni kunyambudila mu ntulumunu zandi.', 'Bika buakala bobo mu nkumbu aku ya nlongo.', 'Alléluia !! Wiza Mfumu Yaveh, mu nkumbu aku ya nlongo.'] },
      ] },
      { title: 'Début de l’aveu', lines: ['Par Ton Saint Nom, Éternel Dieu,', 'je m’agenouille devant Toi', 'pour confesser mes péchés', 'afin que je sois pardonné.'] },
      { title: 'Fin de l’aveu', lines: ['Par Ton Saint Nom, Éternel,', 'pour tout ce que je connais', 'et tout ce que je ne me rappelle plus,', 'je Te demande, ô Éternel Dieu, de me pardonner par Ton Saint Nom,', 'ainsi qu’à vous, ses témoins,', 'car j’ai résolu de ne plus y revenir.', 'Oui, qu’il en soit ainsi par Ton Saint Nom.'] },
      { title: 'Absolution', lines: ['Certes, nous avons cru que Toi, Éternel Dieu, notre Créateur, Tu es saint, et que Tu veux que Ton peuple soit saint.', 'Notre frère (notre sœur) vient de confesser tous ses péchés afin d’obtenir Ton pardon. Oui, je crois que Tu le lui as accordé par Ton Nom.', 'Aux témoins : « Voulez-vous aussi qu’il soit pardonné ? » – « Oui, nous voulons qu’il soit pardonné au Nom de l’Éternel Dieu. »', 'Lève-toi, crois et réjouis-toi, car tes péchés sont pardonnés par l’Éternel Dieu. Oui, qu’il en soit ainsi par Son Saint Nom.'] },
    ],
    notes: ['La prière de repentance (aveu et absolution) se dit aussi en lingala, « Maloba ya ntubela », et en kikongo, « Mpova za mpedoso ».'],
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
      { title: "Programme en kikongo", lang: 'Kikongo', lines: ["0. Mbadukulu", "1. Nkotolo a ntumua", "2. Nkunga : Yawe yo Mokeli na biso", "3. Lusambulu lua mbadukulu", "4. Chorale", "5. Nkunga : Nzela na Yawe ezali sembo", "6. Mbambukulu a moyo mbiekolo ya luwawanu", "7. Mbangudulu", "8. Nkunga : Banso toyeba yango oo", "9. Mpova za luwawanu lua Yave ye Isalaele mu diambu dia nza ya mvimba", "10. Chorale", "11. Nkunga : Moto nani akotosa liloba na Yawe te", "12. Mpova mu zayikisa bu kinzambi bua Yave", "13. Nkunga : Yawe Njambe a mibu na mibu", "14. Lusambulu", "15. Mvutudulu a luwawanu", "16. Chorale", "17. Nkunga : Nayebaki yo te Njambe na ngai", "18. Lusambulu lua Mbiekolo", "19. Mbonosono", "20. Nkabudulu", "21. Mikunga", "22. Mpova ya mpanunu luve mu dia", "23. Lusambulu lua muntu muntu", "24. Minkayilu", "25. Mi nkunga", "26. Lusambulu lua nsuka", "27. Mpova ya nkuluntu", "28. Mbanusunu"] },
      { title: "Déroulement détaillé en kikongo (20/02/2015)", lang: 'Kikongo', detail: true, lines: ["Touchez une étape pour voir les consignes de l’officiant (N.B.), les réponses de l’assemblée et les paroles des cantiques."], parts: [
        { title: "0. Mbadukulu", lines: [] },
        { title: "1. Nkotolo a ntumua", lines: ["N.B. : Ntumua bukakotele, sikavana lusakumunu lua kintuadi ye vuanda. Nkunga una yimbulua."] },
        { title: "2. Nkunga : Yawe yo Mokeli na biso", lines: ["Toye kopesa yo nkembo,", "Toye kokumisa yo", "Na mokolo mosanto mpe na bulee", "Bulisa biso na nguya na yo,", "mpo towumela na liloba na yo", "Bulisa biso na nguya na yo,", "mpo ete tozala elongo na yo.", "Refrain : O Yawe o likolo !", "Kumisama, sanjolama, yamba nkembo na", "biso. Yawe o likolo Njambe na nguya", "Bolingo na yo ejali monene", "Toye kosanjola yo.", "N.B. : Ntangu nkunga buweka va kati kati, Ntumua sikatelema ye vana lusakumunu kua nkangu vo nkunga umeni yimbulua, sikasambila."] },
        { title: "3. Lusambulu lua mbadukulu", lines: ["Aleluya ! : Wiza Mfumu Yave mu nkumbu aku ya nlongo.", "N.B. : Ntumua sikavana lusakumunu kua nkangu ye vuanda."] },
        { title: "4. Chorale", lines: [] },
        { title: "5. Nkunga : Nzela na Yawe ezali sembo", lines: ["Liloba na ye ezali sembo", "Kondimana na ye na libota na ye", "Ekowumela seko oooo", "Kondimana na ye na libota na ye", "Ekowumela seko o (bis).", "Refrain : Tosepela pona ngolu oyo o", "Tosepela pona ngolu oyo", "Yawe asaleli biso", "Po tozala libota naye e e e (bis)."] },
        { title: "6. Mbambukulu a moyo mbiekolo ya luwawanu", lines: ["N.B. : Ntumua sika tanga mu nkanda wa nzole wa Mose 24 : 3-8.", "Aleluya ! : Wiza Mfumu Yave mu nkumbu aku ya nlongo."] },
        { title: "7. Mbangudulu", lines: ["Aleluya ! : Wiza Mfumu Yave mu nkumbu aku ya nlongo.", "N.B. : Ntumua sikavana lusakumunu kua nkangu ye vuanda."] },
        { title: "8. Nkunga : Banso toyeba yango oo", lines: ["Njambe azali se moko", "Akotikala se moko", "Libela na libela", "Bobele ye Njambe na nguya", "Kombo na ye ejali Yawe e e (bis).", "Refrain : Na yango esengeli na biso o o", "Kosalela ye tango nionso", "Pe kotosa malako na ye", "Wana nde akosepela na biso", "Pe tokobiangama bana na sengo o o o (bis)."] },
        { title: "9. Mpova za luwawanu lua Yave ye Isalaele mu diambu dia nza ya mvimba", lines: ["N.B. : Nkunga buweti manisa, Ntumua sikatelama ye vova mu ndinga ya ngolo.", "Mvutu ya kintuadi : Ingeta, Mfumu Yave, mpova zaku zazonsono za luwawanu luaku, tuna zo zitisa na dede.", "Aleluya ! : Wiza Mfumu Yave mu nkumbu aku ya nlongo.", "N.B. : Ntumua sikavana lusakumunu kua nkangu ye vuanda."] },
        { title: "10. Chorale", lines: [] },
        { title: "11. Nkunga : Moto nani akotosa liloba na Yawe te", lines: ["Moto nani akotosa liloba na Yawe te", "oyo Mosakoli akosakola", "Yawe akokata likambo na ye eh (bis).", "Refrain : Totosa liloba na Yawe", "Oyo Mosakoli akosakola", "Oyo akotosa yango te eh", "azali na likambo na Mosakoli te", "Kasi na Yawe Nzambe eh (bis)."] },
        { title: "12. Mpova mu zayikisa bu kinzambi bua Yave", lines: ["N.B. : Mu ntangu nkunga buweka va katikati, Ntumua sikavana lusakumunu lua kintuadi, vo nkunga umanisi yimbulua sikavana mpova zazi :", "Mvutu ya kintuadi : Yave i nkumbu andi !", "N.B. : Ntumua sikavana lusakumunu kua nkangu ye sika vuanda."] },
        { title: "13. Nkunga : Yawe Njambe a mibu na mibu", lines: ["Asala biloko biso azali Mosanto na ba santo", "Basakanaka naye te.", "Refrain : Biso pe towela bosanto oh", "Po ete Yawe azali Mosanto", "Baye bakosalelaka yepe ba santo oh", "Lokola ye azali Mosanto."] },
        { title: "14. Lusambulu", lines: ["N.B. : Mu ntangu nkunga weti yimbulua, buweka va kati kati, Ntumua sikavana lusakumunu lua kintuadi, mboki nkunga bu umeni Ntumua sika sambila lusambulu bonso ebu.", "Aleluya ! : Wiza Mfumu Yave mu nkumbu aku ya nlongo."] },
        { title: "15. Mvutudulu a luwawanu", lines: ["Alleluia ! : Bika buakala bobo mu nkumbu andi ya nlongo.", "N.B. : Ntumua sikavana lusakumunu kua nkangu ye vuanda."] },
        { title: "16. Chorale", lines: [] },
        { title: "17. Nkunga : Nayebaki yo te Njambe na ngai", lines: ["Nayebaki yo te Njambe na ngai", "Kasi na mawa na yo moko obiangi ngai", "Okotisi ngai kati na lingomba oyo", "Po lelo oyo ngai na salela yo.", "Refrain : Batela kondima ngai Nkolo Yawe", "Po ngai na wumela kati na njela oyo", "Po mokolo mua suka nakota lola."] },
        { title: "18. Lusambulu lua Mbiekolo", lines: ["N.B. : Mu ntangu nkunga weti yimbulua, buweka va kati kati, Ntumua sikavana lusakumunu lua kintuadi, mboki sika katula nlele ye sika sambila ebu.", "Aleluya ! : Wiza Mfumu Yave mu nkumbu aku ya nlongo."] },
        { title: "19. Mbonosono", lines: ["Aleluya ! : Wiza Mfumu Yave mu nkumbu aku ya nlongo."] },
        { title: "20. Nkabudulu", lines: ["N.B. : Nkabudulu buyimeni, Ntumua sikatelema mu vana lusakumunu kua nkangu […]. Mi nkabudi ba vutuka va fulu biawu. Mboki sika na nguna koko muzaba […] balembolo tambula dimpa dia luwawanu, vazimunina sikavana kua minkabudi […] balembolo baka.", "(Une partie de cette consigne n’est pas lisible sur la copie.)"] },
        { title: "21. Mikunga", lines: ["1. Esengo na libota oyo o", "Yawe azali Njambe na bango", "Refrain : Oh esengo", "Esengo na libota oyo o", "Yawe azali Njambe na bango", "Bakobatelama butu pe moyi", "ba koyokisama soni te", "ba kotatolaka kombo na Yawe", "bakoyokisama soni te.", "—", "2. Lokumu nionso ebongi na Yawe", "Lokumu nionso ebongi na Yawe", "Yawe mokeli na nionso", "Tika okumisama nayo Yawe (bis)", "Mpo na manso osaleli biso o.", "—", "3. Kobiangama muana kati na libota na Yawe", "Ezali ngolu monene na yango banso totonda Yawe", "Refrain : Nakoki komitungisa", "Te e e", "Na koki kobanga", "Te e e", "Nasimbami na Yawe e", "E Yawe e e na tondi yo", "Na batelami na Yawe e", "E Yawe e e na tondi yo.", "—", "4. Pona nzela na yo ndeko", "Nzela na lola", "Nzela lifelo", "Bizaleli na yo biko ponela yo nzela a (bis)."] },
        { title: "22. Mpova ya mpanunu luve mu dia", lines: ["N.B. : Muntu muntu sika dia dimpa, bukameni dia dimpa, sika sambila mu nsia ntima lusambulu luandi."] },
        { title: "23. Lusambulu lua muntu muntu", lines: ["« Inga u Yave, bika wa tonduanga ntangu zazonsono mu diambu dia kinkuikizi kiaku kua beto bantu baku. Inga u Yave, beto tuakedi bazimbala, kansi buabu mu nlemvo aku ututombudi mu mpinda yituakedingi mu lembua zaya ngeye Yave Nzambi eto ye luwawanu luaku.", "Inga, diadi diena diadinene kua mono. Bika ntim’ami wayangalala mu ngeye mu mvutululu a matondo, buabu nateye mu ntangu yika yimani. »", "Bika buakala bobo mu nkumbu aku ya nlongo !", "N.B. : Vo bantu ba meni dia ye sambila, Ntumua sika vova :", "Aleluya ! : Bika buakala bobo mu diambu dia nzitusu ye nkembo kia Yave Nzambi eto.", "N.B. : Ntumua sikavutula nlele, vana lusakumunu kua nkangu ye wuna vuanda nate […] lusambulu lua nsuka, sika katula evo bima, sika vutuka, sikava nkailu andi, ye va zimunina, lusambulu lua nsuka."] },
        { title: "24. Minkayilu", lines: [] },
        { title: "25. Mi nkunga", lines: ["1. Kati na banzambe nionso", "Na sosoli Nzambe nini nakobondela", "Na nzela oyo ya KCC e e", "Nguya na Yawe na mobulami na ye", "Kotalisa biso Nzambe ya solo", "Nzambe oyo biso toko bondela", "Nzambe oyo biso toko belela", "Nzambe oyo biso toko salela", "Ye nde Nzambe na ba Nzambe", "Refrain : Oko kumbamela ba Njambe mosusu te", "Se nde Yawe Njambe,", "Na endimeli na sili solo kondimela", "Yawe Njambe mopesi na manso o o", "Nkolo na bankolo njambe na ba njambe", "Mokeli na lola pe biloko biso (bis).", "—", "2. Yawe apesi na mosakoli", "Mosala monene ya koteya", "Mokili oyo mobimba", "Kotalisa Nzambe se moko", "Kombo na ye Yawe", "Refrain : O sepela a a", "Sepela muana KCC", "Na mosala Yawe apesi biso", "Ya kosunga mosakoli na ye", "Na mosala oyo monene.", "—", "3. Yo Nzambe na yo nani", "Yawe Nzambe e", "Refrain : Yawe mokeli na biloko biso o o", "Nzambe ya Abalahama", "Isaka pe Yakobo", "Ye Nzambe ya mosakoli DIZOLELE", "Yende tokosalela", "Ye pe tokongumbamela.", "—", "4. Nayebi yango malamu yo Mokeli na ngai", "Yo okelaki ngai mpo na salela yo", "Nakokangama na yo", "Libela, libela o o yo nde mokeli na ngai", "Bongo nga na tika yo", "Te e e Yawe", "Na kangami na yo libela."] },
        { title: "26. Lusambulu lua nsuka", lines: [] },
        { title: "27. Mpova ya nkuluntu", lines: [] },
        { title: "28. Mbanusunu", lines: ["Fait à Kinshasa, le 20/02/2015 — Église Bon Nouveau Message (KCC), le Chef Spirituel, S.Ém. DIZOLELE-MPUNGU W. Isaac."] },
      ] },
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
