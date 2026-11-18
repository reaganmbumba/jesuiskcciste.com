import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import { audioFormat } from '@/features/debates/debates';

/**
 * Vocaux des auditeurs (table `radio_vocals`, bucket public `radio-vocals`).
 * Envoyés depuis /radio ou reçus sur WhatsApp, ils attendent la validation de
 * l'animateur dans /admin/radio. Validés, ils passent à l'antenne : joués par
 * l'animateur pendant le direct, et tout seuls dans la radio automatique
 * pendant VOCAL_DAYS jours.
 */
export type VocalStatus = 'pending' | 'approved' | 'rejected';
export type VocalSource = 'site' | 'whatsapp';

export interface RadioVocal {
  id: string;
  authorName: string;
  place: string | null;
  note: string | null;
  audioPath: string;
  audioSeconds: number | null;
  source: VocalSource;
  status: VocalStatus;
  approvedAt: string | null;
  airedAt: string | null;
  createdAt: string;
}

export const VOCAL_BUCKET = 'radio-vocals';
export const VOCAL_MAX_BYTES = 10 * 1024 * 1024;
export const VOCAL_NOTE_MAX = 300;
/** Un vocal validé reste dans la radio automatique une semaine. */
export const VOCAL_DAYS = 7;

export function vocalUrl(path: string) {
  if (path.startsWith('blob:') || path.startsWith('/')) return path;
  if (!supabase) return path;
  return supabase.storage.from(VOCAL_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Validé depuis moins de VOCAL_DAYS jours ? */
export function isVocalFresh(v: Pick<RadioVocal, 'status' | 'approvedAt'>, now = new Date()): boolean {
  if (v.status !== 'approved' || !v.approvedAt) return false;
  const t = new Date(v.approvedAt).getTime();
  return !Number.isNaN(t) && now.getTime() - t <= VOCAL_DAYS * 86400000;
}

let demoVocals: RadioVocal[] = [];

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

/** Vocaux validés encore à l'antenne (lisibles par tous). */
export async function listAiredVocals(now = new Date()): Promise<RadioVocal[]> {
  const since = new Date(now.getTime() - VOCAL_DAYS * 86400000).toISOString();
  if (isDemoMode) return demoVocals.filter((v) => isVocalFresh(v, now));
  if (!supabase) return [];
  const { data, error } = await supabase.from('radio_vocals').select('*').eq('status', 'approved').gte('approved_at', since).order('approved_at', { ascending: false }).limit(50);
  if (error) throw error;
  return camelize<RadioVocal[]>(data ?? []);
}

/** Tous les vocaux, pour l'animateur. */
export async function listAllVocals(): Promise<RadioVocal[]> {
  if (isDemoMode) return [...demoVocals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const { data, error } = await db().from('radio_vocals').select('*').order('created_at', { ascending: false }).limit(300);
  if (error) throw error;
  return camelize<RadioVocal[]>(data ?? []);
}

export interface NewVocal { authorName: string; place?: string; note?: string; audio: Blob; audioName?: string; audioSeconds?: number | null; source?: VocalSource }

/** Envoie un vocal. Depuis le site, il arrive toujours « en attente ». */
export async function sendVocal(v: NewVocal): Promise<void> {
  const name = v.authorName.trim();
  const note = (v.note ?? '').trim();
  const place = (v.place ?? '').trim();
  if (name.length < 2) throw new Error('name');
  if (!v.audio) throw new Error('empty');
  if (note.length > VOCAL_NOTE_MAX) throw new Error('too-long');
  if (v.audio.size > VOCAL_MAX_BYTES) throw new Error('too-big');
  const fmt = audioFormat(v.audio.type, v.audioName);
  if (!fmt) throw new Error('format');
  const seconds = v.audioSeconds != null && Number.isFinite(v.audioSeconds) ? Math.min(900, Math.round(v.audioSeconds)) : null;
  const source: VocalSource = v.source ?? 'site';
  if (isDemoMode) {
    const approved = source === 'whatsapp';
    const now = new Date().toISOString();
    demoVocals = [{ id: `rv-demo-${Date.now()}`, authorName: name, place: place || null, note: note || null, audioPath: URL.createObjectURL(v.audio), audioSeconds: seconds, source, status: approved ? 'approved' : 'pending', approvedAt: approved ? now : null, airedAt: null, createdAt: now }, ...demoVocals];
    return;
  }
  const audioPath = `${crypto.randomUUID()}.${fmt.ext}`;
  const up = await db().storage.from(VOCAL_BUCKET).upload(audioPath, v.audio, { contentType: fmt.contentType, upsert: false, cacheControl: '31536000' });
  if (up.error) throw up.error;
  // Pas de .select() : un vocal en attente n'est pas lisible par l'auditeur qui l'envoie.
  const { error } = await db().from('radio_vocals').insert({ author_name: name, place: place || null, note: note || null, audio_path: audioPath, audio_seconds: seconds, source });
  if (error) throw error;
}

export async function updateVocal(v: RadioVocal, patch: Partial<Pick<RadioVocal, 'status' | 'airedAt'>>): Promise<void> {
  if (isDemoMode) {
    demoVocals = demoVocals.map((x) => (x.id === v.id ? { ...x, ...patch, approvedAt: patch.status === 'approved' && x.status !== 'approved' ? new Date().toISOString() : patch.status && patch.status !== 'approved' ? null : x.approvedAt } : x));
    return;
  }
  const row: Record<string, unknown> = {};
  if (patch.status) row.status = patch.status;
  if (patch.airedAt !== undefined) row.aired_at = patch.airedAt;
  const { error } = await db().from('radio_vocals').update(row).eq('id', v.id);
  if (error) throw error;
}

export async function deleteVocal(v: RadioVocal): Promise<void> {
  if (isDemoMode) {
    demoVocals = demoVocals.filter((x) => x.id !== v.id);
    return;
  }
  await db().storage.from(VOCAL_BUCKET).remove([v.audioPath]);
  const { error } = await db().from('radio_vocals').delete().eq('id', v.id);
  if (error) throw error;
}
