-- =====================================================================
-- Radio : catalogue permanent des émissions déjà diffusées (rediffusions).
-- La grille (radio.programmes) ne garde que 14 jours : chaque heure, les
-- émissions terminées sont recopiées ici (une ligne par fichier). Lecture
-- publique ; les animateurs peuvent masquer une émission.
-- =====================================================================

create table if not exists public.radio_rediffusions (
  url text primary key check (url ~ '^https://'),
  title text not null,
  duration_seconds int not null check (duration_seconds > 0),
  first_aired timestamptz not null,
  last_aired timestamptz not null,
  hidden boolean not null default false
);
create index if not exists radio_rediffusions_aired_idx on public.radio_rediffusions(last_aired desc);
alter table public.radio_rediffusions enable row level security;
alter table public.radio_rediffusions force row level security;
grant select on public.radio_rediffusions to anon, authenticated;
grant update on public.radio_rediffusions to authenticated;
drop policy if exists "rediffusions : lecture" on public.radio_rediffusions;
create policy "rediffusions : lecture" on public.radio_rediffusions for select using (not hidden or public.can_host_radio());
drop policy if exists "rediffusions : animateur" on public.radio_rediffusions;
create policy "rediffusions : animateur" on public.radio_rediffusions for update to authenticated using (public.can_host_radio()) with check (public.can_host_radio());

create or replace function public.radio_rediffusions_sync()
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into radio_rediffusions (url, title, duration_seconds, first_aired, last_aired)
  select url, (array_agg(t order by s))[1], max(d), min(s), max(s) from (
    select p->>'url' url, regexp_replace(p->>'title', '\s*\(rediffusion[^)]*\)\s*$', '', 'i') t,
           round((p->>'durationSeconds')::numeric)::int d, (p->>'startsAt')::timestamptz s
      from site_settings, jsonb_array_elements(coalesce(value->'radio'->'programmes', '[]')) p
     where key = 'public' and coalesce(p->>'url', '') ~ '^https://'
       and (p->>'startsAt')::timestamptz + make_interval(secs => coalesce((p->>'durationSeconds')::numeric, 0)) < now()
       and coalesce((p->>'durationSeconds')::numeric, 0) > 0
       and p->>'title' !~* '^chant\s*:') x
  group by url
  on conflict (url) do update set last_aired = greatest(radio_rediffusions.last_aired, excluded.last_aired),
                                  first_aired = least(radio_rediffusions.first_aired, excluded.first_aired);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.radio_rediffusions_sync() from public;

select public.radio_rediffusions_sync();
select cron.unschedule(jobid) from cron.job where jobname = 'radio-rediffusions';
select cron.schedule('radio-rediffusions', '7 * * * *', $$select public.radio_rediffusions_sync()$$);
