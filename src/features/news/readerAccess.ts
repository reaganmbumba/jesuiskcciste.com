import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { Announcement } from '@/types';

/**
 * Lecture des articles réservée aux KCCistes munis de leur matricule.
 *
 * Tout le monde lit le début d'un article ; la suite demande d'être connecté
 * et de saisir son matricule personnel sur l'appareil. Un seul appareil à la
 * fois par compte : la base retient l'identifiant de l'appareil autorisé
 * (fonctions `claim_reader_device` et `reader_device_status`).
 * Les communiqués restent ouverts à tous.
 */

export type ReaderStatus = 'ok' | 'autre_appareil' | 'matricule_requis' | 'non_valide' | 'visiteur';

const DEVICE_KEY = 'kcc.reader.device';
const DEMO_CLAIM_KEY = 'kcc.reader.demo';

/** Un communiqué est donné à tout le monde, en entier. */
export function isPublicArticle(a: Pick<Announcement, 'category' | 'title'>): boolean {
  return /communiq|announcement:|comunicado/i.test(`${a.category} ${a.title}`);
}

/** Nombre de paragraphes lisibles sans matricule. */
export function excerptLength(paragraphs: string[]): number {
  const text = paragraphs.filter((p) => p.trim());
  if (text.length <= 2) return 1;
  return Math.min(3, Math.max(2, Math.ceil(text.length * 0.25)));
}

/** Identifiant aléatoire propre à ce navigateur / téléphone. */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return 'appareil-sans-stockage';
  }
}

function deviceLabel(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const kind = /android/i.test(ua) ? 'Android' : /iphone|ipad/i.test(ua) ? 'iPhone' : /windows/i.test(ua) ? 'Ordinateur Windows' : /mac/i.test(ua) ? 'Mac' : 'Appareil';
  return `${kind} · ${new Date().toLocaleDateString('fr-FR')}`;
}

/** Matricule de démonstration, dérivé de l'identifiant du compte. */
export function demoMatricule(userId: string): string {
  let n = 0;
  for (const c of userId) n = (n * 31 + c.charCodeAt(0)) % 99999;
  return `KCC-${String(n || 1).padStart(5, '0')}`;
}

export async function getReaderStatus(signedIn: boolean, isEditor: boolean, isActive: boolean): Promise<ReaderStatus> {
  if (!signedIn) return 'visiteur';
  if (isEditor) return 'ok';
  if (!isActive) return 'non_valide';
  if (isDemoMode) {
    try { return localStorage.getItem(DEMO_CLAIM_KEY) === getDeviceId() ? 'ok' : 'matricule_requis'; } catch { return 'matricule_requis'; }
  }
  const { data, error } = await supabase!.rpc('reader_device_status', { p_device_id: getDeviceId() });
  // Tant que le SQL n'a pas été collé dans Supabase, la fonction n'existe pas : on laisse lire.
  if (error && (error.code === 'PGRST202' || error.code === '42883')) return 'ok';
  if (error) throw error;
  return (data as ReaderStatus) ?? 'matricule_requis';
}

/** Saisie du matricule : cet appareil devient le seul autorisé à lire. */
export async function claimReaderDevice(matricule: string, userId: string): Promise<void> {
  const clean = matricule.replace(/\s/g, '').toUpperCase();
  if (isDemoMode) {
    if (clean !== demoMatricule(userId)) throw new Error('matricule_incorrect');
    try { localStorage.setItem(DEMO_CLAIM_KEY, getDeviceId()); } catch { /* ignore */ }
    return;
  }
  const { error } = await supabase!.rpc('claim_reader_device', { p_matricule: clean, p_device_id: getDeviceId(), p_device_label: deviceLabel() });
  if (error) throw new Error(error.message);
}

/** Matricule de la personne connectée (attribué dès la création du compte). */
export async function getMyMatricule(userId: string, isActive: boolean): Promise<string | null> {
  if (isDemoMode) return isActive ? demoMatricule(userId) : null;
  const { data, error } = await supabase!.from('member_matricules').select('matricule').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data?.matricule as string | undefined) ?? null;
}

export interface MatriculeRow { userId: string; matricule: string; sentAt: string | null; deviceLabel: string | null }

/** Matricules visibles par l'administrateur (son périmètre), avec l'appareil autorisé. */
export async function listMatricules(memberIds: string[]): Promise<Record<string, MatriculeRow>> {
  if (isDemoMode) return Object.fromEntries(memberIds.map((id) => [id, { userId: id, matricule: demoMatricule(id), sentAt: null, deviceLabel: null }]));
  const [{ data, error }, devices] = await Promise.all([
    supabase!.from('member_matricules').select('user_id, matricule, sent_at'),
    supabase!.from('reader_devices').select('user_id, device_label'),
  ]);
  if (error) throw error;
  const dev = new Map((devices.data ?? []).map((d) => [d.user_id as string, (d.device_label as string | null) ?? 'Appareil']));
  return Object.fromEntries((data ?? []).map((r) => [r.user_id, { userId: r.user_id, matricule: r.matricule, sentAt: r.sent_at, deviceLabel: dev.get(r.user_id) ?? null }]));
}

export async function adminReaderAction(userId: string, action: 'liberer' | 'envoye'): Promise<void> {
  if (isDemoMode) return;
  const { error } = await supabase!.rpc('admin_reader_action', { p_user_id: userId, p_action: action });
  if (error) throw new Error(error.message);
}

export async function adminSetMatricule(userId: string, matricule: string): Promise<string> {
  if (isDemoMode) return matricule.replace(/\s/g, '').toUpperCase() || demoMatricule(userId);
  const { data, error } = await supabase!.rpc('admin_set_matricule', { p_user_id: userId, p_matricule: matricule });
  if (error) throw new Error(error.message);
  return data as string;
}

/** Numéro de téléphone au format wa.me (chiffres seulement, indicatif compris). */
export function waNumber(phone?: string | null): string | null {
  const d = (phone ?? '').replace(/[^\d+]/g, '').replace(/^00/, '+');
  if (!d) return null;
  const digits = d.replace(/\D/g, '');
  if (d.startsWith('+')) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `243${digits.slice(1)}`; // numéro congolais local
  return digits.length >= 9 ? digits : null;
}

export function matriculeMessage(firstName: string, matricule: string, siteUrl: string): string {
  return `Paix à vous ${firstName} !\n\nVoici votre matricule KCCiste personnel : *${matricule}*\n\nIl vous permet de lire tous les articles sur le site *Je suis KCCiste* : ${siteUrl}/actualites\n\n1. Connectez-vous avec votre e-mail et votre mot de passe.\n2. Ouvrez un article et saisissez votre matricule.\n\n⚠️ Ce matricule est strictement personnel : ne le partagez pas. Il ne fonctionne que sur un seul téléphone à la fois.`;
}
