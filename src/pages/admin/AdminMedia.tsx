import { useState } from 'react';
import { CrudTable, Tabs } from '@/features/administration/CrudTable';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { albumsRepo, artistsRepo, mediaRepo, parishesRepo, tracksRepo } from '@/services';
import { formatDuration } from '@/utils/format';
import type { Album, Artist, MediaItem, Track } from '@/types';

const RIGHTS = [{ value: 'authorized', label: 'Diffusion autorisée' }, { value: 'pending', label: 'Autorisation en attente' }, { value: 'restricted', label: 'Diffusion restreinte' }];
const AUD = [{ value: 'public', label: 'Public' }, { value: 'members', label: 'Membres' }, { value: 'leaders', label: 'Responsables' }];

export default function AdminMedia() {
  const [tab, setTab] = useState<'tracks' | 'artists' | 'albums' | 'media'>('tracks');
  const { data } = useAsync(() => Promise.all([artistsRepo.all(), albumsRepo.all(), parishesRepo.all()]), [tab]);
  const [artists = [], albums = [], parishes = []] = data ?? [];
  return (
    <>
      <h1 className="mb-4 font-display text-2xl font-semibold text-night">KCC Music et médias</h1>
      <Tabs tabs={[{ key: 'tracks', label: 'Titres' }, { key: 'artists', label: 'Artistes et chorales' }, { key: 'albums', label: 'Albums' }, { key: 'media', label: 'Bibliothèque' }]} value={tab} onChange={setTab} />
      {tab === 'tracks' && (
        <CrudTable<Track> entity="tracks" title="Titres" repo={tracksRepo} exportName="titres" searchFields={['title', 'author', 'category']}
          filters={[{ key: 'broadcastRights', label: 'Droits', options: RIGHTS }]}
          columns={[{ key: 'title', label: 'Titre' }, { key: 'artistId', label: 'Artiste / chorale', render: (t) => artists.find((a) => a.id === t.artistId)?.name ?? '—' }, { key: 'category', label: 'Catégorie' }, { key: 'durationSeconds', label: 'Durée', render: (t) => formatDuration(t.durationSeconds) }, { key: 'broadcastRights', label: 'Droits', render: (t) => <Badge tone={t.broadcastRights === 'authorized' ? 'green' : t.broadcastRights === 'pending' ? 'amber' : 'red'}>{RIGHTS.find((r) => r.value === t.broadcastRights)?.label}</Badge> }]}
          formFields={[
            { key: 'title', label: 'Titre', type: 'text', required: true }, { key: 'author', label: 'Auteur / compositeur', type: 'text', required: true },
            { key: 'artistId', label: 'Artiste / chorale', type: 'select', required: true, options: artists.map((a) => ({ value: a.id, label: a.name })) },
            { key: 'albumId', label: 'Album', type: 'select', options: albums.map((a) => ({ value: a.id, label: a.title })) },
            { key: 'category', label: 'Catégorie', type: 'text', required: true }, { key: 'durationSeconds', label: 'Durée (secondes)', type: 'number', required: true },
            { key: 'audioUrl', label: 'Fichier audio (URL du stockage)', type: 'text' }, { key: 'videoUrl', label: 'Vidéo (URL)', type: 'url' },
            { key: 'broadcastRights', label: 'Autorisation de diffusion', type: 'select', required: true, options: RIGHTS, hint: 'La lecture publique n’est possible qu’avec une autorisation des ayants droit.' },
            { key: 'lyrics', label: 'Paroles (si autorisées)', type: 'textarea' },
          ]}
          defaults={{ broadcastRights: 'pending', durationSeconds: 0 }}
        />
      )}
      {tab === 'artists' && (
        <CrudTable<Artist> entity="artists" title="Artistes et chorales" repo={artistsRepo} searchFields={['name']}
          columns={[{ key: 'name', label: 'Nom' }, { key: 'kind', label: 'Type', render: (a) => (a.kind === 'choir' ? 'Chorale' : 'Artiste') }, { key: 'parishId', label: 'Paroisse', render: (a) => parishes.find((p) => p.id === a.parishId)?.name ?? '—' }]}
          formFields={[{ key: 'name', label: 'Nom', type: 'text', required: true }, { key: 'kind', label: 'Type', type: 'select', required: true, options: [{ value: 'choir', label: 'Chorale' }, { value: 'artist', label: 'Artiste' }] }, { key: 'parishId', label: 'Paroisse', type: 'select', options: parishes.map((p) => ({ value: p.id, label: p.name })) }, { key: 'imageUrl', label: 'Photo (URL)', type: 'url' }, { key: 'bio', label: 'Présentation', type: 'textarea' }]}
          defaults={{ kind: 'choir', bio: '' }}
        />
      )}
      {tab === 'albums' && (
        <CrudTable<Album> entity="albums" title="Albums" repo={albumsRepo} searchFields={['title']}
          columns={[{ key: 'title', label: 'Titre' }, { key: 'artistId', label: 'Artiste', render: (a) => artists.find((x) => x.id === a.artistId)?.name ?? '—' }, { key: 'year', label: 'Année' }]}
          formFields={[{ key: 'title', label: 'Titre', type: 'text', required: true }, { key: 'artistId', label: 'Artiste / chorale', type: 'select', required: true, options: artists.map((a) => ({ value: a.id, label: a.name })) }, { key: 'year', label: 'Année', type: 'number' }, { key: 'coverUrl', label: 'Pochette (URL)', type: 'url' }]}
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
    </>
  );
}
