-- =====================================================================
-- Forum : sujets publiés par la modération, commentaires des membres
-- validés, nom + paroisse fixés par la base, modération.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Administration centrale : publie deux sujets, dont un fermé aux commentaires.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  insert into public.forum_topics (id, title, body) values
    ('99999999-0000-0000-0000-000000000001', 'Premier sujet', 'Parlons-en.'),
    ('99999999-0000-0000-0000-000000000002', 'Sujet fermé', '');
  update public.forum_topics set is_locked = true where id = '99999999-0000-0000-0000-000000000002';
end $$;
reset role;

-- Visiteur sans compte : lit les sujets mais ne commente pas.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.forum_topics) = 2, 'un visiteur voit les sujets';
  begin insert into public.forum_comments (topic_id, body) values ('99999999-0000-0000-0000-000000000001', 'Anonyme');
    raise exception 'un visiteur a commenté'; exception when insufficient_privilege then null; end;
  begin insert into public.forum_topics (title) values ('Intrus');
    raise exception 'un visiteur a créé un sujet'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Membre validé : commente ; le nom et la paroisse viennent de son profil.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ declare c public.forum_comments; begin
  insert into public.forum_comments (topic_id, body, author_id, author_name, parish_name)
    values ('99999999-0000-0000-0000-000000000001', 'Amen', 'aaaaaaaa-0000-0000-0000-000000000004', 'Faux nom', 'Fausse paroisse')
    returning * into c;
  assert c.author_id = 'aaaaaaaa-0000-0000-0000-000000000003', 'auteur forcé';
  assert c.author_name = 'Membre Un', 'nom pris du profil : ' || c.author_name;
  assert c.parish_name = (select name from public.parishes where id = '11111111-0000-0000-0000-00000000000a'), 'paroisse prise du profil';
  begin insert into public.forum_comments (topic_id, body) values ('99999999-0000-0000-0000-000000000002', 'Fermé ?');
    raise exception 'commentaire sur un sujet fermé'; exception when insufficient_privilege then null; end;
  begin insert into public.forum_topics (title) values ('Sujet de membre');
    raise exception 'un membre a créé un sujet'; exception when insufficient_privilege then null; end;
  update public.forum_topics set title = 'Piraté';
  update public.forum_comments set is_hidden = true;
  insert into public.forum_comments (topic_id, body) values ('99999999-0000-0000-0000-000000000001', 'Message à retirer');
  delete from public.forum_comments where body = 'Message à retirer';
end $$;
reset role;
do $$ begin
  assert not exists (select 1 from public.forum_topics where title = 'Piraté'), 'un membre ne modifie pas un sujet';
  assert not exists (select 1 from public.forum_comments where is_hidden), 'un membre ne masque pas';
  assert (select comment_count from public.forum_topics where id = '99999999-0000-0000-0000-000000000001') = 1, 'compteur à jour';
end $$;

-- Un autre membre ne supprime pas le commentaire du premier.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000004';
do $$ begin delete from public.forum_comments; end $$;
reset role;
do $$ begin assert (select count(*) from public.forum_comments) = 1, 'commentaire d’autrui conservé'; end $$;

-- Compte en attente de validation : ne commente pas.
update public.profiles set status = 'pending' where id = 'aaaaaaaa-0000-0000-0000-000000000005';
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
do $$ begin
  begin insert into public.forum_comments (topic_id, body) values ('99999999-0000-0000-0000-000000000001', 'En attente');
    raise exception 'un compte en attente a commenté'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set status = 'active' where id = 'aaaaaaaa-0000-0000-0000-000000000005';

-- Modération : masque le commentaire puis le sujet ; le public ne les voit plus.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  update public.forum_comments set is_hidden = true;
  assert (select comment_count from public.forum_topics where id = '99999999-0000-0000-0000-000000000001') = 0, 'compteur sans les masqués';
  update public.forum_topics set is_hidden = true where id = '99999999-0000-0000-0000-000000000001';
  assert (select count(*) from public.forum_topics) = 2, 'la modération voit les sujets masqués';
end $$;
reset role;
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.forum_topics) = 1, 'sujet masqué invisible';
  assert (select count(*) from public.forum_comments) = 0, 'commentaire masqué invisible';
end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin delete from public.forum_topics where id = '99999999-0000-0000-0000-000000000001'; end $$;
reset role;
do $$ begin assert (select count(*) from public.forum_comments) = 0, 'suppression en cascade'; end $$;

\echo 'Forum : tous les tests passent.'
