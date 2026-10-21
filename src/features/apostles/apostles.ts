import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { repository } from '@/services/repository';
import * as demo from '@/services/demo/data';
import { camelize, snakify } from '@/utils/case';
import type { Apostle, ApostlePhotoSubmission } from '@/types';

/** Liste des Révérends Apôtres (table `apostles`, lecture publique). */
export const apostlesRepo = repository<Apostle>('apostles', demo.demoApostles, 'apo');

const SUBMISSIONS_BUCKET = 'apostle-submissions';
const PUBLIC_BUCKET = 'public-assets';
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SOURCE = 20 * 1024 * 1024;
const MAX_SIDE = 1200;

let demoSubmissions: ApostlePhotoSubmission[] = [...demo.demoApostleSubmissions];
const demoBlobs = new Map<string, string>();

export function sortApostles(list: Apostle[]): Apostle[] {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName, 'fr'));
}

/** « 1930 – 2010 », « … – 2010 », « 1950 – » ou null. */
export function yearsLabel(a: Pick<Apostle, 'birthYear' | 'deathYear' | 'status'>): string | null {
  if (!a.birthYear && !a.deathYear) return null;
  return `${a.birthYear ?? '…'} – ${a.deathYear ?? (a.status === 'deceased' ? '…' : '')}`.trim();
}

/**
 * Réduit la photo (1200 px maximum, JPEG) avant l'envoi : les photos de
 * téléphone font souvent 5 à 10 Mo, ce qui est lent sur les réseaux mobiles.
 */
export async function prepareImage(file: File): Promise<Blob> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('format');
  if (file.size > MAX_SOURCE) throw new Error('size');
  if (typeof createImageBitmap !== 'function') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

const extOf = (b: Blob) => (b.type === 'image/png' ? 'png' : b.type === 'image/webp' ? 'webp' : 'jpg');
const randomId = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/-/g, '');

export interface Proposer { name: string; contact?: string; note?: string }

/** Informations qu'un visiteur peut proposer pour compléter un profil. */
export interface InfoProposal { place?: string; consecration?: string; birthYear?: number | null; deathYear?: number | null; bio?: string }

const clean = (v?: string) => v?.trim() || null;

/**
 * Proposition d'un visiteur (photo et/ou informations) : elle reste
 * invisible jusqu'à la validation par l'administration.
 */
export async function submitApostleProposal(apostleId: string, who: Proposer, input: { file?: File | null; info?: InfoProposal }): Promise<void> {
  const info = input.info ?? {};
  const fields = {
    proposedPlace: clean(info.place), proposedConsecration: clean(info.consecration),
    proposedBirthYear: info.birthYear || null, proposedDeathYear: info.deathYear || null, proposedBio: clean(info.bio),
  };
  if (!input.file && !Object.values(fields).some((v) => v !== null)) throw new Error('empty');
  const blob = input.file ? await prepareImage(input.file) : null;
  const photoPath = blob ? `${apostleId}/${randomId()}.${extOf(blob)}` : null;
  const row = { submitterName: who.name.trim(), submitterContact: clean(who.contact), note: clean(who.note), ...fields };
  if (isDemoMode) {
    if (blob && photoPath) demoBlobs.set(photoPath, URL.createObjectURL(blob));
    demoSubmissions = [{ id: `sub-${Date.now()}`, apostleId, photoPath, ...row, status: 'pending', createdAt: new Date().toISOString() }, ...demoSubmissions];
    return;
  }
  if (blob && photoPath) {
    const up = await supabase!.storage.from(SUBMISSIONS_BUCKET).upload(photoPath, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
    if (up.error) throw up.error;
  }
  const { error } = await supabase!.from('apostle_photo_submissions').insert(snakify({ apostleId, photoPath, ...row }));
  if (error) throw error;
}

// ——— Administration ———

export async function listPhotoSubmissions(): Promise<ApostlePhotoSubmission[]> {
  if (isDemoMode) return [...demoSubmissions];
  const { data, error } = await supabase!.from('apostle_photo_submissions').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return camelize<ApostlePhotoSubmission[]>(data ?? []);
}

/** Aperçu d'une photo proposée (bucket privé : URL signée de 10 minutes). */
export async function submissionPreviewUrl(path: string): Promise<string> {
  if (isDemoMode) return demoBlobs.get(path) ?? '';
  const { data, error } = await supabase!.storage.from(SUBMISSIONS_BUCKET).createSignedUrl(path, 600);
  if (error) throw error;
  return data.signedUrl;
}

/** Publie une image comme photo de profil de l'apôtre et renvoie son adresse publique. */
async function publishPhoto(apostleId: string, blob: Blob): Promise<string> {
  if (isDemoMode) {
    const url = URL.createObjectURL(blob);
    await apostlesRepo.update(apostleId, { photoUrl: url });
    return url;
  }
  const path = `apotres/${apostleId}-${Date.now()}.${extOf(blob)}`;
  const up = await supabase!.storage.from(PUBLIC_BUCKET).upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
  if (up.error) throw up.error;
  const url = supabase!.storage.from(PUBLIC_BUCKET).getPublicUrl(path).data.publicUrl;
  await apostlesRepo.update(apostleId, { photoUrl: url });
  return url;
}

/** L'administration dépose directement une photo pour un apôtre. */
export async function uploadApostlePhoto(apostleId: string, file: File): Promise<string> {
  return publishPhoto(apostleId, await prepareImage(file));
}

async function setSubmissionStatus(s: ApostlePhotoSubmission, status: 'approved' | 'rejected') {
  const reviewedAt = new Date().toISOString();
  if (isDemoMode) {
    demoSubmissions = demoSubmissions.map((x) => (x.id === s.id ? { ...x, status, reviewedAt } : x));
    return;
  }
  const { error } = await supabase!.from('apostle_photo_submissions').update({ status, reviewed_at: reviewedAt }).eq('id', s.id);
  if (error) throw error;
  // Le fichier proposé n'est plus utile : la photo approuvée a été copiée dans le stockage public.
  if (s.photoPath) await supabase!.storage.from(SUBMISSIONS_BUCKET).remove([s.photoPath]);
}

/** Les informations proposées, prêtes à être enregistrées sur le profil (champs vides ignorés). */
export function proposedPatch(s: ApostlePhotoSubmission): Partial<Apostle> {
  const patch: Partial<Apostle> = {};
  if (s.proposedPlace) patch.place = s.proposedPlace;
  if (s.proposedConsecration) patch.consecrationDate = s.proposedConsecration;
  if (s.proposedBirthYear) patch.birthYear = s.proposedBirthYear;
  if (s.proposedDeathYear) { patch.deathYear = s.proposedDeathYear; patch.status = 'deceased'; }
  if (s.proposedBio) patch.bio = s.proposedBio;
  return patch;
}

export async function approveSubmission(s: ApostlePhotoSubmission): Promise<void> {
  if (s.photoPath) {
    let blob: Blob;
    if (isDemoMode) blob = await (await fetch(demoBlobs.get(s.photoPath)!)).blob();
    else {
      const { data, error } = await supabase!.storage.from(SUBMISSIONS_BUCKET).download(s.photoPath);
      if (error) throw error;
      blob = data;
    }
    await publishPhoto(s.apostleId, blob);
  }
  const patch = proposedPatch(s);
  if (Object.keys(patch).length) await apostlesRepo.update(s.apostleId, patch);
  await setSubmissionStatus(s, 'approved');
}

export const rejectSubmission = (s: ApostlePhotoSubmission) => setSubmissionStatus(s, 'rejected');

/**
 * Ajout en lot depuis une liste collée (un nom par ligne, numérotation ignorée).
 * « (décédé) » ou « (+) » en fin de ligne : décédé ; « (en vie) » : en vie ;
 * sinon le statut reste « non précisé ».
 */
export function parseApostleList(text: string, startOrder = 0): Omit<Apostle, 'id'>[] {
  const DECEASED = /\((\+|d[ée]c[ée]d[ée]e?|deceased|falecido)\)\s*$/i;
  const LIVING = /\((en vie|vivant|living|vivo)\)\s*$/i;
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(\d+[.)-]?|[-*•])\s*/, '').trim())
    .filter((l) => l.length >= 2)
    .map((line, i) => {
      const status = DECEASED.test(line) ? 'deceased' : LIVING.test(line) ? 'living' : 'unknown';
      const name = line.replace(DECEASED, '').replace(LIVING, '').replace(/^(R[ée]v[ée]rend\s+)?Ap[ôo]tre\s+/i, '').trim();
      return { fullName: name, title: 'Révérend Apôtre', status, photoUrl: null, place: null, bio: null, sortOrder: startOrder + i + 1 };
    });
}
