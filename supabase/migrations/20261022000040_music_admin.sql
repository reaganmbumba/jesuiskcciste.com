-- =====================================================================
-- Musique gérée depuis l'administration : les chants envoyés depuis la
-- page « Musique » vont dans le bucket PUBLIC `chants` (lecteur du site).
-- 50 Mo par fichier : la limite du forfait gratuit de Supabase.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('chants', 'chants', true, 52428800, array['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/webm'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chants lecture" on storage.objects;
create policy "chants lecture" on storage.objects for select using (bucket_id = 'chants');
drop policy if exists "chants administration" on storage.objects;
create policy "chants administration" on storage.objects for all
  using (bucket_id = 'chants' and (public.has_permission('music.manage') or public.is_central_admin()))
  with check (bucket_id = 'chants' and (public.has_permission('music.manage') or public.is_central_admin()));
