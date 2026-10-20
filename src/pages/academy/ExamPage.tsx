import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { getQuiz, listMyAttempts, submitQuiz } from '@/services';
import { canAttempt } from '@/features/academy/grading';
import type { QuizAttemptResult } from '@/types';
import { cn } from '@/utils/format';
import { useI18n } from '@/i18n';

/**
 * Examen : le navigateur reçoit les questions SANS les bonnes réponses.
 * La correction, le calcul du score et l'émission du certificat sont faits
 * côté serveur (fonction SQL submit_quiz_attempt).
 */
export default function ExamPage() {
  const { quizId = '' } = useParams();
  const { profile } = useAuth();
  const { tx } = useI18n();
  const { notify } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, reload } = useAsync(async () => ({ quiz: await getQuiz(quizId), attempts: await listMyAttempts(quizId, profile!.id) }), [quizId]);

  if (loading) return <PageLoader />;
  if (!data?.quiz) return <div className="container-page py-16"><EmptyState title={tx('Examen introuvable.', 'Exam not found.', 'Exame não encontrado.')} /></div>;
  const { quiz, attempts } = data;
  const passed = attempts.some((a) => a.passed);
  const gate = canAttempt(attempts.length, quiz.maxAttempts, passed);
  const answered = Object.keys(answers).length;

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await submitQuiz(quiz.id, profile!.id, `${profile!.firstName} ${profile!.lastName}`, answers);
      setResult(r);
      setConfirm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('Soumission impossible.', 'Submission failed.', 'Submissão impossível.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <section className="container-page max-w-3xl py-12">
        <Card className="overflow-hidden">
          <div className={cn('p-8 text-center text-white', result.passed ? 'bg-gradient-to-br from-night to-night-500' : 'bg-gradient-to-br from-ink to-night-600')}>
            {result.passed ? <Award className="mx-auto h-12 w-12 text-gold" /> : <XCircle className="mx-auto h-12 w-12 text-red-300" />}
            <p className="mt-3 font-display text-5xl font-semibold">{result.score} %</p>
            <p className="mt-1 text-white/75">{result.correctCount} {tx('bonne(s) réponse(s) sur', 'correct answer(s) out of', 'resposta(s) certa(s) de')} {result.total} · {tx('seuil', 'pass mark', 'mínimo')} {quiz.passingScore} %</p>
            <p className="mt-3 text-lg font-semibold">{result.passed ? tx('Félicitations, examen réussi !', 'Congratulations, you passed!', 'Parabéns, exame aprovado!') : tx('Examen non réussi', 'Exam not passed', 'Exame não aprovado')}</p>
            {result.certificateCode && <p className="mt-2 text-sm text-gold-200">{tx('Certificat émis · identifiant', 'Certificate issued · ID', 'Certificado emitido · identificador')} <strong className="font-mono">{result.certificateCode}</strong></p>}
          </div>
          <CardBody>
            <DemoInline>{tx('Démonstration : la correction est simulée localement et le certificat n’existe que dans cet onglet.', 'Demo: marking is simulated locally and the certificate only exists in this tab.', 'Demonstração: a correção é simulada localmente e o certificado só existe neste separador.')}</DemoInline>
            <h2 className="mb-3 font-display text-xl font-semibold text-night">{tx('Correction', 'Answers', 'Correção')}</h2>
            <ol className="space-y-3">
              {quiz.questions.map((q, i) => {
                const c = result.corrections.find((x) => x.questionId === q.id)!;
                return (
                  <li key={q.id} className={cn('rounded-xl p-4 ring-1', c.isCorrect ? 'bg-emerald-50 ring-emerald-200' : 'bg-red-50 ring-red-200')}>
                    <p className="flex gap-2 font-medium text-night">{c.isCorrect ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="h-5 w-5 shrink-0 text-red-600" />}{i + 1}. {q.prompt}</p>
                    <p className="ml-7 mt-1 text-sm text-ink/70">{tx('Bonne réponse', 'Correct answer', 'Resposta certa')} : <strong>{q.options.find((o) => o.id === c.correctOptionId)?.label}</strong></p>
                    {c.explanation && <p className="ml-7 mt-1 text-sm italic text-ink/60">{c.explanation}</p>}
                  </li>
                );
              })}
            </ol>
            <div className="mt-6 flex flex-wrap gap-2">
              {result.passed ? <ButtonLink to="/espace/certificats" icon={<Award className="h-4 w-4" />}>{tx('Mes certificats', 'My certificates', 'Os meus certificados')}</ButtonLink> : <Button icon={<RotateCcw className="h-4 w-4" />} onClick={() => { setResult(null); setAnswers({}); void reload(); }}>{tx('Nouvelle tentative', 'Try again', 'Nova tentativa')}</Button>}
              <ButtonLink to="/espace/formations" variant="outline">{tx('Mes formations', 'My courses', 'As minhas formações')}</ButtonLink>
            </div>
          </CardBody>
        </Card>
      </section>
    );
  }

  return (
    <section className="container-page max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">{tx('Examen', 'Exam', 'Exame')}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-night">{quiz.title}</h1>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink/65">
        <span>{quiz.questions.length} questions</span><span>{tx('Seuil de réussite', 'Pass mark', 'Nota mínima')} : {quiz.passingScore} %</span>
        <span>{tx('Tentatives', 'Attempts', 'Tentativas')} : {attempts.length}/{quiz.maxAttempts}</span>
        {quiz.timeLimitMinutes && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{quiz.timeLimitMinutes} {tx('min conseillées', 'min recommended', 'min recomendados')}</span>}
      </div>
      <div className="mt-6"><DemoInline>{tx('Démonstration : la correction est simulée. En production, elle est réalisée par le serveur et les réponses ne sont jamais envoyées au navigateur avant la soumission.', 'Demo: marking is simulated. In production it is done by the server and the answers are never sent to the browser before submission.', 'Demonstração: a correção é simulada. Em produção, é feita pelo servidor e as respostas nunca são enviadas ao navegador antes da submissão.')}</DemoInline></div>
      {!gate.allowed ? (
        <EmptyState title={gate.reason ?? ''} action={<Link className="link-gold" to="/espace/certificats">{tx('Voir mes certificats', 'View my certificates', 'Ver os meus certificados')}</Link>} />
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setConfirm(true); }} className="space-y-4">
          {quiz.questions.map((q, i) => (
            <fieldset key={q.id} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <legend className="sr-only">{tx('Question', 'Question', 'Pergunta')} {i + 1}</legend>
              <p className="font-semibold text-night"><span className="text-gold-600">{i + 1}.</span> {q.prompt}</p>
              <div className="mt-3 space-y-2">
                {q.options.map((o) => (
                  <label key={o.id} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition', answers[q.id] === o.id ? 'border-gold bg-gold-50' : 'border-night/10 hover:border-gold/60')}>
                    <input type="radio" name={q.id} value={o.id} checked={answers[q.id] === o.id} onChange={() => setAnswers({ ...answers, [q.id]: o.id })} className="h-4 w-4 accent-[#101B33]" />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="sticky bottom-20 flex items-center justify-between rounded-2xl bg-night p-4 text-white shadow-lift lg:bottom-4">
            <span className="text-sm">{answered}/{quiz.questions.length} {tx('réponses', 'answers', 'respostas')}</span>
            <Button type="submit" variant="gold" disabled={answered === 0}>{tx('Soumettre l’examen', 'Submit the exam', 'Submeter o exame')}</Button>
          </div>
        </form>
      )}
      <ConfirmDialog open={confirm} title={tx('Soumettre l’examen ?', 'Submit the exam?', 'Submeter o exame?')} message={<>{tx('Vous avez répondu à', 'You answered', 'Respondeu a')} {answered}/{quiz.questions.length} question(s). {answered < quiz.questions.length && tx('Les questions sans réponse seront comptées comme fausses. ', 'Unanswered questions will be marked wrong. ', 'As perguntas sem resposta serão contadas como erradas. ')}{tx('Cette tentative sera décomptée.', 'This attempt will count.', 'Esta tentativa será contabilizada.')}</>} confirmLabel={tx('Soumettre', 'Submit', 'Submeter')} loading={submitting} onConfirm={submit} onCancel={() => setConfirm(false)} />
    </section>
  );
}
