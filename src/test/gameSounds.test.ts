import { describe, expect, it } from 'vitest';
import { isMuted, playSound, setMuted } from '@/features/games/sounds';

describe('sons des jeux', () => {
  it('se coupent et le choix est gardé', () => {
    setMuted(true);
    expect(isMuted()).toBe(true);
    expect(localStorage.getItem('kcc-jeux-son-coupe')).toBe('1');
    setMuted(false);
    expect(isMuted()).toBe(false);
  });

  it('ne plantent pas sans Web Audio ni voix (vieux téléphones, tests)', () => {
    for (const s of ['tap', 'drop', 'error', 'crush', 'combo', 'letter', 'win', 'lose'] as const) {
      expect(() => playSound(s, 2)).not.toThrow();
    }
  });
});
