import { Link } from 'react-router-dom';
import { ChevronUp, Facebook, Globe, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { youtubeChannelUrl } from '@/config/youtube';
import { Logo } from '@/components/common/Logo';
import { useI18n } from '@/i18n';
import { LanguageSwitch } from './LanguagePicker';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { YouTubeIcon } from '@/components/common/YouTubeChannel';
import { YOUTUBE_CHANNEL_NAME, youtubeSubscribeUrl } from '@/config/youtube';

const socialIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('face')) return Facebook;
  if (l.includes('insta')) return Instagram;
  if (l.includes('you')) return Youtube;
  if (l.includes('twit') || l === 'x') return Twitter;
  return Globe;
};

export function Footer() {
  const { t, tx } = useI18n();
  const { settings } = useSiteSettings();
  const col = 'mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold';
  const link = 'text-[13px] text-white/65 transition hover:text-white';
  const groups: { title: string; links: [string, string][] }[] = [
    { title: t('footer.navigation'), links: [[tx('À propos', 'About', 'Sobre'), '/a-propos'], [t('nav.community'), '/communaute'], [tx('Paroisses', 'Parishes', 'Paróquias'), '/paroisses'], [tx('Actualités', 'News', 'Notícias'), '/actualites']] },
    { title: tx('La Foi', 'Our Faith', 'A Fé'), links: [[tx('Doctrine et histoire', 'Doctrine and history', 'Doutrina e história'), '/doctrine'], [tx('Catéchisme', 'Catechism', 'Catecismo'), '/catechisme'], [tx('Prédications', 'Sermons', 'Pregações'), '/predications'], [tx('Cantiques', 'Hymns', 'Hinos'), '/cantiques']] },
    { title: tx('Médias', 'Media', 'Média'), links: [['KCC Music', '/musique'], [tx('Vidéos', 'Videos', 'Vídeos'), '/videos'], [tx('Galerie', 'Gallery', 'Galeria'), '/galerie'], [tx('Bibliothèque', 'Library', 'Biblioteca'), '/bibliotheque']] },
    { title: t('footer.services'), links: [[tx('Académie KCC', 'KCC Academy', 'Academia KCC'), '/academie'], [tx('Agenda', 'Calendar', 'Agenda'), '/agenda'], [t('nav.solidarity'), '/solidarite'], [tx('Application Android', 'Android app', 'Aplicação Android'), '/app/android.apk']] },
  ];
  return (
    <footer className="relative isolate overflow-hidden bg-night-950 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-20 -z-10 h-96 w-96 rounded-full bg-night-500/40 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 mask-fade-b" aria-hidden />
      <div className="container-page relative grid gap-7 py-7 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <Logo light large />
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/65">{t('footer.about')}</p>
        </div>
        <nav className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:col-span-6" aria-label={tx('Plan du site', 'Site map', 'Mapa do site')}>
          {groups.map((g) => (
            <div key={g.title}>
              <p className={col}>{g.title}</p>
              <ul className="space-y-1">
                {g.links.map(([label, to]) => (
                  <li key={to}>{to.startsWith('/app/') ? <a className={link} href={to}>{label}</a> : <Link className={link} to={to}>{label}</Link>}</li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="lg:col-span-3">
          <p className={col}>{t('footer.contact')}</p>
          <ul className="space-y-2 text-[13px] text-white/65">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden />{settings.contact.address}</li>
            {settings.contact.email && <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden /><a className={link} href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a></li>}
            {settings.contact.phone && <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden /><a className={link} href={`tel:${settings.contact.phone.replace(/\s/g, '')}`}>{settings.contact.phone}</a> · <a className={link} href={`https://wa.me/${settings.contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-2">
          <a href={youtubeSubscribeUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-[13px] text-white/85 transition hover:border-[#FF0000] hover:bg-[#FF0000]/15 hover:text-white">
            <YouTubeIcon className="h-4 w-6" />
            <span>{tx('S’abonner', 'Subscribe', 'Subscrever')} · <strong>{YOUTUBE_CHANNEL_NAME}</strong></span>
          </a>
          <div className="flex flex-wrap gap-2" aria-label={tx('Suivez-nous', 'Follow us', 'Siga-nos')}>
            {[{ label: 'YouTube', url: youtubeChannelUrl() }, ...settings.socials.filter((x) => !/youtube/i.test(x.label))].map((x) => {
              const Icon = socialIcon(x.label);
              return (
                <a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={x.label} title={x.label} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:border-gold hover:bg-gold hover:text-night">
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </a>
              );
            })}
          </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-3 text-[11px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} JE SUIS KCCiste. {tx('Tous droits réservés.', 'All rights reserved.', 'Todos os direitos reservados.')}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/confidentialite" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link to="/confidentialite#conditions" className="hover:text-white">{t('footer.legal')}</Link>
            <LanguageSwitch light />
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-gold hover:text-night" aria-label={tx('Revenir en haut', 'Back to top', 'Voltar ao topo')}><ChevronUp className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
