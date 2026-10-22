-- =====================================================================
-- Solidarité : dons en ligne par Mobile Money (M-Pesa, Orange Money,
-- Airtel Money) via FlexPay, depuis l'espace « Faire un don » de /solidarite.
--
-- Le donateur n'a pas besoin de compte. Le navigateur ne crée ni ne confirme
-- jamais un don : tout passe par l'Edge Function `dons-solidarite`
-- (clé service_role), qui re-vérifie chaque paiement auprès de FlexPay.
-- =====================================================================

create type public.online_donation_status as enum ('pending', 'paid', 'failed');

create table public.online_donations (
  id uuid primary key default gen_random_uuid(),
  -- Jeton remis au navigateur du donateur pour suivre SON paiement (pas de compte).
  access_token uuid not null default gen_random_uuid(),
  operation text not null check (operation ~ '^[a-z0-9-]{1,40}$'),
  donor_name text not null default 'Anonyme' check (length(donor_name) between 1 and 80),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null check (currency in ('USD','CDF')),
  provider public.payment_provider not null check (provider in ('mpesa','orange_money','airtel_money')),
  phone text not null check (phone ~ '^243[0-9]{9}$'),
  status public.online_donation_status not null default 'pending',
  gateway text not null default 'flexpay',
  gateway_order_number text,
  provider_reference text,
  gateway_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
create unique index online_donations_gateway_unique on public.online_donations(gateway, gateway_order_number) where gateway_order_number is not null;
create index online_donations_phone_idx on public.online_donations(phone, created_at desc);
create index online_donations_status_idx on public.online_donations(operation, status, created_at desc);

alter table public.online_donations enable row level security;
-- Lecture réservée aux gestionnaires de la solidarité (les numéros des donateurs ne sont jamais publics).
create policy "dons en ligne : gestionnaires" on public.online_donations for select using (public.has_permission('contributions.read'));
-- Aucune politique insert/update/delete : seule l'Edge Function (service_role) écrit.
revoke insert, update, delete on public.online_donations from anon, authenticated;
grant select on public.online_donations to authenticated;

create trigger online_donations_updated before update on public.online_donations for each row execute function public.set_updated_at();
