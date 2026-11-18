import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Info, Lock, MessageCircleQuestion, Search, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { ShareButtons } from '@/components/common/ShareButtons';
import { useI18n } from '@/i18n';
import { buildCorpus } from '@/features/assistant/corpus';
import { buildIndex, highlight, search, SUGGESTIONS, type Hit } from '@/features/assistant/search';

const MAX_LEN = 300;

/** Un morceau de texte autour du premier mot trouvé, pour les passages secondaires. */
function excerpt(text: string, terms: string[], max = 380): string {
  if (text.length <= max) return text;
  const parts = highlight(text, terms);
  let pos = 0;
  let at = 0;
  for (const p of parts) { if (p.on) { at = pos; break; } pos += p.t.length; }
  const start = Math.max(0, Math.min(at - 80, text.length - max));
  const cut = text.slice(start, start + max);
  return `${start > 0 ? '… ' : ''}${cut.trim()}${start + max < text.length ? ' …' : ''}`;
}

function Marked({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlight(text, terms).map((p, i) => (p.on ? <mark key={i} className="rounded bg-gold/25 px-0.5 text-night">{p.t}</mark> : <span key={i}>{p.t}</span>))}
    </>
  );
}

function Paragraphs({ text, terms }: { text: string; terms: string[] }) {
  return (
    <div className="space-y-2 text-[15px] leading-relaxed text-ink/85">
      {text.split('\n').filter(Boolean).map((line, i) => <p key={i}><Marked text={line} terms={terms} /></p>)}
    </div>
  );
}

function SourceLink({ hit }: { hit: Hit }) {
  const { tx } = useI18n();
  return (
    <Link to={hit.passage.url} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 underline-offset-2 hover:underline">
      {tx('Lire sur la page', 'Read on the page', 'Ler na página')} « {hit.passage.source.split(' · ')[0]} »<ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

/**
 * Assistant KCC : on pose une question sur la foi, il répond seulement avec les
 * textes officiels publiés sur le site, en citant la source. Il ne rédige rien.
 */
export default function AssistantPage() {
  const { tx, locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const asked = (params.get('q') ?? '').slice(0, MAX_LEN);
  const [draft, setDraft] = useState(asked);
  const resultRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(buildCorpus(locale)), [locale]);
  const result = useMemo(() => (asked.trim() ? search(index, asked) : null), [index, asked]);

  useEffect(() => { setDraft(asked); }, [asked]);
  useEffect(() => {
    if (result) setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [result]);

  const ask = (q: string) => {
    const v = q.trim().slice(0, MAX_LEN);
    if (v) setParams({ q: v });
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); ask(draft); };

  const best = result?.confident ? result.hits[0] : null;
  const others = result ? (best ? result.hits.slice(1, 5) : result.hits.slice(0, 4)) : [];
  const frOnly = tx('', ' (texte en français)', ' (texto em francês)');

  return (
    <>
      <PageHeader
        eyebrow={tx('Assistant KCC', 'KCC Assistant', 'Assistente KCC')}
        title={tx('Posez votre question sur la foi', 'Ask your question about the faith', 'Faça a sua pergunta sobre a fé')}
        description={tx(
          'L’Assistant répond uniquement avec les textes officiels publiés sur le site (catéchisme, doctrine, liturgie, Mon Appel, prédications, parcours du néophyte…), et indique toujours la source.',
          'The Assistant answers only with the official texts published on the site (catechism, doctrine, liturgy, Mon Appel, sermons, neophyte course…), and always gives the source.',
          'O Assistente responde apenas com os textos oficiais publicados no site (catecismo, doutrina, liturgia, Mon Appel, pregações, percurso do neófito…) e indica sempre a fonte.',
        )}
      />

      <section className="container-page py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <form onSubmit={onSubmit} className="rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <label htmlFor="assistant-q" className="flex items-center gap-2 font-display text-lg font-semibold text-night">
              <MessageCircleQuestion className="h-5 w-5 text-gold-700" aria-hidden />
              {tx('Votre question', 'Your question', 'A sua pergunta')}
            </label>
            <textarea
              id="assistant-q"
              value={draft}
              maxLength={MAX_LEN}
              rows={2}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(draft); } }}
              placeholder={tx('Ex. : Que dit le catéchisme sur le baptême ?', 'E.g.: What does the catechism say about baptism?', 'Ex.: O que diz o catecismo sobre o batismo?')}
              className="mt-3 w-full resize-none rounded-2xl border border-night/10 bg-mist/40 px-4 py-3 text-[15px] text-night outline-none transition focus:border-gold focus:bg-white"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ink/55">{tx('Gratuit, sans compte. Fonctionne aussi sans internet une fois la page ouverte.', 'Free, no account needed. Also works offline once the page is open.', 'Grátis, sem conta. Também funciona sem internet depois de abrir a página.')}</p>
              <Button type="submit" disabled={!draft.trim()}><Search className="mr-2 h-4 w-4" aria-hidden />{tx('Chercher la réponse', 'Find the answer', 'Procurar a resposta')}</Button>
            </div>
          </form>

          {!result && (
            <div>
              <p className="text-sm font-semibold text-night">{tx('Quelques questions pour commencer', 'Some questions to start with', 'Algumas perguntas para começar')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS[locale].map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-night/10 bg-white px-4 py-2 text-left text-sm text-night transition hover:border-gold">{s}</button>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div ref={resultRef} className="scroll-mt-28 space-y-6" aria-live="polite">
              {result.missing.filter((m) => m.replacedBy?.length).map((m) => (
                <p key={m.word} className="flex gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-950">
                  <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <span>{tx(
                    `Le mot « ${m.word} » n’apparaît pas dans les textes officiels du site. Voici ce qu’ils disent de : ${m.replacedBy!.join(', ')}.`,
                    `The word “${m.word}” does not appear in the site’s official texts. Here is what they say about: ${m.replacedBy!.join(', ')}.`,
                    `A palavra «${m.word}» não aparece nos textos oficiais do site. Eis o que dizem sobre: ${m.replacedBy!.join(', ')}.`,
                  )}</span>
                </p>
              ))}

              {best ? (
                <article className="rounded-3xl border border-gold/30 bg-white p-5 shadow-lift sm:p-7">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-700">
                    <BookOpenCheck className="h-4 w-4" aria-hidden />{tx('Ce que disent les textes officiels', 'What the official texts say', 'O que dizem os textos oficiais')}
                  </p>
                  <h2 className="mt-3 font-display text-xl font-semibold text-night sm:text-2xl"><Marked text={best.passage.title} terms={result.terms} /></h2>
                  <div className="mt-4"><Paragraphs text={best.passage.text.length > 1500 ? `${best.passage.text.slice(0, 1500).trim()} …` : best.passage.text} terms={result.terms} /></div>
                  <p className="mt-5 text-sm text-ink/60">{tx('Source', 'Source', 'Fonte')} : {best.passage.source}{best.passage.frOnly ? frOnly : ''}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <SourceLink hit={best} />
                    <ShareButtons size="sm" url={`/assistant?q=${encodeURIComponent(asked)}`} title={`${tx('Assistant KCC', 'KCC Assistant', 'Assistente KCC')} : ${asked}`} text={`${best.passage.title}\n${excerpt(best.passage.text, [], 240)}\n(${best.passage.source})`} />
                  </div>
                </article>
              ) : (
                <div className="rounded-3xl bg-amber-50 p-5 text-amber-950 sm:p-6">
                  <p className="font-display text-lg font-semibold">{tx('Les textes du site ne répondent pas clairement à cette question', 'The site’s texts do not clearly answer this question', 'Os textos do site não respondem claramente a esta pergunta')}</p>
                  <p className="mt-2 text-sm leading-relaxed">{tx(
                    'L’Assistant ne répond qu’avec les textes officiels et n’invente rien. Pour cette question, adressez-vous à un prédicateur ou au responsable de votre paroisse, ou posez-la sur le forum. Vous pouvez aussi reformuler avec d’autres mots.',
                    'The Assistant only answers with the official texts and makes nothing up. For this question, ask a preacher or your parish leader, or post it on the forum. You can also rephrase with other words.',
                    'O Assistente só responde com os textos oficiais e não inventa nada. Para esta pergunta, dirija-se a um pregador ou ao responsável da sua paróquia, ou coloque-a no fórum. Também pode reformular com outras palavras.',
                  )}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <Link to="/forum" className="inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-2 font-semibold text-gold hover:bg-deep"><UserRound className="h-4 w-4" aria-hidden />{tx('Poser la question sur le forum', 'Ask on the forum', 'Perguntar no fórum')}</Link>
                    <Link to="/paroisses" className="rounded-full border border-amber-900/20 px-4 py-2 font-semibold hover:border-gold">{tx('Trouver ma paroisse', 'Find my parish', 'Encontrar a minha paróquia')}</Link>
                  </div>
                </div>
              )}

              {others.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-night">
                    {best ? tx('Autres passages sur le sujet', 'Other passages on the subject', 'Outras passagens sobre o assunto') : tx('Passages qui en parlent peut-être', 'Passages that may be related', 'Passagens que talvez falem disso')}
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {others.map((h) => (
                      <li key={h.passage.id} className="rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">{h.passage.source}{h.passage.frOnly ? frOnly : ''}</p>
                        <p className="mt-1 font-semibold text-night"><Marked text={h.passage.title} terms={result.terms} /></p>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink/75"><Marked text={excerpt(h.passage.text, result.terms)} terms={result.terms} /></p>
                        <div className="mt-2"><SourceLink hit={h} /></div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button type="button" onClick={() => { setParams({}); setDraft(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-semibold text-night underline underline-offset-2">
                {tx('Poser une autre question', 'Ask another question', 'Fazer outra pergunta')}
              </button>
            </div>
          )}

          <aside className="rounded-2xl bg-mist/60 p-5 text-sm leading-relaxed text-ink/75">
            <p className="font-semibold text-night">{tx('Comment répond l’Assistant ?', 'How does the Assistant answer?', 'Como responde o Assistente?')}</p>
            <p className="mt-1">{tx(
              'Il ne rédige aucune réponse lui-même : il cherche dans les textes officiels publiés sur le site et vous montre le passage exact, avec le lien vers sa page. Pour une question personnelle ou un point qui n’est pas écrit, adressez-vous à un prédicateur.',
              'It writes no answer itself: it searches the official texts published on the site and shows you the exact passage, with a link to its page. For a personal question or a point that is not written, ask a preacher.',
              'Não redige nenhuma resposta: procura nos textos oficiais publicados no site e mostra-lhe a passagem exata, com o link para a página. Para uma pergunta pessoal ou um ponto que não está escrito, dirija-se a um pregador.',
            )}</p>
            <p className="mt-3 flex gap-2"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden /><span>{tx(
              'Le livre « Le KCCisme », réservé avec un code d’accès, n’est pas consulté par l’Assistant.',
              'The book “Le KCCisme”, reserved with an access code, is not searched by the Assistant.',
              'O livro «Le KCCisme», reservado com um código de acesso, não é consultado pelo Assistente.',
            )} <Link to="/livre-kccisme" className="font-semibold text-gold-700 underline">{tx('Le livre', 'The book', 'O livro')}</Link></span></p>
          </aside>
        </div>
      </section>
    </>
  );
}
