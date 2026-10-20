import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import fr, { type Dictionary } from './locales/fr';
import en from './locales/en';
import pt from './locales/pt';
import ln from './locales/ln';

export type Locale = 'fr' | 'ln' | 'pt' | 'en';
export type TranslationKey = keyof Dictionary;

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'ln', label: 'Lingala' },
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
];

const dictionaries: Record<Locale, Partial<Dictionary>> = { fr, en, pt, ln };

export function translate(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale][key] ?? fr[key] ?? key;
}

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = 'kcc.locale';

function readStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && v in dictionaries) return v as Locale;
  } catch {
    /* stockage indisponible */
  }
  return 'fr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale === 'ln' ? 'ln' : locale;
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (k: TranslationKey) => translate(locale, k) }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé dans I18nProvider');
  return ctx;
}
