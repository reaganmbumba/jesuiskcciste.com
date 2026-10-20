import { PlayCircle } from 'lucide-react';

/**
 * Archives visuelles : photo du fondateur (archive Reagan MBUMBA)
 * et courte vidéo « KCC : explication et apparition ».
 */
export function FounderMedia() {
  return (
    <div className="mb-14 grid gap-6 lg:grid-cols-5">
      <figure className="group relative overflow-hidden rounded-3xl bg-night-900 p-2 shadow-lift lg:col-span-2">
        <div className="overflow-hidden rounded-[1.25rem]">
          <img src="/images/fondateur-25-ans.jpg" alt="Photographie d’archive du fondateur à l’âge de 25 ans, au moment des apparitions" width={700} height={795} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        </div>
        <figcaption className="px-3 pb-2 pt-4 text-white">
          <p className="eyebrow text-gold-300">Archive</p>
          <p className="mt-2 font-display text-xl font-medium">À l’âge de 25 ans, au moment des apparitions</p>
          <p className="mt-1 text-xs text-white/50">Archive Reagan MBUMBA</p>
        </figcaption>
      </figure>
      <figure className="flex flex-col overflow-hidden rounded-3xl bg-night-900 p-2 shadow-lift lg:col-span-3">
        <div className="overflow-hidden rounded-[1.25rem] bg-black">
          <video controls playsInline preload="none" poster="/images/kcc-explication-apparition-poster.jpg" className="aspect-video w-full">
            <source src="/videos/kcc-explication-apparition.mp4" type="video/mp4" />
            Votre navigateur ne peut pas lire cette vidéo. <a href="/videos/kcc-explication-apparition.mp4">Télécharger la vidéo</a>.
          </video>
        </div>
        <figcaption className="flex flex-1 items-start gap-3 px-3 pb-2 pt-4 text-white">
          <PlayCircle className="mt-1 h-6 w-6 shrink-0 text-gold" aria-hidden />
          <div>
            <p className="eyebrow text-gold-300">Vidéo</p>
            <p className="mt-2 font-display text-xl font-medium">KCC : explication et apparition</p>
            <p className="mt-1 text-sm text-white/60">Courte animation sur l’apparition des lettres KCC.</p>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
