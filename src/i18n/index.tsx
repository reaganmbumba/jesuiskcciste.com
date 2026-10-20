import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import fr, { type Dictionary } from './locales/fr';
import en from './locales/en';
import pt from './locales/pt';

export type Locale = 'fr' | 'en' | 'pt';
export type TranslationKey = keyof Dictionary;

export const LOCALES: { code: Locale; label: string; short: string; hello: string }[] = [
  { code: 'fr', label: 'Français', short: 'FR', hello: 'Bienvenue' },
  { code: 'en', label: 'English', short: 'EN', hello: 'Welcome' },
  { code: 'pt', label: 'Português', short: 'PT', hello: 'Bem-vindo' },
];

/** Texte en trois langues, pour les chaînes écrites directement dans les pages. */
export type Tri<T = string> = { fr: T; en: T; pt: T };

const dictionaries: Record<Locale, Partial<Dictionary>> = { fr, en, pt };

export function translate(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale][key] ?? fr[key] ?? key;
}

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  /** tx('Bonjour', 'Hello', 'Olá') : choisit le texte de la langue active. */
  tx: (fr: string, en: string, pt: string) => string;
  /** pick({ fr, en, pt }) : idem pour un contenu de n'importe quel type. */
  pick: <T>(v: Tri<T>) => T;
  /** Faux tant que le visiteur n'a pas encore choisi sa langue. */
  chosen: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Valeur utilisée hors fournisseur (tests) : français. */
const FALLBACK: I18nValue = { locale: 'fr', setLocale: () => {}, chosen: true, t: (k) => translate('fr', k), tx: (f) => f, pick: (v) => v.fr };
const STORAGE_KEY = 'kcc.locale';

function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && v in dictionaries) return v as Locale;
  } catch {
    /* stockage indisponible */
  }
  return null;
}

function browserLocale(): Locale {
  const l = (typeof navigator !== 'undefined' ? navigator.language : 'fr').slice(0, 2);
  return l === 'en' || l === 'pt' ? l : 'fr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [stored] = useState(readStoredLocale);
  const [locale, setLocaleState] = useState<Locale>(() => stored ?? browserLocale());
  const [chosen, setChosen] = useState(stored !== null);
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setChosen(true);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo<I18nValue>(() => ({
    locale,
    setLocale,
    chosen,
    t: (k) => translate(locale, k),
    tx: (f, e, p) => (locale === 'en' ? e : locale === 'pt' ? p : f),
    pick: (v) => v[locale] ?? v.fr,
  }), [locale, setLocale, chosen]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext) ?? FALLBACK;
}
