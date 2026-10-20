import type { Locale } from '@/i18n';

const intlLocale: Record<Locale, string> = { fr: 'fr-FR', pt: 'pt-PT', en: 'en-GB' };

export function formatDate(iso: string, locale: Locale = 'fr', opts: Intl.DateTimeFormatOptions = { dateStyle: 'long' }, timeZone?: string) {
  try {
    return new Intl.DateTimeFormat(intlLocale[locale], { ...opts, timeZone }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat(intlLocale[locale], opts).format(new Date(iso));
  }
}

export function formatTime(iso: string, locale: Locale = 'fr', timeZone?: string) {
  return formatDate(iso, locale, { hour: '2-digit', minute: '2-digit' }, timeZone);
}

export function formatNumber(n: number, locale: Locale = 'fr') {
  return new Intl.NumberFormat(intlLocale[locale]).format(n);
}

export function formatCurrency(amount: number, currency: string, locale: Locale = 'fr') {
  return new Intl.NumberFormat(intlLocale[locale], { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

export function fullName(p: { firstName: string; middleName?: string | null; lastName: string }) {
  return [p.firstName, p.lastName, p.middleName].filter(Boolean).join(' ');
}

export function initials(p: { firstName: string; lastName: string }) {
  return `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase();
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
