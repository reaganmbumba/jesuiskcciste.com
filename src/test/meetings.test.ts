import { describe, expect, it } from 'vitest';
import { joinUrl, meetingStatus, normalizeExternalUrl, splitMeetings } from '@/features/meetings/meetings';
import { toLocalInput } from '@/features/meetings/MeetingsUi';
import type { Meeting } from '@/types';

const now = new Date('2026-10-25T10:00:00Z');
const meeting = (id: string, startsAt: string, extra: Partial<Meeting> = {}): Meeting =>
  ({ id, title: id, description: '', startsAt, durationMinutes: 60, audience: 'members', isCancelled: false, createdAt: startsAt, ...extra });

describe('Réunions en vidéo', () => {
  it('ouvre la salle 15 min avant le début et la ferme 1 h après la fin', () => {
    expect(meetingStatus(meeting('a', '2026-10-25T10:20:00Z'), now)).toBe('upcoming');
    expect(meetingStatus(meeting('b', '2026-10-25T10:10:00Z'), now)).toBe('open');
    expect(meetingStatus(meeting('c', '2026-10-25T08:30:00Z'), now)).toBe('open');
    expect(meetingStatus(meeting('d', '2026-10-25T07:30:00Z'), now)).toBe('ended');
    expect(meetingStatus(meeting('e', '2026-10-25T10:10:00Z', { isCancelled: true }), now)).toBe('cancelled');
  });

  it('range les réunions à venir (la plus proche d’abord) et les passées', () => {
    const { upcoming, past } = splitMeetings([
      meeting('loin', '2026-11-01T10:00:00Z'), meeting('proche', '2026-10-25T12:00:00Z'),
      meeting('hier', '2026-10-24T10:00:00Z'), meeting('annulee-passee', '2026-10-20T10:00:00Z', { isCancelled: true }),
    ], now);
    expect(upcoming.map((m) => m.id)).toEqual(['proche', 'loin']);
    expect(past.map((m) => m.id)).toEqual(['hier', 'annulee-passee']);
  });

  it('donne le lien Jitsi avec le nom du membre, ou le lien Zoom de l’admin', () => {
    expect(joinUrl({ meetingId: 'x', jitsiRoom: 'JeSuisKCCiste-abc' }, 'Jean Nzuzi')).toBe('https://meet.jit.si/JeSuisKCCiste-abc#userInfo.displayName=%22Jean%20Nzuzi%22');
    expect(joinUrl({ meetingId: 'x', jitsiRoom: 'JeSuisKCCiste-abc', externalUrl: 'https://zoom.us/j/1' })).toBe('https://zoom.us/j/1');
  });

  it('n’accepte que des liens https', () => {
    expect(normalizeExternalUrl('  ')).toBeNull();
    expect(normalizeExternalUrl('https://meet.google.com/abc-defg-hij')).toBe('https://meet.google.com/abc-defg-hij');
    expect(() => normalizeExternalUrl('javascript:alert(1)')).toThrow('url');
    expect(() => normalizeExternalUrl('http://zoom.us/j/1')).toThrow('url');
  });

  it('convertit une date pour le champ date et heure', () => {
    const iso = new Date(2026, 9, 25, 9, 5).toISOString();
    expect(toLocalInput(iso)).toBe('2026-10-25T09:05');
  });
});
