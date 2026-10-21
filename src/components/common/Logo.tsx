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

export function Logo({ light, large, className }: { light?: boolean; large?: boolean; className?: string }) {
  const { settings } = useSiteSettings();
  return (
    <Link to="/" className={cn('group flex items-center rounded-lg', large ? 'gap-4' : 'gap-2.5', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold', className)} aria-label="JE SUIS KCCiste — Accueil">
      <img src={logoSrc(settings.officialLogoUrl)} alt="" width={large ? 88 : 44} height={large ? 88 : 44} className={cn('shrink-0 drop-shadow-[0_4px_14px_rgba(214,174,92,.35)] transition-transform duration-500 group-hover:scale-105', large ? 'h-[72px] w-[72px] sm:h-[88px] sm:w-[88px]' : 'h-11 w-11')} />
      <span className="leading-none">
        <span className={cn('block font-display font-semibold', large ? 'whitespace-nowrap text-[28px] sm:text-[32px]' : 'text-[18px]', 'tracking-[0.02em]', light ? 'text-white' : 'text-night')}>
          JE SUIS <span className="text-gold">KCCiste</span>
        </span>
        <span className={cn('block whitespace-nowrap uppercase tracking-[0.2em]', large ? 'mt-1 text-[12px] sm:text-[13px]' : 'text-[10px]', light ? 'text-white/55' : 'text-ink/50')}>Bon Nouveau Message</span>
      </span>
    </Link>
  );
}
