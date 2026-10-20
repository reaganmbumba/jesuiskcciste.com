/** English version of src/content/eglise.ts (same structure). Song lyrics stay in their original languages. */
import * as FR from './eglise';

export const teachings: typeof FR.teachings = [
  {
    id: 'sabbat-nlemba-2012',
    title: 'The Prophet’s sermon at the Nlemba Sabbath',
    meta: [
      { label: 'Date', value: '12 May 2012 – Sabbath' },
      { label: 'Place', value: 'Nlemba parish' },
      { label: 'Occasion', value: 'Welcoming the Prophet' },
      { label: 'Attendance', value: '1,250 souls' },
      { label: 'Time', value: '7 pm – 6 am' },
      { label: 'Main text', value: 'Isaiah 43:9-11' },
    ],
    paragraphs: [
      'There is still a hidden truth that the world has neither recognised nor proclaimed. Yet this truth is essential and is still waiting for a witness to declare it.',
      'The Eternal calls all nations and their witnesses to come together and examine past events, but none of them has been able to reveal this hidden truth.',
      'That is why God chooses Israel as his servant and witness. He does not entrust this mission to everyone, but to a particular people.',
      'This truth hidden by Satan is that the Eternal is the only true God and Saviour, and it must be known by all. Whoever discovers it finds safety for their life.',
      'Anyone who does not know it is exposed to idolatry. As a KCCist, God has placed everything at your disposal. You must recognise him as the only one. But many, despite God’s blessings, do not recognise the Eternal.',
      'So you, KCCist, must proclaim that the Eternal is the only God and teach it to your children. The oracle revealed this knowledge to us. Without it, we would still be in darkness.',
      'You must not be ashamed to preach the Eternal. This message must reach all of humanity. Every Congolese must know it and carry it proudly. And since we have been chosen for this mission, let us not be afraid; let us go forward and stand firm.',
    ],
    quote: '“It is you I have chosen, so that you may know and believe that I am the Eternal. Before me no god existed, and after me there will be none. I, the Eternal, am your only Saviour.”',
    closing: {
      title: 'Closing words',
      paragraphs: [
        'Some say that DIZOLELE takes himself for God. That is only talk meant to sabotage. In truth, these people know very well that it is not so.',
        'Thankfully, the Eternal has strengthened you against these discouraging words. Truly, I came to teach the knowledge of the Eternal, the God who created heaven, earth and all that is in them.',
      ],
    },
  },
];

export const minuteToLearn: typeof FR.minuteToLearn = {
  title: 'One Minute to Learn',
  concept: '“One Minute to Learn” is a teaching and spiritual feature that, in just one minute, explains a key point of KCCism. It is for all believers, new or long-standing, who want to deepen their faith and their understanding of the KCC Message, one point at a time.',
  objectives: [
    'Deepen knowledge of the teachings of KCCism.',
    'Encourage daily reflection on the core principles of the faith.',
    'Help believers better understand and live their faith every day.',
  ],
  format: [
    { label: 'Length', value: '1 minute, or a short text to read in 1 minute' },
    { label: 'Content', value: 'An extract of doctrine, an explanation, a historical anecdote or a commented verse' },
    { label: 'Format', value: 'Text, audio or video' },
  ],
};

export const prophetHistory: typeof FR.prophetHistory = [
  {
    id: 'tentation',
    title: 'The temptation with the most beautiful woman in the world',
    paragraphs: [
      'One day, while he was praying in his room, he fell into ecstasy and saw that he was lying on a bed next to the most beautiful woman in the world. On the wall appeared the faces of two men, one on the left and one on the right.',
      'The face on the left said to him: “Isaac, take her, for she is the most beautiful woman in the world; she is right for you.” When he went to reach out to her, the face on the right replied: “Isaac, do not touch, for you are anointed only once.” At once he held back.',
      'Three times the face on the left insisted, and three times the face on the right repeated just as firmly: “Do not touch, for you are anointed only once.” When he came back to himself after this vision, he found he was not lying on a bed, but kneeling in prayer.',
    ],
  },
  {
    id: 'betes-feroces',
    title: 'The fight with wild beasts',
    paragraphs: [
      'One evening while praying in his room, he fell into ecstasy and saw a valley full of buffalo. He was ordered to go into it. In the middle of the valley the buffalo became furious and attacked him. He fought them with such strength that, feeling beaten, they all fled. When he came back to himself, he gave thanks to the Eternal.',
      'Isaac always persevered in prayer. On some Sundays he attended the Protestant service of the Christian and Missionary Alliance (C.M.A.), but he preferred to stay unnoticed and went quietly home after the prayer.',
      'Another day, in a vision, he entered a valley full of boas. A voice said to him: “Go and walk on them.” In the middle of the valley the reptiles rose up against him; filled with extraordinary strength, he overcame them and they all fled.',
      'He also saw a great hilly city like Matadi, full of vicious dogs. The Eternal ordered him to go in. The dogs attacked him with incredible rage, but Isaac powerfully drove them back and scattered them.',
      'He revealed none of these things to anyone. In this way DIZOLELE Isaac fought wild beasts and went through various trials for his spiritual strengthening.',
    ],
  },
  {
    id: 'consecration',
    title: 'The consecration of DIZOLELE Isaac',
    paragraphs: [
      'Continuing his solitary life in Boma, far from worldly pleasures, Isaac devoted himself to prayer every day.',
      'One evening, as he was getting ready to sleep, he knelt to pray. Suddenly he saw his room filled with people, mostly old men with beards, even up the walls. Isaac was placed in the middle of the room and they all began to sing, clapping their hands and nodding their heads.',
      'The eldest of them spoke: “You must keep the anointing you have just received, for if you neglect this grace, this is what you will become.” At once they showed him a man as thin as a skeleton. Then they took up the song again and left the room like a flight of birds.',
      'When he came to himself, he was alone, kneeling in prayer. He kept himself pure and righteous. In this way he was upheld by the strength of the Eternal before beginning his ministry.',
    ],
    hymn: { ...FR.prophetHistory[2].hymn!, note: 'Hymn sung at the consecration (Kikongo)' },
  },
];

export const pgmVision: typeof FR.pgmVision = {
  title: 'Vision of the General Presidency of Music',
  intro: 'Working proposals to structure the musical mission of the EBNM/KCC and help it shine.',
  axes: [
    { t: 'Governance and succession', d: 'Ways to ensure the institutional continuity of the PGM, prepare the next generation and hand over responsibilities, in line with the founding texts.' },
    { t: 'Digitised musical heritage', d: 'Digitising, preserving, archiving and carefully sharing hymns, scores, recordings, videos, branch productions and historical documents.' },
    { t: 'Official hymn book', d: 'Drawing up and adopting an official collection of the songs, scores and musical references of the EBNM/KCC.' },
    { t: 'Artists’ solidarity fund', d: 'A fund to give social support to musicians facing exceptional situations.' },
    { t: 'Production centre', d: 'A national music and audiovisual production centre to record, document and share the Church’s productions.' },
    { t: 'Ongoing training', d: 'Tonic Solfa, choir conducting, vocal technique, music teaching and choir administration in every branch.' },
    { t: 'Support for branches', d: 'Ongoing evaluation, follow-up and support of the branches, choirs and bodies of the PGM.' },
    { t: 'Young talent', d: 'Spotting, mentoring and promoting young talent to secure the future of the musical mission.' },
  ],
};

const songLang: Record<string, string> = { 'Français et lingala': 'French and Lingala', Lingala: 'Lingala' };

export const songs: typeof FR.songs = FR.songs.map((s) => ({
  ...s,
  language: songLang[s.language] ?? s.language,
  stanzas: s.stanzas.map((st) => (st.label === 'À propos' ? { label: 'About', lines: ['A song of faith, hope and gratitude to Nzambe.'] } : st)),
}));

export const socialFund: typeof FR.socialFund = {
  title: 'Social Assistance Fund',
  status: 'Draft statutes and internal rules — awaiting adoption by the members',
  preamble: 'In a spirit of brotherhood, love of neighbour, solidarity and mutual help, the members of the “Je suis KCCiste 3 Mariage” group, devoted to weddings and engagements, are setting up a Social Assistance Fund to support one another in times of bereavement and illness, in line with the KCCist principles of love, compassion and solidarity.',
  keyFacts: [
    { label: 'Contribution', value: '1 USD per month' },
    { label: 'Covers', value: 'Bereavement and serious illness' },
    { label: 'Management', value: 'Committee of 5 members' },
    { label: 'Oversight', value: 'Regular fund statements' },
  ],
  principles: ['Solidarity', 'Brotherhood', 'Fairness', 'Transparency', 'Confidentiality', 'Responsibility', 'Respect for the dignity of every beneficiary'],
  titles: [
    { t: 'I. General provisions', items: ['Art. 1 — The body is called the “Social Assistance Fund”, an internal solidarity mechanism between members.', 'Art. 2 — It supports members in the event of death, serious illness or hospitalisation, or any exceptional social situation submitted to the committee.', 'Art. 3 — It operates without any discrimination, according to the principles above.'] },
    { t: 'II. Members and contributions', items: ['Art. 4 — Each participating member contributes 1 USD per month, used only for assistance.', 'Art. 5 — The contribution is paid every month by the means given by the leaders; a tracking list is kept.', 'Art. 6 — Any late payment must be made up; the committee may set clear and fair consequences for prolonged delays.', 'Art. 7 — The funds are used only for approved assistance and directly related costs; never for personal purposes.'] },
    { t: 'III. Help in case of bereavement', items: ['Art. 8 — Death of the member, their spouse, a child or a direct parent, according to the criteria adopted by the members.', 'Art. 9 — Financial contribution, a gift in kind, help with funeral costs, presence and moral support.', 'Art. 10 — Any death is reported quickly to the leaders, who may verify the case.'] },
    { t: 'IV. Help in case of illness', items: ['Art. 11 — Hospitalisation, surgery, serious illness or an exceptional medical situation.', 'Art. 12 — The committee may ask for proof (hospitalisation, prescription, invoice); this information remains confidential.', 'Art. 13 — The help is brotherly and one-off: it does not cover all medical costs.'] },
    { t: 'V. Organisation and management', items: ['Art. 14 — A committee: a Coordinator, a Secretary, a Treasurer and two advisers or auditors.', 'Art. 15 to 17 — The Coordinator supervises, the Secretary keeps the register of cases, the Treasurer keeps the accounts and presents a financial report.', 'Art. 18 — Members regularly receive the fund statement: contributions received, expenses, assistance given, balance.'] },
    { t: 'VI. Assistance procedure', items: ['Art. 19 — The case is reported by the member or a relative.', 'Art. 20 — Verification by the committee.', 'Art. 21 — Decision according to resources; major cases may be put to all members.', 'Art. 22 — Priority to the most urgent and most serious cases.'] },
    { t: 'VII. Transparency and discipline', items: ['Art. 23 — Every expense is recorded and justified.', 'Art. 24 — Personal, family and medical information is handled discreetly and never shared without consent.', 'Art. 25 — Respect leaders and beneficiaries, make no unfounded accusations or false statements, preserve the unity of the group.'] },
    { t: 'VIII. Final provisions', items: ['Art. 26 — Any change is proposed, discussed and approved by the members.', 'Art. 27 — The rules come into force on the date of adoption.', 'Art. 28 — The Fund is above all a way to express in practice our brotherhood, our compassion and our solidarity.'] },
  ],
  verse: '“Bear one another’s burdens.”',
};
