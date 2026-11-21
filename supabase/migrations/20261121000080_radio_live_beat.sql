-- =====================================================================
-- Radio : reprise automatique quand un direct du Studio tombe.
-- Le Studio envoie un « battement » toutes les 30 s (radio_live_beat).
-- Sans battement depuis 3 minutes (téléphone éteint, onglet fermé,
-- coupure), une tâche de fond rend l'antenne : la radio automatique et
-- les émissions programmées reprennent pour tout le monde (robot compris).
-- Les auditeurs, eux, n'attendent que 2 min 30 (vérifié de leur côté).
-- =====================================================================

-- Renvoie false si le direct n'est plus à l'antenne (arrêté par la garde après une coupure).
create or replace function public.radio_live_beat()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.can_host_radio() then return false; end if;
  update site_settings
     set value = jsonb_set(value, '{radio,live,beat}', to_jsonb(to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')))
   where key = 'public' and coalesce((value->'radio'->'live'->>'on_air')::boolean, false);
  return found;
end $$;
revoke all on function public.radio_live_beat() from public;
grant execute on function public.radio_live_beat() to authenticated;

-- Au début d'un direct, le battement repart de zéro (un vieux battement ne doit pas le couper).
create or replace function public.radio_live_set(p_live jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_live jsonb; v_was boolean; v_name text;
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_live
    from jsonb_each(coalesce(p_live, '{}'::jsonb))
   where key in ('on_air', 'rtc', 'url', 'calls', 'title', 'topic', 'started_at', 'call_url', 'host');
  if (v_live->>'on_air')::boolean is true then
    v_live := v_live || jsonb_build_object('beat', to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
  end if;
  select coalesce((value->'radio'->'live'->>'on_air')::boolean, false) into v_was from site_settings where key = 'public';
  update site_settings
     set value = value || jsonb_build_object('radio',
           coalesce(value->'radio', '{}'::jsonb) || jsonb_build_object('live', coalesce(value->'radio'->'live', '{}'::jsonb) || v_live))
   where key = 'public';
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

-- Garde : chaque minute, un direct du Studio sans battement depuis 3 minutes est arrêté.
create or replace function public.radio_live_garde()
returns void language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  select value->'radio'->'live' into v from site_settings where key = 'public';
  if coalesce((v->>'on_air')::boolean, false) and coalesce(v->>'rtc', '') <> '' and (v->>'beat') is not null
     and (v->>'beat')::timestamptz < now() - interval '3 minutes' then
    update site_settings
       set value = value || jsonb_build_object('radio', coalesce(value->'radio', '{}'::jsonb)
             || jsonb_build_object('live', coalesce(value->'radio'->'live', '{}'::jsonb) || '{"on_air": false, "rtc": "", "calls": false, "host": ""}'::jsonb))
     where key = 'public';
    update radio_journal set ended_at = (v->>'beat')::timestamptz where ended_at is null;
    update radio_appels set statut = 'termine', modifie_le = now() where statut in ('attente', 'antenne');
  end if;
end $$;
revoke all on function public.radio_live_garde() from public;
select cron.unschedule(jobid) from cron.job where jobname = 'radio-live-garde';
select cron.schedule('radio-live-garde', '* * * * *', $$select public.radio_live_garde()$$);
