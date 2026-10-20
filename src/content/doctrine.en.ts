/**
 * English version of src/content/doctrine.ts (same structure).
 * Translated from the official French texts; the Lingala, Kikongo, Swahili
 * and Tshiluba versions of the law texts are reused as they are.
 */
import * as FR from './doctrine';

const native = (id: string) => FR.lawTexts.find((l) => l.id === id)!.versions.filter((v) => v.lang !== 'Français' && v.lang !== 'English');

export const doctrineSource: string = 'Official documents of the EBNM/KCC, Head Office, Kinshasa (2004-2015). English translation of the French texts.';

export const specificities: typeof FR.specificities = [
  { label: 'Book of work', value: 'The Bible (Torah)' },
  { label: 'Religion', value: 'KCCism' },
  { label: 'Doctrine', value: 'KCCism' },
  { label: 'Follower', value: 'The KCCist' },
  { label: 'Guiding principle', value: 'Radical monotheism' },
  { label: 'God', value: 'The Eternal, the only true God' },
];

export const kccApparition: typeof FR.kccApparition = {
  title: 'The appearance of the KCC',
  date: '12 April 1958, Boma',
  paragraphs: [
    'On the evening of 12 April 1958, in his room in Boma, the Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac had a vision: the sky opened and three signs, KCC, written in gold, appeared.',
    'At once he heard a voice telling him: “Read and interpret these signs.” As he could not, the same voice read and interpreted them for him in his mother tongue, Kikongo. After the interpretation, the signs disappeared.',
    'These three prophetic signs form one indivisible whole: there is the MESSAGE and its two qualities, GOOD and NEW. The golden colour expresses the value of this message. Whatever the language, these three consonants are always pronounced “kasese”.',
    'KCCism, the doctrine and religion of the Church, comes from the KCC. It is not a word made up by human reason: it is the Eternal himself who showed these signs to his Prophet for the salvation of humanity.',
  ],
  letters: [
    { letter: 'K', kikongo: 'Nkanda', fr: 'Letter, book, message' },
    { letter: 'C', kikongo: 'Wambote', fr: 'Good' },
    { letter: 'C', kikongo: 'Wampa', fr: 'New' },
  ],
  meaning: 'KCC = “Nkanda Wambote Wampa”: Good New Message (Bon Nouveau Message).',
};

export const oracle: typeof FR.oracle = {
  title: 'The Oracle of 15 April 2003',
  quote: '“Whatever miracles he performs, a man cannot be God.”',
  paragraphs: [
    'On 15 April 2003 the Eternal gave this oracle to his Prophet. At once his understanding was opened and he received light on the knowledge of the only true God.',
    'The Eternal commanded him to proclaim this oracle, as he had instructed the Prophet Isaiah (Isa. 8:11-16). Through it, the Church left the worship of foreign gods to hold fast to the Eternal alone and enter his holy Covenant.',
    'The Oracle announces the fulfilment of what the KCC had foretold (Isa. 42:9): the restoration of faith in one God, Creator of heaven, earth and all that is in them, the only Redeemer, whom we must glorify, worship, pray to and trust (Isa. 43:10-11; 45:20-22).',
  ],
  attributes: ['Creator', 'Invisible', 'Immaterial', 'Incomparable', 'Without image or likeness', 'Saviour', 'Sovereign', 'Lord', 'Redeemer', 'Almighty', 'All-knowing', 'Ever-present', 'Unchanging', 'Eternal', 'One'],
};

export const professionOfFaith: typeof FR.professionOfFaith = {
  title: 'The Profession of Faith',
  rite: 'The congregation stands, right hand raised, and declares:',
  articles: [
    'I believe in the Eternal God, from whom all life flows. He is One, Lord of lords, Creator of heaven, earth and all that is in them.',
    'I believe in the salvation that, by his grace, his mercy and in his Name, the Eternal God has offered to all humanity through his Covenant and his Law.',
    'I believe in the Holy Word of God revealed to his prophets for the salvation of humanity.',
    'I believe in the immortality of the soul and in eternal life.',
    'I believe in the forgiveness of sins by the Eternal, through keeping his Law and in his Name.',
    'I believe in divine judgement, in the reward of the righteous and in the eternal punishment of the unbelieving.',
    'I believe that God’s Anointed, DIZOLELE-MPUNGU WAFIDUSWA Isaac, is a Prophet sent by the Eternal God.',
    'I believe that the Église Bon Nouveau Message (KCC) comes from God, and that it is one, holy and prophetic.',
  ],
  church: [
    { t: 'One', d: 'Because its invisible founder, the Eternal, is one, and its visible founder is one.' },
    { t: 'Holy', d: 'Because it is the fruit of the inspiration of God, who is holy.' },
    { t: 'Prophetic', d: 'Because its founder is a Prophet and its teachings come from the line of the prophets of the Eternal.' },
  ],
};

export const lawTexts: typeof FR.lawTexts = [
  {
    id: 'alliance',
    title: 'The Ten Words of the Covenant',
    intro: 'The people enter the Covenant of the Eternal by recognising the Eternal as the only true God and accepting his Words.',
    versions: [FR.lawTexts[0].versions.find((v) => v.lang === 'English')!, ...native('alliance')],
  },
  {
    id: 'commandements',
    title: 'The seven commandments of the Church',
    intro: 'Laid down by the Spiritual Leader in Kinshasa on 18 February 2015.',
    versions: [
      { lang: 'English (translation)', items: [
        'Do not drink intoxicating drinks or smoke.',
        'Do not consult fetish priests, soothsayers or the dead.',
        'Take part in the Sabbath service and in the services of holy days.',
        'Take part in fraternal communion and in the annual peace offerings.',
        'Recognise that marriage is a sacred union to be safeguarded.',
        'Remain holy.',
        'Love the Church, protect it and support it.',
      ] },
      ...native('commandements'),
    ],
  },
  {
    id: 'objectifs',
    title: 'The five aims of religious teaching',
    intro: 'Every sermon, whatever the audience, must aim at one of these five goals (circular of the Spiritual Leader, 2014).',
    versions: [
      { lang: 'English (translation)', items: [
        'To reveal to humanity the only true God, the Eternal.',
        'To convert lost souls to the Eternal God.',
        'To lead people to obey the Word of the Eternal God and to keep his law.',
        'To protect followers from false doctrines.',
        'To teach the faithful to live in the fear of the Eternal so as to be worthy of the kingdom of heaven.',
      ] },
      ...native('objectifs'),
    ],
  },
];

export const sacraments: typeof FR.sacraments = [
  { t: 'Confession', d: 'The Eternal asks no sacrifice in order to forgive: he asks for the decision to stop sinning for good and for sincerity in confessing. He forgives in his own Name.' },
  { t: 'The First Anointing', d: 'The sacrament by which a person recognises the Eternal as their only God and commits to love and serve him with all their heart, soul and strength (Deut. 29:9-12). It is received only once: it cannot be undone.' },
  { t: 'The Acts of Covenant', d: 'A ceremony in which the people recognise the Eternal as the only true God, accept the Words of the Covenant and commit to honour the Eternal alone and to follow his ordinances, precepts and commandments.' },
];

export const feasts: typeof FR.feasts = [
  { date: '1 March', t: 'Birth of the Prophet', d: 'Born on 1 March 1930 in Makaba (Luozi). Holy day.' },
  { date: '8 March', t: 'Birth of the Church', d: 'Calling of the Prophet, 8 March 1955. Holy day.' },
  { date: '12 April', t: 'Appearance of the KCC', d: 'The KCC signs appear in Boma, 12 April 1958.' },
  { date: '15 April', t: 'Feast of Deliverance (Oracle)', d: 'Proclamation of the Oracle, 15 April 2003. Holy day.' },
  { date: '30 April', t: 'Legal recognition', d: 'Legal personality granted by Ordinance no. 128-80 of 30 April 1980.' },
  { date: 'Every year', t: 'Feast of the Covenant', d: 'Yearly commemoration of entering the Covenant of the Eternal.' },
];

export const sabbathService: typeof FR.sabbathService = [
  { part: 'I. Opening', steps: ['Greeting of peace', 'Congregational hymn', 'Prayer of invocation', 'Welcome', 'Reading of the letter', 'Choir(s)', 'Congregational hymn', 'Profession of faith'] },
  { part: 'II. Word of the Eternal', steps: ['Bible reading', 'The Prophet’s Oath (hymn)', 'Congregational hymn', 'Sermon', 'Prayer of thanksgiving', 'Choir(s)', 'Various blessings'] },
  { part: 'III. Offerings and notices', steps: ['Congregational hymns', 'Choir(s)', 'Prayer for the offerings', 'Announcements'] },
  { part: 'IV. Close of the service', steps: ['Congregational hymn', 'Closing word and prayer or blessing'] },
];

export const prophetOath: typeof FR.prophetOath = {
  title: 'The Prophet’s Oath',
  paragraphs: [
    'In 1966 a group of missionary church authorities asked the Prophet to swear publicly, before a gathering of more than 500 people, that he would change the way he preached.',
    'That same night heaven responded: a group of angels came and taught him a hymn. At the appointed time, instead of giving in, he sang this hymn with tears in his eyes, together with the Apostle UNKEBA. Its words are an oath: to preach only the truth found in the Bible. With the Oracle of 15 April, the Church understood that this Bible is the Torah.',
    'This oath is a divine instruction that every minister must reflect on before preaching. That is why, at every major service, this hymn is sung before the sermon.',
  ],
};

export const nameOfGod: typeof FR.nameOfGod = {
  title: 'About the name of our God',
  paragraphs: [
    'When Moses asked God his name, God answered: “I am the unchanging Being.” And he added: “I am the Eternal, the God of your fathers, the God of Abraham, Isaac and Jacob. This is my name for ever, and this is my title from generation to generation” (Exodus 3:14-15).',
    'In our time, to save souls from idolatry, the same God appeared to the Prophet DIZOLELE and told him his name, asking him to read Psalm 136: “Give thanks to the Eternal, for he is good, for his mercy endures for ever.”',
    'Since 8 March 1955 the Prophet has taught the world about the Eternal: how to worship him, serve him, fear him and rely on him. For the KCCist, our God is called the Eternal.',
  ],
};

export const prophetTimeline: typeof FR.prophetTimeline = [
  { year: '1930', t: 'Birth', d: 'On 1 March 1930 in Makaba, Kinkenge sector, Luozi territory (Bas-Congo, now Kongo-Central).' },
  { year: '1940-1949', t: 'Education', d: 'Protestant schools of Makaba and Luangu, then the Catholic mission of Kidima. Later, shorthand and typing by correspondence (Institut national de sténographie, Brussels, 1957-1961).' },
  { year: '1950-1968', t: 'Working life', d: 'Timekeeper, clerk and then shorthand secretary in several companies in Mayombe and Boma, ending at the Société congolaise de surveillance (today the OCC).' },
  { year: '1955', t: 'The calling', d: 'From 8 to 13 March 1955, at the Teli camp of the Forakam company (Seke-Banza), he received apparitions, visions and revelations. He was 25. 8 March 1955 is the birth date of the Church.' },
  { year: '1956', t: 'Start of preaching', d: 'After a time of strengthening by the Eternal, he began preaching the Word in Boma.' },
  { year: '1958', t: 'Appearance of the KCC', d: 'On 12 April 1958 in Boma, the three KCC signs appeared to him in golden letters.' },
  { year: '1958-1962', t: 'Mission in Manianga', d: 'Religious mission in the Manianga region.' },
  { year: '1966', t: 'The Oath', d: 'Ordered to change the way he preached, he sang the hymn received from the angels, which became the “Prophet’s Oath”.' },
  { year: '1968', t: 'In the service of the Eternal', d: 'He left his job on 27 February 1968 and devoted himself entirely to the young Church as visible Founder, Spiritual Leader and Legal Representative.' },
  { year: '1980', t: 'Legal recognition', d: 'The Church obtained legal personality by Ordinance no. 128-80 of 30 April 1980, after 25 years of existence.' },
  { year: '1976-2005', t: 'Missions', d: 'Kisangani, Bukavu, Lubumbashi; Belgium, Switzerland, Germany, France, the United Kingdom; Angola (Luanda, Bengo, Soyo, Cabinda, Landana); the United States and Canada; South Africa. International seminar on modern agriculture in Israel (1989).' },
  { year: '2003', t: 'The Oracle', d: '15 April 2003: “Whatever miracles he performs, a man cannot be God.”' },
  { year: '2005', t: 'Registration', d: 'The Church was registered with the Ministry of the Interior under no. 0182 of 11 October 2005.' },
  { year: '2010', t: '“Mon Appel” (My Calling)', d: 'Publication of the account of his calling, after “L’Éternel Dieu et le Salut de l’Humanité, Oracle” (2005).' },
];

export const prophetPortrait: typeof FR.prophetPortrait = [
  'The story of the Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac cannot be separated from that of the Église Bon Nouveau Message (KCC), of which he is the visible Founder and Spiritual Leader.',
  'When he was called, he belonged to no Church. Like all whom the Eternal calls, he resisted at first, saying he was only a child; he had to accept. Like the prophets before him, he faced persecution, slander, betrayal and arrest.',
  'He knew he was a Prophet but never proclaimed himself one: it was his life, his deeds and his work that made him known as the chosen one and servant of the Eternal (Isa. 42:1).',
];

export const internationalPresence: typeof FR.internationalPresence = ['Angola: Luanda, Cabinda, Soyo', 'Congo-Brazzaville: Brazzaville, Pointe-Noire', 'Europe', 'South Africa', 'North America'];
