/**
 * Serveur local de la régie « Je suis KCCiste Studio ».
 *
 * - WebSocket de mise en relation (signalisation WebRTC) entre la régie (ce PC)
 *   et les téléphones caméras, sur le Wi-Fi de l'église.
 * - Pages servies aux téléphones : /camera (explique comment installer l'appli
 *   caméra) et /kcc-studio-camera.apk (l'appli elle-même, si elle est fournie).
 *
 * Aucune image ne passe par ce serveur : la vidéo va directement du téléphone à
 * la régie (WebRTC). Le serveur ne fait que présenter les deux.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { WebSocketServer } = require('ws');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.apk': 'application/vnd.android.package-archive' };

/** Adresses IPv4 du PC sur le réseau local, les plus probables d'abord (Wi-Fi maison / église). */
function lanAddresses() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family !== 'IPv4' && a.family !== 4) continue;
      if (a.internal || a.address.startsWith('169.254.')) continue;
      out.push({ name, address: a.address });
    }
  }
  const score = (a) => (a.address.startsWith('192.168.') ? 0 : a.address.startsWith('10.') ? 1 : a.address.startsWith('172.') ? 2 : 3) + (/virtual|vmware|vbox|hyper-v|wsl|docker|vethernet/i.test(a.name) ? 10 : 0);
  return out.sort((a, b) => score(a) - score(b));
}

function startServer({ port = 8787, cameraDir, apkPath, log = () => {} } = {}) {
  let regie = null; // un seul poste de régie à la fois
  const cameras = new Map(); // id -> { ws, name, devId }
  let seq = 0;

  const send = (ws, msg) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); };
  const camInfo = (id, c) => ({ type: 'camera-join', id, name: c.name, devId: c.devId, info: c.info || {} });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let p = url.pathname;
    if (p === '/' || p === '/camera') p = '/accueil-telephone.html';
    if (p === '/sante') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true, app: 'kcc-studio', cameras: cameras.size, regie: !!regie })); return; }
    if (p === '/kcc-studio-camera.apk') {
      if (!apkPath || !fs.existsSync(apkPath)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end("L'application caméra n'est pas incluse dans cette version de la régie."); return; }
      res.writeHead(200, { 'content-type': TYPES['.apk'], 'content-disposition': 'attachment; filename="KCC-Studio-Camera.apk"', 'content-length': fs.statSync(apkPath).size });
      fs.createReadStream(apkPath).pipe(res); return;
    }
    const file = path.join(cameraDir || '', path.normalize(p).replace(/^([/\\])+/, ''));
    if (!cameraDir || !file.startsWith(path.resolve(cameraDir)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('Introuvable'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });

  const wss = new WebSocketServer({ server, maxPayload: 1 << 20 });
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://x');
    const role = url.searchParams.get('role');
    const remote = (req.socket.remoteAddress || '').replace('::ffff:', '');
    ws.isAlive = true; ws.on('pong', () => { ws.isAlive = true; });

    if (role === 'regie') {
      // la régie ne peut venir que de ce PC
      if (!['127.0.0.1', '::1'].includes(remote)) { ws.close(4003, 'regie locale seulement'); return; }
      if (regie) try { regie.close(4001, 'remplacée'); } catch {}
      regie = ws;
      log('régie connectée');
      for (const [id, c] of cameras) { send(ws, camInfo(id, c)); send(c.ws, { type: 'regie-ready' }); }
      ws.on('message', (data) => {
        let m; try { m = JSON.parse(data); } catch { return; }
        const c = cameras.get(m.to);
        if (c) { const { to, ...rest } = m; send(c.ws, rest); }
      });
      ws.on('close', () => {
        if (regie === ws) { regie = null; log('régie déconnectée'); for (const c of cameras.values()) send(c.ws, { type: 'regie-gone' }); }
      });
      return;
    }

    // téléphone caméra
    const id = 'cam' + (++seq);
    const c = { ws, name: 'Caméra', devId: '', info: { ip: remote } };
    cameras.set(id, c);
    send(ws, { type: 'welcome', id, regie: !!regie });
    ws.on('message', (data) => {
      let m; try { m = JSON.parse(data); } catch { return; }
      if (m.type === 'hello') {
        c.name = String(m.name || 'Caméra').slice(0, 40);
        c.devId = String(m.devId || '').slice(0, 64);
        c.info = { ...c.info, ...(m.info && typeof m.info === 'object' ? m.info : {}) };
        log(`téléphone connecté : ${c.name} (${remote})`);
        send(regie, camInfo(id, c));
        if (regie) send(ws, { type: 'regie-ready' });
        return;
      }
      send(regie, { ...m, from: id });
    });
    ws.on('close', () => {
      cameras.delete(id);
      log(`téléphone parti : ${c.name}`);
      send(regie, { type: 'camera-leave', id });
    });
  });

  // battements de cœur : on ferme les connexions mortes (téléphone sorti du Wi-Fi)
  const beat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) { try { ws.terminate(); } catch {} continue; }
      ws.isAlive = false; try { ws.ping(); } catch {}
    }
  }, 5000);

  return new Promise((resolve, reject) => {
    let tries = 0;
    const tryListen = (p) => {
      server.once('error', (e) => {
        if (e.code === 'EADDRINUSE' && tries++ < 10) tryListen(p + 1); else reject(e);
      });
      server.listen(p, '0.0.0.0', () => {
        resolve({
          port: server.address().port,
          close: () => { clearInterval(beat); wss.close(); server.close(); },
          stats: () => ({ cameras: cameras.size, regie: !!regie }),
        });
      });
    };
    tryListen(port);
  });
}

module.exports = { startServer, lanAddresses };
