-- =====================================================================
-- Recensement : dépôt sans compte, doublons repérés, lecture réservée à
-- l'administration, totaux publics sans données personnelles.
-- (Après 10_rls_tests.sql.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;
delete from public.census_households;

set role anon;
set request.jwt.claim.sub = '';
do $$
declare r jsonb; t uuid;
begin
  r := public.submit_census('{"country":"RD Congo","city":"Kinshasa","parish":"Paroisse de Matete (Kinshasa)","contact_name":"Mbumba Reagan","phone":"+243 81 234 5678","people":[{"name":"Reagan","sex":"M","age":"26-35","status":"membre","extra":"x"},{"sex":"F","age":"0-5"}]}');
  assert r->>'status' = 'created', 'un visiteur recense son foyer';
  t := (r->>'token')::uuid;
  -- Même numéro écrit autrement : doublon.
  r := public.submit_census('{"country":"RD Congo","city":"Kinshasa","parish":"Autre","phone":"0812345678","people":[{"sex":"M","age":"18-25"}]}');
  assert r->>'status' = 'duplicate_phone', 'même téléphone = doublon';
  -- Même nom + paroisse + âge + sexe, sans téléphone : doublon.
  r := public.submit_census('{"country":"RD Congo","city":"Kinshasa","parish":"paroisse de  matete (kinshasa)","contact_name":"MBUMBA reagan","people":[{"sex":"M","age":"26-35"}]}');
  assert r->>'status' = 'duplicate', 'même nom et même paroisse = doublon';
  -- Correction avec le jeton du téléphone.
  r := public.submit_census('{"country":"RD Congo","city":"Kinshasa","parish":"Paroisse de Matete (Kinshasa)","contact_name":"Mbumba Reagan","people":[{"sex":"M","age":"26-35"},{"sex":"F","age":"0-5"},{"sex":"F","age":"36-50"}]}', t);
  assert r->>'status' = 'updated', 'correction avec le jeton';
  assert jsonb_array_length(public.get_census_entry(t)->'people') = 3, 'la fiche corrigée se relit avec le jeton';
  assert public.get_census_entry(t)->'people'->0->>'extra' is null, 'les champs inconnus sont retirés';
  -- Famille sans téléphone recensée par un responsable.
  r := public.submit_census('{"country":"Angola","city":"Luanda","parish":"Paroisse de Luanda (Angola)","recorded_by":"Diacre X","people":[{"sex":"F","age":"66+"}]}');
  assert r->>'status' = 'created', 'famille sans téléphone';
  assert (public.census_public_stats()->>'people')::int = 4, 'total public des personnes';
  assert (public.census_public_stats()->>'parishes')::int = 2, 'total public des paroisses';
  begin perform public.submit_census('{"country":"RD Congo","city":"Kinshasa","parish":"P","people":[{"sex":"X","age":"26-35"}]}');
    raise exception 'sexe invalide accepté'; exception when raise_exception then if sqlerrm = 'sexe invalide accepté' then raise; end if; end;
  begin perform 1 from public.census_households;
    raise exception 'un visiteur lit le recensement'; exception when insufficient_privilege then null; end;
  begin insert into public.census_households (country, city, parish, people) values ('X', 'Y', 'Z', '[{"sex":"M","age":"0-5"}]');
    raise exception 'un visiteur écrit directement'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Un simple membre ne voit rien.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin assert (select count(*) from public.census_households) = 0, 'un membre ne lit pas le recensement'; end $$;
reset role;

-- L'administration centrale voit tout et peut supprimer.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  assert (select count(*) from public.census_households) = 2, 'l''administration lit les fiches';
  assert (select phone_hash from public.census_households where country = 'RD Congo') is not null, 'empreinte du téléphone gardée';
  assert not exists (select 1 from public.census_households where people::text like '%8123%' or coalesce(phone_hash, '') like '%8123%'), 'le numéro n''est pas gardé en clair';
  delete from public.census_households where country = 'Angola';
  assert (select count(*) from public.census_households) = 1, 'l''administration supprime une fiche';
end $$;
reset role;
