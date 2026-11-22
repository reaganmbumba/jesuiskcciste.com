import { useEffect, useState } from 'react';
import { ChevronDown, ScrollText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/format';

type Entry = { kind: 'direct' | 'programme'; title: string; host: string | null; start: string; end: string | null };
const hm = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Kinshasa', hour: '2-digit', minute: '2-digit' });
const day = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa', weekday: 'long', day: 'numeric', month: 'long' });

/** Journal d'antenne : ce qui est passé (directs avec leur animateur, émissions programmées), jour par jour. */
export function JournalAntenne({ dark }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Entry[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!open || !supabase) return;
    void supabase.rpc('radio_journal_lire', { p_jours: 7 }).then(({ data, error }) => { if (error) setErr(error.message); else setList((data ?? []) as Entry[]); });
  }, [open]);
  const groups: [string, Entry[]][] = [];
  (list ?? []).forEach((e) => { const k = day(e.start); const g = groups.find((x) => x[0] === k); if (g) g[1].push(e); else groups.push([k, [e]]); });
  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300', sub: 'text-white/55' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-3 text-night', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]', sub: 'text-ink/55' };
  return (
    <section className={c.box}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn('flex w-full items-center justify-between gap-2', c.hd)}>
        <span className="flex items-center gap-2"><ScrollText className="h-4 w-4 text-gold" />Journal d’antenne (7 jours)</span>
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-3 max-h-96 space-y-3 overflow-y-auto">
          {err && <p className="text-sm text-red-500" role="alert">{err}</p>}
          {list && !list.length && <p className={cn('text-sm', c.sub)}>Rien d’enregistré pour l’instant : les directs s’inscrivent ici d’eux-mêmes.</p>}
          {groups.map(([k, es]) => (
            <div key={k}>
              <p className={cn('text-xs font-semibold capitalize', c.sub)}>{k}</p>
              <ul className="mt-1 space-y-1 text-sm">
                {es.map((e, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-24 shrink-0 tabular-nums">{hm(e.start)} → {e.end ? hm(e.end) : 'en cours'}</span>
                    <span className={cn('shrink-0 rounded px-1.5 text-[10px] font-bold uppercase leading-5', e.kind === 'direct' ? 'bg-red-600 text-white' : 'bg-gold/30')}>{e.kind === 'direct' ? 'Direct' : 'Programmé'}</span>
                    <span className="min-w-0 flex-1 truncate">{e.title}{e.host ? <span className={c.sub}> · {e.host}</span> : null}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
