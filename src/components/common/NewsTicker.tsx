import { Link } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { listPublishedAnnouncements } from '@/services';
import { cn } from '@/utils/format';

/**
 * Bandeau des dernières actualités qui défile de droite à gauche.
 * Les titres viennent des annonces publiées (modifiables dans l'administration).
 * S'arrête au survol ; immobile et défilable à la main si le visiteur réduit les animations.
 */
export function NewsTicker({ className }: { className?: string }) {
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const signedIn = !!profile;
  const { data } = useAsync(() => listPublishedAnnouncements({ signedIn, limit: 6 }), [signedIn, locale]);
  if (!data?.length) return null;

  // La liste est doublée pour que le défilement boucle sans saut.
  const items = (copy: number) => data.map((a) => (
    <li key={`${copy}-${a.id}`} className={cn('flex shrink-0 items-center gap-3 pr-8', copy > 0 && 'motion-reduce:hidden')} aria-hidden={copy > 0 || undefined}>
      <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
      <Link to={`/actualites/${a.id}`} tabIndex={copy > 0 ? -1 : undefined} className="whitespace-nowrap text-white/75 transition hover:text-gold-300">{a.title}</Link>
    </li>
  ));
  const duration = Math.max(25, data.length * 9);

  return (
    <div className={cn('group flex min-w-0 items-center gap-3', className)} role="region" aria-label={tx('Actualités', 'News', 'Notícias')}>
      <Link to="/actualites" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-300 hover:bg-gold/25">
        <Megaphone className="h-3.5 w-3.5" aria-hidden />
        {tx('Actualités', 'News', 'Notícias')}
      </Link>
      <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent)] motion-reduce:overflow-x-auto">
        <ul
          className="flex w-max animate-marquee text-[12px] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animationDuration: `${duration}s` }}
        >
          {items(0)}
          {items(1)}
        </ul>
      </div>
    </div>
  );
}
