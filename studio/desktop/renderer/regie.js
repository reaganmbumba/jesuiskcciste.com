/* Je suis KCCiste Studio — la régie.
 *
 * Sources (téléphones en WebRTC, webcams, écran, images, vidéos, écran d'attente)
 * → aperçu / antenne avec coupe ou fondu → habillage dessiné sur le canvas « antenne »
 * → MediaRecorder (image + son mixé) → ffmpeg (main.js) → YouTube / Facebook / fichier.
 */
'use strict';
const $ = (id) => document.getElementById(id);
const api = window.kcc || null; // absent si la page est ouverte hors de l'application (essais)
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (k) => 1 - Math.pow(1 - k, 3);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- réglages gardés sur ce PC ---------- */
const DEFAULTS = {
  logoOn: true, badge: 'live', clockOn: false, titleOn: false, title: '',
  ltName: '', ltRole: '', ltAuto: '0', ltList: [],
  cardText: '', cardRef: '',
  tickerOn: false, ticker: 'Bienvenue sur la chaîne Je suis KCCiste · Abonnez-vous et partagez le direct · jesuiskcciste.com', tickerSpeed: 110,
  sbLine1: 'Le direct commence bientôt', sbLine2: '', sbTime: '',
  fadeDur: '600', quality: '720', encoder: 'auto',
  dests: [
    { name: 'YouTube', url: 'rtmp://a.rtmp.youtube.com/live2', key: '', on: true },
    { name: 'Facebook', url: 'rtmps://live-api-s.facebook.com:443/rtmp', key: '', on: false },
    { name: 'Autre (RTMP)', url: '', key: '', on: false },
  ],
  mic: 'default', micOn: true, micGain: 1, masterGain: 1, followOn: false,
  chans: {}, // par appareil : { on, gain }
  phones: {}, // devId -> { slot, mirror }
};
const S = (() => {
  try { const o = JSON.parse(localStorage.getItem('kcc-studio-regie') || '{}'); return { ...structuredClone(DEFAULTS), ...o }; }
  catch { return structuredClone(DEFAULTS); }
})();
let saveT = 0;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem('kcc-studio-regie', JSON.stringify(S)); } catch {} }, 300); }

/* ---------- journal / messages ---------- */
function logLine(t) {
  const el = $('log'); const d = new Date();
  el.textContent = (`[${d.toLocaleTimeString('fr-FR')}] ${t}\n` + el.textContent).slice(0, 8000);
}
function toast(msg, kind = '', ms = 5000, action) {
  const el = document.createElement('div'); el.className = 'toast ' + kind; el.innerHTML = `<span>${msg}</span>`;
  if (action) { const b = document.createElement('button'); b.className = 'btn small'; b.textContent = action.label; b.onclick = () => { action.fn(); el.remove(); }; el.append(b); }
  $('toasts').append(el); setTimeout(() => el.remove(), ms);
}
function modal(title, bodyHtml, buttons) {
  return new Promise((resolve) => {
    $('mTitle').textContent = title; $('mBody').innerHTML = bodyHtml; $('mBtns').innerHTML = '';
    const close = (v) => { $('modal').hidden = true; resolve(v); };
    for (const b of buttons) { const el = document.createElement('button'); el.className = 'btn ' + (b.cls || ''); el.textContent = b.label; el.onclick = () => close(b.value); $('mBtns').append(el); }
    $('modal').hidden = false;
    $('modal').onclick = (e) => { if (e.target === $('modal')) close(null); };
    $('mBody').addEventListener('click', (e) => { const t = e.target.closest('[data-v]'); if (t) close(t.dataset.v); });
  });
}

/* ---------- images de la marque ---------- */
const logo = new Image(); logo.src = 'img/logo-kcc.png';
const F = (px, w = 700) => `${w} ${px * U}px Archivo, "Segoe UI", sans-serif`;
let U = 1; // échelle : 1 = 1280×720

/* ---------- sources ---------- */
/** source = { id, kind:'standby'|'phone'|'device'|'screen'|'image'|'video', name, el, stream, tile, cv } */
const sources = [];
let pvwId = null, pgmId = null, prevPgmId = null, transStart = 0, transDur = 0, ftb = false, ftbStart = 0;

function addSource(src) {
  sources.push(src);
  src.cv = document.createElement('canvas'); src.cv.width = 320; src.cv.height = 180;
  renderTiles();
  return src;
}
function removeSource(id) {
  const i = sources.findIndex((s) => s.id === id); if (i < 0) return;
  const s = sources[i];
  if (s.kind === 'standby') return;
  if (s.stream && s.kind !== 'phone') s.stream.getTracks().forEach((t) => t.stop());
  if (s.kind === 'phone') Phones.forget(s);
  if (s.url) URL.revokeObjectURL(s.url);
  Mixer.remove(s.id);
  sources.splice(i, 1);
  if (pgmId === id) { pgmId = sources[0].id; }
  if (pvwId === id) { pvwId = null; }
  renderTiles(); tally();
}
const byId = (id) => sources.find((s) => s.id === id);

function renderTiles() {
  const box = $('tiles'); box.innerHTML = '';
  sources.forEach((s, i) => {
    const t = document.createElement('div');
    t.className = 'tile' + (s.id === pgmId ? ' pgm' : s.id === pvwId ? ' pvw' : '') + (s.kind === 'phone' && !s.connected ? ' off' : '');
    t.dataset.id = s.id;
    const label = s.id === pgmId ? 'ANTENNE' : s.id === pvwId ? 'APERÇU' : '';
    t.innerHTML = `<span class="badge" ${label ? '' : 'hidden'}>${label}</span><div class="meta"><span class="num">${i + 1}</span><span class="name" title="${esc(s.name)}">${esc(s.name)}</span>${s.kind === 'phone' ? `<span class="dotc ${s.connected ? 'on' : ''}" title="${s.connected ? 'connectée' : 'déconnectée'}"></span>` : ''}${s.kind !== 'standby' ? '<button class="x" title="Retirer">×</button>' : ''}</div>`;
    t.prepend(s.cv);
    t.onclick = (e) => { if (e.target.classList.contains('x')) { removeSource(s.id); return; } setPreview(s.id); };
    t.ondblclick = (e) => { if (!e.target.classList.contains('x')) take(s.id, 'cut'); };
    s.tile = t; box.append(t);
  });
  $('pvwName').textContent = byId(pvwId)?.name || '—';
  $('pgmName').textContent = byId(pgmId)?.name || '—';
}
function setPreview(id) { pvwId = id; renderTiles(); tally(); }

/** Passe une source à l'antenne. mode = 'cut' | 'fade' */
function take(id, mode) {
  if (!id || !byId(id)) return;
  if (id === pgmId) { ftb = false; return; }
  const old = pgmId;
  prevPgmId = old; pgmId = id;
  transStart = performance.now(); transDur = mode === 'fade' ? Number(S.fadeDur) : 0;
  // l'ancienne antenne devient l'aperçu (comme une vraie régie)
  pvwId = old;
  ftb = false;
  const s = byId(id); if (s.kind === 'video') { s.el.currentTime = 0; s.el.play().catch(() => {}); }
  const o = byId(old); if (o && o.kind === 'video') setTimeout(() => { if (pgmId !== o.id) o.el.pause(); }, transDur + 50);
  Mixer.follow();
  renderTiles(); tally();
}
function tally() { Phones.tally(); }

/* ---------- dessin ---------- */
const pgm = $('pgm'), pctx = pgm.getContext('2d');
const pvw = $('pvw'), vctx = pvw.getContext('2d');
let W = 1280, H = 720;
function setCanvasSize() {
  const q = Number(S.quality);
  const [w, h] = q === 1080 ? [1920, 1080] : [1280, 720];
  if (pgm.width !== w) { pgm.width = w; pgm.height = h; }
  W = w; H = h; U = W / 1280;
}

function srcSize(el) { return el instanceof HTMLVideoElement ? [el.videoWidth, el.videoHeight] : [el.naturalWidth || el.width, el.naturalHeight || el.height]; }
function isReady(el) { if (!el) return false; const [w, h] = srcSize(el); return w > 0 && h > 0; }
function fit(ctx, el, x, y, w, h, mode, mirror) {
  const [sw, sh] = srcSize(el);
  const r = mode === 'cover' ? Math.max(w / sw, h / sh) : Math.min(w / sw, h / sh);
  const dw = sw * r, dh = sh * r;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (mirror) { ctx.translate(x + w, y); ctx.scale(-1, 1); x = 0; y = 0; }
  ctx.drawImage(el, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function wrap(ctx, txt, maxW) {
  const words = String(txt).split(/\s+/).filter(Boolean), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

function brandScreen(ctx, w, h, t, line1, line2, countdown) {
  const u = w / 1280;
  const g = ctx.createRadialGradient(w / 2, h * .42, 0, w / 2, h * .42, Math.max(w, h) * .75);
  g.addColorStop(0, '#1b3378'); g.addColorStop(.55, '#0b1f5c'); g.addColorStop(1, '#050b22');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.strokeStyle = 'rgba(243,210,122,.10)'; ctx.lineWidth = 1.5 * u;
  for (let i = 0; i < 5; i++) { const r = (160 + i * 90) * u + Math.sin(t / 1600 + i) * 6 * u; ctx.beginPath(); ctx.arc(w / 2, h * .42, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(243,210,122,.55)';
  for (let i = 0; i < 40; i++) { const px = (Math.sin(i * 91.7) * .5 + .5) * w, py = ((Math.cos(i * 47.3) * .5 + .5) * h + t * 0.012 * (1 + i % 3)) % h; ctx.globalAlpha = .25 + .35 * Math.abs(Math.sin(t / 900 + i)); ctx.beginPath(); ctx.arc(px, py, (1 + i % 3) * u, 0, 7); ctx.fill(); }
  ctx.restore();
  const size = 190 * u;
  if (logo.complete && logo.naturalWidth) { ctx.save(); ctx.shadowColor = 'rgba(243,210,122,.55)'; ctx.shadowBlur = 30 * u; ctx.drawImage(logo, w / 2 - size / 2, h * .36 - size / 2, size, size); ctx.restore(); }
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${30 * u}px Cinzel, Georgia, serif`; ctx.fillStyle = '#f3d27a';
  if ('letterSpacing' in ctx) ctx.letterSpacing = (4 * u) + 'px';
  ctx.fillText('JE SUIS KCCISTE', w / 2, h * .36 + size / 2 + 36 * u);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  let y = h * .36 + size / 2 + 92 * u;
  if (line1) { ctx.font = `800 ${40 * u}px Archivo, "Segoe UI", sans-serif`; ctx.fillStyle = '#fff'; ctx.fillText(line1, w / 2, y, w * .9); y += 52 * u; }
  if (line2) { ctx.font = `600 ${26 * u}px Archivo, "Segoe UI", sans-serif`; ctx.fillStyle = '#d5d9e4'; ctx.fillText(line2, w / 2, y, w * .9); y += 46 * u; }
  if (countdown) {
    ctx.font = `800 ${46 * u}px Archivo, "Segoe UI", sans-serif`; const tw = ctx.measureText(countdown).width + 50 * u;
    rr(ctx, w / 2 - tw / 2, y - 6 * u, tw, 66 * u, 12 * u); ctx.fillStyle = 'rgba(5,11,34,.7)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,210,122,.7)'; ctx.lineWidth = 2 * u; ctx.stroke();
    ctx.fillStyle = '#f3d27a'; ctx.fillText(countdown, w / 2, y + 27 * u);
  }
  ctx.restore();
}
function countdownText() {
  if (!S.sbTime) return '';
  const [hh, mm] = S.sbTime.split(':').map(Number); const now = new Date(); const tgt = new Date(now); tgt.setHours(hh, mm, 0, 0);
  let ms = tgt - now; if (ms < -60000) return ''; ms = Math.max(0, ms);
  const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60, z = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${z(m)}:${z(sec)}` : `${z(m)}:${z(sec)}`;
}
function placeholder(ctx, w, h, text) {
  ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#9aa2b5'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.max(11, w / 40)}px Archivo, "Segoe UI", sans-serif`; ctx.fillText(text, w / 2, h / 2, w * .9);
}
function drawSource(ctx, s, w, h, t) {
  if (!s) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); return; }
  if (s.kind === 'standby') { brandScreen(ctx, w, h, t, S.sbLine1, S.sbLine2, countdownText()); return; }
  if (s.kind === 'phone' && !s.connected) { placeholder(ctx, w, h, `${s.name} : en attente du téléphone…`); return; }
  if (!isReady(s.el)) { placeholder(ctx, w, h, 'Chargement…'); return; }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  const mode = s.kind === 'phone' || s.kind === 'device' ? 'cover' : 'contain';
  fit(ctx, s.el, 0, 0, w, h, mode, s.mirror);
}

/* habillage (repris du studio du site) */
let ltOn = false, ltShownAt = 0, ltHideAt = 0, ltOut = 0;
let cardOn = false, cardAt = 0, cardOut = 0;
let tickX = null;
function drawLogoCorner(ctx) {
  const size = 74 * U, m = 22 * U, x = W - m - size, y = m;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14 * U;
  if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, x, y, size, size);
  ctx.font = F(11.5, 800); ctx.fillStyle = '#f3d27a'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  if ('letterSpacing' in ctx) ctx.letterSpacing = (1.5 * U) + 'px';
  ctx.fillText('JE SUIS KCCISTE', x + size / 2, y + size + 6 * U); ctx.restore();
}
function drawBadge(ctx, t) {
  if (S.badge === 'none' && !S.clockOn) return;
  const m = 22 * U, h = 34 * U; let x = m; const y = m;
  ctx.save(); ctx.font = F(15, 800); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  if (S.badge !== 'none') {
    const live = S.badge === 'live', label = live ? 'EN DIRECT' : 'JE SUIS KCCISTE';
    const w = ctx.measureText(label).width + (live ? 44 : 28) * U;
    rr(ctx, x, y, w, h, 7 * U); ctx.fillStyle = live ? '#e5484d' : 'rgba(11,31,92,.9)'; ctx.fill();
    if (!live) { ctx.strokeStyle = '#f3d27a'; ctx.lineWidth = 1.5 * U; ctx.stroke(); }
    if (live) { ctx.globalAlpha = .55 + .45 * Math.abs(Math.sin(t / 450)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 17 * U, y + h / 2, 5.5 * U, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.fillStyle = live ? '#fff' : '#f3d27a'; ctx.fillText(label, x + (live ? 30 : 14) * U, y + h / 2 + 1 * U);
    x += w + 8 * U;
  }
  if (S.clockOn) {
    const d = new Date(), txt = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const w = ctx.measureText(txt).width + 24 * U; rr(ctx, x, y, w, h, 7 * U); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(txt, x + 12 * U, y + h / 2 + 1 * U);
  }
  ctx.restore();
}
function drawTitle(ctx) {
  if (!S.titleOn || !S.title) return;
  ctx.save(); ctx.font = F(20, 800);
  const h = 40 * U, tw = Math.min(ctx.measureText(S.title).width, W * .5), w = tw + 44 * U;
  const x = (W - w) / 2, y = 18 * U;
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = 'rgba(5,11,34,.78)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,210,122,.7)'; ctx.lineWidth = 1.5 * U; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(S.title, W / 2, y + h / 2 + 1 * U, tw); ctx.restore();
}
function drawLowerThird(ctx, t) {
  if (!ltOn && !ltOut) return;
  let k = ease(clamp01((t - ltShownAt) / 450));
  if (ltOut) { k = 1 - ease(clamp01((t - ltOut) / 400)); if (k <= 0) { ltOut = 0; return; } }
  const m = 40 * U, bottom = H - (S.tickerOn ? 58 : 0) * U - 34 * U;
  ctx.save(); ctx.font = F(28, 800); const nw = ctx.measureText(S.ltName).width; ctx.font = F(17, 600); const rw = ctx.measureText(S.ltRole).width;
  const w = Math.min(Math.max(nw, rw) + 56 * U, W - 2 * m), h = (S.ltRole ? 86 : 58) * U, x = m - (1 - k) * (w + m), y = bottom - h;
  ctx.globalAlpha = k;
  ctx.fillStyle = '#d9b25a'; ctx.fillRect(x, y, 8 * U, h);
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(11,31,92,.96)'); g.addColorStop(1, 'rgba(11,31,92,.82)');
  ctx.fillStyle = g; ctx.fillRect(x + 8 * U, y, w - 8 * U, h);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = F(28, 800); ctx.fillStyle = '#fff'; ctx.fillText(S.ltName, x + 28 * U, y + (S.ltRole ? 30 : 29) * U, w - 40 * U);
  if (S.ltRole) { ctx.font = F(17, 600); ctx.fillStyle = '#f3d27a'; ctx.fillText(S.ltRole, x + 28 * U, y + 62 * U, w - 40 * U); }
  ctx.restore();
}
function drawCard(ctx, t) {
  if (!cardOn && !cardOut) return;
  if (!S.cardText) return;
  let k = ease(clamp01((t - cardAt) / 500));
  if (cardOut) { k = 1 - clamp01((t - cardOut) / 450); if (k <= 0) { cardOut = 0; return; } }
  ctx.save(); ctx.globalAlpha = k;
  ctx.font = F(28, 600); const maxW = W * .62, lines = wrap(ctx, S.cardText, maxW).slice(0, 7), lh = 28 * 1.32 * U;
  const w = Math.min(W * .9, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 90 * U), h = lines.length * lh + (S.cardRef ? 78 : 52) * U;
  const x = (W - w) / 2, y = H * .5 - h / 2 - 20 * U + (1 - k) * 20 * U;
  rr(ctx, x, y, w, h, 18 * U); ctx.fillStyle = 'rgba(5,11,34,.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,210,122,.85)'; ctx.lineWidth = 2 * U; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  lines.forEach((l, i) => ctx.fillText(l, W / 2, y + 28 * U + lh / 2 + i * lh));
  if (S.cardRef) { ctx.font = F(18, 800); ctx.fillStyle = '#f3d27a'; ctx.fillText(S.cardRef, W / 2, y + h - 26 * U); }
  ctx.restore();
}
function drawTicker(ctx, dt) {
  if (!S.tickerOn || !S.ticker.trim()) { tickX = null; return; }
  const h = 50 * U, y = H - h, lab = 'INFO';
  ctx.save(); ctx.fillStyle = 'rgba(5,11,34,.92)'; ctx.fillRect(0, y, W, h);
  ctx.fillStyle = '#d9b25a'; ctx.fillRect(0, y, W, 3 * U);
  ctx.font = F(19, 600); const txt = S.ticker.replace(/\s+/g, ' ').trim() + '     ◆     ';
  const tw = ctx.measureText(txt).width; ctx.font = F(17, 800); const lw = ctx.measureText(lab).width + 34 * U;
  if (tickX === null) tickX = W;
  tickX -= S.tickerSpeed * U * dt / 1000; if (tickX < lw - tw) tickX += tw;
  ctx.save(); ctx.beginPath(); ctx.rect(lw, y, W - lw, h); ctx.clip();
  ctx.font = F(19, 600); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  for (let x = tickX; x < W; x += tw) ctx.fillText(txt, x, y + h / 2 + 2 * U);
  ctx.restore();
  ctx.fillStyle = '#d9b25a'; ctx.fillRect(0, y, lw, h); ctx.fillStyle = '#0b1530'; ctx.font = F(17, 800); ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(lab, lw / 2, y + h / 2 + 2 * U);
  ctx.restore();
}

let lastT = performance.now(), frameN = 0;
function render() {
  const t = performance.now(), dt = Math.min(100, t - lastT); lastT = t; frameN++;
  setCanvasSize();
  // antenne
  const k = transDur ? clamp01((t - transStart) / transDur) : 1;
  if (k < 1 && prevPgmId) {
    drawSource(pctx, byId(prevPgmId), W, H, t);
    pctx.globalAlpha = k; drawSource(pctx, byId(pgmId), W, H, t); pctx.globalAlpha = 1;
  } else drawSource(pctx, byId(pgmId), W, H, t);
  if (S.logoOn) drawLogoCorner(pctx);
  drawBadge(pctx, t); drawTitle(pctx); drawCard(pctx, t); drawLowerThird(pctx, t); drawTicker(pctx, dt);
  if (ltOn && ltHideAt && Date.now() > ltHideAt) hideLt();
  // fondu au noir par-dessus tout
  const fk = ftb ? clamp01((t - ftbStart) / 800) : 0;
  if (fk > 0) { pctx.globalAlpha = fk; pctx.fillStyle = '#000'; pctx.fillRect(0, 0, W, H); pctx.globalAlpha = 1; }
  // aperçu
  drawSource(vctx, byId(pvwId), pvw.width, pvw.height, t);
  // vignettes : 10 images/s suffisent
  if (frameN % 3 === 0) for (const s of sources) { const c = s.cv.getContext('2d'); drawSource(c, s, c.canvas.width, c.canvas.height, t); }
}
setInterval(render, 1000 / 30);

/* ---------- mixage du son ---------- */
const Mixer = (() => {
  const ctx = new AudioContext({ sampleRate: 48000, latencyHint: 'playback' });
  const dest = ctx.createMediaStreamDestination();
  const master = ctx.createGain(); master.gain.value = S.masterGain;
  const masterAn = ctx.createAnalyser(); masterAn.fftSize = 1024;
  master.connect(dest); master.connect(masterAn);
  let monitorOn = false, muted = false;
  const chans = new Map(); // id -> { label, node, gain, an, kind }
  const buf = new Float32Array(1024);
  const level = (an) => { an.getFloatTimeDomainData(buf); let p = 0; for (const v of buf) p = Math.max(p, Math.abs(v)); const db = 20 * Math.log10(p || 1e-6); return clamp01((db + 60) / 60); };

  function key(id) { const s = byId(id); return s?.devId ? 'p:' + s.devId : id; }
  function cfg(id, defOn) { const k = key(id); if (!S.chans[k]) S.chans[k] = { on: defOn, gain: 1 }; return S.chans[k]; }
  function add(id, label, node, kind, defOn) {
    remove(id);
    const gain = ctx.createGain(), an = ctx.createAnalyser(); an.fftSize = 1024;
    node.connect(gain); gain.connect(master); node.connect(an);
    chans.set(id, { label, node, gain, an, kind });
    apply(); renderChans();
  }
  function remove(id) { const c = chans.get(id); if (!c) return; try { c.node.disconnect(); c.gain.disconnect(); } catch {} chans.delete(id); renderChans(); }
  function apply() {
    for (const [id, c] of chans) {
      const conf = cfg(id, c.kind !== 'phone');
      let on = conf.on;
      if (S.followOn && c.kind === 'phone') on = id === pgmId;
      c.gain.gain.setTargetAtTime(on ? conf.gain : 0, ctx.currentTime, 0.08);
    }
    master.gain.setTargetAtTime(muted ? 0 : S.masterGain, ctx.currentTime, 0.05);
  }
  function renderChans() {
    const box = $('channels'); if (!box) return;
    box.innerHTML = chans.size ? '' : '<p class="muted small">Aucune source de son.</p>';
    for (const [id, c] of chans) {
      const conf = cfg(id, c.kind !== 'phone');
      const el = document.createElement('div'); el.className = 'chan'; el.dataset.id = id;
      el.innerHTML = `<label class="cn check"><input type="checkbox" ${conf.on ? 'checked' : ''}> ${esc(c.label)}</label><span class="muted small">${Math.round(conf.gain * 100)} %</span><div class="meter"><i></i></div><input type="range" min="0" max="2" step="0.05" value="${conf.gain}">`;
      el.querySelector('input[type=checkbox]').onchange = (e) => { conf.on = e.target.checked; apply(); save(); };
      el.querySelector('input[type=range]').oninput = (e) => { conf.gain = Number(e.target.value); el.querySelector('.muted').textContent = Math.round(conf.gain * 100) + ' %'; apply(); save(); };
      box.append(el);
    }
  }
  setInterval(() => {
    $('masterMeter').style.width = (level(masterAn) * 100) + '%';
    for (const [id, c] of chans) { const i = document.querySelector(`.chan[data-id="${CSS.escape(id)}"] .meter i`); if (i) i.style.width = (level(c.an) * 100) + '%'; }
  }, 70);
  document.addEventListener('pointerdown', () => { if (ctx.state !== 'running') ctx.resume(); });
  return {
    ctx, dest, add, remove, apply, renderChans,
    follow: apply,
    setMonitor(on) { monitorOn = on; try { if (on) master.connect(ctx.destination); else master.disconnect(ctx.destination); } catch {} },
    toggleMute() { muted = !muted; apply(); return muted; },
    track: () => dest.stream.getAudioTracks()[0],
  };
})();

/* entrée son du PC */
let micStream = null;
async function listMics() {
  const devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput');
  const sel = $('micSel'); sel.innerHTML = '<option value="none">— Aucune —</option>' + devs.map((d) => `<option value="${esc(d.deviceId)}">${esc(d.label || 'Entrée son')}</option>`).join('');
  sel.value = devs.some((d) => d.deviceId === S.mic) || S.mic === 'none' ? S.mic : (devs[0]?.deviceId || 'none');
}
async function openMic() {
  if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
  Mixer.remove('pc-mic');
  if (S.mic === 'none') return;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: S.mic && S.mic !== 'default' ? { exact: S.mic } : undefined, echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2 } });
    const label = micStream.getAudioTracks()[0]?.label || 'Entrée son du PC';
    Mixer.add('pc-mic', '🎙️ ' + label, Mixer.ctx.createMediaStreamSource(micStream), 'mic', true);
  } catch (e) { toast('Entrée son du PC indisponible : ' + e.message, 'err'); }
}

/* ---------- téléphones (WebRTC) ---------- */
const Phones = (() => {
  let ws = null, port = 0;
  const byCam = new Map(); // camId -> source
  const sendTo = (to, m) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ ...m, to })); };

  function connect(p) {
    port = p;
    ws = new WebSocket(`ws://127.0.0.1:${port}/?role=regie`);
    ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch { return; } onMsg(m); };
    ws.onclose = () => { for (const s of byCam.values()) markOff(s); byCam.clear(); setTimeout(() => connect(port), 1500); };
  }
  function slotFor(devId) {
    const conf = S.phones[devId] || (S.phones[devId] = {});
    if (!conf.slot) { const used = new Set(Object.values(S.phones).map((p) => p.slot)); let n = 1; while (used.has(n)) n++; conf.slot = n; save(); }
    return conf;
  }
  function onMsg(m) {
    if (m.type === 'camera-join') {
      const devId = m.devId || m.id;
      let s = sources.find((x) => x.kind === 'phone' && x.devId === devId);
      const conf = slotFor(devId);
      if (!s) {
        const el = document.createElement('video'); el.muted = true; el.playsInline = true; el.autoplay = true;
        s = { id: 'phone-' + devId, kind: 'phone', devId, el, connected: false, mirror: !!conf.mirror };
        // les téléphones se rangent juste après l'écran d'attente, dans l'ordre de leur numéro
        s.cv = document.createElement('canvas'); s.cv.width = 320; s.cv.height = 180;
        const after = sources.filter((x) => x.kind === 'phone' && (S.phones[x.devId]?.slot || 99) < conf.slot).length;
        sources.splice(1 + after, 0, s);
      }
      if (s.camId && s.camId !== m.id) { byCam.delete(s.camId); closePc(s); }
      s.camId = m.id; s.name = m.name || `Caméra ${conf.slot}`; s.info = m.info || {};
      byCam.set(m.id, s);
      renderTiles(); renderList();
      return;
    }
    const s = byCam.get(m.from || m.id);
    if (m.type === 'camera-leave') { if (s) { markOff(s); byCam.delete(m.id); toast(`${s.name} s'est déconnectée.`, 'err'); } return; }
    if (!s) return;
    if (m.type === 'offer') answer(s, m);
    else if (m.type === 'ice' && s.pc && m.candidate) s.pc.addIceCandidate(m.candidate).catch(() => {});
    else if (m.type === 'status') { s.status = m; renderList(); }
  }
  async function answer(s, m) {
    closePc(s);
    const pc = new RTCPeerConnection({ iceServers: [] }); s.pc = pc;
    pc.onicecandidate = (e) => { if (e.candidate) sendTo(s.camId, { type: 'ice', candidate: e.candidate }); };
    pc.ontrack = (e) => {
      const st = e.streams[0] || new MediaStream([e.track]);
      if (s.el.srcObject !== st) { s.el.srcObject = st; s.el.play().catch(() => {}); }
      s.stream = st;
      if (e.track.kind === 'audio') Mixer.add(s.id, '📱 ' + s.name, Mixer.ctx.createMediaStreamSource(new MediaStream([e.track])), 'phone', false);
    };
    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === 'connected') { s.connected = true; renderTiles(); renderList(); sendTally(s); toast(`✓ ${s.name} connectée.`, 'ok', 3000); }
      if (st === 'failed' || st === 'closed') { if (s.pc === pc) markOff(s); }
    };
    await pc.setRemoteDescription({ type: 'offer', sdp: m.sdp });
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    sendTo(s.camId, { type: 'answer', sdp: pc.localDescription.sdp });
  }
  function closePc(s) { if (s.pc) { try { s.pc.close(); } catch {} s.pc = null; } }
  function markOff(s) { closePc(s); s.connected = false; Mixer.remove(s.id); renderTiles(); renderList(); }
  function sendTally(s) { sendTo(s.camId, { type: 'tally', state: s.id === pgmId ? 'program' : s.id === pvwId ? 'preview' : 'off', live: Live.isLive() }); }
  function tallyAll() { for (const s of byCam.values()) sendTally(s); }
  function forget(s) { if (s.camId) { sendTo(s.camId, { type: 'bye' }); byCam.delete(s.camId); } closePc(s); delete S.phones[s.devId]; save(); renderList(); }

  function renderList() {
    $('camCount').textContent = `📱 ${[...byCam.values()].filter((s) => s.connected).length} caméra${[...byCam.values()].filter((s) => s.connected).length > 1 ? 's' : ''}`;
    const box = $('phoneList');
    const list = sources.filter((s) => s.kind === 'phone');
    if (!list.length) { box.innerHTML = '<p class="muted">Aucun téléphone pour l\'instant.</p>'; return; }
    box.innerHTML = '';
    for (const s of list) {
      const st = s.status || {};
      const el = document.createElement('div'); el.className = 'phone';
      el.innerHTML = `<div class="ph"><span class="dotc ${s.connected ? 'on' : ''}"></span><b>${esc(s.name)}</b><small>${s.connected ? (st.width ? `${st.width}×${st.height}` : 'connectée') : 'déconnectée'}${st.battery != null ? ` · 🔋 ${st.battery} %` : ''}</small></div>
        <div class="row">
          <button class="btn small" data-c="facing" ${s.connected ? '' : 'disabled'}>🔄 ${st.facing === 'user' ? 'Caméra arrière' : 'Caméra avant'}</button>
          <button class="btn small" data-c="torch" ${s.connected && st.torchOk ? '' : 'disabled'}>🔦 Lampe</button>
          <button class="btn small ghost" data-c="mirror">↔ Miroir</button>
          <button class="btn small ghost" data-c="rename">✎ Nom</button>
        </div>`;
      el.querySelectorAll('[data-c]').forEach((b) => b.onclick = async () => {
        const c = b.dataset.c;
        if (c === 'facing') sendTo(s.camId, { type: 'cmd', cmd: 'facing' });
        if (c === 'torch') sendTo(s.camId, { type: 'cmd', cmd: 'torch' });
        if (c === 'mirror') { s.mirror = !s.mirror; (S.phones[s.devId] ||= {}).mirror = s.mirror; save(); }
        if (c === 'rename') {
          const v = await modal('Nom de la caméra', `<input id="rnIn" value="${esc(s.name)}" maxlength="40">`, [{ label: 'Annuler', value: null, cls: 'ghost' }, { label: 'Enregistrer', value: 'ok', cls: 'gold' }]);
          const nv = document.getElementById('rnIn')?.value.trim();
          if (v === 'ok' && nv) { s.name = nv; sendTo(s.camId, { type: 'cmd', cmd: 'name', value: nv }); renderTiles(); renderList(); }
        }
      });
      box.append(el);
    }
  }
  return { connect, tally: tallyAll, forget, renderList };
})();

/* ---------- sources du PC ---------- */
let srcSeq = 0;
async function addDevice() {
  // demander une fois l'autorisation pour avoir les noms
  try { const t = await navigator.mediaDevices.getUserMedia({ video: true }); t.getTracks().forEach((x) => x.stop()); } catch {}
  const devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
  if (!devs.length) { toast('Aucune webcam ni carte d\'acquisition trouvée sur ce PC.', 'err'); return; }
  const id = await modal('Choisir une caméra du PC', `<div class="pick">${devs.map((d) => `<button data-v="${esc(d.deviceId)}">🎥 ${esc(d.label || 'Caméra')}</button>`).join('')}</div>`, [{ label: 'Annuler', value: null, cls: 'ghost' }]);
  if (!id) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: id }, width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } }, audio: false });
    const el = document.createElement('video'); el.muted = true; el.srcObject = stream; el.play().catch(() => {});
    const s = addSource({ id: 'dev' + (++srcSeq), kind: 'device', name: stream.getVideoTracks()[0].label || 'Caméra du PC', el, stream });
    setPreview(s.id);
  } catch (e) { toast('Caméra indisponible : ' + e.message, 'err'); }
}
async function addScreen() {
  if (!api) { toast('Disponible dans l\'application seulement.', 'err'); return; }
  const list = await api.screens();
  const id = await modal('Choisir un écran ou une fenêtre', `<div class="pick">${list.map((s) => `<button data-v="${esc(s.id)}"><img src="${s.thumb}" alt="">${esc(s.name)}</button>`).join('')}</div>`, [{ label: 'Annuler', value: null, cls: 'ghost' }]);
  if (!id) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: id, maxWidth: 1920, maxHeight: 1080, maxFrameRate: 30 } } });
    const el = document.createElement('video'); el.muted = true; el.srcObject = stream; el.play().catch(() => {});
    const s = addSource({ id: 'scr' + (++srcSeq), kind: 'screen', name: '🖥️ ' + (list.find((x) => x.id === id)?.name || 'Écran'), el, stream });
    setPreview(s.id);
  } catch (e) { toast('Capture d\'écran impossible : ' + e.message, 'err'); }
}
function pickFile(accept) {
  return new Promise((resolve) => { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.onchange = () => resolve(i.files[0] || null); i.click(); });
}
async function addImage() {
  const f = await pickFile('image/*'); if (!f) return;
  const url = URL.createObjectURL(f); const el = new Image(); el.src = url;
  const s = addSource({ id: 'img' + (++srcSeq), kind: 'image', name: '🖼️ ' + f.name.replace(/\.[^.]+$/, ''), el, url });
  setPreview(s.id);
}
async function addVideo() {
  const f = await pickFile('video/*'); if (!f) return;
  const url = URL.createObjectURL(f); const el = document.createElement('video'); el.src = url; el.loop = false; el.preload = 'auto'; el.muted = false;
  const s = addSource({ id: 'vid' + (++srcSeq), kind: 'video', name: '🎞️ ' + f.name.replace(/\.[^.]+$/, ''), el, url });
  try { Mixer.add(s.id, s.name, Mixer.ctx.createMediaElementSource(el), 'video', true); } catch {}
  el.addEventListener('loadeddata', () => { el.currentTime = 0.1; });
  setPreview(s.id);
}

/* ---------- direct et enregistrement ---------- */
function pickMime() {
  return ['video/webm;codecs=h264,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t));
}
function outStream() { return new MediaStream([pgm.captureStream(30).getVideoTracks()[0], Mixer.track()]); }
function makeRecorder(onChunk) {
  const q = Number(S.quality);
  const r = new MediaRecorder(outStream(), { mimeType: pickMime(), videoBitsPerSecond: q === 1080 ? 14e6 : q === 720 ? 9e6 : 4e6, audioBitsPerSecond: 192000 });
  let chain = Promise.resolve();
  r.ondataavailable = (e) => { if (e.data && e.data.size) { const b = e.data; chain = chain.then(() => b.arrayBuffer()).then(onChunk); } };
  r.onstop = () => { try { r.stream.getVideoTracks().forEach((t) => t.stop()); } catch {} };
  return r;
}

const Live = (() => {
  let state = 'off'; // off | starting | live | retry
  let recorder = null, startedAt = 0, retryT = 0, retries = 0, lastStats = 0;
  const btn = $('liveBtn');
  function ui() {
    btn.classList.toggle('on', state === 'live');
    btn.classList.toggle('wait', state === 'starting' || state === 'retry');
    $('liveLabel').textContent = state === 'off' ? 'PASSER EN DIRECT' : state === 'starting' ? 'CONNEXION…' : state === 'retry' ? 'RECONNEXION…' : 'ARRÊTER LE DIRECT';
    $('liveStats').hidden = state === 'off';
    $('quality').disabled = state !== 'off';
    Phones.tally();
  }
  function selected() { return S.dests.filter((d) => d.on && d.url.trim()); }
  async function start() {
    const d = selected();
    if (!d.length) { switchTab('out'); toast('Choisissez au moins une destination (YouTube…) et collez sa clé de flux.', 'err'); return; }
    if (d.some((x) => !x.key.trim() && !/^srt:/.test(x.url))) { switchTab('out'); toast('Il manque la clé de flux pour ' + d.filter((x) => !x.key.trim()).map((x) => x.name).join(', ') + '.', 'err'); return; }
    const names = d.map((x) => x.name).join(' + ');
    const ok = await modal('Passer en direct ?', `<p>L'image de l'<b>antenne</b> va être envoyée en direct sur <b>${esc(names)}</b>, qualité ${S.quality}p.</p><p class="muted small">Sur YouTube, le direct apparaît une dizaine de secondes après.</p>`, [{ label: 'Annuler', value: false, cls: 'ghost' }, { label: '● Passer en direct', value: true, cls: 'gold' }]);
    if (!ok) return;
    startedAt = Date.now(); retries = 0; state = 'starting'; ui();
    await launch();
  }
  async function launch() {
    if (!api) { toast('Disponible dans l\'application seulement.', 'err'); state = 'off'; ui(); return; }
    const r = await api.liveStart({ outputs: selected().map((x) => ({ url: x.url, key: x.key })), quality: Number(S.quality), encoder: S.encoder });
    if (!r.ok) { toast(r.error, 'err', 8000); state = 'off'; ui(); return; }
    recorder = makeRecorder((buf) => api.liveChunk(buf));
    recorder.start(250);
    logLine('Direct : envoi démarré');
  }
  function stopRecorder() { if (recorder && recorder.state !== 'inactive') try { recorder.stop(); } catch {} recorder = null; }
  async function stop() {
    const ok = await modal('Arrêter le direct ?', '<p>Le direct s\'arrête pour tout le monde.</p>', [{ label: 'Continuer le direct', value: false, cls: 'ghost' }, { label: 'Arrêter', value: true, cls: 'gold' }]);
    if (!ok) return;
    clearTimeout(retryT); state = 'off'; stopRecorder(); await api.liveStop(); ui(); logLine('Direct arrêté');
    toast('Direct terminé. Durée : ' + dur(Date.now() - startedAt), 'ok');
  }
  function onExit(e) {
    stopRecorder();
    if (state === 'off' || e.expected) return;
    // coupure : on relance tout seul
    retries++;
    state = 'retry'; ui();
    const wait = Math.min(15000, 2000 * retries);
    logLine(`Direct coupé (${e.error || 'code ' + e.code}). Nouvelle tentative dans ${Math.round(wait / 1000)} s.`);
    if (retries === 1 || retries % 5 === 0) toast('Connexion perdue : la régie relance le direct toute seule… ' + esc(e.error || ''), 'err', 7000);
    retryT = setTimeout(async () => { if (state === 'retry') { await launch(); } }, wait);
  }
  function onStats(s) {
    if (state === 'starting' || state === 'retry') { if (s.frame > 30) { state = 'live'; retries = 0; ui(); toast('● Vous êtes en direct !', 'ok'); } }
    lastStats = Date.now();
    const el = $('liveStats');
    const slow = s.speed && s.speed < 0.9;
    el.className = 'pill ' + (state === 'live' ? (slow ? 'warn' : 'ok') : 'warn');
    el.textContent = `${state === 'live' ? '● ' + dur(Date.now() - startedAt) : '…'} · ${Math.round(s.kbps)} kb/s · ${Math.round(s.fps)} img/s${slow ? ' · trop lent' : ''}`;
  }
  btn.onclick = () => (state === 'off' ? start() : stop());
  if (api) { api.onLiveExit(onExit); api.onLiveStats(onStats); api.onLiveLog((t) => logLine(t)); }
  return { isLive: () => state === 'live' };
})();
function dur(ms) { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), z = (n) => String(n).padStart(2, '0'); return (h ? h + ':' : '') + z(m) + ':' + z(s % 60); }

const Rec = (() => {
  let r = null, at = 0, timer = 0;
  async function toggle() {
    if (!api) { toast('Disponible dans l\'application seulement.', 'err'); return; }
    if (!r) {
      const file = await api.recStart();
      r = makeRecorder((buf) => api.recChunk(buf)); r.start(1000); at = Date.now();
      $('recBtn').classList.add('on'); $('recBtn').textContent = '⏹ Arrêter l\'enregistrement'; $('recPill').hidden = false;
      timer = setInterval(() => { $('recTime').textContent = dur(Date.now() - at); }, 500);
      logLine('Enregistrement : ' + file);
    } else {
      const rr2 = r; r = null; clearInterval(timer);
      await new Promise((res) => { rr2.addEventListener('stop', () => setTimeout(res, 300), { once: true }); rr2.stop(); });
      $('recBtn').classList.remove('on'); $('recBtn').textContent = '⏺ Enregistrer'; $('recPill').hidden = true;
      toast('Conversion de l\'enregistrement…', '', 3000);
      const f = await api.recStop();
      if (f) toast('Enregistré : ' + esc(f.split(/[\\/]/).pop()), 'ok', 10000, { label: 'Ouvrir le dossier', fn: () => api.openFolder(f) });
    }
  }
  $('recBtn').onclick = toggle;
  return {};
})();

/* ---------- habillage : formulaire ---------- */
function bindInput(id, prop, kind = 'value', after) {
  const el = $(id); if (!el) return;
  if (kind === 'checked') el.checked = !!S[prop]; else el.value = S[prop] ?? '';
  el.addEventListener(kind === 'checked' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
    S[prop] = kind === 'checked' ? el.checked : (el.type === 'range' ? Number(el.value) : el.value); save(); after && after();
  });
}
function showLt() {
  if (!S.ltName.trim()) { toast('Écrivez d\'abord un nom.', 'err'); return; }
  ltOn = true; ltOut = 0; ltShownAt = performance.now(); ltHideAt = Number(S.ltAuto) ? Date.now() + Number(S.ltAuto) * 1000 : 0;
  $('ltState').textContent = 'à l\'écran'; $('ltState').classList.add('on');
}
function hideLt() { if (!ltOn) return; ltOn = false; ltOut = performance.now(); ltHideAt = 0; $('ltState').textContent = 'masqué'; $('ltState').classList.remove('on'); }
function renderLtList() {
  const box = $('ltList'); box.innerHTML = '';
  S.ltList.forEach((p, i) => {
    const c = document.createElement('span'); c.className = 'chip'; c.title = 'Cliquer pour afficher';
    c.innerHTML = `${esc(p.name)}${p.role ? ' · <span class="muted">' + esc(p.role) + '</span>' : ''} <i title="Retirer">×</i>`;
    c.onclick = (e) => {
      if (e.target.tagName === 'I') { S.ltList.splice(i, 1); save(); renderLtList(); return; }
      S.ltName = p.name; S.ltRole = p.role; $('ltName').value = p.name; $('ltRole').value = p.role; save(); showLt();
    };
    box.append(c);
  });
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === name));
  document.querySelectorAll('.pane').forEach((p) => p.classList.toggle('on', p.dataset.pane === name));
}

function renderDests() {
  const box = $('dests'); box.innerHTML = '';
  S.dests.forEach((d, i) => {
    const el = document.createElement('div'); el.className = 'dest';
    el.innerHTML = `<label class="check"><input type="checkbox" ${d.on ? 'checked' : ''}> <b>${esc(d.name)}</b></label>
      <input type="text" class="u" placeholder="URL du serveur (rtmp://…)" value="${esc(d.url)}">
      <div class="keyrow"><input type="password" class="k" placeholder="Clé de flux" value="${esc(d.key)}" autocomplete="off"><button class="btn small ghost" title="Montrer / cacher">👁</button></div>`;
    el.querySelector('input[type=checkbox]').onchange = (e) => { d.on = e.target.checked; save(); };
    el.querySelector('.u').oninput = (e) => { d.url = e.target.value.trim(); save(); };
    const k = el.querySelector('.k'); k.oninput = (e) => { d.key = e.target.value.trim(); save(); };
    el.querySelector('.keyrow button').onclick = () => { k.type = k.type === 'password' ? 'text' : 'password'; };
    box.append(el);
  });
}

/* ---------- démarrage ---------- */
async function init() {
  // écran d'attente toujours là, en premier
  addSource({ id: 'standby', kind: 'standby', name: 'Écran d\'attente' });
  pgmId = 'standby';

  bindInput('logoOn', 'logoOn', 'checked'); bindInput('badge', 'badge'); bindInput('clockOn', 'clockOn', 'checked');
  bindInput('titleOn', 'titleOn', 'checked'); bindInput('title', 'title');
  bindInput('ltName', 'ltName'); bindInput('ltRole', 'ltRole'); bindInput('ltAuto', 'ltAuto');
  bindInput('cardText', 'cardText'); bindInput('cardRef', 'cardRef');
  bindInput('tickerOn', 'tickerOn', 'checked'); bindInput('ticker', 'ticker'); bindInput('tickerSpeed', 'tickerSpeed');
  bindInput('sbLine1', 'sbLine1'); bindInput('sbLine2', 'sbLine2'); bindInput('sbTime', 'sbTime');
  bindInput('fadeDur', 'fadeDur'); bindInput('quality', 'quality'); bindInput('encoder', 'encoder');
  bindInput('masterGain', 'masterGain', 'value', () => Mixer.apply());
  bindInput('followOn', 'followOn', 'checked', () => Mixer.apply());
  $('ltShow').onclick = showLt; $('ltHide').onclick = hideLt;
  $('ltSave').onclick = () => { if (!S.ltName.trim()) return; if (!S.ltList.some((p) => p.name === S.ltName && p.role === S.ltRole)) S.ltList.push({ name: S.ltName.trim(), role: S.ltRole.trim() }); save(); renderLtList(); };
  $('cardShow').onclick = () => { if (!S.cardText.trim()) { toast('Écrivez d\'abord le texte.', 'err'); return; } cardOn = true; cardOut = 0; cardAt = performance.now(); $('cardState').textContent = 'à l\'écran'; $('cardState').classList.add('on'); };
  $('cardHide').onclick = () => { if (!cardOn) return; cardOn = false; cardOut = performance.now(); $('cardState').textContent = 'masquée'; $('cardState').classList.remove('on'); };
  renderLtList(); renderDests();

  document.querySelectorAll('.tab').forEach((t) => t.onclick = () => switchTab(t.dataset.tab));
  $('cutBtn').onclick = () => take(pvwId, 'cut');
  $('fadeBtn').onclick = () => take(pvwId, 'fade');
  $('ftbBtn').onclick = () => { ftb = !ftb; ftbStart = performance.now(); $('ftbBtn').classList.toggle('on', ftb); };
  $('addBtn').onclick = (e) => { e.stopPropagation(); $('addMenu').hidden = !$('addMenu').hidden; };
  document.addEventListener('click', () => { $('addMenu').hidden = true; });
  $('addMenu').querySelectorAll('[data-add]').forEach((b) => b.onclick = () => {
    $('addMenu').hidden = true;
    ({ device: addDevice, screen: addScreen, image: addImage, video: addVideo })[b.dataset.add]();
  });
  $('muteAll').onclick = () => { const m = Mixer.toggleMute(); $('muteAll').textContent = m ? '🔊 Remettre' : '🔇 Couper'; $('muteAll').classList.toggle('gold', m); };
  $('monitorOn').onchange = (e) => Mixer.setMonitor(e.target.checked);
  $('micSel').onchange = (e) => { S.mic = e.target.value; save(); openMic(); };
  $('ytHelp').onclick = (e) => { e.preventDefault(); api?.openUrl('https://studio.youtube.com/channel/UCg4Hdo9XEX8OI7MQH64iX2g/livestreaming/stream'); };
  $('siteAdmin').onclick = () => api?.openUrl('https://jesuiskcciste.com/admin/directs');
  $('siteDirect').onclick = () => api?.openUrl('https://jesuiskcciste.com/direct');
  $('openRec').onclick = () => api?.openFolder('');

  // raccourcis clavier (pas pendant la saisie)
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,select') || !$('modal').hidden) return;
    if (/^[1-9]$/.test(e.key)) { const s = sources[Number(e.key) - 1]; if (s) { if (e.shiftKey) take(s.id, 'cut'); else setPreview(s.id); } e.preventDefault(); }
    else if (e.key === 'Enter') { take(pvwId, 'cut'); e.preventDefault(); }
    else if (e.key === ' ') { take(pvwId, 'fade'); e.preventDefault(); }
  });

  await listMics(); await openMic();
  navigator.mediaDevices.addEventListener('devicechange', listMics);

  if (api) {
    const info = await api.info();
    $('recDir').textContent = info.recDir;
    const sel = $('addrSel');
    sel.innerHTML = info.addresses.map((a) => `<option>${a}</option>`).join('') || '<option>Pas de réseau</option>';
    const showAddr = () => { const a = sel.value; $('qr').src = info.qrs[a] || ''; $('addrTxt').textContent = info.qrs[a] ? `${a}:${info.port}` : 'Connectez ce PC au Wi-Fi'; };
    sel.onchange = showAddr; showAddr();
    if (!info.addresses.length) { $('netWarn').hidden = false; $('netWarn').textContent = 'Ce PC n\'est relié à aucun réseau : les téléphones ne pourront pas se connecter.'; }
    Phones.connect(info.port);
    api.onServerLog((t) => logLine(t));
    api.encoders().then((list) => {
      const names = { libx264: 'Processeur (x264)', h264_nvenc: 'Carte graphique NVIDIA', h264_qsv: 'Intel Quick Sync', h264_amf: 'Carte graphique AMD' };
      $('encoder').innerHTML = '<option value="auto">Automatique (' + (names[list[0]] || list[0]) + ')</option>' + list.map((x) => `<option value="${x}">${names[x] || x}</option>`).join('');
      $('encoder').value = S.encoder;
    });
  } else {
    // page ouverte hors application (essais) : port passé dans l'adresse
    const p = Number(new URLSearchParams(location.search).get('port') || 8787);
    Phones.connect(p);
  }
  renderTiles(); Phones.renderList(); Mixer.renderChans();
}
init();
window.__kcc = { sources, take, setPreview, S, Mixer, byId };
