-- =====================================================================
-- Compteur de lectures : tout le monde lit et ajoute une lecture,
-- personne ne modifie les totaux directement.
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert public.record_page_view('/actualites/test-compteur') = 1, 'première lecture';
  assert public.record_page_view('/actualites/test-compteur') = 2, 'deuxième lecture';
  assert public.record_page_view('pas-une-adresse') is null, 'adresse invalide refusée';
  assert public.record_page_view('/<script>') is null, 'caractères interdits refusés';
  assert (select views from public.page_views where path = '/actualites/test-compteur') = 2, 'total lisible par un visiteur';
  begin insert into public.page_views (path, views) values ('/faux', 1000);
    raise exception 'un visiteur a écrit un total'; exception when insufficient_privilege then null; end;
  begin update public.page_views set views = 99999 where path = '/actualites/test-compteur';
    raise exception 'un visiteur a modifié un total'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  assert public.record_page_view('/actualites/test-compteur') = 3, 'un membre ajoute aussi une lecture';
  begin delete from public.page_views;
    raise exception 'un compte a effacé les totaux'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'Compteur de lectures : tous les tests passent.';
