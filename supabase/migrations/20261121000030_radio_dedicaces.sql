-- =====================================================================
-- Radio : dédicaces et intentions de prière écrites par les auditeurs.
-- Envoi par radio_dedicace_envoyer (même sans compte, avec limites),
-- lecture et suivi (« lu à l'antenne », « écarté ») par les animateurs seulement.
-- =====================================================================

create table if not exists public.radio_dedicaces (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('dedicace', 'priere')),
  author_name text not null check (char_length(trim(author_name)) between 2 and 80),
  place text check (place is null or char_length(place) <= 80),
  recipient text check (recipient is null or char_length(recipient) <= 120),
  message text not null check (char_length(trim(message)) between 3 and 600),
  status text not null default 'nouveau' check (status in ('nouveau', 'lu', 'ecarte')),
  visitor text check (visitor is null or char_length(visitor) <= 64),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists radio_dedicaces_new_idx on public.radio_dedicaces(status, created_at desc);
create index if not exists radio_dedicaces_visitor_idx on public.radio_dedicaces(visitor, created_at desc);

alter table public.radio_dedicaces enable row level security;
alter table public.radio_dedicaces force row level security;
revoke all on public.radio_dedicaces from anon;
grant select, update, delete on public.radio_dedicaces to authenticated;
drop policy if exists "radio dedicaces : animateur" on public.radio_dedicaces;
create policy "radio dedicaces : animateur" on public.radio_dedicaces for all to authenticated
  using (public.can_host_radio()) with check (public.can_host_radio());

create or replace function public.radio_dedicace_envoyer(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_visitor text := nullif(left(coalesce(p->>'visitor', ''), 64), '');
begin
  if coalesce(p->>'kind', '') not in ('dedicace', 'priere') then raise exception 'Choix non valide.'; end if;
  if char_length(trim(coalesce(p->>'author_name', ''))) < 2 then raise exception 'Indiquez votre nom.'; end if;
  if char_length(trim(coalesce(p->>'message', ''))) < 3 then raise exception 'Écrivez votre message.'; end if;
  -- limites : 3 messages par visiteur en 10 minutes, 300 par heure pour toute la radio
  if v_visitor is not null and (select count(*) from radio_dedicaces where visitor = v_visitor and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'Vous avez déjà envoyé plusieurs messages : réessayez dans quelques minutes.';
  end if;
  if (select count(*) from radio_dedicaces where created_at > now() - interval '1 hour') >= 300 then
    raise exception 'Trop de messages en ce moment : réessayez plus tard.';
  end if;
  insert into radio_dedicaces (kind, author_name, place, recipient, message, visitor)
  values (p->>'kind', left(trim(p->>'author_name'), 80), nullif(left(trim(coalesce(p->>'place', '')), 80), ''),
          case when p->>'kind' = 'dedicace' then nullif(left(trim(coalesce(p->>'recipient', '')), 120), '') end,
          left(trim(p->>'message'), 600), v_visitor);
end $$;
revoke all on function public.radio_dedicace_envoyer(jsonb) from public;
grant execute on function public.radio_dedicace_envoyer(jsonb) to anon, authenticated;
