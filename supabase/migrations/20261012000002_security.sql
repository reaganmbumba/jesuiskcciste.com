-- =====================================================================
-- KCC CONNECT — Sécurité : fonctions d'autorisation, RLS, vues, RPC, audit.
-- Principe : le navigateur n'utilise que la clé « anon » ; TOUTES les
-- autorisations sont vérifiées ici. Masquer un bouton ne protège rien.
-- =====================================================================

-- ---------- Fonctions d'autorisation (SECURITY DEFINER, sans récursion RLS) ----------
create or replace function public.is_active_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'active');
$$;

create or replace function public.has_role(p_role text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_active_member() and exists (
    select 1 from role_assignments ra join roles r on r.id = ra.role_id
    where ra.user_id = auth.uid() and r.key = p_role);
$$;

create or replace function public.is_central_admin() returns boolean
language sql stable security definer set search_path = public as $$ select public.has_role('central_admin'); $$;

create or replace function public.has_permission(p_permission text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_active_member() and exists (
    select 1 from role_assignments ra
    join role_permissions rp on rp.role_id = ra.role_id
    join permissions p on p.id = rp.permission_id
    where ra.user_id = auth.uid() and p.key = p_permission);
$$;

create or replace function public.leads_parish(p_parish uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_central_admin() or (public.is_active_member() and exists (
    select 1 from role_assignments ra join roles r on r.id = ra.role_id
    where ra.user_id = auth.uid() and r.key = 'parish_leader' and ra.parish_id = p_parish));
$$;

create or replace function public.leads_section(p_section uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.leads_parish((select parish_id from sections where id = p_section))
      or (public.is_active_member() and exists (
        select 1 from role_assignments ra join roles r on r.id = ra.role_id
        where ra.user_id = auth.uid() and r.key = 'section_leader' and ra.section_id = p_section));
$$;

create or replace function public.trains_course(p_course uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_permission('courses.manage') or (public.is_active_member() and exists (
    select 1 from role_assignments ra join roles r on r.id = ra.role_id
    where ra.user_id = auth.uid() and r.key = 'trainer' and ra.course_id = p_course));
$$;

create or replace function public.can_see_audience(p_audience public.visibility) returns boolean
language sql stable security definer set search_path = public as $$
  select case p_audience
    when 'public' then true
    when 'members' then public.is_active_member()
    when 'leaders' then public.has_permission('admin.access')
    else false end;
$$;

-- ---------- Activation de la RLS sur TOUTES les tables ----------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

-- ---------- Référentiels publics ----------
create policy "lecture publique" on public.organizational_units for select using (true);
create policy "admin central gère" on public.organizational_units for all using (public.is_central_admin()) with check (public.is_central_admin());

create policy "lecture publique" on public.parishes for select using (true);
create policy "admin central gère" on public.parishes for all using (public.is_central_admin()) with check (public.is_central_admin());
create policy "responsable modifie sa paroisse" on public.parishes for update using (public.leads_parish(id)) with check (public.leads_parish(id));

create policy "lecture publique" on public.sections for select using (true);
create policy "responsable de paroisse gère ses sections" on public.sections for all using (public.leads_parish(parish_id)) with check (public.leads_parish(parish_id));

create policy "lecture" on public.roles for select using (true);
create policy "lecture" on public.permissions for select using (true);
create policy "lecture" on public.role_permissions for select using (true);
create policy "admin central gère rôles" on public.roles for all using (public.is_central_admin()) with check (public.is_central_admin());
create policy "admin central gère permissions" on public.role_permissions for all using (public.is_central_admin()) with check (public.is_central_admin());

-- ---------- Profils ----------
-- Un membre lit et modifie son propre profil ; un responsable lit les profils de son périmètre.
create policy "lire son profil" on public.profiles for select using (id = auth.uid());
create policy "responsables lisent leur périmètre" on public.profiles for select using (
  public.is_central_admin() or (parish_id is not null and public.leads_parish(parish_id)) or (section_id is not null and public.leads_section(section_id)));
create policy "modifier son profil" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "responsables modifient leur périmètre" on public.profiles for update
  using (public.is_central_admin() or (parish_id is not null and public.leads_parish(parish_id)))
  with check (public.is_central_admin() or (parish_id is not null and public.leads_parish(parish_id)));
create policy "admin central supprime" on public.profiles for delete using (public.is_central_admin());

-- Les champs administratifs ne peuvent pas être modifiés par le membre lui-même.
-- Volontairement SANS « security definer » : current_user vaut « authenticated »
-- pour une requête directe du navigateur, et le propriétaire pour les fonctions
-- serveur de confiance (ex. request_account_deletion).
create or replace function public.protect_profile_admin_fields() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is null or current_user not in ('authenticated', 'anon') then return new; end if;
  if new.id = auth.uid() and not public.is_central_admin() and not public.leads_parish(old.parish_id) then
    new.status := old.status;
    new.function_title := old.function_title;
    new.email := old.email;
    if new.parish_id is distinct from old.parish_id then new.status := 'pending'; end if; -- changement de paroisse = revalidation
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles for each row execute function public.protect_profile_admin_fields();

create policy "lire ses adhésions" on public.memberships for select using (user_id = auth.uid() or public.leads_parish(parish_id));
create policy "responsables gèrent adhésions" on public.memberships for all using (public.leads_parish(parish_id)) with check (public.leads_parish(parish_id));

create policy "lire ses rôles" on public.role_assignments for select using (user_id = auth.uid() or public.is_central_admin());
create policy "admin central attribue" on public.role_assignments for all using (public.is_central_admin()) with check (public.is_central_admin());

-- ---------- Annuaire : vue respectant la confidentialité ----------
-- La vue est exécutée avec les droits de son propriétaire et ne renvoie que
-- les champs autorisés par chaque membre ; réservée aux membres actifs.
create or replace view public.directory_entries with (security_barrier = true) as
select
  p.id,
  p.first_name, p.last_name,
  p.first_name || ' ' || p.last_name as display_name,
  case when full_access or (p.privacy->>'show_photo')::boolean then p.avatar_url end as avatar_url,
  p.country,
  case when full_access or (p.privacy->>'show_city')::boolean then p.city end as city,
  case when full_access or (p.privacy->>'show_parish')::boolean then pa.name end as parish_name,
  case when full_access or (p.privacy->>'show_parish')::boolean then p.parish_id end as parish_id,
  case when full_access or (p.privacy->>'show_section')::boolean then s.name end as section_name,
  case when full_access or (p.privacy->>'show_section')::boolean then p.section_id end as section_id,
  case when full_access or (p.privacy->>'show_function')::boolean then p.function_title end as function_title,
  case when full_access or (p.privacy->>'show_email')::boolean then p.email::text end as email,
  case when full_access or (p.privacy->>'show_phone')::boolean then p.phone end as phone
from public.profiles p
left join public.parishes pa on pa.id = p.parish_id
left join public.sections s on s.id = p.section_id
cross join lateral (select (public.is_central_admin() or (p.parish_id is not null and public.leads_parish(p.parish_id)) or p.id = auth.uid()) as full_access) fa
where public.is_active_member()
  and (full_access or (p.status = 'active' and coalesce((p.privacy->>'listed_in_directory')::boolean, true)));
revoke all on public.directory_entries from anon;
grant select on public.directory_entries to authenticated;

-- ---------- Annonces ----------
create policy "lecture selon audience" on public.announcements for select using (
  (status = 'published' and public.can_see_audience(audience))
  or public.has_permission('announcements.moderate')
  or author_id = auth.uid()
  or (parish_id is not null and public.leads_parish(parish_id)));
create policy "créer (brouillon ou en attente)" on public.announcements for insert with check (
  public.has_permission('announcements.create') and author_id = auth.uid()
  and (status in ('draft','pending') or public.has_permission('announcements.moderate'))
  and (parish_id is null and public.is_central_admin() or parish_id is null and public.has_permission('announcements.moderate') or parish_id is not null and public.leads_parish(parish_id) or section_id is not null and public.leads_section(section_id)));
create policy "modifier ses annonces non publiées" on public.announcements for update
  using (author_id = auth.uid() and status in ('draft','pending'))
  with check (author_id = auth.uid() and status in ('draft','pending'));
create policy "modération" on public.announcements for update using (public.has_permission('announcements.moderate')) with check (public.has_permission('announcements.moderate'));
create policy "suppression" on public.announcements for delete using (public.has_permission('announcements.moderate') or (author_id = auth.uid() and status = 'draft'));

-- Seul l'administrateur central épingle une annonce.
create or replace function public.guard_announcement_pin() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.pinned and (tg_op = 'INSERT' or not old.pinned) and not public.is_central_admin() then
    raise exception 'Seul l’administrateur central peut épingler une annonce.';
  end if;
  return new;
end $$;
create trigger announcements_pin before insert or update on public.announcements for each row execute function public.guard_announcement_pin();

-- ---------- Événements ----------
create policy "lecture selon audience" on public.events for select using (public.can_see_audience(audience) or (parish_id is not null and public.leads_parish(parish_id)));
create policy "responsables gèrent leurs événements" on public.events for all
  using (public.is_central_admin() or (parish_id is not null and public.leads_parish(parish_id)) or (section_id is not null and public.leads_section(section_id)))
  with check (public.is_central_admin() or (parish_id is not null and public.leads_parish(parish_id)) or (section_id is not null and public.leads_section(section_id)));

create policy "s'inscrire soi-même" on public.event_registrations for insert with check (
  user_id = auth.uid() and public.is_active_member()
  and exists (select 1 from events e where e.id = event_id and e.registration_enabled and e.status = 'scheduled'));
create policy "lire ses inscriptions" on public.event_registrations for select using (
  user_id = auth.uid() or exists (select 1 from events e where e.id = event_id and (public.is_central_admin() or (e.parish_id is not null and public.leads_parish(e.parish_id)))));
create policy "se désinscrire" on public.event_registrations for delete using (user_id = auth.uid());

-- ---------- Académie ----------
create policy "catalogue" on public.courses for select using (status = 'published' or public.trains_course(id));
create policy "formateurs gèrent leurs formations" on public.courses for update using (public.trains_course(id)) with check (public.trains_course(id));
create policy "création/suppression" on public.courses for insert with check (public.has_permission('courses.manage'));
create policy "suppression" on public.courses for delete using (public.has_permission('courses.manage'));
-- Un formateur ne publie pas seul : il soumet (pending).
create or replace function public.guard_course_publish() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.status = 'published' and old.status <> 'published' and not public.has_permission('courses.manage') then
    raise exception 'La publication d’une formation doit être validée par l’administration.';
  end if;
  return new;
end $$;
create trigger courses_publish before update on public.courses for each row execute function public.guard_course_publish();

create policy "lecture modules" on public.course_modules for select using (exists (select 1 from courses c where c.id = course_id and (c.status = 'published' or public.trains_course(c.id))));
create policy "gestion modules" on public.course_modules for all using (public.trains_course(course_id)) with check (public.trains_course(course_id));

-- Le contenu des leçons n'est lisible qu'après inscription (ou par le formateur).
create policy "lecture leçons" on public.lessons for select using (exists (
  select 1 from course_modules m join courses c on c.id = m.course_id
  where m.id = module_id and (public.trains_course(c.id) or exists (select 1 from enrollments e where e.course_id = c.id and e.user_id = auth.uid()))));
create policy "gestion leçons" on public.lessons for all
  using (exists (select 1 from course_modules m where m.id = module_id and public.trains_course(m.course_id)))
  with check (exists (select 1 from course_modules m where m.id = module_id and public.trains_course(m.course_id)));

create policy "ses inscriptions" on public.enrollments for select using (user_id = auth.uid() or public.trains_course(course_id));
create policy "s'inscrire" on public.enrollments for insert with check (
  user_id = auth.uid() and progress = 0 and exists (
    select 1 from courses c where c.id = course_id and c.status = 'published'
      and (c.access = 'open' or (c.access = 'members' and public.is_active_member()))));
-- La progression n'est modifiable que via complete_lesson().

-- Examens : métadonnées lisibles, mais question_options.is_correct jamais exposé aux membres.
create policy "lecture quiz" on public.quizzes for select using (exists (select 1 from courses c where c.id = course_id and (c.status = 'published' or public.trains_course(c.id))));
create policy "gestion quiz" on public.quizzes for all using (public.trains_course(course_id) or public.has_permission('exams.manage')) with check (public.trains_course(course_id) or public.has_permission('exams.manage'));
create policy "formateurs seulement" on public.questions for all
  using (exists (select 1 from quizzes q where q.id = quiz_id and (public.trains_course(q.course_id) or public.has_permission('exams.manage'))))
  with check (exists (select 1 from quizzes q where q.id = quiz_id and (public.trains_course(q.course_id) or public.has_permission('exams.manage'))));
create policy "formateurs seulement" on public.question_options for all
  using (exists (select 1 from questions qu join quizzes q on q.id = qu.quiz_id where qu.id = question_id and (public.trains_course(q.course_id) or public.has_permission('exams.manage'))))
  with check (exists (select 1 from questions qu join quizzes q on q.id = qu.quiz_id where qu.id = question_id and (public.trains_course(q.course_id) or public.has_permission('exams.manage'))));

create policy "ses tentatives" on public.quiz_attempts for select using (user_id = auth.uid() or exists (select 1 from quizzes q where q.id = quiz_id and public.trains_course(q.course_id)));
-- Aucune insertion directe : uniquement via submit_quiz_attempt().

create policy "ses certificats" on public.certificates for select using (user_id = auth.uid() or public.has_permission('certificates.manage'));
create policy "révocation" on public.certificates for update using (public.has_permission('certificates.manage')) with check (public.has_permission('certificates.manage'));
-- Aucune insertion directe : uniquement via submit_quiz_attempt().

-- ---------- Musique et médias ----------
create policy "lecture" on public.artists for select using (true);
create policy "gestion" on public.artists for all using (public.has_permission('music.manage')) with check (public.has_permission('music.manage'));
create policy "lecture" on public.choirs for select using (true);
create policy "gestion" on public.choirs for all using (public.has_permission('music.manage')) with check (public.has_permission('music.manage'));
create policy "lecture" on public.albums for select using (true);
create policy "gestion" on public.albums for all using (public.has_permission('music.manage')) with check (public.has_permission('music.manage'));
create policy "lecture" on public.tracks for select using (true);
create policy "gestion" on public.tracks for all using (public.has_permission('music.manage')) with check (public.has_permission('music.manage'));

create policy "lecture selon audience" on public.media_items for select using (public.can_see_audience(audience) or (parish_id is not null and public.leads_parish(parish_id)));
create policy "gestion" on public.media_items for all using (public.has_permission('music.manage') or public.is_central_admin()) with check (public.has_permission('music.manage') or public.is_central_admin());

-- ---------- Solidarité ----------
create policy "projets publiés" on public.projects for select using (status <> 'draft' or public.has_permission('projects.manage'));
create policy "gestion" on public.projects for all using (public.has_permission('projects.manage')) with check (public.has_permission('projects.manage'));

-- Contributions individuelles : le contributeur et les gestionnaires habilités uniquement.
create policy "ses contributions" on public.contributions for select using (contributor_id = auth.uid() or public.has_permission('contributions.read'));
create policy "déclarer" on public.contributions for insert with check (
  contributor_id = auth.uid() and public.is_active_member() and status = 'declared' and verified_by is null and verified_at is null
  and exists (select 1 from projects p where p.id = project_id and p.status = 'active'));
create policy "rejeter" on public.contributions for update using (public.has_permission('contributions.manage')) with check (public.has_permission('contributions.manage') and status <> 'confirmed');
-- La confirmation passe exclusivement par confirm_contribution() ou le webhook opérateur.

create policy "dépenses publiques des projets publiés" on public.expenses for select using (exists (select 1 from projects p where p.id = project_id and p.status <> 'draft') or public.has_permission('expenses.manage'));
create policy "gestion" on public.expenses for all using (public.has_permission('expenses.manage')) with check (public.has_permission('expenses.manage'));

-- Montants agrégés recalculés à chaque changement de contribution.
create or replace function public.refresh_project_amounts() returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.project_id, old.project_id);
begin
  update projects set
    confirmed_amount = coalesce((select sum(amount) from contributions where project_id = pid and status = 'confirmed'), 0),
    declared_amount  = coalesce((select sum(amount) from contributions where project_id = pid and status in ('declared','pending_verification','confirmed')), 0)
  where id = pid;
  return null;
end $$;
create trigger contributions_amounts after insert or update or delete on public.contributions for each row execute function public.refresh_project_amounts();

create or replace function public.guard_project_amounts() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then new.confirmed_amount := 0; new.declared_amount := 0;
  elsif pg_trigger_depth() = 1 then new.confirmed_amount := old.confirmed_amount; new.declared_amount := old.declared_amount; end if;
  return new;
end $$;
create trigger projects_amounts before insert or update on public.projects for each row execute function public.guard_project_amounts();

-- ---------- Notifications ----------
create policy "ses notifications" on public.notifications for select using (user_id = auth.uid());
create policy "marquer comme lue" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ses préférences" on public.notification_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Paramètres et audit ----------
create policy "lecture publique" on public.site_settings for select using (key = 'public' or public.is_central_admin());
create policy "admin central" on public.site_settings for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
create policy "lecture admin" on public.audit_logs for select using (public.has_permission('audit.read'));
-- Aucune écriture directe : uniquement via le trigger log_change().

-- ---------- Journal d'audit automatique ----------
create or replace function public.log_change() returns trigger language plpgsql security definer set search_path = public as $$
declare actor_name text;
begin
  select first_name || ' ' || last_name into actor_name from profiles where id = auth.uid();
  insert into audit_logs(actor_id, actor, action, entity, entity_id, details)
  values (auth.uid(), coalesce(actor_name, 'système'), lower(tg_table_name) || '.' || lower(tg_op), tg_table_name,
          case when tg_op = 'DELETE' then old.id else new.id end,
          case when tg_op = 'UPDATE' then jsonb_build_object('before', to_jsonb(old) - 'privacy', 'after', to_jsonb(new) - 'privacy') else null end);
  return coalesce(new, old);
end $$;
do $$
declare t text;
begin
  foreach t in array array['profiles','role_assignments','parishes','sections','announcements','events','courses','quizzes','questions','question_options','certificates','tracks','media_items','projects','contributions','expenses','site_settings'] loop
    if t = 'site_settings' then continue; end if;
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.log_change()', t, t);
  end loop;
end $$;

-- ---------- Création automatique du profil à l'inscription ----------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into profiles (id, first_name, last_name, middle_name, email, phone, country, city, parish_id, section_id, consent_at, status)
  values (new.id,
          left(coalesce(nullif(m->>'first_name',''), 'Membre'), 60), left(coalesce(nullif(m->>'last_name',''), ''), 60), nullif(m->>'middle_name',''),
          new.email, nullif(m->>'phone',''), coalesce(m->>'country',''), coalesce(m->>'city',''),
          (select id from parishes where id = nullif(m->>'parish_id','')::uuid),
          (select id from sections where id = nullif(m->>'section_id','')::uuid and parish_id = nullif(m->>'parish_id','')::uuid),
          nullif(m->>'consent_at','')::timestamptz, 'pending');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- RPC ----------
-- Statistiques réelles (aucune valeur codée en dur).
create or replace function public.community_stats() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'countries', (select count(distinct country) from parishes),
    'parishes',  (select count(*) from parishes),
    'members',   (select count(*) from profiles where status = 'active'),
    'courses',   (select count(*) from courses where status = 'published'),
    'events',    (select count(*) from events where status = 'scheduled' and starts_at >= now()));
$$;
grant execute on function public.community_stats() to anon, authenticated;

-- Examen SANS les bonnes réponses.
create or replace function public.get_quiz_public(p_quiz_id uuid) returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', q.id, 'course_id', q.course_id, 'title', q.title, 'passing_score', q.passing_score,
    'max_attempts', q.max_attempts, 'time_limit_minutes', q.time_limit_minutes,
    'questions', coalesce((select jsonb_agg(jsonb_build_object('id', qu.id, 'prompt', qu.prompt,
        'options', (select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label) order by o.position) from question_options o where o.question_id = qu.id))
      order by qu.position) from questions qu where qu.quiz_id = q.id), '[]'::jsonb))
  from quizzes q join courses c on c.id = q.course_id
  where q.id = p_quiz_id and c.status = 'published' and public.is_active_member()
    and exists (select 1 from enrollments e where e.course_id = c.id and e.user_id = auth.uid());
$$;
grant execute on function public.get_quiz_public(uuid) to authenticated;

create or replace function public.gen_certificate_code() returns text language plpgsql as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; i int;
begin
  loop
    c := 'KCC-' || to_char(now(), 'YYYY') || '-';
    for i in 1..8 loop
      c := c || substr(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1);
      if i = 4 then c := c || '-'; end if;
    end loop;
    exit when not exists (select 1 from certificates where code = c);
  end loop;
  return c;
end $$;

-- Correction côté serveur + émission du certificat si les critères sont remplis.
create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  q quizzes; uid uuid := auth.uid(); v_prev int; v_total int; v_correct int; v_score int; v_passed boolean;
  v_attempt_id uuid; v_cert_code text; v_corrections jsonb; enr enrollments; v_holder text;
begin
  if uid is null or not public.is_active_member() then raise exception 'Compte actif requis.'; end if;
  select * into q from quizzes where id = p_quiz_id;
  if not found then raise exception 'Examen introuvable.'; end if;
  select * into enr from enrollments where course_id = q.course_id and user_id = uid;
  if not found then raise exception 'Inscription à la formation requise.'; end if;
  if q.requires_all_lessons and enr.progress < 100 then raise exception 'Toutes les leçons doivent être terminées.'; end if;
  if exists (select 1 from quiz_attempts where quiz_id = q.id and user_id = uid and passed) then raise exception 'Examen déjà réussi.'; end if;
  select count(*) into v_prev from quiz_attempts where quiz_id = q.id and user_id = uid;
  if q.max_attempts > 0 and v_prev >= q.max_attempts then raise exception 'Nombre maximal de tentatives atteint.'; end if;

  select count(*) into v_total from questions where quiz_id = q.id;
  select coalesce(jsonb_agg(jsonb_build_object(
           'question_id', qu.id, 'selected_option_id', p_answers->>qu.id::text, 'correct_option_id', o.id,
           'is_correct', (p_answers->>qu.id::text) = o.id::text, 'explanation', qu.explanation) order by qu.position), '[]'),
         count(*) filter (where (p_answers->>qu.id::text) = o.id::text)
    into v_corrections, v_correct
  from questions qu join question_options o on o.question_id = qu.id and o.is_correct
  where qu.quiz_id = q.id;

  v_score := case when v_total = 0 then 0 else round(v_correct * 100.0 / v_total) end;
  v_passed := v_score >= q.passing_score;
  insert into quiz_attempts(quiz_id, user_id, answers, score, correct_count, total, passed, attempt_number)
  values (q.id, uid, p_answers, v_score, v_correct, v_total, v_passed, v_prev + 1) returning id into v_attempt_id;

  if v_passed then
    select first_name || ' ' || last_name into v_holder from profiles where id = uid;
    v_cert_code := public.gen_certificate_code();
    insert into certificates(code, course_id, user_id, attempt_id, holder_name, score) values (v_cert_code, q.course_id, uid, v_attempt_id, v_holder, v_score);
    update enrollments set completed_at = now() where id = enr.id;
    insert into notifications(user_id, kind, title, body, link) values (uid, 'certificate', 'Certificat disponible', 'Félicitations ! Votre certificat a été émis.', '/espace/certificats');
  end if;
  insert into notifications(user_id, kind, title, body, link) values (uid, 'exam_result', 'Résultat d’examen', q.title || ' : ' || v_score || ' %', '/espace/formations');

  return jsonb_build_object('attempt_id', v_attempt_id, 'quiz_id', q.id, 'score', v_score, 'passed', v_passed, 'correct_count', v_correct,
    'total', v_total, 'attempt_number', v_prev + 1, 'submitted_at', now(), 'corrections', v_corrections, 'certificate_code', v_cert_code);
end $$;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;

create or replace function public.complete_lesson(p_lesson_id uuid) returns enrollments language plpgsql security definer set search_path = public as $$
declare cid uuid; v_total int; e enrollments;
begin
  select m.course_id into cid from lessons l join course_modules m on m.id = l.module_id where l.id = p_lesson_id;
  if cid is null then raise exception 'Leçon introuvable.'; end if;
  select count(*) into v_total from lessons l join course_modules m on m.id = l.module_id where m.course_id = cid;
  update enrollments set completed_lesson_ids = (select array_agg(distinct x) from unnest(completed_lesson_ids || p_lesson_id) x)
  where course_id = cid and user_id = auth.uid() returning * into e;
  if not found then raise exception 'Inscription à la formation requise.'; end if;
  update enrollments set progress = least(100, round(cardinality(completed_lesson_ids) * 100.0 / greatest(v_total, 1))) where id = e.id returning * into e;
  return e;
end $$;
grant execute on function public.complete_lesson(uuid) to authenticated;

-- Vérification publique d'authenticité : ne renvoie que les informations du certificat.
create or replace function public.verify_certificate(p_code text) returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', c.id, 'code', c.code, 'course_id', c.course_id, 'course_title', co.title, 'holder_name', c.holder_name,
                            'issued_at', c.issued_at, 'score', c.score, 'revoked', c.revoked)
  from certificates c join courses co on co.id = c.course_id where c.code = upper(trim(p_code));
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;

create or replace function public.revoke_certificate(p_id uuid, p_reason text) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_permission('certificates.manage') then raise exception 'Non autorisé.'; end if;
  update certificates set revoked = true, revoked_reason = p_reason where id = p_id;
end $$;
grant execute on function public.revoke_certificate(uuid, text) to authenticated;

-- Confirmation manuelle d'une contribution (espèces, virement) avec référence obligatoire.
create or replace function public.confirm_contribution(p_contribution_id uuid, p_reference text) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_permission('contributions.manage') then raise exception 'Non autorisé.'; end if;
  if coalesce(length(trim(p_reference)), 0) < 4 then raise exception 'Référence obligatoire.'; end if;
  update contributions set status = 'confirmed', transaction_reference = trim(p_reference), verified_by = auth.uid(), verified_at = now()
  where id = p_contribution_id and status in ('declared', 'pending_verification')
    and provider in ('cash', 'bank');  -- les paiements mobiles sont confirmés uniquement par l'opérateur (webhook)
  if not found then raise exception 'Contribution introuvable, déjà traitée, ou paiement mobile (confirmation opérateur requise).'; end if;
end $$;
grant execute on function public.confirm_contribution(uuid, text) to authenticated;

-- Attribution de rôle : l'admin central attribue tout ; un responsable de paroisse
-- ne peut nommer que des chefs de section de sa propre paroisse.
create or replace function public.assign_role(p_user_id uuid, p_role text, p_parish_id uuid default null, p_section_id uuid default null, p_course_id uuid default null)
returns void language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  select id into rid from roles where key = p_role;
  if rid is null then raise exception 'Rôle inconnu.'; end if;
  if not public.is_central_admin() then
    if not (p_role = 'section_leader' and p_section_id is not null and public.leads_parish((select parish_id from sections where id = p_section_id))) then
      raise exception 'Non autorisé à attribuer ce rôle.';
    end if;
  end if;
  insert into role_assignments(user_id, role_id, parish_id, section_id, course_id, granted_by)
  values (p_user_id, rid, p_parish_id, p_section_id, p_course_id, auth.uid()) on conflict do nothing;
end $$;
grant execute on function public.assign_role(uuid, text, uuid, uuid, uuid) to authenticated;

-- Suppression / anonymisation à la demande du membre.
create or replace function public.request_account_deletion() returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Non authentifié.'; end if;
  update contributions set contributor_label = 'Contributeur anonymisé' where contributor_id = uid;
  update profiles set first_name = 'Compte', last_name = 'supprimé', middle_name = null, avatar_url = null, email = null, phone = null,
    city = '', function_title = null, status = 'deleted', deletion_requested_at = now(),
    privacy = privacy || '{"listed_in_directory": false}'::jsonb
  where id = uid;
  delete from role_assignments where user_id = uid;
  delete from notifications where user_id = uid;
  -- La suppression définitive de auth.users est effectuée par une tâche serveur (service_role).
end $$;
grant execute on function public.request_account_deletion() to authenticated;

-- Les fonctions internes ne sont pas appelables par les visiteurs.
revoke execute on function public.gen_certificate_code() from public, anon, authenticated;
