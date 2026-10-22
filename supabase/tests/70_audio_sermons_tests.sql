-- =====================================================================
-- Prédications audio : lecture publique des prédications publiées,
-- gestion et dépôt des fichiers réservés à l'administration centrale.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

delete from public.audio_sermons;
insert into public.audio_sermons (id, title, preacher_name, published) values
  ('88888888-0000-0000-0000-000000000001', 'Prédication publiée', 'Prédicateur Un', true),
  ('88888888-0000-0000-0000-000000000002', 'Brouillon', 'Prédicateur Deux', false);
insert into storage.objects (bucket_id, name) values ('predications', 'audio/test.mp3');

-- Visiteur sans compte : écoute les prédications publiées, ne modifie rien.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.audio_sermons) = 1, 'un visiteur ne voit que les prédications publiées';
  assert (select count(*) from storage.objects where bucket_id = 'predications') = 1, 'un visiteur lit les fichiers audio';
  begin insert into public.audio_sermons (title, preacher_name) values ('Intrus', 'Intrus');
    raise exception 'un visiteur a ajouté une prédication'; exception when insufficient_privilege then null; end;
  begin insert into storage.objects (bucket_id, name) values ('predications', 'audio/intrus.mp3');
    raise exception 'un visiteur a déposé un fichier'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Membre simple : mêmes droits qu'un visiteur.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  assert (select count(*) from public.audio_sermons) = 1, 'un membre ne voit pas les brouillons';
  update public.audio_sermons set title = 'Modifié';
  delete from storage.objects where bucket_id = 'predications';
end $$;
reset role;
do $$ begin
  assert not exists (select 1 from public.audio_sermons where title = 'Modifié'), 'un membre ne modifie pas les prédications';
  assert (select count(*) from storage.objects where bucket_id = 'predications') = 1, 'un membre ne supprime pas les fichiers';
end $$;

-- Administration centrale : voit tout, ajoute, modifie, dépose et supprime.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  assert (select count(*) from public.audio_sermons) = 2, 'l’administrateur voit les brouillons';
  insert into public.audio_sermons (title, preacher_name, preacher_title, parish, audio_url, audio_path)
    values ('La notion d’Alliance', 'NOM Prénom', 'Révérend Apôtre', 'Paroisse de Muanda', 'https://exemple.invalid/a.mp3', 'audio/a.mp3');
  update public.audio_sermons set published = true where id = '88888888-0000-0000-0000-000000000002';
  insert into storage.objects (bucket_id, name) values ('predications', 'audio/a.mp3');
  delete from storage.objects where bucket_id = 'predications' and name = 'audio/test.mp3';
  delete from public.audio_sermons where id = '88888888-0000-0000-0000-000000000001';
end $$;
reset role;
do $$ begin
  assert (select count(*) from public.audio_sermons where published) = 2, 'l’administrateur publie et supprime';
  assert (select count(*) from storage.objects where bucket_id = 'predications') = 1, 'l’administrateur gère les fichiers';
end $$;

-- Un titre vide est refusé.
do $$ begin
  begin insert into public.audio_sermons (title, preacher_name) values (' ', 'X Y');
    raise exception 'titre vide accepté'; exception when check_violation then null; end;
end $$;

delete from public.audio_sermons;
delete from storage.objects where bucket_id = 'predications';
\echo 'Prédications audio : tous les tests passent.'
