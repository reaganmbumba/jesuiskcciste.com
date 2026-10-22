-- =====================================================================
-- Réunions en visioconférence : l'administration programme une réunion
-- (titre, sujet, date et heure, durée), les membres la rejoignent en vidéo.
--
-- La salle est une salle Jitsi Meet (gratuite, sans compte) au nom
-- impossible à deviner, ou un lien Zoom / Google Meet collé par l'admin.
-- Le programme est public, mais le lien de la salle est dans une table à
-- part que seuls les membres validés lisent (ou tout le monde si la
-- réunion est ouverte au public).
-- =====================================================================

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  starts_at timestamptz not null,
  duration_minutes int not null default 60 check (duration_minutes between 15 and 600),
  audience text not null default 'members' check (audience in ('members', 'public')),
  is_cancelled boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists meetings_starts_idx on public.meetings(starts_at);

create table if not exists public.meeting_rooms (
  meeting_id uuid primary key references public.meetings(id) on delete cascade,
  jitsi_room text not null default ('JeSuisKCCiste-' || replace(gen_random_uuid()::text, '-', '')),
  -- Lien Zoom, Google Meet… ; vide = salle Jitsi du site.
  external_url text check (external_url is null or external_url ~ '^https://[^\s]+$')
);

alter table public.meetings enable row level security;
alter table public.meetings force row level security;
alter table public.meeting_rooms enable row level security;
alter table public.meeting_rooms force row level security;

-- Programme : lecture publique ; seule la modération le gère.
drop policy if exists "lecture publique" on public.meetings;
create policy "lecture publique" on public.meetings for select using (true);
drop policy if exists "modération" on public.meetings;
create policy "modération" on public.meetings for all using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
grant select on public.meetings to anon, authenticated;
grant insert, update, delete on public.meetings to authenticated;

-- Lien de la salle : membres validés (ou tous si réunion publique), réunion non annulée.
drop policy if exists "rejoindre" on public.meeting_rooms;
create policy "rejoindre" on public.meeting_rooms for select using (
  public.has_permission('moderation')
  or exists (select 1 from public.meetings m where m.id = meeting_id and not m.is_cancelled
             and (m.audience = 'public' or public.is_active_member())));
drop policy if exists "modération" on public.meeting_rooms;
create policy "modération" on public.meeting_rooms for all using (public.has_permission('moderation')) with check (public.has_permission('moderation'));
grant select on public.meeting_rooms to anon, authenticated;
grant insert, update, delete on public.meeting_rooms to authenticated;

drop trigger if exists meetings_updated on public.meetings;
create trigger meetings_updated before update on public.meetings for each row execute function public.set_updated_at();
