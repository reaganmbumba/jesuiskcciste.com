-- =====================================================================
-- Matricule personnel des KCCistes et lecture des articles réservée.
--
-- • Chaque compte reçoit un matricule unique (KCC-MMR-00256 : initiales + numéro), attribué par
--   la base dès la création du compte et affiché au membre à sa connexion.
--   Il est personnel : seul le membre et l'administration le voient.
-- • Pour lire un article en entier, le membre connecté saisit son
--   matricule sur son téléphone. Un seul appareil à la fois : saisir le
--   matricule sur un nouvel appareil bloque la lecture sur l'ancien.
-- • Les communiqués restent ouverts à tous (règle appliquée par le site).
-- =====================================================================

create sequence if not exists public.member_matricule_seq start 1;

create table if not exists public.member_matricules (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  matricule text not null unique check (matricule ~ '^[A-Z0-9-]{4,20}$'),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- L'appareil autorisé à lire les articles, un seul par compte.
create table if not exists public.reader_devices (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  device_id text not null check (char_length(device_id) between 10 and 100),
  device_label text check (char_length(device_label) <= 200),
  claimed_at timestamptz not null default now()
);

alter table public.member_matricules enable row level security;
alter table public.member_matricules force row level security;
alter table public.reader_devices enable row level security;
alter table public.reader_devices force row level security;

-- Le membre voit son matricule ; l'administration ceux de son périmètre.
drop policy if exists "mon matricule" on public.member_matricules;
create policy "mon matricule" on public.member_matricules for select using (
  user_id = auth.uid() or public.is_central_admin()
  or (public.has_permission('members.read_private') and exists (
    select 1 from public.profiles p where p.id = user_id and p.parish_id is not null and public.leads_parish(p.parish_id))));
revoke all on public.member_matricules from anon, authenticated;
grant select on public.member_matricules to authenticated;

drop policy if exists "mon appareil" on public.reader_devices;
create policy "mon appareil" on public.reader_devices for select using (user_id = auth.uid() or public.is_central_admin());
revoke all on public.reader_devices from anon, authenticated;
grant select on public.reader_devices to authenticated;
-- Aucune écriture directe : tout passe par les fonctions ci-dessous.

-- Matricule = KCC- + initiales (Nom, Postnom, Prénom) + numéro d'ordre.
-- Ex. Mbumba Mbumba Reagan → KCC-MMR-00256.
create or replace function public.next_matricule(p_user_id uuid) returns text
language plpgsql volatile security definer set search_path = public as $$
declare v_initials text;
begin
  select string_agg(left(w, 1), '' order by o) into v_initials
  from profiles p,
       lateral unnest(array[p.last_name, p.middle_name, p.first_name]) with ordinality as n(name, o),
       lateral (select upper(translate(trim(n.name), 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝ', 'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'))) x(w)
  where p.id = p_user_id and coalesce(trim(n.name), '') <> '';
  v_initials := left(regexp_replace(coalesce(v_initials, ''), '[^A-Z]', '', 'g'), 5);
  return 'KCC-' || case when v_initials = '' then '' else v_initials || '-' end
         || lpad(nextval('public.member_matricule_seq')::text, 5, '0');
end $$;
revoke all on function public.next_matricule(uuid) from public, anon, authenticated;

-- Matricule attribué automatiquement dès la création du compte.
create or replace function public.profile_assign_matricule() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('active', 'pending') and not exists (select 1 from member_matricules where user_id = new.id) then
    insert into member_matricules (user_id, matricule) values (new.id, next_matricule(new.id)) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists profiles_assign_matricule on public.profiles;
create trigger profiles_assign_matricule after insert or update of status on public.profiles
  for each row execute function public.profile_assign_matricule();

-- Les comptes existants reçoivent leur matricule, dans l'ordre d'inscription.
insert into public.member_matricules (user_id, matricule)
select p.id, public.next_matricule(p.id) from (
  select id from public.profiles where status in ('active', 'pending')
    and id not in (select user_id from public.member_matricules)
  order by created_at) p
on conflict do nothing;

-- Lecteur sans restriction : administration et rédaction.
create or replace function public.is_article_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_central_admin() or public.has_permission('announcements.create');
$$;

-- Le membre saisit son matricule : cet appareil devient le seul autorisé.
create or replace function public.claim_reader_device(p_matricule text, p_device_id text, p_device_label text default null)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_status public.account_status;
begin
  if auth.uid() is null then raise exception 'connexion_requise' using errcode = '28000'; end if;
  select status into v_status from profiles where id = auth.uid();
  if v_status is null or v_status not in ('active', 'pending') then raise exception 'compte_non_valide' using errcode = '42501'; end if;
  if not exists (select 1 from member_matricules where user_id = auth.uid()
                 and matricule = upper(regexp_replace(coalesce(p_matricule, ''), '\s', '', 'g'))) then
    raise exception 'matricule_incorrect' using errcode = '22023';
  end if;
  insert into reader_devices (user_id, device_id, device_label, claimed_at)
    values (auth.uid(), p_device_id, left(p_device_label, 200), now())
  on conflict (user_id) do update set device_id = excluded.device_id, device_label = excluded.device_label, claimed_at = now();
  return 'ok';
end $$;
grant execute on function public.claim_reader_device(text, text, text) to authenticated;

-- État de lecture de cet appareil : ok | autre_appareil | matricule_requis | non_valide | visiteur.
create or replace function public.reader_device_status(p_device_id text)
returns text language plpgsql stable security definer set search_path = public as $$
declare v_device text;
begin
  if auth.uid() is null then return 'visiteur'; end if;
  if public.is_article_editor() then return 'ok'; end if;
  if not exists (select 1 from profiles where id = auth.uid() and status in ('active', 'pending')) then return 'non_valide'; end if;
  select device_id into v_device from reader_devices where user_id = auth.uid();
  if v_device is null then return 'matricule_requis'; end if;
  if v_device = p_device_id then return 'ok'; end if;
  return 'autre_appareil';
end $$;
grant execute on function public.reader_device_status(text) to anon, authenticated;

-- Administration : corriger un matricule (ex. numéro du registre de l'église).
create or replace function public.admin_set_matricule(p_user_id uuid, p_matricule text)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v text := upper(regexp_replace(coalesce(p_matricule, ''), '\s', '', 'g'));
begin
  if not public.is_central_admin() then raise exception 'réservé à l''administration centrale' using errcode = '42501'; end if;
  if v = '' then v := next_matricule(p_user_id); end if;
  insert into member_matricules (user_id, matricule) values (p_user_id, v)
    on conflict (user_id) do update set matricule = excluded.matricule, sent_at = null;
  delete from reader_devices where user_id = p_user_id;
  return v;
end $$;
grant execute on function public.admin_set_matricule(uuid, text) to authenticated;

-- Administration : libérer le téléphone (le membre a changé d'appareil) ou noter l'envoi.
create or replace function public.admin_reader_action(p_user_id uuid, p_action text)
returns void language plpgsql volatile security definer set search_path = public as $$
begin
  if not (public.is_central_admin() or (public.has_permission('members.read_private') and exists (
    select 1 from profiles p where p.id = p_user_id and p.parish_id is not null and public.leads_parish(p.parish_id)))) then
    raise exception 'membre hors de votre périmètre' using errcode = '42501';
  end if;
  if p_action = 'liberer' then delete from reader_devices where user_id = p_user_id;
  elsif p_action = 'envoye' then update member_matricules set sent_at = now() where user_id = p_user_id;
  else raise exception 'action inconnue' using errcode = '22023';
  end if;
end $$;
grant execute on function public.admin_reader_action(uuid, text) to authenticated;
