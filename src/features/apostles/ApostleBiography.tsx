import { CalendarDays } from 'lucide-react';
import type { ApostleBiography } from '@/content/apotres-biographies';
import { useI18n } from '@/i18n';

/** Biographie d'un apôtre : repères puis parties titrées. */
export function BiographyBody({ bio, showFacts = true }: { bio: ApostleBiography; showFacts?: boolean }) {
  const { pick } = useI18n();
  return (
    <div className="space-y-8">
      {bio.image && <img src={bio.image} alt={bio.name} loading="lazy" className="w-full rounded-3xl shadow-lift" />}
      {showFacts && (
        <dl className="grid gap-3 sm:grid-cols-3">
          {bio.facts.map((f) => (
            <div key={f.label.fr} className="rounded-2xl bg-mist px-4 py-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-700"><CalendarDays className="h-3.5 w-3.5" aria-hidden />{pick(f.label)}</dt>
              <dd className="mt-1 text-[15px] font-medium text-night">{pick(f.value)}</dd>
            </div>
          ))}
        </dl>
      )}
      {bio.sections.map((s) => (
        <section key={s.heading.fr}>
          <h2 className="font-display text-2xl font-semibold text-night">{pick(s.heading)}</h2>
          <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-ink/85">{s.paragraphs.map((p, i) => <p key={i}>{pick(p)}</p>)}</div>
        </section>
      ))}
    </div>
  );
}
