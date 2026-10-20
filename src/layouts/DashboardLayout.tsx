import { Suspense, useState, type ComponentType } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { DemoBanner } from '@/components/common/DemoNotice';
import { OfflineNotice } from '@/components/common/OfflineNotice';
import { PageLoader } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Misc';
import { useAuth } from '@/features/auth/AuthContext';
import { ROLE_LABELS } from '@/lib/permissions';
import { cn } from '@/utils/format';

export interface SideItem { to: string; label: string; icon: ComponentType<{ className?: string }>; end?: boolean; badge?: number }

/** Mise en page des espaces membre et administration (menu latéral). */
export function DashboardLayout({ items, title, variant = 'member' }: { items: SideItem[]; title: string; variant?: 'member' | 'admin' }) {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const mainRole = profile?.roles.find((r) => r.role !== 'member')?.role ?? 'member';

  const side = (
    <div className="flex h-full flex-col">
      <div className="flex h-[68px] items-center justify-between px-5"><Logo light /><button className="text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Fermer le menu"><X className="h-6 w-6" /></button></div>
      <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/80">{title}</p>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label={title}>
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-gradient-to-r from-gold/25 to-gold/5 text-white shadow-[inset_3px_0_0_#D4AF62]' : 'text-white/65 hover:bg-white/5 hover:text-white')}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
            <span className="flex-1">{label}</span>
            {!!badge && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-night">{badge}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        {variant === 'admin' ? (
          <Link to="/espace" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white"><ArrowLeft className="h-[18px] w-[18px]" /> Mon espace membre</Link>
        ) : (
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white"><ArrowLeft className="h-[18px] w-[18px]" /> Retour au site</Link>
        )}
        <button onClick={async () => { await signOut(); navigate('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white"><LogOut className="h-[18px] w-[18px]" /> Déconnexion</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist">
      <DemoBanner />
      <OfflineNotice />
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-night lg:block">{side}</aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-night/60" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 bg-night shadow-lift animate-fade-up">{side}</aside>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-night/[0.06] bg-white/90 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-xl hover:bg-mist lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Menu className="h-5 w-5" /></button>
              <p className="font-display text-lg font-semibold text-night">{title}</p>
            </div>
            {profile && (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-night">{profile.firstName} {profile.lastName}</p>
                  <p className="text-xs text-ink/55">{ROLE_LABELS[mainRole]}</p>
                </div>
                <Avatar person={profile} url={profile.avatarUrl} size={38} />
              </div>
            )}
          </header>
          <main id="contenu" className="mx-auto max-w-7xl p-4 pb-24 sm:p-6 lg:p-8">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
