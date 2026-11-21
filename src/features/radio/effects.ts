/**
 * Effets de l'antenne radio, fabriqués dans le navigateur (Web Audio) :
 * - traitement « voix pro » (actif par défaut) : coupe les graves parasites, chaleur, présence,
 *   adoucit les « s », compresse et limite, pour une voix régulière et nette comme en studio ;
 * - effets sur la voix de l'animateur : écho, réverbération, voix « radio » ;
 * - bruitages à déclencher d'un clic pendant la musique (jingle, gong, applaudissements…).
 */

export type VoiceFx = 'pro' | 'echo' | 'reverb' | 'radio';
export type Pad = 'jingle' | 'gong' | 'applause' | 'whoosh' | 'boom' | 'beep' | 'airhorn' | 'drumroll';

/** Génériques d'émissions, prêts à lancer depuis le Studio. */
export const GENERIQUES: { name: string; url: string }[] = [
  { name: 'Journal KCC', url: '/radio/generiques/journal.mp3' },
  { name: 'Tosungana', url: '/radio/generiques/tosungana.mp3' },
  { name: 'Prière du matin', url: '/radio/generiques/priere.mp3' },
  { name: 'Fin d’émission', url: '/radio/generiques/fin.mp3' },
];

export const PADS: { id: Pad; label: string; emoji: string }[] = [
  { id: 'jingle', label: 'Jingle', emoji: '🎵' },
  { id: 'applause', label: 'Applaudissements', emoji: '👏' },
  { id: 'gong', label: 'Gong', emoji: '🔔' },
  { id: 'whoosh', label: 'Transition', emoji: '💨' },
  { id: 'boom', label: 'Boum', emoji: '💥' },
  { id: 'drumroll', label: 'Roulement', emoji: '🥁' },
  { id: 'airhorn', label: 'Trompette', emoji: '📯' },
  { id: 'beep', label: 'Bip', emoji: '📻' },
];

function noiseBuffer(ac: BaseAudioContext, seconds: number) {
  const b = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/** Réponse impulsionnelle d'une salle (pour la réverbération). */
function impulse(ac: BaseAudioContext, seconds = 2.2, decay = 2.8) {
  const len = Math.ceil(ac.sampleRate * seconds);
  const b = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return b;
}

/** Chaîne d'effets placée entre le micro et l'antenne. */
export function voiceChain(ac: AudioContext, input: AudioNode, output: AudioNode[]) {
  const dry = ac.createGain();
  // voix « radio » : bande passante resserrée, plus de présence
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 20;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 20000;
  const pres = ac.createBiquadFilter(); pres.type = 'peaking'; pres.frequency.value = 2500; pres.Q.value = 1; pres.gain.value = 0;
  input.connect(hp); hp.connect(lp); lp.connect(pres);
  // « voix pro » : passe-haut 80 Hz, chaleur, présence, dé-esseur, compresseur, limiteur
  const proHp = ac.createBiquadFilter(); proHp.type = 'highpass'; proHp.frequency.value = 80; proHp.Q.value = 0.7;
  const warm = ac.createBiquadFilter(); warm.type = 'lowshelf'; warm.frequency.value = 160; warm.gain.value = 2;
  const presence = ac.createBiquadFilter(); presence.type = 'peaking'; presence.frequency.value = 3200; presence.Q.value = 0.9; presence.gain.value = 3;
  const deEss = ac.createBiquadFilter(); deEss.type = 'peaking'; deEss.frequency.value = 7000; deEss.Q.value = 2; deEss.gain.value = -4;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -24; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.18;
  const makeup = ac.createGain(); makeup.gain.value = 1.9;
  const limit = ac.createDynamicsCompressor();
  limit.threshold.value = -3; limit.knee.value = 0; limit.ratio.value = 20; limit.attack.value = 0.001; limit.release.value = 0.08;
  const proOn = ac.createGain(); proOn.gain.value = 1;
  const proOff = ac.createGain(); proOff.gain.value = 0;
  const voice = ac.createGain();
  pres.connect(proHp); proHp.connect(warm); warm.connect(presence); presence.connect(deEss); deEss.connect(comp);
  comp.connect(makeup); makeup.connect(limit); limit.connect(proOn); proOn.connect(voice);
  pres.connect(proOff); proOff.connect(voice);
  voice.connect(dry);
  // écho
  const delay = ac.createDelay(1); delay.delayTime.value = 0.32;
  const fb = ac.createGain(); fb.gain.value = 0.38;
  const echoWet = ac.createGain(); echoWet.gain.value = 0;
  voice.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(echoWet);
  // réverbération
  const conv = ac.createConvolver(); conv.buffer = impulse(ac);
  const revWet = ac.createGain(); revWet.gain.value = 0;
  voice.connect(conv); conv.connect(revWet);
  for (const o of output) { dry.connect(o); echoWet.connect(o); revWet.connect(o); }
  const now = () => ac.currentTime;
  return {
    set(fx: VoiceFx, on: boolean) {
      if (fx === 'pro') { proOn.gain.setTargetAtTime(on ? 1 : 0, now(), 0.05); proOff.gain.setTargetAtTime(on ? 0 : 1, now(), 0.05); }
      if (fx === 'echo') echoWet.gain.setTargetAtTime(on ? 0.55 : 0, now(), 0.05);
      if (fx === 'reverb') revWet.gain.setTargetAtTime(on ? 0.6 : 0, now(), 0.05);
      if (fx === 'radio') {
        hp.frequency.setTargetAtTime(on ? 300 : 20, now(), 0.05);
        lp.frequency.setTargetAtTime(on ? 3400 : 20000, now(), 0.05);
        pres.gain.setTargetAtTime(on ? 6 : 0, now(), 0.05);
      }
    },
  };
}

/** Joue un bruitage vers la sortie donnée. */
export function playPad(ac: AudioContext, out: AudioNode, pad: Pad) {
  const t = ac.currentTime + 0.01;
  const env = (g: GainNode, a: number, peak: number, d: number) => {
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  };
  const tone = (f: number, start: number, dur: number, type: OscillatorType = 'sine', peak = 0.35) => {
    const o = ac.createOscillator(); o.type = type; o.frequency.value = f;
    const g = ac.createGain(); g.gain.setValueAtTime(0, t + start); g.gain.linearRampToValueAtTime(peak, t + start + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
    o.connect(g); g.connect(out); o.start(t + start); o.stop(t + start + dur + 0.05);
  };
  switch (pad) {
    case 'jingle':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => { tone(f, i * 0.13, 0.9, 'triangle', 0.3); tone(f * 2, i * 0.13, 0.5, 'sine', 0.08); });
      break;
    case 'beep':
      tone(1000, 0, 0.18, 'sine', 0.3); tone(1000, 0.28, 0.18, 'sine', 0.3);
      break;
    case 'gong': {
      [110, 165.4, 220.7, 297, 413].forEach((f, i) => tone(f, 0, 3.5 - i * 0.4, 'sine', 0.28 / (i + 1)));
      break;
    }
    case 'boom': {
      const o = ac.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(35, t + 0.9);
      const g = ac.createGain(); env(g, 0.005, 0.9, 1.1); o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.3);
      break;
    }
    case 'whoosh': {
      const n = ac.createBufferSource(); n.buffer = noiseBuffer(ac, 1.4);
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(6000, t + 0.7); f.frequency.exponentialRampToValueAtTime(800, t + 1.3);
      const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.7, t + 0.6); g.gain.linearRampToValueAtTime(0, t + 1.35);
      n.connect(f); f.connect(g); g.connect(out); n.start(t);
      break;
    }
    case 'applause': {
      const dur = 3.2;
      const n = ac.createBufferSource(); n.buffer = noiseBuffer(ac, dur);
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.7;
      const claps = ac.createGain(); claps.gain.value = 0;
      // des centaines de petits claquements aléatoires
      for (let k = 0; k < 260; k++) {
        const at = t + Math.random() * (dur - 0.4);
        claps.gain.setValueAtTime(0.9, at); claps.gain.setTargetAtTime(0.05, at + 0.004, 0.012);
      }
      const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.55, t + 0.4); g.gain.setValueAtTime(0.55, t + dur - 1); g.gain.linearRampToValueAtTime(0, t + dur);
      n.connect(f); f.connect(claps); claps.connect(g); g.connect(out); n.start(t);
      break;
    }
    case 'drumroll': {
      const n = ac.createBufferSource(); n.buffer = noiseBuffer(ac, 2.3);
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8;
      const hits = ac.createGain(); hits.gain.value = 0;
      for (let k = 0; k < 2; k += 0.045) { hits.gain.setValueAtTime(0.25 + k * 0.25, t + k); hits.gain.setTargetAtTime(0.02, t + k + 0.005, 0.01); }
      hits.gain.setValueAtTime(1, t + 2.02); hits.gain.setTargetAtTime(0, t + 2.05, 0.08);
      n.connect(f); f.connect(hits); hits.connect(out); n.start(t);
      tone(70, 2.0, 0.6, 'sine', 0.6);
      break;
    }
    case 'airhorn': {
      [0, 0.5].forEach((s) => [440, 554, 659].forEach((f) => tone(f, s, s ? 1.1 : 0.35, 'sawtooth', 0.09)));
      break;
    }
  }
}

/** Joue un fichier son chargé par l'animateur (bruitage personnel). */
export function playBuffer(ac: AudioContext, out: AudioNode, buf: AudioBuffer) {
  const s = ac.createBufferSource(); s.buffer = buf; s.connect(out); s.start();
  return s;
}
