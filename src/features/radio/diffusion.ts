/**
 * Diffusion de l'antenne radio sur YouTube et Facebook, par le relais du site (relais/server.mjs).
 *
 * YouTube et Facebook n'acceptent que de la vidéo : on dessine une image animée 16:9
 * (logo KCC, « En direct », titre, sujet, égaliseur qui suit le son), on y joint le son
 * de l'antenne, et le navigateur l'envoie au relais qui la pousse en RTMP.
 * Les clés de stream restent dans ce navigateur (jamais enregistrées sur le site).
 */

export const RELAY_URL = 'wss://relais-kcc.onrender.com';
const STORE = 'kcc-radio-diffusion';

export type Destinations = { yt: boolean; ytUrl: string; ytKey: string; fb: boolean; fbUrl: string; fbKey: string };
export const defaultDestinations: Destinations = {
  yt: false, ytUrl: 'rtmp://a.rtmp.youtube.com/live2', ytKey: '',
  fb: false, fbUrl: 'rtmps://live-api-s.facebook.com:443/rtmp', fbKey: '',
};

/** Destinations enregistrées dans ce navigateur (sinon reprises du Studio s'il a déjà servi ici). */
export function loadDestinations(): Destinations {
  try {
    const own = JSON.parse(localStorage.getItem(STORE) || 'null') as Partial<Destinations> | null;
    if (own) return { ...defaultDestinations, ...own };
    const st = JSON.parse(localStorage.getItem('kcc-studio') || '{}') as Record<string, unknown>;
    const s = (k: string, d: string) => (typeof st[k] === 'string' && st[k] ? String(st[k]) : d);
    return {
      ...defaultDestinations,
      ytUrl: s('dYtUrl', defaultDestinations.ytUrl), ytKey: s('dYtKey', ''),
      fbUrl: s('dFbUrl', defaultDestinations.fbUrl), fbKey: s('dFbKey', ''),
    };
  } catch { return { ...defaultDestinations }; }
}
export function saveDestinations(d: Destinations) {
  try { localStorage.setItem(STORE, JSON.stringify(d)); } catch { /* navigation privée */ }
}
export function outputsOf(d: Destinations) {
  const o: { name: string; url: string; key: string }[] = [];
  if (d.yt && d.ytKey.trim()) o.push({ name: 'YouTube', url: d.ytUrl.trim(), key: d.ytKey.trim() });
  if (d.fb && d.fbKey.trim()) o.push({ name: 'Facebook', url: d.fbUrl.trim(), key: d.fbKey.trim() });
  return o;
}

export type ScreenInfo = { title: string; topic: string; listeners: number | null; callsOpen: boolean };

const W = 1280, H = 720;
const GOLD = '#e8b84a', GOLD_D = '#b8862a';

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const out: string[] = [];
  for (const para of text.replace(/[*_~]/g, '').split('\n')) {
    if (!para.trim()) { if (out.length && out[out.length - 1] !== '') out.push(''); continue; }
    let line = '';
    for (const w of para.split(/\s+/)) {
      const t = line ? `${line} ${w}` : w;
      if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
      if (out.length >= maxLines) break;
    }
    if (line && out.length < maxLines) out.push(line);
    if (out.length >= maxLines) break;
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out;
}

/** Dessine une image de l'écran YouTube. */
function draw(g: CanvasRenderingContext2D, info: ScreenInfo, bins: Uint8Array | null, t: number) {
  const bg = g.createRadialGradient(W * 0.3, H * 0.4, 50, W * 0.4, H * 0.5, W * 0.8);
  bg.addColorStop(0, '#1d2a4a'); bg.addColorStop(1, '#06080f');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);

  // disque KCC avec ondes
  const cx = 300, cy = 330, r = 150;
  for (let i = 0; i < 3; i++) {
    const p = ((t / 3000) + i / 3) % 1;
    g.strokeStyle = `rgba(232,184,74,${0.5 * (1 - p)})`; g.lineWidth = 3;
    g.beginPath(); g.arc(cx, cy, r + p * 110, 0, Math.PI * 2); g.stroke();
  }
  g.save(); g.translate(cx, cy); g.rotate((t / 4000) * Math.PI * 2);
  g.strokeStyle = GOLD; g.lineWidth = 8; g.lineCap = 'round';
  g.beginPath(); g.arc(0, 0, r + 18, 0, Math.PI * 0.6); g.stroke(); g.restore();
  const disc = g.createRadialGradient(cx - 50, cy - 60, 10, cx, cy, r);
  disc.addColorStop(0, '#24315a'); disc.addColorStop(1, '#0b0f1c');
  g.fillStyle = disc; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = GOLD; g.lineWidth = 6; g.stroke();
  g.fillStyle = GOLD; g.font = 'bold 96px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('KCC', cx, cy + 4);

  // égaliseur sous le disque
  const n = 24, bw = 12, gap = 6, x0 = cx - (n * (bw + gap) - gap) / 2, base = 628;
  for (let i = 0; i < n; i++) {
    const v = bins ? bins[Math.min(bins.length - 1, 2 + Math.floor(i * i * 0.35))] / 255 : 0.15 + 0.1 * Math.sin(t / 300 + i);
    const h = 6 + v * 64;
    const gr = g.createLinearGradient(0, base - h, 0, base); gr.addColorStop(0, '#f5d58a'); gr.addColorStop(1, GOLD_D);
    g.fillStyle = gr; g.fillRect(x0 + i * (bw + gap), base - h, bw, h);
  }

  // texte à droite
  const tx = 540;
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#dc2626'; g.beginPath(); g.roundRect(tx, 70, 210, 46, 23); g.fill();
  g.fillStyle = '#fff'; g.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(t / 500));
  g.beginPath(); g.arc(tx + 28, 93, 8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  g.font = 'bold 24px Arial, sans-serif'; g.fillText('EN DIRECT', tx + 48, 102);
  g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '28px Arial, sans-serif'; g.fillText('Radio Je suis KCCiste', tx, 170);
  g.fillStyle = '#fff'; g.font = 'bold 48px Georgia, serif';
  const tl = wrap(g, info.title || 'Émission en direct', W - tx - 60, 2);
  tl.forEach((l, i) => g.fillText(l, tx, 230 + i * 58));
  let y = 230 + tl.length * 58 + 20;
  if (info.topic) {
    g.fillStyle = GOLD; g.font = 'bold 20px Arial, sans-serif'; g.fillText('SUJET DE L’ÉMISSION', tx, y); y += 36;
    g.fillStyle = 'rgba(255,255,255,.88)'; g.font = '26px Arial, sans-serif';
    const lines = wrap(g, info.topic, W - tx - 60, Math.max(2, Math.floor((610 - y) / 36)));
    lines.forEach((l, i) => g.fillText(l, tx, y + i * 36));
  }
  // bandeau du bas
  g.fillStyle = 'rgba(232,184,74,.14)'; g.fillRect(0, H - 70, W, 70);
  g.fillStyle = GOLD; g.font = 'bold 26px Arial, sans-serif';
  g.fillText(info.callsOpen ? '📞 Appelez l’émission : jesuiskcciste.com/radio' : '🎧 Écoutez et appelez sur jesuiskcciste.com/radio', 40, H - 25);
  g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.75)';
  const clock = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  g.fillText(info.listeners ? `🎧 ${info.listeners}  ·  ${clock}` : clock, W - 40, H - 25);
}

type Handlers = { onStatus: (text: string, error?: boolean) => void };

/**
 * Lance l'envoi vers YouTube / Facebook. Se reconnecte seul au relais (qui peut mettre
 * une minute à se réveiller). Renvoie de quoi l'arrêter.
 */
export function startDiffusion(opts: {
  token: () => Promise<string | null>;
  audio: MediaStreamTrack;
  analyser: AnalyserNode | null;
  info: () => ScreenInfo;
  outputs: { name: string; url: string; key: string }[];
} & Handlers) {
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  const bins = opts.analyser ? new Uint8Array(opts.analyser.frequencyBinCount) : null;
  // minuterie (et non requestAnimationFrame) : l'image continue même si l'onglet n'est pas au premier plan
  const timer = window.setInterval(() => {
    if (bins && opts.analyser) opts.analyser.getByteFrequencyData(bins);
    draw(g, opts.info(), bins, performance.now());
  }, 1000 / 20);
  draw(g, opts.info(), bins, 0);
  const stream = new MediaStream([...cv.captureStream(20).getVideoTracks(), opts.audio]);
  const mime = ['video/webm;codecs=h264,opus', 'video/x-matroska;codecs=avc1,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    .find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) || '';
  const names = opts.outputs.map((o) => o.name).join(' et ');
  let ws: WebSocket | null = null, mr: MediaRecorder | null = null, want = true, retry = 0, ping = 0;

  const stopRec = () => { try { if (mr && mr.state !== 'inactive') mr.stop(); } catch { /* déjà arrêté */ } mr = null; window.clearInterval(ping); };
  const rec = (sock: WebSocket) => {
    const o: MediaRecorderOptions & { videoKeyFrameIntervalDuration?: number } = mime ? { mimeType: mime, videoBitsPerSecond: 1_200_000, audioBitsPerSecond: 128_000, videoKeyFrameIntervalDuration: 2000 } : {};
    try { mr = new MediaRecorder(stream, o); } catch { delete o.videoKeyFrameIntervalDuration; mr = new MediaRecorder(stream, o); }
    mr.ondataavailable = (e) => { if (e.data.size && sock.readyState === 1) void e.data.arrayBuffer().then((b) => sock.readyState === 1 && sock.send(b)); };
    mr.start(500);
    ping = window.setInterval(() => {
      if (sock.readyState === 1) sock.send(JSON.stringify({ type: 'ping', t: Date.now() }));
      if (sock.bufferedAmount > 15e6) opts.onStatus('Connexion Internet trop lente pour YouTube/Facebook.', true);
    }, 5000);
  };
  const open = async () => {
    const token = await opts.token();
    if (!want) return;
    if (!token) { opts.onStatus('Reconnectez-vous au site pour diffuser sur YouTube/Facebook.', true); return; }
    opts.onStatus(retry ? 'Réveil du relais… (jusqu’à une minute)' : 'Connexion au relais YouTube/Facebook…');
    const sock = new WebSocket(RELAY_URL);
    sock.binaryType = 'arraybuffer';
    ws = sock;
    sock.onopen = () => sock.send(JSON.stringify({ type: 'start', token, quality: 720, vcodec: /h264|avc1/.test(mime) ? 'h264' : 'vp8', outputs: opts.outputs.map(({ url, key }) => ({ url, key })) }));
    sock.onmessage = (e) => {
      let m: { type?: string; error?: string; bytes?: number } = {};
      try { m = JSON.parse(String(e.data)); } catch { return; }
      if (m.type === 'started') { retry = 0; rec(sock); opts.onStatus(`● En direct sur ${names}`); }
      else if (m.type === 'pong') opts.onStatus(`● En direct sur ${names} · ${((m.bytes ?? 0) / 1048576).toFixed(0)} Mo envoyés`);
      else if (m.type === 'error') {
        opts.onStatus(m.error === 'forbidden' ? 'Le relais a refusé : compte administrateur nécessaire.' : m.error === 'outputs' ? 'Une clé de stream n’est pas valide : vérifiez-la.' : 'YouTube/Facebook a coupé : nouvelle tentative…', true);
        if (m.error === 'forbidden' || m.error === 'outputs') want = false;
      }
    };
    sock.onclose = () => {
      stopRec();
      if (!want) return;
      retry += 1;
      window.setTimeout(() => { if (want) void open(); }, Math.min(15000, 2000 * retry));
    };
  };
  void open();

  return {
    stop() {
      want = false;
      stopRec();
      window.clearInterval(timer);
      stream.getVideoTracks().forEach((t) => t.stop());
      try { if (ws?.readyState === 1) ws.send(JSON.stringify({ type: 'stop' })); } catch { /* fermé */ }
      const s = ws; window.setTimeout(() => { try { s?.close(); } catch { /* fermé */ } }, 800);
      ws = null;
      opts.onStatus('Diffusion YouTube/Facebook arrêtée.');
    },
  };
}
