-- =====================================================================
-- KCC Music — Boutique : vente de titres et d'albums par Mobile Money
-- (M-Pesa, Orange Money, Airtel Money) via l'agrégateur FlexPay.
--
-- Le navigateur ne crée ni ne confirme jamais une commande : tout passe par
-- l'Edge Function `boutique-musique` (clé service_role côté serveur), qui
-- re-vérifie chaque paiement auprès de FlexPay avant de le marquer « payé ».
-- =====================================================================

-- Prix des albums (les titres ont déjà price_amount / price_currency).
alter table public.albums add column if not exists price_amount numeric(10,2) check (price_amount is null or price_amount > 0);
alter table public.albums add column if not exists price_currency text check (price_currency is null or price_currency in ('USD','CDF'));
alter table public.tracks drop constraint if exists tracks_price_currency_check;
alter table public.tracks add constraint tracks_price_currency_check check (price_currency is null or price_currency in ('USD','CDF'));
-- Fichier livré à l'acheteur (qualité complète), dans le bucket privé `music`.
-- Vide : on livre le fichier d'écoute (audio_url).
alter table public.tracks add column if not exists sale_file_path text;

create type public.music_order_status as enum ('pending', 'paid', 'failed', 'cancelled');

create table public.music_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete set null,
  album_id uuid references public.albums(id) on delete set null,
  item_title text not null,                 -- figé au moment de l'achat
  amount numeric(10,2) not null check (amount > 0),
  currency text not null check (currency in ('USD','CDF')),
  provider public.payment_provider not null check (provider in ('mpesa','orange_money','airtel_money')),
  phone text not null check (phone ~ '^243[0-9]{9}$'),
  status public.music_order_status not null default 'pending',
  gateway text not null default 'flexpay',
  gateway_order_number text,
  provider_reference text,
  gateway_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
create unique index music_orders_gateway_unique on public.music_orders(gateway, gateway_order_number) where gateway_order_number is not null;
create index music_orders_user_idx on public.music_orders(user_id, created_at desc);
create index music_orders_status_idx on public.music_orders(status, created_at desc);

alter table public.music_orders enable row level security;
-- Lecture : l'acheteur voit ses commandes, le responsable musical voit les ventes.
create policy "ses achats" on public.music_orders for select using (user_id = auth.uid() or public.has_permission('music.manage'));
-- Aucune politique insert/update/delete : seule l'Edge Function (service_role) écrit.
revoke insert, update, delete on public.music_orders from anon, authenticated;
grant select on public.music_orders to authenticated;

create trigger music_orders_updated before update on public.music_orders for each row execute function public.set_updated_at();
