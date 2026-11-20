import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Download, Loader2, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { uploadSiteAudio } from '@/features/content/siteContent';
import { useRadio } from './RadioContext';
import { radioSettingsOf, type RadioProgramme } from './radio';
import { drawProgrammePoster } from './programmePoster';

/** Kinshasa : UTC+1 toute l'année. */
const TZ = 'Africa/Kinshasa';
const dayOf = (iso: string) => new Date(iso).toLocaleDateString('fr-CA', { timeZone: TZ });
export const hhmm = (ms: number) => new Date(ms).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const todayKin = () => new Date().toLocaleDateString('fr-CA', { timeZone: TZ });
const QUICK = ['06:00', '09:00', '12:00', '12:30', '15:00', '18:30', '20:00', '21:00'];

type Source = { url: string; title: string; subtitle: string; seconds: number | null };

/** Durée d'un fichier en ligne (lecture des seules informations du début). */
function probe(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const a = new Audio();
    const done = (v: number | null) => { a.src = ''; resolve(v); };
    const t = window.setTimeout(() => done(null), 15000);
    a.preload = 'metadata';
    a.onloadedmetadata = () => { window.clearTimeout(t); done(Number.isFinite(a.duration) && a.duration > 0 ? Math.round(a.duration) : null); };
    a.onerror = () => { window.clearTimeout(t); done(null); };
    a.src = url;
  });
}

/**
 * Grille des programmes du Studio : la journée heure par heure, programmation en
 * quelques touches (heure, fichier), suppression, et affiche JPG du programme du jour.
 */
export function RadioGrid({ dark }: { dark?: boolean }) {
  const { settings, setSettings } = useSiteSettings();
  const { items, prepare } = useRadio();
  const [day, setDay] = useState(todayKin);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('20:00');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Source | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { prepare(); }, [prepare]);

  const all = radioSettingsOf(settings).programmes;
  const list = all.filter((p) => dayOf(p.startsAt) === day).sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  // Bibliothèque : émissions déjà diffusées, prédications et chants de la radio
  const library = useMemo<Source[]>(() => {
    const seen = new Set<string>();
    const out: Source[] = [];
    const add = (s: Source) => { if (s.url && /^https:\/\//.test(s.url) && !seen.has(s.url)) { seen.add(s.url); out.push(s); } };
    [...all].reverse().forEach((p) => add({ url: p.url, title: p.title.replace(/ \((rediffusion[^)]*)\)$/, ''), subtitle: 'Émission déjà diffusée', seconds: p.durationSeconds }));
    items.filter((i) => i.kind === 'sermon').forEach((i) => add({ url: i.url, title: i.title, subtitle: `Prédication · ${i.subtitle}`, seconds: i.durationSeconds }));
    items.filter((i) => i.kind === 'song').forEach((i) => add({ url: i.url, title: i.title, subtitle: `Chant · ${i.subtitle}`, seconds: i.durationSeconds }));
    return out;
  }, [all, items]);
  const q = query.trim().toLowerCase();
  const shown = (q ? library.filter((s) => `${s.title} ${s.subtitle}`.toLowerCase().includes(q)) : library).slice(0, 40);

  const startMs = (t: string) => new Date(`${day}T${t}:00+01:00`).getTime();
  const endMs = (p: RadioProgramme) => new Date(p.startsAt).getTime() + p.durationSeconds * 1000;

  function openAt(t: string) {
    setTime(t); setOpen(true); setMsg(''); setPicked(null); setFile(null); setTitle(''); setTopic('');
  }

  async function save() {
    setMsg('');
    if (!picked && !file) return setMsg('Choisissez un fichier dans la bibliothèque ou un nouveau fichier.');
    const start = startMs(time);
    if (Number.isNaN(start)) return setMsg('Heure non valide.');
    if (start < Date.now() - 60_000) return setMsg('Cette heure est déjà passée : choisissez une heure à venir.');
    setBusy(true);
    try {
      let url = picked?.url ?? '';
      let seconds = picked?.seconds ?? null;
      if (file) {
        const up = await uploadSiteAudio(file, title.trim() || file.name.replace(/\.[^.]+$/, ''));
        url = up.url; seconds = up.duration;
      }
      if (!seconds) seconds = await probe(url);
      if (!seconds) throw new Error('La durée du fichier est illisible.');
      const p: RadioProgramme = {
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        title: (title.trim() || picked?.title || 'Émission').slice(0, 120),
        topic: topic.trim().slice(0, 3000), url, startsAt: new Date(start).toISOString(), durationSeconds: Math.round(seconds),
      };
      const clash = list.find((x) => new Date(x.startsAt).getTime() < start + p.durationSeconds * 1000 && start < endMs(x));
      if (clash) throw new Error(`Ça chevauche « ${clash.title} » (${hhmm(new Date(clash.startsAt).getTime())} → ${hhmm(endMs(clash))}). Choisissez une autre heure.`);
      const { error } = await supabase!.rpc('radio_programme_add', { p });
      if (error) throw new Error(error.message);
      const r = radioSettingsOf(settings);
      const next = { ...settings, radio: { ...r, programmes: [...r.programmes, p] } };
      setSettings(next);
      setOpen(false);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'La programmation a échoué.'); } finally { setBusy(false); }
  }

  async function remove(p: RadioProgramme) {
    if (!window.confirm(`Retirer « ${p.title} » (${hhmm(new Date(p.startsAt).getTime())}) de la grille ?`)) return;
    const { error } = await supabase!.rpc('radio_programme_remove', { p_id: p.id });
    if (error) { setMsg(error.message); return; }
    const r = radioSettingsOf(settings);
    const next = { ...settings, radio: { ...r, programmes: r.programmes.filter((x) => x.id !== p.id) } };
    setSettings(next);
  }

  async function poster() {
    const blob = await drawProgrammePoster(day, list);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `programme-radio-kcc-${day}.jpg`;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  // Lignes de la journée : émissions et, entre elles, la radio automatique
  const rows: { from: number; to: number; p?: RadioProgramme }[] = [];
  let cursor = startMs('00:00');
  const dayEnd = cursor + 86_400_000;
  list.forEach((p) => {
    const s = new Date(p.startsAt).getTime();
    if (s > cursor) rows.push({ from: cursor, to: s });
    rows.push({ from: s, to: endMs(p), p });
    cursor = Math.max(cursor, endMs(p));
  });
  if (cursor < dayEnd) rows.push({ from: cursor, to: dayEnd });

  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', sub: 'text-white/55', row: 'bg-white/[0.05]', show: 'border-l-4 border-gold bg-gold/[0.12]', field: 'rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-white placeholder:text-white/35', btn: 'bg-white/[0.08] text-white', pick: 'bg-gold/25 ring-1 ring-gold', item: 'hover:bg-white/[0.06]', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-4 text-night', sub: 'text-ink/55', row: 'bg-[#f3f6f9]', show: 'border-l-4 border-gold bg-gold/10', field: 'rounded-lg border border-[#d3dae3] bg-white px-3 py-2', btn: 'border border-[#d3dae3] text-night', pick: 'bg-gold/20 ring-1 ring-gold', item: 'hover:bg-[#f3f6f9]', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]' };
  const small = 'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-50';

  return (
    <section className={c.box}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`flex items-center gap-2 ${c.hd}`}><CalendarClock className="h-4 w-4" />Grille des programmes</p>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value || todayKin())} className={c.field + ' py-1.5 text-sm'} aria-label="Jour" />
      </div>
      <p className={`mt-1 text-xs ${c.sub}`}>Heure de Kinshasa. Entre les émissions, la radio joue seule ses chants, ses jingles et l’heure.</p>

      <ol className="mt-3 space-y-1.5">
        {rows.map((r, i) => r.p ? (
          <li key={r.p.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${c.show}`}>
            <span className="w-24 shrink-0 text-sm font-bold tabular-nums">{hhmm(r.from)} → {hhmm(r.to)}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.p.title}</span>
            {r.to > Date.now() && <button type="button" onClick={() => void remove(r.p!)} className="p-1 text-red-500" aria-label={`Retirer ${r.p.title}`}><Trash2 className="h-4 w-4" /></button>}
          </li>
        ) : (
          <li key={`g${i}`} className={`flex items-center gap-3 rounded-xl px-3 py-1.5 text-xs ${c.row} ${c.sub}`}>
            <span className="w-24 shrink-0 tabular-nums">{hhmm(r.from)} → {r.to >= dayEnd ? '24:00' : hhmm(r.to)}</span>
            <span className="flex-1">Chants de la radio</span>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK.filter((t) => startMs(t) > Date.now()).map((t) => (
          <button key={t} type="button" onClick={() => openAt(t)} className={small + ' ' + c.btn}><Plus className="h-3.5 w-3.5" />{t}</button>
        ))}
        <button type="button" onClick={() => openAt(time)} className={small + ' bg-gold text-night'}><Plus className="h-4 w-4" />Autre heure</button>
        <button type="button" onClick={() => void poster()} disabled={!list.length} className={small + ' ' + c.btn}><Download className="h-4 w-4" />Affiche du programme (JPG)</button>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t border-current/10 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold">Heure de début</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={c.field} />
          </div>
          <div>
            <p className="text-sm font-semibold">Fichier à diffuser</p>
            <div className="relative mt-1"><Search className={`absolute left-3 top-3 h-4 w-4 ${c.sub}`} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher : prédication, émission, chant…" className={c.field + ' w-full pl-9'} /></div>
            <ul className="mt-2 max-h-56 overflow-y-auto">
              {shown.map((s) => (
                <li key={s.url}>
                  <button type="button" onClick={() => { setPicked(s); setFile(null); if (!title) setTitle(s.title); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${picked?.url === s.url ? c.pick : c.item}`}>
                    <span className="block truncate font-semibold">{s.title}</span>
                    <span className={`block truncate text-xs ${c.sub}`}>{s.subtitle}{s.seconds ? ` · ${Math.round(s.seconds / 60)} min` : ''}</span>
                  </button>
                </li>
              ))}
              {!shown.length && <li className={`px-3 py-2 text-sm ${c.sub}`}>Rien trouvé.</li>}
            </ul>
            <label className={`mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold ${file ? 'text-emerald-500' : ''}`}>
              <Upload className="h-4 w-4" />{file ? `Nouveau fichier : ${file.name}` : 'Ou un nouveau fichier du téléphone / de l’ordinateur'}
              <input type="file" accept="audio/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f); if (f) { setPicked(null); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')); } e.currentTarget.value = ''; }} />
            </label>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Titre affiché aux auditeurs" className={c.field + ' w-full'} />
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} maxLength={3000} placeholder="Sujet (facultatif), lu par les auditeurs" className={c.field + ' w-full'} />
          {msg && <p className="text-sm text-red-500" role="alert">{msg}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => void save()} disabled={busy} className={small + ' bg-gold text-night'}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}Programmer à {time}</button>
            <button type="button" onClick={() => setOpen(false)} className={small + ' ' + c.btn}>Annuler</button>
          </div>
        </div>
      )}
      {!open && msg && <p className="mt-2 text-sm text-red-500" role="alert">{msg}</p>}
    </section>
  );
}
