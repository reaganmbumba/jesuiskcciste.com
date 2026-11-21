import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2, locale: 'fr-FR' });
const now = Date.now();
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
await p.screenshot({ path: 'shot-app.png', fullPage: true });
await b.close();
