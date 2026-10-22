import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, Music2, Pause, Phone, Play, Radio, SkipForward, X } from 'lucide-react';
import { useI18n, type Tri } from '@/i18n';
import { cn } from '@/utils/format';
import { useRadio } from './RadioContext';
import type { RadioItem, RadioMode } from './radio';

export const RADIO_NAME = 'Radio Je suis KCCiste';

export const MODE_LABELS: Record<RadioMode, Tri> = {
  all: { fr: 'Tout', en: 'Everything', pt: 'Tudo' },
  songs: { fr: 'Chants', en: 'Songs', pt: 'Cânticos' },
  sermons: { fr: 'Prédications', en: 'Sermons', pt: 'Pregações' },
};

export function KindIcon({ item, className }: { item: Pick<RadioItem, 'kind'>; className?: string }) {
  const Icon = item.kind === 'live' ? Radio : item.kind === 'sermon' ? Mic : Music2;
  return <Icon className={className} aria-hidden />;
}

/** Pastille rouge « EN DIRECT ». */
export function LiveBadge({ className }: { className?: string }) {
  const { tx } = useI18n();
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white', className)}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />{tx('En direct', 'Live', 'Em direto')}
    </span>
  );
}

/**
 * « Appeler l'émission » pendant un direct. La radio est coupée pendant l'appel :
 * sinon l'auditeur s'entend avec quelques secondes de retard et crée de l'écho.
 */
export function CallShowButton({ className }: { className?: string }) {
  const { tx } = useI18n();
  const { callUrl, stop } = useRadio();
  if (!callUrl) return null;
  return (
    <a href={callUrl} target="_blank" rel="noopener noreferrer" onClick={stop}
      title={tx('La radio se coupe pendant l’appel : vous entendez l’animateur dans l’appel.', 'The radio stops during the call: you hear the host in the call.', 'A rádio para durante a chamada: ouve o animador na chamada.')}
      className={cn('inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500', className)}>
      <Phone className="h-4 w-4" aria-hidden />{tx('Appeler l’émission', 'Call the show', 'Ligar para a emissão')}
    </a>
  );
}

/** Choix « Tout / Chants / Prédications ». */
export function RadioModeChooser({ light, className }: { light?: boolean; className?: string }) {
  const { tx, pick } = useI18n();
  const { mode, modes, setMode } = useRadio();
  if (modes.length < 2) return null;
  return (
    <div role="radiogroup" aria-label={tx('Que voulez-vous écouter ?', 'What do you want to listen to?', 'O que quer ouvir?')} className={cn('inline-flex rounded-full p-1', light ? 'bg-white/10' : 'bg-night/[0.06]', className)}>
      {modes.map((m) => (
        <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
          className={cn('rounded-full px-4 py-1.5 text-sm font-semibold transition', mode === m ? 'bg-gold text-night shadow' : light ? 'text-white/75 hover:text-white' : 'text-ink/70 hover:text-night')}>
          {pick(MODE_LABELS[m])}
        </button>
      ))}
    </div>
  );
}

/** Mini-lecteur flottant : visible sur toutes les pages une fois la radio lancée (sauf sur /radio). */
export function MiniRadioPlayer() {
  const { tx } = useI18n();
  const { pathname } = useLocation();
  const { active, playing, current, toggle, next, stop, time, duration, onLive } = useRadio();
  if (!active || !current || pathname === '/radio') return null;
  const pct = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;
  return (
    <div role="region" aria-label={RADIO_NAME}
      className="fixed inset-x-3 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.4rem)] z-40 overflow-hidden rounded-2xl border border-white/10 bg-night/95 text-white shadow-[0_18px_40px_-12px_rgba(6,12,26,.6)] backdrop-blur-xl lg:inset-x-auto lg:bottom-5 lg:right-5 lg:w-[23rem]">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Link to="/radio" className="flex min-w-0 flex-1 items-center gap-3" aria-label={tx('Ouvrir la radio', 'Open the radio', 'Abrir a rádio')}>
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 text-night">
            <Radio className="h-5 w-5" aria-hidden />
            {playing && <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-500 ring-2 ring-night" aria-hidden />}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 truncate text-[11px] font-semibold uppercase tracking-wider text-gold-300">{onLive ? <LiveBadge /> : RADIO_NAME}</span>
            <span className="block truncate text-sm font-medium">{current.title}</span>
            <span className="block truncate text-xs text-white/55">{current.subtitle}</span>
          </span>
        </Link>
        <button type="button" onClick={toggle} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-night hover:bg-gold-300" aria-label={playing ? tx('Pause', 'Pause', 'Pausa') : tx('Écouter', 'Play', 'Ouvir')}>
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        {!onLive && <button type="button" onClick={next} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-white/10" aria-label={tx('Titre suivant', 'Next track', 'Faixa seguinte')}><SkipForward className="h-4 w-4" /></button>}
        <button type="button" onClick={stop} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label={tx('Fermer la radio', 'Close the radio', 'Fechar a rádio')}><X className="h-4 w-4" /></button>
      </div>
      {!onLive && <div className="h-0.5 bg-white/10" aria-hidden><div className="h-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>}
    </div>
  );
}

/** Bandeau de la page d'accueil : un clic lance la radio. */
export function HomeRadioBlock({ className }: { className?: string }) {
  const { tx } = useI18n();
  const { prepare, start, toggle, active, playing, current, items, ready, liveOn, liveTitle } = useRadio();
  useEffect(() => { prepare(); }, [prepare]);
  if (ready && !items.length && !liveOn) return null;
  return (
    <section className={cn('flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-night to-night-700 p-5 text-white shadow-lift sm:flex-row sm:items-center sm:p-6', className)} aria-labelledby="radio-home-title">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 text-night"><Radio className="h-7 w-7" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <h2 id="radio-home-title" className="flex flex-wrap items-center gap-2 font-display text-xl font-semibold">{RADIO_NAME}{liveOn && <LiveBadge />}</h2>
        <p className="mt-1 truncate text-sm text-white/70">{liveOn && !(active && current?.kind === 'live')
          ? <>{tx('Émission en direct', 'Live show', 'Emissão em direto')} : <span className="font-semibold text-white">{liveTitle}</span></>
          : active && current
          ? <>{tx('En ce moment', 'Now playing', 'Agora')} : <span className="font-semibold text-white">{current.title}</span></>
          : tx('Chants et prédications en continu, comme à la radio.', 'Songs and sermons non-stop, just like the radio.', 'Cânticos e pregações sem parar, como na rádio.')}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => (active ? toggle() : start())} className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-night hover:bg-gold-300">
          {active && playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {active && playing ? tx('Pause', 'Pause', 'Pausa') : liveOn ? tx('Écouter le direct', 'Listen live', 'Ouvir em direto') : tx('Écouter la radio', 'Listen to the radio', 'Ouvir a rádio')}
        </button>
        <CallShowButton />
        <Link to="/radio" className="inline-flex items-center rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">{tx('Voir la radio', 'Open the radio', 'Ver a rádio')}</Link>
      </div>
    </section>
  );
}
