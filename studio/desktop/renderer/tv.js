/* Je suis KCCiste Studio — animations « comme à la télévision ».
 *
 * Tout est dessiné en direct sur l'antenne, par-dessus l'image (pas de fichier vidéo) :
 *  - Générique d'ouverture (touche G) : logo, rayons dorés, « JE SUIS KCCISTE TV », puis volet doré
 *    qui découvre l'image (et peut passer l'aperçu à l'antenne au même moment).
 *  - Virgule logo (touche V) : bande bleu et or avec le logo qui traverse l'écran, entre deux séquences.
 *  - Bandeau FLASH INFO / ANNONCE (touche F) : bandeau rouge et or qui s'ouvre en bas de l'écran.
 *  - Générique de fin (touche E) : « Merci d'avoir suivi le direct », rappel « Abonnez-vous ».
 * Le bandeau du nom (regie.js) reçoit un reflet doré à son arrivée.
 * Utilise les variables de regie.js (W, H, U, F, logo, S, rr, ease, clamp01, take, pvwId, pgmId).
 */
'use strict';
const Tv = (() => {
  const INTRO = 7000, INTRO_OUT = 6100, STING = 2600;
  let introAt = 0, introTook = false, stingAt = 0;
  let flashOn = false, flashAt = 0, flashOut = 0, flashHideAt = 0;
  let endOn = false, endAt = 0, endOut = 0;
  const easeInOut = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const back = (k) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const seg = (e, a, b) => clamp01((e - a) / (b - a));
  // étincelles fixes (mêmes positions à chaque image)
  const sparks = Array.from({ length: 70 }, (_, i) => { const r = (n) => { const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); }; return { x: r(1), y: r(2), s: .6 + r(3) * 2.2, p: r(4) * 6.28, v: .2 + r(5) * .8 }; });

  function brandBg(ctx, e, alpha) {
    ctx.save(); ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, W * .75);
    g.addColorStop(0, '#16307a'); g.addColorStop(.45, '#0b1f5c'); g.addColorStop(1, '#030a22');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // rayons dorés qui tournent lentement
    ctx.translate(W / 2, H * .42); ctx.rotate(e / 9000);
    for (let i = 0; i < 16; i++) {
      ctx.rotate(Math.PI * 2 / 16);
      const rg = ctx.createLinearGradient(0, 0, W * .8, 0); rg.addColorStop(0, 'rgba(243,210,122,.22)'); rg.addColorStop(1, 'rgba(243,210,122,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W * .8, -W * .05); ctx.lineTo(W * .8, W * .05); ctx.closePath(); ctx.fill();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const p of sparks) {
      const y = ((p.y - e / 1000 * .03 * p.v) % 1 + 1) % 1, a = .35 + .65 * Math.abs(Math.sin(e / 700 * p.v + p.p));
      ctx.globalAlpha = alpha * a * .9; ctx.fillStyle = '#f3d27a'; ctx.beginPath(); ctx.arc(p.x * W, y * H, p.s * U, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  function logoAt(ctx, x, y, size, glow) {
    if (!(logo.complete && logo.naturalWidth)) return;
    ctx.save(); ctx.shadowColor = 'rgba(243,210,122,.75)'; ctx.shadowBlur = glow * U; ctx.drawImage(logo, x - size / 2, y - size / 2, size, size); ctx.restore();
  }
  function spaced(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }

  /* ---------- générique d'ouverture ---------- */
  function drawIntro(ctx, t) {
    if (!introAt) return;
    const e = t - introAt;
    if (e >= INTRO) { introAt = 0; setState('tvIntroState', false); return; }
    if (e >= INTRO_OUT && !introTook) { introTook = true; if (S.tvIntroTake && pvwId && pvwId !== pgmId) take(pvwId, 'cut'); }
    // volet de sortie : le générique reste à droite du front doré
    const ko = easeInOut(seg(e, INTRO_OUT, INTRO)), skew = W * .18, front = -skew + ko * (W + skew * 2);
    ctx.save();
    if (ko > 0) { ctx.beginPath(); ctx.moveTo(front, 0); ctx.lineTo(W + skew, 0); ctx.lineTo(W + skew, H); ctx.lineTo(front - skew, H); ctx.closePath(); ctx.clip(); }
    brandBg(ctx, e, seg(e, 0, 450));
    const cy = H * .40;
    // halo
    const hk = seg(e, 300, 1600);
    if (hk > 0) { const hg = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, 260 * U); hg.addColorStop(0, `rgba(243,210,122,${.45 * hk})`); hg.addColorStop(1, 'rgba(243,210,122,0)'); ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H); }
    // logo
    const lk = seg(e, 450, 1450);
    if (lk > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, lk * 2); logoAt(ctx, W / 2, cy, 200 * U * (.25 + .75 * back(lk)), 40 + 20 * Math.sin(e / 400)); ctx.restore(); }
    // filets dorés
    const fk = ease(seg(e, 1200, 2000)), ly = cy + 140 * U;
    if (fk > 0) { ctx.fillStyle = '#d9b25a'; ctx.fillRect(W / 2 - 330 * U * fk, ly, 660 * U * fk, 2 * U); ctx.fillRect(W / 2 - 330 * U * fk, ly + 92 * U, 660 * U * fk, 2 * U); }
    // titre révélé depuis le centre
    const tk = ease(seg(e, 1500, 2400));
    if (tk > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - W / 2 * tk, ly, W * tk, 92 * U); ctx.clip();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 ${50 * U}px Cinzel, Georgia, serif`; spaced(ctx, 6 * U);
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 12 * U; ctx.fillStyle = '#f3d27a';
      ctx.fillText(S.tvName || 'JE SUIS KCCISTE TV', W / 2, ly + 47 * U, W * .9);
      // reflet qui traverse le titre
      const sk = seg(e, 2700, 3600);
      if (sk > 0 && sk < 1) {
        const sx = W * .15 + sk * W * .7, sg = ctx.createLinearGradient(sx - 90 * U, 0, sx + 90 * U, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.75)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = sg; ctx.fillRect(sx - 90 * U, ly, 180 * U, 92 * U);
      }
      spaced(ctx, 0); ctx.restore();
    }
    // sous-titre
    const st = seg(e, 2300, 2900);
    if (st > 0 && S.tvSub) {
      ctx.save(); ctx.globalAlpha = st; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = F(26, 600); spaced(ctx, 2 * U);
      ctx.fillStyle = '#fff'; ctx.fillText(S.tvSub, W / 2, ly + 140 * U + (1 - ease(st)) * 14 * U, W * .9); spaced(ctx, 0); ctx.restore();
    }
    ctx.restore();
    // bande dorée sur le front du volet
    if (ko > 0 && ko < 1) {
      ctx.save(); const bw = 26 * U;
      const g = ctx.createLinearGradient(front - skew, 0, front + bw, 0); g.addColorStop(0, '#b8892f'); g.addColorStop(.5, '#f3d27a'); g.addColorStop(1, '#b8892f');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(front, 0); ctx.lineTo(front + bw, 0); ctx.lineTo(front + bw - skew, H); ctx.lineTo(front - skew, H); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }

  /* ---------- virgule logo ---------- */
  function drawSting(ctx, t) {
    if (!stingAt) return;
    const e = t - stingAt; if (e >= STING) { stingAt = 0; return; }
    const p = e / STING;
    // entrée rapide, pause au centre, sortie rapide
    const pos = p < .3 ? easeInOut(p / .3) * .5 : p < .7 ? .5 + (p - .3) / .4 * .04 : .54 + easeInOut((p - .7) / .3) * .46;
    const bw = W * .62, skew = W * .14, cx = -bw / 2 - skew + pos * (W + bw + skew * 2);
    ctx.save();
    const x0 = cx - bw / 2;
    ctx.beginPath(); ctx.moveTo(x0 + skew, 0); ctx.lineTo(x0 + bw + skew, 0); ctx.lineTo(x0 + bw, H); ctx.lineTo(x0, H); ctx.closePath();
    const g = ctx.createLinearGradient(x0, 0, x0 + bw + skew, 0); g.addColorStop(0, '#0b1f5c'); g.addColorStop(.5, '#16307a'); g.addColorStop(1, '#0b1f5c');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 10 * U; ctx.strokeStyle = '#d9b25a'; ctx.stroke();
    ctx.clip();
    brandBg(ctx, e + 4000, .55);
    const cxm = cx + skew / 2;
    logoAt(ctx, cxm, H * .42, 170 * U * (.9 + .1 * Math.sin(p * Math.PI)), 34);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 ${34 * U}px Cinzel, Georgia, serif`; spaced(ctx, 4 * U);
    ctx.fillStyle = '#f3d27a'; ctx.fillText(S.tvName || 'JE SUIS KCCISTE TV', cxm, H * .42 + 130 * U, bw * .9); spaced(ctx, 0);
    ctx.restore();
    // traînée dorée derrière la bande
    ctx.save(); ctx.globalAlpha = .5;
    ctx.fillStyle = '#f3d27a'; ctx.beginPath(); ctx.moveTo(x0 + skew - 40 * U, 0); ctx.lineTo(x0 + skew - 16 * U, 0); ctx.lineTo(x0 - 16 * U, H); ctx.lineTo(x0 - 40 * U, H); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  /* ---------- bandeau FLASH INFO ---------- */
  function flashSpace() { return flashOn || flashOut ? 76 * U : 0; }
  function drawFlash(ctx, t) {
    if (!flashOn && !flashOut) return;
    if (flashOn && flashHideAt && Date.now() > flashHideAt) hideFlash();
    const e = t - flashAt;
    let lk = ease(seg(e, 0, 350)), bk = ease(seg(e, 200, 650));
    if (flashOut) { const o = seg(t, flashOut, flashOut + 450); if (o >= 1) { flashOut = 0; return; } bk = 1 - ease(seg(t, flashOut, flashOut + 300)); lk = 1 - ease(seg(t, flashOut + 150, flashOut + 450)); }
    const m = 40 * U, h = 58 * U, y = H - (S.tickerOn ? 58 : 0) * U - 30 * U - h;
    const label = (S.tvFlashLabel || 'FLASH INFO').toUpperCase();
    ctx.save(); ctx.font = F(22, 900); spaced(ctx, 1.5 * U);
    const lw = ctx.measureText(label).width + 40 * U, full = W - 2 * m;
    // bande sombre qui s'ouvre vers la droite
    if (bk > 0) {
      const bx = m + lw, bw = (full - lw) * bk;
      const g = ctx.createLinearGradient(bx, 0, bx + full, 0); g.addColorStop(0, 'rgba(5,11,34,.95)'); g.addColorStop(1, 'rgba(11,31,92,.9)');
      ctx.fillStyle = g; ctx.fillRect(bx, y, bw, h);
      ctx.fillStyle = '#d9b25a'; ctx.fillRect(bx, y - 3 * U, bw, 3 * U);
      ctx.save(); ctx.beginPath(); ctx.rect(bx, y, bw, h); ctx.clip();
      spaced(ctx, 0); ctx.font = F(25, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const txt = (S.tvFlashText || '').replace(/\s+/g, ' ').trim(), room = full - lw - 44 * U, tw = ctx.measureText(txt).width;
      ctx.globalAlpha = seg(e, 450, 800);
      if (tw <= room) ctx.fillText(txt, bx + 22 * U, y + h / 2 + 1 * U);
      else { // texte trop long : il défile dans le bandeau
        const loop = tw + 120 * U, off = ((e - 900) / 1000 * 90 * U) % loop;
        for (let x = bx + 22 * U - Math.max(0, off); x < bx + bw; x += loop) ctx.fillText(txt, x, y + h / 2 + 1 * U);
      }
      ctx.restore();
    }
    // étiquette rouge qui clignote doucement
    if (lk > 0) {
      const lx = m - (1 - lk) * (lw + m);
      ctx.fillStyle = '#d42a2f'; ctx.fillRect(lx, y, lw, h);
      ctx.globalAlpha = .25 + .25 * Math.sin(t / 260); ctx.fillStyle = '#ff6b6b'; ctx.fillRect(lx, y, lw, h); ctx.globalAlpha = 1;
      ctx.fillStyle = '#f3d27a'; ctx.fillRect(lx, y + h - 4 * U, lw, 4 * U);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = F(22, 900); spaced(ctx, 1.5 * U);
      ctx.fillText(label, lx + lw / 2, y + h / 2);
    }
    spaced(ctx, 0); ctx.restore();
  }

  /* ---------- générique de fin ---------- */
  function drawEnd(ctx, t) {
    if (!endOn && !endOut) return;
    const e = t - endAt;
    let a = seg(e, 0, 900);
    if (endOut) { a = 1 - seg(t, endOut, endOut + 800); if (a <= 0) { endOut = 0; return; } }
    ctx.save(); ctx.globalAlpha = a;
    brandBg(ctx, e, 1);
    const cy = H * .30;
    logoAt(ctx, W / 2, cy, 150 * U * (.85 + .15 * back(seg(e, 200, 1100))), 30 + 14 * Math.sin(e / 500));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 10 * U;
    const k1 = ease(seg(e, 500, 1300));
    ctx.globalAlpha = a * k1; ctx.font = `700 ${44 * U}px Cinzel, Georgia, serif`; ctx.fillStyle = '#f3d27a';
    ctx.fillText(S.tvEnd1 || "Merci d'avoir suivi le direct", W / 2, cy + 130 * U + (1 - k1) * 20 * U, W * .9);
    const k2 = ease(seg(e, 900, 1700));
    if (S.tvEnd2) { ctx.globalAlpha = a * k2; ctx.font = F(26, 600); ctx.fillStyle = '#fff'; ctx.fillText(S.tvEnd2, W / 2, cy + 190 * U, W * .9); }
    // bouton « S'ABONNER » qui pulse
    const k3 = seg(e, 1400, 2000);
    if (k3 > 0) {
      ctx.shadowBlur = 0; ctx.globalAlpha = a * k3;
      const pulse = 1 + .04 * Math.sin(e / 260), bw = 250 * U * pulse, bh = 58 * U * pulse, bx = W / 2 - bw / 2, by = cy + 245 * U;
      rr(ctx, bx, by, bw, bh, 10 * U); ctx.fillStyle = '#e5212b'; ctx.fill();
      ctx.font = F(24, 900); ctx.fillStyle = '#fff'; ctx.fillText("🔔  S'ABONNER", W / 2, by + bh / 2 + 1 * U);
    }
    const k4 = seg(e, 1900, 2500);
    if (k4 > 0) {
      ctx.globalAlpha = a * k4; ctx.font = F(20, 700); ctx.fillStyle = '#f3d27a'; spaced(ctx, 2 * U);
      ctx.fillText(S.tvEnd3 || 'jesuiskcciste.com', W / 2, H - 52 * U, W * .9); spaced(ctx, 0);
    }
    ctx.restore();
  }

  /* reflet doré sur le bandeau du nom (appelé par regie.js) */
  function shine(ctx, x, y, w, h, e) {
    const k = seg(e, 450, 1250); if (k <= 0 || k >= 1) return;
    const sx = x + k * (w + 160 * U) - 80 * U, g = ctx.createLinearGradient(sx - 80 * U, 0, sx + 80 * U, 0);
    g.addColorStop(0, 'rgba(243,210,122,0)'); g.addColorStop(.5, 'rgba(255,240,200,.45)'); g.addColorStop(1, 'rgba(243,210,122,0)');
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(sx - 80 * U, y, 160 * U, h); ctx.restore();
  }

  function draw(ctx, t) { drawFlash(ctx, t); drawEnd(ctx, t); drawSting(ctx, t); drawIntro(ctx, t); }

  /* ---------- commandes ---------- */
  function setState(id, on, txtOn = "à l'écran", txtOff = 'masqué') { const el = $(id); if (!el) return; el.textContent = on ? txtOn : txtOff; el.classList.toggle('on', on); }
  function playIntro() { introAt = performance.now(); introTook = false; setState('tvIntroState', true, 'en cours'); }
  function playSting() { stingAt = performance.now(); }
  function showFlash() {
    if (!String(S.tvFlashText || '').trim()) { toast("Écrivez d'abord le texte du bandeau.", 'err'); return; }
    flashOn = true; flashOut = 0; flashAt = performance.now(); flashHideAt = Number(S.tvFlashAuto) ? Date.now() + Number(S.tvFlashAuto) * 1000 : 0; setState('tvFlashState', true);
  }
  function hideFlash() { if (!flashOn) return; flashOn = false; flashOut = performance.now(); setState('tvFlashState', false); }
  function showEnd() { endOn = true; endOut = 0; endAt = performance.now(); setState('tvEndState', true); }
  function hideEnd() { if (!endOn) return; endOn = false; endOut = performance.now(); setState('tvEndState', false); }

  function init() {
    if (!$('tvIntro')) return;
    bindInput('tvName', 'tvName'); bindInput('tvSub', 'tvSub'); bindInput('tvIntroTake', 'tvIntroTake', 'checked');
    bindInput('tvFlashLabel', 'tvFlashLabel'); bindInput('tvFlashText', 'tvFlashText'); bindInput('tvFlashAuto', 'tvFlashAuto');
    bindInput('tvEnd1', 'tvEnd1'); bindInput('tvEnd2', 'tvEnd2'); bindInput('tvEnd3', 'tvEnd3');
    $('tvIntro').onclick = playIntro; $('tvSting').onclick = playSting;
    $('tvFlashShow').onclick = showFlash; $('tvFlashHide').onclick = hideFlash;
    $('tvEndShow').onclick = showEnd; $('tvEndHide').onclick = hideEnd;
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,textarea,select') || !$('modal').hidden || e.ctrlKey || e.altKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      if (k === 'g') playIntro();
      else if (k === 'v') playSting();
      else if (k === 'f') (flashOn ? hideFlash() : showFlash());
      else if (k === 'e') (endOn ? hideEnd() : showEnd());
    });
  }
  init();
  return { draw, flashSpace, shine, playIntro, playSting, showFlash, hideFlash, showEnd, hideEnd };
})();
