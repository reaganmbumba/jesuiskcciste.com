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

/** Où reprendre : score cumulé et nombre de niveaux réussis lors du dernier enregistrement. */
export interface Progress { score: number; level: number }

/** Dernière progression enregistrée en ligne pour ce joueur (nom + paroisse), ou null. */
export async function getProgress(game: GameId, player: Player): Promise<Progress | null> {
  const p = cleanPlayer(player);
  if (!validPlayer(p)) return null;
  if (isDemoMode || !supabase) {
    const mine = demoScores.filter((r) => r.game === game && r.playerName.toLowerCase() === p.name.toLowerCase() && r.parish.toLowerCase() === p.parish.toLowerCase());
    const last = mine[mine.length - 1];
    return last ? { score: last.score, level: last.level } : null;
  }
  const { data, error } = await supabase.rpc('game_progress', { p_game: game, p_name: p.name, p_parish: p.parish });
  if (error) throw error;
  const row = (data as { score: number; level: number }[] | null)?.[0];
  return row ? { score: row.score, level: row.level } : null;
}

/** Progression gardée dans le téléphone, liée au joueur. */
const progressKey = (game: GameId) => `kcc-${game}-progression`;
const samePlayer = (a: Player, b: Player) => a.name.toLowerCase() === b.name.toLowerCase() && a.parish.toLowerCase() === b.parish.toLowerCase();

export function readLocalProgress(game: GameId, player: Player | null): Progress | null {
  if (!player) return null;
  try {
    const v = JSON.parse(localStorage.getItem(progressKey(game)) ?? 'null') as (Progress & Player) | null;
    if (!v || !samePlayer(v, cleanPlayer(player))) return null;
    return { score: Math.max(0, Number(v.score) || 0), level: Math.max(0, Number(v.level) || 0) };
  } catch { return null; }
}

export function saveLocalProgress(game: GameId, player: Player | null, progress: Progress) {
  if (!player) return;
  try { localStorage.setItem(progressKey(game), JSON.stringify({ ...cleanPlayer(player), ...progress })); } catch { /* navigation privée */ }
}

/** La progression la plus avancée entre le téléphone et l'enregistrement en ligne. */
export function furthest(a: Progress | null, b: Progress | null): Progress | null {
  if (!a) return b;
  if (!b) return a;
  return b.level > a.level || (b.level === a.level && b.score > a.score) ? b : a;
}

/**
 * Où reprendre la partie de ce joueur. `preferLocal` : au chargement de la page,
 * la progression du téléphone suffit (elle respecte « Nouvelle partie ») ;
 * quand le joueur donne son nom, on prend la plus avancée avec celle en ligne.
 */
export async function resumeProgress(game: GameId, player: Player, preferLocal: boolean): Promise<Progress> {
  const local = readLocalProgress(game, player);
  if (local && preferLocal) return local;
  const online = await getProgress(game, player).catch(() => null);
  return furthest(local, online) ?? { score: 0, level: 0 };
}

/** Pour les tests. */
export function resetDemoScores() { demoScores = []; }
