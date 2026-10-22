import type { Tri } from '@/i18n';

/**
 * Chaîne YouTube officielle « Je suis KCCiste ».
 * `channelUrl` : adresse publique de la chaîne (ex. https://www.youtube.com/@xxxx).
 * Tant qu'elle est vide, les boutons ouvrent une recherche YouTube du nom de la chaîne.
 */
export const YOUTUBE_CHANNEL_NAME = 'Je suis KCCiste';
export const YOUTUBE_CHANNEL_URL: string = 'https://www.youtube.com/@Jesuiskcciste';
/** Identifiant technique de la chaîne (UC…), utilisé pour afficher son direct en cours. */
export const YOUTUBE_CHANNEL_ID = 'UCg4Hdo9XEX8OI7MQH64iX2g';

export interface YouTubeVideo { id: string; title: Tri }

/** Vidéos de la chaîne mises en avant sur le site (identifiant YouTube à 11 caractères). */
export const YOUTUBE_VIDEOS: YouTubeVideo[] = [
  { id: 'iy940YMSrgE', title: { fr: "Hommage au peuple Yombe – Volume 2 : Tuidi vava, beto", en: "Hommage au peuple Yombe – Volume 2 : Tuidi vava, beto", pt: "Hommage au peuple Yombe – Volume 2 : Tuidi vava, beto" } },
  { id: 'sOCX5I-HSDY', title: { fr: "Hommage au peuple Yombe : Tuidi vava, beto ba Yombe", en: "Hommage au peuple Yombe : Tuidi vava, beto ba Yombe", pt: "Hommage au peuple Yombe : Tuidi vava, beto ba Yombe" } },
  { id: '9LAkuBVqYJU', title: { fr: "Viens inscrire ta vérité", en: "Viens inscrire ta vérité", pt: "Viens inscrire ta vérité" } },
  { id: '4pMd9Hm3AY0', title: { fr: "Nous te rendons grâce, Yahweh", en: "Nous te rendons grâce, Yahweh", pt: "Nous te rendons grâce, Yahweh" } },
  { id: 'YB1brJFQeVs', title: { fr: "Sunga ngai Yawhé na kueya te", en: "Sunga ngai Yawhé na kueya te", pt: "Sunga ngai Yawhé na kueya te" } },
  { id: 'gu3hBNiSxKA', title: { fr: "Tout savoir", en: "Tout savoir", pt: "Tout savoir" } },
  { id: 'wzIzeujWbfU', title: { fr: 'La vidéo la plus regardée de la chaîne', en: 'The channel’s most-watched video', pt: 'O vídeo mais visto do canal' } },
];

const SEARCH_URL = `https://www.youtube.com/results?search_query=${encodeURIComponent(`"${YOUTUBE_CHANNEL_NAME}"`)}`;

export const youtubeChannelUrl = () => YOUTUBE_CHANNEL_URL || SEARCH_URL;
/** Ouvre directement la fenêtre « S'abonner » de YouTube quand l'adresse de la chaîne est connue. */
export const youtubeSubscribeUrl = () => (YOUTUBE_CHANNEL_URL ? `${YOUTUBE_CHANNEL_URL.replace(/\/$/, '')}?sub_confirmation=1` : SEARCH_URL);
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
