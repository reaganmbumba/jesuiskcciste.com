import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { cn } from '@/utils/format';

/**
 * Logotype JE SUIS KCCiste. Si un logo officiel autorisé est configuré
 * (Administration > Paramètres), il est affiché à la place du monogramme.
 * Aucune croix n'est utilisée comme élément décoratif.
 * L'ancien logo « JE SUIS KCCiste Formation » est remplacé par l'emblème KCC officiel.
 */
const KCC_EMBLEM = '/images/logo-kcc.svg';
const logoSrc = (url: string) => (!url || url.includes('logo-je-suis-kcciste') ? KCC_EMBLEM : url);

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  const { settings } = useSiteSettings();
  return (
    <Link to="/" className={cn('group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold', className)} aria-label="JE SUIS KCCiste — Accueil">
      <img src={logoSrc(settings.officialLogoUrl)} alt="" width={44} height={44} className="h-11 w-11 shrink-0 drop-shadow-[0_4px_14px_rgba(214,174,92,.35)] transition-transform duration-500 group-hover:scale-105" />
      <span className="leading-none">
        <span className={cn('block font-display text-[18px] font-semibold tracking-[0.02em]', light ? 'text-white' : 'text-night')}>
          JE SUIS <span className="text-gold">KCCiste</span>
        </span>
        <span className={cn('block whitespace-nowrap text-[10px] uppercase tracking-[0.2em]', light ? 'text-white/55' : 'text-ink/50')}>Bon Nouveau Message</span>
      </span>
    </Link>
  );
}
