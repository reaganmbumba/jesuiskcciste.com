import { describe, expect, it } from 'vitest';
import { pendingRadioAlert, radioAlertMessage } from '@/features/radio/radioAlert';
import { defaultRadioLive, defaultRadioSettings, type RadioSettings } from '@/features/radio/radio';

const NOW = Date.parse('2026-11-21T12:00:00Z');
const at = (min: number) => new Date(NOW + min * 60000).toISOString();
const prog = (id: string, min: number) => ({ id, title: 'Écho du Ciel', topic: '', url: 'https://jesuiskcciste.com/radio/emissions/a.mp3', startsAt: at(min), durationSeconds: 1800 });
const none = () => false;

describe('alerte radio dans le site', () => {
  it('animateur à l’antenne : alerte « start » une seule fois', () => {
    const radio: RadioSettings = { ...defaultRadioSettings, live: { ...defaultRadioLive, onAir: true, rtc: 'session-abc123', title: 'Matinale', startedAt: at(-1) } };
    const a = pendingRadioAlert(radio, NOW, none);
    expect(a).toMatchObject({ key: `radio:${at(-1)}`, kind: 'start', title: 'Matinale' });
    expect(pendingRadioAlert(radio, NOW, (k) => k === a!.key)).toBeNull();
  });
  it('émission programmée : rappel 15 min avant, puis alerte au début', () => {
    expect(pendingRadioAlert({ ...defaultRadioSettings, programmes: [prog('p', 10)] }, NOW, none)).toMatchObject({ key: 'rappel-radio:p', kind: 'soon' });
    expect(pendingRadioAlert({ ...defaultRadioSettings, programmes: [prog('p', 20)] }, NOW, none)).toBeNull();
    expect(pendingRadioAlert({ ...defaultRadioSettings, programmes: [prog('p', -2)] }, NOW, none)).toMatchObject({ key: 'radio-prog:p', kind: 'start' });
    expect(pendingRadioAlert({ ...defaultRadioSettings, programmes: [prog('p', -40)] }, NOW, none)).toBeNull();
  });
  it('message au prénom, toujours avec « Paix »', () => {
    const a = { key: 'k', kind: 'soon' as const, title: 'Écho du Ciel', startsAt: at(10) };
    expect(radioAlertMessage(a, 'Reagan', 'fr')).toEqual({ greeting: 'Paix, Reagan !', text: "« Écho du Ciel » commence à 13:10 (heure de Kinshasa) sur Radio Je suis KCCiste. Soyez à l'heure pour suivre !" });
    expect(radioAlertMessage({ ...a, kind: 'start' }, null, 'fr').greeting).toBe('Paix à vous !');
    expect(radioAlertMessage(a, 'Ana Maria', 'pt').greeting).toBe('Paz, Ana!');
  });
});
