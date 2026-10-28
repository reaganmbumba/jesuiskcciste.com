-- =====================================================================
-- Boutique : commandes de pagnes KCC (25 $ le pagne).
--
-- N'importe quel visiteur (connecté ou non) remplit le formulaire de la
-- page « Pagnes KCC » : la commande est enregistrée ici, envoyée par e-mail
-- et ouverte dans WhatsApp vers le numéro de contact du site.
-- Les visiteurs peuvent seulement AJOUTER une commande : ils ne peuvent ni
-- lire, ni modifier, ni supprimer les commandes. Seule l'administration
-- centrale (settings.manage) les consulte et suit leur avancement.
-- =====================================================================

create table if not exists public.pagne_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^PGN-[A-Z0-9]{6,12}$'),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  phone text not null check (char_length(trim(phone)) between 6 and 30),
  email text check (email is null or (char_length(email) <= 160 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  city text not null check (char_length(trim(city)) between 2 and 120),
  country text not null check (char_length(trim(country)) between 2 and 80),
  address text check (address is null or char_length(address) <= 300),
  -- Lignes de la commande : [{ "model": "oracle-2003", "label": "…", "quantity": 2 }]
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 20),
  quantity int not null check (quantity between 1 and 500),
  unit_price numeric(10,2) not null default 25 check (unit_price = 25),
  total numeric(10,2) not null check (total = quantity * unit_price),
  delivery text not null default 'livraison' check (delivery in ('livraison', 'retrait')),
  note text check (note is null or char_length(note) <= 1000),
  status text not null default 'nouvelle' check (status in ('nouvelle', 'contactee', 'payee', 'livree', 'annulee')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 2000),
  user_id uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pagne_orders_created_idx on public.pagne_orders(created_at desc);
create index if not exists pagne_orders_status_idx on public.pagne_orders(status);

alter table public.pagne_orders enable row level security;
alter table public.pagne_orders force row level security;

-- Tout le monde peut passer commande, toujours au statut « nouvelle » et sans note interne.
drop policy if exists "passer commande" on public.pagne_orders;
create policy "passer commande" on public.pagne_orders for insert
  with check (status = 'nouvelle' and admin_note is null and (user_id is null or user_id = auth.uid()));

-- L'administration centrale lit, suit et supprime les commandes.
drop policy if exists "administration" on public.pagne_orders;
create policy "administration" on public.pagne_orders for all
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));

grant insert on public.pagne_orders to anon, authenticated;
grant select, update, delete on public.pagne_orders to authenticated;

drop trigger if exists pagne_orders_updated on public.pagne_orders;
create trigger pagne_orders_updated before update on public.pagne_orders for each row execute function public.set_updated_at();
