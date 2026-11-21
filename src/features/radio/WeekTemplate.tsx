import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Download, Loader2, Plus, Save, Search, Trash2, Wand2 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import type { SiteSettings } from '@/config/site';
import { radioSettingsOf, type RadioSlot } from './radio';
import { drawWeekPoster, joursLabel } from './programmePoster';

type Lib = { url: string; title: string; subtitle: string; seconds: number | null };
const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const SOURCES: Record<RadioSlot['source'], string> = {
  predication: 'Prédication (une différente chaque jour)',
  emission: 'Émission en rediffusion (tourne chaque jour)',
  fichier: 'Toujours le même fichier',
};
/** Proposition de départ, que l'animateur modifie à sa guise. */
const MODELE: RadioSlot[] = [
  { id: 'midi', jours: [1, 2, 3, 4, 5], heure: '12:30', source: 'emission' },
  { id: 'soir', jours: [1, 2, 3, 4, 5, 6, 7], heure: '20:00', source: 'predication' },
  { id: 'weekend', jours: [6, 7], heure: '15:00', source: 'emission' },
];
const titleOf = (s: RadioSlot) => s.titre || (s.source === 'predication' ? 'Prédication' : s.source === 'emission' ? 'Émission (rediffusion)' : 'Émission');

/**
 * Grille type de la semaine : chaque créneau revient les jours choisis, à la même heure.
 * La base remplit seule les 7 prochains jours chaque nuit (00h10, heure de Kinshasa),
 * sans toucher à ce qui est déjà programmé à la main.
 */
export function WeekTemplate({ library, dark }: { library: Lib[]; dark?: boolean }) {
  const { settings, setSettings } = useSiteSettings();
  const saved = radioSettingsOf(settings).semaine;
  const [slots, setSlots] = useState<RadioSlot[]>(saved);
  const [dirty, setDirty] = useState(false);
  // la grille enregistrée arrive après l'ouverture de la page : on la reprend tant qu'on n'a rien modifié
  const savedKey = JSON.stringify(saved);
  useEffect(() => { if (!dirty) setSlots(JSON.parse(savedKey) as RadioSlot[]); }, [savedKey, dirty]);
  const [busy, setBusy] = useState<'' | 'save' | 'fill'>('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // formulaire d'ajout
  const [jours, setJours] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [heure, setHeure] = useState('20:00');
  const [source, setSource] = useState<RadioSlot['source']>('predication');
  const [titre, setTitre] = useState('');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Lib | null>(null);

  const q = query.trim().toLowerCase();
  const shown = useMemo(() => library.filter((s) => s.seconds && (!q || `${s.title} ${s.subtitle}`.toLowerCase().includes(q))).slice(0, 30), [library, q]);
  const sorted = [...slots].sort((a, b) => a.heure.localeCompare(b.heure));

  function change(next: RadioSlot[]) { setSlots(next); setDirty(true); setMsg(null); }

  function add() {
    setMsg(null);
    if (!jours.length) return setMsg({ ok: false, text: 'Choisissez au moins un jour.' });
    if (!/^\d{2}:\d{2}$/.test(heure)) return setMsg({ ok: false, text: 'Heure non valide.' });
    if (source === 'fichier' && !picked) return setMsg({ ok: false, text: 'Choisissez le fichier à diffuser.' });
    const clash = slots.find((s) => s.heure === heure && s.jours.some((d) => jours.includes(d)));
    if (clash) return setMsg({ ok: false, text: `Il y a déjà « ${titleOf(clash)} » à ${heure} (${joursLabel(clash.jours)}).` });
    const s: RadioSlot = {
      id: Math.random().toString(36).slice(2, 10), jours: [...jours].sort(), heure, source,
      ...(titre.trim() || picked ? { titre: (titre.trim() || picked?.title || '').slice(0, 120) } : {}),
      ...(source === 'fichier' && picked ? { url: picked.url, durationSeconds: Math.round(picked.seconds ?? 0) } : {}),
    };
    change([...slots, s]);
    setTitre(''); setPicked(null); setQuery('');
  }

  async function reload() {
    const { data } = await supabase!.from('site_settings').select('value').eq('key', 'public').maybeSingle();
    if (data?.value) setSettings({ ...settings, radio: camelize<Partial<SiteSettings>>(data.value).radio });
  }

  async function save(): Promise<boolean> {
    setBusy('save'); setMsg(null);
    try {
      const { error } = await supabase!.rpc('radio_semaine_set', { p: slots });
      if (error) throw new Error(error.message);
      setDirty(false);
      await reload();
      return true;
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'L’enregistrement a échoué.' }); return false; } finally { setBusy(''); }
  }

  async function fill() {
    if (dirty && !(await save())) return;
    setBusy('fill'); setMsg(null);
    try {
      const { data, error } = await supabase!.rpc('radio_remplir', { p_jours: 7 });
      if (error) throw new Error(error.message);
      await reload();
      const n = Number(data) || 0;
      setMsg({ ok: true, text: n ? `${n} émission${n > 1 ? 's' : ''} ajoutée${n > 1 ? 's' : ''} sur les 7 prochains jours.` : 'Les 7 prochains jours sont déjà remplis (rien de nouveau à ajouter).' });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Le remplissage a échoué.' }); } finally { setBusy(''); }
  }

  async function poster(vertical: boolean) {
    const blob = await drawWeekPoster(sorted.map((s) => ({ jours: s.jours, heure: s.heure, titre: titleOf(s) })), vertical);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `grille-radio-kcc${vertical ? '-tiktok' : ''}.jpg`;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  const c = dark
    ? { sub: 'text-white/55', field: 'rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-white placeholder:text-white/35', btn: 'bg-white/[0.08] text-white', row: 'border-l-4 border-gold bg-gold/[0.12]', on: 'bg-gold text-night', off: 'bg-white/[0.08] text-white/70', item: 'hover:bg-white/[0.06]', pick: 'bg-gold/25 ring-1 ring-gold' }
    : { sub: 'text-ink/55', field: 'rounded-lg border border-[#d3dae3] bg-white px-3 py-2', btn: 'border border-[#d3dae3] text-night', row: 'border-l-4 border-gold bg-gold/10', on: 'bg-gold text-night', off: 'border border-[#d3dae3] text-ink/60', item: 'hover:bg-[#f3f6f9]', pick: 'bg-gold/20 ring-1 ring-gold' };
  const small = 'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-50';

  return (
    <div className="mt-4 space-y-3 border-t border-current/10 pt-4">
      <p className="flex items-center gap-2 text-sm font-semibold"><CalendarRange className="h-4 w-4 text-gold" />Grille type de la semaine</p>
      <p className={`text-xs ${c.sub}`}>Les créneaux reviennent chaque semaine. Chaque nuit à 00h10, la radio programme seule les 7 jours suivants : une prédication ou une rediffusion différente chaque jour, sans toucher à ce que vous avez programmé à la main.</p>

      {sorted.length ? (
        <ol className="space-y-1.5">
          {sorted.map((s) => (
            <li key={s.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${c.row}`}>
              <span className="w-14 shrink-0 text-sm font-bold tabular-nums">{s.heure}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{titleOf(s)}</span>
                <span className={`block truncate text-xs ${c.sub}`}>{joursLabel(s.jours)} · {s.source === 'fichier' ? 'fichier fixe' : s.source === 'predication' ? 'prédication tournante' : 'rediffusion tournante'}</span>
              </span>
              <button type="button" onClick={() => change(slots.filter((x) => x.id !== s.id))} className="p-1 text-red-500" aria-label={`Retirer ${titleOf(s)}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ol>
      ) : (
        <div className={`rounded-xl p-3 text-sm ${c.row}`}>
          <p>Aucune grille type pour l’instant.</p>
          <button type="button" onClick={() => change(MODELE)} className={small + ' mt-2 ' + c.btn}><Wand2 className="h-4 w-4" />Partir d’un modèle (prédication 20h00, rediffusions…)</button>
        </div>
      )}

      <div className="space-y-2 rounded-xl p-3 ring-1 ring-current/10">
        <p className="text-sm font-semibold">Ajouter un créneau</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {JOURS.map((j, i) => (
            <button key={i} type="button" onClick={() => setJours((d) => d.includes(i + 1) ? d.filter((x) => x !== i + 1) : [...d, i + 1])} className={`h-9 w-9 rounded-full text-sm font-bold ${jours.includes(i + 1) ? c.on : c.off}`} aria-pressed={jours.includes(i + 1)} aria-label={['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][i]}>{j}</button>
          ))}
          <button type="button" onClick={() => setJours([1, 2, 3, 4, 5, 6, 7])} className={`text-xs font-semibold ${c.sub}`}>tous</button>
          <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className={c.field + ' ml-auto'} aria-label="Heure" />
        </div>
        <select value={source} onChange={(e) => { setSource(e.target.value as RadioSlot['source']); setPicked(null); }} className={c.field + ' w-full'} aria-label="Ce qui passe">
          {(Object.keys(SOURCES) as RadioSlot['source'][]).map((k) => <option key={k} value={k}>{SOURCES[k]}</option>)}
        </select>
        {source === 'fichier' && (
          <div>
            <div className="relative"><Search className={`absolute left-3 top-2.5 h-4 w-4 ${c.sub}`} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher le fichier : journal, prière, émission…" className={c.field + ' w-full pl-9'} /></div>
            <ul className="mt-1 max-h-44 overflow-y-auto">
              {shown.map((s) => (
                <li key={s.url}>
                  <button type="button" onClick={() => setPicked(s)} className={`w-full rounded-lg px-3 py-1.5 text-left text-sm ${picked?.url === s.url ? c.pick : c.item}`}>
                    <span className="block truncate font-semibold">{s.title}</span>
                    <span className={`block truncate text-xs ${c.sub}`}>{s.subtitle} · {Math.round((s.seconds ?? 0) / 60)} min</span>
                  </button>
                </li>
              ))}
              {!shown.length && <li className={`px-3 py-1.5 text-sm ${c.sub}`}>Rien trouvé.</li>}
            </ul>
          </div>
        )}
        <input value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={120} placeholder={source === 'fichier' ? 'Titre affiché (facultatif)' : 'Titre fixe (facultatif) : sinon le titre de chaque fichier'} className={c.field + ' w-full'} />
        <button type="button" onClick={add} className={small + ' ' + c.btn}><Plus className="h-4 w-4" />Ajouter à la grille</button>
      </div>

      {msg && <p className={`text-sm ${msg.ok ? 'text-emerald-500' : 'text-red-500'}`} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void save()} disabled={!!busy || !dirty} className={small + ' bg-gold text-night'}>{busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Enregistrer la grille</button>
        <button type="button" onClick={() => void fill()} disabled={!!busy || !slots.length} className={small + ' ' + c.btn}>{busy === 'fill' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}Remplir les 7 prochains jours</button>
        <button type="button" onClick={() => void poster(false)} disabled={!slots.length} className={small + ' ' + c.btn}><Download className="h-4 w-4" />Affiche 16:9</button>
        <button type="button" onClick={() => void poster(true)} disabled={!slots.length} className={small + ' ' + c.btn}><Download className="h-4 w-4" />Affiche TikTok</button>
      </div>
    </div>
  );
}
