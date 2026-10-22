-- =====================================================================
-- Solidarité — Dons en ligne : seuls les gestionnaires lisent les dons
-- (numéros des donateurs), personne n'écrit hors de l'Edge Function.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Ce que fait l'Edge Function (service_role).
insert into public.online_donations (operation, donor_name, amount, currency, provider, phone, status) values
  ('ngidinga', 'Donateur test', 20, 'USD', 'mpesa', '243861271633', 'paid'),
  ('general', 'Anonyme', 10000, 'CDF', 'orange_money', '243842345678', 'pending');

do $$ begin
  begin insert into public.online_donations (operation, amount, currency, provider, phone) values ('ngidinga', 1, 'USD', 'cash', '243812345678');
    raise exception 'espèces acceptées'; exception when check_violation then null; end;
  begin insert into public.online_donations (operation, amount, currency, provider, phone) values ('ngidinga', 1, 'EUR', 'mpesa', '243812345678');
    raise exception 'devise EUR acceptée'; exception when check_violation then null; end;
  begin insert into public.online_donations (operation, amount, currency, provider, phone) values ('ngidinga', 1, 'USD', 'mpesa', '0812345678');
    raise exception 'numéro mal formé accepté'; exception when check_violation then null; end;
end $$;

-- Un membre ordinaire ne voit aucun don et ne peut rien écrire.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  assert (select count(*) from public.online_donations) = 0, 'un membre voit les dons';
  begin
    insert into public.online_donations (operation, amount, currency, provider, phone, status) values ('ngidinga', 1, 'USD', 'mpesa', '243812345678', 'paid');
    raise exception 'un membre a créé un don payé';
  exception when insufficient_privilege then null;
  end;
end $$;
do $$ begin update public.online_donations set status = 'paid'; exception when insufficient_privilege then null; end $$;
reset role;
do $$ begin assert (select count(*) from public.online_donations where status = 'paid') = 1, 'un membre ne peut pas marquer un don payé'; end $$;

-- L'administrateur central (contributions.read) voit tout.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin assert (select count(*) from public.online_donations) = 2, 'l’administrateur voit les dons'; end $$;
reset role;
-- Un visiteur ne voit rien.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin assert (select count(*) from public.online_donations) = 0, 'un visiteur voit les dons'; end $$;
reset role;

select 'TESTS DONS EN LIGNE PASSÉS' as resultat;
