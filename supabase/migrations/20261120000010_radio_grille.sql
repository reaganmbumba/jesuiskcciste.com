-- Radio : grille des programmes dans le Studio.
-- Les animateurs programment une émission à partir d'un fichier déjà en ligne
-- (chants, prédications, émissions du site) ou d'un nouveau fichier, et peuvent
-- retirer une émission de la grille.

create or replace function public.radio_programme_add(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  if coalesce(p->>'url', '') !~ '^https://([a-z0-9]+\.supabase\.co/storage/v1/object/public/(chants|predications)/[A-Za-z0-9._/-]{1,200}|jesuiskcciste\.com/radio/emissions/[a-z0-9-]{1,120}\.(webm|ogg|m4a|mp3))$' then
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

create or replace function public.radio_programme_remove(p_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  update site_settings
     set value = jsonb_set(value, '{radio,programmes}',
           coalesce((select jsonb_agg(x) from jsonb_array_elements(value->'radio'->'programmes') x where x->>'id' is distinct from p_id), '[]'::jsonb))
   where key = 'public' and value->'radio' ? 'programmes';
end $$;
revoke all on function public.radio_programme_remove(text) from public;
grant execute on function public.radio_programme_remove(text) to authenticated;

-- Nouveau fichier déposé depuis la grille : aussi en mp3, aac, wav
drop policy if exists "chants enregistrement émission" on storage.objects;
create policy "chants enregistrement émission" on storage.objects for insert to authenticated
  with check (bucket_id = 'chants' and public.can_host_radio() and name ~ '^[a-z0-9-]{1,80}\.(webm|ogg|m4a|mp3|aac|wav)$');
