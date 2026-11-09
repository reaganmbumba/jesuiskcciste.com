/* Fonctions « pro » de la régie : transitions animées, incrustation, musique, modèles de direct.
 * Chargé après regie.js : utilise S, save, sources, byId, drawSource, Mixer, logo, toast, modal, pickFile, api. */
'use strict';

/* ---------- transitions ---------- */
const TRANSITIONS = {
  fade: 'Fondu', slide: 'Glissé', zoom: 'Zoom', wipe: 'Volet', logo: 'Logo KCC',
};
function drawTransition(ctx, from, to, k, t, W, H) {
  const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // douce au début et à la fin
  const type = S.trans || 'fade';
  if (type === 'slide') {
    ctx.save(); ctx.translate(-e * W, 0); drawSource(ctx, from, W, H, t); ctx.restore();
    ctx.save(); ctx.translate((1 - e) * W, 0); drawSource(ctx, to, W, H, t); ctx.restore();
    ctx.fillStyle = '#d9b25a'; ctx.fillRect((1 - e) * W - 4 * W / 1280, 0, 8 * W / 1280, H);
  } else if (type === 'zoom') {
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 + .25 * e, 1 + .25 * e); ctx.translate(-W / 2, -H / 2); drawSource(ctx, from, W, H, t); ctx.restore();
    ctx.save(); ctx.globalAlpha = e; ctx.translate(W / 2, H / 2); ctx.scale(.8 + .2 * e, .8 + .2 * e); ctx.translate(-W / 2, -H / 2); drawSource(ctx, to, W, H, t); ctx.restore();
  } else if (type === 'wipe') {
    drawSource(ctx, from, W, H, t);
    const x = e * (W + 200 * W / 1280);
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, 0); ctx.lineTo(x - 200 * W / 1280, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
    drawSource(ctx, to, W, H, t); ctx.restore();
    ctx.save(); ctx.strokeStyle = '#f3d27a'; ctx.lineWidth = 6 * W / 1280; ctx.shadowColor = '#f3d27a'; ctx.shadowBlur = 20 * W / 1280;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 200 * W / 1280, H); ctx.stroke(); ctx.restore();
  } else if (type === 'logo') {
    // un disque bleu et or couvre l'image avec le logo, puis s'ouvre sur la nouvelle
    drawSource(ctx, k < .5 ? from : to, W, H, t);
    const c = k < .5 ? k / .5 : (1 - k) / .5, ce = 1 - Math.pow(1 - c, 3);
    const R = Math.hypot(W, H) / 2 * ce;
    ctx.save();
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(1, R));
    g.addColorStop(0, '#1b3378'); g.addColorStop(.85, '#0b1f5c'); g.addColorStop(1, '#d9b25a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 7); ctx.fill();
    if (logo.complete && logo.naturalWidth && ce > .4) {
      const s = 220 * W / 1280 * Math.min(1, (ce - .4) / .6);
      ctx.globalAlpha = Math.min(1, (ce - .4) / .4);
      ctx.translate(W / 2, H / 2); ctx.rotate((1 - ce) * Math.PI * .5);
      ctx.shadowColor = 'rgba(243,210,122,.7)'; ctx.shadowBlur = 40 * W / 1280;
      ctx.drawImage(logo, -s / 2, -s / 2, s, s);
    }
    ctx.restore();
  } else {
    drawSource(ctx, from, W, H, t);
    ctx.save(); ctx.globalAlpha = k; drawSource(ctx, to, W, H, t); ctx.restore();
  }
}
const transDuration = () => Math.max(Number(S.fadeDur), S.trans === 'logo' ? 1200 : 0);

/* ---------- incrustation ---------- */
let pipShownAt = 0, pipHideAt = 0;
function pipRect(W, H, pos, size) {
  const u = W / 1280, m = 28 * u, w = W * size, h = w * 9 / 16;
  const top = 80 * u, bottom = H - h - (S.tickerOn ? 70 : 28) * u;
  return { tl: [m, top], tr: [W - w - m, top], bl: [m, bottom], br: [W - w - m, bottom] }[pos] || [W - w - m, bottom];
}
/** Dessine la source principale (et l'incrustation éventuelle) à la place d'un simple drawSource. */
function drawProgram(ctx, src, W, H, t) {
  const pip = S.pipOn || pipHideAt ? byId(S.pipSrc) : null;
  let k = clamp01((t - pipShownAt) / 450);
  if (!S.pipOn && pipHideAt) { k = 1 - clamp01((t - pipHideAt) / 400); if (k <= 0) pipHideAt = 0; }
  const e = 1 - Math.pow(1 - k, 3);
  if (!pip || pip.id === src?.id || k <= 0) { drawSource(ctx, src, W, H, t); return; }
  const u = W / 1280;
  if (S.pipPos === 'side') {
    // côte à côte : les deux images glissent pour se partager l'écran
    ctx.fillStyle = '#050b22'; ctx.fillRect(0, 0, W, H);
    const g = 16 * u, w = (W - 3 * g) / 2, h = w * 9 / 16, y = (H - h) / 2;
    const mainX = g * e + (1 - e) * 0, mainW = W + (w - W) * e, mainH = H + (h - H) * e, mainY = y * e;
    frameDraw(ctx, src, mainX, mainY, mainW, mainH, t, e);
    frameDraw(ctx, pip, 2 * g + w + (1 - e) * (w + g), y, w, h, t, e);
    return;
  }
  drawSource(ctx, src, W, H, t);
  const [x, y] = pipRect(W, H, S.pipPos, Number(S.pipSize));
  const w = W * Number(S.pipSize), h = w * 9 / 16;
  ctx.save(); ctx.globalAlpha = e;
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(.85 + .15 * e, .85 + .15 * e); ctx.translate(-(x + w / 2), -(y + h / 2));
  frameDraw(ctx, pip, x, y, w, h, t, 1);
  ctx.restore();
}
function frameDraw(ctx, s, x, y, w, h, t, border) {
  const u = ctx.canvas.width / 1280;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 24 * u; ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.translate(x, y); ctx.scale(w / ctx.canvas.width, h / ctx.canvas.height);
  drawSource(ctx, s, ctx.canvas.width, ctx.canvas.height, t);
  ctx.restore();
  if (border > 0) { ctx.save(); ctx.globalAlpha *= border; ctx.strokeStyle = '#d9b25a'; ctx.lineWidth = 4 * u; ctx.strokeRect(x, y, w, h); ctx.restore(); }
}
function setPip(on) {
  if (on && !byId(S.pipSrc)) { toast('Choisissez d\'abord la source à incruster.', 'err'); return; }
  S.pipOn = on; save();
  if (on) { pipShownAt = performance.now(); pipHideAt = 0; } else pipHideAt = performance.now();
  $('pipState').textContent = on ? 'à l\'écran' : 'masquée'; $('pipState').classList.toggle('on', on);
}
function renderPipSources() {
  const sel = $('pipSrc'); if (!sel) return;
  const cur = S.pipSrc;
  sel.innerHTML = '<option value="">— Choisir —</option>' + sources.filter((s) => s.kind !== 'standby').map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
  sel.value = sources.some((s) => s.id === cur) ? cur : '';
}

/* ---------- musique et jingles ---------- */
const Music = (() => {
  const el = new Audio(); el.preload = 'auto';
  let node = null, gain = null, playing = null, fadeT = 0;
  function ensure() {
    if (node) return;
    node = Mixer.ctx.createMediaElementSource(el);
    gain = Mixer.ctx.createGain(); gain.gain.value = 0;
    node.connect(gain);
    Mixer.add('music', '🎵 Musique et jingles', gain, 'music', true);
  }
  function fileUrl(p) { return 'file:///' + p.replace(/\\/g, '/').replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/').replace(/^([A-Za-z])%3A/, '$1:'); }
  function ramp(to, sec) { gain.gain.cancelScheduledValues(Mixer.ctx.currentTime); gain.gain.setTargetAtTime(to, Mixer.ctx.currentTime, Math.max(.01, sec / 3)); }
  async function play(m) {
    ensure(); clearTimeout(fadeT);
    if (Mixer.ctx.state !== 'running') await Mixer.ctx.resume();
    el.src = m.url || fileUrl(m.path); el.loop = !!S.musicLoop; el.currentTime = 0;
    gain.gain.value = 0;
    try { await el.play(); } catch (e) { toast('Lecture impossible : ' + e.message, 'err'); return; }
    playing = m.id; ramp(Number(S.musicVol), m.jingle ? .05 : 1.2); render();
  }
  function stop(fast) {
    if (!playing || !gain) return;
    ramp(0, fast ? .1 : 1.5);
    const id = playing; fadeT = setTimeout(() => { if (playing === id) { el.pause(); playing = null; render(); } }, fast ? 200 : 1800);
  }
  el.addEventListener('ended', () => { playing = null; render(); });
  async function add() {
    const f = await pickFile('audio/*'); if (!f) return;
    const path = api && api.pathFor ? api.pathFor(f) : '';
    const m = { id: 'mu' + Date.now(), name: f.name.replace(/\.[^.]+$/, ''), path };
    if (!path) m.url = URL.createObjectURL(f);
    S.music.push(m); save(); render();
  }
  function render() {
    const box = $('musicList'); if (!box) return;
    box.innerHTML = S.music.length ? '' : '<p class="muted small">Ajoutez des chants, une musique d\'attente ou un jingle.</p>';
    for (const m of S.music) {
      const row = document.createElement('div'); row.className = 'mrow' + (playing === m.id ? ' on' : '');
      row.innerHTML = `<button class="btn small ${playing === m.id ? 'gold' : ''}" data-a="play" title="${playing === m.id ? 'Arrêter en fondu' : 'Lancer'}">${playing === m.id ? '■' : '▶'}</button><span class="mname" title="${esc(m.name)}">${esc(m.name)}</span><label class="check small" title="Jingle : démarre d'un coup"><input type="checkbox" ${m.jingle ? 'checked' : ''}> jingle</label><i title="Retirer">×</i>`;
      row.querySelector('[data-a=play]').onclick = () => (playing === m.id ? stop() : play(m));
      row.querySelector('input').onchange = (e) => { m.jingle = e.target.checked; save(); };
      row.querySelector('i').onclick = () => { if (playing === m.id) stop(true); S.music = S.music.filter((x) => x !== m); save(); render(); };
      box.append(row);
    }
  }
  setInterval(() => {
    const p = $('musicPos'); if (!p) return;
    p.textContent = playing && el.duration ? `${fmt(el.currentTime)} / ${fmt(el.duration)}` : '';
  }, 500);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  return { add, render, stop, setVol: (v) => { if (gain && playing) ramp(v, .2); }, setLoop: (l) => { el.loop = l; } };
})();

/* ---------- modèles de direct ---------- */
const MODEL_KEYS = ['title', 'titleOn', 'badge', 'logoOn', 'clockOn', 'ltName', 'ltRole', 'ltList', 'ltAuto', 'cardText', 'cardRef', 'tickerOn', 'ticker', 'tickerSpeed', 'sbLine1', 'sbLine2', 'sbTime', 'bg', 'bgDim', 'trans', 'fadeDur', 'pipPos', 'pipSize', 'tvName', 'tvSub', 'tvIntroTake', 'tvFlashLabel', 'tvFlashText', 'tvFlashAuto', 'tvEnd1', 'tvEnd2', 'tvEnd3', 'logoAnim', 'logoLabel2', 'titleAnim', 'title2', 'ltStyle', 'qrWhat', 'qrCustom', 'qrText', 'chronoMode', 'chronoMin', 'chronoLabel'];
function renderModels() {
  const sel = $('modelSel'); if (!sel) return;
  sel.innerHTML = S.models.length ? S.models.map((m, i) => `<option value="${i}">${esc(m.name)}</option>`).join('') : '<option value="">Aucun modèle</option>';
}
async function saveModel() {
  const v = await modal('Enregistrer un modèle de direct', '<p class="muted small">Garde le fond, les titres, les noms, le texte défilant et la transition actuels.</p><input id="mdName" placeholder="Culte du dimanche" maxlength="40">', [{ label: 'Annuler', value: null, cls: 'ghost' }, { label: 'Enregistrer', value: 'ok', cls: 'gold' }]);
  const name = document.getElementById('mdName')?.value.trim();
  if (v !== 'ok' || !name) return;
  const data = {}; for (const k of MODEL_KEYS) data[k] = structuredClone(S[k]);
  const i = S.models.findIndex((m) => m.name === name);
  if (i >= 0) S.models[i].data = data; else S.models.push({ name, data });
  save(); renderModels(); $('modelSel').value = String(S.models.findIndex((m) => m.name === name));
  toast('Modèle « ' + esc(name) + ' » enregistré.', 'ok');
}
function loadModel() {
  const m = S.models[Number($('modelSel').value)]; if (!m) return;
  const bg = m.data.bg;
  for (const k of MODEL_KEYS) if (k in m.data && k !== 'bg') S[k] = structuredClone(m.data[k]);
  save(); refreshForm(); if (bg) Fonds.choose(bg);
  toast('Modèle « ' + esc(m.name) + ' » chargé.', 'ok');
}
function deleteModel() {
  const i = Number($('modelSel').value); if (!S.models[i]) return;
  S.models.splice(i, 1); save(); renderModels();
}
/** Remet les champs du formulaire à jour après le chargement d'un modèle. */
function refreshForm() {
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const k = el.dataset.bind; if (el.type === 'checkbox') el.checked = !!S[k]; else el.value = S[k] ?? '';
  });
  renderLtList(); Fonds.render();
  $('fadeBtnLabel').textContent = TRANSITIONS[S.trans] || 'Fondu';
}

function initPro() {
  $('trans').innerHTML = Object.entries(TRANSITIONS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  bindInput('trans', 'trans', 'value', () => { $('fadeBtnLabel').textContent = TRANSITIONS[S.trans]; });
  $('fadeBtnLabel').textContent = TRANSITIONS[S.trans] || 'Fondu';
  // incrustation
  renderPipSources();
  $('pipSrc').onchange = (e) => { S.pipSrc = e.target.value; save(); };
  bindInput('pipPos', 'pipPos'); bindInput('pipSize', 'pipSize');
  $('pipShow').onclick = () => setPip(true); $('pipHide').onclick = () => setPip(false);
  if (S.pipOn) { S.pipOn = false; save(); }
  // musique
  Music.render();
  $('musicAdd').onclick = Music.add; $('musicStop').onclick = () => Music.stop();
  bindInput('musicVol', 'musicVol', 'value', () => Music.setVol(Number(S.musicVol)));
  bindInput('musicLoop', 'musicLoop', 'checked', () => Music.setLoop(S.musicLoop));
  // modèles
  renderModels();
  $('modelLoad').onclick = loadModel; $('modelSave').onclick = saveModel; $('modelDel').onclick = deleteModel;
  // touche P : incrustation
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,select') || !$('modal').hidden) return;
    if (e.key === 'p' || e.key === 'P') setPip(!S.pipOn);
  });
}
initPro();
