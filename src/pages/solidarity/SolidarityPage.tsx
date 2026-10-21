import { FileCheck2, HandHeart, ShieldCheck, Smartphone } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { ProjectCard } from '@/components/cards/Cards';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { projectsRepo } from '@/services';
import { useI18n } from '@/i18n';
import { SolidarityHighlights } from '@/components/common/SolidarityHighlights';

export default function SolidarityPage() {
  const { tx } = useI18n();
  const { data = [], loading } = useAsync(() => projectsRepo.all(), []);
  const pillars = [
    { icon: HandHeart, t: tx('Agir ensemble', 'Acting together', 'Agir juntos'), d: tx('Soutien aux paroisses, aux familles et aux projets communautaires.', 'Support for parishes, families and community projects.', 'Apoio às paróquias, às famílias e aos projetos comunitários.') },
    { icon: ShieldCheck, t: tx('Transparence', 'Transparency', 'Transparência'), d: tx('Seuls les paiements confirmés sont comptabilisés. Les déclarations sont distinguées.', 'Only confirmed payments are counted. Declarations are shown separately.', 'Só os pagamentos confirmados são contabilizados. As declarações são distinguidas.') },
    { icon: FileCheck2, t: tx('Redevabilité', 'Accountability', 'Prestação de contas'), d: tx('Dépenses, pièces justificatives et bilans publiés par les gestionnaires.', 'Expenses, receipts and reports published by the managers.', 'Despesas, comprovativos e balanços publicados pelos gestores.') },
    { icon: Smartphone, t: tx('Paiement mobile', 'Mobile payment', 'Pagamento móvel'), d: tx('M-Pesa, Orange Money, Airtel Money : intégration prévue, pas encore active.', 'M-Pesa, Orange Money, Airtel Money: integration planned, not active yet.', 'M-Pesa, Orange Money, Airtel Money: integração prevista, ainda não ativa.') },
  ];
  return (
    <>
      <PageHeader eyebrow={tx('Solidarité KCC', 'KCC Solidarity', 'Solidariedade KCC')} title={tx('Servir ensemble, en toute transparence', 'Serving together, with full transparency', 'Servir juntos, com toda a transparência')} description={tx('Des projets suivis, documentés et rendus publics, au service de la communauté.', 'Projects that are tracked, documented and made public, serving the community.', 'Projetos acompanhados, documentados e tornados públicos, ao serviço da comunidade.')}>
        <div className="flex flex-wrap gap-3"><ButtonLink to="/solidarite/projets" variant="gold">{tx('Voir les projets', 'View projects', 'Ver os projetos')}</ButtonLink><ButtonLink to="/enseignements#caisse" variant="light">{tx('Caisse d’assistance sociale', 'Social assistance fund', 'Caixa de assistência social')}</ButtonLink></div>
      </PageHeader>
      <section className="container-page py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, t, d }) => <div key={t} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft"><Icon className="h-7 w-7 text-gold" /><h2 className="mt-3 font-semibold text-night">{t}</h2><p className="mt-1 text-sm text-ink/60">{d}</p></div>)}
        </div>
        <div className="mt-14">
          <SectionHeading eyebrow={tx('Projets', 'Projects', 'Projetos')} title={data.some((p) => p.status === 'active') ? tx('Projets en cours', 'Current projects', 'Projetos em curso') : tx('Nos œuvres de solidarité', 'Our solidarity work', 'As nossas obras de solidariedade')} />
          {loading ? <Skeleton className="h-64" /> : data.some((p) => p.status === 'active') ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{data.filter((p) => p.status === 'active').map((p) => <ProjectCard key={p.id} p={p} />)}</div> : <SolidarityHighlights />}
        </div>
      </section>
    </>
  );
}
