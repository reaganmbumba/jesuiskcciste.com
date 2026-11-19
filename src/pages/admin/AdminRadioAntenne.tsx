import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Headphones, Mic, Youtube, Music2, Pause, Phone, PhoneOff, Play, Radio, Send, SkipForward, Square, UserX, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { snakify } from '@/utils/case';
import { writeAudit } from '@/services';
import { useAuth } from '@/features/auth/AuthContext';
import { radioSettingsOf, type RadioSettings } from '@/features/radio/radio';
import { RADIO_NAME } from '@/features/radio/RadioUi';
import { isRadioDesktop } from '@/features/radio/desktop';
import { microphone, publishShow, watchTrack, type Publish } from '@/features/radio/rtc';
import { PADS, playBuffer, playPad, voiceChain, type Pad, type VoiceFx } from '@/features/radio/effects';
import { useRadioListeners } from '@/features/radio/listeners';
import { loadDestinations, outputsOf, saveDestinations, startDiffusion, type Destinations, type ScreenInfo } from '@/features/radio/diffusion';

type Appel = { id: string; nom: string; ville: string | null; statut: 'attente' | 'antenne'; cree_le: string; session_id: string };
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
export default function AdminRadioAntenne() {
  const { settings, setSettings } = useSiteSettings();
  const { profile } = useAuth();
  const { notify } = useToast();
  const appMode = isRadioDesktop();
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
  const auditeurs = useRadioListeners(false, onAir);
  const nodes = useRef<{ mic?: MediaStream; micGain?: GainNode; musicEl?: HTMLAudioElement; musicGain?: GainNode; program?: MediaStreamAudioDestinationNode; retour?: MediaStreamAudioDestinationNode; analyser?: AnalyserNode }>({});
  const pub = useRef<Publish | null>(null);
  // YouTube / Facebook (par le relais) : clés gardées dans ce navigateur seulement
  const [dest, setDest] = useState<Destinations>(loadDestinations);
  const [diffStatus, setDiffStatus] = useState('');
  const [diffOn, setDiffOn] = useState(false);
  const diff = useRef<{ stop: () => void } | null>(null);
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
      const { data } = await supabase!.from('radio_appels').select('id, nom, ville, statut, cree_le, session_id').in('statut', ['attente', 'antenne']).order('cree_le');
      if (data) setQueue(data as Appel[]);
    };
    void load();
    const t = window.setInterval(load, 3000);
    return () => window.clearInterval(t);
  }, [onAir]);

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

  async function saveLive(live: Partial<RadioSettings['live']>) {
    const r = radioSettingsOf(settings);
    const next = { ...settings, radio: { ...r, live: { ...r.live, ...live } } };
    const { error } = await supabase!.from('site_settings').upsert({ key: 'public', value: snakify(next) });
    if (error) throw error;
    setSettings(next);
  }

  async function goLive() {
    if (!supabase) return;
    setBusy(true);
    try {
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
      const chain = voiceChain(ac, micGain, [program, retour, sum]);
      (Object.keys(voiceFx) as VoiceFx[]).forEach((k) => chain.set(k, voiceFx[k]));
      const musicGain = ac.createGain();
      musicGain.gain.value = musicVol;
      musicGain.connect(program); musicGain.connect(retour); musicGain.connect(ac.destination); musicGain.connect(sum);
      // bruitages : à l'antenne, au téléphone des appelants et dans le casque
      const bus = ac.createGain(); bus.gain.value = fxVol;
      bus.connect(program); bus.connect(retour); bus.connect(ac.destination); bus.connect(sum);
      fx.current = { chain, bus };
      const musicEl = new Audio();
      musicEl.onended = () => playTrack(idxRef.current + 1);
      musicEl.onerror = () => { if (tracksRef.current.length > 1) playTrack(idxRef.current + 1); };
      ac.createMediaElementSource(musicEl).connect(musicGain);
      nodes.current = { mic, micGain, musicGain, program, retour, analyser, musicEl };
      if (tracksRef.current.length && musicOn) playTrack(0);
      setState('Connexion au relais…');
      pub.current = await publishShow(token, program.stream.getAudioTracks()[0], retour.stream.getAudioTracks()[0]);
      pub.current.pc.onconnectionstatechange = () => {
        const s = pub.current?.pc.connectionState;
        setState(s === 'connected' ? 'À l’antenne' : s === 'failed' ? 'Connexion perdue : arrêtez puis relancez l’antenne.' : s ?? '');
      };
      await saveLive({ onAir: true, rtc: pub.current.sessionId, calls, title: title.trim() || 'Émission en direct', topic: topic.trim(), startedAt: new Date().toISOString() });
      setTopicSaved(topic.trim());
      if (outputsOf(dest).length) startDiff();
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'settings.update', 'radio antenne : début');
      setOnAir(true);
      notify('Vous êtes à l’antenne. Les auditeurs de /radio basculent sur l’émission dans la minute.');
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
    stopDiff();
    lines.current.forEach((l) => { l.pc.close(); l.el.srcObject = null; });
    lines.current.clear();
    setTaken([]);
    pub.current?.pc.close();
    pub.current = null;
    nodes.current.mic?.getTracks().forEach((t) => t.stop());
    nodes.current.musicEl?.pause();
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
      stopAll();
      await saveLive({ onAir: false, rtc: '', calls: false, topic: '' });
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
          lines.current.set(a.id, { pc: w.pc, node, gain, el });
          setTaken((t) => [...new Set([...t, a.id])]);
        }
      };
      w.pc.addEventListener('track', () => setTimeout(attach, 0));
      attach();
      if (!lines.current.has(a.id)) lines.current.set(a.id, { pc: w.pc, node: undefined as unknown as MediaStreamAudioSourceNode, gain: undefined as unknown as GainNode, el });
      await supabase!.from('radio_appels').update({ statut: 'antenne', modifie_le: new Date().toISOString() }).eq('id', a.id);
      setQueue((q) => q.map((x) => (x.id === a.id ? { ...x, statut: 'antenne' } : x)));
    } catch (e) { notify(e instanceof Error ? e.message : 'Impossible de prendre cet appel.', 'error'); }
  }

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

  useEffect(() => { if (nodes.current.musicGain) nodes.current.musicGain.gain.value = musicVol; }, [musicVol]);
  useEffect(() => { if (nodes.current.micGain) nodes.current.micGain.gain.value = micMuted ? 0 : 1; }, [micMuted]);
  useEffect(() => () => { if (pub.current) stopAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  screenInfo.current = { title: title.trim() || 'Émission en direct', topic: topicSaved, listeners: auditeurs ?? null, callsOpen: calls };
  const waiting = queue.filter((a) => a.statut === 'attente');
  const live = queue.filter((a) => a.statut === 'antenne');

  const who = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
  const startedAt = radioSettingsOf(settings).live.startedAt;
  const startTime = onAir && startedAt ? new Date(startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';
  const today = new Date().toLocaleDateString('fr-FR');
  const th = 'border border-[#d3dae3] bg-[#dfe5ec] px-2 py-1.5 text-center text-[12px] font-semibold text-[#2b3648]';
  const td = 'border border-[#d3dae3] px-2 py-1.5 text-[13px] text-night';
  const lbl = 'border border-[#d3dae3] bg-[#f3f6f9] px-2 py-1.5 text-[13px] font-semibold text-[#2b3648] w-44';
  const fileBtn = 'cursor-pointer rounded-md border border-white/40 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-white/10';

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
          ? <Button type="button" size="sm" className="bg-white text-[#2b3648] hover:bg-white/90" icon={<Radio className="h-4 w-4" />} loading={busy} onClick={goLive}>Passer à l’antenne</Button>
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#2b3648]">Auditeurs en direct</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-night">{onAir ? auditeurs ?? '…' : '—'}</p>
            {onAir && <div className="mt-2 h-2 overflow-hidden rounded bg-night/10" aria-label="Niveau de l’antenne"><div className="h-full bg-gradient-to-r from-emerald-500 via-gold to-red-500 transition-[width] duration-75" style={{ width: `${Math.min(100, level * 140)}%` }} /></div>}
          </div>
          <div className="rounded border border-[#d3dae3] bg-white">
            <p className="flex items-center gap-2 border-b border-[#d3dae3] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#2b3648]"><Phone className="h-3.5 w-3.5 text-red-600" />Appels ({queue.length})</p>
            {!onAir && <p className="px-3 py-3 text-xs text-ink/55">Les appels arrivent ici pendant l’émission.</p>}
            {onAir && !queue.length && <p className="px-3 py-3 text-xs text-ink/55">Aucun appel pour le moment.</p>}
            <ul>
              {live.map((a) => (
                <li key={a.id} className="border-b border-[#e3e8ee] border-l-4 border-l-red-600 bg-red-50 px-3 py-2">
                  <p className="text-sm font-semibold text-night">🔴 {a.nom}{a.ville ? ` · ${a.ville}` : ''}</p>
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
                  <tr><td className={lbl}>Animateur</td><td className={td}>{who || '—'}</td></tr>
                </tbody></table>
                <p className="px-3 py-2 text-[11px] text-ink/55">Utilisez un casque pour éviter l’écho.</p>
              </Section>

              <Section title="Sujet de l’émission" action={onAir ? <button type="button" onClick={publishTopic} disabled={topic.trim() === topicSaved} className={fileBtn + ' disabled:opacity-40'}><Send className="mr-1 inline h-3 w-3" />{topicSaved ? 'Mettre à jour' : 'Afficher aux auditeurs'}</button> : undefined}>
                <textarea rows={5} maxLength={3000} value={topic} onChange={(e) => setTopic(e.target.value)} className="block w-full resize-y border-0 p-3 text-[13px] outline-none" placeholder="Thème du jour, question, histoire… Il s’affiche sur la page des auditeurs pendant le direct." />
                <p className="border-t border-[#e3e8ee] px-3 py-1.5 text-[11px] text-ink/55">{onAir ? (topic.trim() === topicSaved && topicSaved ? '✓ Affiché aux auditeurs' : 'Cliquez sur « Afficher aux auditeurs » en haut à droite.') : 'Il sera affiché dès que vous passez à l’antenne.'}</p>
              </Section>

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
        </main>
      </div>
    </div>
  );
}
