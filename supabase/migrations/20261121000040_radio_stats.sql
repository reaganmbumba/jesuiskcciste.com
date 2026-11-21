-- =====================================================================
-- Radio : statistiques d'écoute.
-- Chaque auditeur signale qu'il écoute toutes les 5 minutes (radio_ecoute_ping) :
-- une ligne par auditeur et par tranche de 5 minutes, gardée 90 jours.
-- radio_stats(n) (animateurs) : auditeurs par jour, heures d'écoute, villes,
-- et auditeurs de chaque émission programmée.
-- =====================================================================

create table if not exists public.radio_ecoute (
  bucket timestamptz not null,
  visitor text not null check (char_length(visitor) between 8 and 64),
  city text check (city is null or char_length(city) <= 60),
  country text check (country is null or char_length(country) <= 2),
  live boolean not null default false,
  primary key (bucket, visitor)
);
create index if not exists radio_ecoute_bucket_idx on public.radio_ecoute(bucket);
alter table public.radio_ecoute enable row level security;
alter table public.radio_ecoute force row level security;
revoke all on public.radio_ecoute from anon, authenticated;

create or replace function public.radio_ecoute_ping(p_visitor text, p_city text default null, p_country text default null, p_live boolean default false)
returns void language sql security definer set search_path = public as $$
  insert into radio_ecoute (bucket, visitor, city, country, live)
  select date_bin('5 minutes', now(), timestamptz '2026-01-01'), left(p_visitor, 64), nullif(left(coalesce(p_city, ''), 60), ''), nullif(upper(left(coalesce(p_country, ''), 2)), ''), coalesce(p_live, false)
  where char_length(coalesce(p_visitor, '')) between 8 and 64
  on conflict (bucket, visitor) do update set live = radio_ecoute.live or excluded.live;
$$;
revoke all on function public.radio_ecoute_ping(text, text, text, boolean) from public;
grant execute on function public.radio_ecoute_ping(text, text, text, boolean) to anon, authenticated;

create or replace function public.radio_stats(p_days int default 7)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_from timestamptz := date_trunc('day', now() at time zone 'Africa/Kinshasa') at time zone 'Africa/Kinshasa' - make_interval(days => greatest(1, least(coalesce(p_days, 7), 90)) - 1);
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  return jsonb_build_object(
    'days', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'listeners', n, 'peak', pk) order by d), '[]') from (
      select u.d, u.n, k.pk from
        (select (bucket at time zone 'Africa/Kinshasa')::date d, count(distinct visitor) n from radio_ecoute where bucket >= v_from group by 1) u
        join (select d, max(c) pk from (select (bucket at time zone 'Africa/Kinshasa')::date d, count(*) c from radio_ecoute where bucket >= v_from group by bucket) x group by d) k using (d)) t),
    'hours', (select coalesce(jsonb_agg(jsonb_build_object('hour', h, 'avg', round(a::numeric, 1)) order by h), '[]') from (
      select h, avg(c) a from (select extract(hour from bucket at time zone 'Africa/Kinshasa')::int h, bucket, count(*) c from radio_ecoute where bucket >= v_from group by 1, 2) x group by h) t),
    'places', (select coalesce(jsonb_agg(jsonb_build_object('city', city, 'country', country, 'listeners', n) order by n desc), '[]') from (
      select city, country, count(distinct visitor) n from radio_ecoute where bucket >= v_from group by 1, 2 order by 3 desc limit 15) t),
    'shows', (select coalesce(jsonb_agg(jsonb_build_object('title', title, 'startsAt', s, 'listeners', n) order by s desc), '[]') from (
      select p->>'title' title, (p->>'startsAt')::timestamptz s,
             (select count(distinct visitor) from radio_ecoute e where e.bucket >= date_bin('5 minutes', (p->>'startsAt')::timestamptz, timestamptz '2026-01-01')
                and e.bucket < (p->>'startsAt')::timestamptz + make_interval(secs => (p->>'durationSeconds')::numeric)) n
        from site_settings, jsonb_array_elements(coalesce(value->'radio'->'programmes', '[]')) p
       where key = 'public' and (p->>'startsAt')::timestamptz >= v_from and (p->>'startsAt')::timestamptz < now()
       order by 2 desc limit 30) t),
    'total', (select count(distinct visitor) from radio_ecoute where bucket >= v_from)
  );
end $$;
revoke all on function public.radio_stats(int) from public;
grant execute on function public.radio_stats(int) to authenticated;

-- Ménage : on garde 90 jours d'écoute.
select cron.unschedule(jobid) from cron.job where jobname = 'radio-ecoute-menage';
select cron.schedule('radio-ecoute-menage', '25 2 * * *', $$delete from public.radio_ecoute where bucket < now() - interval '90 days'$$);
