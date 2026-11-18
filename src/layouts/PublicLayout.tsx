import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { PageLoader } from '@/components/ui/Spinner';
import { LanguageWelcome } from '@/components/layout/LanguagePicker';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    // Lien vers une section (#…) : on attend que la page (chargée à la demande) l'affiche, puis on y va.
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 30) {
        window.clearInterval(timer);
        if (el) {
          if (el instanceof HTMLDetailsElement) el.open = true;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);
  return null;
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col pb-24 lg:pb-0">
      <Navbar />
      <main id="contenu" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MobileTabBar />
      <LanguageWelcome />
    </div>
  );
}
