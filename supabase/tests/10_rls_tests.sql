-- =====================================================================
-- KCC CONNECT — Tests de sécurité (RLS, RPC, confidentialité).
-- Exécution : voir docs/TESTS.md. Chaque ASSERT échoue bruyamment.
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- ---------- Préparation (en super-utilisateur) ----------
insert into public.parishes (id, name, country, city) values
  ('11111111-0000-0000-0000-00000000000a', 'Paroisse test A', 'RD Congo', 'Kinshasa'),
  ('11111111-0000-0000-0000-00000000000b', 'Paroisse test B', 'Belgique', 'Bruxelles');
insert into public.sections (id, parish_id, name) values
  ('22222222-0000-0000-0000-00000000000a', '11111111-0000-0000-0000-00000000000a', 'Section A1'),
  ('22222222-0000-0000-0000-00000000000b', '11111111-0000-0000-0000-00000000000b', 'Section B1');

-- Inscriptions (le trigger handle_new_user crée les profils « pending »).
insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin@test.invalid',  '{"first_name":"Admin","last_name":"Central"}'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'leaderA@test.invalid','{"first_name":"Resp","last_name":"A","parish_id":"11111111-0000-0000-0000-00000000000a"}'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'm1@test.invalid',     '{"first_name":"Membre","last_name":"Un","phone":"+243000","parish_id":"11111111-0000-0000-0000-00000000000a","section_id":"22222222-0000-0000-0000-00000000000a"}'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'm2@test.invalid',     '{"first_name":"Membre","last_name":"Deux","parish_id":"11111111-0000-0000-0000-00000000000b"}'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'm3@test.invalid',     '{"first_name":"Membre","last_name":"Trois","parish_id":"11111111-0000-0000-0000-00000000000b"}'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'trainer@test.invalid','{"first_name":"Form","last_name":"Ateur"}');

do $$ begin assert (select count(*) from public.profiles where status = 'pending') = 6, 'profils créés en attente'; end $$;
update public.profiles set status = 'active';
update public.profiles set privacy = privacy || '{"listed_in_directory": false}' where id = 'aaaaaaaa-0000-0000-0000-000000000004';
insert into public.role_assignments (user_id, role_id) select 'aaaaaaaa-0000-0000-0000-000000000001', id from public.roles where key = 'central_admin';
insert into public.role_assignments (user_id, role_id, parish_id) select 'aaaaaaaa-0000-0000-0000-000000000002', id, '11111111-0000-0000-0000-00000000000a' from public.roles where key = 'parish_leader';

-- Formation + examen (2 questions).
insert into public.courses (id, slug, title, status, access) values ('33333333-0000-0000-0000-000000000001', 'test', 'Formation test', 'published', 'members'),
                                                              ('33333333-0000-0000-0000-000000000002', 'autre', 'Autre formation', 'published', 'members');
insert into public.role_assignments (user_id, role_id, course_id) select 'aaaaaaaa-0000-0000-0000-000000000006', id, '33333333-0000-0000-0000-000000000001' from public.roles where key = 'trainer';
insert into public.course_modules (id, course_id, title) values ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'M1');
insert into public.lessons (id, module_id, title) values ('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'L1');
insert into public.quizzes (id, course_id, title, passing_score, max_attempts) values ('66666666-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'Examen', 50, 2);
insert into public.questions (id, quiz_id, prompt, position) values ('77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Q1', 1), ('77777777-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 'Q2', 2);
insert into public.question_options (id, question_id, label, is_correct) values
  ('88888888-0000-0000-0000-000000000011', '77777777-0000-0000-0000-000000000001', 'bon', true),
  ('88888888-0000-0000-0000-000000000012', '77777777-0000-0000-0000-000000000001', 'faux', false),
  ('88888888-0000-0000-0000-000000000021', '77777777-0000-0000-0000-000000000002', 'bon', true),
  ('88888888-0000-0000-0000-000000000022', '77777777-0000-0000-0000-000000000002', 'faux', false);

insert into public.projects (id, slug, name, goal_amount, status) values ('99999999-0000-0000-0000-000000000001', 'projet-test', 'Projet test', 1000, 'active');
insert into public.announcements (title, status, audience) values ('Annonce publique', 'published', 'public'), ('Annonce membres', 'published', 'members');

-- ---------- Visiteur (anon) ----------
set role anon;
reset request.jwt.claim.sub;
do $$ begin
  assert (select count(*) from public.announcements) = 1, 'visiteur : seule l’annonce publique est visible';
  assert (select count(*) from public.profiles) = 0, 'visiteur : aucun profil';
  assert (select count(*) from public.question_options) = 0, 'visiteur : aucune réponse';
  assert (public.community_stats()->>'members')::int = 6, 'statistiques calculées';
end $$;
do $$ begin
  perform * from public.directory_entries;
  raise exception 'ÉCHEC : le visiteur ne doit pas lire l’annuaire';
exception when insufficient_privilege then null; end $$;
reset role;

-- ---------- Membre m1 ----------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  assert (select count(*) from public.announcements) = 2, 'membre : annonces publiques + membres';
  assert (select count(*) from public.profiles) = 1, 'membre : ne lit que son propre profil';
  assert (select count(*) from public.question_options) = 0, 'membre : bonnes réponses jamais lisibles';
  assert (select count(*) from public.audit_logs) = 0, 'membre : pas d’accès au journal';
  -- Annuaire : m2 a refusé d’apparaître ; le téléphone et l’e-mail d’autrui sont masqués.
  assert not exists (select 1 from public.directory_entries where id = 'aaaaaaaa-0000-0000-0000-000000000004'), 'annuaire : m2 non listé';
  assert (select email from public.directory_entries where id = 'aaaaaaaa-0000-0000-0000-000000000005') is null, 'annuaire : e-mail masqué par défaut';
  assert (select phone from public.directory_entries where id = 'aaaaaaaa-0000-0000-0000-000000000003') = '+243000', 'annuaire : on voit ses propres coordonnées';
end $$;

-- Un membre ne peut pas s’attribuer de fonction ni changer son statut.
update public.profiles set function_title = 'Pasteur', status = 'active', city = 'Goma' where id = auth.uid();
do $$ begin
  assert (select function_title from public.profiles where id = auth.uid()) is null, 'fonction non modifiable par le membre';
  assert (select city from public.profiles where id = auth.uid()) = 'Goma', 'champ personnel modifiable';
end $$;
-- Ni modifier le profil d’un autre.
update public.profiles set city = 'X' where id = 'aaaaaaaa-0000-0000-0000-000000000005';
reset role;
do $$ begin assert (select city from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000005') = '', 'profil d’autrui intact'; end $$;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';

-- Rôles : impossible de s’auto-attribuer administrateur.
do $$ begin
  insert into public.role_assignments (user_id, role_id) select auth.uid(), id from public.roles where key = 'central_admin';
  raise exception 'ÉCHEC : auto-attribution de rôle';
exception when insufficient_privilege then null; end $$;
do $$ begin
  perform public.assign_role(auth.uid(), 'central_admin');
  raise exception 'ÉCHEC : assign_role par un membre';
exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end $$;

-- Examen : inscription, quiz sans réponses, refus avant fin des leçons, correction serveur.
insert into public.enrollments (course_id, user_id) values ('33333333-0000-0000-0000-000000000001', auth.uid());
do $$ declare q jsonb := public.get_quiz_public('66666666-0000-0000-0000-000000000001'); begin
  assert jsonb_array_length(q->'questions') = 2, 'quiz : 2 questions';
  assert position('is_correct' in q::text) = 0, 'quiz : aucune bonne réponse exposée';
end $$;
do $$ begin
  perform public.submit_quiz_attempt('66666666-0000-0000-0000-000000000001', '{}'::jsonb);
  raise exception 'ÉCHEC : examen possible avant la fin des leçons';
exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end $$;
do $$ begin
  update public.enrollments set progress = 100 where user_id = auth.uid();
  assert (select progress from public.enrollments where user_id = auth.uid()) = 0, 'progression non falsifiable';
end $$;
select public.complete_lesson('55555555-0000-0000-0000-000000000001');
do $$ declare r jsonb; begin
  r := public.submit_quiz_attempt('66666666-0000-0000-0000-000000000001', '{"77777777-0000-0000-0000-000000000001":"88888888-0000-0000-0000-000000000012","77777777-0000-0000-0000-000000000002":"88888888-0000-0000-0000-000000000022"}');
  assert (r->>'score')::int = 0 and not (r->>'passed')::boolean, 'tentative 1 : échec à 0 %';
  r := public.submit_quiz_attempt('66666666-0000-0000-0000-000000000001', '{"77777777-0000-0000-0000-000000000001":"88888888-0000-0000-0000-000000000011","77777777-0000-0000-0000-000000000002":"88888888-0000-0000-0000-000000000022"}');
  assert (r->>'score')::int = 50 and (r->>'passed')::boolean, 'tentative 2 : réussite à 50 % (seuil 50)';
  assert r->>'certificate_code' ~ '^KCC-[0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$', 'certificat émis avec code unique';
  assert (select count(*) from public.certificates where user_id = auth.uid()) = 1, 'certificat visible par son titulaire';
end $$;
do $$ begin
  perform public.submit_quiz_attempt('66666666-0000-0000-0000-000000000001', '{}'::jsonb);
  raise exception 'ÉCHEC : nouvelle tentative après réussite';
exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end $$;
do $$ begin
  insert into public.certificates (code, course_id, user_id, holder_name, score) values ('KCC-2026-AAAA-BBBB', '33333333-0000-0000-0000-000000000002', auth.uid(), 'x', 100);
  raise exception 'ÉCHEC : certificat créé manuellement';
exception when insufficient_privilege then null; end $$;

-- Solidarité : déclaration possible, confirmation impossible.
insert into public.contributions (project_id, contributor_id, amount, currency, provider) values ('99999999-0000-0000-0000-000000000001', auth.uid(), 50, 'USD', 'cash');
do $$ begin
  insert into public.contributions (project_id, contributor_id, amount, currency, provider, status, transaction_reference) values ('99999999-0000-0000-0000-000000000001', auth.uid(), 999, 'USD', 'mpesa', 'confirmed', 'FAKE');
  raise exception 'ÉCHEC : contribution confirmée par le membre';
exception when insufficient_privilege then null; end $$;
do $$ begin
  perform public.confirm_contribution((select id from public.contributions limit 1), 'REF-1234');
  raise exception 'ÉCHEC : confirmation par un membre';
exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end $$;
reset role;
do $$ begin assert (select confirmed_amount from public.projects) = 0 and (select declared_amount from public.projects) = 50, 'déclaré ≠ confirmé'; end $$;

-- ---------- Membre m3 : ne voit pas les contributions de m1 ----------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
do $$ begin
  assert (select count(*) from public.contributions) = 0, 'contributions d’autrui invisibles';
  assert (select count(*) from public.certificates) = 0, 'certificats d’autrui invisibles';
  assert (select count(*) from public.enrollments) = 0, 'inscriptions d’autrui invisibles';
end $$;
reset role;

-- ---------- Responsable de la paroisse A ----------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000002';
do $$ begin
  assert exists (select 1 from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000003'), 'responsable A lit les membres de A';
  assert not exists (select 1 from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000005'), 'responsable A ne lit pas les membres de B';
  assert (select phone from public.directory_entries where id = 'aaaaaaaa-0000-0000-0000-000000000003') = '+243000', 'responsable A voit les coordonnées de son périmètre';
end $$;
update public.sections set name = 'Piraté' where parish_id = '11111111-0000-0000-0000-00000000000b';
update public.sections set name = 'Section A1 renommée' where parish_id = '11111111-0000-0000-0000-00000000000a';
reset role;
do $$ begin
  assert (select name from public.sections where id = '22222222-0000-0000-0000-00000000000b') = 'Section B1', 'responsable A ne modifie pas B';
  assert (select name from public.sections where id = '22222222-0000-0000-0000-00000000000a') = 'Section A1 renommée', 'responsable A modifie A';
end $$;

-- ---------- Formateur : uniquement sa formation, pas de publication seule ----------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000006';
update public.courses set title = 'Modifié' where id = '33333333-0000-0000-0000-000000000002';
update public.courses set title = 'Formation test v2' where id = '33333333-0000-0000-0000-000000000001';
do $$ begin
  assert (select count(*) from public.question_options) = 4, 'formateur lit les réponses de son examen';
end $$;
reset role;
do $$ begin
  assert (select title from public.courses where id = '33333333-0000-0000-0000-000000000002') = 'Autre formation', 'formateur ne modifie pas une autre formation';
  assert (select title from public.courses where id = '33333333-0000-0000-0000-000000000001') = 'Formation test v2', 'formateur modifie sa formation';
end $$;

-- ---------- Administrateur central ----------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
select public.confirm_contribution((select id from public.contributions limit 1), 'RECU-0001');
do $$ begin
  assert (select count(*) from public.audit_logs) > 0, 'admin lit le journal d’audit';
  assert exists (select 1 from public.audit_logs where action = 'contributions.update'), 'confirmation journalisée';
end $$;
reset role;
do $$ begin assert (select confirmed_amount from public.projects) = 50, 'montant confirmé recalculé'; end $$;

-- Vérification publique du certificat.
set role anon;
do $$ declare c text; begin
  reset role; select code into c from public.certificates limit 1; set role anon;
  assert (public.verify_certificate(c)->>'holder_name') = 'Membre Un', 'vérification publique du certificat';
  assert public.verify_certificate('KCC-2000-ZZZZ-ZZZZ') is null, 'code inconnu rejeté';
end $$;
reset role;

-- Anonymisation à la demande.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
select public.request_account_deletion();
reset role;
do $$ begin assert (select status from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000005') = 'deleted' and (select email from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000005') is null, 'compte anonymisé'; end $$;

select 'TOUS LES TESTS DE SÉCURITÉ SONT PASSÉS' as resultat;
