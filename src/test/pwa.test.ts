import { readFileSync } from 'node:fs';
import { detectPlatform } from '@/features/pwa/install';

describe('application installable', () => {
  it('reconnaît le téléphone du visiteur', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1')).toBe('ios');
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 13; SM-A145F) Chrome/120 Mobile Safari/537.36')).toBe('android');
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36')).toBe('desktop');
  });

  it('a un manifeste complet (icônes adaptatives, plein écran)', () => {
    const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(m.display).toBe('standalone');
    expect(m.icons.some((i: { purpose: string; sizes: string }) => i.purpose === 'maskable' && i.sizes === '512x512')).toBe(true);
    expect(m.icons.some((i: { purpose: string; sizes: string }) => i.purpose === 'any' && i.sizes === '512x512')).toBe(true);
  });
});
