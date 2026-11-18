import { Link, useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useOfflineItems, useOnline } from '@/features/offline/offline';

/** Informe d'une perte de réseau et mène aux téléchargements (livre audio, chants, cantiques gardés hors ligne). */
export function OfflineNotice() {
  const { tx } = useI18n();
  const online = useOnline();
  const items = useOfflineItems();
  const { pathname } = useLocation();
  if (online) return null;
  return (
    <div role="status" className="bg-red-600 text-white">
      <p className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 py-1.5 text-center text-xs font-medium">
        <WifiOff className="h-3.5 w-3.5" aria-hidden />
        {tx('Vous êtes hors connexion. Les pages déjà ouvertes et vos téléchargements restent disponibles.', 'You are offline. Pages already opened and your downloads are still available.', 'Está sem ligação. As páginas já abertas e as suas descargas continuam disponíveis.')}
        {pathname !== '/hors-ligne' && (
          <Link to="/hors-ligne" className="font-semibold underline underline-offset-2">
            {tx('Mes téléchargements', 'My downloads', 'As minhas descargas')}{items.length ? ` (${items.length})` : ''}
          </Link>
        )}
      </p>
    </div>
  );
}
