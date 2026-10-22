import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import type { Meeting, MeetingRoom } from '@/types';

/**
 * Réunions en visioconférence (tables `meetings` et `meeting_rooms`).
 * La modération programme les réunions ; le programme est public, mais le
 * lien de la salle n'est lu (par la base) que par ceux qui peuvent entrer :
 * membres validés, ou tout le monde si la réunion est publique.
 *
 * La salle par défaut est une salle Jitsi Meet (gratuite, sans compte) qui
 * s'ouvre dans un nouvel onglet ou dans l'application Jitsi sur téléphone.
 * meet.jit.si coupe les appels intégrés (iframe) au bout de 5 minutes : on
 * n'intègre donc pas la salle dans la page.
 */

export const MEETING_TITLE_MAX = 200;
export const MEETING_BODY_MAX = 5000;
/** La salle s'ouvre 15 min avant le début et reste ouverte 1 h après la fin prévue. */
export const OPENS_BEFORE_MIN = 15;
export const CLOSES_AFTER_MIN = 60;

export const JITSI_DOMAIN = ((import.meta.env.VITE_JITSI_DOMAIN as string | undefined) || 'meet.jit.si').trim();

const inHours = (h: number) => new Date(Date.now() + h * 3600000).toISOString();

let demoMeetings: Meeting[] = [
  {
    id: 'meeting-demo-1', title: 'Réunion des membres (exemple)',
    description: 'Ceci est une réunion de démonstration. Une fois le site relié à la base de données, l’administration programmera ici les vraies réunions.',
    startsAt: inHours(26), durationMinutes: 60, audience: 'members', isCancelled: false, createdAt: inHours(-24),
  },
];
let demoRooms: MeetingRoom[] = [{ meetingId: 'meeting-demo-1', jitsiRoom: 'JeSuisKCCiste-demonstration', externalUrl: null }];

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

export type MeetingStatus = 'cancelled' | 'upcoming' | 'open' | 'ended';

export function meetingEnd(m: Pick<Meeting, 'startsAt' | 'durationMinutes'>): Date {
  return new Date(new Date(m.startsAt).getTime() + m.durationMinutes * 60000);
}

/** « open » : on peut entrer dans la salle (15 min avant le début jusqu'à 1 h après la fin). */
export function meetingStatus(m: Meeting, now = new Date()): MeetingStatus {
  if (m.isCancelled) return 'cancelled';
  const t = now.getTime();
  if (t < new Date(m.startsAt).getTime() - OPENS_BEFORE_MIN * 60000) return 'upcoming';
  if (t > meetingEnd(m).getTime() + CLOSES_AFTER_MIN * 60000) return 'ended';
  return 'open';
}

/** Réunions à venir (la plus proche d'abord) et passées (la plus récente d'abord). */
export function splitMeetings(list: Meeting[], now = new Date()): { upcoming: Meeting[]; past: Meeting[] } {
  const past = list.filter((m) => meetingStatus(m, now) === 'ended' || (m.isCancelled && meetingEnd(m) < now));
  const upcoming = list.filter((m) => !past.includes(m));
  return {
    upcoming: [...upcoming].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    past: [...past].sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
  };
}

/** Tant que le SQL n'est pas collé dans Supabase, la rubrique est simplement vide. */
function missingTable(e: unknown): boolean {
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  return code === '42P01' || code === 'PGRST205' || /(meetings|meeting_rooms).*(does not exist|schema cache)/i.test(msg);
}

export async function listMeetings(): Promise<Meeting[]> {
  if (isDemoMode) return demoMeetings;
  const { data, error } = await db().from('meetings').select('*').order('starts_at', { ascending: true }).limit(500);
  if (error) {
    if (missingTable(error)) return [];
    throw error;
  }
  return camelize<Meeting[]>(data ?? []);
}

/** La salle, ou null si l'on n'a pas le droit d'y entrer (la base ne renvoie rien). */
export async function getRoom(meetingId: string): Promise<MeetingRoom | null> {
  if (isDemoMode) return demoRooms.find((r) => r.meetingId === meetingId) ?? null;
  const { data, error } = await db().from('meeting_rooms').select('*').eq('meeting_id', meetingId).maybeSingle();
  if (error) throw error;
  return data ? camelize<MeetingRoom>(data) : null;
}

/** Les salles accessibles parmi ces réunions (la base omet celles qu'on ne peut pas rejoindre). */
export async function listRooms(meetingIds: string[]): Promise<MeetingRoom[]> {
  if (!meetingIds.length) return [];
  if (isDemoMode) return demoRooms.filter((r) => meetingIds.includes(r.meetingId));
  const { data, error } = await db().from('meeting_rooms').select('*').in('meeting_id', meetingIds);
  if (error) {
    if (missingTable(error)) return [];
    throw error;
  }
  return camelize<MeetingRoom[]>(data ?? []);
}

/** Lien à ouvrir : le lien Zoom / Meet collé par l'admin, sinon la salle Jitsi avec le nom du membre déjà rempli. */
export function joinUrl(room: MeetingRoom, displayName?: string): string {
  if (room.externalUrl) return room.externalUrl;
  const base = `https://${JITSI_DOMAIN}/${encodeURIComponent(room.jitsiRoom)}`;
  return displayName ? `${base}#userInfo.displayName=${encodeURIComponent(JSON.stringify(displayName))}` : base;
}

/** Accepte seulement un lien https (Zoom, Google Meet, Teams…). Chaîne vide = salle Jitsi. */
export function normalizeExternalUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== 'https:') throw new Error('url');
    return u.toString();
  } catch {
    throw new Error('url');
  }
}

export interface MeetingInput {
  title: string;
  description: string;
  startsAt: string;
  durationMinutes: number;
  audience: Meeting['audience'];
  externalUrl: string;
}

export async function saveMeeting(input: MeetingInput, existing?: Meeting | null): Promise<Meeting> {
  const externalUrl = normalizeExternalUrl(input.externalUrl);
  const row = {
    title: input.title.trim(), description: input.description.trim(), startsAt: new Date(input.startsAt).toISOString(),
    durationMinutes: Math.round(input.durationMinutes), audience: input.audience,
  };
  if (isDemoMode) {
    const m: Meeting = existing ? { ...existing, ...row } : { id: `meeting-demo-${Date.now()}`, ...row, isCancelled: false, createdAt: new Date().toISOString() };
    demoMeetings = existing ? demoMeetings.map((x) => (x.id === m.id ? m : x)) : [...demoMeetings, m];
    const room = demoRooms.find((r) => r.meetingId === m.id);
    demoRooms = room
      ? demoRooms.map((r) => (r.meetingId === m.id ? { ...r, externalUrl } : r))
      : [...demoRooms, { meetingId: m.id, jitsiRoom: `JeSuisKCCiste-${Math.random().toString(36).slice(2, 14)}`, externalUrl }];
    return m;
  }
  const dbRow = { title: row.title, description: row.description, starts_at: row.startsAt, duration_minutes: row.durationMinutes, audience: row.audience };
  const q = existing ? db().from('meetings').update(dbRow).eq('id', existing.id) : db().from('meetings').insert(dbRow);
  const { data, error } = await q.select('*').single();
  if (error) throw error;
  const m = camelize<Meeting>(data);
  // Le nom de la salle Jitsi est tiré au sort par la base à la création, puis conservé.
  const { error: roomError } = await db().from('meeting_rooms').upsert({ meeting_id: m.id, external_url: externalUrl }, { onConflict: 'meeting_id' });
  if (roomError) throw roomError;
  return m;
}

export async function setMeetingCancelled(id: string, isCancelled: boolean): Promise<void> {
  if (isDemoMode) {
    demoMeetings = demoMeetings.map((m) => (m.id === id ? { ...m, isCancelled } : m));
    return;
  }
  const { error } = await db().from('meetings').update({ is_cancelled: isCancelled }).eq('id', id);
  if (error) throw error;
}

export async function deleteMeeting(id: string): Promise<void> {
  if (isDemoMode) {
    demoMeetings = demoMeetings.filter((m) => m.id !== id);
    demoRooms = demoRooms.filter((r) => r.meetingId !== id);
    return;
  }
  const { error } = await db().from('meetings').delete().eq('id', id);
  if (error) throw error;
}

/** Message lisible : Supabase renvoie souvent un simple objet { message, code } et non une Error. */
export function meetingErrorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (msg === 'url') return 'Le lien doit commencer par https:// (par exemple un lien Zoom ou Google Meet), ou restez vide pour la salle du site.';
  if (/row-level security|permission denied/i.test(msg) || code === '42501') return 'Votre compte n’a pas le droit de programmer des réunions (administration ou modération requise).';
  if (missingTable(e)) return 'La rubrique n’est pas encore installée dans Supabase : collez le fichier « reunions-a-coller-dans-supabase.sql » dans le SQL Editor, cliquez sur Run, puis réessayez.';
  if (/failed to fetch|network|load failed/i.test(msg)) return 'Connexion interrompue. Vérifiez votre réseau puis réessayez.';
  return msg ? `L’enregistrement a échoué : ${msg}` : 'L’enregistrement a échoué.';
}
