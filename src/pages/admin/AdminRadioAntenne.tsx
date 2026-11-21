import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Headphones, Mic, Youtube, Music2, Pause, Phone, PhoneOff, Play, Radio, Send, SkipForward, Square, UserX, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { snakify } from '@/utils/case';
import { writeAudit } from '@/services';
import { useAuth } from '@/features/auth/AuthContext';
import { currentProgramme, fetchRadioSettings, isLiveOn, radioSettingsOf, type RadioProgramme, type RadioSettings } from '@/features/radio/radio';
import { RADIO_NAME } from '@/features/radio/RadioUi';
import { isRadioDesktop, studioBridge } from '@/features/radio/desktop';
import { microphone, publishShow, watchTrack, type Publish } from '@/features/radio/rtc';
import { PADS, playBuffer, playPad, voiceChain, type Pad, type VoiceFx } from '@/features/radio/effects';
import { useRadioListeners } from '@/features/radio/listeners';
import { recordShow, type ShowRecorder, type ShowRecording } from '@/features/radio/recorder';
import { RecordingPanel } from '@/features/radio/RecordingPanel';
import { RadioGrid } from '@/features/radio/RadioGrid';
import { YouTubeChat } from '@/features/radio/YouTubeChat';
import { loadDestinations, outputsOf, saveDestinations, startDiffusion, type Destinations, type ScreenInfo } from '@/features/radio/diffusion';

type Appel = { id: string; nom: string; ville: string | null; statut: 'attente' | 'antenne'; cree_le: string; session_id: string; genre?: 'appel' | 'plateau'; siege?: number | null };
type Line = { pc: RTCPeerConnection; node: MediaStreamAudioSourceNode; gain: GainNode; el: HTMLAudioElement };

const since = (iso: string) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min`;
};

/** Section façon logiciel Colmatage : bandeau bleu foncé, titre en capitales, bouton à droite. */
function Section({ title: t, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-sm border border-[#2b3648]/20">
      <div className="flex items-center justify-between bg-[#2b3648] px-3 py-1.5">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-white">{t}</h2>{action}
      </div>
      {children}
    </section>
  );
}

/**
 * Antenne de la radio en direct, depuis le navigateur de l'animateur : micro + musique de fond
 * envoyés au relais du site (pas besoin de Caster.fm ni de Jitsi). Les auditeurs qui appellent
 * depuis /radio arrivent dans la file ; « Prendre à l'antenne » mélange leur voix à l'émission.
 */
export default function AdminRadioAntenne({ variant = 'colmatage' }: { variant?: 'colmatage' | 'studio' }) {
  const { settings, setSettings } = useSiteSettings();
  const { profile } = useAuth();
  const { notify } = useToast();
  const appMode = isRadioDesktop();
  // horloge du direct (affichage du temps d'antenne)
  const [, setTick] = useState(0);
  const saved = radioSettingsOf(settings);
  const [title, setTitle] = useState(saved.live.title || 'Tosungana en direct');
  const [calls, setCalls] = useState(true);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [micId, setMicId] = useState('');
  const [onAir, setOnAir] = useState(false);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState('');
  const [queue, setQueue] = useState<Appel[]>([]);
  // Musique de fond : plusieurs morceaux qui passent à tour de rôle
  const [tracks, setTracks] = useState<{ name: string; url: string }[]>([]);
  const [trackIdx, setTrackIdx] = useState(0);
  const [musicOn, setMusicOn] = useState(true);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const idxRef = useRef(0);
  const [musicVol, setMusicVol] = useState(0.25);
  // Émission programmée pendant le direct : elle continue à sa place (même minute que pour
  // tous les auditeurs), sous la voix de l'animateur ; il en règle le volume ou la coupe.
  const [progVol, setProgVol] = useState(0.3);
  const [progCut, setProgCut] = useState(false);
  const [progNow, setProgNow] = useState<RadioProgramme | null>(null);
  const progList = useRef(saved.programmes);
  progList.current = saved.programmes;
  const progFetched = useRef<RadioProgramme[] | null>(null);
  // Sujet de l'émission, lu par les auditeurs sur /radio
  const [topic, setTopic] = useState(saved.live.topic || '');
  const [topicSaved, setTopicSaved] = useState(saved.live.topic || '');
  const [micMuted, setMicMuted] = useState(false);
  const [level, setLevel] = useState(0);
  // Effets : sur la voix (écho, réverbération, voix radio) et bruitages d'un clic
  const [voiceFx, setVoiceFx] = useState<Record<VoiceFx, boolean>>({ echo: false, reverb: false, radio: false });
  const [fxVol, setFxVol] = useState(0.8);
  const [myPads, setMyPads] = useState<{ name: string; buf: AudioBuffer | null; file: File }[]>([]);
  const fx = useRef<{ chain?: ReturnType<typeof voiceChain>; bus?: GainNode }>({});

  const ctx = useRef<AudioContext | null>(null);
  const listenerCounts = useRadioListeners();
  const auditeurs = onAir ? listenerCounts?.live ?? null : null;
  const nodes = useRef<{ mic?: MediaStream; micGain?: GainNode; musicEl?: HTMLAudioElement; musicGain?: GainNode; progEl?: HTMLAudioElement; progGain?: GainNode; program?: MediaStreamAudioDestinationNode; retour?: MediaStreamAudioDestinationNode; analyser?: AnalyserNode; plateau?: MediaStreamAudioDestinationNode[] }>({});
  const [plateauLink, setPlateauLink] = useState('');
  const [locked, setLocked] = useState<{ host: string; title: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const pub = useRef<Publish | null>(null);
  // YouTube / Facebook (par le relais) : clés gardées dans ce navigateur seulement
  const [dest, setDest] = useState<Destinations>(loadDestinations);
  const [diffStatus, setDiffStatus] = useState('');
  const [diffOn, setDiffOn] = useState(false);
  const diff = useRef<{ stop: () => void } | null>(null);
  // Enregistrement du direct (téléchargement, rediffusion)
  const [recOn, setRecOn] = useState(() => { try { return localStorage.getItem('kcc-radio-rec') !== '0'; } catch { return true; } });
  const recorder = useRef<ShowRecorder | null>(null);
  const [lastRec, setLastRec] = useState<{ rec: ShowRecording; title: string; topic: string } | null>(null);
  const toggleRec = (v: boolean) => { setRecOn(v); try { localStorage.setItem('kcc-radio-rec', v ? '1' : '0'); } catch { /* navigation privée */ } };
  const screenInfo = useRef<ScreenInfo>({ title: '', topic: '', listeners: null, callsOpen: false });
  const lines = useRef<Map<string, Line>>(new Map());
  const [taken, setTaken] = useState<string[]>([]);

  // Micros disponibles
  useEffect(() => {
    void navigator.mediaDevices?.enumerateDevices().then((d) => setMics(d.filter((x) => x.kind === 'audioinput')));
  }, [onAir]);

  // File des appels : relue toutes les 3 s pendant l'émission
  useEffect(() => {
    if (!onAir || !supabase) return;
    const load = async () => {
      const { data } = await supabase!.from('radio_appels').select('id, nom, ville, statut, cree_le, session_id, genre, siege').in('statut', ['attente', 'antenne']).order('cree_le');
      if (data) setQueue(data as Appel[]);
    };
    void load();
    const t = window.setInterval(load, 3000);
    return () => window.clearInterval(t);
  }, [onAir]);

  // Invités du plateau : branchés à l'antenne dès qu'ils arrivent ; voix débranchée quand quelqu'un s'en va
  const takeRef = useRef<(a: Appel) => Promise<void>>(async () => {});
  const joining = useRef(new Set<string>());
  useEffect(() => {
    if (!onAir) return;
    const ids = new Set(queue.map((a) => a.id));
    lines.current.forEach((l, id) => {
      if (ids.has(id)) return;
      l.gain?.disconnect(); l.node?.disconnect(); l.pc.close(); l.el.srcObject = null;
      lines.current.delete(id);
      setTaken((t) => t.filter((x) => x !== id));
    });
    queue.filter((a) => a.genre === 'plateau' && a.statut === 'antenne' && !lines.current.has(a.id) && !joining.current.has(a.id)).forEach((a) => {
      joining.current.add(a.id);
      void takeRef.current(a).finally(() => joining.current.delete(a.id));
    });
  }, [queue, onAir]);

  // Vu-mètre de l'antenne
  useEffect(() => {
    if (!onAir) return;
    let raf = 0;
    const buf = new Uint8Array(256);
    const tick = () => {
      const a = nodes.current.analyser;
      if (a) { a.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128)); setLevel(m / 128); }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [onAir]);

  /** Seul l'état du direct est écrit (fonction radio_live_set) : les animateurs radio n'ont aucun autre droit sur les réglages. */
  async function saveLive(live: Partial<RadioSettings['live']>) {
    const r = radioSettingsOf(settings);
    const { error } = await supabase!.rpc('radio_live_set', { p_live: snakify(live) });
    if (error) throw error;
    const next = { ...settings, radio: { ...r, live: { ...r.live, ...live } } };
    setSettings(next);
  }

  async function goLive(force = false) {
    if (!supabase) return;
    setBusy(true);
    try {
      // Un autre animateur est déjà à l'antenne : on ne le coupe pas, on propose de rejoindre son plateau.
      const fresh = await fetchRadioSettings();
      if (!force && fresh && fresh.live.rtc && isLiveOn(fresh.live)) {
        setLocked({ host: fresh.live.host || 'Un autre animateur', title: fresh.live.title || 'une émission' });
        setBusy(false);
        return;
      }
      setLocked(null);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Session expirée : reconnectez-vous.');
      const ac = new AudioContext();
      ctx.current = ac;
      const mic = await microphone(micId || undefined);
      const micSrc = ac.createMediaStreamSource(mic);
      const micGain = ac.createGain();
      micSrc.connect(micGain);
      const program = ac.createMediaStreamDestination();
      const retour = ac.createMediaStreamDestination();
      const analyser = ac.createAnalyser();
      const sum = ac.createGain(); sum.connect(analyser);
      // voix → effets (écho, réverbération, voix radio) → antenne
      // une sortie par place du plateau : chaque invité entend tout le monde sauf lui-même
      const plateau = [0, 1, 2].map(() => ac.createMediaStreamDestination());
      const chain = voiceChain(ac, micGain, [program, retour, sum, ...plateau]);
      (Object.keys(voiceFx) as VoiceFx[]).forEach((k) => chain.set(k, voiceFx[k]));
      const musicGain = ac.createGain();
      musicGain.gain.value = musicVol;
      musicGain.connect(program); musicGain.connect(retour); musicGain.connect(ac.destination); musicGain.connect(sum);
      plateau.forEach((d) => musicGain.connect(d));
      // émission programmée de l'heure, sous la voix (volume réglé par l'animateur)
      const progGain = ac.createGain(); progGain.gain.value = 0;
      progGain.connect(program); progGain.connect(retour); progGain.connect(ac.destination); progGain.connect(sum);
      plateau.forEach((d) => progGain.connect(d));
      const progEl = new Audio();
      progEl.crossOrigin = 'anonymous';
      progEl.preload = 'auto';
      ac.createMediaElementSource(progEl).connect(progGain);
      // bruitages : à l'antenne, au téléphone des appelants et dans le casque
      const bus = ac.createGain(); bus.gain.value = fxVol;
      bus.connect(program); bus.connect(retour); bus.connect(ac.destination); bus.connect(sum);
      plateau.forEach((d) => bus.connect(d));
      fx.current = { chain, bus };
      const musicEl = new Audio();
      musicEl.onended = () => playTrack(idxRef.current + 1);
      musicEl.onerror = () => { if (tracksRef.current.length > 1) playTrack(idxRef.current + 1); };
      ac.createMediaElementSource(musicEl).connect(musicGain);
      nodes.current = { mic, micGain, musicGain, program, retour, analyser, musicEl, plateau, progEl, progGain };
      if (tracksRef.current.length && musicOn) playTrack(0);
      setLastRec(null);
      recorder.current = recOn ? recordShow(program.stream) : null;
      setState('Connexion au relais…');
      pub.current = await publishShow(token, program.stream.getAudioTracks()[0], retour.stream.getAudioTracks()[0],
        plateau.map((d, i) => ({ name: `plateau${i + 1}`, track: d.stream.getAudioTracks()[0] })));
      pub.current.pc.onconnectionstatechange = () => {
        const s = pub.current?.pc.connectionState;
        setState(s === 'connected' ? 'À l’antenne' : s === 'failed' ? 'Connexion perdue : arrêtez puis relancez l’antenne.' : s ?? '');
      };
      await saveLive({ onAir: true, host: (profile ? `${profile.firstName} ${profile.lastName}`.trim() : '') || 'Animateur', rtc: pub.current.sessionId, calls, title: title.trim() || 'Émission en direct', topic: topic.trim(), startedAt: new Date().toISOString() });
      setTopicSaved(topic.trim());
      if (outputsOf(dest).length) startDiff();
      // lien des invités du plateau (valable pendant cette émission)
      void supabase.rpc('radio_plateau_lien').then(({ data: j }) => { if (j) setPlateauLink(`${window.location.origin}/radio/plateau?c=${String(j)}`); });
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'settings.update', 'radio antenne : début');
      setOnAir(true);
      try { studioBridge()?.onAir?.(title.trim() || 'Émission en direct'); } catch { /* hors application */ }
      notify('Vous êtes à l’antenne. Les auditeurs basculent sur votre direct en 20 secondes environ ; les appels sont ouverts.');
    } catch (e) {
      stopAll();
      notify(e instanceof Error ? e.message : 'L’antenne n’a pas démarré.', 'error');
    } finally { setBusy(false); }
  }

  function updateDest(patch: Partial<Destinations>) {
    setDest((d) => { const n = { ...d, ...patch }; saveDestinations(n); return n; });
  }

  function startDiff() {
    const audio = nodes.current.program?.stream.getAudioTracks()[0];
    const outputs = outputsOf(dest);
    if (!audio) return;
    if (!outputs.length) { notify('Cochez YouTube ou Facebook et collez la clé de stream.', 'error'); return; }
    diff.current?.stop();
    diff.current = startDiffusion({
      token: async () => (await supabase!.auth.getSession()).data.session?.access_token ?? null,
      audio, analyser: nodes.current.analyser ?? null, outputs,
      info: () => screenInfo.current,
      onStatus: (t) => setDiffStatus(t),
    });
    setDiffOn(true);
  }

  function stopDiff() {
    diff.current?.stop();
    diff.current = null;
    setDiffOn(false);
  }

  function stopAll() {
    if (plateauLink) { void supabase?.rpc('radio_plateau_fermer'); setPlateauLink(''); }
    recorder.current?.cancel();
    recorder.current = null;
    try { studioBridge()?.offAir?.(); } catch { /* hors application */ }
    stopDiff();
    lines.current.forEach((l) => { l.pc.close(); l.el.srcObject = null; });
    lines.current.clear();
    setTaken([]);
    pub.current?.pc.close();
    pub.current = null;
    nodes.current.mic?.getTracks().forEach((t) => t.stop());
    nodes.current.musicEl?.pause();
    if (nodes.current.progEl) { nodes.current.progEl.pause(); nodes.current.progEl.removeAttribute('src'); }
    setProgNow(null);
    setProgCut(false);
    void ctx.current?.close();
    ctx.current = null;
    if (nodes.current.musicEl) nodes.current.musicEl.onended = null;
    fx.current = {};
    nodes.current = {};
    setOnAir(false);
    setState('');
  }

  async function endShow() {
    setBusy(true);
    try {
      for (const a of queue) await supabase!.from('radio_appels').update({ statut: 'termine', modifie_le: new Date().toISOString() }).eq('id', a.id);
      const rec = await recorder.current?.stop();
      recorder.current = null;
      if (rec) setLastRec({ rec, title: title.trim() || 'Émission', topic: topicSaved });
      stopAll();
      await saveLive({ onAir: false, rtc: '', calls: false, topic: '', host: '' });
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'settings.update', 'radio antenne : fin');
      notify('Émission terminée : la radio reprend les chants et prédications.');
    } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); } finally { setBusy(false); }
  }

  async function take(a: Appel) {
    const ac = ctx.current;
    if (!ac || !nodes.current.program) return;
    try {
      const w = await watchTrack(a.session_id, 'voix');
      const el = new Audio();
      el.muted = true; // Chrome : la piste distante ne sonne dans Web Audio que si elle est aussi branchée sur un élément
      const ms = new MediaStream();
      el.srcObject = ms;
      const attach = () => {
        w.stream.getTracks().forEach((t) => { if (!ms.getTracks().includes(t)) ms.addTrack(t); });
        if (!lines.current.get(a.id)?.node && ms.getAudioTracks().length) {
          void el.play().catch(() => {});
          const node = ac.createMediaStreamSource(ms);
          const gain = ac.createGain();
          node.connect(gain);
          gain.connect(nodes.current.program!); // à l'antenne
          gain.connect(ac.destination); // dans le casque de l'animateur
          const pl = nodes.current.plateau ?? [];
          if (a.genre === 'plateau') {
            // un invité du plateau : entendu des appelants et des autres invités, pas de lui-même
            if (nodes.current.retour) gain.connect(nodes.current.retour);
            pl.forEach((d, i) => { if (i + 1 !== a.siege) gain.connect(d); });
          } else pl.forEach((d) => gain.connect(d)); // un appelant : entendu des invités du plateau
          lines.current.set(a.id, { pc: w.pc, node, gain, el });
          setTaken((t) => [...new Set([...t, a.id])]);
        }
      };
      w.pc.addEventListener('track', () => setTimeout(attach, 0));
      attach();
      if (!lines.current.has(a.id)) lines.current.set(a.id, { pc: w.pc, node: undefined as unknown as MediaStreamAudioSourceNode, gain: undefined as unknown as GainNode, el });
      if (a.statut !== 'antenne') {
        await supabase!.from('radio_appels').update({ statut: 'antenne', modifie_le: new Date().toISOString() }).eq('id', a.id);
        setQueue((q) => q.map((x) => (x.id === a.id ? { ...x, statut: 'antenne' } : x)));
      }
    } catch (e) { notify(e instanceof Error ? e.message : 'Impossible de prendre cet appel.', 'error'); }
  }

  takeRef.current = take;

  async function hang(a: Appel, statut: 'termine' | 'refuse') {
    const l = lines.current.get(a.id);
    if (l) { l.gain?.disconnect(); l.node?.disconnect(); l.pc.close(); l.el.srcObject = null; lines.current.delete(a.id); }
    setTaken((t) => t.filter((x) => x !== a.id));
    await supabase!.from('radio_appels').update({ statut, modifie_le: new Date().toISOString() }).eq('id', a.id);
    setQueue((q) => q.filter((x) => x.id !== a.id));
  }

  /** Joue le morceau n° i de la liste (on revient au premier après le dernier). */
  function playTrack(i: number) {
    const list = tracksRef.current;
    const el = nodes.current.musicEl;
    if (!el || !list.length) return;
    const n = ((i % list.length) + list.length) % list.length;
    idxRef.current = n;
    setTrackIdx(n);
    el.src = list[n].url;
    void el.play().catch(() => {});
  }

  function addMusic(files: FileList | null) {
    if (!files?.length) return;
    const added = Array.from(files).filter((f) => f.type.startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|opus)$/i.test(f.name))
      .map((f) => ({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) }));
    const wasEmpty = !tracksRef.current.length;
    const next = [...tracksRef.current, ...added];
    tracksRef.current = next;
    setTracks(next);
    if (wasEmpty && onAir && musicOn) playTrack(0);
  }

  function removeTrack(i: number) {
    const list = tracksRef.current;
    URL.revokeObjectURL(list[i].url);
    const next = list.filter((_, k) => k !== i);
    tracksRef.current = next;
    setTracks(next);
    if (!onAir) return;
    if (!next.length) { nodes.current.musicEl?.pause(); return; }
    if (i === idxRef.current) playTrack(i);
    else if (i < idxRef.current) { idxRef.current -= 1; setTrackIdx(idxRef.current); }
  }

  function toggleMusic() {
    const el = nodes.current.musicEl;
    const on = !musicOn;
    setMusicOn(on);
    if (!el) return;
    if (!on) el.pause();
    else if (el.src) void el.play().catch(() => {});
    else playTrack(0);
  }

  function toggleVoiceFx(k: VoiceFx) {
    setVoiceFx((v) => { const n = { ...v, [k]: !v[k] }; fx.current.chain?.set(k, n[k]); return n; });
  }
  function firePad(p: Pad) {
    if (ctx.current && fx.current.bus) playPad(ctx.current, fx.current.bus, p);
  }
  async function fireMyPad(i: number) {
    const ac = ctx.current;
    const bus = fx.current.bus;
    if (!ac || !bus) return;
    const p = myPads[i];
    let buf = p.buf;
    if (!buf) {
      try { buf = await ac.decodeAudioData(await p.file.arrayBuffer()); } catch { notify(`« ${p.name} » ne peut pas être lu.`, 'error'); return; }
      setMyPads((l) => l.map((x, k) => (k === i ? { ...x, buf } : x)));
    }
    playBuffer(ac, bus, buf);
  }
  useEffect(() => { if (fx.current.bus) fx.current.bus.gain.value = fxVol; }, [fxVol]);

  async function publishTopic() {
    try {
      await saveLive({ topic: topic.trim() });
      setTopicSaved(topic.trim());
      notify(topic.trim() ? 'Sujet affiché aux auditeurs (sur leur page dans la minute).' : 'Sujet retiré.');
    } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); }
  }

  // La musique de fond se tait tant que l'émission programmée passe sous la voix.
  useEffect(() => { if (nodes.current.musicGain) nodes.current.musicGain.gain.value = progNow && !progCut ? 0 : musicVol; }, [musicVol, progNow, progCut]);
  useEffect(() => {
    const g = nodes.current.progGain, ac = ctx.current;
    if (g && ac) g.gain.setTargetAtTime(progNow && !progCut ? progVol : 0, ac.currentTime, 0.15);
  }, [progVol, progCut, progNow, onAir]);

  // Pendant le direct : l'émission de l'heure suit la grille, à la seconde près.
  useEffect(() => {
    if (!onAir) return;
    let n = 0;
    const tick = () => {
      if (n++ % 6 === 0) void fetchRadioSettings().then((r) => { if (r) progFetched.current = r.programmes; }).catch(() => undefined);
      const el = nodes.current.progEl;
      if (!el) return;
      const p = currentProgramme(progFetched.current ?? progList.current);
      setProgNow((prev) => (prev?.id === p?.id ? prev : p));
      if (!p) {
        if (el.dataset.id) { el.pause(); el.removeAttribute('src'); delete el.dataset.id; }
        return;
      }
      const start = new Date(p.startsAt).getTime();
      const at = () => (Date.now() - start) / 1000;
      if (el.dataset.id !== p.id) {
        el.dataset.id = p.id;
        el.src = p.url;
        el.addEventListener('loadedmetadata', () => { try { el.currentTime = at(); } catch { /* plus tard */ } }, { once: true });
      } else if (el.readyState > 0 && Math.abs(el.currentTime - at()) > 3) {
        try { el.currentTime = at(); } catch { /* plus tard */ }
      }
      if (el.paused) void el.play().catch(() => undefined);
    };
    tick();
    const t = window.setInterval(tick, 5000);
    return () => window.clearInterval(t);
  }, [onAir]);

  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const progBox = (light: boolean) => {
    if (!onAir || !progNow) return null;
    const pos = Math.max(0, (Date.now() - new Date(progNow.startsAt).getTime()) / 1000);
    const btn = light ? 'rounded border border-[#d3dae3] px-3 py-1.5 text-sm font-semibold' : 'rounded-xl bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white';
    return (
      <section className={light ? 'rounded border-2 border-gold bg-gold/10 p-3 text-night' : 'rounded-3xl border border-gold/60 bg-gold/[0.12] p-4 text-white'}>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">Émission programmée sous votre voix</p>
        <p className="mt-1 truncate font-semibold">{progNow.title}</p>
        <p className={`text-xs ${light ? 'text-ink/60' : 'text-white/60'}`}>{mmss(pos)} / {mmss(progNow.durationSeconds)} · elle continue à sa place : en quittant l’antenne, les auditeurs la retrouvent à la même minute.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className={`flex flex-1 items-center gap-2 text-xs ${progCut ? 'opacity-40' : ''}`}>Volume du programme
            <input type="range" min={0} max={1} step={0.05} value={progVol} disabled={progCut} onChange={(e) => setProgVol(Number(e.target.value))} className="flex-1 accent-[#e8b84a]" />
            <span className="w-9 text-right tabular-nums">{Math.round(progVol * 100)} %</span>
          </label>
          <button type="button" onClick={() => setProgCut((v) => !v)} className={progCut ? 'rounded-xl bg-gold px-3 py-2 text-sm font-bold text-night' : btn}>
            {progCut ? 'Remettre le programme' : 'Couper le programme (100 % direct)'}
          </button>
        </div>
      </section>
    );
  };
  useEffect(() => { if (nodes.current.micGain) nodes.current.micGain.gain.value = micMuted ? 0 : 1; }, [micMuted]);
  useEffect(() => () => { if (pub.current) stopAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  screenInfo.current = { title: title.trim() || 'Émission en direct', topic: topicSaved, listeners: auditeurs ?? null, callsOpen: calls };
  const waiting = queue.filter((a) => a.statut === 'attente');
  const live = queue.filter((a) => a.statut === 'antenne');

  useEffect(() => {
    if (!onAir || variant !== 'studio') return;
    const t = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(t);
  }, [onAir, variant]);

  const lockBox = (dark: boolean) => locked && !onAir && (
    <div className={dark ? 'rounded-3xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-white' : 'rounded border border-red-300 bg-red-50 p-3 text-sm text-night'}>
      <p className="font-semibold">🔴 {locked.host} est déjà en direct (« {locked.title} »).</p>
      <p className={dark ? 'mt-1 text-white/70' : 'mt-1 text-ink/70'}>Pour faire l’émission ensemble, demandez-lui le lien du plateau et rejoignez-le. Si cette émission est en fait terminée (téléphone éteint, coupure), vous pouvez reprendre l’antenne.</p>
      <button type="button" onClick={() => { if (window.confirm(`Reprendre l’antenne ? Le direct de ${locked.host} sera coupé chez les auditeurs.`)) void goLive(true); }} className="mt-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white">Reprendre l’antenne quand même</button>
    </div>
  );
  const copyLink = () => { void navigator.clipboard?.writeText(plateauLink).then(() => { setLinkCopied(true); window.setTimeout(() => setLinkCopied(false), 1500); }).catch(() => {}); };
  const waLink = `https://wa.me/?text=${encodeURIComponent(`🎙️ Rejoins-moi sur le plateau de « ${title.trim() || 'Radio Je suis KCCiste'} » (Radio Je suis KCCiste). Ouvre ce lien, mets des écouteurs et appuie sur « Rejoindre le plateau » :\n${plateauLink}`)}`;
  const seat = (a: Appel) => (a.genre === 'plateau' ? `🎙️ Plateau ${a.siege ?? ''} · ` : '');

  const who = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
  const startedAt = radioSettingsOf(settings).live.startedAt;
  const startTime = onAir && startedAt ? new Date(startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';
  const today = new Date().toLocaleDateString('fr-FR');
  const th = 'border border-[#d3dae3] bg-[#dfe5ec] px-2 py-1.5 text-center text-[12px] font-semibold text-[#2b3648]';
  const td = 'border border-[#d3dae3] px-2 py-1.5 text-[13px] text-night';
  const lbl = 'border border-[#d3dae3] bg-[#f3f6f9] px-2 py-1.5 text-[13px] font-semibold text-[#2b3648] w-44';
  const fileBtn = 'cursor-pointer rounded-md border border-white/40 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-white/10';


  if (variant === 'studio') {
    const sec = onAir && startedAt ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)) : 0;
    const clock = `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    const card = 'rounded-3xl border border-white/10 bg-white/[0.04] p-4';
    const hd = 'mb-3 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300';
    const field = 'w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-white placeholder:text-white/35 outline-none focus:border-gold/60 disabled:opacity-50';
    const small = 'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold';
    const lit = Math.round(Math.min(1, level * 1.4) * 20);
    return (
      <div className="min-h-[100dvh] bg-[#070a12] text-white">
        <div className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] bg-[radial-gradient(60%_50%_at_50%_20%,rgba(232,184,74,.16),transparent_70%)]" aria-hidden />
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#070a12]/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-gold font-display text-[11px] font-bold tracking-wider text-gold">KCC</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold leading-tight">Studio Radio KCC</p>
            <p className="truncate text-xs text-white/55">{who || 'Animateur'}</p>
          </div>
          {onAir
            ? <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold tabular-nums"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />ON AIR {clock}</span>
            : <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">Hors antenne</span>}
        </header>

        <main className="relative mx-auto max-w-lg space-y-4 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4">
          {/* Console : vu-mètre, gros bouton d'antenne, micro */}
          <section className={card + ' text-center'}>
            <div className="mx-auto flex h-12 max-w-xs items-end justify-center gap-1" aria-label="Niveau du micro">
              {Array.from({ length: 20 }, (_, i) => (
                <span key={i} className={`w-2 rounded-sm transition-colors ${i < lit ? (i > 16 ? 'bg-red-500' : i > 12 ? 'bg-gold' : 'bg-emerald-400') : 'bg-white/10'}`} style={{ height: `${30 + i * 3.5}%` }} />
              ))}
            </div>
            <button type="button" onClick={onAir ? endShow : () => void goLive()} disabled={busy}
              className={`mx-auto mt-5 grid h-32 w-32 place-items-center rounded-full text-center font-bold shadow-2xl transition active:scale-95 disabled:opacity-60 ${onAir ? 'bg-red-600 text-white shadow-red-900/50' : 'bg-gold text-night shadow-[0_14px_40px_-8px_rgba(232,184,74,.75)]'}`}>
              <span>{busy ? '…' : onAir ? <>■<br />Terminer</> : <>●<br />Passer à<br />l’antenne</>}</span>
            </button>
            <p className="mt-3 text-sm text-white/65">{onAir ? (state || 'À l’antenne') : 'Hors direct, la radio automatique joue seule.'}</p>
            <p className="mt-1 text-sm font-semibold text-gold-300">🎧 {onAir ? auditeurs ?? '…' : listenerCounts?.total ?? '…'} auditeur{((onAir ? auditeurs : listenerCounts?.total) ?? 0) > 1 ? 's' : ''} {onAir ? 'sur votre direct' : 'à l’écoute de la radio'}{onAir && taken.length ? ` · ${taken.length} au téléphone` : ''}</p>
            {onAir && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => setMicMuted((m) => !m)} className={small + (micMuted ? ' bg-red-600 text-white' : ' bg-white/[0.08] text-white')}><Mic className="h-4 w-4" />{micMuted ? 'Micro coupé' : 'Micro actif'}</button>
                {outputsOf(dest).length > 0 && (diffOn
                  ? <button type="button" onClick={stopDiff} className={small + ' bg-white/[0.08] text-white'}><Square className="h-4 w-4" />Arrêter YouTube</button>
                  : <button type="button" onClick={startDiff} className={small + ' bg-white/[0.08] text-white'}><Youtube className="h-4 w-4" />YouTube/Facebook</button>)}
              </div>
            )}
          </section>

          {lockBox(true)}
          {onAir && plateauLink && (
            <section className={card}>
              <p className={hd}>Invités plateau (3 places)</p>
              <p className="text-sm text-white/65">Envoyez ce lien : l’invité passe directement à l’antenne et entend tout le plateau.</p>
              <p className="mt-2 truncate rounded-xl bg-white/[0.06] px-3 py-2 font-mono text-xs text-white/80">{plateauLink}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={copyLink} className={small + ' bg-white/[0.08] text-white'}>{linkCopied ? '✓ Copié' : 'Copier'}</button>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className={small + ' bg-emerald-600 text-white'}>WhatsApp</a>
              </div>
            </section>
          )}
          {lastRec && !onAir && <RecordingPanel dark rec={lastRec.rec} title={lastRec.title} topic={lastRec.topic} onClose={() => setLastRec(null)} />}
          {onAir && recorder.current && <p className="text-center text-xs text-red-300">● Enregistrement en cours</p>}
          {!onAir && (
            <section className={card + ' space-y-3'}>
              <p className={hd}>Émission</p>
              <input className={field} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom de l’émission" aria-label="Nom de l’émission" />
              <select className={field} value={micId} onChange={(e) => setMicId(e.target.value)} aria-label="Micro">
                <option value="" className="text-night">Micro du téléphone</option>
                {mics.map((m, i) => <option key={m.deviceId || i} value={m.deviceId} className="text-night">{m.label || `Micro ${i + 1}`}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-white/85"><input type="checkbox" checked={calls} onChange={(e) => setCalls(e.currentTarget.checked)} className="h-4 w-4 accent-[#e8b84a]" />Accepter les appels des auditeurs</label>
              <label className="flex items-center gap-2 text-sm text-white/85"><input type="checkbox" checked={recOn} onChange={(e) => toggleRec(e.currentTarget.checked)} className="h-4 w-4 accent-[#e8b84a]" />Enregistrer l’émission (téléchargement, rediffusion)</label>
              <p className="text-xs text-white/45">Mettez des écouteurs pour éviter l’écho.</p>
            </section>
          )}

          <RadioGrid dark />

          <section className={card}>
            <p className={hd}><span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-red-400" />Appels ({queue.length})</span></p>
            {!onAir && <p className="text-sm text-white/50">Les appels arrivent ici pendant le direct.</p>}
            {onAir && !queue.length && <p className="text-sm text-white/50">Aucun appel pour le moment.</p>}
            <ul className="space-y-2">
              {live.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-2xl border border-red-500/60 bg-red-500/15 p-3">
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">🔴 {seat(a)}{a.nom}{a.ville ? ` · ${a.ville}` : ''}</p><p className="text-xs text-red-200">{taken.includes(a.id) ? 'À l’antenne' : 'Connexion…'}</p></div>
                  <button type="button" onClick={() => hang(a, 'termine')} className={small + ' bg-red-600 text-white'}><PhoneOff className="h-4 w-4" /></button>
                </li>
              ))}
              {waiting.map((a) => (
                <li key={a.id} className="flex items-center gap-2 rounded-2xl bg-white/[0.05] p-3">
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{a.nom}{a.ville ? ` · ${a.ville}` : ''}</p><p className="text-xs text-white/50">attend depuis {since(a.cree_le)}</p></div>
                  <button type="button" onClick={() => take(a)} className={small + ' bg-emerald-600 text-white'} aria-label={`Prendre ${a.nom}`}><Headphones className="h-4 w-4" /></button>
                  <button type="button" onClick={() => hang(a, 'refuse')} className={small + ' bg-white/[0.08] text-white'} aria-label={`Refuser ${a.nom}`}><UserX className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </section>

          <YouTubeChat dark />

          <section className={card}>
            <p className={hd}>Sujet de l’émission
              {onAir && <button type="button" onClick={publishTopic} disabled={topic.trim() === topicSaved} className="rounded-lg bg-gold px-2.5 py-1 text-[11px] font-bold normal-case tracking-normal text-night disabled:opacity-40"><Send className="mr-1 inline h-3 w-3" />{topicSaved ? 'Mettre à jour' : 'Afficher'}</button>}
            </p>
            <textarea rows={4} maxLength={3000} value={topic} onChange={(e) => setTopic(e.target.value)} className={field + ' resize-y'} placeholder="Thème du jour, question, histoire… lu par les auditeurs." />
            {onAir && topic.trim() === topicSaved && topicSaved && <p className="mt-1 text-xs text-emerald-300">✓ Affiché aux auditeurs</p>}
          </section>

          {progBox(false)}

          <section className={card}>
            <p className={hd}><span className="flex items-center gap-2"><Music2 className="h-3.5 w-3.5" />Musique de fond</span>
              <label className="cursor-pointer rounded-lg bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold normal-case tracking-normal text-white">+ morceaux<input type="file" accept="audio/*" multiple className="sr-only" onChange={(e) => { addMusic(e.target.files); e.currentTarget.value = ''; }} /></label>
            </p>
            {!tracks.length && <p className="text-sm text-white/50">Ajoutez des morceaux : ils passent à tour de rôle sous votre voix.</p>}
            <ol className="max-h-56 space-y-1 overflow-y-auto">
              {tracks.map((t, i) => {
                const now = onAir && i === trackIdx && musicOn;
                return (
                  <li key={t.url} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm ${now ? 'bg-gold/20 text-white' : 'text-white/75'}`}>
                    <span className="w-6 text-right text-xs text-white/40">{now ? '▶' : i + 1}</span>
                    <button type="button" className="min-w-0 flex-1 truncate text-left" onClick={() => { if (onAir) { setMusicOn(true); playTrack(i); } }}>{t.name}</button>
                    <button type="button" onClick={() => removeTrack(i)} className="p-1 text-white/40" aria-label={`Retirer ${t.name}`}><X className="h-3.5 w-3.5" /></button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex items-center gap-2">
              {onAir && !!tracks.length && <>
                <button type="button" onClick={toggleMusic} className={small + ' bg-white/[0.08] text-white'} aria-label={musicOn ? 'Couper la musique' : 'Relancer la musique'}>{musicOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                <button type="button" onClick={() => { setMusicOn(true); playTrack(idxRef.current + 1); }} className={small + ' bg-white/[0.08] text-white'} aria-label="Morceau suivant"><SkipForward className="h-4 w-4" /></button>
              </>}
              <label className="flex flex-1 items-center gap-2 text-xs text-white/60">Volume<input type="range" min={0} max={1} step={0.05} value={musicVol} onChange={(e) => setMusicVol(Number(e.target.value))} className="flex-1 accent-[#e8b84a]" /></label>
            </div>
          </section>

          <section className={card}>
            <p className={hd}>Effets
              <label className="cursor-pointer rounded-lg bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold normal-case tracking-normal text-white">+ bruitage<input type="file" accept="audio/*" multiple className="sr-only" onChange={(e) => { const f = Array.from(e.target.files ?? []); setMyPads((l) => [...l, ...f.map((file) => ({ name: file.name.replace(/\.[^.]+$/, ''), buf: null, file }))]); e.currentTarget.value = ''; }} /></label>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([['echo', 'Écho'], ['reverb', 'Réverb'], ['radio', 'Voix radio']] as [VoiceFx, string][]).map(([k, l]) => (
                <button key={k} type="button" disabled={!onAir} onClick={() => toggleVoiceFx(k)} aria-pressed={voiceFx[k]}
                  className={`rounded-xl px-2 py-2.5 text-sm font-semibold disabled:opacity-40 ${voiceFx[k] ? 'bg-gold text-night' : 'bg-white/[0.08] text-white'}`}>{l}</button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PADS.map((p) => (
                <button key={p.id} type="button" disabled={!onAir} onClick={() => firePad(p.id)} className="rounded-2xl bg-white/[0.06] px-1 py-3 text-center text-[11px] font-semibold text-white/85 active:scale-95 active:bg-gold/30 disabled:opacity-40">
                  <span className="block text-xl" aria-hidden>{p.emoji}</span>{p.label}
                </button>
              ))}
              {myPads.map((p, i) => (
                <button key={i} type="button" disabled={!onAir} onClick={() => void fireMyPad(i)} className="truncate rounded-2xl bg-gold/20 px-1 py-3 text-center text-[11px] font-semibold active:scale-95 disabled:opacity-40" title={p.name}>
                  <span className="block text-xl" aria-hidden>🔊</span>{p.name}
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-white/60">Volume<input type="range" min={0} max={1.5} step={0.05} value={fxVol} onChange={(e) => setFxVol(Number(e.target.value))} className="flex-1 accent-[#e8b84a]" /></label>
          </section>

          <section className={card + ' space-y-3'}>
            <p className={hd}><span className="flex items-center gap-2"><Youtube className="h-3.5 w-3.5 text-red-400" />YouTube et Facebook</span></p>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dest.yt} onChange={(e) => updateDest({ yt: e.currentTarget.checked })} className="h-4 w-4 accent-[#e8b84a]" />YouTube</label>
            {dest.yt && <input type="password" autoComplete="off" className={field} placeholder="Collez la clé de stream YouTube" aria-label="Clé de stream YouTube" value={dest.ytKey} onChange={(e) => updateDest({ ytKey: e.target.value })} />}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dest.fb} onChange={(e) => updateDest({ fb: e.currentTarget.checked })} className="h-4 w-4 accent-[#e8b84a]" />Facebook</label>
            {dest.fb && <input type="password" autoComplete="off" className={field} placeholder="Collez la clé de stream Facebook" aria-label="Clé de stream Facebook" value={dest.fbKey} onChange={(e) => updateDest({ fbKey: e.target.value })} />}
            <p className={`text-xs ${diffStatus && /refusé|valide|lente|coupé|Reconnectez/.test(diffStatus) ? 'text-red-300' : diffStatus ? 'text-emerald-300' : 'text-white/45'}`}>
              {diffStatus || (outputsOf(dest).length ? '✓ Partira automatiquement quand vous passerez à l’antenne.' : 'La clé reste dans ce téléphone.')}
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`${appMode ? 'min-h-screen' : '-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-68px)]'} flex flex-col bg-[#e9edf2]`}>
      {/* Barre du haut, comme le logiciel Colmatage */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 bg-[#2b3648] px-4 py-2.5 text-white shadow">
        <span className="grid h-10 w-[84px] place-items-center rounded bg-white"><img src="/images/logo-kcc.svg" alt="KCC" className="h-8" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold leading-tight">{RADIO_NAME} · Antenne</p>
          <p className="text-xs text-white/65">Émission en direct · jesuiskcciste.com/radio</p>
        </div>
        {onAir && <Button type="button" size="sm" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" icon={<Mic className="h-4 w-4" />} onClick={() => setMicMuted((m) => !m)}>{micMuted ? 'Rallumer le micro' : 'Couper le micro'}</Button>}
        {onAir && (diffOn
          ? <Button type="button" size="sm" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" icon={<Square className="h-4 w-4" />} onClick={stopDiff}>Arrêter YouTube/Facebook</Button>
          : outputsOf(dest).length > 0 && <Button type="button" size="sm" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" icon={<Youtube className="h-4 w-4" />} onClick={startDiff}>YouTube/Facebook</Button>)}
        {!onAir
          ? <Button type="button" size="sm" className="bg-white text-[#2b3648] hover:bg-white/90" icon={<Radio className="h-4 w-4" />} loading={busy} onClick={() => void goLive()}>Passer à l’antenne</Button>
          : <Button type="button" size="sm" variant="danger" icon={<Square className="h-4 w-4" />} loading={busy} onClick={endShow}>Terminer l’émission</Button>}
        <span className={`text-xs font-semibold ${onAir ? 'text-emerald-300' : 'text-white/60'}`}>{onAir ? `● ${state || 'À l’antenne'}` : 'Hors antenne'}</span>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-3 lg:flex-row lg:items-start">
        {/* Panneau de gauche : connecté, auditeurs, appels */}
        <aside className="w-full shrink-0 space-y-3 lg:sticky lg:top-[72px] lg:w-[270px]">
          <div className="rounded border border-[#d3dae3] bg-white p-3">
            <p className="text-xs text-ink/55">Connecté :</p>
            <p className="font-bold uppercase text-night">{who || '—'}</p>
            <p className="text-xs text-ink/55">Animateur radio</p>
          </div>
          <div className="rounded border border-[#d3dae3] bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#2b3648]">Auditeurs connectés</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-night">{listenerCounts?.total ?? '…'}</p>
            <p className="text-xs text-ink/55">{onAir ? `dont ${auditeurs ?? '…'} sur votre direct` : 'écoutent la radio en ce moment'}</p>
            {onAir && <div className="mt-2 h-2 overflow-hidden rounded bg-night/10" aria-label="Niveau de l’antenne"><div className="h-full bg-gradient-to-r from-emerald-500 via-gold to-red-500 transition-[width] duration-75" style={{ width: `${Math.min(100, level * 140)}%` }} /></div>}
          </div>
          <div className="rounded border border-[#d3dae3] bg-white">
            <p className="flex items-center gap-2 border-b border-[#d3dae3] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#2b3648]"><Phone className="h-3.5 w-3.5 text-red-600" />Appels ({queue.length})</p>
            {!onAir && <p className="px-3 py-3 text-xs text-ink/55">Les appels arrivent ici pendant l’émission.</p>}
            {onAir && !queue.length && <p className="px-3 py-3 text-xs text-ink/55">Aucun appel pour le moment.</p>}
            <ul>
              {live.map((a) => (
                <li key={a.id} className="border-b border-[#e3e8ee] border-l-4 border-l-red-600 bg-red-50 px-3 py-2">
                  <p className="text-sm font-semibold text-night">🔴 {seat(a)}{a.nom}{a.ville ? ` · ${a.ville}` : ''}</p>
                  <p className="text-[11px] text-red-700">{taken.includes(a.id) ? 'À l’antenne' : 'Connexion de sa voix…'}</p>
                  <button type="button" onClick={() => hang(a, 'termine')} className="mt-1 inline-flex items-center gap-1 rounded border border-red-300 px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-100"><PhoneOff className="h-3 w-3" />Raccrocher</button>
                </li>
              ))}
              {waiting.map((a) => (
                <li key={a.id} className="border-b border-[#e3e8ee] px-3 py-2">
                  <p className="text-sm font-semibold text-night">{a.nom}{a.ville ? ` · ${a.ville}` : ''}</p>
                  <p className="text-[11px] text-ink/55">En attente depuis {since(a.cree_le)}</p>
                  <div className="mt-1 flex gap-1.5">
                    <button type="button" onClick={() => take(a)} className="inline-flex items-center gap-1 rounded bg-[#2b3648] px-2 py-0.5 text-xs font-semibold text-white hover:bg-[#3a475d]"><Headphones className="h-3 w-3" />Prendre</button>
                    <button type="button" onClick={() => hang(a, 'refuse')} className="inline-flex items-center gap-1 rounded border border-[#d3dae3] px-2 py-0.5 text-xs font-semibold text-night hover:bg-night/5"><UserX className="h-3 w-3" />Refuser</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {onAir && plateauLink && (
            <div className="rounded border border-[#d3dae3] bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#2b3648]">Invités plateau (3 places)</p>
              <p className="mt-1 text-xs text-ink/60">Envoyez ce lien : l’invité passe directement à l’antenne.</p>
              <p className="mt-2 truncate rounded bg-[#f3f6f9] px-2 py-1 font-mono text-[11px]">{plateauLink}</p>
              <div className="mt-2 flex gap-1.5">
                <button type="button" onClick={copyLink} className="rounded border border-[#d3dae3] px-2 py-0.5 text-xs font-semibold">{linkCopied ? '✓ Copié' : 'Copier'}</button>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">WhatsApp</a>
              </div>
            </div>
          )}
        </aside>

        {/* Feuille principale */}
        <main className="min-w-0 flex-1 rounded-sm bg-white p-4 shadow sm:p-6">
          <div className="mb-5 flex flex-wrap items-start gap-4">
            <div className="text-center"><img src="/images/logo-kcc.svg" alt="KCC" className="mx-auto h-14" /><p className="mt-1 text-[10px] font-bold tracking-[0.3em] text-[#2b3648]">RADIO KCC</p></div>
            <div className="min-w-0 flex-1 text-center">
              <h1 className="font-display text-xl font-bold uppercase text-[#2b3648] sm:text-2xl">Antenne en direct — Radio Je suis KCCiste</h1>
              <p className="mt-1 text-xs text-ink/60">Émission : <b>{title || '—'}</b> | Appels : <b>{calls ? 'ouverts' : 'fermés'}</b> | Diffusion : <b>jesuiskcciste.com/radio{diffOn ? ', YouTube/Facebook' : ''}</b></p>
            </div>
            <table className="text-[13px]"><tbody>
              <tr><td className={lbl.replace('w-44', 'w-24')}>Statut</td><td className={`${td} text-right font-semibold ${onAir ? 'text-red-600' : ''}`}>{onAir ? '● EN DIRECT' : 'Hors antenne'}</td></tr>
              <tr><td className={lbl.replace('w-44', 'w-24')}>Date</td><td className={`${td} text-right font-semibold`}>{today}</td></tr>
              <tr><td className={lbl.replace('w-44', 'w-24')}>Début</td><td className={`${td} text-right font-semibold`}>{startTime}</td></tr>
            </tbody></table>
          </div>

          {locked && !onAir && <div className="mb-4">{lockBox(false)}</div>}
          {lastRec && !onAir && <div className="mb-4"><RecordingPanel rec={lastRec.rec} title={lastRec.title} topic={lastRec.topic} onClose={() => setLastRec(null)} /></div>}
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-4">
              <Section title="Informations de l’émission">
                <table className="w-full"><tbody>
                  <tr><td className={lbl}>Nom de l’émission</td><td className={td}><input className="w-full bg-transparent outline-none disabled:text-ink/60" maxLength={120} value={title} disabled={onAir} onChange={(e) => setTitle(e.target.value)} /></td></tr>
                  <tr><td className={lbl}>Micro</td><td className={td}>
                    <select value={micId} disabled={onAir} onChange={(e) => setMicId(e.target.value)} className="w-full bg-transparent outline-none">
                      <option value="">Micro par défaut</option>
                      {mics.map((m, i) => <option key={m.deviceId || i} value={m.deviceId}>{m.label || `Micro ${i + 1}`}</option>)}
                    </select></td></tr>
                  <tr><td className={lbl}>Appels des auditeurs</td><td className={td}><label className="inline-flex items-center gap-2"><input type="checkbox" checked={calls} disabled={onAir} onChange={(e) => setCalls(e.currentTarget.checked)} /> Accepter les appels</label></td></tr>
                  <tr><td className={lbl}>Enregistrement</td><td className={td}><label className="inline-flex items-center gap-2"><input type="checkbox" checked={recOn} disabled={onAir} onChange={(e) => toggleRec(e.currentTarget.checked)} /> Enregistrer l’émission (téléchargement, rediffusion)</label></td></tr>
                  <tr><td className={lbl}>Animateur</td><td className={td}>{who || '—'}</td></tr>
                </tbody></table>
                <p className="px-3 py-2 text-[11px] text-ink/55">Utilisez un casque pour éviter l’écho.</p>
              </Section>

              <Section title="Sujet de l’émission" action={onAir ? <button type="button" onClick={publishTopic} disabled={topic.trim() === topicSaved} className={fileBtn + ' disabled:opacity-40'}><Send className="mr-1 inline h-3 w-3" />{topicSaved ? 'Mettre à jour' : 'Afficher aux auditeurs'}</button> : undefined}>
                <textarea rows={5} maxLength={3000} value={topic} onChange={(e) => setTopic(e.target.value)} className="block w-full resize-y border-0 p-3 text-[13px] outline-none" placeholder="Thème du jour, question, histoire… Il s’affiche sur la page des auditeurs pendant le direct." />
                <p className="border-t border-[#e3e8ee] px-3 py-1.5 text-[11px] text-ink/55">{onAir ? (topic.trim() === topicSaved && topicSaved ? '✓ Affiché aux auditeurs' : 'Cliquez sur « Afficher aux auditeurs » en haut à droite.') : 'Il sera affiché dès que vous passez à l’antenne.'}</p>
              </Section>

              {progBox(true)}
              <Section title="Musique de fond" action={<label className={fileBtn}><Music2 className="mr-1 inline h-3 w-3" />+ morceaux<input type="file" accept="audio/*" multiple className="sr-only" onChange={(e) => { addMusic(e.target.files); e.currentTarget.value = ''; }} /></label>}>
                <table className="w-full"><thead><tr><th className={th + ' w-10'}>N°</th><th className={th}>Morceau</th><th className={th + ' w-24'}>État</th><th className={th + ' w-8'} /></tr></thead>
                  <tbody>
                    {!tracks.length && <tr><td colSpan={4} className={td + ' text-center text-ink/55'}>Aucun morceau. Cliquez sur « + morceaux » (plusieurs à la fois) : ils passent à tour de rôle.</td></tr>}
                    {tracks.map((t, i) => {
                      const playing = onAir && i === trackIdx && musicOn;
                      return (
                        <tr key={t.url} className={playing ? 'bg-emerald-50' : i % 2 ? 'bg-[#fafbfc]' : ''}>
                          <td className={td + ' text-center text-ink/60'}>{i + 1}</td>
                          <td className={td}><button type="button" className="w-full truncate text-left hover:underline" onClick={() => { if (onAir) { setMusicOn(true); playTrack(i); } }} title={onAir ? 'Jouer ce morceau' : t.name}>{t.name}</button></td>
                          <td className={td + ` text-center text-xs font-semibold ${playing ? 'text-emerald-700' : 'text-ink/45'}`}>{playing ? '▶ En cours' : 'En attente'}</td>
                          <td className={td + ' text-center'}><button type="button" onClick={() => removeTrack(i)} className="text-ink/40 hover:text-red-600" aria-label={`Retirer ${t.name}`}><X className="h-3.5 w-3.5" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody></table>
                <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                  {onAir && !!tracks.length && <>
                    <Button type="button" size="sm" variant="outline" icon={musicOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} onClick={toggleMusic}>{musicOn ? 'Couper' : 'Relancer'}</Button>
                    <Button type="button" size="sm" variant="outline" icon={<SkipForward className="h-4 w-4" />} onClick={() => { setMusicOn(true); playTrack(idxRef.current + 1); }}>Suivant</Button>
                  </>}
                  <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-[#2b3648]">Volume<input type="range" min={0} max={1} step={0.05} value={musicVol} onChange={(e) => setMusicVol(Number(e.target.value))} /></label>
                </div>
              </Section>
            </div>

            <div className="space-y-4">
              <Section title="Effets sur la voix">
                <table className="w-full"><thead><tr><th className={th}>Effet</th><th className={th}>État</th></tr></thead>
                  <tbody>
                    {([['echo', 'Écho'], ['reverb', 'Réverbération'], ['radio', 'Voix radio']] as [VoiceFx, string][]).map(([k, l]) => (
                      <tr key={k}><td className={td}>{l}</td><td className={td + ' text-center'}>
                        <button type="button" onClick={() => toggleVoiceFx(k)} aria-pressed={voiceFx[k]} disabled={!onAir}
                          className={`rounded px-3 py-0.5 text-xs font-semibold ${voiceFx[k] ? 'bg-emerald-600 text-white' : 'border border-[#d3dae3] text-night'} disabled:opacity-40`}>{voiceFx[k] ? 'Activé' : 'Désactivé'}</button>
                      </td></tr>
                    ))}
                  </tbody></table>
              </Section>

              <Section title="Bruitages" action={<label className={fileBtn}>+ bruitage<input type="file" accept="audio/*" multiple className="sr-only" onChange={(e) => { const f = Array.from(e.target.files ?? []); setMyPads((l) => [...l, ...f.map((file) => ({ name: file.name.replace(/\.[^.]+$/, ''), buf: null, file }))]); e.currentTarget.value = ''; }} /></label>}>
                <div className="grid grid-cols-2 gap-px bg-[#d3dae3] sm:grid-cols-4">
                  {PADS.map((p) => (
                    <button key={p.id} type="button" disabled={!onAir} onClick={() => firePad(p.id)} className="bg-white px-2 py-3 text-center text-xs font-semibold text-night hover:bg-[#eef2f6] active:bg-[#dfe5ec] disabled:opacity-50">
                      <span className="block text-xl" aria-hidden>{p.emoji}</span>{p.label}
                    </button>
                  ))}
                  {myPads.map((p, i) => (
                    <button key={i} type="button" disabled={!onAir} onClick={() => void fireMyPad(i)} className="truncate bg-gold/20 px-2 py-3 text-center text-xs font-semibold text-night hover:bg-gold/30 disabled:opacity-50" title={p.name}>
                      <span className="block text-xl" aria-hidden>🔊</span>{p.name}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#2b3648]">Volume des bruitages<input type="range" min={0} max={1.5} step={0.05} value={fxVol} onChange={(e) => setFxVol(Number(e.target.value))} className="flex-1" /></label>
              </Section>

              <YouTubeChat />

              <Section title="YouTube et Facebook">
                <table className="w-full"><thead><tr><th className={th + ' w-28'}>Destination</th><th className={th}>Clé de stream</th></tr></thead>
                  <tbody>
                    <tr><td className={td}><label className="inline-flex items-center gap-2"><input type="checkbox" checked={dest.yt} onChange={(e) => updateDest({ yt: e.currentTarget.checked })} /> YouTube</label></td>
                      <td className={td}><input type="password" autoComplete="off" disabled={!dest.yt} placeholder="Collez la clé YouTube" aria-label="Clé de stream YouTube" value={dest.ytKey} onChange={(e) => updateDest({ ytKey: e.target.value })} className="w-full bg-transparent outline-none disabled:opacity-40" /></td></tr>
                    <tr><td className={td}><label className="inline-flex items-center gap-2"><input type="checkbox" checked={dest.fb} onChange={(e) => updateDest({ fb: e.currentTarget.checked })} /> Facebook</label></td>
                      <td className={td}><input type="password" autoComplete="off" disabled={!dest.fb} placeholder="Collez la clé Facebook" aria-label="Clé de stream Facebook" value={dest.fbKey} onChange={(e) => updateDest({ fbKey: e.target.value })} className="w-full bg-transparent outline-none disabled:opacity-40" /></td></tr>
                  </tbody></table>
                <p className={`px-3 py-2 text-[11px] ${diffStatus && /refusé|valide|lente|coupé|Reconnectez/.test(diffStatus) ? 'text-red-700' : diffStatus ? 'text-emerald-700' : 'text-ink/55'}`}>
                  {diffStatus || (outputsOf(dest).length ? '✓ Partira automatiquement quand vous passerez à l’antenne.' : 'Le son part avec une image animée (logo KCC, titre, sujet). La clé reste dans cet ordinateur.')}
                </p>
              </Section>
            </div>
          </div>
          <div className="mt-4"><RadioGrid /></div>
        </main>
      </div>
    </div>
  );
}
