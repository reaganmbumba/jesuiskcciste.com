import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, GraduationCap, MapPin, Megaphone, Pin, Signal } from 'lucide-react';
import type { Announcement, Course, KccEvent, Parish, SolidarityProject } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Misc';
import { useI18n } from '@/i18n';
import { formatCurrency, formatDate, formatTime, percent } from '@/utils/format';
import { EVENT_CATEGORY_LABELS, EVENT_STATUS } from '@/features/events/labels';
import { ACCESS_LABELS, LEVEL_LABELS } from '@/features/academy/labels';

/** Visuel de remplacement élégant lorsqu'aucune image n'est fournie. */
export function CoverArt({ seed, icon, className = '' }: { seed: string; icon: React.ReactNode; className?: string }) {
  const hues = ['from-night-900 via-night-700 to-night-500', 'from-night-900 via-[#1b3360] to-[#33507e]', 'from-[#140f24] via-[#2a2347] to-[#4b3b5c]', 'from-[#0b1a2a] via-[#173a4a] to-[#2b5866]'];
  const n = seed.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const h = hues[n % hues.length];
  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${h} ${className}`} aria-hidden>
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gold/35 blur-3xl transition-transform duration-700 group-hover:scale-125" />
      <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="absolute inset-0 bg-grid opacity-60 mask-radial" />
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-gold/25" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/[0.07] text-gold-200 shadow-inner-line backdrop-blur-md transition-transform duration-500 group-hover:scale-110 [&>svg]:h-7 [&>svg]:w-7">{icon}</span>
      </div>
    </div>
  );
}

export function AnnouncementCard({ a }: { a: Announcement }) {
  const { locale } = useI18n();
  return (
    <Link to={`/actualites/${a.id}`} className="group flex flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white p-2 shadow-soft card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <div className="overflow-hidden rounded-[1.25rem]">
        {a.imageUrl ? <img src={a.imageUrl} alt="" loading="lazy" className="h-48 w-full object-cover transition duration-700 group-hover:scale-105" /> : <CoverArt seed={a.id} icon={<Megaphone />} className="h-44" />}
      </div>
      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="gold">{a.category}</Badge>
          {a.pinned && <Badge tone="night"><Pin className="h-3 w-3" /> Épinglée</Badge>}
          {a.audience !== 'public' && <Badge tone="blue">Membres</Badge>}
        </div>
        <h3 className="font-display text-xl font-medium leading-snug text-night transition-colors group-hover:text-gold-700">{a.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink/65">{a.summary}</p>
        <div className="mt-auto flex items-center justify-between border-t border-night/[0.06] pt-4 text-xs text-ink/55">
          <time dateTime={a.publishedAt}>{formatDate(a.publishedAt, locale)}</time>
          <span className="flex items-center gap-1.5 font-semibold text-night">Lire <span className="grid h-7 w-7 place-items-center rounded-full bg-night text-gold transition group-hover:bg-gold group-hover:text-night"><ArrowRight className="h-3.5 w-3.5 transition group-hover:-rotate-45" /></span></span>
        </div>
      </div>
    </Link>
  );
}

export function EventCard({ e, parishes }: { e: KccEvent; parishes?: Parish[] }) {
  const { locale } = useI18n();
  const d = new Date(e.startsAt);
  const parish = parishes?.find((p) => p.id === e.parishId);
  const status = EVENT_STATUS[e.status];
  return (
    <Link to={`/agenda/${e.id}`} className="group flex gap-4 rounded-3xl border border-night/[0.06] bg-white p-3 shadow-soft card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:p-4">
      <div className="relative flex w-[4.5rem] shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-night-600 to-night-900 py-3 text-white shadow-inner-line">
        <span className="pointer-events-none absolute -top-6 h-12 w-12 rounded-full bg-gold/40 blur-xl" aria-hidden />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">{formatDate(e.startsAt, locale, { month: 'short' }, e.timezone)}</span>
        <span className="relative font-display text-[1.7rem] font-medium leading-none">{formatDate(e.startsAt, locale, { day: '2-digit' }, e.timezone)}</span>
        <span className="mt-0.5 text-[10px] text-white/55">{d.getFullYear()}</span>
      </div>
      <div className="min-w-0 flex-1 py-1">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <Badge tone="gold">{EVENT_CATEGORY_LABELS[e.category]}</Badge>
          {e.status !== 'scheduled' && <Badge tone={status.tone}>{status.label}</Badge>}
        </div>
        <h3 className="truncate font-semibold text-night transition-colors group-hover:text-gold-700">{e.title}</h3>
        <ul className="mt-1.5 space-y-0.5 text-[13px] text-ink/60">
          <li className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden />{formatTime(e.startsAt, locale, e.timezone)} <span className="text-ink/40">({e.timezone.split('/')[1]?.replace('_', ' ')})</span></li>
          <li className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden />{e.location}{parish ? ` · ${parish.name}` : ''}</li>
        </ul>
      </div>
    </Link>
  );
}

export function CourseCard({ c }: { c: Course }) {
  const access = ACCESS_LABELS[c.access];
  const lessons = c.modules.reduce((s, m) => s + m.lessons.length, 0);
  return (
    <Link to={`/academie/formations/${c.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white p-2 shadow-soft card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <div className="overflow-hidden rounded-[1.25rem]">
        {c.coverUrl ? <img src={c.coverUrl} alt="" loading="lazy" className="h-44 w-full object-cover transition duration-700 group-hover:scale-105" /> : <CoverArt seed={c.id} icon={<GraduationCap />} className="h-36" />}
      </div>
      <div className="flex flex-1 flex-col p-4 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-600">{c.category}</p>
        <h3 className="mt-1.5 font-display text-xl font-medium leading-snug text-night transition-colors group-hover:text-gold-700">{c.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink/65">{c.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-xs text-ink/60">
          <span className="flex items-center gap-1"><Signal className="h-3.5 w-3.5" />{LEVEL_LABELS[c.level]}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />≈ {c.estimatedHours} h</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{lessons} leçon{lessons > 1 ? 's' : ''}</span>
        </div>
        <div className="mt-3"><Badge tone={access.tone}>{access.label}</Badge></div>
      </div>
    </Link>
  );
}

export function ProjectCard({ p, dark }: { p: SolidarityProject; dark?: boolean }) {
  const { locale } = useI18n();
  const pct = percent(p.confirmedAmount, p.goalAmount);
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-3xl p-6 transition duration-300 hover:-translate-y-1 sm:p-7 ${dark ? 'glass text-white hover:border-gold/30 hover:bg-white/[0.09]' : 'border border-night/[0.06] bg-white shadow-soft hover:shadow-lift'}`}>
      <div className="flex items-center justify-between gap-2">
        <Badge tone={p.status === 'active' ? 'green' : p.status === 'completed' ? 'gold' : 'neutral'}>{p.status === 'active' ? 'En cours' : p.status === 'completed' ? 'Objectif atteint' : 'Clôturé'}</Badge>
        {p.deadline && <span className={`text-xs ${dark ? 'text-white/55' : 'text-ink/55'}`}>Jusqu’au {formatDate(p.deadline, locale, { dateStyle: 'medium' })}</span>}
      </div>
      <h3 className={`mt-5 font-display text-2xl font-medium ${dark ? 'text-white' : 'text-night'}`}>{p.name}</h3>
      <p className={`mt-1.5 text-sm ${dark ? 'text-white/65' : 'text-ink/65'}`}>{p.summary}</p>
      <div className="mt-5">
        <ProgressBar value={pct} label={`Progression du projet ${p.name}`} />
        <div className="mt-2 flex items-baseline justify-between text-sm">
          <span className={dark ? 'text-white' : 'text-night'}><strong className="font-semibold">{formatCurrency(p.confirmedAmount, p.currency, locale)}</strong> <span className={dark ? 'text-white/50' : 'text-ink/50'}>confirmés</span></span>
          <span className="font-display text-2xl font-medium text-gold">{pct} %</span>
        </div>
        <p className={`text-xs ${dark ? 'text-white/45' : 'text-ink/50'}`}>Objectif : {formatCurrency(p.goalAmount, p.currency, locale)}</p>
      </div>
      <Link to={`/solidarite/projets/${p.slug}`} className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${dark ? 'text-gold-200 hover:text-gold' : 'text-gold-600 hover:text-gold-700'}`}>
        Rapport et modalités <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
