import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import type { Track } from '@/types';
import { formatDuration } from '@/utils/format';
import { useI18n } from '@/i18n';

/** Lecteur audio accessible (contrôles clavier natifs + boutons étiquetés). */
export function AudioPlayer({ track, artistName, onPrev, onNext }: { track: Track | null; artistName?: string; onPrev?: () => void; onNext?: () => void }) {
  const { tx } = useI18n();
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a || !track?.audioUrl) return;
    a.load();
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [track?.id, track?.audioUrl]);

  if (!track) return null;
  const playable = !!track.audioUrl && track.broadcastRights === 'authorized';
  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else { a.pause(); setPlaying(false); }
  };

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-white/10 bg-night/95 text-white backdrop-blur lg:bottom-0" role="region" aria-label="Lecteur audio">
      {playable && <audio ref={ref} src={track.audioUrl!} muted={muted} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={() => { setPlaying(false); onNext?.(); }} preload="metadata" />}
      <div className="container-page flex items-center gap-3 py-3">
        <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-600 text-night sm:grid"><Play className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1 sm:flex-none sm:w-56">
          <p className="truncate text-sm font-semibold">{track.title}</p>
          <p className="truncate text-xs text-white/55">{artistName}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onPrev} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Titre précédent"><SkipBack className="h-4 w-4" /></button>
          <button onClick={toggle} disabled={!playable} className="grid h-11 w-11 place-items-center rounded-full bg-gold text-night hover:bg-gold-300 disabled:opacity-40" aria-label={playing ? tx('Pause', 'Pause', 'Pausa') : tx('Lecture', 'Play', 'Reproduzir')}>{playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</button>
          <button onClick={onNext} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Titre suivant"><SkipForward className="h-4 w-4" /></button>
        </div>
        <div className="hidden flex-1 items-center gap-3 md:flex">
          <span className="w-10 text-right text-xs tabular-nums text-white/55">{formatDuration(time)}</span>
          <input type="range" min={0} max={duration || 0} step={0.1} value={time} onChange={(e) => { if (ref.current) ref.current.currentTime = Number(e.target.value); }} className="h-1 flex-1 accent-[#D4AF62]" aria-label="Position de lecture" disabled={!playable} />
          <span className="w-10 text-xs tabular-nums text-white/55">{formatDuration(duration || track.durationSeconds)}</span>
        </div>
        <button onClick={() => setMuted((m) => !m)} className="hidden h-9 w-9 place-items-center rounded-full hover:bg-white/10 sm:grid" aria-label={muted ? tx('Activer le son', 'Unmute', 'Ativar o som') : tx('Couper le son', 'Mute', 'Cortar o som')}>{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
      </div>
      {!playable && <p className="container-page pb-2 text-xs text-amber-200">{tx('Lecture indisponible', 'Playback unavailable', 'Reprodução indisponível')} : {track.broadcastRights !== 'authorized' ? tx('autorisation de diffusion en attente ou restreinte.', 'broadcast permission pending or restricted.', 'autorização de difusão pendente ou restrita.') : tx('fichier audio non importé.', 'audio file not uploaded.', 'ficheiro áudio não importado.')}</p>}
    </div>
  );
}
