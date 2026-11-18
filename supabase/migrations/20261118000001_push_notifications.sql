-- =====================================================================
-- Notifications sur le téléphone (Web Push).
--
-- push_subscriptions : un téléphone (ou ordinateur) qui a touché
--   « Recevoir les notifications », avec les sujets choisis. Personne ne
--   lit ni n'écrit cette table depuis le site : seul le Worker Cloudflare
--   (clé secrète Supabase) l'utilise pour enregistrer et envoyer.
-- push_messages : la file des notifications à envoyer. L'administration
--   en ajoute une depuis /admin/notifications ; le Worker ajoute lui-même
--   celles des directs qui commencent, des nouveaux communiqués et des
--   nouvelles prédications (colonne « key », jamais deux fois la même).
-- =====================================================================

create table if not exists public.push_subscriptions (
  id bigserial primary key,
  endpoint text not null unique check (char_length(endpoint) between 20 and 1000 and endpoint like 'https://%'),
  p256dh text not null check (char_length(p256dh) between 60 and 120),
  auth text not null check (char_length(auth) between 16 and 64),
  topics text[] not null default array['direct', 'communiques', 'predications'],
  lang text not null default 'fr' check (lang in ('fr', 'en', 'pt')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_topics_idx on public.push_subscriptions using gin (topics);

alter table public.push_subscriptions enable row level security;
alter table public.push_subscriptions force row level security;
revoke all on public.push_subscriptions from anon, authenticated;

create table if not exists public.push_messages (
  id bigserial primary key,
  -- Notifications automatiques : « direct:<id> », « article:<id> », « sermon:<id> ».
  key text unique check (key is null or char_length(key) <= 200),
  topic text not null default 'general' check (topic in ('general', 'direct', 'communiques', 'predications')),
  title jsonb not null check (jsonb_typeof(title) = 'object' and char_length(coalesce(title->>'fr', '')) between 2 and 120),
  body jsonb not null default '{}'::jsonb check (jsonb_typeof(body) = 'object' and char_length(coalesce(body->>'fr', '')) <= 400),
  url text not null default '/' check (url ~ '^/[^/]' or url = '/'),
  image text check (image is null or (char_length(image) <= 1000 and (image like 'https://%' or image like '/%'))),
  status text not null default 'pending' check (status in ('pending', 'sending', 'done', 'cancelled')),
  cursor bigint not null default 0,
  sent int not null default 0,
  failed int not null default 0,
  removed int not null default 0,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists push_messages_queue_idx on public.push_messages(status, id);

alter table public.push_messages enable row level security;
alter table public.push_messages force row level security;

drop policy if exists "administration lecture" on public.push_messages;
create policy "administration lecture" on public.push_messages for select using (public.has_permission('settings.manage'));
drop policy if exists "administration envoi" on public.push_messages;
create policy "administration envoi" on public.push_messages for insert
  with check (public.has_permission('settings.manage') and key is null and status = 'pending' and cursor = 0 and sent = 0);
drop policy if exists "administration annulation" on public.push_messages;
create policy "administration annulation" on public.push_messages for update
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));

revoke all on public.push_messages from anon, authenticated;
grant select, insert on public.push_messages to authenticated;
grant update (status) on public.push_messages to authenticated;
grant usage on sequence public.push_messages_id_seq to authenticated;

-- Compteurs ajoutés par le Worker après chaque lot (sans écraser un autre lot en cours).
create or replace function public.push_add_counts(p_id bigint, p_sent int, p_failed int, p_removed int)
returns void language sql security definer set search_path = public as $$
  update public.push_messages
     set sent = sent + greatest(p_sent, 0), failed = failed + greatest(p_failed, 0), removed = removed + greatest(p_removed, 0)
   where id = p_id;
$$;
revoke all on function public.push_add_counts(bigint, int, int, int) from public, anon, authenticated;
grant execute on function public.push_add_counts(bigint, int, int, int) to service_role;

-- Nombre d'abonnés par sujet, pour la page d'administration.
create or replace function public.push_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_permission('settings.manage') then
    raise exception 'réservé à l’administration' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'total', (select count(*) from public.push_subscriptions),
    'direct', (select count(*) from public.push_subscriptions where 'direct' = any(topics)),
    'communiques', (select count(*) from public.push_subscriptions where 'communiques' = any(topics)),
    'predications', (select count(*) from public.push_subscriptions where 'predications' = any(topics))
  );
end $$;
revoke all on function public.push_stats() from public, anon;
grant execute on function public.push_stats() to authenticated;
