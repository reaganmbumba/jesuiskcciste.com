import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { watchTrack } from './rtc';
import { useRadioPresence } from './listeners';
import { worldHourFile } from './heureMonde';
import { effectiveLive, fetchRadioSettings, isLiveOn, upcomingProgrammes, type RadioProgramme, liveItem, LIVE_POLL_MS, loadRadioCatalog, onAir, radioSettingsOf, type RadioItem, type RadioMode, type RadioSettings } from './radio';
import { scheduleAt, scheduleFingerprint, slotOffset, stationSlot, type RadioSlot } from './schedule';

/** Une seule antenne pour tout le monde : tous les auditeurs entendent la même chose (chants, prédications, journal, vocaux). */
const MODE: RadioMode = 'all';
/** Échecs de lecture d'affilée avant d'arrêter la radio (réseau coupé…). */
const MAX_ERRORS = 9;
/** Après 3 échecs sur le même titre (fichier abîmé), on attend le titre suivant de la grille. */
const ERRORS_PER_SLOT = 3;
/** Écart toléré avec l'antenne commune avant de recaler l'auditeur (secondes). */
const DRIFT_S = 4;
/** On vérifie toutes les 5 secondes que l'auditeur est au même endroit que les autres. */
const SYNC_MS = 5000;
/** La liste des titres est relue toutes les 10 minutes (nouveau chant, vocal validé…). */
const CATALOG_REFRESH_MS = 10 * 60_000;
/** Après une coupure du flux en direct, on ne le retente qu'après ce délai (un chant passe entre-temps). */
const LIVE_RETRY_MS = 3 * 60_000;
/** Habillage de l'antenne : un jingle « Radio Je suis KCCiste » tous les quelques titres, comme une vraie radio. */
// kcc-01 à 09 : jingles de la station ; kcc-10 à 15 : messages courts (partage, application, appels, recensement…)
const JINGLES = Array.from({ length: 15 }, (_, i) => `/radio/jingles/kcc-${String(i + 1).padStart(2, '0')}.mp3`);
/** Fondus d'entrée et de sortie de chaque titre (secondes) : les titres s'enchaînent sans coupure nette. */
const FADE_IN = 1.5;
const FADE_OUT = 3.5;
/** Les chants passent un peu moins fort que les jingles et l'annonce de l'heure. */
const SONG_LEVEL = 0.75;
/** Pendant un jingle, la musique descend à 10 % de son volume (le jingle joue à 100 %). */
const DUCK = 0.1;
/** Le jingle de la station passe toutes les 7 minutes, à la même seconde pour tous les auditeurs. */
const STATION_EVERY_MS = 7 * 60_000;

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
  // À l'heure pile : la voix de femme qui donne l'heure en RDC et dans une ville du monde.
  const world = m === 0 ? worldHourFile(d) : null;
  if (world) return [world];
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
  /** Appels dirigés vers le WhatsApp de la radio (réglé dans la régie) : lien wa.me, à tout moment. */
  whatsappCall: string | null;
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
  /** Tout ce que diffuse l'antenne. */
  items: RadioItem[];
  current: RadioItem | null;
  upcoming: RadioItem[];
  time: number;
  duration: number;
  /** Charge le catalogue à l'avance, pour que « Écouter » démarre sans attendre. */
  prepare: () => void;
  /** Lance la radio là où en est l'antenne commune (l'argument est ignoré : une seule antenne). */
  start: (mode?: RadioMode) => void;
  toggle: () => void;
  stop: () => void;
}

const Ctx = createContext<RadioValue | null>(null);

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
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  /** La grille autour de ce qui passe : le passage en cours puis les suivants. */
  const [slots, setSlots] = useState<RadioSlot[]>([]);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  /** Le passage de la grille en cours de lecture, et l'empreinte de la liste dont il vient. */
  const playingRef = useRef<{ slot: RadioSlot; fp: string } | null>(null);
  const errors = useRef(0);
  const waitTimer = useRef(0);
  const [remote, setRemote] = useState<RadioSettings | null>(null);
  const [onLive, setOnLive] = useState(false);
  const onLiveRef = useRef(false);
  const liveFailedAt = useRef(0);
  /** Pendant un jingle : ce qui doit être joué juste après. */
  const afterJingle = useRef<(() => void) | null>(null);
  /** Volume du titre en cours (les chants un peu plus bas). */
  const levelRef = useRef(1);
  /** Jingles joués PAR-DESSUS la musique, sur un second lecteur. */
  const jingleEl = useRef<HTMLAudioElement>(null);
  const jingleBusy = useRef(false);
  const duck = useRef(1);
  const fadeV = useRef(1);
  const duckTimer = useRef(0);
  const lastStation = useRef(-1);
  const lastQuarter = useRef('');
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
  /** Remet l'émission programmée à la minute où en sont tous les auditeurs. */
  const syncProgramme = (a: HTMLAudioElement) => {
    const prog = liveRef.current.programme;
    if (!prog || !onLiveRef.current) return;
    const at = (Date.now() - new Date(prog.startsAt).getTime()) / 1000;
    if (at < 0 || at > prog.durationSeconds) return;
    if (Math.abs(a.currentTime - at) > 3) { try { a.currentTime = at; } catch { /* pas encore possible */ } }
  };

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
    if (liveRef.current.programme) {
      // Émission programmée : tout le monde l'entend au même endroit, comme un vrai direct.
      // Celui qui arrive 30 minutes après le début entend la 30e minute. La position est
      // recalculée au moment même du saut (le chargement peut prendre quelques secondes).
      const sync = () => syncProgramme(a);
      a.addEventListener('loadedmetadata', sync, { once: true });
      a.addEventListener('canplay', sync, { once: true });
      a.addEventListener('playing', sync, { once: true });
    }
    a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSettings = useCallback(() => {
    void fetchRadioSettings().then((r) => { if (r) setRemote(r); }).catch(() => undefined);
  }, []);
  // Réglages enregistrés depuis cet onglet (administration) : ils priment sur la dernière lecture.
  useEffect(() => { setRemote(null); }, [settings]);
  const items = useMemo(() => onAir(catalog ?? [], radio, MODE), [catalog, radio]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const fetchCatalog = useCallback((fresh = false) => {
    if (!loadingRef.current || fresh) {
      if (!loadingRef.current) setLoading(true);
      const p = loadRadioCatalog().then((c) => { setCatalog(c); return c; });
      loadingRef.current = p.finally(() => setLoading(false));
    }
    return loadingRef.current;
  }, []);

  /** Met l'auditeur à la seconde où en est l'antenne commune dans ce titre. */
  const seekToSlot = (a: HTMLAudioElement) => {
    const p = playingRef.current;
    if (!p || onLiveRef.current || a.src !== new URL(p.slot.item.url, location.href).href) return;
    const at = slotOffset(p.slot, Date.now());
    if (Math.abs(a.currentTime - at) > DRIFT_S && at < (p.slot.endsAt - p.slot.startsAt) / 1000) {
      try { a.currentTime = at; } catch { /* pas encore possible */ }
    }
  };

  /** Lance un passage de la grille, à la seconde où en sont les autres. Appelé depuis le clic : les téléphones l'exigent. */
  const playSlot = useCallback((list: RadioSlot[], fp: string) => {
    const a = audio.current;
    markLive(false);
    dropRtc();
    window.clearTimeout(waitTimer.current);
    const slot = list[0];
    setSlots(list);
    if (!a || !slot) { playingRef.current = null; setActive(false); return; }
    playingRef.current = { slot, fp };
    const item = slot.item;
    levelRef.current = item.kind === 'song' ? SONG_LEVEL : 1;
    setTime(slotOffset(slot, Date.now()));
    setDuration(item.durationSeconds ?? 0);
    afterJingle.current = null;
    fadeV.current = 0.05;
    applyVolume();
    a.src = item.url;
    if (slotOffset(slot, Date.now()) > 1) {
      // On arrive en cours de titre : on saute à la même seconde que tout le monde.
      const sync = () => seekToSlot(a);
      a.addEventListener('loadedmetadata', sync, { once: true });
      a.addEventListener('canplay', sync, { once: true });
      a.addEventListener('playing', sync, { once: true });
    }
    a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Rejoint l'antenne commune : ce qui passe en ce moment, à la bonne seconde.
   * `ended` : le passage qui vient de finir (si son fichier finit un peu avant l'heure prévue,
   * on enchaîne le suivant au lieu de le rejouer).
   */
  const playNow = useCallback((ended?: RadioSlot, fresh?: RadioItem[]) => {
    const all = fresh ?? itemsRef.current;
    const now = Date.now();
    const fp = scheduleFingerprint(all, MODE);
    const list = scheduleAt(all, MODE, now, 4);
    if (!list.length) { playingRef.current = null; setSlots([]); audio.current?.pause(); setActive(false); return; }
    if (ended && list[0].startsAt === ended.startsAt && list[1]) {
      const early = list[0].endsAt - now;
      if (early <= DRIFT_S * 1000) return playSlot(list.slice(1), fp);
      // Le fichier est plus court que prévu : on attend que l'antenne passe au titre suivant.
      window.clearTimeout(waitTimer.current);
      waitTimer.current = window.setTimeout(() => playNowRef.current(), early);
      return;
    }
    playSlot(list, fp);
  }, [playSlot]);
  const playNowRef = useRef(playNow);
  playNowRef.current = playNow;

  const startWith = useCallback((fresh?: RadioItem[]) => {
    errors.current = 0;
    setFailed(false);
    setActive(true);
    // L'émission (direct ou programmée) passe d'abord ; la grille reprend à sa fin.
    if (canLive()) return playLive();
    playNow(undefined, fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playLive, playNow]);

  const radioRef = useRef(radio);
  radioRef.current = radio;
  const start = useCallback(() => {
    if (catalog) startWith();
    else void fetchCatalog().then((c) => startWith(onAir(c, radioRef.current, MODE)));
  }, [catalog, fetchCatalog, startWith]);

  /** Fin d'un titre ou d'un direct : on suit l'antenne commune. */
  const next = useCallback((ended?: RadioSlot) => {
    // On ne quitte pas l'émission en direct.
    if (onLiveRef.current && liveRef.current.on && Date.now() - liveFailedAt.current > LIVE_RETRY_MS) return;
    if (!onLiveRef.current && canLive()) return playLive();
    playNow(ended);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playLive, playNow]);

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
    window.clearTimeout(waitTimer.current);
    audio.current?.pause();
    jingleEl.current?.pause();
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!active || (!a?.src && !a?.srcObject)) return start();
    if (a.paused && onLiveRef.current) playLive(); // reprendre au direct, pas là où on s'était arrêté
    else if (a.paused) next(); // reprendre là où en est l'antenne, comme une vraie radio
    else { a.pause(); jingleEl.current?.pause(); }
  }, [active, next, playLive, start]);

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
  // Une émission programmée en remplace une autre : on change de fichier. L'animateur passe
  // à l'antenne pendant une émission programmée (ou la quitte) : on bascule aussi.
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
    if (active && onLiveRef.current && liveSource && prev && prev !== liveSource) playLive();
  }, [active, liveSource, playLive]);

  // Pendant une émission programmée : on vérifie toutes les 20 secondes que l'auditeur est
  // toujours au même endroit que les autres (téléphone en veille, coupure réseau…).
  useEffect(() => {
    if (!active || !playing) return;
    const t = window.setInterval(() => {
      const a = audio.current;
      if (a && !a.paused && onLiveRef.current && liveRef.current.programme) syncProgramme(a);
    }, 20_000);
    return () => window.clearInterval(t);
  }, [active, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hors direct : toutes les 5 secondes, on vérifie que l'auditeur entend la même chose que
  // les autres, au même endroit (téléphone en veille, réseau lent, minuit…).
  useEffect(() => {
    if (!active || !playing) return;
    const t = window.setInterval(() => {
      const a = audio.current, p = playingRef.current;
      if (!a || a.paused || onLiveRef.current || !p) return;
      const all = itemsRef.current;
      // La liste des titres a changé : on finit ce titre, puis on suit la nouvelle grille.
      if (p.fp !== scheduleFingerprint(all, MODE)) return;
      const now = Date.now();
      const list = scheduleAt(all, MODE, now, 4);
      const cur = list[0];
      if (!cur) return;
      if (cur.startsAt === p.slot.startsAt) {
        if (!a.seeking && a.readyState >= 1) seekToSlot(a);
        setSlots((s) => (s[0]?.startsAt === cur.startsAt && s.length >= list.length ? s : list));
        return;
      }
      // Un peu en avance sur le titre suivant (fichier un peu plus court que prévu) : c'est bon.
      if (p.slot.startsAt === cur.endsAt && cur.endsAt - now <= DRIFT_S * 1000) return;
      playSlot(list, scheduleFingerprint(all, MODE));
    }, SYNC_MS);
    return () => window.clearInterval(t);
  }, [active, playing, playSlot]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pendant l'écoute, la liste des titres est relue de temps en temps : tout le monde garde la même grille.
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => { void fetchCatalog(true); }, CATALOG_REFRESH_MS);
    return () => window.clearInterval(t);
  }, [active, fetchCatalog]);

  // Par-dessus la musique (baissée à 10 %) : l'heure exacte à h00, h15, h30 et h45,
  // et le jingle de la station toutes les 7 minutes (à la même seconde pour tous).
  useEffect(() => {
    if (!active || !playing) return;
    // Le jingle en cours au moment où l'on arrive ne repart pas : on attend le prochain.
    if (lastStation.current < 0) lastStation.current = stationSlot(Date.now(), STATION_EVERY_MS);
    const t = window.setInterval(() => {
      if (onLiveRef.current || jingleBusy.current) return;
      const now = Date.now();
      const { h, m } = kinshasaTime(new Date(now));
      const key = `${h}:${m}`;
      const s = stationSlot(now, STATION_EVERY_MS);
      if (m % 15 === 0 && key !== lastQuarter.current) {
        lastQuarter.current = key;
        lastStation.current = s;
        playOverRef.current(timeAnnouncement());
        return;
      }
      if (s !== lastStation.current) {
        lastStation.current = s;
        // Même jingle pour tous : il dépend du créneau de 7 minutes, pas du hasard.
        playOverRef.current([JINGLES[s % JINGLES.length]]);
      }
    }, 2000);
    return () => window.clearInterval(t);
  }, [active, playing]);

  useRadioPresence(active && playing, onLive && liveOn);

  // L'antenne du site a redémarré (nouvelle session du relais) : on se rebranche.
  useEffect(() => {
    if (active && onLiveRef.current && live.rtc && rtcSession.current && rtcSession.current !== live.rtc) playLive();
  }, [active, live.rtc, playLive]);

  // Écran verrouillé et casque Bluetooth : titre affiché, pause et « suivant ».
  const current = !active ? null : onLive ? liveItem(live) : slots[0]?.item ?? null;
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const ms = navigator.mediaSession;
    // Écran verrouillé : la radio se présente comme un direct continu, avec le logo KCC.
    ms.metadata = current ? new MediaMetadata({ title: current.kind === 'live' ? current.title : 'Radio Je suis KCCiste', artist: current.kind === 'live' ? 'En direct' : 'En direct · 24 h/24', album: 'Radio Je suis KCCiste', artwork: [{ src: '/images/logo-kcc.svg' }] }) : null;
    const set = (action: MediaSessionAction, fn: (() => void) | null) => { try { ms.setActionHandler(action, fn); } catch { /* action non prise en charge */ } };
    set('play', current ? () => void audio.current?.play() : null);
    set('pause', current ? () => audio.current?.pause() : null);
    set('nexttrack', null); // on ne saute pas un titre : tout le monde entend la même chose
  }, [current?.key, current?.title]);

  const prepare = useCallback(() => { void fetchCatalog(); refreshSettings(); }, [fetchCatalog, refreshSettings]);

  const value: RadioValue = {
    ready: !!catalog, loading, active, playing, failed, liveOn, liveTitle: liveItem(live).title, callUrl: liveOn && live.callUrl && radio.live.callMode !== 'whatsapp' ? live.callUrl : null, siteCalls: liveOn && !!live.rtc && live.calls && radio.live.callMode !== 'whatsapp', whatsappCall: radio.live.callMode === 'whatsapp' && /^https:\/\/wa\.me\//.test(radio.live.callUrl) ? radio.live.callUrl : null, liveRtc: liveOn ? live.rtc : '', liveTopic: liveOn ? live.topic : '', liveProgrammed: liveOn && !!eff.programme, programmes: upcomingProgrammes(radio.programmes, new Date(clock)), onLive, items, current,
    upcoming: active && !onLive ? slots.slice(1, 4).map((s) => s.item) : [],
    time, duration,
    prepare, start, toggle, stop,
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
          return onLiveRef.current ? leaveLive() : next(playingRef.current?.slot);
        }}
        onError={() => {
          if (!active) return;
          const k = afterJingle.current;
          if (k) { afterJingle.current = null; return k(); }
          if (onLiveRef.current) return leaveLive();
          errors.current += 1;
          if (errors.current >= MAX_ERRORS) { setFailed(true); stop(); return; }
          // Coupure réseau : on réessaie dans 3 secondes, à la bonne seconde. Fichier abîmé
          // (3 échecs) : on attend que l'antenne passe au titre suivant.
          const slot = playingRef.current?.slot;
          const wait = errors.current % ERRORS_PER_SLOT === 0 && slot ? Math.max(1000, slot.endsAt - Date.now() + 200) : 3000;
          window.clearTimeout(waitTimer.current);
          waitTimer.current = window.setTimeout(() => playNowRef.current(), wait);
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
