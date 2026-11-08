-- =====================================================================
-- Inscriptions : l'administration centrale est prévenue de chaque
-- nouvelle inscription (notification dans « Mon espace »), et un compte
-- révoqué (suspendu) perd aussitôt son téléphone autorisé.
-- =====================================================================

create or replace function public.notify_new_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, kind, title, body, link)
  select ra.user_id, 'announcement', 'Nouvelle inscription',
         trim(both ' ' from concat_ws(' ', new.last_name, new.middle_name, new.first_name))
           || case when coalesce(new.city, '') <> '' then ' · ' || new.city else '' end,
         '/admin/inscriptions'
  from role_assignments ra join roles r on r.id = ra.role_id
  where r.key = 'central_admin' and ra.user_id <> new.id;
  return new;
end $$;
drop trigger if exists profiles_notify_new_member on public.profiles;
create trigger profiles_notify_new_member after insert on public.profiles
  for each row execute function public.notify_new_member();

create or replace function public.profile_release_reader_on_suspend() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('suspended', 'deleted') then delete from reader_devices where user_id = new.id; end if;
  return new;
end $$;
drop trigger if exists profiles_release_reader on public.profiles;
create trigger profiles_release_reader after update of status on public.profiles
  for each row execute function public.profile_release_reader_on_suspend();
