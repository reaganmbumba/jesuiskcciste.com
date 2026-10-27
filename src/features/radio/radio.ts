import { artistsRepo, tracksRepo } from '@/services';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import { listPublicSermons } from '@/features/sermons/sermons';
import type { SiteSettings } from '@/config/site';
import { JOURNAUX, type Journal } from '@/content/journaux';
import type { AudioSermon, Track } from '@/types';

/**
 * Radio Je suis KCCiste : écoute continue, en aléatoire, des chants et des
 * prédications audio déjà publiés sur le site. Aucun serveur de diffusion :
 * chaque auditeur enchaîne les fichiers publics dans son navigateur.
 *
 * Ne passent à l'antenne que les chants à diffusion autorisée (pour les chants
 * en vente, c'est l'extrait public) et les prédications publiées. L'administration
 * peut couper les chants ou les prédications et retirer des titres
 * (réglage `radio` de `site_settings`, clé « public » : aucun SQL à coller).
 *
 * Émissions en direct : l'animateur diffuse depuis son téléphone ou son
 * ordinateur vers un flux audio gratuit (Caster.fm, Zeno.fm ou tout serveur Icecast), puis appuie sur
 * « Passer en direct » dans l'administration. La radio de chaque auditeur
 * bascule alors sur ce flux, et revient aux chants quand le direct s'arrête.
 */

export type RadioMode = 'all' | 'songs' | 'sermons';
export type RadioKind = 'song' | 'sermon' | 'news' | 'live';

export interface RadioItem {
  /** « song:<id> », « sermon:<id> », « news:<id> » ou « live ». */
  key: string;
  kind: RadioKind;
  title: string;
  /** Artiste ou chorale ; prédicateur et paroisse. */
  subtitle: string;
  url: string;
  durationSeconds: number | null;
  imageUrl: string | null;
}

export interface RadioLive {
  /** Adresse https du flux audio (ex. https://stream.zeno.fm/abc123). */
  url: string;
  /** Nom de l'émission affiché aux auditeurs. */
  title: string;
  onAir: boolean;
  /** Début du direct (ISO), pour l'arrêt automatique en cas d'oubli. */
  startedAt: string | null;
  /** Lien « Appeler l'émission » (salle Jitsi, WhatsApp…). Vide = pas d'appels. */
  callUrl: string;
}

export interface RadioSettings {
  songs: boolean;
  sermons: boolean;
  /** Journal parlé au début de chaque tour. */
  news: boolean;
  /** Clés des titres retirés de l'antenne. */
  excluded: string[];
  live: RadioLive;
}

export const defaultRadioLive: RadioLive = { url: '', title: '', onAir: false, startedAt: null, callUrl: '' };
export const defaultRadioSettings: RadioSettings = { songs: true, sermons: true, news: true, excluded: [], live: defaultRadioLive };

/** Un direct oublié s'arrête seul au bout de 6 h. */
export const LIVE_MAX_HOURS = 6;
/** Les auditeurs vérifient toutes les minutes si un direct commence ou s'arrête. */
export const LIVE_POLL_MS = 60_000;
export const LIVE_KEY = 'live';

/** Adresse de flux acceptée : https uniquement (le site est en https). Vide = null. */
export function parseStreamUrl(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  let u: URL;
  try { u = new URL(v); } catch { throw new Error('stream'); }
  if (u.protocol !== 'https:') throw new Error('stream');
  return u.toString();
}

/**
 * Lien d'appel des auditeurs : un lien https (salle Jitsi, Zoom…) ou un numéro
 * de téléphone, transformé en lien WhatsApp. Vide = null. Sinon erreur « call ».
 */
export function parseCallUrl(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  const digits = v.replace(/[\s().-]/g, '');
  if (/^\+?\d{8,15}$/.test(digits)) return `https://wa.me/${digits.replace(/^\+/, '')}`;
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`); } catch { throw new Error('call'); }
  if (u.protocol !== 'https:' || !u.hostname.includes('.')) throw new Error('call');
  return u.toString();
}

/** Nouvelle salle Jitsi pour les appels (nom difficile à deviner). */
export function newCallRoomUrl(domain = 'meet.jit.si', random: () => number = Math.random): string {
  const token = Array.from({ length: 8 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(random() * 31)]).join('');
  return `https://${domain}/RadioJeSuisKCCiste-${token}#config.startWithVideoMuted=true`;
}

/** Le direct est-il à l'antenne en ce moment ? */
export function isLiveOn(live: RadioLive, now = new Date()): boolean {
  if (!live.onAir || !live.url) return false;
  if (!live.startedAt) return true;
  const started = new Date(live.startedAt).getTime();
  return Number.isNaN(started) || now.getTime() - started < LIVE_MAX_HOURS * 3600000;
}

export function liveItem(live: RadioLive): RadioItem {
  return { key: LIVE_KEY, kind: 'live', title: live.title || 'Émission en direct', subtitle: 'Radio Je suis KCCiste', url: live.url, durationSeconds: null, imageUrl: null };
}

/** Réglage lu en base, complété (une ancienne valeur peut être partielle ou absente). */
export function radioSettingsOf(settings: Pick<SiteSettings, 'radio'> | null | undefined): RadioSettings {
  const r = settings?.radio as Partial<RadioSettings> | undefined;
  const l = (r?.live ?? {}) as Partial<RadioLive>;
  return {
    songs: r?.songs !== false,
    sermons: r?.sermons !== false,
    news: r?.news !== false,
    excluded: Array.isArray(r?.excluded) ? r!.excluded.filter((k) => typeof k === 'string') : [],
    live: {
      url: typeof l.url === 'string' ? l.url : '',
      title: typeof l.title === 'string' ? l.title : '',
      onAir: l.onAir === true,
      startedAt: typeof l.startedAt === 'string' ? l.startedAt : null,
      callUrl: typeof l.callUrl === 'string' ? l.callUrl : '',
    },
  };
}

/** Relit le réglage en base (les auditeurs déjà à l'écoute voient le direct commencer). */
export async function fetchRadioSettings(): Promise<RadioSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'public').maybeSingle();
  if (error || !data?.value) return null;
  return radioSettingsOf(camelize<Pick<SiteSettings, 'radio'>>(data.value));
}

/** Après combien de chants passe une prédication, en mode « Tout ». */
export const SONGS_BETWEEN_SERMONS = 3;

export const songKey = (id: string) => `song:${id}`;
export const sermonKey = (id: string) => `sermon:${id}`;
export const newsKey = (id: string) => `news:${id}`;

/** Un journal reste à l'antenne une semaine, puis laisse la place au suivant. */
export const JOURNAL_DAYS = 7;

/** Le journal le plus récent, s'il a moins de JOURNAL_DAYS jours. */
export function currentNews(list: Journal[] = JOURNAUX, now = new Date()): RadioItem | null {
  const j = [...list].filter((x) => new Date(x.date).getTime() <= now.getTime()).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!j || now.getTime() - new Date(j.date).getTime() > JOURNAL_DAYS * 86400000) return null;
  return { key: newsKey(j.id), kind: 'news', title: j.title, subtitle: 'Rédaction Je suis KCCiste', url: j.audioUrl, durationSeconds: j.durationSeconds || null, imageUrl: null };
}

export function songItem(t: Track, artistName?: string): RadioItem | null {
  if (!t.audioUrl || t.broadcastRights !== 'authorized') return null;
  return { key: songKey(t.id), kind: 'song', title: t.title, subtitle: artistName || t.author || '', url: t.audioUrl, durationSeconds: t.durationSeconds || null, imageUrl: null };
}

export function sermonItem(s: AudioSermon): RadioItem | null {
  if (!s.audioUrl || !s.published) return null;
  const who = [s.preacherTitle, s.preacherName].filter(Boolean).join(' ');
  return { key: sermonKey(s.id), kind: 'sermon', title: s.title, subtitle: [who, s.parish].filter(Boolean).join(' · '), url: s.audioUrl, durationSeconds: s.durationSeconds ?? null, imageUrl: s.preacherPhotoUrl ?? null };
}

/** Tout ce qui peut passer à l'antenne, avant les réglages de l'administration. */
export async function loadRadioCatalog(): Promise<RadioItem[]> {
  const [tracks, artists, sermons] = await Promise.all([
    tracksRepo.all().catch(() => [] as Track[]),
    artistsRepo.all().catch(() => []),
    listPublicSermons().catch(() => [] as AudioSermon[]),
  ]);
  const name = (id: string) => artists.find((a) => a.id === id)?.name;
  const songs = tracks.map((t) => songItem(t, name(t.artistId))).filter((x): x is RadioItem => !!x);
  const talks = sermons.map(sermonItem).filter((x): x is RadioItem => !!x);
  const news = currentNews();
  return [...(news ? [news] : []), ...songs, ...talks];
}

/** Ce qui est réellement diffusé, selon les réglages et le choix de l'auditeur. */
export function onAir(catalog: RadioItem[], settings: RadioSettings, mode: RadioMode): RadioItem[] {
  const off = new Set(settings.excluded);
  return catalog.filter((i) => {
    if (off.has(i.key)) return false;
    if (i.kind === 'song') return settings.songs && mode !== 'sermons';
    if (i.kind === 'news') return settings.news && mode !== 'songs';
    return settings.sermons && mode !== 'songs';
  });
}

/** Modes proposés à l'auditeur selon ce que l'administration laisse passer. */
export function availableModes(items: RadioItem[]): RadioMode[] {
  const songs = items.some((i) => i.kind === 'song');
  const sermons = items.some((i) => i.kind === 'sermon');
  if (songs && sermons) return ['all', 'songs', 'sermons'];
  if (songs) return ['songs'];
  if (sermons) return ['sermons'];
  return [];
}

export function shuffle<T>(list: T[], random: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Un tour d'antenne : tous les titres une fois, dans un ordre aléatoire.
 * En mode « Tout », une prédication après chaque série de chants, comme à la
 * radio, pour que les quelques prédications ne se perdent pas parmi les chants.
 * Le journal parlé ouvre chaque tour et repasse après chaque série de chants.
 * `avoidFirst` : le dernier titre joué, pour ne pas l'entendre deux fois de suite.
 */
export function buildRound(items: RadioItem[], random: () => number = Math.random, avoidFirst?: string | null): RadioItem[] {
  const songs = shuffle(items.filter((i) => i.kind === 'song'), random);
  const talks = shuffle(items.filter((i) => i.kind === 'sermon'), random);
  const news = items.filter((i) => i.kind === 'news');
  const out: RadioItem[] = [...news];
  while (songs.length || talks.length) {
    const serie = songs.splice(0, SONGS_BETWEEN_SERMONS);
    out.push(...serie);
    if (serie.length === SONGS_BETWEEN_SERMONS && (songs.length || talks.length)) out.push(...news);
    if (talks.length) out.push(talks.shift()!);
  }
  const f = out.findIndex((i) => i.kind !== 'news');
  if (avoidFirst && f >= 0 && out.length > f + 1 && out[f].key === avoidFirst) {
    const k = out.findIndex((i, n) => n > f && i.kind === out[f].kind && i.key !== avoidFirst);
    const swap = k > f ? k : f + 1;
    [out[f], out[swap]] = [out[swap], out[f]];
  }
  return out;
}
