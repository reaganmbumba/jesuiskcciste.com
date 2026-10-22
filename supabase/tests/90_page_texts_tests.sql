-- =====================================================================
-- Textes des pages : lecture publique, modification réservée à
-- l'administration centrale. (Après 10_rls_tests.sql.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;
delete from public.page_texts;
insert into public.page_texts (key, value) values ('doctrine.fr', '{"doctrineSource":"Source modifiée"}');

set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select value->>'doctrineSource' from public.page_texts where key = 'doctrine.fr') = 'Source modifiée', 'un visiteur lit les textes modifiés';
  begin insert into public.page_texts (key, value) values ('cantiques', '{}');
    raise exception 'un visiteur a modifié un texte'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000002';
do $$ begin
  update public.page_texts set value = '{}';
  begin insert into public.page_texts (key, value) values ('cantiques', '{}');
    raise exception 'un responsable a modifié un texte'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin assert (select value from public.page_texts where key = 'doctrine.fr') <> '{}', 'un responsable ne modifie pas les textes'; end $$;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  insert into public.page_texts (key, value) values ('cantiques', '{"hymns":[]}');
  update public.page_texts set value = '{"doctrineSource":"Nouvelle source"}' where key = 'doctrine.fr';
  delete from public.page_texts where key = 'cantiques';
end $$;
reset role;
do $$ begin
  assert (select value->>'doctrineSource' from public.page_texts where key = 'doctrine.fr') = 'Nouvelle source', 'l’administrateur modifie un texte';
  assert not exists (select 1 from public.page_texts where key = 'cantiques'), 'l’administrateur rétablit un texte';
  begin insert into public.page_texts (key, value) values ('Doctrine; drop', '{}');
    raise exception 'clé invalide acceptée'; exception when check_violation then null; end;
end $$;
\echo 'Textes des pages : tous les tests passent.'
