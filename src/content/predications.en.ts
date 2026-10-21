/** English version of src/content/predications.ts (same shape). */
import type { Sermon } from './predications';

export const sermonThemes: Record<Sermon['theme'], string> = {
  alliance: 'The Covenant',
  prophete: 'The Prophet',
  salut: 'Salvation',
  parole: 'The Word',
};

export const sermons: Sermon[] = [
  {
    id: 'notion-alliance',
    title: 'The meaning of the Covenant',
    text: 'Exodus 24:1-11',
    place: 'KCC Central Temple (Kinshasa)',
    theme: 'alliance',
    keyPoint: 'Blood is not the Covenant: the ten Words are the Covenant.',
    paragraphs: [
      'In His sovereignty, the Eternal established with Israel, through Moses, a Covenant governed by the ten commandments. Moses read it to the people who, understanding that dealing with the Eternal is a grace and a reason for joy, freely accepted it.',
      'For the Covenant, the Eternal forces no one: He leaves the people free to accept or refuse. The blood of the animals offered, which Moses sprinkled on the people and on the altar, is the symbol proving that the Covenant was accepted; but it is the ten Words that are the Covenant.',
      'After the offerings, Israel ate together at a great feast in memory of the Covenant. In our generation we eat a symbolic meal, the “bread of the Covenant”, to express our gratitude, then we give an offering. Let us open our hearts to receive this Covenant and the blessings of the Eternal.',
    ],
  },
  {
    id: 'fete-alliance-2013',
    title: 'The feast of the Covenant',
    text: 'Deuteronomy 1:1-4',
    date: '7 July 2013',
    theme: 'alliance',
    keyPoint: 'Heaven is found in the law.',
    paragraphs: [
      'Forty years after leaving Egypt, Moses reminds a new generation, who had not been at Sinai, of the Law: “This law was not given only to those who were at Horeb, but to all of you here”, that is, to all humanity.',
      'Leaving Egypt had brought Israel only material salvation; the Covenant brought spiritual salvation. By Covenant we mean the Law of the Eternal: the ten commandments, but also His precepts, rules and statutes. One can know the Name of the Eternal without accepting His Law; to be saved, one must accept His Law.',
      'The Prophet recalls that at the beginning of his calling he had wanted to flee the Law, but the Eternal held him back. We have become His people because we love His Law: let us rejoice in the Covenant and know its worth.',
    ],
  },
  {
    id: 'precision-alliance',
    title: 'A clarification on the Covenant of the Eternal',
    text: 'Genesis 9:9-11; Genesis 17:9-14; Exodus 20:1-14',
    date: '2012 (circular letter)',
    theme: 'alliance',
    keyPoint: 'The Covenant of Horeb is the main root of the salvation of every human being.',
    paragraphs: [
      'Since creation the Eternal has made several covenants: with Noah, all living beings and the earth; with Abraham; with Israel; with David. In the way of the KCC, He has also made covenants with us.',
      'But the Covenant made at Mount Horeb with Israel remains the most important, because it is the root of salvation for all people without distinction. “The very reason I came among you is to bring you, through the Oracle of 15 April 2003, into this Covenant.” Everyone is invited to remain in it and to celebrate the feast of the Covenant every year.',
    ],
  },
  {
    id: 'ezechiel-2',
    title: 'Do not be afraid, preach this word',
    text: 'Ezekiel 2:6-10 and 3:1-8',
    place: 'KCC Central Temple',
    theme: 'prophete',
    keyPoint: 'Receive this message freely, without sacrifice, and obey it.',
    paragraphs: [
      'To Ezekiel the Eternal announces that he will meet thorns and scorpions, a rebellious house: “Do not be afraid of them. Whether they listen or refuse, you, preach.” This good word tastes like honey.',
      'The Prophet testifies that the Eternal prepared him in the same way: in a vision He made him pass among boas, buffaloes and vicious dogs, images of the resistant hearts he would meet. On the way, stones were thrown at him and he was locked up; he risked death, but the Eternal protected him so that the message would get through. Three years after his calling, the Eternal gave him the KCC: Nkanda Wambote Wampa.',
      '“It is for your salvation that I took such risks. Receive this message freely, without sacrifice, and do not spoil it by your behaviour. The message is to make known to the world who the Eternal is, who God is: let us fear Him, obey Him and believe in Him.”',
    ],
  },
  {
    id: 'mer-rouge-2015',
    title: 'The Eternal, our God and our salvation',
    text: 'Exodus 14:30-31 and 15:1-2',
    date: 'Sabbath, 4 May 2015',
    place: 'Ozone parish (Kinshasa)',
    theme: 'salut',
    keyPoint: 'Like Israel, we praise the Eternal and take Him as our God and our salvation.',
    paragraphs: [
      'At the Red Sea, pursued by the Egyptians, Israel saw the Eternal deliver them; they believed in the Eternal and in Moses His servant, and sang: “The Eternal is my strength and my song, He has become my salvation.”',
      'The Spiritual Leader compares this story with the long struggle for the Church’s legal recognition: the request was first rejected and many wanted to wreck the project; on the way, the Eternal warned him not to hand the file to someone with bad intentions. In the end the legal personality was granted: “It was the Eternal who helped us; by ourselves it was practically impossible.”',
      'The salvation the profession of faith speaks of is spiritual salvation, offered through the Covenant: knowing what we may do and what we must not do. Whoever practises the law, justice and virtue shall live (Ezekiel 18:21-22).',
    ],
  },
  {
    id: 'paque-kcciste',
    title: 'The KCCist Passover, feast of deliverance',
    text: 'Deuteronomy 16:1; Exodus 12:2; Exodus 13:4-7',
    theme: 'salut',
    keyPoint: 'The KCCist Passover is celebrated through the Acts of Covenant and the bread of the Covenant.',
    paragraphs: [
      'In the Torah, the Passover is a feast the Eternal commanded the Hebrews in memory of their liberation from Egypt: a meal in honour of the Eternal. The word “Passover” means going out: spiritual, political, social and religious deliverance.',
      'Through the Oracle of 15 April 2003, the Eternal revealed that a man cannot be God, whatever miracles he performs. This oracle led the Church out of the worship of man into the worship of the Eternal and into His Covenant: a great spiritual liberation.',
      'It is this going out that KCCists celebrate at the feast of deliverance. It is celebrated through the Acts of Covenant, during which the bread of the Covenant is eaten in memory of the Covenant made between the Eternal and His people through the ten Words.',
    ],
  },
  {
    id: 'lumiere-eternel',
    title: 'Let us walk in the light of the Eternal',
    text: 'Isaiah 2:5',
    date: '14 August 2012',
    place: 'KCC Central Temple, opening of the seminar for the youth of Europe',
    theme: 'parole',
    keyPoint: 'All that the Eternal teaches us through the Prophet for our salvation is called KCCism.',
    paragraphs: [
      '“House of Jacob, come, let us walk in the light of the Eternal.” The light of the Eternal is His doctrine: His words, His teachings and His law. Israel commits to making its way of acting, speaking and behaving conform to the doctrine of the Eternal.',
      'Like Israel, the KCCist must live in their generation what the Eternal teaches through the Prophet placed among us. The oath of the Prophet says it: “Mena mu bibila, mena mu kia”; “kia” is the light in question. We are called to become disciples of the Eternal and of no one else.',
    ],
  },
  {
    id: 'quel-livre',
    title: 'Which book should we preach from?',
    text: 'Isaiah 2:5',
    date: '26 April 2014',
    place: 'Training seminar for servants, Kinshasa',
    theme: 'parole',
    keyPoint: 'The EBNM preaches from the Torah, the Hebrew Bible, from Genesis to Second Chronicles.',
    paragraphs: [
      'Every servant (apostle, preacher, disciple, deaconess) must know which book to preach from. It is the Bible; but there are several bibles and several translations.',
      'To avoid the confusion created by translators, the Church has adopted the Torah, the Hebrew Bible, which begins with Genesis and ends with the second book of Chronicles, the book of fulfilments. The Spiritual Leader points out that other bibles are not bad and that using them is not a sin: this choice serves the unity and reliability of the teaching.',
    ],
  },
];

export const seminars = [
  { date: '19 and 25 April 2003', title: 'Seminar with the heads of entities', place: 'Head Office, Kinshasa', d: 'Teachings following the Oracle of 15 April 2003: life after death and the forgiveness of sins.' },
  { date: '16 June 2008', title: 'Mothers’ seminar on the doctrine', place: 'Masina parish, Kinshasa', d: 'The commandments of the Church and the Covenant of Sinai: “On 15 April 2003 we received our religious constitution.”' },
  { date: '14 – 17 August 2012', title: 'Seminar for the youth of Europe', place: 'KCC Central Temple, Kinshasa', d: 'Theme: “KCCism, fruit of a divine revelation”. Origin of the Church and of the KCC signs, profession of faith, sacraments.' },
  { date: '26 April 2014', title: 'Training seminar for servants', place: 'Kinshasa', d: 'The working book of the Church (the Torah) and the meaning of salvation in KCCism.' },
  { date: '1 – 4 April 2015', title: 'Training seminar for the servants of Kinshasa', place: 'KCC Central Temple', d: 'Four days led by His Eminence the Spiritual Leader.' },
];

export const sermonsSource: string = 'Seminar reports and sermon notes, Head Office of the EBNM (2003-2015).';
