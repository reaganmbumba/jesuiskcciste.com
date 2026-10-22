-- =====================================================================
-- Directs des cultes et des grandes fêtes sur YouTube.
--
-- L'administration centrale programme un direct (titre, date et heure,
-- durée, lien de la vidéo YouTube). Le site affiche un compte à rebours
-- jusqu'au début, puis le lecteur YouTube. Sans vidéo précise, le site
-- affiche le direct en cours de la chaîne « Je suis KCCiste ».
-- Le programme est public.
-- =====================================================================

create table if not exists public.livestreams (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 200),
  description text check (description is null or char_length(description) <= 3000),
  starts_at timestamptz not null,
  duration_minutes int not null default 180 check (duration_minutes between 15 and 720),
  -- Identifiant de la vidéo YouTube (11 caractères) ; vide = direct en cours de la chaîne.
  youtube_id text check (youtube_id is null or youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  is_cancelled boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists livestreams_starts_idx on public.livestreams(starts_at);

alter table public.livestreams enable row level security;
alter table public.livestreams force row level security;

drop policy if exists "lecture publique" on public.livestreams;
create policy "lecture publique" on public.livestreams for select using (true);
drop policy if exists "administration" on public.livestreams;
create policy "administration" on public.livestreams for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
grant select on public.livestreams to anon, authenticated;
grant insert, update, delete on public.livestreams to authenticated;

drop trigger if exists livestreams_updated on public.livestreams;
create trigger livestreams_updated before update on public.livestreams for each row execute function public.set_updated_at();
