-- =====================================================================
-- Reprendre une partie là où on s'est arrêté (/jeux/trois-balles,
-- /jeux/trois-signes) : le dernier score enregistré d'un joueur
-- (nom + paroisse) donne son score cumulé et le nombre de niveaux réussis.
-- Ainsi le joueur retrouve sa partie, même sur un autre téléphone.
-- Nécessite la table game_scores (20261115000001_game_scores.sql).
-- =====================================================================

create or replace function public.game_progress(p_game text, p_name text, p_parish text)
returns table (score integer, level integer, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select s.score, s.level, s.created_at
  from game_scores s
  where s.game = p_game
    and lower(s.player_name) = lower(trim(regexp_replace(p_name, '\s+', ' ', 'g')))
    and lower(s.parish) = lower(trim(regexp_replace(p_parish, '\s+', ' ', 'g')))
  order by s.created_at desc
  limit 1
$$;
grant execute on function public.game_progress(text, text, text) to anon, authenticated;
