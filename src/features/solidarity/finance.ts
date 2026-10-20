import type { Contribution, Expense } from '@/types';

/** Seules les contributions confirmées comptent dans le montant collecté. */
export function summarizeContributions(contributions: Contribution[]) {
  const confirmed = contributions.filter((c) => c.status === 'confirmed').reduce((s, c) => s + c.amount, 0);
  const declared = contributions.filter((c) => c.status === 'declared' || c.status === 'pending_verification').reduce((s, c) => s + c.amount, 0);
  return { confirmed, declared, count: contributions.length };
}

export function summarizeExpenses(expenses: Expense[]) {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

/**
 * Une déclaration ou une capture d'écran ne confirme jamais un paiement.
 * La confirmation exige une vérification serveur (fournisseur) ou un
 * gestionnaire habilité avec une référence de transaction.
 */
export function canConfirmContribution(c: Contribution, verifiedByProvider: boolean, managerHasReference: boolean) {
  if (c.status === 'confirmed' || c.status === 'rejected') return false;
  if (c.provider === 'cash') return managerHasReference;
  return verifiedByProvider;
}
