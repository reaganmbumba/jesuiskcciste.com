-- =====================================================================
-- Opportunités et emplois : offres publiées lisibles par tous,
-- gestion par l'administration centrale seulement.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  insert into public.job_offers (id, title, organization, apply_to, source, published) values
    ('99999999-0000-0000-0000-0000000000a1', 'Comptable', 'Entreprise A', 'rh@exemple.cd', 'Affiche de l''entreprise', true),
    ('99999999-0000-0000-0000-0000000000a2', 'Brouillon', 'Entreprise B', 'rh@exemple.cd', 'Site officiel', false);
  begin insert into public.job_offers (title, organization, apply_to, source) values ('Sans source', 'X', 'rh@exemple.cd', '');
    raise exception 'offre sans source acceptée'; exception when check_violation then null; end;
  begin insert into public.job_offers (title, organization, apply_to, source, contract_type) values ('Type', 'X', 'rh@exemple.cd', 'Site', 'arnaque');
    raise exception 'type inconnu accepté'; exception when check_violation then null; end;
  assert (select count(*) from public.job_offers where id::text like '99999999%') = 2, 'l''admin voit aussi les brouillons';
end $$;
reset role;

set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.job_offers where id::text like '99999999%') = 1, 'un visiteur ne voit que les offres publiées';
  begin insert into public.job_offers (title, organization, apply_to, source) values ('Intrus', 'X', 'x@x.cd', 'Moi');
    raise exception 'un visiteur a publié une offre'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  assert (select count(*) from public.job_offers where id::text like '99999999%') = 1, 'un membre ne voit que les offres publiées';
  begin insert into public.job_offers (title, organization, apply_to, source) values ('Intrus', 'X', 'x@x.cd', 'Moi');
    raise exception 'un membre a publié une offre'; exception when insufficient_privilege then null; end;
  update public.job_offers set title = 'Piraté' where id = '99999999-0000-0000-0000-0000000000a1';
end $$;
reset role;

do $$ begin
  assert (select title from public.job_offers where id = '99999999-0000-0000-0000-0000000000a1') = 'Comptable', 'un membre n''a rien modifié';
end $$;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  delete from public.job_offers where id::text like '99999999%';
  assert (select count(*) from public.job_offers) = 0, 'offres supprimées';
end $$;
reset role;
\echo 'Opportunités et emplois : tous les tests passent.'
