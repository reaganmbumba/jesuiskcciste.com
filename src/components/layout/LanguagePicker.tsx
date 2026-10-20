import { useEffect, useRef } from 'react';
import { Check, Globe } from 'lucide-react';
import { LOCALES, useI18n } from '@/i18n';
import { cn } from '@/utils/format';

/** Sélecteur compact FR | EN | PT (barre du haut, menu mobile, pied de page). */
export function LanguageSwitch({ light, className }: { light?: boolean; className?: string }) {
  const { locale, setLocale, tx } = useI18n();
  return (
    <div role="group" aria-label={tx('Langue', 'Language', 'Idioma')} className={cn('inline-flex items-center rounded-full p-0.5', light ? 'border border-white/15 bg-white/[0.06]' : 'border border-night/10 bg-white/70', className)}>
      {LOCALES.map((l) => {
        const on = l.code === locale;
        return (
          <button key={l.code} type="button" lang={l.code} onClick={() => setLocale(l.code)} aria-pressed={on} title={l.label}
            className={cn('min-w-[2.1rem] rounded-full px-2 py-1 text-[11px] font-bold tracking-wider transition',
              on ? 'bg-gradient-to-b from-gold-300 to-gold-500 text-night shadow-glow' : light ? 'text-white/70 hover:text-white' : 'text-ink/60 hover:text-night')}>
            {l.short}
          </button>
        );
      })}
    </div>
  );
}

/** Fenêtre affichée au premier passage pour choisir la langue du site. */
export function LanguageWelcome() {
  const { chosen, locale, setLocale } = useI18n();
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (chosen) return;
    document.body.style.overflow = 'hidden';
    setTimeout(() => first.current?.focus(), 30);
    return () => { document.body.style.overflow = ''; };
  }, [chosen]);
  if (chosen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-night-950/70 backdrop-blur-md sm:items-center sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="lang-title"
        className="relative w-full overflow-hidden rounded-t-[2rem] border border-white/10 bg-night-950 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 text-white shadow-lift animate-fade-up sm:max-w-xl sm:rounded-[2rem] sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-[90px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 mask-fade-b" aria-hidden />
        <div className="relative">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-200 via-gold-400 to-gold-600 text-night shadow-glow"><Globe className="h-6 w-6" aria-hidden /></span>
          <h2 id="lang-title" className="mt-5 font-display text-2xl font-semibold leading-tight sm:text-3xl">
            Choisissez votre langue
          </h2>
          <p className="mt-1 text-sm text-white/60">Choose your language · Escolha o seu idioma</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {LOCALES.map((l) => (
              <button key={l.code} ref={l.code === locale ? first : undefined} type="button" lang={l.code} onClick={() => setLocale(l.code)}
                className={cn('group relative flex items-center gap-4 rounded-3xl border p-4 text-left transition sm:flex-col sm:items-start sm:gap-3 sm:p-5',
                  l.code === locale ? 'border-gold/70 bg-gold/10' : 'border-white/10 bg-white/[0.04] hover:border-gold/50 hover:bg-white/[0.07]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold')}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 font-display text-sm font-bold text-gold-200">{l.short}</span>
                <span className="flex-1">
                  <span className="block font-display text-lg font-semibold">{l.label}</span>
                  <span className="block text-xs text-white/55">{l.hello}</span>
                </span>
                {l.code === locale && <Check className="h-5 w-5 text-gold sm:absolute sm:right-4 sm:top-4" aria-hidden />}
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-white/45">Vous pourrez changer à tout moment · You can change it anytime · Pode mudar a qualquer momento</p>
        </div>
      </div>
    </div>
  );
}
