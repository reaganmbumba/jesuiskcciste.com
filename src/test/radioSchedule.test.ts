import { describe, expect, it } from 'vitest';
import type { RadioItem } from '@/features/radio/radio';
import { kinshasaDayStart, scheduleAt, scheduleFingerprint, slotOffset, stationSlot } from '@/features/radio/schedule';

const item = (kind: RadioItem['kind'], id: string, s: number | null): RadioItem => ({ key: `${kind}:${id}`, kind, title: id, subtitle: '', url: `/${id}.mp3`, durationSeconds: s, imageUrl: null });
const catalog = [
  ...Array.from({ length: 12 }, (_, i) => item('song', `c${i}`, 150 + i * 13)),
  item('sermon', 'p1', 1141), item('sermon', 'p2', 1140),
  item('news', 'j', 437), item('vocal', 'v1', 40),
];
const at = (iso: string) => new Date(iso).getTime();

describe('antenne commune de la radio', () => {
  it('commence la journée à minuit, heure de Kinshasa', () => {
    expect(new Date(kinshasaDayStart(at('2026-11-21T14:07:00Z'))).toISOString()).toBe('2026-11-20T23:00:00.000Z');
    expect(new Date(kinshasaDayStart(at('2026-11-21T23:30:00Z'))).toISOString()).toBe('2026-11-21T23:00:00.000Z');
  });

  it('deux auditeurs au même instant entendent le même titre, à la même seconde', () => {
    const now = at('2026-11-21T13:07:42Z');
    const a = scheduleAt(catalog, 'all', now);
    // l'autre auditeur a reçu la liste dans un autre ordre
    const b = scheduleAt([...catalog].reverse(), 'all', now);
    expect(a[0].item.key).toBe(b[0].item.key);
    expect(a[0].startsAt).toBe(b[0].startsAt);
    expect(slotOffset(a[0], now)).toBe(slotOffset(b[0], now));
    expect(a.map((s) => s.item.key)).toEqual(b.map((s) => s.item.key));
  });

  it('le titre en cours englobe l’instant, et les suivants s’enchaînent sans trou', () => {
    for (const iso of ['2026-11-21T00:00:30Z', '2026-11-21T08:59:59Z', '2026-11-21T22:58:00Z']) {
      const now = at(iso);
      const s = scheduleAt(catalog, 'all', now, 3);
      expect(s).toHaveLength(4);
      expect(s[0].startsAt).toBeLessThanOrEqual(now);
      expect(s[0].endsAt).toBeGreaterThan(now);
      for (let i = 1; i < s.length; i++) expect(s[i].startsAt).toBe(s[i - 1].endsAt);
    }
  });

  it('un peu plus tard, c’est la suite de la même grille', () => {
    const now = at('2026-11-21T10:00:00Z');
    const s = scheduleAt(catalog, 'all', now, 2);
    const later = scheduleAt(catalog, 'all', s[1].startsAt + 1000, 1);
    expect(later[0].item.key).toBe(s[1].item.key);
    expect(later[0].startsAt).toBe(s[1].startsAt);
  });

  it('change d’ordre d’un jour à l’autre', () => {
    const d1 = scheduleAt(catalog, 'all', at('2026-11-21T12:00:00Z'), 8).map((s) => s.item.key).join();
    const d2 = scheduleAt(catalog, 'all', at('2026-11-22T12:00:00Z'), 8).map((s) => s.item.key).join();
    expect(d1).not.toBe(d2);
  });

  it('laisse de côté les titres sans durée connue, et rien quand la liste est vide', () => {
    const s = scheduleAt([...catalog, item('song', 'sans-duree', null)], 'all', at('2026-11-21T12:00:00Z'), 50);
    expect(s.some((x) => x.item.key === 'song:sans-duree')).toBe(false);
    expect(scheduleAt([], 'all', Date.now())).toEqual([]);
    expect(scheduleFingerprint(catalog, 'all')).toBe(scheduleFingerprint([...catalog].reverse(), 'all'));
  });

  it('le jingle de la station tombe au même créneau de 7 minutes pour tous', () => {
    expect(stationSlot(at('2026-11-20T23:06:59Z'), 7 * 60_000)).toBe(0);
    expect(stationSlot(at('2026-11-20T23:07:00Z'), 7 * 60_000)).toBe(1);
  });
});
