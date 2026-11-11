import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Music2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { CHALLENGES } from '@/content/challenges';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';

/** Liste des challenges des chansons du label « Je suis KCCiste ». */
export default function ChallengesPage() {
  const { tx, pick, locale } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow={tx('Jeunesse', 'Youth', 'Juventude')}
        title={tx('Challenges KCCistes', 'KCCist challenges', 'Desafios KCCistas')}
        description={tx(
          'Les chansons du label Je suis KCCiste à chanter à votre tour : filmez-vous, envoyez votre vidéo et votez pour vos préférées.',
          'Songs from the Je suis KCCiste label for you to sing: film yourself, send your video and vote for your favourites.',
          'Canções da editora Je suis KCCiste para cantar: filme-se, envie o seu vídeo e vote nos seus preferidos.',
        )}
        image={CHALLENGES[0]?.shareImage}
      />
      <section className="container-page py-10 lg:py-14">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CHALLENGES.map((c) => (
            <li key={c.id}>
              <Link to={`/challenges/${c.id}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <img src={c.image} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{formatDate(c.date, locale)}</p>
                  <h2 className="mt-1 font-display text-2xl font-medium text-night">{pick(c.title)}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-ink/70"><Music2 className="h-4 w-4 text-gold-600" aria-hidden />{c.song}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-night group-hover:text-gold-700"><Heart className="h-4 w-4" aria-hidden />{tx('Participer et voter', 'Take part and vote', 'Participar e votar')} <ArrowRight className="h-4 w-4" aria-hidden /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
