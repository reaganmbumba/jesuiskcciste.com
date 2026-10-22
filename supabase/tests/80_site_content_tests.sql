-- =====================================================================
-- Contenu du site : lecture publique du contenu publié, gestion réservée
-- à l'administration centrale, dépôt de photos dans public-assets/contenu/.
-- (À exécuter après 10_rls_tests.sql et seed_site_content.sql.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

do $$ begin
  assert (select count(*) from public.site_content where collection = 'gallery') = 13, 'la galerie de base est copiée';
  assert (select count(*) from public.site_content where collection = 'contributions') = 113, 'les listes de contributions sont copiées';
  assert (select count(*) from public.announcements where id = md5('edito-ann-concert-glodie-massamba-matadi')::uuid) = 1, 'les actualités de base sont copiées';
end $$;
-- Le fichier peut être collé deux fois sans doublon.
\i supabase/seed_site_content.sql
do $$ begin
  assert (select count(*) from public.site_content where collection = 'gallery') = 13, 'pas de doublon dans la galerie';
end $$;
update public.site_content set published = false where collection = 'videos' and position = 10;

-- Visiteur sans compte : voit le contenu publié, ne modifie rien.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.site_content where collection = 'videos') = 6, 'un visiteur ne voit pas une vidéo masquée';
  begin insert into public.site_content (collection, data) values ('videos', '{}');
    raise exception 'un visiteur a ajouté du contenu'; exception when insufficient_privilege then null; end;
  begin insert into storage.objects (bucket_id, name) values ('public-assets', 'contenu/annonces/intrus.jpg');
    raise exception 'un visiteur a déposé une photo'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Membre simple : ne modifie pas le contenu.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  update public.site_content set data = '{}' where collection = 'donation_accounts';
  delete from public.site_content where collection = 'gallery';
  begin insert into storage.objects (bucket_id, name) values ('public-assets', 'contenu/annonces/intrus.jpg');
    raise exception 'un membre a déposé une photo'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  assert (select count(*) from public.site_content where collection = 'gallery') = 13, 'un membre ne supprime pas la galerie';
  assert not exists (select 1 from public.site_content where collection = 'donation_accounts' and data = '{}'), 'un membre ne modifie pas les numéros de don';
end $$;

-- Responsable de paroisse : dépose une photo pour une annonce, ne touche pas au contenu du site.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000002';
do $$ begin
  insert into storage.objects (bucket_id, name) values ('public-assets', 'contenu/announcements/photo.jpg');
  begin insert into storage.objects (bucket_id, name) values ('public-assets', 'logo.png');
    raise exception 'un responsable a déposé hors du dossier contenu'; exception when insufficient_privilege then null; end;
  delete from public.site_content where collection = 'videos';
end $$;
reset role;
do $$ begin
  assert (select count(*) from public.site_content where collection = 'videos') = 7, 'un responsable ne supprime pas les vidéos';
end $$;

-- Administration centrale : voit tout, ajoute, modifie, masque et supprime.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  assert (select count(*) from public.site_content where collection = 'videos') = 7, 'l’administrateur voit les vidéos masquées';
  insert into public.site_content (collection, position, data) values ('videos', 80, '{"youtube":"abcdefghijk","title":{"fr":"Nouvelle vidéo"}}');
  update public.site_content set data = jsonb_set(data, '{holder}', '"Nouveau titulaire"') where collection = 'donation_accounts';
  delete from public.site_content where collection = 'gallery' and position = 10;
  insert into storage.objects (bucket_id, name) values ('public-assets', 'contenu/gallery/photo.jpg');
end $$;
reset role;
do $$ begin
  assert (select count(*) from public.site_content where collection = 'videos') = 8, 'l’administrateur ajoute une vidéo';
  assert (select count(*) from public.site_content where collection = 'gallery') = 12, 'l’administrateur supprime une photo';
  assert not exists (select 1 from public.site_content where collection = 'donation_accounts' and data->>'holder' <> 'Nouveau titulaire'), 'l’administrateur modifie les numéros';
end $$;

-- Une collection inconnue est refusée.
do $$ begin
  begin insert into public.site_content (collection, data) values ('inconnue', '{}');
    raise exception 'collection inconnue acceptée'; exception when check_violation then null; end;
end $$;
\echo 'Contenu du site : tous les tests passent.'
