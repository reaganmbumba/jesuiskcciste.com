import type { Tri } from '@/i18n';

/**
 * Mots à découvrir dans le « Jeu des trois signes ». Chaque KCC écrasé
 * découvre une lettre du mot du niveau, comme une ligne de mots croisés.
 * Trois familles : les noms bibliques, les attributs de l'Éternel (catéchisme)
 * et les mots de la foi KCC (doctrine). Les textes viennent de /doctrine et
 * /catechisme. Le mot change selon la langue choisie ; les mots kikongo restent
 * les mêmes dans les trois langues.
 */
export type WordFamily = 'bible' | 'attribut' | 'foi';

export interface GameWord {
  family: WordFamily;
  word: Tri;
  /** Indice affiché pendant le niveau. */
  clue: Tri;
  /** Explication montrée quand le mot est découvert. */
  lesson: Tri;
}

const same = (w: string): Tri => ({ fr: w, en: w, pt: w });

export const FAMILY_LABEL: Record<WordFamily, Tri> = {
  bible: { fr: 'Nom biblique', en: 'Bible name', pt: 'Nome bíblico' },
  attribut: { fr: 'Attribut de l’Éternel', en: 'Attribute of the Eternal', pt: 'Atributo do Eterno' },
  foi: { fr: 'Mot de la foi KCC', en: 'Word of the KCC faith', pt: 'Palavra da fé KCC' },
};

export const GAME_WORDS: GameWord[] = [
  {
    family: 'foi', word: same('NKANDA'),
    clue: { fr: 'Le sens du K de KCC, en kikongo', en: 'The meaning of the K in KCC, in Kikongo', pt: 'O sentido do K de KCC, em kikongo' },
    lesson: { fr: 'K = Nkanda : la lettre, le livre, le MESSAGE.', en: 'K = Nkanda: the letter, the book, the MESSAGE.', pt: 'K = Nkanda: a carta, o livro, a MENSAGEM.' },
  },
  {
    family: 'attribut', word: { fr: 'CRÉATEUR', en: 'CREATOR', pt: 'CRIADOR' },
    clue: { fr: 'Attribut : il a fait toutes choses', en: 'Attribute: He made all things', pt: 'Atributo: fez todas as coisas' },
    lesson: { fr: 'Le catéchisme le dit : l’Éternel est Créateur.', en: 'The catechism says it: the Eternal is the Creator.', pt: 'O catecismo diz: o Eterno é Criador.' },
  },
  {
    family: 'bible', word: { fr: 'NOÉ', en: 'NOAH', pt: 'NOÉ' },
    clue: { fr: 'Il bâtit l’arche avant le déluge', en: 'He built the ark before the flood', pt: 'Construiu a arca antes do dilúvio' },
    lesson: { fr: 'Noé bâtit l’arche sur l’ordre de l’Éternel (Genèse 6).', en: 'Noah built the ark at the command of the Eternal (Genesis 6).', pt: 'Noé construiu a arca por ordem do Eterno (Génesis 6).' },
  },
  {
    family: 'foi', word: same('WAMBOTE'),
    clue: { fr: 'Le premier C de KCC, en kikongo', en: 'The first C in KCC, in Kikongo', pt: 'O primeiro C de KCC, em kikongo' },
    lesson: { fr: 'C = Wambote : BON, la première qualité du message.', en: 'C = Wambote: GOOD, the first quality of the message.', pt: 'C = Wambote: BOM, a primeira qualidade da mensagem.' },
  },
  {
    family: 'attribut', word: { fr: 'SAUVEUR', en: 'SAVIOUR', pt: 'SALVADOR' },
    clue: { fr: 'Attribut : il sauve l’humanité', en: 'Attribute: He saves humanity', pt: 'Atributo: salva a humanidade' },
    lesson: { fr: 'L’Éternel est Sauveur : il offre le salut à toute l’humanité par son Alliance et sa Loi.', en: 'The Eternal is the Saviour: He offers salvation to all humanity through His Covenant and His Law.', pt: 'O Eterno é Salvador: oferece a salvação a toda a humanidade pela sua Aliança e a sua Lei.' },
  },
  {
    family: 'bible', word: { fr: 'MOÏSE', en: 'MOSES', pt: 'MOISÉS' },
    clue: { fr: 'Il reçut les dix Paroles au mont Sinaï', en: 'He received the ten Words on Mount Sinai', pt: 'Recebeu as dez Palavras no monte Sinai' },
    lesson: { fr: 'Moïse reçut les dix Paroles de l’Alliance (Exode 20).', en: 'Moses received the ten Words of the Covenant (Exodus 20).', pt: 'Moisés recebeu as dez Palavras da Aliança (Êxodo 20).' },
  },
  {
    family: 'foi', word: same('WAMPA'),
    clue: { fr: 'Le second C de KCC, en kikongo', en: 'The second C in KCC, in Kikongo', pt: 'O segundo C de KCC, em kikongo' },
    lesson: { fr: 'C = Wampa : NOUVEAU. KCC = « Nkanda Wambote Wampa » : Bon Nouveau Message.', en: 'C = Wampa: NEW. KCC = “Nkanda Wambote Wampa”: Good New Message.', pt: 'C = Wampa: NOVO. KCC = «Nkanda Wambote Wampa»: Boa Nova Mensagem.' },
  },
  {
    family: 'foi', word: same('BOMA'),
    clue: { fr: 'La ville où le KCC apparut en 1958', en: 'The town where the KCC appeared in 1958', pt: 'A cidade onde o KCC apareceu em 1958' },
    lesson: { fr: 'Le 12 avril 1958, à Boma, le ciel s’ouvrit et les trois signes KCC apparurent en lettres d’or.', en: 'On 12 April 1958, in Boma, the sky opened and the three signs KCC appeared in golden letters.', pt: 'A 12 de abril de 1958, em Boma, o céu abriu-se e os três sinais KCC apareceram em letras de ouro.' },
  },
  {
    family: 'attribut', word: { fr: 'INVISIBLE', en: 'INVISIBLE', pt: 'INVISÍVEL' },
    clue: { fr: 'Attribut : aucun œil ne le voit', en: 'Attribute: no eye can see Him', pt: 'Atributo: nenhum olho o vê' },
    lesson: { fr: 'L’Éternel est invisible, sans image ni représentation.', en: 'The Eternal is invisible, without image or likeness.', pt: 'O Eterno é invisível, sem imagem nem representação.' },
  },
  {
    family: 'bible', word: { fr: 'ABRAHAM', en: 'ABRAHAM', pt: 'ABRAÃO' },
    clue: { fr: 'Le père des croyants', en: 'The father of believers', pt: 'O pai dos crentes' },
    lesson: { fr: 'Abraham quitta son pays à l’appel de l’Éternel (Genèse 12).', en: 'Abraham left his country at the call of the Eternal (Genesis 12).', pt: 'Abraão deixou a sua terra ao chamamento do Eterno (Génesis 12).' },
  },
  {
    family: 'foi', word: same('KASESE'),
    clue: { fr: 'La prononciation des trois signes KCC', en: 'How the three signs KCC are pronounced', pt: 'A pronúncia dos três sinais KCC' },
    lesson: { fr: 'Quelle que soit la langue, KCC se prononce toujours « kasese ».', en: 'Whatever the language, KCC is always pronounced “kasese”.', pt: 'Seja qual for a língua, KCC pronuncia-se sempre «kasese».' },
  },
  {
    family: 'foi', word: { fr: 'SABBAT', en: 'SABBATH', pt: 'SÁBADO' },
    clue: { fr: 'Le jour saint à sanctifier', en: 'The holy day to keep holy', pt: 'O dia santo a santificar' },
    lesson: { fr: '« Souviens-toi du jour du sabbat pour le sanctifier » : une des dix Paroles de l’Alliance.', en: '“Remember the Sabbath day and keep it holy”: one of the ten Words of the Covenant.', pt: '«Lembra-te do dia de sábado para o santificar»: uma das dez Palavras da Aliança.' },
  },
  {
    family: 'attribut', word: { fr: 'SOUVERAIN', en: 'SOVEREIGN', pt: 'SOBERANO' },
    clue: { fr: 'Attribut : il règne sur toutes choses', en: 'Attribute: He reigns over all things', pt: 'Atributo: reina sobre todas as coisas' },
    lesson: { fr: 'L’Éternel est Souverain et Seigneur.', en: 'The Eternal is Sovereign and Lord.', pt: 'O Eterno é Soberano e Senhor.' },
  },
  {
    family: 'bible', word: { fr: 'ÉSAÏE', en: 'ISAIAH', pt: 'ISAÍAS' },
    clue: { fr: 'Prophète cité dans l’Oracle de 2003', en: 'Prophet quoted in the 2003 Oracle', pt: 'Profeta citado no Oráculo de 2003' },
    lesson: { fr: 'L’Oracle du 15 avril 2003 fut proclamé comme l’Éternel le recommanda au Prophète Ésaïe (Es. 8 : 11-16).', en: 'The Oracle of 15 April 2003 was proclaimed as the Eternal instructed the Prophet Isaiah (Isa. 8:11-16).', pt: 'O Oráculo de 15 de abril de 2003 foi proclamado como o Eterno recomendou ao Profeta Isaías (Is. 8:11-16).' },
  },
  {
    family: 'foi', word: { fr: 'ALLIANCE', en: 'COVENANT', pt: 'ALIANÇA' },
    clue: { fr: 'On y entre en reconnaissant l’Éternel seul', en: 'One enters it by acknowledging the Eternal alone', pt: 'Entra-se nela reconhecendo só o Eterno' },
    lesson: { fr: 'Le peuple entre dans l’Alliance en reconnaissant l’Éternel comme l’unique vrai Dieu et en acceptant ses Paroles.', en: 'The people enter the Covenant by acknowledging the Eternal as the one true God and accepting His Words.', pt: 'O povo entra na Aliança reconhecendo o Eterno como o único Deus verdadeiro e aceitando as suas Palavras.' },
  },
  {
    family: 'attribut', word: { fr: 'IMMUABLE', en: 'UNCHANGING', pt: 'IMUTÁVEL' },
    clue: { fr: 'Attribut : il ne change jamais', en: 'Attribute: He never changes', pt: 'Atributo: nunca muda' },
    lesson: { fr: 'L’Éternel est immuable : il reste le même pour toujours.', en: 'The Eternal is unchanging: He stays the same for ever.', pt: 'O Eterno é imutável: permanece o mesmo para sempre.' },
  },
  {
    family: 'bible', word: same('DAVID'),
    clue: { fr: 'Berger devenu roi d’Israël', en: 'Shepherd who became king of Israel', pt: 'Pastor que se tornou rei de Israel' },
    lesson: { fr: 'David, le jeune berger, devint roi d’Israël et chanta l’Éternel dans les psaumes.', en: 'David, the young shepherd, became king of Israel and sang of the Eternal in the psalms.', pt: 'David, o jovem pastor, tornou-se rei de Israel e cantou o Eterno nos salmos.' },
  },
  {
    family: 'foi', word: { fr: 'KCCISME', en: 'KCCISM', pt: 'KCCISMO' },
    clue: { fr: 'La doctrine et la religion de l’Église', en: 'The doctrine and religion of the Church', pt: 'A doutrina e a religião da Igreja' },
    lesson: { fr: 'Le KCCisme émane du KCC : ce n’est pas un mot forgé par l’homme.', en: 'KCCism comes from the KCC: it is not a word made up by man.', pt: 'O KCCismo emana do KCC: não é uma palavra inventada pelo homem.' },
  },
  {
    family: 'attribut', word: { fr: 'OMNISCIENT', en: 'ALL-KNOWING', pt: 'OMNISCIENTE' },
    clue: { fr: 'Attribut : il sait toutes choses', en: 'Attribute: He knows all things', pt: 'Atributo: sabe todas as coisas' },
    lesson: { fr: 'L’Éternel est omniscient, omnipotent et omniprésent.', en: 'The Eternal is all-knowing, almighty and ever-present.', pt: 'O Eterno é omnisciente, omnipotente e omnipresente.' },
  },
  {
    family: 'bible', word: { fr: 'ÉLIE', en: 'ELIJAH', pt: 'ELIAS' },
    clue: { fr: 'Prophète du mont Carmel', en: 'Prophet of Mount Carmel', pt: 'Profeta do monte Carmelo' },
    lesson: { fr: 'Au mont Carmel, Élie montra que l’Éternel seul est Dieu (1 Rois 18).', en: 'On Mount Carmel, Elijah showed that the Eternal alone is God (1 Kings 18).', pt: 'No monte Carmelo, Elias mostrou que só o Eterno é Deus (1 Reis 18).' },
  },
  {
    family: 'foi', word: { fr: 'MONOTHÉISME', en: 'MONOTHEISM', pt: 'MONOTEÍSMO' },
    clue: { fr: 'La ligne maîtresse du KCCisme', en: 'The guiding line of KCCism', pt: 'A linha mestra do KCCismo' },
    lesson: { fr: 'Le monothéisme radical : l’Éternel est l’unique vrai Dieu.', en: 'Radical monotheism: the Eternal is the one true God.', pt: 'O monoteísmo radical: o Eterno é o único Deus verdadeiro.' },
  },
  {
    family: 'attribut', word: { fr: 'ÉTERNEL', en: 'ETERNAL', pt: 'ETERNO' },
    clue: { fr: 'Attribut : ni commencement ni fin', en: 'Attribute: no beginning and no end', pt: 'Atributo: sem princípio nem fim' },
    lesson: { fr: 'L’Éternel n’a ni commencement ni fin. Il est Un.', en: 'The Eternal has no beginning and no end. He is One.', pt: 'O Eterno não tem princípio nem fim. Ele é Um.' },
  },
];
