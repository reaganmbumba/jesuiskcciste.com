import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Download, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/Form';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Spinner } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useAsync, useDebounced } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { writeAudit } from '@/services';
import type { Repository } from '@/services/repository';
import { downloadCsv } from '@/utils/csv';
import { isDemoMode } from '@/config/env';
import { ImageUpload } from '@/features/content/ImageUpload';
import { AudioUpload } from '@/features/content/AudioUpload';

export interface Column<T> { key: string; label: string; render?: (row: T) => ReactNode; className?: string; csv?: (row: T) => unknown }
export interface FormFieldDef { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'datetime' | 'checkbox' | 'email' | 'url' | 'image' | 'audio'; options?: { value: string; label: string }[]; required?: boolean; hint?: string; full?: boolean; /** Id d'un <datalist> de suggestions (champ texte). */ list?: string }
export interface FilterDef { key: string; label: string; options: { value: string; label: string }[] }

interface Props<T extends { id: string }> {
  entity: string;
  title: string;
  repo: Repository<T>;
  columns: Column<T>[];
  searchFields: (keyof T)[];
  formFields?: FormFieldDef[];
  defaults?: Partial<T>;
  filters?: FilterDef[];
  /** Restreint les lignes au périmètre de l'utilisateur (en production : RLS). */
  scope?: (row: T) => boolean;
  rowActions?: (row: T, reload: () => void) => ReactNode;
  canCreate?: boolean;
  canDelete?: boolean;
  exportName?: string;
  transformBeforeSave?: (values: Record<string, unknown>) => Record<string, unknown>;
  pageSize?: number;
}

const toInput = (type: FormFieldDef['type'], v: unknown) => {
  if (v === null || v === undefined) return type === 'checkbox' ? false : '';
  if (type === 'datetime' && typeof v === 'string') return v.slice(0, 16);
  if (type === 'date' && typeof v === 'string') return v.slice(0, 10);
  return v;
};
const fromInput = (type: FormFieldDef['type'], v: unknown) => {
  if (type === 'number') return v === '' ? null : Number(v);
  if ((type === 'datetime' || type === 'date') && v) return new Date(String(v)).toISOString();
  if (v === '') return null;
  return v;
};

/** Tableau d'administration générique : recherche, filtres, pagination, création, modification, suppression confirmée, export CSV. */
export function CrudTable<T extends { id: string }>({ entity, title, repo, columns, searchFields, formFields = [], defaults = {}, filters = [], scope, rowActions, canCreate = true, canDelete = true, exportName, transformBeforeSave, pageSize = 10 }: Props<T>) {
  const { profile } = useAuth();
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<T | null | 'new'>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const search = useDebounced(q);
  const { data = [], loading, error, reload } = useAsync(() => repo.all(), []);

  useEffect(() => setPage(1), [search, filterValues]);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data
      .filter((r) => !scope || scope(r))
      .filter((r) => Object.entries(filterValues).every(([k, v]) => !v || String((r as Record<string, unknown>)[k]) === v))
      .filter((r) => !s || searchFields.some((f) => String((r as Record<string, unknown>)[f as string] ?? '').toLowerCase().includes(s)));
  }, [data, search, filterValues, scope, searchFields]);
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const open = (row: T | 'new') => {
    const src = (row === 'new' ? defaults : row) as Record<string, unknown>;
    setValues(Object.fromEntries(formFields.map((f) => [f.key, toInput(f.type, src[f.key])])));
    setErrors({});
    setEditing(row);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    formFields.forEach((f) => { if (f.required && (values[f.key] === '' || values[f.key] === undefined || values[f.key] === null)) errs[f.key] = 'Champ requis.'; });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      let payload: Record<string, unknown> = Object.fromEntries(formFields.map((f) => [f.key, fromInput(f.type, values[f.key])]));
      if (transformBeforeSave) payload = transformBeforeSave(payload);
      const actor = profile ? `${profile.firstName} ${profile.lastName}` : 'inconnu';
      if (editing === 'new') {
        const created = await repo.create({ ...(defaults as object), ...payload } as Omit<T, 'id'>);
        await writeAudit(actor, `${entity}.create`, entity, created.id);
        notify(isDemoMode ? 'Élément ajouté (démonstration, non enregistré).' : 'Élément créé.');
      } else if (editing) {
        await repo.update(editing.id, payload as Partial<T>);
        await writeAudit(actor, `${entity}.update`, entity, editing.id);
        notify(isDemoMode ? 'Modification appliquée (démonstration, non enregistrée).' : 'Modifications enregistrées.');
      }
      setEditing(null);
      void reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Enregistrement impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await repo.remove(toDelete.id);
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : 'inconnu', `${entity}.delete`, entity, toDelete.id);
      notify('Élément supprimé.');
      setToDelete(null);
      void reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Suppression impossible.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = () => downloadCsv(`${exportName ?? entity}-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => Object.fromEntries(columns.map((c) => [c.label, c.csv ? c.csv(r) : (r as Record<string, unknown>)[c.key]]))));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold text-night">{title}</h2>
        <div className="flex gap-2">
          {exportName !== undefined && <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>}
          {canCreate && formFields.length > 0 && <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => open('new')}>Ajouter</Button>}
        </div>
      </div>
      <DemoInline />
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input className="pl-10" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Rechercher dans ${title}`} /></div>
        {filters.map((f) => (
          <Select key={f.key} className="md:w-52" aria-label={f.label} value={filterValues[f.key] ?? ''} onChange={(e) => setFilterValues({ ...filterValues, [f.key]: e.target.value })}>
            <option value="">{f.label} : tous</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        ))}
      </div>
      {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <Spinner /> : rows.length === 0 ? <EmptyState title="Aucun élément." /> : (
        <Card className="overflow-x-auto">
          <table className="table-kcc">
            <thead><tr>{columns.map((c) => <th key={c.key} className={c.className}>{c.label}</th>)}<th className="text-right">Actions</th></tr></thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => <td key={c.key} className={c.className}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? '—')}</td>)}
                  <td className="whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1">
                      {rowActions?.(r, reload)}
                      {formFields.length > 0 && <button onClick={() => open(r)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:bg-mist hover:text-night" aria-label="Modifier"><Pencil className="h-4 w-4" /></button>}
                      {canDelete && <button onClick={() => setToDelete(r)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:bg-red-50 hover:text-red-700" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4"><Pagination page={page} pageSize={pageSize} total={rows.length} onChange={setPage} /></div>
        </Card>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? `Ajouter — ${title}` : `Modifier — ${title}`} size="lg">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          {formFields.map((f) => (
            <div key={f.key} className={f.full || f.type === 'textarea' || f.type === 'checkbox' || f.type === 'image' || f.type === 'audio' ? 'sm:col-span-2' : ''}>
              {f.type === 'checkbox' ? (
                <Checkbox label={f.label} description={f.hint} checked={Boolean(values[f.key])} onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })} />
              ) : (
                <Field label={f.label} required={f.required} hint={f.hint} error={errors[f.key]}>
                  {(p) => f.type === 'textarea' ? <Textarea {...p} value={String(values[f.key] ?? '')} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                    : f.type === 'image' ? <ImageUpload id={p.id} folder={entity} value={String(values[f.key] ?? '')} onChange={(url) => setValues((v) => ({ ...v, [f.key]: url }))} />
                    : f.type === 'audio' ? <AudioUpload id={p.id} title={String(values.title ?? '')} value={String(values[f.key] ?? '')} onChange={(url, duration) => setValues((v) => ({ ...v, [f.key]: url, ...(duration && 'durationSeconds' in v ? { durationSeconds: duration } : {}) }))} />
                    : f.type === 'select' ? <Select {...p} value={String(values[f.key] ?? '')} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}><option value="">—</option>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
                    : <Input {...p} type={f.type === 'datetime' ? 'datetime-local' : f.type} list={f.list} value={String(values[f.key] ?? '')} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />}
                </Field>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 sm:col-span-2"><Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button><Button type="submit" loading={saving}>Enregistrer</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!toDelete} danger title="Confirmer la suppression" message="Cette opération est définitive et sera inscrite au journal d’audit." confirmLabel="Supprimer" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}

export function Tabs<K extends string>({ tabs, value, onChange }: { tabs: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-night/10" role="tablist">
      {tabs.map((t) => <button key={t.key} role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${value === t.key ? 'bg-night text-white' : 'text-ink/70 hover:text-night'}`}>{t.label}</button>)}
    </div>
  );
}

export function IconAction({ label, onClick, children, tone = 'default' }: { label: string; onClick: () => void; children: ReactNode; tone?: 'default' | 'green' | 'red' | 'gold' }) {
  const tones = { default: 'hover:bg-mist hover:text-night', green: 'hover:bg-emerald-50 hover:text-emerald-700', red: 'hover:bg-red-50 hover:text-red-700', gold: 'hover:bg-gold-50 hover:text-gold-700' };
  return <button onClick={onClick} title={label} aria-label={label} className={`grid h-8 w-8 place-items-center rounded-lg text-ink/60 ${tones[tone]}`}>{children}</button>;
}
