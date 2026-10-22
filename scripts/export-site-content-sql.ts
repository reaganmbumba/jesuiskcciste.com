/**
 * Écrit supabase/seed_site_content.sql : copie dans la base le contenu livré
 * avec le site (galerie, vidéos, solidarité, actualités, bibliothèque), pour
 * que l'administration puisse le modifier ou le supprimer.
 *
 * Usage : npx vite-node scripts/export-site-content-sql.ts
 * Le fichier peut être exécuté plusieurs fois sans créer de doublons.
 */
import { writeFileSync } from 'node:fs';
import { baseRows, type SiteCollection } from '@/features/content/siteContent';
import { editorialAnnouncements, editorialMedia } from '@/content/editorial';

const q = (v: unknown) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const uuid = (key: string) => `md5(${q(key)})::uuid`;

const out: string[] = [
  '-- Contenu de base du site, copié dans la base pour être modifiable depuis l’administration.',
  '-- Généré par scripts/export-site-content-sql.ts. Peut être exécuté plusieurs fois sans doublon.',
  '',
];

// Collections de « Contenu du site » : seulement si la collection est encore vide.
const rows = baseRows();
for (const c of [...new Set(rows.map((r) => r.collection))] as SiteCollection[]) {
  const list = rows.filter((r) => r.collection === c);
  out.push(`-- ${c} (${list.length})`);
  out.push(`insert into public.site_content (collection, position, data, published)`);
  out.push(`select v.collection, v.position, v.data::jsonb, true from (values`);
  out.push(list.map((r) => `  (${q(c)}, ${r.position}, ${q(JSON.stringify(r.data))})`).join(',\n'));
  out.push(`) as v(collection, position, data)`);
  out.push(`where not exists (select 1 from public.site_content s where s.collection = ${q(c)});`);
  out.push('');
}

// Actualités du contenu de base (en français).
const anns = editorialAnnouncements('fr');
out.push(`-- Actualités (${anns.length})`);
out.push('insert into public.announcements (id, title, summary, content, image_url, author, category, published_at, status, audience, pinned) values');
out.push(anns.map((a) => `  (${uuid(a.id)}, ${q(a.title)}, ${q(a.summary)}, ${q(a.content)}, ${q(a.imageUrl)}, ${q(a.author)}, ${q(a.category)}, ${q(a.publishedAt)}, 'published', 'public', ${a.pinned})`).join(',\n'));
out.push('on conflict (id) do nothing;');
out.push('');

// Bibliothèque numérique (en français).
const media = editorialMedia('fr');
out.push(`-- Bibliothèque numérique (${media.length})`);
out.push('insert into public.media_items (id, title, kind, category, description, url, audience, published_at) values');
out.push(media.map((m) => `  (${uuid(m.id)}, ${q(m.title)}, ${q(m.kind)}, ${q(m.category)}, ${q(m.description)}, ${q(m.url)}, 'public', ${q(m.publishedAt)})`).join(',\n'));
out.push('on conflict (id) do nothing;');
out.push('');

writeFileSync('supabase/seed_site_content.sql', out.join('\n'));
console.log(`supabase/seed_site_content.sql : ${rows.length} éléments de contenu, ${anns.length} actualités, ${media.length} documents.`);
