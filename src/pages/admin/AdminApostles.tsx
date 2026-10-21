import { useEffect, useState } from 'react';
import { Camera, Check, ImageOff, X } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Textarea } from '@/components/ui/Form';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { CrudTable, Tabs } from '@/features/administration/CrudTable';
import {
  apostlesRepo, approveSubmission, listPhotoSubmissions, parseApostleList, rejectSubmission, submissionPreviewUrl, uploadApostlePhoto,
} from '@/features/apostles/apostles';
import { useAsync } from '@/hooks/useAsync';
import { formatDate } from '@/utils/format';
import type { Apostle, ApostlePhotoSubmission } from '@/types';

const STATUS = [{ value: 'living', label: 'En vie' }, { value: 'deceased', label: 'Décédé' }, { value: 'unknown', label: 'Non précisé' }];

export default function AdminApostles() {
  const [tab, setTab] = useState<'list' | 'photos' | 'import'>('list');
  const { data: subs = [], reload: reloadSubs } = useAsync(() => listPhotoSubmissions(), [tab]);
  const pending = subs.filter((s) => s.status === 'pending').length;
  return (
    <>
      <h1 className="mb-4 font-display text-2xl font-semibold text-night">Révérends Apôtres</h1>
      <Tabs tabs={[{ key: 'list', label: 'Liste et photos' }, { key: 'photos', label: `Propositions${pending ? ` (${pending})` : ''}` }, { key: 'import', label: 'Ajouter une liste' }]} value={tab} onChange={setTab} />
      {tab === 'list' && (
        <CrudTable<Apostle> entity="apostles" title="Apôtres" repo={apostlesRepo} exportName="apotres" searchFields={['fullName', 'place']} pageSize={25}
          filters={[{ key: 'status', label: 'Statut', options: STATUS }]}
          columns={[
            { key: 'photoUrl', label: 'Photo', render: (a) => (a.photoUrl ? <img src={a.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="inline-flex items-center gap-1 text-xs text-ink/50"><ImageOff className="h-4 w-4" aria-hidden />Aucune</span>), csv: (a) => a.photoUrl ?? '' },
            { key: 'sortOrder', label: 'Ordre' },
            { key: 'fullName', label: 'Nom' },
            { key: 'status', label: 'Statut', render: (a) => <Badge tone={a.status === 'living' ? 'green' : a.status === 'deceased' ? 'neutral' : 'amber'}>{STATUS.find((s) => s.value === a.status)?.label}</Badge> },
            { key: 'place', label: 'Paroisse', render: (a) => a.place ?? '—' },
            { key: 'consecrationDate', label: 'Consécration', render: (a) => a.consecrationDate ?? '—' },
          ]}
          formFields={[
            { key: 'fullName', label: 'Nom complet', type: 'text', required: true },
            { key: 'title', label: 'Titre', type: 'text', required: true, hint: 'Ex. Révérend Apôtre' },
            { key: 'status', label: 'Statut', type: 'select', required: true, options: STATUS },
            { key: 'place', label: 'Paroisse qu’il encadre', type: 'text' },
            { key: 'consecrationDate', label: 'Date de consécration', type: 'text', hint: 'La date exacte ou seulement l’année.' },
            { key: 'birthYear', label: 'Année de naissance', type: 'number' },
            { key: 'deathYear', label: 'Année du décès', type: 'number' },
            { key: 'deathDate', label: 'Date exacte du décès', type: 'text', hint: 'Ex. 27/02/2011. Remplissez aussi l’année ci-dessus.' },
            { key: 'sortOrder', label: 'Ordre d’affichage', type: 'number', hint: 'Les plus petits nombres apparaissent en premier.' },
            { key: 'photoUrl', label: 'Photo (adresse)', type: 'url', hint: 'Plus simple : utilisez le bouton appareil photo dans la liste pour déposer une image.' },
            { key: 'bio', label: 'Présentation (facultatif)', type: 'textarea', full: true },
          ]}
          defaults={{ title: 'Révérend Apôtre', status: 'unknown', sortOrder: 0 }}
          rowActions={(a, reload) => <PhotoButton apostle={a} onDone={reload} />}
        />
      )}
      {tab === 'photos' && <Submissions subs={subs} reload={reloadSubs} />}
      {tab === 'import' && <ImportList onDone={() => setTab('list')} />}
    </>
  );
}

/** Dépôt direct d'une photo par l'administration. */
function PhotoButton({ apostle, onDone }: { apostle: Apostle; onDone: () => void }) {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      await uploadApostlePhoto(apostle.id, f);
      notify(`Photo de ${apostle.fullName} enregistrée.`);
      onDone();
    } catch (e) {
      notify(e instanceof Error && e.message === 'format' ? 'Format non pris en charge (JPG, PNG ou WebP).' : e instanceof Error && e.message === 'size' ? 'Image trop lourde (20 Mo maximum).' : 'Échec de l’envoi de la photo.', 'error');
    } finally { setBusy(false); }
  };
  return (
    <label className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-ink/60 hover:bg-mist hover:text-night ${busy ? 'pointer-events-none opacity-50' : ''}`} title="Déposer une photo">
      <Camera className="h-4 w-4" aria-hidden />
      <span className="sr-only">Déposer une photo pour {apostle.fullName}</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
    </label>
  );
}

const SUB_STATUS = { pending: ['En attente', 'amber'], approved: ['Approuvée', 'green'], rejected: ['Refusée', 'red'] } as const;

function Submissions({ subs, reload }: { subs: ApostlePhotoSubmission[]; reload: () => void }) {
  const { data: apostles = [] } = useAsync(() => apostlesRepo.all(), []);
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? subs : subs.filter((s) => s.status === 'pending');
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/70">Les photos et informations envoyées par les visiteurs restent privées jusqu’à votre approbation. Approuver les enregistre sur le profil (une photo remplace l’actuelle). Pour n’en garder qu’une partie, refusez et corrigez le profil à la main.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowAll((v) => !v)}>{showAll ? 'Voir seulement les photos en attente' : 'Voir aussi l’historique'}</Button>
      </div>
      {!shown.length ? <EmptyState title="Aucune proposition en attente." description="Les photos et informations envoyées depuis les pages des apôtres apparaîtront ici." /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((s) => <SubmissionCard key={s.id} sub={s} apostle={apostles.find((a) => a.id === s.apostleId)} onDone={reload} />)}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ sub, apostle, onDone }: { sub: ApostlePhotoSubmission; apostle?: Apostle; onDone: () => void }) {
  const { notify } = useToast();
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  useEffect(() => {
    if (sub.status !== 'pending' || !sub.photoPath) return;
    submissionPreviewUrl(sub.photoPath).then(setUrl).catch(() => setUrl(''));
  }, [sub.photoPath, sub.status]);
  const act = async (kind: 'approve' | 'reject') => {
    setBusy(kind);
    try {
      if (kind === 'approve') await approveSubmission(sub); else await rejectSubmission(sub);
      notify(kind === 'approve' ? `Profil de ${apostle?.fullName ?? 'l’apôtre'} mis à jour.` : 'Proposition refusée.');
      onDone();
    } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); } finally { setBusy(null); }
  };
  return (
    <Card><CardBody className="space-y-3">
      <div className="flex items-center gap-4">
        {!sub.photoPath ? null : sub.status !== 'pending' ? <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-mist text-xs text-ink/50">Fichier retiré</span>
          : url === null ? <span className="grid h-24 w-24 shrink-0 place-items-center"><Spinner label="" /></span>
          : url ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="Photo proposée" className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-gold/30" /></a>
          : <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-red-50 text-xs text-red-700">Introuvable</span>}
        <div className="min-w-0">
          <p className="font-display font-semibold text-night">{apostle ? `${apostle.title} ${apostle.fullName}` : 'Apôtre supprimé'}</p>
          {sub.photoPath && apostle?.photoUrl && <p className="text-xs text-amber-700">A déjà une photo (elle sera remplacée)</p>}
          <Badge tone={SUB_STATUS[sub.status][1]}>{SUB_STATUS[sub.status][0]}</Badge>
        </div>
      </div>
      <dl className="space-y-1 text-sm">
        {sub.proposedPlace && <div><dt className="inline text-ink/55">Paroisse : </dt><dd className="inline font-medium">{sub.proposedPlace}</dd></div>}
        {sub.proposedConsecration && <div><dt className="inline text-ink/55">Consécration : </dt><dd className="inline font-medium">{sub.proposedConsecration}</dd></div>}
        {sub.proposedBirthYear && <div><dt className="inline text-ink/55">Naissance : </dt><dd className="inline font-medium">{sub.proposedBirthYear}</dd></div>}
        {sub.proposedDeathYear && <div><dt className="inline text-ink/55">Décès : </dt><dd className="inline font-medium">{sub.proposedDeathYear}</dd></div>}
        {sub.proposedBio && <div><dt className="inline text-ink/55">Présentation : </dt><dd className="inline">{sub.proposedBio}</dd></div>}
        <div><dt className="inline text-ink/55">Envoyée par : </dt><dd className="inline">{sub.submitterName}</dd></div>
        {sub.submitterContact && <div><dt className="inline text-ink/55">Contact : </dt><dd className="inline">{sub.submitterContact}</dd></div>}
        {sub.note && <div><dt className="inline text-ink/55">Commentaire : </dt><dd className="inline">{sub.note}</dd></div>}
        <div><dt className="inline text-ink/55">Le : </dt><dd className="inline">{formatDate(sub.createdAt, 'fr', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
      </dl>
      {sub.status === 'pending' && (
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => act('approve')} loading={busy === 'approve'} disabled={!!busy || !apostle || (!!sub.photoPath && !url)} icon={<Check className="h-4 w-4" />}>Approuver</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => act('reject')} loading={busy === 'reject'} disabled={!!busy} icon={<X className="h-4 w-4" />}>Refuser</Button>
        </div>
      )}
    </CardBody></Card>
  );
}

/** Ajout de plusieurs apôtres d'un coup, à partir d'une liste collée. */
function ImportList({ onDone }: { onDone: () => void }) {
  const { notify } = useToast();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const { data: existing = [], error } = useAsync(() => apostlesRepo.all(), []);
  const parsed = parseApostleList(text, existing.reduce((m, a) => Math.max(m, a.sortOrder), 0));
  const known = new Set(existing.map((a) => a.fullName.toLowerCase()));
  const fresh = parsed.filter((p) => !known.has(p.fullName.toLowerCase()));
  const save = async () => {
    setSaving(true);
    try {
      for (const p of fresh) await apostlesRepo.create(p);
      notify(`${fresh.length} apôtre(s) ajouté(s).`);
      onDone();
    } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); } finally { setSaving(false); }
  };
  if (error) return <ErrorState error={error} />;
  return (
    <Card><CardBody className="space-y-4">
      <p className="text-sm text-ink/70">Collez la liste, <strong>un nom par ligne</strong>. Ajoutez « (décédé) » ou « (+) » à la fin du nom d’un apôtre décédé, « (en vie) » pour un apôtre en vie ; sinon le statut reste « non précisé ». Les numéros en début de ligne et le mot « Révérend Apôtre » sont retirés automatiquement. Les noms déjà présents sont ignorés.</p>
      <Field label="Liste des apôtres">{(p) => <Textarea {...p} value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder={'1. Révérend Apôtre NOM Prénom\n2. NOM Prénom (décédé)'} />}</Field>
      {parsed.length > 0 && (
        <p className="text-sm text-ink/70">{fresh.length} nouveau(x) : {fresh.filter((p) => p.status === 'living').length} en vie, {fresh.filter((p) => p.status === 'deceased').length} décédé(s), {fresh.filter((p) => p.status === 'unknown').length} non précisé(s){parsed.length > fresh.length ? ` · ${parsed.length - fresh.length} déjà dans la liste` : ''}.</p>
      )}
      <Button type="button" onClick={save} loading={saving} disabled={!fresh.length}>Ajouter {fresh.length || ''} apôtre(s)</Button>
    </CardBody></Card>
  );
}
