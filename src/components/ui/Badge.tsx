import type { ReactNode } from 'react';
import { cn } from '@/utils/format';

type Tone = 'neutral' | 'gold' | 'night' | 'green' | 'amber' | 'red' | 'blue';
const tones: Record<Tone, string> = {
  neutral: 'bg-mist text-ink/80 ring-night/10',
  gold: 'bg-gold-50 text-gold-700 ring-gold/30',
  night: 'bg-night text-white ring-night',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-sky-50 text-sky-800 ring-sky-600/20',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset', tones[tone], className)}>{children}</span>;
}

export function DemoBadge({ label = 'Exemple' }: { label?: string }) {
  return <Badge tone="amber" className="uppercase tracking-wide">{label}</Badge>;
}
