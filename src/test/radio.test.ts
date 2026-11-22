import { describe, expect, it } from 'vitest';
import { availableModes, buildRound, currentNews, currentProgramme, effectiveLive, isLiveOn, newCallRoomUrl, onAir, parseCallUrl, parseStreamUrl, radioSettingsOf, sermonItem, songItem, SONGS_BETWEEN_SERMONS, vocalItem, vocalWhatsappUrl, type RadioItem } from '@/features/radio/radio';
import { isVocalFresh, type RadioVocal } from '@/features/radio/vocals';
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
    expect(radioSettingsOf({})).toEqual({ songs: true, sermons: true, news: true, vocals: true, vocalWhatsapp: '', excluded: [], live: { url: '', title: '', onAir: false, startedAt: null, callUrl: '', rtc: '', calls: false, topic: '' }, programmes: [], semaine: [] });
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
  const live = (extra = {}) => ({ url: 'https://stream.zeno.fm/abc', title: 'La voix du KCC', onAir: true, startedAt: '2026-10-22T20:00:00Z', callUrl: '', rtc: '', calls: false, topic: '', ...extra });

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
    expect(isLiveOn(live({ url: '', rtc: 'abcdef0123456789' }), new Date('2026-10-22T21:00:00Z'))).toBe(true);
    expect(radioSettingsOf({ radio: { songs: true, sermons: true, excluded: [] } }).live.onAir).toBe(false);
  });

  it('transforme un numéro en lien WhatsApp et crée une salle d’appel', () => {
    expect(parseCallUrl('+243 840 238 592')).toBe('https://wa.me/243840238592');
    expect(parseCallUrl('meet.jit.si/RadioJeSuisKCCiste-x')).toBe('https://meet.jit.si/RadioJeSuisKCCiste-x');
    expect(parseCallUrl('')).toBeNull();
    expect(() => parseCallUrl('http://exemple.com')).toThrow('call');
    expect(newCallRoomUrl('meet.jit.si', () => 0)).toBe('https://meet.jit.si/RadioJeSuisKCCiste-aaaaaaaa#config.startWithVideoMuted=true');
  });

  it('ouvre chaque tour avec le journal parlé de la semaine', () => {
    const j = { id: 'j1', date: '2026-10-27T06:00:00Z', title: 'Journal', audioUrl: '/j.mp3', durationSeconds: 480 };
    const news = currentNews([j], new Date('2026-10-28T10:00:00Z'))!;
    expect(news.key).toBe('news:j1');
    expect(currentNews([j], new Date('2026-11-05T10:00:00Z'))).toBeNull();
    expect(currentNews([j], new Date('2026-10-26T10:00:00Z'))).toBeNull();
    const all = [news, song('a'), song('b'), talk('p')];
    expect(onAir(all, radioSettingsOf({}), 'songs').map((i) => i.key)).toEqual(['song:a', 'song:b']);
    expect(onAir(all, radioSettingsOf({ radio: { songs: true, sermons: true, news: false, excluded: [] } }), 'all').some((i) => i.kind === 'news')).toBe(false);
    for (let seed = 1; seed < 20; seed++) {
      const round = buildRound(all, seeded(seed), 'song:a');
      expect(round[0].key).toBe('news:j1');
      expect(round[1].key).not.toBe('song:a');
    }
    const songs = [news, ...'abcdefg'.split('').map(song)];
    const kinds = buildRound(songs, seeded(3)).map((i) => i.kind);
    expect(kinds).toEqual(['news', 'song', 'song', 'song', 'news', 'song', 'song', 'song', 'news', 'song']);
    const mixed = buildRound([news, ...'abcdef'.split('').map(song), talk('p')], seeded(3)).map((i) => i.kind);
    expect(mixed).toEqual(['news', 'song', 'song', 'song', 'news', 'sermon', 'song', 'song', 'song']);
  });

  it('passe les vocaux validés des auditeurs entre les chants', () => {
    const v: RadioVocal = { id: 'v1', authorName: 'Marie', place: 'Boma', note: null, audioPath: '/v1.webm', audioSeconds: 30, source: 'site', status: 'approved', approvedAt: new Date().toISOString(), airedAt: null, createdAt: new Date().toISOString() };
    expect(vocalItem(v)).toMatchObject({ key: 'vocal:v1', kind: 'vocal', title: 'Message de Marie', subtitle: 'Boma · auditeur', url: '/v1.webm' });
    expect(vocalItem({ ...v, status: 'pending' })).toBeNull();
    expect(isVocalFresh(v)).toBe(true);
    expect(isVocalFresh({ ...v, approvedAt: '2020-01-01T00:00:00Z' })).toBe(false);
    expect(isVocalFresh({ ...v, status: 'pending' })).toBe(false);

    const voc = (id: string): RadioItem => ({ ...song(id), key: `vocal:${id}`, kind: 'vocal' });
    const all = [song('a'), song('b'), song('c'), song('d'), song('e'), song('f'), voc('x'), voc('y'), voc('z')];
    const round = buildRound(onAir(all, radioSettingsOf({}), 'all'), seeded(3));
    // Un vocal après chaque série de chants, jamais deux de suite ; le troisième attend le tour suivant.
    expect(round.map((i) => i.kind)).toEqual(['song', 'song', 'song', 'vocal', 'song', 'song', 'song', 'vocal']);
    expect(onAir(all, radioSettingsOf({}), 'songs').some((i) => i.kind === 'vocal')).toBe(false);
    expect(onAir(all, radioSettingsOf({ radio: { songs: true, sermons: true, vocals: false, excluded: [] } }), 'all').some((i) => i.kind === 'vocal')).toBe(false);
    expect(buildRound([voc('x'), voc('y')]).length).toBe(2);
  });

  it('transforme le numéro WhatsApp des vocaux en lien', () => {
    expect(vocalWhatsappUrl('+243 840 238 592')).toMatch(/^https:\/\/wa\.me\/243840238592\?text=/);
    expect(vocalWhatsappUrl('')).toBeNull();
    expect(vocalWhatsappUrl('abc')).toBeNull();
  });
});

describe('émissions programmées', () => {
  const p = { id: 'a', title: 'Tosungana', topic: 'Sujet', url: 'https://x.supabase.co/a.mp3', startsAt: '2026-11-20T18:00:00.000Z', durationSeconds: 1800 };
  it('lit, nettoie et trie la liste', () => {
    const r = radioSettingsOf({ radio: { programmes: [{ ...p, id: 'b', startsAt: '2026-11-21T18:00:00.000Z' }, p, { ...p, url: 'http://non' }, { ...p, durationSeconds: 0 }] } } as never);
    expect(r.programmes.map((x) => x.id)).toEqual(['a', 'b']);
  });
  it('passe à l’antenne pendant sa durée seulement', () => {
    const r = radioSettingsOf({ radio: { programmes: [p] } } as never);
    expect(currentProgramme(r.programmes, new Date('2026-11-20T17:59:00Z'))).toBeNull();
    expect(currentProgramme(r.programmes, new Date('2026-11-20T18:10:00Z'))?.id).toBe('a');
    expect(currentProgramme(r.programmes, new Date('2026-11-20T18:30:00Z'))).toBeNull();
    const e = effectiveLive(r, new Date('2026-11-20T18:10:00Z'));
    expect(e.programme?.id).toBe('a');
    expect(isLiveOn(e.live, new Date('2026-11-20T18:10:00Z'))).toBe(true);
    expect(e.live.url).toBe(p.url);
  });
  it('le direct de l’animateur passe avant l’émission programmée', () => {
    const r = radioSettingsOf({ radio: { programmes: [p], live: { onAir: true, rtc: 'abcdefgh12345678', startedAt: '2026-11-20T18:05:00.000Z' } } } as never);
    expect(effectiveLive(r, new Date('2026-11-20T18:10:00Z')).programme).toBeNull();
  });
});

import { parseSemaine } from '@/features/radio/radio';
import { joursLabel } from '@/features/radio/programmePoster';
describe('grille type de la semaine', () => {
  it('garde les créneaux valides, triés par heure', () => {
    const s = parseSemaine([
      { id: 'b', jours: [1, 2], heure: '20:00', source: 'predication' },
      { id: 'a', jours: [7, 9], heure: '05:00', source: 'fichier', url: 'https://jesuiskcciste.com/audio/x.mp3', durationSeconds: 300, titre: 'Prière' },
      { id: 'c', jours: [], heure: '10:00', source: 'emission' },
      { id: 'd', jours: [1], heure: '10h', source: 'emission' },
      { id: 'e', jours: [1], heure: '11:00', source: 'autre' },
    ]);
    expect(s.map((x) => x.id)).toEqual(['a', 'b']);
    expect(s[0]).toMatchObject({ jours: [7], url: 'https://jesuiskcciste.com/audio/x.mp3', durationSeconds: 300 });
    expect(parseSemaine('x')).toEqual([]);
  });
  it('décrit les jours', () => {
    expect(joursLabel([1, 2, 3, 4, 5, 6, 7])).toBe('Tous les jours');
    expect(joursLabel([5, 1, 2, 3, 4])).toBe('Lun – Ven');
    expect(joursLabel([6, 7])).toBe('Sam, Dim');
  });
});

describe('audios récents', () => {
  const song = (id: string, addedAt?: string): RadioItem => ({ key: `song:${id}`, kind: 'song', title: id, subtitle: '', url: `/audio/${id}.mp3`, durationSeconds: 200, imageUrl: null, ...(addedAt ? { addedAt } : {}) });
  it('un chant ajouté récemment passe deux fois par tour, jamais deux fois de suite', async () => {
    const { isRecent } = await import('@/features/radio/radio');
    const now = new Date('2026-11-21T10:00:00Z').getTime();
    const list = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => song(id, id === 'c' ? '2026-11-20T02:00:00Z' : '2026-09-01T00:00:00Z'));
    const round = buildRound(list, () => 0.3, null, (i) => isRecent(i, now));
    const keys = round.filter((i) => i.kind === 'song').map((i) => i.key);
    expect(keys.filter((k) => k === 'song:c')).toHaveLength(2);
    expect(keys.filter((k) => k === 'song:a')).toHaveLength(1);
    keys.forEach((k, i) => { if (i) expect(k).not.toBe(keys[i - 1]); });
    expect(buildRound(list, () => 0.3).filter((i) => i.key === 'song:c')).toHaveLength(1);
  });
});

describe('message de partage de la radio', () => {
  it('nomme ce qui passe et l’émission suivante', async () => {
    const { shareRadioText } = await import('@/features/radio/RadioUi');
    const tx = (fr: string) => fr;
    const now = new Date('2026-11-21T09:00:00Z').getTime();
    const progs = [{ title: 'Le chemin de la reconnaissance', startsAt: '2026-11-21T19:00:00Z' }];
    expect(shareRadioText(tx, { kind: 'song', title: 'Petola motema', subtitle: 'Chorale' }, false, progs, now))
      .toBe('J’écoute le chant « Petola motema » (Chorale) sur Radio Je suis KCCiste. Prochaine émission : « Le chemin de la reconnaissance » à 20h00. Écoutez avec moi, c’est gratuit :');
    expect(shareRadioText(tx, { kind: 'live', title: 'L’heure de la prière', subtitle: '' }, true, [], now)).toContain('l’émission « L’heure de la prière » en ce moment');
    expect(shareRadioText(tx, null, false, [], now)).toBe('J’écoute Radio Je suis KCCiste. Écoutez avec moi, c’est gratuit :');
  });
});

describe('direct du Studio coupé', () => {
  it('un direct sans signe de vie depuis plus de 2 min 30 n’est plus à l’antenne', () => {
    const now = new Date('2026-11-21T12:00:00Z');
    const base = { url: '', title: 'Direct', onAir: true, startedAt: '2026-11-21T11:00:00Z', callUrl: '', rtc: 'session-abcdef12', calls: false, topic: '' };
    expect(isLiveOn({ ...base, beat: '2026-11-21T11:59:30Z' }, now)).toBe(true);
    expect(isLiveOn({ ...base, beat: '2026-11-21T11:55:00Z' }, now)).toBe(false);
    expect(isLiveOn(base, now)).toBe(true); // ancien Studio sans battement
  });
});
