import { describe, expect, it } from 'vitest';
import { availableModes, buildRound, onAir, radioSettingsOf, sermonItem, songItem, SONGS_BETWEEN_SERMONS, type RadioItem } from '@/features/radio/radio';
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
    expect(radioSettingsOf({})).toEqual({ songs: true, sermons: true, excluded: [] });
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
