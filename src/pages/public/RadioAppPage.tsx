import { useEffect, useState } from 'react';
import { ListMusic, Mic, Pause, Phone, Play, Radio, SkipForward, StopCircle } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn, formatDuration } from '@/utils/format';
import { useRadio } from '@/features/radio/RadioContext';
import { SendVocalCard } from '@/features/radio/SendVocalCard';
import { CallShowButton, KindIcon, LiveBadge, RADIO_NAME, RadioModeChooser } from '@/features/radio/RadioUi';

type Tab = 'ecoute' | 'vocal' | 'suite';

/**
 * Radio Je suis KCCiste, version application : uniquement la radio, plein écran,
 * sans le menu ni les autres rubriques du site (ouverte par l'APK des auditeurs).
 */
export default function RadioAppPage() {
  const { tx } = useI18n();
  const r = useRadio();
  const { prepare } = r;
  const [tab, setTab] = useState<Tab>('ecoute');
  useEffect(() => { prepare(); }, [prepare]);
  useEffect(() => { document.title = RADIO_NAME; }, []);
  const pct = r.duration > 0 ? Math.min(100, (r.time / r.duration) * 100) : 0;
  const canCall = Boolean(r.callUrl || r.siteCalls);
  const onAirNow = r.active && r.playing;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[radial-gradient(120%_80%_at_50%_0%,#1d2a4a_0%,#0b0e16_60%)] text-white">
      <header className="flex items-center gap-3 px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-gold font-display text-[11px] font-bold tracking-wider text-gold">KCC</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold leading-tight">{RADIO_NAME}</p>
          <p className="text-xs text-white/55">{tx('Chants, prédications et émissions en direct', 'Songs, sermons and live shows', 'Cânticos, pregações e emissões em direto')}</p>
        </div>
        {r.liveOn && <LiveBadge />}
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-28">
        {tab === 'ecoute' && (
          <>
            {/* Disque central */}
            <section className="mt-6 flex flex-col items-center text-center" aria-live="polite">
              <div className="relative">
                <span className={cn('absolute inset-0 rounded-full bg-gold/25 blur-2xl transition-opacity', onAirNow ? 'opacity-100' : 'opacity-0')} aria-hidden />
                {r.current?.imageUrl
                  ? <img src={r.current.imageUrl} alt="" className={cn('relative h-56 w-56 rounded-full object-cover ring-8 ring-gold/30', onAirNow && !r.onLive && 'animate-[spin_18s_linear_infinite]')} />
                  : (
                    <span className={cn('relative grid h-56 w-56 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-night ring-8 ring-gold/20', onAirNow && 'animate-pulse')}>
                      {r.current ? <KindIcon item={r.current} className="h-20 w-20" /> : <Radio className="h-20 w-20" aria-hidden />}
                    </span>
                  )}
              </div>

              <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-300">
                {r.onLive && <LiveBadge />}
                {r.active ? (r.playing ? tx('À l’antenne', 'On air', 'No ar') : tx('En pause', 'Paused', 'Em pausa')) : tx('Prête à démarrer', 'Ready to start', 'Pronta a começar')}
                {r.liveOn && r.liveListeners !== null && r.liveListeners > 0 && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 normal-case tracking-normal text-white/85">🎧 {r.liveListeners} {tx(r.liveListeners > 1 ? 'auditeurs' : 'auditeur', r.liveListeners > 1 ? 'listeners' : 'listener', r.liveListeners > 1 ? 'ouvintes' : 'ouvinte')}</span>
                )}
              </p>
              <h1 className="mt-2 font-display text-2xl font-semibold leading-tight">{r.current?.title ?? (r.liveOn ? r.liveTitle : RADIO_NAME)}</h1>
              <p className="mt-1 text-sm text-white/60">{r.current?.subtitle ?? (r.liveOn ? tx('Émission en direct', 'Live show', 'Emissão em direto') : tx('Appuyez sur le bouton pour écouter', 'Press the button to listen', 'Carregue no botão para ouvir'))}</p>

              {r.active && !r.onLive && (
                <div className="mt-5 w-full">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gold" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-1.5 flex justify-between text-xs tabular-nums text-white/45"><span>{formatDuration(Math.floor(r.time))}</span><span>{r.duration ? formatDuration(Math.floor(r.duration)) : ''}</span></div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-5">
                {r.active
                  ? <button type="button" onClick={r.stop} className="grid h-12 w-12 place-items-center rounded-full text-white/65 hover:bg-white/10" aria-label={tx('Arrêter', 'Stop', 'Parar')}><StopCircle className="h-6 w-6" /></button>
                  : <span className="h-12 w-12" aria-hidden />}
                <button type="button" onClick={r.toggle} disabled={r.ready && !r.items.length && !r.liveOn}
                  className="grid h-20 w-20 place-items-center rounded-full bg-gold text-night shadow-[0_12px_30px_-8px_rgba(232,184,74,.7)] hover:bg-gold-300 disabled:opacity-50"
                  aria-label={onAirNow ? tx('Pause', 'Pause', 'Pausa') : tx('Écouter', 'Listen', 'Ouvir')}>
                  {onAirNow ? <Pause className="h-9 w-9" /> : <Play className="ml-1 h-9 w-9" />}
                </button>
                {r.active && !r.onLive
                  ? <button type="button" onClick={r.next} className="grid h-12 w-12 place-items-center rounded-full text-white/80 hover:bg-white/10" aria-label={tx('Suivant', 'Next', 'Seguinte')}><SkipForward className="h-6 w-6" /></button>
                  : <span className="h-12 w-12" aria-hidden />}
              </div>
              {r.loading && !r.ready && <p className="mt-3 text-sm text-white/55">{tx('Chargement…', 'Loading…', 'A carregar…')}</p>}
              {!r.onLive && <RadioModeChooser light className="mt-6" />}
            </section>

            {canCall && (
              <section className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-5">
                <p className="flex items-center gap-2 font-semibold"><Phone className="h-5 w-5 text-red-300" aria-hidden />{tx('Intervenez en direct', 'Join the show live', 'Participe em direto')}</p>
                <p className="mt-1 text-sm text-white/75">{tx('Appelez l’émission : vous entendez l’animateur, et quand il vous prend, tous les auditeurs vous entendent.', 'Call the show: you hear the host, and when they take you, every listener hears you.', 'Ligue para a emissão: ouve o animador e, quando ele o atender, todos os ouvintes o ouvem.')}</p>
                <CallShowButton className="mt-4 w-full justify-center py-3 text-base" />
              </section>
            )}

            {r.liveTopic && (
              <section className="mt-6 rounded-3xl border border-gold/30 bg-gold/[0.08] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">{tx('Sujet de l’émission', 'Today’s topic', 'Tema da emissão')}</p>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-white/90">{r.liveTopic}</p>
              </section>
            )}
            {r.liveOn && !r.onLive && r.active && <p className="mt-6 text-center text-sm text-white/60">{tx('Le son du direct est coupé pour le moment : la radio y revient d’elle-même dans quelques minutes.', 'The live sound is cut for now: the radio goes back to it by itself in a few minutes.', 'O som do direto está cortado de momento: a rádio volta a ele sozinha dentro de alguns minutos.')}</p>}
            {r.failed && <p className="mt-6 rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-100" role="alert">{tx('Les titres ne se chargent pas. Vérifiez votre connexion Internet puis appuyez de nouveau sur le bouton.', 'Tracks are not loading. Check your Internet connection and press the button again.', 'As faixas não carregam. Verifique a ligação à Internet e carregue de novo no botão.')}</p>}
          </>
        )}

        {tab === 'vocal' && (
          <section className="mt-4">
            <h2 className="font-display text-xl font-semibold">{tx('Votre voix à l’antenne', 'Your voice on air', 'A sua voz no ar')}</h2>
            <p className="mt-1 text-sm text-white/65">{tx('Enregistrez un vocal : l’animateur l’écoute puis le passe à la radio.', 'Record a voice message: the host listens to it and plays it on the radio.', 'Grave uma mensagem de voz: o animador ouve-a e passa-a na rádio.')}</p>
            <SendVocalCard className="mt-4 text-ink" />
          </section>
        )}

        {tab === 'suite' && (
          <section className="mt-4">
            <h2 className="font-display text-xl font-semibold">{tx('À suivre', 'Up next', 'A seguir')}</h2>
            {r.upcoming.length ? (
              <ol className="mt-4 space-y-3">
                {r.upcoming.map((i) => (
                  <li key={i.key} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-300"><KindIcon item={i} className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block truncate text-sm font-medium">{i.title}</span><span className="block truncate text-xs text-white/55">{i.subtitle}</span></span>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-3 text-sm text-white/60">{tx('La suite s’affiche ici une fois la radio lancée.', 'What comes next appears here once the radio is playing.', 'O que vem a seguir aparece aqui quando a rádio estiver a tocar.')}</p>}
          </section>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[#0b0e16]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label={RADIO_NAME}>
        <div className="mx-auto grid max-w-md grid-cols-3">
          {([
            ['ecoute', Radio, tx('Écouter', 'Listen', 'Ouvir')],
            ['vocal', Mic, tx('Vocal', 'Voice', 'Voz')],
            ['suite', ListMusic, tx('À suivre', 'Up next', 'A seguir')],
          ] as const).map(([id, Icon, label]) => (
            <button key={id} type="button" onClick={() => { setTab(id); window.scrollTo({ top: 0 }); }} aria-current={tab === id ? 'page' : undefined}
              className={cn('flex flex-col items-center gap-1 py-3 text-xs font-semibold', tab === id ? 'text-gold' : 'text-white/55')}>
              <Icon className="h-5 w-5" aria-hidden />{label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
