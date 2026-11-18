import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { repository } from '@/services/repository';
import { camelize } from '@/utils/case';
import { SHIPPED_MEMORIALS } from '@/content/memorial';
import type { Locale } from '@/i18n';

/** Fiche d'un fidèle rappelé à Dieu (table `memorials`). */
export interface Memorial {
  id: string;
  /** Adresse publique : /memorial/<slug>. */
  slug: string;
  fullName: string;
  honorific?: string | null;
  parish?: string | null;
  city?: string | null;
  /** AAAA-MM-JJ. */
  birthDate?: string | null;
  deathDate?: string | null;
  burialDate?: string | null;
  photoUrl?: string | null;
  epitaph?: string | null;
  biography?: string | null;
  articleUrl?: string | null;
  published: boolean;
  createdAt?: string;
  /** Fiche livrée avec le site (pas encore dans la base). */
  shipped?: boolean;
}

export interface Condolence {
  id: string;
  memorialSlug: string;
  authorName: string;
  authorParish?: string | null;
  message: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export const CONDOLENCE_MAX = 1500;

/** Fiches livrées avec le site, dans la langue choisie. */
export function shippedMemorials(locale: Locale = 'fr'): Memorial[] {
  return SHIPPED_MEMORIALS.map((m) => ({
    id: `shipped-${m.slug}`, slug: m.slug, fullName: m.fullName, honorific: m.honorific[locale], parish: m.parish, city: m.city,
    birthDate: m.birthDate ?? null, deathDate: m.deathDate ?? null, burialDate: m.burialDate ?? null, photoUrl: m.photoUrl,
    epitaph: m.epitaph[locale], biography: m.biography[locale], articleUrl: m.articleUrl ?? null, published: true, createdAt: m.createdAt, shipped: true,
  }));
}

export const memorialsRepo = repository<Memorial>('memorials', shippedMemorials('fr').map((m) => ({ ...m, shipped: false })), 'mem', '*', ['shipped']);

/** Date du décès (ou, à défaut, de l'inhumation puis de l'ajout) : sert à l'ordre d'affichage. */
const sortKey = (m: Memorial) => m.deathDate ?? m.burialDate ?? m.createdAt?.slice(0, 10) ?? '';
export const sortMemorials = (list: Memorial[]) => [...list].sort((a, b) => sortKey(b).localeCompare(sortKey(a)) || a.fullName.localeCompare(b.fullName));

/**
 * Liste publique : fiches de la base + fiches livrées avec le site qui n'ont
 * pas (encore) été reprises dans la base. Si le SQL n'a pas été collé,
 * seules les fiches livrées s'affichent.
 */
export async function listPublicMemorials(locale: Locale): Promise<Memorial[]> {
  const rows = isDemoMode ? [] : await memorialsRepo.all().catch(() => [] as Memorial[]);
  const taken = new Set(rows.map((r) => r.slug));
  return sortMemorials([...rows.filter((r) => r.published), ...shippedMemorials(locale).filter((m) => !taken.has(m.slug))]);
}

export async function getMemorial(slug: string, locale: Locale): Promise<Memorial | null> {
  return (await listPublicMemorials(locale)).find((m) => m.slug === slug) ?? null;
}

export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

// ——— Condoléances ———

/** Messages de démonstration (sans Supabase) : vivent seulement dans l'onglet. */
let demoCondolences: Condolence[] = [];

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

/** Messages approuvés d'une fiche (l'administration voit aussi ceux en attente). */
export async function listCondolences(slug: string): Promise<Condolence[]> {
  if (isDemoMode) return demoCondolences.filter((c) => c.memorialSlug === slug && c.status === 'approved');
  const { data, error } = await db().from('memorial_condolences').select('*').eq('memorial_slug', slug).eq('status', 'approved').order('created_at', { ascending: true }).limit(500);
  if (error) {
    // Table pas encore créée : la page reste lisible, sans messages.
    if (error.code === '42P01' || error.code === 'PGRST205') return [];
    throw error;
  }
  return camelize<Condolence[]>(data ?? []);
}

/** Dépôt d'un message : il attend la validation de l'administration. */
export async function addCondolence(input: { memorialSlug: string; authorName: string; authorParish?: string; message: string }): Promise<void> {
  const row = {
    memorial_slug: input.memorialSlug,
    author_name: input.authorName.trim().slice(0, 120),
    author_parish: input.authorParish?.trim().slice(0, 160) || null,
    message: input.message.trim().slice(0, CONDOLENCE_MAX),
    status: 'pending' as const,
  };
  if (isDemoMode) {
    demoCondolences = [...demoCondolences, { id: `demo-${Date.now()}`, memorialSlug: row.memorial_slug, authorName: row.author_name, authorParish: row.author_parish, message: row.message, status: 'pending', createdAt: new Date().toISOString() }];
    return;
  }
  // Pas de .select() : un visiteur n'a pas le droit de relire un message en attente.
  const { error } = await db().from('memorial_condolences').insert(row);
  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') throw new Error('Les messages de condoléances ne sont pas encore ouverts. Réessayez plus tard.');
    throw new Error(error.message);
  }
}

/** Administration : tous les messages, les plus récents d'abord. */
export async function listAllCondolences(): Promise<Condolence[]> {
  if (isDemoMode) return [...demoCondolences].reverse();
  const { data, error } = await db().from('memorial_condolences').select('*').order('created_at', { ascending: false }).limit(1000);
  if (error) throw error;
  return camelize<Condolence[]>(data ?? []);
}

export async function approveCondolence(id: string): Promise<void> {
  if (isDemoMode) { demoCondolences = demoCondolences.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)); return; }
  const { error } = await db().from('memorial_condolences').update({ status: 'approved' }).eq('id', id);
  if (error) throw error;
}

export async function unpublishCondolence(id: string): Promise<void> {
  if (isDemoMode) { demoCondolences = demoCondolences.map((c) => (c.id === id ? { ...c, status: 'pending' } : c)); return; }
  const { error } = await db().from('memorial_condolences').update({ status: 'pending' }).eq('id', id);
  if (error) throw error;
}

export async function deleteCondolence(id: string): Promise<void> {
  if (isDemoMode) { demoCondolences = demoCondolences.filter((c) => c.id !== id); return; }
  const { error } = await db().from('memorial_condolences').delete().eq('id', id);
  if (error) throw error;
}

/** Message lisible pour l'administration (Supabase renvoie souvent un simple objet). */
export function memorialErrorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (code === '23505') return 'Une fiche existe déjà avec cette adresse (slug). Changez le nom ou l’adresse.';
  if (/row-level security|permission denied/i.test(msg) || code === '42501') return 'Votre compte n’a pas le droit de gérer le Mémorial (administration centrale requise).';
  if (/schema cache|does not exist/i.test(msg) || code === '42P01' || code === 'PGRST205')
    return 'Le Mémorial n’est pas encore installé dans Supabase : collez le fichier « memorial-a-coller-dans-supabase.sql » dans le SQL Editor, cliquez sur Run, puis réessayez.';
  return msg || 'L’action a échoué.';
}
