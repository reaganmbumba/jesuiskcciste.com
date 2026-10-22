import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Play } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { YOUTUBE_CHANNEL_NAME, YOUTUBE_VIDEOS, youtubeChannelUrl, youtubeSubscribeUrl, youtubeWatchUrl, type YouTubeVideo } from '@/config/youtube';
import { ShareButtons } from '@/components/common/ShareButtons';
import { toVideo, useSiteContent } from '@/features/content/siteContent';

/** Vidéos mises en avant (gérées dans l'administration, « Contenu du site »). */
export const useYouTubeVideos = (): YouTubeVideo[] => useSiteContent('videos', toVideo, YOUTUBE_VIDEOS) ?? [];

export function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" className={className} aria-hidden>
      <path fill="#FF0000" d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5C5.3 20 14 20 14 20s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5c.6-2.2.6-6.9.6-6.9s0-4.7-.6-6.9Z" />
      <path fill="#fff" d="m11.2 14.3 7.3-4.3-7.3-4.3v8.6Z" />
    </svg>
  );
}

/** Bouton rouge « S'abonner » vers la chaîne YouTube. */
export function YouTubeSubscribeButton({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' }) {
  const { tx } = useI18n();
  return (
    <a
      href={youtubeSubscribeUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF0000] font-semibold text-white shadow-soft transition hover:bg-[#cc0000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF0000]', size === 'sm' ? 'px-3.5 py-2 text-sm' : 'px-5 py-3 text-[15px]', className)}
    >
      <svg viewBox="0 0 24 24" className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden><path fill="currentColor" d="M8 5.1v13.8L19 12 8 5.1Z" /></svg>
      {tx('S’abonner à la chaîne', 'Subscribe to the channel', 'Subscrever o canal')}
    </a>
  );
}

/** Lecteur léger : la vignette s'affiche d'abord, YouTube n'est chargé qu'au clic (plus rapide, sans cookies). */
export function YouTubeEmbed({ video, className }: { video: YouTubeVideo; className?: string }) {
  const { tx, pick } = useI18n();
  const [playing, setPlaying] = useState(false);
  const title = pick(video.title);
  return (
    <figure className={cn('overflow-hidden rounded-2xl bg-night-900 shadow-lift', className)}>
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`${tx('Lire la vidéo', 'Play the video', 'Reproduzir o vídeo')} : ${title}`}>
            <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />
            <span className="absolute inset-0 grid place-items-center">
              <YouTubeIcon className="h-12 w-16 drop-shadow-lg transition group-hover:scale-110" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="px-4 py-3 text-white">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium leading-snug">{title}</p>
          <a href={youtubeWatchUrl(video.id)} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs text-white/60 hover:text-white">
            YouTube <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
        <ShareButtons tone="dark" size="sm" showLabel={false} url={youtubeWatchUrl(video.id)} title={title} image={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} className="mt-3" />
      </figcaption>
    </figure>
  );
}

/** Bandeau complet de la chaîne : présentation, bouton d'abonnement et vidéos. */
export function YouTubeChannelSection({ showPageLink = false, limit }: { showPageLink?: boolean; limit?: number }) {
  const { tx } = useI18n();
  const videos = useYouTubeVideos();
  return (
    <section className="relative isolate overflow-hidden bg-night-950 py-20 text-white sm:py-24" aria-labelledby="yt-title">
      <div className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-[#FF0000]/20 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 mask-radial" aria-hidden />
      <div className="container-page">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3 flex items-center gap-2 text-gold-300"><YouTubeIcon className="h-4 w-6" /> {tx('Notre chaîne YouTube', 'Our YouTube channel', 'O nosso canal YouTube')}</p>
            <h2 id="yt-title" className="font-display text-[2rem] font-medium leading-[1.1] sm:text-[2.6rem]">{YOUTUBE_CHANNEL_NAME}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70 sm:text-base">{tx('Chants, enseignements et moments de la communauté en vidéo. Abonnez-vous et activez la cloche pour ne rien manquer, puis partagez les vidéos autour de vous.', 'Songs, teachings and community moments on video. Subscribe and turn on the bell so you never miss a thing, then share the videos with others.', 'Cânticos, ensinamentos e momentos da comunidade em vídeo. Subscreva e ative o sino para não perder nada, e partilhe os vídeos com os outros.')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <YouTubeSubscribeButton />
            <a href={youtubeChannelUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10">
              {tx('Voir toutes les vidéos', 'See all videos', 'Ver todos os vídeos')} <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, limit).map((v) => <YouTubeEmbed key={v.id} video={v} />)}
        </div>
        {showPageLink && (
          <p className="mt-8 text-center">
            <Link to="/videos" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-300 hover:underline"><Play className="h-4 w-4" aria-hidden />{tx('Toutes les vidéos sur le site', 'All videos on the site', 'Todos os vídeos no site')} →</Link>
          </p>
        )}
      </div>
    </section>
  );
}

/** Petit encart à placer sous une vidéo hébergée sur le site. */
export function YouTubeMoreVideos({ className }: { className?: string }) {
  const { tx } = useI18n();
  return (
    <div className={cn('flex flex-col items-start gap-3 rounded-2xl border border-[#FF0000]/20 bg-[#FF0000]/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="flex items-center gap-3 text-sm text-ink/75">
        <YouTubeIcon className="h-5 w-7 shrink-0" />
        <span>{tx('Plus de vidéos sur notre chaîne YouTube', 'More videos on our YouTube channel', 'Mais vídeos no nosso canal YouTube')} <strong className="text-night">{YOUTUBE_CHANNEL_NAME}</strong></span>
      </p>
      <YouTubeSubscribeButton size="sm" />
    </div>
  );
}
