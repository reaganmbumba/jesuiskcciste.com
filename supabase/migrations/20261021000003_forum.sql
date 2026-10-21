-- =====================================================================
-- Forum de discussion : l'administration publie des sujets, les membres
-- inscrits (compte validé) les commentent. Chaque commentaire affiche
-- uniquement le nom du membre et sa paroisse.
--
-- Le nom et la paroisse sont recopiés sur le commentaire au moment de
-- l'envoi (par la base, pas par le navigateur) : la lecture publique du
-- forum ne donne donc accès à aucune autre donnée des profils.
-- =====================================================================

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 200),
  body text not null default '' check (char_length(body) <= 10000),
  author_id uuid references public.profiles(id) on delete set null default auth.uid(),
  is_pinned boolean not null default false,   -- affiché en tête de liste
  is_locked boolean not null default false,   -- commentaires fermés
  is_hidden boolean not null default false,   -- masqué au public (modération)
  comment_count int not null default 0,
  last_comment_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists forum_topics_list_idx on public.forum_topics(is_pinned desc, created_at desc);

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null default auth.uid(),
  author_name text not null default '',
  parish_name text,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists forum_comments_topic_idx on public.forum_comments(topic_id, created_at);

alter table public.forum_topics enable row level security;
alter table public.forum_topics force row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_comments force row level security;

-- Sujets : lecture publique (sauf masqués) ; seule la modération les gère.
drop policy if exists "lecture publique" on public.forum_topics;
create policy "lecture publique" on public.forum_topics for select using (not is_hidden or public.has_permission('moderation'));
drop policy if exists "modération" on public.forum_topics;
create policy "modération" on public.forum_topics for all using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
grant select on public.forum_topics to anon, authenticated;
grant insert, update, delete on public.forum_topics to authenticated;

-- Commentaires : lecture publique des commentaires visibles d'un sujet visible.
drop policy if exists "lecture publique" on public.forum_comments;
create policy "lecture publique" on public.forum_comments for select using (
  public.has_permission('moderation')
  or (not is_hidden and exists (select 1 from public.forum_topics t where t.id = topic_id and not t.is_hidden)));
-- Un membre validé commente en son nom, sur un sujet visible et ouvert.
drop policy if exists "commenter" on public.forum_comments;
create policy "commenter" on public.forum_comments for insert with check (
  public.is_active_member() and author_id = auth.uid() and not is_hidden
  and exists (select 1 from public.forum_topics t where t.id = topic_id and not t.is_hidden and not t.is_locked));
-- Un membre peut retirer son propre commentaire ; la modération retire tout.
drop policy if exists "supprimer" on public.forum_comments;
create policy "supprimer" on public.forum_comments for delete using (author_id = auth.uid() or public.has_permission('moderation'));
drop policy if exists "modération" on public.forum_comments;
create policy "modération" on public.forum_comments for update using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
grant select on public.forum_comments to anon, authenticated;
grant insert, update, delete on public.forum_comments to authenticated;

-- Le nom et la paroisse viennent du profil de l'auteur connecté, jamais du navigateur.
create or replace function public.forum_comment_fill_author() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.author_id := auth.uid();
  new.created_at := now();
  select trim(both ' ' from concat_ws(' ', p.first_name, p.middle_name, p.last_name)), pa.name
    into new.author_name, new.parish_name
    from profiles p left join parishes pa on pa.id = p.parish_id
    where p.id = auth.uid();
  new.author_name := coalesce(nullif(new.author_name, ''), 'Membre');
  return new;
end $$;
drop trigger if exists forum_comments_author on public.forum_comments;
create trigger forum_comments_author before insert on public.forum_comments for each row execute function public.forum_comment_fill_author();

-- Nombre de commentaires visibles et date du dernier, pour la liste des sujets.
create or replace function public.forum_topic_refresh_counts() returns trigger
language plpgsql security definer set search_path = public as $$
declare tid uuid := coalesce(new.topic_id, old.topic_id);
begin
  update forum_topics t set
    comment_count = (select count(*) from forum_comments c where c.topic_id = tid and not c.is_hidden),
    last_comment_at = (select max(created_at) from forum_comments c where c.topic_id = tid and not c.is_hidden)
  where t.id = tid;
  return null;
end $$;
drop trigger if exists forum_comments_counts on public.forum_comments;
create trigger forum_comments_counts after insert or delete or update of is_hidden on public.forum_comments
  for each row execute function public.forum_topic_refresh_counts();

drop trigger if exists forum_topics_updated on public.forum_topics;
create trigger forum_topics_updated before update on public.forum_topics for each row execute function public.set_updated_at();
