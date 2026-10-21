/** English version of src/content/caracteristiques-prophete.ts (same shape). */
import type { ProphetTraitPart } from './caracteristiques-prophete';

export const prophetTraitsIntro = {
  title: 'The traits that make him a Prophet of the Eternal',
  photoAlt: 'H. Em. DIZOLELE-MPUNGU WAFIDUSWA Isaac in 1955, 1980 and 2005',
  photoCaption: 'H. Em. DIZOLELE-MPUNGU WAFIDUSWA Isaac, Prophet and Founder, Spiritual Leader and Legal Representative: at the birth of the Church (8 March 1955), at its legal recognition (30 April 1980) and at the promulgation of the changes (21 August 2005).',
};

export const prophetTraitParts: ProphetTraitPart[] = [
  {
    id: 'partie-1',
    label: 'Part one',
    traits: [
      {
        id: 'appel',
        title: 'Calling',
        term: 'Kobiangama',
        intro: 'A Prophet must first be called by the Eternal. For the prophets of old, we can see it in the Bible:',
        bible: [
          { who: 'Moses', ref: 'Exodus 3:6' },
          { who: 'Samuel', ref: '1 Samuel 3:3-10' },
        ],
        prophet: [
          'For the Prophet DIZOLELE, his calling is remarkable, with the apparitions of 8 to 13 March 1955 at FORAKAM, in Seke-Banza (see the book “My Calling”, pages 13 to 23).',
        ],
      },
      {
        id: 'election',
        title: 'Election',
        term: 'Koponama',
        intro: 'The Prophet is chosen by the Eternal even before his birth. We can see it in the Bible:',
        bible: [
          { ref: 'Jeremiah 1:4-5', quote: '“… before I formed thee in the belly I knew thee; and before…”' },
        ],
        prophet: ['For the Prophet DIZOLELE, several facts bear witness to this election:'],
        signs: [
          'His name: from MPUTU (meaning “poor in offspring”) to DIZOLELE (“what God wants”), this naming is a mystery whose meaning only God knew.',
          'When the child was registered at the civil registry in the Kinkenge sector, although his parents were present, the territorial officer wrote that the child DIZOLELE belonged to “clan X”! This means a child with no clan, in other words one who belongs to every clan, and today we see people coming from the four corners of the earth.',
          'The healing of his little brother NGITUKULU by the laying on of hands, done instinctively. The Eternal wanted this miracle and inspired it, for how could a small child think of laying on hands, and of examining the opposite effect of an instinctive act?',
          'In the house of Mr LUEMBA, something happened: Mr THAMBA Justin, his elder brother, who had come to drop off his wife, tried to disturb the young DIZOLELE at night, but was severely beaten by angels.',
        ],
        conclusion: 'All these elements show that DIZOLELE is a person chosen by God.',
      },
      {
        id: 'resistance',
        title: 'Resistance',
        term: 'Koboya',
        intro: 'Given the greatness and the spiritual and physical effort that God’s work requires, all the prophets at first refuse to take it on. We can see it in the Bible:',
        bible: [
          { who: 'Jonah', ref: 'Jonah 1:1-3' },
          { who: 'Jeremiah', ref: 'Jeremiah 1:6-7' },
        ],
        prophet: [
          'For the Prophet DIZOLELE, his refusal rested on his age (“I am still too young, find an adult…”). We see this in “My Calling”, pages 28-29.',
        ],
      },
    ],
  },
];
