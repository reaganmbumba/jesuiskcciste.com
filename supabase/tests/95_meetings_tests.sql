-- =====================================================================
-- Réunions en visioconférence : programme public, lien de la salle
-- réservé aux membres validés, gestion par la modération.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Administration centrale : une réunion pour les membres, une publique, une annulée.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  insert into public.meetings (id, title, starts_at, audience, is_cancelled) values
    ('88888888-0000-0000-0000-000000000001', 'Réunion des membres', now() + interval '1 day', 'members', false),
    ('88888888-0000-0000-0000-000000000002', 'Réunion publique', now() + interval '2 days', 'public', false),
    ('88888888-0000-0000-0000-000000000003', 'Réunion annulée', now() + interval '3 days', 'members', true);
  insert into public.meeting_rooms (meeting_id) values ('88888888-0000-0000-0000-000000000001'), ('88888888-0000-0000-0000-000000000003');
  insert into public.meeting_rooms (meeting_id, external_url) values ('88888888-0000-0000-0000-000000000002', 'https://zoom.us/j/123');
  assert (select jitsi_room from public.meeting_rooms where meeting_id = '88888888-0000-0000-0000-000000000001') like 'JeSuisKCCiste-%', 'nom de salle généré';
  begin insert into public.meeting_rooms (meeting_id, external_url) values ('88888888-0000-0000-0000-000000000003', 'javascript:alert(1)') on conflict (meeting_id) do update set external_url = excluded.external_url;
    raise exception 'lien non https accepté'; exception when check_violation then null; end;
end $$;
reset role;

-- Visiteur sans compte : voit le programme, seulement le lien de la réunion publique.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.meetings where id::text like '88888888%') = 3, 'un visiteur voit le programme';
  assert (select count(*) from public.meeting_rooms) = 1, 'un visiteur ne voit que la salle publique';
  begin insert into public.meetings (title, starts_at) values ('Intrus', now());
    raise exception 'un visiteur a programmé une réunion'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Membre validé : voit les salles des réunions non annulées, ne gère rien.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  assert (select count(*) from public.meeting_rooms) = 2, 'un membre voit les salles non annulées';
  assert not exists (select 1 from public.meeting_rooms where meeting_id = '88888888-0000-0000-0000-000000000003'), 'salle annulée cachée';
  begin insert into public.meetings (title, starts_at) values ('Intrus', now());
    raise exception 'un membre a programmé une réunion'; exception when insufficient_privilege then null; end;
  update public.meetings set title = 'Piraté' where id = '88888888-0000-0000-0000-000000000001';
  update public.meeting_rooms set external_url = 'https://pirate.example' where meeting_id = '88888888-0000-0000-0000-000000000001';
end $$;
reset role;
do $$ begin
  assert (select title from public.meetings where id = '88888888-0000-0000-0000-000000000001') = 'Réunion des membres', 'un membre ne modifie pas';
  assert (select external_url from public.meeting_rooms where meeting_id = '88888888-0000-0000-0000-000000000001') is null, 'un membre ne change pas la salle';
end $$;

-- Compte en attente de validation : pas de salle réservée aux membres.
update public.profiles set status = 'pending' where id = 'aaaaaaaa-0000-0000-0000-000000000005';
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
do $$ begin
  assert (select count(*) from public.meeting_rooms) = 1, 'un compte en attente ne voit que la salle publique';
end $$;
reset role;
update public.profiles set status = 'active' where id = 'aaaaaaaa-0000-0000-0000-000000000005';

-- La modération voit tout et supprime (la salle part avec la réunion).
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  assert (select count(*) from public.meeting_rooms) = 3, 'la modération voit toutes les salles';
  delete from public.meetings where id::text like '88888888%';
  assert (select count(*) from public.meeting_rooms) = 0, 'salles supprimées avec la réunion';
end $$;
reset role;
\echo 'Réunions en visioconférence : tous les tests passent.'
