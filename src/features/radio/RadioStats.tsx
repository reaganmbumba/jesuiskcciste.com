import { useEffect, useState } from 'react';
import { BarChart3, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/format';

type Stats = {
  total: number;
  days: { day: string; listeners: number; peak: number }[];
  hours: { hour: number; avg: number }[];
  places: { city: string | null; country: string | null; listeners: number }[];
  shows: { title: string; startsAt: string; listeners: number }[];
};
const country = (c: string | null) => { if (!c) return ''; try { return new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) ?? c; } catch { return c; } };
const dayLabel = (d: string) => new Date(`${d}T12:00:00+01:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

/** Studio : statistiques d'écoute (auditeurs par jour, heures d'écoute, villes, émissions). */
export function RadioStats({ dark }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(7);
  const [st, setSt] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!open || !supabase) return;
    setSt(null); setErr('');
    supabase.rpc('radio_stats', { p_days: days }).then(({ data, error }) => { if (error) setErr(error.message); else setSt(data as Stats); });
  }, [open, days]);

  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300', sub: 'text-white/55', bar: 'bg-gold', track: 'bg-white/[0.06]', btn: 'bg-white/[0.08] text-white', on: 'bg-gold text-night' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-3 text-night', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]', sub: 'text-ink/55', bar: 'bg-gold', track: 'bg-[#f3f6f9]', btn: 'border border-[#d3dae3] text-night', on: 'bg-gold text-night' };
  const maxDay = Math.max(1, ...(st?.days.map((d) => d.listeners) ?? [1]));
  const hours = Array.from({ length: 24 }, (_, h) => st?.hours.find((x) => x.hour === h)?.avg ?? 0);
  const maxH = Math.max(0.1, ...hours);
  const best = hours.map((v, h) => ({ v, h })).sort((a, b) => b.v - a.v).filter((x) => x.v > 0).slice(0, 3);

  return (
    <section className={c.box}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={cn('flex w-full items-center justify-between gap-2', c.hd)} aria-expanded={open}>
        <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-gold" />Statistiques d’écoute</span>
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-3 space-y-4">
          <div className="flex gap-1.5">
            {[7, 30, 90].map((n) => <button key={n} type="button" onClick={() => setDays(n)} className={cn('rounded-xl px-3 py-1.5 text-xs font-semibold', days === n ? c.on : c.btn)}>{n} jours</button>)}
          </div>
          {err && <p className="text-sm text-red-500" role="alert">{err}</p>}
          {!st && !err && <p className={cn('flex items-center gap-2 text-sm', c.sub)}><Loader2 className="h-4 w-4 animate-spin" />Calcul…</p>}
          {st && (
            <>
              <p className="text-sm"><b className="text-2xl tabular-nums">{st.total}</b> auditeur{st.total > 1 ? 's' : ''} différent{st.total > 1 ? 's' : ''} sur {days} jours.</p>
              {!st.total && <p className={cn('text-sm', c.sub)}>Les statistiques commencent le 21 novembre 2026 : elles se remplissent au fil des écoutes.</p>}
              {st.days.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Auditeurs par jour</p>
                  <div className="mt-2 flex h-28 items-end gap-1">
                    {st.days.slice(-30).map((d) => (
                      <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={`${dayLabel(d.day)} : ${d.listeners} auditeurs, ${d.peak} en même temps au maximum`}>
                        <span className="text-[10px] tabular-nums">{d.listeners}</span>
                        <div className={cn('w-full rounded-t', c.bar)} style={{ height: `${(d.listeners / maxDay) * 80}px` }} />
                        {st.days.length <= 10 && <span className={cn('text-[10px]', c.sub)}>{dayLabel(d.day)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {best.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Heures d’écoute (moyenne en même temps)</p>
                  <div className="mt-2 flex h-16 items-end gap-0.5">
                    {hours.map((v, h) => <div key={h} className={cn('flex-1 rounded-t', v ? c.bar : c.track)} style={{ height: `${Math.max(3, (v / maxH) * 60)}px` }} title={`${h}h : ${v} en moyenne`} />)}
                  </div>
                  <div className={cn('flex justify-between text-[10px]', c.sub)}><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>
                  <p className={cn('mt-1 text-xs', c.sub)}>Meilleures heures : {best.map((x) => `${x.h}h`).join(', ')}. C’est là qu’il faut placer les émissions importantes.</p>
                </div>
              )}
              {st.places.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">D’où l’on écoute</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {st.places.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-40 truncate">{p.city || 'Lieu inconnu'}{p.country && p.country !== 'CD' ? ` (${country(p.country)})` : ''}</span>
                        <span className={cn('h-2 flex-1 overflow-hidden rounded', c.track)}><span className={cn('block h-full', c.bar)} style={{ width: `${(p.listeners / st.places[0].listeners) * 100}%` }} /></span>
                        <span className="w-8 text-right tabular-nums">{p.listeners}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {st.shows.some((s) => s.listeners > 0) && (
                <div>
                  <p className="text-sm font-semibold">Émissions programmées</p>
                  <ul className="mt-1 max-h-60 space-y-1 overflow-y-auto text-sm">
                    {st.shows.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className={cn('w-24 shrink-0 tabular-nums', c.sub)}>{new Date(s.startsAt).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="min-w-0 flex-1 truncate">{s.title}</span>
                        <span className="w-10 text-right font-semibold tabular-nums">{s.listeners}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
