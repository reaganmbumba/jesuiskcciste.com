import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, WifiOff } from 'lucide-react';
import { Button } from './Button';
import { useI18n } from '@/i18n';

export function EmptyState({ title, description, action, icon }: { title?: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-night/15 bg-white/60 px-6 py-14 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-50 text-gold-600">{icon ?? <Inbox className="h-6 w-6" aria-hidden />}</div>
      <p className="font-semibold text-night">{title ?? t('common.empty')}</p>
      {description && <p className="mt-1 max-w-md text-sm text-ink/60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { tx } = useI18n();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  const message = offline ? tx('Vous semblez hors connexion. Vérifiez votre réseau puis réessayez.', 'You seem to be offline. Check your connection and try again.', 'Parece estar sem ligação. Verifique a rede e tente novamente.') : error instanceof Error ? error.message : tx('Une erreur est survenue.', 'An error occurred.', 'Ocorreu um erro.');
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      {offline ? <WifiOff className="mb-2 h-6 w-6 text-red-600" aria-hidden /> : <AlertTriangle className="mb-2 h-6 w-6 text-red-600" aria-hidden />}
      <p className="font-semibold text-red-800">{offline ? tx('Connexion indisponible', 'Connection unavailable', 'Ligação indisponível') : tx('Impossible de charger les données', 'Unable to load data', 'Não foi possível carregar os dados')}</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>{tx('Réessayer', 'Try again', 'Tentar novamente')}</Button>}
    </div>
  );
}
