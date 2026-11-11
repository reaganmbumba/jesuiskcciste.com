import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import type { Locale } from '@/i18n';
import type { Album, MusicOrder, MusicOrderStatus, Track } from '@/types';
import { demoTracks } from '@/services/demo/data';

/**
 * Boutique KCC Music : achat de titres et d'albums par Mobile Money.
 *
 * Le navigateur ne fait que demander : l'Edge Function `boutique-musique`
 * lit le prix en base, déclenche la demande de paiement FlexPay sur le
 * téléphone de l'acheteur et ne valide la commande qu'après confirmation
 * de FlexPay. Aucun secret marchand ni code PIN ne transite ici.
 */
export type MobileProvider = MusicOrder['provider'];

export const MOBILE_PROVIDERS: { key: MobileProvider; label: string; prefixes: string[]; className: string }[] = [
  { key: 'mpesa', label: 'M-Pesa', prefixes: ['81', '82', '83', '86'], className: 'bg-[#E60000] text-white' },
  { key: 'orange_money', label: 'Orange Money', prefixes: ['80', '84', '85', '89'], className: 'bg-[#FF7900] text-black' },
  { key: 'airtel_money', label: 'Airtel Money', prefixes: ['97', '98', '99'], className: 'bg-[#ED1C24] text-white' },
];

/** 0812345678, +243 81 234 5678, 812345678 → 243812345678 (ou null). */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('243')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^\d{9}$/.test(d) ? `243${d}` : null;
}

/** Opérateur déduit du préfixe (81 → M-Pesa…), ou null. */
export function detectProvider(raw: string): MobileProvider | null {
  const p = normalizePhone(raw);
  if (!p) return null;
  return MOBILE_PROVIDERS.find((m) => m.prefixes.includes(p.slice(3, 5)))?.key ?? null;
}

const intl: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB', pt: 'pt-PT' };
export function priceLabel(amount: number, currency: string, locale: Locale = 'fr') {
  const cents = !Number.isInteger(amount);
  return new Intl.NumberFormat(intl[locale], { style: 'currency', currency, minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 }).format(amount);
}

export const isForSale = (item: Pick<Track, 'priceAmount' | 'priceCurrency'> | Pick<Album, 'priceAmount' | 'priceCurrency'>) =>
  !!item.priceAmount && item.priceAmount > 0 && !!item.priceCurrency;

export interface CheckoutInput { itemType: 'track' | 'album'; itemId: string; provider: MobileProvider; phone: string }
export interface DownloadFile { title: string; url: string }

// ——— Mode démonstration : commandes simulées, rien n'est débité ———
const demoOrders = new Map<string, { order: CheckoutInput; createdAt: number }>();

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.functions.invoke('boutique-musique', { body });
  if (error) {
    let message = error.message;
    const ctx = (error as { context?: Response }).context;
    try { const j = await ctx?.json(); if (j?.error) message = j.error; } catch { /* réponse non JSON */ }
    if (/Failed to send a request|FunctionsFetchError/i.test(message)) message = 'La boutique n’est pas encore ouverte.';
    throw new Error(message);
  }
  return data as T;
}

export async function startCheckout(input: CheckoutInput): Promise<{ orderId: string; status: MusicOrderStatus }> {
  if (isDemoMode) {
    const id = `demo-${Date.now()}`;
    demoOrders.set(id, { order: input, createdAt: Date.now() });
    return { orderId: id, status: 'pending' };
  }
  return call({ action: 'checkout', ...input });
}

export async function getOrderStatus(orderId: string): Promise<MusicOrderStatus> {
  if (isDemoMode) return Date.now() - (demoOrders.get(orderId)?.createdAt ?? 0) > 4000 ? 'paid' : 'pending';
  return (await call<{ status: MusicOrderStatus }>({ action: 'status', orderId })).status;
}

export async function getDownloads(orderId: string): Promise<DownloadFile[]> {
  if (isDemoMode) {
    const o = demoOrders.get(orderId)?.order;
    const tracks = demoTracks.filter((t) => (o?.itemType === 'track' ? t.id === o.itemId : t.albumId === o?.itemId) && t.audioUrl);
    return tracks.map((t) => ({ title: t.title, url: t.audioUrl! }));
  }
  return (await call<{ files: DownloadFile[] }>({ action: 'download', orderId })).files;
}

/**
 * Lien du chant entier si l'utilisateur connecté y a droit (acheteur ou
 * responsable musique), sinon null : le lecteur garde alors l'extrait public.
 */
export async function getFullAudio(trackId: string): Promise<string | null> {
  if (isDemoMode) return null;
  try { return (await call<{ url: string | null }>({ action: 'ecoute', trackId })).url; } catch { return null; }
}

/** Commandes de l'utilisateur connecté (la RLS ne renvoie que les siennes). */
export async function listMyOrders(userId: string): Promise<MusicOrder[]> {
  if (isDemoMode) return [];
  const { data, error } = await supabase!.from('music_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return camelize<MusicOrder[]>(data ?? []);
}

/** Toutes les ventes (responsable musical). */
export async function listAllOrders(): Promise<MusicOrder[]> {
  if (isDemoMode) return [];
  const { data, error } = await supabase!.from('music_orders').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return camelize<MusicOrder[]>(data ?? []);
}
