-- =====================================================================
-- Cotisations mensuelles des KCCistes, suivies par matricule.
--
-- • L'administration (ou les gestionnaires de solidarité) enregistre
--   chaque paiement : le membre, le mois payé, le montant et le moyen
--   (Orange Money, M-Pesa, espèces…). Une ligne par membre et par mois.
-- • Le site en déduit qui est à jour et qui est en retard, à partir du
--   mois de départ et du montant fixés dans les réglages ci-dessous.
-- • Chaque membre voit ses propres cotisations dans « Mon espace ».
-- =====================================================================

-- Réglages (une seule ligne) : montant mensuel, monnaie, mois de départ.
create table if not exists public.cotisation_settings (
  id smallint primary key default 1 check (id = 1),
  monthly_amount numeric(12, 2) not null default 5 check (monthly_amount >= 0),
  currency text not null default 'USD' check (currency in ('USD', 'CDF')),
  start_month date not null default date_trunc('month', now())::date check (extract(day from start_month) = 1),
  purpose text not null default 'Assistance des cas de premier degré (deuils proches…)' check (char_length(purpose) <= 300),
  updated_at timestamptz not null default now()
);
insert into public.cotisation_settings (id) values (1) on conflict do nothing;

create table if not exists public.member_cotisations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null check (currency in ('USD', 'CDF')),
  method text not null default 'orange_money' check (method in ('orange_money', 'mpesa', 'airtel_money', 'afrimoney', 'especes', 'banque', 'autre')),
  reference text check (char_length(reference) <= 100),
  note text check (char_length(note) <= 300),
  paid_on date not null default current_date,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);
create index if not exists member_cotisations_month_idx on public.member_cotisations (month);

alter table public.cotisation_settings enable row level security;
alter table public.cotisation_settings force row level security;
alter table public.member_cotisations enable row level security;
alter table public.member_cotisations force row level security;

create or replace function public.can_manage_cotisations() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_central_admin() or public.has_permission('contributions.manage');
$$;
grant execute on function public.can_manage_cotisations() to authenticated;

-- Réglages : lisibles par tout membre connecté, modifiables par la gestion.
drop policy if exists "réglages cotisations : lecture" on public.cotisation_settings;
create policy "réglages cotisations : lecture" on public.cotisation_settings for select to authenticated using (true);
drop policy if exists "réglages cotisations : gestion" on public.cotisation_settings;
create policy "réglages cotisations : gestion" on public.cotisation_settings for update to authenticated
  using (public.can_manage_cotisations()) with check (public.can_manage_cotisations());
revoke all on public.cotisation_settings from anon, authenticated;
grant select, update on public.cotisation_settings to authenticated;

-- Paiements : le membre voit les siens ; la gestion voit et écrit tout.
drop policy if exists "mes cotisations" on public.member_cotisations;
create policy "mes cotisations" on public.member_cotisations for select to authenticated using (
  user_id = auth.uid() or public.can_manage_cotisations() or public.has_permission('contributions.read'));
drop policy if exists "cotisations : ajout" on public.member_cotisations;
create policy "cotisations : ajout" on public.member_cotisations for insert to authenticated
  with check (public.can_manage_cotisations());
drop policy if exists "cotisations : correction" on public.member_cotisations;
create policy "cotisations : correction" on public.member_cotisations for update to authenticated
  using (public.can_manage_cotisations()) with check (public.can_manage_cotisations());
drop policy if exists "cotisations : suppression" on public.member_cotisations;
create policy "cotisations : suppression" on public.member_cotisations for delete to authenticated
  using (public.can_manage_cotisations());
revoke all on public.member_cotisations from anon, authenticated;
grant select, insert, update, delete on public.member_cotisations to authenticated;

-- Qui a enregistré le paiement : toujours la personne connectée.
create or replace function public.member_cotisations_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.recorded_by := auth.uid();
  return new;
end $$;
drop trigger if exists member_cotisations_stamp on public.member_cotisations;
create trigger member_cotisations_stamp before insert or update on public.member_cotisations
  for each row execute function public.member_cotisations_stamp();
