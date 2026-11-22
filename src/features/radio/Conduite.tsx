import { useEffect, useState } from 'react';
import { Check, ChevronDown, ListChecks, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/utils/format';

/**
 * Cahier de conduite : le déroulé de l'émission, coché au fur et à mesure.
 * Un déroulé par titre d'émission, gardé sur cet appareil ; l'heure de chaque étape est notée.
 */
type Step = { text: string; done: string | null };
const DEFAULT = [
  'Générique d’ouverture',
  '« Paix à vous » : saluer les auditeurs, dire le nom de l’émission',
  'Présenter le sujet du jour',
  'Chant',
  'Développement du sujet / invités du plateau',
  'Appels et messages vocaux des auditeurs',
  'Dédicaces et intentions de prière',
  'Annonces (prochaine émission, site, application)',
  'Remerciements et « Paix à vous »',
  'Générique de fin',
];
const key = (title: string) => `kcc.conduite.${title.trim().toLowerCase().replace(/\s+/g, ' ') || 'emission'}`;
const load = (title: string): Step[] => {
  try { const v = JSON.parse(localStorage.getItem(key(title)) || 'null'); if (Array.isArray(v) && v.length) return v as Step[]; } catch { /* rien */ }
  return DEFAULT.map((text) => ({ text, done: null }));
};
const hm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function Conduite({ title, dark }: { title: string; dark?: boolean }) {
  const [open, setOpen] = useState(true);
  const [steps, setSteps] = useState<Step[]>(() => load(title));
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState('');
  useEffect(() => { setSteps(load(title)); }, [title]);
  const save = (s: Step[]) => { setSteps(s); try { localStorage.setItem(key(title), JSON.stringify(s)); } catch { /* rien */ } };
  const done = steps.filter((s) => s.done).length;
  const next = steps.findIndex((s) => !s.done);

  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300', sub: 'text-white/55', row: 'bg-white/[0.05]', now: 'bg-gold/15 ring-2 ring-gold', field: 'rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-white placeholder:text-white/35', btn: 'bg-white/[0.08] text-white' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-3 text-night', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]', sub: 'text-ink/55', row: 'bg-[#f3f6f9]', now: 'bg-gold/15 ring-2 ring-gold', field: 'rounded-lg border border-[#d3dae3] bg-white px-3 py-2', btn: 'border border-[#d3dae3] text-night' };
  return (
    <section className={c.box}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn('flex w-full items-center justify-between gap-2', c.hd)}>
        <span className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-gold" />Conduite de l’émission · {done}/{steps.length}</span>
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-3">
          <p className={cn('text-xs', c.sub)}>Déroulé de « {title.trim() || 'Émission'} ». Touchez une étape quand elle est faite : l’heure est notée.</p>
          <ol className="mt-2 space-y-1.5">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <button type="button" onClick={() => save(steps.map((x, k) => (k === i ? { ...x, done: x.done ? null : hm() } : x)))}
                  className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm', i === next ? c.now : c.row, s.done && 'opacity-55')}>
                  <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full border', s.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-current/40')}>{s.done && <Check className="h-3.5 w-3.5" />}</span>
                  <span className={cn('flex-1', s.done && 'line-through')}>{s.text}</span>
                  {s.done && <span className={cn('shrink-0 text-xs tabular-nums', c.sub)}>{s.done}</span>}
                </button>
                {edit && <button type="button" onClick={() => save(steps.filter((_, k) => k !== i))} className="p-1 text-red-500" aria-label={`Retirer « ${s.text} »`}><Trash2 className="h-4 w-4" /></button>}
              </li>
            ))}
          </ol>
          {edit && (
            <div className="mt-2 flex gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { save([...steps, { text: draft.trim(), done: null }]); setDraft(''); } }} placeholder="Nouvelle étape" className={c.field + ' min-w-0 flex-1 text-sm'} />
              <button type="button" onClick={() => { if (draft.trim()) { save([...steps, { text: draft.trim(), done: null }]); setDraft(''); } }} className="rounded-xl bg-gold px-3 text-night" aria-label="Ajouter l’étape"><Plus className="h-4 w-4" /></button>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <button type="button" onClick={() => save(steps.map((x) => ({ ...x, done: null })))} className={cn('inline-flex items-center gap-1 rounded-xl px-3 py-1.5', c.btn)}><RotateCcw className="h-3.5 w-3.5" />Nouvelle émission (tout décocher)</button>
            <button type="button" onClick={() => setEdit((v) => !v)} className={cn('rounded-xl px-3 py-1.5', c.btn)}>{edit ? 'Terminer la modification' : 'Modifier le déroulé'}</button>
            {edit && <button type="button" onClick={() => save(DEFAULT.map((text) => ({ text, done: null })))} className={cn('rounded-xl px-3 py-1.5', c.btn)}>Déroulé par défaut</button>}
          </div>
        </div>
      )}
    </section>
  );
}
