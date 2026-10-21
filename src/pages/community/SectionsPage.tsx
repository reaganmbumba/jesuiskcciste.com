import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { parishesRepo, sectionsRepo } from '@/services';
import { useI18n } from '@/i18n';

export default function SectionsPage() {
  const { tx } = useI18n();
  const { data, loading } = useAsync(() => Promise.all([parishesRepo.all(), sectionsRepo.all()]), []);
  const [parishes = [], sections = []] = data ?? [];
  return (
    <>
      <PageHeader eyebrow={tx('Communauté', 'Community', 'Comunidade')} title={tx('Sections', tx('Sections', 'Sections', 'Secções'), 'Secções')} description={tx('Chaque paroisse peut organiser ses sections : jeunesse, chorales, mamans, diaspora…', 'Each parish can organise its sections: youth, choirs, mothers, diaspora…', 'Cada paróquia pode organizar as suas secções: juventude, coros, mães, diáspora…')} />
      <section className="container-page space-y-8 py-12">
        {loading ? <Skeleton className="h-60" /> : parishes.filter((p) => sections.some((s) => s.parishId === p.id)).map((p) => (
          <div key={p.id}>
            <h2 className="mb-3 font-display text-xl font-semibold text-night"><Link to={`/paroisses/${p.id}`} className="hover:text-gold-600">{p.name}</Link> <span className="text-sm font-normal text-ink/50">· {p.city}</span></h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sections.filter((s) => s.parishId === p.id).map((s) => (
                <div key={s.id} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
                  <Layers className="h-6 w-6 text-gold" />
                  <h3 className="mt-3 font-semibold text-night">{s.name}</h3>
                  <p className="mt-1 text-sm text-ink/60">{s.description}</p>
                  <p className="mt-3 text-xs text-ink/50">{tx('Responsable', 'Leader', 'Responsável')} : {s.leaderName || tx('à désigner', 'to be appointed', 'a designar')}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!loading && !sections.length && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { img: '/images/accueil/jeunesse.jpg', t: tx('Jeunesse', 'Youth', 'Juventude'), d: tx('Les jeunes de la paroisse : rencontres, formation et activités.', 'The parish’s young people: meetings, learning and activities.', 'Os jovens da paróquia: encontros, formação e atividades.') },
              { img: '/images/archives/temple-kcc-assemblee.jpg', t: tx('Mamans', 'Mothers', 'Mães'), d: tx('Entraide, accueil et vie de famille au sein de la paroisse.', 'Mutual aid, welcome and family life within the parish.', 'Entreajuda, acolhimento e vida familiar na paróquia.') },
              { img: '/images/archives/archive-assemblee-noir-et-blanc.jpg', t: tx('Papas', 'Fathers', 'Pais'), d: tx('Service, organisation et soutien des activités de la communauté.', 'Service, organisation and support for community activities.', 'Serviço, organização e apoio às atividades da comunidade.') },
              { img: '/images/accueil/musique.svg', t: tx('Chorales', 'Choirs', 'Coros'), d: tx('Les cantiques d’ensemble et les chorales qui animent le culte.', 'The congregational hymns and the choirs that lead worship.', 'Os hinos de conjunto e os coros que animam o culto.') },
            ].map((x) => (
              <div key={x.t} className="overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-soft">
                <img src={x.img} alt="" loading="lazy" className="h-40 w-full object-cover" />
                <div className="p-5"><h2 className="font-display text-xl font-medium text-night">{x.t}</h2><p className="mt-1 text-sm text-ink/60">{x.d}</p></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
