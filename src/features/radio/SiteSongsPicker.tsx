import { useEffect, useMemo, useState } from 'react';
import { Library, Plus, Search, Shuffle, X } from 'lucide-react';
import { cn } from '@/utils/format';
import { useRadio } from './RadioContext';

export type PickedSong = { name: string; url: string };

/** Régie : choisir des chants déjà dans la radio (sans charger de fichiers depuis l'appareil). */
export function SiteSongsPicker({ onAdd, have, dark }: { onAdd: (songs: PickedSong[]) => void; have: string[]; dark?: boolean }) {
  const { items, prepare } = useRadio();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  useEffect(() => { if (open) prepare(); }, [open, prepare]);
  const songs = useMemo(() => items.filter((i) => i.kind === 'song' && i.url).map((i) => ({ name: i.subtitle ? `${i.title} — ${i.subtitle}` : i.title, url: i.url })), [items]);
  const t = q.trim().toLowerCase();
  const shown = (t ? songs.filter((s) => s.name.toLowerCase().includes(t)) : songs).slice(0, 80);
  const c = dark
    ? { btn: 'rounded-lg bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold text-white', box: 'mt-3 rounded-2xl bg-white/[0.05] p-3', field: 'w-full rounded-xl border border-white/15 bg-white/[0.06] py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/35', item: 'hover:bg-white/[0.06]', sub: 'text-white/50' }
    : { btn: 'rounded border border-[#d3dae3] bg-white px-2 py-0.5 text-[11px] font-semibold text-night', box: 'mt-2 border-t border-[#e3e8ee] p-3', field: 'w-full rounded border border-[#d3dae3] py-1.5 pl-8 pr-3 text-sm', item: 'hover:bg-[#f3f6f9]', sub: 'text-ink/50' };
  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} className={c.btn} aria-expanded={open}><Library className="mr-1 inline h-3 w-3" />chants du site</button>
      {open && (
        <div className={cn(c.box, 'basis-full text-left normal-case tracking-normal')}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1"><Search className={cn('absolute left-2.5 top-2.5 h-3.5 w-3.5', c.sub)} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un chant" className={c.field} /></div>
            <button type="button" onClick={() => setOpen(false)} className={cn('p-1', c.sub)} aria-label="Fermer"><X className="h-4 w-4" /></button>
          </div>
          <button type="button" onClick={() => { onAdd([...songs.filter((s) => !have.includes(s.url))].sort(() => Math.random() - 0.5)); setOpen(false); }} className={cn('mt-2 inline-flex items-center gap-1 text-xs font-semibold', dark ? 'text-gold-300' : 'text-gold-700')}>
            <Shuffle className="h-3.5 w-3.5" />Ajouter tous les chants ({songs.length}), mélangés
          </button>
          <ul className="mt-2 max-h-52 overflow-y-auto text-sm">
            {shown.map((s) => {
              const added = have.includes(s.url);
              return (
                <li key={s.url}>
                  <button type="button" disabled={added} onClick={() => onAdd([s])} className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left disabled:opacity-40', c.item)}>
                    <Plus className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{s.name}</span>{added && <span className={cn('ml-auto text-xs', c.sub)}>déjà dans la liste</span>}
                  </button>
                </li>
              );
            })}
            {!shown.length && <li className={cn('px-2 py-1.5', c.sub)}>{songs.length ? 'Rien trouvé.' : 'Chargement des chants…'}</li>}
          </ul>
        </div>
      )}
    </>
  );
}
