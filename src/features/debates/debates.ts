import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';

/**
 * Commentaires des débats audio (table `debate_comments`, bucket public
 * `debate-audio`). Ouverts à tous sans compte : la base fixe la date et
 * l'auteur connecté éventuel, et contrôle le chemin des audios.
 */
export interface DebateComment {
  id: string;
  topicId: string;
  authorName: string;
  body: string | null;
  audioPath: string | null;
  audioSeconds: number | null;
  isHidden: boolean;
  createdAt: string;
}

export const DEBATE_BUCKET = 'debate-audio';
export const DEBATE_AUDIO_MAX_BYTES = 10 * 1024 * 1024;
export const DEBATE_RECORD_MAX_SECONDS = 180;
export const DEBATE_TEXT_MAX = 2000;

const EXT_BY_TYPE: Record<string, string> = {
  'audio/webm': 'webm', 'video/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'video/mp4': 'mp4',
  'audio/x-m4a': 'm4a', 'audio/m4a': 'm4a', 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/aac': 'aac',
  'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/wave': 'wav', 'audio/3gpp': '3gp', 'audio/amr': 'amr',
};
const EXT_FROM_NAME = /\.(webm|ogg|opus|m4a|mp4|mp3|aac|wav|3gp|amr)$/i;

/** Extension et type de contenu acceptés par le bucket, ou null si le fichier n'est pas un audio reconnu. */
export function audioFormat(type: string, fileName = ''): { ext: string; contentType: string } | null {
  const base = type.split(';')[0].trim().toLowerCase();
  if (EXT_BY_TYPE[base]) return { ext: EXT_BY_TYPE[base], contentType: base === 'audio/mp3' ? 'audio/mpeg' : base === 'audio/wave' ? 'audio/wav' : base };
  const m = fileName.match(EXT_FROM_NAME);
  if (!m) return null;
  const ext = m[1].toLowerCase();
  // Les notes vocales WhatsApp (.opus) sont de l'Ogg.
  const byExt: Record<string, { ext: string; contentType: string }> = {
    opus: { ext: 'ogg', contentType: 'audio/ogg' }, ogg: { ext: 'ogg', contentType: 'audio/ogg' }, webm: { ext: 'webm', contentType: 'audio/webm' },
    m4a: { ext: 'm4a', contentType: 'audio/mp4' }, mp4: { ext: 'mp4', contentType: 'audio/mp4' }, mp3: { ext: 'mp3', contentType: 'audio/mpeg' },
    aac: { ext: 'aac', contentType: 'audio/aac' }, wav: { ext: 'wav', contentType: 'audio/wav' }, '3gp': { ext: '3gp', contentType: 'audio/3gpp' }, amr: { ext: 'amr', contentType: 'audio/amr' },
  };
  return byExt[ext] ?? null;
}

/** Durée lisible « 1:05 ». */
export function formatSeconds(s: number) {
  const v = Math.max(0, Math.round(s));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
}

export function audioUrl(path: string) {
  if (path.startsWith('blob:') || path.startsWith('/')) return path;
  if (!supabase) return path;
  return supabase.storage.from(DEBATE_BUCKET).getPublicUrl(path).data.publicUrl;
}

let demoComments: DebateComment[] = [];

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

export async function listDebateComments(topicId: string, includeHidden = false): Promise<DebateComment[]> {
  if (isDemoMode) return demoComments.filter((c) => c.topicId === topicId && (includeHidden || !c.isHidden));
  const { data, error } = await db().from('debate_comments').select('*').eq('topic_id', topicId).order('created_at', { ascending: true }).limit(2000);
  if (error) throw error;
  return camelize<DebateComment[]>(data ?? []);
}

export interface NewDebateComment { topicId: string; authorName: string; body?: string; audio?: Blob | null; audioName?: string; audioSeconds?: number | null }

export async function addDebateComment(c: NewDebateComment): Promise<DebateComment> {
  const name = c.authorName.trim();
  const body = (c.body ?? '').trim();
  if (name.length < 2) throw new Error('name');
  if (!body && !c.audio) throw new Error('empty');
  if (body.length > DEBATE_TEXT_MAX) throw new Error('too-long');
  let audioPath: string | null = null;
  if (c.audio) {
    if (c.audio.size > DEBATE_AUDIO_MAX_BYTES) throw new Error('too-big');
    const fmt = audioFormat(c.audio.type, c.audioName);
    if (!fmt) throw new Error('format');
    if (isDemoMode) {
      audioPath = URL.createObjectURL(c.audio);
    } else {
      audioPath = `${c.topicId}/${crypto.randomUUID()}.${fmt.ext}`;
      const { error } = await db().storage.from(DEBATE_BUCKET).upload(audioPath, c.audio, { contentType: fmt.contentType, upsert: false });
      if (error) throw error;
    }
  }
  const seconds = c.audioSeconds != null && Number.isFinite(c.audioSeconds) ? Math.min(900, Math.round(c.audioSeconds)) : null;
  if (isDemoMode) {
    const row: DebateComment = { id: `dc-demo-${Date.now()}`, topicId: c.topicId, authorName: name, body: body || null, audioPath, audioSeconds: seconds, isHidden: false, createdAt: new Date().toISOString() };
    demoComments = [...demoComments, row];
    return row;
  }
  const { data, error } = await db().from('debate_comments')
    .insert({ topic_id: c.topicId, author_name: name, body: body || null, audio_path: audioPath, audio_seconds: seconds })
    .select('*').single();
  if (error) throw error;
  return camelize<DebateComment>(data);
}

export async function setDebateCommentHidden(c: DebateComment, isHidden: boolean): Promise<void> {
  if (isDemoMode) {
    demoComments = demoComments.map((x) => (x.id === c.id ? { ...x, isHidden } : x));
    return;
  }
  const { error } = await db().from('debate_comments').update({ is_hidden: isHidden }).eq('id', c.id);
  if (error) throw error;
}

export async function deleteDebateComment(c: DebateComment): Promise<void> {
  if (isDemoMode) {
    demoComments = demoComments.filter((x) => x.id !== c.id);
    return;
  }
  if (c.audioPath) await db().storage.from(DEBATE_BUCKET).remove([c.audioPath]);
  const { error } = await db().from('debate_comments').delete().eq('id', c.id);
  if (error) throw error;
}
