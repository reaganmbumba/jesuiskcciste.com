/** English version of src/content/catechisme.ts (same shape). */
import type { CatechismGroup } from './catechisme';

export const catechismIntro = {
  title: 'The Catechism of KCCism',
  paragraphs: [
    'A catechism is a religious instruction: a summary of the truths, beliefs and fundamental principles of a religion, as they have already been written or spoken by a recognised religious authority.',
    'The Église Bon Nouveau Message (KCC) is a work of divine origin, born on 8 March 1955. Through various revelations, the Eternal God used the Prophet DIZOLELE to accomplish this work: He put His Word in him, as He has always done with His prophets, to save humanity.',
    'This Word appeared to him on 12 April 1958 in Boma, through the sign KCC, which the Eternal Himself interpreted and called a Good and New Message. The doctrine that flows from it is called KCCism. To make it easier to study, the Church has summarised it in questions and answers.',
  ],
};

export const catechism: CatechismGroup[] = [
  {
    id: 'croyances',
    title: 'The beliefs',
    items: [
      { q: 'What is meant by a belief?', a: 'A belief is a firm conviction in the existence, role and power of the being or object on the life of the one who places their faith in it.' },
      { q: 'Where do the beliefs of the EBNM come from?', a: 'They are of divine origin: the inspirations of the Eternal to His Prophet and the revelations of the Eternal to the biblical prophets.' },
      { q: 'What does the first belief say?', a: 'I believe in the Eternal God from whom all life flows. He is One, Lord of lords, Creator of heaven, earth and all that is in them.' },
      { q: 'What does “from whom all life flows” mean?', a: 'It refers to both spiritual and material life.' },
      { q: 'What does “Creator of heaven, earth and all that is in them” mean?', a: 'It refers to everything that exists, visible and invisible.' },
      { q: 'What is the meaning of “He is One”?', a: 'Beside the Eternal there is no other, and nothing resembles Him. He knows all that is and covers all existence; He alone has power over all things, and nothing resists Him.' },
      { q: 'What does the second belief say?', a: 'I believe in the salvation that, through His grace, His mercy and in His Name, the Eternal has offered to humanity.' },
      { q: 'What salvation is this?', a: 'Spiritual salvation, the salvation of the soul. The Eternal offered it to all humanity through the Covenant made with Israel: it teaches us what we may do and what we must not do. Whoever practises the law, justice and virtue shall live (Ezekiel 18:21-22).' },
      { q: 'What does the third belief say?', a: 'I believe in the Holy Word of God revealed to His prophets for the salvation of humanity.' },
      { q: 'Which Word is this?', a: 'The Word that the Eternal Himself passed on to humanity through His prophets, recorded in the Holy Scriptures (the Hebrew Bible).' },
      { q: 'What does the fourth belief say?', a: 'I believe in the immortality of the soul and in eternal life.' },
      { q: 'What does the immortality of the soul mean?', a: 'The soul remains immortal. On the day of death the physical body and the soul separate: the body returns to the earth and the soul returns to the Eternal to live there for ever; the soul of the unbeliever goes to eternal punishment.' },
      { q: 'What does eternal life refer to?', a: 'To the glory of God: a life in which the souls of the righteous will live for ever.' },
      { q: 'What does the belief about the forgiveness of sins say?', a: 'I believe in the forgiveness of sins by the Eternal, through the keeping of His Law and in His Name.' },
      { q: 'What sacrifice does the Eternal require in order to forgive?', a: 'No sacrifice. He asks for the decision to stop sinning for good and for sincerity in confession.' },
      { q: 'Does the Eternal forgive in the name of a spirit, a person or a thing?', a: 'No. The Eternal forgives in His own Name.' },
      { q: 'What does the belief about judgement say?', a: 'I believe in divine judgement, in the reward of the righteous and in the eternal punishment of unbelievers.' },
      { q: 'What is divine judgement?', a: 'It is the power the Eternal has over man to reward or punish him, whenever, wherever and however He wills.' },
      { q: 'What is the reward of the righteous?', a: 'It is what the righteous person receives from the Eternal after serving Him justly.' },
      { q: 'What is eternal punishment?', a: 'It is hell: the spiritual punishments received from the Eternal by the unbeliever who despised His Law throughout their life on earth.' },
      { q: 'What does the belief about the Prophet say?', a: 'I believe that the Anointed of the Eternal, DIZOLELE-MPUNGU WAFIDUSWA Isaac, is a Prophet sent by the Eternal God.' },
      { q: 'Why must one believe in the Prophet?', a: 'Because since ancient times the Eternal has called for this for salvation: it is through the prophet that the Eternal traces the way of salvation by giving His Word.' },
      { q: 'What does the last belief say?', a: 'I believe that the Église Bon Nouveau Message (KCC) comes from God, and that it is one, holy and prophetic.' },
      { q: 'Why is the Church one, holy and prophetic?', a: 'One, because its invisible founder, the Eternal, is one and its visible founder is one. Holy, because it is the fruit of the inspiration of God, who is holy. Prophetic, because its founder is a Prophet and its teachings come from the line of the prophets of the Eternal.' },
    ],
  },
  {
    id: 'enseignement',
    title: 'The teaching',
    items: [
      { q: 'In the doctrine, what is meant by teaching?', a: 'The statutes, ordinances, precepts and disciplines defined by the Eternal through His prophets to govern the relationship between the Eternal and people.' },
      { q: 'What are the sources of the EBNM’s teaching?', a: 'The Bible (Torah) and the Prophet: his revelations, recommendations and oracles on the true meaning of religious concepts, liturgical innovations and the interpretation of Scripture.' },
    ],
  },
  {
    id: 'fetes',
    title: 'Feasts and sacraments',
    items: [
      { q: 'What are the Church feasts of the EBNM?', a: 'The feasts of the Church are:', list: ['The birth of the Prophet: 1 March', 'The birth of the Church: 8 March', 'The appearance of the KCC: 12 April', 'The feast of deliverance (the Oracle): 15 April', 'The legal recognition: 30 April'] },
      { q: 'Which of these feasts are holy days?', a: '1 March, 8 March and 15 April.' },
      { q: 'When was the Prophet born?', a: 'On 1 March 1930.' },
      { q: 'When was the Church born?', a: 'On 8 March 1955.' },
      { q: 'When did the KCC appear?', a: 'On 12 April 1958.' },
      { q: 'When was the Church legally recognised?', a: 'On 30 April 1980.' },
      { q: 'When was the Oracle given?', a: 'On 15 April 2003.' },
      { q: 'How many sacraments does the EBNM administer?', a: 'Three sacraments:', list: ['Confession (purification)', 'The First Anointing', 'The Acts of Covenant'] },
      { q: 'What does the First Anointing mean?', a: 'It is the sacrament by which a person acknowledges the Eternal as their only God and commits to love and serve Him with all their heart, all their soul and all their strength; for His part, the Eternal imprints His Name in the soul of the recipient.' },
      { q: 'How many times can one receive the First Anointing?', a: 'Only once in the Church, because this sacrament is irreversible.' },
      { q: 'What is meant by the sacrament of the Acts of Covenant?', a: 'It is the ceremony in which the people acknowledge the Eternal as the only true God, accept the Words of the Covenant and commit to honour the Eternal alone and to practise His ordinances, precepts and commandments.' },
    ],
  },
  {
    id: 'alliance',
    title: 'The Covenant and the commandments',
    items: [
      { q: 'What are the Words of the Covenant?', a: 'The ten Words of the Covenant are:', list: ['I am the Eternal, your God: you shall have no other god but me.', 'You shall not make carved images, you shall not bow down to them nor serve them.', 'You shall not take the Name of the Eternal your God in vain or in support of a lie.', 'Remember the Sabbath day and keep it holy.', 'Honour your father and your mother.', 'You shall not kill.', 'You shall not commit adultery.', 'You shall not steal.', 'You shall not lie.', 'You shall not covet the man, the woman or anything that belongs to your neighbour.'] },
      { q: 'What are the commandments of the Church?', a: 'The seven commandments of the Church are:', list: ['Do not drink intoxicating drinks or smoke.', 'Do not consult fetishists, diviners or the dead.', 'Take part in the Sabbath service and the holy days.', 'Take part in fraternal communion and the annual peace offerings.', 'Recognise that marriage is a sacred union to be safeguarded.', 'Remain holy.', 'Love the Church, protect it and support it.'] },
    ],
  },
  {
    id: 'vrai-dieu',
    title: 'The true God, the Eternal',
    items: [
      { q: 'What is the Oracle of the Eternal God to the Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac?', a: '“Whatever miracles he performs, a man cannot be God.”' },
      { q: 'When did the Eternal give this Oracle?', a: 'On 15 April 2003.' },
      { q: 'What does the Eternal God want in this Oracle?', a: 'The Eternal presented Himself as the only true God, to be prayed to, served, glorified and revered.' },
      { q: 'How can we understand the Eternal?', a: 'Through His attributes.' },
      { q: 'What are these attributes?', a: 'The Eternal is:', list: ['Creator', 'Invisible', 'Immaterial', 'Incomparable, like no other being', 'Without image or representation, without any form the human mind can conceive', 'Saviour', 'Sovereign', 'Lord', 'Redeemer', 'Omnipotent', 'Omniscient', 'Omnipresent', 'Unchanging', 'Eternal', 'One'] },
    ],
  },
];

export const neophytePath = {
  title: 'The path of the new believer',
  intro: 'To become a member, every new convert receives three sacraments. Here is what parish leaders teach them before each one.',
  steps: [
    { name: 'Purification', learn: ['The ten Words of the Covenant', 'The seven commandments of the Church', 'The Profession of faith', 'The prayer of purification', 'The five aims of religious teaching'] },
    { name: 'The First Anointing', learn: ['The commitments to make to the Eternal, in the presence of His people'] },
    { name: 'The Acts of Covenant', learn: ['The prayers of the ceremonies, as set out in the liturgical texts'] },
  ],
  source: 'Circular from the Head Office to parish leaders, 2014.',
};

export const catechismSource: string = 'The Catechism, Head Office of the EBNM, Kinshasa.';
