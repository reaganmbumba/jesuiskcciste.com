import { describe, expect, it } from 'vitest';
import { countdownParts, featuredLivestream, liveEmbedUrl, liveStatus, liveWatchUrl, parseYouTubeId, splitLivestreams } from '@/features/livestreams/livestreams';
import type { Livestream } from '@/types';

const now = new Date('2026-10-25T10:00:00Z');
const live = (id: string, startsAt: string, extra: Partial<Livestream> = {}): Livestream =>
  ({ id, title: id, startsAt, durationMinutes: 120, youtubeId: null, isCancelled: false, ...extra });

describe('Directs des cultes', () => {
  it('passe en direct à l’heure du début et le reste 1 h après la fin prévue', () => {
    expect(liveStatus(live('a', '2026-10-25T10:00:01Z'), now)).toBe('upcoming');
    expect(liveStatus(live('b', '2026-10-25T10:00:00Z'), now)).toBe('live');
    expect(liveStatus(live('c', '2026-10-25T07:00:00Z'), now)).toBe('live');
    expect(liveStatus(live('d', '2026-10-25T06:59:00Z'), now)).toBe('ended');
    expect(liveStatus(live('e', '2026-10-25T09:00:00Z', { isCancelled: true }), now)).toBe('cancelled');
  });

  it('met en avant le direct en cours, sinon le prochain des 60 jours', () => {
    const list = [live('demain', '2026-10-26T10:00:00Z'), live('en-cours', '2026-10-25T09:00:00Z'), live('annule', '2026-10-25T09:30:00Z', { isCancelled: true })];
    expect(featuredLivestream(list, now)?.id).toBe('en-cours');
    expect(featuredLivestream([live('demain', '2026-10-26T10:00:00Z'), live('hier', '2026-10-24T10:00:00Z')], now)?.id).toBe('demain');
    expect(featuredLivestream([live('trop-loin', '2027-03-01T10:00:00Z')], now)).toBeNull();
    expect(featuredLivestream([], now)).toBeNull();
  });

  it('range les directs à venir et les rediffusions', () => {
    const { upcoming, past } = splitLivestreams([live('loin', '2026-11-01T10:00:00Z'), live('proche', '2026-10-25T12:00:00Z'), live('hier', '2026-10-24T10:00:00Z')], now);
    expect(upcoming.map((l) => l.id)).toEqual(['proche', 'loin']);
    expect(past.map((l) => l.id)).toEqual(['hier']);
  });

  it('calcule le compte à rebours', () => {
    expect(countdownParts('2026-10-26T12:03:04Z', now)).toMatchObject({ days: 1, hours: 2, minutes: 3, seconds: 4 });
    expect(countdownParts('2026-10-24T10:00:00Z', now).total).toBe(0);
  });

  it('reconnaît les liens YouTube', () => {
    expect(parseYouTubeId('  ')).toBeNull();
    expect(parseYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://youtube.com/live/dQw4w9WgXcQ?feature=share')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(() => parseYouTubeId('https://example.com/watch?v=dQw4w9WgXcQ')).toThrow('youtube');
    expect(() => parseYouTubeId('https://www.youtube.com/@Jesuiskcciste')).toThrow('youtube');
  });

  it('intègre la vidéo choisie, ou le direct en cours de la chaîne', () => {
    expect(liveEmbedUrl({ youtubeId: 'dQw4w9WgXcQ' })).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(liveEmbedUrl({ youtubeId: null })).toContain('embed/live_stream?channel=UCg4Hdo9XEX8OI7MQH64iX2g');
    expect(liveWatchUrl({ youtubeId: null })).toBe('https://www.youtube.com/@Jesuiskcciste/live');
  });
});
