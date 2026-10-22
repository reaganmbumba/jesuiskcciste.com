import { useEffect, useState } from 'react';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { useI18n, type Locale, type Tri } from '@/i18n';

/**
 * Textes longs des pages (doctrine, catéchisme, rites, cantiques…) modifiables
 * par l'administration (table `page_texts`). Une ligne par page et par langue
 * (« doctrine.fr ») ; elle ne contient que les parties modifiées : le reste
 * vient du texte livré avec le site (src/content/).
 */
export type PageValue = Record<string, unknown>;

const cache = new Map<string, Promise<PageValue | null>>();
const demoRows = new Map<string, PageValue>();

export const pageTextKey = (page: string, locale: Locale | null) => (locale ? `${page}.${locale}` : page);

/** Parties modifiées d'une page, ou null (rien de modifié, ou table pas encore installée). */
export function loadPageText(key: string): Promise<PageValue | null> {
  let p = cache.get(key);
  if (!p) {
    p = (async () => {
      if (isDemoMode) return demoRows.get(key) ?? null;
      const { data, error } = await supabase!.from('page_texts').select('value').eq('key', key).maybeSingle();
      if (error || !data) return null;
      return data.value as PageValue;
    })().catch(() => null);
    cache.set(key, p);
  }
  return p;
}

/** Enregistre les parties modifiées (vide = texte d'origine rétabli). */
export async function savePageText(key: string, value: PageValue): Promise<void> {
  cache.delete(key);
  const empty = Object.keys(value).length === 0;
  if (isDemoMode) {
    if (empty) demoRows.delete(key); else demoRows.set(key, value);
    return;
  }
  const { error } = empty
    ? await supabase!.from('page_texts').delete().eq('key', key)
    : await supabase!.from('page_texts').upsert({ key, value });
  if (error) throw new Error(error.message);
}

/** Texte d'origine sans les fonctions et types exportés par le module. */
export function plainModule(mod: object): PageValue {
  return Object.fromEntries(Object.entries(mod).filter(([, v]) => typeof v !== 'function')) as PageValue;
}

/** Garde seulement les parties qui diffèrent du texte d'origine. */
export function diffPage(base: PageValue, draft: PageValue): PageValue {
  return Object.fromEntries(Object.entries(draft).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(base[k])));
}

/**
 * Contenu d'une page dans la langue du visiteur : le texte livré avec le site,
 * remplacé partie par partie par ce que l'administration a modifié.
 */
export function usePageTexts<T extends object>(page: string, defaults: Tri<T>): T;
export function usePageTexts<T extends object>(page: string, defaults: T, localized: false): T;
export function usePageTexts<T extends object>(page: string, defaults: Tri<T> | T, localized = true): T {
  const { locale } = useI18n();
  const base = localized ? ((defaults as Tri<T>)[locale] ?? (defaults as Tri<T>).fr) : (defaults as T);
  const key = pageTextKey(page, localized ? locale : null);
  const [override, setOverride] = useState<{ key: string; value: PageValue } | null>(null);
  useEffect(() => {
    let alive = true;
    void loadPageText(key).then((value) => { if (alive) setOverride(value ? { key, value } : null); });
    return () => { alive = false; };
  }, [key]);
  if (!override || override.key !== key) return base;
  // Une partie dont la forme ne correspond plus (texte d'origine changé) est ignorée.
  const safe = Object.fromEntries(Object.entries(override.value).filter(([k, v]) => k in base && Array.isArray(v) === Array.isArray((base as PageValue)[k]) && typeof v === typeof (base as PageValue)[k]));
  return { ...base, ...safe } as T;
}
