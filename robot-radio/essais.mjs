// Essais du robot radio : node --test robot-radio/essais.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { target, wrapText, destinations, ffmpegArgs } from './robot.mjs';

const now = Date.parse('2026-11-20T12:00:00Z');
const prog = (startsAt, durationSeconds, id = 'p1') => ({ id, title: 'Culte', topic: 'Sujet', url: 'https://x.test/a.mp3', startsAt, durationSeconds });

test('émission programmée en cours, avec reprise au bon moment', () => {
  const t = target({ programmes: [prog('2026-11-20T11:50:00Z', 1200)] }, now);
  assert.equal(t.kind, 'programme');
  assert.equal(Math.round(t.seek), 600);
  assert.equal(t.endsAt, Date.parse('2026-11-20T12:10:00Z'));
});

test('rien avant le début ni après la fin', () => {
  assert.equal(target({ programmes: [prog('2026-11-20T12:05:00Z', 600)] }, now), null);
  assert.equal(target({ programmes: [prog('2026-11-20T11:00:00Z', 600)] }, now), null);
  assert.equal(target({ programmes: [{ ...prog('2026-11-20T11:59:00Z', 600), url: 'http://x' }] }, now), null);
});

test('direct par flux externe relayé, direct de l’antenne laissé à l’antenne', () => {
  const live = { onAir: true, url: 'https://stream.zeno.fm/abc', title: 'Direct', startedAt: '2026-11-20T11:00:00Z' };
  assert.equal(target({ live, programmes: [prog('2026-11-20T11:50:00Z', 1200)] }, now).kind, 'live');
  assert.equal(target({ live: { ...live, rtc: 'abcdefgh12' } }, now).kind, 'antenne');
  assert.equal(target({ live: { ...live, startedAt: '2026-11-20T05:00:00Z' } }, now), null); // oublié > 6 h
});

test('texte coupé pour l’image', () => {
  assert.equal(wrapText('un deux trois quatre', 9, 3), 'un deux\ntrois\nquatre');
  assert.equal(wrapText('a b c d e f', 1, 2).split('\n').length, 2);
});

test('clé lue dans l’environnement, refusée si illisible', () => {
  assert.deepEqual(destinations({ YOUTUBE_KEY: 'abcd-efgh-ijkl' }), ['rtmp://a.rtmp.youtube.com/live2/abcd-efgh-ijkl']);
  assert.deepEqual(destinations({}), []);
  assert.throws(() => destinations({ YOUTUBE_KEY: 'a b; rm' }));
});

test('ffmpeg : reprise et durée limitée', () => {
  const t = { kind: 'programme', url: 'https://x.test/a.mp3', seek: 30, endsAt: Date.now() + 60000, title: 'T', topic: '' };
  const a = ffmpegArgs(t, ['out.flv'], { badge: 'b', title: ['t'], topic: [], brand: 'm', logo: '' });
  assert.equal(a[a.indexOf('-ss') + 1], '30.0');
  assert.ok(a.includes('-t'));
  assert.equal(a.at(-1), 'out.flv');
});
