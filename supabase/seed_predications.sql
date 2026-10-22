-- Prédications audio déjà fournies par l'administration (fichiers dans public/predications/).
-- Ré-exécutable : une prédication déjà présente n'est pas dupliquée.
insert into public.audio_sermons (id, title, preacher_name, preacher_title, parish, preacher_photo_url, audio_url, duration_seconds, bible_text, published, created_at) values
  ('a0d10000-0000-4000-8000-000000000001', 'Prédication sur Genèse 3 : 1-5', 'KAPAPA MUANDA Bossin', 'Disciple', 'Paroisse d’Aéroport',
   '/predications/bossin-kapapa.jpg', '/predications/bossin-kapapa-genese-3.mp3', 1141, 'Genèse 3 : 1-5', true, '2026-10-22T10:55:00Z')
on conflict (id) do nothing;
