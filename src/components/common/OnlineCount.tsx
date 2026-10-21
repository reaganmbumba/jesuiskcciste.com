import { useOnlineCount } from '@/hooks/useOnlineCount';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

/** Pastille « N personnes en ligne », mise à jour en direct. Rien n'est affiché tant que le nombre est inconnu. */
export function OnlineCount({ light, className }: { light?: boolean; className?: string }) {
  const { tx } = useI18n();
  const n = useOnlineCount();
  if (n === null || n < 1) return null;
  const label = n === 1
    ? tx('1 personne en ligne', '1 person online', '1 pessoa online')
    : tx(`${n} personnes en ligne`, `${n} people online`, `${n} pessoas online`);
  return (
    <span
      role="status"
      aria-live="polite"
      title={tx('Visiteurs présents sur le site en ce moment', 'Visitors on the site right now', 'Visitantes no site neste momento')}
      className={cn('inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium', light ? 'border border-white/15 bg-white/[0.06] text-white/85' : 'border border-night/10 bg-white text-night', className)}
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}
