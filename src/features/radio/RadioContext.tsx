import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { watchTrack } from './rtc';
import { useRadioListeners } from './listeners';
import { availableModes, buildRound, effectiveLive, fetchRadioSettings, isLiveOn, upcomingProgrammes, type RadioProgramme, liveItem, LIVE_POLL_MS, loadRadioCatalog, onAir, radioSettingsOf, type RadioItem, type RadioMode, type RadioSettings } from './radio';

const MODE_KEY = 'kcc-radio-mode';
/** Titres illisibles d'affilée avant d'arrêter la radio (fichier supprimé, réseau coupé…). */
const MAX_ERRORS = 5;
/** Après une coupure du flux en direct, on ne le retente qu'après ce délai (un chant passe entre-temps). */
const LIVE_RETRY_MS = 3 * 60_000;
/** Habillage de l'antenne : un jingle « Radio Je suis KCCiste » tous les quelques titres, comme une vraie radio. */
const JINGLES = Array.from({ length: 9 }, (_, i) => `/radio/jingles/kcc-${String(i + 1).padStart(2, '0')}.mp3`);
const JINGLE_EVERY = 3;
/** Fondus d'entrée et de sortie de chaque titre (secondes) : les titres s'enchaînent sans coupure nette. */
const FADE_IN = 1.5;
const FADE_OUT = 3.5;
/** Les chants passent un peu moins fort que les jingles et l'annonce de l'heure. */
const SONG_LEVEL = 0.75;
/** Pendant un jingle, la musique descend à 10 % de son volume (le jingle joue à 100 %). */
const DUCK = 0.1;
/** L'heure exacte est annoncée toutes les 7 minutes d'écoute (la première, une minute après le début). */
const TIME_EVERY_MS = 7 * 60_000;
const TIME_FIRST_MS = 60_000;

/** Heure de Kinshasa (quel que soit le pays de l'auditeur). */
export function kinshasaTime(d = new Date()): { h: number; m: number } {
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Kinshasa', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0) % (t === 'hour' ? 24 : 60);
  return { h: n('hour'), m: n('minute') };
}

/**
 * Annonce de l'heure façon animateur : « C'est l'heure ! … Il est exactement » + « quatorze heures »
 * + « vingt-cinq » + « en RDC. … ».
 */
export function timeAnnouncement(d = new Date()): string[] {
  const { h, m } = kinshasaTime(d);
  const pad = (x: number) => String(x).padStart(2, '0');
  return ['/radio/heure/intro.mp3', `/radio/heure/h${pad(h)}.mp3`, ...(m ? [`/radio/heure/m${pad(m)}.mp3`] : []), '/radio/heure/outro.mp3'];
}

interface RadioValue {
  /** Le catalogue est chargé (avant : rien n'est connu). */
  ready: boolean;
  loading: boolean;
  /** La radio a été lancée : le mini-lecteur reste affiché d'une page à l'autre. */
  active: boolean;
  playing: boolean;
  failed: boolean;
  /** Une émission est à l'antenne en ce moment (même si on n'écoute pas). */
  liveOn: boolean;
  liveTitle: string;
  /** Lien « Appeler l'émission », seulement pendant un direct qui reçoit des appels. */
  callUrl: string | null;
  /** L'émission en direct (antenne du site) accepte les appels par le site. */
  siteCalls: boolean;
  /** Nombre d'auditeurs du direct en ce moment (null = inconnu). */
  liveListeners: number | null;
  /** Sujet de l'émission en direct, écrit par l'animateur (vide sinon). */
  liveTopic: string;
  /** Session du relais de l'émission faite depuis l'antenne du site (sinon vide). */
  liveRtc: string;
  /** L'émission à l'antenne est une émission programmée (enregistrée à l'avance, sans appels). */
  liveProgrammed: boolean;
  /** Émissions programmées pas encore terminées. */
  programmes: RadioProgramme[];
  /** L'auditeur écoute l'émission en direct. */
  onLive: boolean;
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
  const [remote, setRemote] = useState<RadioSettings | null>(null);
  const [onLive, setOnLive] = useState(false);
  const onLiveRef = useRef(false);
  const liveFailedAt = useRef(0);
  /** Pendant un jingle : ce qui doit être joué juste après. */
  const afterJingle = useRef<(() => void) | null>(null);
  const songsSinceJingle = useRef(0);
  const lastJingle = useRef(-1);
  /** Volume du titre en cours (les chants un peu plus bas). */
  const levelRef = useRef(1);
  /** Jingles joués PAR-DESSUS la musique, sur un second lecteur. */
  const jingleEl = useRef<HTMLAudioElement>(null);
  const jingleBusy = useRef(false);
  const duck = useRef(1);
  const fadeV = useRef(1);
  const duckTimer = useRef(0);
  const nextTimeAt = useRef(0);
  const applyVolume = () => {
    const a = audio.current;
    if (!a || onLiveRef.current) return;
    a.volume = Math.max(0, Math.min(1, fadeV.current * levelRef.current * duck.current));
  };
  /** Baisse ou remonte la musique en douceur (0,4 s). */
  const rampDuck = (to: number) => {
    window.clearInterval(duckTimer.current);
    const from = duck.current, t0 = performance.now();
    duckTimer.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / 400);
      duck.current = from + (to - from) * k;
      applyVolume();
      if (k >= 1) window.clearInterval(duckTimer.current);
    }, 40);
  };
  /** Joue une suite de fichiers par-dessus la musique, qui baisse le temps du jingle. */
  const playOver = (urls: string[]) => {
    const j = jingleEl.current, a = audio.current;
    if (!j || !a || jingleBusy.current || a.paused || onLiveRef.current) return;
    jingleBusy.current = true;
    rampDuck(DUCK);
    let i = 0;
    const end = () => { j.onended = null; j.onerror = null; jingleBusy.current = false; rampDuck(1); };
    const step = () => {
      if (i >= urls.length) return end();
      j.src = urls[i++];
      j.volume = 1;
      j.play().catch(end);
    };
    j.onended = step;
    j.onerror = step;
    step();
  };
  const playOverRef = useRef(playOver);
  playOverRef.current = playOver;

  const radio = useMemo(() => remote ?? radioSettingsOf(settings), [remote, settings]);
  // Horloge des émissions programmées : elles commencent et finissent à l'heure, sans attendre la relecture des réglages.
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    if (!radio.programmes.length) return;
    const t = setInterval(() => setClock(Date.now()), 10_000);
    return () => clearInterval(t);
  }, [radio.programmes.length]);
  const eff = useMemo(() => effectiveLive(radio, new Date(clock)), [radio, clock]);
  const live = eff.live;
  const liveOn = isLiveOn(live, new Date(clock));
  const liveRef = useRef({ on: liveOn, live, programme: eff.programme });
  liveRef.current = { on: liveOn, live, programme: eff.programme };
  const canLive = () => liveRef.current.on && Date.now() - liveFailedAt.current > LIVE_RETRY_MS;
  const markLive = (v: boolean) => { onLiveRef.current = v; setOnLive(v); };

  /** Connexion au relais quand l'émission vient de l'antenne du site (WebRTC). */
  const rtcPc = useRef<RTCPeerConnection | null>(null);
  const rtcSession = useRef('');
  const dropRtc = () => {
    rtcPc.current?.close();
    rtcPc.current = null;
    rtcSession.current = '';
    const a = audio.current;
    if (a && a.srcObject) a.srcObject = null;
  };

  /** Branche le flux de l'émission en direct. */
  const playLive = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    afterJingle.current = null;
    jingleEl.current?.pause();
    jingleBusy.current = false;
    window.clearInterval(duckTimer.current);
    duck.current = 1;
    a.volume = 1;
    markLive(true);
    setTime(0);
    setDuration(0);
    const { rtc, url } = liveRef.current.live;
    if (rtc) {
      dropRtc();
      a.removeAttribute('src');
      // Le flux est branché tout de suite (dans le clic, exigé par les téléphones) ; la voix arrive ensuite.
      const ms = new MediaStream();
      a.srcObject = ms;
      a.play().catch(() => setPlaying(false));
      rtcSession.current = rtc;
      watchTrack(rtc, 'audio', (st) => { if ((st === 'failed' || st === 'closed') && rtcSession.current === rtc && onLiveRef.current) leaveLiveRef.current(); })
        .then(({ pc, stream }) => {
          if (rtcSession.current !== rtc) { pc.close(); return; }
          rtcPc.current = pc;
          const add = () => stream.getTracks().forEach((t) => { if (!ms.getTracks().includes(t)) ms.addTrack(t); });
          add();
          stream.onaddtrack = add;
          pc.addEventListener('track', () => setTimeout(add, 0));
          a.play().catch(() => setPlaying(false));
        })
        .catch(() => { if (rtcSession.current === rtc) leaveLiveRef.current(); });
      return;
    }
    dropRtc();
    a.src = url;
    const prog = liveRef.current.programme;
    if (prog) {
      // Émission programmée : tout le monde l'entend au même endroit, comme un vrai direct.
      const at = Math.max(0, (Date.now() - new Date(prog.startsAt).getTime()) / 1000);
      const seek = () => { if (Math.abs(a.currentTime - at) > 2) { try { a.currentTime = at; } catch { /* pas encore possible */ } } };
      a.addEventListener('loadedmetadata', seek, { once: true });
    }
    a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSettings = useCallback(() => {
    void fetchRadioSettings().then((r) => { if (r) setRemote(r); }).catch(() => undefined);
  }, []);
  // Réglages enregistrés depuis cet onglet (administration) : ils priment sur la dernière lecture.
  useEffect(() => { setRemote(null); }, [settings]);
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
    markLive(false);
    dropRtc();
    queueRef.current = { list, index };
    setQueue(queueRef.current);
    const item = list[index];
    if (!a || !item) { setActive(false); return; }
    levelRef.current = item.kind === 'song' ? SONG_LEVEL : 1;
    setTime(0);
    setDuration(item.durationSeconds ?? 0);
    afterJingle.current = null;
    fadeV.current = 0.05;
    applyVolume();
    a.src = item.url;
    a.play().catch(() => setPlaying(false));
  }, []);

  const startWith = useCallback((all: RadioItem[], m: RadioMode) => {
    const list = buildRound(onAir(all, radio, m), Math.random, queueRef.current.list[queueRef.current.index]?.key);
    errors.current = 0;
    setFailed(false);
    if (canLive()) {
      // L'émission passe d'abord ; la file des chants attend la fin du direct.
      queueRef.current = { list, index: -1 };
      setQueue(queueRef.current);
      setActive(true);
      playLive();
      return;
    }
    if (!list.length) { setActive(false); return; }
    setActive(true);
    playQueue(list, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playLive, playQueue, radio]);

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
    // On ne saute pas l'émission en direct.
    if (onLiveRef.current && liveRef.current.on && Date.now() - liveFailedAt.current > LIVE_RETRY_MS) return;
    if (!onLiveRef.current && canLive()) return playLive();
    const { list, index } = queueRef.current;
    const go = index + 1 < list.length
      ? () => playQueue(list, index + 1)
      : () => playQueue(buildRound(itemsRef.current, Math.random, list[index]?.key), 0);
    // Tous les 3 titres, un jingle de la station passe par-dessus le début du chant suivant.
    songsSinceJingle.current += 1;
    if (index >= 0 && songsSinceJingle.current >= JINGLE_EVERY) {
      songsSinceJingle.current = 0;
      let j = Math.floor(Math.random() * JINGLES.length);
      if (j === lastJingle.current) j = (j + 1) % JINGLES.length;
      lastJingle.current = j;
      window.setTimeout(() => playOverRef.current([JINGLES[j]]), 2500);
    }
    go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playLive, playQueue]);

  /** Le flux du direct s'est coupé ou est terminé : retour aux chants. */
  const leaveLive = useCallback(() => {
    liveFailedAt.current = Date.now();
    dropRtc();
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next]);
  const leaveLiveRef = useRef(leaveLive);
  leaveLiveRef.current = leaveLive;

  const stop = useCallback(() => {
    audio.current?.pause();
    jingleEl.current?.pause();
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!active || (!a?.src && !a?.srcObject)) return start();
    if (a.paused && onLiveRef.current) playLive(); // reprendre au direct, pas là où on s'était arrêté
    else if (a.paused) a.play().catch(() => setPlaying(false));
    else { a.pause(); jingleEl.current?.pause(); }
  }, [active, playLive, start]);

  const changeMode = useCallback((m: RadioMode) => {
    setMode(m);
    if (active && catalog) startWith(catalog, m);
  }, [active, catalog, setMode, startWith]);

  // Un autre lecteur du site démarre (chant, prédication, vidéo) : la radio s'arrête.
  useEffect(() => {
    const onPlay = (e: Event) => {
      if (e.target !== audio.current && e.target !== jingleEl.current && e.target instanceof HTMLMediaElement) stop();
    };
    document.addEventListener('play', onPlay, true);
    return () => document.removeEventListener('play', onPlay, true);
  }, [stop]);

  // Pendant l'écoute, on vérifie chaque minute si une émission commence ou s'arrête.
  useEffect(() => {
    if (!active) return;
    const t = setInterval(refreshSettings, LIVE_POLL_MS);
    return () => clearInterval(t);
  }, [active, refreshSettings]);

  // Le direct commence : on y bascule tout de suite. Il s'arrête : retour aux chants.
  // Une émission programmée en remplace une autre : on change de fichier.
  const liveSource = liveOn ? live.rtc || live.url : '';
  useEffect(() => {
    if (!active) return;
    if (liveOn && !onLiveRef.current && Date.now() - liveFailedAt.current > LIVE_RETRY_MS) playLive();
    else if (!liveOn && onLiveRef.current) next();
  }, [active, liveOn, next, playLive]);
  const lastSource = useRef(liveSource);
  useEffect(() => {
    const prev = lastSource.current;
    lastSource.current = liveSource;
    if (active && onLiveRef.current && liveSource && prev && prev !== liveSource && !live.rtc) playLive();
  }, [active, liveSource, live.rtc, playLive]);

  // L'heure exacte de la RDC (Kinshasa) toutes les 7 minutes, par-dessus la musique.
  useEffect(() => {
    if (!active || !playing) return;
    if (!nextTimeAt.current || nextTimeAt.current < Date.now() - TIME_EVERY_MS) nextTimeAt.current = Date.now() + TIME_FIRST_MS;
    const t = window.setInterval(() => {
      if (Date.now() < nextTimeAt.current || onLiveRef.current || jingleBusy.current) return;
      nextTimeAt.current = Date.now() + TIME_EVERY_MS;
      playOverRef.current(timeAnnouncement());
    }, 5000);
    return () => window.clearInterval(t);
  }, [active, playing]);

  const liveListeners = useRadioListeners(active && playing && onLive && liveOn, liveOn);

  // L'antenne du site a redémarré (nouvelle session du relais) : on se rebranche.
  useEffect(() => {
    if (active && onLiveRef.current && live.rtc && rtcSession.current && rtcSession.current !== live.rtc) playLive();
  }, [active, live.rtc, playLive]);

  // Écran verrouillé et casque Bluetooth : titre affiché, pause et « suivant ».
  const current = !active ? null : onLive ? liveItem(live) : queue.list[queue.index] ?? null;
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const ms = navigator.mediaSession;
    // Écran verrouillé : la radio se présente comme un direct continu, avec le logo KCC.
    ms.metadata = current ? new MediaMetadata({ title: current.kind === 'live' ? current.title : 'Radio Je suis KCCiste', artist: current.kind === 'live' ? 'En direct' : 'En direct · 24 h/24', album: 'Radio Je suis KCCiste', artwork: [{ src: '/images/logo-kcc.svg' }] }) : null;
    const set = (action: MediaSessionAction, fn: (() => void) | null) => { try { ms.setActionHandler(action, fn); } catch { /* action non prise en charge */ } };
    set('play', current ? () => void audio.current?.play() : null);
    set('pause', current ? () => audio.current?.pause() : null);
    set('nexttrack', current && current.kind !== 'live' ? () => nextRef.current() : null);
  }, [current?.key, current?.title]);

  const prepare = useCallback(() => { void fetchCatalog(); refreshSettings(); }, [fetchCatalog, refreshSettings]);

  const value: RadioValue = {
    ready: !!catalog, loading, active, playing, failed, liveOn, liveTitle: liveItem(live).title, callUrl: liveOn && live.callUrl ? live.callUrl : null, siteCalls: liveOn && !!live.rtc && live.calls, liveRtc: liveOn ? live.rtc : '', liveTopic: liveOn ? live.topic : '', liveProgrammed: liveOn && !!eff.programme, programmes: upcomingProgrammes(radio.programmes, new Date(clock)), liveListeners, onLive, mode: effectiveMode, modes, items, current,
    upcoming: active && !onLive ? queue.list.slice(queue.index + 1, queue.index + 4) : [],
    time, duration,
    prepare, start, toggle, next, stop, setMode: changeMode,
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
          document.querySelectorAll('audio, video').forEach((x) => { if (x !== e.currentTarget && x !== jingleEl.current) (x as HTMLMediaElement).pause(); });
        }}
        onPause={() => setPlaying(false)}
        onPlaying={() => { errors.current = 0; }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setTime(a.currentTime);
          if (onLiveRef.current) return;
          // fondu d'entrée et de sortie : on passe d'un titre à l'autre en douceur
          const d = Number.isFinite(a.duration) ? a.duration : 0;
          const v = Math.min(1, a.currentTime / FADE_IN, d > FADE_OUT * 2 ? (d - a.currentTime) / FADE_OUT : 1);
          fadeV.current = Math.max(0.04, Math.min(1, v));
          applyVolume();
        }}
        onLoadedMetadata={(e) => { if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration); }}
        onEnded={() => {
          const k = afterJingle.current;
          if (k) { afterJingle.current = null; return k(); }
          return onLiveRef.current ? leaveLive() : next();
        }}
        onError={() => {
          if (!active) return;
          const k = afterJingle.current;
          if (k) { afterJingle.current = null; return k(); }
          if (onLiveRef.current) return leaveLive();
          errors.current += 1;
          if (errors.current >= Math.min(MAX_ERRORS, Math.max(1, queueRef.current.list.length))) { setFailed(true); stop(); return; }
          next();
        }}
      />
      <audio ref={jingleEl} preload="auto" className="hidden" />
    </Ctx.Provider>
  );
}

export function useRadio(): RadioValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRadio doit être utilisé dans <RadioProvider>.');
  return v;
}
