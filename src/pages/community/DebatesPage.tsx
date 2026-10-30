import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Mic } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { DEBATE_TOPICS } from '@/content/debats';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';

/** Liste des sujets de l'espace « Débats audio ». */
export default function DebatesPage() {
  const { tx, pick, locale } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow={tx('Communauté', 'Community', 'Comunidade')}
        title={tx('Débats audio', 'Audio debates', 'Debates em áudio')}
        description={tx(
          'Écoutez le sujet du jour animé par Maman Mam’s et donnez votre avis en vocal, en audio ou par écrit.',
          'Listen to the topic of the day hosted by Maman Mam’s and share your view by voice, audio or in writing.',
          'Ouça o tema do dia animado pela Maman Mam’s e dê a sua opinião por voz, áudio ou por escrito.',
        )}
        image={DEBATE_TOPICS[0]?.image}
      />
      <section className="container-page py-10 lg:py-14">
        <ul className="grid gap-5 md:grid-cols-2">
          {DEBATE_TOPICS.map((t) => (
            <li key={t.id}>
              <Link to={`/debats/${t.id}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <img src={t.image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{formatDate(t.date, locale)}</p>
                  <h2 className="mt-1 font-display text-2xl font-medium text-night">{pick(t.title)}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-ink/70"><Headphones className="h-4 w-4 text-gold-600" aria-hidden />{tx('Animé par', 'Hosted by', 'Animado por')} {t.host}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-night group-hover:text-gold-700"><Mic className="h-4 w-4" aria-hidden />{tx('Écouter et commenter', 'Listen and comment', 'Ouvir e comentar')} <ArrowRight className="h-4 w-4" aria-hidden /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
