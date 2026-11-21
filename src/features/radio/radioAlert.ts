/**
 * Alerte de la radio dans le site et l'application : quand une émission commence (animateur
 * à l'antenne ou émission programmée) ou va commencer (rappel 15 min avant), une fenêtre
 * s'ouvre sur n'importe quelle page avec une petite sonnerie, puis le message est dit à voix
 * haute (« Paix, Reagan ! … »). Un toucher ouvre la radio en plein écran (/radio/app).
 *
 * Les clés sont les mêmes que celles des notifications du téléphone (worker/notifications.ts),
 * et une alerte déjà montrée ne revient pas.
 */
import { isLiveOn, type RadioSettings } from './radio';

export type RadioAlertKind = 'start' | 'soon';
export interface RadioAlert { key: string; kind: RadioAlertKind; title: string; startsAt: string }

/** Rappel montré au plus 15 min avant le début. */
export const ALERT_SOON_MINUTES = 15;
/** Une émission commencée depuis plus de 30 min n'est plus annoncée. */
export const ALERT_START_MINUTES = 30;

/** L'alerte à montrer maintenant, ou null. seen = clés déjà montrées. */
export function pendingRadioAlert(radio: RadioSettings, now: number, seen: (key: string) => boolean): RadioAlert | null {
  const started = (iso: string | null) => { const t = iso ? Date.parse(iso) : NaN; return !Number.isNaN(t) && t <= now + 60000 && t >= now - ALERT_START_MINUTES * 60000; };
  const soon = (iso: string) => { const t = Date.parse(iso); return !Number.isNaN(t) && t > now + 60000 && t <= now + ALERT_SOON_MINUTES * 60000; };
  const host = isLiveOn(radio.live, new Date(now));
  if (host && radio.live.startedAt && started(radio.live.startedAt)) {
    const key = `radio:${radio.live.startedAt}`;
    if (!seen(key)) return { key, kind: 'start', title: radio.live.title || 'Émission en direct', startsAt: radio.live.startedAt };
  }
  if (!host) {
    for (const p of radio.programmes) {
      if (!started(p.startsAt)) continue;
      const key = `radio-prog:${p.id}`;
      if (!seen(key)) return { key, kind: 'start', title: p.title || 'Émission programmée', startsAt: p.startsAt };
      break;
    }
  }
  for (const p of radio.programmes) {
    if (!soon(p.startsAt)) continue;
    const key = `rappel-radio:${p.id}`;
    if (!seen(key)) return { key, kind: 'soon', title: p.title || 'Émission programmée', startsAt: p.startsAt };
  }
  return null;
}

/** Heure de Kinshasa, ex. « 14:00 ». */
export const alertHour = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Africa/Kinshasa' }).format(new Date(iso));

type Lang = 'fr' | 'en' | 'pt';

/** Message de l'alerte : commence toujours par « Paix », au prénom de la personne si on le connaît. */
export function radioAlertMessage(a: RadioAlert, firstName: string | null | undefined, lang: Lang = 'fr'): { greeting: string; text: string } {
  const name = (firstName ?? '').trim().split(/\s+/)[0] ?? '';
  const greeting = name
    ? { fr: `Paix, ${name} !`, en: `Peace, ${name}!`, pt: `Paz, ${name}!` }[lang]
    : { fr: 'Paix à vous !', en: 'Peace be with you!', pt: 'Paz a si!' }[lang];
  const h = alertHour(a.startsAt);
  const text = a.kind === 'start'
    ? { fr: `« ${a.title} » est en direct maintenant sur Radio Je suis KCCiste. Venez écouter !`, en: `“${a.title}” is live now on Radio Je suis KCCiste. Come and listen!`, pt: `«${a.title}» está em direto agora na Rádio Je suis KCCiste. Venha ouvir!` }[lang]
    : { fr: `« ${a.title} » commence à ${h} (heure de Kinshasa) sur Radio Je suis KCCiste. Soyez à l'heure pour suivre !`, en: `“${a.title}” starts at ${h} (Kinshasa time) on Radio Je suis KCCiste. Be on time to follow it!`, pt: `«${a.title}» começa às ${h} (hora de Kinshasa) na Rádio Je suis KCCiste. Seja pontual para acompanhar!` }[lang];
  return { greeting, text };
}

/* ---------- Son et voix ---------- */

let ac: AudioContext | null = null;
/** Petite sonnerie (trois notes, deux fois), fabriquée dans le navigateur. */
export function playAlertChime(): number {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return 0;
    ac ??= new AC();
    void ac.resume();
    const t0 = ac.currentTime + 0.05;
    const notes = [784, 988, 1175];
    for (let r = 0; r < 2; r++) {
      notes.forEach((f, i) => {
        const t = t0 + r * 0.9 + i * 0.18;
        const o = ac!.createOscillator();
        const g = ac!.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.connect(g).connect(ac!.destination);
        o.start(t);
        o.stop(t + 0.55);
      });
    }
    return 1900;
  } catch { return 0; }
}

/** Dit le message avec la voix du téléphone (si l'appareil en a une). « KCC » se dit « Kasésé ». */
export function speakAlert(text: string, lang: Lang = 'fr') {
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/KCCiste/g, 'Kasésiste').replace(/KCC/g, 'Kasésé').replace(/[«»“”]/g, ''));
    const code = { fr: 'fr-FR', en: 'en-US', pt: 'pt-PT' }[lang];
    u.lang = code;
    u.rate = 0.98;
    const v = synth.getVoices().find((x) => x.lang.toLowerCase().startsWith(lang));
    if (v) u.voice = v;
    synth.speak(u);
  } catch { /* pas de voix */ }
}
