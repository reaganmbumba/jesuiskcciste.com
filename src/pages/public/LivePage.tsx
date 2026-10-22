import { CalendarClock, Clock, Pencil, PlayCircle, Radio, Smartphone, Video } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { YouTubeMoreVideos } from '@/components/common/YouTubeChannel';
import { useAuth } from '@/features/auth/AuthContext';
import { featuredLivestream, listLivestreams, liveEnd, liveWatchUrl, splitLivestreams, useNow } from '@/features/livestreams/livestreams';
import { LiveSpotlight } from '@/features/livestreams/LivestreamUi';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { can } from '@/lib/permissions';
import { formatDate, formatTime } from '@/utils/format';
import type { Livestream } from '@/types';

const hours = (min: number) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60}` : ''}`);

/** Directs des cultes et des grandes fêtes sur YouTube : lecteur, compte à rebours, programme et rediffusions. */
export default function LivePage() {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const admin = can(profile, 'settings.manage');
  const lives = useAsync(listLivestreams, []);
  const now = useNow(60000);
  const featured = featuredLivestream(lives.data ?? [], now);
  const { upcoming, past } = splitLivestreams(lives.data ?? [], now);
  const next = upcoming.filter((l) => l.id !== featured?.id);

  return (
    <>
      <PageHeader eyebrow={tx('Médias', 'Media', 'Média')} title={tx('Cultes en direct', 'Live services', 'Cultos em direto')}
        description={tx('Suivez en direct les cultes et les grandes fêtes de l’Église sur notre chaîne YouTube, où que vous soyez.', 'Watch the Church’s services and major feasts live on our YouTube channel, wherever you are.', 'Acompanhe em direto os cultos e as grandes festas da Igreja no nosso canal YouTube, onde quer que esteja.')} />

      <section className="container-page py-14">
        <DemoInline>{tx('Démonstration : direct d’exemple. Les vrais directs apparaissent dès que l’administration les programme.', 'Demo: sample live stream. Real live streams appear once the administration schedules them.', 'Demonstração: transmissão de exemplo. As transmissões reais aparecem quando a administração as agendar.')}</DemoInline>

        {admin && (
          <div className="mb-6 flex justify-end">
            <ButtonLink to="/admin/directs" size="sm" icon={<Pencil className="h-4 w-4" />}>{tx('Programmer un direct', 'Schedule a live stream', 'Agendar uma transmissão')}</ButtonLink>
          </div>
        )}

        {lives.error ? <ErrorState error={lives.error} onRetry={lives.reload} /> : lives.loading ? (
          <Skeleton className="h-96 rounded-3xl" />
        ) : featured ? (
          <LiveSpotlight key={featured.id} live={featured} headingId="live-title" />
        ) : (
          <EmptyState icon={<Radio className="h-6 w-6" aria-hidden />} title={tx('Aucun direct programmé pour le moment.', 'No live stream scheduled yet.', 'Ainda não há transmissões agendadas.')}
            description={tx('Abonnez-vous à la chaîne YouTube et activez la cloche : vous serez prévenu dès le prochain culte en direct.', 'Subscribe to the YouTube channel and turn on the bell: you will be notified of the next live service.', 'Subscreva o canal YouTube e ative o sino: será avisado da próxima transmissão em direto.')} />
        )}

        {next.length > 0 && (
          <section className="mt-12" aria-labelledby="next-lives">
            <h2 id="next-lives" className="mb-4 font-display text-2xl font-medium text-night">{tx('Prochains directs', 'Upcoming live streams', 'Próximas transmissões')}</h2>
            <ul className="space-y-3">{next.map((l) => <LiveRow key={l.id} l={l} />)}</ul>
          </section>
        )}

        <HowToWatch />

        {past.length > 0 && (
          <section className="mt-12" aria-labelledby="past-lives">
            <h2 id="past-lives" className="mb-4 font-display text-2xl font-medium text-night">{tx('Rediffusions', 'Replays', 'Retransmissões')}</h2>
            <ul className="space-y-3">{past.slice(0, 20).map((l) => <LiveRow key={l.id} l={l} past />)}</ul>
          </section>
        )}

        <YouTubeMoreVideos className="mt-12" />
      </section>
    </>
  );
}

function LiveRow({ l, past = false }: { l: Livestream; past?: boolean }) {
  const { tx, locale } = useI18n();
  return (
    <li className={`flex flex-col gap-4 rounded-3xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5 ${l.isCancelled ? 'border-dashed border-night/20' : 'border-night/[0.06]'}`}>
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-night text-white">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-300">{formatDate(l.startsAt, locale, { month: 'short' })}</span>
        <span className="font-display text-2xl font-semibold leading-none">{formatDate(l.startsAt, locale, { day: 'numeric' })}</span>
      </div>
      <div className="min-w-0 flex-1">
        {l.isCancelled && <Badge tone="red">{tx('Annulé', 'Cancelled', 'Cancelado')}</Badge>}
        <h3 className={`font-display text-lg font-semibold leading-snug text-night ${l.isCancelled ? 'mt-1 line-through decoration-night/30' : ''}`}>{l.title}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/65">
          <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-gold-700" aria-hidden />{formatDate(l.startsAt, locale, { weekday: 'long', day: 'numeric', month: 'long', year: past ? 'numeric' : undefined })} · {formatTime(l.startsAt, locale)} – {formatTime(liveEnd(l).toISOString(), locale)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold-700" aria-hidden />{hours(l.durationMinutes)}</span>
        </p>
      </div>
      {!l.isCancelled && (past ? l.youtubeId : true) && (
        <a href={liveWatchUrl(l)} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-night/10 px-4 py-2.5 text-sm font-semibold text-night transition hover:border-gold/50 hover:bg-gold-50">
          <PlayCircle className="h-4 w-4 text-[#FF0000]" aria-hidden />{past ? tx('Revoir', 'Watch again', 'Rever') : tx('Sur YouTube', 'On YouTube', 'No YouTube')}
        </a>
      )}
    </li>
  );
}

function HowToWatch() {
  const { tx } = useI18n();
  const steps = [
    { icon: Video, title: tx('Ici, sur le site', 'Here, on the site', 'Aqui, no site'), text: tx('À l’heure du culte, la vidéo apparaît sur cette page et sur la page d’accueil. Pas besoin de compte.', 'At service time, the video appears on this page and on the home page. No account needed.', 'À hora do culto, o vídeo aparece nesta página e na página inicial. Não precisa de conta.') },
    { icon: Smartphone, title: tx('Sur téléphone', 'On a phone', 'No telemóvel'), text: tx('Le bouton « Regarder sur YouTube » ouvre l’application YouTube, pratique pour le plein écran ou la télévision.', 'The “Watch on YouTube” button opens the YouTube app, handy for full screen or the TV.', 'O botão «Ver no YouTube» abre a aplicação YouTube, prática para o ecrã inteiro ou a televisão.') },
    { icon: Radio, title: tx('Être prévenu', 'Get notified', 'Ser avisado'), text: tx('Abonnez-vous à la chaîne et activez la cloche : YouTube vous prévient quand le direct commence.', 'Subscribe to the channel and turn on the bell: YouTube tells you when the live stream starts.', 'Subscreva o canal e ative o sino: o YouTube avisa quando a transmissão começa.') },
  ];
  return (
    <section className="mt-12 rounded-3xl bg-mist p-6 sm:p-8" aria-labelledby="how-live">
      <h2 id="how-live" className="font-display text-xl font-semibold text-night">{tx('Comment suivre le direct ?', 'How to watch live?', 'Como acompanhar a transmissão?')}</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, k) => (
          <li key={k} className="rounded-2xl bg-white p-5 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700"><Icon className="h-5 w-5" aria-hidden /></span>
            <h3 className="mt-3 font-semibold text-night">{title}</h3>
            <p className="mt-1 text-sm text-ink/65">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
