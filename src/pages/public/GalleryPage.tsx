import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/Misc';
import { ShareButtons } from '@/components/common/ShareButtons';
import { galleryPhotos, galleryThemes, type GalleryTheme } from '@/content/galerie';
import { useI18n } from '@/i18n';

/** Galerie des photos d'archives de l'Église, avec visionneuse (voir src/content/galerie.ts). */
export default function GalleryPage() {
  const { tx, pick } = useI18n();
  const [theme, setTheme] = useState<GalleryTheme | 'all'>('all');
  const [params] = useSearchParams();
  // Lien partagé vers une photo : /galerie?photo=<n° dans la galerie complète>.
  const [open, setOpen] = useState<number | null>(() => {
    const n = Number(params.get('photo'));
    return Number.isInteger(n) && n >= 1 && n <= galleryPhotos.length ? n - 1 : null;
  });
  const shown = theme === 'all' ? galleryPhotos : galleryPhotos.filter((p) => p.theme === theme);
  const current = open === null ? null : shown[open];

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % shown.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + shown.length) % shown.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, shown.length]);

  const themes: [GalleryTheme | 'all', string][] = [['all', tx('Toutes', 'All', 'Todas')], ...(Object.keys(galleryThemes) as GalleryTheme[]).map((k) => [k, pick(galleryThemes[k])] as [GalleryTheme, string])];

  return (
    <>
      <PageHeader eyebrow={tx('Archives', 'Archives', 'Arquivo')} title={tx('Galerie photo de l’Église', 'Church photo gallery', 'Galeria de fotos da Igreja')} description={tx('Cultes, mamans, temples et archives anciennes de l’Église Bon Nouveau Message (fonds d’archives de la communauté).', 'Services, mothers, temples and early archives of the Église Bon Nouveau Message (community archive collection).', 'Cultos, mamãs, templos e arquivos antigos da Église Bon Nouveau Message (fundo de arquivo da comunidade).')} />

      <section className="container-page py-14">
        <div role="tablist" aria-label={tx('Thèmes', 'Themes', 'Temas')} className="mb-8 flex flex-wrap gap-2">
          {themes.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={theme === k} onClick={() => { setTheme(k); setOpen(null); }}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${theme === k ? 'border-night bg-night text-white' : 'border-night/10 bg-white text-ink/70 hover:border-gold'}`}>{label}</button>
          ))}
        </div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {shown.map((p, i) => (
            <figure key={p.src} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-night/[0.06] bg-white shadow-soft">
              <button type="button" onClick={() => setOpen(i)} className="block w-full" aria-label={`${tx('Agrandir', 'Enlarge', 'Ampliar')} : ${pick(p.caption)}`}>
                <img src={p.src} alt={pick(p.caption)} width={p.w} height={p.h} loading="lazy" className="w-full transition duration-500 hover:scale-[1.02]" />
              </button>
              <figcaption className="p-3 text-sm text-ink/70">{pick(p.caption)}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {current && open !== null && (
        <div role="dialog" aria-modal="true" aria-label={pick(current.caption)} className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/90 p-4" onClick={() => setOpen(null)}>
          <figure className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={pick(current.caption)} className="max-h-[80vh] w-auto rounded-2xl" />
            <figcaption className="mt-3 text-center text-sm text-white/80">{pick(current.caption)} · {open + 1}/{shown.length}</figcaption>
            <ShareButtons tone="dark" size="sm" url={`/galerie?photo=${galleryPhotos.indexOf(current) + 1}`} title={pick(current.caption)} className="mt-3 justify-center" />
          </figure>
          <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + shown.length) % shown.length); }} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label={tx('Photo précédente', 'Previous photo', 'Foto anterior')}><ChevronLeft className="h-6 w-6" /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % shown.length); }} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label={tx('Photo suivante', 'Next photo', 'Foto seguinte')}><ChevronRight className="h-6 w-6" /></button>
          <button type="button" onClick={() => setOpen(null)} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label={tx('Fermer', 'Close', 'Fechar')}><X className="h-6 w-6" /></button>
        </div>
      )}
    </>
  );
}
