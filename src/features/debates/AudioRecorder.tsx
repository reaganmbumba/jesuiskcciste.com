import { useEffect, useRef, useState } from 'react';
import { Mic, RotateCcw, Square } from 'lucide-react';
import { useI18n } from '@/i18n';
import { DEBATE_RECORD_MAX_SECONDS, formatSeconds } from './debates';

export interface Recording { blob: Blob; seconds: number; url: string }

/** Format pris en charge par le navigateur : Opus/WebM (Android, ordinateur) ou MP4/AAC (iPhone). */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((t) => MediaRecorder.isTypeSupported?.(t));
}

export const canRecord = () => typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

/** Bouton d'enregistrement vocal : appuyer pour commencer, appuyer pour arrêter, réécouter, recommencer. */
export function AudioRecorder({ value, onChange }: { value: Recording | null; onChange: (r: Recording | null) => void }) {
  const { tx } = useI18n();
  const [state, setState] = useState<'idle' | 'recording'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<number | null>(null);
  const started = useRef(0);

  const cleanup = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(() => () => { cleanup(); if (rec.current?.state === 'recording') rec.current.stop(); }, []);

  async function start() {
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      const mimeType = pickMimeType();
      const r = new MediaRecorder(s, mimeType ? { mimeType, audioBitsPerSecond: 48000 } : undefined);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      r.onstop = () => {
        const seconds = (Date.now() - started.current) / 1000;
        cleanup();
        setState('idle');
        const blob = new Blob(chunks, { type: (r.mimeType || mimeType || 'audio/webm').split(';')[0] });
        if (blob.size) onChange({ blob, seconds, url: URL.createObjectURL(blob) });
      };
      rec.current = r;
      started.current = Date.now();
      setElapsed(0);
      r.start(1000);
      setState('recording');
      timer.current = window.setInterval(() => {
        const sec = (Date.now() - started.current) / 1000;
        setElapsed(sec);
        if (sec >= DEBATE_RECORD_MAX_SECONDS && r.state === 'recording') r.stop();
      }, 250);
    } catch {
      cleanup();
      setError(tx(
        'Le micro n’est pas accessible. Autorisez le micro pour ce site, ou envoyez plutôt un fichier audio.',
        'The microphone is not available. Allow the microphone for this site, or send an audio file instead.',
        'O microfone não está acessível. Autorize o microfone para este site, ou envie antes um ficheiro áudio.',
      ));
    }
  }

  const stop = () => { if (rec.current?.state === 'recording') rec.current.stop(); };
  const reset = () => { if (value) URL.revokeObjectURL(value.url); onChange(null); };

  if (value) {
    return (
      <div className="space-y-2 rounded-2xl bg-mist p-3">
        <audio src={value.url} controls preload="metadata" className="w-full" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink/60">{tx('Message vocal', 'Voice message', 'Mensagem de voz')} · {formatSeconds(value.seconds)}</span>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-semibold text-night hover:text-gold-700"><RotateCcw className="h-4 w-4" aria-hidden />{tx('Recommencer', 'Record again', 'Gravar de novo')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {state === 'recording' ? (
        <button type="button" onClick={stop} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-4 py-4 font-semibold text-white">
          <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-white" /></span>
          {tx('Enregistrement…', 'Recording…', 'A gravar…')} {formatSeconds(elapsed)} / {formatSeconds(DEBATE_RECORD_MAX_SECONDS)}
          <Square className="h-4 w-4 fill-current" aria-hidden /><span className="sr-only">{tx('Arrêter', 'Stop', 'Parar')}</span>
        </button>
      ) : (
        <button type="button" onClick={start} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-night px-4 py-4 font-semibold text-white">
          <Mic className="h-5 w-5 text-gold" aria-hidden />{tx('Appuyer pour enregistrer un vocal', 'Tap to record a voice message', 'Toque para gravar uma mensagem de voz')}
        </button>
      )}
      {state === 'recording' && <p className="text-center text-xs text-ink/55">{tx('Appuyez de nouveau pour arrêter.', 'Tap again to stop.', 'Toque de novo para parar.')}</p>}
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}
