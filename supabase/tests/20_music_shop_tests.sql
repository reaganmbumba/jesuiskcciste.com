-- =====================================================================
-- KCC Music — Boutique : les commandes ne s'écrivent que côté serveur,
-- chacun ne lit que ses achats, le responsable musical lit les ventes.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

insert into public.artists (id, name) values ('99999999-0000-0000-0000-000000000001', 'Chorale test');
insert into public.tracks (id, title, artist_id, broadcast_rights, price_amount, price_currency)
  values ('99999999-0000-0000-0000-0000000000a1', 'Titre en vente', '99999999-0000-0000-0000-000000000001', 'authorized', 1, 'USD');
-- Ce que fait l'Edge Function (service_role).
insert into public.music_orders (user_id, track_id, item_title, amount, currency, provider, phone, status) values
  ('aaaaaaaa-0000-0000-0000-000000000003', '99999999-0000-0000-0000-0000000000a1', 'Titre en vente', 1, 'USD', 'mpesa', '243812345678', 'paid'),
  ('aaaaaaaa-0000-0000-0000-000000000004', '99999999-0000-0000-0000-0000000000a1', 'Titre en vente', 1, 'USD', 'orange_money', '243842345678', 'pending');

do $$ begin
  begin insert into public.music_orders (user_id, item_title, amount, currency, provider, phone) values ('aaaaaaaa-0000-0000-0000-000000000003', 'x', 1, 'USD', 'cash', '243812345678');
    raise exception 'espèces acceptées'; exception when check_violation then null; end;
  begin insert into public.albums (title, artist_id, price_amount, price_currency) values ('x', '99999999-0000-0000-0000-000000000001', 5, 'EUR');
    raise exception 'devise EUR acceptée'; exception when check_violation then null; end;
end $$;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  assert (select count(*) from public.music_orders) = 1, 'le membre ne voit que ses achats';
  begin
    insert into public.music_orders (user_id, track_id, item_title, amount, currency, provider, phone, status)
      values ('aaaaaaaa-0000-0000-0000-000000000003', '99999999-0000-0000-0000-0000000000a1', 'Titre en vente', 1, 'USD', 'mpesa', '243812345678', 'paid');
    raise exception 'un membre a créé une commande payée';
  exception when insufficient_privilege then null;
  end;
end $$;
do $$ begin update public.music_orders set status = 'paid'; exception when insufficient_privilege then null; end $$;
reset role;
do $$ begin assert (select count(*) from public.music_orders where status = 'paid') = 1, 'un membre ne peut pas se déclarer payé'; end $$;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin assert (select count(*) from public.music_orders) = 2, 'l’administrateur voit toutes les ventes'; end $$;
reset role;
set role anon;
set request.jwt.claim.sub = '';
do $$ begin assert (select count(*) from public.music_orders) = 0, 'un visiteur ne voit aucune commande'; end $$;
reset role;

select 'TESTS BOUTIQUE PASSÉS' as resultat;
