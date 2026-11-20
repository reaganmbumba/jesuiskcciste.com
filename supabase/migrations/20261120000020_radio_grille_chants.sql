-- Radio : la grille du Studio accepte aussi les chants du site (/audio/…).

create or replace function public.radio_programme_add(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  if coalesce(p->>'url', '') !~ '^https://([a-z0-9]+\.supabase\.co/storage/v1/object/public/(chants|predications)/[A-Za-z0-9._/-]{1,200}|jesuiskcciste\.com/(radio/emissions|audio)/[A-Za-z0-9._-]{1,160}\.(webm|ogg|m4a|mp3|wav))$' then
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

