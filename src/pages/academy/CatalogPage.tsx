import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Form';
import { CourseCard } from '@/components/cards/Cards';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { coursesRepo } from '@/services';
import { LEVEL_LABELS } from '@/features/academy/labels';
import type { CourseLevel } from '@/types';

export default function CatalogPage() {
  const { data = [], loading, error, reload } = useAsync(async () => (await coursesRepo.all()).filter((c) => c.status === 'published'), []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [level, setLevel] = useState('');
  const cats = Array.from(new Set(data.map((c) => c.category)));
  const list = useMemo(() => data.filter((c) => (!cat || c.category === cat) && (!level || c.level === level) && (!q || `${c.title} ${c.summary}`.toLowerCase().includes(q.toLowerCase()))), [data, q, cat, level]);
  return (
    <>
      <PageHeader eyebrow="Académie KCC" title="Catalogue des formations" />
      <section className="container-page py-10">
        <div className="mb-6 grid gap-2 sm:grid-cols-[1fr_200px_200px]">
          <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input className="pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une formation…" aria-label="Rechercher une formation" /></div>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Catégorie"><option value="">Toutes les catégories</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
          <Select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Niveau"><option value="">Tous les niveaux</option>{(Object.keys(LEVEL_LABELS) as CourseLevel[]).map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}</Select>
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <Skeleton className="h-80" /> : list.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => <CourseCard key={c.id} c={c} />)}</div> : <EmptyState title="Aucune formation ne correspond." />}
      </section>
    </>
  );
}
