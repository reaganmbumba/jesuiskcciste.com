import { isDemoMode } from '@/config/env';
import { WHATSAPP_GROUP_URL } from '@/config/site';
import { supabase } from '@/lib/supabase';

/**
 * Cotisations mensuelles des KCCistes, suivies par matricule
 * (tables `member_cotisations` et `cotisation_settings`).
 *
 * L'administration enregistre chaque paiement (un membre, un mois). Le site en
 * déduit qui est à jour : chaque mois depuis le mois de départ des cotisations
 * (ou depuis l'inscription du membre, s'il est arrivé après) jusqu'au mois en
 * cours doit être payé. Les mois payés d'avance comptent aussi.
 */

export type CotisationCurrency = 'USD' | 'CDF';
export type CotisationMethod = 'orange_money' | 'mpesa' | 'airtel_money' | 'afrimoney' | 'especes' | 'banque' | 'autre';

export const COTISATION_METHODS: Record<CotisationMethod, string> = {
  orange_money: 'Orange Money',
  mpesa: 'M-Pesa',
  airtel_money: 'Airtel Money',
  afrimoney: 'Afrimoney',
  especes: 'Espèces',
  banque: 'Banque / virement',
  autre: 'Autre',
};

export interface CotisationSettings {
  monthlyAmount: number;
  currency: CotisationCurrency;
  /** Premier mois dû, « AAAA-MM ». */
  startMonth: string;
  purpose: string;
}

export interface Cotisation {
  id: string;
  userId: string;
  /** Mois payé, « AAAA-MM ». */
  month: string;
  amount: number;
  currency: CotisationCurrency;
  method: CotisationMethod;
  reference: string | null;
  note: string | null;
  paidOn: string;
  createdAt: string;
}

export interface NewCotisations {
  userId: string;
  months: string[];
  /** Montant par mois. */
  amount: number;
  currency: CotisationCurrency;
  method: CotisationMethod;
  reference?: string;
  note?: string;
  paidOn: string;
}

// ---------------------------------------------------------------- mois

export function monthKey(d: Date | string = new Date()): string {
  const x = typeof d === 'string' ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
}

export function addMonths(key: string, n: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return monthKey(d);
}

/** Tous les mois de `from` à `to`, inclus (vide si `from` est après `to`). */
export function monthsBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let k = from; k <= to && out.length < 600; k = addMonths(k, 1)) out.push(k);
  return out;
}

const INTL = { fr: 'fr-FR', en: 'en-GB', pt: 'pt-PT' } as const;

export function monthLabel(key: string, locale: keyof typeof INTL = 'fr', short = false): string {
  const [y, m] = key.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString(INTL[locale], short ? { month: 'short', year: '2-digit' } : { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatMoney(amount: number, currency: CotisationCurrency): string {
  const n = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(amount);
  return currency === 'USD' ? `${n} $` : `${n} FC`;
}

/** Totaux par monnaie, ex. « 120 $ + 56 000 FC ». */
export function sumByCurrency(list: Pick<Cotisation, 'amount' | 'currency'>[]): string {
  const t: Record<CotisationCurrency, number> = { USD: 0, CDF: 0 };
  for (const c of list) t[c.currency] += Number(c.amount) || 0;
  const parts = (['USD', 'CDF'] as const).filter((c) => t[c] > 0).map((c) => formatMoney(t[c], c));
  return parts.length ? parts.join(' + ') : '0';
}

// ---------------------------------------------------------------- situation d'un membre

export interface MemberSituation {
  /** Premier mois dû pour ce membre. */
  firstDue: string;
  /** Mois dus jusqu'au mois en cours. */
  due: string[];
  /** Mois dus et non payés (du plus ancien au plus récent). */
  unpaid: string[];
  /** Mois payés (y compris d'avance). */
  paid: string[];
  upToDate: boolean;
  /** Montant restant dû, dans la monnaie des réglages. */
  owed: number;
  /** Dernier mois couvert (payé), ou null. */
  coveredUntil: string | null;
}

export function memberSituation(payments: Pick<Cotisation, 'month'>[], settings: CotisationSettings, joinedAt?: string | null, now = new Date()): MemberSituation {
  const joined = joinedAt ? monthKey(joinedAt) : settings.startMonth;
  const firstDue = joined > settings.startMonth ? joined : settings.startMonth;
  const due = monthsBetween(firstDue, monthKey(now));
  const paidSet = new Set(payments.map((p) => p.month));
  const unpaid = due.filter((m) => !paidSet.has(m));
  const paid = [...paidSet].sort();
  return {
    firstDue, due, unpaid, paid,
    upToDate: unpaid.length === 0,
    owed: unpaid.length * settings.monthlyAmount,
    coveredUntil: paid.length ? paid[paid.length - 1] : null,
  };
}

// ---------------------------------------------------------------- messages WhatsApp

/** Rappel personnel (envoyé au numéro du membre). */
export function personalReminder(firstName: string, s: MemberSituation, settings: CotisationSettings, siteUrl: string): string {
  const months = s.unpaid.map((m) => monthLabel(m)).join(', ');
  return `Paix à vous ${firstName} !\n\nPetit rappel de la *cotisation mensuelle KCCiste* (${formatMoney(settings.monthlyAmount, settings.currency)} par mois). Il reste ${s.unpaid.length} mois à régler : ${months}, soit ${formatMoney(s.owed, settings.currency)}.\n\nVous pouvez voir vos cotisations dans « Mon espace » sur ${siteUrl}/espace/cotisations\n\nMerci pour votre fidélité. Que Dieu vous bénisse.`;
}

/** Rappel au groupe : noms et nombre de mois seulement (jamais les matricules ni les numéros). */
export function groupReminder(late: { name: string; months: number }[], settings: CotisationSettings, siteUrl: string): string {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const list = late.map((l, i) => `${i + 1}. ${l.name} — ${l.months} mois`).join('\n');
  return `💛 *JE SUIS KCCiste* — Cotisations mensuelles (${date})\n\nPaix à vous ! La cotisation est de *${formatMoney(settings.monthlyAmount, settings.currency)} par mois*${settings.purpose ? ` (${settings.purpose})` : ''}.\n\nMerci à tous ceux qui sont à jour. Les KCCistes suivants ont encore des mois à régler :\n\n${list}\n\nChacun peut voir ses cotisations dans « Mon espace » : ${siteUrl}/espace/cotisations\n\n💬 Groupe : ${WHATSAPP_GROUP_URL}`;
}

/** Message du membre pour envoyer sa preuve de paiement. */
export function proofMessage(name: string, matricule: string | null, months: string[], siteUrl: string): string {
  const which = months.length ? months.map((m) => monthLabel(m)).join(', ') : monthLabel(monthKey());
  return `Paix à vous ! Je suis ${name}${matricule ? ` (matricule ${matricule})` : ''}. Je viens de payer ma cotisation mensuelle KCCiste pour : ${which}. Voici la preuve du paiement (capture ou référence) :\n\n${siteUrl}`;
}

// ---------------------------------------------------------------- données

export const DEFAULT_SETTINGS: CotisationSettings = { monthlyAmount: 5, currency: 'USD', startMonth: '2026-11', purpose: 'Assistance des cas de premier degré (deuils proches…)' };

/** Tant que le SQL n'a pas été collé dans Supabase, les tables n'existent pas. */
export class CotisationsNotInstalled extends Error {
  constructor() { super('Les tables des cotisations ne sont pas encore installées dans Supabase.'); }
}
function missingTable(e: unknown): boolean {
  const o = (e ?? {}) as { code?: string; message?: string };
  return o.code === '42P01' || o.code === 'PGRST205' || o.code === 'PGRST202' || /does not exist|schema cache/i.test(o.message ?? '');
}

const DEMO_KEY = 'kcc.demo.cotisations';
const DEMO_SETTINGS_KEY = 'kcc.demo.cotisations.reglages';
function demoRead<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function demoWrite(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }

type Row = { id: string; user_id: string; month: string; amount: number | string; currency: CotisationCurrency; method: CotisationMethod; reference: string | null; note: string | null; paid_on: string; created_at: string };
const fromRow = (r: Row): Cotisation => ({ id: r.id, userId: r.user_id, month: r.month.slice(0, 7), amount: Number(r.amount), currency: r.currency, method: r.method, reference: r.reference, note: r.note, paidOn: r.paid_on, createdAt: r.created_at });

export async function getCotisationSettings(): Promise<CotisationSettings> {
  if (isDemoMode) return demoRead(DEMO_SETTINGS_KEY, DEFAULT_SETTINGS);
  const { data, error } = await supabase!.from('cotisation_settings').select('monthly_amount, currency, start_month, purpose').eq('id', 1).maybeSingle();
  if (error) { if (missingTable(error)) throw new CotisationsNotInstalled(); throw error; }
  if (!data) return DEFAULT_SETTINGS;
  return { monthlyAmount: Number(data.monthly_amount), currency: data.currency as CotisationCurrency, startMonth: String(data.start_month).slice(0, 7), purpose: data.purpose ?? '' };
}

export async function saveCotisationSettings(s: CotisationSettings): Promise<void> {
  if (isDemoMode) { demoWrite(DEMO_SETTINGS_KEY, s); return; }
  const { data, error } = await supabase!.from('cotisation_settings')
    .update({ monthly_amount: s.monthlyAmount, currency: s.currency, start_month: `${s.startMonth}-01`, purpose: s.purpose.trim(), updated_at: new Date().toISOString() })
    .eq('id', 1).select('id');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('Modification refusée : réservé à l’administration.');
}

/** Toutes les cotisations visibles (le membre ne reçoit que les siennes). */
export async function listCotisations(userId?: string): Promise<Cotisation[]> {
  if (isDemoMode) return demoRead<Cotisation[]>(DEMO_KEY, []).filter((c) => !userId || c.userId === userId);
  let q = supabase!.from('member_cotisations').select('id, user_id, month, amount, currency, method, reference, note, paid_on, created_at').order('month', { ascending: false });
  if (userId) q = q.eq('user_id', userId);
  const { data, error } = await q;
  if (error) { if (missingTable(error)) throw new CotisationsNotInstalled(); throw error; }
  return (data as Row[]).map(fromRow);
}

export async function recordCotisations(input: NewCotisations): Promise<void> {
  if (!input.months.length) throw new Error('Choisissez au moins un mois.');
  if (!(input.amount > 0)) throw new Error('Le montant doit être supérieur à zéro.');
  const base = { amount: input.amount, currency: input.currency, method: input.method, reference: input.reference?.trim() || null, note: input.note?.trim() || null, paid_on: input.paidOn };
  if (isDemoMode) {
    const all = demoRead<Cotisation[]>(DEMO_KEY, []);
    for (const m of input.months) {
      if (all.some((c) => c.userId === input.userId && c.month === m)) throw new Error(`${monthLabel(m)} est déjà payé.`);
      all.push({ id: `demo-${Date.now()}-${m}`, userId: input.userId, month: m, amount: base.amount, currency: base.currency, method: base.method, reference: base.reference, note: base.note, paidOn: base.paid_on, createdAt: new Date().toISOString() });
    }
    demoWrite(DEMO_KEY, all);
    return;
  }
  const { error } = await supabase!.from('member_cotisations').insert(input.months.map((m) => ({ ...base, user_id: input.userId, month: `${m}-01` })));
  if (error) {
    if (error.code === '23505') throw new Error('Un de ces mois est déjà enregistré pour ce membre.');
    if (missingTable(error)) throw new CotisationsNotInstalled();
    throw new Error(error.message);
  }
}

export async function deleteCotisation(id: string): Promise<void> {
  if (isDemoMode) { demoWrite(DEMO_KEY, demoRead<Cotisation[]>(DEMO_KEY, []).filter((c) => c.id !== id)); return; }
  const { data, error } = await supabase!.from('member_cotisations').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('Suppression refusée.');
}

/** Tableau à ouvrir dans Excel (séparateur « ; », accents conservés). */
export function cotisationsCsv(rows: { name: string; matricule: string | null; c: Cotisation }[]): string {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['Mois', 'Nom', 'Matricule', 'Montant', 'Monnaie', 'Moyen', 'Référence', 'Payé le', 'Note'];
  const lines = rows.map(({ name, matricule, c }) => [monthLabel(c.month), name, matricule ?? '', String(c.amount).replace('.', ','), c.currency, COTISATION_METHODS[c.method], c.reference ?? '', c.paidOn, c.note ?? ''].map(esc).join(';'));
  return `﻿${[head.map(esc).join(';'), ...lines].join('\r\n')}`;
}
