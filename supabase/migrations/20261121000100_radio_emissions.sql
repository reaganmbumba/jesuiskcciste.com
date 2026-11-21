-- =====================================================================
-- Radio : dossier des émissions (séparé des chants).
-- Les chants passent seuls entre les émissions ; une émission ne passe que
-- lorsqu'elle est programmée. radio_emissions liste les émissions prêtes
-- (même jamais diffusées) : le Studio les propose dans la grille, et la grille
-- type les fait tourner (avec les rediffusions).
-- =====================================================================

create table if not exists public.radio_emissions (
  url text primary key check (url ~ '^https://'),
  title text not null,
  duration_seconds int not null check (duration_seconds > 0),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.radio_emissions enable row level security;
alter table public.radio_emissions force row level security;
grant select on public.radio_emissions to anon, authenticated;
grant insert, update on public.radio_emissions to authenticated;
drop policy if exists "emissions : lecture" on public.radio_emissions;
create policy "emissions : lecture" on public.radio_emissions for select using (not hidden or public.can_host_radio());
drop policy if exists "emissions : animateur" on public.radio_emissions;
create policy "emissions : animateur" on public.radio_emissions for all to authenticated using (public.can_host_radio()) with check (public.can_host_radio());

create or replace function public.radio_remplir(p_jours int default 7)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_val jsonb; v_prog jsonb; v_sem jsonb; s jsonb; d date; v_start timestamptz; v_end timestamptz;
  v_url text; v_title text; v_dur int; v_id text; v_pool jsonb; v_n int; v_added int := 0; v_pick jsonb;
  v_today date := (now() at time zone 'Africa/Kinshasa')::date;
begin
  -- un animateur depuis le Studio, ou la tâche de nuit (sans utilisateur)
  if auth.uid() is not null and not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  select value into v_val from site_settings where key = 'public' for update;
  v_sem := coalesce(v_val->'radio'->'semaine', '[]'::jsonb);
  -- on range les émissions terminées depuis plus de 14 jours
  select coalesce(jsonb_agg(p), '[]'::jsonb) into v_prog
    from jsonb_array_elements(coalesce(v_val->'radio'->'programmes', '[]'::jsonb)) p
   where (p->>'startsAt')::timestamptz + make_interval(secs => coalesce((p->>'durationSeconds')::numeric, 0)) > now() - interval '14 days';

  for d in select generate_series(v_today, v_today + greatest(1, least(coalesce(p_jours, 7), 14)) - 1, interval '1 day')::date loop
    for s in select * from jsonb_array_elements(v_sem) loop
      continue when not (s->'jours') @> to_jsonb(extract(isodow from d)::int);
      v_start := ((d::text || ' ' || (s->>'heure'))::timestamp at time zone 'Africa/Kinshasa');
      continue when v_start < now() + interval '2 minutes';
      v_id := 'auto-' || (s->>'id') || '-' || d::text;
      continue when exists (select 1 from jsonb_array_elements(v_prog) p where p->>'id' = v_id);
      v_url := null; v_title := nullif(s->>'titre', ''); v_dur := null;
      if s->>'source' = 'fichier' then
        v_url := s->>'url'; v_dur := (s->>'durationSeconds')::int;
      else
        if s->>'source' = 'predication' then
          select coalesce(jsonb_agg(x order by x->>'url'), '[]'::jsonb) into v_pool from (
            select jsonb_build_object('url', case when audio_url like '/%' then 'https://jesuiskcciste.com' || audio_url else audio_url end, 'title', title, 'd', duration_seconds) x
              from audio_sermons where published and coalesce(audio_url, '') <> '' and coalesce(duration_seconds, 0) > 0
            union
            (select distinct on (p->>'url') jsonb_build_object('url', p->>'url', 'title', regexp_replace(p->>'title', '\s*\(rediffusion[^)]*\)\s*$', '', 'i'), 'd', (p->>'durationSeconds')::int)
              from jsonb_array_elements(coalesce(v_val->'radio'->'programmes', '[]'::jsonb)) p where p->>'url' ilike '%predication%')) q;
        else
          select coalesce(jsonb_agg(x order by x->>'url'), '[]'::jsonb) into v_pool from (
            select distinct on (u) jsonb_build_object('url', u, 'title', t, 'd', d) x from (
              select e.url u, e.title t, e.duration_seconds d from radio_emissions e where not e.hidden
              union all
              select r.url, r.title || ' (rediffusion)', r.duration_seconds from radio_rediffusions r
               where not r.hidden and r.url ilike '%/radio/emissions/%'
              union all
              select p->>'url', regexp_replace(p->>'title', '\s*\(rediffusion[^)]*\)\s*$', '', 'i') || ' (rediffusion)', (p->>'durationSeconds')::int
                from jsonb_array_elements(coalesce(v_val->'radio'->'programmes', '[]'::jsonb)) p where p->>'url' ilike '%/radio/emissions/%') z
            order by u) q;
        end if;
        v_n := jsonb_array_length(v_pool);
        continue when v_n = 0;
        -- rotation : un fichier différent chaque jour (et pour chaque créneau)
        v_pick := v_pool->(((d - date '2026-01-01') + abs(hashtext(s->>'id'))) % v_n);
        v_url := v_pick->>'url'; v_dur := (v_pick->>'d')::int;
        v_title := coalesce(v_title, v_pick->>'title');
      end if;
      continue when v_url is null or coalesce(v_dur, 0) <= 0;
      v_end := v_start + make_interval(secs => v_dur);
      -- pas de chevauchement avec ce qui est déjà programmé
      continue when exists (select 1 from jsonb_array_elements(v_prog) p
        where (p->>'startsAt')::timestamptz < v_end and v_start < (p->>'startsAt')::timestamptz + make_interval(secs => (p->>'durationSeconds')::numeric));
      v_prog := v_prog || jsonb_build_array(jsonb_build_object('id', v_id, 'title', left(coalesce(v_title, 'Émission'), 120), 'topic', '',
        'url', v_url, 'startsAt', to_char(v_start at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS".000Z"'), 'durationSeconds', v_dur));
      v_added := v_added + 1;
    end loop;
  end loop;
  update site_settings set value = value || jsonb_build_object('radio', coalesce(value->'radio', '{}'::jsonb) || jsonb_build_object('programmes', v_prog))
   where key = 'public';
  return v_added;
end $$;


insert into public.radio_emissions (url, title, duration_seconds) values
  ('https://jesuiskcciste.com/radio/emissions/la-decouverte-2026-11-21.mp3', 'La découverte', 279)
on conflict (url) do nothing;
