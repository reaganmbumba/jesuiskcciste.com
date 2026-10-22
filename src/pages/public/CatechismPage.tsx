import { useMemo, useState } from 'react';
import { ChevronDown, GraduationCap, RefreshCw, Eye, ListChecks } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import * as fr from '@/content/catechisme';
import * as en from '@/content/catechisme.en';
import * as pt from '@/content/catechisme.pt';
import type { CatechismItem } from '@/content/catechisme';
import { useI18n } from '@/i18n';
import { usePageTexts } from '@/features/content/pageTexts';

function Answer({ item }: { item: CatechismItem }) {
  return (
    <div className="text-[15px] leading-relaxed text-ink/80">
      <p>{item.a}</p>
      {item.list && (
        <ol className="mt-2 list-decimal space-y-1 pl-5">{item.list.map((l) => <li key={l}>{l}</li>)}</ol>
      )}
    </div>
  );
}

/** Mode « Testez-vous » : une question au hasard, la réponse s'affiche à la demande. */
function Quiz({ items }: { items: CatechismItem[] }) {
  const { tx } = useI18n();
  const [index, setIndex] = useState(() => Math.floor(Math.random() * items.length));
  const [shown, setShown] = useState(false);
  const [count, setCount] = useState(0);
  const item = items[index % items.length];
  const next = () => {
    let n = Math.floor(Math.random() * items.length);
    if (n === index) n = (n + 1) % items.length;
    setIndex(n); setShown(false); setCount((c) => c + 1);
  };
  return (
    <div className="rounded-3xl bg-night p-6 text-white shadow-lift sm:p-8">
      <p className="eyebrow text-gold-300">{tx('Testez-vous', 'Test yourself', 'Teste-se')} · {tx('question', 'question', 'pergunta')} {count + 1}</p>
      <p className="mt-3 font-display text-2xl font-semibold leading-snug">{item.q}</p>
      <div className={`mt-5 rounded-2xl bg-white/95 p-5 transition ${shown ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-live="polite">
        {shown && <Answer item={item} />}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {!shown && (
          <button type="button" onClick={() => setShown(true)} className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-night transition hover:bg-gold-300">
            <Eye className="h-4 w-4" aria-hidden />{tx('Voir la réponse', 'Show the answer', 'Ver a resposta')}
          </button>
        )}
        <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-gold/60">
          <RefreshCw className="h-4 w-4" aria-hidden />{tx('Autre question', 'Another question', 'Outra pergunta')}
        </button>
      </div>
    </div>
  );
}

/** Le Catéchisme du KCCisme en questions et réponses (voir src/content/catechisme.ts). */
export default function CatechismPage() {
  const { tx } = useI18n();
  const { catechism, catechismIntro, catechismSource, neophytePath } = usePageTexts('catechisme', { fr, en, pt });
  const all = useMemo(() => catechism.flatMap((g) => g.items), [catechism]);
  const total = all.length;

  return (
    <>
      <PageHeader eyebrow={tx('Instruction religieuse', 'Religious instruction', 'Instrução religiosa')} title={catechismIntro.title} description={tx(`${total} questions et réponses sur les croyances, l’enseignement, les fêtes, les sacrements et l’Alliance.`, `${total} questions and answers on the beliefs, teaching, feasts, sacraments and the Covenant.`, `${total} perguntas e respostas sobre as crenças, o ensino, as festas, os sacramentos e a Aliança.`)}>
        <nav aria-label={tx('Chapitres', 'Chapters', 'Capítulos')} className="flex flex-wrap gap-2">
          {catechism.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/85 transition hover:border-gold/50 hover:text-white">{g.title}</a>
          ))}
          <a href="#quiz" className="rounded-full border border-gold/50 bg-gold/10 px-3.5 py-1.5 text-sm text-gold-200 transition hover:text-white">{tx('Testez-vous', 'Test yourself', 'Teste-se')}</a>
        </nav>
      </PageHeader>

      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="prose-kcc lg:col-span-3">{catechismIntro.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
          <aside className="h-fit rounded-3xl border border-gold/25 bg-gold-50/40 p-6 lg:col-span-2">
            <div className="flex items-center gap-2 text-gold-700"><GraduationCap className="h-5 w-5" aria-hidden /><h2 className="font-display text-xl font-semibold text-night">{neophytePath.title}</h2></div>
            <p className="mt-2 text-sm text-ink/70">{neophytePath.intro}</p>
            <ol className="mt-4 space-y-4">
              {neophytePath.steps.map((s, i) => (
                <li key={s.name} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-night text-xs font-semibold text-gold">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-night">{s.name}</p>
                    <ul className="mt-1 space-y-0.5 text-sm text-ink/70">{s.learn.map((l) => <li key={l}>· {l}</li>)}</ul>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-ink/50">{neophytePath.source}</p>
          </aside>
        </div>
      </section>

      {catechism.map((g, gi) => (
        <section key={g.id} id={g.id} className={`scroll-mt-32 py-12 ${gi % 2 === 0 ? 'bg-white' : ''}`}>
          <div className="container-page">
            <SectionHeading eyebrow={`${tx('Chapitre', 'Chapter', 'Capítulo')} ${gi + 1}`} title={g.title} />
            <div className="grid gap-3 lg:grid-cols-2">
              {g.items.map((item, i) => (
                <details key={i} className="group h-fit rounded-2xl border border-night/[0.06] bg-mist/60 p-4 open:bg-white open:shadow-soft">
                  <summary className="flex cursor-pointer list-none items-start gap-3 font-semibold text-night">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-50 text-xs text-gold-700">{i + 1}</span>
                    <span className="flex-1">{item.q}</span>
                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-ink/40 transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="mt-3 pl-9"><Answer item={item} /></div>
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section id="quiz" className="container-page scroll-mt-32 py-14">
        <SectionHeading eyebrow={tx('Révision', 'Revision', 'Revisão')} title={tx('Testez vos connaissances', 'Test your knowledge', 'Teste os seus conhecimentos')} description={tx('Une question tirée au hasard parmi tout le catéchisme. Répondez de mémoire, puis vérifiez.', 'A random question from the whole catechism. Answer from memory, then check.', 'Uma pergunta ao acaso de todo o catecismo. Responda de memória e depois verifique.')} />
        <div className="mx-auto max-w-3xl"><Quiz items={all} /></div>
        <p className="mt-8 flex items-center gap-2 text-xs text-ink/50"><ListChecks className="h-4 w-4" aria-hidden />{tx('Source', 'Source', 'Fonte')} : {catechismSource}</p>
      </section>
    </>
  );
}
