import { useParams } from 'react-router-dom';
import { FileText, Layers, MapPin, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { ButtonLink } from '@/components/ui/Button';
import { AnnouncementCard, EventCard } from '@/components/cards/Cards';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { listPublishedAnnouncements, listUpcomingEvents, parishesRepo, sectionsRepo } from '@/services';

export default function ParishDetailPage() {
  const { id = '' } = useParams();
  const { profile } = useAuth();
  const { data, loading } = useAsync(async () => {
    const [parish, sections, events, anns, parishes] = await Promise.all([
      parishesRepo.get(id), sectionsRepo.all(), listUpcomingEvents({ signedIn: !!profile }), listPublishedAnnouncements({ signedIn: !!profile }), parishesRepo.all(),
    ]);
    return { parish, parishes, sections: sections.filter((s) => s.parishId === id), events: events.filter((e) => e.parishId === id), anns: anns.filter((a) => a.parishId === id) };
  }, [id, profile?.id]);
  if (loading) return <PageLoader />;
  if (!data?.parish) return <div className="container-page py-16"><EmptyState title="Paroisse introuvable." action={<ButtonLink to="/paroisses" variant="outline">Toutes les paroisses</ButtonLink>} /></div>;
  const p = data.parish;
  return (
    <>
      <PageHeader eyebrow="Paroisse" title={p.name} description={p.description}>
        <p className="flex items-center gap-2 text-white/75"><MapPin className="h-4 w-4 text-gold" />{[p.address, p.city, p.country].filter(Boolean).join(', ')}</p>
      </PageHeader>
      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <div>
            <h2 className="mb-4 font-display text-2xl font-semibold text-night">Événements à venir</h2>
            {data.events.length ? <div className="space-y-3">{data.events.map((e) => <EventCard key={e.id} e={e} parishes={data.parishes} />)}</div> : <EmptyState title="Aucun événement programmé." />}
          </div>
          <div>
            <h2 className="mb-4 font-display text-2xl font-semibold text-night">Annonces</h2>
            {data.anns.length ? <div className="grid gap-4 sm:grid-cols-2">{data.anns.map((a) => <AnnouncementCard key={a.id} a={a} />)}</div> : <EmptyState title="Aucune annonce propre à cette paroisse." />}
          </div>
        </div>
        <aside className="space-y-4">
          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-semibold text-night"><UserCheck className="h-5 w-5 text-gold" />Responsable</h2>
            <p className="mt-1 text-sm text-ink/65">{p.leaderName || 'À désigner par l’administration.'}</p>
          </CardBody></Card>
          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-semibold text-night"><Layers className="h-5 w-5 text-gold" />Sections</h2>
            <ul className="mt-2 space-y-1.5 text-sm">{data.sections.length ? data.sections.map((s) => <li key={s.id} className="rounded-lg bg-mist px-3 py-2">{s.name}</li>) : <li className="text-ink/55">Aucune section enregistrée.</li>}</ul>
          </CardBody></Card>
          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-semibold text-night"><FileText className="h-5 w-5 text-gold" />Documents et rapports</h2>
            <p className="mt-1 text-sm text-ink/65">{profile ? 'Les documents réservés sont consultables par les membres autorisés de la paroisse.' : 'Connectez-vous pour accéder aux documents réservés aux membres.'}</p>
            <ButtonLink to="/bibliotheque" variant="outline" size="sm" className="mt-3">Bibliothèque</ButtonLink>
          </CardBody></Card>
        </aside>
      </section>
    </>
  );
}
