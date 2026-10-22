import type { MobileProvider } from '@/features/music/shop';
import type { Tri } from '@/i18n';

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

/**
 * Numéros Mobile Money où envoyer un don, affichés dans l'espace « Faire un don »
 * de /solidarite. Uniquement les numéros confirmés par Reagan.
 */
export interface DonationAccount { provider: MobileProvider; number: string; holder: string }
export const DONATION_ACCOUNTS: DonationAccount[] = [
  { provider: 'orange_money', number: '+243 840 238 592', holder: 'Reagan MBUMBA MBUMBA' },
  { provider: 'mpesa', number: '+243 861 271 633', holder: 'Reagan MBUMBA MBUMBA' },
];

/**
 * Paiement depuis le site (le donateur saisit son numéro et confirme sur son téléphone).
 * Passer à true une fois le compte marchand FlexPay ouvert et la fonction `dons-solidarite`
 * déployée (voir docs/DONS.md).
 */
export const ONLINE_DONATIONS_OPEN = false;

/** Opérations auxquelles un don peut être rattaché (même ordre que SolidarityOperations). */
export const DONATION_OPERATIONS = [
  { key: 'ngidinga', label: { fr: 'Opération 100 chaises — Ngidinga', en: 'Operation 100 Chairs — Ngidinga', pt: 'Operação 100 cadeiras — Ngidinga' } },
  { key: 'general', label: { fr: 'Solidarité en général', en: 'General solidarity', pt: 'Solidariedade em geral' } },
] as const;

/**
 * Listes publiques des contributions, reprises des listes finales des groupes WhatsApp.
 * Jamais de numéro de téléphone.
 */
export interface Contribution { flag?: string; name: string; amount: string }
export const CONTRIBUTIONS: Record<'luanika' | 'ngidinga', Contribution[]> = {
  luanika: [
    { flag: '🇨🇩', name: "Son Éminence Dizolele MPUNGU ISAAC", amount: '300 $' },
    { flag: '🇦🇴', name: "Apôtre DOCOLO NDULI", amount: '11 $' },
    { flag: '🇿🇦', name: "Apôtre Lubini Irma", amount: '21 $' },
    { flag: '🇨🇬', name: "Apôtre Dieudonné Ngimbi", amount: '21 $' },
    { flag: '🇺🇸', name: "Apôtre Eduardo Lukeba", amount: '25 $' },
    { flag: '🇨🇩', name: "Apôtre Mantuakila Ernest", amount: '11 $' },
    { flag: '🇨🇦', name: "Famille Révérend Apôtre E. Cardoso", amount: '120 $' },
    { flag: '🇬🇧', name: "Apôtre Michael Kasu", amount: '30 $' },
    { flag: '🇨🇬', name: "Papa Sielo Mbambi", amount: '10 $' },
    { flag: '🇬🇧', name: "Papa Sielo Pangala Kianza", amount: '30 $' },
    { flag: '🇨🇩', name: "Prédi Reagan MBUMBA", amount: '20 000 FC' },
    { flag: '🇨🇩', name: "Prédi Mbuku Blaivani", amount: '20 000 FC' },
    { flag: '🇨🇩', name: "Prédi Béni Nseke Nseke", amount: '20 000 FC' },
    { flag: '🇨🇩', name: "Prédi Yves Manzuani", amount: '15 $' },
    { flag: '🇨🇩', name: "Prédi Bosco Zimbu", amount: '20 000 FC' },
    { flag: '🇨🇩', name: "Prédi Muizila Jacques Taylor", amount: '23 000 FC' },
    { flag: '🇨🇩', name: "Prédi Di-MPUNGU Querth", amount: '15 $' },
    { flag: '🇨🇩', name: "Prédi Kumbu Panzu André", amount: '10 $' },
    { flag: '🇨🇩', name: "Prédi Prosper Lokusa", amount: '10 $' },
    { flag: '🇨🇩', name: "Fondation Beaugabel Gloire Mabanza (FBGM)", amount: '100 000 FC' },
    { flag: '🇦🇴', name: "Prédi Muteketa Khonde", amount: '11 $' },
    { flag: '🇨🇩', name: "Prédi Eder Nlandu Masaki", amount: '15 $' },
    { flag: '🇨🇩', name: "Prédi Trésor Muanda", amount: '15 $' },
    { flag: '🇨🇩', name: "Prédi Kionga Sevolo Jordi", amount: '10 $' },
    { flag: '🇨🇩', name: "Prédi Celio Lukanu", amount: '9 $' },
    { flag: '🇨🇩', name: "Prédi Gracy SHUNGU", amount: '22 000 FC' },
    { flag: '🇨🇩', name: "Prédi Apollinaire Nsunda", amount: '25 000 FC' },
    { flag: '🇨🇩', name: "Prédi Polydore Modeste", amount: '35 000 FC' },
    { flag: '🇨🇩', name: "Prédicateur Dizolele KUMBU", amount: '10 $' },
    { flag: '🇨🇩', name: "Prédi Binkoko Matundu Dolly", amount: '20 000 FC' },
    { flag: '🇨🇩', name: "Prédi Nsimba Mayindu Samuel", amount: '50 000 FC' },
    { flag: '🇳🇱', name: "Prédi R. K", amount: '50 $' },
    { flag: '🇿🇦', name: "Prédi Miranda", amount: '30 $' },
    { flag: '🇿🇦', name: "Prédi Beti", amount: '20 $' },
    { flag: '🇨🇩', name: "Prédi Isaac Vambanu Lukombo", amount: '24 000 FC' },
    { flag: '🇨🇩', name: "Disc. Méthode Akawa", amount: '20 000 FC' },
    { flag: '🇺🇸', name: "Disciple Landry Bamba Miak’s", amount: '21 $' },
    { flag: '🇧🇷', name: "Disc. Rolly Daniel Nzoussi", amount: '7,6 $' },
    { flag: '🇬🇦', name: "Disc. Grâce Matondo", amount: '7 $' },
    { flag: '🇷🇺', name: "Disciple Gaga Stache", amount: '11 $' },
    { flag: '🇨🇩', name: "Disc. Jeancy Mambungu Atumbila", amount: '10 000 FC' },
    { flag: '🇨🇩', name: "Disciple Serge TSHINKELA", amount: '23 000 FC' },
    { flag: '🇨🇩', name: "Disciple Jeancy Fatou", amount: '20 000 FC' },
    { flag: '🇨🇩', name: "Maman PELAGIE Mankutima", amount: '50 $' },
    { flag: '🇨🇩', name: "Diaco Élodie MBUMBA", amount: '11 000 FC' },
    { flag: '🇫🇷', name: "Diaco Albertine Ngoma", amount: '22,5 $' },
    { flag: '🇨🇩', name: "Maman Diaco Rolande Lutumba", amount: '22 000 FC' },
    { flag: '🇫🇷', name: "Diaconesse Fifi", amount: '20 $' },
    { flag: '🇨🇩', name: "Diaco Bibi", amount: '10 $' },
    { flag: '🇨🇩', name: "Diaco Maniongo Augustine", amount: '12 000 FC' },
    { flag: '🇨🇩', name: "Maman Diaco Clarisse Lutadio", amount: '5 $' },
    { flag: '🇫🇷', name: "Diac. Mabiala Adélaïde", amount: '20 $' },
    { flag: '🇨🇩', name: "Diac. Julian Nkikela", amount: '22 000 FC' },
    { flag: '🇿🇦', name: "Diac. Mifi Songisa", amount: '5 $' },
    { flag: '🇫🇷', name: "Diaconesse Mamie Ntantu", amount: '12,50 $' },
    { flag: '🇨🇩', name: "Maman Élysée Dialungila", amount: '15 000 FC' },
    { flag: '🇨🇩', name: "Maman M.K", amount: '10 $' },
    { flag: '🇺🇸', name: "Maman Candy Nguimbi", amount: '21 $' },
    { flag: '🇺🇸', name: "Maman RN", amount: '50 $' },
    { flag: '🇨🇩', name: "Maman Sirozette Panzu MPOLO", amount: '50 $' },
    { flag: '🇿🇦', name: "Mama Claumi Kueluyele", amount: '10 $' },
    { flag: '🇿🇦', name: "Maman Celo Wunkeba", amount: '3 $' },
    { flag: '🇨🇩', name: "Maman R.K", amount: '11 $' },
    { flag: '🇨🇩', name: "Famille BASILUA", amount: '30 000 FC' },
    { flag: '🇨🇩', name: "Famille Prédi KINKELA Nzazi", amount: '46 $' },
    { flag: '🇨🇩', name: "Papa Amador", amount: '22 $' },
    { flag: '🇨🇩', name: "Notre frère", amount: '30 $' },
    { flag: '🇺🇸', name: "VisionmondeTV", amount: '21 $' },
    { flag: '🇦🇴', name: "Isaac Dizolele Diambo Chibamba", amount: '12 $' },
    { flag: '🇨🇩', name: "Papa Akim Baza", amount: '20 $' },
    { flag: '🇨🇩', name: "Papa Sabu Ndangi Daniel", amount: '20 000 FC' },
    { flag: '🇨🇩', name: "Famille Prédicateur BUABAYINA", amount: '20 $' },
    { flag: '🇨🇩', name: "Prédi DNT", amount: '10 $' },
  ],
  ngidinga: [
    { flag: '🇦🇴', name: "Apôtre Dokolo", amount: '10 $' },
    { flag: '🇿🇦', name: "Apôtre Lubini Irma", amount: '21 $' },
    { flag: '🇨🇬', name: "Apôtre Dieudonné Ngimbi", amount: '21 $' },
    { flag: '🇨🇩', name: "Apôtre Manduakila Makimpuni Ernest", amount: '10 $' },
    { flag: '🇮🇪', name: "Papa Sielo Antonio Fernando", amount: '159 $' },
    { flag: '🇦🇴', name: "Predi Macaire Mavungu", amount: '20 $' },
    { flag: '🇨🇩', name: "Predi Reagan Mbumba", amount: '20 $' },
    { flag: '🇨🇩', name: "Predi Tiya Rodrick", amount: '15 $' },
    { flag: '🇨🇩', name: "Predi Félicien BILANDI", amount: '11 $' },
    { flag: '🇨🇩', name: "Predi Prosper Lukusa", amount: '21 $' },
    { flag: '🇨🇩', name: "Predi Ismaël Sikayala", amount: '15 $' },
    { flag: '🇦🇴', name: "Predi Paciência Cebastião Fula", amount: '5 $' },
    { flag: '🇹🇷', name: "Predi Charly Lubulu", amount: '100 $' },
    { flag: '🇨🇩', name: "Predi Trésor MUANDA", amount: '35 000 FC' },
    { flag: '🇨🇩', name: "Predi Didier Diambu Nsasi", amount: '30 000 FC' },
    { flag: '🇳🇱', name: "Predi Rachidi Kaza", amount: '55 $' },
    { flag: '🇨🇩', name: "Disc. Kilola Christian", amount: '10 $' },
    { flag: '🇫🇷', name: "Disc. Merlin Muanda", amount: '10 $' },
    { flag: '🇨🇩', name: "Disc. Dizolele Mvuezolo", amount: '6 000 FC' },
    { flag: '🇨🇩', name: "Fondation Beaugabel Gloire Mabanza (FBGM)", amount: '100 000 FC' },
    { flag: '🇨🇩', name: "Diac. Rolande Lutumba", amount: '55 000 FC' },
    { flag: '🇫🇷', name: "Diac. Albertine Ngoma", amount: '25 $' },
    { flag: '🇨🇩', name: "Diac. Augustine Maniongo", amount: '12 000 FC' },
    { flag: '🇺🇸', name: "Apôtre Eduardo Lukeba", amount: '25 $' },
    { flag: '🇬🇧', name: "Diac. Florence Kasu", amount: '20 $' },
    { flag: '🇨🇩', name: "Disciple Landry", amount: '20 $' },
    { flag: '🇨🇩', name: "Maman Candi", amount: '20 $' },
    { flag: '🇨🇩', name: "Paroisse de Luanika", amount: '30 000 FC' },
    { flag: '🇨🇩', name: "Disc. Serge TSHINKELA", amount: '13 $' },
    { flag: '🇿🇦', name: "RSA", amount: '100 $' },
    { flag: '🇨🇦', name: "Famille du Révérend Apôtre E. Cardoso", amount: '120 $' },
    { flag: '🇬🇧', name: "Apôtre Michael", amount: '30 $' },
    { flag: '🇨🇩', name: "Diac. Sevolo Ngimbi Alca", amount: '10 $' },
    { flag: '🇨🇭', name: "Papa Sielo Pangala Kianza", amount: '31 $' },
    { flag: '🇨🇩', name: "Familles Predi Vambanu Lukombo", amount: '25 000 FC' },
    { flag: '🇨🇩', name: "Bébé ANAËLLE CELRA LUKANU-MU-MAMBOTE", amount: '10 $' },
    { flag: '🇫🇷', name: "Diaconesse Mamie Ntantu", amount: '15 $' },
    { flag: '🇬🇦', name: "Apôtre Mbodo", amount: '23 000 FC' },
    { flag: '🇨🇩', name: "Apôtre Kabeyabeya Kaburongo", amount: '21 $' },
    { flag: '🇨🇩', name: "Ma Diaconesse Marceline Mpandu Milandu", amount: '16 $' },
  ],
};

/**
 * Opérations « 100 chaises » menées par l'initiative JE SUIS KCCiste
 * (contenu de base : l'administration les modifie dans « Contenu du site »).
 * `key` relie l'opération à sa liste de contributions.
 */
export interface SolidarityOperation { key: string; parish: string; done: boolean; photos: string[]; t: Tri; d: Tri; facts: Tri[]; date: Tri }
export const SOLIDARITY_OPERATIONS: SolidarityOperation[] = [
  {
    done: true,
    key: 'luanika',
    parish: 'Luanika',
    photos: ['/images/solidarite/luanika-eglise.jpg', '/images/solidarite/luanika-facade.jpg'],
    t: T('Opération 100 chaises — Paroisse de Luanika', 'Operation 100 Chairs — Luanika parish', 'Operação 100 cadeiras — Paróquia de Luanika'),
    d: T(
      'Dans cette paroisse rurale du Kongo-Central, les fidèles s’asseyaient sur des bancs en bambou. Grâce à la mobilisation des KCCistes de plusieurs pays, l’objectif a été dépassé : 150 chaises en plastique ont été achetées à Lufu puis transportées jusqu’à Luanika.',
      'In this rural parish of Kongo-Central, the faithful used to sit on bamboo benches. Thanks to KCCistes from several countries, the goal was exceeded: 150 plastic chairs were bought in Lufu and carried all the way to Luanika.',
      'Nesta paróquia rural do Kongo-Central, os fiéis sentavam-se em bancos de bambu. Graças à mobilização dos KCCistas de vários países, o objetivo foi ultrapassado: 150 cadeiras de plástico foram compradas em Lufu e transportadas até Luanika.',
    ),
    facts: [
      T('150 chaises remises', '150 chairs delivered', '150 cadeiras entregues'),
      T('73 contributeurs', '73 contributors', '73 contribuidores'),
      T('1 326,60 $ + 584 000 FC collectés', '$1,326.60 + 584,000 FC raised', '1 326,60 $ + 584 000 FC recolhidos'),
    ],
    date: T('Remise officielle le dimanche 13 septembre 2026', 'Official handover on Sunday 13 September 2026', 'Entrega oficial no domingo, 13 de setembro de 2026'),
  },
  {
    done: false,
    key: 'ngidinga',
    parish: 'Ngidinga',
    photos: ['/images/solidarite/ngidinga-bancs-bambou.jpg'],
    t: T('Opération 100 chaises — Paroisse de Ngidinga', 'Operation 100 Chairs — Ngidinga parish', 'Operação 100 cadeiras — Paróquia de Ngidinga'),
    d: T(
      'Après Luanika, la paroisse sœur de Ngidinga : les fidèles y prient encore assis sur des bambous posés sur des briques. La collecte continue pour leur offrir 100 chaises.',
      'After Luanika, our sister parish of Ngidinga: the faithful still pray sitting on bamboo poles laid on bricks. The collection continues to give them 100 chairs.',
      'Depois de Luanika, a paróquia irmã de Ngidinga: os fiéis ainda rezam sentados em bambus apoiados em tijolos. A recolha continua para lhes oferecer 100 cadeiras.',
    ),
    facts: [
      T('Objectif : 100 chaises', 'Goal: 100 chairs', 'Objetivo: 100 cadeiras'),
      T('40 contributions', '40 contributions', '40 contribuições'),
      T('979 $ + 316 000 FC collectés', '$979 + 316,000 FC raised', '979 $ + 316 000 FC recolhidos'),
    ],
    date: T('Liste à jour au 22 octobre 2026 · achat et remise des chaises en préparation', 'List as of 22 October 2026 · purchase and handover of the chairs being prepared', 'Lista de 22 de outubro de 2026 · compra e entrega das cadeiras em preparação'),
  },
];
