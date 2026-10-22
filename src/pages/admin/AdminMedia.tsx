import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { listAllOrders, MOBILE_PROVIDERS, priceLabel } from '@/features/music/shop';
import { CrudTable, Tabs } from '@/features/administration/CrudTable';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { albumsRepo, artistsRepo, mediaRepo, parishesRepo, tracksRepo } from '@/services';
import { formatDuration } from '@/utils/format';
import type { Album, Artist, MediaItem, Track } from '@/types';
import { formatDate } from '@/utils/format';

const RIGHTS = [{ value: 'authorized', label: 'Diffusion autorisée' }, { value: 'pending', label: 'Autorisation en attente' }, { value: 'restricted', label: 'Diffusion restreinte' }];
const CURRENCIES = [{ value: 'USD', label: 'Dollar (USD)' }, { value: 'CDF', label: 'Franc congolais (CDF)' }];
const PRICE_HINT = 'Laisser vide = pas en vente. Payé par M-Pesa, Orange Money ou Airtel Money.';
const AUD = [{ value: 'public', label: 'Public' }, { value: 'members', label: 'Membres' }, { value: 'leaders', label: 'Responsables' }];

export default function AdminMedia() {
  const [tab, setTab] = useState<'tracks' | 'artists' | 'albums' | 'media' | 'sales'>('tracks');
  const { data } = useAsync(() => Promise.all([artistsRepo.all(), albumsRepo.all(), parishesRepo.all()]), [tab]);
  const [artists = [], albums = [], parishes = []] = data ?? [];
  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-night">Musique : chants et albums</h1>
      <p className="mb-4 mt-1 max-w-3xl text-sm text-ink/65">Pour ajouter un chant : onglet « Chants », bouton « Ajouter », puis choisissez le fichier audio. Pour un album : créez-le dans « Albums », puis choisissez cet album dans la fiche de chaque chant. Le crayon modifie, la corbeille supprime.</p>
      <Tabs tabs={[{ key: 'tracks', label: 'Chants' }, { key: 'artists', label: 'Artistes et chorales' }, { key: 'albums', label: 'Albums' }, { key: 'media', label: 'Bibliothèque' }, { key: 'sales', label: 'Ventes' }]} value={tab} onChange={setTab} />
      {tab === 'tracks' && (
        <CrudTable<Track> entity="tracks" title="Chants" repo={tracksRepo} exportName="chants" searchFields={['title', 'author', 'category']}
          filters={[{ key: 'broadcastRights', label: 'Droits', options: RIGHTS }]}
          columns={[{ key: 'title', label: 'Titre' }, { key: 'artistId', label: 'Artiste / chorale', render: (t) => artists.find((a) => a.id === t.artistId)?.name ?? '—' }, { key: 'category', label: 'Catégorie' }, { key: 'durationSeconds', label: 'Durée', render: (t) => formatDuration(t.durationSeconds) }, { key: 'priceAmount', label: 'Prix', render: (t) => (t.priceAmount && t.priceCurrency ? priceLabel(t.priceAmount, t.priceCurrency) : '—') }, { key: 'broadcastRights', label: 'Droits', render: (t) => <Badge tone={t.broadcastRights === 'authorized' ? 'green' : t.broadcastRights === 'pending' ? 'amber' : 'red'}>{RIGHTS.find((r) => r.value === t.broadcastRights)?.label}</Badge> }]}
          formFields={[
            { key: 'title', label: 'Titre du chant', type: 'text', required: true }, { key: 'author', label: 'Auteur / compositeur', type: 'text', required: true },
            { key: 'audioUrl', label: 'Fichier audio', type: 'audio', required: true, hint: '50 Mo maximum. La durée se remplit toute seule.' },
            { key: 'artistId', label: 'Artiste / chorale', type: 'select', required: true, options: artists.map((a) => ({ value: a.id, label: a.name })) },
            { key: 'albumId', label: 'Album', type: 'select', options: albums.map((a) => ({ value: a.id, label: a.title })) },
            { key: 'category', label: 'Catégorie', type: 'text', required: true, hint: 'Ex. Chants, Cantiques, Louange' }, { key: 'durationSeconds', label: 'Durée (secondes)', type: 'number' },
            { key: 'videoUrl', label: 'Vidéo (lien, facultatif)', type: 'url' },
            { key: 'broadcastRights', label: 'Autorisation de diffusion', type: 'select', required: true, options: RIGHTS, hint: 'Seuls les chants « Diffusion autorisée » peuvent être écoutés sur le site.' },
            { key: 'priceAmount', label: 'Prix de vente', type: 'number', hint: PRICE_HINT }, { key: 'priceCurrency', label: 'Devise', type: 'select', options: CURRENCIES },
            { key: 'saleFilePath', label: 'Fichier vendu (chemin dans le stockage privé « music »)', type: 'text', hint: 'Facultatif : sinon l’acheteur reçoit le fichier d’écoute.' },
            { key: 'lyrics', label: 'Paroles (si autorisées)', type: 'textarea' },
          ]}
          defaults={{ broadcastRights: 'authorized', durationSeconds: 0, category: 'Chants' }}
          transformBeforeSave={(v) => ({ ...v, durationSeconds: v.durationSeconds ?? 0 })}
        />
      )}
      {tab === 'artists' && (
        <CrudTable<Artist> entity="artists" title="Artistes et chorales" repo={artistsRepo} searchFields={['name']}
          columns={[{ key: 'name', label: 'Nom' }, { key: 'kind', label: 'Type', render: (a) => (a.kind === 'choir' ? 'Chorale' : 'Artiste') }, { key: 'parishId', label: 'Paroisse', render: (a) => parishes.find((p) => p.id === a.parishId)?.name ?? '—' }]}
          formFields={[{ key: 'name', label: 'Nom', type: 'text', required: true }, { key: 'kind', label: 'Type', type: 'select', required: true, options: [{ value: 'choir', label: 'Chorale' }, { value: 'artist', label: 'Artiste' }] }, { key: 'parishId', label: 'Paroisse', type: 'select', options: parishes.map((p) => ({ value: p.id, label: p.name })) }, { key: 'imageUrl', label: 'Photo', type: 'image' }, { key: 'bio', label: 'Présentation', type: 'textarea' }]}
          defaults={{ kind: 'choir', bio: '' }}
        />
      )}
      {tab === 'albums' && (
        <CrudTable<Album> entity="albums" title="Albums" repo={albumsRepo} searchFields={['title']}
          columns={[{ key: 'title', label: 'Titre' }, { key: 'artistId', label: 'Artiste', render: (a) => artists.find((x) => x.id === a.artistId)?.name ?? '—' }, { key: 'year', label: 'Année' }, { key: 'priceAmount', label: 'Prix', render: (a) => (a.priceAmount && a.priceCurrency ? priceLabel(a.priceAmount, a.priceCurrency) : '—') }]}
          formFields={[{ key: 'title', label: 'Titre', type: 'text', required: true }, { key: 'artistId', label: 'Artiste / chorale', type: 'select', required: true, options: artists.map((a) => ({ value: a.id, label: a.name })) }, { key: 'year', label: 'Année', type: 'number' }, { key: 'coverUrl', label: 'Pochette', type: 'image' }, { key: 'priceAmount', label: 'Prix de l’album complet', type: 'number', hint: PRICE_HINT }, { key: 'priceCurrency', label: 'Devise', type: 'select', options: CURRENCIES }]}
        />
      )}
      {tab === 'media' && (
        <CrudTable<MediaItem> entity="media_items" title="Bibliothèque numérique" repo={mediaRepo} searchFields={['title', 'category']}
          filters={[{ key: 'audience', label: 'Accès', options: AUD }]}
          columns={[{ key: 'title', label: 'Titre' }, { key: 'kind', label: 'Type' }, { key: 'category', label: 'Catégorie' }, { key: 'audience', label: 'Accès', render: (m) => AUD.find((a) => a.value === m.audience)?.label }]}
          formFields={[{ key: 'title', label: 'Titre', type: 'text', required: true }, { key: 'kind', label: 'Type', type: 'select', required: true, options: ['pdf', 'video', 'audio', 'image', 'document'].map((v) => ({ value: v, label: v.toUpperCase() })) }, { key: 'category', label: 'Catégorie', type: 'text', required: true }, { key: 'audience', label: 'Accès', type: 'select', required: true, options: AUD, hint: 'Les documents non publics sont stockés dans un espace privé (URL signées).' }, { key: 'url', label: 'Chemin du fichier', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }]}
          defaults={{ audience: 'members', kind: 'pdf', description: '', publishedAt: new Date().toISOString() }}
        />
      )}
      {tab === 'sales' && <Sales />}
    </>
  );
}

const SALE_STATUS = { pending: ['En attente', 'amber'], paid: ['Payé', 'green'], failed: ['Échoué', 'red'], cancelled: ['Annulé', 'neutral'] } as const;

/** Ventes de la boutique (lecture seule : seul l'opérateur confirme un paiement). */
function Sales() {
  const { data = [], loading } = useAsync(() => listAllOrders(), []);
  const totals = data.filter((o) => o.status === 'paid').reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.currency]: (acc[o.currency] ?? 0) + Number(o.amount) }), {});
  if (loading) return null;
  if (!data.length) return <EmptyState title="Aucune vente pour le moment." description="Fixez un prix sur un titre ou un album pour afficher le bouton « Acheter »." />;
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/70">Total encaissé : <strong>{Object.entries(totals).map(([c, v]) => priceLabel(v, c)).join(' + ') || '—'}</strong> · {data.filter((o) => o.status === 'paid').length} vente(s) payée(s)</p>
      <Card className="overflow-x-auto"><table className="table-kcc"><thead><tr><th>Date</th><th>Article</th><th>Opérateur</th><th>Téléphone</th><th className="text-right">Montant</th><th>Statut</th><th>Réf. opérateur</th></tr></thead>
        <tbody>{data.map((o) => <tr key={o.id}><td>{formatDate(o.createdAt, 'fr', { dateStyle: 'short', timeStyle: 'short' })}</td><td>{o.itemTitle}</td><td>{MOBILE_PROVIDERS.find((p) => p.key === o.provider)?.label}</td><td className="tabular-nums">+{o.phone}</td><td className="text-right tabular-nums">{priceLabel(o.amount, o.currency)}</td><td><Badge tone={SALE_STATUS[o.status][1]}>{SALE_STATUS[o.status][0]}</Badge></td><td className="text-xs">{o.providerReference ?? o.gatewayOrderNumber ?? '—'}</td></tr>)}</tbody>
      </table></Card>
    </div>
  );
}
