import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Mic, Music2, Pause, Phone, PhoneOff, Play, Radio, Send, SkipForward, Square, UserX, X } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { snakify } from '@/utils/case';
import { writeAudit } from '@/services';
import { useAuth } from '@/features/auth/AuthContext';
import { radioSettingsOf, type RadioSettings } from '@/features/radio/radio';
import { LiveBadge, RADIO_NAME } from '@/features/radio/RadioUi';
import { microphone, publishShow, watchTrack, type Publish } from '@/features/radio/rtc';
import { PADS, playBuffer, playPad, voiceChain, type Pad, type VoiceFx } from '@/features/radio/effects';
import { useRadioListeners } from '@/features/radio/listeners';

type Appel = { id: string; nom: string; ville: string | null; statut: 'attente' | 'antenne'; cree_le: string; session_id: string };
type Line = { pc: RTCPeerConnection; node: MediaStreamAudioSourceNode; gain: GainNode; el: HTMLAudioElement };

const since = (iso: string) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min`;
};

/**
 * Antenne de la radio en direct, depuis le navigateur de l'animateur : micro + musique de fond
 * envoyés au relais du site (pas besoin de Caster.fm ni de Jitsi). Les auditeurs qui appellent
 * depuis /radio arrivent dans la file ; « Prendre à l'antenne » mélange leur voix à l'émission.
 */
export default function AdminRadioAntenne() {
  const { settings, setSettings } = useSiteSettings();
  const { profile } = useAuth();
  const { notify } = useToast();
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
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'settings.update', 'radio antenne : début');
      setOnAir(true);
      notify('Vous êtes à l’antenne. Les auditeurs de /radio basculent sur l’émission dans la minute.');
    } catch (e) {
      stopAll();
      notify(e instanceof Error ? e.message : 'L’antenne n’a pas démarré.', 'error');
    } finally { setBusy(false); }
  }

  function stopAll() {
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

  const waiting = queue.filter((a) => a.statut === 'attente');
  const live = queue.filter((a) => a.statut === 'antenne');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex flex-wrap items-center gap-2 font-display text-2xl font-semibold text-night">Antenne en direct · {RADIO_NAME} {onAir && <LiveBadge />}</h1>
        <p className="mt-1 text-sm text-ink/65">Parlez en direct sur <Link to="/radio" className="font-semibold text-gold-700 hover:underline">jesuiskcciste.com/radio</Link>, depuis ce navigateur, sans autre logiciel. Les auditeurs appuient sur « Appeler l’émission » : leur appel arrive ci-dessous, vous le prenez à l’antenne et tout le monde l’entend. Utilisez un <b>casque</b> pour éviter l’écho.</p>
      </div>

      <Card><CardBody className="space-y-4">
        <Field label="Nom de l’émission">{(p) => <Input {...p} maxLength={120} value={title} disabled={onAir} onChange={(e) => setTitle(e.target.value)} />}</Field>
        <Field label="Micro">{(p) => (
          <select {...p} value={micId} disabled={onAir} onChange={(e) => setMicId(e.target.value)} className="w-full rounded-xl border border-night/15 px-3 py-2.5">
            <option value="">Micro par défaut</option>
            {mics.map((m, i) => <option key={m.deviceId || i} value={m.deviceId}>{m.label || `Micro ${i + 1}`}</option>)}
          </select>
        )}</Field>
        <Checkbox label="Accepter les appels des auditeurs" description="Affiche le bouton « Appeler l’émission » sur la page de la radio." checked={calls} disabled={onAir} onChange={(e) => setCalls(e.currentTarget.checked)} />
        <div className="rounded-2xl bg-night/[0.04] p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-night"><Music2 className="h-4 w-4 text-gold-600" />Musique de fond (facultatif)</p>
          <p className="mt-1 text-xs text-ink/60">Choisissez autant de morceaux que vous voulez (sélection multiple, par exemple Ctrl + clic) : ils passent l’un après l’autre, puis la liste recommence.</p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-night/15 bg-white px-3 py-2 text-sm font-semibold text-night hover:border-gold-400">
            <Music2 className="h-4 w-4" />Ajouter des morceaux
            <input type="file" accept="audio/*" multiple className="sr-only" onChange={(e) => { addMusic(e.target.files); e.currentTarget.value = ''; }} />
          </label>
          {!!tracks.length && (
            <>
              <ol className="mt-3 max-h-64 space-y-1 overflow-y-auto">
                {tracks.map((t, i) => (
                  <li key={t.url} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${onAir && i === trackIdx && musicOn ? 'bg-gold/20 font-semibold text-night' : 'text-ink/80'}`}>
                    <span className="w-6 shrink-0 text-right text-xs tabular-nums text-ink/50">{onAir && i === trackIdx && musicOn ? '▶' : `${i + 1}.`}</span>
                    <button type="button" className="min-w-0 flex-1 truncate text-left hover:underline" onClick={() => { if (onAir) { setMusicOn(true); playTrack(i); } }} title={onAir ? 'Jouer ce morceau' : t.name}>{t.name}</button>
                    <button type="button" onClick={() => removeTrack(i)} className="rounded p-1 text-ink/40 hover:bg-night/5 hover:text-red-600" aria-label={`Retirer ${t.name}`}><X className="h-3.5 w-3.5" /></button>
                  </li>
                ))}
              </ol>
              <p className="mt-1 text-xs text-ink/55">{tracks.length} morceau{tracks.length > 1 ? 'x' : ''}</p>
              {onAir && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" icon={musicOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} onClick={toggleMusic}>{musicOn ? 'Couper la musique' : 'Relancer la musique'}</Button>
                  <Button type="button" size="sm" variant="outline" icon={<SkipForward className="h-4 w-4" />} onClick={() => { setMusicOn(true); playTrack(idxRef.current + 1); }}>Morceau suivant</Button>
                </div>
              )}
            </>
          )}
          <label className="mt-3 block text-xs font-semibold text-ink/70">Volume de la musique
            <input type="range" min={0} max={1} step={0.05} value={musicVol} onChange={(e) => setMusicVol(Number(e.target.value))} className="mt-1 w-full" />
          </label>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-gold-50/60 p-4">
          <Field label="Sujet de l’émission (lu par les auditeurs)" hint="Écrivez le thème du jour, une question, une histoire… Il s’affiche sur jesuiskcciste.com/radio pendant le direct.">
            {(p) => <Textarea {...p} rows={5} maxLength={3000} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex. : Tosungana — Une sœur nous écrit : son mari est sans travail depuis 9 mois et son ex lui propose une voiture… Que lui conseillez-vous ? Appelez l’émission !" />}
          </Field>
          {onAir && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button type="button" size="sm" icon={<Send className="h-4 w-4" />} onClick={publishTopic} disabled={topic.trim() === topicSaved}>{topicSaved ? 'Mettre à jour le sujet' : 'Afficher aux auditeurs'}</Button>
              {topic.trim() === topicSaved && topicSaved && <span className="text-xs text-emerald-700">✓ Affiché aux auditeurs</span>}
            </div>
          )}
          {!onAir && <p className="mt-2 text-xs text-ink/55">Il sera affiché dès que vous passez à l’antenne.</p>}
        </div>
        {!onAir
          ? <Button type="button" icon={<Radio className="h-4 w-4" />} loading={busy} onClick={goLive}>Passer à l’antenne</Button>
          : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant={micMuted ? 'primary' : 'outline'} icon={<Mic className="h-4 w-4" />} onClick={() => setMicMuted((m) => !m)}>{micMuted ? 'Rallumer mon micro' : 'Couper mon micro'}</Button>
                <Button type="button" variant="danger" icon={<Square className="h-4 w-4" />} loading={busy} onClick={endShow}>Terminer l’émission</Button>
                <span className="text-sm text-ink/65">{state}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-night/10" aria-label="Niveau de l’antenne"><div className="h-full bg-gradient-to-r from-emerald-500 via-gold to-red-500 transition-[width] duration-75" style={{ width: `${Math.min(100, level * 140)}%` }} /></div>
            </div>
          )}
      </CardBody></Card>

      {onAir && (
        <div className="flex items-center gap-4 rounded-2xl bg-night p-5 text-white">
          <span className="text-4xl font-semibold tabular-nums">{auditeurs ?? '…'}</span>
          <span className="text-sm text-white/75">{auditeurs === 1 ? 'auditeur vous écoute' : 'auditeurs vous écoutent'} en ce moment sur jesuiskcciste.com/radio{taken.length ? ` · ${taken.length} au téléphone` : ''}</span>
        </div>
      )}

      {onAir && (
        <Card><CardBody className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-night">Effets</h2>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/55">Sur ma voix</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {([['echo', 'Écho'], ['reverb', 'Réverbération'], ['radio', 'Voix radio']] as [VoiceFx, string][]).map(([k, l]) => (
                <button key={k} type="button" onClick={() => toggleVoiceFx(k)} aria-pressed={voiceFx[k]}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${voiceFx[k] ? 'border-gold-500 bg-gold text-night shadow' : 'border-night/15 bg-white text-night hover:border-gold-400'}`}>{voiceFx[k] ? '● ' : ''}{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/55">Bruitages (un clic, même pendant la musique)</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PADS.map((p) => (
                <button key={p.id} type="button" onClick={() => firePad(p.id)} className="rounded-2xl bg-night px-3 py-4 text-center text-sm font-semibold text-white shadow active:scale-95 hover:bg-night-600">
                  <span className="block text-2xl" aria-hidden>{p.emoji}</span>{p.label}
                </button>
              ))}
              {myPads.map((p, i) => (
                <button key={i} type="button" onClick={() => void fireMyPad(i)} className="truncate rounded-2xl bg-gold px-3 py-4 text-center text-sm font-semibold text-night shadow active:scale-95 hover:bg-gold-300" title={p.name}>
                  <span className="block text-2xl" aria-hidden>🔊</span>{p.name}
                </button>
              ))}
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-night/15 bg-white px-3 py-2 text-sm font-semibold text-night hover:border-gold-400">
              🔊 Ajouter mes propres bruitages
              <input type="file" accept="audio/*" multiple className="sr-only" onChange={(e) => { const f = Array.from(e.target.files ?? []); setMyPads((l) => [...l, ...f.map((file) => ({ name: file.name.replace(/\.[^.]+$/, ''), buf: null, file }))]); e.currentTarget.value = ''; }} />
            </label>
            <label className="mt-3 block text-xs font-semibold text-ink/70">Volume des bruitages
              <input type="range" min={0} max={1.5} step={0.05} value={fxVol} onChange={(e) => setFxVol(Number(e.target.value))} className="mt-1 w-full" />
            </label>
          </div>
        </CardBody></Card>
      )}

      {onAir && (
        <Card><CardBody className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-night"><Phone className="h-5 w-5 text-red-600" />Appels des auditeurs</h2>
          {!queue.length && <p className="text-sm text-ink/60">Aucun appel pour le moment. Les auditeurs appellent depuis jesuiskcciste.com/radio.</p>}
          {live.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-red-500 bg-red-50 p-4">
              <div><p className="font-semibold text-night">🔴 {a.nom}{a.ville ? ` · ${a.ville}` : ''}</p><p className="text-xs text-red-700">{taken.includes(a.id) ? 'À l’antenne : tout le monde l’entend.' : 'Connexion de sa voix…'}</p></div>
              <Button type="button" variant="danger" icon={<PhoneOff className="h-4 w-4" />} onClick={() => hang(a, 'termine')}>Raccrocher</Button>
            </div>
          ))}
          {waiting.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-night/10 p-4">
              <div><p className="font-semibold text-night">{a.nom}{a.ville ? ` · ${a.ville}` : ''}</p><p className="text-xs text-ink/60">En attente depuis {since(a.cree_le)}</p></div>
              <div className="flex gap-2">
                <Button type="button" icon={<Headphones className="h-4 w-4" />} onClick={() => take(a)}>Prendre à l’antenne</Button>
                <Button type="button" variant="outline" icon={<UserX className="h-4 w-4" />} onClick={() => hang(a, 'refuse')}>Refuser</Button>
              </div>
            </div>
          ))}
        </CardBody></Card>
      )}
    </div>
  );
}
