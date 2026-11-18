// Radio Je suis KCCiste : l'antenne de la radio (jesuiskcciste.com/admin/radio/antenne)
// dans sa propre fenêtre Windows, avec le micro autorisé et la musique qui continue
// même quand la fenêtre est réduite.
const { app, BrowserWindow, Menu, session, shell, dialog } = require('electron');

const HOME = 'https://jesuiskcciste.com/admin/radio/antenne';
const OK_HOSTS = new Set(['jesuiskcciste.com', 'www.jesuiskcciste.com']);
const ours = (u) => { try { return OK_HOSTS.has(new URL(u).hostname); } catch { return false; } };

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }
let win = null;
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });

function offlinePage(err) {
  const html = `<!doctype html><meta charset="utf-8"><title>Radio Je suis KCCiste</title>
  <body style="margin:0;height:100vh;display:grid;place-items:center;background:#0e1830;color:#fff;font-family:Segoe UI,Arial,sans-serif;text-align:center">
  <div><div style="font-size:54px">📻</div><h1 style="color:#d9b25a">Pas de connexion Internet</h1>
  <p style="opacity:.8;max-width:460px">La radio a besoin d’Internet pour passer à l’antenne. Vérifiez votre connexion, puis réessayez.</p>
  <p style="opacity:.5;font-size:12px">${String(err || '').replace(/[<>&]/g, '')}</p>
  <a href="${HOME}" style="display:inline-block;margin-top:14px;padding:12px 26px;border-radius:999px;background:#d9b25a;color:#0e1830;font-weight:700;text-decoration:none">Réessayer</a></div></body>`;
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 420, minHeight: 600,
    title: 'Radio Je suis KCCiste', backgroundColor: '#0e1830', autoHideMenuBar: true,
    icon: require('path').join(__dirname, 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, sandbox: true, backgroundThrottling: false, spellcheck: false },
  });
  win.loadURL(HOME);
  win.webContents.on('did-fail-load', (_e, code, desc, url, isMain) => { if (isMain && code !== -3) win.loadURL(offlinePage(desc)); });
  // Liens vers d'autres sites (WhatsApp, YouTube…) : dans le navigateur habituel
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (ours(url)) { win.loadURL(url); return { action: 'deny' }; }
    if (/^https?:/.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('data:') || ours(url)) return;
    e.preventDefault();
    if (/^https?:/.test(url)) void shell.openExternal(url);
  });
  // Fermer pendant l'émission : on demande confirmation
  win.on('close', (e) => {
    const r = dialog.showMessageBoxSync(win, { type: 'question', buttons: ['Fermer', 'Annuler'], defaultId: 1, cancelId: 1, title: 'Radio Je suis KCCiste',
      message: 'Fermer la radio ?', detail: 'Si une émission est en cours, pensez d’abord à cliquer sur « Terminer l’émission ».' });
    if (r === 1) e.preventDefault();
  });
}

app.whenReady().then(() => {
  // Micro et lecture du son autorisés pour jesuiskcciste.com uniquement
  const allowed = new Set(['media', 'mediaKeySystem', 'notifications', 'clipboard-sanitized-write', 'fullscreen', 'speaker-selection']);
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(ours(wc.getURL()) && allowed.has(perm)));
  session.defaultSession.setPermissionCheckHandler((wc, perm, origin) => ours(origin || (wc && wc.getURL()) || '') && allowed.has(perm));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Radio', submenu: [
      { label: 'Antenne en direct', accelerator: 'CmdOrCtrl+H', click: () => win && win.loadURL(HOME) },
      { label: 'Page publique de la radio', click: () => win && win.loadURL('https://jesuiskcciste.com/radio') },
      { type: 'separator' }, { role: 'reload', label: 'Recharger' }, { role: 'togglefullscreen', label: 'Plein écran' },
      { role: 'zoomIn', label: 'Agrandir' }, { role: 'zoomOut', label: 'Réduire' }, { role: 'resetZoom', label: 'Taille normale' },
      { type: 'separator' }, { role: 'quit', label: 'Quitter' },
    ] },
  ]));
  createWindow();
});
app.on('window-all-closed', () => app.quit());
