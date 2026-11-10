-- =====================================================================
-- Cotisations mensuelles : seule la gestion écrit, chaque membre voit les siennes.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- L'administration centrale enregistre deux mois pour Membre Un, un pour Membre Deux.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  insert into public.member_cotisations (user_id, month, amount, currency, method) values
    ('aaaaaaaa-0000-0000-0000-000000000003', '2026-11-01', 5, 'USD', 'orange_money'),
    ('aaaaaaaa-0000-0000-0000-000000000003', '2026-12-01', 5, 'USD', 'mpesa'),
    ('aaaaaaaa-0000-0000-0000-000000000004', '2026-11-01', 14000, 'CDF', 'especes');
  assert (select count(*) from public.member_cotisations) = 3, 'l''admin voit tout';
  assert (select recorded_by from public.member_cotisations limit 1) = 'aaaaaaaa-0000-0000-0000-000000000001', 'auteur noté';
  begin insert into public.member_cotisations (user_id, month, amount, currency) values ('aaaaaaaa-0000-0000-0000-000000000003', '2026-11-01', 5, 'USD');
    raise exception 'mois payé deux fois'; exception when unique_violation then null; end;
  begin insert into public.member_cotisations (user_id, month, amount, currency) values ('aaaaaaaa-0000-0000-0000-000000000003', '2026-10-15', 5, 'USD');
    raise exception 'mois mal formé accepté'; exception when check_violation then null; end;
  update public.cotisation_settings set monthly_amount = 10, currency = 'USD', start_month = '2026-11-01';
  assert (select monthly_amount from public.cotisation_settings) = 10, 'réglages modifiés';
end $$;
reset role;

-- Membre Un : ne voit que ses deux mois, ne peut rien écrire.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ declare n int; begin
  assert (select count(*) from public.member_cotisations) = 2, 'le membre ne voit que ses cotisations';
  assert (select monthly_amount from public.cotisation_settings) = 10, 'le membre lit les réglages';
  begin insert into public.member_cotisations (user_id, month, amount, currency) values ('aaaaaaaa-0000-0000-0000-000000000003', '2027-01-01', 5, 'USD');
    raise exception 'un membre s''ajoute un paiement'; exception when insufficient_privilege then null; end;
  update public.cotisation_settings set monthly_amount = 0;
  get diagnostics n = row_count;
  assert n = 0, 'un membre change le montant';
  delete from public.member_cotisations;
  get diagnostics n = row_count;
  assert n = 0, 'un membre efface ses cotisations';
end $$;
reset role;

-- Visiteur : rien.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  begin perform 1 from public.member_cotisations; raise exception 'un visiteur lit les cotisations'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Responsable de paroisse (sans droit solidarité) : ne voit que les siennes (aucune).
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000002';
do $$ begin
  assert (select count(*) from public.member_cotisations) = 0, 'responsable sans droit : rien';
end $$;
reset role;

select 'cotisations : OK' as resultat;
