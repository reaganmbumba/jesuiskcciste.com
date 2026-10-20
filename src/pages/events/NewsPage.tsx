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
import { useI18n } from '@/i18n';

export default function NewsPage() {
  const { profile } = useAuth();
  const { tx } = useI18n();
  const { data = [], loading, error, reload } = useAsync(() => listPublishedAnnouncements({ signedIn: !!profile }), [profile?.id]);
  const [cat, setCat] = useState('');
  const [page, setPage] = useState(1);
  const cats = Array.from(new Set(data.map((a) => a.category)));
  const list = data.filter((a) => !cat || a.category === cat);
  return (
    <>
      <PageHeader eyebrow={tx('Activités', 'Activities', 'Atividades')} title={tx('Actualités et annonces', 'News and announcements', 'Notícias e anúncios')} description={profile ? tx('Annonces publiques et annonces réservées aux membres.', 'Public announcements and members-only announcements.', 'Anúncios públicos e anúncios reservados aos membros.') : tx('Annonces publiques. Connectez-vous pour voir les annonces réservées aux membres.', 'Public announcements. Log in to see members-only announcements.', 'Anúncios públicos. Inicie sessão para ver os anúncios reservados aos membros.')} />
      <section className="container-page py-10">
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={tx('Filtrer par catégorie', 'Filter by category', 'Filtrar por categoria')}>
          {['', ...cats].map((c) => (
            <button key={c || 'all'} onClick={() => { setCat(c); setPage(1); }} aria-pressed={cat === c} className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition', cat === c ? 'bg-night text-white' : 'bg-white text-ink/70 ring-1 ring-night/10 hover:ring-gold')}>{c || tx('Toutes', 'All', 'Todas')}</button>
          ))}
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-80" />)}</div> : list.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.slice((page - 1) * 9, page * 9).map((a) => <AnnouncementCard key={a.id} a={a} />)}</div>
        ) : <EmptyState title={tx('Aucune annonce.', 'No announcements.', 'Nenhum anúncio.')} />}
        <Pagination page={page} pageSize={9} total={list.length} onChange={setPage} />
      </section>
    </>
  );
}
