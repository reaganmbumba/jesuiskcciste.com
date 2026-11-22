import { useCallback, useEffect, useState } from 'react';
import { Check, Heart, RotateCcw, X } from 'lucide-react';
import { cn } from '@/utils/format';
import { listDedicaces, markDedicace, type Dedicace } from './dedicaces';

const at = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Kinshasa', hour: '2-digit', minute: '2-digit' });

/** Studio : dédicaces et intentions de prière des auditeurs, à lire à l'antenne. */
export function DedicacesPanel({ dark }: { dark?: boolean }) {
  const [list, setList] = useState<Dedicace[]>([]);
  const [err, setErr] = useState('');
  const [showRead, setShowRead] = useState(false);
  const load = useCallback(() => { listDedicaces().then((l) => { setList(l); setErr(''); }).catch((e: Error) => setErr(e.message)); }, []);
  useEffect(() => { load(); const t = window.setInterval(load, 20_000); return () => window.clearInterval(t); }, [load]);

  async function mark(d: Dedicace, status: 'lu' | 'ecarte' | 'nouveau') {
    setList((l) => l.map((x) => (x.id === d.id ? { ...x, status } : x)).filter((x) => x.status !== 'ecarte'));
    try { await markDedicace(d.id, status); } catch (e) { setErr((e as Error).message); load(); }
  }

  const fresh = list.filter((d) => d.status === 'nouveau');
  const done = list.filter((d) => d.status === 'lu').reverse();
  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300', card: 'bg-white/[0.06]', sub: 'text-white/55', btn: 'bg-white/[0.08] text-white' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-3 text-night', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]', card: 'bg-[#f3f6f9]', sub: 'text-ink/55', btn: 'border border-[#d3dae3] text-night' };
  const Item = ({ d }: { d: Dedicace }) => (
    <li className={cn('rounded-2xl p-3', c.card, d.status === 'lu' && 'opacity-60')}>
      <p className="flex items-center gap-2 text-xs">
        <span className={cn('rounded-full px-2 py-0.5 font-bold uppercase', d.kind === 'priere' ? 'bg-sky-600 text-white' : 'bg-gold text-night')}>{d.kind === 'priere' ? 'Prière' : 'Dédicace'}</span>
        <span className={c.sub}>{at(d.createdAt)}</span>
      </p>
      <p className="mt-1.5 text-sm font-semibold">{d.authorName}{d.place ? ` · ${d.place}` : ''}{d.recipient ? <span className="font-normal"> → pour {d.recipient}</span> : null}</p>
      <p className="mt-1 whitespace-pre-line text-[15px] leading-snug">{d.message}</p>
      <div className="mt-2 flex gap-2">
        {d.status === 'nouveau'
          ? <button type="button" onClick={() => void mark(d, 'lu')} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"><Check className="h-3.5 w-3.5" />Lu à l’antenne</button>
          : <button type="button" onClick={() => void mark(d, 'nouveau')} className={cn('inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold', c.btn)}><RotateCcw className="h-3.5 w-3.5" />À relire</button>}
        <button type="button" onClick={() => void mark(d, 'ecarte')} className={cn('inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold', c.btn)}><X className="h-3.5 w-3.5" />Écarter</button>
      </div>
    </li>
  );
  return (
    <section className={c.box}>
      <p className={cn('flex items-center gap-2', c.hd)}><Heart className="h-4 w-4 text-gold" />Dédicaces et prières{fresh.length ? <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] text-white">{fresh.length}</span> : null}</p>
      {err && <p className="mt-2 text-xs text-red-500" role="alert">{err}</p>}
      {fresh.length ? <ol className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">{fresh.map((d) => <Item key={d.id} d={d} />)}</ol>
        : <p className={cn('mt-2 text-sm', c.sub)}>Aucun nouveau message. Les auditeurs écrivent depuis la page de la radio (« Envoyer un vocal » › dédicace ou prière).</p>}
      {done.length > 0 && (
        <div className="mt-3">
          <button type="button" onClick={() => setShowRead((v) => !v)} className={cn('text-xs font-semibold underline', c.sub)}>{showRead ? 'Masquer' : 'Voir'} les messages déjà lus ({done.length})</button>
          {showRead && <ol className="mt-2 max-h-[300px] space-y-2 overflow-y-auto">{done.map((d) => <Item key={d.id} d={d} />)}</ol>}
        </div>
      )}
    </section>
  );
}
