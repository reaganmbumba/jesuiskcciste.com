-- =====================================================================
-- Contenu du site modifiable par l'administration (« Contenu du site ») :
-- galerie photo, vidéos YouTube, opérations de solidarité, listes de
-- contributions et numéros de don. Une ligne par élément ; `collection`
-- dit à quelle rubrique il appartient, `data` porte ses champs.
--
-- Les photos envoyées depuis l'administration vont dans le bucket public
-- `public-assets`, dossier contenu/.
-- =====================================================================

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in ('gallery', 'videos', 'operations', 'contributions', 'donation_accounts')),
  position int not null default 0,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 20000),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_content_order_idx on public.site_content(collection, published, position, created_at);

alter table public.site_content enable row level security;

-- Les visiteurs voient le contenu publié ; l'administration centrale voit et gère tout.
drop policy if exists "lecture publique" on public.site_content;
create policy "lecture publique" on public.site_content for select using (published or public.has_permission('settings.manage'));
drop policy if exists "gestion" on public.site_content;
create policy "gestion" on public.site_content for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

drop trigger if exists site_content_updated on public.site_content;
create trigger site_content_updated before update on public.site_content for each row execute function public.set_updated_at();

-- Photos des rubriques (actualités, agenda, musique…) : les responsables qui ont
-- accès à l'administration peuvent en déposer dans public-assets/contenu/.
drop policy if exists "public-assets contenu dépôt" on storage.objects;
create policy "public-assets contenu dépôt" on storage.objects for insert
  with check (bucket_id = 'public-assets' and (storage.foldername(name))[1] = 'contenu' and public.has_permission('admin.access'));
