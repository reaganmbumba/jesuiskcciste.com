/* KCC Studio Caméra : le téléphone envoie son image et son son à la régie (WebRTC sur le Wi-Fi). */
'use strict';
const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem('kcccam-' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('kcccam-' + k, JSON.stringify(v)); } catch {} },
};
const devId = store.get('devId', null) || (() => { const id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()); store.set('devId', id); return id; })();

let host = '', ws = null, pc = null, stream = null, wantOn = false, retryT = 0, statusT = 0;
let facing = store.get('facing', 'environment'), hd = store.get('hd', false), micOn = true, torch = false;
let tallyState = 'off';

function show(id) { for (const v of ['setup', 'scan', 'live']) $(v).hidden = v !== id; }
function msg(t) { $('msg').hidden = !t; $('msg').textContent = t || ''; }
function setState(text, cls) { const el = $('state'); el.textContent = text; el.className = 'st ' + (cls || ''); }

/** « 192.168.1.20:8787 », « http://192.168.1.20:8787/camera » → « 192.168.1.20:8787 » */
function parseHost(v) {
  v = String(v || '').trim();
  const m = /^(?:https?:\/\/)?([0-9A-Za-z.-]+)(?::(\d{2,5}))?/.exec(v);
  if (!m) return '';
  return `${m[1]}:${m[2] || 8787}`;
}

/* ---------- réglage ---------- */
function renderRecent() {
  const list = store.get('recent', []);
  $('recent').innerHTML = '';
  for (const h of list) { const b = document.createElement('button'); b.textContent = h; b.onclick = () => { $('host').value = h; }; $('recent').append(b); }
}
$('host').value = store.get('host', '');
$('name').value = store.get('name', '');
renderRecent();

$('goBtn').onclick = () => start($('host').value);
$('scanBtn').onclick = startScan;
$('scanCancel').onclick = stopScan;

async function start(v) {
  const h = parseHost(v);
  const err = $('setupErr');
  if (!h) { err.hidden = false; err.textContent = 'Adresse invalide. Exemple : 192.168.1.20:8787'; return; }
  err.hidden = true;
  host = h; store.set('host', h);
  store.set('recent', [h, ...store.get('recent', []).filter((x) => x !== h)].slice(0, 4));
  store.set('name', $('name').value.trim());
  show('live'); $('nm').textContent = camName();
  try { await openCamera(); }
  catch (e) { show('setup'); err.hidden = false; err.textContent = 'Impossible d\'ouvrir la caméra : ' + (e.message || e.name) + '. Autorisez la caméra et le micro pour cette application.'; return; }
  wantOn = true; connect();
  if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {});
}
function camName() { return $('name').value.trim() || 'Caméra'; }

/* ---------- scanner le QR ---------- */
let scanStream = null, scanTimer = 0;
async function startScan() {
  show('scan');
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
  } catch (e) { show('setup'); $('setupErr').hidden = false; $('setupErr').textContent = 'Caméra refusée : ' + (e.message || e.name); return; }
  const v = $('scanVideo'); v.srcObject = scanStream; await v.play().catch(() => {});
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d', { willReadFrequently: true });
  const detector = 'BarcodeDetector' in window ? new BarcodeDetector({ formats: ['qr_code'] }) : null;
  scanTimer = setInterval(async () => {
    if (!v.videoWidth) return;
    let text = '';
    if (detector) { try { const r = await detector.detect(v); if (r[0]) text = r[0].rawValue; } catch {} }
    if (!text && window.jsQR) {
      const w = 640, h = Math.round(640 * v.videoHeight / v.videoWidth); cv.width = w; cv.height = h;
      ctx.drawImage(v, 0, 0, w, h);
      const r = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
      if (r) text = r.data;
    }
    if (text && parseHost(text)) { $('host').value = parseHost(text); stopScan(); if (navigator.vibrate) navigator.vibrate(80); start(text); }
  }, 250);
}
function stopScan() { clearInterval(scanTimer); if (scanStream) scanStream.getTracks().forEach((t) => t.stop()); scanStream = null; if (!$('scan').hidden) show('setup'); }

/* ---------- caméra ---------- */
function videoConstraints() {
  return { facingMode: { ideal: facing }, width: { ideal: hd ? 1920 : 1280 }, height: { ideal: hd ? 1080 : 720 }, frameRate: { ideal: 30, max: 30 } };
}
async function openCamera() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = await navigator.mediaDevices.getUserMedia({
    video: videoConstraints(),
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true, channelCount: 1 },
  });
  const vt = stream.getVideoTracks()[0]; if (vt) vt.contentHint = 'motion';
  stream.getAudioTracks().forEach((t) => { t.enabled = micOn; });
  $('preview').srcObject = stream; $('preview').play().catch(() => {});
  $('preview').style.transform = facing === 'user' ? 'scaleX(-1)' : '';
  torch = false; updateButtons();
}
/** Change seulement la vidéo (avant/arrière, qualité) sans couper la liaison. */
async function reopenVideo() {
  const old = stream.getVideoTracks()[0];
  if (old) old.stop(); // certains téléphones n'ouvrent pas deux caméras à la fois
  let ns;
  try { ns = await navigator.mediaDevices.getUserMedia({ video: videoConstraints(), audio: false }); }
  catch (e) { msg('Caméra indisponible : ' + (e.message || e.name)); setTimeout(() => msg(''), 3000); return; }
  const nt = ns.getVideoTracks()[0]; nt.contentHint = 'motion';
  if (old) stream.removeTrack(old);
  stream.addTrack(nt);
  const sender = pc && pc.getSenders().find((s) => s.track === old || (s.track && s.track.kind === 'video') || (!s.track && s !== audioSender()));
  if (sender) await sender.replaceTrack(nt).catch(() => {});
  $('preview').srcObject = stream;
  $('preview').style.transform = facing === 'user' ? 'scaleX(-1)' : '';
  torch = false; updateButtons(); sendStatus(); setBitrate();
}
function audioSender() { return pc && pc.getSenders().find((s) => s.track && s.track.kind === 'audio'); }
function videoTrack() { return stream && stream.getVideoTracks()[0]; }
function caps() { const t = videoTrack(); try { return t && t.getCapabilities ? t.getCapabilities() : {}; } catch { return {}; } }

function updateButtons() {
  const c = caps();
  $('torchBtn').hidden = !c.torch; $('torchBtn').classList.toggle('on', torch);
  $('micBtn').classList.toggle('off', !micOn); $('micBtn').textContent = micOn ? '🎙️' : '🔇';
  $('hdBtn').textContent = hd ? '1080' : '720';
  if (c.zoom && c.zoom.max > c.zoom.min) {
    const z = $('zoom'); z.min = c.zoom.min; z.max = Math.min(c.zoom.max, 10); z.step = c.zoom.step || 0.1;
    const s = videoTrack().getSettings ? videoTrack().getSettings() : {}; z.value = s.zoom || c.zoom.min; $('zoomBox').hidden = false;
  } else $('zoomBox').hidden = true;
}
async function flip() { facing = facing === 'user' ? 'environment' : 'user'; store.set('facing', facing); await reopenVideo(); }
async function setTorch(on) { const t = videoTrack(); if (!t) return; try { await t.applyConstraints({ advanced: [{ torch: on }] }); torch = on; } catch {} updateButtons(); sendStatus(); }
$('flipBtn').onclick = flip;
$('torchBtn').onclick = () => setTorch(!torch);
$('micBtn').onclick = () => { micOn = !micOn; stream.getAudioTracks().forEach((t) => { t.enabled = micOn; }); updateButtons(); };
$('hdBtn').onclick = async () => { hd = !hd; store.set('hd', hd); await reopenVideo(); };
$('zoom').oninput = (e) => { const t = videoTrack(); if (t) t.applyConstraints({ advanced: [{ zoom: Number(e.target.value) }] }).catch(() => {}); };
$('quitBtn').onclick = () => { if (confirmQuit()) stopAll(); };
function confirmQuit() { return tallyState !== 'program' || window.confirm('Cette caméra est à l\'antenne. Quitter quand même ?'); }

/* ---------- liaison avec la régie ---------- */
function send(m) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); }
function connect() {
  clearTimeout(retryT);
  if (!wantOn) return;
  setState('Connexion à la régie…', 'wait');
  let opened = false;
  try { ws = new WebSocket(`ws://${host}/?role=camera`); } catch (e) { retry('Adresse invalide'); return; }
  const timeout = setTimeout(() => { if (!opened) { try { ws.close(); } catch {} } }, 6000);
  ws.onopen = () => {
    opened = true; clearTimeout(timeout);
    send({ type: 'hello', name: camName(), devId, info: { ua: navigator.userAgent.slice(0, 120) } });
    setState('Connectée · en attente de la régie', 'wait'); msg('');
  };
  ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch { return; } onMsg(m); };
  ws.onclose = () => {
    clearTimeout(timeout); closePc();
    if (!wantOn) return;
    retry(opened ? 'Régie déconnectée' : 'Régie introuvable');
  };
}
function retry(why) {
  setState(why + ' · nouvel essai…', 'wait');
  msg(why === 'Régie introuvable' ? `Régie introuvable à l'adresse ${host}.\nVérifiez que le téléphone est sur le même Wi-Fi que le PC et que le logiciel Je suis KCCiste Studio est ouvert.` : '');
  retryT = setTimeout(connect, 2500);
}
async function onMsg(m) {
  if (m.type === 'regie-ready') startPc();
  else if (m.type === 'answer' && pc) await pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }).catch(() => {});
  else if (m.type === 'ice' && pc && m.candidate) pc.addIceCandidate(m.candidate).catch(() => {});
  else if (m.type === 'regie-gone') { closePc(); setState('Régie fermée · en attente', 'wait'); }
  else if (m.type === 'tally') setTally(m.state, m.live);
  else if (m.type === 'cmd') {
    if (m.cmd === 'facing') flip();
    if (m.cmd === 'torch') setTorch(!torch);
    if (m.cmd === 'name' && m.value) { $('name').value = m.value; store.set('name', m.value); $('nm').textContent = m.value; }
  } else if (m.type === 'bye') { stopAll(); }
}
async function startPc() {
  closePc();
  const p = new RTCPeerConnection({ iceServers: [] }); pc = p;
  for (const t of stream.getTracks()) p.addTrack(t, stream);
  p.onicecandidate = (e) => { if (e.candidate) send({ type: 'ice', candidate: e.candidate }); };
  p.onconnectionstatechange = () => {
    const st = p.connectionState;
    if (st === 'connected') { setBitrate(); setTally(tallyState); sendStatus(); clearInterval(statusT); statusT = setInterval(sendStatus, 10000); }
    if (st === 'failed' && pc === p) { setState('Liaison perdue · nouvel essai…', 'wait'); setTimeout(() => { if (pc === p && ws && ws.readyState === 1) send({ type: 'hello', name: camName(), devId }); }, 1500); }
  };
  const offer = await p.createOffer();
  await p.setLocalDescription(offer);
  send({ type: 'offer', sdp: p.localDescription.sdp });
}
function closePc() { clearInterval(statusT); if (pc) { try { pc.close(); } catch {} pc = null; } }
async function setBitrate() {
  if (!pc) return;
  const s = pc.getSenders().find((x) => x.track && x.track.kind === 'video'); if (!s) return;
  const p = s.getParameters(); if (!p.encodings || !p.encodings.length) p.encodings = [{}];
  p.encodings[0].maxBitrate = hd ? 8000000 : 4500000; p.encodings[0].maxFramerate = 30;
  p.degradationPreference = 'maintain-framerate';
  try { await s.setParameters(p); } catch {}
}
function setTally(state, live) {
  tallyState = state || 'off';
  $('tally').className = tallyState;
  if (!pc || pc.connectionState !== 'connected') return;
  if (tallyState === 'program') setState(live ? '● À L\'ANTENNE · EN DIRECT' : '● À L\'ANTENNE', 'program');
  else if (tallyState === 'preview') setState('EN APERÇU · préparez-vous', 'preview');
  else setState('✓ Connectée à la régie', '');
}
async function sendStatus() {
  const vt = videoTrack(); const s = vt && vt.getSettings ? vt.getSettings() : {};
  let battery = null; try { if (navigator.getBattery) { const b = await navigator.getBattery(); battery = Math.round(b.level * 100); } } catch {}
  $('info').textContent = (s.width ? `${s.width}×${s.height}` : '') + (battery != null ? ` · 🔋 ${battery} %` : '');
  send({ type: 'status', facing, torchOk: !!caps().torch, width: s.width, height: s.height, battery });
}
function stopAll() {
  wantOn = false; clearTimeout(retryT); closePc();
  if (ws) { try { ws.close(); } catch {} ws = null; }
  if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null;
  tallyState = 'off'; $('tally').className = ''; msg(''); show('setup'); renderRecent();
}

// bouton « retour » d'Android : géré par l'application
window.kccBack = () => { if (!$('scan').hidden) { stopScan(); return true; } if (!$('live').hidden) { if (confirmQuit()) stopAll(); return true; } return false; };

// essais : camera.html?host=127.0.0.1:8787&name=Caméra%201 se connecte tout seul
const qs = new URLSearchParams(location.search);
if (qs.get('host')) { if (qs.get('name')) $('name').value = qs.get('name'); start(qs.get('host')); }
