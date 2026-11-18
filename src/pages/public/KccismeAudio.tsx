import { useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

/**
 * Livre audio « Le KCCisme », libre pour tous (avant le code d'accès du texte écrit).
 * Fichiers : public/livres/audio-kccisme/ (index.json + un MP3 par chapitre),
 * fabriqués par tools/livre-audio (voix Rémy, titres par Vivienne).
 */

const BASE = '/livres/audio-kccisme/';
const RESUME_KEY = 'kcc.kccisme.audio';

interface Track { id: string; titre: string; fichier: string; secondes: number }

const fmt = (s: number) => {
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
};
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function readResume(): { i: number; t: number } | null {
  try { return JSON.parse(localStorage.getItem(RESUME_KEY) ?? 'null'); } catch { return null; }
}
function saveResume(i: number, t: number) {
  try { localStorage.setItem(RESUME_KEY, JSON.stringify({ i, t: Math.floor(t) })); } catch { /* stockage indisponible */ }
}

export function KccismeAudio() {
  const { tx } = useI18n();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const resume = useRef(readResume());
  const pendingSeek = useRef(0);

  useEffect(() => {
    fetch(BASE + 'index.json').then((r) => (r.ok ? r.json() : [])).then(setTracks).catch(() => setTracks([]));
  }, []);

  const play = (i: number, at = 0) => {
    const a = audioRef.current;
    if (!a || !tracks[i]) return;
    if (i !== current) {
      pendingSeek.current = at;
      a.src = BASE + tracks[i].fichier;
      setCurrent(i);
      setTime(at);
    }
    void a.play().catch(() => setPlaying(false));
  };
  const toggle = (i: number) => {
    const a = audioRef.current;
    if (i === current && a && !a.paused) a.pause();
    else play(i);
  };

  if (!tracks.length) return null;
  const total = tracks.reduce((n, t) => n + t.secondes, 0);
  const r = resume.current;
  const track = tracks[current];

  return (
    <section className="container-page pt-10" aria-labelledby="kccisme-audio-title">
      <div className="mx-auto max-w-5xl rounded-3xl bg-night p-6 text-white shadow-lift sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-night"><Headphones className="h-6 w-6" aria-hidden /></span>
          <div className="min-w-0 flex-1">
            <h2 id="kccisme-audio-title" className="font-display text-2xl font-semibold sm:text-3xl">{tx('Écouter le livre audio', 'Listen to the audiobook', 'Ouvir o audiolivro')}</h2>
            <p className="text-sm text-white/70">{tx(`Gratuit pour tous, sans code · ${tracks.length} parties · ${fmt(total)} · en français`, `Free for everyone, no code · ${tracks.length} parts · ${fmt(total)} · in French`, `Gratuito para todos, sem código · ${tracks.length} partes · ${fmt(total)} · em francês`)}</p>
          </div>
          {current < 0 && r && tracks[r.i] && r.t > 5 && (
            <button type="button" onClick={() => play(r.i, r.t)} className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-night hover:bg-gold-300">
              {tx(`Reprendre : ${tracks[r.i].titre} (${clock(r.t)})`, `Resume: ${tracks[r.i].titre} (${clock(r.t)})`, `Retomar: ${tracks[r.i].titre} (${clock(r.t)})`)}
            </button>
          )}
        </div>

        <audio
          ref={audioRef}
          preload="none"
          controls={current >= 0}
          className={cn('mt-5 w-full', current < 0 && 'hidden')}
          onLoadedMetadata={(e) => { if (pendingSeek.current) { e.currentTarget.currentTime = pendingSeek.current; pendingSeek.current = 0; } }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            if (Math.abs(t - time) >= 5) { setTime(t); saveResume(current, t); }
          }}
          onEnded={() => { if (current + 1 < tracks.length) play(current + 1); else saveResume(0, 0); }}
        />
        {track && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <button type="button" onClick={() => play(current - 1)} disabled={current === 0} className="rounded-lg p-2 text-white/80 hover:bg-white/10 disabled:opacity-30" aria-label={tx('Partie précédente', 'Previous part', 'Parte anterior')}><SkipBack className="h-4 w-4" /></button>
            <p className="min-w-0 flex-1 truncate font-semibold text-gold-200">{track.titre}</p>
            <button type="button" onClick={() => play(current + 1)} disabled={current + 1 >= tracks.length} className="rounded-lg p-2 text-white/80 hover:bg-white/10 disabled:opacity-30" aria-label={tx('Partie suivante', 'Next part', 'Parte seguinte')}><SkipForward className="h-4 w-4" /></button>
          </div>
        )}

        <ol className="mt-5 grid gap-1.5 sm:grid-cols-2">
          {tracks.map((t, i) => {
            const on = i === current && playing;
            return (
              <li key={t.id}>
                <button type="button" onClick={() => toggle(i)} aria-pressed={on}
                  className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition', i === current ? 'bg-white/15' : 'hover:bg-white/10')}>
                  <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full', on ? 'bg-gold text-night' : 'bg-white/10 text-gold')}>
                    {on ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t.titre}</span>
                  <span className="shrink-0 text-xs text-white/50">{fmt(t.secondes)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
