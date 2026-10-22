import { useEffect, useState } from 'react';
import { YOUTUBE_CHANNEL_ID, youtubeChannelUrl, youtubeWatchUrl } from '@/config/youtube';
import { repository, type Repository } from '@/services/repository';
import type { Livestream } from '@/types';

/**
 * Directs des cultes et des grandes fêtes, diffusés sur la chaîne YouTube
 * (table `livestreams`). L'administration programme le direct : titre, date
 * et heure, durée, et le lien de la vidéo que YouTube donne quand on
 * programme un direct. Sans lien, le site affiche le direct en cours de la
 * chaîne (adresse « live_stream?channel= » de YouTube).
 *
 * Le site ne demande rien à YouTube : il se fie à l'heure programmée. Avant
 * le début, un compte à rebours ; pendant le culte, le lecteur YouTube ; après,
 * la rediffusion.
 */

export const LIVE_TITLE_MAX = 200;
export const LIVE_BODY_MAX = 3000;
/** Le lecteur reste affiché 1 h après la fin prévue : les cultes débordent souvent. */
export const LIVE_GRACE_MIN = 60;
/** Le bloc de la page d'accueil n'annonce que les directs des 60 prochains jours. */
export const HOME_HORIZON_DAYS = 60;

const inHours = (h: number) => {
  const d = new Date(Date.now() + h * 3600000);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
};

const demoLivestreams: Livestream[] = [
  {
    id: 'live-demo-1', title: 'Culte du Sabbat en direct (exemple)',
    description: 'Ceci est un direct de démonstration. Une fois le site relié à la base de données, l’administration programmera ici les vrais directs.',
    startsAt: inHours(50), durationMinutes: 180, youtubeId: null, isCancelled: false, createdAt: inHours(-24),
  },
];

export const livestreamsRepo: Repository<Livestream> = repository<Livestream>('livestreams', demoLivestreams, 'live');

export type LiveStatus = 'cancelled' | 'upcoming' | 'live' | 'ended';

export function liveEnd(l: Pick<Livestream, 'startsAt' | 'durationMinutes'>): Date {
  return new Date(new Date(l.startsAt).getTime() + l.durationMinutes * 60000);
}

/** « live » : de l'heure du début jusqu'à 1 h après la fin prévue. */
export function liveStatus(l: Livestream, now = new Date()): LiveStatus {
  if (l.isCancelled) return 'cancelled';
  const t = now.getTime();
  if (t < new Date(l.startsAt).getTime()) return 'upcoming';
  if (t > liveEnd(l).getTime() + LIVE_GRACE_MIN * 60000) return 'ended';
  return 'live';
}

/** Directs à venir ou en cours (le plus proche d'abord) et passés (le plus récent d'abord). */
export function splitLivestreams(list: Livestream[], now = new Date()): { upcoming: Livestream[]; past: Livestream[] } {
  const past = list.filter((l) => liveStatus(l, now) === 'ended' || (l.isCancelled && liveEnd(l) < now));
  const upcoming = list.filter((l) => !past.includes(l));
  return {
    upcoming: [...upcoming].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    past: [...past].sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
  };
}

/** Le direct à mettre en avant : celui en cours, sinon le prochain (dans les 60 jours). */
export function featuredLivestream(list: Livestream[], now = new Date()): Livestream | null {
  const active = list.filter((l) => !l.isCancelled).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const live = active.find((l) => liveStatus(l, now) === 'live');
  if (live) return live;
  const horizon = now.getTime() + HOME_HORIZON_DAYS * 86400000;
  return active.find((l) => liveStatus(l, now) === 'upcoming' && new Date(l.startsAt).getTime() <= horizon) ?? null;
}

/** Tant que le SQL n'est pas collé dans Supabase, la rubrique est simplement vide. */
function missingTable(e: unknown): boolean {
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  return code === '42P01' || code === 'PGRST205' || /livestreams.*(does not exist|schema cache)/i.test(msg);
}

export async function listLivestreams(): Promise<Livestream[]> {
  try {
    return await livestreamsRepo.all();
  } catch (e) {
    if (missingTable(e)) return [];
    throw e;
  }
}

/**
 * Identifiant de vidéo à partir de ce que l'admin colle : l'identifiant seul,
 * ou un lien youtube.com/watch?v=, youtu.be/, /live/, /embed/, /shorts/.
 * Chaîne vide = null (direct en cours de la chaîne). Lien non reconnu = erreur « youtube ».
 */
export function parseYouTubeId(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  const ID = /^[A-Za-z0-9_-]{11}$/;
  if (ID.test(v)) return v;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    throw new Error('youtube');
  }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = u.pathname.split('/')[1] ?? null;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = u.searchParams.get('v');
    if (!id) {
      const [, kind, rest] = u.pathname.split('/');
      if (['live', 'embed', 'shorts', 'v'].includes(kind ?? '')) id = rest ?? null;
    }
  }
  if (id && ID.test(id)) return id;
  throw new Error('youtube');
}

/** Adresse du lecteur intégré. Sans vidéo précise : le direct en cours de la chaîne. */
export function liveEmbedUrl(l: Pick<Livestream, 'youtubeId'>): string {
  return l.youtubeId
    ? `https://www.youtube-nocookie.com/embed/${l.youtubeId}?rel=0&modestbranding=1&playsinline=1`
    : `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&playsinline=1`;
}

/** Lien « Regarder sur YouTube » (et « Me le rappeler » avant le début). */
export function liveWatchUrl(l: Pick<Livestream, 'youtubeId'>): string {
  return l.youtubeId ? youtubeWatchUrl(l.youtubeId) : `${youtubeChannelUrl().replace(/\/$/, '')}/live`;
}

/** Temps restant avant le début, découpé pour le compte à rebours. */
export function countdownParts(startsAt: string, now = new Date()): { days: number; hours: number; minutes: number; seconds: number; total: number } {
  const total = Math.max(0, new Date(startsAt).getTime() - now.getTime());
  const s = Math.floor(total / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60, total };
}

/** L'heure courante, rafraîchie toutes les `ms` millisecondes (compte à rebours, bascule en direct). */
export function useNow(ms = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/** Message lisible : Supabase renvoie souvent un simple objet { message, code } et non une Error. */
export function livestreamErrorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (msg === 'youtube') return 'Lien YouTube non reconnu. Collez le lien de la vidéo du direct (par exemple https://youtube.com/live/… ou https://youtu.be/…), ou laissez vide.';
  if (/row-level security|permission denied/i.test(msg) || code === '42501') return 'Votre compte n’a pas le droit de programmer des directs (administration centrale requise).';
  if (missingTable(e)) return 'La rubrique n’est pas encore installée dans Supabase : collez le fichier « directs-a-coller-dans-supabase.sql » dans le SQL Editor, cliquez sur Run, puis réessayez.';
  if (/failed to fetch|network|load failed/i.test(msg)) return 'Connexion interrompue. Vérifiez votre réseau puis réessayez.';
  return msg ? `L’enregistrement a échoué : ${msg}` : 'L’enregistrement a échoué.';
}
