import { BookMarked, Globe2, MapPin, Quote } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { ButtonLink } from '@/components/ui/Button';
import * as fr from '@/content/mon-appel';
import * as en from '@/content/mon-appel.en';
import * as pt from '@/content/mon-appel.pt';
import { useI18n } from '@/i18n';

/** « Mon Appel », le récit de l'appel du Prophète (1955-1957), et sa note biographique (voir src/content/mon-appel.ts). */
export default function CallingPage() {
  const { tx, pick } = useI18n();
  const { biography, callingBook, callingChapters, callingConclusion } = pick({ fr, en, pt });

  return (
    <>
      <PageHeader eyebrow={tx('Le livre du Prophète', 'The Prophet’s book', 'O livro do Profeta')} title={tx('L’appel du Prophète', 'The calling of the Prophet', 'O chamamento do Profeta')} description={tx('Du 8 mars 1955 au début de 1957 : apparitions, signes et épreuves par lesquels l’Éternel a appelé et préparé DIZOLELE-MPUNGU WAFIDUSWA Isaac.', 'From 8 March 1955 to early 1957: apparitions, signs and trials through which the Eternal called and prepared DIZOLELE-MPUNGU WAFIDUSWA Isaac.', 'De 8 de março de 1955 ao início de 1957: aparições, sinais e provações pelos quais o Eterno chamou e preparou DIZOLELE-MPUNGU WAFIDUSWA Isaac.')} />

      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="h-fit rounded-3xl bg-night p-7 text-white shadow-lift lg:col-span-2">
            <BookMarked className="h-7 w-7 text-gold" aria-hidden />
            <p className="mt-4 font-display text-4xl font-semibold text-gold">« {callingBook.title} »</p>
            <p className="mt-2 font-medium">{callingBook.author}</p>
            <p className="mt-1 text-sm text-white/60">{callingBook.published}</p>
            <blockquote className="mt-6 border-l-2 border-gold/60 pl-4 text-sm italic leading-relaxed text-white/80">{callingBook.preface}<footer className="mt-2 not-italic text-gold-300">{callingBook.prefaceAuthor}</footer></blockquote>
          </div>
          <div className="prose-kcc lg:col-span-3">
            {callingBook.intro.map((p, i) => <p key={i} className={i === 1 ? 'font-display text-xl italic text-night' : ''}>{p}</p>)}
            <div className="not-prose mt-6 flex flex-wrap gap-2">
              {callingChapters.map((c, i) => (
                <a key={c.id} href={`#${c.id}`} className="rounded-full border border-night/10 bg-white px-3 py-1 text-sm text-ink/70 transition hover:border-gold hover:text-night">{i + 1}. {c.title}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Le récit', 'The story', 'O relato')} title={tx('Douze étapes d’un appel', 'Twelve steps of a calling', 'Doze etapas de um chamamento')} />
          <ol className="relative mx-auto max-w-4xl space-y-10 border-l-2 border-gold/30 pl-6 sm:pl-10">
            {callingChapters.map((c, i) => (
              <li key={c.id} id={c.id} className="relative scroll-mt-32">
                <span className="absolute -left-[2.45rem] top-0 grid h-8 w-8 place-items-center rounded-full bg-night text-xs font-semibold text-gold ring-4 ring-white sm:-left-[3.45rem]">{i + 1}</span>
                <p className="text-sm font-semibold text-gold-700">{c.date}</p>
                <p className="flex items-center gap-1 text-xs text-ink/50"><MapPin className="h-3.5 w-3.5" aria-hidden />{c.place}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-night">{c.title}</h3>
                {c.quote && <p className="mt-3 flex gap-2 font-display text-lg italic text-night/80"><Quote className="mt-1 h-4 w-4 shrink-0 text-gold" aria-hidden />{c.quote}</p>}
                <div className="prose-kcc mt-3">{c.paragraphs.map((p, j) => <p key={j}>{p}</p>)}</div>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-12 max-w-3xl rounded-3xl border border-gold/30 bg-gold-50/40 p-6 text-center font-display text-lg italic text-night">{callingConclusion}</p>
        </div>
      </section>

      <section id="biographie" className="container-page scroll-mt-32 py-14">
        <SectionHeading eyebrow={tx('Son Éminence', 'His Eminence', 'Sua Eminência')} title={biography.title} />
        <div className="grid gap-8 lg:grid-cols-2">
          <dl className="space-y-3">
            {biography.facts.map((f) => (
              <div key={f.label} className="rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gold-700">{f.label}</dt>
                <dd className="mt-1 text-[15px] text-ink/85">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <h3 className="flex items-center gap-2 font-display text-2xl font-semibold text-night"><Globe2 className="h-5 w-5 text-gold" aria-hidden />{tx('Missions religieuses', 'Religious missions', 'Missões religiosas')}</h3>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {biography.missions.map((m) => (
                <li key={m.date + m.place} className="flex gap-3 rounded-2xl bg-night p-3 text-white">
                  <span className="w-20 shrink-0 font-display font-semibold text-gold">{m.date}</span><span className="text-sm text-white/80">{m.place}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-ink/60">{biography.missionsNote}</p>
            <h3 className="mt-8 font-display text-xl font-semibold text-night">{tx('Ouvrages', 'Works', 'Obras')}</h3>
            <ul className="mt-2 space-y-1 text-[15px] text-ink/80">{biography.works.map((w) => <li key={w}>· {w}</li>)}</ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/doctrine#prophete" variant="outline">{tx('Repères historiques', 'Historical milestones', 'Marcos históricos')}</ButtonLink>
              <ButtonLink to="/enseignements#histoire" variant="ghost">{tx('Autres récits', 'More stories', 'Outros relatos')}</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
