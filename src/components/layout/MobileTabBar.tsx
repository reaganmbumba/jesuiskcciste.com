import { NavLink } from 'react-router-dom';
import { CalendarDays, GraduationCap, Home, User, Users } from 'lucide-react';
import { cn } from '@/utils/format';

/** Barre de navigation inférieure (téléphones). */
export function MobileTabBar() {
  const items = [
    { to: '/', label: 'Accueil', icon: Home, end: true },
    { to: '/communaute', label: 'Communauté', icon: Users },
    { to: '/agenda', label: 'Agenda', icon: CalendarDays },
    { to: '/academie', label: 'Formations', icon: GraduationCap },
    { to: '/espace', label: 'Mon espace', icon: User },
  ];
  return (
    <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-[1.6rem] border border-white/10 bg-night/90 px-1.5 shadow-[0_18px_40px_-12px_rgba(6,12,26,.55)] backdrop-blur-xl backdrop-saturate-150 lg:hidden" aria-label="Navigation rapide">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium transition-colors', isActive ? 'text-gold-200' : 'text-white/55')}>
              {({ isActive }) => (
                <>
                  <span className={cn('grid h-7 w-12 place-items-center rounded-full transition', isActive && 'bg-gradient-to-b from-gold-300 to-gold-500 text-night shadow-glow')}><Icon className="h-5 w-5" aria-hidden /></span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
