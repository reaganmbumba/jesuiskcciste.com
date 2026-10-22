import { useMemo, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/Form';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { Spinner } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { Tabs, IconAction } from '@/features/administration/CrudTable';
import { ImageUpload } from '@/features/content/ImageUpload';
import { invalidateSiteContent, siteContentRepo, sortRows, youtubeIdFrom, type SiteCollection, type SiteContentRow } from '@/features/content/siteContent';
import { galleryThemes } from '@/content/galerie';
import { MOBILE_PROVIDERS } from '@/features/music/shop';
import { useAsync } from '@/hooks/useAsync';
import { isDemoMode } from '@/config/env';
import type { Tri } from '@/i18n';

type FieldType = 'text' | 'tri' | 'tri-textarea' | 'image' | 'images' | 'select' | 'checkbox' | 'youtube';
interface FieldDef { key: string; label: string; type: FieldType; required?: boolean; hint?: string; options?: { value: string; label: string }[]; placeholder?: string }
interface CollectionDef {
  key: SiteCollection;
  tab: string;
  intro: string;
  fields: (rows: SiteContentRow[]) => FieldDef[];
  title: (d: Record<string, unknown>) => string;
  subtitle?: (d: Record<string, unknown>, rows: SiteContentRow[]) => string;
  thumb?: (d: Record<string, unknown>) => string | null;
  /** Filtre de la liste (ex. contributions d'une opération). */
  groupBy?: { key: string; label: string; options: (rows: SiteContentRow[]) => { value: string; label: string }[] };
  searchable?: boolean;
}

const trFr = (v: unknown) => String((v as Partial<Tri> | undefined)?.fr ?? '');
const ofCollection = (rows: SiteContentRow[], c: SiteCollection) => sortRows(rows.filter((r) => r.collection === c));
const operationOptions = (rows: SiteContentRow[]) => ofCollection(rows, 'operations').map((r) => ({ value: String(r.data.key ?? ''), label: `${r.data.parish ?? ''} (${r.data.key ?? ''})` }));
const FLAGS = ['🇨🇩', '🇦🇴', '🇨🇬', '🇿🇦', '🇫🇷', '🇧🇪', '🇬🇧', '🇺🇸', '🇨🇦', '🇵🇹', '🇨🇭', '🇩🇪'];

const COLLECTIONS: CollectionDef[] = [
  {
    key: 'gallery', tab: 'Galerie photo', intro: 'Les photos de la page « Galerie photo ». Ajoutez une photo depuis votre téléphone ou votre ordinateur, écrivez sa légende et choisissez son thème.',
    fields: () => [
      { key: 'src', label: 'Photo', type: 'image', required: true },
      { key: 'caption', label: 'Légende', type: 'tri', required: true },
      { key: 'theme', label: 'Thème', type: 'select', required: true, options: Object.entries(galleryThemes).map(([value, t]) => ({ value, label: t.fr })) },
    ],
    title: (d) => trFr(d.caption), subtitle: (d) => galleryThemes[d.theme as keyof typeof galleryThemes]?.fr ?? '', thumb: (d) => String(d.src ?? '') || null,
  },
  {
    key: 'videos', tab: 'Vidéos YouTube', intro: 'Les vidéos montrées sur l’accueil et la page « Vidéos ». Collez simplement le lien de la vidéo copié depuis YouTube.',
    fields: () => [
      { key: 'youtube', label: 'Lien de la vidéo YouTube', type: 'youtube', required: true, placeholder: 'https://youtu.be/…', hint: 'Dans YouTube : bouton « Partager » puis « Copier ».' },
      { key: 'title', label: 'Titre', type: 'tri', required: true },
    ],
    title: (d) => trFr(d.title), subtitle: (d) => `youtu.be/${d.youtube ?? ''}`, thumb: (d) => (d.youtube ? `https://i.ytimg.com/vi/${d.youtube}/mqdefault.jpg` : null),
  },
  {
    key: 'operations', tab: 'Opérations solidarité', intro: 'Les opérations « 100 chaises » de la page Solidarité : texte, chiffres clés, photos et date.',
    fields: () => [
      { key: 'parish', label: 'Paroisse', type: 'text', required: true, placeholder: 'Ngidinga' },
      { key: 'key', label: 'Code court', type: 'text', required: true, placeholder: 'ngidinga', hint: 'Un mot sans espace ni accent. Il relie l’opération à sa liste de contributions.' },
      { key: 'done', label: 'Opération terminée', type: 'checkbox' },
      { key: 'title', label: 'Titre', type: 'tri', required: true },
      { key: 'text', label: 'Description', type: 'tri-textarea', required: true },
      { key: 'facts', label: 'Chiffres clés (un par ligne)', type: 'tri-textarea', hint: 'Ex. « 40 contributions », puis à la ligne « 979 $ + 316 000 FC collectés ».' },
      { key: 'date', label: 'Date ou état', type: 'tri' },
      { key: 'photos', label: 'Photos', type: 'images' },
    ],
    title: (d) => trFr(d.title), subtitle: (d) => (d.done ? 'Terminée' : 'En cours'), thumb: (d) => (Array.isArray(d.photos) && d.photos[0] ? String(d.photos[0]) : null),
  },
  {
    key: 'contributions', tab: 'Listes de contributions', intro: 'Les noms et montants affichés sous chaque opération. Jamais de numéro de téléphone.',
    fields: (rows) => [
      { key: 'operation', label: 'Opération', type: 'select', required: true, options: operationOptions(rows) },
      { key: 'flag', label: 'Drapeau (facultatif)', type: 'text', hint: `Copiez un drapeau : ${FLAGS.join(' ')}` },
      { key: 'name', label: 'Nom', type: 'text', required: true },
      { key: 'amount', label: 'Montant', type: 'text', required: true, placeholder: '20 $ ou 20 000 FC' },
    ],
    title: (d) => `${d.flag ? `${d.flag} ` : ''}${d.name ?? ''}`, subtitle: (d) => String(d.amount ?? ''),
    groupBy: { key: 'operation', label: 'Opération', options: operationOptions }, searchable: true,
  },
  {
    key: 'donation_accounts', tab: 'Numéros de don', intro: 'Les numéros Mobile Money où envoyer un don, affichés dans « Faire un don ».',
    fields: () => [
      { key: 'provider', label: 'Opérateur', type: 'select', required: true, options: MOBILE_PROVIDERS.map((p) => ({ value: p.key, label: p.label })) },
      { key: 'number', label: 'Numéro', type: 'text', required: true, placeholder: '+243 8xx xxx xxx' },
      { key: 'holder', label: 'Nom du titulaire', type: 'text', required: true },
    ],
    title: (d) => String(d.number ?? ''), subtitle: (d) => `${MOBILE_PROVIDERS.find((p) => p.key === d.provider)?.label ?? ''} · ${d.holder ?? ''}`,
  },
];

const emptyTri = (): Tri => ({ fr: '', en: '', pt: '' });
const isEmpty = (f: FieldDef, v: unknown) => (f.type === 'tri' || f.type === 'tri-textarea' ? !trFr(v).trim() : f.type === 'images' ? !(Array.isArray(v) && v.length) : f.type === 'checkbox' ? false : !String(v ?? '').trim());
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/** « Contenu du site » : galerie, vidéos et solidarité, modifiables sans toucher au code. */
export default function AdminSiteContent() {
  const [tab, setTab] = useState<SiteCollection>('gallery');
  const { data: rows = [], loading, error, reload } = useAsync(() => siteContentRepo.all(), []);
  const def = COLLECTIONS.find((c) => c.key === tab)!;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-night">Contenu du site</h1>
        <p className="text-sm text-ink/60">Ajoutez, modifiez, masquez ou supprimez ce qui s’affiche sur le site. Les changements sont visibles tout de suite par les visiteurs.</p>
      </div>
      <DemoInline />
      <Tabs tabs={COLLECTIONS.map((c) => ({ key: c.key, label: c.tab }))} value={tab} onChange={setTab} />
      {error ? (
        <Card className="p-5 text-sm text-ink/80">
          <p className="font-semibold text-red-700">Le contenu du site n’est pas encore installé dans Supabase.</p>
          <p className="mt-1">Collez le fichier <strong>contenu-site-a-coller-dans-supabase.sql</strong> dans Supabase (SQL Editor, puis Run), puis rechargez cette page.</p>
        </Card>
      ) : loading ? <Spinner /> : <CollectionEditor key={tab} def={def} rows={rows} reload={reload} />}
    </div>
  );
}

function CollectionEditor({ def, rows, reload }: { def: CollectionDef; rows: SiteContentRow[]; reload: () => Promise<void> }) {
  const { notify } = useToast();
  const groups = def.groupBy?.options(rows) ?? [];
  const [group, setGroup] = useState(groups[0]?.value ?? '');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<SiteContentRow | 'new' | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<SiteContentRow | null>(null);
  const [busy, setBusy] = useState(false);
  const fields = def.fields(rows);

  const all = ofCollection(rows, def.key);
  const inGroup = def.groupBy && group ? all.filter((r) => String(r.data[def.groupBy!.key] ?? '') === group) : all;
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? inGroup.filter((r) => `${def.title(r.data)} ${def.subtitle?.(r.data, rows) ?? ''}`.toLowerCase().includes(s)) : inGroup;
  }, [inGroup, q, def, rows]);

  const done = async (msg: string) => {
    invalidateSiteContent();
    notify(isDemoMode ? `${msg} (démonstration, non enregistré).` : msg);
    await reload();
  };
  const fail = (e: unknown) => notify(e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : 'Enregistrement impossible.', 'error');

  const open = (row: SiteContentRow | 'new') => {
    const src = row === 'new' ? {} : row.data;
    setValues(Object.fromEntries(fields.map((f) => {
      const v = src[f.key];
      if (f.type === 'tri' || f.type === 'tri-textarea') return [f.key, { ...emptyTri(), ...(typeof v === 'object' && v ? v : {}) }];
      if (f.type === 'images') return [f.key, Array.isArray(v) ? v : []];
      if (f.type === 'checkbox') return [f.key, Boolean(v)];
      if (row === 'new' && def.groupBy?.key === f.key) return [f.key, group];
      return [f.key, v ?? ''];
    })));
    // Dimensions de la photo (galerie) gardées telles quelles si la photo ne change pas.
    if (row !== 'new' && 'w' in src) setValues((v) => ({ ...v, w: src.w, h: src.h }));
    setErrors({});
    setEditing(row);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const data: Record<string, unknown> = { ...values };
    for (const f of fields) {
      if (f.required && isEmpty(f, data[f.key])) errs[f.key] = 'Champ requis.';
      if (f.type === 'youtube' && data[f.key]) {
        const id = youtubeIdFrom(String(data[f.key]));
        if (id) data[f.key] = id; else errs[f.key] = 'Lien YouTube non reconnu.';
      }
      if (f.type === 'text') data[f.key] = String(data[f.key] ?? '').trim();
    }
    if (def.key === 'operations' && data.key) {
      data.key = slug(String(data.key));
      if (all.some((r) => r !== editing && r.data.key === data.key)) errs.key = 'Ce code est déjà utilisé par une autre opération.';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editing === 'new') {
        const position = (all.length ? Math.max(...all.map((r) => r.position)) : 0) + 10;
        await siteContentRepo.create({ collection: def.key, position, data, published: true });
        await done('Élément ajouté.');
      } else if (editing) {
        await siteContentRepo.update(editing.id, { data });
        await done('Modifications enregistrées.');
      }
      setEditing(null);
    } catch (err) { fail(err); } finally { setSaving(false); }
  };

  const move = async (row: SiteContentRow, dir: -1 | 1) => {
    const i = shown.indexOf(row);
    const other = shown[i + dir];
    if (!other) return;
    setBusy(true);
    try {
      // Positions égales (anciennes lignes) : on les écarte avant d'échanger.
      const [a, b] = row.position === other.position ? [other.position + dir * 5, row.position] : [other.position, row.position];
      await Promise.all([siteContentRepo.update(row.id, { position: a }), siteContentRepo.update(other.id, { position: b })]);
      invalidateSiteContent();
      await reload();
    } catch (err) { fail(err); } finally { setBusy(false); }
  };
  const togglePublished = async (row: SiteContentRow) => {
    setBusy(true);
    try { await siteContentRepo.update(row.id, { published: !row.published }); await done(row.published ? 'Élément masqué du site.' : 'Élément de nouveau visible.'); } catch (err) { fail(err); } finally { setBusy(false); }
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try { await siteContentRepo.remove(toDelete.id); setToDelete(null); await done('Élément supprimé.'); } catch (err) { fail(err); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm text-ink/70">{def.intro}</p>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => open('new')} disabled={!!def.groupBy && !groups.length}>Ajouter</Button>
      </div>
      {(def.groupBy || def.searchable) && (
        <div className="flex flex-col gap-2 md:flex-row">
          {def.groupBy && (
            <Select className="md:w-72" aria-label={def.groupBy.label} value={group} onChange={(e) => setGroup(e.target.value)}>
              {groups.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          )}
          {def.searchable && <div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input className="pl-10" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" /></div>}
        </div>
      )}
      {def.groupBy && !groups.length && <p className="text-sm text-amber-800">Ajoutez d’abord une opération dans l’onglet « Opérations solidarité ».</p>}
      {shown.length === 0 ? <EmptyState title="Aucun élément pour le moment." /> : (
        <Card className="divide-y divide-night/[0.06]">
          {def.groupBy && <p className="px-4 py-2 text-xs text-ink/55">{shown.length} élément(s)</p>}
          {shown.map((r, i) => {
            const thumb = def.thumb?.(r.data);
            return (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${r.published ? '' : 'opacity-60'}`}>
                {def.thumb && (thumb ? <img src={thumb} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-lg object-cover ring-1 ring-night/10" /> : <span className="h-12 w-16 shrink-0 rounded-lg bg-mist" />)}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-night">{def.title(r.data) || '—'}</p>
                  <p className="flex items-center gap-2 truncate text-xs text-ink/60">{!r.published && <Badge tone="amber">Masqué</Badge>}{def.subtitle?.(r.data, rows)}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  <IconAction label="Monter" onClick={() => !busy && void move(r, -1)}><ArrowUp className={`h-4 w-4 ${i === 0 ? 'opacity-30' : ''}`} /></IconAction>
                  <IconAction label="Descendre" onClick={() => !busy && void move(r, 1)}><ArrowDown className={`h-4 w-4 ${i === shown.length - 1 ? 'opacity-30' : ''}`} /></IconAction>
                  <IconAction label={r.published ? 'Masquer du site' : 'Afficher sur le site'} tone="gold" onClick={() => !busy && void togglePublished(r)}>{r.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</IconAction>
                  <IconAction label="Modifier" onClick={() => open(r)}><Pencil className="h-4 w-4" /></IconAction>
                  <IconAction label="Supprimer" tone="red" onClick={() => setToDelete(r)}><Trash2 className="h-4 w-4" /></IconAction>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? `Ajouter — ${def.tab}` : `Modifier — ${def.tab}`} size="lg">
        <form onSubmit={save} className="space-y-4" noValidate>
          {fields.map((f) => <FieldInput key={f.key} f={f} folder={def.key} values={values} setValues={setValues} error={errors[f.key]} />)}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button><Button type="submit" loading={saving}>Enregistrer</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!toDelete} danger title="Supprimer cet élément ?" message={<>« {toDelete ? def.title(toDelete.data) : ''} » sera retiré du site. Pour le cacher sans le perdre, utilisez plutôt l’œil (masquer).</>} confirmLabel="Supprimer" loading={busy} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}

function FieldInput({ f, folder, values, setValues, error }: { f: FieldDef; folder: string; values: Record<string, unknown>; setValues: (fn: (v: Record<string, unknown>) => Record<string, unknown>) => void; error?: string }) {
  const set = (v: unknown) => setValues((all) => ({ ...all, [f.key]: v }));
  const v = values[f.key];
  if (f.type === 'checkbox') return <Checkbox label={f.label} description={f.hint} checked={Boolean(v)} onChange={(e) => set(e.target.checked)} />;
  if (f.type === 'tri' || f.type === 'tri-textarea') {
    const t = (v ?? emptyTri()) as Tri;
    const Control = f.type === 'tri' ? Input : Textarea;
    const setLang = (lang: keyof Tri, s: string) => set({ ...t, [lang]: s });
    return (
      <div className="space-y-2">
        <Field label={`${f.label} (français)`} required={f.required} hint={f.hint} error={error}>
          {(p) => <Control {...p} rows={f.type === 'tri-textarea' ? 4 : undefined} value={t.fr} onChange={(e) => setLang('fr', e.target.value)} />}
        </Field>
        <details className="rounded-xl bg-mist px-3 py-2" open={!!(t.en || t.pt)}>
          <summary className="cursor-pointer text-xs font-semibold text-ink/70">Traductions anglais et portugais (facultatif : vides, le français s’affiche)</summary>
          <div className="mt-2 space-y-2">
            <Field label="English">{(p) => <Control {...p} rows={f.type === 'tri-textarea' ? 3 : undefined} value={t.en} onChange={(e) => setLang('en', e.target.value)} />}</Field>
            <Field label="Português">{(p) => <Control {...p} rows={f.type === 'tri-textarea' ? 3 : undefined} value={t.pt} onChange={(e) => setLang('pt', e.target.value)} />}</Field>
          </div>
        </details>
      </div>
    );
  }
  if (f.type === 'images') {
    const list = (Array.isArray(v) ? v : []) as string[];
    return (
      <Field label={f.label} hint={f.hint} error={error}>
        {() => (
          <div className="space-y-3">
            {list.map((url, i) => <ImageUpload key={`${i}-${list.length}`} folder={folder} value={url} onChange={(u) => set(u ? list.map((x, j) => (j === i ? u : x)) : list.filter((_, j) => j !== i))} />)}
            <ImageUpload key={`new-${list.length}`} folder={folder} value="" onChange={(u) => u && set([...list, u])} />
          </div>
        )}
      </Field>
    );
  }
  return (
    <Field label={f.label} required={f.required} hint={f.hint} error={error}>
      {(p) => f.type === 'image' ? <ImageUpload id={p.id} folder={folder} value={String(v ?? '')} onChange={(url, size) => setValues((all) => ({ ...all, [f.key]: url, ...(size ? { w: size.w, h: size.h } : {}) }))} />
        : f.type === 'select' ? <Select {...p} value={String(v ?? '')} onChange={(e) => set(e.target.value)}><option value="">—</option>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
        : <Input {...p} placeholder={f.placeholder} value={String(v ?? '')} onChange={(e) => set(e.target.value)} />}
    </Field>
  );
}
