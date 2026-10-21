import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/format';

/**
 * Pastille en couleur inspirée de l'emblème KCC : un anneau, un disque en dégradé,
 * le pictogramme et les lettres « KCC ». Aucun symbole religieux.
 */
export function KccIcon({ icon: Icon, from, to, className }: { icon: LucideIcon; from: string; to: string; className?: string }) {
  return (
    <span className={cn('relative grid h-14 w-14 shrink-0 place-items-center rounded-full p-[3px] shadow-soft transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lift', className)} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} aria-hidden>
      <span className="grid h-full w-full place-items-center rounded-full ring-2 ring-white/90" style={{ background: `radial-gradient(circle at 30% 25%, ${from}, ${to})` }}>
        <span className="flex flex-col items-center leading-none text-white">
          <Icon className="h-[22px] w-[22px] drop-shadow-sm" strokeWidth={2} />
          <span className="mt-0.5 text-[8px] font-extrabold tracking-[0.12em]">KCC</span>
        </span>
      </span>
    </span>
  );
}
