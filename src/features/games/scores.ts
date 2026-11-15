import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';

/**
 * Joueur et scores en ligne des jeux (table `game_scores`, fonction
 * `game_leaderboard`). Le nom et la paroisse sont demandés une fois et gardés
 * dans le téléphone ; chaque niveau terminé enregistre le score en ligne.
 */
export type GameId = 'trois-balles' | 'trois-signes';

export interface Player { name: string; parish: string }

export interface LeaderboardRow {
  playerName: string;
  parish: string;
  score: number;
  level: number;
  createdAt: string;
}

const PLAYER_KEY = 'kcc-joueur';

export function readPlayer(): Player | null {
  try {
    const v = JSON.parse(localStorage.getItem(PLAYER_KEY) ?? 'null') as Player | null;
    return v && typeof v.name === 'string' && typeof v.parish === 'string' && validPlayer(v) ? v : null;
  } catch { return null; }
}

export function savePlayer(p: Player) {
  try { localStorage.setItem(PLAYER_KEY, JSON.stringify(cleanPlayer(p))); } catch { /* navigation privée */ }
}

export const cleanPlayer = (p: Player): Player => ({ name: p.name.trim().replace(/\s+/g, ' '), parish: p.parish.trim().replace(/\s+/g, ' ') });

export function validPlayer(p: Player): boolean {
  const c = cleanPlayer(p);
  return c.name.length >= 2 && c.name.length <= 60 && c.parish.length >= 2 && c.parish.length <= 120;
}

let demoScores: (LeaderboardRow & { game: GameId })[] = [];

/** Meilleur score de chaque joueur (nom + paroisse), du plus haut au plus bas. */
export function bestPerPlayer(rows: LeaderboardRow[], limit = 5): LeaderboardRow[] {
  const best = new Map<string, LeaderboardRow>();
  for (const r of rows) {
    const k = `${r.playerName.toLowerCase()}|${r.parish.toLowerCase()}`;
    const cur = best.get(k);
    if (!cur || r.score > cur.score) best.set(k, r);
  }
  return [...best.values()].sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt)).slice(0, limit);
}

export async function saveScore(game: GameId, player: Player, score: number, level: number): Promise<void> {
  const p = cleanPlayer(player);
  if (!validPlayer(p) || score <= 0) return;
  const s = Math.min(1000000, Math.round(score));
  const l = Math.max(1, Math.min(10000, Math.round(level)));
  if (isDemoMode || !supabase) {
    demoScores.push({ game, playerName: p.name, parish: p.parish, score: s, level: l, createdAt: new Date().toISOString() });
    return;
  }
  const { error } = await supabase.from('game_scores').insert({ game, player_name: p.name, parish: p.parish, score: s, level: l });
  if (error) throw error;
}

export async function topScores(game: GameId, limit = 5): Promise<LeaderboardRow[]> {
  if (isDemoMode || !supabase) return bestPerPlayer(demoScores.filter((r) => r.game === game), limit);
  const { data, error } = await supabase.rpc('game_leaderboard', { p_game: game, p_limit: limit });
  if (error) throw error;
  return camelize<LeaderboardRow[]>(data ?? []);
}

/** Pour les tests. */
export function resetDemoScores() { demoScores = []; }
