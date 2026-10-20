import { useState } from 'react';
import { PageHeader } from '@/components/ui/Misc';
import { AnnouncementCard } from '@/components/cards/Cards';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { listPublishedAnnouncements } from '@/services';
import { cn } from '@/utils/format';

export default function NewsPage() {
  const { profile } = useAuth();
  const { data = [], loading, error, reload } = useAsync(() => listPublishedAnnouncements({ signedIn: !!profile }), [profile?.id]);
  const [cat, setCat] = useState('');
  const [page, setPage] = useState(1);
  const cats = Array.from(new Set(data.map((a) => a.category)));
  const list = data.filter((a) => !cat || a.category === cat);
  return (
    <>
      <PageHeader eyebrow="Activités" title="Actualités et annonces" description={profile ? 'Annonces publiques et annonces réservées aux membres.' : 'Annonces publiques. Connectez-vous pour voir les annonces réservées aux membres.'} />
      <section className="container-page py-10">
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
          {['', ...cats].map((c) => (
            <button key={c || 'all'} onClick={() => { setCat(c); setPage(1); }} aria-pressed={cat === c} className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition', cat === c ? 'bg-night text-white' : 'bg-white text-ink/70 ring-1 ring-night/10 hover:ring-gold')}>{c || 'Toutes'}</button>
          ))}
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-80" />)}</div> : list.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.slice((page - 1) * 9, page * 9).map((a) => <AnnouncementCard key={a.id} a={a} />)}</div>
        ) : <EmptyState title="Aucune annonce." />}
        <Pagination page={page} pageSize={9} total={list.length} onChange={setPage} />
      </section>
    </>
  );
}
