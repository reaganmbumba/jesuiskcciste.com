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
import { useI18n } from '@/i18n';

export default function ParishDetailPage() {
  const { id = '' } = useParams();
  const { profile } = useAuth();
  const { tx } = useI18n();
  const { data, loading } = useAsync(async () => {
    const [parish, sections, events, anns, parishes] = await Promise.all([
      parishesRepo.get(id), sectionsRepo.all(), listUpcomingEvents({ signedIn: !!profile }), listPublishedAnnouncements({ signedIn: !!profile }), parishesRepo.all(),
    ]);
    // Sans rendez-vous ou annonce propres, la paroisse affiche ceux de toute l'Église.
    const ownEvents = events.filter((e) => e.parishId === id);
    const ownAnns = anns.filter((a) => a.parishId === id);
    return { parish, parishes, sections: sections.filter((s) => s.parishId === id), events: ownEvents.length ? ownEvents : events.filter((e) => !e.parishId).slice(0, 4), anns: ownAnns.length ? ownAnns : anns.filter((a) => !a.parishId).slice(0, 2) };
  }, [id, profile?.id]);
  if (loading) return <PageLoader />;
  if (!data?.parish) return <div className="container-page py-16"><EmptyState title={tx('Paroisse introuvable.', 'Parish not found.', 'Paróquia não encontrada.')} action={<ButtonLink to="/paroisses" variant="outline">{tx('Toutes les paroisses', 'All parishes', 'Todas as paróquias')}</ButtonLink>} /></div>;
  const p = data.parish;
  return (
    <>
      <PageHeader eyebrow={tx('Paroisse', 'Parish', 'Paróquia')} title={p.name} description={p.description}>
        <p className="flex items-center gap-2 text-white/75"><MapPin className="h-4 w-4 text-gold" />{[p.address, p.city, p.country].filter(Boolean).join(', ')}</p>
      </PageHeader>
      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <div>
            <h2 className="mb-4 font-display text-2xl font-semibold text-night">{tx('Événements à venir', 'Upcoming events', 'Próximos eventos')}</h2>
            {data.events.length ? <div className="space-y-3">{data.events.map((e) => <EventCard key={e.id} e={e} parishes={data.parishes} />)}</div> : <EmptyState title={tx('Aucun événement programmé.', 'No events scheduled.', 'Nenhum evento programado.')} />}
          </div>
          <div>
            <h2 className="mb-4 font-display text-2xl font-semibold text-night">{tx('Annonces', 'Announcements', 'Anúncios')}</h2>
            {data.anns.length ? <div className="grid gap-4 sm:grid-cols-2">{data.anns.map((a) => <AnnouncementCard key={a.id} a={a} />)}</div> : <EmptyState title={tx('Aucune annonce propre à cette paroisse.', 'No announcements for this parish.', 'Nenhum anúncio próprio desta paróquia.')} />}
          </div>
        </div>
        <aside className="space-y-4">
          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-semibold text-night"><UserCheck className="h-5 w-5 text-gold" />{tx('Responsable', 'Leader', 'Responsável')}</h2>
            <p className="mt-1 text-sm text-ink/65">{p.leaderName || tx('Sous la conduite de la direction de l’Église, à Kinshasa.', 'Under the guidance of the Church’s leadership in Kinshasa.', 'Sob a orientação da direção da Igreja, em Kinshasa.')}</p>
          </CardBody></Card>
          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-semibold text-night"><Layers className="h-5 w-5 text-gold" />{tx('Sections', 'Sections', 'Secções')}</h2>
            <ul className="mt-2 space-y-1.5 text-sm">{data.sections.length ? data.sections.map((s) => <li key={s.id} className="rounded-lg bg-mist px-3 py-2">{s.name}</li>) : [tx('Jeunesse', 'Youth', 'Juventude'), tx('Mamans', 'Mothers', 'Mães'), tx('Papas', 'Fathers', 'Pais'), tx('Chorale', 'Choir', 'Coro')].map((n) => <li key={n} className="rounded-lg bg-mist px-3 py-2">{n}</li>)}</ul>
          </CardBody></Card>
          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-semibold text-night"><FileText className="h-5 w-5 text-gold" />{tx('Documents et rapports', 'Documents and reports', 'Documentos e relatórios')}</h2>
            <p className="mt-1 text-sm text-ink/65">{profile ? tx('Les documents réservés sont consultables par les membres autorisés de la paroisse.', 'Restricted documents can be viewed by authorised members of the parish.', 'Os documentos reservados podem ser consultados pelos membros autorizados da paróquia.') : tx('Connectez-vous pour accéder aux documents réservés aux membres.', 'Log in to access members-only documents.', 'Inicie sessão para aceder aos documentos reservados aos membros.')}</p>
            <ButtonLink to="/bibliotheque" variant="outline" size="sm" className="mt-3">{tx('Bibliothèque', 'Library', 'Biblioteca')}</ButtonLink>
          </CardBody></Card>
        </aside>
      </section>
    </>
  );
}
