-- =====================================================================
-- Commentaires et « J'aime » sous chaque actualité.
--
-- Un article est désigné par son identifiant tel qu'affiché sur le site
-- (identifiant de la table `announcements` ou article publié dans le code,
-- « edito-ann-… ») : la colonne est donc du texte, sans clé étrangère.
--
-- Comme au forum : seuls les membres validés commentent, le nom et la
-- paroisse sont recopiés du profil par la base, la modération masque ou
-- supprime. Tout compte connecté peut mettre « J'aime » ; le public ne voit
-- que le total, jamais qui a aimé.
-- =====================================================================

create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_id text not null check (char_length(article_id) between 1 and 200),
  author_id uuid references public.profiles(id) on delete set null default auth.uid(),
  author_name text not null default '',
  parish_name text,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists article_comments_article_idx on public.article_comments(article_id, created_at);

create table if not exists public.article_likes (
  article_id text not null check (char_length(article_id) between 1 and 200),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (article_id, user_id)
);

alter table public.article_comments enable row level security;
alter table public.article_comments force row level security;
alter table public.article_likes enable row level security;
alter table public.article_likes force row level security;

-- Commentaires : lecture publique des commentaires visibles.
drop policy if exists "lecture publique" on public.article_comments;
create policy "lecture publique" on public.article_comments for select using (not is_hidden or public.has_permission('moderation'));
-- Un membre validé commente en son nom.
drop policy if exists "commenter" on public.article_comments;
create policy "commenter" on public.article_comments for insert with check (
  public.is_active_member() and author_id = auth.uid() and not is_hidden);
-- Un membre peut retirer son propre commentaire ; la modération retire tout.
drop policy if exists "supprimer" on public.article_comments;
create policy "supprimer" on public.article_comments for delete using (author_id = auth.uid() or public.has_permission('moderation'));
drop policy if exists "modération" on public.article_comments;
create policy "modération" on public.article_comments for update using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
grant select on public.article_comments to anon, authenticated;
grant insert, update, delete on public.article_comments to authenticated;

-- Le nom et la paroisse viennent du profil de l'auteur connecté, jamais du navigateur.
create or replace function public.article_comment_fill_author() returns trigger
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
drop trigger if exists article_comments_author on public.article_comments;
create trigger article_comments_author before insert on public.article_comments for each row execute function public.article_comment_fill_author();

-- « J'aime » : chacun ne voit et ne gère que les siens.
drop policy if exists "les miens" on public.article_likes;
create policy "les miens" on public.article_likes for select using (user_id = auth.uid());
drop policy if exists "aimer" on public.article_likes;
create policy "aimer" on public.article_likes for insert with check (auth.uid() is not null and user_id = auth.uid());
drop policy if exists "ne plus aimer" on public.article_likes;
create policy "ne plus aimer" on public.article_likes for delete using (user_id = auth.uid());
grant select, insert, delete on public.article_likes to authenticated;

-- Total des « J'aime » d'un article (public) et si la personne connectée a aimé.
create or replace function public.article_like_summary(p_article_id text)
returns table (likes int, liked boolean)
language sql stable security definer set search_path = public as $$
  select count(*)::int, coalesce(bool_or(user_id = auth.uid()), false)
  from article_likes where article_id = p_article_id;
$$;
grant execute on function public.article_like_summary(text) to anon, authenticated;
