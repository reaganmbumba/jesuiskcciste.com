-- =====================================================================
-- KCC CONNECT — Schéma relationnel (PostgreSQL / Supabase)
-- Migration 1 : types, tables, contraintes, index, horodatage.
-- La sécurité (RLS, fonctions) est dans la migration 2.
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------- Types énumérés ----------
create type public.account_status    as enum ('pending', 'active', 'suspended', 'deleted');
create type public.visibility        as enum ('public', 'members', 'leaders', 'private');
create type public.publication_status as enum ('draft', 'pending', 'published', 'archived');
create type public.event_category    as enum ('culte','reunion','formation','seminaire','conference','mariage','consolation','deuil','concert','chorale','solidarite','autre');
create type public.event_status      as enum ('scheduled', 'postponed', 'cancelled', 'archived');
create type public.course_level      as enum ('debutant', 'intermediaire', 'avance');
create type public.course_access     as enum ('open', 'members', 'on_request', 'closed');
create type public.lesson_kind       as enum ('text', 'video', 'pdf');
create type public.artist_kind       as enum ('artist', 'choir');
create type public.broadcast_rights  as enum ('authorized', 'pending', 'restricted');
create type public.media_kind        as enum ('pdf', 'video', 'audio', 'image', 'document');
create type public.project_status    as enum ('draft', 'active', 'completed', 'suspended', 'archived');
create type public.contribution_status as enum ('declared', 'pending_verification', 'confirmed', 'rejected');
create type public.payment_provider  as enum ('mpesa', 'orange_money', 'airtel_money', 'cash', 'bank');
create type public.notification_kind as enum ('announcement','event','schedule_change','course','exam_result','certificate','project_update');

-- ---------- Horodatage automatique ----------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

-- ---------- Organisation ----------
create table public.organizational_units (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  level text not null,                         -- libellé configurable (Administration centrale, Région…)
  parent_id uuid references public.organizational_units(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  description text not null default '',
  country text not null,
  city text not null,
  address text,
  unit_id uuid references public.organizational_units(id) on delete set null,
  leader_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index parishes_country_city_idx on public.parishes(country, city);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  description text not null default '',
  leader_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parish_id, name)
);
create index sections_parish_idx on public.sections(parish_id);

-- ---------- Profils (1-1 avec auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  middle_name text,
  avatar_url text,
  email citext,
  phone text,
  country text not null default '',
  city text not null default '',
  parish_id uuid references public.parishes(id) on delete set null,
  section_id uuid references public.sections(id) on delete set null,
  function_title text,
  status public.account_status not null default 'pending',
  privacy jsonb not null default jsonb_build_object(
    'show_city', true, 'show_parish', true, 'show_section', true, 'show_function', true,
    'show_photo', true, 'show_email', false, 'show_phone', false, 'listed_in_directory', true),
  consent_at timestamptz,
  deletion_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_parish_idx on public.profiles(parish_id);
create index profiles_section_idx on public.profiles(section_id);
create index profiles_status_idx on public.profiles(status);
create index profiles_name_idx on public.profiles(lower(last_name), lower(first_name));

-- Historique des rattachements (adhésions validées).
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parish_id uuid not null references public.parishes(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  validated_by uuid references public.profiles(id),
  validated_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
create index memberships_user_idx on public.memberships(user_id);

-- ---------- Rôles et permissions ----------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null
);
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null
);
create table public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
create table public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  parish_id uuid references public.parishes(id) on delete cascade,   -- portée éventuelle
  section_id uuid references public.sections(id) on delete cascade,
  course_id uuid,                                                    -- FK ajoutée après courses
  granted_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create unique index role_assignments_unique on public.role_assignments(user_id, role_id, coalesce(parish_id, '00000000-0000-0000-0000-000000000000'), coalesce(section_id, '00000000-0000-0000-0000-000000000000'), coalesce(course_id, '00000000-0000-0000-0000-000000000000'));
create index role_assignments_user_idx on public.role_assignments(user_id);

-- ---------- Publications ----------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  summary text not null default '',
  content text not null default '',
  image_url text,
  author text not null default '',
  author_id uuid default auth.uid() references public.profiles(id) on delete set null,
  category text not null default 'Général',
  published_at timestamptz not null default now(),
  status public.publication_status not null default 'draft',
  audience public.visibility not null default 'public',
  pinned boolean not null default false,
  parish_id uuid references public.parishes(id) on delete cascade,
  section_id uuid references public.sections(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index announcements_listing_idx on public.announcements(status, audience, pinned desc, published_at desc);

-- ---------- Événements ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Africa/Kinshasa',
  location text not null default '',
  parish_id uuid references public.parishes(id) on delete cascade,
  section_id uuid references public.sections(id) on delete cascade,
  category public.event_category not null default 'autre',
  poster_url text,
  organizer text,
  status public.event_status not null default 'scheduled',
  participation text not null default '',
  registration_enabled boolean not null default false,
  audience public.visibility not null default 'public',
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index events_starts_idx on public.events(starts_at);
create index events_parish_idx on public.events(parish_id);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ---------- Académie ----------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  summary text not null default '',
  description text not null default '',
  category text not null default 'Général',
  level public.course_level not null default 'debutant',
  estimated_hours numeric(5,1) not null default 1 check (estimated_hours > 0),
  access public.course_access not null default 'members',
  status public.publication_status not null default 'draft',
  trainer_name text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.role_assignments add constraint role_assignments_course_fk foreign key (course_id) references public.courses(id) on delete cascade;

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index course_modules_course_idx on public.course_modules(course_id, position);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  kind public.lesson_kind not null default 'text',
  duration_minutes int not null default 5 check (duration_minutes >= 0),
  resource_url text,                        -- chemin dans le bucket « course-materials »
  body text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index lessons_module_idx on public.lessons(module_id, position);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  progress int not null default 0 check (progress between 0 and 100),
  completed_lesson_ids uuid[] not null default '{}',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (course_id, user_id)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  passing_score int not null default 70 check (passing_score between 1 and 100),
  max_attempts int not null default 3 check (max_attempts >= 0), -- 0 = illimité
  time_limit_minutes int,
  requires_all_lessons boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  explanation text,
  position int not null default 0
);
create index questions_quiz_idx on public.questions(quiz_id, position);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,   -- JAMAIS lisible par les membres (voir RLS)
  position int not null default 0
);
create unique index question_one_correct on public.question_options(question_id) where is_correct;

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null,
  score int not null check (score between 0 and 100),
  correct_count int not null,
  total int not null,
  passed boolean not null,
  attempt_number int not null,
  submitted_at timestamptz not null default now(),
  unique (quiz_id, user_id, attempt_number)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^KCC-[0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  course_id uuid not null references public.courses(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  attempt_id uuid references public.quiz_attempts(id) on delete set null,
  holder_name text not null,
  score int not null,
  issued_at timestamptz not null default now(),
  revoked boolean not null default false,
  revoked_reason text,
  unique (course_id, user_id)
);

-- ---------- KCC Music ----------
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind public.artist_kind not null default 'artist',
  bio text not null default '',
  parish_id uuid references public.parishes(id) on delete set null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.choirs (            -- informations propres aux chorales (effectif, direction…)
  id uuid primary key references public.artists(id) on delete cascade,
  director_name text,
  members_count int
);
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_id uuid not null references public.artists(id) on delete cascade,
  year int check (year between 1900 and 2100),
  cover_url text,
  created_at timestamptz not null default now()
);
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null default '',
  artist_id uuid not null references public.artists(id) on delete cascade,
  album_id uuid references public.albums(id) on delete set null,
  category text not null default 'Louange',
  duration_seconds int not null default 0 check (duration_seconds >= 0),
  audio_url text,
  video_url text,
  lyrics text,
  broadcast_rights public.broadcast_rights not null default 'pending',
  price_amount numeric(10,2),             -- boutique future
  price_currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tracks_artist_idx on public.tracks(artist_id);

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind public.media_kind not null default 'document',
  category text not null default 'Général',
  description text not null default '',
  url text,                               -- chemin de stockage (public ou privé selon audience)
  audience public.visibility not null default 'members',
  parish_id uuid references public.parishes(id) on delete cascade,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------- Solidarité ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  summary text not null default '',
  description text not null default '',
  parish_id uuid references public.parishes(id) on delete set null,
  goal_amount numeric(14,2) not null check (goal_amount > 0),
  currency text not null default 'USD' check (currency in ('USD','CDF','EUR')),
  confirmed_amount numeric(14,2) not null default 0,   -- calculé par trigger
  declared_amount numeric(14,2) not null default 0,    -- calculé par trigger
  launched_at timestamptz not null default now(),
  deadline timestamptz,
  image_url text,
  status public.project_status not null default 'draft',
  participation_terms text not null default '',
  final_report text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  contributor_id uuid references public.profiles(id) on delete set null,
  contributor_label text not null default 'Anonyme',
  amount numeric(14,2) not null check (amount > 0),
  currency text not null,
  provider public.payment_provider not null,
  transaction_reference text,
  provider_payload jsonb,                -- réponse de l'opérateur (jamais de PIN)
  status public.contribution_status not null default 'declared',
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  check (status <> 'confirmed' or transaction_reference is not null)
);
create unique index contributions_reference_unique on public.contributions(provider, transaction_reference) where transaction_reference is not null;
create index contributions_project_idx on public.contributions(project_id, status);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  label text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null,
  spent_at timestamptz not null,
  receipt_url text,                      -- bucket privé « finance-receipts »
  recorded_by uuid default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- Notifications ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null default '',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, read, created_at desc);

create table public.notification_preferences (
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.notification_kind not null,
  in_app boolean not null default true,
  email boolean not null default false,
  push boolean not null default false,
  primary key (user_id, kind)
);

-- ---------- Paramètres et audit ----------
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor text not null default 'système',
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

-- ---------- Triggers updated_at ----------
do $$
declare t text;
begin
  foreach t in array array['organizational_units','parishes','sections','profiles','announcements','events','courses','quizzes','artists','tracks','projects'] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;
