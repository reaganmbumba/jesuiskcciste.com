/**
 * Attestation de fin du parcours néophyte, dessinée dans le navigateur
 * (image PNG 1600 × 1131, format A4 paysage) : rien n'est envoyé au serveur.
 */
import type { Locale } from '@/i18n';

export interface CertificateInput { name: string; parish: string; mentor: string; date: Date; locale: Locale }

const W = 1600;
const H = 1131;
const NIGHT = '#0E1830';
const GOLD = '#C49643';
const GOLD_LIGHT = '#E5C680';
const INK = '#1B2233';
const SERIF = '"Fraunces Variable", Georgia, serif';
const SANS = '"Plus Jakarta Sans Variable", system-ui, sans-serif';

const TEXT: Record<Locale, { church: string; title: string; sub: string; certify: string; done: string; parish: string; date: string; mentor: string; visa: string; verse: string; ref: string; note: string; months: string[] }> = {
  fr: {
    church: 'Église Bon Nouveau Message (KCC)',
    title: 'Attestation',
    sub: 'Parcours néophyte en ligne',
    certify: 'Il est attesté que',
    done: 'a suivi les douze leçons du carnet du néophyte et réussi leurs questions.',
    parish: 'Paroisse',
    date: 'Le',
    mentor: 'Accompagnateur',
    visa: 'Visa de l’accompagnateur',
    verse: '« Ton peuple sera mon peuple, et ton Dieu sera mon Dieu. »',
    ref: 'Ruth 1 : 16',
    note: 'Cette attestation ne remplace pas les sacrements : c’est le conseil de la paroisse qui décide de la Purification, de la Première Onction et des Actes d’Alliance.',
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  },
  en: {
    church: 'Good New Message Church (KCC)',
    title: 'Certificate',
    sub: 'Online neophyte course',
    certify: 'This is to certify that',
    done: 'has followed the twelve lessons of the neophyte notebook and passed their questions.',
    parish: 'Parish',
    date: 'On',
    mentor: 'Mentor',
    visa: 'Mentor’s initials',
    verse: '“Your people shall be my people, and your God my God.”',
    ref: 'Ruth 1:16',
    note: 'This certificate does not replace the sacraments: the parish council decides on Purification, the First Anointing and the Acts of Covenant.',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  pt: {
    church: 'Igreja Boa Nova Mensagem (KCC)',
    title: 'Certificado',
    sub: 'Percurso do neófito em linha',
    certify: 'Certifica-se que',
    done: 'seguiu as doze lições do caderno do neófito e acertou as suas perguntas.',
    parish: 'Paróquia',
    date: 'A',
    mentor: 'Acompanhante',
    visa: 'Rubrica do acompanhante',
    verse: '«O teu povo é o meu povo, e o teu Deus é o meu Deus.»',
    ref: 'Rute 1:16',
    note: 'Este certificado não substitui os sacramentos: é o conselho da paróquia que decide a Purificação, a Primeira Unção e os Atos de Aliança.',
    months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  },
};

function formatDate(d: Date, locale: Locale) {
  const m = TEXT[locale].months[d.getMonth()];
  if (locale === 'en') return `${d.getDate()} ${m} ${d.getFullYear()}`;
  if (locale === 'pt') return `${d.getDate()} de ${m} de ${d.getFullYear()}`;
  return `${d.getDate() === 1 ? '1er' : d.getDate()} ${m} ${d.getFullYear()}`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Réduit la police jusqu'à ce que le texte tienne dans maxWidth. */
function fitText(ctx: CanvasRenderingContext2D, text: string, weight: string, size: number, family: string, maxWidth: number) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    s -= 2;
  } while (s > 20);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lineHeight;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

export async function drawCertificate(input: CertificateInput): Promise<HTMLCanvasElement> {
  const t = TEXT[input.locale];
  try { await document.fonts?.ready; } catch { /* polices du système */ }
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Fond crème et doubles bordures dorées.
  ctx.fillStyle = '#FCF8EE';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, W, 18);
  ctx.fillRect(0, H - 18, W, 18);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.strokeRect(46, 46, W - 92, H - 92);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  const cx = W / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const logo = await loadImage('/images/logo-kcc.png');
  if (logo) ctx.drawImage(logo, cx - 60, 96, 120, 120);

  ctx.fillStyle = GOLD;
  ctx.font = `700 26px ${SANS}`;
  ctx.fillText(t.church.toUpperCase(), cx, 262);

  ctx.fillStyle = NIGHT;
  ctx.font = `500 96px ${SERIF}`;
  ctx.fillText(t.title, cx, 360);
  ctx.fillStyle = INK;
  ctx.font = `500 32px ${SANS}`;
  ctx.fillText(t.sub, cx, 412);

  ctx.fillStyle = '#5A6070';
  ctx.font = `400 30px ${SANS}`;
  ctx.fillText(t.certify, cx, 490);

  ctx.fillStyle = NIGHT;
  fitText(ctx, input.name, '600', 80, SERIF, W - 300);
  ctx.fillText(input.name, cx, 588);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 420, 616);
  ctx.lineTo(cx + 420, 616);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `400 30px ${SANS}`;
  wrap(ctx, t.done, cx, 672, W - 360, 42);

  ctx.font = `500 28px ${SANS}`;
  const info = [input.parish ? `${t.parish} : ${input.parish}` : '', `${t.date} ${formatDate(input.date, input.locale)}`].filter(Boolean).join('   ·   ');
  fitText(ctx, info, '500', 28, SANS, W - 300);
  ctx.fillText(info, cx, 770);

  ctx.fillStyle = '#5A6070';
  ctx.font = `italic 400 28px ${SERIF}`;
  ctx.fillText(t.verse, cx, 838);
  ctx.font = `600 22px ${SANS}`;
  ctx.fillStyle = GOLD;
  ctx.fillText(t.ref, cx, 872);

  // Visa de l'accompagnateur (signature à la main).
  const sx = W - 470;
  ctx.textAlign = 'center';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sx - 170, 958);
  ctx.lineTo(sx + 170, 958);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = `600 22px ${SANS}`;
  ctx.fillText(t.visa, sx, 990);
  if (input.mentor) {
    ctx.font = `400 22px ${SANS}`;
    fitText(ctx, input.mentor, '400', 22, SANS, 340);
    ctx.fillText(input.mentor, sx, 1020);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#5A6070';
  ctx.font = `400 18px ${SANS}`;
  wrap(ctx, t.note, 140, 950, 620, 26);
  ctx.fillStyle = GOLD;
  ctx.font = `700 20px ${SANS}`;
  ctx.fillText('www.jesuiskcciste.com', 140, 1040);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
