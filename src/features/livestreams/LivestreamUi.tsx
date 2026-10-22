import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, CalendarClock, ExternalLink, Radio } from 'lucide-react';
import { ShareButtons } from '@/components/common/ShareButtons';
import { YouTubeIcon, YouTubeSubscribeButton } from '@/components/common/YouTubeChannel';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { cn, formatDate, formatTime } from '@/utils/format';
import type { Livestream } from '@/types';
import { countdownParts, featuredLivestream, liveEmbedUrl, liveEnd, listLivestreams, liveStatus, liveWatchUrl, useNow } from './livestreams';

const SITE_LIVE_URL = 'https://jesuiskcciste.com/direct';

/** Point rouge qui clignote + « En direct ». */
export function LiveBadge({ className }: { className?: string }) {
  const { tx } = useI18n();
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-[#FF0000] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white', className)}>
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      {tx('En direct', 'Live', 'Em direto')}
    </span>
  );
}

/** Compte à rebours jusqu'au début du direct. */
export function Countdown({ startsAt, now }: { startsAt: string; now: Date }) {
  const { tx } = useI18n();
  const { days, hours, minutes, seconds } = countdownParts(startsAt, now);
  const units = [
    { v: days, l: tx('jours', 'days', 'dias') },
    { v: hours, l: tx('heures', 'hours', 'horas') },
    { v: minutes, l: tx('min', 'min', 'min') },
    { v: seconds, l: tx('sec', 'sec', 'seg') },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-label={tx(`Début dans ${days} jours, ${hours} heures et ${minutes} minutes`, `Starts in ${days} days, ${hours} hours and ${minutes} minutes`, `Começa em ${days} dias, ${hours} horas e ${minutes} minutos`)}>
      {units.map(({ v, l }) => (
        <div key={l} className="rounded-2xl bg-white/10 px-1 py-3 text-center ring-1 ring-inset ring-white/15">
          <span className="block font-display text-3xl font-semibold tabular-nums leading-none text-white sm:text-4xl" aria-hidden>{String(v).padStart(2, '0')}</span>
          <span className="mt-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gold-300" aria-hidden>{l}</span>
        </div>
      ))}
    </div>
  );
}

/** Lecteur YouTube du direct (ou de la rediffusion). */
export function LivePlayer({ live, className }: { live: Livestream; className?: string }) {
  return (
    <div className={cn('relative aspect-video overflow-hidden rounded-2xl bg-black shadow-lift', className)}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={liveEmbedUrl(live)}
        title={live.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

/**
 * Grand bloc sombre : le lecteur pendant le direct, sinon le compte à rebours.
 * Il bascule tout seul à l'heure du début.
 */
export function LiveSpotlight({ live, headingId, showPageLink = false }: { live: Livestream; headingId?: string; showPageLink?: boolean }) {
  const { tx, locale } = useI18n();
  const now = useNow(1000);
  const status = liveStatus(live, now);
  const isLive = status === 'live';
  // Après la fin : la rediffusion (ou le direct de la chaîne) reste dans le lecteur.
  const showPlayer = isLive || status === 'ended';
  const when = `${formatDate(live.startsAt, locale, { weekday: 'long', day: 'numeric', month: 'long' })} · ${formatTime(live.startsAt, locale)} – ${formatTime(liveEnd(live).toISOString(), locale)}`;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-night-950 p-5 text-white shadow-lift sm:p-7" aria-labelledby={headingId}>
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-[#FF0000]/25 blur-[100px]" aria-hidden />
      <div className="flex flex-wrap items-center gap-2">
        {isLive ? <LiveBadge /> : status === 'ended' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-300">{tx('Rediffusion', 'Replay', 'Retransmissão')}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-300">
            <Radio className="h-3.5 w-3.5" aria-hidden />{tx('Prochain direct', 'Next live stream', 'Próxima transmissão')}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs text-white/60"><YouTubeIcon className="h-3.5 w-5" /> YouTube</span>
      </div>
      <h2 id={headingId} className="mt-3 font-display text-2xl font-medium leading-tight sm:text-3xl">{live.title}</h2>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/70"><CalendarClock className="h-4 w-4 shrink-0 text-gold-300" aria-hidden />{when}</p>

      {showPlayer ? (
        <LivePlayer live={live} className="mt-5" />
      ) : (
        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-white/80">{tx('Le direct commence dans', 'The live stream starts in', 'A transmissão começa em')}</p>
          <Countdown startsAt={live.startsAt} now={now} />
        </div>
      )}

      {live.description && <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-white/75">{live.description}</p>}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <a href={liveWatchUrl(live)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
          {showPlayer ? <><ExternalLink className="h-4 w-4" aria-hidden />{tx('Regarder sur YouTube', 'Watch on YouTube', 'Ver no YouTube')}</>
            : live.youtubeId ? <><BellRing className="h-4 w-4" aria-hidden />{tx('Me le rappeler sur YouTube', 'Remind me on YouTube', 'Lembrar-me no YouTube')}</>
            : <><ExternalLink className="h-4 w-4" aria-hidden />{tx('Ouvrir la chaîne', 'Open the channel', 'Abrir o canal')}</>}
        </a>
        <YouTubeSubscribeButton size="sm" />
        {showPageLink && (
          <Link to="/direct" className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-gold-300 hover:underline sm:ml-auto">
            {tx('Tous les directs', 'All live streams', 'Todas as transmissões')} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
      <ShareButtons tone="dark" size="sm" showLabel={false} url={SITE_LIVE_URL} title={isLive ? tx(`En direct : ${live.title}`, `Live now: ${live.title}`, `Em direto: ${live.title}`) : `${live.title} · ${when}`} className="mt-4" />
    </section>
  );
}

/** Bloc de la page d'accueil : n'apparaît que s'il y a un direct en cours ou programmé. */
export function HomeLiveBlock({ className }: { className?: string }) {
  const lives = useAsync(() => listLivestreams().catch(() => []), []);
  // Recalcule chaque minute : un direct terminé disparaît, le suivant prend sa place.
  const now = useNow(60000);
  const live = featuredLivestream(lives.data ?? [], now);
  if (!live) return null;
  return (
    <div className={className}>
      <LiveSpotlight key={live.id} live={live} headingId="live-title" showPageLink />
    </div>
  );
}
