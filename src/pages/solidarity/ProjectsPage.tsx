import { useState } from 'react';
import { PageHeader } from '@/components/ui/Misc';
import { ProjectCard } from '@/components/cards/Cards';
import { EmptyState } from '@/components/ui/States';
import { SolidarityOperations } from '@/components/common/SolidarityOperations';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { projectsRepo } from '@/services';
import { cn } from '@/utils/format';
import { useI18n } from '@/i18n';

export default function ProjectsPage() {
  const { tx } = useI18n();
  const { data = [], loading } = useAsync(() => projectsRepo.all(), []);
  const [status, setStatus] = useState<'active' | 'completed' | ''>('');
  const list = data.filter((p) => p.status !== 'draft' && (!status || p.status === status));
  return (
    <>
      <PageHeader eyebrow={tx('Solidarité KCC', 'KCC Solidarity', 'Solidariedade KCC')} title={tx('Projets de solidarité', 'Solidarity projects', 'Projetos de solidariedade')} />
      <section className="container-page py-10">
        <div className="mb-6 flex gap-2">
          {([['', tx('Tous', 'All', 'Todos')], ['active', tx('En cours', 'Ongoing', 'Em curso')], ['completed', tx('Terminés', 'Completed', 'Concluídos')]] as const).map(([v, l]) => (
            <button key={v} aria-pressed={status === v} onClick={() => setStatus(v)} className={cn('rounded-full px-4 py-1.5 text-sm font-medium', status === v ? 'bg-night text-white' : 'bg-white text-ink/70 ring-1 ring-night/10')}>{l}</button>
          ))}
        </div>
        {loading ? <Skeleton className="h-64" /> : list.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div> : data.length ? <EmptyState title={tx('Aucun projet.', 'No projects.', 'Nenhum projeto.')} /> : <SolidarityOperations />}
      </section>
    </>
  );
}
