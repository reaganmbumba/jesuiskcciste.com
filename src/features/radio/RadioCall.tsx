import { useEffect, useRef, useState } from 'react';
import { Mic, PhoneOff, Phone, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/format';
import { useRadio } from './RadioContext';
import { microphone, publishCaller, watchTrack } from './rtc';

type Step = 'form' | 'connecting' | 'waiting' | 'onair' | 'ended' | 'error';
const POLL_MS = 2000;

/**
 * Un auditeur appelle l'émission depuis le site : sa voix part au relais, son appel
 * attend dans la file de l'animateur. Pendant l'appel, il entend le « retour »
 * (l'animateur sans sa propre voix) ; quand l'animateur le prend, tout le monde l'entend.
 */
export function RadioCallDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tx } = useI18n();
  const { liveRtc, liveTitle, stop } = useRadio();
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [nom, setNom] = useState('');
  const [ville, setVille] = useState('');
  const callId = useRef<string | null>(null);
  const mic = useRef<MediaStream | null>(null);
  const pcs = useRef<RTCPeerConnection[]>([]);
  const ear = useRef<HTMLAudioElement>(null);
  const poll = useRef<number | undefined>(undefined);

  const cleanup = () => {
    window.clearInterval(poll.current);
    pcs.current.forEach((pc) => pc.close());
    pcs.current = [];
    mic.current?.getTracks().forEach((t) => t.stop());
    mic.current = null;
    if (ear.current) ear.current.srcObject = null;
  };

  const hangUp = async () => {
    const id = callId.current;
    callId.current = null;
    cleanup();
    if (id && supabase) await supabase.rpc('radio_raccrocher', { p_id: id });
  };

  useEffect(() => () => { void hangUp(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => { void hangUp(); setStep('form'); setError(''); onClose(); };

  async function call() {
    if (!nom.trim()) { setError(tx('Écrivez votre prénom ou votre nom.', 'Enter your name.', 'Escreva o seu nome.')); return; }
    if (!liveRtc || !supabase) { setError(tx('L’émission n’est pas en direct pour le moment.', 'The show is not live right now.', 'A emissão não está em direto de momento.')); return; }
    setError('');
    setStep('connecting');
    stop(); // la radio se coupe : sinon l'auditeur s'entend avec du retard
    try {
      mic.current = await microphone();
      // On entend l'animateur tout de suite (le retour), dans le geste du clic.
      const earEl = ear.current!;
      const ms = new MediaStream();
      earEl.srcObject = ms;
      void earEl.play().catch(() => {});
      const back = await watchTrack(liveRtc, 'retour');
      pcs.current.push(back.pc);
      const addAll = () => back.stream.getTracks().forEach((t) => { if (!ms.getTracks().includes(t)) ms.addTrack(t); });
      addAll();
      back.pc.addEventListener('track', () => setTimeout(addAll, 0));
      const voice = await publishCaller(mic.current.getAudioTracks()[0]);
      pcs.current.push(voice.pc);
      const { data, error: e } = await supabase.rpc('radio_appeler', { p_nom: nom.trim(), p_ville: ville.trim(), p_session: voice.sessionId });
      if (e) throw new Error(e.message);
      callId.current = String(data);
      setStep('waiting');
      poll.current = window.setInterval(async () => {
        if (!callId.current || !supabase) return;
        const { data: st } = await supabase.rpc('radio_appel_statut', { p_id: callId.current });
        if (st === 'antenne') setStep('onair');
        else if (st === 'attente') setStep('waiting');
        else { callId.current = null; cleanup(); setStep('ended'); }
      }, POLL_MS);
    } catch (e) {
      cleanup();
      const msg = e instanceof Error ? e.message : '';
      setError(/Permission|NotAllowed|denied/i.test(msg)
        ? tx('Le micro est refusé : autorisez-le dans votre navigateur puis réessayez.', 'Microphone blocked: allow it in your browser and try again.', 'Microfone bloqueado: autorize-o no navegador e tente de novo.')
        : msg || tx('L’appel n’a pas pu partir. Réessayez.', 'The call could not start. Try again.', 'A chamada não pôde começar. Tente de novo.'));
      setStep('error');
    }
  }

  return (
    <Modal open={open} onClose={close} title={tx('Appeler l’émission', 'Call the show', 'Ligar para a emissão')}>
      <audio ref={ear} autoPlay className="hidden" />
      {(step === 'form' || step === 'error') && (
        <div className="space-y-4">
          <p className="text-sm text-ink/70">{tx(`Vous allez parler en direct dans « ${liveTitle} ». Votre appel attend d’abord dans la file de l’animateur ; quand il le prend, tous les auditeurs vous entendent.`, `You are about to speak live on “${liveTitle}”. Your call first waits in the host’s queue; when they take it, every listener hears you.`, `Vai falar em direto em «${liveTitle}». A sua chamada espera primeiro na fila do animador; quando ele a atender, todos os ouvintes o ouvem.`)}</p>
          <label className="block text-sm font-semibold text-night">{tx('Votre prénom ou nom', 'Your name', 'O seu nome')}
            <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={60} className="mt-1 w-full rounded-xl border border-night/15 px-3 py-2.5 font-normal" autoComplete="given-name" />
          </label>
          <label className="block text-sm font-semibold text-night">{tx('Votre ville (facultatif)', 'Your city (optional)', 'A sua cidade (opcional)')}
            <input value={ville} onChange={(e) => setVille(e.target.value)} maxLength={60} className="mt-1 w-full rounded-xl border border-night/15 px-3 py-2.5 font-normal" autoComplete="address-level2" />
          </label>
          <p className="text-xs text-ink/55">{tx('Utilisez des écouteurs si possible, et éteignez la radio sur vos autres appareils pour éviter l’écho.', 'Use earphones if possible, and turn off the radio on your other devices to avoid echo.', 'Use auriculares se possível e desligue a rádio nos outros aparelhos para evitar eco.')}</p>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <button type="button" onClick={call} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500">
            <Phone className="h-5 w-5" />{tx('Appeler', 'Call', 'Ligar')}
          </button>
        </div>
      )}
      {(step === 'connecting' || step === 'waiting' || step === 'onair') && (
        <div className="space-y-5 text-center">
          <div className={cn('mx-auto grid h-24 w-24 place-items-center rounded-full', step === 'onair' ? 'animate-pulse bg-red-600 text-white' : 'bg-gold/20 text-gold-700')}>
            {step === 'connecting' ? <Loader2 className="h-10 w-10 animate-spin" /> : <Mic className="h-10 w-10" />}
          </div>
          <p className="font-display text-xl font-semibold text-night" aria-live="polite">
            {step === 'connecting' ? tx('Connexion…', 'Connecting…', 'A ligar…')
              : step === 'waiting' ? tx('Vous êtes en attente', 'You are on hold', 'Está em espera')
                : tx('🔴 Vous êtes à l’antenne : parlez !', '🔴 You are on air: speak!', '🔴 Está no ar: fale!')}
          </p>
          <p className="text-sm text-ink/65">
            {step === 'onair'
              ? tx('Tous les auditeurs vous entendent. Parlez calmement, près du micro.', 'Every listener hears you. Speak calmly, close to the microphone.', 'Todos os ouvintes o ouvem. Fale com calma, perto do microfone.')
              : tx('Vous entendez l’émission. Restez sur cette page : l’animateur va vous prendre à l’antenne.', 'You can hear the show. Stay on this page: the host will put you on air.', 'Ouve a emissão. Fique nesta página: o animador vai pô-lo no ar.')}
          </p>
          <button type="button" onClick={close} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-700 hover:bg-red-50">
            <PhoneOff className="h-4 w-4" />{tx('Raccrocher', 'Hang up', 'Desligar')}
          </button>
        </div>
      )}
      {step === 'ended' && (
        <div className="space-y-4 text-center">
          <p className="font-display text-xl font-semibold text-night">{tx('Appel terminé', 'Call ended', 'Chamada terminada')}</p>
          <p className="text-sm text-ink/65">{tx('Merci pour votre intervention. Paix à vous !', 'Thank you for calling in. Peace be with you!', 'Obrigado pela sua intervenção. Paz convosco!')}</p>
          <button type="button" onClick={close} className="rounded-xl bg-gold px-4 py-2.5 font-semibold text-night">{tx('Fermer', 'Close', 'Fechar')}</button>
        </div>
      )}
    </Modal>
  );
}
