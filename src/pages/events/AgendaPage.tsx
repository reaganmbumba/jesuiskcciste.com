import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Select } from '@/components/ui/Form';
import { EventCard } from '@/components/cards/Cards';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { eventsRepo, parishesRepo } from '@/services';
import { EVENT_CATEGORY_LABELS, eventCategoryLabel } from '@/features/events/labels';
import { useI18n } from '@/i18n';
import { cn, formatDate } from '@/utils/format';
import type { EventCategory } from '@/types';

export default function AgendaPage() {
  const { profile } = useAuth();
  const { locale, tx, pick } = useI18n();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [category, setCategory] = useState('');
  const [parishId, setParishId] = useState('');
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const { data, loading, error, reload } = useAsync(() => Promise.all([eventsRepo.all(), parishesRepo.all()]), []);
  const [events = [], parishes = []] = data ?? [];

  const visible = useMemo(() => events
    .filter((e) => e.status !== 'archived' && (e.audience === 'public' || !!profile))
    .filter((e) => (!category || e.category === category) && (!parishId || e.parishId === parishId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt)), [events, profile, category, parishId]);
  const upcoming = visible.filter((e) => e.startsAt >= new Date(Date.now() - 864e5).toISOString());

  const days = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7; // lundi en premier
    const start = new Date(first); start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [month]);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  return (
    <>
      <PageHeader eyebrow={tx('Activités', 'Activities', 'Atividades')} title={tx('Agenda et événements', 'Calendar and events', 'Agenda e eventos')} description={tx('Cultes, réunions, formations, séminaires, concerts et actions de solidarité. Les horaires sont affichés dans le fuseau horaire du lieu.', 'Services, meetings, courses, seminars, concerts and solidarity actions. Times are shown in the local time zone of the venue.', 'Cultos, reuniões, formações, seminários, concertos e ações de solidariedade. Os horários são mostrados no fuso horário do local.')} />
      <section className="container-page py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid flex-1 grid-cols-2 gap-2 sm:max-w-xl">
            <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={tx('Catégorie', 'Category', 'Categoria')}><option value="">{tx('Toutes les catégories', 'All categories', 'Todas as categorias')}</option>{(Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[]).map((k) => <option key={k} value={k}>{eventCategoryLabel(k, locale)}</option>)}</Select>
            <Select value={parishId} onChange={(e) => setParishId(e.target.value)} aria-label={tx('Paroisse', 'Parish', 'Paróquia')}><option value="">{tx('Toutes les paroisses', 'All parishes', 'Todas as paróquias')}</option>{parishes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          </div>
          <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-night/10" role="tablist" aria-label={tx('Mode d’affichage', 'Display mode', 'Modo de visualização')}>
            {([['list', tx('Liste', 'List', 'Lista'), List], ['calendar', tx('Calendrier', 'Calendar', 'Calendário'), CalendarDays]] as const).map(([v, l, Icon]) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn('flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium', view === v ? 'bg-night text-white' : 'text-ink/70 hover:text-night')}><Icon className="h-4 w-4" />{l}</button>
            ))}
          </div>
        </div>

        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <Skeleton className="h-96" /> : view === 'list' ? (
          upcoming.length ? <div className="grid gap-3 lg:grid-cols-2">{upcoming.map((e) => <EventCard key={e.id} e={e} parishes={parishes} />)}</div> : <EmptyState title={tx('Aucun événement à venir pour ces critères.', 'No upcoming events for these criteria.', 'Nenhum evento previsto para estes critérios.')} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-night/[0.06] bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-night/10 px-4 py-3">
              <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-mist" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label={tx('Mois précédent', 'Previous month', 'Mês anterior')}><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="font-display text-lg font-semibold capitalize text-night" aria-live="polite">{formatDate(month.toISOString(), locale, { month: 'long', year: 'numeric' })}</h2>
              <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-mist" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label={tx('Mois suivant', 'Next month', 'Mês seguinte')}><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-7 border-b border-night/10 bg-mist/60 text-center text-xs font-semibold uppercase text-ink/55">
              {pick({ fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] }).map((d) => <div key={d} className="py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {days.map((d) => {
                const dayEvents = visible.filter((e) => sameDay(new Date(e.startsAt), d));
                const inMonth = d.getMonth() === month.getMonth();
                const today = sameDay(d, new Date());
                return (
                  <div key={d.toISOString()} className={cn('min-h-[74px] border-b border-r border-night/[0.06] p-1 sm:min-h-[104px] sm:p-1.5', !inMonth && 'bg-mist/40')}>
                    <span className={cn('grid h-6 w-6 place-items-center rounded-full text-xs', today ? 'bg-gold font-bold text-night' : inMonth ? 'text-ink' : 'text-ink/30')}>{d.getDate()}</span>
                    <ul className="mt-1 space-y-1">
                      {dayEvents.map((e) => (
                        <li key={e.id}><Link to={`/agenda/${e.id}`} className={cn('block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium', e.status === 'cancelled' ? 'bg-red-50 text-red-700 line-through' : 'bg-night text-white hover:bg-deep')} title={e.title}><span className="hidden sm:inline">{e.title.replace('[Exemple] ', '')}</span><span className="sm:hidden">•</span></Link></li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
