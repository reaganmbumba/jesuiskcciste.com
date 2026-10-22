/** English version of src/content/liturgie.ts (same shape). Lingala and Kikongo texts are kept as in the original. */
import type { Rite } from './liturgie';

export const liturgyIntro = {
  title: 'Rites and ceremonies',
  quote: 'In KCCism, rites and ceremonies are sacred acts which give the liturgy of the Église Bon Nouveau Message (KCC) the solemnity and glory due to the Eternal God.',
  paragraphs: [
    'The officiant consecrated to these acts must make them his own and perform them with skill and inspiration, under the guidance of the Eternal God. This is why the Spiritual Leader gathered them in a booklet, a working tool for the Sabbath service, purification, the first anointing, burial, the blessing of children, the nuptial blessing, the Acts of Covenant and the dedication of temples.',
    'The biblical and doctrinal foundations of each ceremony are set out in the great book of KCCism. Every prayer ends with the acclamation of the congregation.',
  ],
  acclamation: 'Alleluia! Come, Lord Eternal, by Your Holy Name.',
  source: 'Liturgical texts 2014, Église Bon Nouveau Message (KCC), the Spiritual Leader.',
};

export const rites: Rite[] = [
  {
    id: 'sabbat',
    title: 'The Sabbath service',
    when: 'Every Sabbath',
    summary: 'The ordinary Sabbath service has four parts, from the prayer of invocation to the final blessing. The whole congregation declares the Profession of faith standing, right hand raised.',
    programme: [
      { part: 'I. Introduction', steps: ['Greeting of peace', 'Congregational hymn', 'Prayer of invocation', 'Welcome', 'Reading of the letter', 'Choir(s)', 'Congregational hymn', 'Profession of faith'] },
      { part: 'II. Word of the Eternal', steps: ['Bible reading', 'Oath of the Prophet', 'Congregational hymn', 'Sermon', 'Prayer of thanksgiving', 'Choir(s)', 'Various blessings'] },
      { part: 'III. Offerings and notices', steps: ['Congregational hymns', 'Choir(s)', 'Prayer for the offerings', 'Announcements'] },
      { part: 'IV. End of the service', steps: ['Congregational hymn', 'Closing word and prayer or final blessing'] },
    ],
  },
  {
    id: 'purification',
    title: 'Purification (confession)',
    when: 'First sacrament of the new believer',
    summary: 'The penitent confesses their sins before the Eternal and before witnesses, then the officiant pronounces absolution in the Name of the Eternal. The Eternal asks for no sacrifice: only the sincere decision to sin no more.',
    programme: [{ steps: ['Hymn', 'Opening prayer', 'Calling of the penitent', 'Beginning of the confession', 'Confession of sins', 'End of the confession', 'Word of the officiant', 'Absolution of sins', 'Departure of the penitent', 'Hymn', 'Closing prayer'] }],
    texts: [
      { title: 'Maloba ya ntubela', lang: 'Lingala', tab: true, lines: [], parts: [
        { title: 'Maloba ya ebandeli', lines: ['Na kombo nayo Monsantu Yawe,', 'na fukami liboso bua yo pona ko ntubela masumu nanga', 'mpo tete na zua bilimbisi.'] },
        { title: 'Maloba ma bosilisi', lines: ['Na kombo nayo Mosantu, oh Yawe, na sengi,', 'olimbisa ngai na mabunga ma ngai manso.', 'Tika ete ejala bongo na kombo nayo Mosantu.'] },
        { title: 'Maloba ma bolimbisi', lines: ['Solo, tondimi ete yo Yawe Njambe Mokeli mwa biso, ojali bulee,', 'pe olimbisi ye na mabunga naye manso.', 'Tika ete ezala bango na kombo nayo Mosantu.', 'Alléluia !! Yaka Nkolo Yawe na nkombo nayo Mosantu.'] },
      ] },
      { title: 'Mpova za mpedoso', lang: 'Kikongo', tab: true, lines: [], parts: [
        { title: 'Mpova ya ntete', lines: ['Mu nkumbu aku ya nlongo, oh Yaveh,', 'mfukamene va ntadisi aku mukulomba ngiambudulu mu ntulumunu zami', 'mu tambula ngiambudulu kua ngeye.'] },
        { title: 'Mpova mu manisi', lines: ['Mu nkumbu aku ya nlongo, ngieti kulomba mutu', 'ngiambudila masumu mami mamosono mayavengi.', 'Bika buakala bobo mu nkumbu aku ya nlongo.'] },
        { title: 'Mpova ya ngiambudulu', lines: ['Mukedika, tulekele minu vo ngeye Yave Nzambi eto, wena wa nlongo', 'ye meni kunyambudila mu ntulumunu zandi.', 'Bika buakala bobo mu nkumbu aku ya nlongo.', 'Alléluia !! Wiza Mfumu Yaveh, mu nkumbu aku ya nlongo.'] },
      ] },
      { title: 'Beginning of the confession', lines: ['By Your Holy Name, Eternal God,', 'I kneel before You', 'to confess my sins', 'so that I may be forgiven.'] },
      { title: 'End of the confession', lines: ['By Your Holy Name, Eternal,', 'for all that I know', 'and all that I no longer remember,', 'I ask You, O Eternal God, to forgive me by Your Holy Name,', 'and you also, His witnesses,', 'for I have resolved never to go back to it.', 'Yes, may it be so by Your Holy Name.'] },
      { title: 'Absolution', lines: ['Truly, we have believed that You, Eternal God, our Creator, are holy, and that You want Your people to be holy.', 'Our brother (our sister) has just confessed all their sins to obtain Your forgiveness. Yes, I believe You have granted it by Your Name.', 'To the witnesses: “Do you also want them to be forgiven?” – “Yes, we want them to be forgiven in the Name of the Eternal God.”', 'Rise, believe and rejoice, for your sins are forgiven by the Eternal God. Yes, may it be so by His Holy Name.'] },
    ],
    notes: ['The prayer of repentance (confession and absolution) is also said in Lingala, “Maloba ya ntubela”, and in Kikongo, “Mpova za mpedoso”.'],
  },
  {
    id: 'onction',
    title: 'The First Anointing',
    when: 'Saturdays at 3 p.m., during a parish service (circular of 3 March 2015)',
    bible: 'Deuteronomy 29:9-12; Numbers 6:22-27',
    summary: 'Through the First Anointing a person enters the Covenant of the Eternal and carries the Name of the Eternal in their soul. It is received only once. The parish council organises this service after the new believers have been well prepared; for one or two people, the anointing may be given at the end of the Sabbath service. Each recipient receives a numbered “First Anointing Card” registered with the parish.',
    programme: [{ steps: ['Hymn', 'Prayer of invocation', 'Hymn', 'Sermon (Deut. 29:9-12)', 'Prayer of thanksgiving', 'Roll call', 'Welcome of the officiant', 'Declaration', 'Applause', 'Anointing', 'Presentation', 'Announcements', 'Final blessing'] }],
    texts: [
      { title: 'Declaration of the recipient', lang: 'Français', tab: true, lines: ['L’Éternel est notre Dieu, l’Éternel est un !', 'J’aimerai et servirai l’Éternel mon Dieu', 'de tout mon cœur,', 'de toute mon âme', 'et de toute ma force.', 'Qu’il en soit ainsi au Nom de l’Éternel !'] },
      { title: 'English translation', lang: 'English', tab: true, lines: ['The Eternal is our God, the Eternal is one!', 'I will love and serve the Eternal my God', 'with all my heart,', 'with all my soul', 'and with all my strength.', 'May it be so in the Name of the Eternal!'] },
      { title: 'Litatoli', lang: 'Lingala', tab: true, lines: ['Yawe azali Nzambe na biso, Yawe azali se moko', 'Nakolinga mpe kosalela Yawe Nzambe na ngai', 'na motema na ngai mobimba,', 'na molimo na ngai mobimba', 'mpe na makasi na ngai nyonso.', 'Tika ete ezala bongo na nkombo na Yawe !'] },
      { title: 'Mpova', lang: 'Kikongo', tab: true, lines: ['Yave i Nzambi eto, Yave wena umosi kaka', 'Mono ngina zola ye sadila Yave Nzambi ami', 'mu ntim’ami wa mvimba,', 'mu muel’ami wa mvimba', 'ye mu ngolo zami zazo.', 'Bika buakala bobo mu nkumbu a Yave !'] },
      { title: 'Anointing (blessing)', lang: 'English', lines: ['May the Eternal bless you and keep you!', 'May the Eternal make His face shine upon you and be gracious to you!', 'May the Eternal turn His face towards you and give you peace, today and for ever!', 'May it be so in the Name of the Eternal!'] },
      { title: 'Presentation to the congregation', lang: 'English', lines: ['These brothers and sisters have declared before the Eternal and His people that the Eternal our God is one, and have committed to love Him and serve Him with all their heart and all their strength.', '“Will you receive and welcome them?” – “Yes!”'] },
    ],
  },
  {
    id: 'alliance',
    title: 'The Acts of Covenant',
    when: 'Feast of the Covenant, celebrated every year',
    bible: 'Exodus 24:3-8',
    summary: 'During the Acts of Covenant, the people acknowledge the Eternal as the only true God, accept the Words of the Covenant and commit to practise His ordinances, precepts and commandments. The making of the Covenant at Sinai is remembered and the “bread of the Covenant”, a symbolic meal of thanksgiving, is eaten. It is also the KCCist Passover, the feast of deliverance.',
    programme: [
      { part: 'Praise', steps: ['Entry of the officiant', 'Hymn “Yawe yo Mokeli na biso”', 'Prayer of invocation', 'Choir', 'Hymn “Nzela na Yawe ezali sembo”'] },
      { part: 'Remembrance of the Covenant', steps: ['Reading of Exodus 24:3-8', 'Interpretation', 'The Covenant of the Eternal through Israel for all humanity', 'Declaration of the divinity of the Eternal', 'Intercession', 'Renewal of the forgiveness of the Eternal'] },
      { part: 'Bread of the Covenant', steps: ['Prayer of consecration', 'Presentation', 'Distribution', 'Command to eat the bread of the Covenant', 'Personal prayer'] },
      { part: 'Closing', steps: ['Offerings', 'Hymns', 'Final prayer', 'Word of the leader', 'Closing'] },
    ],
    texts: [
      { title: 'Prayer of invocation', lines: ['Lord Eternal, we give You thanks for the opportunity to gather before You in this holy place, to remember Your goodness and kindness, You who have shown us the way of salvation.', 'Through Your holy Covenant we have become Your people, through whom Your holy Name must be glorified and Your Covenant honoured. Lord Eternal, receive our thanksgiving.', 'Be with us in this celebration, and may Your divine power go with us. May it be so by Your Holy Name.'] },
      { title: 'Declaration to the people (2 July 2014)', lines: ['Realise and acknowledge that this Covenant was joyfully accepted by the assembly of the children of Israel, who said: “We will obey and do all that the Eternal our God has commanded.”', 'Know that after Moses consecrated it, the Words of this Covenant were sanctified and made eternally unchangeable for the whole of humanity.', 'Let it also be remembered that blood is not the Covenant of the Eternal: the ten commandments are. This Covenant stands for ever.'] },
    ],
  },
  {
    id: 'enfants',
    title: 'The blessing of children',
    when: 'Presentation of newborns (programme of 18 February 2015)',
    summary: 'According to the Word of the Eternal, every newborn must be presented to the Eternal God so that the child belongs to Him. The parents bring the child to the holy place; the officiant blesses the child, presents them to the congregation, hands over a certificate of blessing and gives advice to the parents.',
    programme: [{ steps: ['Roll call', 'Welcome of the officiant', 'Declaration', 'Hymn', 'Blessing', 'Presentation of the children', 'Handing over of the certificates', 'Advice from the officiant to the parents', 'Parents return to their seats', 'End of the ceremony'] }],
    texts: [
      { title: 'Declaration', lines: ['According to the Word of the Eternal, “every newborn should be presented to the Eternal God so that the child belongs to Him”.', 'So this child, here before the Eternal in this holy place, has been brought so that He may welcome and bless them. May it be done by His Holy Name, Eternal!'] },
      { title: 'Blessing', lines: ['Lord Eternal, we give You thanks for giving us this child. We know that children are the fruit of Your grace.', 'We pray You to bless this child by Your grace and in Your Holy Name, Eternal, so that they belong to You and serve You all their life.', 'May it be so by Your Holy Name!'] },
    ],
  },
  {
    id: 'mariage',
    title: 'The marriage service',
    summary: 'The nuptial blessing includes two questionings of the spouses, the blessing and the putting on of rings. The service is centred on the glory of the Eternal alone: it must not turn into a musical evening.',
    programme: [
      { part: 'Praise and meditation', steps: ['Hymn', 'Prayer of invocation', 'Choir', 'Sermon', 'Prayer of thanksgiving', 'Offerings'] },
      { part: 'Nuptial blessing', steps: ['Presentation of the couple', 'First questioning (the husband, then the wife)', 'Second questioning (the wife, then the husband)', 'Blessing and putting on of the rings', 'Blessing of the kneeling couple'] },
      { part: 'End', steps: ['Announcements', 'Signing of the marriage documents', 'Closing word and final blessing', 'Celebration and presentation of gifts'] },
    ],
    texts: [
      { title: 'The questions to the spouses', lines: ['Have you seen your wife (your husband)?', 'Do you want her (him) to become your wife (your husband) in the Eternal?', 'Do you truly want her (him) to be united to you in the Name of the Eternal, so that you become one?', 'Will you go on loving her (him) all your life, in difficulties as in suffering?'] },
      { title: 'Blessing of the rings', lines: ['Eternal, may these rings become the signs of their union in marriage. May it be so by Your Holy Name!'] },
      { title: 'Blessing of the couple', lines: ['Holy Eternal God, we know that marriage has come from You since the beginning, according to Your word: “A man shall leave his father and mother and hold fast to his wife, and the two shall become one.”', 'They are here in this holy place, before You and before many witnesses, to be united. By Your grace, bless them all their life; bless the fruit of their work and the fruit of their womb; bless their marriage and protect it to the end of their life.', 'From now on they are no longer two but one. May it be so in the Name of the Eternal!'] },
    ],
    notes: [
      'No more than seven choirs may sing, and the start and end times must be respected (circular of 2016).',
      'After the nuptial blessing, a KCCist couple does not invite Church members to sing religious hymns at a celebration that mixes glory to the Eternal, foreign divinities and worldly dancing.',
      'The covenant of marriage is the words of commitment spoken before God, the Church and the spouse: to love each other for good, whatever the difficulties.',
    ],
  },
  {
    id: 'deuil',
    title: 'The wake and the burial',
    bible: 'Genesis 3:19',
    summary: 'The wake at home alternates moments of singing, meditation and testimonies. On the day of the burial, after the service and the raising of the body, the officiant speaks the words of burial aloud at the cemetery. If the family wishes to speak, they are first given all the time they need.',
    programme: [
      { part: 'Wake at home', steps: ['Singing: greeting of peace, word for the occasion, hymns', 'Meditation: hymn of praise, prayer, sermon, thanksgiving', 'Life story and testimonies', 'Moment of silence'] },
      { part: 'Programme of the day', steps: ['Greeting of peace', 'Hymn and prayer', 'Sermon', 'Word from the family', 'Life story and testimonies', 'Laying of wreaths', 'Moment of silence', 'Raising of the body'] },
      { part: 'At the cemetery', steps: ['Word from the family', 'Greeting of peace', 'Hymn', 'Words of burial', 'Hymn', 'Greeting of peace'] },
    ],
    texts: [
      { title: 'Words of burial', lines: ['In the Name of the Eternal God.', 'This mortal and corruptible body must die, according to the Word of the Eternal: “You shall return to the ground from which you were taken, for you are dust, and to dust you shall return.”', 'Whoever dies without receiving the Eternal in their soul and without putting His laws into practice, their soul will go to eternal punishment.', 'But whoever has received the Eternal in their soul and put His laws into practice, their soul will be saved and received into eternal glory.', 'So may your soul be saved and received into the glory of the Eternal. Yes, may it be so in the Name of the Eternal God. Alleluia!'] },
    ],
    notes: ['After the words of burial no one else speaks, except for congregational hymns while the grave is filled in.'],
  },
  {
    id: 'dedicace',
    title: 'The dedication of a temple',
    when: 'Example: dedication of the Malweka temple (Kinshasa), 11 August 2013',
    summary: 'A new temple is consecrated to the Eternal during a service led by the Spiritual Leader, followed by the dedication ceremony itself.',
    programme: [
      { part: 'The service', steps: ['Congregational hymn', 'Prayer', 'Word of welcome', 'Choirs', 'Profession of faith', 'Bible reading', 'Oath of the Prophet', 'Sermon by the Spiritual Leader', 'Offerings'] },
      { part: 'The dedication', steps: ['Hymn “Ngolu monene ekiti na mokili oyo”', 'Address by the parish', 'Technical details of the building', 'Cutting of the ribbon', 'Reading of the dedication', 'Blessing of the pulpit', 'Final blessing', 'Signing of the guest book'] },
    ],
  },
];
