-- =====================================================================
-- Messages privés entre membres : un membre validé écrit à un autre
-- membre validé. Seuls les deux participants lisent la conversation
-- (l'administration n'y a pas accès).
--
-- Le navigateur ne lit jamais la table des profils : le nom et la
-- paroisse de l'interlocuteur sont fournis par des fonctions de la base.
-- Chaque membre peut refuser les messages (Paramètres) ou bloquer un membre.
-- =====================================================================

create table if not exists public.private_conversations (
  id uuid primary key default gen_random_uuid(),
  member_a uuid not null references public.profiles(id) on delete cascade,
  member_b uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  check (member_a < member_b),            -- une seule conversation par paire
  unique (member_a, member_b)
);
create index if not exists private_conversations_b_idx on public.private_conversations(member_b);

create table if not exists public.private_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.private_conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null default auth.uid(),
  body text not null check (char_length(trim(body)) between 1 and 3000),
  read_at timestamptz,                    -- lu par le destinataire
  created_at timestamptz not null default now()
);
create index if not exists private_messages_conv_idx on public.private_messages(conversation_id, created_at);
create index if not exists private_messages_unread_idx on public.private_messages(conversation_id) where read_at is null;

create table if not exists public.private_message_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

alter table public.private_conversations enable row level security;
alter table public.private_conversations force row level security;
alter table public.private_messages enable row level security;
alter table public.private_messages force row level security;
alter table public.private_message_blocks enable row level security;
alter table public.private_message_blocks force row level security;

-- Nom affiché d'un membre (prénom, postnom, nom).
create or replace function public.member_display_name(p_member uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(nullif(trim(both ' ' from concat_ws(' ', p.first_name, p.middle_name, p.last_name)), ''), 'Membre')
  from profiles p where p.id = p_member;
$$;
revoke all on function public.member_display_name(uuid) from public;

-- L'utilisateur connecté peut-il écrire à ce membre ? (comptes validés,
-- messages acceptés, aucun blocage dans un sens ou dans l'autre)
create or replace function public.can_message_member(p_member uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and p_member <> auth.uid() and public.is_active_member()
    and exists (select 1 from profiles p where p.id = p_member and p.status = 'active'
                and coalesce((p.privacy->>'accept_messages')::boolean, true))
    and not exists (select 1 from private_message_blocks b
                    where (b.blocker_id = p_member and b.blocked_id = auth.uid())
                       or (b.blocker_id = auth.uid() and b.blocked_id = p_member));
$$;
grant execute on function public.can_message_member(uuid) to authenticated;

-- L'autre participant d'une conversation de l'utilisateur connecté (null sinon).
create or replace function public.private_conversation_partner(p_conversation uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select case when c.member_a = auth.uid() then c.member_b when c.member_b = auth.uid() then c.member_a end
  from private_conversations c where c.id = p_conversation;
$$;
revoke all on function public.private_conversation_partner(uuid) from public;
grant execute on function public.private_conversation_partner(uuid) to authenticated;

-- Conversations : visibles des deux participants ; créées uniquement par start_private_conversation().
drop policy if exists "participants" on public.private_conversations;
create policy "participants" on public.private_conversations for select using (auth.uid() in (member_a, member_b));
revoke all on public.private_conversations from anon, authenticated;
grant select on public.private_conversations to authenticated;

-- Messages : lus par les participants ; envoyés en son nom si l'écriture est permise.
drop policy if exists "participants" on public.private_messages;
create policy "participants" on public.private_messages for select using (public.private_conversation_partner(conversation_id) is not null);
drop policy if exists "envoyer" on public.private_messages;
create policy "envoyer" on public.private_messages for insert with check (
  sender_id = auth.uid() and public.can_message_member(public.private_conversation_partner(conversation_id)));
-- Un membre peut retirer un message qu'il a envoyé.
drop policy if exists "retirer" on public.private_messages;
create policy "retirer" on public.private_messages for delete using (sender_id = auth.uid());
revoke all on public.private_messages from anon, authenticated;
grant select, insert, delete on public.private_messages to authenticated;
-- La lecture (read_at) passe uniquement par mark_private_conversation_read().

-- Blocages : chacun voit ceux qu'il a bloqués ; modifiés par set_private_message_block().
drop policy if exists "mes blocages" on public.private_message_blocks;
create policy "mes blocages" on public.private_message_blocks for select using (blocker_id = auth.uid());
revoke all on public.private_message_blocks from anon, authenticated;
grant select on public.private_message_blocks to authenticated;

-- L'expéditeur, la date et l'état « non lu » sont fixés par la base.
create or replace function public.private_message_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.sender_id := auth.uid();
  new.created_at := now();
  new.read_at := null;
  new.body := trim(new.body);
  return new;
end $$;
drop trigger if exists private_messages_fill on public.private_messages;
create trigger private_messages_fill before insert on public.private_messages for each row execute function public.private_message_before_insert();

create or replace function public.private_message_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update private_conversations set last_message_at = new.created_at where id = new.conversation_id;
  return null;
end $$;
drop trigger if exists private_messages_touch on public.private_messages;
create trigger private_messages_touch after insert on public.private_messages for each row execute function public.private_message_after_insert();

-- Ouvre (ou retrouve) la conversation avec un membre et renvoie son identifiant.
create or replace function public.start_private_conversation(p_member uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare a uuid; b uuid; cid uuid;
begin
  if auth.uid() is null or not public.is_active_member() then raise exception 'Compte validé requis.' using errcode = '42501'; end if;
  if p_member is null or p_member = auth.uid() then raise exception 'Destinataire invalide.' using errcode = '22023'; end if;
  a := least(auth.uid(), p_member); b := greatest(auth.uid(), p_member);
  select id into cid from private_conversations where member_a = a and member_b = b;
  if cid is not null then return cid; end if;
  if not public.can_message_member(p_member) then
    raise exception 'Ce membre ne reçoit pas de messages privés.' using errcode = '42501';
  end if;
  insert into private_conversations (member_a, member_b) values (a, b)
    on conflict (member_a, member_b) do update set member_a = excluded.member_a
    returning id into cid;
  return cid;
end $$;
revoke all on function public.start_private_conversation(uuid) from public;
grant execute on function public.start_private_conversation(uuid) to authenticated;

-- Boîte de réception : une ligne par conversation, la plus récente d'abord.
create or replace function public.my_private_conversations()
returns table (id uuid, other_id uuid, other_name text, other_parish text, last_message_at timestamptz,
               last_body text, last_sender_id uuid, unread_count int, can_send boolean, blocked_by_me boolean)
language sql stable security definer set search_path = public as $$
  select c.id, o.other_id, public.member_display_name(o.other_id), pa.name, c.last_message_at,
         lm.body, lm.sender_id,
         (select count(*)::int from private_messages m where m.conversation_id = c.id and m.read_at is null and m.sender_id is distinct from auth.uid()),
         public.can_message_member(o.other_id),
         exists (select 1 from private_message_blocks bl where bl.blocker_id = auth.uid() and bl.blocked_id = o.other_id)
  from private_conversations c
  cross join lateral (select case when c.member_a = auth.uid() then c.member_b else c.member_a end as other_id) o
  left join profiles p on p.id = o.other_id
  left join parishes pa on pa.id = p.parish_id
  left join lateral (select m.body, m.sender_id from private_messages m where m.conversation_id = c.id order by m.created_at desc limit 1) lm on true
  where auth.uid() in (c.member_a, c.member_b)
  order by coalesce(c.last_message_at, c.created_at) desc;
$$;
revoke all on function public.my_private_conversations() from public;
grant execute on function public.my_private_conversations() to authenticated;

-- Marque comme lus les messages reçus dans une conversation.
create or replace function public.mark_private_conversation_read(p_conversation uuid) returns void
language sql security definer set search_path = public as $$
  update private_messages set read_at = now()
  where conversation_id = p_conversation and read_at is null and sender_id is distinct from auth.uid()
    and public.private_conversation_partner(p_conversation) is not null;
$$;
revoke all on function public.mark_private_conversation_read(uuid) from public;
grant execute on function public.mark_private_conversation_read(uuid) to authenticated;

-- Nombre de messages non lus (pastille du menu).
create or replace function public.unread_private_message_count() returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from private_messages m join private_conversations c on c.id = m.conversation_id
  where auth.uid() in (c.member_a, c.member_b) and m.read_at is null and m.sender_id is distinct from auth.uid();
$$;
revoke all on function public.unread_private_message_count() from public;
grant execute on function public.unread_private_message_count() to authenticated;

-- Recherche d'un destinataire par nom : membres validés qui acceptent les messages.
create or replace function public.search_message_recipients(p_query text)
returns table (id uuid, display_name text, parish_name text)
language sql stable security definer set search_path = public as $$
  select p.id, public.member_display_name(p.id), pa.name
  from profiles p left join parishes pa on pa.id = p.parish_id
  where public.is_active_member() and char_length(trim(coalesce(p_query, ''))) >= 2
    and p.id <> auth.uid() and p.status = 'active'
    and coalesce((p.privacy->>'accept_messages')::boolean, true)
    and concat_ws(' ', p.first_name, p.middle_name, p.last_name) ilike '%' || replace(replace(trim(p_query), '%', ''), '_', '') || '%'
    and not exists (select 1 from private_message_blocks b where b.blocker_id = p.id and b.blocked_id = auth.uid())
  order by lower(p.last_name), lower(p.first_name)
  limit 20;
$$;
revoke all on function public.search_message_recipients(text) from public;
grant execute on function public.search_message_recipients(text) to authenticated;

-- Bloquer (ou débloquer) un membre : il ne peut plus vous écrire.
create or replace function public.set_private_message_block(p_member uuid, p_blocked boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise.' using errcode = '42501'; end if;
  if p_member is null or p_member = auth.uid() then raise exception 'Membre invalide.' using errcode = '22023'; end if;
  if p_blocked then
    insert into private_message_blocks (blocker_id, blocked_id) values (auth.uid(), p_member) on conflict do nothing;
  else
    delete from private_message_blocks where blocker_id = auth.uid() and blocked_id = p_member;
  end if;
end $$;
revoke all on function public.set_private_message_block(uuid, boolean) from public;
grant execute on function public.set_private_message_block(uuid, boolean) to authenticated;
