-- =====================================================================
-- Compteur de lectures : « 👁 N lectures » sur toutes les pages du site.
--
-- Une ligne par adresse de page (« /actualites/… », « /predications »,
-- « /challenges/… », « /jeux/trois-signes »…) ou par élément écouté
-- (« /predications/audio/<id> »). Tout le monde peut lire les totaux ;
-- personne n'écrit directement dans la table : le site appelle
-- record_page_view(), qui ajoute 1 et renvoie le nouveau total.
-- =====================================================================

create table if not exists public.page_views (
  path text primary key check (char_length(path) between 1 and 300 and path ~ '^/[A-Za-z0-9/_.~%:-]*$'),
  views bigint not null default 0 check (views >= 0),
  updated_at timestamptz not null default now()
);

alter table public.page_views enable row level security;
alter table public.page_views force row level security;

drop policy if exists "lecture publique" on public.page_views;
create policy "lecture publique" on public.page_views for select using (true);
revoke all on public.page_views from anon, authenticated;
grant select on public.page_views to anon, authenticated;

-- Ajoute une lecture et renvoie le nouveau total (null si l'adresse est invalide).
create or replace function public.record_page_view(p_path text)
returns bigint
language plpgsql security definer set search_path = public as $$
declare n bigint;
begin
  if p_path is null or char_length(p_path) not between 1 and 300 or p_path !~ '^/[A-Za-z0-9/_.~%:-]*$' then
    return null;
  end if;
  insert into public.page_views as v (path, views) values (p_path, 1)
  on conflict (path) do update set views = v.views + 1, updated_at = now()
  returning v.views into n;
  return n;
end $$;

revoke all on function public.record_page_view(text) from public;
grant execute on function public.record_page_view(text) to anon, authenticated;
