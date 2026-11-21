import { useEffect, useState } from 'react';
import { CalendarClock, ChevronDown, History, Mic, Pause, Play } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { useRadio } from '@/features/radio/RadioContext';
import { SendVocalCard } from '@/features/radio/SendVocalCard';
import { DedicaceForm } from '@/features/radio/DedicaceForm';
import { CallShowButton, RADIO_NAME, ShareRadioButton } from '@/features/radio/RadioUi';

/** Texte WhatsApp (*gras*, _italique_) affiché proprement. */
const plain = (t: string) => t.replace(/[*_~]/g, '').replace(/\n{3,}/g, '\n\n').trim();
const SUMMARY = 220;
const BARS = [0.55, 0.9, 0.4, 1, 0.65, 0.8, 0.35, 0.95, 0.5, 0.75, 0.45, 0.85, 0.6, 1, 0.4, 0.7];

/**
 * Radio Je suis KCCiste, version application : une seule page, comme un direct continu.
 * Écouter, appeler l'émission, envoyer un vocal, lire le sujet. Rien d'autre.
 */
export default function RadioAppPage() {
  const { tx } = useI18n();
  const r = useRadio();
  const { prepare } = r;
  const [vocal, setVocal] = useState(false);
  const [fullTopic, setFullTopic] = useState(false);
  useEffect(() => {
    prepare();
    // la page reste ouverte dans l'application : on regarde chaque minute si une émission commence
    const t = setInterval(prepare, 60_000);
    return () => clearInterval(t);
  }, [prepare]);
  useEffect(() => { document.title = RADIO_NAME; }, []);

  const playing = r.active && r.playing;
  const show = r.liveOn && r.onLive;
  const topic = r.liveOn && r.liveTopic ? plain(r.liveTopic) : '';
  const longTopic = topic.length > SUMMARY + 40;
  const nextProg = r.programmes.filter((p) => new Date(p.startsAt).getTime() > Date.now()).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const play = () => (r.active ? r.toggle() : r.start('all'));

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#070a12] text-white">
      <style>{`
        @keyframes kcc-eq { 0%,100% { transform: scaleY(.18) } 50% { transform: scaleY(1) } }
        @keyframes kcc-wave { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(1.75); opacity: 0 } }
        @keyframes kcc-spin { to { transform: rotate(360deg) } }
        @keyframes kcc-glow { 0%,100% { opacity: .35 } 50% { opacity: .8 } }
        @media (prefers-reduced-motion: reduce) { .kcc-fx { animation: none !important } }
      `}</style>
      {/* lumière de fond */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(60%_50%_at_50%_35%,rgba(232,184,74,.22),transparent_70%)]" aria-hidden />

      <header className="relative flex shrink-0 items-center gap-3 px-5 pb-1 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-gold font-display text-[11px] font-bold tracking-wider text-gold">KCC</span>
        <p className="min-w-0 flex-1 truncate font-display text-lg font-semibold">{RADIO_NAME}</p>
        <a href="/radio/rediffusions" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-gold-300" aria-label="Réécouter les émissions" title="Réécouter les émissions"><History className="h-4 w-4" /></a>
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider', playing || r.liveOn ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70')}>
          <span className={cn('h-2 w-2 rounded-full bg-white', (playing || r.liveOn) && 'kcc-fx animate-pulse')} aria-hidden />{tx('En direct', 'Live', 'Em direto')}
        </span>
      </header>

      <main className="relative mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-evenly overflow-y-auto px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center">
        {/* Disque KCC avec ondes, anneau et égaliseur */}
        <div className="relative grid h-[min(16rem,30dvh,68vw)] w-[min(16rem,30dvh,68vw)] shrink-0 place-items-center">
          {playing && [0, 1, 2].map((i) => (
            <span key={i} className="kcc-fx absolute inset-6 rounded-full border-2 border-gold/60" style={{ animation: `kcc-wave 3s ease-out ${i}s infinite` }} aria-hidden />
          ))}
          <span className={cn('kcc-fx absolute inset-2 rounded-full', playing ? 'opacity-100' : 'opacity-40')}
            style={{ background: 'conic-gradient(from 0deg, transparent 0 40%, rgba(232,184,74,.9) 60%, transparent 80%)', animation: playing ? 'kcc-spin 4s linear infinite' : undefined, mask: 'radial-gradient(circle, transparent 62%, #000 63%)', WebkitMask: 'radial-gradient(circle, transparent 62%, #000 63%)' }} aria-hidden />
          <span className="relative grid h-3/4 w-3/4 place-items-center rounded-full border-[3px] border-gold bg-[radial-gradient(circle_at_35%_30%,#1f2a44,#0b0f1c_70%)] shadow-[0_0_60px_-10px_rgba(232,184,74,.55)]">
            <span className="font-display text-[min(3.75rem,6.5dvh,14vw)] font-bold tracking-wider text-gold">KCC</span>
          </span>
        </div>

        {/* Égaliseur */}
        <div className="flex h-[min(2.5rem,4dvh)] shrink-0 items-end justify-center gap-1" aria-hidden>
          {BARS.map((h, i) => (
            <span key={i} className="kcc-fx w-1.5 origin-bottom rounded-full bg-gradient-to-t from-gold-600 to-gold-300"
              style={{ height: `${h * 100}%`, transform: playing ? undefined : 'scaleY(.12)', animation: playing ? `kcc-eq ${0.7 + (i % 5) * 0.13}s ease-in-out ${(i % 7) * 0.09}s infinite` : undefined }} />
          ))}
        </div>

        <h1 className="font-display text-[clamp(1.15rem,3.2dvh,1.5rem)] font-semibold leading-tight" aria-live="polite">
          {show || (r.liveOn && !r.active) ? r.liveTitle : RADIO_NAME}
        </h1>
        <p className="-mt-[1dvh] text-sm text-white/60">
          {show || (r.liveOn && !r.active)
            ? tx('Émission en direct', 'Live show', 'Emissão em direto')
            : tx('En direct · 24 h/24', 'Live · 24/7', 'Em direto · 24 h/24')}
        </p>

        <button type="button" onClick={play}
          className="grid h-[min(6rem,11dvh)] w-[min(6rem,11dvh)] shrink-0 place-items-center rounded-full bg-gold text-night shadow-[0_14px_40px_-8px_rgba(232,184,74,.75)] transition active:scale-95"
          aria-label={playing ? tx('Pause', 'Pause', 'Pausa') : tx('Écouter le direct', 'Listen live', 'Ouvir em direto')}>
          {playing ? <Pause className="h-[45%] w-[45%]" /> : <Play className="ml-1 h-[45%] w-[45%]" />}
        </button>
        {r.loading && !r.ready && <p className="mt-3 text-sm text-white/55">{tx('Connexion au direct…', 'Connecting…', 'A ligar…')}</p>}
        {r.failed && <p className="mt-3 text-sm text-red-200" role="alert">{tx('Le direct ne passe pas. Vérifiez votre connexion Internet puis réessayez.', 'Cannot reach the stream. Check your connection and try again.', 'O direto não passa. Verifique a ligação e tente de novo.')}</p>}

        {/* Les deux seules actions : appeler, envoyer un vocal */}
        <div className="grid w-full shrink-0 grid-cols-2 gap-3">
          {(r.siteCalls || r.callUrl)
            ? <CallShowButton className="w-full justify-center rounded-2xl py-[min(0.875rem,1.6dvh)] text-base" />
            : (
              <span className="flex flex-col items-center justify-center rounded-2xl border border-white/10 px-2 py-2.5 text-xs text-white/45">
                {tx('Appels ouverts pendant les émissions', 'Calls open during shows', 'Chamadas abertas durante as emissões')}
              </span>
            )}
          <button type="button" onClick={() => setVocal(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gold/50 bg-gold/10 py-[min(0.875rem,1.6dvh)] text-base font-semibold text-gold-300">
            <Mic className="h-5 w-5" aria-hidden />{tx('Envoyer un vocal', 'Send a voice note', 'Enviar voz')}
          </button>
        </div>
        <ShareRadioButton className="shrink-0" />

        {/* Sujet de l'émission, résumé puis en entier */}
        {topic && (
          <section className="w-full shrink-0 rounded-3xl border border-gold/25 bg-white/[0.04] p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">{tx('Sujet de l’émission', 'Today’s topic', 'Tema da emissão')}</p>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-white/90">
              {fullTopic || !longTopic ? topic : `${topic.slice(0, SUMMARY).replace(/\s+\S*$/, '')}…`}
            </p>
            {longTopic && (
              <button type="button" onClick={() => setFullTopic((v) => !v)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-300">
                {fullTopic ? tx('Résumer', 'Show less', 'Resumir') : tx('Lire tout le sujet', 'Read the whole topic', 'Ler tudo')}
                <ChevronDown className={cn('h-4 w-4 transition', fullTopic && 'rotate-180')} aria-hidden />
              </button>
            )}
          </section>
        )}

        {/* Ce qui suit : une seule ligne discrète, en bas */}
        {nextProg && !r.liveOn && (
          <p className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-2xl border border-gold/20 bg-white/[0.04] px-4 py-2 text-left text-sm text-white/70">
            <CalendarClock className="h-4 w-4 shrink-0 text-gold-300" aria-hidden />
            <span className="shrink-0 font-semibold text-gold-300">{tx('À suivre', 'Up next', 'A seguir')} · {new Date(nextProg.startsAt).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Kinshasa', hour: '2-digit', minute: '2-digit' }).replace(':', 'h')}</span>
            <span className="line-clamp-2">{nextProg.title}</span>
          </p>
        )}
      </main>

      <Modal open={vocal} onClose={() => setVocal(false)} title={tx('Envoyer un vocal', 'Send a voice note', 'Enviar voz')}>
        <SendVocalCard className="border-0 p-0 text-ink shadow-none" />
        <DedicaceForm className="mt-6 border-t border-night/10 pt-5" />
      </Modal>
    </div>
  );
}
