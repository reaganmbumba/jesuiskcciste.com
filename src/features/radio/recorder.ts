/**
 * Enregistrement de l'émission en direct : on garde le son de l'antenne (voix, musique,
 * appels, effets) pendant le direct, pour le télécharger ou le repasser en rediffusion.
 */
export type ShowRecording = { blob: Blob; mime: string; ext: string; seconds: number };
export type ShowRecorder = { stop: () => Promise<ShowRecording | null>; cancel: () => void };

const TYPES: [string, string][] = [
  ['audio/webm;codecs=opus', 'webm'],
  ['audio/webm', 'webm'],
  ['audio/ogg;codecs=opus', 'ogg'],
  ['audio/mp4', 'm4a'],
];

export function recordShow(stream: MediaStream): ShowRecorder | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const found = TYPES.find(([t]) => MediaRecorder.isTypeSupported(t));
  let mr: MediaRecorder;
  try {
    // 48 kbit/s : environ 21 Mo par heure, assez pour la voix et la musique
    mr = new MediaRecorder(stream, { ...(found ? { mimeType: found[0] } : {}), audioBitsPerSecond: 48_000 });
  } catch { return null; }
  const chunks: Blob[] = [];
  const t0 = Date.now();
  mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  mr.start(5000);
  const mime = (found?.[0] ?? mr.mimeType ?? 'audio/webm').split(';')[0];
  const ext = found?.[1] ?? 'webm';
  return {
    stop: () => new Promise((resolve) => {
      if (mr.state === 'inactive') return resolve(chunks.length ? { blob: new Blob(chunks, { type: mime }), mime, ext, seconds: Math.round((Date.now() - t0) / 1000) } : null);
      mr.onstop = () => resolve(chunks.length ? { blob: new Blob(chunks, { type: mime }), mime, ext, seconds: Math.round((Date.now() - t0) / 1000) } : null);
      try { mr.stop(); } catch { resolve(null); }
    }),
    cancel: () => { try { if (mr.state !== 'inactive') mr.stop(); } catch { /* déjà arrêté */ } },
  };
}
