import { FileCheck2, HandHeart, ShieldCheck, Smartphone } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { ProjectCard } from '@/components/cards/Cards';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { projectsRepo } from '@/services';

export default function SolidarityPage() {
  const { data = [], loading } = useAsync(() => projectsRepo.all(), []);
  const pillars = [
    { icon: HandHeart, t: 'Agir ensemble', d: 'Soutien aux paroisses, aux familles et aux projets communautaires.' },
    { icon: ShieldCheck, t: 'Transparence', d: 'Seuls les paiements confirmés sont comptabilisés. Les déclarations sont distinguées.' },
    { icon: FileCheck2, t: 'Redevabilité', d: 'Dépenses, pièces justificatives et bilans publiés par les gestionnaires.' },
    { icon: Smartphone, t: 'Paiement mobile', d: 'M-Pesa, Orange Money, Airtel Money : intégration prévue, pas encore active.' },
  ];
  return (
    <>
      <PageHeader eyebrow="Solidarité KCC" title="Servir ensemble, en toute transparence" description="Des projets suivis, documentés et rendus publics, au service de la communauté.">
        <div className="flex flex-wrap gap-3"><ButtonLink to="/solidarite/projets" variant="gold">Voir les projets</ButtonLink><ButtonLink to="/enseignements#caisse" variant="light">Caisse d’assistance sociale</ButtonLink></div>
      </PageHeader>
      <section className="container-page py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, t, d }) => <div key={t} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft"><Icon className="h-7 w-7 text-gold" /><h2 className="mt-3 font-semibold text-night">{t}</h2><p className="mt-1 text-sm text-ink/60">{d}</p></div>)}
        </div>
        <div className="mt-14">
          <SectionHeading eyebrow="Projets" title="Projets en cours" />
          {loading ? <Skeleton className="h-64" /> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{data.filter((p) => p.status === 'active').map((p) => <ProjectCard key={p.id} p={p} />)}</div>}
        </div>
      </section>
    </>
  );
}
