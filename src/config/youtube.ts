import type { Tri } from '@/i18n';

/**
 * Chaîne YouTube officielle « Je suis KCCiste ».
 * `channelUrl` : adresse publique de la chaîne (ex. https://www.youtube.com/@xxxx).
 * Tant qu'elle est vide, les boutons ouvrent une recherche YouTube du nom de la chaîne.
 */
export const YOUTUBE_CHANNEL_NAME = 'Je suis KCCiste';
export const YOUTUBE_CHANNEL_URL: string = '';

export interface YouTubeVideo { id: string; title: Tri }

/** Vidéos de la chaîne mises en avant sur le site (identifiant YouTube à 11 caractères). */
export const YOUTUBE_VIDEOS: YouTubeVideo[] = [
  { id: 'wzIzeujWbfU', title: { fr: 'La vidéo la plus regardée de la chaîne', en: 'The channel’s most-watched video', pt: 'O vídeo mais visto do canal' } },
  { id: '12-_2B0HpdA', title: { fr: 'À découvrir sur la chaîne', en: 'Discover it on the channel', pt: 'Para descobrir no canal' } },
];

const SEARCH_URL = `https://www.youtube.com/results?search_query=${encodeURIComponent(`"${YOUTUBE_CHANNEL_NAME}"`)}`;

export const youtubeChannelUrl = () => YOUTUBE_CHANNEL_URL || SEARCH_URL;
/** Ouvre directement la fenêtre « S'abonner » de YouTube quand l'adresse de la chaîne est connue. */
export const youtubeSubscribeUrl = () => (YOUTUBE_CHANNEL_URL ? `${YOUTUBE_CHANNEL_URL.replace(/\/$/, '')}?sub_confirmation=1` : SEARCH_URL);
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
