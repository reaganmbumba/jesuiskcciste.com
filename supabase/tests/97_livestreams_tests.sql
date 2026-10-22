-- =====================================================================
-- Directs des cultes : programme public, gestion par l'administration centrale.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Administration centrale : programme deux directs.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  insert into public.livestreams (id, title, starts_at, youtube_id) values
    ('99999999-0000-0000-0000-000000000001', 'Culte du Sabbat', now() + interval '1 day', 'dQw4w9WgXcQ'),
    ('99999999-0000-0000-0000-000000000002', 'Fête du 12 octobre', now() + interval '10 days', null);
  begin insert into public.livestreams (title, starts_at, youtube_id) values ('Mauvais lien', now(), 'javascript:alert(1)');
    raise exception 'identifiant YouTube invalide accepté'; exception when check_violation then null; end;
  begin insert into public.livestreams (title, starts_at) values ('ab', now());
    raise exception 'titre trop court accepté'; exception when check_violation then null; end;
end $$;
reset role;

-- Visiteur sans compte : voit le programme, ne programme rien.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.livestreams where id::text like '99999999%') = 2, 'un visiteur voit le programme';
  begin insert into public.livestreams (title, starts_at) values ('Intrus', now());
    raise exception 'un visiteur a programmé un direct'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Membre validé : voit le programme, ne modifie rien.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  assert (select count(*) from public.livestreams where id::text like '99999999%') = 2, 'un membre voit le programme';
  begin insert into public.livestreams (title, starts_at) values ('Intrus', now());
    raise exception 'un membre a programmé un direct'; exception when insufficient_privilege then null; end;
  update public.livestreams set title = 'Piraté' where id = '99999999-0000-0000-0000-000000000001';
  delete from public.livestreams where id = '99999999-0000-0000-0000-000000000002';
end $$;
reset role;
do $$ begin
  assert (select title from public.livestreams where id = '99999999-0000-0000-0000-000000000001') = 'Culte du Sabbat', 'un membre ne modifie pas';
  assert (select count(*) from public.livestreams where id::text like '99999999%') = 2, 'un membre ne supprime pas';
end $$;

-- L'administration modifie et supprime.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  update public.livestreams set is_cancelled = true where id = '99999999-0000-0000-0000-000000000002';
  assert (select is_cancelled from public.livestreams where id = '99999999-0000-0000-0000-000000000002'), 'annulation enregistrée';
  delete from public.livestreams where id::text like '99999999%';
  assert (select count(*) from public.livestreams) = 0, 'directs supprimés';
end $$;
reset role;
\echo 'Directs des cultes : tous les tests passent.'
