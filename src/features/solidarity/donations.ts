import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { MobileProvider } from '@/features/music/shop';

/**
 * Dons en ligne (espace « Faire un don » de /solidarite).
 *
 * Le navigateur ne fait que demander : l'Edge Function `dons-solidarite` envoie
 * la demande de paiement FlexPay sur le téléphone du donateur et ne valide le
 * don qu'après confirmation de FlexPay. Aucun secret marchand ni PIN ici.
 */
export type DonationStatus = 'pending' | 'paid' | 'failed';
export interface DonationInput { operation: string; provider: MobileProvider; phone: string; amount: number; currency: 'USD' | 'CDF'; donorName?: string }

// ——— Mode démonstration : dons simulés, rien n'est débité ———
const demo = new Map<string, number>();

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.functions.invoke('dons-solidarite', { body });
  if (error) {
    let message = error.message;
    const ctx = (error as { context?: Response }).context;
    try { const j = await ctx?.json(); if (j?.error) message = j.error; } catch { /* réponse non JSON */ }
    if (/Failed to send a request|FunctionsFetchError/i.test(message)) message = 'Le paiement en ligne n’est pas encore ouvert.';
    throw new Error(message);
  }
  return data as T;
}

export async function startDonation(input: DonationInput): Promise<{ donationId: string; token: string }> {
  if (isDemoMode) {
    const id = `demo-${Date.now()}`;
    demo.set(id, Date.now());
    return { donationId: id, token: id };
  }
  return call({ action: 'donate', ...input });
}

export async function getDonationStatus(donationId: string, token: string): Promise<DonationStatus> {
  if (isDemoMode) return Date.now() - (demo.get(donationId) ?? 0) > 4000 ? 'paid' : 'pending';
  return (await call<{ status: DonationStatus }>({ action: 'status', donationId, token })).status;
}
