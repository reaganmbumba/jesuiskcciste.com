import { Link } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { CrudTable } from '@/features/administration/CrudTable';
import { ORDER_STATUS, orderErrorText, pagneOrdersRepo, usd, whatsappNumber } from '@/features/pagnes/pagnes';
import type { Repository } from '@/services/repository';
import { formatDate, formatTime } from '@/utils/format';
import type { PagneOrder, PagneOrderStatus } from '@/types';

const wrap = <A extends unknown[], R>(fn: (...a: A) => Promise<R>) => async (...a: A): Promise<R> => {
  try {
    return await fn(...a);
  } catch (e) {
    throw new Error(orderErrorText(e));
  }
};
const adminRepo: Repository<PagneOrder> = {
  ...pagneOrdersRepo,
  all: async () => (await wrap(pagneOrdersRepo.all)()).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
  update: wrap(pagneOrdersRepo.update),
  remove: wrap(pagneOrdersRepo.remove),
};

const statusOptions = (Object.keys(ORDER_STATUS) as PagneOrderStatus[]).map((v) => ({ value: v, label: ORDER_STATUS[v].label }));

/** Commandes de pagnes reçues depuis la page « Pagnes KCC ». */
export default function AdminPagneOrders() {
  return (
    <>
      <h1 className="mb-4 font-display text-2xl font-semibold text-night">Commandes de pagnes</h1>
      <Card className="mb-6">
        <CardBody className="space-y-2 text-sm text-ink/75">
          <p>Chaque commande passée sur la page <Link to="/boutique/pagnes" className="font-semibold text-night-500 underline">Pagnes KCC</Link> arrive ici, par e-mail à l’adresse de contact du site et sur WhatsApp au numéro de contact (Administration › Paramètres).</p>
          <p>Appelez ou écrivez au client avec les boutons de la ligne, puis changez le statut avec « Modifier » : nouvelle → client contacté → payée → livrée.</p>
        </CardBody>
      </Card>
      <CrudTable<PagneOrder> entity="pagne_orders" title="Commandes reçues" repo={adminRepo} canCreate={false} pageSize={20} exportName="commandes-pagnes"
        searchFields={['reference', 'fullName', 'phone', 'city']}
        filters={[{ key: 'status', label: 'Statut', options: statusOptions }]}
        columns={[
          { key: 'createdAt', label: 'Reçue le', render: (o) => o.createdAt ? <span className="whitespace-nowrap">{formatDate(o.createdAt, 'fr', { day: 'numeric', month: 'short' })} · {formatTime(o.createdAt)}</span> : '—' },
          { key: 'reference', label: 'Référence', render: (o) => <span className="font-mono text-xs">{o.reference}</span> },
          { key: 'fullName', label: 'Client', render: (o) => (
            <div>
              <p className="font-medium text-night">{o.fullName}</p>
              <p className="text-xs text-ink/60">{o.city}, {o.country}{o.delivery === 'retrait' ? ' · retrait' : o.address ? ` · ${o.address}` : ''}</p>
            </div>
          ) },
          { key: 'items', label: 'Commande', csv: (o) => o.items.map((i) => `${i.quantity} x ${i.label}`).join(' ; '), render: (o) => (
            <div className="text-xs">
              {o.items.map((i) => <p key={i.model}>{i.quantity} × {i.label}</p>)}
              {o.note && <p className="mt-1 italic text-ink/60">« {o.note} »</p>}
            </div>
          ) },
          { key: 'total', label: 'Total', render: (o) => <span className="whitespace-nowrap font-semibold">{usd(o.total)}</span> },
          { key: 'status', label: 'Statut', render: (o) => <Badge tone={ORDER_STATUS[o.status]?.tone ?? 'neutral'}>{ORDER_STATUS[o.status]?.label ?? o.status}</Badge> },
          { key: 'phone', label: 'Contacter', render: (o) => (
            <div className="flex gap-1.5">
              <a href={`https://wa.me/${whatsappNumber(o.phone)}?text=${encodeURIComponent(`Bonjour ${o.fullName}, merci pour votre commande de pagnes KCC ${o.reference} (${usd(o.total)}).`)}`} target="_blank" rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full bg-[#1FA855] text-white" title={`WhatsApp ${o.phone}`} aria-label={`WhatsApp ${o.fullName}`}>
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href={`tel:${o.phone.replace(/[^\d+]/g, '')}`} className="grid h-8 w-8 place-items-center rounded-full bg-night text-white" title={`Appeler ${o.phone}`} aria-label={`Appeler ${o.fullName}`}>
                <Phone className="h-4 w-4" />
              </a>
            </div>
          ) },
        ]}
        formFields={[
          { key: 'status', label: 'Statut', type: 'select', options: statusOptions, required: true },
          { key: 'adminNote', label: 'Note interne (paiement, date de livraison…)', type: 'textarea', full: true },
        ]}
      />
    </>
  );
}
