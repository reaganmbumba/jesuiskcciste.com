-- =====================================================================
-- Challenges des chansons du label « Je suis KCCiste ».
--
-- Les challenges sont publiés dans le code (src/content/challenges.ts) ;
-- un challenge est donc désigné par son identifiant texte, sans clé étrangère.
-- Les vidéos mises en avant par l'administration (ex. une vidéo TikTok déjà
-- connue) sont aussi dans le code, avec un identifiant texte.
--
-- Participer : ouvert à tous, sans compte. On indique son nom et on envoie
-- sa vidéo (fichier du téléphone) ou le lien de sa vidéo TikTok.
-- Voter : une voix par téléphone et par challenge (clé aléatoire gardée
-- dans le téléphone). Seuls les totaux sont lisibles, jamais les clés.
-- La modération (permission « moderation ») masque ou supprime.
-- =====================================================================

-- 50 Mo : limite d'envoi de l'offre gratuite Supabase.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('challenge-videos', 'challenge-videos', true, 52428800,
   array['video/mp4','video/quicktime','video/webm','video/3gpp','video/x-m4v'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "challenge-videos lecture" on storage.objects;
create policy "challenge-videos lecture" on storage.objects for select using (bucket_id = 'challenge-videos');
-- Tout visiteur dépose une vidéo, uniquement sous <challenge>/<uuid>.<ext> ; jamais de remplacement.
drop policy if exists "challenge-videos dépôt" on storage.objects;
create policy "challenge-videos dépôt" on storage.objects for insert to anon, authenticated with check (
  bucket_id = 'challenge-videos'
  and name ~ '^[a-z0-9-]{1,80}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|mov|webm|3gp|m4v)$');
drop policy if exists "challenge-videos modération" on storage.objects;
create policy "challenge-videos modération" on storage.objects for delete using (bucket_id = 'challenge-videos' and public.has_permission('moderation'));

create table if not exists public.challenge_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null check (challenge_id ~ '^[a-z0-9-]{1,80}$'),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null check (char_length(trim(author_name)) between 2 and 80),
  place text check (place is null or char_length(trim(place)) between 1 and 80),
  note text check (note is null or char_length(trim(note)) between 1 and 500),
  video_path text check (video_path is null or video_path ~ '^[a-z0-9-]{1,80}/[0-9a-f-]{36}\.(mp4|mov|webm|3gp|m4v)$'),
  tiktok_url text check (tiktok_url is null or tiktok_url ~ '^https://([a-z]+\.)?tiktok\.com/[A-Za-z0-9@._/?=&%-]{1,300}$'),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  constraint challenge_entry_media check (video_path is not null or tiktok_url is not null)
);
create index if not exists challenge_entries_challenge_idx on public.challenge_entries(challenge_id, created_at);

alter table public.challenge_entries enable row level security;
alter table public.challenge_entries force row level security;

drop policy if exists "lecture publique" on public.challenge_entries;
create policy "lecture publique" on public.challenge_entries for select using (not is_hidden or public.has_permission('moderation'));
drop policy if exists "participer" on public.challenge_entries;
create policy "participer" on public.challenge_entries for insert to anon, authenticated with check (not is_hidden);
drop policy if exists "modération maj" on public.challenge_entries;
create policy "modération maj" on public.challenge_entries for update using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
drop policy if exists "modération suppression" on public.challenge_entries;
create policy "modération suppression" on public.challenge_entries for delete using (public.has_permission('moderation'));
grant select, insert on public.challenge_entries to anon, authenticated;
grant update, delete on public.challenge_entries to authenticated;

create or replace function public.challenge_entry_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  new.is_hidden := false;
  new.author_id := auth.uid();
  new.author_name := trim(new.author_name);
  new.place := nullif(trim(coalesce(new.place, '')), '');
  new.note := nullif(trim(coalesce(new.note, '')), '');
  if new.video_path is not null and split_part(new.video_path, '/', 1) <> new.challenge_id then
    raise exception 'Vidéo non rattachée à ce challenge';
  end if;
  if (select count(*) from challenge_entries where challenge_id = new.challenge_id and created_at > now() - interval '1 minute') >= 20 then
    raise exception 'Trop de participations en peu de temps, réessayez dans une minute';
  end if;
  return new;
end $$;
drop trigger if exists challenge_entries_before_insert on public.challenge_entries;
create trigger challenge_entries_before_insert before insert on public.challenge_entries for each row execute function public.challenge_entry_before_insert();

-- Votes : entry_key = id d'une participation (uuid) ou identifiant d'une vidéo mise en avant dans le code.
create table if not exists public.challenge_votes (
  id bigint generated always as identity primary key,
  challenge_id text not null check (challenge_id ~ '^[a-z0-9-]{1,80}$'),
  entry_key text not null check (entry_key ~ '^[a-z0-9-]{1,80}$'),
  voter_key uuid not null,
  created_at timestamptz not null default now(),
  unique (challenge_id, voter_key)
);
alter table public.challenge_votes enable row level security;
alter table public.challenge_votes force row level security;
drop policy if exists "voter" on public.challenge_votes;
create policy "voter" on public.challenge_votes for insert to anon, authenticated with check (true);
drop policy if exists "modération" on public.challenge_votes;
create policy "modération" on public.challenge_votes for all using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
grant insert on public.challenge_votes to anon, authenticated;
grant select, delete on public.challenge_votes to authenticated;

create or replace function public.challenge_vote_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  if (select count(*) from challenge_votes where challenge_id = new.challenge_id and created_at > now() - interval '1 minute') >= 300 then
    raise exception 'Trop de votes en peu de temps, réessayez dans une minute';
  end if;
  return new;
end $$;
drop trigger if exists challenge_votes_before_insert on public.challenge_votes;
create trigger challenge_votes_before_insert before insert on public.challenge_votes for each row execute function public.challenge_vote_before_insert();

-- Totaux publics, sans les clés des votants.
create or replace function public.challenge_vote_counts(p_challenge text)
returns table (entry_key text, votes bigint)
language sql stable security definer set search_path = public as $$
  select entry_key, count(*) from challenge_votes where challenge_id = p_challenge group by entry_key;
$$;
grant execute on function public.challenge_vote_counts(text) to anon, authenticated;
