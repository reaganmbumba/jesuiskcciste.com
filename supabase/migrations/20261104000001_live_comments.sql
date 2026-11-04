-- =====================================================================
-- Commentaires du direct (page /direct), affichés sur la vidéo comme sur
-- TikTok et repris par le studio dans l'image diffusée.
--
-- Ouvert à tous, sans compte : il suffit d'indiquer son nom. Un seul
-- espace de direct : live_key = 'direct'. La modération (permission
-- « moderation ») masque ou supprime un commentaire.
-- Garde-fous : longueur bornée, 60 commentaires par minute au plus,
-- 1 commentaire toutes les 3 secondes par nom, pas de doublon immédiat.
-- =====================================================================

create table if not exists public.live_comments (
  id uuid primary key default gen_random_uuid(),
  live_key text not null default 'direct' check (live_key ~ '^[a-z0-9-]{1,80}$'),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null check (char_length(trim(author_name)) between 2 and 40),
  body text not null check (char_length(trim(body)) between 1 and 300),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists live_comments_key_idx on public.live_comments(live_key, created_at desc);

alter table public.live_comments enable row level security;
alter table public.live_comments force row level security;

drop policy if exists "lecture publique" on public.live_comments;
create policy "lecture publique" on public.live_comments for select using (not is_hidden or public.has_permission('moderation'));
drop policy if exists "commenter" on public.live_comments;
create policy "commenter" on public.live_comments for insert to anon, authenticated with check (not is_hidden);
drop policy if exists "modération maj" on public.live_comments;
create policy "modération maj" on public.live_comments for update using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
drop policy if exists "modération suppression" on public.live_comments;
create policy "modération suppression" on public.live_comments for delete using (public.has_permission('moderation'));
grant select, insert on public.live_comments to anon, authenticated;
grant update, delete on public.live_comments to authenticated;

create or replace function public.live_comment_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  new.is_hidden := false;
  new.author_id := auth.uid();
  new.author_name := trim(new.author_name);
  new.body := trim(new.body);
  if (select count(*) from live_comments where live_key = new.live_key and created_at > now() - interval '1 minute') >= 60 then
    raise exception 'Trop de commentaires en ce moment, réessayez dans quelques secondes';
  end if;
  if exists (select 1 from live_comments where live_key = new.live_key and lower(author_name) = lower(new.author_name)
             and (created_at > now() - interval '3 seconds' or (body = new.body and created_at > now() - interval '2 minutes'))) then
    raise exception 'Patientez un instant avant de commenter à nouveau';
  end if;
  return new;
end $$;
drop trigger if exists live_comments_before_insert on public.live_comments;
create trigger live_comments_before_insert before insert on public.live_comments for each row execute function public.live_comment_before_insert();

-- Les nouveaux commentaires arrivent en direct chez les spectateurs (Supabase Realtime).
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_comments') then
    alter publication supabase_realtime add table public.live_comments;
  end if;
end $$;
