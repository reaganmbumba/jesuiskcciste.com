import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, Volume2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

/**
 * Lecteur du direct envoyé par le studio du site : l'image arrive du relais
 * vidéo de Cloudflare (WebRTC), par le Worker (/api/live/watch puis /answer).
 * Démarre en muet (règle des navigateurs) avec un bouton « Activer le son »,
 * et se reconnecte tout seul si la connexion tombe ou si le studio change de session.
 */
export function StudioPlayer({ sessionId, className }: { sessionId: string; className?: string }) {
  const { tx } = useI18n();
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<'connecting' | 'playing' | 'waiting' | 'error'>('connecting');
  const [muted, setMuted] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let closed = false;
    let pc: RTCPeerConnection | null = null;
    let retry: number | undefined;
    const again = (ms: number) => { if (!closed) retry = window.setTimeout(() => setAttempt((a) => a + 1), ms); };
    setState('connecting');
    (async () => {
      try {
        const r = await fetch('/api/live/watch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, tracks: ['video', 'audio'] }) });
        const j = (await r.json().catch(() => ({}))) as { sessionId?: string; sdp?: string; error?: string };
        if (!r.ok || !j.sdp || !j.sessionId) throw new Error(j.error ?? String(r.status));
        if (closed) return;
        pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }], bundlePolicy: 'max-bundle' });
        const stream = new MediaStream();
        pc.ontrack = (e) => {
          stream.addTrack(e.track);
          const v = video.current;
          if (v && v.srcObject !== stream) { v.srcObject = stream; void v.play().catch(() => {}); }
        };
        pc.onconnectionstatechange = () => {
          const s = pc?.connectionState;
          if (s === 'connected') setState('playing');
          if (s === 'failed') { setState('waiting'); again(3000); }
          if (s === 'disconnected') { setState('waiting'); again(6000); }
        };
        await pc.setRemoteDescription({ type: 'offer', sdp: j.sdp });
        await pc.setLocalDescription(await pc.createAnswer());
        const a = await fetch('/api/live/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: j.sessionId, sdp: pc.localDescription?.sdp }) });
        if (!a.ok) throw new Error('answer');
      } catch {
        if (!closed) { setState('error'); again(5000); }
      }
    })();
    return () => { closed = true; window.clearTimeout(retry); pc?.close(); };
  }, [sessionId, attempt]);

  function unmute() {
    const v = video.current;
    if (!v) return;
    v.muted = false;
    void v.play().catch(() => {});
    setMuted(false);
  }

  return (
    <div className={cn('relative aspect-video overflow-hidden rounded-2xl bg-black shadow-lift', className)}>
      <video ref={video} className="absolute inset-0 h-full w-full object-contain" autoPlay playsInline muted={muted} controls={state === 'playing' && !muted} />
      {state !== 'playing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 text-center text-sm text-white">
          {state === 'error' ? <RefreshCw className="h-7 w-7 animate-spin text-gold-300" aria-hidden /> : <Loader2 className="h-7 w-7 animate-spin text-gold-300" aria-hidden />}
          <span>
            {state === 'connecting' ? tx('Connexion au direct…', 'Connecting to the live stream…', 'A ligar à transmissão…')
              : state === 'waiting' ? tx('Le direct reprend dans un instant…', 'The live stream will resume shortly…', 'A transmissão retoma dentro de instantes…')
              : tx('Le direct n’est pas encore disponible. Nouvelle tentative…', 'The live stream is not available yet. Retrying…', 'A transmissão ainda não está disponível. A tentar de novo…')}
          </span>
        </div>
      )}
      {state === 'playing' && muted && (
        <button type="button" onClick={unmute} className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-black/70 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-black/85">
          <Volume2 className="h-5 w-5 text-gold-300" aria-hidden />{tx('Activer le son', 'Turn on sound', 'Ativar o som')}
        </button>
      )}
    </div>
  );
}
