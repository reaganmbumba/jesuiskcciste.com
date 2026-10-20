import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { cn } from '@/utils/format';

/**
 * Logotype JE SUIS KCCiste. Si un logo officiel autorisé est configuré
 * (Administration > Paramètres), il est affiché à la place du monogramme.
 * Aucune croix n'est utilisée comme élément décoratif.
 */
export function Logo({ light, className }: { light?: boolean; className?: string }) {
  const { settings } = useSiteSettings();
  return (
    <Link to="/" className={cn('group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold', className)} aria-label="JE SUIS KCCiste — Accueil">
      {settings.officialLogoUrl ? (
        <img src={settings.officialLogoUrl} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl shadow-glow ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-gold-200 via-gold-400 to-gold-600 shadow-glow ring-1 ring-inset ring-white/40 transition-transform duration-500 group-hover:rotate-[8deg]" aria-hidden>
          <span className="absolute inset-[6px] rounded-full border-2 border-night/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-night" />
        </span>
      )}
      <span className="leading-none">
        <span className={cn('block font-display text-[18px] font-semibold tracking-[0.02em]', light ? 'text-white' : 'text-night')}>
          JE SUIS <span className="text-gold">KCCiste</span>
        </span>
        <span className={cn('block whitespace-nowrap text-[10px] uppercase tracking-[0.2em]', light ? 'text-white/55' : 'text-ink/50')}>Bon Nouveau Message</span>
      </span>
    </Link>
  );
}
