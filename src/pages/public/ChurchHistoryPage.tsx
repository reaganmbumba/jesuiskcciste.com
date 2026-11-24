import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, Landmark, Star, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { ButtonLink } from '@/components/ui/Button';
import { CHURCH_NAMES, ERAS, FEAST_DAYS, HISTORY_DATES, PERSONALITIES, SOURCES, type SourceKey } from '@/content/histoire-eglise';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

const COVER = '/images/archives/prophete-portrait-2005.jpg';

/**
 * « Histoire de l'Église : grandes dates et personnalités » : chronologie
 * sourcée, personnalités, noms successifs et fêtes (src/content/histoire-eglise.ts).
 */
export default function ChurchHistoryPage() {
  const { tx, pick } = useI18n();

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 150);
  }, []);

  const major = HISTORY_DATES.filter((d) => d.major && d.id !== 'aujourdhui');

  const Sources = ({ keys }: { keys: SourceKey[] }) => (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ink/50">
      <BookOpen className="h-3.5 w-3.5" aria-hidden />
      <span>{tx('Source :', 'Source:', 'Fonte:')}</span>
      {keys.map((k, i) => (
        <span key={k}>
          <Link to={SOURCES[k].to} className="underline decoration-gold/40 underline-offset-2 hover:text-gold-700">{pick(SOURCES[k].label)}</Link>
          {i < keys.length - 1 ? ' ·' : ''}
        </span>
      ))}
    </p>
  );

  return (
    <>
      <PageHeader
        eyebrow={tx('Histoire de l’Église', 'Church history', 'História da Igreja')}
        title={tx('Les grandes dates et les personnalités de l’Église', 'The key dates and figures of the Church', 'As grandes datas e personalidades da Igreja')}
        description={tx(
          'De la naissance du Prophète en 1930 à l’Oracle du 15 avril 2003 : les dates, les lieux et les noms qui ont fait l’Église Bon Nouveau Message (KCC), chacun avec sa source.',
          'From the Prophet’s birth in 1930 to the Oracle of 15 April 2003: the dates, places and names that made the Église Bon Nouveau Message (KCC), each with its source.',
          'Do nascimento do Profeta em 1930 ao Oráculo de 15 de abril de 2003: as datas, os lugares e os nomes que fizeram a Église Bon Nouveau Message (KCC), cada um com a sua fonte.',
        )}
        image={COVER}
      />

      <section className="container-page py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">{tx('À retenir', 'Key dates', 'A reter')}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {major.map((d) => (
            <a key={d.id} href={`#${d.id}`} className="rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft transition hover:border-gold/50 sm:p-5">
              <p className="font-display text-lg font-semibold leading-tight text-night sm:text-2xl">{pick(d.date)}</p>
              <p className="mt-1 text-sm text-ink/70">{pick(d.title)}</p>
            </a>
          ))}
        </div>
        <nav className="mt-8 flex flex-wrap gap-2" aria-label={tx('Rubriques', 'Sections', 'Secções')}>
          {[
            ['chronologie', tx('Chronologie', 'Timeline', 'Cronologia')],
            ['personnalites', tx('Personnalités', 'Figures', 'Personalidades')],
            ['noms', tx('Les noms de l’Église', 'The Church’s names', 'Os nomes da Igreja')],
            ['fetes', tx('Les dates fêtées', 'Feast days', 'Datas festejadas')],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="rounded-full border border-night/10 bg-white px-4 py-1.5 text-sm text-ink/75 hover:border-gold hover:text-night">{label}</a>
          ))}
        </nav>
      </section>

      <section id="chronologie" className="scroll-mt-24 bg-white py-14">
        <div className="container-page max-w-4xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700"><CalendarDays className="h-4 w-4" aria-hidden />{tx('Chronologie', 'Timeline', 'Cronologia')}</p>
          {ERAS.map((era) => (
            <div key={era.id} className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-night sm:text-3xl">{pick(era.title)}</h2>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-ink/45">{era.period}</p>
              <ol className="relative mt-6 space-y-7 border-l-2 border-gold/30 pl-6">
                {HISTORY_DATES.filter((d) => d.era === era.id).map((d) => (
                  <li key={d.id} id={d.id} className="relative scroll-mt-28">
                    <span className={cn('absolute -left-[1.95rem] top-1.5 rounded-full ring-4 ring-white', d.major ? 'h-4 w-4 -left-[2.05rem] bg-gold' : 'h-3 w-3 bg-gold/60')} aria-hidden />
                    <p className="text-sm font-semibold text-gold-700">{pick(d.date)}</p>
                    <h3 className="mt-0.5 font-display text-xl font-semibold text-night">{pick(d.title)}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink/80">{pick(d.text)}</p>
                    <Sources keys={d.source} />
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section id="personnalites" className="container-page scroll-mt-24 py-14">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700"><Users className="h-4 w-4" aria-hidden />{tx('Personnalités', 'Figures', 'Personalidades')}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-night">{tx('Ceux qui ont marqué l’histoire', 'Those who shaped the story', 'Os que marcaram a história')}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {PERSONALITIES.map((p) => (
            <article key={p.id} id={`personnalite-${p.id}`} className={cn('scroll-mt-28 rounded-2xl border border-night/[0.06] bg-white p-6 shadow-soft', p.id === 'prophete' && 'md:col-span-2 border-gold/40')}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">{pick(p.role)}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-night">{p.name}</h3>
              <p className="mt-2 leading-relaxed text-ink/80">{pick(p.text)}</p>
              <Sources keys={p.source} />
              {p.link && <Link to={p.link.to} className="mt-3 inline-block text-sm font-semibold text-gold-700 hover:underline">{pick(p.link.label)} →</Link>}
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/apotres" variant="outline">{tx('Les Révérends Apôtres', 'The Reverend Apostles', 'Os Reverendos Apóstolos')}</ButtonLink>
          <ButtonLink to="/apotres/biographies" variant="outline">{tx('Biographies des Apôtres', 'Apostles’ biographies', 'Biografias dos Apóstolos')}</ButtonLink>
        </div>
      </section>

      <section id="noms" className="scroll-mt-24 bg-white py-14">
        <div className="container-page">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700"><Landmark className="h-4 w-4" aria-hidden />{tx('Les noms de l’Église', 'The Church’s names', 'Os nomes da Igreja')}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {CHURCH_NAMES.map((n) => (
              <div key={n.name} className="rounded-2xl border border-night/[0.06] bg-mist/50 p-5">
                <p className="text-sm font-semibold text-gold-700">{pick(n.period)}</p>
                <p className="mt-1 font-display text-lg font-semibold text-night">{n.name}</p>
                <p className="mt-1.5 text-sm text-ink/70">{pick(n.text)}</p>
              </div>
            ))}
          </div>
          <Sources keys={['civil', 'kccisme']} />
        </div>
      </section>

      <section id="fetes" className="container-page scroll-mt-24 py-14">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700"><Star className="h-4 w-4" aria-hidden />{tx('Les dates fêtées chaque année', 'Dates celebrated every year', 'Datas celebradas todos os anos')}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEAST_DAYS.map((f) => (
            <li key={pick(f.date)} className="flex items-start gap-3 rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft">
              <span className="font-display text-lg font-semibold text-night">{pick(f.date)}</span>
              <span className="text-sm text-ink/75">{pick(f.name)}{f.holy && <span className="ml-1.5 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold-700">{tx('jour saint', 'holy day', 'dia santo')}</span>}</span>
            </li>
          ))}
        </ul>
        <Sources keys={['kccisme']} />

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-night p-7 text-white">
          <div className="max-w-xl">
            <p className="font-display text-2xl text-gold">{tx('Aller plus loin', 'Go further', 'Ir mais longe')}</p>
            <p className="mt-1 text-sm text-white/70">{tx(
              'Vous avez un document daté sur l’histoire de l’Église ? Envoyez-le avec sa source à l’équipe JE SUIS KCCiste : cette page s’enrichira.',
              'Do you have a dated document on the Church’s history? Send it with its source to the JE SUIS KCCiste team: this page will grow.',
              'Tem um documento datado sobre a história da Igreja? Envie-o com a sua fonte à equipa JE SUIS KCCiste: esta página vai crescer.',
            )}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/histoire/reconnaissance-juridique" variant="gold">{tx('La reconnaissance juridique', 'Legal recognition', 'O reconhecimento jurídico')}</ButtonLink>
            <ButtonLink to="/doctrine" variant="light">{tx('Doctrine et histoire', 'Doctrine and history', 'Doutrina e história')}</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
