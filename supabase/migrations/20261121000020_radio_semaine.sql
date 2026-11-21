-- =====================================================================
-- Radio : grille type de la semaine, remplie toute seule.
--
-- radio.semaine (dans site_settings « public ») : une liste de créneaux
--   { id, jours: [1..7] (1 = lundi … 7 = dimanche), heure: 'HH:MM',
--     source: 'fichier' | 'predication' | 'emission', titre, url?, durationSeconds? }
--   « predication » et « emission » tournent d'un jour à l'autre parmi les
--   fichiers disponibles (prédications publiées, émissions déjà diffusées).
-- radio_remplir(n) : ajoute les créneaux des n prochains jours, sans toucher
--   à ce qui est déjà programmé (pas de chevauchement), et range les émissions
--   terminées depuis plus de 14 jours. Lancé chaque nuit par pg_cron.
-- =====================================================================

create extension if not exists pg_cron;

-- Les fichiers du site sous /predications/ sont aussi acceptés dans la grille.
create or replace function public.radio_programme_add(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  if coalesce(p->>'url', '') !~ '^https://([a-z0-9]+\.supabase\.co/storage/v1/object/public/(chants|predications)/[A-Za-z0-9._/-]{1,200}|jesuiskcciste\.com/(radio/emissions|audio|predications)/[A-Za-z0-9._-]{1,160}\.(webm|ogg|m4a|mp3|wav))$' then
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

-- Enregistrer la grille type (animateurs).
create or replace function public.radio_semaine_set(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s jsonb; v jsonb := '[]'::jsonb;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  if jsonb_typeof(coalesce(p, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p, '[]'::jsonb)) > 80 then raise exception 'Grille non valide.'; end if;
  for s in select * from jsonb_array_elements(coalesce(p, '[]'::jsonb)) loop
    if coalesce(s->>'heure', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Heure non valide.'; end if;
    if coalesce(s->>'source', '') not in ('fichier', 'predication', 'emission') then raise exception 'Source non valide.'; end if;
    if jsonb_typeof(s->'jours') <> 'array' or jsonb_array_length(s->'jours') = 0 then raise exception 'Choisissez au moins un jour.'; end if;
    if s->>'source' = 'fichier' and (coalesce(s->>'url', '') !~ '^https://' or coalesce((s->>'durationSeconds')::numeric, 0) <= 0) then raise exception 'Fichier non valide.'; end if;
    v := v || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'id', coalesce(nullif(left(s->>'id', 40), ''), substr(md5(random()::text), 1, 10)),
      'jours', (select coalesce(jsonb_agg(distinct (d)::int), '[]'::jsonb) from jsonb_array_elements_text(s->'jours') d where d ~ '^[1-7]$'),
      'heure', s->>'heure', 'source', s->>'source', 'titre', left(coalesce(s->>'titre', ''), 120),
      'url', case when s->>'source' = 'fichier' then s->>'url' end,
      'durationSeconds', case when s->>'source' = 'fichier' then round((s->>'durationSeconds')::numeric) end)));
  end loop;
  update site_settings
     set value = value || jsonb_build_object('radio', coalesce(value->'radio', '{}'::jsonb) || jsonb_build_object('semaine', v))
   where key = 'public';
end $$;

-- Remplir les n prochains jours à partir de la grille type.
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
            select distinct on (p->>'url') jsonb_build_object('url', p->>'url', 'title', regexp_replace(p->>'title', '\s*\(rediffusion[^)]*\)\s*$', '', 'i') || ' (rediffusion)', 'd', (p->>'durationSeconds')::int) x
              from jsonb_array_elements(coalesce(v_val->'radio'->'programmes', '[]'::jsonb)) p where p->>'url' ilike '%/radio/emissions/%') q;
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

revoke all on function public.radio_semaine_set(jsonb) from public;
grant execute on function public.radio_semaine_set(jsonb) to authenticated;
revoke all on function public.radio_remplir(int) from public;
grant execute on function public.radio_remplir(int) to authenticated;

-- Chaque nuit à 00h10 (heure de Kinshasa = 23h10 UTC) : les 7 prochains jours.
select cron.unschedule(jobid) from cron.job where jobname = 'radio-remplir-semaine';
select cron.schedule('radio-remplir-semaine', '10 23 * * *', $$select public.radio_remplir(7)$$);
