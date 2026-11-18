import { Link } from 'react-router-dom';
import { CircleCheck, Download } from 'lucide-react';
import { useI18n } from '@/i18n';
import { formatBytes, isSaved, keepPage, offlineSupported, useOfflineItems } from './offline';

const URL_PAGE = '/cantiques';

/** « Garder le recueil sur ce téléphone » : le texte des cantiques s'ouvre ensuite sans internet. */
export function KeepHymnalOffline({ bytes }: { bytes: number }) {
  const { tx, locale } = useI18n();
  useOfflineItems();
  if (!offlineSupported()) return null;
  const kept = isSaved(URL_PAGE);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gold/30 bg-gold-50/60 px-4 py-3 text-sm">
      {kept ? <CircleCheck className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden /> : <Download className="h-5 w-5 shrink-0 text-gold-700" aria-hidden />}
      <p className="min-w-0 flex-1 text-ink/75">
        {kept
          ? tx('Le recueil est gardé sur ce téléphone : il s’ouvre même sans internet.', 'The hymn book is kept on this phone: it opens even without internet.', 'O hinário está guardado neste telemóvel: abre mesmo sem internet.')
          : tx('Gardez le recueil sur ce téléphone pour chanter même sans internet.', 'Keep the hymn book on this phone to sing even without internet.', 'Guarde o hinário neste telemóvel para cantar mesmo sem internet.')}
        {' '}<Link to="/hors-ligne" className="font-semibold text-gold-800 underline-offset-2 hover:underline">{tx('Mes téléchargements', 'My downloads', 'As minhas descargas')}</Link>
      </p>
      {!kept && (
        <button type="button" onClick={() => keepPage({ url: URL_PAGE, title: tx('Recueil de cantiques (texte)', 'Hymn book (text)', 'Hinário (texto)'), kind: 'recueil', page: URL_PAGE, bytes })}
          className="rounded-full bg-night px-4 py-2 text-xs font-semibold text-gold hover:bg-deep">
          {tx(`Garder hors ligne (${formatBytes(bytes, locale)})`, `Keep offline (${formatBytes(bytes, locale)})`, `Guardar offline (${formatBytes(bytes, locale)})`)}
        </button>
      )}
    </div>
  );
}
