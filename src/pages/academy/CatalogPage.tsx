import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Form';
import { CourseCard } from '@/components/cards/Cards';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { coursesRepo } from '@/services';
import { LEVEL_LABELS, levelLabel } from '@/features/academy/labels';
import type { CourseLevel } from '@/types';
import { useI18n } from '@/i18n';

export default function CatalogPage() {
  const { tx, locale } = useI18n();
  const { data = [], loading, error, reload } = useAsync(async () => (await coursesRepo.all()).filter((c) => c.status === 'published'), []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [level, setLevel] = useState('');
  const cats = Array.from(new Set(data.map((c) => c.category)));
  const list = useMemo(() => data.filter((c) => (!cat || c.category === cat) && (!level || c.level === level) && (!q || `${c.title} ${c.summary}`.toLowerCase().includes(q.toLowerCase()))), [data, q, cat, level]);
  return (
    <>
      <PageHeader eyebrow={tx('Académie KCC', 'KCC Academy', 'Academia KCC')} title={tx('Catalogue des formations', 'Course catalogue', 'Catálogo de formações')} />
      <section className="container-page py-10">
        <div className="mb-6 grid gap-2 sm:grid-cols-[1fr_200px_200px]">
          <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input className="pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('Rechercher une formation…', 'Search for a course…', 'Pesquisar uma formação…')} aria-label={tx('Rechercher une formation', 'Search for a course', 'Pesquisar uma formação')} /></div>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label={tx('Catégorie', 'Category', 'Categoria')}><option value="">{tx('Toutes les catégories', 'All categories', 'Todas as categorias')}</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
          <Select value={level} onChange={(e) => setLevel(e.target.value)} aria-label={tx('Niveau', 'Level', 'Nível')}><option value="">{tx('Tous les niveaux', 'All levels', 'Todos os níveis')}</option>{(Object.keys(LEVEL_LABELS) as CourseLevel[]).map((l) => <option key={l} value={l}>{levelLabel(l, locale)}</option>)}</Select>
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <Skeleton className="h-80" /> : list.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => <CourseCard key={c.id} c={c} />)}</div> : <EmptyState title={tx('Aucune formation ne correspond.', 'No matching course.', 'Nenhuma formação corresponde.')} />}
      </section>
    </>
  );
}
