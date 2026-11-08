const test = require('node:test');
const assert = require('node:assert');
const WebSocket = require('ws');
const { outputUrl, hideKeys } = require('../output');
const { startServer } = require('../server');

test('adresse du direct : serveur + clé', () => {
  assert.equal(outputUrl({ url: 'rtmp://a.rtmp.youtube.com/live2/', key: 'abcd-1234-efgh' }), 'rtmp://a.rtmp.youtube.com/live2/abcd-1234-efgh');
  assert.equal(outputUrl({ url: 'rtmps://live-api-s.facebook.com:443/rtmp', key: 'FB-1?s_bl=1&a=b' }), 'rtmps://live-api-s.facebook.com:443/rtmp/FB-1?s_bl=1&a=b');
  assert.ok(outputUrl({ url: 'http://exemple', key: 'abcd' }).error);
  assert.ok(outputUrl({ url: 'rtmp://a.rtmp.youtube.com/live2', key: '' }).error);
  // copier-coller imparfaits
  assert.equal(outputUrl({ url: 'rtmp://a.rtmp.youtube.com/live2', key: ' ab cd-12\u200B34 \n' }), 'rtmp://a.rtmp.youtube.com/live2/abcd-1234');
  assert.equal(outputUrl({ url: 'rtmp://a.rtmp.youtube.com/live2', key: 'rtmp://a.rtmp.youtube.com/live2/abcd-1234' }), 'rtmp://a.rtmp.youtube.com/live2/abcd-1234');
  assert.equal(outputUrl({ url: ' rtmp://a.rtmp.youtube.com/live2 ', key: 'xxxx-yyyy-zzzz-wwww-vvvv' }), 'rtmp://a.rtmp.youtube.com/live2/xxxx-yyyy-zzzz-wwww-vvvv');
  assert.ok(outputUrl({ url: 'rtmp://a.rtmp.youtube.com/live2', key: 'rtmp://a.rtmp.youtube.com/live2' }).error);
});

test('les clés ne sont jamais affichées', () => {
  assert.equal(hideKeys('Error rtmp://a.rtmp.youtube.com/live2/abcd-1234-efgh: I/O'), 'Error rtmp://a.rtmp.youtube.com/live2/••••: I/O');
});

const open = (url) => new Promise((res, rej) => { const ws = new WebSocket(url); const q = []; ws.on('message', (d) => q.push(JSON.parse(d))); ws.once('open', () => res({ ws, q })); ws.once('error', rej); });
const until = async (fn) => { for (let i = 0; i < 100; i++) { const v = fn(); if (v) return v; await new Promise((r) => setTimeout(r, 20)); } throw new Error('délai dépassé'); };

test('mise en relation régie ↔ téléphone', async () => {
  const srv = await startServer({ port: 18787 });
  const base = `ws://127.0.0.1:${srv.port}/`;
  const cam = await open(base + '?role=camera');
  const welcome = await until(() => cam.q.find((m) => m.type === 'welcome'));
  cam.ws.send(JSON.stringify({ type: 'hello', name: 'Caméra 1', devId: 'tel-1' }));
  const regie = await open(base + '?role=regie');
  const join = await until(() => regie.q.find((m) => m.type === 'camera-join'));
  assert.equal(join.name, 'Caméra 1'); assert.equal(join.id, welcome.id);
  await until(() => cam.q.find((m) => m.type === 'regie-ready'));
  cam.ws.send(JSON.stringify({ type: 'offer', sdp: 'x' }));
  const offer = await until(() => regie.q.find((m) => m.type === 'offer'));
  assert.equal(offer.from, welcome.id);
  regie.ws.send(JSON.stringify({ to: welcome.id, type: 'answer', sdp: 'y' }));
  const ans = await until(() => cam.q.find((m) => m.type === 'answer'));
  assert.equal(ans.sdp, 'y'); assert.equal(ans.to, undefined);
  cam.ws.close();
  await until(() => regie.q.find((m) => m.type === 'camera-leave'));
  regie.ws.close(); srv.close();
});
