import { useState } from 'react';
import { Download, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { MOBILE_PROVIDERS, getDownloads, getOrderStatus, listMyOrders, priceLabel, type DownloadFile } from '@/features/music/shop';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';
import type { MusicOrder } from '@/types';

const ST = {
  pending: [{ fr: 'En attente', en: 'Pending', pt: 'Pendente' }, 'amber'],
  paid: [{ fr: 'Payé', en: 'Paid', pt: 'Pago' }, 'green'],
  failed: [{ fr: 'Échoué', en: 'Failed', pt: 'Falhou' }, 'red'],
  cancelled: [{ fr: 'Annulé', en: 'Cancelled', pt: 'Cancelado' }, 'neutral'],
} as const;

/** Mes achats : titres et albums payés, téléchargeables à nouveau à tout moment. */
export default function MyPurchasesPage() {
  const { profile } = useAuth();
  const { locale, tx, pick } = useI18n();
  const { data = [], loading, error, reload } = useAsync(() => (profile ? listMyOrders(profile.id) : Promise.resolve([])), [profile?.id]);
  const [files, setFiles] = useState<Record<string, DownloadFile[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState('');

  const open = async (o: MusicOrder) => {
    setBusy(o.id); setFailure('');
    try {
      if (o.status === 'pending') {
        const s = await getOrderStatus(o.id);
        if (s !== 'paid') { if (s !== 'pending') reload(); return; }
      }
      const f = await getDownloads(o.id);
      setFiles((x) => ({ ...x, [o.id]: f }));
      if (o.status === 'pending') reload();
    } catch (e) { setFailure(e instanceof Error ? e.message : String(e)); } finally { setBusy(null); }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-night">{tx('Mes achats', 'My purchases', 'As minhas compras')}</h1>
      <p className="text-sm text-ink/65">{tx('Les liens de téléchargement sont valables une heure : revenez ici pour en obtenir de nouveaux.', 'Download links are valid for one hour: come back here to get new ones.', 'As ligações de descarga são válidas durante uma hora: volte aqui para obter novas.')}</p>
      {failure && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{failure}</p>}
      {data.length ? (
        <div className="space-y-3">
          {data.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-night">{o.itemTitle}</p>
                  <p className="text-xs text-ink/55">{formatDate(o.createdAt, locale, { dateStyle: 'medium' })} · {MOBILE_PROVIDERS.find((p) => p.key === o.provider)?.label} · {priceLabel(o.amount, o.currency, locale)}</p>
                </div>
                <Badge tone={ST[o.status][1]}>{pick(ST[o.status][0])}</Badge>
                {(o.status === 'paid' || o.status === 'pending') && !files[o.id] && (
                  <Button size="sm" variant={o.status === 'paid' ? 'gold' : 'outline'} loading={busy === o.id} onClick={() => open(o)} icon={<Download className="h-4 w-4" />}>
                    {o.status === 'paid' ? tx('Télécharger', 'Download', 'Descarregar') : tx('Vérifier le paiement', 'Check payment', 'Verificar o pagamento')}
                  </Button>
                )}
              </div>
              {files[o.id] && (
                <ul className="mt-3 space-y-1.5 border-t border-night/[0.06] pt-3">
                  {files[o.id].map((f) => <li key={f.url}><a href={f.url} download className="flex items-center gap-2 text-sm font-medium text-night hover:text-gold-600"><Download className="h-4 w-4" />{f.title}</a></li>)}
                </ul>
              )}
            </Card>
          ))}
        </div>
      ) : <EmptyState icon={<ShoppingBag className="h-6 w-6" />} title={tx('Aucun achat pour le moment', 'No purchases yet', 'Ainda sem compras')} action={<ButtonLink to="/musique">KCC Music</ButtonLink>} />}
    </div>
  );
}
