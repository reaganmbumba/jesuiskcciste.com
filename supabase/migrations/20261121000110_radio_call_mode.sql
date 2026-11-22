-- Régie ou WhatsApp : radio_live_set accepte aussi la clé « call_mode » ('regie' | 'whatsapp').
do $$
declare d text := pg_get_functiondef('public.radio_live_set(jsonb)'::regprocedure);
begin
  if position('''call_mode''' in d) = 0 then
    execute replace(d, '''call_url'', ''host'')', '''call_url'', ''host'', ''call_mode'')');
  end if;
end $$;
