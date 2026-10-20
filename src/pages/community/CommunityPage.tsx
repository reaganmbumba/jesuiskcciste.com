import { Link } from 'react-router-dom';
import { ArrowRight, Church, Layers, Network, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { useAsync } from '@/hooks/useAsync';
import { parishesRepo, sectionsRepo, unitsRepo } from '@/services';
import { ButtonLink } from '@/components/ui/Button';

export default function CommunityPage() {
  const { data } = useAsync(() => Promise.all([unitsRepo.all(), parishesRepo.all(), sectionsRepo.all()]), []);
  const [units = [], parishes = [], sections = []] = data ?? [];
  const countries = Array.from(new Set(parishes.map((p) => p.country)));
  const links = [
    { to: '/communaute/annuaire', title: 'Annuaire des membres', text: 'Retrouver les membres selon leurs choix de visibilité.', icon: Users },
    { to: '/paroisses', title: 'Paroisses', text: 'Parcourir les paroisses par pays et par ville.', icon: Church },
    { to: '/sections', title: 'Sections', text: 'Les sections rattachées à chaque paroisse.', icon: Layers },
  ];
  return (
    <>
      <PageHeader eyebrow="Communauté KCCiste" title="Un seul peuple, partout dans le monde" description="Découvrez l’organisation de la communauté et retrouvez les vôtres.">
        <ButtonLink to="/inscription" variant="gold">Rejoindre la communauté</ButtonLink>
      </PageHeader>
      <section className="container-page py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {links.map(({ to, title, text, icon: Icon }) => (
            <Link key={to} to={to} className="group rounded-2xl border border-night/[0.06] bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <Icon className="h-8 w-8 text-gold" aria-hidden />
              <h2 className="mt-4 font-display text-xl font-semibold text-night">{title}</h2>
              <p className="mt-1 text-sm text-ink/65">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-600">Ouvrir <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-night/[0.06] bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-3"><Network className="h-6 w-6 text-gold" /><h2 className="font-display text-2xl font-semibold text-night">Organisation</h2></div>
          <p className="mt-2 text-sm text-ink/65">Structure configurable par l’administration : Administration centrale → Paroisses → Sections → Membres.</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { l: 'Administration centrale', n: units.length },
              { l: 'Paroisses', n: parishes.length },
              { l: 'Sections', n: sections.length },
              { l: 'Pays', n: countries.length },
            ].map((x, i) => (
              <li key={x.l} className="relative rounded-xl bg-mist p-4">
                <span className="text-xs font-semibold text-gold-600">Niveau {i + 1}</span>
                <p className="font-semibold text-night">{x.l}</p>
                <p className="text-sm text-ink/55">{x.n} enregistré{x.n > 1 ? 's' : ''}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
