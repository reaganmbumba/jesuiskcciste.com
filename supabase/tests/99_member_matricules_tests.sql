-- =====================================================================
-- Matricules et lecture des articles : un seul appareil par compte.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

do $$ begin
  assert (select count(*) from public.member_matricules m join public.profiles p on p.id = m.user_id where p.status in ('active', 'pending'))
       = (select count(*) from public.profiles where status in ('active', 'pending')), 'chaque compte a un matricule';
end $$;

-- Visiteur : aucun matricule visible, statut « visiteur ».
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  begin perform 1 from public.member_matricules; raise exception 'un visiteur lit les matricules'; exception when insufficient_privilege then null; end;
  assert public.reader_device_status('appareil-telephone-1') = 'visiteur', 'visiteur';
end $$;
reset role;

-- Membre Un : voit son matricule seulement, l'active sur son téléphone.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ declare v text; begin
  assert (select count(*) from public.member_matricules) = 1, 'le membre ne voit que son matricule';
  select matricule into v from public.member_matricules;
  assert public.reader_device_status('appareil-telephone-1') = 'matricule_requis', 'matricule requis';
  begin perform public.claim_reader_device('KCC-99999', 'appareil-telephone-1'); raise exception 'mauvais matricule accepté'; exception when invalid_parameter_value then null; end;
  assert public.claim_reader_device(lower(v), 'appareil-telephone-1', 'Téléphone') = 'ok', 'matricule accepté (casse ignorée)';
  assert public.reader_device_status('appareil-telephone-1') = 'ok', 'téléphone autorisé';
  assert public.reader_device_status('appareil-ordinateur-2') = 'autre_appareil', 'second appareil refusé';
  -- Le second appareil prend la place : le premier est bloqué.
  perform public.claim_reader_device(v, 'appareil-ordinateur-2');
  assert public.reader_device_status('appareil-telephone-1') = 'autre_appareil', 'ancien appareil bloqué';
  begin insert into public.reader_devices (user_id, device_id) values ('aaaaaaaa-0000-0000-0000-000000000003', 'appareil-pirate-99');
    raise exception 'écriture directe acceptée'; exception when insufficient_privilege then null; end;
  begin perform public.admin_set_matricule('aaaaaaaa-0000-0000-0000-000000000003', 'KCC-1'); raise exception 'un membre change son matricule'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Un autre membre ne peut pas utiliser le matricule du premier.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
do $$ begin
  begin perform public.claim_reader_device((select matricule from public.member_matricules where user_id = 'aaaaaaaa-0000-0000-0000-000000000003'), 'appareil-telephone-5');
    raise exception 'matricule d''autrui'; exception when invalid_parameter_value then null; end;
  begin perform public.claim_reader_device('KCC-00001', 'appareil-telephone-5'); raise exception 'matricule d''autrui (direct)';
    exception when invalid_parameter_value then null; end;
end $$;
reset role;

-- Responsable de la paroisse A : voit le matricule de ses membres, libère le téléphone ; pas ceux de B.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000002';
do $$ begin
  assert exists (select 1 from public.member_matricules where user_id = 'aaaaaaaa-0000-0000-0000-000000000003'), 'responsable voit son membre';
  assert not exists (select 1 from public.member_matricules where user_id = 'aaaaaaaa-0000-0000-0000-000000000005'), 'pas hors périmètre';
  perform public.admin_reader_action('aaaaaaaa-0000-0000-0000-000000000003', 'liberer');
  begin perform public.admin_reader_action('aaaaaaaa-0000-0000-0000-000000000005', 'liberer'); raise exception 'hors périmètre'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin assert not exists (select 1 from public.reader_devices where user_id = 'aaaaaaaa-0000-0000-0000-000000000003'), 'téléphone libéré'; end $$;

-- Administration centrale : lit sans matricule, corrige un matricule.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  assert public.reader_device_status('nimporte-quel-appareil') = 'ok', 'l''administration lit tout';
  assert public.admin_set_matricule('aaaaaaaa-0000-0000-0000-000000000003', 'kcc 2017 001') = 'KCC2017001', 'matricule corrigé';
end $$;
reset role;

-- Nouveau compte (en attente) : matricule attribué tout de suite, lecture possible ; compte suspendu : refusé.
do $$ begin
  insert into auth.users (id, email, raw_user_meta_data) values ('aaaaaaaa-0000-0000-0000-000000000077', 'nouveau@test.invalid', '{"first_name":"Nouveau","last_name":"Membre"}');
  assert (select status from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000077') = 'pending', 'compte en attente';
  assert exists (select 1 from public.member_matricules where user_id = 'aaaaaaaa-0000-0000-0000-000000000077' and matricule like 'KCC-%'), 'matricule dès l''inscription';
  update public.profiles set status = 'suspended' where id = 'aaaaaaaa-0000-0000-0000-000000000005';
end $$;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000077';
do $$ begin
  assert public.claim_reader_device((select matricule from public.member_matricules), 'appareil-nouveau-77') = 'ok', 'nouveau compte lit avec son matricule';
end $$;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
do $$ begin assert public.reader_device_status('appareil-telephone-5') = 'non_valide', 'compte suspendu bloqué'; end $$;
reset role;

\echo 'Matricules et lecture des articles : tous les tests passent.'
