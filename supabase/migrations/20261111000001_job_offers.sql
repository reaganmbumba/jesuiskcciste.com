-- =====================================================================
-- Rubrique « Opportunités et emplois » : offres ajoutées par l'administration.
--
-- Les offres automatiques du jour (ReliefWeb, Jobicy) ne sont pas stockées :
-- le Worker du site les lit chez ces sites (GET /api/emplois). Cette table
-- garde les offres que l'administration publie elle-même : affiche reçue
-- d'une entreprise, offre partagée dans le groupe WhatsApp, etc. Chaque
-- offre indique sa source (qui l'a publiée) et comment postuler.
-- Lecture publique des offres publiées ; gestion par l'administration centrale.
-- =====================================================================

create table if not exists public.job_offers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 200),
  organization text not null check (char_length(trim(organization)) between 2 and 200),
  location text check (location is null or char_length(location) <= 200),
  contract_type text not null default 'emploi' check (contract_type in ('emploi', 'stage', 'consultance', 'benevolat', 'bourse', 'formation', 'autre')),
  description text check (description is null or char_length(description) <= 5000),
  -- Lien de l'offre, adresse e-mail ou numéro où postuler.
  apply_to text not null check (char_length(trim(apply_to)) between 3 and 500),
  -- D'où vient l'offre (site, affiche, communiqué de l'entreprise…).
  source text not null check (char_length(trim(source)) between 2 and 300),
  closing_date date,
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists job_offers_created_idx on public.job_offers(created_at desc);

alter table public.job_offers enable row level security;
alter table public.job_offers force row level security;

drop policy if exists "lecture publique" on public.job_offers;
create policy "lecture publique" on public.job_offers for select using (published or public.has_permission('settings.manage'));
drop policy if exists "administration" on public.job_offers;
create policy "administration" on public.job_offers for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
grant select on public.job_offers to anon, authenticated;
grant insert, update, delete on public.job_offers to authenticated;

drop trigger if exists job_offers_updated on public.job_offers;
create trigger job_offers_updated before update on public.job_offers for each row execute function public.set_updated_at();
