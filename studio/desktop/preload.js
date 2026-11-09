// Pont entre la fenêtre de la régie et Node (ffmpeg, fichiers, serveur local).
const { contextBridge, ipcRenderer, webUtils } = require('electron');

const on = (ch) => (fn) => { const h = (_e, d) => fn(d); ipcRenderer.on(ch, h); return () => ipcRenderer.off(ch, h); };

contextBridge.exposeInMainWorld('kcc', {
  info: () => ipcRenderer.invoke('info'),
  qr: (text) => ipcRenderer.invoke('qr', text),
  pathFor: (file) => { try { return webUtils.getPathForFile(file) || ''; } catch { return ''; } },
  encoders: () => ipcRenderer.invoke('encoders'),
  screens: () => ipcRenderer.invoke('screens'),
  liveStart: (opts) => ipcRenderer.invoke('live-start', opts),
  liveChunk: (buf) => ipcRenderer.send('live-chunk', buf),
  liveStop: () => ipcRenderer.invoke('live-stop'),
  recStart: () => ipcRenderer.invoke('rec-start'),
  recChunk: (buf) => ipcRenderer.send('rec-chunk', buf),
  recStop: () => ipcRenderer.invoke('rec-stop'),
  openFolder: (p) => ipcRenderer.invoke('open-folder', p),
  openUrl: (u) => ipcRenderer.invoke('open-url', u),
  onLiveStats: on('live-stats'),
  onLiveLog: on('live-log'),
  onLiveExit: on('live-exit'),
  onServerLog: on('server-log'),
});
