import { describe, expect, it } from 'vitest';
import { formatBytes } from '@/features/offline/offline';

describe('mode hors connexion', () => {
  it('affiche les tailles en Ko / Mo lisibles', () => {
    expect(formatBytes(209480)).toBe('205 Ko');
    expect(formatBytes(9745440)).toBe('9,3 Mo');
    expect(formatBytes(45290471)).toBe('43 Mo');
    expect(formatBytes(9745440, 'en')).toBe('9.3 MB');
  });
});
