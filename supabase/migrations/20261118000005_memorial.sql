-- =====================================================================
-- Mémorial : pages d'hommage aux fidèles rappelés à Dieu.
--
-- memorials : une fiche par défunt (photo, dates, paroisse, biographie).
--   Lecture publique des fiches publiées ; gestion par l'administration
--   centrale (settings.manage). La clé publique est le « slug » de l'adresse
--   /memorial/<slug> (les fiches livrées avec le site utilisent le même slug).
-- memorial_condolences : messages de condoléances laissés par les visiteurs,
--   même sans compte. Ils arrivent « en attente » et ne sont visibles qu'une
--   fois approuvés par l'administration.
-- =====================================================================

create table if not exists public.memorials (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  -- Titre dans l'Église : Maman Diaconesse, Papa Pasteur, Frère…
  honorific text check (honorific is null or char_length(honorific) <= 80),
  parish text check (parish is null or char_length(parish) <= 160),
  city text check (city is null or char_length(city) <= 120),
  birth_date date,
  death_date date,
  burial_date date,
  photo_url text check (photo_url is null or char_length(photo_url) <= 1000),
  -- Courte phrase d'hommage affichée sous le nom.
  epitaph text check (epitaph is null or char_length(epitaph) <= 300),
  biography text check (biography is null or char_length(biography) <= 12000),
  -- Lien vers le communiqué ou l'article du site (facultatif).
  article_url text check (article_url is null or char_length(article_url) <= 500),
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists memorials_death_idx on public.memorials(death_date desc nulls last, created_at desc);

alter table public.memorials enable row level security;
alter table public.memorials force row level security;

drop policy if exists "lecture publique" on public.memorials;
create policy "lecture publique" on public.memorials for select using (published or public.has_permission('settings.manage'));
drop policy if exists "administration" on public.memorials;
create policy "administration" on public.memorials for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
grant select on public.memorials to anon, authenticated;
grant insert, update, delete on public.memorials to authenticated;

drop trigger if exists memorials_updated on public.memorials;
create trigger memorials_updated before update on public.memorials for each row execute function public.set_updated_at();

create table if not exists public.memorial_condolences (
  id uuid primary key default gen_random_uuid(),
  memorial_slug text not null check (char_length(memorial_slug) between 1 and 80),
  author_name text not null check (char_length(trim(author_name)) between 2 and 120),
  author_parish text check (author_parish is null or char_length(author_parish) <= 160),
  message text not null check (char_length(trim(message)) between 3 and 1500),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);
create index if not exists memorial_condolences_slug_idx on public.memorial_condolences(memorial_slug, created_at);
create index if not exists memorial_condolences_status_idx on public.memorial_condolences(status, created_at);

alter table public.memorial_condolences enable row level security;
alter table public.memorial_condolences force row level security;

-- Les visiteurs ne voient que les messages approuvés ; l'administration voit tout.
drop policy if exists "lecture" on public.memorial_condolences;
create policy "lecture" on public.memorial_condolences for select using (status = 'approved' or public.has_permission('settings.manage'));
-- Tout le monde peut écrire un message, toujours « en attente ».
drop policy if exists "depot" on public.memorial_condolences;
create policy "depot" on public.memorial_condolences for insert with check (status = 'pending');
drop policy if exists "moderation" on public.memorial_condolences;
create policy "moderation" on public.memorial_condolences for update using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
drop policy if exists "suppression" on public.memorial_condolences;
create policy "suppression" on public.memorial_condolences for delete using (public.has_permission('settings.manage'));
grant select, insert on public.memorial_condolences to anon, authenticated;
grant update, delete on public.memorial_condolences to authenticated;

-- Un même message envoyé plusieurs fois de suite (double clic, réseau lent) n'est gardé qu'une fois.
create or replace function public.memorial_condolence_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.memorial_condolences c
    where c.memorial_slug = new.memorial_slug and c.author_name = new.author_name and c.message = new.message
      and c.created_at > now() - interval '1 day'
  ) then
    return null;
  end if;
  return new;
end $$;
drop trigger if exists memorial_condolences_guard on public.memorial_condolences;
create trigger memorial_condolences_guard before insert on public.memorial_condolences for each row execute function public.memorial_condolence_guard();
