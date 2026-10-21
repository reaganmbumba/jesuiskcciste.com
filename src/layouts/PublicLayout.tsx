import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { PageLoader } from '@/components/ui/Spinner';
import { LanguageWelcome } from '@/components/layout/LanguagePicker';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
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
