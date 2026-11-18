-- =====================================================================
-- Radio Je suis KCCiste : appels des auditeurs pendant l'émission en direct
--
-- Un auditeur ouvre jesuiskcciste.com/radio et appuie sur « Appeler
-- l'émission ». Sa voix part vers le relais (Cloudflare Realtime) et son
-- appel s'inscrit ici, en attente. L'animateur (administrateur) voit la
-- file, prend l'appel : la voix passe à l'antenne et tout le monde l'entend.
--
-- Les visiteurs n'ont aucun accès direct à la table : ils passent par les
-- fonctions radio_appeler / radio_appel_statut / radio_raccrocher (avec
-- l'identifiant, impossible à deviner, de leur propre appel).
-- =====================================================================

create table if not exists public.radio_appels (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (length(trim(nom)) between 1 and 60),
  ville text check (ville is null or length(ville) <= 60),
  session_id text not null check (session_id ~ '^[A-Za-z0-9_-]{8,128}$'),
  statut text not null default 'attente' check (statut in ('attente', 'antenne', 'termine', 'refuse')),
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);
create index if not exists radio_appels_statut on public.radio_appels (statut, cree_le);

alter table public.radio_appels enable row level security;
drop policy if exists "radio appels : animateur" on public.radio_appels;
create policy "radio appels : animateur" on public.radio_appels for all to authenticated
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));

create or replace function public.radio_appeler(p_nom text, p_ville text, p_session text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_nom is null or length(trim(p_nom)) not between 1 and 60 then raise exception 'Nom invalide.'; end if;
  if p_session is null or p_session !~ '^[A-Za-z0-9_-]{8,128}$' then raise exception 'Appel invalide.'; end if;
  -- Les appels oubliés (plus de 2 heures) ne bloquent pas la file.
  update radio_appels set statut = 'termine', modifie_le = now()
   where statut in ('attente', 'antenne') and cree_le < now() - interval '2 hours';
  if (select count(*) from radio_appels where statut = 'attente') >= 30 then
    raise exception 'La file d''attente est pleine. Réessayez dans quelques minutes.';
  end if;
  insert into radio_appels (nom, ville, session_id) values (trim(p_nom), nullif(trim(coalesce(p_ville, '')), ''), p_session)
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.radio_appel_statut(p_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select statut from radio_appels where id = p_id
$$;

create or replace function public.radio_raccrocher(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update radio_appels set statut = 'termine', modifie_le = now() where id = p_id and statut in ('attente', 'antenne')
$$;

revoke all on function public.radio_appeler(text, text, text) from public;
revoke all on function public.radio_appel_statut(uuid) from public;
revoke all on function public.radio_raccrocher(uuid) from public;
grant execute on function public.radio_appeler(text, text, text) to anon, authenticated;
grant execute on function public.radio_appel_statut(uuid) to anon, authenticated;
grant execute on function public.radio_raccrocher(uuid) to anon, authenticated;
grant select, update on public.radio_appels to authenticated;
