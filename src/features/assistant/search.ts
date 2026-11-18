/**
 * Moteur de l'Assistant KCC : retrouve, dans les textes officiels, les passages
 * qui répondent à une question. Il ne rédige rien lui-même : il affiche les
 * textes tels qu'ils sont publiés, avec leur source. Tout se fait dans le
 * navigateur (aucun serveur, aucun coût, fonctionne aussi hors connexion).
 * Classement BM25, avec quelques équivalences de mots (baptême → onction…).
 */
import type { Locale } from '@/i18n';
import type { Passage } from './corpus';

/** Minuscules, sans accents. */
export function fold(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae');
}

const STOP = new Set(fold(`
  a au aux avec ce ces cet cette c ca dans de des du d elle elles en et est etre eux il ils je j l la le les leur leurs lui
  ma mais me meme mes moi mon ne n nos notre nous on ou par pas pour qu que qui quoi quel quelle quels quelles sa se ses
  si son sont sur ta te tes toi ton tu un une vos votre vous y s t m comment pourquoi quand combien ou dit dire disent
  fait faire faut peut peux doit dois veut est-ce ce-que y-a-t-il a-t-il quoi parle parler explique expliquer signifie veut
  selon chez avoir ai as ont sommes etes suis plus tres aussi alors donc car comme lorsque passe
  the a an and are as at be by for from how i in is it its of on or that the this to was what when where which who why with
  held hold happen happens take place done do does did can could should would tell say says about me my we our you your there their they them us explain mean means
  o os as um uma uns umas e de do da dos das em no na nos nas por para com que qual quais quem como porque quando onde
  diz dizer significa significam sobre ao aos eu tu ele ela nos vos eles elas meu minha seu sua ser estar ha tem ter se nao mais muito
`).split(/\s+/).filter(Boolean));

/** Racine courte d'un mot replié (sans accents) : pluriel retiré, 6 lettres au plus. */
export function stem(w: string): string {
  let s = w;
  if (s.length > 4) s = s.replace(/(aux|ais)$/, 'al').replace(/oes$/, 'ao').replace(/eis$/, 'el');
  if (s.length > 4 && /[sx]$/.test(s)) s = s.slice(0, -1);
  return s.length > 6 ? s.slice(0, 6) : s;
}

/** Mots d'un texte (repliés, sans mots vides). */
export function words(text: string): string[] {
  return fold(text).replace(/[’'`]/g, ' ').split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w));
}

export const tokens = (text: string) => words(text).map(stem);

/**
 * Équivalences : quand on cherche un mot, on cherche aussi ceux-ci. Elles
 * servent seulement à retrouver les textes ; la réponse reste le texte officiel.
 */
const SYNONYMS: Record<string, string> = {
  // Français
  eglise: 'ebnm kcc', bapteme: 'onction purification sacrement', baptiser: 'onction purification', baptise: 'onction purification',
  dieu: 'eternel', seigneur: 'eternel', yahve: 'eternel', yahweh: 'eternel', jehovah: 'eternel', nzambe: 'eternel', yawe: 'eternel',
  jesus: 'homme dieu oracle miracle', christ: 'homme dieu oracle', trinite: 'un unique dieu oracle',
  mariage: 'nuptiale epoux mariage', marier: 'nuptiale mariage', noces: 'nuptiale',
  deces: 'inhumation mort deuil', mort: 'inhumation deuil ame', enterrement: 'inhumation deuil', funerailles: 'inhumation deuil', deuil: 'inhumation',
  samedi: 'sabbat', dimanche: 'sabbat culte', repos: 'sabbat',
  pardon: 'remission confession purification', pecher: 'peche confession remission', peche: 'confession remission purification', confesser: 'confession',
  commandement: 'commandements loi paroles alliance', loi: 'alliance commandements', decalogue: 'paroles alliance commandements',
  enfant: 'enfants benediction', bebe: 'enfants benediction', naissance: 'naissance ne',
  ciel: 'vie eternelle ame', paradis: 'vie eternelle recompense justes', enfer: 'chatiment eternel', resurrection: 'ame immortalite',
  fondateur: 'prophete dizolele', prophete: 'prophete dizolele', dizolele: 'prophete', kasese: 'kcc', signe: 'kcc signes',
  idole: 'images taillees dieux etrangers', image: 'images taillees', statue: 'images taillees', fetiche: 'dieux etrangers idolatrie',
  alcool: 'boissons enivrantes', biere: 'boissons enivrantes', boire: 'boissons',
  temple: 'dedicace temples', priere: 'priere invocation', prier: 'priere', fete: 'fetes jours saints',
  converti: 'neophyte', nouveau: 'neophyte', adepte: 'neophyte', membre: 'neophyte adepte',
  // English
  church: 'ebnm kcc', baptism: 'anointing purification sacrament', baptize: 'anointing purification', god: 'eternal', lord: 'eternal',
  marriage: 'nuptial wedding', wedding: 'nuptial', funeral: 'burial mourning inumacao luto', death: 'burial soul', saturday: 'sabbath', sunday: 'sabbath',
  sin: 'confession remission purification', forgiveness: 'remission confession', commandment: 'commandments covenant law',
  heaven: 'eternal life soul', hell: 'eternal punishment', founder: 'prophet dizolele', idol: 'graven images', alcohol: 'intoxicating drinks',
  // Português
  igreja: 'ebnm kcc', batismo: 'uncao purificacao sacramento', batizar: 'uncao purificacao', deus: 'eterno', senhor: 'eterno',
  casamento: 'nupcial', funeraria: 'inumacao luto', morte: 'inumacao alma', sabado: 'sabado', domingo: 'sabado',
  pecado: 'confissao remissao purificacao', perdao: 'remissao confissao', mandamento: 'mandamentos alianca lei',
  ceu: 'vida eterna alma', inferno: 'castigo eterno', fundador: 'profeta dizolele', idolo: 'imagens',
};

interface Doc { p: Passage; tf: Map<string, number>; len: number; titleSet: Set<string> }

export interface Index { docs: Doc[]; df: Map<string, number>; avgLen: number; vocab: Set<string>; /** Racine → mot tel qu'écrit (avec accents), pour l'affichage. */ surface: Map<string, string> }

export function buildIndex(passages: Passage[]): Index {
  const docs: Doc[] = [];
  const df = new Map<string, number>();
  const surface = new Map<string, string>();
  let total = 0;
  for (const p of passages) {
    for (const w of p.text.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      const f = fold(w);
      if (f.length > 1 && !STOP.has(f) && !surface.has(stem(f))) surface.set(stem(f), w);
    }
    const title = tokens(p.title);
    const body = tokens(p.text);
    const all = [...title, ...title, ...body, ...tokens(p.source)];
    const tf = new Map<string, number>();
    for (const t of all) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    docs.push({ p, tf, len: all.length, titleSet: new Set(title) });
    total += all.length;
  }
  return { docs, df, avgLen: total / Math.max(1, docs.length), vocab: new Set(df.keys()), surface };
}

export interface Hit { passage: Passage; score: number; coverage: number; matched: string[] }

export interface Result {
  hits: Hit[];
  /** Vrai quand le premier passage répond assez clairement à la question. */
  confident: boolean;
  /** Mots de la question absents des textes (remplacés, s'il y a lieu, par leurs équivalents). */
  missing: { word: string; replacedBy?: string[] }[];
  /** Mots retenus de la question (pour surligner les passages). */
  terms: string[];
}

const K1 = 1.4;
const B = 0.7;

export function search(index: Index, question: string, limit = 6): Result {
  const qWords = [...new Set(words(question))];
  // Mot de la question tel que la personne l'a écrit (avec ses accents).
  const typed = new Map<string, string>();
  for (const w of question.split(/[^\p{L}\p{N}]+/u)) if (w) typed.set(fold(w), w);
  const groups: { word: string; stems: string[]; weight: number }[] = [];
  const missing: Result['missing'] = [];
  for (const w of qWords) {
    const s = stem(w);
    const syn = SYNONYMS[w] ?? SYNONYMS[s];
    const synStems = syn ? [...new Set(words(syn).map(stem))].filter((x) => x !== s && index.vocab.has(x)) : [];
    if (index.vocab.has(s)) {
      groups.push({ word: w, stems: [s], weight: 1 });
      if (synStems.length) groups.push({ word: w, stems: synStems, weight: 0.35 });
    } else if (synStems.length) {
      groups.push({ word: w, stems: synStems, weight: 0.9 });
      missing.push({ word: typed.get(w) ?? w, replacedBy: synStems.map((x) => index.surface.get(x) ?? x) });
    } else {
      missing.push({ word: typed.get(w) ?? w });
    }
  }
  const terms = groups.flatMap((g) => g.stems);
  if (!groups.length) return { hits: [], confident: false, missing, terms };

  const N = index.docs.length;
  const idf = (t: string) => { const n = index.df.get(t) ?? 0; return Math.log(1 + (N - n + 0.5) / (n + 0.5)); };
  // Poids de chaque mot de la question : un mot rare (sacrement, onction) compte plus qu'un mot courant (Église, Éternel).
  const maxIdf = idf('\u0000');
  const wordWeight = new Map<string, number>();
  for (const w of qWords) wordWeight.set(w, index.vocab.has(stem(w)) ? idf(stem(w)) : maxIdf);
  const totalWeight = [...wordWeight.values()].reduce((a, b) => a + b, 0) || 1;

  const hits: Hit[] = [];
  for (const d of index.docs) {
    let score = 0;
    const matched = new Set<string>();
    const covered = new Map<string, number>();
    for (const g of groups) {
      let best = 0;
      for (const t of g.stems) {
        const f = d.tf.get(t);
        if (!f) continue;
        const bm = idf(t) * (f * (K1 + 1)) / (f + K1 * (1 - B + B * d.len / index.avgLen));
        const boost = d.p.isQuestion && d.titleSet.has(t) ? 1.5 : 1;
        best = Math.max(best, bm * boost);
        matched.add(t);
      }
      if (best > 0) {
        score += best * g.weight;
        const part = g.weight >= 0.9 ? 1 : 0.6;
        covered.set(g.word, Math.max(covered.get(g.word) ?? 0, part));
      }
    }
    if (score <= 0) continue;
    let cov = 0;
    for (const [w, part] of covered) cov += (wordWeight.get(w) ?? 0) * part;
    const coverage = cov / totalWeight;
    hits.push({ passage: d.p, score: score * (0.3 + coverage) * d.p.weight, coverage, matched: [...matched] });
  }
  hits.sort((a, b) => b.score - a.score);
  const top = hits.slice(0, limit);
  const first = top[0];
  // Réponse « sûre » : une bonne partie des mots de la question se retrouve dans le passage.
  const confident = !!first && first.score >= 6 && first.coverage >= 0.6;
  return { hits: top, confident, missing, terms };
}

/** Découpe un texte en morceaux à surligner (mots dont la racine fait partie de la recherche). */
export function highlight(text: string, terms: string[]): { t: string; on: boolean }[] {
  if (!terms.length) return [{ t: text, on: false }];
  const set = new Set(terms);
  const parts = text.split(/([\p{L}\p{N}]+)/u);
  return parts.filter((x) => x !== '').map((t) => {
    const w = fold(t);
    return { t, on: /^[a-z0-9]+$/.test(w) && w.length > 1 && !STOP.has(w) && set.has(stem(w)) };
  });
}

/** Questions proposées, pour bien démarrer. */
export const SUGGESTIONS: Record<Locale, string[]> = {
  fr: [
    'Que dit le catéchisme sur le baptême ?',
    'Quels sont les sacrements de l’Église ?',
    'Que signifie le signe KCC ?',
    'Qu’est-ce que l’Oracle du 15 avril 2003 ?',
    'Comment se déroule le culte du sabbat ?',
    'Quelles sont les dix Paroles de l’Alliance ?',
    'Comment l’Éternel pardonne-t-il les péchés ?',
    'Quelles sont les fêtes de l’Église ?',
  ],
  en: [
    'What does the catechism say about baptism?',
    'What are the sacraments of the Church?',
    'What does the KCC sign mean?',
    'What is the Oracle of 15 April 2003?',
    'How is the Sabbath service held?',
    'What are the ten Words of the Covenant?',
    'How does the Eternal forgive sins?',
    'What are the feasts of the Church?',
  ],
  pt: [
    'O que diz o catecismo sobre o batismo?',
    'Quais são os sacramentos da Igreja?',
    'O que significa o sinal KCC?',
    'O que é o Oráculo de 15 de abril de 2003?',
    'Como decorre o culto do sábado?',
    'Quais são as dez Palavras da Aliança?',
    'Como o Eterno perdoa os pecados?',
    'Quais são as festas da Igreja?',
  ],
};
