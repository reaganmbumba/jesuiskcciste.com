/**
 * Recueils de cantiques de l'EBNM/KCC (lingala et kikongo), repris des
 * fichiers « Recueil des cantiques lingala » et « Recueil de cantiques
 * kikongo » conservés dans les archives de Reagan Mbumba.
 * « Solo » et « Tous » indiquent qui chante chaque ligne.
 */

export interface Hymn { n: number; lang: 'Lingala' | 'Kikongo'; title: string; lines: string[] }

export const hymns: Hymn[] = [
 {
  "n": 1,
  "lang": "Lingala",
  "title": "ABALAYAMA MOSALI NA YAWE",
  "lines": [
   "Solo : Abalayama mosali na Yawe",
   "Tous : Apambuamaki wuta na Njambe",
   "Na botumbi mbeka na bulee",
   "Mpo na kotalisa kondima bolingo na Yawe",
   "Apesaki muana na ye",
   "Solo : O o lokola Abalayama",
   "Tous : Totumba banso mbeka na bulee",
   "Na misala pe bozui na biso",
   "Mpo na kotalisa kondima, bolingo na Yawe",
   "Biso banso tokopambuama(2x)"
  ]
 },
 {
  "n": 2,
  "lang": "Lingala",
  "title": "ADONAÏ YO YAWE",
  "lines": [
   "Solo : Adonaï yo Yawe e e",
   "Tous : Njambe na nguya pe na ngolu",
   "Otonda na boboto pe na sembo",
   "Njambe tokoki kokumbamela pe kosalela a",
   "Njambe tokoki kokumbamela pe kosalela.",
   "Solo : Alleluya toyembela Yawe e",
   "Tous : Alleluya toyembela Yawe",
   "Azali Njambe na Ngolu pe boboto,",
   "Tika banso tosalela ye",
   "Azali Njambe na ngolu pe boboto tika banso tokumisa ye e"
  ]
 },
 {
  "n": 3,
  "lang": "Lingala",
  "title": "ALLELUYA, ALLELUYA,ALLELUYA",
  "lines": [
   "Solo : Alleluya, alleluya, Alleluya, Alleluya",
   "Yo olingaka Yawe alleluya",
   "Salela ye na solo Alleluya",
   "Tous : Alleluya, alleluya, Alleluya, Alleluya",
   "Yo olingaka Yawe alleluya",
   "Salela ye na solo Alleluya"
  ]
 },
 {
  "n": 4,
  "lang": "Lingala",
  "title": "ATA BA PASI",
  "lines": [
   "Solo : Ata ba pasi tomimekano na kolanda kaka se yo o",
   "Tous : o Yawe na bule penza",
   "Solo : o Yawe",
   "Tous : sunga ka nga",
   "Batelaka nga",
   "O Yawe na bule penza"
  ]
 },
 {
  "n": 5,
  "lang": "Lingala",
  "title": "AMEN NKOLO YAWE YAKA",
  "lines": [
   "Solo : Amen nkolo Yawe yaka ah ah",
   "Tous : Amen Nkolo Yaweyaka",
   "Amen Nkolo Yaweyaka",
   "Amen Nkolo Yaweyaka"
  ]
 },
 {
  "n": 6,
  "lang": "Lingala",
  "title": "AMEN KEMBO PE LOKUMU BIBONGI SE NA YE",
  "lines": [
   "Solo : Amen Amen",
   "Kembo pe lokumu bibongi se na ye",
   "Tous : Amen Amen",
   "Kembo pe lokumu bibongi se na ye"
  ]
 },
 {
  "n": 7,
  "lang": "Lingala",
  "title": "BANDIMI NA YAWE NJAMBE",
  "lines": [
   "Solo : Bandimi na Yawe Njambe",
   "Tous : Ya sembo pe ya kimia",
   "Batosaki Yawe na liloba",
   "Mpe na misala tango inso",
   "Bamibongolaki se moto moko",
   "Kati na misala na Yawe Njambe",
   "Solo : O ndeko omisenzela",
   "Tous : Omi senzela",
   "Yawe akopambolaka",
   "Baye banso basalelaka ye",
   "Oyebi te suka na yo awa na mokili",
   "Na yango sala mosala na ye"
  ]
 },
 {
  "n": 8,
  "lang": "Lingala",
  "title": "BANDIMI BANSO NA YAWE",
  "lines": [
   "Solo : Bandimi banso na Yawe e",
   "Tous : Tokeba",
   "Tosalela Yawe na solo o",
   "Po ete satana atelemi",
   "Azalikoluka baye akopunza punza",
   "Tosalela mayele po to bika ah",
   "Azalikoluka baye akopunza punza",
   "Tosalela mayele po to bika ah",
   "Solo : Banani bako punza ma solo",
   "Tous : Baye batosi malako na Yawe te",
   "Bako punza ma",
   "Baye basopi mibeko na Yawe libanda",
   "Bango bako punzama."
  ]
 },
 {
  "n": 9,
  "lang": "Lingala",
  "title": "BANA NA ISRAEL",
  "lines": [
   "Solo : Bana na Israël balobaki na Mose",
   "Tous : Biso tokoki te koyoka Yawe",
   "Mose kende toko yokela yo",
   "Solo : Biso na EBNM tolobi na Mosakoli",
   "Tous : Biso tokoki te koyoka Yawe",
   "Mosakoli kende toyokela yo",
   "Solo : Mosakoli teya na yo",
   "Tous : Teya na yo",
   "Teya na yo na bana na yo",
   "Teya o teya tokoyokela yo."
  ]
 },
 {
  "n": 10,
  "lang": "Lingala",
  "title": "BANSO TOYEBA YANGO O",
  "lines": [
   "Solo : Banso toyeba yango o",
   "Tous : Njambe azali se moko",
   "Akotikala se moko",
   "Libela na libela",
   "Bobele ye Njambe na nguya",
   "Kombo na ye ezali Yawe e",
   "Bobele ye Njambe na nguya",
   "Kombo na ye ezali Yawe.",
   "Solo : Na yango esengeli na biso",
   "Tous : Kosalela ye tango nionso",
   "Pe kotosa malako na ye",
   "Wana ye akosepela na biso o",
   "Pe tokobiangama bana na esengo o o",
   "Wana ye akosepela na biso o",
   "Pe tokobiangama bana na esengo"
  ]
 },
 {
  "n": 11,
  "lang": "Lingala",
  "title": "BISO LIBOTA NA YAWE",
  "lines": [
   "Biso libota na Yawe",
   "Soki tondimeli solo ewuti na Yawe",
   "Mpe kotambola sembo liboso na ye",
   "Nde Yawe akopambola biso mpe ye",
   "Akolongisa biso",
   "Mpo ete tozua bomoyi bua seko",
   "mpe tomona nkembo na ye",
   "Soki olingi kopambuama",
   "Na Yawe e e, sala se mokano na ye",
   "Akosenga na yo ndeko pesa, nzoto mpe",
   "Molimo epai na ye, solo yo okopambuama"
  ]
 },
 {
  "n": 12,
  "lang": "Lingala",
  "title": "BISO BANSO TOWUMELA NA NGOLU OYO",
  "lines": [
   "Solo : Biso banso towumela na ngolu oyo",
   "Tous : Ebongoli bijaleli na biso",
   "Solo : Biso banso towumela na ngolu oyo",
   "Tous : Ekomisi biso libota na Yawe",
   "Solo : Ezali sango ya lobiko, sango yango o",
   "Tous : Wumela kati na sango oyo",
   "Malamu ya sika KCC e e",
   "KCC ewutaki kuna na lola na Yawe Njambe",
   "Ekiti na Mosakoli na ye",
   "Dizolele-Mpungu Wafiduswa"
  ]
 },
 {
  "n": 13,
  "lang": "Lingala",
  "title": "BOYAKANI KOPESA NA NKOLO",
  "lines": [
   "Bino bilenge boyakani kopesa",
   "Tokopesa na Nzambe na biso",
   "Bino ba mama boyakani kopesa",
   "Tokopesa na Nzambe na biso",
   "O na esengo",
   "Tokopesa makabo na biso",
   "Na esengo na Nkolo Yawe",
   "Tokopesa mpo tozua libonza",
   "Kuna na lola epai na Yawe Nzambe"
  ]
 },
 {
  "n": 14,
  "lang": "Lingala",
  "title": "BOLINGO NA YAWE ELEKI BE",
  "lines": [
   "Solo : Bolingo na",
   "Yawe eleki be",
   "Tous : Abongisela biso esengo be",
   "Esengo na likolo alakakaki biso",
   "Esengo na likolo.",
   "Solo : Na bolingo na esengo na Yawe",
   "toyeli awa",
   "Tous : Esengo na likolo tomekaka mpe",
   "Tozali na elaka na Yawe Nzambe",
   "Liloba na ye ezali nzela na solo",
   "Fongola na likolo ezali na ye"
  ]
 },
 {
  "n": 15,
  "lang": "Lingala",
  "title": "BOLINGO, BOLINGO ELEKI MONENE",
  "lines": [
   "Solo : Bolingo, bolingo eleki monene",
   "Bolingo elongolaka mabe manso",
   "Tous : Bolingo, bolingo eleki monene",
   "Bolingo elongolaka mabe manso."
  ]
 },
 {
  "n": 16,
  "lang": "Lingala",
  "title": "BOLINGO E E, BOLINGO NA EBNM",
  "lines": [
   "Solo : Bolingo e e, bolingo na EBNM",
   "Tous : Bolingo e e ebolingo a a",
   "Bolingo e e ebolingo a a",
   "Tolingana, tosangana, tosalisana na lingomba na Yawe e (2x)."
  ]
 },
 {
  "n": 17,
  "lang": "Lingala",
  "title": "BISO TOSENGI LISUNGI",
  "lines": [
   "Solo : Biso tosengi lisungi nayo Yawe",
   "Tous : Osunga libota nayo",
   "Solo : E Yawe",
   "Tous : E Yawe Njambe na biso",
   "Sunga biso libotana yo",
   "E Yawe Njembe na biso",
   "Salisa biso libota na yo."
  ]
 },
 {
  "n": 18,
  "lang": "Lingala",
  "title": "BOYA BOYA",
  "lines": [
   "Solo : Boya boya tosalela Yawe",
   "Tous : Banso boya tosalela Yawe",
   "Banso boya tosalela Yawe",
   "Ye Nzambe ya solo pe ya lobiko o",
   "Ye Nzambe ya solo pe ya lobiko o."
  ]
 },
 {
  "n": 19,
  "lang": "Lingala",
  "title": "BANGO MIBALE",
  "lines": [
   "Solo : Bango mibale se likambo yakotumbela",
   "Tous : Na Yawe e e mbeka",
   "Na moko na bango eyamba maki te",
   "Po été epesamaki na koyima yima",
   "E mawa eyamba maki te.",
   "Solo : O tala likambo",
   "Tous : Yawe andimi likabo ya",
   "Abele aboyi oyo ya kayina",
   "E Yawe yamba likabo na nga",
   "Oyo nga na pesi yo opambola (2x)"
  ]
 },
 {
  "n": 20,
  "lang": "Lingala",
  "title": "BASALI BAZALI KOTEYA",
  "lines": [
   "Solo : Basali bazali koteya oboyi",
   "koyokaa nde ko",
   "Tous : okosamba mokolo wana.",
   "Solo : Kasi yebaka ete",
   "Tous : Njambe na nguya abombameliyo",
   "Aleki yo mayele azali mona",
   "Makambo manso ojali kosala",
   "okosamba mokolo wana"
  ]
 },
 {
  "n": 21,
  "lang": "Lingala",
  "title": "BOLINGO NA YAWE EZANGA NDELO",
  "lines": [
   "Solo : Bolingo na Yawe ezanga ndelo o",
   "Tous : Mosungi na kokamua wuta bomuana nga",
   "Bolingo na ye ezanga ndelo o",
   "Butu na moyi Yawe mobateli na nga",
   "Yawe eh eh",
   "Yawe eh eh.",
   "Solo : Ngai na mipesi kosalela Yawe",
   "Tous : Nakoki te e kozonga sima a a",
   "A a na koki te eh kozonga sima a"
  ]
 },
 {
  "n": 22,
  "lang": "Lingala",
  "title": "BOYA BANSO TOKUMISA YAWE",
  "lines": [
   "Solo : Boya banso tokumisa Yawe",
   "Tous : Boya banso tosanjola ye",
   "Na loyembo pe na misala",
   "Azali kozela misala na biso",
   "Yakani banso tosalela ye",
   "Solo : Oyaka ndeko na nga yaka ah",
   "Tous : Oyaka ndeko na nga yaka ah",
   "Tosala mosala na Yawe e",
   "Njambe aponaki yo po salela ye",
   "Fungola motema yaka kosala"
  ]
 },
 {
  "n": 23,
  "lang": "Lingala",
  "title": "ESENGO MONENE",
  "lines": [
   "Solo : Esengo monene,",
   "Esengo ekozala kuna na lola, Soki tolongi",
   "Tous : Esengo monene,",
   "Esengo ekozala",
   "Kuna na lola",
   "Solo : na bandimi banso",
   "Tous : nkembo",
   "Solo : baye bakolonga",
   "Tous : nkembo",
   "Solo : baye bakosepela na lola",
   "Solo : soki tolongi",
   "Tous : Esengo monene,",
   "Esengo ekozala kuna na lola"
  ]
 },
 {
  "n": 24,
  "lang": "Lingala",
  "title": "ESENGO NA BATO BANSO",
  "lines": [
   "Solo : Esengo na bato banso",
   "Tous : Basili kondimela Yawe",
   "Babuaki mokili mpe bisengo binso",
   "Batosaki Yawe (bis) bazui lobiko"
  ]
 },
 {
  "n": 25,
  "lang": "Lingala",
  "title": "ESENGO NA LOBIKO NA BISO",
  "lines": [
   "Solo : Esengo na lobiko na biso",
   "Tous : Boya banso tokumisa Mokonzi",
   "Yawe Nzambe, Mokeli na biso",
   "Aponi biso mpo tosikolama",
   "kati na liloba ya lobiko",
   "Solo : Matondi na Yawe Nzambe",
   "Tous : Matondi tokopesa ye, na misala",
   "Na loyembo o,",
   "Matondi tokopesa ye na manso asaleli biso"
  ]
 },
 {
  "n": 26,
  "lang": "Lingala",
  "title": "EYAWE BATELAKA LIBOTA NA YO",
  "lines": [
   "Solo : E Yawe batelaka libota na yo",
   "Ndenge obatelaka Isalaele",
   "Tous : Opesaki bango mayi ya komela ah",
   "Opesaki bango bilei ya bomoyi ih",
   "Yawe eh eh Yawe eh eh",
   "Yawe eh eh Yawe eh, Yawe sunga"
  ]
 },
 {
  "n": 27,
  "lang": "Lingala",
  "title": "LILOBA NA YAWE YA LOBIKO",
  "lines": [
   "Solo : Liloba na Yawe ya lobiko",
   "Tous : Ekopesa bomoyi bua seko",
   "Ekosikola biso na masumu",
   "Po ete tobikisama",
   "Ekopesa bomoyi bua seko",
   "Ekosikola biso na masumu",
   "Po ete tobikisama",
   "Solo : Nguya na loboko na ye",
   "Tous : Lobiko ezali epai na ye",
   "Soki tokowumela kotosa liloba",
   "Biso banso tokobikisama",
   "Soki tokowumela kotosa liloba",
   "Biso banso tokobikisama"
  ]
 },
 {
  "n": 28,
  "lang": "Lingala",
  "title": "LIBOTA NA NJAMBE TOSALA",
  "lines": [
   "Solo : Libota na Njambe tosala",
   "Tous : Libota na Njambe tosala",
   "Mpo tokokisa kondima na misala.",
   "Solo : Boni o kolola pongi",
   "Tous : Lamuka e ee , lamuka",
   "Tala Yawe Njambe akobianga yo"
  ]
 },
 {
  "n": 29,
  "lang": "Lingala",
  "title": "LOLA EZALI MBOKA NA NKEMBO",
  "lines": [
   "TOZALI KOZELA",
   "Solo : Lola ezali mboka na n kembo tozali kozela",
   "Tous : Lola ezali mboka na nkembo tozali kozela",
   "Solo : Kuna toko kende",
   "Tous : Kuna toko kende",
   "Na mboka yango lola",
   "Tokopema ah ah"
  ]
 },
 {
  "n": 30,
  "lang": "Lingala",
  "title": "LOKOLAMISO NA BAWUMBU ETOKOTALAKA",
  "lines": [
   "Solo : loko miso na bawumbu etokotalaka",
   "Tous : loboko yabakolo na bango",
   "Solo : Nayango mpelamoko miso na biso o",
   "Tous : Ekotalela se Yawe Njambe",
   "Kino akoyo kela biso mawa po tolonga a a",
   "Kino akoyo kela biso mawa po tolonga a a"
  ]
 },
 {
  "n": 31,
  "lang": "Lingala",
  "title": "LILOBA NA YAWE EZALI KOSAKOLAMA",
  "lines": [
   "Solo : liloba na Yawe ezali kosakolama,",
   "Tous : Pona nini ozali kotia tembe",
   "E e keba na yo,",
   "mokolo wana",
   "oko kota te (2x)."
  ]
 },
 {
  "n": 32,
  "lang": "Lingala",
  "title": "LONGOLA KOBANGA TELEMA TOKENDE MONINGA.",
  "lines": [
   "Solo : longola kobanga telema tokende moninga.",
   "Tous : longola kobanga a a a",
   "Yawe mokeli mopesi na manso",
   "Belela ye akoyoka a",
   "Longua na mawa na yo"
  ]
 },
 {
  "n": 33,
  "lang": "Lingala",
  "title": "MATEYI OYO YA SOLO",
  "lines": [
   "Solo : Mateyi oyo ya solo",
   "Tous : Mateyi oyo ya solo",
   "Toyokaka na ndako ya Nzambe",
   "Ebongolaka ezaleli na biso",
   "Tolakisa mateyi na misala",
   "Solo : Bana na KCC",
   "Tous : Boya tokende",
   "Kokumisa Nzambe na biso",
   "Koyoka liloba",
   "Ya molimo na solo",
   "Liloba na nguya mpe ya lobiko"
  ]
 },
 {
  "n": 34,
  "lang": "Lingala",
  "title": "MATONDI TOKOPESA NA NKOLO YAWE",
  "lines": [
   "Solo : Matondi tokopesa na Nkolo Yawe",
   "Tous : Matondi tokopesa na Nkolo Yawe",
   "Lobiko na ngai ezali na ye",
   "Lobiko na ngai ezali na ye"
  ]
 },
 {
  "n": 35,
  "lang": "Lingala",
  "title": "MISALA NIONSO TOKOSALELAKA YAWE",
  "lines": [
   "Solo : Misala nionso tokosalelaka Yawe",
   "Tous : Ezali mbeka tokotumbelaka Yawe",
   "Fongola motema petola yango",
   "Mpo ete eyambama epai na Yawe",
   "Solo : Toye kotumba mbeka liboso na Yawe",
   "Na lolenge na Abel mpoto pambolama",
   "Tous : Toye kotumba mbeka liboso na Yawe",
   "Na lolenge na Abel mpo to pambolama"
  ]
 },
 {
  "n": 36,
  "lang": "Lingala",
  "title": "MOLILI EJIPA BISO MISO NDE SATANA",
  "lines": [
   "Solo : Molili ejipa biso miso nde satana",
   "Tous : Yawe Nzambe Mokonzi yo moyi ya mokili",
   "Fungola biso miso na mateyi na yo",
   "Lakisa biso njela mpo tobikisama",
   "Solo : Ojali moyi na nse Yawe Nzambe",
   "Tous : Ongengelaka bafuka miso",
   "Pesa biso bilei ya molimo",
   "Nde liloba na yo, oyo ya lobiko"
  ]
 },
 {
  "n": 37,
  "lang": "Lingala",
  "title": "MONDIMI YA EBNM YIKA MPIKO",
  "lines": [
   "Solo : Mondimi ya EBNM yika mpiko o",
   "Tous : Yika mpiko mpoete okota na lola",
   "Yo mondimi ya EBNM",
   "Liloba na Yawe ozali koyoka",
   "Salelaka yango tango inso",
   "Solo : Yoka liloba o o",
   "Tous : Yoka liloba o o",
   "Ekokotisa yo na lola."
  ]
 },
 {
  "n": 38,
  "lang": "Lingala",
  "title": "MONGUNA SATANA ALINGI ETE NA BUNGA NZELA",
  "lines": [
   "Solo : Monguna satana alingi ete na bunga",
   "Nzela na yo oyo ya solo, Najali",
   "Tous : Nazali wayo Yawe sungaka ngai",
   "Mpo ete na longa mokili oyo",
   "Monguna satana alingi ete",
   "Ngai na bunga nzela na ye oyo ya solo",
   "Solo : Batela kondima na ngai",
   "Tous : Batela kondima na ngai Yawe(bis)",
   "Batela kondima na ngai Yawe",
   "Simba kondima na ngai Yawe (bis)",
   "Lendisa kondima na ngai(bis)"
  ]
 },
 {
  "n": 39,
  "lang": "Lingala",
  "title": "MOTO NANI AKOSA LILOBA NAYAWE TE",
  "lines": [
   "Solo : Moto nani akotosa liloba na yawe te",
   "Tous : Moto nani akotosa liloba na yawe te",
   "Oyo Mosakoli akosakola",
   "Yawe ako kata likambo na ye (2x)",
   "Solo : Totosa liloba na yawe",
   "Tous : Oyo Mosakoli akosakola",
   "Oyo akotosa yango te",
   "Azali nalikambo na mosakoli te",
   "Kasi na yawe Njambe e (2x)."
  ]
 },
 {
  "n": 40,
  "lang": "Lingala",
  "title": "MOSAKOLI NA YAWE AZALI ESENGO NA YAWE",
  "lines": [
   "Solo : Mosakoli na yawe azali esengo na Yawe",
   "Tous : Kati na mokili",
   "pona ye liloba na ye ya motuya ezali kosakolama",
   "Solo : Tosengi na biso banso",
   "Tous : tosepela",
   "Solo : lingomba ya EBNM",
   "Tous : to tonda yawe",
   "Solo : potozali koteyama",
   "Tous : na oyo azali",
   "Esengo na ye kati na mokili",
   "Soki tokolonga ezali pona ye."
  ]
 },
 {
  "n": 41,
  "lang": "Lingala",
  "title": "MOKOLO YA LE 15 AVRIL 2003",
  "lines": [
   "Solo : Mokolo ya le 15 Avril 2003",
   "Tous : Mongongo makasi ekoloba na Mosakoli atako",
   "Bikamuiseli akosala",
   "Moto akoki kojala Njambe te Oracle.",
   "Solo : Maloba na Yawe na monoko ya Mosakoli",
   "Tous : aboyi to sambela banjambe mosusu",
   "Bobele se Yawe njambe",
   "Tala mokili eningani",
   "Pamba te solo na Yawe esakolami",
   "Eh eh libota na Yawe sepela",
   "Lelo tozui bosomi",
   "Eh bosomi tosili koyeba Yawe",
   "Njambe ya solo mosusu azali te",
   "E bosomi tosili koyeba Yawe",
   "Njambe ya solo mosusu azali te."
  ]
 },
 {
  "n": 42,
  "lang": "Lingala",
  "title": "MOPEPE MAKASI",
  "lines": [
   "Solo : Mopepe makasi eyelinga",
   "Mopepe makasi e e eyelinga",
   "Yawe na tomboli loboko simba nga",
   "Yawe na pesi yo motema pona kueya te",
   "Mopepe eh.",
   "Tous : Mopepe makasi eyelinga",
   "Mopepe makasi e e eyelinga",
   "Yawe na tomboli loboko simba nga",
   "Yawe na pesi yo motema pona kueya te."
  ]
 },
 {
  "n": 43,
  "lang": "Lingala",
  "title": "MBULA OYO NA SILISI NA PASI",
  "lines": [
   "Solo : Mbula oyo na silisi na pasi",
   "Tous : na silisi na pasi",
   "Mbul’oyo Yawe e na moni ngolu na yo",
   "Solo : Esengo na motema nga",
   "Tous : esengo na motema na nga",
   "Na manso Yawe Osaleli nga",
   "Soki yo te nde na jali te",
   "Solo : Yamba libonza na nga Yawe",
   "Tous : Yamba libonza na nga Yawe",
   "na pesi yo na esengo nionso",
   "soki yo tende nazali te."
  ]
 },
 {
  "n": 44,
  "lang": "Lingala",
  "title": "NA BAMPASI O MOKILI",
  "lines": [
   "Solo : Na bampasi o mokili",
   "Tous : Koniokama pe mingi",
   "Eh eh Yawe otikaki ngai te",
   "Na mopepe makasi",
   "Mbonge mpe lokola",
   "Eh eh Yawe yo mobateli na ngai",
   "Solo : Posa ya kokabela yo Yawe",
   "Tous : Otonda na manso na pesa yo nini",
   "Wolo palata yayo ngai ko mobola",
   "Eh eh Yawe ngai na tondi yo"
  ]
 },
 {
  "n": 45,
  "lang": "Lingala",
  "title": "NGAYI NA TAMBOLI NA NGA",
  "lines": [
   "Solo : Ngayi na tamboli na nga",
   "Tous : Ngayi na tamboli na nga",
   "Na mokili oyo",
   "Na monite eh",
   "Lingomba ekoki na nga a",
   "Solo : solo yango oyo",
   "Tous : yango na poni KCC",
   "Ngayi na lingaka",
   "Solo : Bana ya KCC e e",
   "Tous : Bakoma likonji",
   "Babuja ka te",
   "Kati na lingomba",
   "Suka likambo eh."
  ]
 },
 {
  "n": 46,
  "lang": "Lingala",
  "title": "NGUYA YAWE EZA KOMONANA",
  "lines": [
   "Solo : Nguya Yawe eza komonana",
   "Tous : Nguya Yawe eza komonana",
   "Na misaye ya minene (2x)"
  ]
 },
 {
  "n": 47,
  "lang": "Lingala",
  "title": "NGUYA E E E",
  "lines": [
   "Solo : Nguya e e e, Nguya e e e",
   "Nguya na yo tojali kosenga",
   "Nguya na yo tojali kosenga",
   "Eya kosalisa biso",
   "Tous : Nguya e e e, Nguya e e e",
   "Nguya na yo tojali kosenga",
   "Nguya na yo tojali kosenga"
  ]
 },
 {
  "n": 48,
  "lang": "Lingala",
  "title": "NAKOPESA YAWE NINI",
  "lines": [
   "Solo : Na kopesa Yawe nini",
   "Tous : na moni te",
   "Na monite",
   "Nini na koki kopesa yo oh",
   "Solo : o Yawe kamata",
   "Kamata nzoto na nga",
   "Kamata molimo na nga",
   "Tambolisa nga Yawe",
   "Tosala elongo"
  ]
 },
 {
  "n": 49,
  "lang": "Lingala",
  "title": "NAKOPESA YAWE NINI",
  "lines": [
   "Solo : Nakopesa Yawe nini eh",
   "Tous : Njambe na nga yo mokeli na nga",
   "Na lapi lelo nakosalela yo",
   "Na pesi yo nzoto pe molimo na nga."
  ]
 },
 {
  "n": 50,
  "lang": "Lingala",
  "title": "NAKOKI KOTIKA YO TE",
  "lines": [
   "Solo : Nakoki kotika yo te",
   "Njambe na ngai",
   "Tous : Nakoki kotika yo te",
   "Nakoki,kotika yo te",
   "Njambe na ngai",
   "Na bampasi mpe na mimekano"
  ]
 },
 {
  "n": 51,
  "lang": "Lingala",
  "title": "NA KO PESA YAWE NINI ANGO",
  "lines": [
   "Solo : Na kopesa Yawe nini ango",
   "Tous : Njambe na nga yo mokeli na nga",
   "Nalapi lelo na kosalela yo",
   "Na pesi yo njoto mpe molimo na nga"
  ]
 },
 {
  "n": 52,
  "lang": "Lingala",
  "title": "NAKOSALA NA LINGOMBA NAYO YAWE",
  "lines": [
   "Solo : Nakosala na lingomba na yo Yawe",
   "Tous : Nakosala na lingomba na yo",
   "Na esengo na kopusama te",
   "Ngayi na lingi kosalela yo",
   "Mpo ete Yawe opambola nga",
   "Solo : Yango na sengi na yo Njambe na nga",
   "Tous : Pambola nga na misala oyo",
   "Oh njambe na nga",
   "Pambolanga",
   "Nakotondisama na esengo",
   "Oh njambe na nga",
   "Pambolanga",
   "Nakotondisama na esengo"
  ]
 },
 {
  "n": 53,
  "lang": "Lingala",
  "title": "NA TANGO YA MPASI NA BELELAKI YO",
  "lines": [
   "Solo : Na tango ya mpasi na belelaki yo",
   "Tous : Otalisaki ngai ngolu na yo",
   "Osungaki ngai malamu",
   "E e Yawe na tondi yo, natondi yo, na tondi yo o o",
   "E e Yawe na tondi yo, olendisi ngai kondima",
   "Solo : Kumisama na yo Yawe Nzambe",
   "Tous : Kumisama na yo o o",
   "Kumisama na yo libela",
   "Mpe kembo alleluya",
   "Solo : Sanjolama na yo Yawe Nzambe",
   "Tous : Sanjolama na yo o o",
   "Sanjolama na yo libela",
   "Mpe kembo alleluya",
   "Satana aniokolaki ngai",
   "Otalisaki ngai ngolu na yo",
   "Obateli ngai malamu u u",
   "E e Yawe simbaka ngai, simbaka ngai a a,simbaka nga",
   "E e Yawe simbaka ngai pona longa"
  ]
 },
 {
  "n": 54,
  "lang": "Lingala",
  "title": "NDEKO WUMELA NA NJELA NA YAWE",
  "lines": [
   "Solo : Ndeko wumela na njela na Yawe",
   "Tous : Ndeko wumela kolemba te",
   "Kotala sima te oko bonguana mungua",
   "Eh ndeko keba na yo",
   "Kotala sima te oko bonguana mungua",
   "Eh ndeko keba na yo",
   "Solo : Oyo totika ah",
   "Tous : etikala libela",
   "Solo : Oyo tobuaka",
   "Tous : Ezonga te",
   "Eh ndeko koba na yo",
   "Eh ndeko koba na yo"
  ]
 },
 {
  "n": 55,
  "lang": "Lingala",
  "title": "NDEKO NA NGA TANGO EKOKI SALA",
  "lines": [
   "Solo : Ndeko na nga tango ekoki sala",
   "Tous : Ndeko na nga tango ekoki",
   "Sala mosala na esengo",
   "Fongola motema na yo",
   "Libonza na yo ndeko o lola (2x).",
   "Solo : Pesa pesa ndeko kozela ni te",
   "Njambe na yo akopambola ah ndeko",
   "Tous : Pesa pesa ndeko kozela ni te",
   "Njambe na yo akopambola ah ndeko"
  ]
 },
 {
  "n": 56,
  "lang": "Lingala",
  "title": "NA LINGOMBA NA YAWE NZAMBE",
  "lines": [
   "Solo : Na lingomba na Yawe Nzambe",
   "Tous : Na lingomba na Yawe Nzambe",
   "Kosala mpe kosambela ah",
   "Tokokokisa bolingo na Yawe Nzambe",
   "Nakosala mpe kosambela ah ah",
   "Solo : E yo mondimi oyeba yango oh oh",
   "Tous : Kondima ezangi misala",
   "Ezali ya kokufa ndeko na ngai",
   "Kokisa kondima na yo",
   "Na misala ah ah"
  ]
 },
 {
  "n": 57,
  "lang": "Lingala",
  "title": "NA LOLA MBOKA NA YAWE",
  "lines": [
   "Solo : Na lola mboka na Yawe bayengebene",
   "bakosepela",
   "Oh oh kuna na lola",
   "Tous : Na lola mboka na Yawe bayengebene",
   "Bakosepela."
  ]
 },
 {
  "n": 58,
  "lang": "Lingala",
  "title": "NA LOLENGE NA ABELE",
  "lines": [
   "Solo : Na lolenge na Abele muana na Adamu",
   "Tous : Sim’ elanga na Edene",
   "Akamataki mpate mafuta",
   "Pona kotumbela Yawe mbeka",
   "Atiaki yango na etumbeli",
   "Yango nde eyambamaki",
   "Solo : Esengo mingi",
   "Tous : Soki na lolenge na ye",
   "Biso tokosalaka bongo",
   "Pona lokumu na Yawe Nzambe",
   "Kobanga te, nguya, elonga ezali na ye (bis)"
  ]
 },
 {
  "n": 59,
  "lang": "Lingala",
  "title": "NAMIPESI NA NGAI",
  "lines": [
   "Solo : Na mipesi na ngai po na kosalela Yawe",
   "Kasi satana alingi te, Na mipesi",
   "Tous : Namipesi na ngai, pona kosalela Yawe",
   "Kasi satana alingi te",
   "Solo : Nguya na yo Nkolo Yawe",
   "Tous : Nguya na yo Nkolo, nakosenga na yo",
   "Soki ezali na ngai, nakoniata ye eh eh",
   "Niata niata niata nakoniata ye eh",
   "Niata niata niata ngai nakoniata satana"
  ]
 },
 {
  "n": 60,
  "lang": "Lingala",
  "title": "NANI AKOKI KOKOTA LOLA",
  "lines": [
   "Solo : Nani akoki kokota lola",
   "Tous : Nani akoki kokota lola,",
   "Nani akoki kokota lola",
   "Oyo akobunda etumba awa na mokili",
   "Soki asili kolonga ye nde akokota",
   "Solo : Tuna motema na yo lelo",
   "Tous : Tuna motema na yo",
   "Soki mokolo yango okokota",
   "Soki mpe okokota te",
   "Tuna motema na yo lelo"
  ]
 },
 {
  "n": 61,
  "lang": "Lingala",
  "title": "NANI ALONGOLI BISO KATI NA MASUMU",
  "lines": [
   "Solo : Nani alongolo biso kati na masumu",
   "Tous : Oh oh Yawe Mokeli",
   "Solo : Oh oh totondaka ye",
   "Tous : Tozongisa matondi na Yawe",
   "Alongoli biso na masumu",
   "Alakisi biso nzela na bomoyi",
   "Tozongisa matondi na Yawe"
  ]
 },
 {
  "n": 62,
  "lang": "Lingala",
  "title": "NANI MOPESI NA ELONGA NA MOKILI",
  "lines": [
   "Solo : Nani mopesi na elonga na mokili",
   "Tous : Bobele Yawe njambe mokeli (2x)",
   "Solo : Na bomoyi na nga ah",
   "Tous : Ata mbonge makasi eyelinga",
   "Na koyika se piko na mosala na ye",
   "Na kotika Yawe njambe ata moke te",
   "Pona yebi ye mokeli na nga",
   "Na kotika Yawe njambe ata moke te",
   "Pona yebi ye nde mopesi na manso."
  ]
 },
 {
  "n": 63,
  "lang": "Lingala",
  "title": "NJAMBE NA BISO YAWE AH",
  "lines": [
   "Solo : Njambe na biso Yawe ah",
   "Asalaki biso banso",
   "Topesa ye nkembo",
   "Oh ye nde Njambe eh",
   "Tous : Njambe na biso Yawe ah",
   "Asalaki biso banso",
   "Topesa ye nkembo."
  ]
 },
 {
  "n": 64,
  "lang": "Lingala",
  "title": "NJAMBE NA NGUYA NIONSO",
  "lines": [
   "Solo : Njambe na nguya nionso oh",
   "Tous : Kombo na yo ejali Yawe",
   "Bomoyi na nga esimbami na yo Yawe",
   "Na kobanga eloko te eh",
   "Bomoyi na nga esimbami na yo Mokeli",
   "Na kobanga eloko te",
   "Solo : Ata pasi eyeli nga",
   "Tous : Yawe ojali",
   "Solo : Pasi toko niokwama",
   "Tous : Yo molongisi",
   "Bomoyi na nga esimbami na yo Yawe",
   "Na kobanga eloko te",
   "Bomoyi na nga esimbami na yo Mokeli",
   "Na kobanga eloko te"
  ]
 },
 {
  "n": 65,
  "lang": "Lingala",
  "title": "NAKO TONDAKA YAWE",
  "lines": [
   "Solo : Nako tondaka Yawe",
   "Tous : Mikolo nionso ya bomoi nanga po ete ajali malamu",
   "Ajali kobatelaka nga mpe kosunga molimo na nga",
   "Mpema oyo na kotambola na yango eyuti epayi na ye",
   "Ajali kobatelaka nga mpe kosunga molimo na nga",
   "Solo : Yango na pona ye",
   "Tous : Eh Yawe",
   "Ojali na liloba ya suka",
   "Na bomoi buanga eh Yawe",
   "Tala tina e na kangami na yo",
   "Na pasi na kokumisa yo",
   "Kojanga na kotalela yo",
   "Tala tina e na kangami na yo",
   "Na pasi na kokumisa yo",
   "Kojanga na kotalela yo"
  ]
 },
 {
  "n": 66,
  "lang": "Lingala",
  "title": "NANSAYI MINGI TOYE KOBELELA YAWE",
  "lines": [
   "Solo : Nansayi mingi toye kobelela Yawe",
   "Tous : Mpona kosalisaka lingomba na ye",
   "Solo : Na esengo banso tokabela Yawe",
   "Tous : Na esengo be, na esengo be",
   "Tokopesa na Yawe Nzambe",
   "Na nsayi mingi toye kokabela Yawe",
   "Mpona kosalelaka Lingomba na ye"
  ]
 },
 {
  "n": 67,
  "lang": "Lingala",
  "title": "NAMIPESI NA NGA",
  "lines": [
   "Solo : Namipesi na nga",
   "Tous : Namipesi na nga",
   "Na mosala na Yawe",
   "Po ete naya ngo mapamboli mingi",
   "Ngayi na kobanga eloko te eh",
   "Yawe akosunga nga",
   "Solo : esengo nakosalela Yawe",
   "Tous : mapamboli Kimia",
   "Libonja",
   "Epayi na Yawe eh",
   "Mapamboli Kimia Libonja",
   "Namosala na Yawe"
  ]
 },
 {
  "n": 68,
  "lang": "Lingala",
  "title": "NANI AKOSUNGAKA NGA",
  "lines": [
   "Solo : Nani akosungaka ngai",
   "Tous : Yawe Njambe mokeli na nga",
   "Yawe Njambe na bulee",
   "Akowela kanga",
   "Akosungaka ngai",
   "Elikia na nanga ejali na ye e",
   "Akosungaka ngai",
   "Elikia na nanga ejali na ye",
   "Solo : Satana mpe milimo na ye na ba mokili",
   "Tous : Akolakelaka nga kaka mabe",
   "Butu na moyi mpe kotungisaka nga",
   "Na kobelelaka Nkolo na nga",
   "Yawe Njambe ako longisaka nga"
  ]
 },
 {
  "n": 69,
  "lang": "Lingala",
  "title": "NATATOLI NGULU NA YO KATI NA BOYI NA NGA",
  "lines": [
   "Solo : Natatoli ngulu na yo kati na boyi na nga",
   "Tous : Yawe eh tika na kumisa yo",
   "Solo : Ngayi na mituni tuni Yawe",
   "Tous : Ngayi nani po ete obianga nga",
   "Mingi batelengani Yawe obiangi bango te",
   "Eh Yawe na tatoli ngolu na yo",
   "Yawe eh tika na kumisa yo",
   "Eh Yawe na tatoli ngolu na yo",
   "Yawe eh tika na kumisa yo."
  ]
 },
 {
  "n": 70,
  "lang": "Lingala",
  "title": "NASOSOLI SOLO",
  "lines": [
   "Solo : Nasosoli solo eh mbongo na ngai",
   "Tous : Ewuti na yo",
   "Solo : O o pona yango",
   "Tous : Lelo na telemi",
   "Na ye kopesa yango epai na yo",
   "O o Yawe Nzambe",
   "Pona pambuama"
  ]
 },
 {
  "n": 71,
  "lang": "Lingala",
  "title": "NA YEBAKI YO TE YAWE NZAMBE",
  "lines": [
   "Solo : Na yebaki yo te Yawe Nzambe",
   "Tous : Na yebaki yo te Nzambe na ngai",
   "Kasi na mawa na yo moko obiangi ngai",
   "Okotisi ngai kati na Lingomba na yo",
   "Mpo lel‘oyo ngai na salela yo",
   "Solo : Batela kondima na ngai",
   "Yawe Nzambe pona longa",
   "Tous : Batela kondima na ngai Yawe Nzambe",
   "Mpo ngai na wumela kati na nzela na yo",
   "Mpo mokolo mua suka na kota lola"
  ]
 },
 {
  "n": 72,
  "lang": "Lingala",
  "title": "NDEKONA NGA BONDELA AH",
  "lines": [
   "Solo : Ndekona nga bondela",
   "Tous : Bondela senga lisungi na Yawe",
   "Solo : Tango ya mimekano",
   "Tous : Senga na kondima nionso",
   "Senga epayi na Yawe",
   "Wana satana atiki yo te eh",
   "Wana satana atiki yo te"
  ]
 },
 {
  "n": 73,
  "lang": "Lingala",
  "title": "NDEKO NA NGAI YAWE ABIANGI YO",
  "lines": [
   "Solo : Ndeko na ngai Yawe abiangi yo",
   "Tous : Na Lingomba ya KCC, kosunga",
   "Kosalisa yango, ata ko bapasi minioko",
   "Kolembe te zala na molende",
   "Salela Yawe na bomoyi na yo",
   "Solo : Tozala na molende",
   "Tous : Tozala na molende, tosalela Yawe",
   "Na Lingomba ata ko bapasi",
   "Topesa na esengo, toyima yima te",
   "Wana nde tokopambuama"
  ]
 },
 {
  "n": 74,
  "lang": "Lingala",
  "title": "NDEKO NANGAI TANGO EKOKI SALA",
  "lines": [
   "Solo : Ndeko na ngai tango ekoki sala",
   "Tous : Ndeko na ngai tango ekoki",
   "Sala mosala na esengo",
   "Fungola motema na yo",
   "Libonja na yo ndeko o lola",
   "Solo : Pesa pesa ndeko kozelani te",
   "Tous : Yawe Nzambe akopambola yo o o",
   "Pesa, pesa ndeko kozelani te",
   "Yawe Nzambe akopambola yo o o"
  ]
 },
 {
  "n": 75,
  "lang": "Lingala",
  "title": "NGOLU MONENE EKITI NA MOKILI OYO",
  "lines": [
   "Solo : Ngolu monene ekiti na mokili oyo",
   "Tous : Ngolu monene ekiti na mokili oyo",
   "Kati na sango, sango ya KCC",
   "Lobiko ya solo ekiti na mokili oyo",
   "Kati na sango, sango ya KCC",
   "Solo : Na yango totonda Yawe",
   "Tous : Tonda Yawe Nzambe, tokumisa ye",
   "Kumisa Yawe Nzambe eh",
   "Totonda Yawe",
   "Tonda Yawe Nzambe",
   "Pona ngolu na ye ekowumelaka seko"
  ]
 },
 {
  "n": 76,
  "lang": "Lingala",
  "title": "NGOLU NA YAWE ELEKI MANSO O MOKILI",
  "lines": [
   "Solo : Ngolu na Yawe eleki manso o mokili",
   "Tous : Yango lobiko na biso",
   "Soki lelo tobikisami",
   "Soki lelo tozali malamu",
   "Ezali ngolu na Yawe Nzambe",
   "Eh eh tika totonda ye",
   "Solo : Tonda Yawe ndeko na ngai",
   "Tous : Tonda tonda Yawe",
   "Asikoli biso na masumu",
   "Tala ngolu na Yawe",
   "Akomisi biso libota na ye",
   "Eh eh tika totonda ye"
  ]
 },
 {
  "n": 77,
  "lang": "Lingala",
  "title": "NGONGA EBETI",
  "lines": [
   "Solo : Ngonga ebeti",
   "Tous : toye",
   "toye bana EBNMtoye",
   "Solo : Telema tokende, tokende, tokende",
   "Tous : Kosalela Yawe, Moninga na ngai",
   "Tokende, tokende, tango ekoki"
  ]
 },
 {
  "n": 78,
  "lang": "Lingala",
  "title": "NKEMBO EZALI NA LOLA",
  "lines": [
   "Solo : Nkembo ezali na lola, nkembo, nkembo",
   "Tous : Nkembo ezali na lola, nkembo",
   "Nkembo ezali na lola, nkembo",
   "Nkembo, nkembo nkembo nkembo",
   "Nkembo, nkembo nkembo nkembo",
   "Nkembo, nkembo nkembo",
   "Solo : Kuna tokoyemba nzembo na esengo",
   "nkembo",
   "Tous : Kuna tokoyemba nzembo na esengo",
   "Kuna tokoyemba nzembo na esengo,",
   "nkembo",
   "Nkembo, nkembo, nkembo, nkembo",
   "Nkembo,nkembo, nkembo"
  ]
 },
 {
  "n": 79,
  "lang": "Lingala",
  "title": "NINGANAKA",
  "lines": [
   "Solo : Ninganaka oh ninganaka",
   "Ninganaka oho na mosala oyo",
   "Tous : Ninganaka oh ninganaka",
   "Ninganaka oho na mosala oyo"
  ]
 },
 {
  "n": 80,
  "lang": "Lingala",
  "title": "NKEMBO KUNA LOLA",
  "lines": [
   "Solo : Nkembo kuna na lola ah ah ah",
   "Tous : Nkembo kuna na lola na baye bakolonga",
   "Nkembo kuna na lola ah ah ah",
   "Nkembo kuna na lola na baye bakolonga"
  ]
 },
 {
  "n": 81,
  "lang": "Lingala",
  "title": "NKOLO NZAMBE NA NGAI YAKA",
  "lines": [
   "Solo : Nkolo na ngai Yawe yaka o o yaka",
   "Tous : Nkolo na ngai Yawe yaka",
   "Nkolo na ngai Yawe yakao o yaka",
   "Nkolo na ngai Yawe yaka"
  ]
 },
 {
  "n": 82,
  "lang": "Lingala",
  "title": "NKOLO SIMBA NGAI NA LOBOKO",
  "lines": [
   "Solo : Nkolo simba ngai na loboko",
   "Tous : Soki otiki ngai Yawe Nzambe",
   "Nakoki kolonga na mokili oyo te",
   "Solo : Nkolo simba ngai ah ah",
   "Tous : Simba ngai, Nkolo simba Yawe simba ngai"
  ]
 },
 {
  "n": 83,
  "lang": "Lingala",
  "title": "NZAMBE NA BISO SALISA BISO",
  "lines": [
   "Solo : Nzambe na biso salisa biso",
   "Tous : Na pasi oyo tozali na yango",
   "Nakosalela yo awa o nse",
   "Yoka mawa oh yoka mawa",
   "Tosengi yo osalisa biso",
   "Solo : Yawe Njambe",
   "Yoka mawa bisi tosengi osalisa biso",
   "Oh Yawe",
   "Tous : Yoka mawa bisi tosengi osalisa biso",
   "Oh Yawe"
  ]
 },
 {
  "n": 84,
  "lang": "Lingala",
  "title": "NZAMBE NA BISO SALISA BISO",
  "lines": [
   "Solo : Njambe na nguya, namipesi na yo",
   "Tous : Po ete nalingi ko jua lobiko",
   "Po ete ojali mopesi na manso",
   "Solo : O Yawe Njambe",
   "Tous : Tala bomoyi na ngai Nkolo Yawe",
   "Etungisami na satana",
   "Yawe simbanga po ete na kweya te",
   "E e e"
  ]
 },
 {
  "n": 85,
  "lang": "Lingala",
  "title": "OKOJALA NA BA NJAMBE MOSUSU TE",
  "lines": [
   "Solo : Okojala na ba Njambe mosusu te",
   "Tous : Liboso na Yawe Njambe",
   "Toko ngumbamela yango te eh",
   "Eh soki moke kete",
   "Solo : To kumisa banso",
   "Tous : Yawe Njambe amonaka",
   "Ayo kaka pe aloba ka",
   "Ye mokeli na biloko biso omokili",
   "Mosusu te",
   "Ajali te",
   "Ye mokeli na biloko biso omokili",
   "Mosusu te",
   "Bobele se ye"
  ]
 },
 {
  "n": 86,
  "lang": "Lingala",
  "title": "OMIPESA NA NZAMBE NA YO",
  "lines": [
   "Solo : Omipesa, omipesa,",
   "Tous : Omipesa na Nzambe na yo",
   "Ata na pasi omipesa, omipesa na Nzambe",
   "na yo",
   "Alleluya nkembo na Yawe eh eh",
   "Alleluya nkembo na Yawe eh eh"
  ]
 },
 {
  "n": 87,
  "lang": "Lingala",
  "title": "O SATANA TIKA NGAI",
  "lines": [
   "Solo : O satana tika ngai",
   "Tous : Tika ngai, na salela Nzambe na ngai",
   "Otungisi ngai mingi tika ngai",
   "Nasalela Yawe Nzambe na ngai",
   "Oniokoli ngai mingi tika ngai",
   "Kumisa Yawe Nzambe na ngai",
   "Solo : Satana tika molimo na ngai",
   "Tous : Tika, oh oh tika molimo na ngai",
   "Ngai na salela Yawe Nzambe na ngai",
   "Oh tika yango"
  ]
 },
 {
  "n": 88,
  "lang": "Lingala",
  "title": "OYO AKOLONA MOKE",
  "lines": [
   "Solo : Oyo akolona moke",
   "Tous : Akobuka mpe moke",
   "Kasi oyo akolona mingi",
   "Akobuka mpe mingi",
   "Solo : Ndeko na ngai",
   "Tous : Pesa makabo na yo na motema moko",
   "Pe na esengo na Yawe Nzambe",
   "Pesa makabo na yo na motema moko",
   "Pe na esengo mpo opambuama",
   "Solo : Pesa ndeko,",
   "Tous : pesa makabo na yo",
   "Pesa na Yawe Nzambe",
   "Yende akopambola yo"
  ]
 },
 {
  "n": 89,
  "lang": "Lingala",
  "title": "PONA KOSALELA YAWE",
  "lines": [
   "Solo : Pona kosalela Yawe oh na solo penza",
   "Okofutama na lola na Yawe eh",
   "yo mondimi eh",
   "Tous : Pona kosalela Yawe oh na solo penza",
   "Okofutama na lola na Yawe eh eh"
  ]
 },
 {
  "n": 90,
  "lang": "Lingala",
  "title": "PONA NZELA NA YO NDEKO",
  "lines": [
   "Solo : Pona nzela na yo ndeko",
   "Tous : Nzela na lola",
   "Solo : Pona nzela na yo ndeko",
   "Tous : Nzela lifelo",
   "Bizaleli na yo bikoponela yo nzela"
  ]
 },
 {
  "n": 91,
  "lang": "Lingala",
  "title": "SALA MAKASI",
  "lines": [
   "Solo : Sala makasi olonga mokili oyo",
   "Po ete na sima ndeko okota na lola",
   "Tous : Sala makasi olonga mokili oyo",
   "Po ete na sima ndeko okota na lola"
  ]
 },
 {
  "n": 92,
  "lang": "Lingala",
  "title": "SALA MOSALA NA YAWE NZAMBE",
  "lines": [
   "Solo : Sala mosala na Yawe Nzambe",
   "Tous : Sala mosala na Yawe Nzambe",
   "Mpo esengo na yo na lola",
   "Oh ndeko ekokisama",
   "Mpo esengo na yo na lola",
   "Oh ndeko ekokisama"
  ]
 },
 {
  "n": 93,
  "lang": "Lingala",
  "title": "SANGO YA LOBIKO YA KCC",
  "lines": [
   "Solo : Sango ya lobiko ya KCC",
   "Tous : Yango nde nzela ya bomoyi",
   "Ndeko yaka towumela",
   "Nakotosa mpe na misala",
   "Ndeko yka towumela",
   "Mpo tozua bomoyi bua seko",
   "Solo : Boya totosa banso",
   "Tous : Totosa banso sango ya KCC",
   "Ewuti solo na Yawe Nzambe",
   "Yango ekosikolaka, ekobongolaka",
   "Ewuti solo na Yawe Nzambe",
   "Tosimba sango malamu mpe ya sika"
  ]
 },
 {
  "n": 94,
  "lang": "Lingala",
  "title": "SATANA LONGUA",
  "lines": [
   "Solo : Satana longua longua",
   "Tous : Satana longua, satana longua longua",
   "Tika ngai na salela Yawe Nzambe na ngai",
   "Kino liwa na ngai satana longua",
   "Solo : Longua na motema na ngai",
   "Tous : Satana longua"
  ]
 },
 {
  "n": 95,
  "lang": "Lingala",
  "title": "SEPELISA YAWE",
  "lines": [
   "Solo : Sepelisa Yawe",
   "Tous : Sepelisa ye ndeko na bomoyi na yo",
   "Na misala nionso mpe bozui na yo",
   "Ye azali sembo akozongisela yo",
   "Sala mosala mpe bombisa bozui na yo",
   "Na lola bakoyiba te",
   "Sala mosala mpe bombisa bozui na yo",
   "Na lola bakoyiba te",
   "Solo : Oh ngai nakobombisa",
   "Tous : Nako bombisa bozui na ngai na lola",
   "Kuna bayibi bazali te",
   "Banze na Nkolo babateli na yango",
   "Ekobunga te kino na kokoma kuna",
   "Banze na Nkolo basenzeli na yango",
   "Ekobunga te kino na kokota"
  ]
 },
 {
  "n": 96,
  "lang": "Lingala",
  "title": "SOKI OLINGI KOLONGA NDEKO",
  "lines": [
   "Solo : Soki olingi kolonga ndeko",
   "Tous : Wumela mpe tosaka liloba",
   "na Yawe Nzambe",
   "Epesemeli yo na ngolu na Yawe",
   "Simba yango mpe batela yango",
   "Ekolongisa yo mokolo mua suka",
   "Teya yango mpe limbola yango",
   "Na mabota manso bango mpe babika",
   "Solo : O o nani akolonga",
   "Tous : Moto oyo, abonguami awa na mokili",
   "Bobele ye motot akolonga",
   "Apesaka na Yawe Nzambe",
   "Nakoyima yima te kasi na esengo",
   "Sango malamu nde bomoyi bua ye",
   "Bobele yemoto akolonga"
  ]
 },
 {
  "n": 97,
  "lang": "Lingala",
  "title": "SOKI NA TALI BOLAMU NA YAWE",
  "lines": [
   "Solo : Soki na tali bolamu na Yawe",
   "Tous : E e ezali monene kati na biso",
   "Solo : O o na yango o",
   "Tous : Totonda , totonda a a",
   "Totonda Yawe azali monene",
   "Totonda Yawe azali malamu"
  ]
 },
 {
  "n": 98,
  "lang": "Lingala",
  "title": "YAWE NA MITUNGISAKI MINGI",
  "lines": [
   "Solo : Yawe na mitungisaki mingi",
   "Tous : Yawe na mitungisaki mingi",
   "Nakopesa nini epai na yo",
   "Po osaleli ngai makambo ya minene",
   "Solo : E e Yawe na tondi yo o o",
   "Tous : E e Yawe na tondi yo",
   "Solo : Oyokaki losambo na ngai nionso",
   "Tous : Oyokaki losambo na ngai nionso",
   "Mpe obongisa njela njela po",
   "nazua likabo lele ne naya kopesa",
   "Solo : O fungoli motema na ngai nionso",
   "Tous : O fungoli motema na ngai nionso",
   "Mpo na kobela yo, lelo lelo",
   "Pona kabela yo na esengo nionso"
  ]
 },
 {
  "n": 99,
  "lang": "Lingala",
  "title": "YAWE NZAMBE AWA ALINGAKI MOKILI OYO",
  "lines": [
   "Solo : Yawe Nzambe awa alingaki mokili oyo",
   "Tous : Atinda basakoli na ye",
   "Oyo andimeli solo na ye abeba te",
   "Solo : Amen, aleluya",
   "Tous : Amen, aleluya",
   "Na Yawe tobikisami",
   "Oyo andimeli solo na ye abeba te"
  ]
 },
 {
  "n": 100,
  "lang": "Lingala",
  "title": "YAWE NZAMBE ABENGI BATO NA YE NA LOBIKO",
  "lines": [
   "Solo : Yawe Nzambe abengi bato na ye na lobiko",
   "Tous : Amonisi ngolu na banso",
   "Maloba na ye masolo majali kosakolama",
   "Kasi bato bajali kotambola na bijaleli na bango",
   "Solo : Libonja nini tokoyua na ndenge oyo",
   "Tous : O o o yo Nzambe na biso",
   "Makanisi na bato majali ndenge",
   "na ndenge",
   "O o o yo Nzambe na biso",
   "Bizaleli na bato bizali ndenge mosusu"
  ]
 },
 {
  "n": 101,
  "lang": "Lingala",
  "title": "YAWE NZAMBE O LIKOLO",
  "lines": [
   "Solo : Yawe Nzambe o likolo",
   "Tous : Esika nanga ezali na lola",
   "Pona nini nakozanga yango",
   "Soki na zali na ngai malamu",
   "Pona nini nakozanga yango",
   "Soki nazali na ngai moponami"
  ]
 },
 {
  "n": 102,
  "lang": "Lingala",
  "title": "TOKENDE BANSO EPAYI NA YAWE",
  "lines": [
   "Solo : Tokende banso epai na Yawe",
   "Tous : Kopesa mikumba bampasi na se",
   "Tokende banso epayi na Yawe",
   "Ye akopemisa biso",
   "Solo : Totalaka Nzambe na biso Yawe",
   "Tous : Mobateli na biso ya solo",
   "Ye akoki kopesa bomoyi na seko"
  ]
 },
 {
  "n": 103,
  "lang": "Lingala",
  "title": "TONGA NDAKO NA YO O LIKOLO",
  "lines": [
   "Solo : Tonga ndako na yo o likolo",
   "Tous : Mboka na kembo, mboka na kimia",
   "Kuna tokowumela mibu na mibu",
   "Awa na mokili oyo kimia ezali te",
   "Tonga ndako na yo kuna na lola",
   "Bandako tokotonga awa na mokili oyo",
   "Sima tango moke ekotikala",
   "Solo : O o tonga ndako na yo ndeko",
   "Tous : Kuna na likolo",
   "Tonga ndako na yo na likolo na Yawe",
   "Mboka na elaka, bayengebene kaka",
   "Bakokota kuna, tonga ndako na yo",
   "Likolo na Yawe, mboka na libela",
   "Balongi kaka bakoyingela kuna"
  ]
 },
 {
  "n": 104,
  "lang": "Lingala",
  "title": "TONDA TONDA",
  "lines": [
   "Solo : Tonda tonda tonda Yawe",
   "Tous : Tonda tonda Yawe Nzambe na esengo",
   "Tonda, tonda tonda Yawe Nzambe",
   "Tonda, tonda, Mobikisi"
  ]
 },
 {
  "n": 105,
  "lang": "Lingala",
  "title": "TOSALA MOSALA NA YAWE",
  "lines": [
   "Solo : Tosala mosala na Yawe Nzambe",
   "Tous : Tosala mosala na Nzambe",
   "Mpo ete libonja ezali",
   "Kuna na lola tokosepela banso",
   "Soki tolongi mokili",
   "Solo : Tosala ah, tosala ah",
   "Tous : Mosala na Yawe tosala na esengo"
  ]
 },
 {
  "n": 106,
  "lang": "Lingala",
  "title": "TOTONDA YAWE BANSO O MOKILI",
  "lines": [
   "Solo : Totonda Yawe banso o mokili",
   "Tous : Ngolu na ye ezali na suka",
   "Atindeli biso sango malamu",
   "Oyo ya KCC",
   "Esikoli biso kati na mabe",
   "Solo totonda Yawe",
   "Solo : Totonda Yawe banso",
   "Tous : Totonda ye, totonda ye",
   "Banso o mokili, na manso asaleli biso",
   "Totonda ye banso o mokili"
  ]
 },
 {
  "n": 107,
  "lang": "Lingala",
  "title": "YAKANI NA NKOLO YAWE",
  "lines": [
   "Solo : Yakanu na Nkolo Yawe",
   "Tous : Ye Mokonzi na biso",
   "Ye akobikisa biso, tokosepela na ye",
   "Solo : O o mokil’oyo",
   "Tous : eza na tina",
   "Solo : Ona Yawe",
   "Tous : lobiko na solo",
   "ye akobikisa biso to sepela na ye eh",
   "ye akobikisa biso to sepela na ye."
  ]
 },
 {
  "n": 108,
  "lang": "Lingala",
  "title": "YAWE ABIANGI NGAI KATI NA LINGOMBA NA YE",
  "lines": [
   "Solo : Yawe abiangi ngai kati na Lingomba na ye",
   "Na salela ye ngai Nandimi :",
   "Tous : Se bongo nako salela ye",
   "Solo : Na yango",
   "Ata ba pasi pe koniokama",
   "Nakosalela ye kino suka",
   "Nakozonga lisusu sima te",
   "Solo : Nazongiseli ye nakoki koboya",
   "Osalaki ngai",
   "Ngai na ndimi",
   "Tous : Se bongo nako salela ye"
  ]
 },
 {
  "n": 109,
  "lang": "Lingala",
  "title": "YAWE YO MOKELI",
  "lines": [
   "Solo : Yawe yo Mokeli na biso",
   "Tous : Toye kopesa yo nkembo",
   "Toye kokumisa yo, na mokolo",
   "Mosanto pe na bulee",
   "Bulisa biso na nguya na yo",
   "Mpo to wumela na liloba na yo",
   "Bulisa biso na nguya na yo",
   "Mpo ete tozala elongo na yo",
   "Solo : O Yawe o likolo,",
   "Tous : kumisama sazolama",
   "Yamba kembo na biso, o Yawe o likolo",
   "Njambe na nguya, bolingo na ye ezali",
   "monene",
   "Toye kosanjola yo"
  ]
 },
 {
  "n": 110,
  "lang": "Lingala",
  "title": "YAWE NA LINGI KOSALELA YO",
  "lines": [
   "Solo : Yawe na lingi kosalela yo",
   "Tous : Moyini satana moniokoli",
   "Aniokoli ngai , mpasi mingi",
   "Soki yo Yawe te nde nazali te",
   "Na makasi na ngai, nakoka te",
   "Ngolu na yo nde esalisi ngai",
   "Natondi na tondi yo Yawe e",
   "Nguya na yo nde ebikisi ngai",
   "Oh oh esengo mingi",
   "Solo : Na manso osaleli ngai mbula mobimba",
   "Tous : Eh Yawe na tondi yo",
   "Ozali Mobateli na solo oh",
   "Yawe na pesa yo nini",
   "Ozali Mokengeli na solo",
   "Yawe na mipesi na yo"
  ]
 },
 {
  "n": 111,
  "lang": "Lingala",
  "title": "YO MONDIMI NA YAWE",
  "lines": [
   "Solo : Yo mondimi na Yawe",
   "Tous : Keba na yo elobi Nkolo Yawe",
   "Tokeba, tokeba mpo ete moto apenguisa",
   "biso te",
   "Tokeba, tokeba, tobatela boyengebene na",
   "biso",
   "Solo : Ata bolobi mutu azali",
   "Njambe",
   "yo mondimi",
   "Kondima yango te"
  ]
 },
 {
  "n": 112,
  "lang": "Lingala",
  "title": "YO MOPONAMI",
  "lines": [
   "Solo : Yo moponami na Yawe Mokelii",
   "Tous : Kumisaka Yawe Nzambe na yo",
   "Na bozui na yo, na misala na yo",
   "Motema na yo fongola yango",
   "Nakopesa mpe na kosalela ye",
   "Solo : Yo moponami",
   "Salela Yawe Nzambe",
   "Yo moponami",
   "Salela Yawe Nzambe",
   "Okopambuama, na bomoyi na yo",
   "Kuna na lola oko kembisama",
   "0."
  ]
 },
 {
  "n": 113,
  "lang": "Lingala",
  "title": "YO TATA NA YO MAMA",
  "lines": [
   "Solo : Yo Tata na yo mama",
   "Tous : Ozali kozela nini",
   "Yawe Nzambe azali kobengaka yo",
   "O yaka obikisama",
   "Solo : O o yaka",
   "O o yaka",
   "O o yaka na lobiko",
   "Yawe Nzambe azali kobengaka yo",
   "Oyaka obikisama"
  ]
 },
 {
  "n": 1,
  "lang": "Kikongo",
  "title": "BANKAKA BETI BANZILA KCC INKI",
  "lines": [
   "Solo : Bankaka beti banzila KCC inki",
   "Tous : Diau i Dilongi dia mbote dia mpa",
   "Solo : E tata vibidile e, vibidile e e e",
   "Tous : Yave wuna senda babo bana nunganza",
   "Solo : Bankaka beti banzila vo sielo inki",
   "Tous : Kiau i kisadi kia solua kua Yave",
   "Solo : Bankaka beti banzila bulungi inki",
   "Tous : Kiau i buloko bua nsuka kua nge"
  ]
 },
 {
  "n": 2,
  "lang": "Kikongo",
  "title": "BANKAKA BETI SADILA YAVE MU BIKOBA",
  "lines": [
   "Solo : Bankaka beti sadila Yave mu bikoba",
   "Tous : Kansi muna ntima mansueki mena",
   "Solo : Ngeye sambidi wo",
   "Tous : Wena minu kia luse",
   "Ngeye sambidi wo",
   "Wena minu kia luse",
   "Kansi muna ntima mansueki mena"
  ]
 },
 {
  "n": 3,
  "lang": "Kikongo",
  "title": "BANTU BANZA BAZOLELE KIMFUMU",
  "lines": [
   "Bantu banza bazolele kimfumu",
   "Kansi zulu kabana kota ko",
   "Bau babenzi vo bau i zimfumu",
   "Kansi Nzambi ka bazeyi ko",
   "Bua ntima a a",
   "Bua ntima, bua ntima",
   "Banduenga bazeyi ko",
   "Kansi beno luzeyi dio",
   "Mvula zingi va ntoto zeti noka",
   "Kansi mbongo kazi menene ko",
   "Ba bisadi ba vovele mu mbanza",
   "Kansi mbanza kayibazeyi ko",
   "Ba lukembi vo beno luma zoba",
   "Kansi Nzambi kakuluniengi ko",
   "Sambileno mu vuvu kia mazulu",
   "Kadi beno si luakota mo",
   "Bantu babo bazolele mo kota",
   "Bana kala nkadulu ya nsua",
   "Bonso beno luvengi dia lunungu",
   "Kalulendi mo kakudukua ko"
  ]
 },
 {
  "n": 4,
  "lang": "Kikongo",
  "title": "BENO LUETI ZIETA MU MINZANZA",
  "lines": [
   "Solo : Beno lueti zieta mu minzanza",
   "Tous : Mu diambu diami lueti tovuka",
   "Mpasi ye zinzungu ngiena yeno",
   "Mu samuna kimbangi kia Yavef",
   "Solo : Lusila kaka mono Yave vuvu",
   "Tous : Lusila kaka mono Yave minu",
   "Mu zimpasi ye nzungu ngiena yeno",
   "Kadi mono Nzambi’eno",
   "Mu zimpasi ye nzungu ngiena yeno",
   "Kadi mono Mvuluzi’eno",
   "Solo : Diambu diasikua ye dia nkinzi",
   "Tous : Lubanzila bunlongo bua Yave",
   "Lendo andi yina kala yeno",
   "mu samuna kimbangi kia Yave"
  ]
 },
 {
  "n": 5,
  "lang": "Kikongo",
  "title": "YAVE UVANANGA BANA",
  "lines": [
   "Solo : Bu ibazanga bonso Yave uvananga",
   "Tous : Bimbana mbana mu bundu edi dia nlongo Kiese kiami kialunga bu i talanga bio Yave Nzambi weti bio sakumuna",
   "Solo : Kalukakidilandi bimbana mbana ko",
   "Tous : Kadi kimfumu kia mazulu i kiau",
   "Beno mpe lufuanana ye bimbana mbana",
   "Siluakota mu nkembo a dizulu"
  ]
 },
 {
  "n": 6,
  "lang": "Kikongo",
  "title": "BUNDU DIA YAVE DIA NSILULU",
  "lines": [
   "Solo : Bundu dia Yave dia nsilulu",
   "Tous : Dina samuna kua makanda mamo",
   "Mambu ma Yave dizayikisa",
   "Bonso buena kedika",
   "Solo : Bonso buasonama mu nkanda wa moyo",
   "Tous : Eh KCC monekene",
   "Bonso buavovua kua mimbikudi",
   "Eh KCC monekene",
   "Solo : Dizolele, Dizolele unzolele",
   "Tous : Wenda dikila mameme mami",
   "Solo : Sielo, sielo unzolele",
   "Tous : Wenda dikila mameme mami",
   "Solo : Nlongi, nlongi unzolele",
   "Tous : Wenda dikila mameme mami"
  ]
 },
 {
  "n": 7,
  "lang": "Kikongo",
  "title": "BUNDU DIA ZINTUMUA TUSALENO O",
  "lines": [
   "Solo : Bundu dia zintumua tusaleno o",
   "Tous : Bundu dia zintumua tusaleno",
   "Tusaleno o babonsono o",
   "Nsendo waunene mu zulu dia Yave",
   "Tusaleno o nsendua tuna nsendua",
   "Solo : Tuvaneno babo mvuilu zeto kua Yave",
   "Tous : Pepa tuna pepa mu zulu dia Yave",
   "Vuanda tuna vuanda mu zulu dia Yave",
   "Denda tuna denda mu zulu dia Yave",
   "Nsendo wa moyo tuna tambula"
  ]
 },
 {
  "n": 8,
  "lang": "Kikongo",
  "title": "BUTUENA MOYO VAVA NZA YAYI",
  "lines": [
   "Solo : Bu tuena moyo vava nza yayi",
   "Tous : Tuna yimbila mu sika Yave",
   "Solo : Oh tuna yimbila",
   "Tous : Oh oh tuna yimbidila Yave",
   "Oh oh mu ntangu zazo",
   "Oh oh mayangi mana kala yeto",
   "Butuna luaka kuena Yave"
  ]
 },
 {
  "n": 9,
  "lang": "Kikongo",
  "title": "BUTU KONDOLO NZAYA NSUKULU A ZINGU KIETO",
  "lines": [
   "Solo : Butu kondolo zaya nsukulu a zingu kieto",
   "Tous : Tukaya meso tubanlongo",
   "Solo : Tukubama,",
   "Tous : Babonsono",
   "Solo : Tukubama,",
   "Tous : Tutoma luenga",
   "Butu kondolo zaya nsukulu a zingu kieto",
   "O tuluenga babonsono.",
   "Solo : O mayangi manakala kua bana nunga",
   "Tous : Tukaya meso, tubanlongo",
   "Kiadi kina kala vo losolo ku mbungulu",
   "Tukaya meso tubanlongo."
  ]
 },
 {
  "n": 10,
  "lang": "Kikongo",
  "title": "BUTU KUIZANGA NTANGU KA NTANGU",
  "lines": [
   "Solo : Butu kuizanga ntangu ka ntangu",
   "Tous : Mu nzo yayi ya nlongo ya Yave",
   "Tuena vuvu vo yandi kibeni",
   "Muna nzo katekele",
   "Solo : O yandi tekele",
   "Tous : O o yandi tekele",
   "Tuena vuvu vo yandi kibeni",
   "Muna nzo katekele"
  ]
 },
 {
  "n": 11,
  "lang": "Kikongo",
  "title": "BU UVUEZANGA NGE U MUANA NZAMBI",
  "lines": [
   "Bu uvuezanga nge u muana Nzambi",
   "Bu uvuezanga nge u muana Nzambi",
   "Bu uvuezanga nge u muana Nzambi",
   "Tumbu kia mvu ya mvu unabaka",
   "Bu ukelanga",
   "Bu ufinganga",
   "bu yazietelenge mu nzanza",
   "Solo : Bu yazietelenge mu nzanza",
   "Tous : Yawilu mbila ya mbokele",
   "Buna mono mpe yavutula",
   "Inga nzolele kusadila",
   "Solo : Lunda kimbangi kio",
   "Tous : Buwena muan’ami",
   "Ntangu zazonsono",
   "Zimeni lungulua",
   "Solo : Kani mu mpasi mpe",
   "Tous : Buwena muan’ami",
   "Ntangu zazonsono",
   "Zimeni lungulua",
   "Solo : Buyakala mu nzila mambi",
   "Tous : Kiazaya nlemvo a Yave ko",
   "Kansi buabu mbueni kiya kio",
   "Mvutudi matondo mu mamo"
  ]
 },
 {
  "n": 12,
  "lang": "Kikongo",
  "title": "BU WETI VAYIKA MU NZO A NZAMBI",
  "lines": [
   "Solo : Buweti vayika mu nzo a Nzambi",
   "Tous : Malulongolo si mazimbala",
   "Solo : O ngeye",
   "Tous : Nki biobio weti sala",
   "Nkia ndandu una tambula"
  ]
 },
 {
  "n": 13,
  "lang": "Kikongo",
  "title": "DANIELI MU LUKA A ZINKOSI",
  "lines": [
   "Solo : Danieli mu luka a zinkosi",
   "Tous : Zinkosi zalembana kundia",
   "Nzambi wakala ye Danieli",
   "Nzambi wena te ye buabu",
   "Solo : Nzambi wena teye buabu",
   "Tous : Nzambi ya banlongo babo",
   "Nzambi ya baleka minu",
   "Nzambi wena teye buabu",
   "Nzambi yavukisa Danieli",
   "Nzambi wena te ye buabu",
   "Nzambi yabokila Dizolele",
   "Nzambi wena te ye buabu",
   "Nzambi yisadisanga banlongo",
   "Nzambi wena te ye buabu"
  ]
 },
 {
  "n": 14,
  "lang": "Kikongo",
  "title": "DO NKUNDI AMI TOMA TALA",
  "lines": [
   "Solo : Do nkundi ami toma tala",
   "Tous : Katula keti keti",
   "Do katula wonga mu ntima aku",
   "Kala kibakala",
   "Solo : O Yave Nzambi intu muna mvita zazo",
   "Tous : O o yandi i Mvuluzi eto",
   "Tuleketi minu muna nsilulu andi vo",
   "Kana kutusisa ko"
  ]
 },
 {
  "n": 15,
  "lang": "Kikongo",
  "title": "E MFUMU NGE I NTO YA MOYO WA MVU YA MVU",
  "lines": [
   "Solo : E Mfumu nge i nto ya moyo wa mvu",
   "ya mvu",
   "Tous : Umpana nlangu’aku wamoyo ya nua",
   "Ye kina mona diaka mpuila ko",
   "Ye nzinunu a biabionso bia nza"
  ]
 },
 {
  "n": 16,
  "lang": "Kikongo",
  "title": "E MFUMU TUETI KUENDA MU SAMUNA",
  "lines": [
   "Solo : E Mfumu tueti kuenda mu samuna",
   "Tous : Nsamu wambote kua makanda mamonsono",
   "Tueti kuenda tueti lomba Mfumu do",
   "Kala yeto mu kintumua tutumunu",
   "Solo : Katulendi vanga diambu ko Mfumu",
   "Tous : Vo ngeye kondolo",
   "Solo : Mu ngeye mu suemi ngolo ye lulendo",
   "Tous : Tulenda sadila, ngeye kaka Mfumu i ngolo zeto.",
   "O o ngeye kaka Mfumu i ngolo zeto",
   "Solo : Vumusa bundu diaku u Mfumu do",
   "Tous : Mpasi vo tuna kala moyo mu Mpeve aku",
   "Tueti zola vo tua tungua kua nge Yave",
   "Mpasi vo tuna toma fuana mukusadila"
  ]
 },
 {
  "n": 17,
  "lang": "Kikongo",
  "title": "E YAVE NGE I NZAMBI ETO",
  "lines": [
   "Solo : E Yave nge i Nzambi eto o o",
   "Tous : Lumbu’eki tuizidi babonso",
   "Mu kembisa ngeye Nzambi’eto o o",
   "O Yave utu sadisa babo",
   "O Yave bika wasikua"
  ]
 },
 {
  "n": 18,
  "lang": "Kikongo",
  "title": "E NKUNDI TUENDA KU NZO A NZAMBI",
  "lines": [
   "Solo : E nkundi tuenda ku nzo a Nzambi",
   "Tous : Tuatambula mambu ma Yave",
   "Mambu ma Yave madia ma moyo",
   "Mavelelesa ntima mieto",
   "Mambu ma yave madia ma moyo",
   "Mavelelesa ntima mieto."
  ]
 },
 {
  "n": 19,
  "lang": "Kikongo",
  "title": "E YAVE NZAMBI UNDOLUKA KUAMI",
  "lines": [
   "Solo : E Yave Nzambi undoluka kuami",
   "Tous : Mu mamonso maya volele",
   "E Yava Nzambi undoluka kuami",
   "Bu nzolele kusadila",
   "Solo : Ya sumuka nguilu mboka kua nge",
   "Tous : Se nzolele kidi yasukulua",
   "Mu mambi mamo mayateka vanga",
   "Se nzolele kusadila"
  ]
 },
 {
  "n": 20,
  "lang": "Kikongo",
  "title": "E YAVE NZAMBI A MVU YA MVU",
  "lines": [
   "Solo : E Yave Nzambi a mvu ya mvu",
   "Tous : Wavanga mpe biabionsono",
   "Wanlongo ye wanlongo kena",
   "Kasakununuanga kutu ko",
   "Solo : Beto mpe tunzomina bulongo",
   "Tous : Kadi Yave wanlongo kena",
   "Bakunsadilanga mpe banlongo",
   "Bonso yandi wanlongo kena",
   "Solo : E Yave Nzambi a Mpungu",
   "Tous : Yandi kaka fueni zitusua",
   "Yandi kaka fueti sambulua",
   "Kasakununuanga kutu ko."
  ]
 },
 {
  "n": 21,
  "lang": "Kikongo",
  "title": "E ZOLA E ZOLA E ZOLA",
  "lines": [
   "Solo : E zola, zola, zola",
   "Tous : E zola, zola, zola",
   "E zola,zola, zola",
   "Nate tuna monana",
   "Solo : E Yave unkudikila zola",
   "Tous : E Yave unkudikila zola",
   "E Yave unkudikila zola",
   "Nateye tuna monana"
  ]
 },
 {
  "n": 22,
  "lang": "Kikongo",
  "title": "FIKAMBA KAMBA KUKALANI WONGA KO",
  "lines": [
   "Solo : Fikamba kamba kukalani wonga ko",
   "Tous : Kadi nzolakani a Yave",
   "I mukuluvana kimfumu",
   "I mu diodio butomene mu vibidila",
   "Mu mamonsono malu lunguluanga",
   "Solo : Lolo i luzolo lua Nzambi eto",
   "Tous : Lolo i luzolo lua Mfumu Yave",
   "I luzolo luena lua Nzambi eto",
   "I mukutu vana kimfumu."
  ]
 },
 {
  "n": 23,
  "lang": "Kikongo",
  "title": "IBOKANGA NTANGU ZAZO MONO NZAMBI ENO",
  "lines": [
   "Solo : Ibokanga ntangu zazo mono Nzambi’eno",
   "Tous : Masumu vonda ma vondanga",
   "Kiadi ye nkenda mu tala miela mieti fua",
   "Luvengama mu mambi",
   "Solo : Lutina nsumukunu zazonsono",
   "Tous : Masumu manatanga ku mbungulu",
   "Luwa ndinga ya mono Nzambi eno",
   "Masumu manatanga ku mbungulu",
   "Lutina mo ntangu zazo"
  ]
 },
 {
  "n": 24,
  "lang": "Kikongo",
  "title": "I NSISI BENI MU BUA MU MOKO MA YAVE NZAMBI",
  "lines": [
   "Solo : I nsisi beni mu bua mu moko ma Yave",
   "Nzambi",
   "Tous : Kadi buena nkinzi mu vibidila",
   "Mu mpasi zazonsono ye ntotolo",
   "Mono siyavanga luzolo lua Nzambi ami",
   "Mpasi yatambula moyo a mvu ya mvu",
   "Solo : Kadi buena nkinzi mu vibidila",
   "Tous : Mu mpasi zazonsono ye ntotolo",
   "Mono siyavanga luzolo lua Nzambi ami",
   "Mpasi yatambula moyo a mvu ya mvu"
  ]
 },
 {
  "n": 25,
  "lang": "Kikongo",
  "title": "I YAVE NZAMBI MVUNGI WAKEDIKA",
  "lines": [
   "Solo : I Yave Nzambi Mvungi wakedika",
   "Tous : I Nzambi a nlongo wena walembama",
   "Mavanga mandi mena ma mpulusu",
   "Yave Nzambi i Mvungi ami wabiza",
   "Mayindu mandi mpulusu a muel’ami",
   "Yave Nzambi i Mvungi ami",
   "Solo : Mu bundu dia Yave nani i Mvungi’ami",
   "Tous : Yave Nzambi Mvangi ami i Mvungi’ami",
   "Mayindu mandi mpulusu a muel’ami",
   "Yave Nzambi i Mfumu’ami wabiza",
   "Mayindu mandi mpulusu a muel’ami",
   "Yave Nzambi i Mfumu’ami",
   "Solo : Mu kamba diambi nlongi i satana",
   "Tous : I mbeni yambi wazala bunkita",
   "Mavanga mandi nzila ya mbungulu",
   "Yave Nzambi i Mvungi’ami"
  ]
 },
 {
  "n": 26,
  "lang": "Kikongo",
  "title": "KABU DIA BALEKA MINU",
  "lines": [
   "Solo : Kabu dia baleka minu",
   "Tous : Luvana fulu kieno kua Yave",
   "Yandi sika sala mu beno",
   "Lubombidila kua",
   "Yandi",
   "Kadi wena Se kua beno",
   "Solo : E bundu dia KCC",
   "Tous : Luzola dio ye sadisanga",
   "Mono yalu solele musadisanga",
   "Bundu dia KCC ntangu zazo"
  ]
 },
 {
  "n": 27,
  "lang": "Kikongo",
  "title": "KALA MAYINDU MU NLEMVO YAVE WENA KUA NGE",
  "lines": [
   "Solo : Kala mayindu mu nlemvo a Yave wena",
   "kua nge",
   "Tous : Ngeye wameni solua kua Yave",
   "Kala mayindu mu nlemvo a Yave wena",
   "kua nge Buka zolele kuvana moyo",
   "Solo : Mambu ma Nzambi i kia kua bantu",
   "Tous : Matuaveno kua Yave mu nlemvo",
   "Kedika kiandi tusimba nade",
   "Mpasi tuatoma mu miela mieto"
  ]
 },
 {
  "n": 28,
  "lang": "Kikongo",
  "title": "KIA TEKA ZAYA MASUMU KO",
  "lines": [
   "Kiateka zaya masumu ko",
   "Eh Tata utubanzila (bis)",
   "Mu nzila masumu ya dietingi",
   "Kiazaya kutu nzila moyo ko",
   "Kiateka zaya ngeye Yave ko",
   "O o Tata utubanzila"
  ]
 },
 {
  "n": 29,
  "lang": "Kikongo",
  "title": "KITUKA MU NTANGU MALONGI MAMOYO",
  "lines": [
   "Solo : Kituka mu ntangu malongi mamoyo",
   "Tous : Tufueti kukikitula",
   "Solo : Bukafueni nzitusu a minzitusu",
   "Tous : Tufueti kukikitula",
   "Mu visikisa kedika kia Nzambi eto",
   "Yandi watulendo ye mandi matulendo",
   "Mu visikisa mo tukikitula"
  ]
 },
 {
  "n": 30,
  "lang": "Kikongo",
  "title": "KOKO KUA YAVE",
  "lines": [
   "Solo : Koko kua Yave kuna kala va wena",
   "Tous : Koko kua Yave kuna kala",
   "Koko kua Yave kuna kala va wena",
   "Koko kua Yave kuena va ngeye",
   "Solo : Ntondele kua ngeye Nzambi",
   "Tous : Ntondele Mpungu Tulendo",
   "Ntondele mu mambote mamonso",
   "Matukidi mu koko kua Yave"
  ]
 },
 {
  "n": 31,
  "lang": "Kikongo",
  "title": "KUBAMA MU SOLULA YE YAVE",
  "lines": [
   "Solo : Kubama mu solula ye Yave",
   "Tous : Kadi Yandi Nzambi eto (bis)",
   "Solo : Yave Nzambi kua ngeye tuizidi",
   "Tous : Yambudila masumu meto mamo",
   "Sakumuna beto babo",
   "Utuvuika bia nduanina"
  ]
 },
 {
  "n": 32,
  "lang": "Kikongo",
  "title": "KUNA ZULU TUETI VINGULUA",
  "lines": [
   "Solo : Kuna zulu tueti vingulua",
   "Tous : Kadi beto masoda ma Yave",
   "Tueti nuananga mvita va nza",
   "Kuna zulu tueti vingulua",
   "Vo tunungini mvita va ntoto",
   "Situa bombua mu zulu",
   "Solo : O kuna zulu",
   "O kiese, kiese, o kiese",
   "Situa mona mpe nzitusu a Yave",
   "Eh, eh, kiese, kiese, kiese."
  ]
 },
 {
  "n": 33,
  "lang": "Kikongo",
  "title": "KUSADILANI NKUMBU A YAVE MU NKATU KO",
  "lines": [
   "Solo : Kusadilani nkumbu a Yave mu nkatu ko",
   "Tous : Kadi Yave Nzambi",
   "Solo : Kana nungisa muntu ko",
   "Tous : Kusadilanga, nkumbu andi mu nkatu"
  ]
 },
 {
  "n": 34,
  "lang": "Kikongo",
  "title": "LUBANLONGO BABO",
  "lines": [
   "Lubanlongo babo",
   "Badimbula minu",
   "Mfumu una kuba tuba",
   "Muna una kuba tuba",
   "Muna zanga dia tiya",
   "Luba nlongo babo",
   "Lukuikama kua Se",
   "Lukutu kotisa kua Se"
  ]
 },
 {
  "n": 35,
  "lang": "Kikongo",
  "title": "LUBATATA LUYANGALALA",
  "lines": [
   "Solo : Lubatata luyangalala",
   "Tous : Yave Nzambi utuzolele",
   "Solo : A a a kiese",
   "Tous : A a a a kiese",
   "A a a a",
   "A a a a kiese",
   "Yave Nzambi utuzolele"
  ]
 },
 {
  "n": 36,
  "lang": "Kikongo",
  "title": "LUENDA MUANGINISA NSAMU WAMBOTE",
  "lines": [
   "Solo : Luenda muanginisa nsamu wambote",
   "Tous : Kua makanda mamonso mu nza",
   "Yave kaluyonzikisa, kaluvilakana ko",
   "Solo : Ma lumueni mu zindozi lukuikila mo",
   "Tous : Kadi Mfumu watelele wo e e",
   "Yave kaluyonzikisa, kaluvilakana ko"
  ]
 },
 {
  "n": 37,
  "lang": "Kikongo",
  "title": "LUIZA LUAKOTA LUIZA LUAZIBULA",
  "lines": [
   "Luiza lua kota luiza luazibula",
   "Muelo wazulu wena wazibuka",
   "Ngina luvana nkembo ye nzitusu",
   "Moyo ye nsendo mu zulu mvu ya mvu",
   "Yave mu zulu weti kutuvingila",
   "Mu ngunda zingi tueti sambila",
   "Tombe va ntoto kieti luta bua",
   "Yave Nzambi wiza tukitula"
  ]
 },
 {
  "n": 38,
  "lang": "Kikongo",
  "title": "LUIZENO, LUIZENO",
  "lines": [
   "Solo : Luizeno,",
   "Tous : Luizeno mu kiese",
   "Luizeno lua mona nkembo wa",
   "Yave",
   "Luizeno mu kiese",
   "Solo : Yangalala ,",
   "Tous : yangalala",
   "Yangalala mu Mfumu",
   "Bukameni kutu luakisa mu nkembo",
   "Wa bana ba yenge",
   "Solo : Yimbila, yimbila",
   "Solo : Yimbila mu kiese",
   "Tous : Yimbila mumona nkembo wa Yave",
   "Yimbila mu kiese",
   "Solo : Tondeno, tondeno",
   "Tous : Tu tondeno Yave",
   "Tondeno butu meni luakusua mu nkembo",
   "Tondeno mu kiese"
  ]
 },
 {
  "n": 39,
  "lang": "Kikongo",
  "title": "LUKALA BAVEDILA",
  "lines": [
   "Solo : Lukala bavedila a a a",
   "Tous : Mono Nzambi eno ngiena wavedila",
   "O bana bami lukivedisanga",
   "O bana bami lutina mambi",
   "Solo : Luzomina babo",
   "Tous : Bunlongo bua Yave",
   "Solo : Luzomina babo",
   "Tous : Bunlongo bua Yave",
   "E e bundu dia KCC",
   "Lukala bavedila"
  ]
 },
 {
  "n": 40,
  "lang": "Kikongo",
  "title": "LULENDO LUA YAVE LUETI MONIKA",
  "lines": [
   "Solo : Lulendo lua Yave lueti monika",
   "Tous : Lulendo lua Yave lueti monika",
   "Mu mavanga mandi mamanene",
   "Lulendo lua Yave lueti monika",
   "Mu mavanga mandi mamanene"
  ]
 },
 {
  "n": 41,
  "lang": "Kikongo",
  "title": "LULENDO LUA YAVE LUETI MONIKA KUA BANTU",
  "lines": [
   "Lulendo lua Yave lueti monika",
   "Kua bantu bena ntemo’andi",
   "Vungua ye sadusua bonso mameme",
   "Minkembo ku zulu tuena mio",
   "E e e tusambila",
   "Lumbu biabionso tusambila",
   "Musonga zola ye minu kia lunga",
   "Kua Yave Nzambi",
   "Lumbu biabionso tusambila"
  ]
 },
 {
  "n": 42,
  "lang": "Kikongo",
  "title": "LUMBU BIA BIONSO TUKUBAMANGA MU MFUMU",
  "lines": [
   "Solo : Lumbu biabionso tukubamanga",
   "mu Mfumu",
   "Tous : Kadi nsendo a masumu i lufua",
   "Muivi va nza kazayikisanga lumbu ko",
   "Lufua mpe kazayikisanga ko",
   "Solo : E mama simbidila nlemvo uwatambudi kua Yave",
   "Tous : Nlemvo a Yave Nzambi wansimbididi",
   "Mpasi yabaka fulu mu zulu diandi",
   "Kadi lumbu kia lufua luami kizeyi kio ko",
   "Solo : Nlele wandombe masumu meto zimpangi",
   "Tous : Meso meto mafukua menina",
   "Mu tombe kia nza tudiatilanga kedika",
   "Tala nlemvo a Yave wena va ngeye"
  ]
 },
 {
  "n": 43,
  "lang": "Kikongo",
  "title": "LUMBU KA LUMBU BUTUENA MOYO",
  "lines": [
   "Solo : Lumbu kalumbu butuena moyo",
   "Tous : Toma yimbila toma yangalala",
   "Lumbu kalumbu butuena moyo",
   "Tomba yimbila toma yangalala",
   "Solo : Tuyimbila",
   "Tous : Tutoma yimbila",
   "Lumbu ka lumbu butuena moyo",
   "Tutoma yimbila toma yangalala"
  ]
 },
 {
  "n": 44,
  "lang": "Kikongo",
  "title": "LUMBU KIA NSUKA LUFUA VINGILANGA",
  "lines": [
   "Lumbu kia nsuka tueti vingilanga",
   "Mu diodio babo tutoma kubama",
   "Kiau kina kuiza kaka bonso muivi",
   "Mu diodio tuki kubamana babo",
   "Muna zulu dio: Zulu dio diya nsilulu",
   "Tuna kotusua : Kotusua, tuna kotusua",
   "Tuna yimbila : Yimbila, tuna yimbila,",
   "Tuna kembela, kembela tuna kembela"
  ]
 },
 {
  "n": 45,
  "lang": "Kikongo",
  "title": "LUSALA SALU MU BUNDU DIA YAVE",
  "lines": [
   "Solo : Lusala salu mu bundu dia Yave",
   "Tous : Mu kedika ye mu lunungu",
   "Mpasi mpeve Yave ya sikila mu beno",
   "Ye tambula nsendo wa vedila",
   "Mu moko mandi muna kayengele",
   "Solo : O o luzaya vo",
   "Tous : Luzaya vo",
   "Minu kio kikondolo mavanga",
   "O minu kiokio kiafua kiena",
   "Solo : Mu bundu diadi banlongo",
   "Tous : Luzaya vo sala ye sambila",
   "Kadi beno luena la solua",
   "Mu sadisa bundu dia KCC",
   "Nsendo eno muna kayengele"
  ]
 },
 {
  "n": 46,
  "lang": "Kikongo",
  "title": "LUTELAMA BANLONGO BA YAVE",
  "lines": [
   "Solo : Lutelama",
   "Tous : banlongo ba Yave",
   "I ntinu a mintinu",
   "Lusimba mu koko kua ngolo",
   "Dimbu kia mpulusu",
   "Solo : Lunata kedika kia Yave",
   "Tous : Mu zinzila ye mu zinzo",
   "Lusonga kua bantu babonso",
   "Vo Yave i Mvuluzi",
   "Solo : Yinduleti bilumbu biweka",
   "Tous : Bio bisidi kuseyi bio ko",
   "Toma yindula lumbu kia mbazi",
   "Nanga kuna luaka kio ko"
  ]
 },
 {
  "n": 47,
  "lang": "Kikongo",
  "title": "LUVANA MBUNDULU A NTUADI",
  "lines": [
   "Luvana mbundulu a ntuadi",
   "Luvana kua Mfumu Nzambi eto mu kiese"
  ]
 },
 {
  "n": 48,
  "lang": "Kikongo",
  "title": "LUZIMPANGI LUENDA MU YENGE",
  "lines": [
   "Luzimpangi luenda mu yenge (sala mu yenge)",
   "Luzimpangi luende mu yenge (sala mu yenge)",
   "O yeno wawu (oyeto)",
   "Ingiendeno (n",
   "Giendeto)",
   "Kua zimpangi luvana biyenge",
   "Kua zimpangi luvana biyenge",
   "Yonso wawu (oyeto) wawu"
  ]
 },
 {
  "n": 49,
  "lang": "Kikongo",
  "title": "LUZIMPANGI MU DIBUNDU",
  "lines": [
   "Luzimpangi mu Dibundu",
   "Nzolele lua zaya vo",
   "Yave nsilulu katu sila",
   "Tontua tuna tontuanga",
   "Ntontolo kuiza zeti kuiza",
   "Mpasi Nzambi kakembusua",
   "Yave nsilulu katu sila",
   "Ndungunu mu lusambulu",
   "Ngeye mpangi ukifimpa",
   "Volenda nunga mu ntontolo",
   "Bunlongo buaku i ngudi a diambu",
   "Mu lusambulu lua nlongo"
  ]
 },
 {
  "n": 50,
  "lang": "Kikongo",
  "title": "MALONGI MA YAVE TUWILU MO",
  "lines": [
   "Solo : Malongi ma Yave tuwilu mo",
   "Tous : Tutondele kua ngeye Yave",
   "Kisidi kua beto mu sadila mo nate nsukulu"
  ]
 },
 {
  "n": 51,
  "lang": "Kikongo",
  "title": "MAMBU MA YAVE MAMOYO MA KIA",
  "lines": [
   "Solo : Mambu ma Yave ma moyo ma kia",
   "Tous : Makiesese ntima ami",
   "Solo : Mu nzo a Yave Yave mu tukanga kia",
   "Tous : Kua mambu ma Nzambi ma moyo ma kia ma kiesese ntima ami",
   "Solo : Mambu ma Yave tukuikila mo",
   "Tous : Ma tuasanga ku mpulusu"
  ]
 },
 {
  "n": 52,
  "lang": "Kikongo",
  "title": "MAMBU MA YAVE NZAMBI I MOYO YE KEDIKA",
  "lines": [
   "Solo : Mambu ma Yave Nzambi i moyo",
   "ye kedika",
   "Tous : Wonso wena kitantu kua kedika",
   "Belele mpulusu a muel’andi wawo",
   "Kadi mambu ma Yave i kedika",
   "Solo : Kedika kia Nzambi eto vava nza",
   "Tous : I nzila mpulusu kua babonsono",
   "Mu bundu dia KCC kedika",
   "Ka muntu ko ulenda kio kakidila",
   "Solo : Mu vunza kedika satana utombanga",
   "Tous : Ntima wena ye mpuila mia nzitusu",
   "Mizininanga mpe fulu bia zangama",
   "Mu vunzikisa mpeve ye kedika"
  ]
 },
 {
  "n": 53,
  "lang": "Kikongo",
  "title": "MAMEME MA YAVE I TOMBANGA",
  "lines": [
   "Mameme ma Yave",
   "I kuenda tombingi",
   "E e zimpangi zami luiza lua ntombisa",
   "Mameme ma mpembe",
   "Kulubakala",
   "E e binkombo nkombo kulu moso",
   "Kizolele ko mameme",
   "Vo mazimbala ye mamonsono",
   "Mafueti vulusua"
  ]
 },
 {
  "n": 54,
  "lang": "Kikongo",
  "title": "MATONDO KUA YAVE NZAMBI",
  "lines": [
   "Solo : Matondo kua Yave Nzambi",
   "Tous : Yandi watukebele mu mvu wa mvimba",
   "Tuvutula matondo kua Nzambi a moyo",
   "Mu kedika yandi i Mvani a moyo",
   "Solo : Tuvutula matondo",
   "Tous : Kua Nzambi eto yandi nsemia biabio",
   "O Nzambi eto bika tua nzitisa"
  ]
 },
 {
  "n": 55,
  "lang": "Kikongo",
  "title": "MATONDO METO",
  "lines": [
   "Solo : Matondo meto",
   "Tous : Matondo tueti vana kua Yave Nzambi",
   "Matondo"
  ]
 },
 {
  "n": 56,
  "lang": "Kikongo",
  "title": "MATONDO TUETI VUTULA",
  "lines": [
   "Solo : Matondo tueti vutula",
   "Tous : Kua Nzambi a moyo",
   "Mu nlemvo katusonganga",
   "Ntangu zazonsono"
  ]
 },
 {
  "n": 57,
  "lang": "Kikongo",
  "title": "MATONDO TUVANA KUA YAVE NZAMBI ETO",
  "lines": [
   "Solo : Matondo tuvana kua Yave Nzambi eto",
   "Tous : Babonso bu tuakidi vava nza",
   "Solo : Matondo o o",
   "Tous : Matondo o o kuena Yave Nzambi eto",
   "Matondo o kuena Mvuluzi a nza",
   "Matondo o kua Nzambi ya nlongo",
   "Matondo o tusika Mpungu tulendo"
  ]
 },
 {
  "n": 58,
  "lang": "Kikongo",
  "title": "MBANDU VIOKA ZI VIOKANGA",
  "lines": [
   "Luzimpangi lutomazaya mbandu zazonso",
   "Zazo vioka ziviokanga",
   "Kansi beto Yave Nzambi weti kutu luengisa",
   "Tala bonso butu fueti diatila",
   "Luiza, luiza babonsono",
   "Luiza, luiza babonsono",
   "Satana wameni telema vava nza",
   "kansi beto vo tuzolele kumbedisa vava nza",
   "Ngolo zeto mu lusambulu zena"
  ]
 },
 {
  "n": 59,
  "lang": "Kikongo",
  "title": "MBANZA BUNKITA",
  "lines": [
   "Solo : Mbanza bunkita yakedi sadilanga",
   "Tous : I nza ya masumu i kundanga satana",
   "Muel’ami wa fua buya kondua nsadisi",
   "Kansi mu nlemvo a Yave yabala mpulusu",
   "Solo : Mu kuma kia nani sielo biafilua vava nza",
   "Tous : Yave Nzambi eto wafila sielo miandi",
   "Mukuma kiami mpasi vo ya vulusua",
   "O Yave zolele vo ya sisa masumu",
   "O Yandi zolele vo mono ya vulusua",
   "Solo : Bu yayekula zingu kiami kua Yave",
   "Tous : Lumbu biabionsono nzomono",
   "ye nkuamusu",
   "Mbanza bunkita kayeti kunzola ko",
   "Ye kimpala kia satana bu yaviluka"
  ]
 },
 {
  "n": 60,
  "lang": "Kikongo",
  "title": "MBANZA YO YANLONGO YA YAVE",
  "lines": [
   "Mbanza yo ya nlongo ya Yave",
   "Kamu kienzulanga ntangu vo ngonda ko",
   "Kansi ntemo a Yave ye nzitusu andi mpe",
   "Bikienzulanga mbanza yoyo",
   "Babonsono banungini mu nza yayi",
   "Bana kotusua mu mbanza yoyo",
   "Yave Nzambi Mvangi a biabionsono",
   "Una kotisa babonsono, banungini,",
   "Mu mvita zau vava nza",
   "Oh mu mbanza vundanga",
   "Babonsono banungini mu nza yayi",
   "Bana kotusua mu mbanza yoyo"
  ]
 },
 {
  "n": 61,
  "lang": "Kikongo",
  "title": "MBENI A MUNTU I MUNTU MU MAMO",
  "lines": [
   "Solo : Mbeni a muntu i muntu mu mamo",
   "Tous : Ngeye wameni nunga mu sisa nza yayi",
   "Sala kimfuzi kulandi muntu ko",
   "Tala kuntuala tomba wasikila",
   "Solo : Ngeye telamene",
   "Tous : Siama mu nsamu a Yave",
   "Mpasi walembua bua mu zimpukumunu",
   "Buwa tomene nitu simba Mvuluzi",
   "Solo : Mambu ma Yave nkele kua satana",
   "Tous : Nduenga za Yave Nzambi bu zeti sadisa",
   "Vova kedika mu katula mambi",
   "Yave Nzambi eto una kunungisa"
  ]
 },
 {
  "n": 62,
  "lang": "Kikongo",
  "title": "MBILA YA NLEMVO YETI BOKA VO",
  "lines": [
   "Solo : Mbila ya nlemvo yeti boka vo",
   "Tous : Luenda luakamba nsamu kua babo",
   "Solo : O luenda luenda",
   "Tous : Luenda luenda mu kiese",
   "Lubasonga nsamu wa Yave Nzambi eto"
  ]
 },
 {
  "n": 63,
  "lang": "Kikongo",
  "title": "MBOKONO YA NLONGO YILENDA KUTUVANA MOYO",
  "lines": [
   "Mbokono ya nlongo yilenda kutuvana moyo",
   "Tutanga mu masonukua",
   "Nsamu wambote watufidisa Mfumu Yave",
   "Ufueni kutu vulusa",
   "Engua kiese mu landa Yave Mvuluzi",
   "Mfumu a yenge Nzambi a nkenda",
   "Tuena moyo mu mambu mandi mvu ya mvu",
   "Vo tuwanga ye sadilanga mo"
  ]
 },
 {
  "n": 64,
  "lang": "Kikongo",
  "title": "MBONGO YA MOYO YA KUNUA MU NKUMBU A YAVE",
  "lines": [
   "Mbongo ya moyo ya kunua mu nkumbu a Yave",
   "Mvuilu ya Nzambi ya ntalu ya nsilulu",
   "I sikilanga mvu ya mvu mu yinza diandi",
   "Ka muntu mosi ko vuidi mbongo yoyo",
   "Lubana ba Nzambi Se lutoma zaya vo",
   "Muntu ukunanga Nzambi umenisanga",
   "Muntu ulekanga Nzambi ka lekanga ko",
   "Tukembisa Nzambi Se nsemi’ a biabionsono",
   "Yandi uvumusannga mu bantu va nza",
   "Tombanga nkembo wa Nzambi nge ukunanga",
   "Sisa luyanu mu ntima ye mu zimpova",
   "Umenisanga viokele ye ukunanga",
   "I Yave Nzambi dia mpulusu",
   "Zitisa mbongo ya mena yena mu yinza",
   "Kala kifuani kia Yave watomisa yo",
   "Mu mamonsono talanga zizi kia Nzambi",
   "Wasema mbongo yoyo vava nza"
  ]
 },
 {
  "n": 65,
  "lang": "Kikongo",
  "title": "MBUETETE YETI ZIETA",
  "lines": [
   "Solo : Mbuetete yeti zieta",
   "Tous : Kuna Node eh eh",
   "Solo : Mbuetete yeti zieta",
   "Tous : Kuna Sude eh eh",
   "Munkiama yizietilanga mulubula basolua bana kota mu zulu dia Yave",
   "Munkiama yizietilanga mu kienzula basolua bana kota mu zulu dia Yave"
  ]
 },
 {
  "n": 66,
  "lang": "Kikongo",
  "title": "MFIMPIDI ZIMPOVA ZAMI",
  "lines": [
   "Mfimpidi zimpova zami",
   "Mawonso ivovanga mambi",
   "Ntim’ami kawavedila ko",
   "Mawonso ibanzanga mambi",
   "Nkadulu zami kua bantu zambi",
   "Mavanga mawonsono mambi",
   "Mbanzidi mpasi za sielo biaku",
   "Mfukamene va ntadisi’aku",
   "Ngeye Yave Nzambi ami",
   "Nzolele funda kua nge",
   "Nkanu mia mi Mfumu do undoluka"
  ]
 },
 {
  "n": 67,
  "lang": "Kikongo",
  "title": "MFUMU YAVE UNTUAMININA",
  "lines": [
   "Mu mavanga ma mbote kua beto kumbedilanga",
   "Kansi nkuikumunu bu mvueti yo",
   "E e lusambila",
   "Mfumu Yave untuaminina",
   "Mfumu untuaminina",
   "Vo kondolo ngeye kibedisa ko",
   "Mfumu Yave untuaminina"
  ]
 },
 {
  "n": 68,
  "lang": "Kikongo",
  "title": "MFUMU WAVOVA LUENDA DIKILA",
  "lines": [
   "Solo : Mfumu wavova luenda dikila ma meme",
   "Tous : Mameme mami mamonsono",
   "Luenda lua bakamba nsamu wo",
   "Mpasi babonso baviluka",
   "Solo : O o luenda luenda",
   "Tous : Luenda luenda luabalonga",
   "Luenda lua bakamba nsamu wo",
   "Mpasi babonso baviluka"
  ]
 },
 {
  "n": 69,
  "lang": "Kikongo",
  "title": "MONO I MUNTU WAMBI VA NZA",
  "lines": [
   "Solo : Mono i muntu wambi va nza",
   "Tous : Yi vuezisanga Yave",
   "Mu kuma kia masumu mami",
   "Yandi uvuezuanga",
   "Solo : Uvuezunga mu masumu mami",
   "uvuezuanga Yave",
   "Tous : Yave Nzambi i vuezisanga",
   "Mu masumu mami ivolanga"
  ]
 },
 {
  "n": 70,
  "lang": "Kikongo",
  "title": "MONO MU KCC NGINA FUILA",
  "lines": [
   "Solo : E yaya e e e yaya",
   "Mu KCC ngina fuila",
   "E yaya (bis)",
   "Tous : E yaya e e e yaya",
   "Mu KCC ngina fuila"
  ]
 },
 {
  "n": 71,
  "lang": "Kikongo",
  "title": "MONO NGIETI FIMPA MAVANGA MAMI",
  "lines": [
   "Solo : Mono ngieti fimpa mavanga mami",
   "Tous : Nzila zazo zambi yadiatidi zo",
   "Lelo mbueni nlemvo wa Yave Nzambi",
   "Kin’ami wo sisa ko",
   "Solo : Nlemvo wo buka nsongele wo",
   "Tous : Watuka kua Yave Nzambi ami",
   "Nkama zintotolo ngina nuana kaka",
   "Mpasi yabaka nsendo mu zulu"
  ]
 },
 {
  "n": 72,
  "lang": "Kikongo",
  "title": "MONO YAKALA MU TOMBE KIA MAMBI",
  "lines": [
   "Solo : Mono yakala mu tombe kia mambi",
   "Tous : Kiatekazaya nzila moyo ko",
   "Kiatekazaya Yave Nzambi ko",
   "Mu nlemvo buabu i kunsoludi",
   "Solo : Nzolele kuami yalandanga Yave",
   "Tous : Nzolele ya vulusua",
   "Solo : O Matondo kua Yave Nzambi eto",
   "Tous : O Matondo kua Yave Mvuluzi",
   "O Matondo mu zola kua Yave",
   "Mu nlemvo ewu wuyatambudi",
   "Solo : Nzolele tondanga Yave Nzambi ami",
   "Tous : Nzolele kunzitisa",
   "Solo : O Mayangi vo ngina fuanusua",
   "Tous : O Mayangi vo ngina nungusua",
   "O Mayangi vo ngina sikila",
   "Mu bundu diadi dianlongo dia KCC",
   "Solo : Nzolele kuami yasadila Yave",
   "Tous : Nzolele ya sendua mpe"
  ]
 },
 {
  "n": 73,
  "lang": "Kikongo",
  "title": "MONO YASADIDINGI SATANA",
  "lines": [
   "Solo : Mono yasadidingi satana",
   "Tous : Buabu mbueni nzil’ami",
   "Ya mpulusu ya muel’ami",
   "Solo : Kina vutuka diaka",
   "Tous : Mu masumu ko",
   "Solo : Kina vutuka diaka",
   "Tous : Mu masumu ko",
   "E Mfumu, masumu mami mamo",
   "Yave Nzambi vidingisa"
  ]
 },
 {
  "n": 74,
  "lang": "Kikongo",
  "title": "MONO YA SOLUA MU KALA KUSUA KIA YAVE",
  "lines": [
   "Mono yasolua mu kala kusua kia Yave",
   "Yayekula muel’ami mu mambi",
   "Yave Nzambi wambokele",
   "Mpasi wavukisa muel’aku",
   "Toma diata mu nza yayi",
   "Nkadi a mpemba buambi kayikidi",
   "Toma diata mu nduenga za Yave",
   "Mpasi wavukisa muel’aku"
  ]
 },
 {
  "n": 75,
  "lang": "Kikongo",
  "title": "MONO YA TELEMENE",
  "lines": [
   "Solo : Mono ya telemene mu nuana mvita va",
   "nza",
   "Tous : Ntelemene mu nungisa Yave Nzambi",
   "ami",
   "Mu nzungu ye mu mpasi zami zazonso",
   "Yikiyekole mufua mu diambu dia kedika :",
   "Solo : Yakala dikoka ya telemene",
   "Tous : Kedika kilendi kunsisa ko",
   "O o kedika kilendi kunsisa ko",
   "Solo : Meso mafua matemone",
   "Tous : Kedika kilendi kunsisa ko"
  ]
 },
 {
  "n": 76,
  "lang": "Kikongo",
  "title": "MONO YA ZENGA MU SADILA DIBUNDU",
  "lines": [
   "Solo : Mono ya zenga mu sadila dibundu",
   "Tous : Mono ya zenga mu sadila dibundu",
   "Kilendi ko mu vutuka manima",
   "Kilendi ko mu vutuka manima",
   "Solo : Nsilulu ngiena mu kota mu dizulu",
   "Tous : Nsilulu ngiena mu kota mu dizulu",
   "Kilendi ko mu vutuka manima",
   "Kilendi ko mu vutuka manima"
  ]
 },
 {
  "n": 77,
  "lang": "Kikongo",
  "title": "MPUILA ZAMI I MUZAYA NGEYE YAVE",
  "lines": [
   "Solo : Mpuila zami i mu zaya ngeye Yave",
   "Tous : Nkondolo kitantu kua nge",
   "Mpuila zami i mu zaya ngeye Yave",
   "Nkondolo kitantu kua nge",
   "Solo : Mpuila zami ngeye kaka zeyi zo",
   "Tous : Mabanza mami ngeye kaka zeyi mo",
   "Mono ngizi finama kua ngeye Yave",
   "Nkondolo kitantu kua nge",
   "Solo : Mono kiena kuami bonso Kaïna ko",
   "Tous : Nkondolo kitantu kua nge",
   "Mono kiena kuami bonso Kaïna ko",
   "Nkondolo kitantu kua nge",
   "Solo : Mayangi mena nanga wo wabokolua",
   "Tous : Nkondolo kitantu kua nge",
   "Mayangi mena nanga wo wabokolua",
   "Nkondolo kitantu kua nge"
  ]
 },
 {
  "n": 78,
  "lang": "Kikongo",
  "title": "MPULUSU I SOSANGA",
  "lines": [
   "Mpulusu isosanga",
   "Mono ngizi solula yo",
   "Mu dibundu diadi dia nlongo",
   "Dia KCC",
   "Mpulusu isosanga",
   "Mono ngizi solula yo",
   "Mu malongi mandi manlongo",
   "Ma moyo a mvu ya mvu",
   "Nki wasa mumono Yave",
   "Kala wavedila",
   "Nki wasa mu mpedoso aku",
   "Mboki zolanga dibundu ye sadila dio"
  ]
 },
 {
  "n": 79,
  "lang": "Kikongo",
  "title": "MU DIODIO LUZIMPANGI",
  "lines": [
   "Solo : Mu diodio luzimpangi lutoma zaya vo",
   "Tous : Zinitu I kinlongo kia Mpeve a Yave",
   "O zimpangi katukivuidi ko",
   "Solo : Tata diavedila, wena minu kialunga",
   "Tous : Nsendo andi wean mu zulu"
  ]
 },
 {
  "n": 80,
  "lang": "Kikongo",
  "title": "MU DIODIO TATA NKULUNTU WIZIDI",
  "lines": [
   "Solo : Mu diodio Tata Nkuluntu wizidi",
   "Tous : Tuyangalala kueto babo",
   "Situadikulua diaka mu mambu ma Yave",
   "Mena kua Tata Nkuluntu wizidi"
  ]
 },
 {
  "n": 81,
  "lang": "Kikongo",
  "title": "MUKUZITISA YAVE TUIZIDI",
  "lines": [
   "Mukuzitisa Yave tuizidi",
   "Kadi ngeye Nzambi a mpulusu",
   "Ngeye vuidi nkembo ye nzitusu",
   "Yave Nzambi yala mvu ya mvu",
   "Nzitusu kua nge",
   "Nkembo kua nge",
   "Nki a Nzambi lenda fuanana ye nge",
   "Nzambi eto yala mvu ya mvu",
   "Nkembo, nkembo",
   "Nzitusu kua nge",
   "Bundu diaku dieti kukembisa",
   "Tueti lomba wiza tufinama",
   "Sakumuna beto babonsono"
  ]
 },
 {
  "n": 82,
  "lang": "Kikongo",
  "title": "MU LUSAMBULU LUA LONSO",
  "lines": [
   "Solo : Mu lusambulu lua lonso",
   "Muntu mosi mosi mpe",
   "Tous : Tueti boka tueti bombidila nge Yave",
   "Mu zinzungu ye zimpasi",
   "Tueti mona vava nza",
   "Yave Nzambi do utuvulusa",
   "Solo : Vulusa",
   "Tous : vulusa",
   "Solo : Vulusa",
   "Tous : vulusa Yave Nzambi do utuvulusa",
   "Tueti bombidila ngeye",
   "Utu vulusa mu nza",
   "Yave Nzambi do utuvulusa",
   "Solo : Yave Nzambi beto tuizidi kua nge",
   "Tous : Tuizidi bombidila kua nge Mvuluzi",
   "Mu zimpasi za zonsono",
   "Tueti mona vava nza",
   "Yave Nzambi do utuvulusa"
  ]
 },
 {
  "n": 83,
  "lang": "Kikongo",
  "title": "MU MINU KIAMI KIA NTIMA",
  "lines": [
   "Solo : Mu minu kiami kia ntima ya solula",
   "Tous : Yave Nzambi i Mvuluzi’ami",
   "Yandi I mvungi wabiza wakedika",
   "Una vulusa muel’ami",
   "Solo : Bu yazibula ntima",
   "Tous : Yatambula KCC",
   "Moyo a Nzambi kua mono",
   "Umonekene Yave Nzambi Mvuluzi",
   "I nsadisi ami kina kondua lekua ko",
   "Kua Se diami",
   "Solo : Ya mona lendo kia Yave ye ntemu’andi",
   "Tous : Mpeve Yave ya nduakila",
   "Matu ye meso ye ntima bia zibuka",
   "Ya wa ndinga ya Mvuluzi"
  ]
 },
 {
  "n": 84,
  "lang": "Kikongo",
  "title": "MUNA NKENDA ZA YAVE TUETI ZINGILA",
  "lines": [
   "Solo : Muna nkenda za Yave tueti zingila",
   "Tous : Va nza yayi, va nza yayi",
   "Muna nkenda za Yave tueti zingila",
   "Va nza ya masumu",
   "Solo : Yave Mvuluzi o o",
   "Tous : Yave Mvuluzi",
   "Tu tininanga kua yandi",
   "Kue tulenda tinina lufua",
   "O o mbeni weti toma vema",
   "Kua Yave tulenda vulusulua",
   "Tutininanga kua yandi",
   "Vo zimpasi zazingi zeti kuizanga",
   "Tusambila, tusambila",
   "Vo zimpasi zazingi zeti kuizanga",
   "Tusambilanga kua yandi"
  ]
 },
 {
  "n": 85,
  "lang": "Kikongo",
  "title": "MU NANI ZOLELE SINGAMA",
  "lines": [
   "Mu nani zolele singama",
   "Mu nani zolele singama",
   "Mu Yave nzolele singama",
   "Inga singama"
  ]
 },
 {
  "n": 86,
  "lang": "Kikongo",
  "title": "MU NSUALU NSUALU TUWA MALONGI MAKU",
  "lines": [
   "Mu nsualu nsualu tuwa malongi maku",
   "Beto tuizidi ye mpuila ku nto",
   "Tuzolele tualongua mambu maku",
   "Mu lunda mo utusadisa",
   "O Yave Nzambi , utusadisa",
   "Do utulonga ye utuluengisa",
   "Kadi kua ngeye kuena moyo eto",
   "Mu lunda mo utusadisa",
   "Yave Nzambi uzolanga babonso",
   "Bakota mukayengele",
   "Luzolo luandi lu lutidi mu ngolo",
   "Babonsono bakotele"
  ]
 },
 {
  "n": 87,
  "lang": "Kikongo",
  "title": "MU NTIMA MBEKI BUNKITA",
  "lines": [
   "Solo : Mu ntima mbeki bunkita Yave Nzambi",
   "Tous : Nakoti mu moyo ami",
   "Solo : Unkeba mu nsisi zazo Yave Nzambi",
   "Tous : Simba minu kia ntima ami",
   "Nate ye suka a zingu kiamu Mfumu",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Solo : Mpova zami buzetiyoka bonso tiya",
   "Tous : Unsoba nadede buabu",
   "Nate ye suka a zingu kiamu Mfumu",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Solo : Nganzi zame bu zeti vonda salu kiaku",
   "Tous : Vana yenge mu ntim’ami",
   "Nate ye suka a zingu kiamu Mfumu",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Solo : Mbeni bunga dibundu diaku, Yave",
   "Nzambi",
   "Tous : Mbeni vunua kua nkadi a mpemba",
   "Nate ye suka a zingu kiamu Mfumu",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Solo : Ngieti dila mu ntima buabu, Mfumu Yave",
   "Tous : Kala yami nate ye mfuilu (bis)",
   "Nate ye suka a zingu kiamu Mfumu",
   "Umpana lulendo luaku, untomisa, unsimba",
   "Umpana lulendo luaku, untomisa, unsimba"
  ]
 },
 {
  "n": 88,
  "lang": "Kikongo",
  "title": "MU NZILA MFUMU ETO YAVE",
  "lines": [
   "Solo : Mu nzila Yave Nzambi eto",
   "Tous : Tulambudi kueto",
   "Mu lembo vutuka kumanima",
   "Buala buandi luakila",
   "Solo : Tuendeno, tuendeno",
   "Tous : Tuendeno, tuendeno,",
   "Mu lembua vingila kota",
   "Mu nzila Yave Nzambi eto",
   "Nzila yo ya mpulusu",
   "Solo : Bana bandi bena mu nzil‘andi",
   "Tous : Bana luaka tuzeyi",
   "Yi bakala mu dikabu",
   "Diba tambula nsendo",
   "Solo : Va luse lua Mfumu eto Yave",
   "Tous : Tulambudi kueto",
   "Yi tuakala mu dikabu",
   "Diaba vulusa nade"
  ]
 },
 {
  "n": 89,
  "lang": "Kikongo",
  "title": "MU SADILA YAVE NZAMBI FIMPANI",
  "lines": [
   "Solo : Mu sadila Yave Nzambi fimpani",
   "Tous : Mu sadila Yave Nzambi fimpani",
   "Fimpani, fimpani muna ntim‘aku",
   "Vo ngeye fueni mu vulusua mpe",
   "Solo : Yave Nzambi wamoyo kena",
   "Tous : Ah ah ah wamoyo kena",
   "Yave Nzambi wamoyo kena",
   "Ah ah ah wamoyo kena",
   "Solo : Mu sadila Yave Nzambi talani",
   "Tous : Mu sadila Yave Nzambi talani",
   "Talani, talani muna ntim‘aku",
   "Vo mena mu nsadulu Yave"
  ]
 },
 {
  "n": 90,
  "lang": "Kikongo",
  "title": "MU SADILA YAVE NZAMBI KAMUENA MPASI KO",
  "lines": [
   "Solo : Mu sadila Yave Nzambi kamuena",
   "mpasi ko",
   "Tous : Mu sadila Yave Nzambi kamuena",
   "mpasi ko",
   "Luzolo lua muntu ye nkuikumunu a muntumpasi kaluenga",
   "Solo : Muzaya Yave Nzambi kamuena mpasi ko",
   "Tous : Muzaya Yave Nzambi kamuena mpasi ko",
   "Luzolo lua muntu ye nkuikumunu a muntu mpasi kaluenga"
  ]
 },
 {
  "n": 91,
  "lang": "Kikongo",
  "title": "MU SALU USALANGA",
  "lines": [
   "Solo : Mu salu usalanga kia mono Nzambi aku",
   "Tous : Bimba mpasi za salu kia mono Nzambi",
   "aku",
   "U muana izolanga mu bundu dia nlongo",
   "Vibidila mamo si ya kukembisa",
   "Solo : Mono Nzamboi aku i ntonga",
   "Ntima aku",
   "Tous : u muana wantalu beni izolanga",
   "Mamo u monanga mono ya kubikila mo",
   "Ku zezani ko",
   "Kusisani ko",
   "Mpasi wa yonzika mbutu",
   "Mia salu kia ku",
   "Ku zezani ko",
   "Kusisani ko",
   "Sikila muana mi",
   "Si ya ku kembisa"
  ]
 },
 {
  "n": 92,
  "lang": "Kikongo",
  "title": "NANGA MIA YAVE VA NZA",
  "lines": [
   "Solo : Nanga mia Yave va nza i beno zintumua",
   "Tous : Sielo bia Nzambi luwa kalu zimfumu ko",
   "Ntumua zalutekila za kikulula",
   "Luvanga mpe bumosi mu mbandu yayi",
   "Solo : Lubisielo mu dibundu luminanga",
   "Tous : Ludiata bonso buadiatila mbikudi miami",
   "Lukiyina mu lemvuka kua konsono",
   "Lusadilanga kedika mu mamonsono",
   "Solo : Luzieta mu siamisa mameme mami",
   "Tous : Mpeve yi luatambudi ya Yave Nzambi‘",
   "eno Sielo lusala salu mu lunungu lualo",
   "Lulemvuka kua bantu babo mu dibundu",
   "Solo : Lusadila kedila mu bundu dia kcc",
   "Tous : Nkailu mia satana luyanu luvunu",
   "Sielo lutoma keba mu nsadulu yambi",
   "Yave Nzambi kuzulu weti mona mamo."
  ]
 },
 {
  "n": 93,
  "lang": "Kikongo",
  "title": "NANI LENDA KUTU TANINA",
  "lines": [
   "Solo : Nani lenda kutu tanina",
   "Tous : Vo ka Yave Nzambi ko",
   "Ye mu nzungu zeto vava nza",
   "Nani lenda kutu taninanga",
   "Solo : Yave i Nzambi, Yave i Nzambi",
   "Tous : Kua yandi tutalanga",
   "Tuena babo va koko kuandi",
   "Kua yandi tutalanga"
  ]
 },
 {
  "n": 94,
  "lang": "Kikongo",
  "title": "NANI LENDA KUTU VANGA BUAMBI",
  "lines": [
   "Nani lenda kutu vanga buambi",
   "Yoyo i mpova ya Yave kua beto",
   "Yandi i tadi dia moyo kua beto",
   "Mu diau tu suaminanga",
   "Yandi i tadi dia moyo kua beto",
   "Mu diawu tusuaminanga",
   "O o tadi diodio dia mpulusu",
   "Mu diau tuasilua nsilulu",
   "Kua Nzambi Se i Se dieto",
   "Yave Nzambi a nkembo i tadi dio"
  ]
 },
 {
  "n": 95,
  "lang": "Kikongo",
  "title": "NANI WENA WAFUANA MU BUNDU DIA KCC",
  "lines": [
   "Solo : Nani wena wafuana mu bundu dia KCC",
   "Tous : Ka kuena muntu ko wena wafuana",
   "Sadila kedika ye sisa luyanu",
   "Yave Nzambi eto sika ku fuanisa",
   "Solo : Nzitusu miamio miena kua Yave",
   "Tous : Lubakiasolua kaluvunuandi ko",
   "Lutina tambula nzitusu mia Yave",
   "Lukikulula o bakiasolua"
  ]
 },
 {
  "n": 96,
  "lang": "Kikongo",
  "title": "NANI ZOLELE LANDA YAVE",
  "lines": [
   "Nani zolele landa Yave",
   "Mono nzolele, nzolele",
   "Mulanda Yave vambana ye satana",
   "Mono nzolele, nzolele",
   "Mulanda Yave vambana ye nza yayi",
   "Mono nzolele, nzolele",
   "Nzolele",
   "Mono nzolele, nzolele",
   "Yave Nzambi ntinu a mintimu",
   "Wakunsola mu kala kinuani",
   "Mono nzolele, nzolele",
   "Mu landa Yave toma kukikenga",
   "Mono nzolele, nzolele",
   "Mu landa Yave keba mpovolo zazo",
   "Mono nzolele, nzolele",
   "Mulanda Yave toma kukifuanisa",
   "Mono nzolele, nzolele"
  ]
 },
 {
  "n": 97,
  "lang": "Kikongo",
  "title": "NDUENGOSO ETO YENA MU YAVE NZAMBI",
  "lines": [
   "Nduengoso eto yena mu Yave Nzambi",
   "Mu yandi muena mpulusu eto",
   "O tuendeno kua Yave Nzambi",
   "Yave Nzambi utuvingilanga",
   "O ntuendeno kuetotuasambila",
   "Mu yandi muena mpulusu eto",
   "O ntuendeno kua Yave Nzambi",
   "Yave Nzambi utu vingilanga"
  ]
 },
 {
  "n": 98,
  "lang": "Kikongo",
  "title": "NDUENGA ZA ZINENE",
  "lines": [
   "Solo : Vo babingi beti kutuzomanga",
   "Tous Ye beto tueti toma vibidila",
   "Yave Nzambi sika kutu kembisa",
   "O Yave i nsadisi eto",
   "Solo : Nduenga za zinene za Yave Nzambi",
   "Tous : Nduenga za zinene za Nzambi eto",
   "Nzambi eto ya lulendo",
   "weti kutusadisa",
   "Solo : Vo malema ye nzungu bieti kuizanga",
   "Tous : Ye beto tueti toma vibidila",
   "Kadi Yave i Mvungi eto wa biza",
   "Yandi kaka i nsadisi eto",
   "Solo : Nkundi siama mu ntotolo za vanza",
   "Tous : Nuana mvita mu sabala kia Mpeve",
   "Yave Nzambi weti kutubombanga",
   "Mpe yetikutusadisa",
   "Solo : Mambu mandi i sabala kia lulendo",
   "Tous : Mu kiau banlongo banunganga",
   "Mu zimvita zau vava nza yayi",
   "Ye bombuanga mu mazulu ."
  ]
 },
 {
  "n": 99,
  "lang": "Kikongo",
  "title": "NDUENGA ZA KIZULU ZAMONO NZAMBI ENO",
  "lines": [
   "Solo : Nduenga za kizulu zamono Nzambi eno",
   "Tous : Nduenga za vedila zena za mpulusu",
   "Nduenga zisonganga zola ye nkenda mpe",
   "Kua makanda mamo mpasi bavulusua",
   "Solo : Nduenga za satana i nduenga za",
   "mbungulu",
   "Tous : Lombanga nduenga kua Nzambi a moyo",
   "Zi yonzikanga sivananga yenge",
   "Lombanga nduenga kau Nzambi a moyo",
   "Zivulusanga, zivananga moyo",
   "Solo : Satana va ntoto wena ye nduenga mpe",
   "Tous : Nduenga za kimpala za kondua kedika",
   "Za kondua lunungu zola ye nkenda mpe",
   "Kazitunganga ko zena zasumuka"
  ]
 },
 {
  "n": 100,
  "lang": "Kikongo",
  "title": "NDIMBUDULU A MINU MASUMU KUA YAVE",
  "lines": [
   "Wamana dimbula minu kua mono Nzambi aku",
   "Neti nkanu a masumu ma mbungulu",
   "Ukivana kua mono Nzambi ya kedika",
   "Mu minu kia sikila",
   "Sanga vuvu kua mono Yave Nzambi aku",
   "Nkenda zami ka zena nsuka ko o o o",
   "Mu mpasi ye zinzungu zazo kina kusisa ko o o",
   "Sambilanga lumbu biabionsono",
   "Ntotolo buzilueki kala kibakala",
   "Kubikanga ntim‘aku mu sambila",
   "Keti keti ye wonga ntambu mia satana",
   "Milenda kuvidisa"
  ]
 },
 {
  "n": 101,
  "lang": "Kikongo",
  "title": "NGEYE TATA MENE NKEMBO MU NDIATULU ZAMBI",
  "lines": [
   "Ngeye tatamene nkembo mu ndiatulu zambi",
   "Wiza wavulusua nkundi",
   "Kadi ndinga Yave Nzambi ikubokele nade",
   "Wiza wavulusua Mfumu ukuzolele",
   "Kiese kuzulu kiena",
   "E kiese kiese",
   "Mu mona Nkemboa Yave Nzambi",
   "Nzambi wa mbote kena",
   "Bika tua nsadila"
  ]
 },
 {
  "n": 102,
  "lang": "Kikongo",
  "title": "NGEYE TATA NGEYE MAMA O NKI WETI VINGILANGA",
  "lines": [
   "Solo : Ngeye Tata ngeye mama",
   "Tous : Onki weti vingilanga",
   "Yave Nzambi weti kubokilanga",
   "Oh wiza wavulusua",
   "Solo : O o wiza o o wiza",
   "Tous : O o wiza kumpulusu",
   "Yave Nzambi weti kuvingilanga",
   "O o wiza wavulusua"
  ]
 },
 {
  "n": 103,
  "lang": "Kikongo",
  "title": "NGEYE UNA MONA MU BANA BA BANTU",
  "lines": [
   "Ngeye una mona mu bana ba bantu",
   "Mpasi zetikuiza ye nzungu mpe",
   "E e lusambila"
  ]
 },
 {
  "n": 104,
  "lang": "Kikongo",
  "title": "NGEYE VANGU KIA NZAMBI TOMA ZAYANGA VO",
  "lines": [
   "Solo : Ngeye vangu kia Nzambi toma zayanga",
   "vo",
   "Tous : Nkela nzo a masumu nge uleka mo",
   "Kimpala ye lulendo sisa mambi mamo",
   "Lumbu bia zingu kiaku bu bieti viokanga",
   "Solo : Tuzakameno",
   "Tous : Vantadisi a Yave",
   "Yave Nzambi eto",
   "Yandi Mvangi eto",
   "Lufua ye moyo mu muntu",
   "Kua yandi biena vava nza",
   "Solo : Tala kunima nkundi bantu bamana fua",
   "Tous : Zinzo mpe ye zimbongo bau basisa zo",
   "Kimvuama kia nza yayi kakiena ndandu ko",
   "Tomba nkembo a dizulu ulembua sukanga"
  ]
 },
 {
  "n": 105,
  "lang": "Kikongo",
  "title": "LU BA TATA LU YANGALA",
  "lines": [
   "Solo : Luba tata luyangalala e e",
   "Tous : Yave Nzambi utuzolele",
   "Solo : ah kiese ee",
   "A a a kiese",
   "A a a a",
   "Yave Nzambi utuzolele"
  ]
 },
 {
  "n": 106,
  "lang": "Kikongo",
  "title": "NGEYE WETI SAMPAKA MU MAMBU MA YAVE",
  "lines": [
   "Solo : Ngeye weti sampaka mu mambu ma",
   "Yave",
   "Tous : Ngeye u nani usambisanga Yave Nzambi",
   "aku Mfumu a zimfumu Mvangia bantu babo Wavanga zulu, ntoto ye biabionsono",
   "Solo : Yave Nzambi i moyo kua ngeye",
   "Tous : Kuvunu andi ko Yave I Nzambi aku",
   "Toma yindula yambula zimpaka",
   "Toma kedika kina kuvulusa",
   "Solo : Bumeni zaya vo Yave i Mvuluzi aku",
   "Tous : Lomba kua yandi kasiamisa minu kia",
   "ntim‘aku",
   "Mpasi watambula nduenga ye mpeve‘andi",
   "Yina kusonga kedika kia kionsono"
  ]
 },
 {
  "n": 107,
  "lang": "Kikongo",
  "title": "NGINA SIKA YAVE NZAMBI",
  "lines": [
   "Solo : Ngina sika Yave Nzambi",
   "Ngina sika Yave Nzambi",
   "Mu ntangu zazo, vava nza",
   "Mu ntangu zazo, bu ngiena moyo",
   "Tous : Ngina sika Yave Nzambi",
   "Ngina sika Yave Nzambi",
   "Mu ntangu zazo, vava nza",
   "Mu ntangu zazo, bu ngiena moyo"
  ]
 },
 {
  "n": 108,
  "lang": "Kikongo",
  "title": "NGUILU MBILA YETI BOKILA BASOLUA",
  "lines": [
   "Solo : Nguilu mbila yeti bokila basolua",
   "Tous : Mono yakondua Mvungi a moyo kumbazi",
   "Yave Nzambiwansolele mu kota mu mpaka",
   "Bika ya landa mavanga ma Mvuluzi ami",
   "Solo : Eh Nzambi a zola beni bika ya zitisa",
   "Tous : Bika yazitisanga ntangu zazonsono",
   "Kadi nge wankotisa muna mpaka ya",
   "moyo",
   "Mu baka mpeve aku yina kunsadisa"
  ]
 },
 {
  "n": 109,
  "lang": "Kikongo",
  "title": "NKEMBO, NKEMBO, NKEMBO YIMBILA ALLELUYA",
  "lines": [
   "Solo : Nkembo, nkembo, nkembo",
   "Nkembo, nkembo, nkembo",
   "Yimbila alleluya",
   "Tous : Nkembo, nkembo, nkembo",
   "Nkembo, nkembo, nkembo",
   "Yimbila alleluya"
  ]
 },
 {
  "n": 110,
  "lang": "Kikongo",
  "title": "NKEMBO KUA NZAMBI MUNA KAYENGELE",
  "lines": [
   "Solo : E e lubatata ye bamama",
   "Tous : Luizeno kua Yave Nzambi",
   "Solo : Nkembo kua Nzambi muna kayengele",
   "Tous : Yenge kua beno vava ntoto o o",
   "Yenge kua bantu bazolakana"
  ]
 },
 {
  "n": 111,
  "lang": "Kikongo",
  "title": "NKEMBO WA KCC MU ZULU DIA YAVE",
  "lines": [
   "Solo : Nkembo wa KCC mu zulu dia Yave",
   "Tous : Nkembo wa KCC mu zulu dia Yave",
   "Nkembo wa KCC mu zulu dia Yave a a",
   "Yave Nzambi tambula wo (bis)."
  ]
 },
 {
  "n": 112,
  "lang": "Kikongo",
  "title": "NKIA MPILA NZAMBI BETO TUFUETI SAMBILA",
  "lines": [
   "Solo : Nzambi zikondolo moyo zi vondanga",
   "muela",
   "Tous : Nzambi za vangua mu moko ma bantu",
   "va nza, Nzambi zi kondolo meso, zikondolo matu, Nzambi zikondolo nua ye ndinga",
   "Solo : Nkia mpila Nzambi beto tufueti sambila",
   "Tous : I Nzambi yena moyo Nzambi i monanga",
   "Nzambi yiwanga ye vovanga mpe",
   "I Nzambi kayimonua, Nzambi",
   "kayisimbua",
   "Nzambi ya kedika i Yave",
   "Solo : Nzambi ya moyo tuzeyi tusilanga vuvu",
   "Tous : Nzambi wavanga dizulu ye ntoto wawo",
   "Nzambi vuidi lulendo mu vulusa miela",
   "Nzambi wa vulusa ntoto wawo"
  ]
 },
 {
  "n": 113,
  "lang": "Kikongo",
  "title": "NKI TUFUETI VANGA MU BAKA MOYO WA MVU YA MVU",
  "lines": [
   "Solo : Nki tufueti vanga mu baka moyo wa",
   "mvu ya mvu",
   "Tous : Vilula madiela kadi kimfumu kia mazulu",
   "Kieti finamanga ntangu zazo vava ntoto",
   "Nlemvo wa nsilulu"
  ]
 },
 {
  "n": 114,
  "lang": "Kikongo",
  "title": "NKI WETI VEMINA NGE U SAMBILANGA",
  "lines": [
   "Nki weti vemina nge u sambilanga",
   "Mpulusu a muela mono yi veminanga",
   "Bu ngiena moyo va nza ya masumu",
   "Nzil‘ami ya zulu mono yikubikanga",
   "Nzolele kota muna nsi ya nsilulu",
   "Engwe muela engwe muel‘ami",
   "Ungiambudila u Nzambi ami",
   "Bungiena moyo va nza ya masumu",
   "U mvibidila ye viluka",
   "U mfuila nkenda mpasi ya vulusua"
  ]
 },
 {
  "n": 115,
  "lang": "Kikongo",
  "title": "NKUNDI AMI U BOKOLO",
  "lines": [
   "Solo : Nkundi ami ubokolo",
   "Tous : Wiza kua Yave watambula mambu",
   "Mambu ma moyo mafueni kua ngeye",
   "Mambu ma mpulusu",
   "Solo : Mpuila za yenge, mpuila za zola",
   "Tous : Mpuila zivananga moyo kua nge",
   "Mpuila za yenge, mpuila za zola",
   "Mpuila za Mvuluzi",
   "Solo : Nkundi ami nge wena ye mpuila",
   "Tous : Wiza mu nsualu watambula mambu",
   "Wena ye mpuila, mpuila za yenge",
   "Mpuila za Mvuluzi"
  ]
 },
 {
  "n": 116,
  "lang": "Kikongo",
  "title": "NLEMVO A YAVE",
  "lines": [
   "Solo : Nlemvo a Yave, o nlemvo a Yave",
   "Tous : Nlemvo a Yave Nzambi usikilanga",
   "ntangu zazo, Nlemvo a Yave , o nlemvo a Yave Wau kutu sadisanga ntangu zazo",
   "Solo : Tusikileno, mu nlemvo a Yave",
   "Tous : Tusikileno; mu nlemvo a Yave",
   "Mu nlemvo a Yave muena lusadusu",
   "Lueto Mu nlemvo a Yave muena mpe mpulusu eto"
  ]
 },
 {
  "n": 117,
  "lang": "Kikongo",
  "title": "NSAMU WO WAMBOTE KUEDI SUEKA KO NKUNDI",
  "lines": [
   "Solo : Nsamu wo wambote kuedi sueka ko",
   "nkundi",
   "Tous : Samunanga nsamu wo",
   "Kionso kionso vuma lenda kuaku songa",
   "Kadi wena wampulusu",
   "Solo : Kamba wo, kamba wo",
   "Tous : Kamba wo, muna nsi zazonsono",
   "Mfumu eto Yave, i liliya kia ntalu",
   "Tendikisa kua babo",
   "Solo : Samunanga nsamu toma ta kimbangi",
   "Tous : Bonso buena kedika",
   "Kalanga mayangi muna Yave Nzambi",
   "Kadi muena mpulusu"
  ]
 },
 {
  "n": 118,
  "lang": "Kikongo",
  "title": "NSILULU ZA NZAMBI ZILUNGIDI",
  "lines": [
   "Oh ! nsilulu za Nzambi zilungidi",
   "Muna nza yayonsono",
   "Oh ! nkembo wa Nzambi usemanga",
   "Muna nsi yayonsono",
   "Oh! Nkembo wa Nzambi usemanga",
   "Muna nsi yayonsono"
  ]
 },
 {
  "n": 119,
  "lang": "Kikongo",
  "title": "NTANGU A MALONGI I LUNGIDI",
  "lines": [
   "Solo : Ntangua malongi i lungidi",
   "Tous : Tuzibula meso, tuzibula matu, tuzibula ntima Ntangua malongi yilungidi, tukala napi",
   "Solo : Yave Nzambi weti longa, mu Bibila",
   "Tous : Tata sielo weti longa, mu Bibila",
   "Tata nlongi weti longa, mu Bibila",
   "Solo : Kiadi tata nlongi",
   "Tous : Buketi longanga",
   "Kansi beto bantu katuwanga malongi ko",
   "Mu lumbu kina bue tuna kadila",
   "Tuwanga tata nlongi bu keti longanga"
  ]
 },
 {
  "n": 120,
  "lang": "Kikongo",
  "title": "NTONDELE YAVE BUWENA U NZAMBI",
  "lines": [
   "Ntondele Yave buwena u Nzambi",
   "Vo widi kondua nga ntatu wambanisi",
   "Ntondele vo ngeye watoma zenga",
   "Vo satana ka singua ye babo bafua",
   "Ntoto widi vangua kua satana e e",
   "Nga mono nkondolo luvuvamu",
   "Nga mono nkondolo lusadusu",
   "Nga satana wena kumbanisa",
   "Mintantu miami miena yeku yeku",
   "Yeku mbazi mpe ye mu ngudi a nzo",
   "Dikanda ye ki se bena kintantu kua mono",
   "Bakundi bami babo bazolele ya fua"
  ]
 },
 {
  "n": 121,
  "lang": "Kikongo",
  "title": "NUNGA KAKA MFUETI NUNGA",
  "lines": [
   "Nunga kaka mfueti nunga",
   "Mu mvita zazo va nza",
   "Kilendi bedusua ko",
   "Mfumu ami Yave wena yami mu mamo",
   "Satana",
   "Weti zola bena keti keti",
   "Satana",
   "Wena ngolo kua balebakana",
   "Kansi mono kilendi bedusua ko"
  ]
 },
 {
  "n": 122,
  "lang": "Kikongo",
  "title": "NZAMBI MPUNGU NGE NKUA MBOTE",
  "lines": [
   "Solo : Nzambi a Mpungu nge nkua mbote",
   "Tous : Kedika unzolele beni",
   "Nzambi a Mpungu nge kua mbote",
   "Buwankatudi mu tombe ki",
   "Ngeye bue uzolele Nzambi !",
   "Inga yiku zolele mu ntima ye muel‘ami",
   "Solo : Ngeye buwankatudi mu tomb‘eki",
   "Tous : Mpasi yaku zaila mu KCC",
   "Umpana lendo minu, vuvu ye zola",
   "Ye ya sikila mu nge mvu ya mvu",
   "Solo : Inga Tata",
   "Tous : Buzengi buingi bua kedi yami",
   "Buyazaya kiese kia sumu ye sumu",
   "Ya banza vo i ntomoso mu nsumi ye muel‘ami",
   "Solo : Makela ye zimpaka bue usisidi bio",
   "Tous : Inga yikuzolele, mu ntima ye muel‘ami",
   "Mu kala muana Nzambi teka kituka wauke vo zolele Inga, yikuzolele, mu ntima ye muel‘ami"
  ]
 },
 {
  "n": 123,
  "lang": "Kikongo",
  "title": "NZAMBI MPUNGU UTUWILA",
  "lines": [
   "Nzambi Mpungu utuwila tueti boka",
   "Mu zimpasi tueti mona vava nza",
   "Nzambi Mpungu tueti boka tueti bombidila nge",
   "Utu vulusa mu nza ya lufua",
   "Minu kieto i mu vulusua kua ngeye",
   "Ngeye i Nzambi",
   "Yave Nzambi tueti lomba",
   "Mu zimpasi vava nza",
   "Kutu sisi ko mu nza ya lufua",
   "Vo zimpasi vo zinzungu tuku bombidila nge",
   "Mu zimpasi tueti mona vava nza",
   "Nzambi Mpungu tuku lomba utuvulusa mu nza",
   "Kutu sisi ko mu nza ya lufua",
   "Kondua minu kuena nzungu",
   "Kua babonsono vava nza",
   "Tuku lomba wutu vana minu kio",
   "Nzambi Mpungu wena mvungi kua bawanga mbil’andi",
   "Bena vulusua mu nza ya lufua"
  ]
 },
 {
  "n": 124,
  "lang": "Kikongo",
  "title": "NZAMBI NA BETO KUSALAKA ZULU NA NTOTO",
  "lines": [
   "Solo : Nzambi na beto kusalaka zulu na ntoto",
   "Tous : Nzambi na beto kusalaka bima nionso",
   "Nzambi na beto Nzambi ya lulendo",
   "Nzambi a Mpungu Mvuluzi a nza",
   "Solo : Mpilulu a madiela ikele mfunu mingi",
   "Tous : o ikele mfunu mingi, samuna yau beto",
   "lenda bika, mpe na kumona Nkembo a Nzambi"
  ]
 },
 {
  "n": 125,
  "lang": "Kikongo",
  "title": "NZAMBI NGE MOSI KAKA WENA",
  "lines": [
   "Solo : Nzambi nge mosi kaka wena",
   "Tous : Nkumbu aku Yave Nzambi",
   "Ngeye wavanga dizulu",
   "Ye ntoto ye biabionsono mpe",
   "Solo : Kadi ngeye Yave i Nzambi‘eto",
   "Tous : Tuka mu nsi ya Ngipiti",
   "Tuna zaya nzambi za nkaka ko",
   "Kadi ngeye kaka kakuen‘ani Mvuluzi",
   "wankaka ko, kansi ngeye kaka"
  ]
 },
 {
  "n": 126,
  "lang": "Kikongo",
  "title": "NZAMBI UTUZOLELE",
  "lines": [
   "Solo : Nzambi utuzolele",
   "Tous : Bukatuvana mbikudiandi",
   "Mukutu natina kedika",
   "Mpasi vo tuavulusua",
   "Solo : E zola kua Nzambi kuatu kubikila nsi",
   "Tous : E mpasi vo tuavulusua",
   "Ye wonso weti sanga vuvu nade",
   "kana bungua kutu ko"
  ]
 },
 {
  "n": 127,
  "lang": "Kikongo",
  "title": "NZAMBI WA VANGA ZULU YE NTOTO",
  "lines": [
   "Nzambi wavanga zulu ye ntoto",
   "Yandi kaka wavanga lekua biabio",
   "Kua yandi kuena lulendo lualo",
   "Mu tuadisanga biabionsono",
   "Yandi kaka Nzamibi a zinzambi",
   "Fueni mu tambula nzitusu‘eto",
   "Zitiseno Yave tu babo",
   "Mu kiese kiakio",
   "Tubabo mu zola ye mu mayangi",
   "Kua yandi, nkembo mvu ya mvu",
   "Tufinameno kua yandi",
   "O mpasi tuavulusua"
  ]
 },
 {
  "n": 128,
  "lang": "Kikongo",
  "title": "NZAMBI A NLEMVO I NZAMBI YABA LUNUNGU",
  "lines": [
   "Solo : Nzambi a nlemvo i Nzambi ya balunungu",
   "Tous : Ubokilanga mameme ma vila",
   "Vumi kia Yave",
   "Nzambi i nto ya moyo mu Mpeve, Yandi i suamunu kia baku nzolanga",
   "Solo : Tala ntemo’a Yave weti zieka",
   "Tous : I zizi katusongele butu lekanga minu",
   "Mu mambu mandi nzila mpulusu"
  ]
 },
 {
  "n": 129,
  "lang": "Kikongo",
  "title": "NZAMBI ZEYI BABONSONO",
  "lines": [
   "Nzambi zeyi babonsono",
   "Yandi watu yonzika",
   "Kedika kiandi kafidisa",
   "Yandi watu yonzika",
   "E e ngionzama yoyo tua yonzukua",
   "E e nsonama yoyo tua sonukua",
   "Tukifimpa ye tukikenga",
   "Kadi Nzambi wena yeto"
  ]
 },
 {
  "n": 130,
  "lang": "Kikongo",
  "title": "NZA YAYI I YA MPIOKILA",
  "lines": [
   "Solo : Yave Nzambi utuzolele",
   "Tous : Bukatu songa kedika",
   "Ye kutu songa nzila mpulusu",
   "Mpasi vo tuavulusua",
   "Solo : Nza yayi iya mpiokila",
   "Tous : Mu zulu dia Yave muena nsilulu",
   "Nsilulu kua banungini",
   "Bana mo vundila"
  ]
 },
 {
  "n": 131,
  "lang": "Kikongo",
  "title": "NZILA YIKONDOLO NTEMO’A YAVE",
  "lines": [
   "Nzila yikondolo ntemo‘a Nzambi",
   "Nzila ya tombe i mbungulu",
   "Wonso wonso kakizayilanga dio",
   "Mfumu Nzambi weti kutuluengisa",
   "Mbenzi luamueni nzila ya moyo",
   "Inga tuazeyi nzila ya zulu",
   "Nzila ya zulu dibundu dia tuka kua Nzambi",
   "I muau tusansuluanga",
   "Nzila ya zulu dibundu dia tuka kua Nzambi",
   "I muau tulenda vukila",
   "Ntemo a Nzambi i Mambu mandi",
   "Yandi i muinda mu nza ya yonsono",
   "Malongi mandi i nti wa mpulusu",
   "Nzila ya zulu kua yandi yenina"
  ]
 },
 {
  "n": 132,
  "lang": "Kikongo",
  "title": "O BABINGI BANA KOTA",
  "lines": [
   "Solo : O babingi bana kota",
   "O babingi bana lembua kota",
   "O babingi bana kota",
   "Alleluya Mvuluzi",
   "Tous : O babingi bana kota",
   "O babingi bana lembua kota",
   "O babingi bana kota",
   "Alleluya Mvuluzi"
  ]
 },
 {
  "n": 133,
  "lang": "Kikongo",
  "title": "O BENO BANLONGO LUIZENO",
  "lines": [
   "O beno banlongo o luizeno",
   "Tuasika eno Yave",
   "Nzambi",
   "O o Yave i Mvungi a moyo",
   "Luizeno tuasika Yave Nzambi",
   "Luizeno tua nzitisa"
  ]
 },
 {
  "n": 134,
  "lang": "Kikongo",
  "title": "SIELO BIAFIDUSUA KUA NZAMBI SE",
  "lines": [
   "Sielo biafiduswa kua Nzambi Se vava nza",
   "I nlemvo wa Nzambi kua bantu mu nza yayi",
   "Mpasi bavulusua mu nsamu wa kedika",
   "Tuvana nzitusu ye nkembo kua Nzambi Se",
   "Bika tua yangalala, bika tuayimbidila Se",
   "Tukembisa ntangu zazonsono",
   "Matondo kua Nzambi mu mambote mandi mpe Bika tuansadila lumbu biabionsono",
   "O Mpeve ya nlongo yena mu Nzambi eto",
   "Mu nsi zazonsono Yave weti monika",
   "Mu lendo kia Mpeve Sielo bietikusadila",
   "Mu malongi ma Se bantu betivulusua"
  ]
 },
 {
  "n": 135,
  "lang": "Kikongo",
  "title": "SIELO BIAMI YA FILA MU NZA YA MASUMU",
  "lines": [
   "Sielo biami ya fila mu nza ya masumu",
   "Salu kiau kia ntalu vulusa miela",
   "Ye zayikisa kua nza Nzambi a kedika",
   "Kansi bau kabazolua ko",
   "Lufinama kaluzezani ko bakiasolua",
   "Lulanda kaka mono Yave",
   "Ndungunu eno si ya luvana",
   "Moyo wa mvu ya mvu",
   "Kalu dimbulani minu ko",
   "Bu basamuna nsamu wambote vava nza",
   "Sielo biami biazomua ye biavondua mpe",
   "Beno mpe lukundama silua belua kua nza",
   "Bu luna sadila kedika"
  ]
 },
 {
  "n": 136,
  "lang": "Kikongo",
  "title": "SITUA KEMBELA MU NZILA ZULU",
  "lines": [
   "Si tuakembela mu nzila zulu",
   "Mu lumbu kinavutula",
   "Tala mpasi zazonsono (bis)",
   "Zi tuamueni va ntoto",
   "Kembusua si tuakembusua",
   "Zimpasi zazonsono zituamueni vava ntoto",
   "Zinzungu zazonsono zituamueni vava ntoto",
   "Si tuakembusua mu nzila zulu"
  ]
 },
 {
  "n": 137,
  "lang": "Kikongo",
  "title": "SITUA ZAYA MO KUA YAVE NZAMBI",
  "lines": [
   "Solo : Situa zaya mo kua Yave Nzambi",
   "Tous : Muntu muntu va nza wena ye diambu",
   "Diandi kana dedisa kua Nzambi eto",
   "Mavanga mansueki mena mu ntima muntu meti monika vantadisi a Yave",
   "Solo : Mu lumbu kia nsuka Kuzulu e",
   "Tous : Tukenda mobuani kwa Yave",
   "Tu tuluenga babonsono",
   "Tuvilula diela butuena bamoyo",
   "Solo : Tueti fundusuanga babonsono",
   "Tous : Mfundusu a Yave yena va muntu muntu",
   "Beti tuadisa ye beti longua",
   "Ma Nzambi ma Nzambi ma kimuntu a muntu",
   "Meti monika va ntadisi a Yave"
  ]
 },
 {
  "n": 138,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI BOKELE BANTU BANDI KUMPULUSU",
  "lines": [
   "Solo : Yave Nzambi bokele bantu bandi ku",
   "mpulusu",
   "Tous : Songele nlemvo kua babo",
   "Mambu mandi makedika meti samunua kua babo kansi bantu beti diata mu mavanga mau",
   "Solo : Nkia nsendo tuna baka mu mpila yoyo",
   "Tous : O ngeye Nzambi eto",
   "Mabanza ma bantu mena mpila mu",
   "Mpila, O ngeye Nzambi eto",
   "Mavanga ma bantu mena mpila ya nkaka"
  ]
 },
 {
  "n": 139,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI BUKA MANA ZOLA NZA YAYI",
  "lines": [
   "Solo : Yave Nzambi buka mana zola nza yayi",
   "Tous : Wafidisa sielo biandi",
   "Wonso tambudi kedika kiandi",
   "Kabungua ko",
   "Solo : Amen, alleluya, amen , alleluya",
   "Tous : Mu Yave tuvulusuanga",
   "Wonso tambudi kedika kiandi",
   "Kabungua ko"
  ]
 },
 {
  "n": 140,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI I TINUNU KIAMI",
  "lines": [
   "Yave Nzambi i tinunu kiami",
   "Kua ngeye itininanga",
   "Mu zimpasi za muela ye mu mpasi za nsuni",
   "Ukunsadisa, ngeye ntanini ami ngeye nsadisi ami Ukunsadisa",
   "Vo satana weti kutuzomanga",
   "Vo masumu meti kutuzomanga"
  ]
 },
 {
  "n": 141,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI KALA YAMI",
  "lines": [
   "Yave Nzambi kala yami",
   "Sikila mu muel‘ami",
   "Kadi buela katukanga",
   "Ye mu ntangu a mpulu (bis)",
   "Sikila, sikilanga Yave",
   "Nzambi",
   "Nsiamusu tulombele",
   "Sikilanga Yave Nzambi",
   "Nsiamusu tulombele",
   "Nkembo a Yave muma zulu",
   "Vibidila alleluya",
   "Nkembo a Nzambi muna zulu",
   "Ye mu ntangu a mpulusu"
  ]
 },
 {
  "n": 142,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI MFUMU A BABONSONO",
  "lines": [
   "Yave Nzambi Mfumu a babonsono",
   "wutuwila mumamonsono tukulombele",
   "Mpeve aku nsadisi a babonso"
  ]
 },
 {
  "n": 143,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI MU MAZULU",
  "lines": [
   "Solo : Yave Nzambi muma zulu",
   "Tous : Fulu kiami mu zulu kiena",
   "Ye mu nkiama ndenda kio lembana",
   "Vo mono ngiena kuami wa mbote",
   "Ye mu nkiama ndenda kio lembana",
   "Vo mono ngiena kuami wasolua"
  ]
 },
 {
  "n": 144,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI TUKULOMBA",
  "lines": [
   "Solo : Yave Nzambi tukulomba",
   "Tous : Utusakumunanga",
   "utusunga utukeba, mu mambi",
   "mamonsono",
   "Solo : I yaya yaya iya yayi yaya yaya yaya",
   "Tous : I yaya ya iya yaya",
   "I yaya yaya iya yayi yaya yaya yaya",
   "I yaya ya iya yaya",
   "Solo : Sakumuna matulonga",
   "Tous : Sambu kieto nkunga mpe",
   "Wendila mavimpi tata nlongi tukudilanga kua Yave",
   "Solo : Utuyambudila nkanu",
   "Tous : Fuki, nganzi ye yayo",
   "wendila mavimpi tata nlongi",
   "tukudilanga kua Yave",
   "Solo : Tukutondele mu ntima",
   "Tous : Mu mambi makembongo",
   "Ye tuzolele mo vanga",
   "ye kulanda mu yayo",
   "Kamba mpangi zeto kuna",
   "Vo tutonda kua babo",
   "Batufidisi minlongi, mia tukembi mpulusu",
   "Vo bua kiese vo bua kiadi",
   "Vava nsi na zeyi vo",
   "wonso weti sanga vuvu, kana mona nsoni ko",
   "Ukiyekula kua Yave",
   "Nitu muela ye yayo",
   "Mpasi vo wabikua muana unasikila mu nzo"
  ]
 },
 {
  "n": 145,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI TUIZIDI MU FUKAMA",
  "lines": [
   "Solo : Yave Nzambi tuizidi mu fukama",
   "Tous : Kadi ngeye Mvangi’eto",
   "Nzitusu ye nsikulu",
   "Bifueni mpe kua nge mvu ya mvu",
   "Ngeye watusongele nzila mpulusu",
   "Bika tua kuzitisanga Mvuluzi",
   "Solo : Kina kusisa ko Nzambi ami",
   "Tous : Kilendi kusisa ko",
   "Kina kusisa ko Mvuluzi",
   "Mu zinzungu mpe ye mvuezolo"
  ]
 },
 {
  "n": 146,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI UNZOLELE KUAMI",
  "lines": [
   "Yave Nzambi unzolele kuami",
   "Inga nguilukidi kuami",
   "Nguilukidi, nguilukidi inga",
   "nguilukidi kuami"
  ]
 },
 {
  "n": 147,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI UTULEMVUKILANGA",
  "lines": [
   "Solo : Yave Nzambi utu lemvukilanga",
   "Tous : Mu mambi meto matuavolele",
   "Utusimbanga nate ye muntangu lufua",
   "Mpasi vo tualuaka ko"
  ]
 },
 {
  "n": 148,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI UZOLANGA BABONSO",
  "lines": [
   "Solo : Yave Nzambi uzolanga babonso",
   "Tous : Unokisanga mvula ndolo kua babo",
   "Yandi kaka zeyi mavanga ma muntu ka muntu O nkembo kua babo (bis)",
   "Solo : O nkembo,",
   "Tous : nkembo kua bavedila",
   "Solo : O nkembo,",
   "Tous : nkembo kua banlembami",
   "Bawilu mo mpe batambudi",
   "Lukala kiese mu mamo (bis)",
   "Solo : Tukutonda nge Yave mu ntima wa",
   "kedika",
   "Tous : Bu umeni kutu vana kedika kio",
   "Ngeye Yave utuvana lulendo lo",
   "Mpasi tuabedisa nza yayi"
  ]
 },
 {
  "n": 149,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI UZOLANGA VULUSA BANTU",
  "lines": [
   "Yave Nzambi uzolanga vulusa bantu",
   "Bukatuvana sielo biandi",
   "Mukutu natina kedika kiandi",
   "Mpasi vo tuavulusua",
   "Alleluya, alleluya",
   "Yave Nzambi wutuzolele",
   "Alleluya, alleluya",
   "Zolele babo bavuluswa",
   "Mbikudi miandi katufila",
   "Mambu ma moyo batunatina",
   "Bana mosadila siba nunga",
   "Siba yimbila alleluya"
  ]
 },
 {
  "n": 150,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI UTUZOLELE",
  "lines": [
   "Solo : Yave Nzambi utuzolele",
   "Tous : Watusa minlongi muamu",
   "Nza yayi ya masumu",
   "Bukabedisa satana nade",
   "Ye wavova buabu luendeno",
   "Solo : Luendeno, luendeno, luendeno",
   "Tous : Muna nza yayonsono",
   "Luenda samunina nsamu wambote",
   "Kadi Yave wamana bo vova"
  ]
 },
 {
  "n": 151,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI WAFIDISA MIMBIKUDI",
  "lines": [
   "Solo : Yave Nzambi wafidisa mibikudi",
   "Tous : Mpasi vo bakunlekilanga minu",
   "bana zamuna mu tiya tua mvu ya mvu"
  ]
 },
 {
  "n": 152,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI WATUNGA DIBUNDU",
  "lines": [
   "Solo : Yave Nzambi watunga dibundu",
   "Tous : Mameme mandi zeyi mo mamonso",
   "Sielo biandi i mimvungi kasola",
   "Mu dikilanga mo ye mu toma lunda mo",
   "Solo : Kua sielo biabio Yave Nzambi wavova",
   "Tous : Mameme mami kamalendi vila ko",
   "Bavidisa mo bamana singua babo",
   "Lukebeno mu mbandu yayi mpe",
   "Solo : Bakiasolua mu bundu dia nlongo",
   "Tous : Kimvuama kieno i mambu ma Nzambi",
   "Maluwanga mu bundu dia nlongo",
   "I nzila mpulusu lulenda vulusulua",
   "Solo : Lubisielo luwa ye minlongi",
   "Tous : Bavidisanga mameme ya sola",
   "Nsendo awu i zanga dia tiya",
   "Buba sadilanga mu nduenga za satana"
  ]
 },
 {
  "n": 153,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI WENA TUKA NTANGU YIKAYIBADIKI",
  "lines": [
   "Solo : Yave Nzambi wena tuka ntangu",
   "yikayibadiki",
   "Tous : Nateye mu ntangu yika yimani",
   "Solo : Nzambi eto",
   "Tous : Bika nkumbu aku yanzitusu yasikua",
   "Yazangama, va ntandu a nzitusu wawo",
   "Ye nsikulu yayo",
   "Solo : O Yave Nzambi ngeye kaka Mvuluzi eto",
   "Tous : Tuzolele babo tuavulusua kua nge"
  ]
 },
 {
  "n": 154,
  "lang": "Kikongo",
  "title": "TINANGA MU NTANGU ZAZO",
  "lines": [
   "Solo : Tinanga mu ntangu zazo",
   "Tous : Butumueni nganzi za Nzambi",
   "Tinanga mu ntangu zazo",
   "Butumueni nganzi za Nzambi",
   "Tinanga mu ntangu zazo"
  ]
 },
 {
  "n": 155,
  "lang": "Kikongo",
  "title": "TOMBE KIA FUKA MESO METO I SATANA",
  "lines": [
   "Solo : Tombe kiafuka meso meto i satana",
   "Tous : Yave Nzambi Mvuluzi ngeye ntemo a",
   "nza zibula meso meto mu ndongolo zaku Utusonga nzil‘aku mpasi tuavulusua",
   "Solo : Ngeye ikia kua nza Yave Nzambi",
   "Tous : Ukienzulanga bena mu tombe",
   "Kulumuna mampa ma moyo i mambu",
   "maku mena ma mpulusu",
   "Solo : Tuena mu mpinda beni ya masumu va",
   "nza",
   "Tous : Wiza nsualu Nzambi eto mu kutu vulusa",
   "Dimbu kia nlemvo aku i mambu ma kedika Kota mu ntima mieto do utuvulusa"
  ]
 },
 {
  "n": 156,
  "lang": "Kikongo",
  "title": "TUAKOTUSUA BETO BABONSO",
  "lines": [
   "Tuakotusua beto babonsono",
   "Mu bundu dia KCC",
   "Kua Yave Nzambi i Mvungi wabiza",
   "Tuatambula mambu ma moyo",
   "I mambu ma mpulusu",
   "Mpasi tuakota mu nkembo wa Nzambi",
   "Kedika ntangu i fueni kua beto",
   "Ntangu ifueni mu sadila Yave",
   "Ntangu ifueni kua beto",
   "Tuba kia solua Yave utuzolele",
   "Tukota mu Yave"
  ]
 },
 {
  "n": 157,
  "lang": "Kikongo",
  "title": "TUENDENO KUA YAVE BABONSONO",
  "lines": [
   "Solo : Tuendeno kua Yave babonsono",
   "Tous : Tutuikuanga zitu ye vangu bia nza",
   "Tuendeno kua Yave babonsono",
   "Yandi sika tuvundisa",
   "Solo : Tutalanga Mfumu eto Yave",
   "Tous : Mvungi eto wabiza",
   "Yandi lenda vana",
   "moyo wa mvu ya mvu"
  ]
 },
 {
  "n": 158,
  "lang": "Kikongo",
  "title": "TUKA VANA MBADUKULU VA TUA BUA",
  "lines": [
   "Solo : Tuka vana mbadukulu va tuabua",
   "Tous : Tuka vana mpuila yingi tuenina",
   "Yave Nzambi watufila Mbikudi",
   "Mina kutu samunina kedika",
   "Solo : Amen Yave Nzambi wiza",
   "Tous : Amen Yave Nzambi wiza",
   "Amen Yave Nzambi wiza",
   "Amen Yave Nzambi wiza",
   "Solo : Nowa ye Enoki bubakuikama",
   "Tous : Yave Nzambi eto wabavulusa",
   "Abalahami bukatoma sambila",
   "Loti muna sodomo wavulusua",
   "Vo zimpasi tueti mona vava nza",
   "Yave weti kutulonga sambila",
   "Lendo kiandi kina kutusadisa",
   "Mu bedisa ntantu eto satana"
  ]
 },
 {
  "n": 159,
  "lang": "Kikongo",
  "title": "TUKEMBISENO YAVE NZAMBI",
  "lines": [
   "Tukembiseno Yave Nzambi",
   "Bu tueti zinga vava nza yayi",
   "Tulembua mambi mamo ma nza yayi",
   "Manatanga ku mbungulu (bis)",
   "Luiza kota mu kembo uvulusanga",
   "Watuala bisielo bia Se",
   "Butuetilonga mambu ma Dise",
   "Tutatamana mu sadilanga ye toma tina",
   "Mpeve zazonsono zinatanga ku mbungulu"
  ]
 },
 {
  "n": 160,
  "lang": "Kikongo",
  "title": "TUKIDI MU NZAMBI KANA VILA KO",
  "lines": [
   "Tukidi mu Yave kana vila ko",
   "Tukidi mu Yave kana vila ko",
   "O kana vila ko"
  ]
 },
 {
  "n": 161,
  "lang": "Kikongo",
  "title": "TUKIDI VA NTOTO WENA MOYO VANTOTO",
  "lines": [
   "Tukidi va ntoto wena moyo vava ntoto",
   "Tukidi va ntoto wena moyo vava ntoto",
   "Bana ba Nzambi beti yamusua va ntoto",
   "Yave Nzambi kembo wena mu kayengele"
  ]
 },
 {
  "n": 162,
  "lang": "Kikongo",
  "title": "TUKOTA MU KIMPEVE",
  "lines": [
   "Solo : Tukota mu kimpeve situatambula",
   "Tous : Mamonso matulomba kua Yave Nzambi eto, Tukota mu kimpeve ye situatambula, Mamonso matulomba kua Yave Mvuluzi",
   "Solo : Do Yave Nzambi utubanzila",
   "Tous : Do utuvana lulendo luaku mpe",
   "Mpasi tuakala ngolo ye lulendo",
   "Mu nunganga nate ye nsukulu"
  ]
 },
 {
  "n": 163,
  "lang": "Kikongo",
  "title": "TUKUIKAMA MU YAVE NZAMBI TATA",
  "lines": [
   "Solo : Tukuikama mu Yave Nzambi",
   "Ye tuyangalala mu mambote mandi",
   "Tous : Tukuikama mu Yave Nzambi",
   "Ye tuyangalala mu mambote mandi",
   "Kia kua mpulusu tusimbanga kio",
   "Mpasi tuabedisanga satana mu nza"
  ]
 },
 {
  "n": 164,
  "lang": "Kikongo",
  "title": "TUKUIKAMA MU SALA SALU KIA YAVE",
  "lines": [
   "Tukuikama mu sala salu kia Yave",
   "Yave Nzambi eto utuzolele",
   "Mbutu mia mpeve i nsendo a bulemvo",
   "Tuyimbila mu sanisina Mfumu",
   "Bika tuavanga luzolo luandi",
   "Bika tuasadila Yave Nzambi",
   "Nsendo a salu kia Nzambi",
   "I Mpulusu a muela",
   "Ye kota mu kayengele",
   "Nsendo a salu kia Nzambi",
   "I Mpulusu a muela",
   "Tusadilanga matulonguanga",
   "Mfumu Nzambi weti bokila babonso",
   "Mpasi tuatambula mambu ma mpulusu",
   "Ye sala salu kiandi mu dibundu",
   "Mu kintuadi ye mpeve ya kedika",
   "Nsololo yoyo ya lusakumunu",
   "Kua wonso wena ntima wavelela",
   "Mu sala salu kia Yave Nzambi eto",
   "Ye tambula nsendo muna kayengele"
  ]
 },
 {
  "n": 165,
  "lang": "Kikongo",
  "title": "TULUBUKENO MU MAMBU MA YAVE",
  "lines": [
   "Tulubukeno mu mambu ma Yave",
   "Ma tueti longua bika tualubukeno (bis)",
   "E mu mambu",
   "Mu mambu ma Yave mamonsono",
   "Tuetilongua, bika tualubukeno",
   "Mu mambu ma Yave mamonsono",
   "Tueti longua vava ntoto, bika tualubukeno",
   "Mambu ma Yave mamonsono",
   "Tueti longi kua bisielo, bika tua lubukeno"
  ]
 },
 {
  "n": 166,
  "lang": "Kikongo",
  "title": "TUSALA SALU KIA YAVE NZAMBI",
  "lines": [
   "Tusala salu kia Yave Nzambi",
   "Mu kedika ye mu lunungu",
   "Mpasi Yave Nzambi yasikila mu beto",
   "Ye tambula nsendo wa kedika",
   "Mu moko mandi muna kayengele",
   "O o tuzaya vo, tuzaya vo",
   "Minu kio kikondolo mavanga",
   "O minu kiokio kia fua kiena",
   "Minu kio kikondolo mavanga",
   "O minu kiokio kia fua kiena",
   "Mu bundu diodio dia banlongo",
   "Tuzaya vo sala ye sambila",
   "Kadi beto tuena basolua",
   "Mu sadisa bundu dia banlongo",
   "Nsendo eto muna kayengele"
  ]
 },
 {
  "n": 167,
  "lang": "Kikongo",
  "title": "TUTONDA E E TUTONDA",
  "lines": [
   "Solo : Tutonda e e tutonda",
   "Beto tuafuila nkenda kua Nzambi eto",
   "Bukatusongele nzila mpulusu",
   "Tutonda e e tutonda",
   "Tous : Tutonda e e tutonda",
   "Beto tuafuila nkenda kua Nzambi eto",
   "Bukatusongele nzila mpulusu",
   "Tutonda e e tutonda"
  ]
 },
 {
  "n": 168,
  "lang": "Kikongo",
  "title": "TUTONDA NZAMBI ETO MU MAMONSONO",
  "lines": [
   "Solo : Tutonda Nzambi eto mu mamonsono",
   "kadi wena wambote ntangu zazonsono",
   "Tous : Tutonda Nzambi eto mu mamonsono",
   "kadi wena wambote ntangu zazonsono",
   "Solo : I yandi wavanga zulu ye ntoto",
   "Kadi wena wambote ntangu zazonsono",
   "Tous : I yandi wavanga zulu ye ntoto",
   "Kadi wena wambote ntangu zazonsono"
  ]
 },
 {
  "n": 169,
  "lang": "Kikongo",
  "title": "TUTONDA TUTONDENO MPUNGU TULENDO",
  "lines": [
   "Solo : Tutonda tutondeno Mpungu Tulendo",
   "Tous : I yandi watuvangidi mangitukulu",
   "Bukatusongele nzila mpulusu",
   "Tutonda e e tutonda",
   "Solo : Lubana ba Nzambi",
   "Tous : Tutonda Yave",
   "Solo : Lubakiasolua",
   "Tous : Tutonda Yave",
   "I yandi watuvangidi mangitukulu",
   "Tutonda e tutonda",
   "Bukatusongele nzila mpulusu",
   "Tutonda e e tutonda"
  ]
 },
 {
  "n": 170,
  "lang": "Kikongo",
  "title": "TUVUMINA YAVE MU NTANGU ZAZO",
  "lines": [
   "Solo : Tuvumina Yave mu ntango zazo",
   "Tous : Tuvumina Yave mu ntango zazo",
   "Situa vungua kua Nzambi a moyo",
   "Tuvumina Yave mu ntango zazo",
   "Bana beto sibavungua mpe",
   "Solo : Nzambi wanlongo wanlongo kena",
   "Tous : Beto mpe va ntoto tutina mambi",
   "Kadi yandi wanlongo kena",
   "Tutinanga nsumukunu zazo",
   "Tuanzitiseno mu ntangu zazo"
  ]
 },
 {
  "n": 171,
  "lang": "Kikongo",
  "title": "TUZITISA YAVE NZAMBI",
  "lines": [
   "Tuzitisa Yave Nzambi",
   "Katumfuemisa kutu ko",
   "Tuyangalala ah ah ah",
   "Kadi yandi i Nzambii eto",
   "Tusungama mu nzila Yave",
   "Katu vengama kutu ko (bis)",
   "Tusikila mu Yave Nzambi",
   "Si tuabaka luvundulu (bis)",
   "Tukembisa Yave Nzambi",
   "Kadi yandi i Mvuluzi (bis)"
  ]
 },
 {
  "n": 172,
  "lang": "Kikongo",
  "title": "ULEMBUA ZOLANGA ZIMPANGI",
  "lines": [
   "Solo : Ulembua zolanga zimpadi kazeyi Nzambi",
   "ko",
   "Tous : Ka nsambidi a lunungu ko",
   "Kinlongo kia konso muntu mu zola kienina, i muau muena nsendo miamio",
   "Solo : Tuzolana kueto zimpangi zami",
   "Tous : Tusalasana mu mawonsono",
   "Yave Nzambi uzolanga bantu babo",
   "Usadisanga mu mpasi zazo",
   "Ulembua zolanga dibundu dia Yave Nzambi eto",
   "I mbeni a kedika nkundi a satana",
   "Kondolo kedika kia mambu ma Yave Nzambi eto",
   "Ye wena nkuna wa mbungulu",
   "Zola kua kedika kuena zola kua lembami",
   "Kutukisanga luvuvamu",
   "Mu konso fulu kuena zola kua Yave Nzambi",
   "Yave Nzambi ukembusuanga"
  ]
 },
 {
  "n": 173,
  "lang": "Kikongo",
  "title": "UKIESE KIAMI VA NZA MFUMU",
  "lines": [
   "Ukiese kiami va nza Mfumu",
   "Kimbangi kiaku i nienzi ami",
   "Umpana zola kua kedika",
   "Mpasi yakembisa nkumbu aku",
   "Kakuena nkumbu ya nkaka ko vava nza",
   "Kizeyi nkumbu ya nkaka ko kedika",
   "I yoyo ya Yave Nzambi kaka",
   "I yoyo yena mpe lendo mu mamo",
   "Mu yau yi vulusulua"
  ]
 },
 {
  "n": 174,
  "lang": "Kikongo",
  "title": "UTU YAMBUDILA UTULEMVUKILA",
  "lines": [
   "Utuyambudila utulemvukila",
   "Mu mamonso ma tuavolele",
   "O o Yave",
   "Utuyambudila, utulemvukila",
   "Mu mamonso matuavolele"
  ]
 },
 {
  "n": 175,
  "lang": "Kikongo",
  "title": "VANA MU KIESE VANA KUA YAVE",
  "lines": [
   "Vana mu kiese vana kua Yave",
   "Vana mu kiese i kulombele",
   "Vana mu sadikisa salu kia Yave",
   "Vana mu kiese i kulombele",
   "Kionso kionso ki ubeki",
   "Vana kua Yave",
   "Kiakinene evo kia kike",
   "Kionso kiena mu kimvuama kiaku",
   "Kionso kiena mu kimputu kiaku",
   "Vana nkayilu kua Yave",
   "Vana ntima mpe",
   "Mu mimbutu miaku mia Mpeve",
   "Mu mimbutu miaku mia mpuenia",
   "Vana mu sadisa salu kia Yave",
   "Vana kifueni ikulombele"
  ]
 },
 {
  "n": 176,
  "lang": "Kikongo",
  "title": "VANENO MINKAYILU KUA YAVE",
  "lines": [
   "Vaneno minkayilu kua Nzambi",
   "Yave Nzambi tambula mio",
   "Musadisa dibundu dia banlongo",
   "Salu kio kia mpulusu",
   "Lubatata ye bamama luvaveno mu ntima kia",
   "Mono ngieti vanina mu kiese",
   "Mu mayangi ma ntim‘ami ngieti vanina",
   "Kua Yave kadi yandi Mvuluzi eto",
   "Tusaleno mu dibundu dia Nzambi",
   "Mutomisa ye kudisa dio",
   "Mu biakinsuni ye mpe bia kimpeve",
   "Mu vana nkembo kua Mpungu Tulendo",
   "Bundu dia Nzambi i kabu dia banlongo",
   "Mu diau tukuduswanga",
   "Mu bikua bana ba Yave a moyo",
   "Ye bombwanga mu mbanza banlongo"
  ]
 },
 {
  "n": 177,
  "lang": "Kikongo",
  "title": "VANENO KUA YAVE ETO",
  "lines": [
   "Solo : Vaneno kua Yave eto",
   "Tous : Mpasi tuatambula lusakumunu",
   "Solo : Nki a lusakumunu tuna tambula e e",
   "Tous : Lua biza, lua komua, lua nikusua",
   "Ye luasampa, sikatuvana mu nkata zeto",
   "Solo : Tusadiseno bundu dia banlongo",
   "Tous : Mpasi tuatambula lusakumunu",
   "Yave Nzambi i Se dia banlongo",
   "Tuansadila mu Mpeve ye kedika"
  ]
 },
 {
  "n": 178,
  "lang": "Kikongo",
  "title": "VO LUA MENI KUKIYEKULA KUA YAVE",
  "lines": [
   "Vo luameni kukiyekula kua Yave",
   "Kaluvisuk ani ntima ko (bis)",
   "Lekila Yave minu",
   "Lekila Yave minu",
   "Vo buakiese vo bua kiadi",
   "Kaluvisukani ntima ko"
  ]
 },
 {
  "n": 179,
  "lang": "Kikongo",
  "title": "VO LUFUA VO NTOTOLO",
  "lines": [
   "Vo lufua vo ntotolo",
   "Landa kaka nzila Yave Nzambi",
   "E Mfumu Yave i Nzambi eto",
   "Yandi kaka lenda kutu vulusa",
   "E yayi nsabi a zulu ibaku veni kuaku",
   "Tatamana mu mambu mawatambudidi",
   "Yoyo nsabi a zulu i bakuveni kuaku",
   "Nsabi a zulu i mambu ma Se",
   "Mu zinzungu mpe mu nza",
   "Yave kaka lenda kututanina",
   "Yandi wena lendo mu mamo",
   "Ye bedisanga satana nade",
   "Mu Yave kaka muena ndungunu",
   "Mu Yave kaka muena nzila Mpulusu",
   "Mu kayengele weti kubikanga fulu bieto",
   "Mu mbanza nsilulu"
  ]
 },
 {
  "n": 180,
  "lang": "Kikongo",
  "title": "VO LUKUNZOLANGA",
  "lines": [
   "Solo : Vo lukunzolanga",
   "Tous : Lukembanga nsikudusu zami",
   "Kadi beno ya solele mu kintumua",
   "Mu kamba nsamu kua nza",
   "Vo mono Yave i Mvuluzi eno beno babo",
   "Solo : Lutelema luenda",
   "Tous : Bankaka bakidi bakangama",
   "Lutelema luenda",
   "Bankaka bakidi mu boloko",
   "Lubasonga kaka vo Yave lenda kuluvulusa",
   "Solo : Lulonga bantu",
   "Tous : Bonso buenina kedika kia masonukua",
   "Bu wetilonga ukitala vo nge wena wavedila",
   "Mpasi Yave Nzambi kakala yaku mu samuna"
  ]
 },
 {
  "n": 181,
  "lang": "Kikongo",
  "title": "VO MAYELA VO MVUEZOLO SIAMA MU MINU",
  "lines": [
   "Vo mayela vo mvuezolo mpe",
   "Siama mu minu ye telema na ngui",
   "Siama mu minu ye bedisa mpe",
   "Siama mu ntangu zazo",
   "Oh oh siama mu Yave",
   "Siama mu Yave mu ntangu zazo",
   "Siama mu Yave watuvulusa",
   "Siama mu ntangu zazo"
  ]
 },
 {
  "n": 182,
  "lang": "Kikongo",
  "title": "VO MU NKO WETI ZINGILANGA",
  "lines": [
   "Vo mu nko weti zingilanga vava ntoto",
   "Vo mu nko weti zingilanga vava nsi",
   "Toma yindula diodio mu madiela",
   "Toma bombidila Mfumu kavilula madiela"
  ]
 },
 {
  "n": 183,
  "lang": "Kikongo",
  "title": "VO TUMONA NZUNGU MU SALU KIA YAVE",
  "lines": [
   "Vo tumona nzungu mu salu kia Yave",
   "Si tuabombua kueto mu mazulu",
   "Mpasi nzungu nkuamusu ntotolo",
   "Tufueti vibidila bio ntangu zazo",
   "Sielo longa mambu ma Yave",
   "Longa mpe zintotolo zena mo",
   "Mu nduanunu ye ndungunu eto",
   "Tukembisange Yave Nzambi nade",
   "Beto Kanda dia Yave mu nza yayi",
   "Tufueni zitisanga Yave Nzambi",
   "Vo kiese vo zimpasi tueti monanga",
   "Tukiyekulanga kua Yave Nzambi"
  ]
 },
 {
  "n": 184,
  "lang": "Kikongo",
  "title": "VO ZOLELE NKUNDI WATOMA ZINGA VAVA NZA",
  "lines": [
   "Vo zolele nkundi watoma zinga vava nza",
   "Sadila nsiku mia Yave Nzambi",
   "Wonso muntu uzitisanga nsiku miandi miamionsono",
   "Wena mu kiese ye mu luvuvamu",
   "Nsiku mia Yave Nzambi miena ntomosono",
   "Tomakeba mio tomasimba mio",
   "Ye malonganga mi mbikudi tusadilanga mo",
   "Beto babo tuena banzenza kaka va nza yayi",
   "Tuvanga luzolo lua yave Nzambi",
   "Mu lemvuka beto babo tusadila Nzambi eto",
   "Tuamvana nkembo ye nzitusu babo",
   "Tukituleno nitu zeto kinlongo kua Nzambi eto",
   "Watuvanga mu kifuani kiandi",
   "Yandi fueni mu tambula nkembo ye",
   "Nzitusu kua beto ye sikila ye",
   "Yandi kuele mvu"
  ]
 },
 {
  "n": 185,
  "lang": "Kikongo",
  "title": "WAUNENE WAUKE",
  "lines": [
   ": / Waunene wauke",
   "kua Nzambi kuena moyo wa mvu ya mvu / :",
   "O tukubama ye mukusambila",
   "Yave Nzambi wa nlongo kenina",
   ": / Mu wawana ye yandi kala wa nlongo : /",
   "Mu zinzungu vava nza",
   "Kua Yave kaka kuena ye mbombolo",
   "Mu zi nzungu vava nza",
   "Kua Yave kaka kuena ye mbombolo",
   "Mu mpinda za masumu sa nsualu",
   "Wiza kua Yave i Mvuluzi",
   "Mu mpinda za masumu sa nsualu",
   "Wiza kua Yave i Mvuluzi",
   "Yave Nzambi i Mvuluzi nade",
   "Kua yandi kaka tulenda vulusua",
   "Yave Nzambi i Mvuluzi nade",
   "Kua yandi kaka tulenda vulusua"
  ]
 },
 {
  "n": 186,
  "lang": "Kikongo",
  "title": "WENDA KU ZULU NGE VEKA",
  "lines": [
   "Wenda kuzulu nge veka",
   "Wenda kuzulu nge veka",
   "Wa lembua kuenda ku zulu",
   "Nge veka e e muana Nzambi nge veka",
   "Wamona Yave Nzambi nge veka",
   "Wenda ku mbungulu nge veka"
  ]
 },
 {
  "n": 187,
  "lang": "Kikongo",
  "title": "WONSO WONSO WIZIDI MU NKUMBUA MFUMU",
  "lines": [
   "Wonso wonso wizidi mu nkumbu a Mfumu",
   "Yandi i muana wa lusakumunu",
   "Mu yandi muna kala mbutu mia mpeve",
   "Nsendo andi zulu dia Nzambi",
   "O o beto tuizi finama kua ngeye Yave",
   "O o beto mpe tukulombele utufinama",
   ": / Wutuwe ye wutuvua Tata",
   "beto kanda diaku dia lusakumunu",
   "Mfumu eto Yave weti vingilanga",
   "Wonso wonso zolele vo kavulusua",
   "Zola kuena yandi kakuena nsuka ko",
   "Nkenda ye nlemvo biena yandi",
   "Vo wonga wa masumu wena mu ntim‘aku",
   "Ngeye sa nsualu, wiza kua Yave",
   "Songa kaka masumu maku mamonsono",
   "Yandi sikakuvedisa"
  ]
 },
 {
  "n": 188,
  "lang": "Kikongo",
  "title": "YATOMENE VISA MBIKUDI BIA FILUA VA NZA",
  "lines": [
   "Yatomene visa mbikudi biafilua va nza",
   "Kua ba nkua masumu mpasi vo bavulusua",
   "Ya vola masumu Yave wangiambudila",
   "Yakala mu mpasi kansisa kinsona ko",
   "Mpulusu ami yena kua nge Yave",
   "U Nzambi ami kua ngeye nsidi vuvu",
   "Mu zingu kiami vava nza",
   "U Nzambi ami kua ngeye nsidi vuvu",
   "Kumvilakana ko",
   "Yatomene visa satana kua kimpala",
   "Kua bana ba Nzambi bena mu nzila moyo",
   "Mu nzungu zambuila yandi wayangalala",
   "Mu mpeve a bunkita watomba mpe yavila"
  ]
 },
 {
  "n": 189,
  "lang": "Kikongo",
  "title": "YAVEDUSUA YAYIKA KIA SALA WONGA KO",
  "lines": [
   "Yavedusua yayika kiasala wonga ko",
   "Mu yimbila boka ibokanga",
   "Masumu masanga nsoni mono yalosa mo",
   "I diau ibokanga mu kiese",
   "Masumu mavambisanga",
   "Muntu ye Nzambi andi",
   "Masumu masanga nsoni",
   "Mu yimbidila Yave",
   "Ya vedusua yayika kiasala wonga ko",
   "Mu yimbila boka i bokanga",
   "Masumu ma sanga nsoni mono yalosa mo",
   "I diau ibokanga mu kiese",
   "Mu Yave ngiena moyo",
   "Ye mpulusu nade",
   "Mu nza yayi kuena umosi ko",
   "Ulenda vulusanga, ku moyo wa mvu ya mvu",
   "Idiau nginasikila mu Yave",
   "Nsamua mbote i nzila, kedika ye moyo",
   "I wawu kaka ngina landanga",
   "Mu wawu kaka muena nzila kayengele",
   "I mbanza ya banungini"
  ]
 },
 {
  "n": 190,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI I NANI MU KEDIKA",
  "lines": [
   "Solo : Yave Nzambi i nani mu kedika",
   "Tous : Mvuluzi a miela mu nza yayo",
   "Toma vuandisa Yave mu ntim‘aku",
   "Mfumu Yave i Nzambi ya kedika",
   "Solo : O mambu na Nzambi nzil‘ami ya",
   "mpulusu",
   "Tous : Muel’ami yangalala yimbidila Mvuluzi",
   "O nkembo nkembo kua Yave unzolele",
   "O nkembo nkembo kua Yave i Mvuluzi",
   "Bue ilenda zingila ye Mvuluzi",
   "I muvanga mamo kazolanga",
   "Kala bonso dimeme diodio dia lembama",
   "Si wazolua kua Yave Mvuluzi"
  ]
 },
 {
  "n": 191,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI MVULUZI SIMBA MUEL‘AMI",
  "lines": [
   "Yave Nzambi Mvuluzi simba muel‘ami",
   "Ye kusadilanga mu nzila zaku",
   "Mfumu tala muel‘ami weka lemina",
   "Bu nzolele kusadila mu mvu miamionsono",
   "Nki nginavanga kua Yave Mvuluzi",
   "I mu kukiyekula kua Yave Mvuluzi",
   "Nitu ye muel‘ami wawo",
   "Ye kusadilanga mu mvu ya mvu ya mvu",
   "Nitu ye muel‘ami wawo",
   "Ye kusadilanga mu mamonsono"
  ]
 },
 {
  "n": 192,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI NGE MVULUZI ETO",
  "lines": [
   "Solo : Yave Nzambi nge Mvuluzi eto",
   "Tous : Zeyi mpuila zeto zazo",
   "Tuizidi fukama va ntadisi aku",
   "Tuzolele tuasansua kua nge",
   "Solo : Mavanga ma Yave Nzambi",
   "Tous : Tuzolele mo tuzolele kueto",
   "Tuzolele beto babo",
   "Tuzolele mo, tuzolele kueto",
   "Tuzolele mavanga ma Yave Nzambi",
   "Solo : Beto babo tuateka zaya mpulusu ko",
   "Tous : Tuakala mu tombe kia mambi",
   "Kansi mu nlemvo a Nzambi eto",
   "Wafidusa Mbikudi miandi",
   "Solo : Zola kua Nzambi kulutidi mamo",
   "Tous : Watufila mbikudi miandi",
   "Mu kutu natina mambu mandi",
   "Mpasi tuavewa kiese kia zulu"
  ]
 },
 {
  "n": 193,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI NGINA LANDA",
  "lines": [
   "Yave Nzambi nginalanda",
   "Ngina landa e e teye nsukulu",
   "Kansi nza yayi",
   "Ngina landa bia nza yayi ko",
   "Yave Nzambi ngina landa",
   ": / Ngina landa e e e teye nsukulu : /",
   "Mu Yave muena moyo",
   "Muena moyo o o o wa mvu ya mvu"
  ]
 },
 {
  "n": 194,
  "lang": "Kikongo",
  "title": "YAVE NZAMBI WETI KUSONGA NZILA",
  "lines": [
   "Yave Nzambi wetikusonga nzila",
   "Nzila yi tufueti diatila",
   "Nzila ya kedika i nzila ya sungama",
   "Mpasi vo tuavulusua",
   "O nzila yo kaluzimbisa ko",
   "I yoyo ya diatila sielo biabio",
   "Wonso zolele vulusa",
   "Kadiatila mu nzila singama",
   "Nsiku miandi i mambu mandi",
   "Yandi watusongele mo",
   "Kedika kiandi tusadila kio",
   "Beto situavutulua"
  ]
 },
 {
  "n": 195,
  "lang": "Kikongo",
  "title": "YAVE YAVE YAVE NZAMBI",
  "lines": [
   "Solo : Yave, Yave, Yave Nzambi",
   "Tous : Katalanga muntu ko",
   "Yave, Yave, Yave Nzambi",
   "I ntima katalanga",
   "Solo : Kimvuama kia nza va ntadisi a Yave",
   "Tous : Ka kienandi ndandu ko",
   "Kimvuama kia nza va ntadisi a Yave",
   "Ka kiena ye ndandu ko"
  ]
 },
 {
  "n": 196,
  "lang": "Kikongo",
  "title": "ZINGUNDA ZENA YAMI",
  "lines": [
   "Zingunda zena yami za tatukila nza",
   "Ye kotazulu dia Yave ye kala va kena",
   "Mu sisa kiadi kiami ye mpasi zazonsono",
   "Mayangi tuna kala ye Yave Nzambi eto",
   "Zingunda zena yami zatatukila nza",
   "Ye sikila ye Nzambi, mu ntangu zazonso",
   "Zingunda zazo ngiena zankaka ngiena mpe",
   "Ibanzilanga bantu, balembua kangama"
  ]
 },
 {
  "n": 197,
  "lang": "Kikongo",
  "title": "ZIMPASI ZETIKUIZANGA",
  "lines": [
   "Zimpasi zetikuizanga",
   "Kansi beto kuikameno",
   "Mu zinzungu ye zintotolo",
   "Tunasiama, tunasiama",
   "Tunasiamanga babo te nsukulu",
   "Alleluya !",
   "Tuna siama, tuna siama",
   "Tuna siamanga babo te nsukulu",
   "Mu zinzungu ye malema, tueti tadidila Yave",
   "Wena ye lendo kia nunga nza",
   "Tukivana , tukivana, tukivana babo kua Nzambi eto",
   "Ndungunu yena mu Yave, luvuvamu lukumbanga",
   "Bonso nto ye lusakumunu, ye mu minu, ye mu vuvu",
   "Tuena nunguswa ye bombua babo"
  ]
 },
 {
  "n": 198,
  "lang": "Kikongo",
  "title": "ZIMPANGI ZETO BAMENI BAKA MPULUSU",
  "lines": [
   "Zimpangi zeto bameni baka mpulusu",
   "Beto babonsono tulendo baka yo",
   "Bampangi zeto bameni baka mpulusu",
   "Beto babonsono tulenda baka mpulusu",
   "O mpulusu tuasilua",
   "Mpulusu yena mu Nzambi eto",
   "O mpulusu tuasilua",
   "Beto babonsono tulenda baka mpulusu"
  ]
 },
 {
  "n": 199,
  "lang": "Kikongo",
  "title": "ZIBULA NTIMA",
  "lines": [
   "Zibula ntima",
   "Mono nzibudi ntima",
   "Mambu ma Nzambi mena ma mpulusu",
   "Mu mau ngina tomusunua ye nungusua",
   "Kua Yave Mfumu‘ami",
   "Mu mau muena moyo wa mvu ya mvu",
   "Ungieti vingilanga",
   "Vumina Yave, nkundi vumina Yave",
   "Yandi i Mvangi a biabionsono",
   "Yandi i Se dieto Mvangi a biabionsono",
   "I Mpungu Tulendo, mu yandi tuena moyo",
   "Wa mvu ya mvu",
   "U tueti vingilanga"
  ]
 },
 {
  "n": 200,
  "lang": "Kikongo",
  "title": "ZOLA KUENA YAMI MFUMU",
  "lines": [
   "Zola kuena yami Mfumu",
   "Zola kuena yami Mfumu",
   "Zola kuena yami Mfumu ka kua ngolo ko",
   "Ibokanga kua ngeye Yave Nzambi ami",
   "Ngeye wena lendo kiami mu mamonsono",
   "Wiza wakunsadisa mpasi ya nunga nza",
   "O beto bantu nani tuna kembela",
   "Yave Nzambi kaka tuna kembela",
   "Wa nlongo o o wa nlongo o o",
   "Wa nlongo ku zulu kena"
  ]
 },
 {
  "n": 201,
  "lang": "Kikongo",
  "title": "ZOLA KUA NZAMBI KULUTIDI",
  "lines": [
   "Solo : Zola kua Nzambi kulutidi",
   "Tous : Kua tukubikila kiese mpe",
   "Kiese kia zulu tuasilulu",
   "Kiese kia kayengele",
   "Solo : Mu zola kua kiese kia",
   "Dise mu kuau tuizidi",
   "Tous : Kiese kia kayengele tubimbanga kio",
   "Tuena nsilulu a kiese kio kua Nzambi eto",
   "Mu Yave muena nzila ya kedika",
   "Nsabi a zulu yena kua yandi",
   "Solo : Luzimpangi tuendeno",
   "Tous : Tuatambula kiese kia nsilulu",
   "Kiatukubikila Nzambi eto",
   "Kiese kia kayengele",
   "Solo : Lubanlongo lukuikama",
   "Tous : Mpasi lua kota mu kayengele",
   "Kiese kia zulu tuasilulu",
   "Kiese kia kayengele"
  ]
 }
];
