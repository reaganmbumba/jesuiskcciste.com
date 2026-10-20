import { Link } from 'react-router-dom';
import { ArrowRight, Church, Layers, Network, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { useAsync } from '@/hooks/useAsync';
import { parishesRepo, sectionsRepo, unitsRepo } from '@/services';
import { ButtonLink } from '@/components/ui/Button';
import { useI18n } from '@/i18n';

export default function CommunityPage() {
  const { tx } = useI18n();
  const { data } = useAsync(() => Promise.all([unitsRepo.all(), parishesRepo.all(), sectionsRepo.all()]), []);
  const [units = [], parishes = [], sections = []] = data ?? [];
  const countries = Array.from(new Set(parishes.map((p) => p.country)));
  const links = [
    { to: '/communaute/annuaire', title: tx('Annuaire des membres', 'Member directory', 'Diretório de membros'), text: tx('Retrouver les membres selon leurs choix de visibilité.', 'Find members according to their visibility choices.', 'Encontrar membros segundo as suas escolhas de visibilidade.'), icon: Users },
    { to: '/paroisses', title: tx('Paroisses', 'Parishes', 'Paróquias'), text: tx('Parcourir les paroisses par pays et par ville.', 'Browse parishes by country and city.', 'Percorrer as paróquias por país e cidade.'), icon: Church },
    { to: '/sections', title: tx('Sections', 'Sections', 'Secções'), text: tx('Les sections rattachées à chaque paroisse.', 'The sections attached to each parish.', 'As secções associadas a cada paróquia.'), icon: Layers },
  ];
  return (
    <>
      <PageHeader eyebrow={tx('Communauté KCCiste', 'KCCist community', 'Comunidade KCCista')} title={tx('Un seul peuple, partout dans le monde', 'One people, all over the world', 'Um só povo, em todo o mundo')} description={tx('Découvrez l’organisation de la communauté et retrouvez les vôtres.', 'Discover how the community is organised and find your people.', 'Descubra a organização da comunidade e reencontre os seus.')}>
        <ButtonLink to="/inscription" variant="gold">{tx('Rejoindre la communauté', 'Join the community', 'Juntar-se à comunidade')}</ButtonLink>
      </PageHeader>
      <section className="container-page py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {links.map(({ to, title, text, icon: Icon }) => (
            <Link key={to} to={to} className="group rounded-2xl border border-night/[0.06] bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <Icon className="h-8 w-8 text-gold" aria-hidden />
              <h2 className="mt-4 font-display text-xl font-semibold text-night">{title}</h2>
              <p className="mt-1 text-sm text-ink/65">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-600">{tx('Ouvrir', 'Open', 'Abrir')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-night/[0.06] bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-3"><Network className="h-6 w-6 text-gold" /><h2 className="font-display text-2xl font-semibold text-night">{tx('Organisation', tx('Organisation', 'Organisation', 'Organização'), 'Organização')}</h2></div>
          <p className="mt-2 text-sm text-ink/65">{tx('Structure configurable par l’administration : Administration centrale → Paroisses → Sections → Membres.', 'Structure set by the administration: Central administration → Parishes → Sections → Members.', 'Estrutura configurável pela administração: Administração central → Paróquias → Secções → Membros.')}</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { l: tx('Administration centrale', 'Central administration', 'Administração central'), n: units.length },
              { l: tx('Paroisses', 'Parishes', 'Paróquias'), n: parishes.length },
              { l: tx('Sections', 'Sections', 'Secções'), n: sections.length },
              { l: tx('Pays', 'Countries', 'Países'), n: countries.length },
            ].map((x, i) => (
              <li key={x.l} className="relative rounded-xl bg-mist p-4">
                <span className="text-xs font-semibold text-gold-600">{tx('Niveau', 'Level', 'Nível')} {i + 1}</span>
                <p className="font-semibold text-night">{x.l}</p>
                <p className="text-sm text-ink/55">{x.n} {x.n > 1 ? tx('enregistrés', 'registered', 'registados') : tx('enregistré', 'registered', 'registado')}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
