import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, MessageCircle, Search, Shield, Smartphone, X } from 'lucide-react';
import { MAIN_NAV } from '@/config/navigation';
import { useI18n } from '@/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/lib/permissions';
import { useUnreadMessages } from '@/features/messages/MessagesUi';
import { Logo } from '@/components/common/Logo';
import { Avatar } from '@/components/ui/Misc';
import { ButtonLink, buttonClass } from '@/components/ui/Button';
import { SearchDialog } from './SearchDialog';
import { LanguageSwitch } from './LanguagePicker';
import { DemoBanner } from '@/components/common/DemoNotice';
import { OfflineNotice } from '@/components/common/OfflineNotice';
import { InstallBanner } from '@/features/pwa/InstallBanner';
import { OnlineCount } from '@/components/common/OnlineCount';
import { cn } from '@/utils/format';

export function Navbar({ transparent }: { transparent?: boolean }) {
  const { t, tx, pick } = useI18n();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userRef = useRef<HTMLDivElement>(null);
  const unread = useUnreadMessages();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); setUserMenu(false); }, [location.pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    const onClick = (e: MouseEvent) => { if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, []);

  const solid = !transparent || scrolled || open;
  const linkBase = cn('relative flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 text-[14px] 2xl:px-3.5 font-medium transition-colors', solid ? 'text-ink/75 hover:text-night hover:bg-night/[0.05]' : 'text-white/80 hover:text-white hover:bg-white/10');
  const active = solid ? 'text-night bg-night/[0.05]' : 'text-white bg-white/10';

  return (
    <>
      <header className={cn('top-0 z-40 transition-all duration-300', transparent ? 'fixed inset-x-0' : 'sticky', solid ? 'border-b border-night/[0.06] bg-white/80 shadow-[0_8px_30px_-20px_rgba(14,24,48,.25)] backdrop-blur-xl backdrop-saturate-150' : 'bg-gradient-to-b from-night-950/70 to-transparent')}>
        <DemoBanner />
        <OfflineNotice />
        <InstallBanner />
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:text-night">{tx('Aller au contenu', 'Skip to content', 'Ir para o conteúdo')}</a>
        <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <Logo light={!solid} />

          <nav className={cn('hidden items-center gap-0.5 rounded-full p-1 transition xl:flex', solid ? 'border border-night/[0.06] bg-white/60' : 'border border-white/10 bg-white/[0.04] backdrop-blur-md')} aria-label={tx('Navigation principale', 'Main navigation', 'Navegação principal')}>
            {MAIN_NAV.map((g) =>
              g.children ? (
                <div key={g.key} className="group relative">
                  <NavLink to={g.to} className={({ isActive }) => cn(linkBase, isActive && active)} aria-haspopup="true">
                    {t(g.key)} <ChevronDown className="hidden h-3.5 w-3.5 opacity-60 transition group-hover:rotate-180 2xl:block" aria-hidden />
                  </NavLink>
                  <div className="invisible absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div className="rounded-3xl border border-night/[0.06] bg-white/95 p-2 shadow-lift backdrop-blur-xl">
                      {g.children.map((c) => (
                        <Link key={c.to} to={c.to} className="block rounded-2xl px-3.5 py-3 transition hover:bg-gold-50 focus:bg-gold-50 focus:outline-none">
                          <span className="block text-sm font-semibold text-night">{pick(c.label)}</span>
                          {c.description && <span className="block text-xs text-ink/55">{pick(c.description)}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink key={g.key} to={g.to} end className={({ isActive }) => cn(linkBase, isActive && active)}>
                  {t(g.key)}
                </NavLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitch light={!solid} className="hidden md:inline-flex" />
            <button onClick={() => setSearchOpen(true)} className={cn('grid h-10 w-10 place-items-center rounded-full transition', solid ? 'text-night hover:bg-night/5' : 'text-white hover:bg-white/10')} aria-label={t('nav.search')} title={`${t('nav.search')} (Ctrl+K)`}>
              <Search className="h-5 w-5" />
            </button>
            {profile ? (
              <div ref={userRef} className="relative hidden sm:block">
                <button onClick={() => setUserMenu((v) => !v)} className={cn('flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition', solid ? 'hover:bg-night/5' : 'hover:bg-white/10')} aria-expanded={userMenu} aria-haspopup="menu">
                  <span className="relative">
                    <Avatar person={profile} url={profile.avatarUrl} size={34} />
                    {unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-gold ring-2 ring-white" aria-label={tx('Nouveaux messages', 'New messages', 'Novas mensagens')} />}
                  </span>
                  <span className={cn('hidden text-sm font-semibold md:block', solid ? 'text-night' : 'text-white')}>{profile.firstName}</span>
                  <ChevronDown className={cn('h-4 w-4', solid ? 'text-ink/50' : 'text-white/70')} />
                </button>
                {userMenu && (
                  <div role="menu" className="absolute right-0 top-full mt-2 w-56 rounded-3xl border border-night/10 bg-white p-2 shadow-lift">
                    <Link role="menuitem" to="/espace" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-mist"><LayoutDashboard className="h-4 w-4" /> {t('nav.mySpace')}</Link>
                    <Link role="menuitem" to="/espace/messages" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-mist"><MessageCircle className="h-4 w-4" /> <span className="flex-1">{tx('Messages privés', 'Private messages', 'Mensagens privadas')}</span>{unread > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-night">{unread}</span>}</Link>
                    {can(profile, 'admin.access') && <Link role="menuitem" to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-mist"><Shield className="h-4 w-4" /> {t('nav.admin')}</Link>}
                    <button role="menuitem" onClick={async () => { await signOut(); navigate('/'); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" /> {t('nav.logout')}</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/connexion" className={cn(buttonClass('ghost', 'sm'), !solid && 'text-white hover:bg-white/10')}>{t('nav.login')}</Link>
                <ButtonLink to="/inscription" variant="outline" size="sm" className="hidden 2xl:inline-flex">{t('nav.signup')}</ButtonLink>
              </div>
            )}
            <ButtonLink to="/solidarite#don" variant="gold" size="sm" icon={<Heart className="h-4 w-4" />} className="hidden sm:inline-flex">{tx('Faire un don', 'Donate', 'Fazer um donativo')}</ButtonLink>
            <button onClick={() => setOpen((v) => !v)} className={cn('grid h-10 w-10 place-items-center rounded-full xl:hidden', solid ? 'text-night hover:bg-night/5' : 'text-white hover:bg-white/10')} aria-label={open ? tx('Fermer le menu', 'Close menu', 'Fechar o menu') : tx('Ouvrir le menu', 'Open menu', 'Abrir o menu')} aria-expanded={open} aria-controls="menu-mobile">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div id="menu-mobile" className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-night/10 bg-white/95 backdrop-blur-xl animate-fade-up xl:hidden">
            <nav className="container-page space-y-4 py-5" aria-label={tx('Navigation mobile', 'Mobile navigation', 'Navegação móvel')}>
              <OnlineCount />
              <div className="flex items-center justify-between rounded-2xl bg-night px-4 py-3 text-white md:hidden">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">{t('footer.language')}</span>
                <LanguageSwitch light />
              </div>
              {MAIN_NAV.map((g) => (
                <div key={g.key}>
                  <Link to={g.to} className="block py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{t(g.key)}</Link>
                  {g.children && (
                    <div className="mt-1 grid grid-cols-2 gap-1.5">
                      {g.children.map((c) => (
                        <Link key={c.to} to={c.to} className="rounded-2xl border border-night/[0.05] bg-mist px-3.5 py-3 text-sm font-medium text-night transition active:bg-gold-50">{pick(c.label)}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {can(profile, 'admin.access') && (
                <Link to="/admin" className="flex items-center gap-3 rounded-2xl bg-night px-4 py-3 text-sm font-semibold text-white"><Shield className="h-5 w-5 text-gold" aria-hidden /> {t('nav.admin')}</Link>
              )}
              <Link to="/application" className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold-50 px-4 py-3 text-sm font-semibold text-night"><Smartphone className="h-5 w-5 text-gold-600" aria-hidden /> {tx('Installer l’application sur mon téléphone', 'Install the app on my phone', 'Instalar a aplicação no meu telemóvel')}</Link>
              <div className="flex gap-2 border-t border-night/10 pt-4">
                {profile ? (
                  <>
                    <ButtonLink to="/espace" className="flex-1">{t('nav.mySpace')}</ButtonLink>
                    <ButtonLink to="/espace/messages" variant="outline" className="relative px-4" aria-label={tx('Messages privés', 'Private messages', 'Mensagens privadas')} icon={<MessageCircle className="h-5 w-5" />}>
                      {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-gold px-1.5 text-[11px] font-bold text-night">{unread}</span>}
                    </ButtonLink>
                    <button className={buttonClass('outline', 'md', 'flex-1')} onClick={async () => { await signOut(); navigate('/'); }}>{t('nav.logout')}</button>
                  </>
                ) : (
                  <>
                    <ButtonLink to="/connexion" variant="outline" className="flex-1">{t('nav.login')}</ButtonLink>
                    <ButtonLink to="/inscription" variant="gold" className="flex-1">{t('nav.signup')}</ButtonLink>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
