import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { SiteSettingsProvider } from '@/hooks/useSiteSettings';
import { ScrollToTop } from '@/layouts/PublicLayout';
import { AppRoutes } from '@/routes/AppRoutes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RadioProvider } from '@/features/radio/RadioContext';
import { MiniRadioPlayer } from '@/features/radio/RadioUi';
import { MatriculeWelcome } from '@/features/news/MatriculeWelcome';
import { RequiredPhotoGate } from '@/features/auth/RequiredPhotoGate';

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <RadioProvider>
                  <ScrollToTop />
                  <AppRoutes />
                  <MiniRadioPlayer />
                  <RequiredPhotoGate />
                  <MatriculeWelcome />
                </RadioProvider>
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
