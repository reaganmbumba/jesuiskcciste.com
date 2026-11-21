import { useEffect, useState } from 'react';
import { CalendarClock, Loader2, Trash2 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatDuration } from '@/utils/format';
import { DRAFTS_EVENT, loadDrafts, removeDraft, scheduleProgramme, updateDraft, whenLabel, type RadioDraft } from './drafts';

/**
 * « Mes émissions enregistrées » : celles faites sans diffuser, gardées en ligne,
 * que l'animateur programme quand il veut (même des jours après l'enregistrement).
 */
export function SavedDrafts({ dark }: { dark?: boolean }) {
  const [list, setList] = useState<RadioDraft[]>(loadDrafts);
  useEffect(() => {
    const on = () => setList(loadDrafts());
    window.addEventListener(DRAFTS_EVENT, on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener(DRAFTS_EVENT, on); window.removeEventListener('storage', on); };
  }, []);
  if (!list.length) return null;

  const box = dark ? 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white' : 'rounded border border-[#d3dae3] bg-white p-4 text-night';
  const sub = dark ? 'text-white/55' : 'text-ink/60';
  return (
    <section className={box}>
      <p className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider ${dark ? 'text-gold-300' : 'text-[#2b3648]'}`}><CalendarClock className="h-4 w-4" />Mes émissions enregistrées ({list.length})</p>
      <p className={`mt-1 text-xs ${sub}`}>Faites sans diffuser. Choisissez le jour et l’heure : elles passent seules à la radio et sur YouTube, même ordinateur éteint.</p>
      <ul className="mt-3 space-y-3">
        {list.map((d) => <DraftRow key={d.id} d={d} dark={dark} />)}
      </ul>
    </section>
  );
}

function DraftRow({ d, dark }: { d: RadioDraft; dark?: boolean }) {
  const { settings, setSettings } = useSiteSettings();
  const [name, setName] = useState(d.title);
  const [when, setWhen] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sub = dark ? 'text-white/55' : 'text-ink/60';
  const field = dark ? 'rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white' : 'rounded border border-[#d3dae3] bg-white px-2 py-1.5 text-sm';
  const btn = `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-50 ${dark ? 'bg-gold text-night' : 'bg-[#2b3648] text-white'}`;

  async function plan() {
    setBusy(true); setError('');
    try {
      const start = await scheduleProgramme(settings, setSettings, { title: name, topic: d.topic, url: d.url, seconds: d.seconds, when });
      updateDraft(d.id, { title: name.trim() || d.title, programmedFor: start.toISOString() });
      setWhen('');
    } catch (e) { setError(e instanceof Error ? e.message : 'La programmation a échoué.'); } finally { setBusy(false); }
  }

  return (
    <li className={`rounded-2xl p-3 ${dark ? 'bg-white/[0.05]' : 'bg-[#f3f6f9]'}`}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{d.title}</p>
          <p className={`text-xs ${sub}`}>Enregistrée {whenLabel(d.recordedAt)} · {formatDuration(d.seconds)}</p>
          {d.programmedFor && <p className="text-xs font-semibold text-emerald-500">✓ Programmée {whenLabel(d.programmedFor)}</p>}
        </div>
        <button type="button" onClick={() => { if (window.confirm(`Retirer « ${d.title} » de cette liste ? (une émission déjà programmée reste au programme)`)) removeDraft(d.id); }}
          className={`p-1 ${sub} hover:text-red-500`} aria-label={`Retirer ${d.title}`}><Trash2 className="h-4 w-4" /></button>
      </div>
      <audio controls preload="none" src={d.url} className="mt-2 w-full" aria-label={`Écouter ${d.title}`} />
      <div className="mt-2 flex flex-wrap gap-2">
        <input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} className={`${field} min-w-0 flex-1 basis-full`} aria-label="Nom affiché aux auditeurs" />
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={field} aria-label="Date et heure de diffusion" />
        <button type="button" onClick={() => void plan()} disabled={!when || busy} className={btn}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{d.programmedFor ? 'Programmer encore' : 'Programmer'}</button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500" role="alert">{error}</p>}
    </li>
  );
}
