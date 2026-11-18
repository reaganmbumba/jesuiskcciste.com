import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Mic, Music2, Phone, PhoneOff, Radio, Square, UserX } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { snakify } from '@/utils/case';
import { writeAudit } from '@/services';
import { useAuth } from '@/features/auth/AuthContext';
import { radioSettingsOf, type RadioSettings } from '@/features/radio/radio';
import { LiveBadge, RADIO_NAME } from '@/features/radio/RadioUi';
import { microphone, publishShow, watchTrack, type Publish } from '@/features/radio/rtc';

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
  const [music, setMusic] = useState<string>('');
  const [musicVol, setMusicVol] = useState(0.25);
  const [micMuted, setMicMuted] = useState(false);
  const [level, setLevel] = useState(0);

  const ctx = useRef<AudioContext | null>(null);
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
      micGain.connect(program); micGain.connect(retour);
      const musicGain = ac.createGain();
      musicGain.gain.value = musicVol;
      musicGain.connect(program); musicGain.connect(retour); musicGain.connect(ac.destination);
      const sum = ac.createGain(); micGain.connect(sum); musicGain.connect(sum); sum.connect(analyser);
      nodes.current = { mic, micGain, musicGain, program, retour, analyser, musicEl: nodes.current.musicEl };
      if (nodes.current.musicEl) {
        const s = ac.createMediaElementSource(nodes.current.musicEl);
        s.connect(musicGain);
        void nodes.current.musicEl.play().catch(() => {});
      }
      setState('Connexion au relais…');
      pub.current = await publishShow(token, program.stream.getAudioTracks()[0], retour.stream.getAudioTracks()[0]);
      pub.current.pc.onconnectionstatechange = () => {
        const s = pub.current?.pc.connectionState;
        setState(s === 'connected' ? 'À l’antenne' : s === 'failed' ? 'Connexion perdue : arrêtez puis relancez l’antenne.' : s ?? '');
      };
      await saveLive({ onAir: true, rtc: pub.current.sessionId, calls, title: title.trim() || 'Émission en direct', startedAt: new Date().toISOString() });
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
    const el = nodes.current.musicEl;
    nodes.current = { musicEl: el ? (() => { const n = new Audio(el.src); n.loop = true; return n; })() : undefined };
    setOnAir(false);
    setState('');
  }

  async function endShow() {
    setBusy(true);
    try {
      for (const a of queue) await supabase!.from('radio_appels').update({ statut: 'termine', modifie_le: new Date().toISOString() }).eq('id', a.id);
      stopAll();
      await saveLive({ onAir: false, rtc: '', calls: false });
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

  function pickMusic(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const el = new Audio(url);
    el.loop = true;
    nodes.current.musicEl?.pause();
    nodes.current.musicEl = el;
    setMusic(file.name);
    if (ctx.current && nodes.current.musicGain) {
      ctx.current.createMediaElementSource(el).connect(nodes.current.musicGain);
      void el.play();
    }
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
          <input type="file" accept="audio/*" className="mt-2 block text-sm" onChange={(e) => pickMusic(e.target.files?.[0])} />
          {music && <p className="mt-1 text-xs text-ink/60">{music}</p>}
          <label className="mt-3 block text-xs font-semibold text-ink/70">Volume de la musique
            <input type="range" min={0} max={1} step={0.05} value={musicVol} onChange={(e) => setMusicVol(Number(e.target.value))} className="mt-1 w-full" />
          </label>
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
