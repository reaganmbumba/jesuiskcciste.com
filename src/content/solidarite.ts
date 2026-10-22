import type { MobileProvider } from '@/features/music/shop';

/**
 * Numéros Mobile Money où envoyer un don, affichés dans l'espace « Faire un don »
 * de /solidarite. Uniquement les numéros confirmés par Reagan.
 */
export interface DonationAccount { provider: MobileProvider; number: string; holder: string }
export const DONATION_ACCOUNTS: DonationAccount[] = [
  { provider: 'orange_money', number: '+243 840 238 592', holder: 'Reagan MBUMBA MBUMBA' },
  { provider: 'orange_money', number: '+243 861 271 633', holder: 'Reagan MBUMBA MBUMBA' },
];

/** Opérations auxquelles un don peut être rattaché (même ordre que SolidarityOperations). */
export const DONATION_OPERATIONS = [
  { key: 'ngidinga', label: { fr: 'Opération 100 chaises — Ngidinga', en: 'Operation 100 Chairs — Ngidinga', pt: 'Operação 100 cadeiras — Ngidinga' } },
  { key: 'general', label: { fr: 'Solidarité en général', en: 'General solidarity', pt: 'Solidariedade em geral' } },
] as const;

/**
 * Listes publiques des contributions, reprises des listes finales des groupes WhatsApp.
 * Jamais de numéro de téléphone.
 */
export interface Contribution { name: string; amount: string }
export const CONTRIBUTIONS: Record<'luanika' | 'ngidinga', Contribution[]> = {
  luanika: [],
  ngidinga: [],
};
