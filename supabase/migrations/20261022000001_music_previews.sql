-- =====================================================================
-- KCC Music — Extraits payants : on écoute la moitié de chaque chant,
-- puis on l'achète (M-Pesa, Orange Money, Airtel Money) pour l'écouter en entier.
--
-- * audio_url       = l'extrait public (/audio/extraits/…, la moitié du chant)
-- * sale_file_path  = le chant entier, dans le bucket PRIVÉ `music` (dossier chants/)
-- Le chant entier n'est lisible que par lien signé, délivré par l'Edge Function
-- `boutique-musique` (action « ecoute ») aux acheteurs et aux responsables musique.
--
-- Ce fichier met aussi dans la base les chants qui n'étaient que dans le code
-- (src/content/editorial.ts) : dès qu'un chant existe en base, le site n'affiche
-- plus que les chants de la base. Il peut être relancé sans risque.
-- =====================================================================

insert into public.artists (id, name, kind, bio, image_url) values
  ('d3237de7-e98f-591e-af03-dd5a23c602d1', 'Ensemble EBNM / KCC', 'choir', 'Cantiques d’ensemble de l’Église Bon Nouveau Message (KCC).', '/images/logo-kcc.png'),
  ('0d2c23ba-bd70-58d3-9249-5f150e7e23f4', 'Patrick Beckham', 'artist', 'Artiste de la communauté KCCiste.', '/images/accueil/musique.svg'),
  ('fbaa3f59-80a4-5546-9d58-a1f3ec488338', 'JE SUIS KCCiste', 'artist', 'Chants de la communauté JE SUIS KCCiste, en lingala, kikongo, français et portugais.', '/images/logo-kcc.png')
on conflict (id) do nothing;

insert into public.albums (id, title, artist_id, cover_url) values
  ('e0b1b62b-8696-5b0c-8229-99e16859a525', 'Sélection cantiques d’ensemble – Volume 5', 'd3237de7-e98f-591e-af03-dd5a23c602d1', '/images/logo-kcc.png')
on conflict (id) do nothing;

insert into public.tracks (id, title, author, artist_id, album_id, category, duration_seconds, audio_url, sale_file_path, broadcast_rights, price_amount, price_currency) values
  ('5c28b7f2-4c76-5a15-867b-b82ea553210b', 'Sélection cantiques d’ensemble – Volume 5', 'EBNM / KCC', 'd3237de7-e98f-591e-af03-dd5a23c602d1', 'e0b1b62b-8696-5b0c-8229-99e16859a525', 'Cantiques', 618, '/audio/cantiques-ensemble-volume-5.mp3', null, 'authorized', null, null),
  ('12b1810e-7fcd-5e6f-a889-82a23715c561', 'Masina', 'EBNM / KCC', 'd3237de7-e98f-591e-af03-dd5a23c602d1', null, 'Chants', 332, '/audio/masina-ebnm-kcc.mp3', null, 'authorized', null, null),
  ('c1a178a4-6a5c-5186-a97c-565853e7ed2b', 'Merci Maman', 'Patrick Beckham', '0d2c23ba-bd70-58d3-9249-5f150e7e23f4', null, 'Chants', 231, '/audio/merci-maman-patrick-beckham.mp3', null, 'authorized', null, null),
  ('27a374e7-c221-5dd7-9dfb-10ed2c8cb9c6', 'Seigneur, guéris ce qu’ils ont détruit en moi', 'EBNM / KCC', 'd3237de7-e98f-591e-af03-dd5a23c602d1', null, 'Chants', 61, '/audio/seigneur-gueris-ce-quils-ont-detruit-en-moi.mp3', null, 'authorized', null, null),
  ('896e5564-7968-555d-a377-677ed91649ed', 'Allelua', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 224, '/audio/extraits/allelua.mp3', 'chants/allelua.mp3', 'authorized', 1, 'USD'),
  ('9d77a165-4af5-5b9a-98d8-108c4be07852', 'Bolingo (en lingala)', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 271, '/audio/extraits/bolingo-en-lingala.mp3', 'chants/bolingo-en-lingala.mp3', 'authorized', 1, 'USD'),
  ('f5eb2294-e60b-5b01-8feb-6d440134068f', 'Célibataire', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 211, '/audio/extraits/celibataire.mp3', 'chants/celibataire.mp3', 'authorized', 1, 'USD'),
  ('64941939-4dd2-5191-afe4-280fe4995fd3', 'Eh Yawhe', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 212, '/audio/extraits/eh-yawhe.mp3', 'chants/eh-yawhe.mp3', 'authorized', 1, 'USD'),
  ('20a0a31f-67f8-5636-86a1-b99a108148ee', 'Libota na ngai', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 224, '/audio/extraits/libota-na-ngai.mp3', 'chants/libota-na-ngai.mp3', 'authorized', 1, 'USD'),
  ('9399b5d9-c634-5c58-85b2-77298ee8fbbc', 'Mono Nzambi', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 107, '/audio/extraits/mono-nzambi.mp3', 'chants/mono-nzambi.mp3', 'authorized', 1, 'USD'),
  ('f237ed22-d39a-5e1f-a233-2cb1e11e4c79', 'Motivation', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 212, '/audio/extraits/motivation.mp3', 'chants/motivation.mp3', 'authorized', 1, 'USD'),
  ('88e9dce6-dbb4-573c-ae50-15999dc96afe', 'Motivation 2', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 180, '/audio/extraits/motivation-2.mp3', 'chants/motivation-2.mp3', 'authorized', 1, 'USD'),
  ('0b0db774-356e-5123-bc6f-e764098360af', 'Nanga mwa Yave', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 176, '/audio/extraits/nanga-mwa-yave.mp3', 'chants/nanga-mwa-yave.mp3', 'authorized', 1, 'USD'),
  ('89dd8266-c5ac-5f68-b86e-e3048b884ef6', 'Natiki na maboko', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 216, '/audio/extraits/natiki-na-maboko.mp3', 'chants/natiki-na-maboko.mp3', 'authorized', 1, 'USD'),
  ('d57a55f6-f815-5415-819c-2116e91ab006', 'Ngai na tali', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 91, '/audio/extraits/ngai-na-tali.mp3', 'chants/ngai-na-tali.mp3', 'authorized', 1, 'USD'),
  ('3a111c3c-3669-53a5-a105-d5640cc56617', 'Ngieti lomba (remix)', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 167, '/audio/extraits/ngieti-lomba-remix.mp3', 'chants/ngieti-lomba-remix.mp3', 'authorized', 1, 'USD'),
  ('6f3f0d32-80cb-5428-be4d-3173d0112e23', 'Ngolu', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 135, '/audio/extraits/ngolu.mp3', 'chants/ngolu.mp3', 'authorized', 1, 'USD'),
  ('df3ff3fa-5dd1-5ac3-b267-272cfe6ab12e', 'Profession de foi', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 209, '/audio/extraits/profession-de-foi.mp3', 'chants/profession-de-foi.mp3', 'authorized', 1, 'USD'),
  ('fedc5f88-98de-53db-ba54-2b5091e67ac8', 'Profession de foi (en portugais)', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 248, '/audio/extraits/profession-de-foi-portugais.mp3', 'chants/profession-de-foi-portugais.mp3', 'authorized', 1, 'USD'),
  ('ad97f314-97b2-5505-bb74-32d6b8cb6045', 'Sainte convocation', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 157, '/audio/extraits/sainte-convocation.mp3', 'chants/sainte-convocation.mp3', 'authorized', 1, 'USD'),
  ('452638db-5e8e-5e67-828c-deeaab1dec2f', 'Samba', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 202, '/audio/extraits/samba.mp3', 'chants/samba.mp3', 'authorized', 1, 'USD'),
  ('64bf858b-e93e-589f-a72f-5a0a1be927cb', 'Simba ngai makasi', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 197, '/audio/extraits/simba-ngai-makasi.mp3', 'chants/simba-ngai-makasi.mp3', 'authorized', 1, 'USD'),
  ('370a722c-def6-5261-872b-4a9894a5292c', 'Tala motema na ngai', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 160, '/audio/extraits/tala-motema-na-ngai.mp3', 'chants/tala-motema-na-ngai.mp3', 'authorized', 1, 'USD'),
  ('8ba0549b-4999-51bf-be34-d5984c153d0f', 'Totondele', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 140, '/audio/extraits/totondele.mp3', 'chants/totondele.mp3', 'authorized', 1, 'USD'),
  ('a8a3ddfb-d0e3-56b4-96ea-410e943afe37', 'Vrai KCCiste (en portugais)', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 222, '/audio/extraits/vrai-kcciste-portugais.mp3', 'chants/vrai-kcciste-portugais.mp3', 'authorized', 1, 'USD'),
  ('1a66423f-e6e0-5b22-a1b2-a872b4e9c099', 'Yawhe Libanga', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 90, '/audio/extraits/yawhe-libanga.mp3', 'chants/yawhe-libanga.mp3', 'authorized', 1, 'USD'),
  ('a1069772-a833-57b0-9404-558e1cad7ba3', 'Yawhe oyebi misala na ngai', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 145, '/audio/extraits/yawhe-oyebi-misala-na-ngai.mp3', 'chants/yawhe-oyebi-misala-na-ngai.mp3', 'authorized', 1, 'USD'),
  ('616a450c-87e8-534d-909a-329d79142edd', 'Zalaka reconnaissant', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 255, '/audio/extraits/zalaka-reconnaissant.mp3', 'chants/zalaka-reconnaissant.mp3', 'authorized', 1, 'USD'),
  ('4802929a-ddf9-522d-8b01-56f027d22155', 'Zalaka connaissant', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 255, '/audio/extraits/zalaka-connaissant.mp3', 'chants/zalaka-connaissant.mp3', 'authorized', 1, 'USD'),
  ('a8299ae0-fb2c-503f-8f6d-8bcd11c908e6', 'Yave lusia ya ika', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 97, '/audio/extraits/yave-lusia-ya-ika.mp3', 'chants/yave-lusia-ya-ika.mp3', 'authorized', 1, 'USD'),
  ('b9fa9b83-525b-5b48-8919-56f3b1725f22', 'Motivation 3', 'JE SUIS KCCiste', 'fbaa3f59-80a4-5546-9d58-a1f3ec488338', null, 'Chants', 55, '/audio/extraits/motivation-3.mp3', 'chants/motivation-3.mp3', 'authorized', 1, 'USD')
on conflict (id) do update set
  audio_url = excluded.audio_url,
  sale_file_path = excluded.sale_file_path;
