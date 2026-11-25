-- =====================================================================
-- Radio KCC : formulaire d'identification et de disponibilité des
-- animateurs d'émissions (/radio/animateurs).
--
-- radio_candidatures : une ligne par candidature (identité, émission
--   proposée, jours et heures, moyens techniques, engagement).
-- Écriture : uniquement par la fonction submit_radio_candidature, même
--   sans compte, avec vérification des champs et limite contre les envois
--   en rafale.
-- Lecture, suivi (statut, note) et suppression : seulement le service de
--   programmation (administrateurs avec la permission settings.manage) dans
--   /admin/radio/candidatures.
-- =====================================================================

create sequence if not exists public.radio_candidatures_ref_seq;

create table if not exists public.radio_candidatures (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('RKCC-' || lpad(nextval('public.radio_candidatures_ref_seq')::text, 4, '0')),
  -- 1. Identification
  full_name text not null check (char_length(full_name) between 3 and 120),
  role_title text check (role_title is null or char_length(role_title) <= 160),
  phone text not null check (char_length(phone) between 9 and 30),
  email text check (email is null or char_length(email) <= 160),
  city text check (city is null or char_length(city) <= 160),
  -- 2. Émission
  show_title text not null check (char_length(show_title) between 3 and 160),
  show_type text not null check (show_type in ('predication', 'enseignement', 'evangelisation', 'temoignage', 'priere', 'debat', 'education', 'informations', 'autre')),
  show_type_other text check (show_type_other is null or char_length(show_type_other) <= 120),
  show_description text check (show_description is null or char_length(show_description) <= 3000),
  audience text check (audience is null or char_length(audience) <= 300),
  -- 3. Disponibilités
  days text[] not null check (cardinality(days) between 1 and 7 and days <@ array['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']),
  start_time text check (start_time is null or start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  end_time text check (end_time is null or end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  duration int not null check (duration in (15, 30, 45, 60)),
  frequency text not null check (frequency in ('quotidienne', 'hebdomadaire', 'bimensuelle', 'occasionnelle')),
  other_slot boolean,
  -- 4. Moyens techniques
  mode text not null check (mode in ('direct', 'preenregistree', 'assistance')),
  has_internet boolean,
  has_device boolean,
  has_microphone boolean,
  has_experience boolean,
  -- 5. Engagement
  respects_calendar boolean,
  available_for_tests boolean,
  notes text check (notes is null or char_length(notes) <= 3000),
  -- 6. Validation
  certified boolean not null check (certified),
  -- Suivi par le service de programmation
  status text not null default 'nouvelle' check (status in ('nouvelle', 'contactee', 'retenue', 'attente', 'refusee')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 2000),
  phone_key text,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists radio_candidatures_created_idx on public.radio_candidatures(created_at desc);
create index if not exists radio_candidatures_phone_idx on public.radio_candidatures(phone_key, created_at desc);

alter table public.radio_candidatures enable row level security;
alter table public.radio_candidatures force row level security;

drop policy if exists "lecture programmation" on public.radio_candidatures;
create policy "lecture programmation" on public.radio_candidatures for select using (public.has_permission('settings.manage'));
drop policy if exists "suivi programmation" on public.radio_candidatures;
create policy "suivi programmation" on public.radio_candidatures for update using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
drop policy if exists "suppression programmation" on public.radio_candidatures;
create policy "suppression programmation" on public.radio_candidatures for delete using (public.has_permission('settings.manage'));
revoke all on public.radio_candidatures from anon;
revoke insert on public.radio_candidatures from authenticated;
grant select, update, delete on public.radio_candidatures to authenticated;

-- L'administration ne change que le statut et la note : le reste de la candidature reste tel qu'envoyé.
create or replace function public.radio_candidature_before_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_status text := new.status; v_note text := new.admin_note;
begin
  new := old;
  new.status := v_status;
  new.admin_note := nullif(trim(coalesce(v_note, '')), '');
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists radio_candidatures_before_update on public.radio_candidatures;
create trigger radio_candidatures_before_update before update on public.radio_candidatures for each row execute function public.radio_candidature_before_update();

-- Dépôt d'une candidature. Renvoie {"reference": "RKCC-0001"}.
create or replace function public.submit_radio_candidature(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  t_name text := left(trim(coalesce(p->>'full_name', '')), 120);
  t_phone text := left(trim(coalesce(p->>'phone', '')), 30);
  v_digits text := regexp_replace(coalesce(p->>'phone', ''), '\D', '', 'g');
  t_email text := nullif(lower(left(trim(coalesce(p->>'email', '')), 160)), '');
  t_title text := left(trim(coalesce(p->>'show_title', '')), 160);
  t_type text := p->>'show_type';
  t_start text := nullif(trim(coalesce(p->>'start_time', '')), '');
  t_end text := nullif(trim(coalesce(p->>'end_time', '')), '');
  v_days text[];
  v_duration int;
  v_key text;
  v_row public.radio_candidatures;
  yn text[] := array['other_slot', 'has_internet', 'has_device', 'has_microphone', 'has_experience', 'respects_calendar', 'available_for_tests'];
  k text;
begin
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'Formulaire vide.'; end if;
  if char_length(t_name) < 3 then raise exception 'Indiquez votre nom et postnom.'; end if;
  if char_length(v_digits) < 9 or char_length(v_digits) > 15 then raise exception 'Numéro de téléphone incomplet.'; end if;
  if t_email is not null and t_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'Adresse e-mail non valide.'; end if;
  if char_length(t_title) < 3 then raise exception 'Donnez un titre à votre émission.'; end if;
  if t_type is null or t_type not in ('predication', 'enseignement', 'evangelisation', 'temoignage', 'priere', 'debat', 'education', 'informations', 'autre') then raise exception 'Choisissez le type d''émission.'; end if;
  if jsonb_typeof(p->'days') <> 'array' then raise exception 'Cochez au moins un jour.'; end if;
  select array_agg(d order by array_position(array['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], d))
    into v_days
    from (select distinct value as d from jsonb_array_elements_text(p->'days')) x
   where d in ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche');
  if v_days is null or cardinality(v_days) = 0 then raise exception 'Cochez au moins un jour.'; end if;
  if t_start is not null and t_start !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Heure de début non valide.'; end if;
  if t_end is not null and t_end !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Heure de fin non valide.'; end if;
  if t_start is not null and t_end is not null and t_end <= t_start then raise exception 'L''heure de fin doit être après l''heure de début.'; end if;
  begin v_duration := (p->>'duration')::int; exception when others then v_duration := null; end;
  if v_duration is null or v_duration not in (15, 30, 45, 60) then raise exception 'Choisissez la durée.'; end if;
  if coalesce(p->>'frequency', '') not in ('quotidienne', 'hebdomadaire', 'bimensuelle', 'occasionnelle') then raise exception 'Choisissez la fréquence.'; end if;
  if coalesce(p->>'mode', '') not in ('direct', 'preenregistree', 'assistance') then raise exception 'Choisissez le mode d''intervention.'; end if;
  if coalesce(p->>'certified', '') <> 'true' then raise exception 'Cochez la déclaration pour envoyer votre candidature.'; end if;
  foreach k in array yn loop
    if p ? k and jsonb_typeof(p->k) not in ('boolean', 'null') then raise exception 'Réponse Oui / Non non valide.'; end if;
  end loop;

  -- Garde-fous : 3 candidatures par numéro et par jour, 30 toutes personnes confondues par tranche de 10 minutes.
  v_key := right(v_digits, 9);
  if (select count(*) from public.radio_candidatures where phone_key = v_key and created_at > now() - interval '1 day') >= 3 then
    raise exception 'Vous avez déjà envoyé plusieurs candidatures aujourd''hui. Le service de programmation vous contactera.';
  end if;
  if (select count(*) from public.radio_candidatures where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'Beaucoup d''envois en ce moment, réessayez dans quelques minutes.';
  end if;

  insert into public.radio_candidatures (
    full_name, role_title, phone, email, city,
    show_title, show_type, show_type_other, show_description, audience,
    days, start_time, end_time, duration, frequency, other_slot,
    mode, has_internet, has_device, has_microphone, has_experience,
    respects_calendar, available_for_tests, notes, certified, phone_key, user_id
  ) values (
    t_name, nullif(left(trim(coalesce(p->>'role_title', '')), 160), ''), t_phone, t_email, nullif(left(trim(coalesce(p->>'city', '')), 160), ''),
    t_title, t_type, case when t_type = 'autre' then nullif(left(trim(coalesce(p->>'show_type_other', '')), 120), '') end,
    nullif(left(trim(coalesce(p->>'show_description', '')), 3000), ''), nullif(left(trim(coalesce(p->>'audience', '')), 300), ''),
    v_days, t_start, t_end, v_duration, p->>'frequency', (p->>'other_slot')::boolean,
    p->>'mode', (p->>'has_internet')::boolean, (p->>'has_device')::boolean, (p->>'has_microphone')::boolean, (p->>'has_experience')::boolean,
    (p->>'respects_calendar')::boolean, (p->>'available_for_tests')::boolean, nullif(left(trim(coalesce(p->>'notes', '')), 3000), ''),
    true, v_key, auth.uid()
  ) returning * into v_row;
  return jsonb_build_object('reference', v_row.reference);
end $$;
revoke all on function public.submit_radio_candidature(jsonb) from public;
grant execute on function public.submit_radio_candidature(jsonb) to anon, authenticated;
