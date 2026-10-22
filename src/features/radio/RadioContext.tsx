import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { availableModes, buildRound, loadRadioCatalog, onAir, radioSettingsOf, type RadioItem, type RadioMode } from './radio';

const MODE_KEY = 'kcc-radio-mode';
/** Titres illisibles d'affilée avant d'arrêter la radio (fichier supprimé, réseau coupé…). */
const MAX_ERRORS = 5;

interface RadioValue {
  /** Le catalogue est chargé (avant : rien n'est connu). */
  ready: boolean;
  loading: boolean;
  /** La radio a été lancée : le mini-lecteur reste affiché d'une page à l'autre. */
  active: boolean;
  playing: boolean;
  failed: boolean;
  mode: RadioMode;
  modes: RadioMode[];
  /** Ce que diffuse le mode choisi. */
  items: RadioItem[];
  current: RadioItem | null;
  upcoming: RadioItem[];
  time: number;
  duration: number;
  /** Charge le catalogue à l'avance, pour que « Écouter » démarre sans attendre. */
  prepare: () => void;
  start: (mode?: RadioMode) => void;
  toggle: () => void;
  next: () => void;
  stop: () => void;
  setMode: (m: RadioMode) => void;
}

const Ctx = createContext<RadioValue | null>(null);

function savedMode(): RadioMode {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return m === 'songs' || m === 'sermons' ? m : 'all';
  } catch {
    return 'all';
  }
}

/**
 * Lecteur de la radio, monté une seule fois autour de toutes les pages :
 * l'écoute continue quand on change de page. Un seul élément <audio> enchaîne
 * les titres ; démarrer un autre lecteur du site (chant, prédication) arrête la radio.
 */
export function RadioProvider({ children }: { children: ReactNode }) {
  const { settings } = useSiteSettings();
  const audio = useRef<HTMLAudioElement>(null);
  const [catalog, setCatalog] = useState<RadioItem[] | null>(null);
  const loadingRef = useRef<Promise<RadioItem[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setModeState] = useState<RadioMode>(savedMode);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [queue, setQueue] = useState<{ list: RadioItem[]; index: number }>({ list: [], index: 0 });
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const queueRef = useRef(queue);
  const errors = useRef(0);

  const radio = useMemo(() => radioSettingsOf(settings), [settings]);
  const allOnAir = useMemo(() => onAir(catalog ?? [], radio, 'all'), [catalog, radio]);
  const modes = useMemo(() => availableModes(allOnAir), [allOnAir]);
  const effectiveMode = modes.includes(mode) ? mode : modes[0] ?? 'all';
  const items = useMemo(() => onAir(catalog ?? [], radio, effectiveMode), [catalog, radio, effectiveMode]);

  const fetchCatalog = useCallback(() => {
    if (!loadingRef.current) {
      setLoading(true);
      loadingRef.current = loadRadioCatalog().then((c) => { setCatalog(c); return c; }).finally(() => setLoading(false));
    }
    return loadingRef.current;
  }, []);

  /** Place la file et lance le titre. Appelé directement depuis le clic : les téléphones l'exigent. */
  const playQueue = useCallback((list: RadioItem[], index: number) => {
    const a = audio.current;
    queueRef.current = { list, index };
    setQueue(queueRef.current);
    const item = list[index];
    if (!a || !item) { setActive(false); return; }
    setTime(0);
    setDuration(item.durationSeconds ?? 0);
    a.src = item.url;
    a.play().catch(() => setPlaying(false));
  }, []);

  const startWith = useCallback((all: RadioItem[], m: RadioMode) => {
    const list = buildRound(onAir(all, radio, m), Math.random, queueRef.current.list[queueRef.current.index]?.key);
    errors.current = 0;
    setFailed(false);
    if (!list.length) { setActive(false); return; }
    setActive(true);
    playQueue(list, 0);
  }, [playQueue, radio]);

  const setMode = useCallback((m: RadioMode) => {
    setModeState(m);
    try { localStorage.setItem(MODE_KEY, m); } catch { /* navigation privée */ }
  }, []);

  const start = useCallback((m?: RadioMode) => {
    const wanted = m ?? effectiveMode;
    if (m) setMode(m);
    if (catalog) startWith(catalog, wanted);
    else void fetchCatalog().then((c) => startWith(c, wanted));
  }, [catalog, effectiveMode, fetchCatalog, setMode, startWith]);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const next = useCallback(() => {
    const { list, index } = queueRef.current;
    if (index + 1 < list.length) playQueue(list, index + 1);
    else playQueue(buildRound(itemsRef.current, Math.random, list[index]?.key), 0);
  }, [playQueue]);

  const stop = useCallback(() => {
    audio.current?.pause();
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!active || !a?.src) return start();
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [active, start]);

  const changeMode = useCallback((m: RadioMode) => {
    setMode(m);
    if (active && catalog) startWith(catalog, m);
  }, [active, catalog, setMode, startWith]);

  // Un autre lecteur du site démarre (chant, prédication, vidéo) : la radio s'arrête.
  useEffect(() => {
    const onPlay = (e: Event) => {
      if (e.target !== audio.current && e.target instanceof HTMLMediaElement) stop();
    };
    document.addEventListener('play', onPlay, true);
    return () => document.removeEventListener('play', onPlay, true);
  }, [stop]);

  // Écran verrouillé et casque Bluetooth : titre affiché, pause et « suivant ».
  const current = active ? queue.list[queue.index] ?? null : null;
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const ms = navigator.mediaSession;
    ms.metadata = current ? new MediaMetadata({ title: current.title, artist: current.subtitle, album: 'Radio Je suis KCCiste', artwork: [{ src: current.imageUrl || '/images/logo-kcc.svg' }] }) : null;
    const set = (action: MediaSessionAction, fn: (() => void) | null) => { try { ms.setActionHandler(action, fn); } catch { /* action non prise en charge */ } };
    set('play', current ? () => void audio.current?.play() : null);
    set('pause', current ? () => audio.current?.pause() : null);
    set('nexttrack', current ? () => nextRef.current() : null);
  }, [current]);

  const value: RadioValue = {
    ready: !!catalog, loading, active, playing, failed, mode: effectiveMode, modes, items, current,
    upcoming: active ? queue.list.slice(queue.index + 1, queue.index + 4) : [],
    time, duration,
    prepare: () => void fetchCatalog(), start, toggle, next, stop, setMode: changeMode,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio
        ref={audio}
        preload="none"
        className="hidden"
        onPlay={(e) => {
          setPlaying(true);
          document.querySelectorAll('audio, video').forEach((x) => { if (x !== e.currentTarget) (x as HTMLMediaElement).pause(); });
        }}
        onPause={() => setPlaying(false)}
        onPlaying={() => { errors.current = 0; }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => { if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration); }}
        onEnded={next}
        onError={() => {
          if (!active) return;
          errors.current += 1;
          if (errors.current >= Math.min(MAX_ERRORS, Math.max(1, queueRef.current.list.length))) { setFailed(true); stop(); return; }
          next();
        }}
      />
    </Ctx.Provider>
  );
}

export function useRadio(): RadioValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRadio doit être utilisé dans <RadioProvider>.');
  return v;
}
