import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCircle2, Download, Lock, RotateCcw, Share2, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { OfficialParishList, OFFICIAL_PARISH_LIST_ID } from '@/components/common/OfficialParishList';
import { useI18n, type Locale } from '@/i18n';
import { cn } from '@/utils/format';
import * as docFr from '@/content/doctrine';
import * as docEn from '@/content/doctrine.en';
import * as docPt from '@/content/doctrine.pt';
import {
  ANOINTING_DECLARATION, NEOPHYTE_BOOK, NEOPHYTE_LESSONS, NEOPHYTE_STEPS, PASS_MARK, type NeophyteLesson, type NeophyteText,
} from '@/content/parcours-neophyte';
import { allPassed, clearProgress, isPassed, passedCount, readProgress, recordLesson, shuffled, writeProgress, type NeophyteProgress } from '@/features/neophyte/progress';
import { canvasToBlob, drawCertificate } from '@/features/neophyte/certificate';

const BASE = '/parcours-neophyte';
const TOTAL = NEOPHYTE_LESSONS.length;
const SITE = 'https://jesuiskcciste.com';

function useProgress() {
  const [progress, setProgress] = useState<NeophyteProgress>(readProgress);
  const update = (p: NeophyteProgress) => { setProgress(p); writeProgress(p); };
  return [progress, update] as const;
}

/** Parcours néophyte en ligne : les 12 leçons du carnet, un quiz par leçon, une attestation à la fin. */
export default function NeophyteCoursePage() {
  const { n } = useParams();
  const [progress, setProgress] = useProgress();
  const lesson = n ? NEOPHYTE_LESSONS.find((l) => String(l.n) === n) : undefined;
  useEffect(() => { window.scrollTo({ top: 0 }); }, [n]);
  if (n && lesson) return <LessonView key={lesson.n} lesson={lesson} progress={progress} setProgress={setProgress} />;
  return <Overview progress={progress} setProgress={setProgress} />;
}

function ProgressBar({ done, dark }: { done: number; dark?: boolean }) {
  const { tx } = useI18n();
  return (
    <div>
      <div className={cn('flex items-center justify-between text-sm font-semibold', dark ? 'text-white/80' : 'text-night')}>
        <span>{tx('Ma progression', 'My progress', 'O meu progresso')}</span>
        <span>{done} / {TOTAL}</span>
      </div>
      <div className={cn('mt-2 h-2.5 overflow-hidden rounded-full', dark ? 'bg-white/15' : 'bg-night/10')}>
        <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500 transition-all" style={{ width: `${(done / TOTAL) * 100}%` }} />
      </div>
    </div>
  );
}

function Overview({ progress, setProgress }: { progress: NeophyteProgress; setProgress: (p: NeophyteProgress) => void }) {
  const { tx, pick } = useI18n();
  const done = passedCount(progress);
  const next = NEOPHYTE_LESSONS.find((l) => !isPassed(progress, l.n));
  const reset = () => {
    if (!window.confirm(tx('Effacer toute ma progression sur ce téléphone ?', 'Erase all my progress on this phone?', 'Apagar todo o meu progresso neste telemóvel?'))) return;
    clearProgress();
    setProgress(readProgress());
  };
  return (
    <>
      <PageHeader
        eyebrow={tx('Pour les nouveaux convertis', 'For new converts', 'Para os novos convertidos')}
        title={tx('Parcours néophyte en ligne', 'Online neophyte course', 'Percurso do neófito em linha')}
        description={tx(
          'Les douze leçons du carnet du néophyte, une à une : je lis, je réponds à quatre questions, et à la fin je reçois mon attestation.',
          'The twelve lessons of the neophyte notebook, one by one: I read, I answer four questions, and at the end I receive my certificate.',
          'As doze lições do caderno do neófito, uma a uma: leio, respondo a quatro perguntas e, no fim, recebo o meu certificado.',
        )}
        image="/images/livres/parcours-neophyte-partage.jpg"
      >
        <div className="max-w-md rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
          <ProgressBar done={done} dark />
          <div className="mt-4 flex flex-wrap gap-3">
            {next ? (
              <ButtonLink to={`${BASE}/lecon/${next.n}`} variant="gold" icon={<BookOpen className="h-4 w-4" />}>
                {done === 0 ? tx('Commencer la leçon 1', 'Start lesson 1', 'Começar a lição 1') : tx(`Continuer : leçon ${next.n}`, `Continue: lesson ${next.n}`, `Continuar: lição ${next.n}`)}
              </ButtonLink>
            ) : (
              <a href="#attestation" className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-5 text-sm font-semibold text-night"><Award className="h-4 w-4" />{tx('Mon attestation', 'My certificate', 'O meu certificado')}</a>
            )}
          </div>
        </div>
      </PageHeader>

      <section className="container-page py-10 lg:py-14">
        <div className="rounded-3xl border border-gold/25 bg-gold-50/60 p-5 sm:p-6">
          <h2 className="font-display text-2xl font-medium text-night">{tx('Bienvenue dans l’Alliance de l’Éternel', 'Welcome to the Covenant of the Eternal', 'Bem-vindo à Aliança do Eterno')}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/75">
            {tx(
              'Tu es maintenant un néophyte : un mot qui veut dire « nouvelle plante ». Comme une jeune plante, tu vas grandir pas à pas, avec l’aide de ta paroisse. Ce parcours ne remplace pas ton accompagnateur ni ton enseignant : fais chaque leçon avec eux, puis vérifie ici ce que tu as retenu.',
              'You are now a neophyte: a word that means “new plant”. Like a young plant, you will grow step by step, with the help of your parish. This course does not replace your mentor or your teacher: take each lesson with them, then check here what you have learned.',
              'És agora um neófito: uma palavra que quer dizer «planta nova». Como uma planta jovem, vais crescer passo a passo, com a ajuda da tua paróquia. Este percurso não substitui o teu acompanhante nem o teu professor: faz cada lição com eles e verifica aqui o que aprendeste.',
            )}
          </p>
          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gold-700">{tx('Mon chemin : trois étapes', 'My path: three steps', 'O meu caminho: três etapas')}</h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {NEOPHYTE_STEPS.map((s) => (
              <li key={s.name.fr} className="rounded-2xl bg-white p-4 ring-1 ring-night/[0.06]">
                <p className="font-semibold text-night">{pick(s.name)}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/70">{pick(s.text)}</p>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="mt-12 font-display text-3xl font-medium text-night">{tx('Mes douze leçons', 'My twelve lessons', 'As minhas doze lições')}</h2>
        <p className="mt-1 text-sm text-ink/65">{tx(`Chaque leçon est réussie avec ${PASS_MARK} bonnes réponses sur 4. Tu peux recommencer autant de fois que tu veux.`, `Each lesson is passed with ${PASS_MARK} correct answers out of 4. You can try again as often as you like.`, `Cada lição é aprovada com ${PASS_MARK} respostas certas em 4. Podes recomeçar quantas vezes quiseres.`)}</p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NEOPHYTE_LESSONS.map((l) => {
            const ok = isPassed(progress, l.n);
            const res = progress.lessons[l.n];
            return (
              <li key={l.n}>
                <Link to={`${BASE}/lecon/${l.n}`} className={cn('group flex h-full items-start gap-4 rounded-2xl border bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift', ok ? 'border-gold/40' : 'border-night/[0.06]')}>
                  <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg font-semibold', ok ? 'bg-gold-400 text-night' : 'bg-night text-gold-200')}>
                    {ok ? <Check className="h-5 w-5" aria-hidden /> : l.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50">{tx('Leçon', 'Lesson', 'Lição')} {l.n}</span>
                    <span className="mt-0.5 block font-semibold leading-snug text-night">{pick(l.title)}</span>
                    <span className={cn('mt-1 block text-xs', ok ? 'text-gold-700' : 'text-ink/55')}>
                      {ok ? tx(`Réussie (${res?.score}/4)`, `Passed (${res?.score}/4)`, `Aprovada (${res?.score}/4)`) : res ? tx(`À refaire (${res.score}/4)`, `Try again (${res.score}/4)`, `A refazer (${res.score}/4)`) : tx('À faire', 'To do', 'Por fazer')}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <CertificateSection progress={progress} setProgress={setProgress} />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-night/[0.06]">
            <h3 className="font-semibold text-night">{tx('Le carnet en PDF', 'The notebook as a PDF', 'O caderno em PDF')}</h3>
            <p className="mt-1 text-sm text-ink/65">{tx('Pour écrire dedans, cocher et faire viser par ton accompagnateur.', 'To write in, tick off and have your mentor initial.', 'Para escrever, marcar e o teu acompanhante rubricar.')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={pick(NEOPHYTE_BOOK.pdf)} download className="inline-flex h-9 items-center gap-2 rounded-full border border-night/12 px-4 text-sm font-semibold text-night hover:border-gold-400 hover:bg-gold-50"><Download className="h-4 w-4" />{pick(NEOPHYTE_BOOK.title)}</a>
              <Link to={NEOPHYTE_BOOK.article} className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-night hover:bg-night/5">{tx('Les livres pour les enseignants', 'The books for teachers', 'Os livros para os professores')} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-night/[0.06]">
            <h3 className="font-semibold text-night">{tx('Pour aller plus loin', 'To go further', 'Para ir mais longe')}</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
              <Link to="/catechisme" className="rounded-full px-3 py-1.5 text-night ring-1 ring-night/10 hover:bg-gold-50">{tx('Catéchisme', 'Catechism', 'Catecismo')}</Link>
              <Link to="/doctrine" className="rounded-full px-3 py-1.5 text-night ring-1 ring-night/10 hover:bg-gold-50">{tx('Doctrine', 'Doctrine', 'Doutrina')}</Link>
              <Link to="/liturgie" className="rounded-full px-3 py-1.5 text-night ring-1 ring-night/10 hover:bg-gold-50">{tx('Rites et célébrations', 'Rites and celebrations', 'Ritos e celebrações')}</Link>
              <Link to="/cantiques" className="rounded-full px-3 py-1.5 text-night ring-1 ring-night/10 hover:bg-gold-50">{tx('Cantiques', 'Hymns', 'Cânticos')}</Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-ink/55">
          {tx(
            'Ta progression reste sur ce téléphone (ou cet ordinateur), même sans connexion. Les leçons reprennent le carnet « Mon carnet de néophyte » du Prédicateur Reagan MBUMBA ; les réponses viennent du Catéchisme de l’EBNM et des textes officiels de l’Église.',
            'Your progress stays on this phone (or computer), even offline. The lessons follow the notebook “Mon carnet de néophyte” by Preacher Reagan MBUMBA; the answers come from the EBNM Catechism and the Church’s official texts.',
            'O teu progresso fica neste telemóvel (ou computador), mesmo sem ligação. As lições seguem o caderno «Mon carnet de néophyte» do Pregador Reagan MBUMBA; as respostas vêm do Catecismo da EBNM e dos textos oficiais da Igreja.',
          )}
          {done > 0 && <> <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-semibold text-ink/70 underline hover:text-night"><RotateCcw className="h-3 w-3" />{tx('Recommencer à zéro', 'Start again from scratch', 'Recomeçar do zero')}</button></>}
        </p>
      </section>
    </>
  );
}

const DOCTRINE: Record<Locale, typeof docFr> = { fr: docFr, en: docEn as unknown as typeof docFr, pt: docPt as unknown as typeof docFr };
const LANG_PREFIX: Record<Locale, string> = { fr: 'Français', en: 'English', pt: 'Português' };

function OfficialText({ kind }: { kind: NeophyteText }) {
  const { tx, pick, locale } = useI18n();
  const doc = DOCTRINE[locale];
  const box = (title: string, children: React.ReactNode) => (
    <div className="rounded-2xl border border-night/[0.08] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">{tx('Texte officiel à apprendre', 'Official text to learn', 'Texto oficial a aprender')}</p>
      <h3 className="mt-1 font-display text-xl font-medium text-night">{title}</h3>
      <div className="mt-3 text-[15px] leading-relaxed text-ink/80">{children}</div>
    </div>
  );
  if (kind === 'attributes') {
    return box(tx('Les attributs de l’Éternel', 'The attributes of the Eternal', 'Os atributos do Eterno'), (
      <ul className="flex flex-wrap gap-2">{doc.oracle.attributes.map((a) => <li key={a} className="rounded-full bg-gold-50 px-3 py-1 text-sm font-medium text-night ring-1 ring-gold/25">{a}</li>)}</ul>
    ));
  }
  if (kind === 'oracle') return box(doc.oracle.title, <p className="font-display text-xl italic text-night">{doc.oracle.quote}</p>);
  if (kind === 'feasts') {
    return box(tx('Les fêtes de l’Église', 'The feasts of the Church', 'As festas da Igreja'), (
      <ul className="space-y-2">{doc.feasts.map((f) => <li key={f.t}><span className="font-semibold text-night">{f.date} · {f.t}.</span> <span className="text-ink/70">{f.d}</span></li>)}</ul>
    ));
  }
  if (kind === 'profession') {
    return box(doc.professionOfFaith.title, (
      <>
        <p className="text-sm italic text-ink/60">{doc.professionOfFaith.rite}</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">{doc.professionOfFaith.articles.map((a) => <li key={a}>{a}</li>)}</ol>
      </>
    ));
  }
  if (kind === 'declaration') {
    return box(tx('Déclaration du bénéficiaire de la Première Onction', 'Declaration of the recipient of the First Anointing', 'Declaração do beneficiário da Primeira Unção'), <p className="font-display text-lg text-night">{pick(ANOINTING_DECLARATION)}</p>);
  }
  const list = doc.lawTexts.find((t) => t.id === kind);
  if (!list) return null;
  const version = list.versions.find((v) => v.lang.startsWith(LANG_PREFIX[locale])) ?? list.versions[0];
  const lingala = list.versions.find((v) => v.lang.startsWith('Lingala'));
  return box(list.title, (
    <>
      <ol className="list-decimal space-y-1.5 pl-5">{version.items.map((i) => <li key={i}>{i}</li>)}</ol>
      {lingala && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-semibold text-night">{tx('En lingala', 'In Lingala', 'Em lingala')}</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink/70">{lingala.items.map((i) => <li key={i}>{i}</li>)}</ol>
        </details>
      )}
    </>
  ));
}

function LessonView({ lesson, progress, setProgress }: { lesson: NeophyteLesson; progress: NeophyteProgress; setProgress: (p: NeophyteProgress) => void }) {
  const { tx, pick } = useI18n();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(1);
  const [answers, setAnswers] = useState<(number | null)[]>(() => lesson.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const orders = useMemo(() => lesson.questions.map((q, i) => shuffled(q.options, lesson.n * 97 + i * 13 + attempt * 7919)), [lesson, attempt]);
  const score = answers.filter((a) => a === 0).length;
  const passed = score >= PASS_MARK;
  const nextLesson = NEOPHYTE_LESSONS.find((l) => l.n === lesson.n + 1);
  const best = progress.lessons[lesson.n];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (answers.some((a) => a === null)) return;
    setSubmitted(true);
    setProgress(recordLesson(progress, lesson.n, score));
  };
  const retry = () => {
    setAttempt((a) => a + 1);
    setAnswers(lesson.questions.map(() => null));
    setSubmitted(false);
    document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' });
  };

  const boxes: [string, string | undefined][] = [
    [tx('Je lis', 'I read', 'Leio'), lesson.read && pick(lesson.read)],
    [tx('J’apprends', 'I learn', 'Aprendo'), lesson.learn && pick(lesson.learn)],
    [tx('Je m’exerce', 'I practise', 'Pratico'), lesson.practice && pick(lesson.practice)],
    [tx('Je réfléchis', 'I reflect', 'Reflito'), lesson.reflect && pick(lesson.reflect)],
    [tx('Je vérifie avec mon accompagnateur', 'I check with my mentor', 'Verifico com o meu acompanhante'), lesson.check && pick(lesson.check)],
    [tx('Étape', 'Step', 'Etapa'), lesson.step && pick(lesson.step)],
  ];

  return (
    <>
      <PageHeader
        eyebrow={tx(`Parcours néophyte · leçon ${lesson.n} sur ${TOTAL}`, `Neophyte course · lesson ${lesson.n} of ${TOTAL}`, `Percurso do neófito · lição ${lesson.n} de ${TOTAL}`)}
        title={pick(lesson.title)}
        image="/images/livres/parcours-neophyte-partage.jpg"
        metaDescription={pick(lesson.body)}
        views={false}
      >
        <Link to={BASE} className="inline-flex items-center gap-2 text-sm font-semibold text-gold-200 hover:text-white"><ArrowLeft className="h-4 w-4" />{tx('Toutes les leçons', 'All lessons', 'Todas as lições')}</Link>
      </PageHeader>

      <section className="container-page max-w-3xl py-10 lg:py-12">
        <p className="text-lg leading-relaxed text-ink/85">{pick(lesson.body)}</p>
        <dl className="mt-6 grid gap-3">
          {boxes.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-gold-50/70 px-4 py-3 ring-1 ring-gold/20">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gold-700">{k}</dt>
              <dd className="mt-0.5 text-[15px] text-night">{v}</dd>
            </div>
          ))}
        </dl>
        {lesson.texts && <div className="mt-6 space-y-4">{lesson.texts.map((t) => <OfficialText key={t} kind={t} />)}</div>}
        {lesson.n === 8 && (
          <p className="mt-4 text-sm"><Link to="/liturgie" className="font-semibold text-night underline decoration-gold hover:text-gold-700">{tx('La prière de purification : page « Rites et célébrations »', 'The prayer of purification: “Rites and celebrations” page', 'A oração de purificação: página «Ritos e celebrações»')}</Link></p>
        )}

        <form id="quiz" onSubmit={submit} className="mt-10 scroll-mt-24 rounded-3xl border border-night/[0.08] bg-white p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-2xl font-medium text-night">{tx('Je réponds aux questions', 'I answer the questions', 'Respondo às perguntas')}</h2>
          <p className="mt-1 text-sm text-ink/60">
            {tx(`${PASS_MARK} bonnes réponses sur 4 pour réussir la leçon.`, `${PASS_MARK} correct answers out of 4 to pass the lesson.`, `${PASS_MARK} respostas certas em 4 para aprovar a lição.`)}
            {best && ` ${tx('Meilleur résultat', 'Best result', 'Melhor resultado')} : ${best.score}/4.`}
          </p>
          <ol className="mt-5 space-y-6">
            {lesson.questions.map((q, qi) => {
              const chosen = answers[qi];
              return (
                <li key={q.q.fr}>
                  <fieldset>
                    <legend className="font-semibold text-night">{qi + 1}. {pick(q.q)}</legend>
                    <div className="mt-3 grid gap-2">
                      {orders[qi].map(({ item, index }) => {
                        const selected = chosen === index;
                        const showRight = submitted && index === 0;
                        const showWrong = submitted && selected && index !== 0;
                        return (
                          <label
                            key={index}
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[15px] transition',
                              showRight ? 'border-emerald-500 bg-emerald-50' : showWrong ? 'border-red-400 bg-red-50' : selected ? 'border-gold-500 bg-gold-50' : 'border-night/10 hover:border-gold-300',
                              submitted && 'cursor-default',
                            )}
                          >
                            <input
                              type="radio"
                              name={`q${qi}`}
                              className="mt-1 accent-[#C49643]"
                              checked={selected}
                              disabled={submitted}
                              onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? index : v)))}
                            />
                            <span className="flex-1">{pick(item)}</span>
                            {showRight && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-label={tx('Bonne réponse', 'Correct answer', 'Resposta certa')} />}
                            {showWrong && <X className="h-5 w-5 shrink-0 text-red-500" aria-label={tx('Mauvaise réponse', 'Wrong answer', 'Resposta errada')} />}
                          </label>
                        );
                      })}
                    </div>
                    {submitted && <p className="mt-2 text-sm text-ink/70">{pick(q.explain)}</p>}
                  </fieldset>
                </li>
              );
            })}
          </ol>

          {!submitted ? (
            <Button type="submit" variant="gold" className="mt-6 w-full sm:w-auto" disabled={answers.some((a) => a === null)}>{tx('Valider mes réponses', 'Check my answers', 'Validar as minhas respostas')}</Button>
          ) : (
            <div className={cn('mt-6 rounded-2xl p-4', passed ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-gold-50 ring-1 ring-gold/30')}>
              <p className="font-display text-xl font-medium text-night">
                {passed
                  ? tx(`Bravo ! ${score}/4 : leçon réussie.`, `Well done! ${score}/4: lesson passed.`, `Parabéns! ${score}/4: lição aprovada.`)
                  : tx(`${score}/4 : relis la leçon et recommence.`, `${score}/4: read the lesson again and try again.`, `${score}/4: relê a lição e recomeça.`)}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {passed && nextLesson && <Button variant="gold" onClick={() => navigate(`${BASE}/lecon/${nextLesson.n}`)} icon={<ArrowRight className="h-4 w-4" />}>{tx(`Leçon ${nextLesson.n}`, `Lesson ${nextLesson.n}`, `Lição ${nextLesson.n}`)}</Button>}
                {passed && !nextLesson && <Button variant="gold" onClick={() => navigate(`${BASE}#attestation`)} icon={<Award className="h-4 w-4" />}>{tx('Mon attestation', 'My certificate', 'O meu certificado')}</Button>}
                <Button variant="outline" onClick={retry} icon={<RotateCcw className="h-4 w-4" />}>{tx('Recommencer le quiz', 'Retake the quiz', 'Repetir o teste')}</Button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-8"><ProgressBar done={passedCount(progress)} /></div>
        <nav className="mt-6 flex items-center justify-between gap-3 text-sm font-semibold">
          {lesson.n > 1 ? <Link to={`${BASE}/lecon/${lesson.n - 1}`} className="inline-flex items-center gap-1 text-night hover:text-gold-700"><ArrowLeft className="h-4 w-4" />{tx('Leçon', 'Lesson', 'Lição')} {lesson.n - 1}</Link> : <span />}
          {nextLesson ? <Link to={`${BASE}/lecon/${nextLesson.n}`} className="inline-flex items-center gap-1 text-night hover:text-gold-700">{tx('Leçon', 'Lesson', 'Lição')} {nextLesson.n}<ArrowRight className="h-4 w-4" /></Link> : <Link to={BASE} className="text-night hover:text-gold-700">{tx('Toutes les leçons', 'All lessons', 'Todas as lições')}</Link>}
        </nav>
      </section>
    </>
  );
}

function CertificateSection({ progress, setProgress }: { progress: NeophyteProgress; setProgress: (p: NeophyteProgress) => void }) {
  const { tx, locale } = useI18n();
  const ready = allPassed(progress);
  const [name, setName] = useState(progress.name);
  const [parish, setParish] = useState(progress.parish);
  const [mentor, setMentor] = useState(progress.mentor);
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    if (ready && location.hash === '#attestation') document.getElementById('attestation')?.scrollIntoView();
  }, [ready]);

  const make = async (e: FormEvent) => {
    e.preventDefault();
    const clean = { name: name.trim().replace(/\s+/g, ' '), parish: parish.trim(), mentor: mentor.trim() };
    if (clean.name.length < 3) { setError(true); return; }
    setError(false);
    setBusy(true);
    const saved = { ...progress, ...clean };
    setProgress(saved);
    try {
      const canvas = await drawCertificate({ ...clean, date: new Date(saved.doneAt ?? Date.now()), locale });
      const b = await canvasToBlob(canvas);
      if (b) {
        setBlob(b);
        setUrl(URL.createObjectURL(b));
      }
    } finally {
      setBusy(false);
    }
  };

  const fileName = `attestation-parcours-neophyte-${name.trim().toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kcc'}.png`;
  const share = async () => {
    const text = tx(
      `J’ai terminé le parcours néophyte en ligne de JE SUIS KCCiste ! Les 12 leçons du carnet du néophyte : ${SITE}${BASE}`,
      `I have finished the JE SUIS KCCiste online neophyte course! The 12 lessons of the neophyte notebook: ${SITE}${BASE}`,
      `Terminei o percurso do neófito em linha de JE SUIS KCCiste! As 12 lições do caderno do neófito: ${SITE}${BASE}`,
    );
    const file = blob ? new File([blob], fileName, { type: 'image/png' }) : null;
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
    } catch { /* partage annulé */ }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  return (
    <div id="attestation" className="mt-12 scroll-mt-24 rounded-3xl bg-night-900 p-5 text-white sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-400 text-night">{ready ? <Award className="h-6 w-6" /> : <Lock className="h-6 w-6" />}</span>
        <div>
          <h2 className="font-display text-2xl font-medium sm:text-3xl">{tx('Mon attestation', 'My certificate', 'O meu certificado')}</h2>
          <p className="mt-1 text-sm text-white/70">
            {ready
              ? tx('Tu as réussi les douze leçons ! Écris ton nom pour recevoir ton attestation, puis montre-la à ton accompagnateur pour qu’il la vise.', 'You have passed all twelve lessons! Write your name to receive your certificate, then show it to your mentor so they can initial it.', 'Foste aprovado nas doze lições! Escreve o teu nome para receber o teu certificado e mostra-o ao teu acompanhante para que o rubrique.')
              : tx(`Elle s’ouvre quand les douze leçons sont réussies (${passedCount(progress)}/${TOTAL} pour l’instant).`, `It unlocks when all twelve lessons are passed (${passedCount(progress)}/${TOTAL} so far).`, `Abre-se quando as doze lições estiverem aprovadas (${passedCount(progress)}/${TOTAL} por agora).`)}
          </p>
        </div>
      </div>

      {ready && (
        <form onSubmit={make} className="mt-6 grid gap-4 rounded-2xl bg-white p-5 text-ink sm:grid-cols-3">
          <Field label={tx('Nom, postnom, prénom', 'Full name', 'Nome completo')} required>
            {(f) => <Input {...f} value={name} onChange={(e) => setName(e.target.value)} maxLength={70} autoComplete="name" />}
          </Field>
          <Field label={tx('Ma paroisse', 'My parish', 'A minha paróquia')}>
            {(f) => <Input {...f} value={parish} onChange={(e) => setParish(e.target.value)} maxLength={90} list={OFFICIAL_PARISH_LIST_ID} />}
          </Field>
          <Field label={tx('Mon accompagnateur', 'My mentor', 'O meu acompanhante')} hint={tx('Facultatif', 'Optional', 'Facultativo')}>
            {(f) => <Input {...f} value={mentor} onChange={(e) => setMentor(e.target.value)} maxLength={70} />}
          </Field>
          <OfficialParishList />
          {error && <p className="text-sm text-red-600 sm:col-span-3">{tx('Écris ton nom (3 lettres au moins).', 'Write your name (at least 3 letters).', 'Escreve o teu nome (3 letras pelo menos).')}</p>}
          <div className="sm:col-span-3">
            <Button type="submit" variant="gold" loading={busy} icon={<Award className="h-4 w-4" />}>{tx('Créer mon attestation', 'Create my certificate', 'Criar o meu certificado')}</Button>
          </div>
        </form>
      )}

      {url && (
        <div className="mt-6">
          <img src={url} alt={tx('Mon attestation du parcours néophyte', 'My neophyte course certificate', 'O meu certificado do percurso do neófito')} className="w-full rounded-xl shadow-lift" />
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={url} download={fileName} className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-5 text-sm font-semibold text-night"><Download className="h-4 w-4" />{tx('Télécharger l’image', 'Download the image', 'Descarregar a imagem')}</a>
            <Button variant="light" onClick={share} icon={<Share2 className="h-4 w-4" />}>{tx('Partager', 'Share', 'Partilhar')}</Button>
          </div>
          <p className="mt-3 text-xs text-white/60">{tx('Cette attestation ne remplace pas les sacrements : c’est le conseil de ta paroisse qui décide quand tu es prêt.', 'This certificate does not replace the sacraments: your parish council decides when you are ready.', 'Este certificado não substitui os sacramentos: é o conselho da tua paróquia que decide quando estás pronto.')}</p>
        </div>
      )}
    </div>
  );
}
