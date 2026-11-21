/**
 * Enregistrement de l'émission en direct : on garde le son de l'antenne (voix, musique,
 * appels, effets) pendant le direct, pour le télécharger ou le repasser en rediffusion.
 */
export type ShowRecording = { blob: Blob; mime: string; ext: string; seconds: number };
export type ShowRecorder = { stop: () => Promise<ShowRecording | null>; cancel: () => void; pause: () => void; resume: () => void; paused: () => boolean; seconds: () => number };

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
  // temps passé en pause : il ne compte pas dans la durée de l'émission
  let pausedMs = 0;
  let pausedAt = 0;
  const seconds = () => Math.round((Date.now() - t0 - pausedMs - (pausedAt ? Date.now() - pausedAt : 0)) / 1000);
  mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  mr.start(5000);
  const mime = (found?.[0] ?? mr.mimeType ?? 'audio/webm').split(';')[0];
  const ext = found?.[1] ?? 'webm';
  const done = (): ShowRecording | null => {
    const s = seconds();
    return chunks.length ? { blob: new Blob(chunks, { type: mime }), mime, ext, seconds: s } : null;
  };
  return {
    stop: () => new Promise((resolve) => {
      if (mr.state === 'inactive') return resolve(done());
      mr.onstop = () => resolve(done());
      try { mr.stop(); } catch { resolve(null); }
    }),
    pause: () => { if (mr.state === 'recording') { try { mr.pause(); pausedAt = Date.now(); } catch { /* non pris en charge */ } } },
    resume: () => { if (mr.state === 'paused') { try { mr.resume(); pausedMs += Date.now() - pausedAt; pausedAt = 0; } catch { /* non pris en charge */ } } },
    paused: () => mr.state === 'paused',
    seconds,
    cancel: () => { try { if (mr.state !== 'inactive') mr.stop(); } catch { /* déjà arrêté */ } },
  };
}
