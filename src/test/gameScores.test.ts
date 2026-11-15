import { beforeEach, describe, expect, it } from 'vitest';
import { bestPerPlayer, furthest, getProgress, readLocalProgress, readPlayer, resetDemoScores, resumeProgress, saveLocalProgress, saveScore, savePlayer, topScores, validPlayer } from '@/features/games/scores';

describe('scores en ligne des jeux', () => {
  beforeEach(() => { resetDemoScores(); localStorage.clear(); });

  it('demande un nom et une paroisse valides', () => {
    expect(validPlayer({ name: ' R ', parish: 'Matete' })).toBe(false);
    expect(validPlayer({ name: 'Reagan', parish: ' ' })).toBe(false);
    expect(validPlayer({ name: 'Reagan', parish: 'Paroisse de Matete (Kinshasa)' })).toBe(true);
  });

  it('garde le joueur dans le téléphone', () => {
    expect(readPlayer()).toBeNull();
    savePlayer({ name: '  Reagan   M. ', parish: 'Muanda' });
    expect(readPlayer()).toEqual({ name: 'Reagan M.', parish: 'Muanda' });
  });

  it('classe le meilleur score de chaque joueur, 5 au plus', () => {
    const row = (playerName: string, parish: string, score: number) => ({ playerName, parish, score, level: 1, createdAt: '2026-11-15T12:00:00Z' });
    const top = bestPerPlayer([
      row('Ana', 'Boma', 100), row('ana', 'boma', 300), row('Ana', 'Matadi', 50),
      row('Ben', 'Boma', 200), row('Cé', 'X1', 10), row('Dé', 'X2', 20), row('Eli', 'X3', 30), row('Fé', 'X4', 40),
    ]);
    expect(top).toHaveLength(5);
    expect(top.map((r) => r.score)).toEqual([300, 200, 50, 40, 30]);
  });

  it('enregistre et relit les scores par jeu', async () => {
    await saveScore('trois-balles', { name: 'Reagan', parish: 'Muanda' }, 450, 3);
    await saveScore('trois-balles', { name: 'Reagan', parish: 'Muanda' }, 120, 1);
    await saveScore('trois-signes', { name: 'Reagan', parish: 'Muanda' }, 900, 2);
    await saveScore('trois-balles', { name: 'x', parish: 'Muanda' }, 999, 2); // nom trop court : ignoré
    const top = await topScores('trois-balles');
    expect(top).toHaveLength(1);
    expect(top[0]).toMatchObject({ playerName: 'Reagan', parish: 'Muanda', score: 450, level: 3 });
  });

  it('reprend la partie là où le joueur s’est arrêté', async () => {
    const me = { name: 'Reagan', parish: 'Muanda' };
    expect(await resumeProgress('trois-balles', me, false)).toEqual({ score: 0, level: 0 });
    // Joué sur un autre téléphone : 3 niveaux réussis, 600 points.
    await saveScore('trois-balles', me, 600, 3);
    expect(await getProgress('trois-balles', { name: ' reagan ', parish: 'MUANDA' })).toEqual({ score: 600, level: 3 });
    expect(await resumeProgress('trois-balles', me, true)).toEqual({ score: 600, level: 3 });
    // Sur ce téléphone, la partie locale est plus avancée : on la garde.
    saveLocalProgress('trois-balles', me, { score: 900, level: 5 });
    expect(await resumeProgress('trois-balles', me, false)).toEqual({ score: 900, level: 5 });
    // La progression locale appartient au joueur : un autre nom ne la reprend pas.
    expect(readLocalProgress('trois-balles', { name: 'Autre', parish: 'Muanda' })).toBeNull();
    expect(furthest({ score: 10, level: 2 }, { score: 5, level: 3 })).toEqual({ score: 5, level: 3 });
  });
});
