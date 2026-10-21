-- =====================================================================
-- JE SUIS KCCiste — Données de référence (rôles et permissions).
-- Aucune personne, paroisse, statistique ou communication officielle
-- n'est créée ici : ces données sont saisies par l'administration.
-- =====================================================================
insert into public.roles (key, label) values
  ('central_admin', 'Administrateur central'), ('parish_leader', 'Responsable de paroisse'), ('section_leader', 'Chef de section'),
  ('trainer', 'Formateur'), ('music_manager', 'Responsable musical'), ('solidarity_manager', 'Gestionnaire de solidarité'),
  ('moderator', 'Modérateur'), ('member', 'Membre'), ('visitor', 'Visiteur')
on conflict (key) do nothing;

insert into public.permissions (key, label) values
  ('admin.access','Accès à l’administration'), ('members.read_private','Lire les données privées des membres (périmètre)'), ('members.manage','Gérer les membres'),
  ('parishes.manage','Gérer les paroisses'), ('sections.manage','Gérer les sections'), ('announcements.create','Créer des annonces'),
  ('announcements.moderate','Modérer et publier les annonces'), ('events.manage','Gérer les événements'), ('courses.manage','Gérer toutes les formations'),
  ('courses.manage_own','Gérer ses formations'), ('exams.manage','Gérer les examens'), ('certificates.manage','Gérer les certificats'),
  ('music.manage','Gérer KCC Music'), ('projects.manage','Gérer les projets'), ('contributions.read','Consulter les contributions'),
  ('contributions.manage','Vérifier les contributions'), ('expenses.manage','Gérer les dépenses'), ('moderation','Modération'),
  ('settings.manage','Paramètres de la plateforme'), ('audit.read','Lire les journaux d’audit')
on conflict (key) do nothing;

-- Matrice identique à src/lib/permissions.ts
with m(role, perm) as (values
  ('central_admin','admin.access'),('central_admin','members.read_private'),('central_admin','members.manage'),('central_admin','parishes.manage'),
  ('central_admin','sections.manage'),('central_admin','announcements.create'),('central_admin','announcements.moderate'),('central_admin','events.manage'),
  ('central_admin','courses.manage'),('central_admin','exams.manage'),('central_admin','certificates.manage'),('central_admin','music.manage'),
  ('central_admin','projects.manage'),('central_admin','contributions.read'),('central_admin','contributions.manage'),('central_admin','expenses.manage'),
  ('central_admin','moderation'),('central_admin','settings.manage'),('central_admin','audit.read'),
  ('parish_leader','admin.access'),('parish_leader','members.read_private'),('parish_leader','sections.manage'),('parish_leader','announcements.create'),('parish_leader','events.manage'),
  ('section_leader','admin.access'),('section_leader','announcements.create'),('section_leader','events.manage'),
  ('trainer','admin.access'),('trainer','courses.manage_own'),
  ('music_manager','admin.access'),('music_manager','music.manage'),
  ('solidarity_manager','admin.access'),('solidarity_manager','projects.manage'),('solidarity_manager','contributions.read'),('solidarity_manager','contributions.manage'),('solidarity_manager','expenses.manage'),
  ('moderator','admin.access'),('moderator','announcements.moderate'),('moderator','moderation'))
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from m join public.roles r on r.key = m.role join public.permissions p on p.key = m.perm
on conflict do nothing;

insert into public.organizational_units (name, level) values ('Administration centrale', 'Administration centrale') on conflict do nothing;

insert into public.site_settings (key, value) values ('public', jsonb_build_object(
  'name', 'JE SUIS KCCiste', 'tagline', 'Un seul peuple. Une même communauté.',
  'secondary_message', 'Se connecter, apprendre, servir et faire vivre notre communauté partout dans le monde.',
  'official_logo_url', '/images/logo-kcc.svg', 'hero_image_url', '/images/hero-communaute.jpg',
  'contact', jsonb_build_object('email', 'jesuiskcciste@gmail.com', 'phone', '+243 840 238 592', 'address', 'Muanda, Kongo-Central, RD Congo'), 'socials', '[]'::jsonb, 'church_presentation', ''))
on conflict (key) do nothing;

-- Premier administrateur central : après avoir créé votre compte via le site,
-- exécutez dans l'éditeur SQL (en remplaçant l'adresse) :
--   update public.profiles set status = 'active' where email = 'admin@exemple.org';
--   insert into public.role_assignments (user_id, role_id)
--   select p.id, r.id from public.profiles p, public.roles r where p.email = 'admin@exemple.org' and r.key = 'central_admin';
