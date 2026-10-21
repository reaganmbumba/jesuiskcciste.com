import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Circle, ClipboardCheck, FileText, Lock, PlayCircle, Type } from 'lucide-react';
import { PageHeader, ProgressBar } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { DemoInline } from '@/components/common/DemoNotice';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { enroll, getCourseBySlug, listMyEnrollments, markLessonDone } from '@/services';
import { isEditorial } from '@/content/editorial';
import { accessLabel, levelLabel } from '@/features/academy/labels';
import type { Enrollment, Lesson } from '@/types';
import { cn } from '@/utils/format';
import { useI18n } from '@/i18n';

const lessonIcon = { text: Type, video: PlayCircle, pdf: FileText };

export default function CourseDetailPage() {
  const { slug = '' } = useParams();
  const { profile } = useAuth();
  const { tx, locale } = useI18n();
  const { notify } = useToast();
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, setData } = useAsync(async () => {
    const course = await getCourseBySlug(slug);
    const enrollment = profile && course ? (await listMyEnrollments(profile.id)).find((e) => e.courseId === course.id) ?? null : null;
    return { course, enrollment };
  }, [slug, profile?.id]);

  if (loading) return <PageLoader />;
  if (!data?.course) return <div className="container-page py-16"><EmptyState title={tx('Formation introuvable.', 'Course not found.', 'Formação não encontrada.')} action={<ButtonLink to="/academie/formations" variant="outline">{tx('Catalogue', tx('Catalogue', 'Catalogue', 'Catálogo'), 'Catálogo')}</ButtonLink>} /></div>;
  const { course, enrollment } = data;
  const access = accessLabel(course.access, locale);
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const setEnrollment = (e: Enrollment) => setData({ course, enrollment: e });
  const free = isEditorial(course.id);
  const canEnroll = course.access === 'open' || (course.access === 'members' && profile?.status === 'active');

  const doEnroll = async () => {
    if (!profile) return;
    setBusy(true);
    try { setEnrollment(await enroll(course.id, profile.id)); notify(tx('Inscription à la formation confirmée.', 'Course enrolment confirmed.', 'Inscrição na formação confirmada.')); } catch (e) { notify(e instanceof Error ? e.message : tx('Erreur', 'Error', 'Erro'), 'error'); } finally { setBusy(false); }
  };
  const done = async (l: Lesson) => {
    if (!profile) return;
    try { setEnrollment(await markLessonDone(course, l.id, profile.id)); } catch (e) { notify(e instanceof Error ? e.message : tx('Erreur', 'Error', 'Erro'), 'error'); }
  };

  return (
    <>
      <PageHeader eyebrow={course.category} title={course.title} description={course.summary}>
        <div className="flex flex-wrap gap-2"><Badge tone="gold">{levelLabel(course.level, locale)}</Badge><Badge tone={access.tone}>{access.label}</Badge><Badge>≈ {course.estimatedHours} h · {totalLessons} {tx('leçons', 'lessons', 'lições')}</Badge></div>
      </PageHeader>
      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card><CardBody><h2 className="font-display text-xl font-semibold text-night">{tx('Présentation', 'Overview', 'Apresentação')}</h2><p className="mt-2 text-ink/75">{course.description}</p></CardBody></Card>
          <h2 className="pt-4 font-display text-xl font-semibold text-night">{tx('Programme', tx('Programme', 'Programme', 'Programa'), 'Programa')}</h2>
          {course.modules.map((m, mi) => (
            <Card key={m.id}>
              <div className="border-b border-night/[0.06] px-5 py-4"><p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{tx('Module', 'Module', 'Módulo')} {mi + 1}</p><h3 className="font-semibold text-night">{m.title}</h3></div>
              <ul>
                {m.lessons.map((l) => {
                  const Icon = lessonIcon[l.kind];
                  const isDone = enrollment?.completedLessonIds.includes(l.id);
                  const isOpen = openLesson === l.id;
                  return (
                    <li key={l.id} className="border-b border-night/[0.04] last:border-0">
                      <button disabled={!enrollment && !free} onClick={() => setOpenLesson(isOpen ? null : l.id)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-mist/60 disabled:cursor-default disabled:hover:bg-transparent" aria-expanded={isOpen}>
                        {isDone ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label={tx('Terminée', 'Completed', 'Concluída')} /> : enrollment || free ? <Circle className="h-5 w-5 text-ink/30" /> : <Lock className="h-4 w-4 text-ink/30" aria-label={tx('Verrouillée', 'Locked', 'Bloqueada')} />}
                        <Icon className="h-4 w-4 text-gold" aria-hidden />
                        <span className="flex-1 text-sm font-medium text-night">{l.title}</span>
                        <span className="text-xs text-ink/50">{l.durationMinutes} min</span>
                        {(enrollment || free) && <ChevronDown className={cn('h-4 w-4 text-ink/40 transition', isOpen && 'rotate-180')} />}
                      </button>
                      {isOpen && (
                        <div className="bg-mist/50 px-5 pb-4 pt-1 text-sm text-ink/80">
                          <p className="whitespace-pre-line leading-relaxed">{l.body}</p>
                          {l.resourceUrl ? <a href={l.resourceUrl} target="_blank" rel="noopener noreferrer" className="link-gold mt-2 inline-block">{tx('Ouvrir le support', 'Open the material', 'Abrir o material')}</a> : l.kind !== 'text' && <p className="mt-2 italic text-ink/50">{tx('Support à importer par le formateur.', 'Material to be uploaded by the trainer.', 'Material a importar pelo formador.')}</p>}
                          {enrollment && !isDone && <Button size="sm" className="mt-3" onClick={() => done(l)}>{tx('Marquer comme terminée', 'Mark as completed', 'Marcar como concluída')}</Button>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
        <aside className="space-y-4">
          <Card className="lg:sticky lg:top-24"><CardBody>
            <DemoInline>{tx('Démonstration : la progression est conservée dans cet onglet uniquement.', 'Demo: progress is kept in this tab only.', 'Demonstração: o progresso é guardado apenas neste separador.')}</DemoInline>
            {free ? (
              <><p className="text-sm font-semibold text-night">{tx('Formation en accès libre', 'Free-access course', 'Formação em acesso livre')}</p><p className="mt-2 text-sm text-ink/70">{tx('Ouvrez chaque leçon pour la lire, sans inscription.', 'Open each lesson to read it, no sign-up needed.', 'Abra cada lição para a ler, sem inscrição.')}</p><ButtonLink to="/doctrine" variant="gold" className="mt-4 w-full">{tx('Doctrine et histoire', 'Doctrine and history', 'Doutrina e história')}</ButtonLink></>
            ) : enrollment ? (
              <>
                <p className="text-sm font-semibold text-night">{tx('Votre progression', 'Your progress', 'O seu progresso')}</p>
                <div className="mt-2"><ProgressBar value={enrollment.progress} /></div>
                <p className="mt-1 text-sm text-ink/60">{enrollment.progress} % · {enrollment.completedLessonIds.length}/{totalLessons} {tx('leçons', 'lessons', 'lições')}</p>
                {course.quizId ? (
                  enrollment.progress >= 100 ? <ButtonLink to={`/academie/examens/${course.quizId}`} variant="gold" className="mt-5 w-full" icon={<ClipboardCheck className="h-4 w-4" />}>{tx('Passer l’examen final', 'Take the final exam', 'Fazer o exame final')}</ButtonLink>
                  : <p className="mt-5 rounded-xl bg-mist p-3 text-sm text-ink/70">{tx('L’examen final se débloque une fois toutes les leçons terminées.', 'The final exam unlocks once all lessons are completed.', 'O exame final desbloqueia-se quando todas as lições estiverem concluídas.')}</p>
                ) : <p className="mt-5 text-sm text-ink/60">{tx('Cette formation ne comporte pas d’examen final.', 'This course has no final exam.', 'Esta formação não tem exame final.')}</p>}
              </>
            ) : !profile ? (
              <><p className="text-sm text-ink/70">{tx('Connectez-vous pour suivre cette formation.', 'Log in to take this course.', 'Inicie sessão para seguir esta formação.')}</p><ButtonLink to="/connexion" className="mt-4 w-full">{tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink></>
            ) : canEnroll ? (
              <><p className="text-sm text-ink/70">{tx('Inscrivez-vous pour accéder aux leçons et suivre votre progression.', 'Enrol to access the lessons and track your progress.', 'Inscreva-se para aceder às lições e acompanhar o seu progresso.')}</p><Button className="mt-4 w-full" loading={busy} onClick={doEnroll}>{tx('Commencer la formation', 'Start the course', 'Começar a formação')}</Button></>
            ) : (
              <p className="text-sm text-ink/70">{course.access === 'on_request' ? tx('L’accès à cette formation se fait sur demande auprès du formateur ou de votre responsable.', 'Access to this course is on request from the trainer or your leader.', 'O acesso a esta formação faz-se mediante pedido ao formador ou ao seu responsável.') : course.access === 'closed' ? tx('Les inscriptions sont fermées.', 'Enrolment is closed.', 'As inscrições estão fechadas.') : tx('Votre adhésion doit être validée pour accéder à cette formation.', 'Your membership must be approved to access this course.', 'A sua adesão tem de ser validada para aceder a esta formação.')}</p>
            )}
            <p className="mt-5 border-t border-night/10 pt-4 text-xs text-ink/55">{tx('Formateur', 'Trainer', 'Formador')} : {course.trainerName || (free ? tx('Textes officiels de l’EBNM/KCC', 'Official texts of the EBNM/KCC', 'Textos oficiais da EBNM/KCC') : tx('à désigner', 'to be appointed', 'a designar'))}</p>
          </CardBody></Card>
        </aside>
      </section>
    </>
  );
}
