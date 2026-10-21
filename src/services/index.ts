/**
 * Services d'accès aux données. Chaque service bascule automatiquement entre
 * Supabase (production) et les données de démonstration (mode démo).
 */
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import { repository, withEditorial } from './repository';
import { editorialAlbums, editorialAnnouncements, editorialArtists, editorialCourses, editorialEvents, editorialMedia, editorialParishes, editorialTracks } from '@/content/editorial';
import * as demo from './demo/data';
import type {
  Announcement, AppNotification, Certificate, CommunityStats, Contribution, Course, Enrollment, KccEvent,
  Quiz, QuizAttemptResult, SolidarityProject, Visibility,
} from '@/types';
import { gradeAnswers, generateCertificateCode } from '@/features/academy/grading';
import { isListable, toDirectoryEntry, type DirectoryEntry } from '@/features/community/privacy';

export const parishesRepo = withEditorial(repository('parishes', demo.demoParishes, 'par'), editorialParishes);
export const sectionsRepo = repository('sections', demo.demoSections, 'sec');
export const unitsRepo = repository('organizational_units', demo.demoUnits, 'unit');
export const membersRepo = repository('profiles', demo.demoMembers, 'mem', '*', ['roles', 'email', 'status', 'createdAt']);
export const announcementsRepo = withEditorial(repository('announcements', demo.demoAnnouncements, 'ann'), editorialAnnouncements);
export const eventsRepo = withEditorial(repository('events', demo.demoEvents, 'evt'), editorialEvents);
export const coursesRepo = withEditorial(repository('courses', demo.demoCourses, 'crs', '*, modules:course_modules(*, lessons(*))', ['modules', 'quizId']), editorialCourses);
export const artistsRepo = withEditorial(repository('artists', demo.demoArtists, 'art'), editorialArtists);
export const albumsRepo = withEditorial(repository('albums', demo.demoAlbums, 'alb'), editorialAlbums);
export const tracksRepo = withEditorial(repository('tracks', demo.demoTracks, 'trk'), editorialTracks);
export const mediaRepo = withEditorial(repository('media_items', demo.demoMedia, 'med'), editorialMedia);
export const projectsRepo = repository('projects', demo.demoProjects, 'prj', '*', ['confirmedAmount', 'declaredAmount']);
export const contributionsRepo = repository('contributions', demo.demoContributions, 'ctb');
export const expensesRepo = repository('expenses', demo.demoExpenses, 'exp');
export const auditRepo = repository('audit_logs', demo.demoAuditLogs, 'log');
export const notificationsRepo = repository('notifications', demo.demoNotifications, 'not');

// ——— Annuaire ———
export interface DirectoryRow { entry: DirectoryEntry; firstName: string; lastName: string; parishId: string | null; sectionId: string | null }

/**
 * Annuaire : en production, lecture de la vue `directory_entries` qui applique
 * la confidentialité en base (les champs masqués ne sont jamais transmis).
 */
export async function listDirectory(viewerCanSeePrivate: boolean): Promise<DirectoryRow[]> {
  if (isDemoMode) {
    const [members, parishes, sections] = await Promise.all([membersRepo.all(), parishesRepo.all(), sectionsRepo.all()]);
    return members.filter((m) => isListable(m, viewerCanSeePrivate)).map((m) => ({
      entry: toDirectoryEntry(m, { parishes, sections, viewerCanSeePrivate }), firstName: m.firstName, lastName: m.lastName, parishId: m.parishId ?? null, sectionId: m.sectionId ?? null,
    }));
  }
  const { data, error } = await supabase!.from('directory_entries').select('*').order('last_name').limit(2000);
  if (error) throw error;
  return camelize<(DirectoryEntry & { firstName: string; lastName: string; parishId: string | null; sectionId: string | null })[]>(data ?? []).map((r) => ({ entry: r, firstName: r.firstName, lastName: r.lastName, parishId: r.parishId, sectionId: r.sectionId }));
}

const audiencesFor = (signedIn: boolean, leader: boolean): Visibility[] =>
  leader ? ['public', 'members', 'leaders'] : signedIn ? ['public', 'members'] : ['public'];

export async function listPublishedAnnouncements(opts: { signedIn: boolean; leader?: boolean; limit?: number }): Promise<Announcement[]> {
  const all = await announcementsRepo.all();
  const aud = audiencesFor(opts.signedIn, !!opts.leader);
  return all
    .filter((a) => a.status === 'published' && aud.includes(a.audience))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, opts.limit ?? 100);
}

export async function listUpcomingEvents(opts: { signedIn: boolean; limit?: number }): Promise<KccEvent[]> {
  const all = await eventsRepo.all();
  const nowIso = new Date().toISOString();
  const aud = audiencesFor(opts.signedIn, false);
  return all
    .filter((e) => e.status !== 'archived' && e.startsAt >= nowIso && aud.includes(e.audience))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, opts.limit ?? 100);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  if (isDemoMode) return (await coursesRepo.all()).find((c) => c.slug === slug) ?? null;
  const { data, error } = await supabase!.from('courses').select('*, modules:course_modules(*, lessons(*)), quiz:quizzes(id)').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!data) return editorialCourses().find((c) => c.slug === slug) ?? null;
  const c = camelize<Course & { quiz?: { id: string }[] }>(data);
  return { ...c, quizId: c.quiz?.[0]?.id ?? null };
}

export async function getProjectBySlug(slug: string): Promise<SolidarityProject | null> {
  return (await projectsRepo.all()).find((p) => p.slug === slug) ?? null;
}

/** Statistiques communautaires : en production, calculées par la fonction SQL `community_stats`. */
export async function getCommunityStats(): Promise<{ stats: CommunityStats; isExample: boolean }> {
  if (isDemoMode) {
    // Valeurs d'exemple calculées sur les données fictives : jamais présentées comme officielles.
    return {
      isExample: true,
      stats: {
        countries: new Set(demo.demoParishes.map((p) => p.country)).size,
        parishes: demo.demoParishes.length,
        members: demo.demoMembers.filter((m) => m.status === 'active').length,
        courses: demo.demoCourses.length,
        events: demo.demoEvents.length,
      },
    };
  }
  const { data, error } = await supabase!.rpc('community_stats');
  if (error) throw error;
  return { stats: camelize<CommunityStats>(data), isExample: false };
}

// ——— Académie : examens ———

const demoAttempts: Record<string, QuizAttemptResult[]> = {};
const demoCertificates: Certificate[] = [...demo.demoCertificates];
let demoEnrollments: Enrollment[] = [...demo.demoEnrollments];

/** Récupère un examen SANS les bonnes réponses (vue `quiz_questions_public` en production). */
export async function getQuiz(quizId: string): Promise<Quiz | null> {
  if (isDemoMode) {
    const { demoQuiz } = await import('./demo/quizKey');
    return demoQuiz.id === quizId ? demoQuiz : null;
  }
  const { data, error } = await supabase!.rpc('get_quiz_public', { p_quiz_id: quizId });
  if (error) throw error;
  return data ? camelize<Quiz>(data) : null;
}

export async function listMyAttempts(quizId: string, userId: string): Promise<QuizAttemptResult[]> {
  if (isDemoMode) return demoAttempts[`${userId}:${quizId}`] ?? [];
  const { data, error } = await supabase!.from('quiz_attempts').select('*').eq('quiz_id', quizId).eq('user_id', userId).order('submitted_at', { ascending: false });
  if (error) throw error;
  return camelize<QuizAttemptResult[]>(data ?? []);
}

/** Soumission : correction et émission éventuelle du certificat côté serveur. */
export async function submitQuiz(quizId: string, userId: string, holderName: string, answers: Record<string, string | null>): Promise<QuizAttemptResult> {
  if (!isDemoMode) {
    const { data, error } = await supabase!.rpc('submit_quiz_attempt', { p_quiz_id: quizId, p_answers: answers });
    if (error) throw error;
    return camelize<QuizAttemptResult>(data);
  }
  const { demoQuiz, demoAnswerKey } = await import('./demo/quizKey');
  const k = `${userId}:${quizId}`;
  const previous = demoAttempts[k] ?? [];
  if (previous.some((a) => a.passed)) throw new Error('Examen déjà réussi.');
  if (previous.length >= demoQuiz.maxAttempts) throw new Error('Nombre maximal de tentatives atteint.');
  const g = gradeAnswers(demoQuiz.questions.map((q) => q.id), answers, demoAnswerKey, demoQuiz.passingScore);
  let certificateCode: string | null = null;
  if (g.passed) {
    certificateCode = generateCertificateCode();
    const course = demo.demoCourses.find((c) => c.id === demoQuiz.courseId)!;
    demoCertificates.push({ id: `cert-${Date.now()}`, code: certificateCode, courseId: course.id, courseTitle: course.title, holderName, issuedAt: new Date().toISOString(), score: g.score, revoked: false });
  }
  const result: QuizAttemptResult = { attemptId: `att-${Date.now()}`, quizId, score: g.score, passed: g.passed, correctCount: g.correctCount, total: g.total, attemptNumber: previous.length + 1, submittedAt: new Date().toISOString(), corrections: g.corrections, certificateCode };
  demoAttempts[k] = [result, ...previous];
  return result;
}

export async function listMyCertificates(userId: string): Promise<Certificate[]> {
  if (isDemoMode) return [...demoCertificates];
  const { data, error } = await supabase!.from('certificates').select('*, course:courses(title)').eq('user_id', userId);
  if (error) throw error;
  return camelize<(Certificate & { course?: { title: string } })[]>(data ?? []).map((c) => ({ ...c, courseTitle: c.course?.title ?? c.courseTitle }));
}

/** Vérification publique d'authenticité d'un certificat par son code. */
export async function verifyCertificate(code: string): Promise<Certificate | null> {
  const clean = code.trim().toUpperCase();
  if (isDemoMode) return demoCertificates.find((c) => c.code === clean) ?? null;
  const { data, error } = await supabase!.rpc('verify_certificate', { p_code: clean });
  if (error) throw error;
  return data ? camelize<Certificate>(data) : null;
}

export async function listMyEnrollments(userId: string): Promise<Enrollment[]> {
  if (isDemoMode) return demoEnrollments;
  const { data, error } = await supabase!.from('enrollments').select('*').eq('user_id', userId);
  if (error) throw error;
  return camelize<Enrollment[]>(data ?? []);
}

export async function enroll(courseId: string, userId: string): Promise<Enrollment> {
  if (isDemoMode) {
    const existing = demoEnrollments.find((e) => e.courseId === courseId);
    if (existing) return existing;
    const e: Enrollment = { courseId, progress: 0, completedLessonIds: [], startedAt: new Date().toISOString() };
    demoEnrollments = [...demoEnrollments, e];
    return e;
  }
  const { data, error } = await supabase!.from('enrollments').upsert({ course_id: courseId, user_id: userId }).select().single();
  if (error) throw error;
  return camelize<Enrollment>(data);
}

export async function markLessonDone(course: Course, lessonId: string, userId: string): Promise<Enrollment> {
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  if (isDemoMode) {
    demoEnrollments = demoEnrollments.map((e) => {
      if (e.courseId !== course.id) return e;
      const done = Array.from(new Set([...e.completedLessonIds, lessonId]));
      return { ...e, completedLessonIds: done, progress: Math.round((done.length / totalLessons) * 100) };
    });
    return demoEnrollments.find((e) => e.courseId === course.id)!;
  }
  const { data, error } = await supabase!.rpc('complete_lesson', { p_lesson_id: lessonId });
  if (error) throw error;
  void userId;
  return camelize<Enrollment>(data);
}

// ——— Notifications ———
export async function listMyNotifications(): Promise<AppNotification[]> {
  const all = await notificationsRepo.all();
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ——— Solidarité ———
export async function listProjectContributions(projectId: string): Promise<Contribution[]> {
  return (await contributionsRepo.all()).filter((c) => c.projectId === projectId);
}

export async function declareContribution(input: Omit<Contribution, 'id' | 'status' | 'createdAt'>): Promise<Contribution> {
  // Une déclaration n'est jamais un paiement confirmé.
  return contributionsRepo.create({ ...input, status: 'declared', createdAt: new Date().toISOString() });
}

export async function writeAudit(actor: string, action: string, entity: string, entityId?: string, details?: string) {
  // En production, les journaux sont écrits par des triggers SQL (non falsifiables depuis le navigateur).
  if (!isDemoMode) return;
  await auditRepo.create({ actor, action, entity, entityId: entityId ?? null, createdAt: new Date().toISOString(), details: details ?? null });
}
