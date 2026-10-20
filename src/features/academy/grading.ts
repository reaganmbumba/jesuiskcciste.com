import type { QuestionCorrection } from '@/types';

export interface AnswerKeyEntry {
  correct: string;
  explanation?: string | null;
}

/**
 * Correction automatique des questions objectives.
 * Logique identique à la fonction SQL `submit_quiz_attempt` (exécutée côté
 * serveur en production) ; utilisée ici pour la démonstration et les tests.
 */
export function gradeAnswers(
  questionIds: string[],
  answers: Record<string, string | null | undefined>,
  key: Record<string, AnswerKeyEntry>,
  passingScore: number,
) {
  const corrections: QuestionCorrection[] = questionIds.map((qid) => {
    const entry = key[qid];
    if (!entry) throw new Error(`Barème manquant pour la question ${qid}`);
    const selected = answers[qid] ?? null;
    return { questionId: qid, selectedOptionId: selected, correctOptionId: entry.correct, isCorrect: selected === entry.correct, explanation: entry.explanation ?? null };
  });
  const correctCount = corrections.filter((c) => c.isCorrect).length;
  const total = questionIds.length;
  const score = total ? Math.round((correctCount / total) * 100) : 0;
  return { corrections, correctCount, total, score, passed: score >= passingScore };
}

/** Vérifie si une nouvelle tentative est autorisée. */
export function canAttempt(previousAttempts: number, maxAttempts: number, alreadyPassed: boolean) {
  if (alreadyPassed) return { allowed: false, reason: 'Examen déjà réussi.' };
  if (maxAttempts > 0 && previousAttempts >= maxAttempts) return { allowed: false, reason: 'Nombre maximal de tentatives atteint.' };
  return { allowed: true, reason: null };
}

/** Code de certificat unique et vérifiable : KCC-AAAA-XXXX-XXXX. */
export function generateCertificateCode(random: () => number = Math.random, year = new Date().getFullYear()) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => Array.from({ length: 4 }, () => alphabet[Math.floor(random() * alphabet.length)]).join('');
  return `KCC-${year}-${block()}-${block()}`;
}
