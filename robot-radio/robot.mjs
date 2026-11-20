/**
 * Robot de la Radio Je suis KCCiste → YouTube (et toute adresse RTMP).
 *
 * Tourne jour et nuit sur un petit serveur (Hetzner, voir LISEZ-MOI.md). Toutes les
 * 20 secondes, il relit le réglage « radio » du site (Supabase, lecture publique) :
 *
 *  - une émission programmée commence : il lit son fichier audio et l'envoie à YouTube
 *    avec une image animée (logo KCC, « En direct », titre, sujet, onde du son) ;
 *  - un direct passe par un flux audio externe (Zeno.fm, Icecast…) : il le relaie aussi ;
 *  - un direct est fait depuis l'antenne du site (/admin/radio/antenne) : il se retire,
 *    c'est l'antenne qui envoie elle-même à YouTube (deux envois sur une même clé
 *    seraient refusés par YouTube) ;
 *  - rien à l'antenne : il n'envoie rien (YouTube termine le direct tout seul).
 *
 * La clé de stream n'est jamais dans le dépôt : elle est lue dans les variables
 * d'environnement du serveur (/etc/robot-radio.env, lisible par root seulement).
 *
 * Variables : YOUTUBE_KEY (obligatoire), YOUTUBE_URL (défaut rtmp://a.rtmp.youtube.com/live2),
 *   EXTRA_RTMP (autres adresses complètes rtmp(s)://…/clé, séparées par des espaces),
 *   SUPABASE_URL, SUPABASE_ANON_KEY, POLL_SECONDS (20), FONT, FONT_BOLD, LOGO,
 *   ROBOT_TEST_OUTPUT (fichier .flv pour les essais, remplace les destinations),
 *   ROBOT_SETTINGS_URL (essais : adresse qui rend le réglage JSON à la place de Supabase).
 *
 * Aucune dépendance npm : Node 18+ et ffmpeg suffisent.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const env = process.env;
const SUPABASE_URL = env.SUPABASE_URL || 'https://anawpwprqvzxgzcpqqwu.supabase.co';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || 'sb_publishable_hnpwDEfVVCC0BhYkxOgdwQ_E745c7rK';
const POLL_MS = Math.max(5, Number(env.POLL_SECONDS || 20)) * 1000;
const LIVE_MAX_HOURS = 6;

const log = (...a) => console.log(new Date().toISOString(), ...a);

// ——— Ce qui doit partir sur YouTube (logique pure, testée dans essais.mjs) ———

/** Émissions programmées valides, comme sur le site (src/features/radio/radio.ts). */
export function parseProgrammes(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const o of raw) {
    if (!o || typeof o !== 'object') continue;
    const startsAt = typeof o.startsAt === 'string' ? o.startsAt : typeof o.starts_at === 'string' ? o.starts_at : '';
    const dur = Number(o.durationSeconds ?? o.duration_seconds);
    const url = typeof o.url === 'string' ? o.url : '';
    if (!startsAt || Number.isNaN(new Date(startsAt).getTime()) || !(dur > 0) || !/^https:\/\//.test(url)) continue;
    out.push({
      id: typeof o.id === 'string' && o.id ? o.id : `${startsAt}-${url}`,
      title: typeof o.title === 'string' ? o.title.slice(0, 120) : '',
      topic: typeof o.topic === 'string' ? o.topic.slice(0, 3000) : '',
      url, startsAt, durationSeconds: Math.round(dur),
    });
  }
  return out.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function liveOn(l, now) {
  if (!l || l.onAir !== true || !(l.url || l.rtc)) return false;
  if (!l.startedAt) return true;
  const t = new Date(l.startedAt).getTime();
  return Number.isNaN(t) || now - t < LIVE_MAX_HOURS * 3600000;
}

/**
 * Ce que le robot doit envoyer maintenant, ou null.
 * radio = valeur « radio » du réglage public du site.
 */
export function target(radio, now = Date.now()) {
  const live = radio?.live ?? {};
  if (liveOn(live, now)) {
    // direct de l'antenne du site : elle envoie elle-même à YouTube
    if (live.rtc) return { kind: 'antenne', id: `antenne:${live.rtc}` };
    if (/^https?:\/\//.test(String(live.url))) {
      return { kind: 'live', id: `live:${live.url}:${live.startedAt || ''}`, url: String(live.url), seek: 0, endsAt: null,
        title: String(live.title || 'Émission en direct'), topic: String(live.topic || '') };
    }
  }
  for (const p of parseProgrammes(radio?.programmes)) {
    const start = new Date(p.startsAt).getTime();
    const end = start + p.durationSeconds * 1000;
    if (start <= now && now < end) {
      const seek = (now - start) / 1000;
      return { kind: 'programme', id: `programme:${p.id}`, url: p.url, seek: seek > 3 ? seek : 0, endsAt: end,
        title: p.title || 'Émission programmée', topic: p.topic };
    }
  }
  return null;
}

/** Texte coupé en lignes pour l'image (drawtext ne coupe pas tout seul). */
export function wrapText(text, width = 52, maxLines = 3) {
  const words = String(text || '').replace(/[*_~]/g, '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (t.length > width && line) { lines.push(line); line = w; } else line = t;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  else if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, '…');
  return lines.join('\n');
}

/** Adresses RTMP de sortie (clé collée à l'adresse du serveur). */
export function destinations(e = env) {
  if (e.ROBOT_TEST_OUTPUT) return [e.ROBOT_TEST_OUTPUT];
  const out = [];
  const key = String(e.YOUTUBE_KEY || '').trim();
  if (key) {
    if (!/^[A-Za-z0-9._~\-]{4,300}$/.test(key)) throw new Error('Clé YouTube illisible : recopiez-la depuis YouTube Studio.');
    out.push(`${String(e.YOUTUBE_URL || 'rtmp://a.rtmp.youtube.com/live2').trim().replace(/\/+$/, '')}/${key}`);
  }
  for (const u of String(e.EXTRA_RTMP || '').split(/\s+/).filter(Boolean)) if (/^rtmps?:\/\/\S+$/.test(u)) out.push(u);
  return out;
}

const firstFile = (...c) => c.find((f) => f && fs.existsSync(f)) || '';
const FONT = firstFile(env.FONT, '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/TTF/DejaVuSans.ttf');
const FONT_BOLD = firstFile(env.FONT_BOLD, '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf', FONT);
const LOGO = firstFile(env.LOGO, path.join(here, 'logo.png'), path.join(here, '..', 'public', 'icon-512.png'));

/** Arguments ffmpeg : son de l'émission + image 1280×720 animée → FLV vers chaque destination. */
export function ffmpegArgs(t, outs, files) {
  const input = [];
  if (t.kind === 'live') input.push('-reconnect', '1', '-reconnect_streamed', '1', '-reconnect_delay_max', '10');
  if (t.seek > 0) input.push('-ss', t.seek.toFixed(1));
  input.push('-re', '-thread_queue_size', '1024', '-i', t.url);
  const dt = (font, file, size, color, y) =>
    `drawtext=fontfile='${font}':textfile='${file}':expansion=none:fontsize=${size}:fontcolor=${color}:line_spacing=10:x=(w-text_w)/2:y=${y}`;
  const fc = [
    '[0:a]aresample=44100,aformat=channel_layouts=stereo,asplit=2[aout][aw]',
    '[aw]aformat=channel_layouts=mono,showwaves=s=1280x140:mode=cline:rate=30:colors=0xE8B84A,format=rgba[w]',
    files.logo ? '[2:v]scale=-1:170[l]' : null,
    files.logo ? '[1:v][l]overlay=(W-w)/2:50[b]' : '[1:v]null[b]',
    '[b][w]overlay=0:560:shortest=1:format=auto,format=yuv420p[c]',
    [
      '[c]drawbox=x=520:y=238:w=240:h=40:color=0xc0392b:t=fill',
      dt(FONT_BOLD, files.badge, 24, 'white', 245),
      ...files.title.map((f, i) => dt(FONT_BOLD, f, 46, 'white', 298 + i * 58)),
      ...files.topic.map((f, i) => dt(FONT, f, 28, '0xe8e2d0', 312 + files.title.length * 58 + i * 40)),
      dt(FONT, files.brand, 24, '0xe8b84a', 520),
    ].join(',') + '[v]',
  ].filter(Boolean).join(';');
  const tee = outs.length > 1 ? ['-f', 'tee', outs.map((o) => `[f=flv:onfail=ignore]${o.replace(/([\\|\[\]])/g, '\\$1')}`).join('|')] : ['-f', 'flv', outs[0]];
  return [
    '-hide_banner', '-loglevel', 'warning', '-nostdin',
    ...input,
    '-f', 'lavfi', '-i', 'color=c=0x0b1626:s=1280x720:r=30',
    ...(files.logo ? ['-loop', '1', '-framerate', '30', '-i', files.logo] : []),
    '-filter_complex', fc, '-map', '[v]', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '60', '-keyint_min', '60',
    '-b:v', '1800k', '-maxrate', '1800k', '-bufsize', '3600k',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
    ...(t.endsAt ? ['-t', String(Math.max(5, Math.ceil((t.endsAt - Date.now()) / 1000) + 2))] : []),
    ...(outs.length > 1 ? ['-flags', '+global_header'] : []),
    ...tee,
  ];
}

// ——— Boucle du robot ———

async function fetchRadio() {
  const url = env.ROBOT_SETTINGS_URL || `${SUPABASE_URL}/rest/v1/site_settings?select=value&key=eq.public`;
  const r = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`réglage du site illisible (${r.status})`);
  const j = await r.json();
  const value = Array.isArray(j) ? j[0]?.value : j;
  return value?.radio ?? null;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'robot-radio-'));
function writeTexts(t) {
  const f = (name, text) => { const p = path.join(tmp, name); fs.writeFileSync(p, text); return p; };
  return {
    badge: f('badge.txt', '● EN DIRECT'),
    title: wrapText(t.title, 40, 2).split('\n').map((l, i) => f(`titre${i}.txt`, l)),
    topic: wrapText(t.topic, 64, t.title.length > 40 ? 2 : 3).split('\n').filter(Boolean).map((l, i) => f(`sujet${i}.txt`, l)),
    brand: f('marque.txt', 'Radio Je suis KCCiste  ·  jesuiskcciste.com/radio'),
    logo: LOGO,
  };
}

let current = null; // { t, proc }
const finished = new Set(); // émissions programmées arrivées au bout du fichier
let lastFail = 0;

function start(t) {
  const outs = destinations();
  if (!outs.length) { log('Aucune clé YouTube : ajoutez YOUTUBE_KEY dans /etc/robot-radio.env'); return; }
  log(`→ YouTube : ${t.kind === 'live' ? 'direct' : 'émission programmée'} « ${t.title} »${t.seek ? ` (reprise à ${Math.round(t.seek)} s)` : ''}`);
  const proc = spawn(env.FFMPEG || 'ffmpeg', ffmpegArgs(t, outs, writeTexts(t)), { stdio: ['ignore', 'ignore', 'pipe'] });
  proc.stderr.on('data', (d) => { const s = String(d).trim(); if (s) log('ffmpeg :', s.slice(0, 400)); });
  const me = { t, proc, startedAt: Date.now() };
  proc.on('exit', (code, sig) => {
    if (current !== me) return;
    current = null;
    const ranLong = Date.now() - me.startedAt > 60000;
    if (t.kind === 'programme' && (code === 0 || (t.endsAt && Date.now() > t.endsAt - 5000))) { finished.add(t.id); log(`Fin de « ${t.title} »`); return; }
    log(`ffmpeg arrêté (code ${code ?? sig}) : nouvel essai dans quelques secondes`);
    lastFail = ranLong ? 0 : Date.now();
  });
  current = me;
}

function stop(reason) {
  if (!current) return;
  log(`■ Arrêt : ${reason}`);
  const p = current.proc;
  current = null;
  p.kill('SIGINT');
  setTimeout(() => { try { p.kill('SIGKILL'); } catch { /* déjà fini */ } }, 5000).unref();
}

async function tick() {
  let radio;
  try { radio = await fetchRadio(); } catch (e) { log('Site injoignable :', e.message); return; }
  const t = target(radio);
  const want = t && t.kind !== 'antenne' && !finished.has(t.id) ? t : null;
  if (t?.kind === 'antenne' && current) stop('direct depuis l’antenne du site (elle envoie elle-même à YouTube)');
  if (current && (!want || want.id !== current.t.id)) stop(want ? 'autre émission' : 'plus rien à l’antenne');
  if (want && !current && Date.now() - lastFail > 10000) start(want);
}

export async function main() {
  try { destinations(); } catch (e) { log(e.message); process.exit(1); }
  log(`Robot radio démarré (vérification toutes les ${POLL_MS / 1000} s, ${destinations().length} destination(s)).`);
  const loop = async () => { await tick().catch((e) => log('Erreur :', e.message)); setTimeout(loop, current ? POLL_MS : Math.min(POLL_MS, 20000)); };
  loop();
  const bye = () => { stop('arrêt du robot'); setTimeout(() => process.exit(0), 500); };
  process.on('SIGTERM', bye);
  process.on('SIGINT', bye);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
