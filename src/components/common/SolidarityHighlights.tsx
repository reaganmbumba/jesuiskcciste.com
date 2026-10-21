import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';

/** Œuvres de solidarité de l'Église, affichées tant qu'aucun projet n'est publié. */
export function SolidarityHighlights() {
  const { tx } = useI18n();
  const items = [
    { img: '/images/accueil/solidarite.jpg', to: '/enseignements#caisse', t: tx('Caisse d’assistance sociale', 'Social assistance fund', 'Caixa de assistência social'), d: tx('L’entraide des membres en cas de deuil et de maladie, selon le règlement de la caisse.', 'Members’ mutual aid in case of bereavement and illness, according to the fund’s rules.', 'A entreajuda dos membros em caso de luto e doença, segundo o regulamento da caixa.'), cta: tx('Lire le règlement', 'Read the rules', 'Ler o regulamento') },
    { img: '/images/archives/centre-hospitalier-christ-sante-lemba.jpg', to: '/doctrine#archives', t: tx('Centre hospitalier de Lemba', 'Lemba hospital centre', 'Centro hospitalar de Lemba'), d: tx('Une œuvre de santé de l’Église Bon Nouveau Message (KCC) à Kinshasa.', 'A health facility of the Église Bon Nouveau Message (KCC) in Kinshasa.', 'Uma obra de saúde da Église Bon Nouveau Message (KCC) em Kinshasa.'), cta: tx('Voir les archives', 'See the archives', 'Ver os arquivos') },
    { img: '/images/accueil/jeunesse.jpg', to: '/inscription', t: tx('Jeunesse et familles', 'Youth and families', 'Juventude e famílias'), d: tx('Rejoignez la communauté pour être informé des prochaines actions de solidarité.', 'Join the community to hear about upcoming solidarity actions.', 'Junte-se à comunidade para ser informado das próximas ações de solidariedade.'), cta: tx('Rejoindre', 'Join', 'Juntar-se') },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((x) => (
        <Link key={x.t} to={x.to} className="group flex flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
          <img src={x.img} alt="" loading="lazy" className="h-44 w-full object-cover" />
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-xl font-medium text-night">{x.t}</h3>
            <p className="mt-1.5 text-sm text-ink/65">{x.d}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-gold-600">{x.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </div>
        </Link>
      ))}
    </div>
  );
}
