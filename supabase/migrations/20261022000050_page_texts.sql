-- =====================================================================
-- Textes longs des pages (cantiques, doctrine, catéchisme, rites, livre
-- « Mon Appel », prédications, enseignements) modifiables par
-- l'administration (« Textes des pages »). Une ligne par page et par
-- langue (ex. « doctrine.fr ») ; elle ne contient que les parties
-- modifiées, le reste vient du texte livré avec le site.
-- =====================================================================
create table if not exists public.page_texts (
  key text primary key check (key ~ '^[a-z-]{2,40}(\.(fr|en|pt))?$'),
  value jsonb not null check (jsonb_typeof(value) = 'object' and pg_column_size(value) <= 2000000),
  updated_at timestamptz not null default now()
);

alter table public.page_texts enable row level security;

drop policy if exists "lecture publique" on public.page_texts;
create policy "lecture publique" on public.page_texts for select using (true);
drop policy if exists "gestion" on public.page_texts;
create policy "gestion" on public.page_texts for all using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
grant select on public.page_texts to anon, authenticated;
grant insert, update, delete on public.page_texts to authenticated;

drop trigger if exists page_texts_updated on public.page_texts;
create trigger page_texts_updated before update on public.page_texts for each row execute function public.set_updated_at();
