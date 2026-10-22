import { describe, expect, it } from 'vitest';
import { availableModes, buildRound, isLiveOn, newCallRoomUrl, onAir, parseCallUrl, parseStreamUrl, radioSettingsOf, sermonItem, songItem, SONGS_BETWEEN_SERMONS, type RadioItem } from '@/features/radio/radio';
import type { AudioSermon, Track } from '@/types';

const song = (id: string): RadioItem => ({ key: `song:${id}`, kind: 'song', title: id, subtitle: '', url: `/${id}.mp3`, durationSeconds: null, imageUrl: null });
const talk = (id: string): RadioItem => ({ ...song(id), key: `sermon:${id}`, kind: 'sermon' });
const seeded = (seed: number) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

describe('Radio Je suis KCCiste', () => {
  it('ne diffuse que les chants autorisés et les prédications publiées', () => {
    const t = { id: 't', title: 'T', author: 'A', artistId: 'a', category: 'c', durationSeconds: 60, audioUrl: '/t.mp3', broadcastRights: 'authorized' } as Track;
    expect(songItem(t, 'Chorale')?.subtitle).toBe('Chorale');
    expect(songItem({ ...t, broadcastRights: 'pending' })).toBeNull();
    expect(songItem({ ...t, audioUrl: null })).toBeNull();
    const s = { id: 's', title: 'S', preacherName: 'Kapapa', preacherTitle: 'Disciple', parish: 'Aéroport', audioUrl: '/s.mp3', published: true } as AudioSermon;
    expect(sermonItem(s)?.subtitle).toBe('Disciple Kapapa · Aéroport');
    expect(sermonItem({ ...s, published: false })).toBeNull();
  });

  it('applique les réglages de l’administration et le choix de l’auditeur', () => {
    const all = [song('a'), song('b'), talk('p')];
    expect(radioSettingsOf({})).toEqual({ songs: true, sermons: true, excluded: [], live: { url: '', title: '', onAir: false, startedAt: null, callUrl: '' } });
    expect(onAir(all, radioSettingsOf({}), 'songs').map((i) => i.key)).toEqual(['song:a', 'song:b']);
    expect(onAir(all, radioSettingsOf({}), 'sermons').map((i) => i.key)).toEqual(['sermon:p']);
    const r = radioSettingsOf({ radio: { songs: true, sermons: false, excluded: ['song:a'] } });
    const items = onAir(all, r, 'all');
    expect(items.map((i) => i.key)).toEqual(['song:b']);
    expect(availableModes(items)).toEqual(['songs']);
    expect(availableModes(all)).toEqual(['all', 'songs', 'sermons']);
  });

  it('passe chaque titre une fois, avec une prédication après chaque série de chants', () => {
    const items = [...'abcdefgh'].map(song).concat([talk('p1'), talk('p2')]);
    const round = buildRound(items, seeded(7));
    expect(round).toHaveLength(items.length);
    expect(new Set(round.map((i) => i.key)).size).toBe(items.length);
    expect(round[SONGS_BETWEEN_SERMONS].kind).toBe('sermon');
    expect(round[2 * SONGS_BETWEEN_SERMONS + 1].kind).toBe('sermon');
  });

  it('ne rejoue pas tout de suite le dernier titre entendu', () => {
    const items = [song('a'), song('b'), song('c')];
    for (let seed = 1; seed < 30; seed++) expect(buildRound(items, seeded(seed), 'song:a')[0].key).not.toBe('song:a');
    expect(buildRound([song('a')], seeded(1), 'song:a')[0].key).toBe('song:a');
  });
});

describe('Radio : émissions en direct et appels', () => {
  const live = (extra = {}) => ({ url: 'https://stream.zeno.fm/abc', title: 'La voix du KCC', onAir: true, startedAt: '2026-10-22T20:00:00Z', callUrl: '', ...extra });

  it('n’accepte que des flux https', () => {
    expect(parseStreamUrl(' https://stream.zeno.fm/abc ')).toBe('https://stream.zeno.fm/abc');
    expect(parseStreamUrl('')).toBeNull();
    expect(() => parseStreamUrl('http://stream.zeno.fm/abc')).toThrow('stream');
    expect(() => parseStreamUrl('zeno')).toThrow('stream');
  });

  it('est à l’antenne quand l’admin l’a lancé, et s’arrête seul au bout de 6 h', () => {
    expect(isLiveOn(live(), new Date('2026-10-22T21:00:00Z'))).toBe(true);
    expect(isLiveOn(live(), new Date('2026-10-23T02:01:00Z'))).toBe(false);
    expect(isLiveOn(live({ onAir: false }), new Date('2026-10-22T21:00:00Z'))).toBe(false);
    expect(isLiveOn(live({ url: '' }), new Date('2026-10-22T21:00:00Z'))).toBe(false);
    expect(radioSettingsOf({ radio: { songs: true, sermons: true, excluded: [] } }).live.onAir).toBe(false);
  });

  it('transforme un numéro en lien WhatsApp et crée une salle d’appel', () => {
    expect(parseCallUrl('+243 840 238 592')).toBe('https://wa.me/243840238592');
    expect(parseCallUrl('meet.jit.si/RadioJeSuisKCCiste-x')).toBe('https://meet.jit.si/RadioJeSuisKCCiste-x');
    expect(parseCallUrl('')).toBeNull();
    expect(() => parseCallUrl('http://exemple.com')).toThrow('call');
    expect(newCallRoomUrl('meet.jit.si', () => 0)).toBe('https://meet.jit.si/RadioJeSuisKCCiste-aaaaaaaa#config.startWithVideoMuted=true');
  });
});
