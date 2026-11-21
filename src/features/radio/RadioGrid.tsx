import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CalendarRange, Download, Loader2, Plus, RefreshCw, Search, Trash2, Upload, Wand2, X } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { uploadSiteAudio } from '@/features/content/siteContent';
import { useRadio } from './RadioContext';
import { radioSettingsOf, type RadioProgramme } from './radio';
import { drawProgrammePoster } from './programmePoster';
import { WeekTemplate } from './WeekTemplate';

/** Kinshasa : UTC+1 toute l'année. */
const TZ = 'Africa/Kinshasa';
const dayOf = (iso: string) => new Date(iso).toLocaleDateString('fr-CA', { timeZone: TZ });
export const hhmm = (ms: number) => new Date(ms).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const todayKin = () => new Date().toLocaleDateString('fr-CA', { timeZone: TZ });
const QUICK = ['06:00', '09:00', '12:00', '12:30', '15:00', '18:30', '20:00', '21:00'];

type Kind = 'emission' | 'sermon' | 'song';
type Source = { url: string; title: string; subtitle: string; seconds: number | null; kind: Kind; /** ajout dans le système (ms), 0 si inconnu */ added: number };

const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;
/** Programme automatique : entre deux émissions, environ 40 minutes de chants (joués seuls par la radio). */
const SONG_BREAK = 40 * MIN;
/** Plusieurs propositions différentes, chacune avec son rythme. */
type Style = { name: string; hint: string; pause: number; kind: Partial<Record<Kind, number>> };
const STYLES: Style[] = [
  { name: 'Équilibrée', hint: 'Prédications et émissions en alternance, 40 min de chants entre deux.', pause: SONG_BREAK, kind: {} },
  { name: 'Parole', hint: 'Plus de prédications, pauses de chants plus courtes (25 min).', pause: 25 * MIN, kind: { sermon: 3 } },
  { name: 'Émissions', hint: 'Plus d’émissions et de rediffusions, 35 min de chants.', pause: 35 * MIN, kind: { emission: 3 } },
  { name: 'Louange', hint: 'Plus de chants : une émission environ toutes les 1 h 30.', pause: 75 * MIN, kind: {} },
];
/** Poids d'un audio selon son ancienneté : les ajouts récents reviennent plus souvent. */
const freshness = (added: number, now: number) => { const d = (now - added) / DAY; return !added ? 1 : d <= 7 ? 6 : d <= 14 ? 4 : d <= 30 ? 2 : 1; };

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
  const [now, setNow] = useState(Date.now);
  const [week, setWeek] = useState(false);
  useEffect(() => { prepare(); }, [prepare]);
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 20_000); return () => window.clearInterval(t); }, []);

  const { programmes: all, semaine } = radioSettingsOf(settings);
  // Alerte : demain n'a encore aucune émission programmée
  const tomorrow = new Date(new Date(`${todayKin()}T12:00:00+01:00`).getTime() + 86_400_000).toLocaleDateString('fr-CA', { timeZone: TZ });
  const tomorrowEmpty = !all.some((p) => dayOf(p.startsAt) === tomorrow);
  const list = all.filter((p) => dayOf(p.startsAt) === day).sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  // Bibliothèque : émissions déjà diffusées, prédications et chants de la radio
  const library = useMemo<Source[]>(() => {
    const seen = new Set<string>();
    const out: Source[] = [];
    const add = (s: Source) => {
      // les chants du site (/audio/…) deviennent une adresse complète, valable pour tous les auditeurs
      const url = s.url?.startsWith('/') ? `https://jesuiskcciste.com${s.url}` : s.url;
      if (url && /^https:\/\//.test(url) && !seen.has(url)) { seen.add(url); out.push({ ...s, url }); }
    };
    // une émission est « ajoutée » le jour de sa première diffusion
    const first = new Map<string, number>();
    all.forEach((p) => { const t = new Date(p.startsAt).getTime(); if (!first.has(p.url) || t < first.get(p.url)!) first.set(p.url, t); });
    const at = (d?: string) => (d ? new Date(d).getTime() || 0 : 0);
    [...all].reverse().forEach((p) => add({ url: p.url, title: p.title.replace(/ \((rediffusion[^)]*)\)$/, ''), subtitle: 'Émission déjà diffusée', seconds: p.durationSeconds, kind: 'emission', added: first.get(p.url) ?? 0 }));
    items.filter((i) => i.kind === 'sermon').forEach((i) => add({ url: i.url, title: i.title, subtitle: `Prédication · ${i.subtitle}`, seconds: i.durationSeconds, kind: 'sermon', added: at(i.addedAt) }));
    items.filter((i) => i.kind === 'song').forEach((i) => add({ url: i.url, title: i.title, subtitle: `Chant · ${i.subtitle}`, seconds: i.durationSeconds, kind: 'song', added: at(i.addedAt) }));
    return out;
  }, [all, items]);
  const q = query.trim().toLowerCase();
  const shown = (q ? library.filter((s) => `${s.title} ${s.subtitle}`.toLowerCase().includes(q)) : library).slice(0, 40);

  const startMs = (t: string) => new Date(`${day}T${t}:00+01:00`).getTime();
  const endMs = (p: RadioProgramme) => new Date(p.startsAt).getTime() + p.durationSeconds * 1000;

  /** Créneau libre touché : son début, ou le prochain quart d'heure s'il a déjà commencé. */
  // Programme automatique : une proposition variée que l'animateur revoit avant d'enregistrer
  const [draft, setDraft] = useState<RadioProgramme[] | null>(null);
  const [options, setOptions] = useState<RadioProgramme[][]>([]);
  const [choice, setChoice] = useState(0);
  const [saving, setSaving] = useState(0);

  /**
   * Programme automatique sur 24 heures : de maintenant jusqu'à demain à la même heure.
   * Prédications et émissions s'enchaînent avec des pauses de chants entre elles ; les audios
   * ajoutés récemment sont choisis plus souvent, et un même audio ne revient pas trop vite.
   * Ce qui est déjà programmé reste à sa place.
   */
  function generate() {
    setMsg('');
    const t0 = Date.now();
    const talks = library.filter((x) => x.kind !== 'song' && x.seconds && x.seconds >= 60 && x.seconds <= 3 * 3600);
    if (!talks.length) { setMsg('Aucune prédication ni émission avec une durée connue dans le système.'); return; }
    const start = Math.ceil((t0 + 5 * MIN) / (5 * MIN)) * (5 * MIN);
    const end = start + DAY;
    const busy = all.map((p) => [new Date(p.startsAt).getTime(), endMs(p)] as const).filter(([s, e]) => e > start && s < end).sort((x, y) => x[0] - y[0]);
    // un même audio ne revient qu'après un certain temps (plus court s'il y a peu d'audios)
    const gapOf = (x: Source) => (talks.length >= 12 ? 12 : talks.length >= 6 ? 6 : 3) * HOUR / (freshness(x.added, t0) >= 4 ? 2 : 1);
    const before = new Map<string, number>();
    all.forEach((p) => { const t = new Date(p.startsAt).getTime(); if (t > start - DAY && t < end && t > (before.get(p.url) ?? -Infinity)) before.set(p.url, t); });

    /** Une proposition : `style` règle le rythme et les genres, `others` les propositions déjà faites (pour être différent). */
    function plan(style: Style, others: RadioProgramme[][]): RadioProgramme[] {
      const last = new Map(before);
      const out: RadioProgramme[] = [];
      let cursor = start, prevKind: Kind | null = null;
      const near = (url: string, at: number) => others.some((o) => o.some((p) => p.url === url && Math.abs(new Date(p.startsAt).getTime() - at) < 90 * MIN));
      while (cursor < end - 10 * MIN) {
        const inside = busy.find(([s, e]) => s <= cursor && cursor < e);
        if (inside) { cursor = Math.ceil((inside[1] + style.pause / 2) / (5 * MIN)) * (5 * MIN); continue; }
        const nextBusy = busy.find(([s]) => s > cursor)?.[0] ?? end;
        const room = Math.min(nextBusy, end) - cursor;
        const ok = talks.filter((x) => (x.seconds ?? 0) * 1000 <= room && cursor - (last.get(x.url) ?? -Infinity) >= gapOf(x));
        // on alterne prédication et émission quand c'est possible
        const pool = ok.filter((x) => x.kind !== prevKind).length ? ok.filter((x) => x.kind !== prevKind) : ok;
        if (!pool.length) { cursor = Math.min(nextBusy, cursor + HOUR); continue; }
        const w = (x: Source) => freshness(x.added, t0) * (style.kind[x.kind] ?? 1) * (near(x.url, cursor) ? 0.15 : 1);
        let r = Math.random() * pool.reduce((n, x) => n + w(x), 0);
        const pick = pool.find((x) => (r -= w(x)) <= 0) ?? pool[pool.length - 1];
        const secs = Math.round(pick.seconds ?? 0);
        out.push({ id: crypto.randomUUID?.() ?? `${t0}-${out.length}-${Math.random()}`, title: (pick.kind === 'emission' ? `${pick.title} (rediffusion)` : pick.title).slice(0, 120), topic: '', url: pick.url, startsAt: new Date(cursor).toISOString(), durationSeconds: secs });
        last.set(pick.url, cursor); prevKind = pick.kind;
        // pause de chants un peu variable : les heures ne tombent pas toujours au même endroit
        const pause = style.pause * (0.8 + Math.random() * 0.4);
        cursor = Math.ceil((cursor + secs * 1000 + pause) / (5 * MIN)) * (5 * MIN);
      }
      return out;
    }
    const made: RadioProgramme[][] = [];
    STYLES.forEach((st) => { made.push(plan(st, made)); });
    if (!made.some((m) => m.length)) { setMsg('Plus de place libre d’ici demain à la même heure.'); return; }
    setOpen(false);
    setOptions(made);
    const first = made.findIndex((m) => m.length);
    setChoice(first);
    setDraft(made[first]);
  }

  async function saveDraft() {
    if (!draft?.length) return;
    setMsg('');
    const done: RadioProgramme[] = [];
    try {
      for (const p of draft) {
        if (new Date(p.startsAt).getTime() < Date.now()) continue;
        setSaving(done.length + 1);
        const { error } = await supabase!.rpc('radio_programme_add', { p });
        if (error) throw new Error(`« ${p.title} » : ${error.message}`);
        done.push(p);
      }
      setDraft(null);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'L’enregistrement a échoué.'); setDraft((d) => d?.filter((x) => !done.includes(x)) ?? null); } finally {
      setSaving(0);
      if (done.length) { const r = radioSettingsOf(settings); const next = { ...settings, radio: { ...r, programmes: [...r.programmes, ...done] } }; setSettings(next); }
    }
  }

  function openGap(from: number) {
    const q = 15 * 60_000;
    const at = from > now ? from : Math.ceil((now + 60_000) / q) * q;
    openAt(hhmm(at));
  }

  function openAt(t: string) {
    setTime(t); setOpen(true); setMsg(''); setPicked(null); setFile(null); setTitle(''); setTopic('');
    window.setTimeout(() => document.getElementById('grille-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
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
      <p className={`mt-1 text-xs ${c.sub}`}>Heure de Kinshasa. Touchez une heure libre, cherchez l’audio, enregistrez : à l’heure dite, tous les auditeurs l’entendent en même temps, et ceux qui arrivent en retard le prennent là où il en est. Entre les émissions, la radio joue seule ses chants, ses jingles et l’heure.</p>

      {tomorrowEmpty && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">Rien n’est encore programmé pour demain : seuls les chants passeront.{semaine.length ? ' La grille type le remplira cette nuit à 00h10, ou tout de suite :' : ' Préparez une grille type de la semaine pour que la radio se remplisse seule.'}</span>
          <button type="button" onClick={() => { setWeek(true); if (day !== tomorrow) setDay(tomorrow); }} className="shrink-0 font-semibold underline">{semaine.length ? 'Remplir' : 'Préparer'}</button>
        </div>
      )}

      <ol className="mt-3 space-y-1.5">
        {rows.map((r, i) => r.p ? (
          <li key={r.p.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${c.show} ${r.from <= now && now < r.to ? 'ring-2 ring-red-500' : ''} ${r.to <= now ? 'opacity-50' : ''}`}>
            <span className="w-24 shrink-0 text-sm font-bold tabular-nums">{hhmm(r.from)} → {hhmm(r.to)}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.p.title}</span>
            {r.from <= now && now < r.to && <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">En cours</span>}
            {r.to > Date.now() && <button type="button" onClick={() => void remove(r.p!)} className="p-1 text-red-500" aria-label={`Retirer ${r.p.title}`}><Trash2 className="h-4 w-4" /></button>}
          </li>
        ) : (
          <li key={`g${i}`}>
            {r.to > now + 5 * 60_000 ? (
              <button type="button" onClick={() => openGap(r.from)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-xs ${c.row} ${c.sub} ${c.item}`}>
                <span className="w-24 shrink-0 tabular-nums">{hhmm(r.from)} → {r.to >= dayEnd ? '24:00' : hhmm(r.to)}</span>
                <span className="flex-1">Chants de la radio</span>
                <span className="inline-flex items-center gap-1 font-semibold text-gold"><Plus className="h-3.5 w-3.5" />Programmer ici</span>
              </button>
            ) : (
              <div className={`flex items-center gap-3 rounded-xl px-3 py-1.5 text-xs opacity-50 ${c.row} ${c.sub}`}>
                <span className="w-24 shrink-0 tabular-nums">{hhmm(r.from)} → {r.to >= dayEnd ? '24:00' : hhmm(r.to)}</span>
                <span className="flex-1">Chants de la radio</span>
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK.filter((t) => startMs(t) > now).map((t) => (
          <button key={t} type="button" onClick={() => openAt(t)} className={small + ' ' + c.btn}><Plus className="h-3.5 w-3.5" />{t}</button>
        ))}
        <button type="button" onClick={() => openAt(time)} className={small + ' bg-gold text-night'}><Plus className="h-4 w-4" />Autre heure</button>
        <button type="button" onClick={generate} className={small + ' ' + c.btn}><Wand2 className="h-4 w-4" />Proposer des programmes (24 h)</button>
        <button type="button" onClick={() => void poster()} disabled={!list.length} className={small + ' ' + c.btn}><Download className="h-4 w-4" />Affiche du programme (JPG)</button>
        <button type="button" onClick={() => setWeek((w) => !w)} aria-expanded={week} className={small + ' ' + (week ? 'bg-gold text-night' : c.btn)}><CalendarRange className="h-4 w-4" />Grille de la semaine{semaine.length ? ` (${semaine.length})` : ''}</button>
      </div>

      {week && <WeekTemplate library={library} dark={dark} />}

      {draft && (
        <div className="mt-4 space-y-2 border-t border-current/10 pt-4">
          <p className="text-sm font-semibold">Proposition de programme — de maintenant jusqu’à demain même heure ({draft.length} émissions)</p>
          <p className={`text-xs ${c.sub}`}>Quatre programmes différents, choisis dans tous les audios du système (les ajouts récents passent plus souvent). Comparez-les, choisissez celui qui vous plaît, retirez ce qui ne convient pas, ou demandez de nouvelles propositions. Ce qui était déjà programmé reste à sa place.</p>
          {options.length > 1 && (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="tablist" aria-label="Propositions">
              {options.map((o, n) => {
                const ser = o.filter((p) => !/\(rediffusion/.test(p.title)).length;
                return (
                  <button key={n} type="button" role="tab" aria-selected={choice === n} disabled={!o.length || !!saving}
                    onClick={() => { setChoice(n); setDraft(o); }}
                    className={`rounded-xl px-3 py-2 text-left text-xs disabled:opacity-40 ${choice === n ? c.pick : c.btn}`}>
                    <span className="block text-sm font-bold">{n + 1}. {STYLES[n].name}</span>
                    <span className={`block ${c.sub}`}>{o.length} émissions · {ser} prédic. · {o.length - ser} rediff.</span>
                  </button>
                );
              })}
            </div>
          )}
          {options.length > 1 && <p className={`text-xs ${c.sub}`}>{STYLES[choice]?.hint}</p>}
          <ol className="space-y-1.5">
            {draft.map((p) => (
              <li key={p.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${c.show}`}>
                <span className="w-24 shrink-0 text-sm font-bold tabular-nums">{dayOf(p.startsAt) !== todayKin() && <span className="block text-[10px] font-semibold uppercase text-gold">Demain</span>}{hhmm(new Date(p.startsAt).getTime())} → {hhmm(endMs(p))}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.title}</span>
                <button type="button" onClick={() => setDraft((d) => d?.filter((x) => x.id !== p.id) ?? null)} className={`p-1 ${c.sub}`} aria-label={`Retirer ${p.title}`}><X className="h-4 w-4" /></button>
              </li>
            ))}
          </ol>
          {msg && <p className="text-sm text-red-500" role="alert">{msg}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => void saveDraft()} disabled={!!saving || !draft.length} className={small + ' bg-gold text-night'}>{saving ? <><Loader2 className="h-4 w-4 animate-spin" />{saving}/{draft.length}</> : <><CalendarClock className="h-4 w-4" />Enregistrer ce programme</>}</button>
            <button type="button" onClick={generate} disabled={!!saving} className={small + ' ' + c.btn}><RefreshCw className="h-4 w-4" />Nouvelles propositions</button>
            <button type="button" onClick={() => setDraft(null)} disabled={!!saving} className={small + ' ' + c.btn}>Annuler</button>
          </div>
        </div>
      )}

      {open && (
        <div id="grille-form" className="mt-4 space-y-3 border-t border-current/10 pt-4">
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
      {!open && !draft && msg && <p className="mt-2 text-sm text-red-500" role="alert">{msg}</p>}
    </section>
  );
}
