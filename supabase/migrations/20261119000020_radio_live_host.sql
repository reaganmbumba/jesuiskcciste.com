-- Radio : le nom de l'animateur à l'antenne est gardé dans radio.live (« host »),
-- pour qu'un second animateur ne coupe pas un direct en cours par erreur.
create or replace function public.radio_live_set(p_live jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_live jsonb;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_live
    from jsonb_each(coalesce(p_live, '{}'::jsonb))
   where key in ('on_air', 'rtc', 'url', 'calls', 'title', 'topic', 'started_at', 'call_url', 'host');
  update site_settings
     set value = value || jsonb_build_object('radio',
           coalesce(value->'radio', '{}'::jsonb) || jsonb_build_object('live', coalesce(value->'radio'->'live', '{}'::jsonb) || v_live))
   where key = 'public';
end $$;
