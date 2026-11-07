/**
 * « Le chemin de la reconnaissance juridique » : processus de l’obtention de la
 * personnalité civile de l’Église (1966-1980), d’après le document historique
 * de l’Église. Les noms de l’époque sont conservés : Église Universelle de
 * Douze Apôtres (EUDA/EUDAC), puis Communauté de Douze Apôtres au Zaïre
 * (C.D.A.Z.), aujourd’hui Église Bon Nouveau Message (KCC).
 */

export type HistoryBlock =
  | ['p' | 'h2' | 'h3' | 'note', string]
  | ['list' | 'lines', string[]]
  | ['doc', { title: string; sub: string | null; lines: string[] }]
  | ['quote', { text: string; by: string | null }]
  | ['collapse', { title: string; items: string[] }]
  | ['people', { title: string; items: string[] }[]];

export interface HistoryChapter { id: string; n: string; title: string; period: string; blocks: HistoryBlock[] }

export const civilTimeline: { date: string; text: string }[] = [
 {
  "date": "Mars 1966",
  "text": "À Boma, le sociologue canadien Guy Bernard conseille au Prophète de demander la personnalité civile."
 },
 {
  "date": "1968",
  "text": "Première requête. Le Ministère de la Justice suspend l’examen des dossiers mais reconnaît de fait l’Église (lettre n° J.20)."
 },
 {
  "date": "9 janvier 1969",
  "text": "Arrestation de cinq membres à Kakongo (Lukula)."
 },
 {
  "date": "26 janvier 1970",
  "text": "Dépôt des statuts de l’Église au Ministère de la Justice."
 },
 {
  "date": "26 avril 1971",
  "text": "L’Église est inscrite sur la liste des dossiers à examiner ; attestation du Ministère de la Justice."
 },
 {
  "date": "12 – 16 septembre 1971",
  "text": "Arrestation de l’Apôtre Suprême à Lemba, puis libération."
 },
 {
  "date": "31 décembre 1971",
  "text": "Loi n° 71-012 sur l’exercice des cultes ; deuxième requête."
 },
 {
  "date": "28 mars 1972",
  "text": "Ordonnance n° 72-195 : l’Église, non agréée, est dissoute de plein droit. « Je vous aiderai »."
 },
 {
  "date": "1973 – 1975",
  "text": "Arrestations à Kimbanseke, Matadi, Boma et Ndjili."
 },
 {
  "date": "5 janvier 1976",
  "text": "Troisième requête, transmise avec un avis favorable du Commissaire de Région du Bas-Zaïre."
 },
 {
  "date": "Octobre 1977",
  "text": "Adhésion à l’Église du Christ au Zaïre ; l’Église devient la « Communauté de Douze Apôtres au Zaïre »."
 },
 {
  "date": "17 janvier 1979",
  "text": "Empoisonnement de l’Apôtre Suprême à Mbanza-Ngungu ; il en réchappe."
 },
 {
  "date": "12 mars 1979",
  "text": "Nouvelle requête au Conseil judiciaire."
 },
 {
  "date": "30 avril 1980",
  "text": "Ordonnance n° 128/80 : la personnalité civile est accordée."
 },
 {
  "date": "20 juillet 1980",
  "text": "Fête de la sortie officielle au Palais du Peuple."
 }
];

export const civilChapters: HistoryChapter[] = [
 {
  "id": "phase-preliminaire",
  "n": "1",
  "title": "La phase préliminaire",
  "period": "1960 – 1967",
  "blocks": [
   [
    "p",
    "Le chemin parcouru pour aboutir à la reconnaissance juridique de l’Église Universelle de Douze Apôtres était plein d’écueils et d’embûches. Si elle a été pénible, la marche qui a conduit à l’obtention de la personnalité civile a aussi été longue. Avant l’acquisition de cet important document juridique, le Prophète, ses collaborateurs et les membres de l’Église avaient connu bien des souffrances et des persécutions."
   ],
   [
    "p",
    "En fait de culte, force est de reconnaître qu’à l’oppression coloniale succéda une courte période d’accalmie consécutive à l’accession du pays à la souveraineté internationale le 30 juin 1960. En effet, les dispositions constitutionnelles de la République reconnaissaient à toute personne le droit de manifester sa religion ou ses convictions seule ou en commun, tant en public qu’en privé, sous réserve de l’ordre public et des bonnes mœurs. Le premier régime du Congo indépendant s’était montré correct et tolérant en matière de religion et de culte. C’est ainsi que les premières années après l’indépendance furent une période de tranquillité pour l’Église. La première vague de persécutions débuta en 1969 avec l’arrestation des serviteurs de l’Église de Kakongo. Ce fut une conséquence logique de la politique d’oppression et de terreur instaurée par le nouveau régime établi à Kinshasa depuis 1965. Bien des dirigeants de ce régime brillèrent par une hostilité systématique à l’égard de certaines associations religieuses. Ils ne ménagèrent aucun effort pour traquer les adeptes des Églises Indépendantes sous le fallacieux prétexte qu’elles étaient des sectes subversives. Ainsi, l’Église Universelle de Douze Apôtres avait dû faire face, à partir de 1971, à de nombreuses persécutions de la part des gouvernants. Par manque de personnalité civile d’une part et suite aux accusations fortuites d’autre part, l’EUDA a été si traquée qu’elle a oscillé entre la vie et la mort."
   ],
   [
    "p",
    "En tout état de cause, il fallait que l’Église obtînt à tout prix la personnalité civile, pour la mettre à l’abri des tracasseries administratives et policières. Une fois obtenu, ce document devait conférer à l’Église sa liberté d’action qui lui permettrait de cultiver et de consolider son identité. La personnalité civile deviendrait ainsi un support qui faciliterait la libre expansion de l’œuvre de Dieu dans le monde. Elle deviendrait aussi un véritable détonateur qui libérerait toutes les énergies nécessaires au progrès. Pour l’acquérir, il fallait donc mettre en mouvement tout un processus."
   ],
   [
    "p",
    "Bien sûr, sous le régime colonial, il était hors de question de parler de la personnalité civile. D’ailleurs, la conception d’une telle idée devait paraître comme une utopie sinon une absurdité. Même après l’accession du pays à l’indépendance, l’Église ne s’était pas d’emblée investie à la recherche de la personnalité civile. Cela, pour plusieurs raisons : D’abord, en ce temps là, tous les efforts étaient centrés sur l’évangélisation et l’implantation de l’Église ça et là. Ensuite, il y a absence totale dans le premier noyau des fidèles, des cadres formés dans le domaine juridique pouvant orienter l’Église en cette matière. Les quelques cadres que regorgeait l’Église évoluaient surtout dans :"
   ],
   [
    "people",
    [
     {
      "title": "La Territoriale",
      "items": [
       "DIATELANA-dia-MAYADI Marcel (Disciple et Dirigeant de la chorale mère de l’Église de Matadi), Secrétaire Communal à la Commune de Nzanza à Matadi",
       "NGOMA Jean (membre), Secrétaire Territorial du Territoire de Lukula à Lukula.",
       "MUELA Léonard (Prédicateur de l’Église de Thysville), Secrétaire de District au District des Cataractes à Thysville.",
       "MVEMBA Julien (membre), Bourgmestre à Boma"
      ]
     },
     {
      "title": "L’Éducation nationale",
      "items": [
       "KASA LUSALA Joël Alphonse (Apôtre Visiteur et Représentant Légal 1er Suppléant), Enseignant puis Chef de Division au Service de Cadastre.",
       "NKONGO MBENZA Michel (Apôtre Inspecteur et Représentant Légal Deuxième Suppléant), Directeur d’École Officielle, Cadre Sous Statut de l’époque.",
       "MBUNGU MBIZI Philippe (Apôtre Inspecteur), Directeur d’École Officielle, Cadre Sous Statut.",
       "MABETI KUMBANZILA Joseph (Apôtre Curé), Directeur d’École Officielle, Cadre Sous Statut.",
       "VANGU BAVENGA Thomas (Apôtre, Secrétaire Général), Enseignant puis Fonctionnaire aux Affaires Sociales.",
       "TUBANZA André (Prédicateur de l’Église de Thysville), Directeur d’École Officielle, Cadre Sous-Statut.",
       "NSONI VANGU Emmanuel (Prédicateur), Directeur d’École Officielle.",
       "NGIMBI KAPITA Prosper (Disciple de l’Église de Kakongo), Sous-Directeur d’École Officielle."
      ]
     },
     {
      "title": "Le Service de la Douane",
      "items": [
       "NGUNDA MAKAYI Schadrac (Prédicateur de l’Église de Matadi), Douanier au Port de l’OTRACO à Matadi."
      ]
     },
     {
      "title": "Le Service de la Pharmacie",
      "items": [
       "DIABI Alphonse (Membre), Gérant de Pharmacie à Boma."
      ]
     },
     {
      "title": "La Défense nationale (cadres militaires)",
      "items": [
       "NKONGO MBENZA Michel, Premier Sergent dans la Force Publique (en retraite)",
       "NSONI VANGU Emmanuel, Sergent/Force Publique (en retraite)"
      ]
     },
     {
      "title": "La Sécurité du territoire (cadres policiers)",
      "items": [
       "PAKU MALANDA Yvon, Commissaire de Police Principal /Police Nationale (Disciple, Église de Matadi et de Léopoldville)",
       "PAKU MALANDA Edouard, agent de la Police Nationale (Prédicateur de l’Église de Boma)",
       "KHONDE David, Commissaire de Police / Police Nationale (Membre, Église de Léopoldville).",
       "NSIANGANI Jean, Juge de Police du Territoire de Lukula à Lukula.",
       "MANGIKA Daniel, Commissaire de Police puis Adjudant en Chef / Gendarmerie Nationale (Disciple de l’Église de Léopoldville)",
       "DITOMENE DIAMBU-dia-NZAMBI Isaac, Premier Sergent Major / Police Nationale (Disciple, Église de Kinshasa)."
      ]
     }
    ]
   ],
   [
    "p",
    "À dire vrai, c’est la rencontre de DIZOLELE Isaac en mars 1966 à Boma avec le Sociologue GUY Bernard qui suscita l’idée de la personnalité civile. Au cours de leurs entretiens, ce dernier comprit la valeur de la mission confiée à Isaac par Dieu. Aussi le conseilla-t-il de solliciter auprès de l’État une personnalité civile, de manière à lui permettre de prêcher l’Évangile avec quiétude et d’implanter officiellement son Église."
   ],
   [
    "p",
    "Partant des conseils du Chercheur Canadien GUY Bernard d’une part, et considérant la croissance démographique de l’Église et son expansion d’autre part, DIZOLELE Isaac entame les démarches en vue de l’obtention de la personnalité civile en 1967. Ces démarches seront soutenues par ses relations personnelles et professionnelles."
   ]
  ]
 },
 {
  "id": "parcours-juridique",
  "n": "2",
  "title": "Le parcours juridique et la période d’épreuves",
  "period": "1968 – 1976",
  "blocks": [
   [
    "p",
    "En 1968, DIZOLELE Isaac introduisit une requête en obtention de la personnalité civile. Le Ministère de la Justice lui répondit en ces termes : « L’étude des associations sans but lucratif en vue de l’octroi de la personnalité civile est suspendue jusqu’à nouvel ordre. Cette mesure de suspension générale, qui touche aussi votre association, ne vous empêche cependant pas de poursuivre vos objectifs religieux, car la liberté d’action vous garantie par des dispositions constitutionnelles ne s’exerce que selon le strict respect de l’ordre public et de bonnes mœurs » (1)"
   ],
   [
    "p",
    "C’est donc le premier document officiel provisoire qui autorisait l’Église Universelle de Douze Apôtres au Congo d’exercer ses activités religieuses à travers toute la République Démocratique du Congo."
   ],
   [
    "p",
    "C’est ce document qui, juridiquement, contribua à la libération des membres de l’Église arrêtés à cause de leur foi le 09 janvier 1969 à Kakongo dans le territoire de Lukula dans le Bas-Fleuve. Furent victimes de cette arrestation les frères :"
   ],
   [
    "list",
    [
     "PHAMBU NIMI Alphonse (Disciple)",
     "NZATI LELO Jean-David (Disciple)",
     "TSUMBU TSANGU Patrice (Disciple)",
     "LELO DIANA Joachim (Membre)",
     "KAMBU YENDA Faustin (Membre)"
    ]
   ],
   [
    "p",
    "Cet événement incita Isaac, déjà engagé sur le front juridique, à prendre plus conscience du problème de la personnalité civile de l’Église. C’est ainsi qu’il s’attela, le 21 août 1969, à la transmission au Commissaire Sous-Régional du Bas-Fleuve siégeant à Boma, des documents de Couverture dont disposait l’Église."
   ],
   [
    "note",
    "(1) Lettre n°J. 20 du 1968 Dpt. de la Justice."
   ],
   [
    "p",
    "Immédiatement, DIZOLELE Isaac, assisté par l’élite intellectuelle qui l’entourait en l’occurrence NKONGO MBENZA Michel, MBUNGU-MBIZI Philippe, VANGU BAVENGA Thomas procéda à l’élaboration des Statuts de l’Église et à leur introduction le 26 janvier 1970 auprès du Directeur Chef de Service des Cultes et Associations au Ministère de la Justice et Garde des Sceaux du Gouvernement, par la requête n°0142/C.2.5./BG/VT/70. Cela fut fait conformément à l’orientation reçue de l’autorité de la Justice qui appuyait d’une manière ou d’une autre le dossier de l’Église Universelle de Douze Apôtres au Congo grâce à ses conseils et ses annotations positives."
   ],
   [
    "p",
    "Ces démarches ne resteront pas lettre morte. En effet, le 26 avril 1971, l’Église sera enfin alignée sur la liste officielle des Églises retenues pour examen en vue de l’octroi de la personnalité civile. À cette même date sera signée par Monsieur MAVUZI Gaston, Directeur Chef de Service des cultes, l’Attestation délivrée à l’Église Universelle de Douze Apôtres au Congo par le Ministère de la Justice qui garantissait de manière beaucoup plus sécurisante l’exercice des activités de l’Église à travers toute la République Démocratique du Congo. En vue de renforcer la teneur légale du dossier de l’Église Universelle de Douze Apôtres au niveau des entités territoriales du Kongo Central (Bas-Congo), DIZOLELE Isaac procéda le 2 septembre 1971 à la transmission à l’autorité Sous-Régionale du Bas-Fleuve de cette attestation. Comme on le verra, cet acte juridique sera d’un grand apport dans la libération des détenus du 12 septembre 1971 devant le Secrétaire Général de la Justice à Kinshasa/Gombe."
   ],
   [
    "h2",
    "Le rapport du Gouverneur du Kongo Central (6 octobre 1971)"
   ],
   [
    "p",
    "En date du 6 octobre 1971, le Gouverneur de la Province du Kongo Central, D. BOZI établit le rapport administratif que voici sur la situation des Églises de sa Province en général et sur l’Église Universelle de Douze Apôtres en particulier."
   ],
   [
    "doc",
    {
     "title": "Rapport administratif sur la situation des Églises dans la Province du Kongo Central",
     "sub": "Matadi, 6 octobre 1971",
     "lines": [
      "EGLISE : - EGLISE UNIVERSELLE DE DOUZE APOTRES AU CONGO « EUDAC »",
      "1) - Représentant Légal : - Isaac DIZOLELE, Direction Générale",
      "B.P. 607 KINSHASA/LIMETE",
      "Rue de Vemba, 2342 Commune de",
      "LEMBA/KINSHASA.-",
      "2) – Actes d’agréation : - Enregistrés sous le n°F.92/1.081",
      "par attestation du 26 avril 1971,",
      "n’a pas de personnalité civile.",
      "Reconnaissance de fait par lettre n°J.20/",
      "du 21 mars 1968 du Directeur de la 2ème",
      "Direction du Ministère de la Justice.",
      "3) – Origine de l’Église : - Protestante.",
      "4) – Doctrine de l’Église : - Bible Protestante.",
      "5) - Activités de l’Église : - Evangélisation",
      "OBSERVATION : - L’Église n’a pas été représentée à la réunion de Thysville :",
      "mais son Secrétaire Général a été reçu en audience en date",
      "du 21 août 1971 par le Commissaire Provincial.",
      "L’Église semble organisée et fonctionne normalement.",
      "Il est pourtant souhaitable que les membres se regroupent",
      "autour du Protestantisme.-",
      "Fait à Matadi, le 6/10/1971",
      "LE GOUVERNEUR DE PROVINCE,",
      "= D. B O J I =",
      "PRESIDENT REGIONAL DU MPR,",
      "COMMANDEUR DE L’ORDRE NATIONAL DU LEOPARD.-"
     ]
    }
   ],
   [
    "h2",
    "L’arrestation de l’Apôtre Suprême à Kinshasa (septembre 1971)"
   ],
   [
    "p",
    "Le 12 septembre 1971 à 13 h15’, au sortir du culte dominical, DIZOLELE Isaac, Apôtre Suprême et Représentant Légal de l’Église Universelle de Douze Apôtres au Congo fut arrêté sur ordre du Bourgmestre de la Commune de Lemba, Monsieur Jean-Pierre KAZIAMA. Furent aussi appréhendés avec lui, les frères ci-après : NSAKALA Samuel, TUTUMA Joachin, NZATI Jean-David et SOKO KAPITA Daniel."
   ],
   [
    "p",
    "Le culte se déroula au siège de la paroisse de Lemba installé provisoirement dans la parcelle résidentielle du frère SOKO KAPITA Daniel sur Rukozizi, n°1562, dans la Commune de Lemba."
   ],
   [
    "p",
    "Comme l’exige la discipline de l’Église, le culte, entièrement voué à Dieu, se déroula dans une parfaite harmonie spirituelle. Aucun acte répréhensible ne fut relevé, même pas un écart de langage; rien du tout qui pût blesser les susceptibilités des gens ni susciter la suspicion. L’enseignement religieux de ce jour-là, donné par l’Apôtre Suprême lui-même, était de toute évidence, un vrai message d’exhortation. Les agents de la sécurité chargés d’arrêter le Chef de l’Église avait pris part au culte dans l’incognito. En clair, ces espions déguisés en fidèles, n’avaient rien à reprocher à l’Église ni à ses dirigeants tant il est vrai que le culte tout entier était voué à la gloire de Dieu."
   ],
   [
    "p",
    "Cependant, sitôt le culte terminé, DIZOLELE Isaac fut saisi, brutalisé et acheminé manu militari au Bureau Communal de Lemba où l’attendait Monsieur le Bourgmestre Jean-Pierre KAZIAMA. Celui-ci lui signifia qu’il était en état d’arrestation et ce, sans brandir un motif valable."
   ],
   [
    "p",
    "D’emblée, l’on procéda au retrait des pièces d’identité de chaque détenu. Ces documents furent remis au Bourgmestre qui les confisqua. Par téléphone, il sollicita une Jeep au poste de Kalamu. En outre, il dressa la liste des détenus qu’il transmit à ses chefs hiérarchiques."
   ],
   [
    "p",
    "Les voilà aussitôt partis pour le poste de Kalamu où ils furent mis au cachot sans être jugés."
   ],
   [
    "p",
    "Étant donné qu’à l’époque, aucune disposition légale n’autorisait l’arrestation des hommes de Dieu appartenant à des Églises ou sectes non dotées de la personnalité civile, les agents de l’ordre qui les accueillirent, se montrèrent cléments et tendres à leur égard."
   ],
   [
    "p",
    "Le lundi 13 septembre 1971, devant l’autorité, DIZOLELE Isaac déclara que l’Église disposait d’un dossier au Département de la Justice. Voulant alors s’enquérir de l’existence effective de ce dossier, l’autorité prit DIZOLELE Isaac à bord d’une Jeep et se rendit au Département. Le Prophète se fit accompagner de PAKU MALANDA Yvon, alors haut gradé de la Police Nationale Congolaise (Membre de l’EUDA) et de SOLADIO David, fonctionnaire au Département de la Justice (Ami de DIZOLELE Isaac). Après examen, l’on se rendit compte qu’effectivement le dossier de l’EUDA existait bel et bien. Ils retournèrent au poste de Kalamu. L’Homme de Dieu alla rejoindre au cachot ses quatre compagnons d’infortune. Ils y passèrent la nuit de nouveau."
   ],
   [
    "p",
    "Le mardi 14 septembre 1971, ils retournèrent au Ministère de la Justice où ils rencontrèrent le Secrétaire Général de ce Département, Monsieur MATETA qui, après vérification, confirma l’existence du dossier de l’EUDA au Ministère. Cela étant, il promit d’écrire à l’autorité municipale pour lui signifier que le dossier de l’EUDA était dûment enregistré au Ministère. Sur ce, ils regagnèrent le poste de Kalamu."
   ],
   [
    "p",
    "Le mercredi, ils attendirent la lettre en question toute la journée durant jusqu’à 16 heures. Comme elle tardait, le Gouverneur téléphona et demanda qu’on lui amenât les détenus à l’Hôtel de Ville. On les achemina donc au Bureau du Gouverneur intérimaire MATABISI pour y être entendus. NDJOKU-EYO-BABA, Gouverneur de la Ville de Kinshasa était absent. On passa d’emblée à l’interrogatoire sans qu’aucune formalité d’usage ne fût remplie. DIZOLELE Isaac, l’Homme qui tenait le haut du pavé, fut mis au Centre, entouré des notables municipaux et des militaires. Ses codétenus étaient, eux, placés bien loin en arrière. Madame NZUZI wa MBOMBO, haut fonctionnaire à l’Hôtel de Ville était assise en face du Prophète à une distance d’environ huit mètres."
   ],
   [
    "p",
    "Le Gouverneur amorça l’interrogatoire en s’adressant à DIZOLELE Isaac en ces termes :"
   ],
   [
    "lines",
    [
     "C’est toi DIZOLELE Isaac ?",
     "C’est bien moi, dit-il.",
     "Est-ce toi le responsable de ce groupe ?",
     "C’est exact, répondit-il",
     "Puisque nous avons nos Églises traditionnelles qui sont reconnues officiellement, en l’occurrence l’Église Catholique, l’Église Protestante et surtout notre propre Église Congolaise, l’Église Kimbanguiste, pourquoi as-tu conçu l’idée de créer une autre Église ?",
     "Moi, je n’ai pas créé une Église, rétorqua-t-il. C’est Dieu Lui-même qui crée son Église à travers moi. Je ne suis que la personne visible, mieux, l’instrument que Dieu utilise pour fonder son Église.",
     "À ces mots, le Gouverneur soupira : Hum !",
     "Alors, enchaîna-t-il, Monsieur DIZOLELE Isaac, veux-tu dire que c’est Dieu Lui-même qui t’a donné ce travail ?",
     "Tu l’as dit, Monsieur le Gouverneur, enchaîna-t-il.",
     "Quand Madame NZUZI wa MBOMBO entendit cette réponse, de son Bureau, elle tourna le regard vers DIZOLELE Isaac d’un air dédain et plein de mépris et dit : Toi, est-ce Dieu réellement qui te donne ce travail ?",
     "Oui, Madame, répondit-il ; même toi, si Dieu veut te confier son travail, il le fera nécessairement et tu ne désobéiras pas. Car, on ne résiste pas à Dieu.",
     "Quand elle entendit cette réponse, elle baissa la tête et se tut.",
     "Si c’est Dieu qui t’a donné ce travail, renchérit le Gouverneur, peux-tu nous dire comment il t’a confié cette mission ?",
     "Oui, je le peux si vous voulez me supporter car mon discours sera très long.",
     "Le Gouverneur lui accorda la parole."
    ]
   ],
   [
    "p",
    "Alors le Prophète se mit à lui narrer les événements qu’il a vécus dans la nuit du 7 au 8 mars 1955 à partir de son appel jusqu’au signe confirmatif. Arrivé à cette étape du récit, Isaac fut obligé d’arrêter son discours sur ordre du Gouverneur. Mais Isaac fortement inspiré lui dit qu’il avait encore beaucoup d’autres choses à révéler au sujet de son appel. Hélas ! l’autorité lui retira la parole."
   ],
   [
    "p",
    "Après l’audition du récit, le Gouverneur soupira une fois de plus. Il baissa la tête et se mit à taper son stylo sur la table. Puis, il tourna son regard vers SOKO KAPITA Daniel et lui demanda pourquoi il avait transformé sa résidence en une Église. SOKO KAPITA prit la parole et dit : je suis croyant et adepte de cette Église. J’ai accepté cette Bonne Nouvelle qui m’a indiqué la voie du salut. C’est pourquoi, j’ai mis ma parcelle et mes biens au service de l’Église, partant de Dieu. Ai-je mal fait ?"
   ],
   [
    "p",
    "Le Gouverneur fut perplexe en entendant cette réponse. Aussi demanda-t-il au Commandant répondant au nom de BEYA de prendre les détenus et de les ramener au cachot. En ce moment là, DIZOLELE Isaac leva son doigt pour demander la parole à Monsieur le Gouverneur. Il la lui accorda volontiers. Prenant la parole, DIZOLELE Isaac dit : Monsieur le Gouverneur, tous les autres détenus qui m’accompagnent ne sont que des innocents. Ils ne savent rien de cette affaire. Moi seul, suis responsable, l’auteur de tout ceci. Par conséquent, je vous prie de les libérer et de m’amener seul au cachot. Quoi que vous désiriez faire, faites-le sur moi seul et non sur eux."
   ],
   [
    "p",
    "Le Gouverneur marqua son accord et demanda au Commandant BEYA de laisser partir les autres détenus. Aussitôt libérés, NSAKALA Samuel, TUTUMA Joachin, NZATI Jean-David et SOKO KAPITA Daniel descendirent en hâte les marches du gouvernorat et s’en allèrent précipitamment chacun chez lui, laissant Isaac tout seul. Le Commandant BEYA prit l’Homme de Dieu à bord de sa Jeep et le ramena au cachot du poste de Kalamu."
   ],
   [
    "p",
    "Au fur et à mesure que les jours passaient, le Prophète de Dieu commença à ressentir des remords et à s’attrister. Car, durant tout le temps de sa détention, le Seigneur ne s’était guère manifesté à lui. Il ne vit aucun signe marquant la présence de Dieu : aucune vision, pas de songe, pas d’inspiration divine. Rien du tout. Dans sa cellule de détention, Isaac était rempli d’amertume. Il s’agenouilla et adressa cette prière à l’Éternel Dieu : Seigneur, sais-tu que moi, ton serviteur je suis ici ? Je suis jugé par les Princes de ce monde à cause de ton nom. Seigneur, manifeste –toi afin que je sache que tu es avec moi et que tu ne m’as pas abandonné. En dépit de cette prière, aucun signe du ciel ne se manifesta. L’homme de Dieu demeura triste jusqu’au lendemain matin à 5 heures. C’était le jeudi. À 5 h 30’ du même jour, le Seigneur descendit au cachot et lui dit : Isaac, fortifie-toi car ce jour même je te ferai sortir d’ici. Dis à tes fidèles de rester à la Cité et de t’attendre le soir à ton domicile. C’est là que tu les rejoindras."
   ],
   [
    "p",
    "Ce matin-là, comme à l’accoutumée, les fidèles de l’Église se rendirent en masse au Poste de Kalamu et trouvèrent Isaac tout seul, ses compagnons d’infortune ayant été relâchés la veille. En effet, une foule de croyants se tenait chaque jour devant le poste de Kalamu à partir de 6 heures du matin en vue d’apporter au Prophète leur soutien moral et spirituel. Quoiqu’en nombre considérable, les fidèles de l’Église qui prenaient d’assaut le poste de Kalamu, se distinguaient par leur calme et leur discipline. Ils ne proféraient des menaces à personne. Ce comportement on ne peut plus exemplaire marqua l’autorité ainsi que les agents de l’ordre en poste. Ceux-ci reconnurent, ipso facto, le sérieux de l’Église"
   ],
   [
    "p",
    "Par contre, les proches parents du prophète qui lui rendaient visite profitaient de cette occasion pour le tourner en dérision. Ils disaient : laissez-le croupir au cachot car on l’a conseillé maintes fois de renoncer à son aventure périlleuse mais il n’a jamais accepté. Le voilà maintenant en taule. Qu’il se sauve lui-même. Aux membres de l’Église réunis en ce lieu, ils ironisaient en disant : Vous vous massez nombreux ici, pourquoi ne parvenez-vous pas à faire quelque chose afin qu’il soit libéré ? À ces paroles provocatrices et vexatoires, les fidèles de l’Église ne répondaient rien."
   ],
   [
    "p",
    "Au cours de la même matinée, voyant venir une foule immense, DIZOLELE Isaac chargea VILANI David de dire aux fidèles de rentrer tous chez eux et d’aller l’attendre à sa résidence. Car, ce jour-là même, il serait libéré selon l’oracle du Seigneur. Les fidèles de l’Église obtempérèrent spontanément à cet ordre et la Commune de Kalamu se vida d’un trait."
   ],
   [
    "p",
    "Ce même jeudi là, une équipe composée de PAKU MALANDA Yvon, SOLADIO David et du Commandant BEYA se rendit au Ministère de la Justice. DIZOLELE Isaac était resté au cachot. Les personnes déléguées au Ministère étaient allées vérifier auprès du Secrétaire Général si la lettre en question était prête. Elle l’était effectivement. Le Gouverneur en fut aussitôt informé. Il ordonna alors qu’on lui amenât DIZOLELE Isaac. Celui-ci pénétra seul dans le Bureau du Gouverneur. Le Commandant BEYA présenta à Monsieur le Gouverneur la lettre provenant du Secrétaire Général. Ayant pris connaissance du contenu de cette lettre, il réalisa que le dossier de l’EUDA était conforme et que l’exercice du culte était bel et bien garanti à l’Église par les dispositions constitutionnelles. La lecture terminée, le Gouverneur se mit à taper son bic sur la table. Il prit une feuille de papier et écrivit à Monsieur le Bourgmestre de la Commune de Lemba afin de lui demander de libérer l’Homme de Dieu DIZOLELE Isaac dès réception de la lettre et sans condition. Il enjoignit au Commandant BEYA de le conduire chez lui, une fois libéré."
   ],
   [
    "p",
    "Quand toutes les formalités furent terminées, le Commandant BEYA le prit à bord de sa Jeep de commandement jusqu’à la maison communale de Lemba. Il était 20 heures. Le Commandant présenta au Bourgmestre la lettre du Gouverneur. Après lecture, Monsieur Jean-Pierre KAZIMA piqua une vive colère, se mit à tonner et à vociférer, disant : Je ne te rends pas tes documents. En plus, je te préviens que si, d’aventure, tu oses encore battre les tam-tam et si tu recommences à prier dans ma Commune, je reverrai le Gouverneur afin qu’on t’appréhendes de nouveau. Alors, je mettrai la main sur toi et te jetterai au cachot. Je te ferai battre à mort et te laisserai au cachot pendant trois jours sans manger ni boire. Et si tu meurs, je te jetterai dans le fleuve. As-tu compris ? Cela dit, Monsieur le Bourgmestre KAZIAMA Jean-Pierre le chassa comme un chien."
   ],
   [
    "p",
    "Le Commandant BEYA le prit de nouveau à bord de sa Jeep pour le conduire chez lui, sur Ngina. Entretemps, à la résidence du Prophète, une foule immense de fidèle y était réunie, chantant et glorifiant l’Éternel par des cantiques de louange, des cymbales et des tam-tam. À l’approche de la résidence de l’Homme de Dieu, ayant entendu le son des tam-tam, le Commandant BEYA demanda à Isaac : Où sommes-nous ? Il lui répondit : tout près de chez moi. Considérant les menaces proférées à Isaac par le Bourgmestre, le Commandant prit peur et l’abandonna à une certaine distance de sa résidence."
   ],
   [
    "p",
    "Quand l’Apôtre Suprême entra dans la parcelle, et que les fidèles l’aperçurent, ils poussèrent tous des cris de joie et chantèrent à la gloire de Dieu. Un culte d’action de grâces fut aussitôt organisé au cours duquel le Prophète expliqua à ses adeptes comment le Seigneur l’avait libéré. La joie fut totale. Et le Seigneur était glorifié."
   ],
   [
    "p",
    "Peu de temps après, DIZOLELE adressa une lettre de recours au Gouverneur de la Ville afin que ce dernier l’aidât à récupérer ses documents confisqués par le Bourgmestre ainsi que ceux de ses collaborateurs. La réaction du Gouverneur ne se fit pas attendre. En effet, il écrivit au Bourgmestre, lui intimant l’ordre de restituer les documents confisqués à leurs propriétaires sans condition et sans délai."
   ],
   [
    "p",
    "Fou de colère, le bourgmestre convoqua DIZOLELE Isaac. Dès qu’il l’aperçut, il se mit à gueuler sur lui, disant : Qui es-tu, toi ? Tu écris partout, partout et partout ! Cesse tes activités dans ma Commune sinon tu mourras. Puis il jeta par terre tous les documents qu’Isaac ramassa par-ci par-là."
   ],
   [
    "p",
    "Afin que l’Église de Dieu ne fût pas dérangée en tout moment, d’une part et d’autre part, pour mettre en sécurité la famille de SOKO KAPITA Daniel fortement menacée, DIZOLELE Isaac résolut de transférer le siège de la paroisse de Lemba à Matete. Le disciple DITOMENE DIAMBU-dia-NZAMBI Isaac, agent de Police, s’engagea librement et volontairement à accepter l’Église dans sa parcelle résidentielle, sise Quartier Bahumbu II, n°36. La paroisse de Lemba comprenait alors les communes de Matete, Kisenso, Ndjili, Masina, Kimbanseke, Nsele/Maluku et Lemba elle-même. C’était au premier trimestre de l’année 1972. C’est à partir de ce changement d’adresse que la paroisse sera appelée désormais « paroisse de Matete »."
   ],
   [
    "h2",
    "La décision du Bureau politique du M.P.R. (27 octobre 1971)"
   ],
   [
    "p",
    "Les états d’Afrique noire avaient connu plusieurs soubresauts politiques au lendemain de leur accession à l’indépendance. La République Démocratique du Congo, plus particulièrement, avait connu des fortunes diverses. Constamment agité, ce pays avait vécu dans une instabilité politique durant les cinq premières années de son indépendance. Le changement de régime intervenu le 24 novembre 1965 qui porta au pouvoir le Lieutenant-Général Joseph-Désiré MOBUTU, entraîna des profondes mutations au pays. Aussitôt élevé au piédestal du pouvoir, le jeune président mit sur pied un régime révolutionnaire fortement centralisé autour du Mouvement Populaire de la Révolution qui deviendra plus tard un Parti-État. Des réformes substantielles furent opérées dans tous les domaines vitaux du pays. Le parti contrôlait toute la vie nationale."
   ],
   [
    "p",
    "Guidé par l’idéologie du « Recours à l’authenticité », le régime prit en date du 27 octobre 1971 une importante décision restée gravée dans les annales de l’histoire du Congo. En effet, le Bureau Politique du Parti décida ce jour-là de changer le nom du pays et ses armoiries. Dès lors, la République Démocratique du Congo devint la République du Zaïre. Plusieurs villes, sites, avenues et autres furent débaptisés. Le Fleuve Congo prit le nom de Fleuve Zaïre. Les Congolais devenus Zaïrois furent contraints d’abandonner leurs prénoms étrangers pour revenir aux noms authentiques, ceux du terroir. L’habillement fut aussi réglementé. Les Zaïrois durent abandonner le port du costume et de la cravate au profit de l’abacos. Quant aux Zaïroises, il leur fut interdit de porter des pantalons et de mettre des perruques. Cette décision eut des implications dans la vie de tous les Zaïrois et dans toute la vie nationale."
   ],
   [
    "p",
    "Pour se conformer à cette décision politique, DIZOLELE Isaac, Chef spirituel de l’Église Universelle de Douze Apôtres opta pour le nom authentique de DIZOLELE-MPUNGU WAFIDUSWA. Chez les Kongo, chaque nom a une signification. En effet, « MPUNGU » représente en langue Kongo, le grand gorille de la forêt, bête féroce et terrifiant. C’est le roi de la forêt. « MPUNGU » signifie donc la « toute puissance ». De là, les ancêtres Kongo ont attribués à Dieu le qualificatif de « MPUNGU ». D’où l’expression « NZAMBI A MPUNGU » ou encore « MPUNGU TULENDO » pour désigner Dieu Tout-Puissant. Ainsi, DIZOLELE-MPUNGU WAFIDUSWA se traduit littéralement « Ce que Dieu veut, il a été envoyé ». En d’autres termes, « Il a été envoyé par la volonté de Dieu Tout-Puissant »."
   ],
   [
    "p",
    "La religion ayant été politisée, une nouvelle loi réglementant l’exercice des cultes en République du Zaïre fut promulguée le 31 décembre 1971."
   ],
   [
    "h2",
    "La loi n° 71-012 et la deuxième requête"
   ],
   [
    "p",
    "Le 31 décembre 1971, la Loi n°71-012 réglementant révolutionnairement l’exercice des cultes en République du Zaïre est promulguée. L’article 11 de cette Loi stipule ce qui suit : « Toutes les Églises et toutes les Sectes religieuses existant à cette date doivent endéans les 3 mois de l’entrée en vigueur de la présente Loi, réintroduire leurs dossiers conformément à la présente Loi, auprès du Ministère de la Justice pour une nouvelle agréation à l’exception de l’Église Catholique, de l’Église du Christ au Zaïre et de l’Église de Jésus-Christ sur la Terre par le Prophète Simon KIMBANGU »."
   ],
   [
    "p",
    "En janvier 1972, l’arrêté Ministériel n°002 du 7 janvier 1972 portant mesures d’exécution de la Loi réglementant l’exercice des cultes est rendu public. Cet arrêté stipule en ses articles 1er et 2 ce qui suit :"
   ],
   [
    "p",
    "Article 1er : À l’exception de l’Église Catholique, de l’Église du Christ au Zaïre et de l’Église de Jésus-Christ sur la Terre par le Prophète Simon KIMBANGU, toutes les autres Églises ou sectes religieuses existantes doivent réintroduire leurs dossiers au Ministère de la Justice avant le 15 février 1972."
   ],
   [
    "p",
    "Article 2: La requête en obtention de la personnalité civile à présenter en double exemplaire au Ministère de la Justice doit être accompagnée :"
   ],
   [
    "list",
    [
     "d’une liste indiquant les noms, prénoms, domicile ou résidence de tous les membres effectifs de l’Association ;",
     "d’une déclaration signée par la majorité des membres effectifs indiquant les noms, prénoms, profession et demeure de ceux qui, à un titre quelconque, sont chargés de l’administration ou de la Direction de l’Association ;",
     "des Statuts de l’Association ;",
     "d’un certificat de nationalité Zaïroise;",
     "d’un certificat médical attestant que le requérant est sain d’esprit ;",
     "d’un certificat des bonnes vies & moeurs ;",
     "d’un extrait d’un acte de naissance ;",
     "d’une copie conforme de diplôme de Théologie ou tout autre document attestant que le requérant a suivi avec succès pendant 4 ans l’enseignement religieux dans une école de théologie du pays ou de l’Etranger ;",
     "apporter la preuve que le Fondateur n’est pas un prêtre ou pasteur dissident ;",
     "d’un extrait bancaire d’un montant de 100.000 Zaïres (Cent mille Zaïres) en dépôt ;",
     "d’un document renfermant les principes fondamentaux ainsi que les lignes maîtresses de l’enseignement religieux à dispenser ;",
     "d’une déclaration relative aux ressources prévues par l’Église ou la secte en vue de réaliser l’objectif qu’elle s’assigne."
    ]
   ],
   [
    "p",
    "À la sortie de cet arrêté, plusieurs communautés requérantes perdirent l’espoir eu égard à la complexité des conditions exigées."
   ],
   [
    "p",
    "Cependant, se conformant à cet arrêté, DIZOLELE-MPUNGU WAFIDUSWA élabora un dossier et introduisit une requête (la deuxième) en obtention de la personnalité civile. À l’expiration du délai prévu à l’alinéa 1er de l’article précité, l’Église n’est pas agréée."
   ],
   [
    "p",
    "La Loi n°71-012 du 31 décembre 1971 donnera néanmoins aux Grandes Églises juridiquement reconnues au pays, le droit d’exiger la viabilité et la fiabilité doctrinales aux sectes concernées par cette mesure au cas où elles désireraient obtenir une affiliation auprès de ces Églises ou bénéficier d’une couverture leur permettant de poursuivre leur action d’évangélisation."
   ],
   [
    "p",
    "Concernant l’Église Universelle de Douze Apôtres, nonobstant la non acceptation de son dossier, force est de reconnaître que les étapes antérieurement franchies au niveau de différentes instances de la République avaient permis aux autorités de l’État de bien identifier l’Église et de se faire une juste appréciation de sa doctrine et des vertus comportementales de ses membres."
   ],
   [
    "h2",
    "La promesse du Seigneur : « Je vous aiderai »"
   ],
   [
    "quote",
    {
     "text": "Je vous aiderai, je vous aiderai, je vous aiderai.",
     "by": "Oracle reçu par le Prophète après le refus de 1972"
    }
   ],
   [
    "p",
    "Le non agrément de l’Église par l’État en 1972 plongea tous les fidèles de l’EUDA dans la désolation et la consternation. Le dessein de Dieu ne pouvant être compromis par l’esprit humain, le Seigneur apparut alors à son serviteur DIZOLELE-MPUNGU WAFIDUSWA et prononça à trois reprises cette parole rassurante : « Je vous aiderai, Je vous aiderai, Je vous aiderai, ». Cet oracle de l’Éternel le réconforta."
   ],
   [
    "p",
    "Dès que cette parole lui fut adressée, Son Eminence l’Apôtre Suprême réunit l’Église de Kinshasa et lui fit part de cette révélation divine. Ainsi, il fortifia la foi des fidèles et les exhorta à attendre dans la prière l’accomplissement de la promesse de Dieu. Il parcourut également toutes les paroisses du Bas-Zaïre pour édifier le troupeau de son pâturage et lui annoncer cette prophétie divine. Partout, il apportait le même message d’espoir. Ainsi la foi des fidèles fut raffermie."
   ],
   [
    "h2",
    "L’ordonnance n° 72-195 du 28 mars 1972"
   ],
   [
    "p",
    "Le 28 mars 1972, l’ordonnance n°72-195 accordant à certaines associations religieuses protestantes l’agrément prévu à l’article 11 de la Loi n°71-012 du 31 décembre 1971 réglementant l’exercice des cultes est promulguée."
   ],
   [
    "p",
    "Selon les prescrits de cette ordonnance, cet agrément est accordé à 79 associations religieuses protestantes regroupées d’office au sein de l’Église du Christ au Zaïre, tout en conservant leur propre personnalité juridique. Il s’agit des associations suivantes :"
   ],
   [
    "collapse",
    {
     "title": "Les associations protestantes agréées par l’ordonnance",
     "items": [
      "Communauté Armée du Salut",
      "Communauté Assemblée des frères au Shaba",
      "Communauté des Églises Baptistes Indépendantes",
      "Communautés des Églises Baptistes du Kivu",
      "Communauté des Églises des Frères Mennonites au Zaïre",
      "Communauté des Églises Baptistes de Bandundu",
      "Communauté des Églises Libres du Zaïre",
      "Communauté des Églises de Grâce au Zaïre",
      "Communauté Evangélique Mennonite au Sud-Kasaï",
      "Communauté des Églises de Pentecôte",
      "Communauté des Disciples du Christ au Zaïre",
      "Communauté Anglicane du Zaïre",
      "Communauté des Assemblées de Dieu au Zaîre",
      "Communauté Baptiste du Bas-Fleuve",
      "Communauté Baptiste du Bas-Uélé",
      "Communauté Baptiste du Zaïre Ouest",
      "Communauté Baptiste du Haut-Zaïre",
      "Communauté Baptiste au Moyen Fleuve",
      "Communauté du Christ au Zaïre",
      "Communauté du Christ en Ubangi",
      "Communauté Evangélique de l’Alliance au Zaïre",
      "Communauté Evangélique de Bereenne au Zaïre",
      "Communauté du Christ au Zaïre Oriental",
      "Communauté Evangélique du Haut-Zaïre",
      "Communauté Association des Églises Evangéliques de la Lulonga",
      "Communauté Evangélique du Zaïre",
      "Communauté Libre de Maniema-Kivu",
      "Communauté Evangélique du Kwango",
      "Communauté Libre Méthodiste au Zaïre",
      "Communauté Mennonite au Zaïre",
      "Communauté Méthodiste au Bas-Zaïre",
      "Communauté Méthodiste au Sud-Zaïre",
      "Communauté Pentecôte au Zaïre",
      "Communauté Presbytérienne au Zaïre",
      "Communauté Presbytérienne de Kinshasa",
      "Communauté Protestante Baptiste du Kivu",
      "Communauté Nord Sankuru",
      "Communauté Union Pentecostale des Missionnaires de Grande-Bretagne et d’Irland",
      "Communauté des Églises Baptistes du Kuilu",
      "Communauté Centrale du Christ en Afrique",
      "Communauté Presbytérienne du Kasaï-Orientale",
      "Communauté Evangélique et œuvres saintes",
      "Communauté Biblique Indépendante",
      "Communauté Union Evangélique au Zaïre",
      "Communauté Baptiste Biblique",
      "Communauté Méthodiste Libre au Zaïre",
      "Communauté Réformée du Zaïre",
      "Communauté Coopération Evangélique au Zaïre",
      "Communauté de Fraternité Evangélique de Pentecôte en Afrique au Zaïre",
      "Communauté des Martyrs Mission Africaine",
      "Communauté Protestante au Shaba",
      "Communauté Evangélique du Zaïre",
      "Communauté de notre Seigneur Jésus-Christ dans le Monde",
      "Communauté Evangélique Guérison par Christ",
      "Communauté Evangélique Luthérienne au Zaïre",
      "Communauté Union Evangélique",
      "Communauté Baptiste Libre",
      "Communauté Lumière",
      "Communauté des Fidèles Protestants",
      "Communauté Assemblée de Dieu de Pentecôte au Zaïre",
      "Communauté Baptiste Autonome entre Wamba-Bakadi",
      "Communauté Frères en Christ Garenganze",
      "Communauté Garenganze Evangélique Mission",
      "Communauté Assemblée des Frères Evangélique",
      "Communauté Evangélique de Pentecôte au Shaba",
      "Communauté Evangélique Africaine",
      "Communauté Luanza Mission",
      "Communauté Evangélisation Société Africaine",
      "Communauté Baptiste Mission Sud-Kwango",
      "Communauté Evangélique du Christ au Cœur d’Afrique",
      "Communauté Chrétienne en Afrique",
      "Communauté Mombasa",
      "Communauté d’Associations des Églises du Sud-Kasaï",
      "Communauté Protestante Baptiste Episcopale au Zaïre",
      "Communauté Assemblée de Dieu à l’Est du Zaïre",
      "Communauté Evangélique de l’Ubangi",
      "Communauté Zaïre Inland Mission",
      "Communauté Evangélique des Adventistes du septième jour",
      "Communauté African Inland Mission"
     ]
    }
   ],
   [
    "p",
    "À la publication de cette liste, les Églises et les Sectes qui n’avaient pas été agréées furent dissoutes de plein droit."
   ],
   [
    "p",
    "L’Église Universelle de Douze Apôtres dont le nom ne figurait pas sur cette liste fut aussi dissoute de plein droit et ses activités interdites sur toute l’étendue de la République du Zaïre."
   ],
   [
    "p",
    "Dès lors, le chemin du calvaire s’ouvrit pour l’Église qui fut exposée à tous les aléas. Ainsi elle oscilla entre la vie et la mort. L’inquiétude et l’épouvante gagnèrent les esprits, d’autant plus que la Loi n°71-012 du 31 décembre 1971 réglementant l’exercice des cultes prévoyait en son article 10, alinéa 2 ce qui suit : « Sera puni d’une servitude pénale principale de 5 à 10 ans et d’une amende de 500 Z à 1.000 Z quiconque aura participé au maintien ou à la reconstitution directe ou indirecte d’une Église ou d’une Secte dissoute par application du présent article »."
   ],
   [
    "p",
    "Le danger était donc là, réel et permanent. L’Église était obligée de reprendre le chemin de la clandestinité comme autrefois."
   ],
   [
    "p",
    "Voyant venir l’adversité, DIZOLELE-MPUNGU WAFIDUSWA, garant du patrimoine prophético-apostolique lui confié par Dieu, se consacra entièrement à relever le moral des fidèles et à consolider leur foi. Bravant tous les dangers, il fit une tournée dans toute l’Église de Kinshasa et du Bas-Zaïre, exhortant les membres à la persévérance et au courage face aux épreuves."
   ],
   [
    "p",
    "Comme il fallait s’y attendre, l’Église fut bientôt en proie à des violentes persécutions de la part des gouvernants en application de cette fameuse loi. Plusieurs vagues d’arrestations secouèrent l’Église. Les adeptes furent jetés l’un après l’autre en prison. Dans la province du Bas-Zaïre où les persécutions furent systématiques, l’Église de Matadi connut une régression remarquable. Dans le Bas-Fleuve, plus précisément à Boma et dans le Mayumbe, les paroisses furent fermées voire détruites par les agents de l’ordre. Epouvantés par ces persécutions, particulièrement les arrestations, plusieurs membres avaient dû renoncer à leur foi. Ainsi le développement tant matériel que spirituel de l’Église avait été un moment hypothéqué."
   ],
   [
    "h2",
    "L’attitude de l’Église de Matadi"
   ],
   [
    "p",
    "Après la promulgation de l’ordonnance du 28 mars 1972 accordant à certaines associations religieuses d’obédience protestante la reconnaissance juridique, le voile d’angoisse tomba de nouveau dans l’Église Universelle de Douze Apôtres, condamnée par la loi à la dissolution pour n’avoir pas été agréée."
   ],
   [
    "p",
    "L’Église de Matadi particulièrement affectée par cette situation exprima bien des remords. Se référant alors à la promesse du Seigneur à son Oint DIZOLELE-MPUNGU WAFIDUSWA : « je vous aiderai », les serviteurs de Matadi dont la foi devint vacillante au point de perdre confiance au Prophète, se réunirent et mandatèrent les Apôtres NKONGO MBENZA et MABETI KUMBANZILA, à Kinshasa, auprès de Son Eminence l’Apôtre Suprême pour lui demander pourquoi cette promesse du Seigneur n’avait pas produit le résultat attendu. Quel péché avons-nous commis afin que l’Église ne soit point agréée ? Se demandaient-ils."
   ],
   [
    "p",
    "Les envoyés arrivèrent à Kinshasa et transmirent fidèlement à Tata Nkuluntu DIZOLELE-MPUNGU WAFIDUSWA le message dont ils étaient porteurs. Peiné et choqué par leurs propos, il leur répondit qu’il n’avait fixé aucun délai mais que Dieu seul savait le moment où il réaliserait sa promesse. Sur ce, il les congédia et ils retournèrent à Matadi. Suite à cette situation, l’Église de Matadi connut une forte régression : plusieurs serviteurs avaient démissionné au nombre desquels on peut citer : l’Apôtre MANKI Michel, les prédicateurs MPAKA VANGU Samuel, MASANGA André, le disciple NGOMA MBUKA Raphaël. Devant cette démission des membres du clergé, la peur s’empara d’un grand nombre de fidèles qui renoncèrent à leur foi."
   ],
   [
    "p",
    "Le Chef de l’Église entreprit alors une tournée dans toutes les paroisses de l’Église Universelle de Douze Apôtres en vue de raffermir la foi des fidèles et de les exhorter à croire à la promesse divine. Hormis l’agitation observée à Matadi, la situation demeura calme dans l’ensemble de l’Église en dépit des persécutions."
   ],
   [
    "h2",
    "Le temps des arrestations"
   ],
   [
    "p",
    "Dès que la mesure sanctionnant la dissolution de l’Église fut promulguée, les Services de Sécurité se mirent en action pour traquer, décourager et, le cas échéant, arrêter le peuple de Dieu. Les fidèles de l’Église Universelle de Douze Apôtres furent mis en mal. A Matadi, plus précisément, la pression exercée sur l’Église par les agents de Sécurité était si vive que même les serviteurs furent épouvantés. Et les fidèles l’étaient à plus forte raison. Par conséquent, les cultes publics cédèrent la place aux petites assemblées clandestines. Les serviteurs courageux passaient de maison en maison exhorter les fidèles, au péril de leur vie."
   ],
   [
    "h3",
    "Matadi : l’arrestation de l’Apôtre KASA LUSALA NLANDU (juillet – décembre 1974)"
   ],
   [
    "p",
    "KASA LUSALA NLANDU, Responsable de l’Église de Matadi était longtemps épié par les services de sécurité qui cherchaient une occasion favorable pour se saisir de lui et l’inculper. C’est ainsi qu’un jour, il fut convoqué par l’Administrateur de la sécurité. À la question de savoir s’il continuait à exercer ses activités religieuses, l’Apôtre KASA LUSALA NLANDU déclara : « Avant la dissolution de l’Église par la loi, j’en étais un des responsables. Mais depuis que la mesure d’interdiction est tombée, nous avons cessé toute activité. Nous avons fermé l’Église et plus rien ne se fait ». Après cette déclaration, l’Administrateur le prévint de manière claire que le jour où on le surprendrait en train de prier, il serai arrêté sur le champ et acheminé en prison. Sur ce, il fut relâché et congédié."
   ],
   [
    "p",
    "Le soir même, il réunit tous les serviteurs de Matadi pour leur annoncer qu’il avait déclaré devant l’autorité politique que l’Église était fermée et avait cessé d’exercer toutes ses activités spirituelles. Il fallait donc en tirer toutes les conséquences."
   ],
   [
    "p",
    "Cette nouvelle jeta la panique au sein de l’Église. Tous les esprits furent troublés. Ainsi la peur atteignit son paroxysme. La paroisse ferma ses portes."
   ],
   [
    "p",
    "Conscient de la gravité de sa déclaration devant l’autorité politique, l’Apôtre KASA LUSALA NLANDU, se sentant coupable de trahison, décida d’en informer le Chef de l’Église par écrit. Quand l’Apôtre Suprême entra en possession de la lettre et qu’il en prit connaissance, grande fut sa surprise. Très indigné du comportement de son collaborateur, il fit parvenir à KASA LUSALA NLANDU un télégramme l’invitant à monter à Kinshasa dans l’immédiat. Aussitôt arrivé, il raconta au Chef de l’Église les faits tels qu’ils s’étaient passés. Prenant alors la parole, l’Envoyé de Dieu lui demanda : l’Église dont vous avez déclarée la fermeture, est-ce celle dont vous êtes le fondateur ou celle que j’ai créée par la volonté de Dieu ? Ainsi, je vous ordonne maintenant de rentrer à Matadi et d’aller déclarer solennellement devant l’Administrateur que l’EUDAC fonctionne et exerce toutes ses activités spirituelles normalement. Si vous résistez à cet ordre, je vous destitue et vous révoque. Sans broncher, il s’agenouilla et demanda à l’Envoyé de Dieu de prier pour lui. Il lui imposa les mains. Après cette bénédiction, il reçut la force spirituelle qu’il lui permit de braver tous les périls qui l’attendaient."
   ],
   [
    "p",
    "Arrivé à Matadi, il réunit tous les serviteurs à son domicile et leur fit savoir que l’Apôtre Suprême l’avait enjoint d’aller reconnaître devant l’Administrateur que l’Église fonctionnait normalement. Et que s’il refusait de le faire, il le révoquerait sans autre forme de procès. Quand les serviteurs entendirent cela, ils furent tous scandalisés voire abasourdis et dirent : Assurément, cet homme cherche notre malheur et notre mort."
   ],
   [
    "p",
    "Le lendemain, il se présenta devant l’Administrateur et lui dit : Monsieur l’Administrateur, je me présente aujourd’hui devant vous pour vous dire que l’EUDAC a été, certes, dissoute par la loi mais en dépit de cela, elle n’a jamais cessé d’exercer ses activités. Nous continuons à prêcher la parole du salut et à prier le Dieu qui a crée le ciel et la terre. Je récuse donc ma première déclaration faite sous les effets de la peur."
   ],
   [
    "p",
    "Sur le champ, l’Administrateur lui demanda de mettre par écrit sa déclaration. Il s’exécuta. L’Administrateur le congédia et lui demanda de rentrer le jour suivant. Entretemps, l’autorité politique fit dactylographier sa déclaration. Le lendemain, dès qu’il se présenta, l’Administrateur lui fit lire sa déclaration et lui demanda de la signer. Après l’avoir signée, il fut mis aux arrêts. L’autorité fit venir du camp militaire Ango-ango une Jeep bondé de soldats. On le jeta à bord et on l’achemina jusqu’à son domicile où l’on procéda à une perquisition systématique. Tous les documents important de l’Église, notamment la machine à écrire et divers autres effets, furent emportés. Après cette sale besogne, on l’achemina en prison où il fut incarcéré sans jugement. C’était en juillet 1974."
   ],
   [
    "p",
    "Quand la nouvelle de l’arrestation de l’Apôtre KASA LUSALA NLANDU parvint aux quatre coins de Matadi, tous les fidèles de l’Église furent en émoi."
   ],
   [
    "p",
    "Cette arrestation réveilla la conscience de tous les adeptes de l’EUDAC/ Matadi et suscita un élan hors du commun. Chaque jour, les fidèles affluaient à la prison central pour apporter leur soutien moral et matériel au serviteur de Dieu."
   ],
   [
    "p",
    "Informé de cette arrestation, l’Apôtre Suprême descendit en personne à Matadi pour réconforter le moral de son collaborateur emprisonné. Durant son séjour dans cette ville, il s’employa à remonter le moral des membres et à les exhorter à la persévérance."
   ],
   [
    "p",
    "Aux serviteurs réunis, il dit de ne point relâcher mais de persévérer car le Seigneur avait promis qu’il aiderait son Église. Après ces exhortations, il prit congé d’eux et poursuivit sa ronde dans les autres entités ecclésiales du Bas-Zaïre, leur apportant tous le même message d’espoir."
   ],
   [
    "p",
    "Il sied de souligner cependant, qu’à Matadi, les agents de la sécurité épiaient l’homme de Dieu et cherchaient à se saisir de lui. En effet, chaque fois qu’il débarquait à Matadi, ils tentaient de mettre la main sur lui mais Dieu qui protégeait son serviteur ne le leur permettait pas."
   ],
   [
    "p",
    "En prison, l’Apôtre KASA LUSALA NLANDU se distingua par ses qualités d’homme de Dieu. Son charisme impressionna tout le monde. Il enseignait la parole de Dieu aux prisonniers, imposaient les mains aux malades et ils guérissaient. De cette manière, il gagna plusieurs âmes au Seigneur. L’encadrement dont il était l’objet de la part de l’Église, attira l’attention des responsables de la prison et d’autres personnes. L’Église en fut très honorée."
   ],
   [
    "p",
    "En décembre 1974, il fut libéré après quatre mois et demi de détention sans procès. Ainsi, il recouvra sa liberté à la satisfaction générale. KASA LUSALA NLANDU se remit au service de Dieu avec un zèle nouveau. Depuis lors, l’Église de Matadi évolua dans le quiétude en dépit de quelques intimidations et ce, jusqu’à l’obtention de la personnalité civile."
   ],
   [
    "h3",
    "Boma : l’arrestation des serviteurs (octobre 1974 – février 1975)"
   ],
   [
    "p",
    "En octobre 1974, MBUNGU-MBIZI, Apôtre Inspecteur chargé du District du Bas-Fleuve et de la Ville de Matadi partit de Mbanza-Ngungu (son lieu de résidence) pour Boma où il devait procéder à la nomination des serviteurs de Dieu. Quelques frères de l’Église de Matadi en l’occurrence l’Apôtre BADILA, les prédicateurs NGUNDA MAKAYI, DILU NDUENGA et MFUKUMOKO effectuèrent le déplacement avec lui en vue de donner à cette cérémonie une certaine solennité."
   ],
   [
    "p",
    "Le dimanche, à Boma, un grand culte fut organisé au cours duquel le disciple Norbert NKUELO fut élevé au rang de prédicateur tandis que le frère PFITI NGOYI était nommé disciple. Environ 300 personnes avaient assisté à cet important culte. Cela éveilla, certes, l’attention de l’autorité politique. Aussitôt, la machine répressive du pouvoir s’ébranla. Dès lors, l’Apôtre MBUNGU- MBIZI fut épié. Les serviteurs venus de Matadi regagnèrent la ville portuaire après la cérémonie, à l’exception de NGUNDA MAKAYI qui fut retenu à Boma par l’Apôtre MBUNGU-MBIZI. Celui-ci avait encore besoin de sa compagnie."
   ],
   [
    "p",
    "Le lundi matin, après le petit déjeuner qui leur fut servi chez le prédicateur BABAKA MAYALA, l’Apôtre MBUNGU-MBIZI se rendit à la Banque Commerciale Zaïroise (B.C.Z.) où était logé son compte. Il était accompagné du prédicateur NGUNDA MAKAYI et de son jeune frère MBUNGU NTATUKILA alors élève au Groupe Scolaire de la Côte à Muanda (G.S.CO.M). Après qu’il eut retiré son dû à la Banque, l’Apôtre MBUNGU-MBIZI décida d’aller rendre visite au disciple KHONDE KINKELA, jeune pharmacien fraîchement sorti de l’université Lovanium, qui gérait la pharmacie BIZOPHARM, située en face de la maison communale de Kalamu. Honoré de recevoir dans son bureau cet éminent homme de Dieu, le disciple KHONDE KINKELA s’empressa de solliciter la parole de Dieu et la bénédiction auprès de l’Apôtre MBUNGU-MBIZI."
   ],
   [
    "p",
    "À l’instant même, d’autres frères, ayant aperçu l’Apôtre dans le bureau du pharmacien, l’y suivirent. Un petit groupe se constitua autour de lui. Ainsi, un culte fut organisé en ce lieu même. Il regroupa les personnes ci-après : l’Apôtre MBUNGU-MBIZI, le prédicateur NGUNDA MAKAYI, le disciple KHONDE KINKELA, le sage MPUKU, Mr. KANDA MBUMBA, Mr. MVEMBA NIMI, une jeune employée de la pharmacie et le jeune MBUNGU NTATUKILA ; venu de Muanda rencontrer son frère aîné MBUNGU-MBIZI pour raison des frais scolaires."
   ],
   [
    "p",
    "Au moment où l’Apôtre exhortait le peuple de Dieu réuni autour de lui, survint le Commissaire de Zone Assistant de Kalamu avec les éléments de la J.M.P.R. (Jeunesse du Mouvement Populaire de la Révolution) milice du Parti-État. C’était aux environs de 12 heures. Ayant fait irruption dans la salle, le Commissaire de Zone Assistant posa intempestivement la question : « Que faites-vous ici ? »"
   ],
   [
    "lines",
    [
     "L’Apôtre MBUNGU-MBIZI lui répondit : « Nous prions ».",
     "Comment s’appelle votre Église ? enchaina-t-il",
     "Église Universelle de Douze Apôtres, lui rétorqua l’Apôtre.",
     "Avez-vous une reconnaissance Juridique ? poursuivit-il",
     "Non, Citoyen Commissaire de Zone, nous n’avons pas de personnalité civile. Toutefois, les démarches sont en cours en vue de l’obtenir, déclara l’Apôtre.",
     "Comme il en est ainsi, vous êtes en infraction. Et pour avoir enfreint la loi, j’ordonne votre",
     "arrestation, conclut-il.",
     "Merci beaucoup, Citoyen Commissaire de Zone, lui répondit l’Apôtre, mais permettez-moi de terminer mon travail."
    ]
   ],
   [
    "p",
    "Le Commissaire de Zone ne broncha pas. Il resta debout devant la porte du bureau du pharmacien jusqu’à la fin du culte. Alors, il pria l’Apôtre et tout son groupe de le suivre au Bureau de la Zone situé non loin de là. Cependant, il interdit aux éléments de la J.M.P.R. de brutaliser les détenus. C’était le 21 octobre 1974."
   ],
   [
    "p",
    "Arrivés au Bureau de la Zone, les détenus furent soumis chacun à un interrogatoire pour l’instruction du dossier. Cette opération débuta à 14 heures et se poursuivit jusqu’à 18 heures. Toute la journée fut entièrement consacrée à cela."
   ],
   [
    "p",
    "Ayant appris l’arrestation de l’Apôtre MBUNGU-MBIZI et de ses compagnons, les fidèles de l’Église de Boma se dressèrent comme un seul homme et prirent d’assaut la maison communale de Kalamu. L’affluence des gens était telle que l’autorité municipale s’en inquiéta."
   ],
   [
    "p",
    "L’instruction des dossiers n’étant pas terminée le jour même, le Commissaire de Zone ordonna de garder les détenus au cachot de la Zone. Malheureusement, il était bondé de monde. Aussi fut-il contraint de demander aux détenus de rentrer chez eux et de revenir le lendemain à 8 heures pour la poursuite de l’instruction."
   ],
   [
    "p",
    "Le soir, toute l’Église de Boma se rassembla chez le prédicateur BABAKA MAYALA où se tint un grand culte. L’Apôtre MBUNGU-MBIZI fortifia l’esprit des fidèles, les exhortant à persévérer dans la foi et disant que c’est par beaucoup de tribulations qu’il nous faut entrer dans le royaume de Dieu."
   ],
   [
    "p",
    "Le lendemain, tous les détenus furent présents à la Zone. L’instruction reprit derechef. Comme la veille, elle se poursuivit jusqu’au soir. Ne pouvant trancher sur cette affaire, le Commissaire de Zone décida de s’en remettre à sa hiérarchie, c’est-à-dire au Commissaire Sous-Régional. Ce jour-là encore, les détenus furent libérés et autorisés d’aller dormir chacun chez lui."
   ],
   [
    "p",
    "Le soir, on organisa de nouveau un culte qui regroupa plusieurs personnes."
   ],
   [
    "p",
    "Le troisième jour, ils rentrèrent à la Zone attendre la décision de la hiérarchie. Vers 10 heures, les détenus sont acheminés sous escorte militaire au Bureau du Commissaire sous- Régional en passant, bien sûr, par le Centre commercial. La foule, voyant des personnes escortées par les militaires et les éléments de la J.M.P.R. fortement armés, se demandait quel délit elles avaient commis. En apprenant qu’elles étaient arrêtées pour avoir prié, la population s’indigna. Elle fut même sur le point de se révolter."
   ],
   [
    "p",
    "Ils arrivèrent chez le Commissaire Sous-Régional qui jugea bon qu’ils fussent entendus par le Chef de Division Sous-Régional. Ce dernier interrogea l’Apôtre MBUNGU-MBIZI en ces termes : « Quel Dieu priez-vous ? ». Et lui, de lui répondre : « Nous prions le Dieu qui a créé le ciel, la terre et tout ce qui s’y trouve et qui t’a créé toi aussi ». À ces mots, il ne posa plus d’autres questions et les envoya au Parquet pour qu’ils fussent entendus."
   ],
   [
    "p",
    "Là, ils furent accueillis par des militaires qui les dépouillèrent de tous les biens qu’ils détenaient par – dévers eux. Immédiatement, ils furent jetés au corps de garde pendant 30 minutes. Quelques instants après, on les fit sortir et on les achemina au Bureau du Ministère Public où l’on reprit l’instruction des dossiers. Chaque détenu déclinait son identité et déclarait solennellement à quelle Église il appartenait. Ce travail se poursuivit jusqu’au soir. À 18 heures, la séance fut suspendue. Les détenus furent conduits au cachot central du parquet où étaient gardées toutes les personnes ayant commis divers délits. Les hommes de Dieu furent aussi mis au cachot avec les malfaiteurs. 30 minutes après, le responsable de garde demanda à l’Apôtre MBUNGU-MBIZI et au prédicateur NGUNDA MAKAYI de sortir du cachot. Voyant l’attitude bienveillante du soldat de garde à leur égard, l’Apôtre MBUNGU-MBIZI plaida en faveur du disciple KHONDE KINKELA afin que lui aussi fût mis dehors. Le gardien consentit. Ils furent installés sur le banc qui était en face. Les autres frères détenus furent, eux, gardés au cachot."
   ],
   [
    "p",
    "Les fidèles de l’Église qui avaient aussi pris d’assaut le Parquet apportèrent leur soutien moral et matériel aux serviteurs de Dieu arrêtés. Comme bien d’entre eux avaient apporté de la nourriture, le prédicateur PHAMBU NIMI, homme courageux et entreprenant, conclut un arrangement avec les soldats de garde afin qu’on servît les détenus. Cela fut autorisé. Ainsi ils mangèrent et les militaires aussi. Quand ils eurent fini de manger, les détenus retournèrent au cachot. Relevons cependant que l’Apôtre MBUNGU-MBIZI, le prédicateur NGUNDA MAKAYI et le disciple KHONDE KINKELA, eu égard à leur rang social (1) ne passèrent pas la nuit au cachot. Ils furent logés dans une cellule de la prison qui était plus décente. Tandis que les autres détenus passèrent la nuit au cachot où ils subirent bien des désagréments."
   ],
   [
    "p",
    "Le jour qui suivit, vers 7 heures, ils furent ramenés au parquet pour la poursuite de l’instruction des dossiers par le substitut du procureur, un certain KASHIALA. Ils y restèrent jusqu’au soir."
   ],
   [
    "note",
    "– MBUNGU-MBI était Directeur d’École primaire officielle, cadre Sous-Statut NGUNDA MAKAYI était douanier KHONDE KINKELA, Cadre Universitaire, Pharmacien"
   ],
   [
    "p",
    "Il importe de souligner que l’un des détenus, une jeune fidèle qui avait subi une forte pression de la part de ses parents afin qu’elle abandonnât l’E.U.D.A., renia sa foi quand le substitut du Procureur lui posa la question suivante : « Citoyenne, voulez-vous continuer à prier dans cette Église non reconnue ? Si vous dites oui, vous continuerez à être détenue. Si vous dites non, vous êtes acquittée ». Prenant la parole, elle déclara solennellement ce qui suit : « Citoyen Substitut du Procureur, je ne continue plus à prier dans cette Église. Je ne savais pas qu’elle n’avait pas de personnalité civile. Si je l’avais su, je n’y serais pas entrée » Après cette déclaration, elle fut acquittée sans autre forme de procès. Hormis celle-là qui devint un renégat, les autres détenus gardèrent leur foi et manifestèrent leur attachement à Dieu et à l’Église, envers et contre tous. Après cette comparution, les détenus furent remis au cachot."
   ],
   [
    "p",
    "Le matin du jour suivant, ils se présentèrent de nouveau au parquet pour entendre les conclusions du jugement. Le verdict ne sera rendu que vers 17 heures. La décision suivante fut prononcée : L’Apôtre MBUNGU-MBIZI et le prédicateur NGUNDA MAKAYI, responsables du groupe et qui n’avaient pas de résidence à Boma furent retenus en prison comme prévenus occupés avec le frère MVEMBA NIMI de Boma qui ne détenait par - dévers lui aucune pièce d’identité. Tandis que le disciple KHONDE KINKELA, le sage MPUKU, les frères KANDA MBUMBA et MBUNGU NTATUKILA furent déclarés prévenus libres. Insatisfait de cette décision, le prévenu KHONDE KINKELA sollicita au Substitut du Procureur d’être mis, lui aussi, en prison avec ses conducteurs pour la gloire du Seigneur. À cela, l’Apôtre MBUNGU-MBIZI s’opposa sachant qu’il leur serait plus utile tout en étant libre d’autant plus que certains magistrats qui traitaient le dossier étaient ses collègues de promotion à Lovanium."
   ],
   [
    "p",
    "Après que les juges eurent prononcé leur jugement, les trois prévenus occupés furent acheminés manu militari en prison vers 18 heures. Ils y furent écroués pendant trois mois. Il y a lieu de noter que durant tout ce temps, l’Église de Boma se mobilisa pour apporter un soutien sans faille à ces vaillants ministres de Dieu arrêtés pour la cause du Christ. Quoique sous les verrous, ceux-ci ne manquaient de rien. Chaque jour, les gens affluaient à la prison centrale de Boma témoigner leur solidarité aux détenus. Certaines personnes partaient des villes lointaines pour venir réconforter les hommes de Dieu dans les chaînes. Cela interpella la conscience des responsables de la prison qui comprirent qu’ils avaient affaire à de vrais hommes de Dieu. Par ce fait même, l’Église fut prise au sérieux, honorée et connue."
   ],
   [
    "p",
    "Régulièrement des audiences étaient convoquées par le Ministère public. Les prévenus libres et occupés devaient comparaître. À la dernière audience qui se tint le 2 février 1975, le Ministère public prononça en vertu de la loi l’acquittement pur et simple de tous les prévenus libres et occupés. L’affaire fut close. Ainsi l’Apôtre MBUNGU-MBIZI, le prédicateur NGUNDA MAKAYI et le frère MVEMBA NIMI recouvrèrent leur liberté. Cette libération fut fêtée par l’Église de Boma et fut un sujet de joie pour l’Église tout entière. En effet, Dieu venait d’être glorifié à travers ses serviteurs."
   ],
   [
    "h3",
    "Kinshasa : les arrestations de Kimbanseke et de Ndjili"
   ],
   [
    "p",
    "Evoluant en pleine capitale de la République du Zaïre, l’Église de Kinshasa n’avait pas échappé aux tracasseries policières et administratives consécutives à la mesure d’interdiction qui frappait l’Église. Elle avait aussi connu ses moments d’épreuves. Quand bien même les persécutions y furent sporadiques, les menaces étaient néanmoins permanentes. Les serviteurs de Dieu se déplaçaient de maisons en maisons pour exhorter les membres. Les tam-tam et les cymbales cessèrent de résonner. Les fidèles chantaient à mi-voix. Les paroisses fermèrent leurs portes. À savoir qu’à l’époque il n’y en avait que deux : la paroisse de Mbuka-Sika et la paroisse de Matete. La première, c’est-à-dire Mbuka-Sika était implantée à l’Ouest de la Capitale. Elle englobait entre autres les zones ou communes suivantes : Makala, Kalamu, Bumbu, Selembao, Ngiri-Ngiri, Kinshasa, Kasa-Vubu, Barumbu, Ngaliema, Lingwala, Gombe… La seconde (Paroisse de Matete) était située à l’Est de Kinshasa. Elle couvrait les zones de Lemba, Matete, Kisenso, Ndjili, Kimbanseke, Masina, Limete, Maluku…"
   ],
   [
    "p",
    "L’Église implantée dans la partie Ouest de la capitale connut moins de tracas. On y observa une légère accalmie. En effet, les responsables de ces entités municipales étaient apparemment plus modérés et se préoccupaient un peu moins des problèmes de culte. Pour ce faire, les cultes se tenaient de temps en temps quoique de façon timide. Les persécutions étant moins violentes, les adeptes ont demeuré dans la foi."
   ],
   [
    "p",
    "À l’Est, par contre, les choses se passèrent différemment. En effet, certaines autorités municipales de cette partie de la capitale se comportèrent en véritables bourreaux. Très zélés à défendre la révolution mobutiste, ces hommes-là avaient mené une guerre sans merci contre l’Église. Ils avaient intimidé, menacé et arrêté les hommes de Dieu. Déjà, en septembre 1971, Monsieur Jean-Pierre KAZIAMA, Bourgmestre de la Commune de Lemba s’était distingué en faisant arrêter le Prophète de Dieu, Tata Nkuluntu DIZOLELE-MPUNGU WAFIDUSWA. Ainsi, les activités de l’Église connurent un ralentissement sinon un arrêt dans cette partie de la capitale. Les fidèles vacillants, craignant de se faire arrêter, renoncèrent à leur foi. Les audacieux, plus nombreux, avaient persévéré. Bravant tous les dangers, ils avaient accepté de souffrir dans leur chair et, le cas échéant, de mourir pour Christ."
   ],
   [
    "p",
    "Il y a lieu d’indiquer qu’il y eut deux vagues d’arrestations dans la partie Est de la capitale. La première avait sévi dans la Zone de Kimbanseke. Tandis que la seconde déferla à Ndjili."
   ],
   [
    "h3",
    "Kimbanseke (juillet 1973)"
   ],
   [
    "p",
    "L’action d’évangélisation menée dans la Zone de Kimbanseke par les serviteurs de l’Église Universelle de Douze Apôtres avait abouti à l’implantation de cette confession religieuse dans cette partie de la capitale. Aussitôt une section, dirigée par le prédicateur LUKANU-mu-MAMBOTE, y fut installée. Fonctionnant sans personnalité civile, l’Église était exposée à tous les périls."
   ],
   [
    "p",
    "Profitant de cette faiblesse juridique, les autorités municipales se mirent bientôt à traquer et à intimider les fidèles de l’E.U.D.A. L’action déstabilisatrice savamment orchestrée par ces autorités se solda par l’arrestation des membres de l’Église en juillet 1973."
   ],
   [
    "p",
    "En effet, les gens mal intentionnés accusaient l’Église de tous les péchés auprès des autorités. Les ennemis de Dieu montaient des cabales dans le but de mettre en péril l’œuvre divine et d’exposer les serviteurs de Dieu à l’opprobre et à l’ignominie. Dans leurs intentions funestes, ils visaient la disparition pur et simple de l’Église. En tout cas, il était difficile de comprendre les raisons d’une telle hostilité à l’égard de l’E.U.D.A. d’autant plus que le comportement des dirigeants et des membres de cette Église était irréprochable. C’est donc le diable qui agissait pour contrecarrer la vérité prêchée par le KCC."
   ],
   [
    "p",
    "Un soir, vers 18 heures, revenant du service, le prédicateur LUKANU-mu-MAMBOTE, chef de section, fut informé par son épouse et les fidèles réunis en son domicile que deux véhicules bondés de soldats avaient pénétré dans leur avenue vers 15 heures à la recherche d’un homme non identifié. Informé, le prédicateur LUKANU-mu-MAMBOTE qui ne se sentit pas concerné par cette situation y accorda peu d’attention et garda son calme."
   ],
   [
    "p",
    "Après un petit repos, il réunit les fidèles pour la prière. Étant ainsi rassemblés, ils reçurent la visite des prédicateurs MANENGA MAMPUYA et MAKIONA KIDEDE. Très satisfait de leur présence, le prédicateur LUKANU-mu-MAMBOTE tendit la Bible au prédicateur MAKIONA KIDEDE et lui demanda de prêcher. À l’instant même, surgirent deux véhicules pleins d’éléments de la J.M.P.R./Milice du pouvoir qui s’immobilisèrent devant la maison où les fidèles étaient réunis. Ces agents du pouvoir se mirent à vociférer : « Vous complotez contre le Président MOBUTU. Vous voulez tuer le Chef de l’État. Vous êtes de faux hommes de Dieu. Vous allez voir… ». Sous de violentes menaces, ils les évacuèrent de la maison et les traînèrent jusque dans les véhicules. Ceux qui furent appréhendés sont les suivants :"
   ],
   [
    "list",
    [
     "Le prédicateur LUKANU-mu-MAMBOTE",
     "Le prédicateur MAKIONA KIDEDE",
     "Le Prédicateur MANENGA MAMPUYA",
     "Le disciple NZOLANI MUKANDA",
     "Le disciple NDANGANI Martin",
     "Le Disciple MAMINGI",
     "Le frère BENGA BENGLEDET",
     "Le frère MAKUNDA",
     "La diaconesse LUZOLO-mu-MAMBOTE",
     "Madame BAKUIKA MAKIONA Louise"
    ]
   ],
   [
    "p",
    "Ils furent acheminés à 20 heures à la Police Judiciaire de la Zone de Ndjili où ils furent retenus pour être entendus. Leurs bourreaux les accusaient faussement d’avoir comploté en vue de renverser le Chef de l’État."
   ],
   [
    "p",
    "Ainsi le prédicateur LUKANU, chef du groupe, fut soumis à un interrogatoire. L’officier de Police Judiciaire lui demanda : Etes-vous le responsable de ce groupe ?"
   ],
   [
    "lines",
    [
     "Il répondit : Oui !",
     "Qui êtes-vous dans cette Église ? enchaîna l’O.P.J.",
     "Je suis prédicateur dans cette Église et Chef de section, répondit le prédicateur LUKANU.",
     "Tu tiens des réunions clandestines pour tuer le président MOBUTU ?",
     "Pas du tout, répliqua le prédicateur LUKANU. Ils nous ont surpris en train de prier Dieu et rien d’autre.",
     "Tu mens, rétorqua l’O.P.J. Nous avons des preuves de votre complot. Aussitôt il fit sortir une lettre anonyme déposée au poste de la police dans laquelle il était écrit ce qui suit : « Nous, militantes et militants du parti, vous informons que ces hommes de l’E.U.D.A. ne prient pas Dieu mais, en réalité, ils ourdissent un complot contre le Président-Fondateur du M.P.R., Président de la République en vue de son élimination physique. De temps en temps, ils se rendent au Congo-Brazzaville pour nouer des alliances avec les hommes du Président Marien NGOUABI. Nous, militants du M.P.R., vous demandons d’ouvrir l’œil et d’être vigilants. À bon entendeur, salut ! ».",
     "Après l’audition de ce tract, l’O.P.J. dit au prédicateur LUKANU-mu-MAMBOTE : Tu as suivi, n’est- ce pas ? Avec ça, sais-tu que tu vas mourir ?A cette question, il ne répondit rien. Et l’O.P.J. d’enchaîner : Vu la gravité de l’affaire, sache que si tu arrives à l’Hôtel de Ville, tu n’échapperas pas à la mort. Alors veux-tu qu’on te sauve ?",
     "Le prédicateur LUKANU répondit : Je ne sais que faire. Faites ce que bon vous semble car j’ignore totalement pourquoi nous sommes arrêtés. Nous sommes accusés faussement. Nous sommes innocents parce que nous n’avons jamais fait de la politique. Nous prions Dieu.",
     "Sais-tu qu’il est interdit de prier dans une secte non reconnue par la loi, si ce n’est l’Église Catholique, l’Église du Christ au Zaïre et l’Église Kimbanguiste ?",
     "Il répondit : Oui !",
     "Alors, enchaîna l’O.P.J. si tu veux qu’on te sauve, donne-nous 500 Z."
    ]
   ],
   [
    "p",
    "Le prédicateur LUKANU lui répondit : Voulez-vous libérer deux d’entre nous afin que nous allions chercher de l’argent ? L’O.P.J. consentit très volontiers. Ainsi il libéra les prédicateurs LUKANU et MAKIONA."
   ],
   [
    "p",
    "Dès qu’ils furent relâchés, ils se rendirent immédiatement chez Son Eminence l’Apôtre Suprême pour le tenir au courant de cette arrestation. Il était 6h30’. Il les exhorta longuement et leur conféra la bénédiction. Avant de les congédier, il dit au prédicateur LUKANU : « Mon fils, écoutez-moi très bien ! Ne remettez rien, même pas un sou à ces gens-là car si vous le faites, vous serez coupable de trahison devant Dieu et l’Église. Acceptez de mourir pour le Seigneur, s’il le faut ». Réconfortés par la parole de l’homme de Dieu, les deux serviteurs retournèrent au lieu de leur détention où l’O.P.J. les accueillit gentiment croyant qu’ils lui avaient apporté de l’argent."
   ],
   [
    "p",
    "Quand il réclama son compte, l’O.P.J. réalisa hélas ! qu’ils n’avaient rien apporté. Alors le prédicateur LUKANU lui dit : Monsieur l’O.P.J., Nous ne pouvons pas vous donner de l’argent sinon nous nous rendons coupables de trahison devant Dieu et l’Église."
   ],
   [
    "p",
    "À ces mots, il fut très irrité et leur dit : « Maintenant, votre mort est certaine ! Le M.P.R. ne blague pas. Vous allez voir… ». Sur ces entrefaites, le procès fut arrêté. Les détenus furent acheminés à la Zone. Ayant appris que ces hommes étaient des conjurés, le Commissaire de Zone ordonna qu’ils fussent immédiatement acheminés à l’Hôtel de Ville auprès du Commissaire Urbain (Gouverneur). À l’époque, c’était DJOKU –EYO-BABA."
   ],
   [
    "p",
    "En route pour l’hôtel de Ville, sur la voie appelée Poids Lourds en face de BIA, le disciple NDANGANI Martin entendit une voix lui dire : « Soyez sans crainte car rien de mal ne vous arrivera. Chacun de vous rentrera dans sa famille sain et sauf ». Encouragés par cette révélation divine, ils se mirent à chanter le cantique suivant : Vo lufua vo ntotolo, landa kaka nzila Mfumu Yesu, E Mfumu Yesu muana meme, yandi kaka lenda kutuvulusa… Ce qui signifie : Face à la mort ou aux tribulations, nous devons persévérer dans la voie du Seigneur Jésus, l’agneau de Dieu ; lui seul peut nous sauver. Les miliciens chargés de les conduire à l’hôtel de ville leur interdirent de chanter des cantiques religieux. Au contraire, ils les poussaient à chanter des chansons révolutionnaires en l’honneur du Guide de la Révolution. Mais ils refusèrent. Peu de temps après, ils arrivèrent à l’hôtel de Ville. Les miliciens interrogèrent le huissier du Cabinet si le Commissaire Urbain était dans son bureau. Celui-ci répondit : Non ! Ils se dirigèrent ensuite chez le Commissaire Urbain qui résidait à Ma Campagne. Ce dernier sortit pour voir les fameux conspirateurs. Les ayant observés, il dit : Allons au Bureau à l’hôtel de Ville."
   ],
   [
    "p",
    "Quand ils y arrivèrent, le Commissaire Urbain fit appel, à l’aide de son motorola, au Commandant de la Ville de Kinshasa ainsi qu’à plusieurs autres notables de l’hôtel de Ville. Entretemps, les détenus croupissaient au cachot où ils furent jetés. Un des soldats de garde, ému de compassion, les fit sortir et leur demanda de rester au balcon humer l’air frais."
   ],
   [
    "p",
    "Quelques instants après, le Commissaire Urbain appela le pasteur LUKANU-mu-MAMBOTE. Ce dernier rectifia en disant qu’il n’était pas pasteur mais prédicateur."
   ],
   [
    "lines",
    [
     "Le Commissaire Urbain lui demanda :",
     "Vous êtes le responsable de ce groupe ?",
     "Oui, répondit-il. Les autres ne sont que des auxiliaires.",
     "Est-ce que tu pries ? poursuivit le Commissaire Urbain.",
     "Oui, je prie",
     "Dans quelle Église ?",
     "Dans l’Église Universelle de Douze Apôtres.",
     "Est-ce que tu paies les impôts ?",
     "Oui, je paie les impôts.",
     "Connais-tu l’homme politique BIKEDI Raymond ?",
     "C’est aujourd’hui que j’entends ce nom.",
     "Qui est cet homme et où réside-t-il ? rétorqua le prédicateur LUKANU."
    ]
   ],
   [
    "p",
    "Cette réponse troubla l’autorité Urbaine qui n’en revenait pas. Il jeta un regard inquiet autour de lui. Peut-être lui avait-on appris que les détenus avaient des accointances avec Raymond BIKEBI."
   ],
   [
    "p",
    "En effet, ce dernier est un ancien homme politique Zaïrois originaire de l’ethnie Kongo. Réputé opposant au régime du président MOBUTU qu’il tentait de renverser, il avait passé une grande partie de sa vie dans les geôles du pouvoir. Reconnu homme dangereux et indésirable, il fut déclaré persona non grata en République du Zaïre."
   ],
   [
    "p",
    "Poursuivant son interrogatoire, le Commissaire Urbain dit :"
   ],
   [
    "lines",
    [
     "Comment s’appelle le Chef de votre Église ?",
     "DIZOLELE-MPUNGU WAFIDUSWA Isaac, répondit-il",
     "Dans quelle Zone réside –t-il ?",
     "Dans la Zone de Lemba",
     "Peux-tu nous communiquer son avenue ?",
     "Moi, rétorqua-t-il, je n’ai pas l’habitude de retenir les noms des avenues ni même les numéros.",
     "Si nous nous rendons chez lui maintenant, pouvons-nous le voir ?",
     "Non, car il n’est pas sur place, reprit le prédicateur LUKANU. Il est souvent en mission apostolique à l’intérieur du pays. Présentement, il est dans le Bas-Zaïre.",
     "Selon le P.V. en notre possession, vous étiez arrêtés à minuit. Que faisiez-vous à cette heure-là ?",
     "C’est faux, répliqua le prédicateur LUKANU. Regardez, je porte encore l’uniforme de l’AMIZA, la société où je travaille. Nous arrêtons le travail à 17 heures. J’emprunte la ligne 30 de l’O.T.C.Z. (Office de Transport en Commun au Zaïre) pour atteindre mon domicile à 18 heures. Environ 30 minutes après mon arrivée, les éléments de la J.M.P.R. ont fait irruption chez moi et nous ont arrêtés. C’était à 18 h 30’. Je mets au défi quiconque soutiendrait le contraire. Et qu’il vienne me contredire hic et nunc. Le Commissaire Urbain se tourna vers les accusateurs et leur demanda : Est-ce que Monsieur le prédicateur a dit la vérité ? Ils répondirent : Oui, Chef !",
     "Honteux et confus, ils présentèrent des excuses au Commissaire Urbain, prétendant que c’était une erreur de frappe."
    ]
   ],
   [
    "p",
    "Perplexe, l’autorité Urbaine s’exclama : « Voilà comment on fait périr des innocents ! ». Un silence absolu régna dans la salle pendant 5 minutes. Alors le Commandant de le Ville brisa le silence en posant au prédicateur LUKANU les questions ci-après :"
   ],
   [
    "lines",
    [
     "De quelle Région es-tu ?",
     "De la Région du Bas-Zaïre, répondit-il.",
     "Quel District ?",
     "Je suis du District des Cataractes.",
     "Quel territoire ?",
     "Le Territoire de Luozi."
    ]
   ],
   [
    "p",
    "Lorsqu’il entendit qu’il était de Luozi, il soupira et dit au Commissaire Urbain : « J’ai vécu pendant 8 ans à Luozi comme Commandant. J’ai réalisé que ces gens-là mènent une vie de prière. Chez eux, si vous ne priez pas, vous êtes nul. C’est pourquoi, je vous prie de les libérer, car, même si vous les interdissez, ils n’obéiront jamais »."
   ],
   [
    "p",
    "La déclaration du Commandant de la Ville trouva un écho favorable auprès du Commissaire Urbain qui, séance tenante, décida la libération de tous les détenus. Ce qui fut fait."
   ],
   [
    "p",
    "Aussitôt libérés, ils prirent place à bord des véhicules qui les avaient transportés parce qu’ils étaient sans sou. Arrivés au bureau de la police judiciaire à Ndjili, ils furent retenus captifs parce qu’on leur réclamait une somme de 80 Z avant de les relâcher. Ils refusèrent de céder à leur sollicitation. Par conséquent, ils furent contraints d’y passer la nuit. Le jour suivant, comme ils persistaient, ils furent de nouveau retenus. Quand les membres de l’Église apprirent qu’ils étaient en captivité au poste de police judiciaire à Ndjili, ils s’y rendirent en masse, apportant de la nourriture aux détenus."
   ],
   [
    "p",
    "Le soir, vers 20 heures, les gardiens leur dirent : c’est votre entêtement qui vous retient ici. Tant que vous ne remettrez pas de l’argent, vous y resterez encore longtemps. Mais, par la grâce de Dieu, ils furent quand même relâchés à 20h30’."
   ],
   [
    "p",
    "Le lendemain, Son Eminence l’Apôtre Suprême se rendit au lieu de leur détention, mais il ne les trouva pas parce qu’ils étaient déjà libérés. Il récupéra toutes leurs pièces d’identité qui étaient confisquées par la police judiciaire. L’O.P.J. voulait que chaque détenu passât en particulier retirer ses documents afin de pouvoir le rançonner."
   ],
   [
    "p",
    "Après qu’il eut retiré les documents de ses fidèles, Tata Nkuluntu DIZOLELE –MPUNGU WAFIDUSWA alla les déposer au domicile du prédicateur LUKANU-mu-MAMBOTE où un accueil digne de son rang lui fut réservé. Le Seigneur venait une fois de plus d’être glorifié à travers ses serviteurs. Dès lors, l’Église de Kimbanseke connut un progrès remarquable avec sa tête le prédicateur LUKANU-mu-MAMBOTE qui sera élevé au rang d’Apôtre stagiaire en 1975 et consacré en 1982."
   ],
   [
    "h3",
    "Ndjili (1974)"
   ],
   [
    "p",
    "Après avoir semé la terreur à Lemba, le Commissaire de Zone Jean-Pierre KAZIAMA fut affecté à Ndjili en 1974. Nourrissant d’une haine viscérale contre l’Église Universelle de Douze Apôtres, cet homme ne voulait pas voir les activités de cette Église s’exercer au sein de sa municipalité. Aussi cherchait-il une opportunité pour se saisir des serviteurs de l’Église."
   ],
   [
    "p",
    "À l’arrivée du Commissaire de Zone KAZIAMA à Ndjili, l’Église Universelle de Douze Apôtres y était déjà implantée. On y avait installé une section (sous-paroisse) dont le siège était établi au quartier 7 dans la résidence du prédicateur MAKIONA KIDEDE."
   ],
   [
    "p",
    "Il importe de rappeler qu’à cette époque, l’Église avait été fermée par l’État par manque de personnalité civile. Par conséquent, les cultes se tenaient clandestinement."
   ],
   [
    "p",
    "Pendant la deuxième République, le Mouvement Populaire de la Révolution, Parti-État, avait instauré un système des travaux communautaires appelés « Salongo ». ces travaux avaient comme objectif l’assainissement de l’environnement. Tous les responsables politico-administratifs œuvrant à la base disposaient d’un programme spécifique des travaux dans leur juridiction. Le salongo s’effectuait généralement le samedi. La participation à ces travaux étaient obligatoire pour tous les habitants de la municipalité. Les récalcitrants étaient passibles de sanction."
   ],
   [
    "p",
    "Un samedi, Monsieur KAZIAMA Jean-Pierre décréta un salongo spécial dans la municipalité de Ndjili en vue d’assainir l’environnement. Chaque citoyen avait pris part à ces travaux dans son quartier résidentiel. Les adeptes de l’Église Universelle de Douze Apôtres disséminés ça et là dans la Zone de Ndjili, avaient aussi participé individuellement à ces travaux dans leurs quartiers respectifs. Evoluant à l’époque chez un particulier, l’Église ne pouvait pas mobiliser ses membres pour participer collectivement à ces travaux étant donné que chacun avait travaillé dans son quartier. Mais, pour Jean-Pierre KAZIAMA qui n’avait pas vu les fidèles de l’Église Universelle de Douze Apôtres effectuer le salongo collectivement, c’était une infraction. Ainsi, le dimanche, il dépêcha des éléments de la JMPR/Milice du Parti au lieu du culte en vue de procéder à l’arrestation des responsables de la section. Ceux qui furent envoyés arrivèrent pendant le culte. Ils se mirent devant la porte et le Commandant dit : « au nom de la loi, nous vous arrêtons ». Calmement le prédicateur MAKIONA leur demanda d’attendre la fin du culte. Ils obéirent. La présence de cette milice au lieu du culte provoqua un certain malaise auprès des membres qui avaient vite compris que leurs responsables étaient en état d’arrestation."
   ],
   [
    "p",
    "Au sortir du culte, le prédicateur MAKIONA KIDEDE, le disciple MATA MATUNDU et le frère TUALA TSUESO furent arrêtés et acheminés sur ordre du Commissaire de Zone au cachot du poste de gendarmerie du quartier 7 où ils furent gardés sans jugement pendant deux jours."
   ],
   [
    "p",
    "Ayant appris l’arrestation de ses serviteurs, Son Eminence l’Apôtre Suprême entreprit des démarches auprès des autorités de l’État en vue d’obtenir leur libération. Au terme deux jours de détention, ils furent libérés sans procès."
   ],
   [
    "p",
    "Aussitôt libérés, ils se présentèrent chez le Chef de l’Église qui les reçut avec joie, les exhorta et leur prodigua beaucoup de conseils."
   ],
   [
    "p",
    "Le Commissaire de Zone KAZIAMA, toujours égal à lui-même, interdit formellement l’exercice du culte de l’Église Universelle de Douze Apôtres dans sa municipalité. Ainsi, pour échapper à la furie de Monsieur KAZIAMA, le lieu de prière fut transféré dans la Zone de Kimbanseke sur l’avenue de l’indépendance au domicile du frère MAKITU Gilbert. Là, l’Église évolua en paix."
   ],
   [
    "h2",
    "La correspondance officielle"
   ],
   [
    "p",
    "Quoiqu’apparemment latent à certains moments de son parcours, le processus de l’obtention de la personnalité civile initié par Son Eminence l’Apôtre Suprême n’était guère interrompu. Dynamique et continu, ce processus faisait du chemin, nonobstant les écueils et les embûches dont il était parsemé. En aucun cas, en effet, le Chef de l’Église n’avait baissé les bras à ce sujet. Bien au contraire, il se battait jour et nuit sur le front juridique en vue d’obtenir cette personnalité civile tant recherchée. C’est ce qui justifie de toute évidence l’intense activité épistolaire déployée par l’homme de Dieu avec les hautes instances de la République en matière de personnalité civile. Ce chapitre fait état de la correspondance qu’il entretint courageusement avec les instances officielles. Il vise à démontrer le chemin parcouru par le dossier de l’Église avant son aboutissement. Cette correspondance eut à n’en point douter un impact positif sur le processus."
   ],
   [
    "h3",
    "La circulaire du 4 octobre 1975"
   ],
   [
    "p",
    "En date du 4 octobre 1975, le Secrétaire de la Coordination chargé de l’Administration générale du Département des Affaires Politiques et de la Coordination des activités du M.P.R., le Citoyen KASONGO MUIDINGE MALUILO, publia une lettre circulaire n°251/320/117/6062/75 à l’intention des Commissaires de Région et du Commissaire Urbain de la Ville de Kinshasa. Dans sa lettre, il leur rappela les prescrits de la loi n°71-012 du 31 décembre 1971, réglementant l’exercice des cultes, spécialement en son article 2 qui stipule qu’aucune Église, aucune secte religieuse ne peut se constituer que sous forme d’une association sans but lucratif dotée de la personnalité civile. Et que nul ne peut prêcher publiquement une religion que s’il est membre d’une Église ou d’une secte religieuse ayant la personnalité civile."
   ],
   [
    "p",
    "Il leur fit part de son constat selon lequel plusieurs associations religieuses non dotées de la personnalité civile exerçaient librement leurs activités dans leurs juridictions respectives sans que leurs services compétents ne prennent des dispositions qui s’imposent."
   ],
   [
    "p",
    "Par la même occasion, il leur transmit une liste de 51 associations non dotées de la personnalité civile dont les sièges furent établis dans leurs régions respectives et dans la Ville de Kinshasa."
   ],
   [
    "p",
    "Il leur demanda aussi de lui fournir les renseignements suivants : 1° une liste complète des associations non dotées de la personnalité civile dont les noms furent repris ou pas sur sa liste et qui remplissaient les conditions d’obtention de la personnalité civile prévues par l’arrêté ministériel n°002 du 7 janvier 1972 et qui devaient introduire leurs requêtes au Département de la Justice."
   ],
   [
    "p",
    "2° une liste complète des associations qui ne remplissaient pas les conditions d’obtention de la personnalité civile prévues par l’arrêté précité."
   ],
   [
    "p",
    "Il insista sur le fait que les dirigeants de ce dernier groupe d’associations qui voulaient continuer à exercer leurs activités n’avaient qu’une possibilité : s’affilier à n’importe quelle communauté parmi celles affiliées à l’Église du Christ au Zaïre. À cette époque, elles étaient au nombre de 53."
   ],
   [
    "h3",
    "La troisième requête (5 janvier 1976)"
   ],
   [
    "p",
    "Se référant à la lettre circulaire du 4 octobre 1975 ci-haut évoquée, Son Eminence l’Apôtre Suprême, par sa lettre n°100/002/SUP/DMW/76 du 5 janvier 1976, introduisit auprès du Département de la Justice une requête en obtention de la personnalité civile Sous-couvert du Commissaire de Région du Bas-Zaïre. Il transmit à ce dernier trois exemplaires du dossier de demande de personnalité civile, le 8 janvier 1976."
   ],
   [
    "p",
    "Réagissant positivement à la lettre de Son Eminence l’Apôtre Suprême, le Commissaire de Région du Bas-Zaïre procéda à son tour à la transmission du dossier « C.D.A.Z. » ASBL au Commissaire d’État à la Justice par sa lettre du 5 février 1976."
   ],
   [
    "p",
    "Dans cette lettre, il attesta la conformité de ce dossier à la législation sur les associations sans but lucratif et sur les cultes. En outre, il émit des avis très favorables sur la personnalité du Fondateur et sur son œuvre."
   ],
   [
    "p",
    "Ce témoignage du Commissaire de Région du Bas-Zaïre fut déterminant dans l’appréciation générale du dossier de la Communauté de Douze Apôtres au Zaïre par le Conseil Judiciaire en 1980."
   ],
   [
    "h3",
    "Les témoignages des Commissaires sous-régionaux de Boma et de Matadi (décembre 1976)"
   ],
   [
    "p",
    "Les Commissaires Sous-Régionaux de Boma (BOKELE WA NDJOLI) et de Matadi (LOKAMBA KASENDWE) suivirent de très prés, dans leurs municipalités respectives, les réalisations et la conduite des dirigeants et membres de l’Église Universelle de Douze Apôtres vis-à-vis du Parti-État. N’ayant enregistré aucun fait reprochable à leur égard, ils témoignèrent en faveur de l’Église par des attestations délivrées respectivement les 15 et 20 décembre 1976. Voici in extenso les libellés de ces attestations :"
   ],
   [
    "doc",
    {
     "title": "Attestation du Commissaire sous-régional de Boma",
     "sub": "Boma, 15 décembre 1976",
     "lines": [
      "Je soussigné BOKELE wa NDJOLI – Commissaire Sous-Régional de la Ville de Boma, atteste par la présente que l’Église Universelle de Douze Apôtres dispose dans la Ville de Boma : Zone de Kabondo et Kalamu, outre une maison pastorale, un terrain de 5 Ha pour :",
      "Construction d’un Temple dont la fondation est déjà achevée,",
      "Construction d’un dispensaire et des locaux scolaires.",
      "Les travaux ont été interrompus suite à l’interdiction de l’exercice du culte qui a frappé l’Église du fait de n’avoir pas été agréée.",
      "Sinon le comportement des dirigeants de l’E.U.D.A. depuis lors est irréprochable.",
      "En foi de quoi, cette attestation lui est délivrée pour valoir à qui de droit.-",
      "Boma, le 15 décembre 1976",
      "Pour le Commissaire Sous-Régional en mission,",
      "Le Commissaire Sous-Régional Assistant,",
      "Kazinguvu Monga-na-Kiona"
     ]
    }
   ],
   [
    "doc",
    {
     "title": "Attestation du Commissaire sous-régional de Matadi",
     "sub": "Matadi, 20 décembre 1976",
     "lines": [
      "Je soussigné, LOKAMBA KASENDWE, Commissaire Sous-Régional de la Ville de Matadi, atteste par la présente que l’Église Universelle de Douze Apôtres « E.U.D.A. » dispose dans la Sous-Région de Matadi, un terrain de 2 Ha s’étendant sur les deux Zones : NZANZA et M’VUZI étant donné qu’il est situé sur la limite de ces Zones.",
      "Du côté de la Zone de Nzanza, la mise en valeur de ce terrain est considérablement réalisée :",
      "La construction d’un temple en matériaux durables, quant à l’élévation des murs, est déjà terminée. Il n’y en reste plus que la toiture.",
      "Une maison qui va servir d’un dispensaire est entièrement achevée.",
      "Une grande fondation terminée, un puits baptismal et une fosse septique encore en construction.",
      "Les travaux ci-dessus s’étaient interrompus momentanément par le fait de n’avoir pas fait partie des Églises reconnues.",
      "Quant au comportement des dirigeants de l’E.U.D.A., je n’ai pas d’objection à faire d’autant plus qu’ils sont d’une conduite exemplaire et irréprochable vis-à-vis du M.P.R. et de la population.",
      "En foi de quoi, cette attestation lui est délivrée en vue de valoir à qui de droit.-",
      "Fait à Matadi, le 20 décembre 1976.-",
      "Le Commissaire Sous-Régional,",
      "Lokamba Kasendwe"
     ]
    }
   ]
  ]
 },
 {
  "id": "petite-detente",
  "n": "3",
  "title": "La petite détente",
  "period": "1977 – 1978",
  "blocks": [
   [
    "p",
    "Pendant que les menaces, les brimades, et les arrestations battaient son plein, un vent nouveau souffla dans l’Église vers les années 1977-1978. Tous les membres, unis autour du Fondateur, cherchaient à sauver l’Église de la désolation dans laquelle elle était plongée. S’inspirant de l’expérience de la vie apostolique de l’Église primitive d’une part et convaincus que l’œuvre divine ne peut être détruite par les humains d’autre part, les fidèles s’armèrent de courage et d’une volonté opiniâtre de vaincre. Par conséquent, on assista à un éveil : les Églises furent réouvertes, de nouvelles sections (sous-paroisses) furent créées, le nombre des serviteurs fut augmenté. Certains membres démissionnaires rentrèrent au bercail. En vue de sécuriser les adeptes, le Chef de l’Église poursuivit sans relâche les démarches amorcées pour l’obtention de la personnalité civile. Les fidèles qui lui restèrent unis firent preuve d’une obéissance sans faille en toutes circonstances."
   ],
   [
    "h2",
    "La première adhésion à l’Église du Christ au Zaïre (octobre 1977)"
   ],
   [
    "p",
    "L’Église Universelle de Douze Apôtres traversa un moment d’accalmie qui coïncida avec son entrée dans l’Église du Christ au Zaïre. En effet, en vue de ménager la vie des fidèles constamment menacée par les tenants du pouvoir, le Chef de l’Église chercha une solution momentanée, celle de s’affilier à l’Église du Christ au Zaïre. De cette manière, l’Église Universelle de Douze Apôtres fonctionnerait librement sous-couvert de cette Église officielle. Au terme d’inlassables démarches menées par Son Eminence l’Apôtre Suprême, l’Église Universelle de Douze Apôtres fut admise au sein de l’Église du Christ au Zaïre en octobre 1977. C’était sa première adhésion. Bien que cette entrée fût officieuse, elle fut néanmoins rassurante et sécurisante. Cette adhésion à l’E.C.Z. mit l’Église Universelle de Douze Apôtres à l’abri des tracasseries de tout genre. Ce fut donc la détente. « Convaincue que la foi chrétienne est un phénomène corporatif et communautaire qui lui est substantiel, l’Église Universelle de Douze Apôtres avait compris qu’on n’est pas chrétien tout seul mais qu’on l’est toujours avec les autres. En effet, c’est un peuple que Dieu appelle à l’existence et non des individus atomisés privés de liens. Ainsi l’Église Universelle de Douze Apôtres a jugé nécessaire de s’unir aux autres pour partager les expériences » (1)."
   ],
   [
    "h2",
    "Un nouveau nom : la Communauté de Douze Apôtres au Zaïre (C.D.A.Z.)"
   ],
   [
    "p",
    "À son entrée dans l’Église du Christ au Zaïre, l’Église Universelle de Douze Apôtres dut accepter la modification apportée à son appellation par le Comité Exécutif National de cette Église. Ainsi l’Église Universelle de Douze Apôtres devint « Communauté de Douze Apôtres au Zaïre » en sigle « C.D.A.Z. »."
   ],
   [
    "p",
    "Force est de reconnaître cependant que cela ne porta nullement préjudice à la doctrine de l’Église. C’est avec cette dénomination qu’elle obtiendra la personnalité civile en 1980. Elle conservera ladite dénomination jusqu’à l’année 1994."
   ],
   [
    "note",
    "NSUMBU-bin-PHUATY MALANDA, la Communauté de Douze Apôtres au Zaïre, son historique, structure et sa doctrine (1955-1983), Mémoire présenté pour l’obtention du grade de Licencié en Théologie, Kinshasa, 1983, p.16"
   ],
   [
    "h2",
    "La formation des cadres en théologie (1978)"
   ],
   [
    "p",
    "Comme l’affirme NSUMBU- bin – PHUATY MALANDA dans son mémoire, la théologie de la foi se répercute sur la problématique de l’Educateur. Elle appelle des orientations spirituelles, pastorales et pédagogiques spécifiques. Ainsi, le Conseil d’Administration de la Communauté de Douze Apôtres au Zaïre décida d’envoyer en 1978 quelques étudiants à la Faculté en vue d’entreprendre les études théologiques."
   ],
   [
    "p",
    "Le Conseil d’Administration recommanda donc des étudiants à la Faculté Protestante du Zaïre au nombre desquels on peut citer : NSUMBU-bin- PHUATY MALANDA, MPANZU NTCHIAMA, KHONDE KINKELA, BAMBI NIONGI, KIVEKA KISUNGU et MAYEMBE LESA. Le premier avait obtenu brillamment sa Licence en Théologie. Les années qui suivirent, d’autres furent également recommandés par l’Église à la Faculté, notamment MVILA-za-MAKANDA, MAKITU NUNI, NGONDE MBUNGU, MATONDO MOTE, MAHINGA DIZOLELE …"
   ],
   [
    "p",
    "Cette ouverture à la Théologie prouve à suffisance le souci qu’avait le Conseil d’Administration de doter la Communauté de Douze Apôtres au Zaïre des cadres compétents, capables de défendre sa doctrine sur le plan théologique."
   ]
  ]
 },
 {
  "id": "nouvelles-epreuves",
  "n": "4",
  "title": "Une nouvelle période d’épreuves",
  "period": "1978 – 1980",
  "blocks": [
   [
    "h2",
    "La résolution du Bureau politique et la sortie de l’E.C.Z."
   ],
   [
    "p",
    "En décembre 1978, un fait important vint de nouveau troubler la quiétude de l’Église, à savoir : la décision du Bureau Politique du Mouvement Populaire de la Révolution interdisant aux Communautés non dotées de la personnalité civile l’exercice du culte bien que couverte par l’Église du Christ au Zaïre."
   ],
   [
    "p",
    "La Communauté de Douze Apôtres au Zaïre était naturellement concernée par cette mesure. D’emblée, l’angoisse gagna de nouveau les esprits. La désolation fut à son comble."
   ],
   [
    "p",
    "Cela étant, l’Église fut une fois de plus exposée à la tourmente. Pour que l’espoir et le courage des fidèles ne s’éteignissent point, le Chef de l’Église entreprit une tournée dans toutes les paroisses de la C.D.A.Z. afin de consolider la foi des adeptes par la promesse de Dieu. Son Eminence l’Apôtre Suprême s’engagea davantage dans la bataille de l’obtention de la personnalité civile."
   ],
   [
    "h2",
    "L’empoisonnement de l’Apôtre Suprême à Mbanza-Ngungu (janvier 1979)"
   ],
   [
    "p",
    "Le mercredi 17 janvier 1979, à bord de son véhicule conduit par papa Félicien KIMOBANA, Son Eminence l’Apôtre Suprême quitta Kinshasa accompagné du prédicateur KHONDE KINKELA, Secrétaire Général de l’Église et de l’Apôtre MANKODILA MASEFI pour se rendre au Bas-Zaïre réconforter les frères après les dernières mesures du Bureau Politique qui interdisaient à l’Église l’exercice du culte jusqu’à l’obtention de la personnalité civile."
   ],
   [
    "p",
    "Le soir de ce jour-là, à 20 h30’, ils arrivèrent à Mbanza-Ngungu. Un quart d’heure plus tard, les frères de Mbanza-Ngungu servirent à Son Eminence l’Apôtre Suprême et à sa suite, un repas qui contenait un poison violent dirigé contre la personne du Chef de l’Église."
   ],
   [
    "h3",
    "La prophétie"
   ],
   [
    "p",
    "De tous les crimes, l’empoisonnement intentionnel est le plus odieux car il est souvent commis par des personnes dans lesquelles la victime a toute confiance."
   ],
   [
    "p",
    "L’empoisonnement criminel n’est pas toujours facile à découvrir. Dans le cas présent, le contexte est un milieu de l’Église considéré pur, dans lequel ce crime est commis ne peut, de plus, faire soupçonner un empoisonnement."
   ],
   [
    "p",
    "Ainsi, devant la diarrhée et le vomissement qui secouèrent Son Eminence l’Apôtre Suprême, sa suite pensa d’abord à une toxi-infection alimentaire puis, à une infestation par des vers intestinaux. Tout compte fait, on arriva à la conclusion qu’il s’agissait d’un empoisonnement intentionnel, donc criminel."
   ],
   [
    "p",
    "En effet, revenant un jour de Matadi, Son Eminence l’Apôtre Suprême passa une nuit à Mbanza-Ngungu. Pendant cette nuit, le Seigneur lui révéla qu’il serait empoisonné, qu’il mangerait le poison mais qu’il le vomirait et serait sauvé : oracle du Seigneur !"
   ],
   [
    "p",
    "Le lendemain matin, il en fit part aux fidèles de Mbanza-Ngungu venus le saluer à son départ pour Kinshasa."
   ],
   [
    "h3",
    "Les faits"
   ],
   [
    "p",
    "Le mercredi 17 janvier 1979, Son Eminence l’Apôtre Suprême arriva à Mbanza-Ngungu où il fut accueilli chaleureusement par de nombreux fidèles de la Communauté de Douze Apôtres au Zaïre qui l’attendaient depuis la veille."
   ],
   [
    "p",
    "Si cet accueil témoigne de l’amour et de l’attachement à l’Envoyé de Dieu, deux choses cependant surprennent à l’arrivée de Son Eminence l’Apôtre Suprême à Mbanza-Ngungu à 20 heures :"
   ],
   [
    "list",
    [
     "La présence insolite au lieu de la réception de quelques « frères » tièdes dans la foi qui ne témoignent que d’un amour apparent en la personne de Son Eminence l’Apôtre Suprême et vis-à-vis de la Communauté de Douze Apôtres au Zaïre.",
     "La nourriture avant le culte."
    ]
   ],
   [
    "p",
    "En effet, habituellement, dans l’Église, le spirituel précède le matériel. Donc, glorifier Dieu vient avant toute chose à l’arrivée de Son Eminence l’Apôtre Suprême, sauf avis contraire de ce dernier. Ce jour-là, on apprêta dès son arrivée la table avant toute chose. Un poulet bien préparé fut servi avec deux petits plats de haricots. Quantitativement et qualitativement, ce repas ne pouvait en rien et sans falsification, déterminer un phénomène toxique."
   ],
   [
    "h3",
    "Les manifestations"
   ],
   [
    "p",
    "Les manifestations sont tardives. Le lendemain à 5 heures du matin, par la puissance de l’Éternel, le poison irrite l’estomac, détermine des vomissements et l’hypersécrétion de l’intestin produit une diarrhée qui contribuera à l’expulsion du toxique. Toute la nourriture ingérée la veille, reconnaîtra l’Apôtre Suprême, n’était ni entamée ni métabolisée et, il comprit que l’empoisonnement que le Seigneur lui avait prédit avait été malicieusement opéré. Tantôt tour à tour, tantôt simultanément, diarrhée et vomissements secouent l’homme dont l’enseignement, l’exemple et l’amour ont tiré des milliers de pécheurs de l’obscurité et de la mort."
   ],
   [
    "p",
    "La déshydratation et l’épuisement s’accentuent ainsi qu’une sensation d’étouffement. Il halète ! « Je voyais la mort près de moi », affirmera l’Homme de Dieu."
   ],
   [
    "p",
    "En ce moment là, les adeptes de Mbanza-Ngungu se rappelèrent, à coup sûr, la prophétie et établirent sans doute une corrélation. Ils se gardèrent cependant de le révéler à la suite de leur victime qui pouvait tenter un antidote. Ils gardèrent le secret peut-être parce que Dieu voulait, sans l’intervention de l’homme, délivrer et sauver son Oint."
   ],
   [
    "p",
    "Suite à ces vomissements et à cette diarrhée déshydratante, Son Eminence l’Apôtre Suprême tombe dans un état presque comateux jusqu’à 14 h40’. Il n’est pas si loin de la mort !"
   ],
   [
    "h3",
    "La guérison"
   ],
   [
    "p",
    "La suite de Son Eminence l’Apôtre Suprême ignorait la prophétie de l’empoisonnement. De plus, dans un milieu considéré non seulement religieux mais surtout pur, personne ne pouvait penser à un empoisonnement. Ainsi aucun antidote n’était administré."
   ],
   [
    "p",
    "Vers 14h40’, comme sous l’action d’un émétique puissant, il vomit encore abondamment. Maman MPASI MBONGO, épouse de l’Apôtre KASA LUSALA NLANDU, lui essuie la bouche et les pieds. Son Eminence l’Apôtre Suprême se mit à raconter la prophétie au Secrétaire Général, le prédicateur KHONDE KINKELA. Quelque trois minutes après, il se tient débout en s’écriant : « JE NE MEURS PLUS, JE SUIS GUERI, NOUS PARTONS ! »"
   ],
   [
    "p",
    "À l’épuisement dû à la déshydratation succéda, sans transition, une énergie peu ordinaire !"
   ],
   [
    "p",
    "« Dois-je encore manger de votre nourriture ? »interrogea-t-il les « gens » de Mbanza-Ngungu avant un départ précipité. Mais avant de les quitter, il leur dit : « merci beaucoup pour tout ce que vous avez fait »."
   ],
   [
    "p",
    "Il partit de Mbanza-Ngungu le 18 janvier 1979 pour Kimpese où il passa la nuit chez papa MBUNGU-MBIZI. De là, il poursuivit sa tournée à Matadi et dans le Bas-Fleuve, réconfortant la foi des fidèles et leur disant comment le Seigneur l’avait délivré de la mort à Mbanza-Ngungu après qu’on eut attenté à sa vie."
   ],
   [
    "p",
    "Cette nouvelle qui se répandit au sein de l’Église comme une traînée de poudre indigna tous les fidèles."
   ],
   [
    "p",
    "De retour à Kinshasa, Son Eminence l’Apôtre Suprême réunit en date du 10 février 1979 le Conseil d’Administration de l’Église pour lui faire le récit de cet empoisonnement."
   ],
   [
    "p",
    "Ayant suivi l’exposé des faits, le Conseil d’Administration avait demandé à l’Apôtre KASA LUSALA NLANDU Chef de paroisse de Mbanza-Ngungu, si informé, il avait pris des dispositions visant à empêcher la réalisation du projet criminel que l’ennemi avait conçu."
   ],
   [
    "p",
    "Le Chef de paroisse répondit : « J’ai demandé l’intervention du Seigneur. Je n’ai pas fait plus car, je ne savais pas que cela devait se réaliser à Mbanza-Ngungu »."
   ],
   [
    "p",
    "Le Conseil d’Administration avait ainsi constaté avec regret qu’après l’annonce de la prophétie aucune mesure n’avait été prise dans cette paroisse."
   ],
   [
    "p",
    "Après un examen des faits, le Conseil d’Administration avait souligné que ce coup avait été réalisé :"
   ],
   [
    "list",
    [
     "En la personne du Chef de l’Église ;",
     "Dans la résidence du Chef de paroisse;",
     "En l’absence du Chef de paroisse (en mission de service).",
     "En clair, cet acte avait été commis par des personnes spirituellement déjà « mortes » qui cherchaient la disparition de la Communauté."
    ]
   ],
   [
    "p",
    "En dépit du fait que toutes ces données eussent été estimées très graves, Conseil d’Administration avait cependant reconnu que Mbanza-Ngungu ne comptait pas que des « serviteurs » de satan. Il avait ainsi jugé impérieux d’appliquer des mesures qui concilient la justice et la miséricorde."
   ],
   [
    "p",
    "Ayant examiné les diverses sanctions à infliger à cette Église, le Conseil d’Administration avait décidé ce qui suit :"
   ],
   [
    "list",
    [
     "Le Siège de la Paroisse de Mbanza-Ngungu fut transféré à Inkisi.",
     "Son Eminence l’Apôtre Suprême ne visiterait plus jamais Mbanza-Ngungu.",
     "Excepté le prédicateur MASUMU MANZA et l’Apôtre KASA LUSALA NLANDU absents du milieu le jour du crime, tous les serviteurs de Mbanza-Ngungu furent destitués. Ils perdirent leurs titres et leurs fonctions religieuses et devaient, sans délai, remettre leurs cartes de service au Chef de la paroisse qui transmettrait."
    ]
   ],
   [
    "p",
    "Envisageant des mesures préventives, le Conseil d’Administration avait prescrit que :"
   ],
   [
    "list",
    [
     "Les repas de Son Eminence l’Apôtre Suprême seraient désormais apprêtés par l’épouse du Chef de la paroisse visitée.",
     "Aucun service de protocole institué ne pourrait plus jamais servir Son Eminence l’Apôtre Suprême. En cas de nécessité, le Chef de paroisse ou son remplaçant désignerait la ou les personnes qui pourraient aider son épouse."
    ]
   ],
   [
    "p",
    "Sachant qu’il est le bon berger qui aime le troupeau de son pâturage et qui donne sa vie pour ses brebis, Son Eminence l’Apôtre Suprême avait tout pardonné. Par conséquent, toutes les mesures arrêtées à cet effet par le Conseil d’Administration furent annulées. Ainsi, le Chef de l’Église a continué à visiter toutes les entités ecclésiales et mange partout tout ce qu’on lui sert sans crainte."
   ]
  ]
 },
 {
  "id": "ultimes-etapes",
  "n": "5",
  "title": "Les ultimes étapes et la reconnaissance",
  "period": "1979 – 1980",
  "blocks": [
   [
    "p",
    "Farouchement déterminé à atteindre le but qu’il s’est assigné, Son Eminence l’Apôtre Suprême poursuivit la bataille sur le front juridique. À savoir que le dossier de la Communauté de Douze Apôtres au Zaïre était déjà bien connu et bien côté au Département de la Justice. Le témoignage du Commissaire de Région du Bas-Zaïre et des Commissaires Sous-Régionaux de Matadi et de Boma à propos de ce dossier lui apporta encore plus de crédibilité."
   ],
   [
    "h2",
    "La nouvelle requête (12 mars 1979)"
   ],
   [
    "p",
    "Par sa lettre n°……… du 12 mars 1979, le Chef de l’Église introduisit une nouvelle requête en obtention de la personnalité civile auprès du Président du Conseil Judiciaire."
   ],
   [
    "p",
    "Rappelons cependant que les documents ci-après étaient exigés par la loi :"
   ],
   [
    "list",
    [
     "Une liste indiquant les noms, prénoms, domicile ou résidence de tous les membres effectifs de l’Association ;",
     "Des Statuts de l’Association ;",
     "D’un certificat de nationalité Zaïroise ;",
     "D’un certificat médical attestant que le requérant est sain d’esprit ;",
     "D’un certificat des bonnes vie et mœurs ;",
     "D’un extrait d’un acte de naissance ;",
     "D’une copie conforme de diplôme de théologie ou tout autre document attestant que le requérant a suivi avec succès pendant 4 ans l’enseignement religieux dans une école de théologie du pays ou de l’étranger ;",
     "D’une attestation de non dissidence ;",
     "D’un extrait bancaire d’un montant de 100.000 Z., en dépôt ;",
     "D’un document renfermant les principes fondamentaux ainsi les lignes maîtresses de l’enseignement religieux à dispenser."
    ]
   ],
   [
    "p",
    "Par ailleurs, ayant été saisi à propos de la personnalité civile par quelques associations requérantes, Monseigneur BOKELEALE, Représentant Légal de l’Église du Christ au Zaïre introduisit à son tour au Conseil Judiciaire, en mars 1979, des requêtes en obtention de la personnalité civile en faveur des sept Communautés protestantes ci-après :"
   ],
   [
    "list",
    [
     "La Communauté Elim Evangélique au Zaïre, B.P. 14851, Kinshasa/I",
     "La Communauté Evangélique Libre au Zaïre, B.P. 3020, Kinshasa/Gombe",
     "La Communauté de Jésus-Christ au Zaïre, B.P. 1276, Kinshasa/I",
     "La Communauté de Saint-Esprit en Afrique, Mission Nzieta, Coll. Kimumba, Zone de Luozi, S/R Cataractes, Région du Bas-Zaïre.",
     "La Communauté Réformée du Zaïre, B.P. 3156, Kinshasa/Gombe",
     "La Communauté de Douze Apôtres au Zaïre, B.P. 607, Kinshasa/Limete",
     "La Communauté Luthérienne au Zaïre, B.P. 294, Région du Shaba."
    ]
   ],
   [
    "p",
    "Une fois le dossier transmis avec tous les témoignages, il ne restait qu’à l’autorité d’apprécier et d’agir."
   ],
   [
    "h2",
    "Le projet d’ordonnance soumis au Chef de l’État (24 avril 1980)"
   ],
   [
    "p",
    "La conformité du dossier de la C.D.A.Z. à la législation sur les associations sans but lucratif et sur les cultes ayant été dûment établie par l’autorité de tutelle, le Commissaire d’État à la Justice, le Citoyen KAFITWE WA BA BOWA, transmit en date du 24 avril 1980 un rapport y afférent au Président-Fondateur du Mouvement Populaire de la Révolution, Président de la République, MOBUTU SESE SEKO avec un projet d’ordonnance. Voici le libellé de ce rapport :"
   ],
   [
    "doc",
    {
     "title": "Rapport du Commissaire d’État à la Justice au Président de la République",
     "sub": "Kinshasa, 24 avril 1980",
     "lines": [
      "Citoyen Président-Fondateur du Mouvement Populaire de la Révolution, Président de la République,",
      "Le projet d’ordonnance que j’ai l’honneur de soumettre à votre signature a pour but d’accorder la personnalité civile à l’association sans but lucratif « Communauté de Douze Apôtres au Zaïre », en abrégée « C.D.A.Z. ».",
      "Cette association religieuse dont le siège social est établie à Kinshasa, Rue de Ngina n°8 dans la Zone de Lemba, s’assigne comme buts : l’évangélisation, l’éducation et les œuvres sociales et médicales.",
      "Le dossier qui paraît complet et conforme à la législation sur les associations sans but lucratif et sur les cultes est introduit par le Représentant Légal de l’Église du Christ au Zaïre qui garantit la viabilité et le sérieux de la Communauté et admet celle-ci comme membre de son Église sous réserve de la décision présidentielle à intervenir. Ceci ne fait que rencontrer le vœu de l’autorité publique qui entend grouper toutes les Communautés protestantes au sein de l’Église du Christ au Zaïre.",
      "Les avis émis d’autre part par le Commissaire de Région du Bas-Zaïre et par les Commissaires sous-Régionaux de Matadi et de Boma sur la personnalité du Fondateur de ce groupement et sur son œuvre sont favorables.",
      "Compte tenu de ce qui précède, je ne formule pour ma part aucune objection à la reconnaissance juridique de l’association requérante.",
      "Tel est, Citoyen Président-Fondateur du Mouvement Populaire de la Révolution, Président de la République, l’objet du projet de l’ordonnance que j’ai l’honneur de soumettre à votre haute appréciation."
     ]
    }
   ],
   [
    "h2",
    "L’ordonnance n° 128/80 du 30 avril 1980"
   ],
   [
    "p",
    "Dieu n’est pas un homme pour mentir, disent les Saintes Écritures."
   ],
   [
    "p",
    "Après une longue traversée du désert, la Communauté de Douze Apôtres au Zaïre allait accéder enfin à sa reconnaissance juridique. L’heure avait sonné où le dessein de Dieu devait s’accomplir à tout prix. Toujours fidèle à sa parole, l’Éternel est un Dieu agissant et réaliste qui ne se dédit point. La promesse qu’il avait faite à son Prophète DIZOLELE-MPUNGU WAFIDUSWA, « Je vous aiderai », était maintenant en voie de réalisation. L’accomplissement de cette promesse est une preuve tangible qui atteste, à n’en point douter, que DIZOLELE Isaac est un Prophète de Dieu. N’est-ce pas Dieu qui est le maître de l’univers ? N’est-ce pas lui qui commande sur les Rois et les Princes de ce monde ? Face à son irrésistible volonté, écueils et embûches tombent. Gloire lui soit rendue éternellement !"
   ],
   [
    "p",
    "Le 24 avril 1980, le dossier de la Communauté de Douze Apôtres au Zaïre atterrit sur le bureau du Président Mobutu Sese Seko Kuku Ngbendu Wa za Banga. Après une étude minutieuse dudit dossier, sous l’inspiration divine, il signa sans atermoiement le 30 avril 1980 l’ordonnance accordant la personnalité civile à la Communauté de Douze Apôtres au Zaïre."
   ],
   [
    "p",
    "Cette date consacre la fin d’une longue nuit de cauchemars. Quelle que soit la longueur de la nuit, dit-on, le soleil finit par se lever. En effet, une ère nouvelle, porteuse d’espoir et de progrès, venait de commencer pour la Communauté de Douze Apôtres au Zaïre. Ci-après le texte intégral de l’ordonnance présidentielle :"
   ],
   [
    "doc",
    {
     "title": "Ordonnance n° 128/80 du 30 avril 1980 accordant la personnalité civile à l’ASBL « Communauté de Douze Apôtres au Zaïre » (C.D.A.Z.)",
     "sub": "Kinshasa, 30 avril 1980",
     "lines": [
      "Le Président–Fondateur du Mouvement Populaire de la Révolution, Président de la République,",
      "Vu la constitution, spécialement son article 42,",
      "Vu le décret-loi du 18 septembre 1965 relatif aux associations sans but lucratif, spécialement ses articles 2,3,4,6 et 7 ;",
      "Vu, telle que modifiée et complétée à ce jour, la loi n°71-012 du 31 décembre 1971 réglementant l’exercice des cultes, spécialement ses articles 2,3,4,6 et 7 ;",
      "Vu la requête en obtention de la personnalité civile introduite en date du 12 mars 1979 par les membres du Comité administratif de l’association sans but lucratif « Communauté de Douze Apôtres au Zaïre », ainsi que les annexes visées à l’article 8 du décret-loi susvisé ;",
      "Sur proposition du Commissaire d’État à la Justice ;",
      "OR D O N N E :",
      "Article 1er : - La personnalité civile est accordée à l’association sans but lucratif « Communauté de Douze Apôtres au Zaïre », en abrégé « C.D.A.Z. » dont le siège social est fixé à Kinshasa, Rue de Ngina n°8, Zone de Lemba ;",
      "Cette association a pour buts :",
      "l’évangélisation",
      "l’éducation",
      "les œuvres médicales et sociales.",
      "Article 2 : - Est approuvée la déclaration en date du 2 octobre 1977 par laquelle la majorité des membres effectifs de l’association visée à l’article premier a nommé aux fonctions en regard de leurs noms les personnes ci-après :",
      "- DIZOLELE-MPUNGU : Représentant Légal ;",
      "- KASA LUSALA NLANDU : Représentant Légal premier Suppléant ;",
      "- NKONGO – MBENZA : Représentant Légal deuxième Suppléant",
      "- KHONDE KINKELA : Secrétaire Général",
      "- DIATELANA-dia-MAYADI : Comptable",
      "Article 3 : - Le Commissaire d’État à la Justice est chargé de l’exécution de la présente",
      "ordonnance qui entre en vigueur à la date de sa signature.",
      "Fait à Kinshasa, le 30 avril 1980",
      "MOBUTU SESE SEKO KUKU NGBENDU WA ZA BANGA",
      "Général de Corps d’Armée"
     ]
    }
   ],
   [
    "h2",
    "La joie de toute l’Église"
   ],
   [
    "p",
    "Longtemps attendue comme un mécanisme de libération, la reconnaissance juridique de l’Église Universelle de Douze Apôtres fut accompagnée des moments d’allégresse auprès des fidèles et sympathisants."
   ],
   [
    "p",
    "En effet, bien avant la sortie de l’ordonnance consacrée, le Chef de l’Église reçu du Seigneur la révélation lui confirmant la signature de cette ordonnance par le Chef de l’État et Président de la République, MOBUTU SESE SEKO KUKU GBWENDU WA ZA BANGA. Il en fit part aux fidèles de la Paroisse de Makala lors du culte du dimanche 29 avril 1980."
   ],
   [
    "p",
    "Le jour suivant, Son Eminence l’Apôtre Suprême se rendit au Ministère de la Justice où il fut accueilli en triomphe par les agents de la deuxième direction, dirigée en ce temps là par le Citoyen MUAMBA NZAMBI. Pour congratuler l’Homme de Dieu de cette grande réussite, ces agents criaient : « Homme fort !, Homme fort ! ». Etonné, il les interrogea sur le sens de cet accueil enthousiaste et spontané. Ils lui répondirent : « le document de reconnaissance juridique de votre Église vient d’être signé par le Président de la République; mais vous devez attendre la note de transmission officielle du Ministère »."
   ],
   [
    "p",
    "Rentré chez lui, l’Envoyé de Dieu apprit la nouvelle aux membres qui s’y trouvaient. Spontanément, sa résidence fut envahie par des fidèles en liesse. Ils louèrent et glorifièrent l’Éternel par des cantiques spirituels."
   ],
   [
    "p",
    "Après avoir reçu la lettre du Ministère de la Justice l’informant officiellement de la reconnaissance juridique de son Église, l’Apôtre Suprême prit la décision d’effectuer une descente dans la Province du Bas-Zaïre en vue d’annoncer lui-même cette grande nouvelle aux membres des entités ecclésiales locales."
   ],
   [
    "p",
    "En effet, accompagné des Révérends apôtres NKASA LUSALA LANDU Joêl-Alphonse, KETOMONO MAZONGI Benoît, MANKODILA MASEFI Albert, le Chef de l’Église quitta Kinshasa à la deuxième semaine du mois de mai pour se rendre à Matadi. Ils arrivèrent à Boma un vendredi et atteignirent la ville côtière de Muanda le jour suivant."
   ],
   [
    "p",
    "Avant leur départ pour Muanda, Son Eminence l’Apôtre Suprême se fit photographier au bord de la route. Pendant le tirage, le photographe vit une grande lumière sur le front de l’Envoyé de Dieu. Il s’efforça, malgré lui, de protéger la photo contre les rayons projetés par cette étrange et puissante lumière. Après cela, ils poursuivirent leur voyage à Muanda où ils furent chaleureusement accueillis par les fidèles de l’Église."
   ],
   [
    "p",
    "À leur retour à Boma, l’Église locale organisa une grande fête pour célébrer à sa manière l’obtention de la Personnalité civile. Cette expression de joie des fidèles de Boma se justifie par le fait que leur entité comptait parmi celles qui subirent les plus des persécutions pendant le long processus ayant abouti à la reconnaissance juridique de l’Église. Beaucoup de photos furent tirées lors de ces festivités. Celui qui photographia l’Apôtre Suprême à son départ de Muanda vint auprès de lui dans une attitude de profonde tristesse. Convaincu d’avoir réalisé un mauvais travail sur l’Envoyé de Dieu, il lui déclara que sa photo n’avait pas réussie parce qu’elle contenait une anomalie sur le front. Ayant contemplé la photo, l’Apôtre Suprême vit l’expression de la colombe sur son front. Il apaisa les inquiétudes du photographe qui, assurément, ne comprit pas au départ le contenu et le sens de ce signe mystérieux. L’Homme de Dieu le rassura que la photo était bien tirée et que le Seigneur avait montré sa grandeur à travers cette colombe."
   ],
   [
    "p",
    "Ayant compris la valeur de ce signe, les membres de l’Église achetèrent massivement cette photo qui fut développée en quatre cents exemplaires. Ivre de recettes qu’il réalisa sur cette photo, le photographe disparut avec le pellicule. Toutefois, beaucoup d’autres photos prises lors de cette fête portent aussi la marque de la colombe."
   ],
   [
    "p",
    "Après Boma, Son Eminence l’Apôtre Suprême regagna Kinshasa pour les préparatifs de la grande fête du 20 juillet 1980, célébrée au Palais du Peuple devant plusieurs invités et fidèles de l’Église pour marquer la sortie officielle de la Communauté de Douze Apôtres au Zaïre. Certains invités vinrent de la localité d’origine du Prophète de Dieu, notamment Daniel LEBU et Daniel YUNGI. MVIKA Michel, un personnage historique de premier plan fut aussi convié à ces festivités. Le Gouvernement fut représenté par les délégués des Cabinets des Ministères de la Justice et de l’Éducation Nationale."
   ]
  ]
 },
 {
  "id": "effets",
  "n": "6",
  "title": "Les fruits de la reconnaissance",
  "period": "Depuis 1980",
  "blocks": [
   [
    "p",
    "La personnalité civile est un instrument juridique de haute portée administrative. Depuis son acquisition, le nuage d’incertitude qui planait au-dessus de l’Église s’est évanoui et toutes les inquiétudes ont disparu. Aujourd’hui, l’Église peut, s’il le faut, revendiquer ou faire valoir ses droits. Avec la personnalité civile, l’Église Universelle de Douze Apôtres a cultivé et affermi davantage son identité. Sa liberté d’actions jadis limitée s’est étendue à l’échelle planétaire. À ce jour, l’universalité de l’Église est effective. En effet, des jeunes serviteurs partis de la République Démocratique du Congo, plus particulièrement de Kinshasa, ont implantée l’Église de-ci de-là. Outre qu’elle couvre tout le territoire de la République Démocratique du Congo avec plusieurs paroisses rien que dans la Ville de Kinshasa, l’Église Universelle de Douze Apôtres se retrouve présentement dans certains pays d’Afrique, d’Europe, d’Amérique du Nord et d’Amérique Latine. Ainsi, au delà de l’éthique chrétienne qui se lit à travers le style de vie et la discipline de ses pratiquants, l’enseignement religieux de DIZOLELE Isaac qui a traversé les frontières, a trouvé dans la personnalité civile obtenue, un support de facilité pour son implantation à travers le monde, principalement dans les pays d’outre-mer. La personnalité civile a donc été un véritable détonateur qui a libéré les énergies nécessaires au progrès."
   ],
   [
    "p",
    "En effet, beaucoup de projets qui pouvaient servir de socles à l’épanouissement de l’Église en particulier et de la société en général, projets retardés par manque de personnalité civile, peuvent se matérialiser et l’Église peut à ce jour participer effectivement et plus efficacement aux enjeux de la mondialisation. Ayant recouvré sa dignité, l’Église s’est efforcée depuis de quitter son état d’immature comme l’éprouvent ses œuvres innombrables et son ouverture."
   ],
   [
    "p",
    "L’Église Universelle de Douze Apôtres est une Église indépendante. Le message qu’elle répand, vieux de deux millénaires, et celui du Christ Jésus. Elle s’évertue à faire comprendre à l’humanité la valeur toujours actuelle de l’Évangile de Christ et sa puissance salvatrice immuable."
   ],
   [
    "p",
    "Depuis ses débuts, l’Église universelle de Douze Apôtres cultive en son sein la crainte de Dieu et étend le témoignage de la vérité du Christ jamais soumise aux lois du temps."
   ],
   [
    "p",
    "Comme les autres Communautés religieuses, l’Église Universelle de Douze Apôtres participe à l’édification de la société non seulement par ses réalisations mais aussi et surtout en enseignant à ses membres l’esprit d’équité et de justice, le respect de l’autorité et celui des biens d’autrui ainsi que l’amour du travail. Elle cultive la communion dans tout ses aspects avec toutes les Communautés de bonne réputation. C’est dans cette perspective qu’elle a adhéré à l’Église du Christ au Zaïre au lendemain de l’acquisition de sa personnalité civile en 1980. Néanmoins, en vue d’exprimer sa réelle indépendance et de consolider son identité, elle s’est détachée de cette Église en 1994."
   ],
   [
    "p",
    "En ce moment où des contradictions et des confusions de tout genre secouent la société voire l’espace religieux avec des idéologies qui s’affrontent et se renient, notre vœu le plus cher est que toute l’humanité créée par Dieu soit instruite de vraies voies divines pour le salut éternel."
   ],
   [
    "p",
    "Si l’objet primaire de l’Église Universelle de Douze Apôtres est le salut des âmes, son objectif secondaire est le bien être social de la population. D’où son investissement dans des différents secteurs tels que le domaine médical, le domaine de l’enseignement, les œuvres féminines, le domaine agro-pastoral, le domaine socio-culturel."
   ],
   [
    "h3",
    "Le domaine médical"
   ],
   [
    "p",
    "La vraie Église du Seigneur Jésus-Christ ne doit pas seulement s’occuper du salut de l’âme mais elle doit aussi prendre soin du corps humain, siège de l’âme et de l’Esprit, en entretenant sa santé. Cela a été démontré par le Christ lui-même qui, tout en prêchant l’évangile, guérissait aussi les maladies et les infirmités corporelles."
   ],
   [
    "p",
    "Pour un vrai chrétien cependant, quels que soient les moyens mis en œuvre pour guérir les malades, il n’y a pas de guérison, donc pas de santé sans l’intervention de Christ. C’est pour cette raison fondamentale que le service médical de l’Église Universelle de Douze Apôtres est appelé « Service Médical Christ-Santé » qui dispose des centres médicaux installés dans plusieurs de ses paroisses."
   ],
   [
    "p",
    "Le Centre Hospitalier de Lemba, Rue Mayuma n°8, Kinshasa/Lemba-Salongo est la réalisation la plus importante. Ce Centre d’une capacité de plusieurs lits comporte un certain nombre de services. Le service médical « Christ-Santé » comprend, outre le Centre Hospitalier de Lemba plusieurs autres Centres disséminés à travers les paroisses."
   ],
   [
    "h3",
    "L’enseignement"
   ],
   [
    "p",
    "L’Église Universelle de Douze Apôtre se préoccupe de l’éducation et de l’instruction de la jeunesse, espoir de demain. C’est du reste l’un des objectifs qu’elle s’est assignée. Dans ce domaine, l’Église n’est pas en reste et n’y va pas de main morte. En effet, elle ne ménage aucun effort pour le développement de son réseau d’enseignement qui, à ce jour, compte à son actif plusieurs écoles primaires et secondaires toutes options confondues."
   ],
   [
    "h3",
    "Les œuvres féminines"
   ],
   [
    "p",
    "Pour la promotion de la femme au sein de l’Église, un ensemble de règles de conduite sociale ont été édictées par le Chef de l’Église. Ainsi, en 1983, un cadre d’épanouissement spirituel et social fut créée. Il s’agit de l’Action de la Maman de Douze Apôtres pour l’Epanouissement Spirituel et Social, en sigle « AMDAESS ». Depuis sa création, cette structure, dirigée avec dextérité par Maman DIFUIDI Véronique dont la compétence est éprouvée, a marqué beaucoup de progrès. Dans ce cadre, la femme de l’Église s’adonne :"
   ],
   [
    "list",
    [
     "aux activités spirituelles ;",
     "aux activités sociales et autres productrices de revenus.",
     "l’assistance aux nécessiteux",
     "l’alphabétisation en vue de réduire le taux d’analphabètes plus élevé parmi les femmes",
     "l’économie domestique",
     "la transformation alimentaire (jus-confiture-dentifrices…)",
     "fabrication du savon",
     "vannerie",
     "art culinaire",
     "teinturerie africaine",
     "coupe et couture"
    ]
   ],
   [
    "h3",
    "Le domaine agro-pastoral"
   ],
   [
    "p",
    "Quoique disposant d’un nombre important de concession sur l’ensemble du territoire national, l’Église Universelle de Douze Apôtres ne s’est pas encore affirmée dans le domaine Agro-pastoral. La plupart des concessions dont elle dispose sont encore moins exploitées faute de moyens d’équipement adéquat. Secteur vital pour tout développement, l’Église l’a inscrit parmi ses priorités dans les temps à venir lorsque tous les moyens conséquents seraient réunis."
   ],
   [
    "h3",
    "Le domaine socio-culturel"
   ],
   [
    "p",
    "Le patrimoine prophético-apostolique de l’Église Universelle de Douze Apôtre constitue une richesse au profit des générations actuelles et futures. En effet, par la production des œuvres littéraires, l’Église entend conserver et publier toutes les réalisations que l’Esprit de Dieu inspire à son Prophète au serviteur de l’Église et aux membres, notamment : enseignements, chansons, documents, théâtres, miracles, témoignages… Tout cela doit être pérennisé à travers les écrits. C’est dans ce contexte qu’en date du 20 février 1999 a été instituée au sein de l’Église par Son Eminence l’Apôtre Suprême une Commission Scientifique chargée de rédiger l’histoire de l’Église et de son Fondateur. Constituées des jeunes universitaires tous membres de l’Église, cette Commission s’attellera à réaliser plusieurs autres publications."
   ],
   [
    "p",
    "De son côté, la Direction de l’Evangélisation & Vie de l’Église s’active aussi à produire des document relevant de son secteur. En outre, les structures d’encadrement des adeptes sont organisées autour du laïcat, de la jeunesse (JEUDA) et de l’Action de la femme."
   ],
   [
    "p",
    "Enfin, la pratique de bonnes œuvres, règle d’or au sein de l’Église, transparaît à travers à l’esprit de fraternité, de solidarité et d’entraide, le tout symbolisé par la communion fraternelle qui est la vie de l’Église."
   ]
  ]
 }
];
