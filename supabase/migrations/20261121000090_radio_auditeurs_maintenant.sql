-- Compteur de secours du Studio : auditeurs ayant signalé leur écoute ces 6 dernières minutes
-- (radio_ecoute_ping toutes les 4 min 30), quand le compteur temps réel est indisponible.
create or replace function public.radio_auditeurs_maintenant()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.can_host_radio() then raise exception 'Accès réservé aux animateurs de la radio.'; end if;
  return (select jsonb_build_object('total', count(distinct visitor), 'live', count(distinct visitor) filter (where live))
            from radio_ecoute where bucket >= now() - interval '6 minutes');
end $$;
revoke all on function public.radio_auditeurs_maintenant() from public;
grant execute on function public.radio_auditeurs_maintenant() to authenticated;
