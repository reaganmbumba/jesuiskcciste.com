/**
 * Alerte de la radio dans le site et l'application : quand une émission commence (animateur
 * à l'antenne ou émission programmée) ou va commencer (rappel 15 min avant), une fenêtre
 * s'ouvre sur n'importe quelle page avec l'alarme de l'application radio (jingle
 * d'annonce avec la voix) et le message écrit « Paix, Reagan ! … ». Un toucher ouvre la radio en plein écran (/radio/app).
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

/* ---------- Alarme ---------- */

/**
 * L'alarme d'émission de l'application Radio Je suis KCCiste (jingle d'annonce avec la voix),
 * la même que radio/android/app/src/main/res/raw/alarme_emission.mp3.
 */
export const ALARM_URL = '/radio/alarme-emission.mp3';
/** L'alarme sonne deux fois (environ 20 s), puis s'arrête seule. */
export const ALARM_PLAYS = 2;

let alarm: HTMLAudioElement | null = null;
export function playAlarm() {
  try {
    stopAlarm();
    const a = new Audio(ALARM_URL);
    let left = ALARM_PLAYS;
    a.onended = () => { left -= 1; if (left > 0) { a.currentTime = 0; void a.play().catch(() => undefined); } };
    alarm = a;
    void a.play().catch(() => undefined);
  } catch { /* pas de son sur cet appareil */ }
}
export function stopAlarm() {
  if (!alarm) return;
  alarm.onended = null;
  alarm.pause();
  alarm = null;
}
