-- =====================================================================
-- Les Révérends Apôtres : liste publique (en vie et décédés) avec photo
-- de profil, et propositions de photos envoyées par les visiteurs.
--
-- Une photo proposée va dans le bucket PRIVÉ `apostle-submissions` : elle
-- n'est visible de personne avant que l'administration l'approuve. À
-- l'approbation, l'administration la copie dans `public-assets/apotres/`
-- et l'enregistre comme photo de profil de l'apôtre.
-- =====================================================================

create table if not exists public.apostles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  title text not null default 'Révérend Apôtre' check (char_length(title) <= 80),
  status text not null default 'living' check (status in ('living', 'deceased')),
  photo_url text,
  place text check (char_length(place) <= 160),          -- paroisse, province ou pays
  birth_year int check (birth_year between 1850 and 2100),
  death_year int check (death_year between 1850 and 2100),
  bio text check (char_length(bio) <= 4000),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists apostles_order_idx on public.apostles(sort_order, full_name);

create table if not exists public.apostle_photo_submissions (
  id uuid primary key default gen_random_uuid(),
  apostle_id uuid not null references public.apostles(id) on delete cascade,
  photo_path text not null check (photo_path ~ '^[0-9a-f-]{36}/[0-9a-zA-Z_-]+\.(jpg|jpeg|png|webp)$'),
  submitter_name text not null check (char_length(trim(submitter_name)) between 2 and 120),
  submitter_contact text check (char_length(submitter_contact) <= 160),
  note text check (char_length(note) <= 600),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists apostle_submissions_status_idx on public.apostle_photo_submissions(status, created_at desc);

alter table public.apostles enable row level security;
alter table public.apostle_photo_submissions enable row level security;

-- Liste publique ; seule l'administration centrale la modifie.
drop policy if exists "lecture publique" on public.apostles;
create policy "lecture publique" on public.apostles for select using (true);
drop policy if exists "gestion" on public.apostles;
create policy "gestion" on public.apostles for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
grant select on public.apostles to anon, authenticated;
grant insert, update, delete on public.apostles to authenticated;

-- Tout le monde (même sans compte) peut proposer une photo, uniquement « en attente ».
-- Les propositions ne sont lisibles et traitées que par l'administration.
drop policy if exists "proposer" on public.apostle_photo_submissions;
create policy "proposer" on public.apostle_photo_submissions for insert with check (status = 'pending' and reviewed_at is null);
drop policy if exists "traiter" on public.apostle_photo_submissions;
create policy "traiter" on public.apostle_photo_submissions for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
grant insert on public.apostle_photo_submissions to anon, authenticated;
grant select, update, delete on public.apostle_photo_submissions to authenticated;

drop trigger if exists apostles_updated on public.apostles;
create trigger apostles_updated before update on public.apostles for each row execute function public.set_updated_at();

-- Stockage des photos proposées (privé, 8 Mo, images uniquement).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('apostle-submissions', 'apostle-submissions', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "apostle-submissions dépôt" on storage.objects;
create policy "apostle-submissions dépôt" on storage.objects for insert
  with check (bucket_id = 'apostle-submissions' and exists (select 1 from public.apostles a where a.id::text = (storage.foldername(name))[1]));
drop policy if exists "apostle-submissions administration" on storage.objects;
create policy "apostle-submissions administration" on storage.objects for all
  using (bucket_id = 'apostle-submissions' and public.has_permission('settings.manage'))
  with check (bucket_id = 'apostle-submissions' and public.has_permission('settings.manage'));
