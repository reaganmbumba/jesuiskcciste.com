import { Church, Layers, MapPin } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { EventCard, AnnouncementCard } from '@/components/cards/Cards';
import { PageLoader } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { listPublishedAnnouncements, listUpcomingEvents, parishesRepo, sectionsRepo } from '@/services';

export default function MyParishPage() {
  const { profile } = useAuth();
  const { data, loading } = useAsync(async () => {
    if (!profile?.parishId) return null;
    const [parish, section, events, anns, parishes] = await Promise.all([parishesRepo.get(profile.parishId), profile.sectionId ? sectionsRepo.get(profile.sectionId) : null, listUpcomingEvents({ signedIn: true }), listPublishedAnnouncements({ signedIn: true }), parishesRepo.all()]);
    return { parish, section, parishes, events: events.filter((e) => e.parishId === profile.parishId), anns: anns.filter((a) => !a.parishId || a.parishId === profile.parishId).slice(0, 4) };
  }, [profile?.parishId]);
  if (loading) return <PageLoader />;
  if (!data?.parish) return <EmptyState icon={<Church className="h-6 w-6" />} title="Aucune paroisse renseignée" description="Indiquez votre paroisse dans votre profil ; un responsable validera votre rattachement." action={<ButtonLink to="/espace/profil">Compléter mon profil</ButtonLink>} />;
  return (
    <div className="space-y-6">
      <Card><CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-night text-gold"><Church className="h-8 w-8" /></span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-night">{data.parish.name}</h1>
          <p className="flex items-center gap-1 text-sm text-ink/60"><MapPin className="h-4 w-4" />{data.parish.city}, {data.parish.country}</p>
          {data.section && <p className="mt-1 flex items-center gap-1 text-sm text-ink/60"><Layers className="h-4 w-4" />{data.section.name}</p>}
        </div>
        <ButtonLink to={`/paroisses/${data.parish.id}`} variant="outline" size="sm">Page publique</ButtonLink>
      </CardBody></Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <div><h2 className="mb-3 font-display text-xl font-semibold text-night">Programme</h2>{data.events.length ? <div className="space-y-3">{data.events.map((e) => <EventCard key={e.id} e={e} parishes={data.parishes} />)}</div> : <EmptyState title="Aucun événement programmé." />}</div>
        <div><h2 className="mb-3 font-display text-xl font-semibold text-night">Annonces</h2><div className="grid gap-3">{data.anns.map((a) => <AnnouncementCard key={a.id} a={a} />)}</div></div>
      </div>
    </div>
  );
}
