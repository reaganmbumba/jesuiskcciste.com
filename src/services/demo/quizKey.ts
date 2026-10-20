/**
 * ⚠️ DÉMONSTRATION UNIQUEMENT.
 * En production, les bonnes réponses restent en base (table question_options,
 * colonne is_correct non lisible par les membres) et la correction est faite
 * par la fonction SQL `submit_quiz_attempt` (SECURITY DEFINER).
 * Ce module simule ce « serveur » pour le mode démonstration ; il n'est
 * chargé que dynamiquement au moment de la soumission.
 */
import type { Quiz } from '@/types';

export const demoQuiz: Quiz = {
  id: 'quiz-1',
  courseId: 'crs-1',
  title: 'Examen final — Prise en main de JE SUIS KCCiste',
  passingScore: 70,
  maxAttempts: 3,
  timeLimitMinutes: 15,
  questions: [
    { id: 'q1', prompt: 'Par défaut, votre numéro de téléphone est-il visible dans l’annuaire ?', options: [{ id: 'q1a', label: 'Oui, pour tout le monde' }, { id: 'q1b', label: 'Non, il est masqué par défaut' }, { id: 'q1c', label: 'Oui, pour les membres de ma section' }] },
    { id: 'q2', prompt: 'Où réglez-vous les informations visibles de votre profil ?', options: [{ id: 'q2a', label: 'Dans Paramètres' }, { id: 'q2b', label: 'Dans KCC Music' }, { id: 'q2c', label: 'Ce n’est pas possible' }] },
    { id: 'q3', prompt: 'Dans quel fuseau horaire un événement est-il affiché ?', options: [{ id: 'q3a', label: 'Toujours en heure de Paris' }, { id: 'q3b', label: 'Dans le fuseau horaire de son lieu' }, { id: 'q3c', label: 'En temps universel uniquement' }] },
    { id: 'q4', prompt: 'Une contribution simplement déclarée est-elle un paiement confirmé ?', options: [{ id: 'q4a', label: 'Oui' }, { id: 'q4b', label: 'Non, elle doit être vérifiée' }] },
  ],
};

export const demoAnswerKey: Record<string, { correct: string; explanation: string }> = {
  q1: { correct: 'q1b', explanation: 'Les coordonnées privées ne sont jamais publiques par défaut.' },
  q2: { correct: 'q2a', explanation: 'La rubrique Paramètres > Confidentialité permet de choisir ce qui est affiché.' },
  q3: { correct: 'q3b', explanation: 'Chaque événement porte son fuseau horaire, utilisé pour l’affichage.' },
  q4: { correct: 'q4b', explanation: 'Seul un paiement vérifié auprès du fournisseur ou par un gestionnaire habilité est confirmé.' },
};
