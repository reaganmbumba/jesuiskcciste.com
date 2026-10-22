import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { repository } from '@/services/repository';
import * as demo from '@/services/demo/data';
import { prepareImage } from '@/features/apostles/apostles';
import type { AudioSermon } from '@/types';

/** Prédications audio (table `audio_sermons` ; les visiteurs ne voient que les publiées). */
export const audioSermonsRepo = repository<AudioSermon>('audio_sermons', demo.demoAudioSermons, 'pre');

/**
 * Liste publique. Si la table n'existe pas encore (SQL pas encore exécuté
 * dans Supabase), on montre les prédications livrées avec le site.
 */
export async function listPublicSermons(): Promise<AudioSermon[]> {
  const rows = await audioSermonsRepo.all().catch(() => demo.demoAudioSermons);
  return sortSermons(rows.filter((s) => s.published));
}

const BUCKET = 'predications';
/** Limite d'un fichier sur le forfait gratuit de Supabase. */
export const MAX_AUDIO_BYTES = 50 * 1024 * 1024;

/**
 * Type MIME d'après l'extension : les audios WhatsApp enregistrés en « .mpeg »
 * sont des MP3, mais Windows les annonce souvent comme vidéo.
 */
const AUDIO_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg', mpeg: 'audio/mpeg', mpga: 'audio/mpeg', m4a: 'audio/mp4', mp4: 'audio/mp4', aac: 'audio/aac',
  ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', webm: 'audio/webm',
};
export const AUDIO_ACCEPT = Object.keys(AUDIO_TYPES).map((e) => `.${e}`).join(',') + ',audio/*';

const extOf = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

export function audioTypeOf(file: File): string | null {
  return AUDIO_TYPES[extOf(file.name)] ?? null;
}

/** Erreur lisible pour l'administrateur, ou null si le fichier convient. */
export function checkAudio(file: File): string | null {
  if (!audioTypeOf(file)) return 'Format non pris en charge : utilisez un fichier MP3, M4A, OGG, OPUS, WAV ou un audio WhatsApp (.mpeg).';
  if (file.size > MAX_AUDIO_BYTES) return `Fichier trop lourd (${Math.round(file.size / 1048576)} Mo) : 50 Mo maximum. Coupez la prédication en deux parties ou compressez-la en MP3 64 kbit/s.`;
  return null;
}

/** Durée lue dans le fichier par le navigateur (null si illisible). */
export function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof Audio === 'undefined') return resolve(null);
    const url = URL.createObjectURL(file);
    const a = new Audio();
    const done = (v: number | null) => { URL.revokeObjectURL(url); resolve(v); };
    a.preload = 'metadata';
    a.onloadedmetadata = () => done(Number.isFinite(a.duration) ? Math.round(a.duration) : null);
    a.onerror = () => done(null);
    setTimeout(() => done(null), 8000);
    a.src = url;
  });
}

const randomId = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/-/g, '').slice(0, 12);
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'predication';

async function upload(path: string, blob: Blob, contentType: string): Promise<string> {
  if (isDemoMode) return URL.createObjectURL(blob);
  const up = await supabase!.storage.from(BUCKET).upload(path, blob, { contentType, upsert: false, cacheControl: '31536000' });
  if (up.error) throw up.error;
  return supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function removeFile(path?: string | null) {
  if (!path || isDemoMode) return;
  await supabase!.storage.from(BUCKET).remove([path]);
}

/** Supprime un fichier déposé, sans échouer (nettoyage après une erreur). */
export const removeSermonFile = (path?: string | null) => removeFile(path).catch(() => undefined);


/** Dépose le fichier audio ; renvoie les champs à enregistrer sur la prédication. */
export async function uploadSermonAudio(file: File, title: string): Promise<Pick<AudioSermon, 'audioUrl' | 'audioPath' | 'durationSeconds'>> {
  const problem = checkAudio(file);
  if (problem) throw new Error(problem);
  const type = audioTypeOf(file)!;
  const ext = type === 'audio/mpeg' ? 'mp3' : extOf(file.name);
  const path = `audio/${slug(title)}-${randomId()}.${ext}`;
  const [audioUrl, durationSeconds] = await Promise.all([upload(path, file, type), readDuration(file)]);
  return { audioUrl, audioPath: path, durationSeconds };
}

/** Photo du prédicateur, réduite à 1200 px avant l'envoi. */
export async function uploadPreacherPhoto(file: File, preacher: string): Promise<string> {
  const blob = await prepareImage(file);
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  return upload(`photos/${slug(preacher)}-${randomId()}.${ext}`, blob, blob.type || 'image/jpeg');
}

/** Remplace l'audio d'une prédication existante et supprime l'ancien fichier. */
export async function replaceSermonAudio(sermon: AudioSermon, file: File): Promise<void> {
  const fields = await uploadSermonAudio(file, sermon.title);
  await audioSermonsRepo.update(sermon.id, fields);
  await removeFile(sermon.audioPath).catch(() => undefined);
}

export async function replacePreacherPhoto(sermon: AudioSermon, file: File): Promise<void> {
  await audioSermonsRepo.update(sermon.id, { preacherPhotoUrl: await uploadPreacherPhoto(file, sermon.preacherName) });
}

/** Supprime la prédication et son fichier audio. */
export async function deleteSermon(sermon: AudioSermon): Promise<void> {
  await audioSermonsRepo.remove(sermon.id);
  await removeFile(sermon.audioPath).catch(() => undefined);
}

/** Les plus récentes d'abord (date de la prédication, sinon date d'ajout). */
export function sortSermons(list: AudioSermon[]): AudioSermon[] {
  const key = (s: AudioSermon) => s.preachedOn ?? s.createdAt?.slice(0, 10) ?? '';
  return [...list].sort((a, b) => key(b).localeCompare(key(a)) || (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

/** Message lisible : Supabase renvoie souvent un simple objet { message, code } et non une Error. */
export function errorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (msg === 'format') return 'Photo : format non pris en charge (JPG, PNG ou WebP).';
  if (msg === 'size') return 'Photo trop lourde (20 Mo maximum).';
  if (/bucket not found|audio_sermons|schema cache|does not exist/i.test(msg) || code === '42P01' || code === 'PGRST205')
    return 'La rubrique n’est pas encore installée dans Supabase : collez le fichier « predications-a-coller-dans-supabase.sql » dans le SQL Editor, cliquez sur Run, puis réessayez.';
  if (/row-level security|permission denied|unauthorized/i.test(msg) || code === '42501')
    return 'Votre compte n’a pas le droit d’ajouter des prédications (administration centrale requise). Reconnectez-vous puis réessayez.';
  if (/payload too large|exceeded the maximum allowed size|entity too large/i.test(msg))
    return 'Fichier trop lourd pour Supabase (50 Mo maximum).';
  if (/failed to fetch|network|load failed/i.test(msg)) return 'Connexion interrompue pendant l’envoi. Vérifiez votre réseau puis réessayez.';
  return msg ? `Échec de l’envoi : ${msg}${code ? ` (${code})` : ''}` : 'Échec de l’envoi.';
}
