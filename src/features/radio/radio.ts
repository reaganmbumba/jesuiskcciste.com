import { artistsRepo, tracksRepo } from '@/services';
import { listPublicSermons } from '@/features/sermons/sermons';
import type { SiteSettings } from '@/config/site';
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
 */

export type RadioMode = 'all' | 'songs' | 'sermons';
export type RadioKind = 'song' | 'sermon';

export interface RadioItem {
  /** « song:<id> » ou « sermon:<id> ». */
  key: string;
  kind: RadioKind;
  title: string;
  /** Artiste ou chorale ; prédicateur et paroisse. */
  subtitle: string;
  url: string;
  durationSeconds: number | null;
  imageUrl: string | null;
}

export interface RadioSettings {
  songs: boolean;
  sermons: boolean;
  /** Clés des titres retirés de l'antenne. */
  excluded: string[];
}

export const defaultRadioSettings: RadioSettings = { songs: true, sermons: true, excluded: [] };

/** Réglage lu en base, complété (une ancienne valeur peut être partielle ou absente). */
export function radioSettingsOf(settings: Pick<SiteSettings, 'radio'> | null | undefined): RadioSettings {
  const r = settings?.radio as Partial<RadioSettings> | undefined;
  return {
    songs: r?.songs !== false,
    sermons: r?.sermons !== false,
    excluded: Array.isArray(r?.excluded) ? r!.excluded.filter((k) => typeof k === 'string') : [],
  };
}

/** Après combien de chants passe une prédication, en mode « Tout ». */
export const SONGS_BETWEEN_SERMONS = 3;

export const songKey = (id: string) => `song:${id}`;
export const sermonKey = (id: string) => `sermon:${id}`;

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
  return [...songs, ...talks];
}

/** Ce qui est réellement diffusé, selon les réglages et le choix de l'auditeur. */
export function onAir(catalog: RadioItem[], settings: RadioSettings, mode: RadioMode): RadioItem[] {
  const off = new Set(settings.excluded);
  return catalog.filter((i) => {
    if (off.has(i.key)) return false;
    if (i.kind === 'song') return settings.songs && mode !== 'sermons';
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
 * `avoidFirst` : le dernier titre joué, pour ne pas l'entendre deux fois de suite.
 */
export function buildRound(items: RadioItem[], random: () => number = Math.random, avoidFirst?: string | null): RadioItem[] {
  const songs = shuffle(items.filter((i) => i.kind === 'song'), random);
  const talks = shuffle(items.filter((i) => i.kind === 'sermon'), random);
  const out: RadioItem[] = [];
  while (songs.length || talks.length) {
    out.push(...songs.splice(0, talks.length ? SONGS_BETWEEN_SERMONS : songs.length));
    if (talks.length) out.push(talks.shift()!);
  }
  if (avoidFirst && out.length > 1 && out[0].key === avoidFirst) {
    const k = out.findIndex((i) => i.kind === out[0].kind && i.key !== avoidFirst);
    const swap = k > 0 ? k : 1;
    [out[0], out[swap]] = [out[swap], out[0]];
  }
  return out;
}
