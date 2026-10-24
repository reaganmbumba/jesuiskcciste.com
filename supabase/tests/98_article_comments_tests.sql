-- =====================================================================
-- Commentaires et « J'aime » sous les actualités : membres validés,
-- nom + paroisse fixés par la base, modération, total public des J'aime.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Visiteur sans compte : ne commente pas, n'aime pas, voit le total.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  begin insert into public.article_comments (article_id, body) values ('edito-ann-test', 'Anonyme');
    raise exception 'un visiteur a commenté'; exception when insufficient_privilege then null; end;
  begin insert into public.article_likes (article_id) values ('edito-ann-test');
    raise exception 'un visiteur a aimé'; exception when insufficient_privilege or not_null_violation then null; end;
  assert (select likes from public.article_like_summary('edito-ann-test')) = 0, 'aucun J''aime';
end $$;
reset role;

-- Membre validé : commente ; le nom et la paroisse viennent de son profil.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ declare c public.article_comments; begin
  insert into public.article_comments (article_id, body, author_id, author_name, parish_name)
    values ('edito-ann-test', 'Amen', 'aaaaaaaa-0000-0000-0000-000000000004', 'Faux nom', 'Fausse paroisse')
    returning * into c;
  assert c.author_id = 'aaaaaaaa-0000-0000-0000-000000000003', 'auteur forcé';
  assert c.author_name = 'Membre Un', 'nom pris du profil : ' || c.author_name;
  assert c.parish_name = (select name from public.parishes where id = '11111111-0000-0000-0000-00000000000a'), 'paroisse prise du profil';
  update public.article_comments set is_hidden = true;
  insert into public.article_comments (article_id, body) values ('edito-ann-test', 'Message à retirer');
  delete from public.article_comments where body = 'Message à retirer';
  insert into public.article_likes (article_id) values ('edito-ann-test');
  begin insert into public.article_likes (article_id, user_id) values ('edito-ann-test', 'aaaaaaaa-0000-0000-0000-000000000004');
    raise exception 'J''aime au nom d''un autre'; exception when insufficient_privilege then null; end;
  assert (select liked from public.article_like_summary('edito-ann-test')), 'le membre voit qu''il a aimé';
end $$;
reset role;
do $$ begin
  assert not exists (select 1 from public.article_comments where is_hidden), 'un membre ne masque pas';
  assert (select count(*) from public.article_comments) = 1, 'commentaire retiré par son auteur';
end $$;

-- Un autre membre : ne supprime pas le commentaire du premier, ne voit pas qui a aimé.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000004';
do $$ begin
  delete from public.article_comments;
  delete from public.article_likes;
  assert (select count(*) from public.article_likes) = 0, 'J''aime d''autrui invisibles';
  insert into public.article_likes (article_id) values ('edito-ann-test');
  assert (select likes from public.article_like_summary('edito-ann-test')) = 2, 'total des J''aime';
end $$;
reset role;
do $$ begin
  assert (select count(*) from public.article_comments) = 1, 'commentaire d’autrui conservé';
  assert (select count(*) from public.article_likes) = 2, 'J''aime d’autrui conservé';
end $$;

-- Compte en attente de validation : ne commente pas, mais peut aimer.
update public.profiles set status = 'pending' where id = 'aaaaaaaa-0000-0000-0000-000000000005';
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
do $$ begin
  begin insert into public.article_comments (article_id, body) values ('edito-ann-test', 'En attente');
    raise exception 'un compte en attente a commenté'; exception when insufficient_privilege then null; end;
  insert into public.article_likes (article_id) values ('edito-ann-test');
end $$;
reset role;
update public.profiles set status = 'active' where id = 'aaaaaaaa-0000-0000-0000-000000000005';

-- Modération : masque le commentaire ; le public ne le voit plus.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  update public.article_comments set is_hidden = true;
  assert (select count(*) from public.article_comments) = 1, 'la modération voit les masqués';
end $$;
reset role;
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  assert (select count(*) from public.article_comments) = 0, 'commentaire masqué invisible';
  assert (select likes from public.article_like_summary('edito-ann-test')) = 3, 'total public des J''aime';
end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin delete from public.article_comments; end $$;
reset role;
do $$ begin assert (select count(*) from public.article_comments) = 0, 'la modération supprime'; end $$;

\echo 'Commentaires des actualités : tous les tests passent.'
