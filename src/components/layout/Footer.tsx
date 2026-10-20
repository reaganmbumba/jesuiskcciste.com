import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { LOCALES, useI18n, type Locale } from '@/i18n';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function Footer() {
  const { t, locale, setLocale } = useI18n();
  const { settings } = useSiteSettings();
  const col = 'mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold';
  const link = 'text-sm text-white/65 transition hover:text-white';
  const missing = <span className="italic text-white/40">{t('footer.notConfigured')}</span>;
  return (
    <footer className="relative isolate overflow-hidden bg-night-950 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-20 -z-10 h-96 w-96 rounded-full bg-night-500/40 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 mask-fade-b" aria-hidden />
      <div className="container-page relative grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">{t('footer.about')}</p>
          <p className="mt-6 font-display text-2xl italic leading-snug text-gold-gradient">« {t('hero.title')} »</p>
        </div>
        <div className="lg:col-span-2">
          <p className={col}>{t('footer.navigation')}</p>
          <ul className="space-y-2.5">
            <li><Link className={link} to="/">{t('nav.home')}</Link></li>
            <li><Link className={link} to="/a-propos">À propos</Link></li>
            <li><Link className={link} to="/communaute">{t('nav.community')}</Link></li>
            <li><Link className={link} to="/paroisses">Paroisses</Link></li>
            <li><Link className={link} to="/actualites">Actualités</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          <p className={col}>{t('footer.services')}</p>
          <ul className="space-y-2.5">
            <li><Link className={link} to="/academie">Académie KCC</Link></li>
            <li><Link className={link} to="/agenda">Agenda</Link></li>
            <li><Link className={link} to="/musique">KCC Music</Link></li>
            <li><Link className={link} to="/bibliotheque">Bibliothèque</Link></li>
            <li><Link className={link} to="/solidarite">Solidarité</Link></li>
            <li><a className={link} href="/app/android.apk">Application Android</a></li>
          </ul>
        </div>
        <div className="lg:col-span-4">
          <p className={col}>{t('footer.contact')}</p>
          <ul className="space-y-3 text-sm text-white/65">
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden />{settings.contact.email ? <a className={link} href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a> : missing}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden />{settings.contact.phone || missing}</li>
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden />{settings.contact.address || missing}</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {settings.socials.length ? settings.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/75 transition hover:border-gold hover:bg-gold/10 hover:text-white">{s.label}</a>
            )) : <p className="text-xs text-white/40">Réseaux sociaux officiels : {t('footer.notConfigured').toLowerCase()}</p>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} JE SUIS KCCiste. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/confidentialite" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link to="/confidentialite#conditions" className="hover:text-white">{t('footer.legal')}</Link>
            <label className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">{t('footer.language')}</span>
              <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="rounded-md border border-white/15 bg-night px-2 py-1 text-white/80 focus:border-gold focus:outline-none">
                {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>
    </footer>
  );
}
