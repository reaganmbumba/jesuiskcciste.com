-- =====================================================================
-- Prédications audio : l'administration publie une prédication avec la
-- photo du prédicateur, son titre (rang), sa paroisse, le sujet et le
-- fichier audio. Tout le monde peut écouter les prédications publiées.
--
-- Les fichiers (audio et photos) vont dans le bucket PUBLIC `predications`
-- (50 Mo par fichier : la limite du forfait gratuit de Supabase).
-- =====================================================================

create table if not exists public.audio_sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 2 and 200),       -- sujet de la prédication
  preacher_name text not null check (char_length(trim(preacher_name)) between 2 and 160),
  preacher_title text check (char_length(preacher_title) <= 80),                 -- ex. Révérend Apôtre, Pasteur
  parish text check (char_length(parish) <= 200),
  preacher_photo_url text check (char_length(preacher_photo_url) <= 1000),
  audio_url text check (char_length(audio_url) <= 1000),
  audio_path text check (char_length(audio_path) <= 300),                        -- chemin dans le bucket, pour le remplacer ou le supprimer
  duration_seconds int check (duration_seconds between 0 and 86400),
  bible_text text check (char_length(bible_text) <= 200),                        -- passage lu (facultatif)
  preached_on date,
  description text check (char_length(description) <= 2000),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists audio_sermons_order_idx on public.audio_sermons(published, preached_on desc nulls last, created_at desc);

alter table public.audio_sermons enable row level security;

-- Les visiteurs voient les prédications publiées ; l'administration centrale voit et gère tout.
drop policy if exists "lecture publique" on public.audio_sermons;
create policy "lecture publique" on public.audio_sermons for select using (published or public.has_permission('settings.manage'));
drop policy if exists "gestion" on public.audio_sermons;
create policy "gestion" on public.audio_sermons for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
grant select on public.audio_sermons to anon, authenticated;
grant insert, update, delete on public.audio_sermons to authenticated;

drop trigger if exists audio_sermons_updated on public.audio_sermons;
create trigger audio_sermons_updated before update on public.audio_sermons for each row execute function public.set_updated_at();

-- Stockage : lecture publique (lecteur audio du site), écriture par l'administration.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('predications', 'predications', true, 52428800, array[
    'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/webm',
    'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "predications lecture" on storage.objects;
create policy "predications lecture" on storage.objects for select using (bucket_id = 'predications');
drop policy if exists "predications administration" on storage.objects;
create policy "predications administration" on storage.objects for all
  using (bucket_id = 'predications' and public.has_permission('settings.manage'))
  with check (bucket_id = 'predications' and public.has_permission('settings.manage'));
