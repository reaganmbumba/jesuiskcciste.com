-- Contenu de base du site, copié dans la base pour être modifiable depuis l’administration.
-- Généré par scripts/export-site-content-sql.ts. Peut être exécuté plusieurs fois sans doublon.

-- gallery (13)
insert into public.site_content (collection, position, data, published)
select v.collection, v.position, v.data::jsonb, true from (values
  ('gallery', 10, '{"src":"/images/galerie/foule-assemblee.jpg","w":1001,"h":675,"theme":"culte","caption":{"fr":"Une grande foule de fidèles rassemblée autour des serviteurs","en":"A large crowd of believers gathered around the servants","pt":"Uma grande multidão de fiéis reunida à volta dos servos"}}'),
  ('gallery', 20, '{"src":"/images/galerie/prophete-lecture-dedicace.jpg","w":951,"h":1400,"theme":"temples","caption":{"fr":"Son Éminence le Chef Spirituel lisant un texte lors d’une dédicace","en":"His Eminence the Spiritual Leader reading a text at a dedication","pt":"Sua Eminência o Chefe Espiritual lendo um texto numa dedicação"}}'),
  ('gallery', 30, '{"src":"/images/galerie/paroisse-belvedere-matadi.jpg","w":1400,"h":950,"theme":"temples","caption":{"fr":"Le temple de la paroisse de Belvédère, à Matadi","en":"The temple of the Belvédère parish in Matadi","pt":"O templo da paróquia de Belvédère, em Matadi"}}'),
  ('gallery', 40, '{"src":"/images/galerie/mamans-pagne-kcc.jpg","w":1400,"h":944,"theme":"mamans","caption":{"fr":"Des mamans en pagne KCC","en":"Mothers wearing KCC cloth","pt":"Mamãs com pano KCC"}}'),
  ('gallery', 50, '{"src":"/images/galerie/procession-des-mamans.jpg","w":1400,"h":934,"theme":"mamans","caption":{"fr":"Procession des mamans","en":"Procession of the mothers","pt":"Procissão das mamãs"}}'),
  ('gallery', 60, '{"src":"/images/galerie/maman-pagne-kcc.jpg","w":948,"h":1400,"theme":"mamans","caption":{"fr":"Une maman en tenue aux lettres KCC","en":"A mother in an outfit bearing the KCC letters","pt":"Uma mamã com traje com as letras KCC"}}'),
  ('gallery', 70, '{"src":"/images/galerie/priere-des-anciens.jpg","w":673,"h":1001,"theme":"culte","caption":{"fr":"Les anciens réunis dans la prière","en":"Elders gathered in prayer","pt":"Os anciãos reunidos em oração"}}'),
  ('gallery', 80, '{"src":"/images/galerie/assemblee-attentive.jpg","w":1013,"h":686,"theme":"culte","caption":{"fr":"Une assemblée attentive","en":"An attentive gathering","pt":"Uma assembleia atenta"}}'),
  ('gallery', 90, '{"src":"/images/galerie/repas-fraternel.jpg","w":984,"h":712,"theme":"culte","caption":{"fr":"Un repas de communion fraternelle","en":"A meal of fraternal communion","pt":"Uma refeição de comunhão fraterna"}}'),
  ('gallery', 100, '{"src":"/images/galerie/serviteurs-en-uniforme.jpg","w":1010,"h":713,"theme":"culte","caption":{"fr":"Des serviteurs en uniforme devant la table du culte","en":"Servants in uniform in front of the service table","pt":"Servos de uniforme diante da mesa do culto"}}'),
  ('gallery', 110, '{"src":"/images/galerie/seance-de-travail.jpg","w":975,"h":680,"theme":"culte","caption":{"fr":"Une séance de travail des responsables","en":"A working session of the leaders","pt":"Uma sessão de trabalho dos responsáveis"}}'),
  ('gallery', 120, '{"src":"/images/galerie/archive-serviteurs-noir-et-blanc.jpg","w":1383,"h":949,"theme":"histoire","caption":{"fr":"Archive en noir et blanc : un groupe de serviteurs","en":"Black-and-white archive: a group of servants","pt":"Arquivo a preto e branco: um grupo de servos"}}'),
  ('gallery', 130, '{"src":"/images/galerie/archive-groupe-sepia.jpg","w":1383,"h":910,"theme":"histoire","caption":{"fr":"Archive ancienne : une communauté rassemblée","en":"Early archive: a community gathered together","pt":"Arquivo antigo: uma comunidade reunida"}}')
) as v(collection, position, data)
where not exists (select 1 from public.site_content s where s.collection = 'gallery');

-- videos (7)
insert into public.site_content (collection, position, data, published)
select v.collection, v.position, v.data::jsonb, true from (values
  ('videos', 10, '{"youtube":"iy940YMSrgE","title":{"fr":"Hommage au peuple Yombe – Volume 2 : Tuidi vava, beto","en":"Hommage au peuple Yombe – Volume 2 : Tuidi vava, beto","pt":"Hommage au peuple Yombe – Volume 2 : Tuidi vava, beto"}}'),
  ('videos', 20, '{"youtube":"sOCX5I-HSDY","title":{"fr":"Hommage au peuple Yombe : Tuidi vava, beto ba Yombe","en":"Hommage au peuple Yombe : Tuidi vava, beto ba Yombe","pt":"Hommage au peuple Yombe : Tuidi vava, beto ba Yombe"}}'),
  ('videos', 30, '{"youtube":"9LAkuBVqYJU","title":{"fr":"Viens inscrire ta vérité","en":"Viens inscrire ta vérité","pt":"Viens inscrire ta vérité"}}'),
  ('videos', 40, '{"youtube":"4pMd9Hm3AY0","title":{"fr":"Nous te rendons grâce, Yahweh","en":"Nous te rendons grâce, Yahweh","pt":"Nous te rendons grâce, Yahweh"}}'),
  ('videos', 50, '{"youtube":"YB1brJFQeVs","title":{"fr":"Sunga ngai Yawhé na kueya te","en":"Sunga ngai Yawhé na kueya te","pt":"Sunga ngai Yawhé na kueya te"}}'),
  ('videos', 60, '{"youtube":"gu3hBNiSxKA","title":{"fr":"Tout savoir","en":"Tout savoir","pt":"Tout savoir"}}'),
  ('videos', 70, '{"youtube":"wzIzeujWbfU","title":{"fr":"La vidéo la plus regardée de la chaîne","en":"The channel’s most-watched video","pt":"O vídeo mais visto do canal"}}')
) as v(collection, position, data)
where not exists (select 1 from public.site_content s where s.collection = 'videos');

-- operations (2)
insert into public.site_content (collection, position, data, published)
select v.collection, v.position, v.data::jsonb, true from (values
  ('operations', 10, '{"key":"luanika","parish":"Luanika","done":true,"photos":["/images/solidarite/luanika-eglise.jpg","/images/solidarite/luanika-facade.jpg"],"title":{"fr":"Opération 100 chaises — Paroisse de Luanika","en":"Operation 100 Chairs — Luanika parish","pt":"Operação 100 cadeiras — Paróquia de Luanika"},"text":{"fr":"Dans cette paroisse rurale du Kongo-Central, les fidèles s’asseyaient sur des bancs en bambou. Grâce à la mobilisation des KCCistes de plusieurs pays, l’objectif a été dépassé : 150 chaises en plastique ont été achetées à Lufu puis transportées jusqu’à Luanika.","en":"In this rural parish of Kongo-Central, the faithful used to sit on bamboo benches. Thanks to KCCistes from several countries, the goal was exceeded: 150 plastic chairs were bought in Lufu and carried all the way to Luanika.","pt":"Nesta paróquia rural do Kongo-Central, os fiéis sentavam-se em bancos de bambu. Graças à mobilização dos KCCistas de vários países, o objetivo foi ultrapassado: 150 cadeiras de plástico foram compradas em Lufu e transportadas até Luanika."},"date":{"fr":"Remise officielle le dimanche 13 septembre 2026","en":"Official handover on Sunday 13 September 2026","pt":"Entrega oficial no domingo, 13 de setembro de 2026"},"facts":{"fr":"150 chaises remises\n73 contributeurs\n1 326,60 $ + 584 000 FC collectés","en":"150 chairs delivered\n73 contributors\n$1,326.60 + 584,000 FC raised","pt":"150 cadeiras entregues\n73 contribuidores\n1 326,60 $ + 584 000 FC recolhidos"}}'),
  ('operations', 20, '{"key":"ngidinga","parish":"Ngidinga","done":false,"photos":["/images/solidarite/ngidinga-bancs-bambou.jpg"],"title":{"fr":"Opération 100 chaises — Paroisse de Ngidinga","en":"Operation 100 Chairs — Ngidinga parish","pt":"Operação 100 cadeiras — Paróquia de Ngidinga"},"text":{"fr":"Après Luanika, la paroisse sœur de Ngidinga : les fidèles y prient encore assis sur des bambous posés sur des briques. La collecte continue pour leur offrir 100 chaises.","en":"After Luanika, our sister parish of Ngidinga: the faithful still pray sitting on bamboo poles laid on bricks. The collection continues to give them 100 chairs.","pt":"Depois de Luanika, a paróquia irmã de Ngidinga: os fiéis ainda rezam sentados em bambus apoiados em tijolos. A recolha continua para lhes oferecer 100 cadeiras."},"date":{"fr":"Liste à jour au 22 octobre 2026 · achat et remise des chaises en préparation","en":"List as of 22 October 2026 · purchase and handover of the chairs being prepared","pt":"Lista de 22 de outubro de 2026 · compra e entrega das cadeiras em preparação"},"facts":{"fr":"Objectif : 100 chaises\n40 contributions\n979 $ + 316 000 FC collectés","en":"Goal: 100 chairs\n40 contributions\n$979 + 316,000 FC raised","pt":"Objetivo: 100 cadeiras\n40 contribuições\n979 $ + 316 000 FC recolhidos"}}')
) as v(collection, position, data)
where not exists (select 1 from public.site_content s where s.collection = 'operations');

-- contributions (113)
insert into public.site_content (collection, position, data, published)
select v.collection, v.position, v.data::jsonb, true from (values
  ('contributions', 10, '{"operation":"luanika","flag":"🇨🇩","name":"Son Éminence Dizolele MPUNGU ISAAC","amount":"300 $"}'),
  ('contributions', 20, '{"operation":"luanika","flag":"🇦🇴","name":"Apôtre DOCOLO NDULI","amount":"11 $"}'),
  ('contributions', 30, '{"operation":"luanika","flag":"🇿🇦","name":"Apôtre Lubini Irma","amount":"21 $"}'),
  ('contributions', 40, '{"operation":"luanika","flag":"🇨🇬","name":"Apôtre Dieudonné Ngimbi","amount":"21 $"}'),
  ('contributions', 50, '{"operation":"luanika","flag":"🇺🇸","name":"Apôtre Eduardo Lukeba","amount":"25 $"}'),
  ('contributions', 60, '{"operation":"luanika","flag":"🇨🇩","name":"Apôtre Mantuakila Ernest","amount":"11 $"}'),
  ('contributions', 70, '{"operation":"luanika","flag":"🇨🇦","name":"Famille Révérend Apôtre E. Cardoso","amount":"120 $"}'),
  ('contributions', 80, '{"operation":"luanika","flag":"🇬🇧","name":"Apôtre Michael Kasu","amount":"30 $"}'),
  ('contributions', 90, '{"operation":"luanika","flag":"🇨🇬","name":"Papa Sielo Mbambi","amount":"10 $"}'),
  ('contributions', 100, '{"operation":"luanika","flag":"🇬🇧","name":"Papa Sielo Pangala Kianza","amount":"30 $"}'),
  ('contributions', 110, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Reagan MBUMBA","amount":"20 000 FC"}'),
  ('contributions', 120, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Mbuku Blaivani","amount":"20 000 FC"}'),
  ('contributions', 130, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Béni Nseke Nseke","amount":"20 000 FC"}'),
  ('contributions', 140, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Yves Manzuani","amount":"15 $"}'),
  ('contributions', 150, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Bosco Zimbu","amount":"20 000 FC"}'),
  ('contributions', 160, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Muizila Jacques Taylor","amount":"23 000 FC"}'),
  ('contributions', 170, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Di-MPUNGU Querth","amount":"15 $"}'),
  ('contributions', 180, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Kumbu Panzu André","amount":"10 $"}'),
  ('contributions', 190, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Prosper Lokusa","amount":"10 $"}'),
  ('contributions', 200, '{"operation":"luanika","flag":"🇨🇩","name":"Fondation Beaugabel Gloire Mabanza (FBGM)","amount":"100 000 FC"}'),
  ('contributions', 210, '{"operation":"luanika","flag":"🇦🇴","name":"Prédi Muteketa Khonde","amount":"11 $"}'),
  ('contributions', 220, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Eder Nlandu Masaki","amount":"15 $"}'),
  ('contributions', 230, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Trésor Muanda","amount":"15 $"}'),
  ('contributions', 240, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Kionga Sevolo Jordi","amount":"10 $"}'),
  ('contributions', 250, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Celio Lukanu","amount":"9 $"}'),
  ('contributions', 260, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Gracy SHUNGU","amount":"22 000 FC"}'),
  ('contributions', 270, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Apollinaire Nsunda","amount":"25 000 FC"}'),
  ('contributions', 280, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Polydore Modeste","amount":"35 000 FC"}'),
  ('contributions', 290, '{"operation":"luanika","flag":"🇨🇩","name":"Prédicateur Dizolele KUMBU","amount":"10 $"}'),
  ('contributions', 300, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Binkoko Matundu Dolly","amount":"20 000 FC"}'),
  ('contributions', 310, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Nsimba Mayindu Samuel","amount":"50 000 FC"}'),
  ('contributions', 320, '{"operation":"luanika","flag":"🇳🇱","name":"Prédi R. K","amount":"50 $"}'),
  ('contributions', 330, '{"operation":"luanika","flag":"🇿🇦","name":"Prédi Miranda","amount":"30 $"}'),
  ('contributions', 340, '{"operation":"luanika","flag":"🇿🇦","name":"Prédi Beti","amount":"20 $"}'),
  ('contributions', 350, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi Isaac Vambanu Lukombo","amount":"24 000 FC"}'),
  ('contributions', 360, '{"operation":"luanika","flag":"🇨🇩","name":"Disc. Méthode Akawa","amount":"20 000 FC"}'),
  ('contributions', 370, '{"operation":"luanika","flag":"🇺🇸","name":"Disciple Landry Bamba Miak’s","amount":"21 $"}'),
  ('contributions', 380, '{"operation":"luanika","flag":"🇧🇷","name":"Disc. Rolly Daniel Nzoussi","amount":"7,6 $"}'),
  ('contributions', 390, '{"operation":"luanika","flag":"🇬🇦","name":"Disc. Grâce Matondo","amount":"7 $"}'),
  ('contributions', 400, '{"operation":"luanika","flag":"🇷🇺","name":"Disciple Gaga Stache","amount":"11 $"}'),
  ('contributions', 410, '{"operation":"luanika","flag":"🇨🇩","name":"Disc. Jeancy Mambungu Atumbila","amount":"10 000 FC"}'),
  ('contributions', 420, '{"operation":"luanika","flag":"🇨🇩","name":"Disciple Serge TSHINKELA","amount":"23 000 FC"}'),
  ('contributions', 430, '{"operation":"luanika","flag":"🇨🇩","name":"Disciple Jeancy Fatou","amount":"20 000 FC"}'),
  ('contributions', 440, '{"operation":"luanika","flag":"🇨🇩","name":"Maman PELAGIE Mankutima","amount":"50 $"}'),
  ('contributions', 450, '{"operation":"luanika","flag":"🇨🇩","name":"Diaco Élodie MBUMBA","amount":"11 000 FC"}'),
  ('contributions', 460, '{"operation":"luanika","flag":"🇫🇷","name":"Diaco Albertine Ngoma","amount":"22,5 $"}'),
  ('contributions', 470, '{"operation":"luanika","flag":"🇨🇩","name":"Maman Diaco Rolande Lutumba","amount":"22 000 FC"}'),
  ('contributions', 480, '{"operation":"luanika","flag":"🇫🇷","name":"Diaconesse Fifi","amount":"20 $"}'),
  ('contributions', 490, '{"operation":"luanika","flag":"🇨🇩","name":"Diaco Bibi","amount":"10 $"}'),
  ('contributions', 500, '{"operation":"luanika","flag":"🇨🇩","name":"Diaco Maniongo Augustine","amount":"12 000 FC"}'),
  ('contributions', 510, '{"operation":"luanika","flag":"🇨🇩","name":"Maman Diaco Clarisse Lutadio","amount":"5 $"}'),
  ('contributions', 520, '{"operation":"luanika","flag":"🇫🇷","name":"Diac. Mabiala Adélaïde","amount":"20 $"}'),
  ('contributions', 530, '{"operation":"luanika","flag":"🇨🇩","name":"Diac. Julian Nkikela","amount":"22 000 FC"}'),
  ('contributions', 540, '{"operation":"luanika","flag":"🇿🇦","name":"Diac. Mifi Songisa","amount":"5 $"}'),
  ('contributions', 550, '{"operation":"luanika","flag":"🇫🇷","name":"Diaconesse Mamie Ntantu","amount":"12,50 $"}'),
  ('contributions', 560, '{"operation":"luanika","flag":"🇨🇩","name":"Maman Élysée Dialungila","amount":"15 000 FC"}'),
  ('contributions', 570, '{"operation":"luanika","flag":"🇨🇩","name":"Maman M.K","amount":"10 $"}'),
  ('contributions', 580, '{"operation":"luanika","flag":"🇺🇸","name":"Maman Candy Nguimbi","amount":"21 $"}'),
  ('contributions', 590, '{"operation":"luanika","flag":"🇺🇸","name":"Maman RN","amount":"50 $"}'),
  ('contributions', 600, '{"operation":"luanika","flag":"🇨🇩","name":"Maman Sirozette Panzu MPOLO","amount":"50 $"}'),
  ('contributions', 610, '{"operation":"luanika","flag":"🇿🇦","name":"Mama Claumi Kueluyele","amount":"10 $"}'),
  ('contributions', 620, '{"operation":"luanika","flag":"🇿🇦","name":"Maman Celo Wunkeba","amount":"3 $"}'),
  ('contributions', 630, '{"operation":"luanika","flag":"🇨🇩","name":"Maman R.K","amount":"11 $"}'),
  ('contributions', 640, '{"operation":"luanika","flag":"🇨🇩","name":"Famille BASILUA","amount":"30 000 FC"}'),
  ('contributions', 650, '{"operation":"luanika","flag":"🇨🇩","name":"Famille Prédi KINKELA Nzazi","amount":"46 $"}'),
  ('contributions', 660, '{"operation":"luanika","flag":"🇨🇩","name":"Papa Amador","amount":"22 $"}'),
  ('contributions', 670, '{"operation":"luanika","flag":"🇨🇩","name":"Notre frère","amount":"30 $"}'),
  ('contributions', 680, '{"operation":"luanika","flag":"🇺🇸","name":"VisionmondeTV","amount":"21 $"}'),
  ('contributions', 690, '{"operation":"luanika","flag":"🇦🇴","name":"Isaac Dizolele Diambo Chibamba","amount":"12 $"}'),
  ('contributions', 700, '{"operation":"luanika","flag":"🇨🇩","name":"Papa Akim Baza","amount":"20 $"}'),
  ('contributions', 710, '{"operation":"luanika","flag":"🇨🇩","name":"Papa Sabu Ndangi Daniel","amount":"20 000 FC"}'),
  ('contributions', 720, '{"operation":"luanika","flag":"🇨🇩","name":"Famille Prédicateur BUABAYINA","amount":"20 $"}'),
  ('contributions', 730, '{"operation":"luanika","flag":"🇨🇩","name":"Prédi DNT","amount":"10 $"}'),
  ('contributions', 740, '{"operation":"ngidinga","flag":"🇦🇴","name":"Apôtre Dokolo","amount":"10 $"}'),
  ('contributions', 750, '{"operation":"ngidinga","flag":"🇿🇦","name":"Apôtre Lubini Irma","amount":"21 $"}'),
  ('contributions', 760, '{"operation":"ngidinga","flag":"🇨🇬","name":"Apôtre Dieudonné Ngimbi","amount":"21 $"}'),
  ('contributions', 770, '{"operation":"ngidinga","flag":"🇨🇩","name":"Apôtre Manduakila Makimpuni Ernest","amount":"10 $"}'),
  ('contributions', 780, '{"operation":"ngidinga","flag":"🇮🇪","name":"Papa Sielo Antonio Fernando","amount":"159 $"}'),
  ('contributions', 790, '{"operation":"ngidinga","flag":"🇦🇴","name":"Predi Macaire Mavungu","amount":"20 $"}'),
  ('contributions', 800, '{"operation":"ngidinga","flag":"🇨🇩","name":"Predi Reagan Mbumba","amount":"20 $"}'),
  ('contributions', 810, '{"operation":"ngidinga","flag":"🇨🇩","name":"Predi Tiya Rodrick","amount":"15 $"}'),
  ('contributions', 820, '{"operation":"ngidinga","flag":"🇨🇩","name":"Predi Félicien BILANDI","amount":"11 $"}'),
  ('contributions', 830, '{"operation":"ngidinga","flag":"🇨🇩","name":"Predi Prosper Lukusa","amount":"21 $"}'),
  ('contributions', 840, '{"operation":"ngidinga","flag":"🇨🇩","name":"Predi Ismaël Sikayala","amount":"15 $"}'),
  ('contributions', 850, '{"operation":"ngidinga","flag":"🇦🇴","name":"Predi Paciência Cebastião Fula","amount":"5 $"}'),
  ('contributions', 860, '{"operation":"ngidinga","flag":"🇹🇷","name":"Predi Charly Lubulu","amount":"100 $"}'),
  ('contributions', 870, '{"operation":"ngidinga","flag":"🇨🇩","name":"Predi Trésor MUANDA","amount":"35 000 FC"}'),
  ('contributions', 880, '{"operation":"ngidinga","flag":"🇨🇩","name":"Predi Didier Diambu Nsasi","amount":"30 000 FC"}'),
  ('contributions', 890, '{"operation":"ngidinga","flag":"🇳🇱","name":"Predi Rachidi Kaza","amount":"55 $"}'),
  ('contributions', 900, '{"operation":"ngidinga","flag":"🇨🇩","name":"Disc. Kilola Christian","amount":"10 $"}'),
  ('contributions', 910, '{"operation":"ngidinga","flag":"🇫🇷","name":"Disc. Merlin Muanda","amount":"10 $"}'),
  ('contributions', 920, '{"operation":"ngidinga","flag":"🇨🇩","name":"Disc. Dizolele Mvuezolo","amount":"6 000 FC"}'),
  ('contributions', 930, '{"operation":"ngidinga","flag":"🇨🇩","name":"Fondation Beaugabel Gloire Mabanza (FBGM)","amount":"100 000 FC"}'),
  ('contributions', 940, '{"operation":"ngidinga","flag":"🇨🇩","name":"Diac. Rolande Lutumba","amount":"55 000 FC"}'),
  ('contributions', 950, '{"operation":"ngidinga","flag":"🇫🇷","name":"Diac. Albertine Ngoma","amount":"25 $"}'),
  ('contributions', 960, '{"operation":"ngidinga","flag":"🇨🇩","name":"Diac. Augustine Maniongo","amount":"12 000 FC"}'),
  ('contributions', 970, '{"operation":"ngidinga","flag":"🇺🇸","name":"Apôtre Eduardo Lukeba","amount":"25 $"}'),
  ('contributions', 980, '{"operation":"ngidinga","flag":"🇬🇧","name":"Diac. Florence Kasu","amount":"20 $"}'),
  ('contributions', 990, '{"operation":"ngidinga","flag":"🇨🇩","name":"Disciple Landry","amount":"20 $"}'),
  ('contributions', 1000, '{"operation":"ngidinga","flag":"🇨🇩","name":"Maman Candi","amount":"20 $"}'),
  ('contributions', 1010, '{"operation":"ngidinga","flag":"🇨🇩","name":"Paroisse de Luanika","amount":"30 000 FC"}'),
  ('contributions', 1020, '{"operation":"ngidinga","flag":"🇨🇩","name":"Disc. Serge TSHINKELA","amount":"13 $"}'),
  ('contributions', 1030, '{"operation":"ngidinga","flag":"🇿🇦","name":"RSA","amount":"100 $"}'),
  ('contributions', 1040, '{"operation":"ngidinga","flag":"🇨🇦","name":"Famille du Révérend Apôtre E. Cardoso","amount":"120 $"}'),
  ('contributions', 1050, '{"operation":"ngidinga","flag":"🇬🇧","name":"Apôtre Michael","amount":"30 $"}'),
  ('contributions', 1060, '{"operation":"ngidinga","flag":"🇨🇩","name":"Diac. Sevolo Ngimbi Alca","amount":"10 $"}'),
  ('contributions', 1070, '{"operation":"ngidinga","flag":"🇨🇭","name":"Papa Sielo Pangala Kianza","amount":"31 $"}'),
  ('contributions', 1080, '{"operation":"ngidinga","flag":"🇨🇩","name":"Familles Predi Vambanu Lukombo","amount":"25 000 FC"}'),
  ('contributions', 1090, '{"operation":"ngidinga","flag":"🇨🇩","name":"Bébé ANAËLLE CELRA LUKANU-MU-MAMBOTE","amount":"10 $"}'),
  ('contributions', 1100, '{"operation":"ngidinga","flag":"🇫🇷","name":"Diaconesse Mamie Ntantu","amount":"15 $"}'),
  ('contributions', 1110, '{"operation":"ngidinga","flag":"🇬🇦","name":"Apôtre Mbodo","amount":"23 000 FC"}'),
  ('contributions', 1120, '{"operation":"ngidinga","flag":"🇨🇩","name":"Apôtre Kabeyabeya Kaburongo","amount":"21 $"}'),
  ('contributions', 1130, '{"operation":"ngidinga","flag":"🇨🇩","name":"Ma Diaconesse Marceline Mpandu Milandu","amount":"16 $"}')
) as v(collection, position, data)
where not exists (select 1 from public.site_content s where s.collection = 'contributions');

-- donation_accounts (2)
insert into public.site_content (collection, position, data, published)
select v.collection, v.position, v.data::jsonb, true from (values
  ('donation_accounts', 10, '{"provider":"orange_money","number":"+243 840 238 592","holder":"Reagan MBUMBA MBUMBA"}'),
  ('donation_accounts', 20, '{"provider":"mpesa","number":"+243 861 271 633","holder":"Reagan MBUMBA MBUMBA"}')
) as v(collection, position, data)
where not exists (select 1 from public.site_content s where s.collection = 'donation_accounts');

-- Actualités (7)
insert into public.announcements (id, title, summary, content, image_url, author, category, published_at, status, audience, pinned) values
  (md5('edito-ann-concert-glodie-massamba-matadi')::uuid, 'Glodie Massamba en concert à Matadi, un rendez-vous qui a rassemblé des talents venus de plusieurs horizons', 'La ville portuaire a vibré au rythme du concert de Glodie Massamba, entouré de musiciens venus de Kinshasa et d’ailleurs.', 'La ville portuaire de Matadi a vibré au rythme de la musique à l’occasion du concert de Glodie Massamba, un rendez-vous artistique marqué par la participation de plusieurs musiciens venus de Kinshasa et d’ailleurs. Cet événement a mis en lumière la richesse de la scène musicale congolaise et l’importance des rencontres entre artistes de différentes régions.

Sur scène, Glodie Massamba a partagé un moment musical avec le public, porté par les voix, les instruments et l’énergie des musiciens qui l’accompagnaient. La présence d’autres artistes a contribué à donner à ce concert une dimension particulière, favorisant le partage d’expériences, la collaboration et la découverte de différents talents.

MATADI, UN CARREFOUR DE LA MUSIQUE CONGOLAISE

La participation de musiciens venus de Kinshasa et d’autres horizons témoigne de l’attractivité de Matadi pour les événements culturels. Cette rencontre illustre la capacité de la musique à rapprocher les villes, les communautés et les générations.

De tels rendez-vous permettent aux artistes de se produire devant de nouveaux publics, de renforcer leurs relations professionnelles et de promouvoir leurs talents au-delà de leurs villes respectives. Ils constituent également une occasion de valoriser la scène musicale du Kongo Central tout en accueillant des artistes venus partager leur passion.

UNE SCÈNE DE PARTAGE ET DE COLLABORATION

Au centre de la scène, Glodie Massamba, micro à la main, était entouré de musiciens et de choristes. Cette image illustre le caractère collectif d’une prestation musicale et rappelle que derrière chaque spectacle se trouvent des chanteurs, des instrumentistes et des accompagnateurs dont la complémentarité contribue à créer une expérience vivante pour le public.

Au-delà du spectacle, ce type d’initiative rappelle la nécessité de multiplier les rencontres artistiques, de soutenir les talents et de créer davantage de passerelles entre les musiciens de Kinshasa, de Matadi et d’autres villes du pays.

LA MUSIQUE, UN LANGAGE QUI RASSEMBLE

Le concert de Glodie Massamba à Matadi rappelle que la musique demeure un puissant moyen d’expression, de rassemblement et de valorisation culturelle. La participation d’artistes venus de différents horizons donne à ce rendez-vous une dimension de partage qui dépasse les frontières géographiques.

Matadi confirme ainsi son potentiel comme espace de rencontre pour les talents et de promotion de la culture congolaise. Ces initiatives contribuent à dynamiser la vie culturelle et à renforcer les liens entre les artistes et leurs publics.

La musique rassemble, les talents se rencontrent et la culture congolaise continue de faire entendre sa voix.

PRESSE – JE SUIS KCCISTE', '/images/actualites/glodie-massamba-matadi.jpg', 'JE SUIS KCCiste', 'Musique', '2026-10-21T06:00:00.000Z', 'published', 'public', true),
  (md5('edito-ann-site')::uuid, 'JE SUIS KCCiste : la maison numérique de la communauté est en ligne', 'Actualités, agenda, paroisses, formations, musique et solidarité réunis en un seul lieu, en français, anglais et portugais.', 'Le site JE SUIS KCCiste rassemble les KCCistes de la RD Congo et de la diaspora. Créez votre compte, rattachez-vous à votre paroisse et à votre section, suivez l’agenda et les formations, écoutez les cantiques et participez aux projets de solidarité.

Le site est disponible en français, en anglais et en portugais, sur ordinateur, sur téléphone et en application Android.', '/images/hero-communaute.jpg', 'JE SUIS KCCiste', 'Communauté', '2026-10-20T09:00:00.000Z', 'published', 'public', true),
  (md5('edito-ann-doctrine')::uuid, 'La doctrine et l’histoire de l’Église désormais en trois langues', 'Le KCC, la profession de foi, les Paroles de l’Alliance, les fêtes et la vie du Prophète, à lire en ligne.', 'Les textes officiels de l’Église Bon Nouveau Message (KCC) sont maintenant consultables sur le site : l’apparition du KCC, l’Oracle du 15 avril 2003, la profession de foi, les dix Paroles de l’Alliance, les sacrements, les fêtes et la vie du Prophète.

Rendez-vous dans la rubrique « Doctrine et histoire ».', '/images/archives/archive-assemblee-noir-et-blanc.jpg', 'JE SUIS KCCiste', 'Enseignement', '2026-10-19T09:00:00.000Z', 'published', 'public', false),
  (md5('edito-ann-musique')::uuid, 'KCC Music : écoutez et soutenez les chorales', 'Cantiques d’ensemble et chants de la communauté à écouter en ligne, avec paiement par mobile money.', 'Retrouvez les cantiques d’ensemble de l’EBNM/KCC et les chants des artistes de la communauté dans KCC Music. Les titres et albums proposés à la vente se règlent par M-Pesa, Orange Money ou Airtel Money.', '/images/accueil/musique.svg', 'JE SUIS KCCiste', 'Musique', '2026-10-18T09:00:00.000Z', 'published', 'public', false),
  (md5('edito-ann-youtube')::uuid, 'Abonnez-vous à la chaîne YouTube « Je suis KCCiste »', 'Chants, enseignements et moments de la communauté en vidéo.', 'La chaîne YouTube « Je suis KCCiste » publie régulièrement des chants, des enseignements et des moments de la communauté. Abonnez-vous, activez la cloche et partagez les vidéos autour de vous.', '/images/kcc-explication-apparition-poster.jpg', 'JE SUIS KCCiste', 'Vidéos', '2026-10-17T09:00:00.000Z', 'published', 'public', false),
  (md5('edito-ann-cantiques')::uuid, 'Le recueil de cantiques en lingala et kikongo', 'Les paroles des cantiques d’ensemble, consultables sur téléphone pendant le culte.', 'Le recueil de cantiques est disponible dans la rubrique « Cantiques ». Recherchez un cantique par numéro, titre ou langue et suivez les paroles sur votre téléphone.', '/images/accueil/parole.svg', 'JE SUIS KCCiste', 'Cantiques', '2026-10-16T09:00:00.000Z', 'published', 'public', false),
  (md5('edito-ann-academie')::uuid, 'Académie KCC : premières formations en accès libre', 'Le KCC, la profession de foi et l’histoire du Prophète, leçon par leçon.', 'L’Académie KCC propose ses premières formations en accès libre, construites à partir des textes officiels de l’Église. D’autres parcours, avec examens et certificats, seront ajoutés par les formateurs.', '/images/accueil/formation.svg', 'JE SUIS KCCiste', 'Formation', '2026-10-15T09:00:00.000Z', 'published', 'public', false)
on conflict (id) do nothing;

-- Bibliothèque numérique (6)
insert into public.media_items (id, title, kind, category, description, url, audience, published_at) values
  (md5('edito-med-doctrine')::uuid, 'Doctrine et histoire de l’Église', 'document', 'Enseignement', 'Le KCC, la profession de foi, l’Alliance, les fêtes et la vie du Prophète.', '/doctrine', 'public', '2026-10-20T09:00:00.000Z'),
  (md5('edito-med-alliance')::uuid, 'Les dix Paroles de l’Alliance', 'document', 'Enseignement', 'Texte officiel en plusieurs langues.', '/doctrine#loi', 'public', '2026-10-20T09:00:00.000Z'),
  (md5('edito-med-cantiques')::uuid, 'Recueil de cantiques (lingala, kikongo)', 'document', 'Cantiques', 'Les paroles des cantiques d’ensemble.', '/cantiques', 'public', '2026-10-20T09:00:00.000Z'),
  (md5('edito-med-enseignements')::uuid, 'Enseignements et récits de l’appel du Prophète', 'document', 'Enseignement', 'Parole du Prophète, histoire et chants.', '/enseignements', 'public', '2026-10-20T09:00:00.000Z'),
  (md5('edito-med-caisse')::uuid, 'Règlement de la caisse d’assistance sociale', 'document', 'Solidarité', 'Entraide en cas de deuil et de maladie.', '/enseignements#caisse', 'public', '2026-10-20T09:00:00.000Z'),
  (md5('edito-med-video-kcc')::uuid, 'Le KCC expliqué en animation', 'video', 'Vidéos', 'Courte vidéo sur l’apparition des signes KCC.', '/videos/kcc-explication-apparition.mp4', 'public', '2026-10-20T09:00:00.000Z')
on conflict (id) do nothing;
