-- =====================================================================
-- Scores en ligne des jeux (/jeux/trois-balles, /jeux/trois-signes).
--
-- Avant de jouer, le joueur indique son nom et sa paroisse (gardés dans
-- son téléphone). À chaque niveau terminé, son score est enregistré ici.
-- Le classement montre les 5 meilleurs joueurs de chaque jeu : le meilleur
-- score de chaque nom + paroisse (fonction game_top_scores).
-- Ouvert à tous sans compte ; la modération (permission « moderation »)
-- peut supprimer un score fantaisiste.
-- =====================================================================

create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  game text not null check (game in ('trois-balles', 'trois-signes')),
  player_name text not null check (char_length(trim(player_name)) between 2 and 60),
  parish text not null check (char_length(trim(parish)) between 2 and 120),
  score integer not null check (score between 0 and 1000000),
  level integer not null default 1 check (level between 1 and 10000),
  created_at timestamptz not null default now()
);
create index if not exists game_scores_game_score_idx on public.game_scores(game, score desc);

alter table public.game_scores enable row level security;
alter table public.game_scores force row level security;

drop policy if exists "lecture publique" on public.game_scores;
create policy "lecture publique" on public.game_scores for select using (true);
drop policy if exists "enregistrer un score" on public.game_scores;
create policy "enregistrer un score" on public.game_scores for insert to anon, authenticated with check (true);
drop policy if exists "modération suppression" on public.game_scores;
create policy "modération suppression" on public.game_scores for delete using (public.has_permission('moderation'));
grant select, insert on public.game_scores to anon, authenticated;
grant delete on public.game_scores to authenticated;

create or replace function public.game_score_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  new.player_name := trim(regexp_replace(new.player_name, '\s+', ' ', 'g'));
  new.parish := trim(regexp_replace(new.parish, '\s+', ' ', 'g'));
  if (select count(*) from game_scores where created_at > now() - interval '1 minute') >= 120 then
    raise exception 'Trop de scores en peu de temps, réessayez dans une minute';
  end if;
  return new;
end $$;
drop trigger if exists game_scores_before_insert on public.game_scores;
create trigger game_scores_before_insert before insert on public.game_scores for each row execute function public.game_score_before_insert();

-- Les 5 meilleurs joueurs d'un jeu : meilleur score de chaque nom + paroisse.
create or replace function public.game_leaderboard(p_game text, p_limit integer default 5)
returns table (player_name text, parish text, score integer, level integer, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select t.player_name, t.parish, t.score, t.level, t.created_at
  from (
    select distinct on (lower(s.player_name), lower(s.parish)) s.player_name, s.parish, s.score, s.level, s.created_at
    from game_scores s
    where s.game = p_game
    order by lower(s.player_name), lower(s.parish), s.score desc, s.created_at asc
  ) t
  order by t.score desc, t.created_at asc
  limit least(greatest(coalesce(p_limit, 5), 1), 50)
$$;
grant execute on function public.game_leaderboard(text, integer) to anon, authenticated;
