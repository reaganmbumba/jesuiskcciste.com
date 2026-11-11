import type { Tri } from '@/i18n';

/**
 * Challenges des chansons du label « Je suis KCCiste ». Les chansons tournent
 * sur TikTok et beaucoup de gens font leur version : chaque challenge a sa page
 * où l'on regarde les vidéos, où l'on envoie la sienne (fichier ou lien TikTok)
 * et où le public vote. Les participations envoyées depuis le site sont en base
 * (`challenge_entries`) ; les vidéos mises en avant par l'administration sont ici.
 * Le plus récent en premier.
 */
export interface FeaturedEntry {
  /** Identifiant texte (minuscules, chiffres, tirets) : sert aux votes. */
  id: string;
  authorName: string;
  /** Compte TikTok d'origine, crédité sous la vidéo. */
  tiktokHandle?: string;
  video: string;
  poster: string;
}

export interface Challenge {
  id: string;
  date: string;
  song: string;
  title: Tri;
  intro: Tri;
  /** Audio de la chanson, si l'administration l'a fourni. */
  songAudio?: string;
  image: string;
  /** Image d'aperçu 1200×630 pour WhatsApp et Facebook. */
  shareImage: string;
  featured: FeaturedEntry[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'libondeli-na-ngai',
    date: '2026-11-11T09:00:00Z',
    song: 'Libondeli na ngai',
    title: { fr: 'Challenge du jour : « Libondeli na ngai »', en: 'Challenge of the day: “Libondeli na ngai”', pt: 'Desafio do dia: «Libondeli na ngai»' },
    intro: {
      fr: 'Chantez « Libondeli na ngai », la chanson du label Je suis KCCiste, à votre manière. Filmez-vous, envoyez votre vidéo ou votre lien TikTok, et votez pour la version que vous préférez.',
      en: 'Sing “Libondeli na ngai”, the song from the Je suis KCCiste label, your own way. Film yourself, send your video or your TikTok link, and vote for the version you like best.',
      pt: 'Cante «Libondeli na ngai», a canção da editora Je suis KCCiste, à sua maneira. Filme-se, envie o seu vídeo ou a sua ligação TikTok e vote na versão de que mais gosta.',
    },
    songAudio: '/audio/challenges/libondeli-na-ngai.mp3',
    image: '/images/challenges/libondeli-na-ngai.jpg',
    shareImage: '/images/challenges/partage-libondeli-na-ngai.jpg',
    featured: [
      {
        id: 'silviambongo',
        authorName: '@silviambongo',
        tiktokHandle: 'silviambongo',
        video: '/videos/challenges/libondeli-na-ngai.mp4',
        poster: '/images/challenges/libondeli-na-ngai.jpg',
      },
      {
        id: 'bellvie-llb',
        authorName: '@bellvie.llb',
        tiktokHandle: 'bellvie.llb',
        video: '/videos/challenges/libondeli-na-ngai-bellvie.mp4',
        poster: '/images/challenges/libondeli-na-ngai-bellvie.jpg',
      },
    ],
  },
];

export const findChallenge = (id?: string) => CHALLENGES.find((c) => c.id === id);
