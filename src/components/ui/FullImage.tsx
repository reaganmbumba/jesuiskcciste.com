import { cn } from '@/utils/format';

/**
 * Photo affichée en entier dans un cadre de hauteur fixe : l'image est réduite
 * (jamais coupée) et posée sur une copie floutée d'elle-même qui remplit le cadre.
 * Utile pour les affiches dont le texte touche les bords.
 */
export function FullImage({ src, className, imgClassName }: { src: string; className?: string; imgClassName?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-night', className)}>
      <img src={src} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-xl" />
      <img src={src} alt="" loading="lazy" className={cn('relative h-full w-full object-contain', imgClassName)} />
    </div>
  );
}
