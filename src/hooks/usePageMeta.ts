import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE_NAME = 'JE SUIS KCCiste';
export const DEFAULT_TITLE = 'JE SUIS KCCiste — La communauté KCCiste';
export const DEFAULT_DESCRIPTION = 'JE SUIS KCCiste — La communauté KCCiste. Un seul peuple. Une même communauté.';
export const DEFAULT_SHARE_IMAGE = '/images/partage-jesuiskcciste.jpg';

interface PageMeta {
  title?: string;
  description?: string;
  /** Image d'aperçu (relative ou absolue). */
  image?: string | null;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

const absolute = (u: string) => new URL(u, window.location.origin).toString();

function apply({ title, description, image }: PageMeta, path: string) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 300);
  // Facebook et WhatsApp n'affichent pas les SVG : on garde alors l'image du site.
  const img = absolute(image && !/\.svg(\?|$)/i.test(image) ? image : DEFAULT_SHARE_IMAGE);
  const url = absolute(path);
  document.title = fullTitle;
  setMeta('name', 'description', desc);
  setMeta('property', 'og:title', title || DEFAULT_TITLE);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:image', img);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', title || DEFAULT_TITLE);
  setMeta('name', 'twitter:description', desc);
  setMeta('name', 'twitter:image', img);
  setCanonical(url);
}

/**
 * Met à jour le titre de l'onglet et les balises d'aperçu (Open Graph, Twitter)
 * de la page affichée, puis remet les valeurs du site en la quittant.
 * Les robots de Facebook et WhatsApp ne lisent que le HTML servi : voir
 * scripts/prerender-meta.mjs pour les aperçus générés au build.
 */
export function usePageMeta(meta: PageMeta) {
  const { pathname } = useLocation();
  const { title, description, image } = meta;
  useEffect(() => {
    apply({ title, description, image }, pathname);
    return () => apply({}, window.location.pathname);
  }, [title, description, image, pathname]);
}
