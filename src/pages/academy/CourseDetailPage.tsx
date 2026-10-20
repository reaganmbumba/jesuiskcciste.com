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
import { ACCESS_LABELS, LEVEL_LABELS } from '@/features/academy/labels';
import type { Enrollment, Lesson } from '@/types';
import { cn } from '@/utils/format';

const lessonIcon = { text: Type, video: PlayCircle, pdf: FileText };

export default function CourseDetailPage() {
  const { slug = '' } = useParams();
  const { profile } = useAuth();
  const { notify } = useToast();
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, setData } = useAsync(async () => {
    const course = await getCourseBySlug(slug);
    const enrollment = profile && course ? (await listMyEnrollments(profile.id)).find((e) => e.courseId === course.id) ?? null : null;
    return { course, enrollment };
  }, [slug, profile?.id]);

  if (loading) return <PageLoader />;
  if (!data?.course) return <div className="container-page py-16"><EmptyState title="Formation introuvable." action={<ButtonLink to="/academie/formations" variant="outline">Catalogue</ButtonLink>} /></div>;
  const { course, enrollment } = data;
  const access = ACCESS_LABELS[course.access];
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const setEnrollment = (e: Enrollment) => setData({ course, enrollment: e });
  const canEnroll = course.access === 'open' || (course.access === 'members' && profile?.status === 'active');

  const doEnroll = async () => {
    if (!profile) return;
    setBusy(true);
    try { setEnrollment(await enroll(course.id, profile.id)); notify('Inscription à la formation confirmée.'); } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); } finally { setBusy(false); }
  };
  const done = async (l: Lesson) => {
    if (!profile) return;
    try { setEnrollment(await markLessonDone(course, l.id, profile.id)); } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); }
  };

  return (
    <>
      <PageHeader eyebrow={course.category} title={course.title} description={course.summary}>
        <div className="flex flex-wrap gap-2"><Badge tone="gold">{LEVEL_LABELS[course.level]}</Badge><Badge tone={access.tone}>{access.label}</Badge><Badge>≈ {course.estimatedHours} h · {totalLessons} leçons</Badge></div>
      </PageHeader>
      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card><CardBody><h2 className="font-display text-xl font-semibold text-night">Présentation</h2><p className="mt-2 text-ink/75">{course.description}</p></CardBody></Card>
          <h2 className="pt-4 font-display text-xl font-semibold text-night">Programme</h2>
          {course.modules.map((m, mi) => (
            <Card key={m.id}>
              <div className="border-b border-night/[0.06] px-5 py-4"><p className="text-xs font-semibold uppercase tracking-wider text-gold-600">Module {mi + 1}</p><h3 className="font-semibold text-night">{m.title}</h3></div>
              <ul>
                {m.lessons.map((l) => {
                  const Icon = lessonIcon[l.kind];
                  const isDone = enrollment?.completedLessonIds.includes(l.id);
                  const isOpen = openLesson === l.id;
                  return (
                    <li key={l.id} className="border-b border-night/[0.04] last:border-0">
                      <button disabled={!enrollment} onClick={() => setOpenLesson(isOpen ? null : l.id)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-mist/60 disabled:cursor-default disabled:hover:bg-transparent" aria-expanded={isOpen}>
                        {isDone ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label="Terminée" /> : enrollment ? <Circle className="h-5 w-5 text-ink/30" /> : <Lock className="h-4 w-4 text-ink/30" aria-label="Verrouillée" />}
                        <Icon className="h-4 w-4 text-gold" aria-hidden />
                        <span className="flex-1 text-sm font-medium text-night">{l.title}</span>
                        <span className="text-xs text-ink/50">{l.durationMinutes} min</span>
                        {enrollment && <ChevronDown className={cn('h-4 w-4 text-ink/40 transition', isOpen && 'rotate-180')} />}
                      </button>
                      {isOpen && (
                        <div className="bg-mist/50 px-5 pb-4 pt-1 text-sm text-ink/80">
                          <p>{l.body}</p>
                          {l.resourceUrl ? <a href={l.resourceUrl} target="_blank" rel="noopener noreferrer" className="link-gold mt-2 inline-block">Ouvrir le support</a> : l.kind !== 'text' && <p className="mt-2 italic text-ink/50">Support à importer par le formateur.</p>}
                          {!isDone && <Button size="sm" className="mt-3" onClick={() => done(l)}>Marquer comme terminée</Button>}
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
            <DemoInline>Démonstration : la progression est conservée dans cet onglet uniquement.</DemoInline>
            {enrollment ? (
              <>
                <p className="text-sm font-semibold text-night">Votre progression</p>
                <div className="mt-2"><ProgressBar value={enrollment.progress} /></div>
                <p className="mt-1 text-sm text-ink/60">{enrollment.progress} % · {enrollment.completedLessonIds.length}/{totalLessons} leçons</p>
                {course.quizId ? (
                  enrollment.progress >= 100 ? <ButtonLink to={`/academie/examens/${course.quizId}`} variant="gold" className="mt-5 w-full" icon={<ClipboardCheck className="h-4 w-4" />}>Passer l’examen final</ButtonLink>
                  : <p className="mt-5 rounded-xl bg-mist p-3 text-sm text-ink/70">L’examen final se débloque une fois toutes les leçons terminées.</p>
                ) : <p className="mt-5 text-sm text-ink/60">Cette formation ne comporte pas d’examen final.</p>}
              </>
            ) : !profile ? (
              <><p className="text-sm text-ink/70">Connectez-vous pour suivre cette formation.</p><ButtonLink to="/connexion" className="mt-4 w-full">Se connecter</ButtonLink></>
            ) : canEnroll ? (
              <><p className="text-sm text-ink/70">Inscrivez-vous pour accéder aux leçons et suivre votre progression.</p><Button className="mt-4 w-full" loading={busy} onClick={doEnroll}>Commencer la formation</Button></>
            ) : (
              <p className="text-sm text-ink/70">{course.access === 'on_request' ? 'L’accès à cette formation se fait sur demande auprès du formateur ou de votre responsable.' : course.access === 'closed' ? 'Les inscriptions sont fermées.' : 'Votre adhésion doit être validée pour accéder à cette formation.'}</p>
            )}
            <p className="mt-5 border-t border-night/10 pt-4 text-xs text-ink/55">Formateur : {course.trainerName || 'à désigner'}</p>
          </CardBody></Card>
        </aside>
      </section>
    </>
  );
}
