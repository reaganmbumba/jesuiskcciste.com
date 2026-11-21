import { chromium } from 'playwright';
const now = Date.now();
const b = await chromium.launch();
for (const [w, h, n] of [[360, 640, 'petit'], [393, 852, 'moyen'], [430, 932, 'grand']]) {
const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, locale: 'fr-FR' });

const iso = (m) => new Date(now + m * 60000).toISOString();
const value = { radio: { songs: true, sermons: true, news: true, vocals: true, excluded: [], live: { on_air: false, url: '', title: '' },
  programmes: [{ id: 'a', title: 'Le chemin de la reconnaissance', topic: '', url: 'https://jesuiskcciste.com/audio/x.mp3', startsAt: iso(95), durationSeconds: 1800 },
               { id: 'b', title: 'Journal KCC', topic: '', url: 'https://jesuiskcciste.com/audio/y.mp3', startsAt: iso(300), durationSeconds: 300 }] } };
await p.route(/supabase\.co/, (r) => {
  const u = r.request().url();
  if (u.includes('site_settings')) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(u.includes('single') || r.request().headers()['accept']?.includes('vnd.pgrst.object') ? { value } : [{ value }]) });
  return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
});
await p.addInitScript(() => { try { localStorage.setItem('kcc-locale', 'fr'); } catch {} });
await p.goto('http://localhost:4173/radio/app', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.screenshot({ path: `shot-${n}.png` });
const sc = await p.evaluate(() => { const m = document.querySelector('main'); return [document.documentElement.scrollHeight, innerHeight, m.scrollHeight, m.clientHeight]; });
console.log('SCROLL', n, JSON.stringify(sc));
await p.close();
}
await b.close();
