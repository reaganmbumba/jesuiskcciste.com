-- =====================================================================
-- Révérends Apôtres : liste publique, propositions de photos par tous,
-- traitement réservé à l'administration centrale.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

insert into public.apostles (id, full_name, status) values
  ('77777777-0000-0000-0000-000000000001', 'Apôtre Test Un', 'living'),
  ('77777777-0000-0000-0000-000000000002', 'Apôtre Test Deux', 'deceased');

-- Visiteur sans compte : lit la liste et propose une photo, sans rien voir des propositions.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.apostles) = 2, 'un visiteur voit la liste';
  insert into public.apostle_photo_submissions (apostle_id, photo_path, submitter_name)
    values ('77777777-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000001/abc123.jpg', 'Visiteur');
  insert into storage.objects (bucket_id, name) values ('apostle-submissions', '77777777-0000-0000-0000-000000000001/abc123.jpg');
  assert (select count(*) from public.apostle_photo_submissions) = 0, 'un visiteur ne lit pas les propositions';
  assert (select count(*) from storage.objects where bucket_id = 'apostle-submissions') = 0, 'un visiteur ne lit pas les photos proposées';
  begin insert into public.apostle_photo_submissions (apostle_id, photo_path, submitter_name, status)
      values ('77777777-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000001/abc124.jpg', 'Visiteur', 'approved');
    raise exception 'proposition auto-approuvée acceptée'; exception when insufficient_privilege then null; end;
  begin insert into storage.objects (bucket_id, name) values ('apostle-submissions', '00000000-0000-0000-0000-000000000000/x.jpg');
    raise exception 'dépôt pour un apôtre inexistant accepté'; exception when insufficient_privilege then null; end;
  -- Proposition d'informations sans photo ; une proposition vide est refusée.
  insert into public.apostle_photo_submissions (apostle_id, submitter_name, proposed_place, proposed_consecration)
    values ('77777777-0000-0000-0000-000000000002', 'Visiteur', 'Paroisse de Matadi', '1984');
  begin insert into public.apostle_photo_submissions (apostle_id, submitter_name) values ('77777777-0000-0000-0000-000000000002', 'Visiteur');
    raise exception 'proposition vide acceptée'; exception when check_violation then null; end;
  begin update public.apostles set photo_url = 'https://exemple.invalid/x.jpg';
    exception when insufficient_privilege then null; end;
  begin insert into public.apostles (full_name) values ('Intrus');
    raise exception 'un visiteur a ajouté un apôtre'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin assert (select count(*) from public.apostles where photo_url is not null) = 0, 'un visiteur ne change pas la photo'; end $$;

-- Membre simple : mêmes droits qu'un visiteur.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  assert (select count(*) from public.apostle_photo_submissions) = 0, 'un membre ne lit pas les propositions';
  update public.apostles set full_name = 'Modifié';
end $$;
reset role;
do $$ begin assert not exists (select 1 from public.apostles where full_name = 'Modifié'), 'un membre ne modifie pas la liste'; end $$;

-- Administration centrale : lit, approuve et met la photo.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  assert (select count(*) from public.apostle_photo_submissions where status = 'pending') = 2, 'l’administrateur voit les propositions';
  update public.apostles set place = 'Paroisse de Matadi', consecration_date = '1984', status = 'unknown' where id = '77777777-0000-0000-0000-000000000002';
  assert (select count(*) from storage.objects where bucket_id = 'apostle-submissions') = 1, 'l’administrateur voit la photo proposée';
  update public.apostle_photo_submissions set status = 'approved', reviewed_at = now();
  update public.apostles set photo_url = 'https://exemple.invalid/apotres/1.jpg' where id = '77777777-0000-0000-0000-000000000001';
  delete from storage.objects where bucket_id = 'apostle-submissions';
end $$;
reset role;
do $$ begin
  assert (select photo_url from public.apostles where id = '77777777-0000-0000-0000-000000000001') is not null, 'photo enregistrée';
  assert (select count(*) from storage.objects where bucket_id = 'apostle-submissions') = 0, 'fichier proposé supprimé';
end $$;

-- La liste officielle se charge sans erreur et sans doublon, même relancée.
\i supabase/seed_apostles.sql
\i supabase/seed_apostles.sql
do $$ begin
  assert (select count(*) from public.apostles where title like '%Apôtre%' and id::text not like '77777777%') = 132, 'liste officielle chargée une seule fois';
  assert (select status from public.apostles where full_name = 'LUSILAWO MFUMUANGANI Jean') = 'deceased', '(+) = décédé';
  assert (select death_year from public.apostles where full_name = 'FERREIRA Paulo') = 2011, 'année du décès tirée de la date';
end $$;

select 'TESTS APÔTRES PASSÉS' as resultat;
