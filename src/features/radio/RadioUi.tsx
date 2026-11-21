import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Mic, Music2, Newspaper, Pause, Phone, Play, Radio, X } from 'lucide-react';
import { PUBLIC_SITE_URL } from '@/config/site';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { useRadio } from './RadioContext';
import { RadioCallDialog } from './RadioCall';
import { useRadioListeners } from './listeners';
import type { RadioItem } from './radio';

export const RADIO_NAME = 'Radio Je suis KCCiste';
// « ?ecouter » : nouvelle adresse pour WhatsApp, qui garde longtemps l’ancien aperçu de /radio
export const RADIO_URL = `${PUBLIC_SITE_URL}/radio?ecouter`;

/**
 * « Inviter quelqu'un à écouter » : partage du lien de la radio sans jamais quitter la page,
 * pour que la radio continue de jouer (feuille de partage du téléphone, ou WhatsApp /
 * Facebook dans une nouvelle fenêtre, ou lien copié).
 */
type Tx = (fr: string, en: string, pt: string) => string;
const at = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Kinshasa', hour: '2-digit', minute: '2-digit' }).replace(':', 'h');

/** Le message partagé nomme ce qu'on écoute en ce moment, et l'émission suivante. */
export function shareRadioText(tx: Tx, current: Pick<RadioItem, 'kind' | 'title' | 'subtitle'> | null, onLive: boolean, programmes: { title: string; startsAt: string }[] = [], now = Date.now()): string {
  const by = current?.subtitle ? ` (${current.subtitle})` : '';
  const now1 = !current ? tx(`J’écoute ${RADIO_NAME}.`, `I’m listening to ${RADIO_NAME}.`, `Estou a ouvir a ${RADIO_NAME}.`)
    : onLive ? tx(`J’écoute l’émission « ${current.title} » en ce moment sur ${RADIO_NAME}.`, `I’m listening to “${current.title}” right now on ${RADIO_NAME}.`, `Estou a ouvir «${current.title}» agora na ${RADIO_NAME}.`)
    : current.kind === 'sermon' ? tx(`J’écoute la prédication « ${current.title} »${by} sur ${RADIO_NAME}.`, `I’m listening to the sermon “${current.title}”${by} on ${RADIO_NAME}.`, `Estou a ouvir a pregação «${current.title}»${by} na ${RADIO_NAME}.`)
    : current.kind === 'song' ? tx(`J’écoute le chant « ${current.title} »${by} sur ${RADIO_NAME}.`, `I’m listening to “${current.title}”${by} on ${RADIO_NAME}.`, `Estou a ouvir «${current.title}»${by} na ${RADIO_NAME}.`)
    : tx(`J’écoute « ${current.title} » sur ${RADIO_NAME}.`, `I’m listening to “${current.title}” on ${RADIO_NAME}.`, `Estou a ouvir «${current.title}» na ${RADIO_NAME}.`);
  const next = programmes.filter((p) => new Date(p.startsAt).getTime() > now && (!onLive || p.title !== current?.title)).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const then = next ? ' ' + tx(`Prochaine émission : « ${next.title} » à ${at(next.startsAt)}.`, `Next show: “${next.title}” at ${at(next.startsAt)}.`, `Próxima emissão: «${next.title}» às ${at(next.startsAt)}.`) : '';
  return `${now1}${then} ${tx('Écoutez avec moi, c’est gratuit :', 'Listen with me, it’s free:', 'Ouça comigo, é grátis:')}`;
}

export function ShareRadioButton({ className, compact }: { className?: string; compact?: boolean }) {
  const { tx } = useI18n();
  const { current, onLive, active, programmes } = useRadio();
  const text = shareRadioText(tx, active ? current : null, onLive, programmes);
  // Nouvelle fenêtre : la page de la radio reste ouverte et continue de jouer.
  const links = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${text} ${RADIO_URL}`)}`, icon: <MessageCircle className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />, color: 'bg-[#25D366] text-white hover:bg-[#1ebe5b]' },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(RADIO_URL)}&quote=${encodeURIComponent(text)}`, icon: <span className={cn('font-bold leading-none', compact ? 'text-sm' : 'text-lg')} aria-hidden>f</span>, color: 'bg-[#1877F2] text-white hover:bg-[#0f63d6]' },
  ];
  if (compact) {
    return (
      <>
        {links.map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={tx(`Partager la radio sur ${l.name}`, `Share the radio on ${l.name}`, `Partilhar a rádio no ${l.name}`)}
            className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full', l.color)}>{l.icon}</a>
        ))}
      </>
    );
  }
  return (
    <div className={cn('flex gap-2', className?.includes('w-full') ? 'w-full' : '', className)}>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer"
          className={cn('inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold', className?.includes('rounded-2xl') && 'rounded-2xl', l.color)}>
          {l.icon}{tx(`Partager sur ${l.name}`, `Share on ${l.name}`, `Partilhar no ${l.name}`)}
        </a>
      ))}
    </div>
  );
}

export function KindIcon({ item, className }: { item: Pick<RadioItem, 'kind'>; className?: string }) {
  const Icon = item.kind === 'live' ? Radio : item.kind === 'sermon' ? Mic : item.kind === 'news' ? Newspaper : item.kind === 'vocal' ? MessageCircle : Music2;
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
 * « 🎧 23 auditeurs en direct » : nombre de personnes qui écoutent la radio en ce moment,
 * mis à jour en temps réel. Réservé à l'administration (pas affiché aux auditeurs).
 * Caché tant que le nombre est inconnu.
 */
export function ListenerCount({ light = true, compact, className }: { light?: boolean; compact?: boolean; className?: string }) {
  const { tx } = useI18n();
  const c = useRadioListeners();
  if (!c) return null;
  const n = c.total;
  const many = n !== 1;
  const label = tx(many ? 'auditeurs en direct' : 'auditeur en direct', many ? 'listening live' : 'listening live', many ? 'ouvintes em direto' : 'ouvinte em direto');
  return (
    <span title={`${n} ${label}`} aria-label={`${n} ${label}`}
      className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold normal-case tracking-normal tabular-nums', light ? 'bg-white/10 text-white/90' : 'bg-night/[0.06] text-night', className)}>
      <span className="relative flex h-2 w-2" aria-hidden><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" /></span>
      🎧 {n}{compact ? '' : ` ${label}`}
    </span>
  );
}

/**
 * « Appeler l'émission » pendant un direct. La radio est coupée pendant l'appel :
 * sinon l'auditeur s'entend avec quelques secondes de retard et crée de l'écho.
 */
export function CallShowButton({ className }: { className?: string }) {
  const { tx } = useI18n();
  const { callUrl, siteCalls, stop } = useRadio();
  const [open, setOpen] = useState(false);
  if (siteCalls) {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}
          className={cn('inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500', className)}>
          <Phone className="h-4 w-4" aria-hidden />{tx('Appeler l’émission', 'Call the show', 'Ligar para a emissão')}
        </button>
        {open && <RadioCallDialog open={open} onClose={() => setOpen(false)} />}
      </>
    );
  }
  if (!callUrl) return null;
  return (
    <a href={callUrl} target="_blank" rel="noopener noreferrer" onClick={stop}
      title={tx('La radio se coupe pendant l’appel : vous entendez l’animateur dans l’appel.', 'The radio stops during the call: you hear the host in the call.', 'A rádio para durante a chamada: ouve o animador na chamada.')}
      className={cn('inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500', className)}>
      <Phone className="h-4 w-4" aria-hidden />{tx('Appeler l’émission', 'Call the show', 'Ligar para a emissão')}
    </a>
  );
}

/** Mini-lecteur flottant : visible sur toutes les pages une fois la radio lancée (sauf sur /radio). */
export function MiniRadioPlayer() {
  const { tx } = useI18n();
  const { pathname } = useLocation();
  const { active, playing, current, toggle, stop, time, duration, onLive } = useRadio();
  if (!active || !current || pathname.startsWith('/radio')) return null;
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
        <ShareRadioButton compact />
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
