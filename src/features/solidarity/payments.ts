import type { PaymentProvider } from '@/types';

/**
 * Architecture des paiements mobiles — PHASE FUTURE.
 *
 * Flux prévu (aucun n'est actif aujourd'hui) :
 *  1. Le navigateur appelle l'Edge Function `payments-initiate` (projet, montant, opérateur, numéro).
 *  2. La fonction, côté serveur, appelle l'API marchande (M-Pesa / Orange Money / Airtel Money)
 *     avec les secrets stockés dans Supabase (jamais dans le frontend).
 *  3. L'opérateur notifie l'Edge Function `payments-webhook` ; la signature est vérifiée,
 *     puis le statut est re-confirmé par un appel « transaction status » à l'opérateur.
 *  4. La contribution passe à « confirmed » et une entrée est ajoutée à `audit_logs`.
 *
 * Une capture d'écran ou une déclaration ne confirme jamais un paiement.
 * Aucun code PIN ni identifiant de portefeuille n'est stocké.
 */
export const PAYMENT_PROVIDERS: Record<PaymentProvider, { label: string; online: boolean; configured: boolean }> = {
  mpesa: { label: 'M-Pesa', online: true, configured: false },
  orange_money: { label: 'Orange Money', online: true, configured: false },
  airtel_money: { label: 'Airtel Money', online: true, configured: false },
  cash: { label: 'Espèces (remise à un gestionnaire)', online: false, configured: true },
  bank: { label: 'Virement bancaire', online: false, configured: true },
};

export function onlinePaymentAvailable() {
  return Object.values(PAYMENT_PROVIDERS).some((p) => p.online && p.configured);
}

export interface PaymentProviderAdapter {
  initiate(input: { projectId: string; amount: number; currency: string; msisdn: string }): Promise<{ transactionReference: string }>;
  verify(transactionReference: string): Promise<'pending' | 'confirmed' | 'failed'>;
}
