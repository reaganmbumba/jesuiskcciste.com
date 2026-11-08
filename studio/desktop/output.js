/**
 * Sorties de la régie : direct RTMP (YouTube, Facebook…) et enregistrement sur le PC.
 *
 * La régie fabrique l'image finale (canvas + son mixé) et la donne en morceaux WebM
 * (MediaRecorder). ffmpeg la réencode en H.264/AAC au rythme demandé par YouTube
 * (une image clé toutes les 2 s, débit constant) et l'envoie en RTMP.
 */
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { EventEmitter } = require('node:events');

const QUALITIES = {
  480: { size: '854:480', vb: 1500, ab: 96 },
  720: { size: '1280:720', vb: 3500, ab: 128 },
  1080: { size: '1920:1080', vb: 6000, ab: 160 },
};

/** Nettoie un copier-coller : espaces, retours à la ligne, caractères invisibles, guillemets. */
const clean = (v) => String(v || '').replace(/[\s​-‍⁠﻿"'«»]/g, '');

/** URL complète « serveur/clé », ou { error } qui dit quoi corriger. */
function outputUrl(o) {
  let server = clean(o?.url).replace(/\/+$/, '');
  let key = clean(o?.key).replace(/^\/+/, '');
  // clé collée sous forme d'adresse complète (rtmp://…/live2/xxxx) : on la prend telle quelle
  if (/^(rtmps?|srt):\/\//i.test(key)) { server = key.replace(/\/+$/, ''); key = ''; }
  if (/^(rtmps?|srt):\/\/[^/]+\/.+/i.test(server) && !key) {
    // adresse complète dans le champ serveur : il faut qu'elle contienne la clé (pas seulement /live2)
    if (/youtube\.com\/live2$/i.test(server) || /facebook\.com(:\d+)?\/rtmp$/i.test(server)) return { error: 'clé de flux manquante' };
    return server;
  }
  if (!/^(rtmps?|srt):\/\/[A-Za-z0-9.-]+(:\d+)?(\/[^\s]*)?$/i.test(server)) return { error: 'URL du serveur invalide (elle doit commencer par rtmp:// ou rtmps://)' };
  if (key.length < 4 || key.length > 400) return { error: 'clé de flux manquante ou trop courte' };
  return `${server}/${key}`;
}
const teeEscape = (s) => s.replace(/([\\|\[\]])/g, '\\$1');
/** Masque les clés de flux dans ce qu'on affiche. */
const hideKeys = (t) => String(t).replace(/(rtmps?:\/\/[^\s'"]*\/)([^\/\s'":]{4,})/g, '$1••••');

/** Encodeurs vidéo matériels disponibles (carte graphique), testés pour de vrai. */
function detectEncoders(ffmpeg) {
  const found = ['libx264'];
  for (const enc of ['h264_nvenc', 'h264_qsv', 'h264_amf']) {
    try {
      const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=1280x720:r=30', '-frames:v', '10', '-c:v', enc, '-f', 'null', '-'], { timeout: 8000, windowsHide: true });
      if (r.status === 0) found.unshift(enc);
    } catch {}
  }
  return found;
}

function videoArgs(enc, q) {
  const kb = q.vb;
  const rate = ['-b:v', `${kb}k`, '-maxrate', `${kb}k`, '-bufsize', `${kb * 2}k`];
  const gop = ['-g', '60', '-keyint_min', '60'];
  switch (enc) {
    case 'h264_nvenc': return ['-c:v', 'h264_nvenc', '-preset', 'p4', '-rc', 'cbr', ...rate, ...gop, '-bf', '2', '-pix_fmt', 'yuv420p'];
    case 'h264_qsv': return ['-c:v', 'h264_qsv', '-preset', 'faster', ...rate, ...gop, '-pix_fmt', 'nv12'];
    case 'h264_amf': return ['-c:v', 'h264_amf', '-quality', 'speed', '-rc', 'cbr', ...rate, ...gop, '-pix_fmt', 'yuv420p'];
    default: return ['-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', '-profile:v', 'high', '-pix_fmt', 'yuv420p', ...rate, ...gop, '-sc_threshold', '0', '-x264-params', 'nal-hrd=cbr'];
  }
}

class LiveOutput extends EventEmitter {
  constructor(ffmpeg) { super(); this.ffmpeg = ffmpeg; this.proc = null; this.stopping = false; }

  get running() { return !!this.proc; }

  /** opts: { outputs:[{url,key}], quality:480|720|1080, encoder, testFile } */
  start(opts) {
    if (this.proc) this.stop();
    let urls;
    if (opts.testFile) urls = [opts.testFile];
    else {
      const res = (opts.outputs || []).map((o) => ({ name: o.name || 'Destination', r: outputUrl(o) }));
      const bad = res.filter((x) => typeof x.r !== 'string');
      if (!res.length) throw new Error('Choisissez au moins une destination (YouTube…).');
      if (bad.length) throw new Error(bad.map((x) => `${x.name} : ${x.r.error}`).join(' · ') + '. Vérifiez l\'onglet Diffusion.');
      urls = res.map((x) => x.r);
    }
    const q = QUALITIES[opts.quality] || QUALITIES[720];
    const out = urls.length === 1
      ? ['-f', 'flv', urls[0]]
      : ['-f', 'tee', urls.map((u) => `[f=flv:onfail=ignore]${teeEscape(u)}`).join('|')];
    const args = ['-hide_banner', '-loglevel', 'warning', '-stats',
      '-fflags', '+genpts+discardcorrupt', '-thread_queue_size', '1024', '-i', 'pipe:0',
      '-map', '0:v:0', '-map', '0:a:0?',
      '-vf', `scale=${q.size}:force_original_aspect_ratio=decrease,pad=${q.size}:(ow-iw)/2:(oh-ih)/2,fps=30`,
      ...videoArgs(opts.encoder, q),
      '-c:a', 'aac', '-b:a', `${q.ab}k`, '-ar', '44100', '-ac', '2',
      '-flvflags', 'no_duration_filesize', ...out];
    this.stopping = false;
    this.lastErr = '';
    const proc = spawn(this.ffmpeg, args, { stdio: ['pipe', 'ignore', 'pipe'], windowsHide: true });
    this.proc = proc;
    let buf = '';
    proc.stderr.on('data', (d) => {
      buf += d.toString();
      const parts = buf.split(/[\r\n]+/); buf = parts.pop();
      for (const line of parts) {
        const m = /frame=\s*(\d+).*?fps=\s*([\d.]+).*?time=\s*([\d:.]+).*?bitrate=\s*([\d.]+|N\/A).*?speed=\s*([\d.]+|N\/A)x?/.exec(line);
        if (m) this.emit('stats', { frame: +m[1], fps: +m[2], time: m[3], kbps: parseFloat(m[4]) || 0, speed: parseFloat(m[5]) || 0 });
        else if (line.trim()) { this.lastErr = hideKeys(line.trim()).slice(0, 300); this.emit('log', this.lastErr); }
      }
    });
    proc.stdin.on('error', () => {});
    proc.on('error', (e) => { this.lastErr = e.message; });
    proc.on('exit', (code) => {
      if (this.proc === proc) this.proc = null;
      this.emit('exit', { code, expected: this.stopping, error: this.lastErr });
    });
  }

  write(chunk) {
    const p = this.proc;
    if (!p || !p.stdin.writable) return;
    // si ffmpeg prend trop de retard (connexion internet trop faible), on le signale
    if (p.stdin.writableLength > 40 * 1048576) { this.emit('log', 'Connexion trop lente : la vidéo prend du retard.'); return; }
    p.stdin.write(chunk);
  }

  stop() {
    const p = this.proc; if (!p) return;
    this.stopping = true;
    try { p.stdin.end(); } catch {}
    setTimeout(() => { try { p.kill(); } catch {} }, 4000);
  }
}

/** Enregistrement sur le PC : on écrit le WebM tel quel, puis on le convertit en MP4 à la fin. */
class Recording {
  constructor(ffmpeg, dir) { this.ffmpeg = ffmpeg; this.dir = dir; this.file = null; this.stream = null; }
  start() {
    fs.mkdirSync(this.dir, { recursive: true });
    const d = new Date(), z = (n) => String(n).padStart(2, '0');
    const base = `Direct ${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}h${z(d.getMinutes())}`;
    let name = base, i = 2;
    while (fs.existsSync(path.join(this.dir, name + '.webm')) || fs.existsSync(path.join(this.dir, name + '.mp4'))) name = `${base} (${i++})`;
    this.file = path.join(this.dir, name + '.webm');
    this.stream = fs.createWriteStream(this.file);
    return this.file;
  }
  write(chunk) { if (this.stream) this.stream.write(chunk); }
  /** Termine et convertit en MP4 (copie de la vidéo, son en AAC : rapide). Renvoie le chemin final. */
  stop() {
    const s = this.stream, webm = this.file; this.stream = null;
    if (!s) return Promise.resolve(null);
    return new Promise((resolve) => {
      s.end(() => {
        const mp4 = webm.replace(/\.webm$/, '.mp4');
        const p = spawn(this.ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-fflags', '+genpts', '-i', webm, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', mp4], { windowsHide: true });
        p.on('error', () => resolve(webm));
        p.on('exit', (code) => {
          if (code === 0 && fs.existsSync(mp4) && fs.statSync(mp4).size > 0) { try { fs.unlinkSync(webm); } catch {} resolve(mp4); }
          else { try { fs.unlinkSync(mp4); } catch {} resolve(webm); }
        });
      });
    });
  }
}

module.exports = { LiveOutput, Recording, detectEncoders, outputUrl, hideKeys, QUALITIES };
