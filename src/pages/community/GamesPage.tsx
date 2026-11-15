import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { useI18n } from '@/i18n';

/** Les jeux pour apprendre en s'amusant, tous construits autour des trois signes KCC. */
export default function GamesPage() {
  const { tx } = useI18n();
  const games = [
    {
      to: '/jeux/trois-balles',
      image: '/images/jeux/trois-balles-partage.jpg',
      title: tx('Le jeu des trois balles', 'The three balls game', 'O jogo das três bolas'),
      text: tx('Rangez les balles K, C, C dans les tubes : chaque tube qui forme KCC s’écrase.', 'Sort the K, C, C balls into the tubes: every tube that spells KCC is crushed.', 'Arrume as bolas K, C, C nos tubos: cada tubo que forma KCC é esmagado.'),
    },
    {
      to: '/jeux/trois-signes',
      image: '/images/jeux/trois-signes-partage.jpg',
      title: tx('Le jeu des trois signes', 'The three signs game', 'O jogo dos três sinais'),
      text: tx('Échangez les signes pour écrire K-C-C et découvrir les mots de la foi.', 'Swap the signs to spell K-C-C and discover the words of the faith.', 'Troque os sinais para escrever K-C-C e descobrir as palavras da fé.'),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow={tx('Jeunesse', 'Youth', 'Juventude')}
        title={tx('Jeux pour apprendre', 'Games to learn', 'Jogos para aprender')}
        description={tx(
          'Des jeux autour des trois signes prophétiques KCC : Nkanda (message), Wambote (bon) et Wampa (nouveau).',
          'Games built around the three prophetic signs KCC: Nkanda (message), Wambote (good) and Wampa (new).',
          'Jogos à volta dos três sinais proféticos KCC: Nkanda (mensagem), Wambote (bom) e Wampa (novo).',
        )}
        image="/images/jeux/trois-balles-partage.jpg"
      />
      <section className="container-page py-10 lg:py-14">
        <ul className="grid gap-5 sm:grid-cols-2">
          {games.map((g) => (
            <li key={g.to}>
              <Link to={g.to} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <img src={g.image} alt="" loading="lazy" className="aspect-[1200/630] w-full object-cover" />
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-2xl font-medium text-night">{g.title}</h2>
                  <p className="mt-2 text-sm text-ink/70">{g.text}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-night group-hover:text-gold-700">{tx('Jouer', 'Play', 'Jogar')} <ArrowRight className="h-4 w-4" aria-hidden /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
