import { useCallback, useState } from 'react';

/**
 * Sons des jeux, fabriqués à la volée avec Web Audio (aucun fichier à
 * télécharger, fonctionne hors ligne). Le son se coupe avec le bouton du jeu ;
 * le choix est gardé dans le téléphone.
 */
export type GameSound = 'tap' | 'drop' | 'error' | 'crush' | 'combo' | 'letter' | 'win' | 'lose';

const MUTE_KEY = 'kcc-jeux-son-coupe';

let ctx: AudioContext | null = null;
let muted = readMuted();

function readMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}

export const isMuted = () => muted;

export function setMuted(v: boolean) {
  muted = v;
  try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch { /* navigation privée */ }
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try { ctx = new Ctor(); } catch { return null; }
  }
  // Les navigateurs démarrent le son seulement après un geste du joueur.
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  return ctx;
}

/** Une note : fréquence, départ (s), durée (s), forme d'onde, volume, glissement de fréquence. */
function tone(ac: AudioContext, out: AudioNode, freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.25, glideTo?: number) {
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Petit souffle (bruit filtré) pour l'impact de l'écrasement. */
function burst(ac: AudioContext, out: AudioNode, start: number, dur: number, vol = 0.35) {
  const t0 = ac.currentTime + start;
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2400, t0);
  filter.frequency.exponentialRampToValueAtTime(300, t0 + dur);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(out);
  src.start(t0);
}

/** La voix du téléphone dit « Kasésé » (la prononciation de KCC), quand elle existe. */
let lastSpoken = 0;
function sayKasese() {
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
    const now = Date.now();
    if (now - lastSpoken < 900) return; // pas deux fois d'affilée pendant une cascade
    lastSpoken = now;
    const u = new SpeechSynthesisUtterance('Kasésé !');
    u.lang = 'fr-FR';
    u.rate = 1.05;
    u.pitch = 1.15;
    u.volume = 1;
    const fr = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('fr'));
    if (fr) u.voice = fr;
    synth.speak(u);
  } catch { /* pas de voix sur cet appareil */ }
}

/**
 * Joue un son. `level` sert aux enchaînements (cascade ×2, ×3…) : le son
 * d'écrasement monte d'un ton à chaque fois.
 */
export function playSound(sound: GameSound, level = 0) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const out = ac.createGain();
  out.gain.value = 0.9;
  out.connect(ac.destination);
  const up = 2 ** (Math.min(level, 6) * 2 / 12);
  switch (sound) {
    case 'tap':
      tone(ac, out, 660, 0, 0.08, 'triangle', 0.18, 880);
      break;
    case 'drop':
      tone(ac, out, 520, 0, 0.1, 'triangle', 0.22, 340);
      tone(ac, out, 180, 0, 0.08, 'sine', 0.18);
      break;
    case 'error':
      tone(ac, out, 220, 0, 0.12, 'square', 0.08, 180);
      tone(ac, out, 180, 0.1, 0.16, 'square', 0.08, 140);
      break;
    case 'letter':
      tone(ac, out, 1320, 0, 0.12, 'sine', 0.14);
      tone(ac, out, 1760, 0.05, 0.16, 'sine', 0.1);
      break;
    case 'crush':
    case 'combo': {
      // Impact grave, puis trois notes dorées au rythme « Ka-sé-sé » (K, C, C) et une étincelle.
      burst(ac, out, 0, 0.22, 0.3);
      tone(ac, out, 130 * up, 0, 0.25, 'sine', 0.35, 65 * up);
      const notes: [number, number][] = [[523.25, 0.05], [783.99, 0.19], [1046.5, 0.3]];
      notes.forEach(([f, s]) => {
        tone(ac, out, f * up, s, 0.4, 'triangle', 0.22);
        tone(ac, out, f * up * 2, s, 0.25, 'sine', 0.06);
      });
      tone(ac, out, 2093 * up, 0.42, 0.5, 'sine', 0.08, 2637 * up);
      if (sound === 'crush') sayKasese();
      break;
    }
    case 'win': {
      // Petite fanfare de victoire.
      const seq: [number, number, number][] = [[523.25, 0, 0.18], [659.25, 0.14, 0.18], [783.99, 0.28, 0.18], [1046.5, 0.42, 0.6]];
      seq.forEach(([f, s, d]) => { tone(ac, out, f, s, d, 'triangle', 0.25); tone(ac, out, f / 2, s, d, 'sine', 0.12); });
      [1318.5, 1568, 2093].forEach((f, i) => tone(ac, out, f, 0.5 + i * 0.06, 0.5, 'sine', 0.07));
      break;
    }
    case 'lose':
      [392, 349.23, 293.66].forEach((f, i) => tone(ac, out, f, i * 0.18, 0.3, 'triangle', 0.18));
      break;
  }
}

/** État du bouton « son » partagé par les jeux. */
export function useSound() {
  const [isOff, setIsOff] = useState(isMuted);
  const toggle = useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    setIsOff(next);
    if (!next) playSound('tap');
  }, []);
  return { muted: isOff, toggle, play: playSound };
}
