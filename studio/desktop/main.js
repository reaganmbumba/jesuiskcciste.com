/**
 * Je suis KCCiste Studio — régie de direct pour Windows.
 * Fenêtre principale (renderer/), serveur local des téléphones (server.js),
 * sorties ffmpeg (output.js).
 */
const { app, BrowserWindow, ipcMain, desktopCapturer, shell, dialog, powerSaveBlocker, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const QRCode = require('qrcode');
const { startServer, lanAddresses } = require('./server');
const { LiveOutput, Recording, detectEncoders } = require('./output');

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// adresses IP réelles dans WebRTC (sinon des noms .local que certains téléphones ne savent pas lire)
app.commandLine.appendSwitch('disable-features', 'WebRtcHideLocalIpsWithMdns');

const res = (...p) => (app.isPackaged ? path.join(process.resourcesPath, ...p) : path.join(__dirname, ...p));

function ffmpegPath() {
  try {
    const p = require('ffmpeg-static');
    if (p) { const unpacked = p.replace('app.asar', 'app.asar.unpacked'); if (fs.existsSync(unpacked)) return unpacked; }
  } catch {}
  return 'ffmpeg'; // installé sur le système
}

let win = null, server = null, live = null, rec = null, encoders = null, keepAwake = null;
const FFMPEG = ffmpegPath();

function send(ch, data) { if (win && !win.isDestroyed()) win.webContents.send(ch, data); }
function log(t) { send('server-log', t); }

async function createWindow() {
  win = new BrowserWindow({
    width: 1500, height: 920, minWidth: 1100, minHeight: 700,
    backgroundColor: '#0b0e16', title: 'Je suis KCCiste Studio',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false, contextIsolation: true },
  });
  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.on('close', (e) => {
    if (live?.running || rec?.stream) {
      const r = dialog.showMessageBoxSync(win, { type: 'warning', buttons: ['Rester', 'Quitter quand même'], defaultId: 0, cancelId: 0, title: 'Direct en cours', message: 'Un direct ou un enregistrement est en cours. Quitter l\'arrête.' });
      if (r === 0) e.preventDefault();
    }
  });
  await win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  if (process.env.KCC_DEVTOOLS) win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(async () => {
  const apk = res('camera-apk', 'kcc-studio-camera.apk');
  try {
    server = await startServer({ port: 8787, cameraDir: app.isPackaged ? res('camera') : path.join(__dirname, '..', 'camera'), apkPath: apk, log });
  } catch (e) {
    dialog.showErrorBox('Je suis KCCiste Studio', 'Impossible d\'ouvrir le port réseau pour les téléphones : ' + e.message);
  }
  live = new LiveOutput(FFMPEG);
  live.on('stats', (s) => send('live-stats', s));
  live.on('log', (t) => send('live-log', t));
  live.on('exit', (e) => { send('live-exit', e); if (keepAwake !== null && !rec?.stream) { powerSaveBlocker.stop(keepAwake); keepAwake = null; } });
  rec = new Recording(FFMPEG, path.join(app.getPath('videos'), 'Je suis KCCiste Studio'));
  await createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});

app.on('window-all-closed', () => { live?.stop(); rec?.stop(); server?.close(); app.quit(); });

function awake() { if (keepAwake === null) keepAwake = powerSaveBlocker.start('prevent-display-sleep'); }

ipcMain.handle('info', async () => {
  const port = server?.port || 0;
  const addrs = lanAddresses().map((a) => a.address);
  const qrs = {};
  for (const a of addrs) qrs[a] = await QRCode.toDataURL(`http://${a}:${port}/camera`, { margin: 1, width: 360, color: { dark: '#0b1530', light: '#ffffff' } });
  return { port, addresses: addrs, qrs, version: app.getVersion(), recDir: rec.dir, ffmpeg: FFMPEG };
});

ipcMain.handle('encoders', () => { if (!encoders) encoders = detectEncoders(FFMPEG); return encoders; });

ipcMain.handle('screens', async () => {
  const list = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 320, height: 180 } });
  return list.map((s) => ({ id: s.id, name: s.name, thumb: s.thumbnail.toDataURL() }));
});

ipcMain.handle('live-start', (_e, opts) => {
  try { live.start({ ...opts, encoder: opts.encoder === 'auto' ? (encoders || detectEncoders(FFMPEG))[0] : opts.encoder, testFile: process.env.KCC_TEST_OUTPUT || '' }); awake(); return { ok: true }; }
  catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.on('live-chunk', (_e, buf) => live.write(Buffer.from(buf)));
ipcMain.handle('live-stop', () => { live.stop(); return true; });

ipcMain.handle('rec-start', () => { awake(); return rec.start(); });
ipcMain.on('rec-chunk', (_e, buf) => rec.write(Buffer.from(buf)));
ipcMain.handle('rec-stop', async () => {
  const f = await rec.stop();
  if (keepAwake !== null && !live.running) { powerSaveBlocker.stop(keepAwake); keepAwake = null; }
  return f;
});
ipcMain.handle('open-folder', (_e, p) => { if (p && fs.existsSync(p)) shell.showItemInFolder(p); else shell.openPath(rec.dir); });
ipcMain.handle('open-url', (_e, u) => { if (/^https:\/\//.test(u)) shell.openExternal(u); });
