import { useState } from 'react';
import { CircleCheck, Download, Loader2, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import {
  cancelDownload, formatBytes, offlineSupported, remoteSize, saveOffline, useDownloadProgress, useOfflineItems,
  absolute, type OfflineKind,
} from './offline';

export interface OfflineTarget {
  url: string;
  title: string;
  kind: OfflineKind;
  group?: string;
  page?: string;
  seconds?: number;
  /** Taille connue d'avance ; sinon elle est demandée au serveur au premier appui. */
  bytes?: number;
  extra?: string[];
}

/**
 * Bouton « Télécharger pour écouter hors ligne ».
 * La taille est toujours montrée avant : si elle n'est pas connue, le premier appui la
 * demande (sans rien télécharger) et un second appui confirme.
 */
export function OfflineButton({ target, tone = 'light', compact = false, className }: { target: OfflineTarget; tone?: 'light' | 'dark'; compact?: boolean; className?: string }) {
  const { tx, locale } = useI18n();
  const items = useOfflineItems();
  const progress = useDownloadProgress(target.url);
  const [size, setSize] = useState<number | null>(target.bytes ?? null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(false);
  if (!offlineSupported()) return null;

  const saved = items.find((i) => i.url === absolute(target.url));
  const dark = tone === 'dark';
  const base = cn('inline-flex shrink-0 items-center gap-1.5 rounded-full text-xs font-semibold transition', compact ? 'px-2 py-1.5' : 'px-3 py-1.5', className);

  if (saved) {
    return (
      <span className={cn(base, dark ? 'text-emerald-300' : 'text-emerald-700')} title={tx('Disponible sans internet', 'Available offline', 'Disponível sem internet')}>
        <CircleCheck className="h-4 w-4" aria-hidden />
        <span className={cn(compact && 'sr-only sm:not-sr-only')}>{tx('Hors ligne', 'Offline', 'Offline')}</span>
      </span>
    );
  }

  if (progress !== null) {
    return (
      <button type="button" onClick={() => cancelDownload(target.url)} className={cn(base, dark ? 'bg-white/10 text-gold-200' : 'bg-gold-50 text-gold-800')}
        aria-label={tx(`Annuler le téléchargement de ${target.title}`, `Cancel download of ${target.title}`, `Cancelar a descarga de ${target.title}`)}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span className="tabular-nums">{Math.round(progress * 100)} %</span>
        <X className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </button>
    );
  }

  const start = async () => {
    setError(false);
    if (size === null && !asking) {
      setAsking(true);
      const n = await remoteSize(target.url);
      if (n === null) { setAsking(false); setError(true); return; }
      setSize(n);
      return; // second appui : confirmation avec la taille affichée
    }
    setAsking(false);
    try { await saveOffline({ ...target, bytes: size ?? undefined }); }
    catch (e) { if ((e as Error).name !== 'AbortError') setError(true); }
  };

  const label = error
    ? tx('Échec · réessayer', 'Failed · retry', 'Falhou · tentar de novo')
    : size === null
      ? (asking ? tx('Taille…', 'Size…', 'Tamanho…') : tx('Hors ligne', 'Offline', 'Offline'))
      : asking && compact
        ? `${formatBytes(size, locale)} ?`
        : asking
        ? tx(`Télécharger ${formatBytes(size, locale)} ?`, `Download ${formatBytes(size, locale)}?`, `Descarregar ${formatBytes(size, locale)}?`)
        : formatBytes(size, locale);

  return (
    <button type="button" onClick={() => void start()}
      className={cn(base, dark ? 'border border-white/20 text-white/85 hover:border-gold hover:text-gold' : 'border border-night/10 bg-white text-ink/70 hover:border-gold hover:text-night', asking && size !== null && (dark ? 'border-gold text-gold' : 'border-gold bg-gold-50 text-night'), error && 'text-red-500')}
      title={tx('Télécharger pour écouter sans internet', 'Download to listen offline', 'Descarregar para ouvir sem internet')}
      aria-label={tx(`Télécharger ${target.title} pour écouter hors ligne${size ? ` (${formatBytes(size, locale)})` : ''}`, `Download ${target.title} to listen offline${size ? ` (${formatBytes(size, locale)})` : ''}`, `Descarregar ${target.title} para ouvir offline${size ? ` (${formatBytes(size, locale)})` : ''}`)}>
      <Download className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
