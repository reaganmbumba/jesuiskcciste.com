/**
 * Émission de radio en direct par le relais du site (Cloudflare Realtime, via /api/live/*).
 *
 * - L'animateur envoie deux pistes audio : « audio » (l'antenne, que tout le monde entend)
 *   et « retour » (l'animateur et la musique sans les auditeurs au téléphone).
 * - L'auditeur qui appelle envoie sa piste « voix » et écoute le « retour »
 *   (il n'entend pas sa propre voix revenir avec du retard).
 */

const ICE: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }], bundlePolicy: 'max-bundle' };

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const r = await fetch(`/api/live/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const j = (await r.json().catch(() => ({}))) as T & { error?: string; detail?: string };
  if (!r.ok) {
    const e = j.error === 'not-configured' ? 'Le relais du direct n’est pas activé sur le site.'
      : j.error === 'forbidden' ? 'Ce compte n’est pas administrateur du site.'
        : `Le relais ne répond pas (${j.detail || j.error || r.status}).`;
    throw new Error(e);
  }
  return j;
}

export type Watch = { pc: RTCPeerConnection; stream: MediaStream };

/** Reçoit une piste (« audio », « retour » ou « voix ») d'une session du relais. */
export async function watchTrack(sessionId: string, track: 'audio' | 'retour' | 'voix', onState?: (s: RTCPeerConnectionState) => void): Promise<Watch> {
  const j = await post<{ sessionId: string; sdp: string }>('watch', { sessionId, tracks: [track] });
  const pc = new RTCPeerConnection(ICE);
  const stream = new MediaStream();
  pc.ontrack = (e) => stream.addTrack(e.track);
  if (onState) pc.onconnectionstatechange = () => onState(pc.connectionState);
  await pc.setRemoteDescription({ type: 'offer', sdp: j.sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await post('answer', { sessionId: j.sessionId, sdp: pc.localDescription?.sdp });
  return { pc, stream };
}

export type Publish = { pc: RTCPeerConnection; sessionId: string };

/** L'animateur (jeton d'un administrateur) envoie l'antenne et le retour. */
export async function publishShow(token: string, program: MediaStreamTrack, retour: MediaStreamTrack): Promise<Publish> {
  const pc = new RTCPeerConnection(ICE);
  const a = pc.addTransceiver(program, { direction: 'sendonly' });
  const b = pc.addTransceiver(retour, { direction: 'sendonly' });
  await pc.setLocalDescription(await pc.createOffer());
  const j = await post<{ sessionId: string; sdp: string }>('publish', {
    sdp: pc.localDescription?.sdp, tracks: [{ mid: a.mid, trackName: 'audio' }, { mid: b.mid, trackName: 'retour' }],
  }, token);
  await pc.setRemoteDescription({ type: 'answer', sdp: j.sdp });
  return { pc, sessionId: j.sessionId };
}

/** Un auditeur envoie sa voix (sans compte). */
export async function publishCaller(voice: MediaStreamTrack): Promise<Publish> {
  const pc = new RTCPeerConnection(ICE);
  const t = pc.addTransceiver(voice, { direction: 'sendonly' });
  await pc.setLocalDescription(await pc.createOffer());
  const j = await post<{ sessionId: string; sdp: string }>('call', { sdp: pc.localDescription?.sdp, mid: t.mid });
  await pc.setRemoteDescription({ type: 'answer', sdp: j.sdp });
  return { pc, sessionId: j.sessionId };
}

/** Micro réglé pour la voix (réduction d'écho et de bruit). */
export function microphone(deviceId?: string): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: { deviceId: deviceId ? { exact: deviceId } : undefined, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: false,
  });
}
