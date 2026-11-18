-- =====================================================================
-- Radio Je suis KCCiste : vocaux des auditeurs à l'antenne.
--
-- Un auditeur enregistre un vocal sur /radio (ou envoie une note vocale
-- WhatsApp) : il arrive « en attente ». L'animateur l'écoute dans
-- /admin/radio et le valide ou le refuse. Rien ne passe à l'antenne sans
-- validation. Un vocal validé :
--   - peut être joué par l'animateur pendant le direct (bouton Jouer) ;
--   - passe tout seul dans la radio automatique pendant 7 jours.
--
-- Les vocaux reçus sur WhatsApp sont ajoutés par l'animateur dans
-- /admin/radio (source « whatsapp ») et sont validés d'office.
--
-- Garde-fous : seuls les vocaux validés sont lisibles par le public, chemin
-- d'audio imposé (nom impossible à deviner), taille et formats limités,
-- débit limité contre les envois en rafale.
-- =====================================================================

create or replace function public.can_moderate_radio() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_permission('settings.manage') or public.has_permission('moderation');
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('radio-vocals', 'radio-vocals', true, 10485760,
   array['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/aac','audio/wav','audio/x-wav','audio/x-m4a','audio/m4a','audio/3gpp','audio/amr','video/webm','video/mp4'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Pas de liste publique des fichiers : seul l'animateur parcourt le dossier.
drop policy if exists "radio-vocals liste" on storage.objects;
create policy "radio-vocals liste" on storage.objects for select using (bucket_id = 'radio-vocals' and public.can_moderate_radio());
-- Tout visiteur dépose un vocal, uniquement sous <uuid>.<ext> ; jamais de remplacement.
drop policy if exists "radio-vocals dépôt" on storage.objects;
create policy "radio-vocals dépôt" on storage.objects for insert to anon, authenticated with check (
  bucket_id = 'radio-vocals'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webm|ogg|m4a|mp4|mp3|aac|wav|3gp|amr)$');
drop policy if exists "radio-vocals suppression" on storage.objects;
create policy "radio-vocals suppression" on storage.objects for delete using (bucket_id = 'radio-vocals' and public.can_moderate_radio());

create table if not exists public.radio_vocals (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null check (char_length(trim(author_name)) between 2 and 80),
  place text check (place is null or char_length(trim(place)) between 1 and 120),
  note text check (note is null or char_length(trim(note)) between 1 and 300),
  audio_path text not null check (audio_path ~ '^[0-9a-f-]{36}\.(webm|ogg|m4a|mp4|mp3|aac|wav|3gp|amr)$'),
  audio_seconds int check (audio_seconds is null or audio_seconds between 0 and 900),
  source text not null default 'site' check (source in ('site', 'whatsapp')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  aired_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists radio_vocals_status_idx on public.radio_vocals(status, created_at desc);

alter table public.radio_vocals enable row level security;
alter table public.radio_vocals force row level security;

drop policy if exists "lecture" on public.radio_vocals;
create policy "lecture" on public.radio_vocals for select using (status = 'approved' or public.can_moderate_radio());
drop policy if exists "envoyer" on public.radio_vocals;
create policy "envoyer" on public.radio_vocals for insert to anon, authenticated with check (true);
drop policy if exists "modération maj" on public.radio_vocals;
create policy "modération maj" on public.radio_vocals for update using (public.can_moderate_radio()) with check (public.can_moderate_radio());
drop policy if exists "modération suppression" on public.radio_vocals;
create policy "modération suppression" on public.radio_vocals for delete using (public.can_moderate_radio());
grant select, insert on public.radio_vocals to anon, authenticated;
grant update, delete on public.radio_vocals to authenticated;

-- Valeurs fixées par la base. Un visiteur ne peut envoyer qu'un vocal « en attente »
-- venant du site ; seul l'animateur ajoute un vocal WhatsApp déjà validé.
-- Limite : 15 vocaux par tranche de 10 minutes, tous auditeurs confondus.
create or replace function public.radio_vocal_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  new.author_id := auth.uid();
  new.author_name := trim(new.author_name);
  new.place := nullif(trim(coalesce(new.place, '')), '');
  new.note := nullif(trim(coalesce(new.note, '')), '');
  new.aired_at := null;
  if public.can_moderate_radio() and new.source = 'whatsapp' then
    new.status := 'approved';
    new.approved_at := now();
  else
    new.source := 'site';
    new.status := 'pending';
    new.approved_at := null;
    if (select count(*) from radio_vocals where created_at > now() - interval '10 minutes') >= 15 then
      raise exception 'Beaucoup de vocaux en ce moment, réessayez dans quelques minutes';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists radio_vocals_before_insert on public.radio_vocals;
create trigger radio_vocals_before_insert before insert on public.radio_vocals for each row execute function public.radio_vocal_before_insert();

-- La date de validation suit le statut.
create or replace function public.radio_vocal_before_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and old.status <> 'approved' then new.approved_at := now(); end if;
  if new.status <> 'approved' then new.approved_at := null; end if;
  new.created_at := old.created_at;
  new.author_id := old.author_id;
  return new;
end $$;
drop trigger if exists radio_vocals_before_update on public.radio_vocals;
create trigger radio_vocals_before_update before update on public.radio_vocals for each row execute function public.radio_vocal_before_update();
