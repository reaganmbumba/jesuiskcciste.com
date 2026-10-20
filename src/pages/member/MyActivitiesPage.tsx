import { EventCard } from '@/components/cards/Cards';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { ButtonLink } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { listUpcomingEvents, parishesRepo } from '@/services';

export default function MyActivitiesPage() {
  const { profile } = useAuth();
  const { data, loading } = useAsync(() => Promise.all([listUpcomingEvents({ signedIn: true }), parishesRepo.all()]), []);
  if (loading) return <PageLoader />;
  const [events = [], parishes = []] = data ?? [];
  const mine = events.filter((e) => !e.parishId || e.parishId === profile?.parishId);
  const others = events.filter((e) => !mine.includes(e));
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between"><h1 className="font-display text-2xl font-semibold text-night">Mes activités</h1><ButtonLink to="/agenda" size="sm" variant="outline">Agenda complet</ButtonLink></div>
      <section><h2 className="mb-3 font-semibold text-night">Dans ma paroisse</h2>{mine.length ? <div className="grid gap-3 lg:grid-cols-2">{mine.map((e) => <EventCard key={e.id} e={e} parishes={parishes} />)}</div> : <EmptyState title="Aucune activité programmée dans votre paroisse." />}</section>
      <section><h2 className="mb-3 font-semibold text-night">Dans la communauté</h2><div className="grid gap-3 lg:grid-cols-2">{others.map((e) => <EventCard key={e.id} e={e} parishes={parishes} />)}</div></section>
    </div>
  );
}
