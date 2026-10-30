-- =====================================================================
-- Débats audio : commentaires en vocal, en fichier audio ou en texte.
--
-- Les sujets sont publiés dans le code (src/content/debats.ts) ; un sujet
-- est donc désigné par son identifiant texte, sans clé étrangère.
--
-- Ouvert à tous, sans compte : il suffit d'indiquer son nom. La modération
-- (permission « moderation ») masque ou supprime commentaires et audios.
-- Garde-fous : taille et format des audios limités par le bucket, chemin
-- d'audio imposé, débit limité par sujet, longueur du texte bornée.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('debate-audio', 'debate-audio', true, 10485760,
   array['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/aac','audio/wav','audio/x-wav','audio/x-m4a','audio/m4a','audio/3gpp','audio/amr','video/webm','video/mp4'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "debate-audio lecture" on storage.objects;
create policy "debate-audio lecture" on storage.objects for select using (bucket_id = 'debate-audio');
-- Tout visiteur dépose un audio, uniquement sous <sujet>/<uuid>.<ext> ; jamais de remplacement.
drop policy if exists "debate-audio dépôt" on storage.objects;
create policy "debate-audio dépôt" on storage.objects for insert to anon, authenticated with check (
  bucket_id = 'debate-audio'
  and name ~ '^[a-z0-9-]{1,80}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webm|ogg|m4a|mp4|mp3|aac|wav|3gp|amr)$');
drop policy if exists "debate-audio modération" on storage.objects;
create policy "debate-audio modération" on storage.objects for delete using (bucket_id = 'debate-audio' and public.has_permission('moderation'));

create table if not exists public.debate_comments (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null check (topic_id ~ '^[a-z0-9-]{1,80}$'),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null check (char_length(trim(author_name)) between 2 and 80),
  body text check (body is null or char_length(trim(body)) between 1 and 2000),
  audio_path text check (audio_path is null or audio_path ~ '^[a-z0-9-]{1,80}/[0-9a-f-]{36}\.(webm|ogg|m4a|mp4|mp3|aac|wav|3gp|amr)$'),
  audio_seconds int check (audio_seconds is null or audio_seconds between 0 and 900),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  constraint debate_comment_content check (body is not null or audio_path is not null)
);
create index if not exists debate_comments_topic_idx on public.debate_comments(topic_id, created_at);

alter table public.debate_comments enable row level security;
alter table public.debate_comments force row level security;

drop policy if exists "lecture publique" on public.debate_comments;
create policy "lecture publique" on public.debate_comments for select using (not is_hidden or public.has_permission('moderation'));
drop policy if exists "commenter" on public.debate_comments;
create policy "commenter" on public.debate_comments for insert to anon, authenticated with check (not is_hidden);
drop policy if exists "modération maj" on public.debate_comments;
create policy "modération maj" on public.debate_comments for update using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
drop policy if exists "modération suppression" on public.debate_comments;
create policy "modération suppression" on public.debate_comments for delete using (public.has_permission('moderation'));
grant select, insert on public.debate_comments to anon, authenticated;
grant update, delete on public.debate_comments to authenticated;

-- Valeurs fixées par la base : date, auteur connecté éventuel, audio rattaché au bon sujet,
-- et limite de 40 commentaires par minute et par sujet contre les envois en rafale.
create or replace function public.debate_comment_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  new.is_hidden := false;
  new.author_id := auth.uid();
  new.author_name := trim(new.author_name);
  new.body := nullif(trim(coalesce(new.body, '')), '');
  if new.audio_path is not null and split_part(new.audio_path, '/', 1) <> new.topic_id then
    raise exception 'Audio non rattaché à ce sujet';
  end if;
  if (select count(*) from debate_comments where topic_id = new.topic_id and created_at > now() - interval '1 minute') >= 40 then
    raise exception 'Trop de commentaires en peu de temps, réessayez dans une minute';
  end if;
  return new;
end $$;
drop trigger if exists debate_comments_before_insert on public.debate_comments;
create trigger debate_comments_before_insert before insert on public.debate_comments for each row execute function public.debate_comment_before_insert();
