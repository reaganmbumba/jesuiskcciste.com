import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, PhoneOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRadio } from '@/features/radio/RadioContext';
import { microphone, publishCaller, watchTrack } from '@/features/radio/rtc';

type Step = 'form' | 'connecting' | 'onair' | 'ended' | 'error';

/**
 * Invité du plateau : il ouvre le lien envoyé par l'animateur, donne son nom et passe
 * directement à l'antenne. Il entend tout le plateau (animateur, autres invités, appelants)
 * sauf sa propre voix. Une seule page, sans le site autour.
 */
export default function PlateauPage() {
  const { liveRtc, liveOn, liveTitle, prepare, stop } = useRadio();
  const params = new URLSearchParams(window.location.search);
  const jeton = params.get('c') ?? '';
  // Brouillon : l'animateur enregistre sans diffuser ; sa console est désignée dans le lien.
  const brouillonRtc = /^[A-Za-z0-9_-]{8,128}$/.test(params.get('s') ?? '') ? params.get('s')! : '';
  const hostRtc = brouillonRtc || liveRtc;
  const ready = !!brouillonRtc || liveOn;
  const [step, setStep] = useState<Step>('form');
  const [nom, setNom] = useState('');
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const id = useRef<string | null>(null);
  const mic = useRef<MediaStream | null>(null);
  const pcs = useRef<RTCPeerConnection[]>([]);
  const ear = useRef<HTMLAudioElement>(null);
  const poll = useRef<number | undefined>(undefined);
  const watchdog = useRef<number | undefined>(undefined);

  useEffect(() => {
    document.title = 'Plateau · Radio Je suis KCCiste';
    prepare();
    const t = window.setInterval(prepare, 20_000);
    return () => window.clearInterval(t);
  }, [prepare]);

  const cleanup = () => {
    window.clearInterval(poll.current);
    window.clearInterval(watchdog.current);
    pcs.current.forEach((pc) => pc.close());
    pcs.current = [];
    mic.current?.getTracks().forEach((t) => t.stop());
    mic.current = null;
    if (ear.current) ear.current.srcObject = null;
  };
  const leave = async () => {
    const x = id.current;
    id.current = null;
    cleanup();
    if (x && supabase) await supabase.rpc('radio_raccrocher', { p_id: x });
    setStep('ended');
  };
  useEffect(() => () => { const x = id.current; cleanup(); if (x && supabase) void supabase.rpc('radio_raccrocher', { p_id: x }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function join() {
    if (!nom.trim()) { setError('Écrivez votre nom.'); return; }
    if (!hostRtc || !supabase) { setError('L’émission n’a pas encore commencé. Réessayez dans un instant.'); return; }
    setError('');
    setStep('connecting');
    stop(); // la radio du site se coupe : sinon on s'entend avec du retard
    try {
      // l'écoute est branchée dans le geste du clic (exigé par les téléphones)
      const earEl = ear.current!;
      const ms = new MediaStream();
      earEl.srcObject = ms;
      void earEl.play().catch(() => {});
      mic.current = await microphone();
      const voice = await publishCaller(mic.current.getAudioTracks()[0]);
      pcs.current.push(voice.pc);
      const { data, error: e } = await supabase.rpc('radio_plateau_rejoindre', { p_jeton: jeton, p_nom: nom.trim(), p_session: voice.sessionId });
      if (e) throw new Error(e.message);
      const r = data as { id: string; siege: number };
      id.current = r.id;
      // Retour du plateau (ce que l'invité entend). Si aucun son n'arrive (la place de l'invité
      // n'était pas encore ouverte chez l'animateur au moment de la connexion), on se reconnecte.
      let back: { pc: RTCPeerConnection; stream: MediaStream } | null = null;
      const listen = async () => {
        const old = back;
        const w = await watchTrack(hostRtc, `plateau${r.siege}`);
        if (!id.current) { w.pc.close(); return; }
        back = w;
        pcs.current.push(w.pc);
        if (old) { old.pc.close(); pcs.current = pcs.current.filter((x) => x !== old.pc); }
        const addAll = () => {
          ms.getTracks().forEach((t) => { if (!w.stream.getTracks().includes(t)) ms.removeTrack(t); });
          w.stream.getTracks().forEach((t) => { if (!ms.getTracks().includes(t)) ms.addTrack(t); });
          void earEl.play().catch(() => {});
        };
        addAll();
        w.pc.addEventListener('track', () => setTimeout(addAll, 0));
      };
      await listen();
      let lastBytes = -1, still = 0, busyListen = false;
      watchdog.current = window.setInterval(async () => {
        if (!back || !id.current || busyListen) return;
        let bytes = 0;
        try { (await back.pc.getStats()).forEach((x) => { if (x.type === 'inbound-rtp' && x.kind === 'audio') bytes += x.bytesReceived ?? 0; }); } catch { return; }
        still = bytes > lastBytes ? 0 : still + 1;
        lastBytes = bytes;
        if (still >= 2) {
          busyListen = true; still = 0; lastBytes = -1;
          try { await listen(); } catch { /* nouvel essai au prochain tour */ } finally { busyListen = false; }
        }
      }, 3000);
      setStep('onair');
      poll.current = window.setInterval(async () => {
        if (!id.current || !supabase) return;
        const { data: st } = await supabase.rpc('radio_appel_statut', { p_id: id.current });
        if (st !== 'antenne') { id.current = null; cleanup(); setStep('ended'); }
      }, 3000);
    } catch (e) {
      cleanup();
      const msg = e instanceof Error ? e.message : '';
      setError(/Permission|NotAllowed|denied/i.test(msg) ? 'Le micro est refusé : autorisez-le puis réessayez.' : msg || 'Connexion impossible. Réessayez.');
      setStep('error');
    }
  }

  useEffect(() => { mic.current?.getAudioTracks().forEach((t) => { t.enabled = !muted; }); }, [muted]);

  const field = 'w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white placeholder:text-white/35 outline-none focus:border-gold/60';
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#070a12] px-5 text-white">
      <audio ref={ear} autoPlay className="hidden" />
      <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-gold font-display text-lg font-bold tracking-wider text-gold">KCC</span>
      <p className="mt-3 font-display text-2xl font-semibold">Plateau · Radio Je suis KCCiste</p>
      <p className="mt-1 text-sm text-white/55">{brouillonRtc ? 'Enregistrement d’une émission (pas encore diffusée)' : liveOn ? liveTitle : 'En attente du début de l’émission…'}</p>
      <div className="mt-6 w-full max-w-sm">
        {!jeton && <p className="rounded-xl bg-red-500/15 px-3 py-2 text-center text-sm text-red-200">Lien incomplet : demandez le lien du plateau à l’animateur.</p>}
        {jeton && (step === 'form' || step === 'error') && (
          <div className="space-y-3">
            <p className="text-center text-sm text-white/65">{brouillonRtc ? 'Vous êtes invité à enregistrer une émission : vous êtes enregistré avec l’animateur, elle passera plus tard à la radio. Mettez des écouteurs.' : 'Vous êtes invité sur le plateau : vous passez directement à l’antenne et tous les auditeurs vous entendent. Mettez des écouteurs.'}</p>
            <input className={field} maxLength={60} placeholder="Votre nom" aria-label="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" />
            {error && <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">{error}</p>}
            <button type="button" onClick={join} disabled={!ready} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 font-semibold text-night disabled:opacity-50"><Mic className="h-5 w-5" />Rejoindre le plateau</button>
          </div>
        )}
        {step === 'connecting' && <p className="flex items-center justify-center gap-2 text-white/70"><Loader2 className="h-5 w-5 animate-spin" />Connexion au plateau…</p>}
        {step === 'onair' && (
          <div className="space-y-5 text-center">
            <div className={`mx-auto grid h-28 w-28 place-items-center rounded-full ${muted ? 'bg-white/10' : 'animate-pulse bg-red-600'}`}>{muted ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}</div>
            <p className="font-display text-xl font-semibold">{muted ? 'Micro coupé' : '🔴 Vous êtes à l’antenne'}</p>
            <p className="text-sm text-white/60">Vous entendez le plateau. Parlez près du micro.</p>
            <div className="flex justify-center gap-2">
              <button type="button" onClick={() => setMuted((m) => !m)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold">{muted ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}{muted ? 'Rallumer' : 'Couper le micro'}</button>
              <button type="button" onClick={() => void leave()} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold"><PhoneOff className="h-4 w-4" />Quitter</button>
            </div>
          </div>
        )}
        {step === 'ended' && <p className="text-center text-white/70">Vous avez quitté le plateau. Merci et paix à vous !</p>}
      </div>
    </div>
  );
}
