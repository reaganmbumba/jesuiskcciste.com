import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';

/**
 * Participations et votes des challenges (tables `challenge_entries`,
 * `challenge_votes`, bucket public `challenge-videos`). Ouverts à tous sans
 * compte : la base fixe la date, contrôle le chemin des vidéos et garde
 * une seule voix par téléphone et par challenge.
 */
export interface ChallengeEntry {
  id: string;
  challengeId: string;
  authorName: string;
  place: string | null;
  note: string | null;
  videoPath: string | null;
  tiktokUrl: string | null;
  isHidden: boolean;
  createdAt: string;
}

export const CHALLENGE_BUCKET = 'challenge-videos';
export const CHALLENGE_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const CHALLENGE_NOTE_MAX = 500;

const EXT_BY_TYPE: Record<string, string> = {
  'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm', 'video/3gpp': '3gp', 'video/x-m4v': 'm4v',
};
const TYPE_BY_EXT: Record<string, string> = { mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', '3gp': 'video/3gpp', m4v: 'video/x-m4v' };

/** Extension et type acceptés par le bucket, ou null si le fichier n'est pas une vidéo reconnue. */
export function videoFormat(type: string, fileName = ''): { ext: string; contentType: string } | null {
  const base = type.split(';')[0].trim().toLowerCase();
  if (EXT_BY_TYPE[base]) return { ext: EXT_BY_TYPE[base], contentType: base };
  const m = fileName.match(/\.(mp4|mov|webm|3gp|m4v)$/i);
  if (!m) return null;
  const ext = m[1].toLowerCase();
  return { ext, contentType: TYPE_BY_EXT[ext] };
}

/**
 * Lien TikTok propre (https, sans espaces) ou null si ce n'est pas un lien TikTok.
 * Accepte « www.tiktok.com/@nom/video/123 », « vm.tiktok.com/abc » et les liens copiés avec du texte autour.
 */
export function cleanTiktokUrl(input: string): string | null {
  const m = input.match(/(?:https?:\/\/)?((?:[a-z]+\.)?tiktok\.com\/[A-Za-z0-9@._/?=&%-]+)/i);
  if (!m) return null;
  const [host, ...rest] = m[1].split('?')[0].split('/');
  const url = `https://${[host.toLowerCase(), ...rest].join('/')}`;
  return url.length <= 330 ? url : null;
}

/** Numéro de la vidéo dans un lien TikTok complet, pour l'afficher dans la page. */
export function tiktokVideoId(url: string): string | null {
  return url.match(/\/video\/(\d{8,25})/)?.[1] ?? null;
}

export function videoUrl(path: string) {
  if (path.startsWith('blob:') || path.startsWith('/')) return path;
  if (!supabase) return path;
  return supabase.storage.from(CHALLENGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

let demoEntries: ChallengeEntry[] = [];
let demoVotes: { challengeId: string; entryKey: string; voterKey: string }[] = [];

export async function listChallengeEntries(challengeId: string, includeHidden = false): Promise<ChallengeEntry[]> {
  if (isDemoMode) return demoEntries.filter((e) => e.challengeId === challengeId && (includeHidden || !e.isHidden));
  const { data, error } = await db().from('challenge_entries').select('*').eq('challenge_id', challengeId).order('created_at', { ascending: false }).limit(1000);
  if (error) throw error;
  return camelize<ChallengeEntry[]>(data ?? []);
}

export interface NewChallengeEntry { challengeId: string; authorName: string; place?: string; note?: string; video?: File | null; tiktokUrl?: string }

export async function addChallengeEntry(e: NewChallengeEntry, onProgress?: (msg: 'upload' | 'save') => void): Promise<ChallengeEntry> {
  const name = e.authorName.trim();
  const note = (e.note ?? '').trim();
  const place = (e.place ?? '').trim();
  if (name.length < 2) throw new Error('name');
  if (note.length > CHALLENGE_NOTE_MAX) throw new Error('too-long');
  const tiktok = e.tiktokUrl?.trim() ? cleanTiktokUrl(e.tiktokUrl) : null;
  if (e.tiktokUrl?.trim() && !tiktok) throw new Error('tiktok');
  if (!e.video && !tiktok) throw new Error('empty');
  let videoPath: string | null = null;
  if (e.video) {
    if (e.video.size > CHALLENGE_VIDEO_MAX_BYTES) throw new Error('too-big');
    const fmt = videoFormat(e.video.type, e.video.name);
    if (!fmt) throw new Error('format');
    onProgress?.('upload');
    if (isDemoMode) {
      videoPath = URL.createObjectURL(e.video);
    } else {
      videoPath = `${e.challengeId}/${crypto.randomUUID()}.${fmt.ext}`;
      const { error } = await db().storage.from(CHALLENGE_BUCKET).upload(videoPath, e.video, { contentType: fmt.contentType, upsert: false });
      if (error) throw error;
    }
  }
  onProgress?.('save');
  if (isDemoMode) {
    const row: ChallengeEntry = { id: crypto.randomUUID(), challengeId: e.challengeId, authorName: name, place: place || null, note: note || null, videoPath, tiktokUrl: tiktok, isHidden: false, createdAt: new Date().toISOString() };
    demoEntries = [row, ...demoEntries];
    return row;
  }
  const { data, error } = await db().from('challenge_entries')
    .insert({ challenge_id: e.challengeId, author_name: name, place: place || null, note: note || null, video_path: videoPath, tiktok_url: tiktok })
    .select('*').single();
  if (error) throw error;
  return camelize<ChallengeEntry>(data);
}

export async function setChallengeEntryHidden(e: ChallengeEntry, isHidden: boolean): Promise<void> {
  if (isDemoMode) { demoEntries = demoEntries.map((x) => (x.id === e.id ? { ...x, isHidden } : x)); return; }
  const { error } = await db().from('challenge_entries').update({ is_hidden: isHidden }).eq('id', e.id);
  if (error) throw error;
}

export async function deleteChallengeEntry(e: ChallengeEntry): Promise<void> {
  if (isDemoMode) { demoEntries = demoEntries.filter((x) => x.id !== e.id); return; }
  if (e.videoPath) await db().storage.from(CHALLENGE_BUCKET).remove([e.videoPath]);
  const { error } = await db().from('challenge_entries').delete().eq('id', e.id);
  if (error) throw error;
}

/* ---------- Votes : une voix par téléphone et par challenge ---------- */

const VOTER_KEY = 'kcc.challenge.voter';
const votedKey = (challengeId: string) => `kcc.challenge.vote.${challengeId}`;

function voterKey(): string {
  try {
    let k = localStorage.getItem(VOTER_KEY);
    if (!k) { k = crypto.randomUUID(); localStorage.setItem(VOTER_KEY, k); }
    return k;
  } catch {
    return crypto.randomUUID();
  }
}

/** Participation pour laquelle ce téléphone a déjà voté, ou null. */
export function myVote(challengeId: string): string | null {
  try { return localStorage.getItem(votedKey(challengeId)); } catch { return null; }
}

export async function voteCounts(challengeId: string): Promise<Record<string, number>> {
  if (isDemoMode) {
    const out: Record<string, number> = {};
    for (const v of demoVotes) if (v.challengeId === challengeId) out[v.entryKey] = (out[v.entryKey] ?? 0) + 1;
    return out;
  }
  const { data, error } = await db().rpc('challenge_vote_counts', { p_challenge: challengeId });
  if (error) throw error;
  return Object.fromEntries(((data ?? []) as { entry_key: string; votes: number }[]).map((r) => [r.entry_key, Number(r.votes)]));
}

/** Enregistre la voix ; « already » si ce téléphone a déjà voté dans ce challenge. */
export async function castVote(challengeId: string, entryKey: string): Promise<'ok' | 'already'> {
  if (myVote(challengeId)) return 'already';
  const key = voterKey();
  if (isDemoMode) {
    if (demoVotes.some((v) => v.challengeId === challengeId && v.voterKey === key)) return 'already';
    demoVotes = [...demoVotes, { challengeId, entryKey, voterKey: key }];
  } else {
    const { error } = await db().from('challenge_votes').insert({ challenge_id: challengeId, entry_key: entryKey, voter_key: key });
    if (error) {
      if (error.code === '23505') return 'already';
      throw error;
    }
  }
  try { localStorage.setItem(votedKey(challengeId), entryKey); } catch { /* stockage indisponible */ }
  return 'ok';
}
