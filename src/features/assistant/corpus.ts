/**
 * Les textes officiels que l'Assistant KCC sait consulter, découpés en passages.
 *
 * Seuls les textes déjà publiés en clair sur le site sont repris ici. Le livre
 * « Le KCCisme » n'y figure pas : son texte est chiffré et ne s'ouvre qu'avec le
 * code d'accès (voir KccismeBookPage), l'Assistant ne peut donc pas le dévoiler.
 * Chaque passage garde le lien de la page (et de la section) d'où il vient.
 */
import type { Locale } from '@/i18n';
import * as catFr from '@/content/catechisme';
import * as catEn from '@/content/catechisme.en';
import * as catPt from '@/content/catechisme.pt';
import * as docFr from '@/content/doctrine';
import * as docEn from '@/content/doctrine.en';
import * as docPt from '@/content/doctrine.pt';
import * as litFr from '@/content/liturgie';
import * as litEn from '@/content/liturgie.en';
import * as litPt from '@/content/liturgie.pt';
import * as appFr from '@/content/mon-appel';
import * as appEn from '@/content/mon-appel.en';
import * as appPt from '@/content/mon-appel.pt';
import * as egFr from '@/content/eglise';
import * as egEn from '@/content/eglise.en';
import * as egPt from '@/content/eglise.pt';
import * as preFr from '@/content/predications';
import * as preEn from '@/content/predications.en';
import * as prePt from '@/content/predications.pt';
import { prophetWords } from '@/content/paroles-prophete';
import { hymns } from '@/content/cantiques';
import { prophetTour2012 } from '@/content/tournee-bas-congo-2012';
import { civilChapters, type HistoryBlock } from '@/content/personnalite-civile';
import { NEOPHYTE_LESSONS, NEOPHYTE_STEPS, ANOINTING_DECLARATION } from '@/content/parcours-neophyte';

export interface Passage {
  id: string;
  /** Nom du texte officiel (catéchisme, doctrine…), affiché comme source. */
  source: string;
  /** Titre du passage (question du catéchisme, titre du rite, du chapitre…). */
  title: string;
  text: string;
  /** Lien vers la page du site, avec la section quand elle existe. */
  url: string;
  /** Poids du texte dans le classement (1 = normal). */
  weight: number;
  /** Texte disponible seulement en français (affiché avec cette mention). */
  frOnly?: boolean;
  /** Le titre est une question du catéchisme : une question proche compte davantage. */
  isQuestion?: boolean;
}

type Tri = { fr: string; en: string; pt: string };
const S = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

/** Noms des sources, dans les trois langues. */
export const SOURCES = {
  catechisme: S('Catéchisme', 'Catechism', 'Catecismo'),
  doctrine: S('Doctrine et histoire', 'Doctrine and history', 'Doutrina e história'),
  liturgie: S('Rites et célébrations', 'Rites and celebrations', 'Ritos e celebrações'),
  appel: S('Mon Appel (le Prophète)', 'Mon Appel (the Prophet)', 'Mon Appel (o Profeta)'),
  enseignements: S('Enseignements et histoire', 'Teachings and history', 'Ensinamentos e história'),
  predications: S('Prédications et séminaires', 'Sermons and seminars', 'Pregações e seminários'),
  paroles: S('Paroles du Prophète', 'Words of the Prophet', 'Palavras do Profeta'),
  cantiques: S('Recueil de cantiques', 'Hymn book', 'Hinário'),
  tournee: S('Tournée du Prophète (2012)', 'The Prophet’s tour (2012)', 'Digressão do Profeta (2012)'),
  juridique: S('Reconnaissance juridique', 'Legal recognition', 'Reconhecimento jurídico'),
  neophyte: S('Parcours du néophyte', 'Neophyte course', 'Percurso do neófito'),
} as const;

/** Regroupe des paragraphes en passages d'environ `max` caractères. */
function chunk(paragraphs: string[], max = 750): string[] {
  const out: string[] = [];
  let cur = '';
  for (const p of paragraphs.map((x) => x.trim()).filter(Boolean)) {
    if (cur && cur.length + p.length + 1 > max) { out.push(cur); cur = p; } else cur = cur ? `${cur}\n${p}` : p;
  }
  if (cur) out.push(cur);
  return out;
}

const pickByLocale = <T>(locale: Locale, fr: T, en: T, pt: T): T => (locale === 'en' ? en : locale === 'pt' ? pt : fr);

export function buildCorpus(locale: Locale): Passage[] {
  const src = (k: keyof typeof SOURCES) => SOURCES[k][locale];
  const out: Passage[] = [];
  const add = (p: Omit<Passage, 'weight'> & { weight?: number }) => out.push({ weight: 1, ...p });

  // Catéchisme : une question = un passage.
  const cat = pickByLocale(locale, catFr, catEn, catPt);
  add({ id: 'cat-intro', source: src('catechisme'), title: cat.catechismIntro.title, text: cat.catechismIntro.paragraphs.join('\n'), url: '/catechisme' });
  for (const g of cat.catechism) {
    g.items.forEach((it, i) => add({
      id: `cat-${g.id}-${i}`, source: `${src('catechisme')} · ${g.title}`, title: it.q,
      text: [it.a, ...(it.list ?? []).map((x) => `• ${x}`)].join('\n'), url: `/catechisme#${g.id}`, weight: 1.15, isQuestion: true,
    }));
  }
  const np = cat.neophytePath;
  add({ id: 'cat-neophyte', source: src('catechisme'), title: np.title, text: [np.intro, ...np.steps.map((s) => `• ${s.name} : ${s.learn.join(' ; ')}`)].join('\n'), url: '/catechisme' });

  // Doctrine.
  const d = pickByLocale(locale, docFr, docEn, docPt);
  const D = src('doctrine');
  add({ id: 'doc-spec', source: D, title: pickByLocale(locale, 'Spécificités doctrinales', 'Doctrinal specifics', 'Especificidades doutrinais'), text: d.specificities.map((s) => `${s.label} : ${s.value}`).join('\n'), url: '/doctrine#kcc' });
  add({ id: 'doc-kcc', source: D, title: d.kccApparition.title, text: [d.kccApparition.date, ...d.kccApparition.paragraphs, ...d.kccApparition.letters.map((x) => `${x.letter} = ${x.kikongo} : ${x.fr}`), d.kccApparition.meaning].join('\n'), url: '/doctrine#kcc' });
  add({ id: 'doc-oracle', source: D, title: d.oracle.title, text: [d.oracle.quote, ...d.oracle.paragraphs, d.oracle.attributes.join(', ')].join('\n'), url: '/doctrine#kcc' });
  add({ id: 'doc-profession', source: D, title: d.professionOfFaith.title, text: [d.professionOfFaith.rite, ...d.professionOfFaith.articles.map((a, i) => `${i + 1}. ${a}`)].join('\n'), url: '/doctrine#foi', weight: 1.1 });
  add({ id: 'doc-church', source: D, title: pickByLocale(locale, 'L’Église une, sainte et prophétique', 'The one, holy and prophetic Church', 'A Igreja una, santa e profética'), text: d.professionOfFaith.church.map((c) => `${c.t} : ${c.d}`).join('\n'), url: '/doctrine#foi' });
  for (const list of d.lawTexts) {
    const v = list.versions[0];
    add({ id: `doc-law-${list.id}`, source: D, title: list.title, text: [list.intro ?? '', ...v.items.map((x, i) => `${i + 1}. ${x}`)].filter(Boolean).join('\n'), url: `/doctrine#${list.id}`, weight: 1.1 });
  }
  add({ id: 'doc-sacraments', source: D, title: pickByLocale(locale, 'Les sacrements', 'The sacraments', 'Os sacramentos'), text: d.sacraments.map((s) => `${s.t} : ${s.d}`).join('\n'), url: '/doctrine#culte' });
  add({ id: 'doc-feasts', source: D, title: pickByLocale(locale, 'Les fêtes et jours saints', 'Feasts and holy days', 'Festas e dias santos'), text: d.feasts.map((f) => `${f.date} – ${f.t} : ${f.d}`).join('\n'), url: '/doctrine#culte' });
  add({ id: 'doc-sabbath', source: D, title: pickByLocale(locale, 'Le culte du sabbat', 'The Sabbath service', 'O culto do sábado'), text: d.sabbathService.map((p) => `${p.part} : ${p.steps.join(', ')}`).join('\n'), url: '/doctrine#culte' });
  add({ id: 'doc-oath', source: D, title: d.prophetOath.title, text: d.prophetOath.paragraphs.join('\n'), url: '/doctrine#prophete' });
  add({ id: 'doc-name', source: D, title: d.nameOfGod.title, text: d.nameOfGod.paragraphs.join('\n'), url: '/doctrine#kcc', weight: 1.1 });
  d.prophetTimeline.forEach((t, i) => add({ id: `doc-time-${i}`, source: D, title: `${t.year} · ${t.t}`, text: t.d, url: '/doctrine#prophete' }));
  add({ id: 'doc-portrait', source: D, title: pickByLocale(locale, 'Le Prophète', 'The Prophet', 'O Profeta'), text: d.prophetPortrait.join('\n'), url: '/doctrine#prophete' });
  add({ id: 'doc-world', source: D, title: pickByLocale(locale, 'L’Église dans le monde', 'The Church in the world', 'A Igreja no mundo'), text: d.internationalPresence.join(' ; '), url: '/doctrine#prophete' });

  // Liturgie : un rite = un ou plusieurs passages.
  const lit = pickByLocale(locale, litFr, litEn, litPt);
  const L = src('liturgie');
  add({ id: 'lit-intro', source: L, title: lit.liturgyIntro.title, text: [lit.liturgyIntro.quote, ...lit.liturgyIntro.paragraphs, lit.liturgyIntro.acclamation].join('\n'), url: '/liturgie' });
  for (const r of lit.rites) {
    const head = [r.when, r.bible].filter(Boolean).join(' · ');
    add({ id: `lit-${r.id}`, source: L, title: r.title, text: [head, r.summary, ...(r.programme ?? []).map((p) => `${p.part ? `${p.part} : ` : ''}${p.steps.join(', ')}`), ...(r.notes ?? [])].filter(Boolean).join('\n'), url: `/liturgie#${r.id}`, weight: 1.1 });
    (r.texts ?? []).forEach((t, i) => {
      const lines = [...t.lines, ...(t.parts ?? []).flatMap((p) => [p.title, ...p.lines])];
      chunk(lines).forEach((c, j) => add({ id: `lit-${r.id}-t${i}-${j}`, source: `${L} · ${r.title}`, title: t.title, text: c, url: `/liturgie#${r.id}` }));
    });
  }

  // Mon Appel.
  const ap = pickByLocale(locale, appFr, appEn, appPt);
  const A = src('appel');
  add({ id: 'app-intro', source: A, title: ap.callingBook.title, text: [ap.callingBook.author, ap.callingBook.published, ...ap.callingBook.intro].join('\n'), url: '/appel-du-prophete#lire' });
  for (const c of ap.callingChapters) {
    chunk([c.quote ?? '', ...c.paragraphs]).forEach((t, j) => add({ id: `app-${c.id}-${j}`, source: A, title: `${c.title} (${c.date}, ${c.place})`, text: t, url: `/appel-du-prophete#${c.id}` }));
  }
  add({ id: 'app-conclusion', source: A, title: pickByLocale(locale, 'Conclusion', 'Conclusion', 'Conclusão'), text: ap.callingConclusion, url: '/appel-du-prophete' });
  add({ id: 'app-bio', source: A, title: ap.biography.title, text: [...ap.biography.facts.map((f) => `${f.label} : ${f.value}`), ap.biography.missions.map((m) => `${m.date} : ${m.place}`).join(' ; ')].join('\n'), url: '/appel-du-prophete#biographie' });

  // Enseignements et histoire.
  const eg = pickByLocale(locale, egFr, egEn, egPt);
  const E = src('enseignements');
  for (const t of eg.teachings) {
    const meta = t.meta.map((m) => `${m.label} : ${m.value}`).join(' · ');
    chunk([meta, ...t.paragraphs, t.quote ?? '', ...(t.closing ? [t.closing.title, ...t.closing.paragraphs] : [])]).forEach((c, j) => add({ id: `eg-${t.id}-${j}`, source: E, title: t.title, text: c, url: '/enseignements#enseignements' }));
  }
  for (const h of eg.prophetHistory) {
    chunk(h.paragraphs).forEach((c, j) => add({ id: `eg-h-${h.id}-${j}`, source: E, title: h.title, text: c, url: '/enseignements#histoire' }));
  }

  // Prédications et séminaires.
  const pr = pickByLocale(locale, preFr, preEn, prePt);
  const P = src('predications');
  for (const s of pr.sermons) {
    const head = [s.text, s.date, s.place].filter(Boolean).join(' · ');
    chunk([head, s.keyPoint, ...s.paragraphs]).forEach((c, j) => add({ id: `pre-${s.id}-${j}`, source: P, title: s.title, text: c, url: `/predications#${s.id}` }));
  }
  pr.seminars.forEach((s, i) => add({ id: `pre-sem-${i}`, source: P, title: `${s.title} (${s.date})`, text: `${s.place}. ${s.d}`, url: '/predications#seminaires' }));

  // Parcours du néophyte (trois langues).
  const N = src('neophyte');
  NEOPHYTE_STEPS.forEach((s, i) => add({ id: `neo-step-${i}`, source: N, title: s.name[locale], text: s.text[locale], url: '/parcours-neophyte' }));
  add({ id: 'neo-declaration', source: N, title: pickByLocale(locale, 'Déclaration de la Première Onction', 'Declaration of the First Anointing', 'Declaração da Primeira Unção'), text: ANOINTING_DECLARATION[locale], url: '/parcours-neophyte' });
  for (const les of NEOPHYTE_LESSONS) {
    const parts = [les.body, les.read, les.learn, les.practice].filter(Boolean).map((x) => x![locale]);
    add({ id: `neo-${les.n}`, source: N, title: `${pickByLocale(locale, 'Leçon', 'Lesson', 'Lição')} ${les.n} : ${les.title[locale]}`, text: parts.join('\n'), url: `/parcours-neophyte/lecon/${les.n}`, weight: 0.95 });
  }

  // Textes disponibles seulement en français.
  for (const w of prophetWords) {
    add({ id: `par-${w.n}`, source: src('paroles'), title: `« ${w.text} »`, text: `${w.source}\n${w.explanation}`, url: `/paroles-du-prophete#parole-${w.n}`, frOnly: true });
  }
  for (const p of prophetTour2012.parishes) {
    for (const s of p.sermons) {
      const head = [s.meta.dateLabel, s.meta.place, s.meta.occasion, s.meta.text].filter(Boolean).join(' · ');
      const paras = s.sections.flatMap((x) => [x.title, ...x.paras]);
      chunk([head, ...paras], 900).forEach((c, j) => add({ id: `tour-${s.id}-${j}`, source: src('tournee'), title: `${p.name} · ${s.meta.dateLabel}`, text: c, url: `/predications/tournee-bas-congo-2012#${s.id}`, frOnly: true, weight: 0.9 }));
    }
  }
  for (const c of civilChapters) {
    chunk(c.blocks.flatMap(blockText), 900).forEach((t, j) => add({ id: `civ-${c.id}-${j}`, source: src('juridique'), title: `${c.title} (${c.period})`, text: t, url: `/histoire/reconnaissance-juridique#${c.id}`, frOnly: true, weight: 0.85 }));
  }
  for (const h of hymns) {
    add({ id: `hym-${h.lang}-${h.n}`, source: `${src('cantiques')} · ${h.lang} n° ${h.n}`, title: h.title, text: h.lines.join('\n'), url: `/cantiques#cantique-${h.lang.toLowerCase()}-${h.n}`, weight: 0.6 });
  }

  if (locale === 'fr') out.forEach((p) => { delete p.frOnly; });
  return out;
}

function blockText(b: HistoryBlock): string[] {
  switch (b[0]) {
    case 'p': case 'h2': case 'h3': case 'note': return [b[1]];
    case 'list': case 'lines': return b[1];
    case 'doc': return [b[1].title, ...(b[1].sub ? [b[1].sub] : []), ...b[1].lines];
    case 'quote': return [b[1].text];
    case 'collapse': return [b[1].title, ...b[1].items];
    case 'people': return [];
    default: return [];
  }
}
