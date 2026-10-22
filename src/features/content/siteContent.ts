import { useEffect, useState } from 'react';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { repository } from '@/services/repository';
import { camelize } from '@/utils/case';
import { prepareImage } from '@/features/apostles/apostles';
import { audioTypeOf, checkAudio, readDuration } from '@/features/sermons/sermons';
import { galleryPhotos, type GalleryPhoto, type GalleryTheme } from '@/content/galerie';
import { YOUTUBE_VIDEOS, type YouTubeVideo } from '@/config/youtube';
import { CONTRIBUTIONS, DONATION_ACCOUNTS, SOLIDARITY_OPERATIONS, type Contribution, type DonationAccount, type SolidarityOperation } from '@/content/solidarite';
import type { MobileProvider } from '@/features/music/shop';
import type { Tri } from '@/i18n';

/**
 * Contenu du site modifiable par l'administration (table `site_content`) :
 * une ligne par élément, rangée dans une « collection » (galerie, vidéos…).
 * Les clés de `data` sont des mots simples en minuscules, pour passer telles
 * quelles entre la base (snake_case) et le site (camelCase).
 */
export type SiteCollection = 'gallery' | 'videos' | 'operations' | 'contributions' | 'donation_accounts';

export interface SiteContentRow {
  id: string;
  collection: SiteCollection;
  position: number;
  data: Record<string, unknown>;
  published: boolean;
  createdAt?: string;
}

/** Texte en trois langues : un champ anglais ou portugais vide reprend le français. */
export const tri = (v: unknown): Tri => {
  const o = (v && typeof v === 'object' ? v : { fr: typeof v === 'string' ? v : '' }) as Partial<Tri>;
  const fr = String(o.fr ?? '');
  return { fr, en: String(o.en || fr), pt: String(o.pt || fr) };
};
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const lines = (t: Tri): Tri[] => {
  const [fr, en, pt] = [t.fr, t.en, t.pt].map((s) => s.split('\n').map((x) => x.trim()).filter(Boolean));
  return fr.map((f, i) => ({ fr: f, en: en[i] ?? f, pt: pt[i] ?? f }));
};

// ——— Conversion ligne <-> contenu affiché ———

export const toGallery = (d: Record<string, unknown>): GalleryPhoto => ({
  src: str(d.src), w: Number(d.w) || 1200, h: Number(d.h) || 900, theme: (str(d.theme) || 'culte') as GalleryTheme, caption: tri(d.caption),
});
export const toVideo = (d: Record<string, unknown>): YouTubeVideo => ({ id: str(d.youtube), title: tri(d.title) });
export const toOperation = (d: Record<string, unknown>): SolidarityOperation => ({
  key: str(d.key), parish: str(d.parish), done: Boolean(d.done), photos: Array.isArray(d.photos) ? d.photos.map(str).filter(Boolean) : [],
  t: tri(d.title), d: tri(d.text), facts: lines(tri(d.facts)), date: tri(d.date),
});
export interface ContributionLine extends Contribution { operation: string }
export const toContribution = (d: Record<string, unknown>): ContributionLine => ({ operation: str(d.operation), flag: str(d.flag) || undefined, name: str(d.name), amount: str(d.amount) });
export const toDonationAccount = (d: Record<string, unknown>): DonationAccount => ({ provider: str(d.provider) as MobileProvider, number: str(d.number), holder: str(d.holder) });

/** Contenu livré avec le site, sous forme de lignes (démonstration et script d'export SQL). */
export function baseRows(): Omit<SiteContentRow, 'id'>[] {
  const rows: Omit<SiteContentRow, 'id'>[] = [];
  const push = (collection: SiteCollection, list: Record<string, unknown>[]) => list.forEach((data, i) => rows.push({ collection, position: (i + 1) * 10, data, published: true }));
  push('gallery', galleryPhotos.map((p) => ({ src: p.src, w: p.w, h: p.h, theme: p.theme, caption: p.caption })));
  push('videos', YOUTUBE_VIDEOS.map((v) => ({ youtube: v.id, title: v.title })));
  push('operations', SOLIDARITY_OPERATIONS.map((o) => ({
    key: o.key, parish: o.parish, done: o.done, photos: o.photos, title: o.t, text: o.d, date: o.date,
    facts: { fr: o.facts.map((f) => f.fr).join('\n'), en: o.facts.map((f) => f.en).join('\n'), pt: o.facts.map((f) => f.pt).join('\n') },
  })));
  push('contributions', Object.entries(CONTRIBUTIONS).flatMap(([operation, list]) => list.map((c) => ({ operation, flag: c.flag ?? '', name: c.name, amount: c.amount }))));
  push('donation_accounts', DONATION_ACCOUNTS.map((a) => ({ provider: a.provider, number: a.number, holder: a.holder })));
  return rows;
}

export const siteContentRepo = repository<SiteContentRow>('site_content', baseRows().map((r, i) => ({ ...r, id: `cnt-${i + 1}` })), 'cnt');

export const sortRows = (rows: SiteContentRow[]) => [...rows].sort((a, b) => a.position - b.position || String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? '')));

// ——— Lecture publique ———

const cache = new Map<SiteCollection, Promise<SiteContentRow[] | null>>();

/** Lignes publiées d'une collection, ou null si la table n'existe pas encore (SQL pas encore exécuté). */
function load(collection: SiteCollection): Promise<SiteContentRow[] | null> {
  let p = cache.get(collection);
  if (!p) {
    p = (async () => {
      if (isDemoMode) return sortRows((await siteContentRepo.all()).filter((r) => r.collection === collection && r.published));
      const { data, error } = await supabase!.from('site_content').select('*').eq('collection', collection).eq('published', true).order('position').order('created_at');
      if (error) return null;
      return camelize<SiteContentRow[]>(data ?? []);
    })().catch(() => null);
    cache.set(collection, p);
  }
  return p;
}

/** À appeler après une modification dans l'administration. */
export const invalidateSiteContent = () => cache.clear();

/**
 * Contenu d'une collection pour les pages publiques : la base dès qu'elle est
 * installée, sinon le contenu livré avec le site. `null` pendant le chargement.
 */
export function useSiteContent<T>(collection: SiteCollection, convert: (d: Record<string, unknown>) => T, fallback: T[]): T[] | null {
  const [items, setItems] = useState<T[] | null>(null);
  useEffect(() => {
    let alive = true;
    void load(collection).then((rows) => { if (alive) setItems(rows ? rows.map((r) => convert(r.data)) : fallback); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);
  return items;
}

// ——— Photos ———

const randomId = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/-/g, '').slice(0, 12);

/**
 * Dépose une image (réduite à 1200 px) dans le stockage public, dossier
 * contenu/<rubrique>/, et renvoie son adresse et ses dimensions.
 */
export async function uploadSiteImage(file: File, folder: string): Promise<{ url: string; w: number; h: number }> {
  let blob: Blob;
  try {
    blob = await prepareImage(file);
  } catch (e) {
    throw new Error(e instanceof Error && e.message === 'size' ? 'Photo trop lourde (20 Mo maximum).' : 'Format non pris en charge : choisissez une photo JPG, PNG ou WebP.');
  }
  const { w, h } = await imageSize(blob);
  if (isDemoMode) return { url: URL.createObjectURL(blob), w, h };
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `contenu/${folder.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'divers'}/${new Date().toISOString().slice(0, 10)}-${randomId()}.${ext}`;
  const up = await supabase!.storage.from('public-assets').upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false, cacheControl: '31536000' });
  if (up.error) throw new Error(`Envoi de la photo impossible : ${up.error.message}`);
  return { url: supabase!.storage.from('public-assets').getPublicUrl(path).data.publicUrl, w, h };
}

async function imageSize(blob: Blob): Promise<{ w: number; h: number }> {
  if (typeof createImageBitmap !== 'function') return { w: 1200, h: 900 };
  try {
    const bmp = await createImageBitmap(blob);
    return { w: bmp.width, h: bmp.height };
  } catch {
    return { w: 1200, h: 900 };
  }
}

/**
 * Dépose un chant dans le bucket public `chants` et renvoie son adresse et
 * sa durée (lue par le navigateur, en secondes).
 */
export async function uploadSiteAudio(file: File, title: string): Promise<{ url: string; duration: number | null }> {
  const problem = checkAudio(file);
  if (problem) throw new Error(problem.replace('Coupez la prédication en deux parties ou compressez', 'Compressez'));
  const type = audioTypeOf(file)!;
  const duration = await readDuration(file);
  if (isDemoMode) return { url: URL.createObjectURL(file), duration };
  const ext = type === 'audio/mpeg' ? 'mp3' : file.name.split('.').pop()?.toLowerCase() ?? 'mp3';
  const base = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'chant';
  const path = `${base}-${randomId()}.${ext}`;
  const up = await supabase!.storage.from('chants').upload(path, file, { contentType: type, upsert: false, cacheControl: '31536000' });
  if (up.error) throw new Error(`Envoi du chant impossible : ${up.error.message}`);
  return { url: supabase!.storage.from('chants').getPublicUrl(path).data.publicUrl, duration };
}

/** Identifiant YouTube (11 caractères) tiré d'un lien collé, ou null. */
export function youtubeIdFrom(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}
