import type { ReactNode } from 'react';
import { cn, initials } from '@/utils/format';
import { ShareButtons } from '@/components/common/ShareButtons';
import { usePageMeta } from '@/hooks/usePageMeta';

export function ProgressBar({ value, label, tone = 'gold' }: { value: number; label?: string; tone?: 'gold' | 'night' }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-night/[0.08] ring-1 ring-inset ring-black/[0.02]" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progression'}>
        <div className={cn('h-full rounded-full transition-all duration-700', tone === 'gold' ? 'bg-gradient-to-r from-gold-500 via-gold-300 to-gold-200 shadow-glow' : 'bg-night')} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function Avatar({ person, url, size = 40 }: { person: { firstName: string; lastName: string }; url?: string | null; size?: number }) {
  return url ? (
    <img src={url} alt="" width={size} height={size} loading="lazy" className="rounded-full object-cover ring-2 ring-white" style={{ width: size, height: size }} />
  ) : (
    <span className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-night to-night-500 font-semibold text-gold ring-2 ring-white" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {initials(person)}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, description, action, light }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; light?: boolean }) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className={cn('eyebrow mb-3', light ? 'text-gold-300' : 'text-gold-600')}>{eyebrow}</p>}
        <h2 className={cn('font-display text-[2rem] font-medium leading-[1.1] sm:text-[2.6rem]', light ? 'text-white' : 'text-night')}>{title}</h2>
        {description && <p className={cn('mt-3 text-[15px] leading-relaxed sm:text-base', light ? 'text-white/70' : 'text-ink/60')}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * En-tête des pages publiques. Il fixe aussi le titre et l'aperçu de partage de la page
 * et affiche les boutons de partage (désactivables avec `share={false}`).
 * `metaDescription` remplace `description` dans l'aperçu sans être affiché.
 */
export function PageHeader({ eyebrow, title, description, children, image, metaDescription, share = true }: { eyebrow?: string; title: string; description?: string; children?: ReactNode; image?: string | null; metaDescription?: string; share?: boolean }) {
  const summary = metaDescription ?? description;
  usePageMeta({ title, description: summary, image });
  return (
    <header className="relative isolate overflow-hidden bg-night-900 pb-14 pt-12 text-white sm:pb-20 sm:pt-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-gold/25 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-80 w-80 rounded-full bg-night-500/60 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden />
      <div className="container-page relative animate-fade-up">
        {eyebrow && <p className="eyebrow mb-4 text-gold-300">{eyebrow}</p>}
        <h1 className="font-display text-[2.2rem] font-medium leading-[1.08] sm:text-6xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70 sm:text-lg">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
        {share && <ShareButtons tone="dark" title={title} text={summary} image={image} className="mt-7" />}
      </div>
    </header>
  );
}

export function StatCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="card-hover rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold-50 to-gold-100 text-gold-600 ring-1 ring-inset ring-gold/20">{icon}</span>
        {hint}
      </div>
      <p className="mt-4 font-display text-3xl font-semibold text-night">{value}</p>
      <p className="mt-0.5 text-sm text-ink/60">{label}</p>
    </div>
  );
}
