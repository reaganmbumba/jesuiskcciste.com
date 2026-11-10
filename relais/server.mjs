/**
 * Relais du studio Je suis KCCiste vers YouTube, Facebook et toute adresse RTMP.
 *
 * Le studio (page /studio du site, administrateur) ouvre un WebSocket ici et
 * envoie la vidéo du direct (WebM, morceaux de 0,5 s). Le relais la passe à
 * ffmpeg, qui l'envoie en RTMP/RTMPS à chaque destination collée dans le studio
 * (URL du serveur + clé de stream). Les clés ne sont jamais enregistrées ici.
 *
 * Sécurité : le premier message doit contenir le jeton de connexion du site ;
 * le relais vérifie dans Supabase que c'est un administrateur central.
 *
 * Variables d'environnement :
 *   SUPABASE_URL, SUPABASE_ANON_KEY  (obligatoires en production)
 *   PORT (défaut 8080), ALLOWED_ORIGINS (défaut https://jesuiskcciste.com,https://www.jesuiskcciste.com)
 *   RELAY_TEST_OUTPUT : chemin d'un fichier .flv pour les essais (remplace les destinations)
 *
 * Aucune dépendance npm : Node 18+ et ffmpeg suffisent.
 */
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.PORT || 8080);
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://jesuiskcciste.com,https://www.jesuiskcciste.com').split(',').map((s) => s.trim()).filter(Boolean);
const TEST_OUTPUT = process.env.RELAY_TEST_OUTPUT || '';
const MAX_OUTPUTS = 5;

const log = (...a) => console.log(new Date().toISOString(), ...a);

async function isAdmin(token) {
  if (TEST_OUTPUT && token === 'test') return true;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !token) return false;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_permission`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_permission: 'settings.manage' }),
    });
    return r.ok && (await r.json()) === true;
  } catch { return false; }
}

/** Destination acceptée : rtmp:// ou rtmps:// + clé (sans espace ni caractère de commande). */
function outputUrl(o) {
  const server = String(o?.url || '').trim().replace(/\/+$/, '');
  const key = String(o?.key || '').trim();
  if (!/^rtmps?:\/\/[A-Za-z0-9.-]+(:\d+)?(\/[A-Za-z0-9._~\/-]*)?$/.test(server)) return null;
  if (!/^[A-Za-z0-9._~\-?=&%:+]{4,300}$/.test(key)) return null;
  return `${server}/${key}`;
}
const teeEscape = (s) => s.replace(/([\\|\[\]])/g, '\\$1');

// ——— WebSocket minimal (RFC 6455) ———
function wsAccept(req, socket) {
  const key = req.headers['sec-websocket-key'];
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' + `Sec-WebSocket-Accept: ${accept}\r\n\r\n`);
}
function wsSend(socket, text) {
  if (socket.destroyed) return;
  const data = Buffer.from(text);
  const len = data.length;
  const head = len < 126 ? Buffer.from([0x81, len]) : len < 65536 ? Buffer.from([0x81, 126, len >> 8, len & 255]) : (() => { const b = Buffer.alloc(10); b[0] = 0x81; b[1] = 127; b.writeBigUInt64BE(BigInt(len), 2); return b; })();
  socket.write(Buffer.concat([head, data]));
}
function wsReader(onMessage, onClose) {
  let buf = Buffer.alloc(0);
  let frag = [];
  let fragOp = 0;
  return (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      if (buf.length < 2) return;
      const fin = (buf[0] & 0x80) !== 0, op = buf[0] & 0x0f, masked = (buf[1] & 0x80) !== 0;
      let len = buf[1] & 0x7f, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (len > 16 * 1024 * 1024) return onClose('trop gros');
      const mOff = off; if (masked) off += 4;
      if (buf.length < off + len) return;
      let payload = buf.subarray(off, off + len);
      if (masked) { const m = buf.subarray(mOff, mOff + 4); payload = Buffer.from(payload); for (let i = 0; i < payload.length; i++) payload[i] ^= m[i & 3]; }
      buf = buf.subarray(off + len);
      if (op === 8) return onClose('fermé');
      if (op === 9 || op === 10) continue;           // ping / pong
      if (op === 0) frag.push(payload); else { frag = [payload]; fragOp = op; }
      if (fin) { onMessage(fragOp, Buffer.concat(frag)); frag = []; }
    }
  };
}

let current = null;   // un seul direct à la fois

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/sante') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ ok: true, live: !!current }));
    return;
  }
  res.writeHead(404); res.end();
});

server.on('upgrade', (req, socket) => {
  const origin = req.headers.origin || '';
  if (!TEST_OUTPUT && !ORIGINS.includes(origin)) { socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
  if ((req.headers.upgrade || '').toLowerCase() !== 'websocket' || !req.headers['sec-websocket-key']) { socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'); return; }
  wsAccept(req, socket);
  socket.setNoDelay(true);
  let ff = null, authed = false, closed = false, bytes = 0, started = 0;
  const say = (o) => wsSend(socket, JSON.stringify(o));
  const close = (why) => {
    if (closed) return; closed = true;
    log('fin de session', why || '', `${(bytes / 1048576).toFixed(1)} Mo`);
    try { ff?.stdin.end(); } catch {}
    setTimeout(() => { try { ff?.kill('SIGTERM'); } catch {} }, 3000);
    if (current === socket) current = null;
    socket.destroy();
  };
  socket.on('data', wsReader(async (op, data) => {
    if (op === 1) {
      let m; try { m = JSON.parse(data.toString('utf8')); } catch { return; }
      if (m.type === 'start' && !authed) {
        if (!(await isAdmin(String(m.token || '')))) { say({ type: 'error', error: 'forbidden' }); return close('refusé'); }
        const urls = TEST_OUTPUT ? [TEST_OUTPUT] : (Array.isArray(m.outputs) ? m.outputs.slice(0, MAX_OUTPUTS).map(outputUrl) : []);
        if (!urls.length || urls.some((u) => !u)) { say({ type: 'error', error: 'outputs' }); return close('destinations invalides'); }
        if (current && current !== socket) { try { current.destroy(); } catch {} }
        current = socket; authed = true; started = Date.now();
        const tee = urls.map((u) => `[f=flv:onfail=ignore]${teeEscape(u)}`).join('|');
        const q = m.quality === 1080 ? { s: '1920:1080', b: '4500k' } : { s: '1280:720', b: '2500k' };
        // Vidéo déjà en H.264 (navigateur) : transmise telle quelle, seul le son est converti → un petit serveur suffit.
        // Sinon (VP8) : réencodage complet, il faut alors un serveur plus puissant.
        const copy = m.vcodec === 'h264' && !process.env.RELAY_FORCE_ENCODE;
        const video = copy ? ['-c:v', 'copy'] : ['-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', '-pix_fmt', 'yuv420p',
          '-vf', `scale=${q.s}:force_original_aspect_ratio=decrease,pad=${q.s}:(ow-iw)/2:(oh-ih)/2,fps=30`,
          '-b:v', q.b, '-maxrate', q.b, '-bufsize', String(parseInt(q.b) * 2) + 'k', '-g', '60', '-keyint_min', '60', '-sc_threshold', '0'];
        const args = ['-hide_banner', '-loglevel', 'warning', '-fflags', '+genpts+discardcorrupt', '-thread_queue_size', '1024', '-i', 'pipe:0',
          '-map', '0:v:0', '-map', '0:a:0?', ...video,
          '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-ac', '2', '-f', 'tee', tee];
        log('mode vidéo :', copy ? 'copie H.264' : 'réencodage');
        ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
        ff.stdin.on('error', () => {});
        ff.stderr.on('data', (d) => { const t = d.toString().trim(); if (t) { log('ffmpeg:', t.slice(0, 300)); say({ type: 'log', text: t.slice(0, 200) }); } });
        ff.on('exit', (code) => { if (!closed) { say({ type: 'error', error: 'ffmpeg', code }); close('ffmpeg ' + code); } });
        log('direct lancé vers', urls.length, 'destination(s)');
        say({ type: 'started', outputs: urls.length });
      } else if (m.type === 'stop') close('arrêt demandé');
      else if (m.type === 'ping') say({ type: 'pong', t: m.t, bytes, since: started });
    } else if (op === 2 && authed && ff) {
      bytes += data.length;
      if (!ff.stdin.write(data)) { /* ffmpeg en retard : les morceaux suivants attendront */ }
    }
  }, close));
  socket.on('close', () => close('déconnexion'));
  socket.on('error', () => close('erreur réseau'));
});

server.listen(PORT, () => log(`Relais Je suis KCCiste à l'écoute sur le port ${PORT}${TEST_OUTPUT ? ' (mode essai → ' + TEST_OUTPUT + ')' : ''}`));
