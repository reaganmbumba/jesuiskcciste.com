import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Church, MapPin, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Form';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { DemoBadge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { parishesRepo, sectionsRepo } from '@/services';
import { isDemoMode } from '@/config/env';
import { useI18n } from '@/i18n';

export default function ParishesPage() {
  const { tx } = useI18n();
  const { data, loading, error, reload } = useAsync(() => Promise.all([parishesRepo.all(), sectionsRepo.all()]), []);
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [parishes = [], sections = []] = data ?? [];
  const countries = Array.from(new Set(parishes.map((p) => p.country))).sort();
  const list = useMemo(() => parishes.filter((p) => (!country || p.country === country) && (!q || `${p.name} ${p.city}`.toLowerCase().includes(q.toLowerCase()))), [parishes, q, country]);
  return (
    <>
      <PageHeader eyebrow={tx('Communauté', 'Community', 'Comunidade')} title={tx('Paroisses', 'Parishes', 'Paróquias')} description={tx('Les paroisses enregistrées sur JE SUIS KCCiste, en RD Congo et dans la diaspora.', 'Parishes registered on JE SUIS KCCiste, in the DR Congo and across the diaspora.', 'As paróquias registadas no JE SUIS KCCiste, na RD Congo e na diáspora.')} />
      <section className="container-page py-10">
        <div className="mb-6 grid gap-2 sm:grid-cols-[1fr_220px]">
          <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input className="pl-10" placeholder={tx('Nom ou ville…', 'Name or city…', 'Nome ou cidade…')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={tx('Rechercher une paroisse', 'Search for a parish', 'Pesquisar uma paróquia')} /></div>
          <Select value={country} onChange={(e) => setCountry(e.target.value)} aria-label={tx('Pays', 'Country', 'País')}><option value="">{tx('Tous les pays', 'All countries', 'Todos os países')}</option>{countries.map((c) => <option key={c}>{c}</option>)}</Select>
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-44" />)}</div> : list.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Link key={p.id} to={`/paroisses/${p.id}`} className="group rounded-2xl border border-night/[0.06] bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-night text-gold"><Church className="h-6 w-6" /></span>
                  {isDemoMode && <DemoBadge />}
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-night">{p.name}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-ink/60"><MapPin className="h-4 w-4" />{p.city}, {p.country}</p>
                <p className="mt-3 text-sm text-ink/60">{sections.filter((s) => s.parishId === p.id).length} {tx('section(s)', 'section(s)', 'secção(ões)')}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-600">{tx('Voir la paroisse', 'View parish', 'Ver a paróquia')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        ) : <EmptyState title={tx('Aucune paroisse ne correspond.', 'No matching parish.', 'Nenhuma paróquia corresponde.')} />}
      </section>
    </>
  );
}
