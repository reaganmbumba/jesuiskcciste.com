-- =====================================================================
-- Messages privés : seuls les deux participants lisent, l'expéditeur est
-- fixé par la base, refus des messages, blocage, comptes en attente.
-- (À exécuter après 10_rls_tests.sql, qui crée les comptes de test.)
-- m1 = …003, m2 = …004 (non listé dans l'annuaire), m3 = …005, admin = …001
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Visiteur sans compte : aucun accès.
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  begin perform public.start_private_conversation('aaaaaaaa-0000-0000-0000-000000000004');
    raise exception 'un visiteur a ouvert une conversation'; exception when insufficient_privilege then null; end;
  begin perform count(*) from public.private_messages;
    raise exception 'un visiteur lit les messages'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- m1 écrit à m2 (même non listé dans l'annuaire) ; l'expéditeur est forcé.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ declare cid uuid; m public.private_messages; begin
  cid := public.start_private_conversation('aaaaaaaa-0000-0000-0000-000000000004');
  assert cid = public.start_private_conversation('aaaaaaaa-0000-0000-0000-000000000004'), 'une seule conversation par paire';
  insert into public.private_messages (conversation_id, body, sender_id, read_at)
    values (cid, '  Bonjour frère  ', 'aaaaaaaa-0000-0000-0000-000000000004', now()) returning * into m;
  assert m.sender_id = 'aaaaaaaa-0000-0000-0000-000000000003', 'expéditeur forcé';
  assert m.read_at is null and m.body = 'Bonjour frère', 'non lu, texte nettoyé';
  begin perform public.start_private_conversation('aaaaaaaa-0000-0000-0000-000000000003');
    raise exception 'conversation avec soi-même'; exception when invalid_parameter_value then null; end;
  begin insert into public.private_conversations (member_a, member_b) values ('aaaaaaaa-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000005');
    raise exception 'conversation créée sans passer par la fonction'; exception when insufficient_privilege then null; end;
  assert (select count(*) from public.search_message_recipients('Deux')) = 1, 'recherche par nom';
  assert (select count(*) from public.search_message_recipients('D')) = 0, 'recherche : 2 lettres minimum';
  assert (select other_name from public.my_private_conversations()) = 'Membre Deux', 'nom de l’interlocuteur';
  assert (select unread_count from public.my_private_conversations()) = 0, 'ses propres messages ne sont pas « non lus »';
end $$;
reset role;

-- m3 ne voit rien de la conversation m1–m2 et ne peut pas y écrire.
do $$ begin perform set_config('test.cid', (select id::text from public.private_conversations limit 1), false); end $$;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
do $$ declare cid uuid := current_setting('test.cid')::uuid; begin
  assert not exists (select 1 from public.private_conversations), 'conversation d’autrui invisible';
  assert (select count(*) from public.private_messages) = 0, 'messages d’autrui invisibles';
  assert (select count(*) from public.my_private_conversations()) = 0, 'boîte vide';
  begin insert into public.private_messages (conversation_id, body) values (cid, 'Intrus');
    raise exception 'un tiers a écrit dans la conversation'; exception when insufficient_privilege then null; end;
  perform public.mark_private_conversation_read(cid);
end $$;
reset role;
do $$ begin assert (select read_at from public.private_messages limit 1) is null, 'un tiers ne marque pas comme lu'; end $$;

-- L'administration n'a pas accès aux messages privés.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin assert (select count(*) from public.private_messages) = 0, 'l’admin ne lit pas les messages privés'; end $$;
reset role;

-- m2 lit, répond, marque comme lu, ne peut pas retirer le message de m1.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000004';
do $$ declare cid uuid; begin
  assert public.unread_private_message_count() = 1, 'un message non lu';
  select id into cid from public.my_private_conversations();
  assert (select other_name from public.my_private_conversations()) = 'Membre Un', 'm2 voit m1';
  perform public.mark_private_conversation_read(cid);
  assert public.unread_private_message_count() = 0, 'lu';
  insert into public.private_messages (conversation_id, body) values (cid, 'Amen, bonjour');
  delete from public.private_messages where sender_id = 'aaaaaaaa-0000-0000-0000-000000000003';
  assert (select count(*) from public.private_messages) = 2, 'message d’autrui conservé';
  begin update public.private_messages set body = 'modifié';
    raise exception 'un message a été modifié'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- m2 bloque m1 : m1 ne peut plus écrire ; débloqué, il le peut de nouveau.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000004';
do $$ begin perform public.set_private_message_block('aaaaaaaa-0000-0000-0000-000000000003', true); end $$;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ declare cid uuid; begin
  select id into cid from public.my_private_conversations();
  assert not (select can_send from public.my_private_conversations()), 'bloqué : envoi impossible';
  begin insert into public.private_messages (conversation_id, body) values (cid, 'Malgré le blocage');
    raise exception 'message envoyé malgré le blocage'; exception when insufficient_privilege then null; end;
  assert (select count(*) from public.search_message_recipients('Deux')) = 0, 'bloqué : absent de la recherche';
  -- m1 retire son propre message.
  delete from public.private_messages where sender_id = auth.uid();
  assert (select count(*) from public.private_messages) = 1, 'message retiré par son auteur';
end $$;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000004';
do $$ begin perform public.set_private_message_block('aaaaaaaa-0000-0000-0000-000000000003', false); end $$;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin assert (select can_send from public.my_private_conversations()), 'débloqué'; end $$;
reset role;

-- m3 refuse les messages privés : personne ne peut ouvrir de conversation avec lui.
update public.profiles set privacy = privacy || '{"accept_messages": false}' where id = 'aaaaaaaa-0000-0000-0000-000000000005';
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  begin perform public.start_private_conversation('aaaaaaaa-0000-0000-0000-000000000005');
    raise exception 'conversation avec un membre qui refuse les messages'; exception when insufficient_privilege then null; end;
  assert (select count(*) from public.search_message_recipients('Trois')) = 0, 'refus : absent de la recherche';
end $$;
reset role;
update public.profiles set privacy = privacy - 'accept_messages' where id = 'aaaaaaaa-0000-0000-0000-000000000005';

-- Compte en attente de validation : n'écrit pas.
update public.profiles set status = 'pending' where id = 'aaaaaaaa-0000-0000-0000-000000000005';
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000005';
do $$ begin
  begin perform public.start_private_conversation('aaaaaaaa-0000-0000-0000-000000000003');
    raise exception 'un compte en attente a ouvert une conversation'; exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000003';
do $$ begin
  begin perform public.start_private_conversation('aaaaaaaa-0000-0000-0000-000000000005');
    raise exception 'conversation avec un compte en attente'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set status = 'active' where id = 'aaaaaaaa-0000-0000-0000-000000000005';

\echo 'Messages privés : tous les tests passent.'
