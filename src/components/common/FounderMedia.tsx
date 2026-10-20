import { PlayCircle } from 'lucide-react';
import { useI18n } from '@/i18n';
import { YouTubeMoreVideos } from './YouTubeChannel';

/**
 * Archives visuelles : photo du fondateur (archive Reagan MBUMBA)
 * et courte vidéo « KCC : explication et apparition ».
 */
export function FounderMedia() {
  const { tx } = useI18n();
  return (
    <div className="mb-14 grid gap-6 lg:grid-cols-5">
      <figure className="group relative overflow-hidden rounded-3xl bg-night-900 p-2 shadow-lift lg:col-span-2">
        <div className="overflow-hidden rounded-[1.25rem]">
          <img src="/images/fondateur-25-ans.jpg" alt={tx('Photographie d’archive du fondateur à l’âge de 25 ans, au moment des apparitions', 'Archive photograph of the founder aged 25, at the time of the apparitions', 'Fotografia de arquivo do fundador aos 25 anos, na altura das aparições')} width={700} height={795} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        </div>
        <figcaption className="px-3 pb-2 pt-4 text-white">
          <p className="eyebrow text-gold-300">{tx('Archive', 'Archive', 'Arquivo')}</p>
          <p className="mt-2 font-display text-xl font-medium">{tx('À l’âge de 25 ans, au moment des apparitions', 'Aged 25, at the time of the apparitions', 'Aos 25 anos, na altura das aparições')}</p>
          <p className="mt-1 text-xs text-white/50">{tx('Archive Reagan MBUMBA', 'Reagan MBUMBA archive', 'Arquivo Reagan MBUMBA')}</p>
        </figcaption>
      </figure>
      <figure className="flex flex-col overflow-hidden rounded-3xl bg-night-900 p-2 shadow-lift lg:col-span-3">
        <div className="overflow-hidden rounded-[1.25rem] bg-black">
          <video controls playsInline preload="none" poster="/images/kcc-explication-apparition-poster.jpg" className="aspect-video w-full">
            <source src="/videos/kcc-explication-apparition.mp4" type="video/mp4" />
            {tx('Votre navigateur ne peut pas lire cette vidéo.', 'Your browser cannot play this video.', 'O seu navegador não consegue reproduzir este vídeo.')} <a href="/videos/kcc-explication-apparition.mp4">{tx('Télécharger la vidéo', 'Download the video', 'Descarregar o vídeo')}</a>.
          </video>
        </div>
        <figcaption className="flex flex-1 items-start gap-3 px-3 pb-2 pt-4 text-white">
          <PlayCircle className="mt-1 h-6 w-6 shrink-0 text-gold" aria-hidden />
          <div>
            <p className="eyebrow text-gold-300">{tx('Vidéo', 'Video', 'Vídeo')}</p>
            <p className="mt-2 font-display text-xl font-medium">{tx('KCC : explication et apparition', 'KCC: explanation and appearance', 'KCC: explicação e aparição')}</p>
            <p className="mt-1 text-sm text-white/60">{tx('Courte animation sur l’apparition des lettres KCC.', 'Short animation about the appearance of the KCC letters.', 'Curta animação sobre a aparição das letras KCC.')}</p>
          </div>
        </figcaption>
      </figure>
      <YouTubeMoreVideos className="lg:col-span-5" />
    </div>
  );
}
