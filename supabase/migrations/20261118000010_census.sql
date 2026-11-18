-- =====================================================================
-- Recensement des fidèles : combien de membres par paroisse, par pays et
-- par âge.
--
-- census_households : une fiche par foyer (une personne peut recenser toute
--   sa famille, ou un responsable peut recenser une famille sans téléphone).
--   « people » contient une ligne par personne : sexe, tranche d'âge, statut,
--   et un prénom facultatif. Aucune date de naissance, aucune adresse.
--   Le numéro de téléphone n'est jamais gardé en clair : seule une empreinte
--   sert à repérer un foyer déjà recensé.
--
-- Écriture : uniquement par la fonction submit_census (même sans compte).
-- Lecture : seulement l'administration (permission members.read_private).
-- Le public ne voit que les totaux (census_public_stats).
-- =====================================================================

create table if not exists public.census_households (
  id uuid primary key default gen_random_uuid(),
  country text not null check (char_length(trim(country)) between 2 and 80),
  province text check (province is null or char_length(province) <= 120),
  city text not null check (char_length(trim(city)) between 2 and 120),
  parish text not null check (char_length(trim(parish)) between 2 and 160),
  section text check (section is null or char_length(section) <= 160),
  contact_name text check (contact_name is null or char_length(contact_name) <= 160),
  matricule text check (matricule is null or char_length(matricule) <= 40),
  -- Personne qui a rempli la fiche pour une autre famille (recenseur), sinon vide.
  recorded_by text check (recorded_by is null or char_length(recorded_by) <= 160),
  people jsonb not null check (jsonb_typeof(people) = 'array' and jsonb_array_length(people) between 1 and 30),
  person_count int generated always as (jsonb_array_length(people)) stored,
  phone_hash text,
  fingerprint text,
  -- Permet de corriger la fiche depuis le même téléphone, sans compte.
  edit_token uuid not null default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists census_households_parish_idx on public.census_households(country, parish);
create index if not exists census_households_created_idx on public.census_households(created_at desc);
create unique index if not exists census_households_token_idx on public.census_households(edit_token);
create index if not exists census_households_phone_idx on public.census_households(phone_hash) where phone_hash is not null;
create index if not exists census_households_fp_idx on public.census_households(fingerprint) where fingerprint is not null;

alter table public.census_households enable row level security;
alter table public.census_households force row level security;

drop policy if exists "lecture administration" on public.census_households;
create policy "lecture administration" on public.census_households for select using (public.has_permission('members.read_private'));
drop policy if exists "correction administration" on public.census_households;
create policy "correction administration" on public.census_households for update using (public.has_permission('members.read_private')) with check (public.has_permission('members.read_private'));
drop policy if exists "suppression administration" on public.census_households;
create policy "suppression administration" on public.census_households for delete using (public.has_permission('members.read_private'));
revoke all on public.census_households from anon;
grant select, update, delete on public.census_households to authenticated;

drop trigger if exists census_households_updated on public.census_households;
create trigger census_households_updated before update on public.census_households for each row execute function public.set_updated_at();

-- Texte « normalisé » pour comparer deux saisies (minuscules, espaces réduits).
create or replace function public.census_norm(t text) returns text language sql immutable as $$
  select nullif(lower(regexp_replace(trim(coalesce(t, '')), '\s+', ' ', 'g')), '')
$$;

-- Dépôt ou correction d'une fiche.
-- Renvoie {"status": "created" | "updated" | "duplicate_phone" | "duplicate_matricule" | "duplicate", "token": …}
create or replace function public.submit_census(p jsonb, p_token uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_people jsonb := '[]'::jsonb;
  v_person jsonb;
  v_sex text; v_age text; v_status text; v_name text;
  v_phone text := regexp_replace(coalesce(p->>'phone', ''), '\D', '', 'g');
  v_phone_hash text;
  v_matricule text := nullif(upper(trim(coalesce(p->>'matricule', ''))), '');
  v_contact text := nullif(trim(coalesce(p->>'contact_name', '')), '');
  v_parish text := trim(coalesce(p->>'parish', ''));
  v_fp text;
  v_row public.census_households;
begin
  if p is null or jsonb_typeof(p->'people') <> 'array' then raise exception 'Fiche incomplète.'; end if;
  if jsonb_array_length(p->'people') < 1 or jsonb_array_length(p->'people') > 30 then raise exception 'Indiquez de 1 à 30 personnes.'; end if;

  -- On ne garde que les champs prévus, avec des valeurs connues.
  for v_person in select * from jsonb_array_elements(p->'people') loop
    v_sex := v_person->>'sex';
    v_age := v_person->>'age';
    v_status := nullif(v_person->>'status', '');
    v_name := nullif(left(trim(coalesce(v_person->>'name', '')), 80), '');
    if v_sex is null or v_sex not in ('M', 'F') then raise exception 'Sexe manquant pour une personne.'; end if;
    if v_age is null or v_age not in ('0-5', '6-12', '13-17', '18-25', '26-35', '36-50', '51-65', '66+') then raise exception 'Tranche d''âge manquante pour une personne.'; end if;
    if v_status is not null and v_status not in ('membre', 'neophyte', 'sympathisant') then v_status := null; end if;
    v_people := v_people || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object('name', v_name, 'sex', v_sex, 'age', v_age, 'status', v_status)));
  end loop;

  if char_length(v_phone) >= 8 then
    -- Les 9 derniers chiffres : « 0812… » et « +243812… » donnent la même empreinte.
    v_phone_hash := md5('kcc-recensement:' || right(v_phone, 9));
  end if;
  if v_contact is not null then
    v_fp := md5(concat_ws('|', public.census_norm(v_parish), public.census_norm(v_contact), v_people->0->>'sex', v_people->0->>'age'));
  end if;

  -- Correction d'une fiche envoyée depuis ce téléphone.
  if p_token is not null then
    update public.census_households set
      country = trim(p->>'country'), province = nullif(trim(coalesce(p->>'province', '')), ''), city = trim(p->>'city'),
      parish = v_parish, section = nullif(trim(coalesce(p->>'section', '')), ''), contact_name = v_contact, matricule = v_matricule,
      recorded_by = nullif(trim(coalesce(p->>'recorded_by', '')), ''), people = v_people,
      phone_hash = coalesce(v_phone_hash, phone_hash), fingerprint = v_fp
    where edit_token = p_token
    returning * into v_row;
    if found then return jsonb_build_object('status', 'updated', 'token', v_row.edit_token); end if;
  end if;

  -- Doublons évidents : même téléphone, même matricule, ou même nom + paroisse + âge + sexe.
  if v_phone_hash is not null and exists (select 1 from public.census_households where phone_hash = v_phone_hash) then
    return jsonb_build_object('status', 'duplicate_phone');
  end if;
  if v_matricule is not null and exists (select 1 from public.census_households where upper(matricule) = v_matricule) then
    return jsonb_build_object('status', 'duplicate_matricule');
  end if;
  if v_fp is not null and exists (select 1 from public.census_households where fingerprint = v_fp) then
    return jsonb_build_object('status', 'duplicate');
  end if;

  insert into public.census_households (country, province, city, parish, section, contact_name, matricule, recorded_by, people, phone_hash, fingerprint, user_id)
  values (
    trim(p->>'country'), nullif(trim(coalesce(p->>'province', '')), ''), trim(p->>'city'), v_parish,
    nullif(trim(coalesce(p->>'section', '')), ''), v_contact, v_matricule, nullif(trim(coalesce(p->>'recorded_by', '')), ''),
    v_people, v_phone_hash, v_fp, auth.uid()
  )
  returning * into v_row;
  return jsonb_build_object('status', 'created', 'token', v_row.edit_token);
end $$;
revoke all on function public.submit_census(jsonb, uuid) from public;
grant execute on function public.submit_census(jsonb, uuid) to anon, authenticated;

-- Relire sa propre fiche (pour la corriger) avec le jeton gardé sur le téléphone.
create or replace function public.get_census_entry(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('country', country, 'province', province, 'city', city, 'parish', parish, 'section', section,
    'contact_name', contact_name, 'matricule', matricule, 'recorded_by', recorded_by, 'people', people, 'updated_at', updated_at)
  from public.census_households where edit_token = p_token
$$;
revoke all on function public.get_census_entry(uuid) from public;
grant execute on function public.get_census_entry(uuid) to anon, authenticated;

-- Totaux publics, sans aucune donnée personnelle.
create or replace function public.census_public_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'people', coalesce(sum(person_count), 0),
    'households', count(*),
    'parishes', count(distinct public.census_norm(parish)),
    'countries', count(distinct public.census_norm(country))
  ) from public.census_households
$$;
revoke all on function public.census_public_stats() from public;
grant execute on function public.census_public_stats() to anon, authenticated;
