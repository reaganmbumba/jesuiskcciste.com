import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, HandHeart, Music2, ScrollText } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FounderMedia } from '@/components/common/FounderMedia';
import * as fr from '@/content/eglise';
import * as en from '@/content/eglise.en';
import * as pt from '@/content/eglise.pt';
import { useI18n, type Tri } from '@/i18n';
import { usePageTexts } from '@/features/content/pageTexts';

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

const anchors = [
  { id: 'enseignements', label: T('Enseignements', 'Teachings', 'Ensinamentos'), icon: BookOpen },
  { id: 'histoire', label: T('Histoire du Prophète', 'The Prophet’s story', 'História do Profeta'), icon: ScrollText },
  { id: 'pgm', label: T('Vision PGM', 'PGM vision', 'Visão PGM'), icon: Music2 },
  { id: 'chants', label: T('Chants', 'Songs', 'Cânticos'), icon: Music2 },
  { id: 'caisse', label: T('Caisse d’assistance', 'Assistance fund', 'Caixa de assistência'), icon: HandHeart },
];

/** Enseignements, histoire et textes de référence de l'EBNM/KCC (contenus réels, voir src/content/eglise.ts). */
export default function TeachingsPage() {
  const { hash } = useLocation();
  const { tx, pick } = useI18n();
  const { minuteToLearn, pgmVision, prophetHistory, socialFund, songs, teachings } = usePageTexts('eglise', { fr, en, pt });
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [hash]);

  return (
    <>
      <PageHeader eyebrow={tx('Patrimoine KCC', 'KCC heritage', 'Património KCC')} title={tx('Enseignements et histoire', 'Teachings and history', 'Ensinamentos e história')} description={tx('La parole du Prophète, les récits de son appel, la vision de la musique et les textes de la solidarité KCCiste.', 'The Prophet’s word, the accounts of his calling, the vision for music and the texts of KCCist solidarity.', 'A palavra do Profeta, os relatos do seu chamamento, a visão da música e os textos da solidariedade KCCista.')}>
        <nav aria-label={tx('Sections de la page', 'Page sections', 'Secções da página')} className="flex flex-wrap gap-2">
          {anchors.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#${id}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/85 transition hover:border-gold/50 hover:text-white">
              <Icon className="h-4 w-4 text-gold-300" aria-hidden />{pick(label)}
            </a>
          ))}
        </nav>
      </PageHeader>

      <section id="enseignements" className="container-page scroll-mt-32 py-14">
        <SectionHeading eyebrow={tx('Enseignements', 'Teachings', 'Ensinamentos')} title={tx('La parole du Prophète', 'The Prophet’s word', 'A palavra do Profeta')} />
        <div className="grid gap-6 lg:grid-cols-3">
          {teachings.map((t) => (
            <Card key={t.id} className="lg:col-span-2">
              <CardBody>
                <h3 className="font-display text-2xl font-semibold text-night">{t.title}</h3>
                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {t.meta.map((m) => <div key={m.label} className="flex gap-2"><dt className="font-semibold text-gold-700">{m.label} :</dt><dd className="text-ink/75">{m.value}</dd></div>)}
                </dl>
                <div className="prose-kcc mt-6">{t.paragraphs.slice(0, 3).map((p, i) => <p key={i}>{p}</p>)}</div>
                {t.quote && <blockquote className="my-6 border-l-4 border-gold pl-4 font-display text-lg italic text-night/85">{t.quote}</blockquote>}
                <div className="prose-kcc">{t.paragraphs.slice(3).map((p, i) => <p key={i}>{p}</p>)}</div>
                {t.closing && (
                  <div className="mt-6 rounded-xl bg-mist p-5">
                    <h4 className="font-semibold text-night">{t.closing.title}</h4>
                    <div className="prose-kcc mt-2">{t.closing.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
          <div className="h-fit rounded-2xl bg-night p-5 text-white shadow-soft sm:p-6">
              <Clock className="h-7 w-7 text-gold" aria-hidden />
              <h3 className="mt-3 font-display text-xl font-semibold">{minuteToLearn.title}</h3>
              <p className="mt-2 text-sm text-white/75">{minuteToLearn.concept}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/85">
                {minuteToLearn.objectives.map((o) => <li key={o} className="flex gap-2"><span className="text-gold" aria-hidden>✓</span>{o}</li>)}
              </ul>
              <dl className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
                {minuteToLearn.format.map((f) => <div key={f.label}><dt className="inline font-semibold text-gold-300">{f.label} : </dt><dd className="inline text-white/75">{f.value}</dd></div>)}
              </dl>
          </div>
        </div>
      </section>

      <section id="histoire" className="scroll-mt-32 bg-white py-14">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Histoire', 'History', 'História')} title={tx('L’appel de DIZOLELE Isaac', 'The calling of DIZOLELE Isaac', 'O chamamento de DIZOLELE Isaac')} description={tx('Récits des épreuves et de la consécration qui ont précédé son ministère.', 'Accounts of the trials and the consecration that came before his ministry.', 'Relatos das provas e da consagração que precederam o seu ministério.')} action={<Link to="/doctrine#prophete" className="text-sm font-semibold text-gold-700 hover:underline">{tx('Grandes dates du Prophète', 'Key dates of the Prophet', 'Grandes datas do Profeta')} →</Link>} />
          <FounderMedia />
          <ol className="relative space-y-8 border-l-2 border-gold/30 pl-6 sm:pl-8">
            {prophetHistory.map((c, i) => (
              <li key={c.id} className="relative">
                <span className="absolute -left-[2.1rem] top-0 grid h-8 w-8 place-items-center rounded-full bg-gold font-semibold text-night sm:-left-[2.6rem]" aria-hidden>{i + 1}</span>
                <h3 className="font-display text-xl font-semibold text-night">{c.title}</h3>
                <div className="prose-kcc mt-3 max-w-3xl">{c.paragraphs.map((p, j) => <p key={j}>{p}</p>)}</div>
                {c.hymn && (
                  <figure className="mt-2 max-w-md rounded-xl border border-gold/30 bg-gold-50/50 p-5">
                    <figcaption className="text-xs font-semibold uppercase tracking-wide text-gold-700">{c.hymn.note}</figcaption>
                    <p className="mt-3 whitespace-pre-line font-display italic leading-relaxed text-night/85">{c.hymn.lines.join('\n')}</p>
                  </figure>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="pgm" className="container-page scroll-mt-32 py-14">
        <SectionHeading eyebrow={tx('Musique', 'Music', 'Música')} title={pgmVision.title} description={pgmVision.intro} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pgmVision.axes.map((a, i) => (
            <div key={a.t} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <span className="font-display text-3xl font-semibold text-gold/70">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-semibold text-night">{a.t}</h3>
              <p className="mt-1 text-sm text-ink/60">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="chants" className="scroll-mt-32 bg-white py-14">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Chants', 'Songs', 'Cânticos')} title={tx('Paroles de chants', 'Song lyrics', 'Letras de cânticos')} action={<Link to="/cantiques" className="text-sm font-semibold text-gold-700 hover:underline">{tx('Recueil complet de cantiques', 'Full hymn book', 'Hinário completo')} →</Link>} />
          <div className="grid gap-6 lg:grid-cols-3">
            {songs.map((s) => (
              <Card key={s.id}>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2"><Badge tone="gold">{s.language}</Badge>{s.credit && <span className="text-xs text-ink/55">{s.credit}</span>}</div>
                  <h3 className="mt-3 font-display text-xl font-semibold text-night">{s.title}</h3>
                  <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink/80">
                    {s.stanzas.map((st, i) => (
                      <div key={i}>
                        {st.label && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold-700">{st.label}</p>}
                        <p className="whitespace-pre-line">{st.lines.join('\n')}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="caisse" className="container-page scroll-mt-32 py-14">
        <SectionHeading eyebrow={tx('Solidarité', 'Solidarity', 'Solidariedade')} title={socialFund.title} description={socialFund.preamble} />
        <Badge tone="amber">{socialFund.status}</Badge>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {socialFund.keyFacts.map((f) => (
            <div key={f.label} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{f.label}</p>
              <p className="mt-1 font-display text-xl font-semibold text-night">{f.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">{socialFund.principles.map((p) => <Badge key={p}>{p}</Badge>)}</div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {socialFund.titles.map((t) => (
            <details key={t.t} className="group rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <summary className="cursor-pointer list-none font-semibold text-night marker:hidden">
                <span className="flex items-center justify-between gap-3">{t.t}<span className="text-gold transition group-open:rotate-45" aria-hidden>+</span></span>
              </summary>
              <ul className="mt-3 space-y-2 text-sm text-ink/70">{t.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center font-display text-lg italic text-night/80">{socialFund.verse}</p>
      </section>
    </>
  );
}
