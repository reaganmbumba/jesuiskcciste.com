-- =====================================================================
-- Radio : l'équipe des animateurs et le journal d'antenne.
-- radio_journal : chaque direct (qui, quoi, de quand à quand), écrit par
--   radio_live_set lui-même, quel que soit l'appareil de l'animateur.
-- radio_equipe() (administration) : les animateurs, leur dernier direct,
--   leur nombre d'émissions ; radio_animateur_retirer(id) retire l'accès.
-- radio_journal_lire(n) (animateurs) : directs + émissions programmées.
-- =====================================================================

create table if not exists public.radio_journal (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users (id) on delete set null,
  host_name text,
  title text,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create index if not exists radio_journal_started_idx on public.radio_journal(started_at desc);
alter table public.radio_journal enable row level security;
alter table public.radio_journal force row level security;
revoke all on public.radio_journal from anon, authenticated;

create or replace function public.radio_live_set(p_live jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_live jsonb; v_was boolean; v_name text;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_live
    from jsonb_each(coalesce(p_live, '{}'::jsonb))
   where key in ('on_air', 'rtc', 'url', 'calls', 'title', 'topic', 'started_at', 'call_url', 'host');
  select coalesce((value->'radio'->'live'->>'on_air')::boolean, false) into v_was from site_settings where key = 'public';
  update site_settings
     set value = value || jsonb_build_object('radio',
           coalesce(value->'radio', '{}'::jsonb) || jsonb_build_object('live', coalesce(value->'radio'->'live', '{}'::jsonb) || v_live))
   where key = 'public';
  -- journal d'antenne
  if v_live ? 'on_air' then
    if (v_live->>'on_air')::boolean then
      if not v_was or not exists (select 1 from radio_journal where ended_at is null) then
        update radio_journal set ended_at = now() where ended_at is null;
        select nullif(trim(concat_ws(' ', first_name, last_name)), '') into v_name from profiles where id = auth.uid();
        insert into radio_journal (host_id, host_name, title) values (auth.uid(), coalesce(nullif(v_live->>'host', ''), v_name), nullif(left(coalesce(v_live->>'title', ''), 160), ''));
      elsif v_live ? 'title' then
        update radio_journal set title = nullif(left(v_live->>'title', 160), '') where ended_at is null;
      end if;
    else
      update radio_journal set ended_at = now() where ended_at is null;
    end if;
  end if;
end $$;

create or replace function public.radio_equipe()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_permission('settings.manage') then raise exception 'Accès réservé à l''administration.'; end if;
  return (select coalesce(jsonb_agg(x order by x->>'name'), '[]') from (
    select jsonb_build_object('id', p.id, 'name', nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), 'since', ra.created_at,
      'lastLive', (select max(started_at) from radio_journal j where j.host_id = p.id),
      'shows', (select count(*) from radio_journal j where j.host_id = p.id),
      'hours', (select round(coalesce(sum(extract(epoch from coalesce(ended_at, now()) - started_at)), 0) / 3600, 1) from radio_journal j where j.host_id = p.id)) x
      from role_assignments ra join roles r on r.id = ra.role_id and r.key = 'radio_host' join profiles p on p.id = ra.user_id) t);
end $$;
revoke all on function public.radio_equipe() from public;
grant execute on function public.radio_equipe() to authenticated;

create or replace function public.radio_animateur_retirer(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_permission('settings.manage') then raise exception 'Accès réservé à l''administration.'; end if;
  delete from role_assignments where user_id = p_user and role_id = (select id from roles where key = 'radio_host');
end $$;
revoke all on function public.radio_animateur_retirer(uuid) from public;
grant execute on function public.radio_animateur_retirer(uuid) to authenticated;

create or replace function public.radio_journal_lire(p_jours int default 7)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_from timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_jours, 7), 60)));
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  return (select coalesce(jsonb_agg(x order by x->>'start' desc), '[]') from (
    select jsonb_build_object('kind', 'direct', 'title', coalesce(title, 'Direct'), 'host', host_name, 'start', started_at, 'end', ended_at) x
      from radio_journal where started_at >= v_from
    union all
    select jsonb_build_object('kind', 'programme', 'title', p->>'title', 'host', null, 'start', (p->>'startsAt')::timestamptz,
                              'end', (p->>'startsAt')::timestamptz + make_interval(secs => (p->>'durationSeconds')::numeric))
      from site_settings, jsonb_array_elements(coalesce(value->'radio'->'programmes', '[]')) p
     where key = 'public' and (p->>'startsAt')::timestamptz >= v_from and (p->>'startsAt')::timestamptz <= now()
    limit 400) t);
end $$;
revoke all on function public.radio_journal_lire(int) from public;
grant execute on function public.radio_journal_lire(int) to authenticated;
