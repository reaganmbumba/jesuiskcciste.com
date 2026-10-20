-- =====================================================================
-- KCC CONNECT — Stockage : séparation stricte public / membres / privé.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('public-assets',      'public-assets',      true,  10485760, array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('avatars',            'avatars',            true,  2097152,  array['image/jpeg','image/png','image/webp']),
  ('documents-members',  'documents-members',  false, 52428800, null),
  ('documents-private',  'documents-private',  false, 52428800, null),
  ('course-materials',   'course-materials',   false, 524288000, null),
  ('music',              'music',              false, 104857600, array['audio/mpeg','audio/mp4','audio/aac','audio/wav','video/mp4']),
  ('finance-receipts',   'finance-receipts',   false, 20971520, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

-- Ressources publiques (logo officiel, photo d'accueil) : écriture par l'administration.
create policy "public-assets lecture" on storage.objects for select using (bucket_id = 'public-assets');
create policy "public-assets écriture admin" on storage.objects for all using (bucket_id = 'public-assets' and public.has_permission('settings.manage')) with check (bucket_id = 'public-assets' and public.has_permission('settings.manage'));

-- Avatars : chacun écrit uniquement dans son dossier <uid>/.
create policy "avatars lecture" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars écriture propriétaire" on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars maj propriétaire" on storage.objects for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars suppression propriétaire" on storage.objects for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Documents réservés aux membres actifs (URL signées).
create policy "documents-members lecture" on storage.objects for select using (bucket_id = 'documents-members' and public.is_active_member());
create policy "documents-members écriture" on storage.objects for all using (bucket_id = 'documents-members' and public.has_permission('admin.access')) with check (bucket_id = 'documents-members' and public.has_permission('admin.access'));

-- Documents des responsables : dossier <parish_id>/ ou admin central.
create policy "documents-private lecture" on storage.objects for select using (bucket_id = 'documents-private' and (public.is_central_admin() or public.leads_parish(((storage.foldername(name))[1])::uuid)));
create policy "documents-private écriture" on storage.objects for all using (bucket_id = 'documents-private' and (public.is_central_admin() or public.leads_parish(((storage.foldername(name))[1])::uuid))) with check (bucket_id = 'documents-private' and (public.is_central_admin() or public.leads_parish(((storage.foldername(name))[1])::uuid)));

-- Supports de cours : dossier <course_id>/ ; lecture si inscrit, écriture si formateur.
create policy "course-materials lecture" on storage.objects for select using (bucket_id = 'course-materials' and (public.trains_course(((storage.foldername(name))[1])::uuid) or exists (select 1 from public.enrollments e where e.user_id = auth.uid() and e.course_id = ((storage.foldername(name))[1])::uuid)));
create policy "course-materials écriture" on storage.objects for all using (bucket_id = 'course-materials' and public.trains_course(((storage.foldername(name))[1])::uuid)) with check (bucket_id = 'course-materials' and public.trains_course(((storage.foldername(name))[1])::uuid));

-- Musique : lecture publique uniquement via URL signée générée pour les titres autorisés.
create policy "music écriture" on storage.objects for all using (bucket_id = 'music' and public.has_permission('music.manage')) with check (bucket_id = 'music' and public.has_permission('music.manage'));
create policy "music lecture" on storage.objects for select using (bucket_id = 'music' and exists (select 1 from public.tracks t where t.audio_url = name and t.broadcast_rights = 'authorized'));

-- Justificatifs financiers : gestionnaires uniquement.
create policy "finance-receipts" on storage.objects for all using (bucket_id = 'finance-receipts' and public.has_permission('expenses.manage')) with check (bucket_id = 'finance-receipts' and public.has_permission('expenses.manage'));
