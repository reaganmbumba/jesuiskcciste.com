import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { CrudTable, Tabs } from '@/features/administration/CrudTable';
import { OFFICIAL_PARISH_LIST_ID, OfficialParishList } from '@/components/common/OfficialParishList';
import { Paragraphs } from '@/features/forum/ForumUi';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, formatTime } from '@/utils/format';
import {
  approveCondolence, deleteCondolence, listAllCondolences, memorialErrorText, memorialsRepo, shippedMemorials, slugify, unpublishCondolence, type Condolence, type Memorial,
} from '@/features/memorial/memorial';

const HONORIFICS = ['Maman', 'Papa', 'Maman Diaconesse', 'Diacre', 'Ancien', 'Pasteur', 'Évangéliste', 'Révérend Apôtre', 'Frère', 'Sœur'];
const HONORIFIC_LIST_ID = 'titres-memorial';
const day = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 10) : null);

export default function AdminMemorial() {
  const [tab, setTab] = useState<'messages' | 'fiches'>('messages');
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-semibold text-night">Mémorial</h1>
      <p className="mb-4 text-sm text-ink/60">Pages d’hommage aux fidèles rappelés à Dieu, visibles sur <Link to="/memorial" className="font-semibold text-gold-700">/memorial</Link>. Les messages de condoléances n’apparaissent qu’après votre validation.</p>
      <Tabs tabs={[{ key: 'messages', label: 'Messages à valider' }, { key: 'fiches', label: 'Fiches des défunts' }]} value={tab} onChange={setTab} />
      {tab === 'messages' ? <CondolenceModeration /> : <MemorialSheets />}
    </>
  );
}

function MemorialSheets() {
  const { notify } = useToast();
  const [version, setVersion] = useState(0);
  const rows = useAsync(() => memorialsRepo.all().catch(() => [] as Memorial[]), [version]);
  const taken = new Set((rows.data ?? []).map((r) => r.slug));
  const shipped = shippedMemorials('fr').filter((m) => !taken.has(m.slug));

  /** Copie une fiche livrée avec le site dans la base, pour pouvoir la modifier. */
  const copy = async (m: Memorial) => {
    try {
      const { id: _id, shipped: _s, createdAt: _c, ...rest } = m;
      void _id; void _s; void _c;
      await memorialsRepo.create(rest);
      notify(`La fiche de ${m.fullName} est maintenant modifiable ci-dessous.`);
      setVersion((x) => x + 1);
    } catch (e) {
      notify(memorialErrorText(e), 'error');
    }
  };

  return (
    <>
      <OfficialParishList />
      <datalist id={HONORIFIC_LIST_ID}>{HONORIFICS.map((t) => <option key={t} value={t} />)}</datalist>
      {shipped.length > 0 && (
        <Card className="mb-5"><CardBody className="space-y-3">
          <p className="text-sm text-ink/70">Fiche déjà publiée avec le site. Pour la compléter (dates, biographie, photo), copiez-la d’abord dans la liste :</p>
          {shipped.map((m) => (
            <div key={m.slug} className="flex flex-wrap items-center gap-3">
              {m.photoUrl && <img src={m.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />}
              <span className="font-medium text-night">{m.honorific} {m.fullName}</span>
              <Button size="sm" variant="outline" icon={<Copy className="h-4 w-4" />} onClick={() => void copy(m)}>Copier pour modifier</Button>
            </div>
          ))}
        </CardBody></Card>
      )}
      <CrudTable<Memorial> key={version} entity="memorials" title="Fiches du Mémorial" repo={memorialsRepo} exportName="memorial" searchFields={['fullName', 'parish', 'city']} pageSize={20}
        defaults={{ published: true }}
        columns={[
          { key: 'photoUrl', label: 'Photo', render: (m) => (m.photoUrl ? <img src={m.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : '—'), csv: (m) => m.photoUrl ?? '' },
          { key: 'fullName', label: 'Nom', render: (m) => <span>{m.honorific && <span className="block text-xs text-ink/55">{m.honorific}</span>}{m.fullName}</span> },
          { key: 'parish', label: 'Paroisse', render: (m) => [m.parish, m.city].filter(Boolean).join(', ') || '—' },
          { key: 'deathDate', label: 'Décès', render: (m) => m.deathDate ?? (m.burialDate ? `inhumé(e) ${m.burialDate}` : '—') },
          { key: 'published', label: 'Statut', render: (m) => <Badge tone={m.published ? 'green' : 'neutral'}>{m.published ? 'Publiée' : 'Masquée'}</Badge> },
          { key: 'slug', label: 'Page', render: (m) => <Link to={`/memorial/${m.slug}`} target="_blank" className="inline-flex items-center gap-1 text-gold-700"><ExternalLink className="h-4 w-4" aria-hidden />Voir</Link>, csv: (m) => `/memorial/${m.slug}` },
        ]}
        formFields={[
          { key: 'photoUrl', label: 'Photo', type: 'image' },
          { key: 'honorific', label: 'Titre', type: 'text', list: HONORIFIC_LIST_ID, hint: 'Ex. Maman Diaconesse, Papa Pasteur, Frère…' },
          { key: 'fullName', label: 'Nom complet', type: 'text', required: true, hint: 'NOM Postnom Prénom' },
          { key: 'parish', label: 'Paroisse', type: 'text', list: OFFICIAL_PARISH_LIST_ID },
          { key: 'city', label: 'Ville', type: 'text' },
          { key: 'birthDate', label: 'Date de naissance (facultatif)', type: 'date' },
          { key: 'deathDate', label: 'Date du décès (facultatif)', type: 'date' },
          { key: 'burialDate', label: 'Date de l’inhumation (facultatif)', type: 'date' },
          { key: 'epitaph', label: 'Phrase d’hommage (facultatif)', type: 'text', full: true, hint: 'Ex. Ton amour et ta bonté resteront à jamais dans nos cœurs.' },
          { key: 'biography', label: 'Biographie', type: 'textarea', full: true, hint: 'Laissez une ligne vide entre deux paragraphes.' },
          { key: 'articleUrl', label: 'Lien du communiqué sur le site (facultatif)', type: 'text', hint: 'Ex. /actualites/edito-ann-…' },
          { key: 'slug', label: 'Adresse de la page (facultatif)', type: 'text', hint: 'Laissez vide : elle est faite à partir du nom.' },
          { key: 'published', label: 'Visible sur le site', type: 'checkbox' },
        ]}
        transformBeforeSave={(v) => {
          const clean = (k: string) => (typeof v[k] === 'string' ? (v[k] as string).trim() || null : v[k] ?? null);
          return {
            ...v,
            fullName: String(v.fullName ?? '').trim(),
            slug: slugify(String(v.slug || v.fullName || '')) || `defunt-${Date.now()}`,
            honorific: clean('honorific'), parish: clean('parish'), city: clean('city'), epitaph: clean('epitaph'), biography: clean('biography'), articleUrl: clean('articleUrl'), photoUrl: clean('photoUrl'),
            birthDate: day(v.birthDate), deathDate: day(v.deathDate), burialDate: day(v.burialDate),
          };
        }}
      />
      {rows.error ? <p className="mt-3 text-sm text-red-700">{memorialErrorText(rows.error)}</p> : null}
    </>
  );
}

function CondolenceModeration() {
  const { notify } = useToast();
  const list = useAsync(() => listAllCondolences(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const names = new Map<string, string>();
  const sheets = useAsync(() => memorialsRepo.all().catch(() => [] as Memorial[]), []);
  for (const m of [...shippedMemorials('fr'), ...(sheets.data ?? [])]) names.set(m.slug, [m.honorific, m.fullName].filter(Boolean).join(' '));

  const run = async (c: Condolence, action: () => Promise<void>, done: string) => {
    setBusy(c.id);
    try { await action(); notify(done); await list.reload(); } catch (e) { notify(memorialErrorText(e), 'error'); } finally { setBusy(null); }
  };

  if (list.error) return <div className="space-y-3"><ErrorState error={new Error(memorialErrorText(list.error))} onRetry={list.reload} /></div>;
  if (list.loading) return <Skeleton className="h-40 rounded-2xl" />;
  const items = list.data ?? [];
  const pending = items.filter((c) => c.status === 'pending');
  const approved = items.filter((c) => c.status === 'approved');

  const row = (c: Condolence) => (
    <li key={c.id} className="rounded-2xl border border-night/[0.08] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm"><span className="font-semibold text-night">{c.authorName}</span>{c.authorParish && <span className="text-gold-700"> · {c.authorParish}</span>}</p>
        <p className="text-xs text-ink/50">{formatDate(c.createdAt)} · {formatTime(c.createdAt)}</p>
      </div>
      <p className="mt-1 text-xs text-ink/55">Pour : <Link to={`/memorial/${c.memorialSlug}`} target="_blank" className="font-medium text-gold-700">{names.get(c.memorialSlug) ?? c.memorialSlug}</Link></p>
      <Paragraphs text={c.message} className="mt-2 space-y-2 break-words text-[15px] text-ink/85" />
      <div className="mt-3 flex flex-wrap gap-2">
        {c.status === 'pending'
          ? <Button size="sm" icon={<Check className="h-4 w-4" />} disabled={busy === c.id} onClick={() => void run(c, () => approveCondolence(c.id), 'Message publié.')}>Publier</Button>
          : <Button size="sm" variant="outline" icon={<EyeOff className="h-4 w-4" />} disabled={busy === c.id} onClick={() => void run(c, () => unpublishCondolence(c.id), 'Message retiré du site.')}>Retirer du site</Button>}
        <Button size="sm" variant="outline" icon={<Trash2 className="h-4 w-4" />} disabled={busy === c.id} onClick={() => void run(c, () => deleteCondolence(c.id), 'Message supprimé.')}>Supprimer</Button>
      </div>
    </li>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-night">En attente ({pending.length})</h2>
        {pending.length ? <ol className="space-y-3">{pending.map(row)}</ol> : <EmptyState title="Aucun message en attente" description="Les nouveaux messages de condoléances apparaîtront ici." />}
      </section>
      {approved.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-night">Publiés ({approved.length})</h2>
          <ol className="space-y-3">{approved.map(row)}</ol>
        </section>
      )}
    </div>
  );
}
