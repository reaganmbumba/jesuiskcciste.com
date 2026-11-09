/* Je suis KCCiste Studio — animations pendant le direct.
 *
 *  - Logo du coin animé (reflet, respiration, retournement, halo de rayons).
 *  - Titre du haut animé (entrée glissée + reflet, alternance avec une 2e ligne, défilement).
 *  - Bandeau du nom : style « moderne » (filet doré qui se trace, nom qui se dévoile).
 *  - Pop-up « Abonnez-vous » avec clic et cloche (touche A).
 *  - Code QR à l'écran : site, groupe WhatsApp ou lien au choix (touche Q).
 *  - Chronomètre ou compte à rebours à l'écran (touche C).
 *  - Réseaux sociaux qui tournent dans le coin (touche R).
 *  - Pluie dorée pour les fêtes (touche K).
 * Remplace drawLogoCorner, drawTitle et drawLowerThird de regie.js (mêmes noms, mêmes variables).
 */
'use strict';
const Anim = (() => {
  const seg = (e, a, b) => clamp01((e - a) / (b - a));
  const back = (k) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const spaced = (ctx, px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; };
  const WHATSAPP = 'https://chat.whatsapp.com/K30ogMwHp0Z7qmQwBhgKvH';
  const SITE = 'https://jesuiskcciste.com';
  const YT = 'https://www.youtube.com/@Jesuiskcciste';

  /* ---------- logo du coin ---------- */
  function shineRect(ctx, x, y, w, h, k, a = .55) {
    if (k <= 0 || k >= 1) return;
    const sx = x - w * .4 + k * w * 1.8, g = ctx.createLinearGradient(sx - w * .25, y, sx + w * .25, y + h);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,246,214,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
  }
  const lay = document.createElement('canvas'); // calque : le reflet ne touche que le logo
  drawLogoCorner = function (ctx, t = performance.now()) { // eslint-disable-line no-global-assign
    const size = 74 * U, m = 22 * U, x = W - m - size, y = m, mode = S.logoAnim || 'fixe';
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14 * U;
    if (mode === 'halo') {
      ctx.save(); ctx.translate(x + size / 2, y + size / 2); ctx.rotate(t / 4000);
      for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = 'rgba(243,210,122,.28)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size * .85, -size * .07); ctx.lineTo(size * .85, size * .07); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    let sx = 1, sc = 1, glow = 0;
    if (mode === 'respire') { sc = 1 + .05 * Math.sin(t / 700); glow = 10 + 10 * Math.sin(t / 700); }
    if (mode === 'retourne') { const p = (t % 15000) / 15000; sx = p < .08 ? Math.cos(p / .08 * Math.PI * 2) : 1; }
    if (logo.complete && logo.naturalWidth) {
      lay.width = Math.ceil(size * 1.2); lay.height = Math.ceil(size * 1.2);
      const l = lay.getContext('2d'); l.clearRect(0, 0, lay.width, lay.height); l.drawImage(logo, size * .1, size * .1, size, size);
      if (mode === 'reflet' || mode === 'respire') shineRect(l, 0, 0, lay.width, lay.height, ((t % 8000) / 1400), .75);
      ctx.save(); ctx.translate(x + size / 2, y + size / 2); ctx.scale(sx * sc, sc);
      if (glow) { ctx.shadowColor = 'rgba(243,210,122,.9)'; ctx.shadowBlur = glow * U; }
      ctx.drawImage(lay, -lay.width / 2, -lay.height / 2); ctx.restore();
    }
    ctx.font = F(11.5, 800); ctx.fillStyle = '#f3d27a'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; spaced(ctx, 1.5 * U);
    let label = 'JE SUIS KCCISTE';
    if (mode !== 'fixe' && S.logoLabel2) { const p = (t / 7000) % 2; label = p < 1 ? 'JE SUIS KCCISTE' : S.logoLabel2; }
    ctx.fillText(label, x + size / 2, y + size + 6 * U); spaced(ctx, 0); ctx.restore();
  };

  /* ---------- titre du haut ---------- */
  let titleShownAt = 0, titleWas = false;
  drawTitle = function (ctx) { // eslint-disable-line no-global-assign
    const t = performance.now();
    if (S.titleOn && !titleWas) titleShownAt = t; titleWas = !!S.titleOn;
    if (!S.titleOn || !S.title) return;
    const mode = S.titleAnim || 'fixe', e = t - titleShownAt;
    let txt = S.title, flip = 1;
    if (mode === 'alterne' && S.title2) {
      const p = (e / 8000) % 2, f = p % 1; txt = p < 1 ? S.title : S.title2;
      if (f > .94) flip = Math.cos((f - .94) / .06 * Math.PI / 2); else if (f < .06 && e > 1000) flip = Math.sin(f / .06 * Math.PI / 2);
    }
    ctx.save(); ctx.font = F(20, 800);
    const h = 40 * U, full = ctx.measureText(txt).width, maxW = W * .5, tw = Math.min(full, maxW), w = tw + 44 * U, x = (W - w) / 2;
    const k = mode === 'fixe' ? 1 : back(seg(e, 0, 650)), y = 18 * U - (1 - k) * 70 * U;
    ctx.translate(W / 2, y + h / 2); ctx.scale(1, Math.max(.02, flip)); ctx.translate(-W / 2, -(y + h / 2));
    rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = 'rgba(5,11,34,.78)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,210,122,.7)'; ctx.lineWidth = 1.5 * U; ctx.stroke();
    ctx.save(); rr(ctx, x, y, w, h, h / 2); ctx.clip();
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
    if (mode === 'defile' && full > maxW) {
      ctx.textAlign = 'left'; const loop = full + 80 * U, off = (e / 1000 * 70 * U) % loop;
      for (let xx = x + 22 * U - off; xx < x + w; xx += loop) ctx.fillText(txt, xx, y + h / 2 + 1 * U);
    } else { ctx.textAlign = 'center'; ctx.fillText(txt, W / 2, y + h / 2 + 1 * U, tw); }
    if (mode !== 'fixe') {
      const sk = (e % 12000) / 1500, sx = x + sk * w, g = ctx.createLinearGradient(sx - 60 * U, 0, sx + 60 * U, 0);
      if (sk < 1) { g.addColorStop(0, 'rgba(243,210,122,0)'); g.addColorStop(.5, 'rgba(243,210,122,.35)'); g.addColorStop(1, 'rgba(243,210,122,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 60 * U, y, 120 * U, h); }
    }
    ctx.restore(); ctx.restore();
  };

  /* ---------- bandeau du nom ---------- */
  const ltClassic = drawLowerThird;
  drawLowerThird = function (ctx, t) { // eslint-disable-line no-global-assign
    if (S.ltStyle !== 'moderne') return ltClassic(ctx, t);
    if (!ltOn && !ltOut) return;
    let e = t - ltShownAt, out = 1;
    if (ltOut) { out = 1 - seg(t, ltOut, ltOut + 500); if (out <= 0) { ltOut = 0; return; } }
    const m = 46 * U, bottom = H - (S.tickerOn ? 58 : 0) * U - 40 * U - (typeof Tv === 'object' ? Tv.flashSpace() : 0);
    ctx.save(); ctx.globalAlpha = out;
    ctx.font = F(32, 800); const nw = ctx.measureText(S.ltName).width; ctx.font = F(18, 600); const rw = ctx.measureText(S.ltRole).width;
    const w = Math.min(Math.max(nw, rw) + 60 * U, W - 2 * m), y = bottom - (S.ltRole ? 84 : 52) * U;
    // filet doré qui se trace
    const lk = ease(seg(e, 0, 450)); ctx.fillStyle = '#d9b25a'; ctx.fillRect(m, y + 46 * U, w * lk, 3 * U);
    // nom : dévoilé du bas vers le haut au-dessus du filet
    const nk = ease(seg(e, 300, 800));
    if (nk > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(m - 10 * U, y - 10 * U, w + 20 * U, 56 * U); ctx.clip();
      const g = ctx.createLinearGradient(m, 0, m + w, 0); g.addColorStop(0, 'rgba(5,11,34,.92)'); g.addColorStop(1, 'rgba(11,31,92,.55)');
      ctx.fillStyle = g; ctx.fillRect(m, y + (1 - nk) * 50 * U, w, 46 * U);
      ctx.font = F(32, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(S.ltName, m + 18 * U, y + 24 * U + (1 - nk) * 50 * U, w - 30 * U); ctx.restore();
      if (typeof Tv === 'object') Tv.shine(ctx, m, y, w, 46 * U, e - 300);
    }
    // fonction : glisse depuis la gauche sous le filet
    const rk = ease(seg(e, 650, 1100));
    if (S.ltRole && rk > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(m, y + 49 * U, w, 36 * U); ctx.clip();
      ctx.fillStyle = 'rgba(217,178,90,.95)'; ctx.font = F(18, 700); const bw = Math.min(rw + 30 * U, w);
      ctx.fillRect(m - (1 - rk) * bw, y + 49 * U, bw, 32 * U);
      ctx.fillStyle = '#0b1530'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(S.ltRole, m + 15 * U - (1 - rk) * bw, y + 66 * U, bw - 24 * U); ctx.restore();
    }
    ctx.restore();
  };

  /* ---------- pop-up « Abonnez-vous » ---------- */
  let subAt = 0; const SUB = 6500;
  function drawSub(ctx, t) {
    if (!subAt) return; const e = t - subAt; if (e > SUB) { subAt = 0; return; }
    const k = back(seg(e, 0, 600)) * (1 - seg(e, SUB - 500, SUB)), w = 400 * U, h = 92 * U;
    const x = 30 * U - (1 - k) * (w + 40 * U), y = H - (S.tickerOn ? 58 : 0) * U - 36 * U - h - (typeof Tv === 'object' ? Tv.flashSpace() : 0);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 20 * U;
    rr(ctx, x, y, w, h, 16 * U); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.save(); ctx.beginPath(); ctx.arc(x + 46 * U, y + h / 2, 30 * U, 0, 7); ctx.fillStyle = '#0b1f5c'; ctx.fill(); ctx.clip();
    if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, x + 18 * U, y + h / 2 - 28 * U, 56 * U, 56 * U); ctx.restore();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = F(19, 800); ctx.fillStyle = '#0f0f0f'; ctx.fillText('Je suis KCCiste', x + 88 * U, y + 34 * U, 150 * U);
    ctx.font = F(13, 600); ctx.fillStyle = '#606060'; ctx.fillText('Chaîne YouTube', x + 88 * U, y + 58 * U);
    const clicked = e > 2600, bx = x + 250 * U, by = y + 26 * U, bw = 132 * U, bh = 40 * U, press = e > 2450 && e < 2650 ? .94 : 1;
    ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(press, press);
    rr(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fillStyle = clicked ? '#e5e5e5' : '#cc0000'; ctx.fill();
    ctx.textAlign = 'center'; ctx.font = F(15, 800); ctx.fillStyle = clicked ? '#0f0f0f' : '#fff'; ctx.fillText(clicked ? 'ABONNÉ ✓' : "S'ABONNER", 0, 1 * U); ctx.restore();
    // cloche qui sonne après le clic
    if (e > 3000) { const r = Math.sin((e - 3000) / 60) * Math.max(0, 1 - (e - 3000) / 1200) * .5; ctx.save(); ctx.translate(bx + bw + 4 * U, y + 18 * U); ctx.rotate(r); ctx.font = F(20, 400); ctx.textAlign = 'center'; ctx.fillText('🔔', 0, 0); ctx.restore(); }
    // curseur qui vient cliquer
    const ck = ease(seg(e, 1000, 2400)), cx = x + w + 80 * U + (bx + bw * .6 - x - w - 80 * U) * ck, cy = y + h + 60 * U + (by + bh * .6 - y - h - 60 * U) * ck;
    if (e > 900 && e < 4200) { ctx.save(); ctx.translate(cx, cy); ctx.scale(U * 1.3, U * 1.3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.lineTo(6, 16); ctx.lineTo(10, 25); ctx.lineTo(14, 23); ctx.lineTo(10, 14); ctx.lineTo(18, 14); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }

  /* ---------- code QR ---------- */
  let qrOn = false, qrAt = 0, qrOut = 0; const qrImg = new Image(); let qrFor = '';
  function qrUrl() { return S.qrWhat === 'whatsapp' ? WHATSAPP : S.qrWhat === 'youtube' ? YT : S.qrWhat === 'autre' ? (S.qrCustom || SITE) : SITE; }
  function qrLabel() { return S.qrText || (S.qrWhat === 'whatsapp' ? 'Rejoignez le groupe WhatsApp' : S.qrWhat === 'youtube' ? 'Abonnez-vous à la chaîne' : 'jesuiskcciste.com'); }
  async function makeQr() { const u = qrUrl(); if (u === qrFor) return; qrFor = u; if (api?.qr) qrImg.src = await api.qr(u); }
  function drawQr(ctx, t) {
    if (!qrOn && !qrOut) return;
    let k = back(seg(t, qrAt, qrAt + 600));
    if (qrOut) { k = 1 - seg(t, qrOut, qrOut + 400); if (k <= 0) { qrOut = 0; return; } }
    const s = 150 * U, pad = 12 * U, w = s + pad * 2, h = s + pad * 2 + 34 * U, x = W - 30 * U - w, y = H - (S.tickerOn ? 58 : 0) * U - 36 * U - h;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-(x + w / 2), -(y + h / 2));
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18 * U; rr(ctx, x, y, w, h, 14 * U); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 3 * U; ctx.strokeStyle = '#d9b25a'; ctx.stroke();
    if (qrImg.complete && qrImg.naturalWidth) ctx.drawImage(qrImg, x + pad, y + pad, s, s);
    ctx.fillStyle = '#0b1f5c'; ctx.font = F(13.5, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(qrLabel(), x + w / 2, y + h - 20 * U, w - 12 * U);
    ctx.restore();
  }

  /* ---------- chronomètre / compte à rebours ---------- */
  let chronoOn = false, chronoAt = 0;
  function drawChrono(ctx, t) {
    if (!chronoOn) return;
    const el = Date.now() - chronoAt, mins = Number(S.chronoMin) || 0;
    let ms = S.chronoMode === 'rebours' ? Math.max(0, mins * 60000 - el) : el;
    const s = Math.floor(ms / 1000), z = (n) => String(n).padStart(2, '0'), txt = (s >= 3600 ? Math.floor(s / 3600) + ':' : '') + z(Math.floor(s % 3600 / 60)) + ':' + z(s % 60);
    const ending = S.chronoMode === 'rebours' && ms < 60000;
    ctx.save(); ctx.font = F(22, 800); const label = S.chronoLabel ? S.chronoLabel + '  ' : '⏱  ';
    const w = ctx.measureText(label + txt).width + 30 * U, h = 40 * U, x = 22 * U, y = 66 * U;
    rr(ctx, x, y, w, h, 9 * U); ctx.fillStyle = ending && Math.floor(t / 500) % 2 ? 'rgba(229,72,77,.92)' : 'rgba(5,11,34,.82)'; ctx.fill();
    ctx.strokeStyle = 'rgba(243,210,122,.7)'; ctx.lineWidth = 1.5 * U; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3d27a'; ctx.fillText(label, x + 15 * U, y + h / 2 + 1 * U);
    ctx.fillStyle = '#fff'; ctx.fillText(txt, x + 15 * U + ctx.measureText(label).width, y + h / 2 + 1 * U); ctx.restore();
  }

  /* ---------- réseaux sociaux qui tournent ---------- */
  let socOn = false, socAt = 0, socOut = 0;
  const SOC = [['▶', '#ff0000', 'YouTube', 'Je suis KCCiste'], ['f', '#1877f2', 'Facebook', 'Je suis KCCiste'], ['✆', '#25d366', 'WhatsApp', 'Groupe Je suis KCCiste'], ['🌐', '#d9b25a', 'Site', 'jesuiskcciste.com']];
  function drawSoc(ctx, t) {
    if (!socOn && !socOut) return;
    let a = seg(t, socAt, socAt + 400); if (socOut) { a = 1 - seg(t, socOut, socOut + 400); if (a <= 0) { socOut = 0; return; } }
    const e = t - socAt, i = Math.floor(e / 5000) % SOC.length, f = (e % 5000) / 5000;
    const flip = f < .08 ? Math.sin(f / .08 * Math.PI / 2) : f > .92 ? Math.cos((f - .92) / .08 * Math.PI / 2) : 1;
    const [ic, col, net, name] = SOC[i];
    ctx.save(); ctx.globalAlpha = a; ctx.font = F(17, 700);
    const w = ctx.measureText(name).width + 74 * U, h = 44 * U, x = W - 22 * U - w, y = 132 * U;
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(1, Math.max(.02, flip)); ctx.translate(-(x + w / 2), -(y + h / 2));
    rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = 'rgba(5,11,34,.82)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x + h / 2, y + h / 2, h / 2 - 5 * U, 0, 7); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = F(16, 900); ctx.fillText(ic, x + h / 2, y + h / 2 + 1 * U);
    ctx.textAlign = 'left'; ctx.font = F(10.5, 800); ctx.fillStyle = '#f3d27a'; ctx.fillText(net.toUpperCase(), x + h + 6 * U, y + 14 * U);
    ctx.font = F(17, 700); ctx.fillStyle = '#fff'; ctx.fillText(name, x + h + 6 * U, y + 30 * U); ctx.restore();
  }

  /* ---------- pluie dorée ---------- */
  let rainOn = false, rainAt = 0, rainOut = 0;
  const flakes = Array.from({ length: 90 }, (_, i) => ({ x: (i * 97.13) % 1, d: .4 + ((i * 37.7) % 1) * .9, r: ((i * 53.3) % 1) * 6.28, s: .6 + ((i * 71.9) % 1) * 1.2, c: i % 3 }));
  function drawRain(ctx, t) {
    if (!rainOn && !rainOut) return;
    let a = seg(t, rainAt, rainAt + 800); if (rainOut) { a = 1 - seg(t, rainOut, rainOut + 1500); if (a <= 0) { rainOut = 0; return; } }
    const e = (t - rainAt) / 1000;
    ctx.save(); ctx.globalAlpha = a;
    for (const p of flakes) {
      const y = ((e * .12 * p.d + p.x * 3.1) % 1.1 - .05) * H, x = (p.x + Math.sin(e * p.d + p.r) * .02) * W, rot = e * 2 * p.d + p.r;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(Math.cos(rot * 1.7), 1);
      ctx.fillStyle = ['#f3d27a', '#d9b25a', '#fff4d1'][p.c]; ctx.fillRect(-4 * U * p.s, -2 * U * p.s, 8 * U * p.s, 4 * U * p.s); ctx.restore();
    }
    ctx.restore();
  }

  function draw(ctx, t) { drawRain(ctx, t); drawChrono(ctx, t); drawSoc(ctx, t); drawQr(ctx, t); drawSub(ctx, t); }

  /* ---------- commandes ---------- */
  const st = (id, on, a = "à l'écran", b = 'masqué') => { const el = $(id); if (el) { el.textContent = on ? a : b; el.classList.toggle('on', on); } };
  const actions = {
    sub: () => { subAt = performance.now(); },
    qr: async () => { if (qrOn) { qrOn = false; qrOut = performance.now(); } else { await makeQr(); qrOn = true; qrOut = 0; qrAt = performance.now(); } st('qrState', qrOn); },
    chrono: () => { chronoOn = !chronoOn; if (chronoOn) chronoAt = Date.now(); st('chronoState', chronoOn, 'en marche', 'arrêté'); },
    soc: () => { if (socOn) { socOn = false; socOut = performance.now(); } else { socOn = true; socOut = 0; socAt = performance.now(); } st('socState', socOn); },
    rain: () => { if (rainOn) { rainOn = false; rainOut = performance.now(); } else { rainOn = true; rainOut = 0; rainAt = performance.now(); } st('rainState', rainOn, 'en cours', 'arrêtée'); },
  };
  function init() {
    if (!$('animSub')) return;
    bindInput('logoAnim', 'logoAnim'); bindInput('logoLabel2', 'logoLabel2'); bindInput('titleAnim', 'titleAnim'); bindInput('title2', 'title2'); bindInput('ltStyle', 'ltStyle');
    bindInput('qrWhat', 'qrWhat', 'value', () => { $('qrCustom').hidden = S.qrWhat !== 'autre'; if (qrOn) makeQr(); });
    bindInput('qrCustom', 'qrCustom', 'value', () => { if (qrOn) makeQr(); }); bindInput('qrText', 'qrText');
    $('qrCustom').hidden = S.qrWhat !== 'autre';
    bindInput('chronoMode', 'chronoMode'); bindInput('chronoMin', 'chronoMin'); bindInput('chronoLabel', 'chronoLabel');
    $('animSub').onclick = actions.sub; $('animQr').onclick = actions.qr; $('animChrono').onclick = actions.chrono; $('animSoc').onclick = actions.soc; $('animRain').onclick = actions.rain;
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,textarea,select') || !$('modal').hidden || e.ctrlKey || e.altKey || e.metaKey) return;
      const a = { a: 'sub', q: 'qr', c: 'chrono', r: 'soc', k: 'rain' }[e.key.toLowerCase()]; if (a) actions[a]();
    });
  }
  init();
  return { draw };
})();
