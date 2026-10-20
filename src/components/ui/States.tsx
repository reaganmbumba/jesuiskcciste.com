import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, WifiOff } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ title = 'Aucun élément pour le moment.', description, action, icon }: { title?: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-night/15 bg-white/60 px-6 py-14 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-50 text-gold-600">{icon ?? <Inbox className="h-6 w-6" aria-hidden />}</div>
      <p className="font-semibold text-night">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-ink/60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  const message = offline ? 'Vous semblez hors connexion. Vérifiez votre réseau puis réessayez.' : error instanceof Error ? error.message : 'Une erreur est survenue.';
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      {offline ? <WifiOff className="mb-2 h-6 w-6 text-red-600" aria-hidden /> : <AlertTriangle className="mb-2 h-6 w-6 text-red-600" aria-hidden />}
      <p className="font-semibold text-red-800">{offline ? 'Connexion indisponible' : 'Impossible de charger les données'}</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Réessayer</Button>}
    </div>
  );
}
