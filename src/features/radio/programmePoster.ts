/**
 * Affiche du programme du jour (JPG 16:9, 1920×1080) pour WhatsApp et Facebook :
 * fond nuit, or KCC, une ligne par émission avec ses heures (heure de Kinshasa).
 */
type Prog = { title: string; startsAt: string; durationSeconds: number };

const W = 1920, H = 1080;
const GOLD = '#e8b84a', GOLD_L = '#f5d58a';
const TZ = 'Africa/Kinshasa';
const t = (ms: number) => new Date(ms).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).replace(':', 'h');

function fit(g: CanvasRenderingContext2D, text: string, max: number): string {
  if (g.measureText(text).width <= max) return text;
  let s = text;
  while (s.length > 1 && g.measureText(`${s}…`).width > max) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}

export function paintProgrammePoster(g: CanvasRenderingContext2D, day: string, list: Prog[]) {
  // fond
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b1224'); bg.addColorStop(1, '#05070e');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(330, 300, 20, 330, 300, 900);
  glow.addColorStop(0, 'rgba(232,184,74,.22)'); glow.addColorStop(1, 'rgba(232,184,74,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  // ondes décoratives
  for (let i = 0; i < 5; i++) {
    g.strokeStyle = `rgba(232,184,74,${0.16 - i * 0.025})`; g.lineWidth = 3;
    g.beginPath(); g.arc(330, 330, 170 + i * 70, 0, Math.PI * 2); g.stroke();
  }
  // disque KCC
  g.fillStyle = '#0b1020'; g.beginPath(); g.arc(330, 330, 150, 0, Math.PI * 2); g.fill();
  g.strokeStyle = GOLD; g.lineWidth = 8; g.stroke();
  g.fillStyle = GOLD; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 92px Georgia, serif'; g.fillText('KCC', 330, 336);
  // titre à gauche
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '600 30px Arial, sans-serif';
  g.fillText('RADIO JE SUIS KCCISTE', 110, 610);
  g.fillStyle = '#fff'; g.font = 'bold 86px Georgia, serif';
  g.fillText('Programme', 110, 705); g.fillStyle = GOLD_L; g.fillText('du jour', 110, 795);
  const date = new Date(`${day}T12:00:00+01:00`).toLocaleDateString('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  g.fillStyle = GOLD; g.beginPath(); g.roundRect(110, 835, Math.max(380, g.measureText(date).width * 0.5 + 60), 64, 32); g.fill();
  g.fillStyle = '#0b1020'; g.font = 'bold 32px Arial, sans-serif';
  g.fillText(date.charAt(0).toUpperCase() + date.slice(1), 140, 878);

  // émissions à droite
  const x0 = 760, x1 = W - 90;
  const n = Math.max(1, list.length);
  const rowH = Math.min(150, (900 - 80) / n);
  const top = Math.max(60, (H - 120 - n * rowH) / 2); // liste centrée verticalement
  const big = Math.min(46, rowH * 0.36), small = Math.min(30, rowH * 0.24);
  list.forEach((p, i) => {
    const y = top + i * rowH;
    const s = new Date(p.startsAt).getTime();
    const e = s + p.durationSeconds * 1000;
    g.fillStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.roundRect(x0, y + 8, x1 - x0, rowH - 16, 20); g.fill();
    g.fillStyle = GOLD; g.beginPath(); g.roundRect(x0, y + 8, 10, rowH - 16, 5); g.fill();
    const cy = y + rowH / 2;
    g.fillStyle = GOLD_L; g.font = `bold ${big}px Arial, sans-serif`; g.textBaseline = 'middle';
    g.fillText(t(s), x0 + 40, cy - small * 0.55);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.font = `500 ${small}px Arial, sans-serif`;
    g.fillText(`→ ${t(e)}`, x0 + 40, cy + big * 0.55);
    g.fillStyle = '#fff';
    // titre long : la police rétrécit (sans descendre trop bas) avant de couper
    let fs = big;
    const nameMax = x1 - x0 - 330;
    const rediff = /\(rediffusion[^)]*\)\s*$/i.exec(p.title);
    const name = p.title.replace(/\s*\(rediffusion[^)]*\)\s*$/i, '');
    g.font = `bold ${fs}px Georgia, serif`;
    while (fs > big * 0.7 && g.measureText(name).width > nameMax) { fs -= 2; g.font = `bold ${fs}px Georgia, serif`; }
    g.fillText(fit(g, name, nameMax), x0 + 290, rediff ? cy - small * 0.6 : cy);
    if (rediff) { g.fillStyle = GOLD; g.font = `600 ${small}px Arial, sans-serif`; g.fillText(rediff[0].replace(/[()]/g, '').replace(/^./, (c) => c.toUpperCase()), x0 + 290, cy + big * 0.6); }
    g.textBaseline = 'alphabetic';
  });
  if (!list.length) { g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '36px Arial, sans-serif'; g.fillText('Chants et prédications toute la journée', x0 + 40, 500); }

  // bas
  g.fillStyle = 'rgba(232,184,74,.12)'; g.fillRect(0, H - 120, W, 120);
  g.fillStyle = GOLD; g.font = 'bold 36px Arial, sans-serif'; g.textBaseline = 'middle';
  g.fillText('🎧 jesuiskcciste.com/radio', 110, H - 60);
  g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '500 28px Arial, sans-serif';
  g.textAlign = 'right';
  g.fillText('📲 Application Radio KCCiste · entre les émissions : chants, jingles et l’heure', W - 90, H - 60);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}

export function drawProgrammePoster(day: string, list: Prog[]): Promise<Blob> {
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  paintProgrammePoster(cv.getContext('2d')!, day, list);
  return new Promise((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error('Image impossible'))), 'image/jpeg', 0.92));
}

/** Une ligne de la grille type : jours (1 = lundi … 7 = dimanche), heure, titre. */
type WeekRow = { jours: number[]; heure: string; titre: string };
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/** « Tous les jours », « Lun – Ven », « Sam, Dim »… */
export function joursLabel(j: number[]): string {
  const d = [...new Set(j)].sort((a, b) => a - b);
  if (d.length === 7) return 'Tous les jours';
  const run = d.length > 2 && d.every((x, i) => i === 0 || x === d[i - 1] + 1);
  return run ? `${JOURS[d[0] - 1]} – ${JOURS[d[d.length - 1] - 1]}` : d.map((x) => JOURS[x - 1]).join(', ');
}

/**
 * Affiche de la grille de la semaine : 16:9 (1920×1080) pour WhatsApp et Facebook,
 * ou verticale (1080×1920) pour TikTok et les statuts.
 */
export function paintWeekPoster(g: CanvasRenderingContext2D, rows: WeekRow[], vertical: boolean) {
  const w = vertical ? 1080 : W, h = vertical ? 1920 : H;
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0b1224'); bg.addColorStop(1, '#05070e');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const cx = vertical ? w / 2 : 330, cy0 = vertical ? 300 : 330;
  const glow = g.createRadialGradient(cx, cy0, 20, cx, cy0, 800);
  glow.addColorStop(0, 'rgba(232,184,74,.22)'); glow.addColorStop(1, 'rgba(232,184,74,0)');
  g.fillStyle = glow; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) { g.strokeStyle = `rgba(232,184,74,${0.15 - i * 0.03})`; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy0, 150 + i * 60, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#0b1020'; g.beginPath(); g.arc(cx, cy0, 130, 0, Math.PI * 2); g.fill();
  g.strokeStyle = GOLD; g.lineWidth = 8; g.stroke();
  g.fillStyle = GOLD; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 80px Georgia, serif'; g.fillText('KCC', cx, cy0 + 5);

  g.textBaseline = 'alphabetic';
  if (vertical) {
    g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '600 30px Arial, sans-serif'; g.fillText('RADIO JE SUIS KCCISTE', cx, 520);
    g.fillStyle = '#fff'; g.font = 'bold 84px Georgia, serif'; g.fillText('La grille', cx, 615);
    g.fillStyle = GOLD_L; g.fillText('de la semaine', cx, 705);
  } else {
    g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '600 30px Arial, sans-serif'; g.fillText('RADIO JE SUIS KCCISTE', 110, 610);
    g.fillStyle = '#fff'; g.font = 'bold 86px Georgia, serif'; g.fillText('La grille', 110, 705);
    g.fillStyle = GOLD_L; g.fillText('de la semaine', 110, 795);
    g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '500 30px Arial, sans-serif'; g.fillText('Heure de Kinshasa', 110, 860);
  }

  const x0 = vertical ? 70 : 760, x1 = vertical ? w - 70 : w - 90;
  const yTop = vertical ? 780 : 60, yBot = vertical ? h - 170 : h - 150;
  const n = Math.max(1, rows.length);
  const rowH = Math.min(vertical ? 150 : 130, (yBot - yTop) / n);
  const top = yTop + Math.max(0, (yBot - yTop - n * rowH) / 2);
  const big = Math.min(44, rowH * 0.36), small = Math.min(28, rowH * 0.24);
  g.textAlign = 'left';
  rows.forEach((r, i) => {
    const y = top + i * rowH, cy = y + rowH / 2;
    g.fillStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.roundRect(x0, y + 6, x1 - x0, rowH - 12, 18); g.fill();
    g.fillStyle = GOLD; g.beginPath(); g.roundRect(x0, y + 6, 10, rowH - 12, 5); g.fill();
    g.textBaseline = 'middle';
    g.fillStyle = GOLD_L; g.font = `bold ${big}px Arial, sans-serif`; g.fillText(r.heure.replace(':', 'h'), x0 + 36, cy - small * 0.55);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.font = `600 ${small}px Arial, sans-serif`; g.fillText(joursLabel(r.jours), x0 + 36, cy + big * 0.55);
    const nx = x0 + (vertical ? 290 : 300), max = x1 - nx - 24;
    let fs = big; g.font = `bold ${fs}px Georgia, serif`;
    while (fs > big * 0.68 && g.measureText(r.titre).width > max) { fs -= 2; g.font = `bold ${fs}px Georgia, serif`; }
    g.fillStyle = '#fff'; g.fillText(fit(g, r.titre, max), nx, cy);
    g.textBaseline = 'alphabetic';
  });

  const fh = vertical ? 150 : 120;
  g.fillStyle = 'rgba(232,184,74,.12)'; g.fillRect(0, h - fh, w, fh);
  g.textBaseline = 'middle'; g.fillStyle = GOLD; g.font = 'bold 36px Arial, sans-serif';
  if (vertical) {
    g.textAlign = 'center'; g.fillText('🎧 jesuiskcciste.com/radio', w / 2, h - fh + 50);
    g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '500 28px Arial, sans-serif'; g.fillText('📲 Application Radio KCCiste', w / 2, h - fh + 105);
  } else {
    g.textAlign = 'left'; g.fillText('🎧 jesuiskcciste.com/radio', 110, h - 60);
    g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '500 28px Arial, sans-serif'; g.textAlign = 'right';
    g.fillText('📲 Application Radio KCCiste · entre les émissions : chants, jingles et l’heure', w - 90, h - 60);
  }
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}

export function drawWeekPoster(rows: WeekRow[], vertical: boolean): Promise<Blob> {
  const cv = document.createElement('canvas');
  cv.width = vertical ? 1080 : W; cv.height = vertical ? 1920 : H;
  paintWeekPoster(cv.getContext('2d')!, rows, vertical);
  return new Promise((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error('Image impossible'))), 'image/jpeg', 0.92));
}
