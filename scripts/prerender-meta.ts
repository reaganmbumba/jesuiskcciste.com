/**
 * Aperçus de partage par page (Facebook, WhatsApp, Instagram, X).
 *
 * Les robots des réseaux sociaux n'exécutent pas JavaScript : ils ne voient que
 * dist/index.html. Après `vite build`, ce script écrit une copie de index.html
 * par rubrique (ex. dist/doctrine.html, dist/academie/formations.html) avec son
 * propre titre, sa description et son adresse. Cloudflare sert /doctrine depuis
 * doctrine.html ; React prend ensuite le relais comme d'habitude.
 * Les articles, événements et formations du contenu de base (src/content/editorial.ts)
 * ont aussi leur page, avec leur photo en image d'aperçu. Ceux publiés plus tard
 * dans Supabase sont traités à la volée par worker/index.ts.
 *
 * Lancé par `npm run build` via vite-node (alias @/ disponibles).
 * Quand une rubrique est ajoutée ou renommée, mettre à jour PAGES ci-dessous.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { editorialAnnouncements, editorialCourses, editorialEvents } from '@/content/editorial';
import { demoAudioSermons } from '@/services/demo/data';
import { galleryPhotos, photoKey } from '@/content/galerie';

const SITE = 'https://jesuiskcciste.com';
const NAME = 'JE SUIS KCCiste';
const DIST = 'dist';

/** chemin → [titre, description] (en français, langue par défaut du site). */
const PAGES: Record<string, [string, string]> = {
  '/a-propos': ['L’Église Bon Nouveau Message (EBNM/KCC)', 'Présentation officielle, histoire, organisation et contacts institutionnels.'],
  '/enseignements': ['Enseignements et histoire', 'La parole du Prophète, les récits de son appel, la vision de la musique et les textes de la solidarité KCCiste.'],
  '/doctrine': ['Doctrine et histoire de l’Église', 'Le message du KCC, la profession de foi, les Paroles de l’Alliance, la liturgie et les grandes dates de l’Église Bon Nouveau Message.'],
  '/cantiques': ['Recueil de cantiques', 'Les cantiques de l’Église Bon Nouveau Message, en lingala et en kikongo. Cherchez par titre ou par parole.'],
  '/catechisme': ['Le Catéchisme du KCCisme', 'Questions et réponses sur les croyances, l’enseignement, les fêtes, les sacrements et l’Alliance.'],
  '/liturgie': ['Rites et célébrations', 'Le déroulement officiel des cultes et des sacrements de l’Église Bon Nouveau Message, avec leurs prières.'],
  '/appel-du-prophete': ['L’appel du Prophète', 'Du 8 mars 1955 au début de 1957 : apparitions, signes et épreuves par lesquels l’Éternel a appelé et préparé DIZOLELE-MPUNGU WAFIDUSWA Isaac.'],
  '/predications': ['Prédications', 'Des prédications audio à écouter, et l’enseignement de Son Éminence le Chef Spirituel tiré des notes de prédications et des rapports de séminaires de l’Église.'],
  '/galerie': ['Galerie photo de l’Église', 'Cultes, mamans, temples et archives anciennes de l’Église Bon Nouveau Message (fonds d’archives de la communauté).'],
  '/apotres': ['Les Révérends Apôtres', 'Tous les Révérends Apôtres de l’Église Bon Nouveau Message, en vie et décédés. Vous avez la photo d’un apôtre ? Envoyez-la.'],
  '/videos': ['Vidéos', 'Les vidéos de la communauté sur notre chaîne YouTube « Je suis KCCiste ». Chaque abonnement et chaque partage aide la chaîne à grandir.'],
  '/communaute': ['Un seul peuple, partout dans le monde', 'Découvrez l’organisation de la communauté et retrouvez les vôtres.'],
  '/paroisses': ['Paroisses', 'Les paroisses enregistrées sur JE SUIS KCCiste, en RD Congo et dans la diaspora.'],
  '/forum': ['Forum de discussion', 'Des sujets proposés par l’administration, commentés par les membres inscrits avec leur nom et leur paroisse.'],
  '/sections': ['Sections', 'Chaque paroisse peut organiser ses sections : jeunesse, chorales, mamans, diaspora…'],
  '/actualites': ['Actualités et annonces', 'Les dernières nouvelles et annonces de la communauté KCCiste.'],
  '/agenda': ['Agenda et événements', 'Cultes, réunions, formations, séminaires, concerts et actions de solidarité.'],
  '/academie': ['Apprendre, grandir et servir', 'Des parcours de formation pour les membres, les responsables, les chorales et les formateurs.'],
  '/academie/formations': ['Catalogue des formations', 'Toutes les formations de l’Académie KCC.'],
  '/musique': ['KCC Music', 'Chants, albums, chorales et artistes de la communauté, diffusés avec l’autorisation des ayants droit.'],
  '/musique/artistes': ['Artistes et chorales', 'Les artistes et chorales de la communauté KCCiste.'],
  '/bibliotheque': ['Bibliothèque numérique', 'Documents, supports de formation, vidéos et rapports, classés selon leur niveau d’accès.'],
  '/solidarite': ['Servir ensemble, en toute transparence', 'Des projets suivis, documentés et rendus publics, au service de la communauté.'],
  '/solidarite/projets': ['Projets de solidarité', 'Les projets de solidarité de la communauté KCCiste.'],
  '/confidentialite': ['Confidentialité et conditions d’utilisation', 'Comment JE SUIS KCCiste protège vos données.'],
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Remplace l'attribut content de la balise meta identifiée par attr="key". */
function setMeta(html: string, attr: string, key: string, value: string) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`Balise ${attr}="${key}" absente de index.html`);
  return html.replace(re, `$1${esc(value)}$2`);
}

const base = readFileSync(join(DIST, 'index.html'), 'utf8');

interface Meta { title: string; description: string; image?: string | null }

function render(path: string, { title, description, image }: Meta) {
  const url = SITE + path;
  const desc = description.replace(/\s+/g, ' ').trim().slice(0, 300);
  let html = base
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(`${title} — ${NAME}`)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  html = setMeta(html, 'name', 'description', desc);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', desc);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', desc);
  // Les réseaux sociaux n'affichent pas les SVG : on garde alors l'image du site.
  if (image && !/\.svg(\?|$)/i.test(image)) {
    // Photo propre au contenu : ses dimensions ne sont pas celles de l'image par défaut.
    const img = new URL(image, SITE).toString();
    html = setMeta(html, 'property', 'og:image', img);
    html = setMeta(html, 'name', 'twitter:image', img);
    html = setMeta(html, 'property', 'og:image:alt', title);
    html = html.replace(/\s*<meta property="og:image:(width|height)" content="[^"]*" \/>/g, '');
    html = html.replace(/(<meta property="og:type" content=")[^"]*(")/, '$1article$2');
  }
  const file = join(DIST, `${path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

/** « Disciple KAPAPA MUANDA Bossin · Paroisse d’Aéroport · Genèse 3 : 1-5 » */
const sermonSummary = (s: { preacherTitle?: string | null; preacherName: string; parish?: string | null; bibleText?: string | null }) =>
  [[s.preacherTitle, s.preacherName].filter(Boolean).join(' '), s.parish, s.bibleText].filter(Boolean).join(' · ');

let count = 0;
for (const [path, [title, description]] of Object.entries(PAGES)) {
  render(path, { title, description });
  count += 1;
}
for (const a of editorialAnnouncements('fr')) {
  render(`/actualites/${a.id}`, { title: a.title, description: a.summary, image: a.imageUrl });
  count += 1;
}
for (const e of editorialEvents('fr')) {
  render(`/agenda/${e.id}`, { title: e.title, description: e.description, image: e.posterUrl });
  count += 1;
}
for (const c of editorialCourses('fr')) {
  render(`/academie/formations/${c.slug}`, { title: c.title, description: c.summary, image: c.coverUrl });
  count += 1;
}
// Prédications audio livrées avec le site (celles ajoutées dans l'administration passent par le Worker).
for (const s of demoAudioSermons) {
  render(`/predications/audio/${s.id}`, { title: s.title, description: sermonSummary(s), image: s.preacherPhotoUrl });
  count += 1;
}
// Photos de la galerie livrées avec le site (celles ajoutées dans l'administration passent par le Worker).
for (const p of galleryPhotos) {
  render(`/galerie/photo/${photoKey(p.src)}`, { title: p.caption.fr, description: PAGES['/galerie'][1], image: p.src });
  count += 1;
}
console.log(`prerender-meta : ${count} pages avec leur aperçu de partage.`);
