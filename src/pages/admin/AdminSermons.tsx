import { useState, type FormEvent, type ReactNode } from 'react';
import { Camera, FileAudio, ImageOff, Upload } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { CrudTable, Tabs } from '@/features/administration/CrudTable';
import { OFFICIAL_PARISH_LIST_ID, OfficialParishList } from '@/components/common/OfficialParishList';
import { PreacherPortrait } from '@/features/sermons/SermonUi';
import {
  AUDIO_ACCEPT, audioSermonsRepo, checkAudio, deleteSermon, replacePreacherPhoto, replaceSermonAudio, uploadPreacherPhoto, uploadSermonAudio,
} from '@/features/sermons/sermons';
import type { Repository } from '@/services/repository';
import { formatDuration } from '@/utils/format';
import type { AudioSermon } from '@/types';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
const TITLES = ['Révérend Apôtre', 'Pasteur', 'Évangéliste', 'Diacre', 'Ancien', 'Maman', 'Frère', 'Sœur'];
const TITLE_LIST_ID = 'rangs-predicateurs';

/** Supprimer une prédication supprime aussi son fichier audio. */
const adminRepo: Repository<AudioSermon> = {
  ...audioSermonsRepo,
  async remove(id) {
    const s = await audioSermonsRepo.get(id);
    if (s) await deleteSermon(s); else await audioSermonsRepo.remove(id);
  },
};

const errorText = (e: unknown) =>
  e instanceof Error && e.message === 'format' ? 'Photo : format non pris en charge (JPG, PNG ou WebP).'
  : e instanceof Error && e.message === 'size' ? 'Photo trop lourde (20 Mo maximum).'
  : e instanceof Error ? e.message : 'Échec de l’envoi.';

export default function AdminSermons() {
  const [tab, setTab] = useState<'add' | 'list'>('add');
  return (
    <>
      <h1 className="mb-4 font-display text-2xl font-semibold text-night">Prédications audio</h1>
      <Tabs tabs={[{ key: 'add', label: 'Ajouter une prédication' }, { key: 'list', label: 'Prédications publiées' }]} value={tab} onChange={setTab} />
      <OfficialParishList />
      <datalist id={TITLE_LIST_ID}>{TITLES.map((t) => <option key={t} value={t} />)}</datalist>
      {tab === 'add' && <AddSermon onDone={() => setTab('list')} />}
      {tab === 'list' && (
        <CrudTable<AudioSermon> entity="audio_sermons" title="Prédications" repo={adminRepo} exportName="predications" searchFields={['title', 'preacherName', 'parish']} pageSize={20} canCreate={false}
          columns={[
            { key: 'preacherPhotoUrl', label: 'Photo', render: (s) => (s.preacherPhotoUrl ? <PreacherPortrait sermon={s} className="h-10 w-10 ring-2" /> : <span className="inline-flex items-center gap-1 text-xs text-ink/50"><ImageOff className="h-4 w-4" aria-hidden />Aucune</span>), csv: (s) => s.preacherPhotoUrl ?? '' },
            { key: 'preacherName', label: 'Prédicateur', render: (s) => <span>{s.preacherTitle && <span className="block text-xs text-ink/55">{s.preacherTitle}</span>}{s.preacherName}</span> },
            { key: 'parish', label: 'Paroisse', render: (s) => s.parish ?? '—' },
            { key: 'title', label: 'Sujet' },
            { key: 'audioUrl', label: 'Audio', render: (s) => (s.audioUrl ? <audio controls preload="none" src={s.audioUrl} className="h-9 w-56" /> : <Badge tone="amber">Pas d’audio</Badge>), csv: (s) => s.audioUrl ?? '' },
            { key: 'durationSeconds', label: 'Durée', render: (s) => (s.durationSeconds ? formatDuration(s.durationSeconds) : '—') },
            { key: 'published', label: 'Statut', render: (s) => <Badge tone={s.published ? 'green' : 'neutral'}>{s.published ? 'Publiée' : 'Masquée'}</Badge> },
          ]}
          formFields={[
            { key: 'preacherName', label: 'Nom du prédicateur', type: 'text', required: true },
            { key: 'preacherTitle', label: 'Son titre', type: 'text', list: TITLE_LIST_ID, hint: 'Ex. Révérend Apôtre, Pasteur, Évangéliste…' },
            { key: 'parish', label: 'Sa paroisse', type: 'text', list: OFFICIAL_PARISH_LIST_ID, hint: 'Choisissez dans la liste officielle ou tapez le nom.' },
            { key: 'title', label: 'Sujet de la prédication', type: 'text', required: true },
            { key: 'bibleText', label: 'Passage biblique (facultatif)', type: 'text' },
            { key: 'preachedOn', label: 'Date de la prédication (facultatif)', type: 'date' },
            { key: 'description', label: 'Résumé (facultatif)', type: 'textarea', full: true },
            { key: 'published', label: 'Visible sur le site', type: 'checkbox' },
          ]}
          transformBeforeSave={(v) => ({ ...v, preachedOn: typeof v.preachedOn === 'string' ? v.preachedOn.slice(0, 10) : v.preachedOn })}
          rowActions={(s, reload) => (
            <>
              <FileButton title="Changer la photo" accept={IMAGE_ACCEPT} icon={<Camera className="h-4 w-4" aria-hidden />} label={`Changer la photo de ${s.preacherName}`}
                run={(f) => replacePreacherPhoto(s, f)} done="Photo enregistrée." onDone={reload} />
              <FileButton title="Remplacer l’audio" accept={AUDIO_ACCEPT} icon={<FileAudio className="h-4 w-4" aria-hidden />} label={`Remplacer l’audio de « ${s.title} »`}
                run={(f) => replaceSermonAudio(s, f)} done="Audio remplacé." onDone={reload} />
            </>
          )}
        />
      )}
    </>
  );
}

/** Petit bouton qui ouvre le choix d'un fichier puis l'envoie. */
function FileButton({ title, accept, icon, label, run, done, onDone }: { title: string; accept: string; icon: ReactNode; label: string; run: (f: File) => Promise<void>; done: string; onDone: () => void }) {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try { await run(f); notify(done); onDone(); } catch (e) { notify(errorText(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <label className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-ink/60 hover:bg-mist hover:text-night ${busy ? 'pointer-events-none animate-pulse opacity-50' : ''}`} title={title}>
      {icon}
      <span className="sr-only">{label}</span>
      <input type="file" accept={accept} className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
    </label>
  );
}

const EMPTY = { preacherName: '', preacherTitle: '', parish: '', title: '', bibleText: '', preachedOn: '', description: '' };

/** Formulaire d'ajout : photo, prédicateur, titre, paroisse, sujet et fichier audio. */
function AddSermon({ onDone }: { onDone: () => void }) {
  const { notify } = useToast();
  const [v, setV] = useState(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [published, setPublished] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<string | null>(null);
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  const pickPhoto = (f: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };
  const pickAudio = (f: File | null) => {
    setAudio(f);
    setErrors((x) => ({ ...x, audio: f ? checkAudio(f) ?? '' : '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (v.preacherName.trim().length < 2) errs.preacherName = 'Indiquez le nom du prédicateur.';
    if (v.title.trim().length < 2) errs.title = 'Indiquez le sujet de la prédication.';
    if (!audio) errs.audio = 'Choisissez le fichier audio de la prédication.';
    else if (checkAudio(audio)) errs.audio = checkAudio(audio)!;
    setErrors(errs);
    if (Object.values(errs).some(Boolean) || !audio) return;
    try {
      setStep('Envoi de la photo…');
      const preacherPhotoUrl = photo ? await uploadPreacherPhoto(photo, v.preacherName) : null;
      setStep(`Envoi de l’audio (${Math.max(1, Math.round(audio.size / 1048576))} Mo), patientez…`);
      const file = await uploadSermonAudio(audio, v.title);
      setStep('Enregistrement…');
      const clean = (s: string) => s.trim() || null;
      await audioSermonsRepo.create({
        title: v.title.trim(), preacherName: v.preacherName.trim(), preacherTitle: clean(v.preacherTitle), parish: clean(v.parish),
        bibleText: clean(v.bibleText), preachedOn: clean(v.preachedOn), description: clean(v.description), preacherPhotoUrl, published, ...file,
      });
      notify(`« ${v.title.trim()} » est ${published ? 'en ligne' : 'enregistrée (masquée)'}.`);
      setV(EMPTY); pickPhoto(null); setAudio(null);
      onDone();
    } catch (err) {
      notify(errorText(err), 'error');
    } finally { setStep(null); }
  };

  return (
    <Card><CardBody>
      <form onSubmit={submit} className="grid gap-5 md:grid-cols-2" noValidate>
        <div className="flex items-center gap-4 md:col-span-2">
          {preview ? <img src={preview} alt="Aperçu" className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-gold/40" />
            : <PreacherPortrait sermon={{ preacherName: v.preacherName || '?', preacherPhotoUrl: null }} className="h-24 w-24 shrink-0 text-2xl" />}
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Photo du prédicateur <span className="font-normal text-ink/55">(facultatif)</span></p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-night/15 px-4 py-2 text-sm font-medium hover:border-gold">
              <Camera className="h-4 w-4" aria-hidden />{photo ? 'Changer la photo' : 'Choisir une photo'}
              <input type="file" accept={IMAGE_ACCEPT} className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
        <Field label="Nom du prédicateur" required error={errors.preacherName}>{(p) => <Input {...p} value={v.preacherName} onChange={set('preacherName')} placeholder="NOM Prénom" />}</Field>
        <Field label="Son titre" hint="Ex. Révérend Apôtre, Pasteur, Évangéliste…">{(p) => <Input {...p} list={TITLE_LIST_ID} value={v.preacherTitle} onChange={set('preacherTitle')} />}</Field>
        <Field label="Sa paroisse" hint="Choisissez dans la liste officielle ou tapez le nom." className="md:col-span-2">{(p) => <Input {...p} list={OFFICIAL_PARISH_LIST_ID} value={v.parish} onChange={set('parish')} />}</Field>
        <Field label="Sujet de la prédication" required error={errors.title} className="md:col-span-2">{(p) => <Input {...p} value={v.title} onChange={set('title')} placeholder="Ex. La notion d’Alliance" />}</Field>
        <Field label="Passage biblique (facultatif)">{(p) => <Input {...p} value={v.bibleText} onChange={set('bibleText')} placeholder="Ex. Exode 24 : 1-11" />}</Field>
        <Field label="Date de la prédication (facultatif)">{(p) => <Input {...p} type="date" value={v.preachedOn} onChange={set('preachedOn')} />}</Field>
        <Field label="Résumé (facultatif)" className="md:col-span-2">{(p) => <Textarea {...p} rows={3} value={v.description} onChange={set('description')} />}</Field>
        <Field label="Fichier audio de la prédication" required error={errors.audio || undefined} hint="MP3, M4A, OGG, OPUS, WAV ou audio WhatsApp (.mpeg). 50 Mo maximum." className="md:col-span-2">
          {(p) => (
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-night/20 bg-mist/50 px-4 py-4 hover:border-gold">
              <Upload className="h-5 w-5 shrink-0 text-gold-700" aria-hidden />
              <span className="min-w-0 text-sm">{audio ? <><span className="block truncate font-medium text-night">{audio.name}</span><span className="text-ink/55">{(audio.size / 1048576).toFixed(1)} Mo</span></> : 'Choisir le fichier audio'}</span>
              <input {...p} type="file" accept={AUDIO_ACCEPT} className="sr-only" onChange={(e) => pickAudio(e.target.files?.[0] ?? null)} />
            </label>
          )}
        </Field>
        <div className="md:col-span-2"><Checkbox label="Publier tout de suite sur le site" description="Décochez pour l’enregistrer sans la montrer aux visiteurs." checked={published} onChange={(e) => setPublished(e.target.checked)} /></div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Button type="submit" loading={!!step} disabled={!!step} icon={<Upload className="h-4 w-4" />}>Ajouter la prédication</Button>
          {step && <p className="text-sm text-ink/65" role="status">{step}</p>}
        </div>
      </form>
    </CardBody></Card>
  );
}
