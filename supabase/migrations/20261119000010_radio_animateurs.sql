-- =====================================================================
-- Radio Je suis KCCiste : animateurs invités et plateau à plusieurs
--
-- 1. Rôle « Animateur radio » (radio_host) : il anime la radio en direct
--    (antenne, appels, sujet, rediffusion) SANS aucun autre droit sur le site.
-- 2. Codes d'invitation : l'administrateur donne un code ; la personne crée
--    son compte puis saisit le code dans le Studio : elle devient animateur.
--    (Les codes eux-mêmes ne sont jamais dans ce fichier.)
-- 3. Plateau : l'animateur partage un lien ; les invités (3 places) passent
--    directement à l'antenne et s'entendent entre eux.
-- =====================================================================

insert into public.permissions (key, label)
  select 'radio.antenne', 'Animer la radio en direct' where not exists (select 1 from public.permissions where key = 'radio.antenne');
insert into public.roles (key, label)
  select 'radio_host', 'Animateur radio' where not exists (select 1 from public.roles where key = 'radio_host');
insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
   where r.key in ('radio_host', 'central_admin') and p.key = 'radio.antenne'
     and not exists (select 1 from public.role_permissions x where x.role_id = r.id and x.permission_id = p.id);

create or replace function public.can_host_radio()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission('settings.manage') or public.has_permission('radio.antenne');
$$;
grant execute on function public.can_host_radio() to authenticated;

-- Les animateurs gèrent la file des appels
drop policy if exists "radio appels : animateur" on public.radio_appels;
create policy "radio appels : animateur" on public.radio_appels for all to authenticated
  using (public.can_host_radio()) with check (public.can_host_radio());

-- Les animateurs mettent en ligne l'enregistrement de leur émission (ajout seulement)
drop policy if exists "chants enregistrement émission" on storage.objects;
create policy "chants enregistrement émission" on storage.objects for insert to authenticated
  with check (bucket_id = 'chants' and public.can_host_radio() and name ~ '^[a-z0-9-]{1,80}\.(webm|ogg|m4a)$');

-- État du direct (radio.live) : seulement ces champs, rien d'autre des réglages du site
create or replace function public.radio_live_set(p_live jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_live jsonb;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_live
    from jsonb_each(coalesce(p_live, '{}'::jsonb))
   where key in ('on_air', 'rtc', 'url', 'calls', 'title', 'topic', 'started_at', 'call_url');
  update site_settings
     set value = value || jsonb_build_object('radio',
           coalesce(value->'radio', '{}'::jsonb) || jsonb_build_object('live', coalesce(value->'radio'->'live', '{}'::jsonb) || v_live))
   where key = 'public';
end $$;

-- Rediffusion d'une émission enregistrée
create or replace function public.radio_programme_add(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  if coalesce(p->>'url', '') !~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/chants/[a-z0-9-]{1,80}\.(webm|ogg|m4a|mp3)$' then
    raise exception 'Fichier non valide.';
  end if;
  if (p->>'startsAt') is null or (p->>'startsAt')::timestamptz < now() - interval '1 minute' then raise exception 'Choisissez une heure à venir.'; end if;
  if coalesce((p->>'durationSeconds')::numeric, 0) <= 0 or (p->>'durationSeconds')::numeric > 6 * 3600 then raise exception 'Durée non valide.'; end if;
  v := jsonb_build_object('id', coalesce(nullif(p->>'id', ''), gen_random_uuid()::text), 'title', left(coalesce(p->>'title', ''), 120),
        'topic', left(coalesce(p->>'topic', ''), 3000), 'url', p->>'url', 'startsAt', p->>'startsAt', 'durationSeconds', round((p->>'durationSeconds')::numeric));
  update site_settings
     set value = value || jsonb_build_object('radio',
           coalesce(value->'radio', '{}'::jsonb) || jsonb_build_object('programmes', coalesce(value->'radio'->'programmes', '[]'::jsonb) || jsonb_build_array(v)))
   where key = 'public';
end $$;

-- Codes d'invitation des animateurs
create table if not exists public.radio_codes (
  code text primary key check (code ~ '^[A-Z0-9-]{8,40}$'),
  note text,
  cree_le timestamptz not null default now(),
  utilise_par uuid references auth.users (id) on delete set null,
  utilise_le timestamptz
);
alter table public.radio_codes enable row level security;
drop policy if exists "radio codes : administration" on public.radio_codes;
create policy "radio codes : administration" on public.radio_codes for all to authenticated
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));

create or replace function public.radio_code_utiliser(p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_code text; v_role uuid; v_status text;
begin
  if v_uid is null then raise exception 'Connectez-vous d''abord.'; end if;
  select status::text into v_status from profiles where id = v_uid;
  if v_status is null then raise exception 'Compte introuvable.'; end if;
  if v_status in ('suspended', 'deleted') then raise exception 'Ce compte est suspendu.'; end if;
  select code into v_code from radio_codes where code = upper(trim(coalesce(p_code, ''))) and utilise_par is null for update;
  if v_code is null then raise exception 'Code invalide ou déjà utilisé.'; end if;
  select id into v_role from roles where key = 'radio_host';
  if not exists (select 1 from role_assignments where user_id = v_uid and role_id = v_role) then
    insert into role_assignments (user_id, role_id) values (v_uid, v_role);
  end if;
  -- Invité par l'administrateur : le compte en attente est validé.
  update profiles set status = 'active' where id = v_uid and status = 'pending';
  update radio_codes set utilise_par = v_uid, utilise_le = now() where code = v_code;
  return 'ok';
end $$;
revoke all on function public.radio_code_utiliser(text) from public;
grant execute on function public.radio_code_utiliser(text) to authenticated;
revoke all on function public.radio_live_set(jsonb) from public;
grant execute on function public.radio_live_set(jsonb) to authenticated;
revoke all on function public.radio_programme_add(jsonb) from public;
grant execute on function public.radio_programme_add(jsonb) to authenticated;

-- Plateau : invités qui passent directement à l'antenne (3 places)
alter table public.radio_appels add column if not exists genre text not null default 'appel' check (genre in ('appel', 'plateau'));
alter table public.radio_appels add column if not exists siege smallint check (siege between 1 and 3);

create table if not exists public.radio_plateau (
  jeton text primary key,
  cree_par uuid not null,
  expire_le timestamptz not null
);
alter table public.radio_plateau enable row level security; -- aucun accès direct : fonctions seulement

create or replace function public.radio_plateau_lien()
returns text language plpgsql security definer set search_path = public as $$
declare v_jeton text := encode(extensions.gen_random_bytes(12), 'hex');
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  delete from radio_plateau where expire_le < now() or cree_par = auth.uid();
  insert into radio_plateau (jeton, cree_par, expire_le) values (v_jeton, auth.uid(), now() + interval '8 hours');
  return v_jeton;
end $$;

create or replace function public.radio_plateau_fermer()
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.can_host_radio() then return; end if;
  delete from radio_plateau where cree_par = auth.uid();
  update radio_appels set statut = 'termine', modifie_le = now() where genre = 'plateau' and statut = 'antenne';
end $$;

create or replace function public.radio_plateau_rejoindre(p_jeton text, p_nom text, p_session text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_siege smallint; v_id uuid;
begin
  if not exists (select 1 from radio_plateau where jeton = coalesce(p_jeton, '') and expire_le > now()) then
    raise exception 'Ce lien de plateau n''est plus valable. Demandez un nouveau lien à l''animateur.';
  end if;
  if p_nom is null or length(trim(p_nom)) not between 1 and 60 then raise exception 'Nom invalide.'; end if;
  if p_session is null or p_session !~ '^[A-Za-z0-9_-]{8,128}$' then raise exception 'Connexion invalide.'; end if;
  update radio_appels set statut = 'termine', modifie_le = now()
   where genre = 'plateau' and statut = 'antenne' and cree_le < now() - interval '6 hours';
  select s into v_siege from generate_series(1, 3) s
   where s not in (select siege from radio_appels where genre = 'plateau' and statut = 'antenne' and siege is not null)
   order by s limit 1;
  if v_siege is null then raise exception 'Le plateau est complet (3 invités). Réessayez plus tard.'; end if;
  insert into radio_appels (nom, session_id, statut, genre, siege) values (trim(p_nom), p_session, 'antenne', 'plateau', v_siege)
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'siege', v_siege);
end $$;
revoke all on function public.radio_plateau_lien() from public;
revoke all on function public.radio_plateau_fermer() from public;
revoke all on function public.radio_plateau_rejoindre(text, text, text) from public;
grant execute on function public.radio_plateau_lien() to authenticated;
grant execute on function public.radio_plateau_fermer() to authenticated;
grant execute on function public.radio_plateau_rejoindre(text, text, text) to anon, authenticated;
