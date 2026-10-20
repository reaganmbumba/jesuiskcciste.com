import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/** Informe l'utilisateur d'une perte de réseau. L'application ne fonctionne pas hors connexion. */
export function OfflineNotice() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div role="status" className="bg-red-600 text-white">
      <p className="container-page flex items-center justify-center gap-2 py-1.5 text-xs font-medium"><WifiOff className="h-3.5 w-3.5" /> Vous êtes hors connexion. Les contenus ne peuvent pas être mis à jour.</p>
    </div>
  );
}
