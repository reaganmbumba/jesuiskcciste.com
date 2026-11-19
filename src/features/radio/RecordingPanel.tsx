import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Download, Loader2, X } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import { snakify } from '@/utils/case';
import { formatDuration } from '@/utils/format';
import { uploadSiteAudio } from '@/features/content/siteContent';
import { radioSettingsOf, type RadioProgramme } from './radio';
import type { ShowRecording } from './recorder';

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'emission';

/**
 * Après le direct : l'enregistrement est mis en ligne, puis on peut le télécharger
 * (téléphone ou ordinateur) et le programmer en rediffusion.
 */
export function RecordingPanel({ rec, title, topic, dark, onClose }: { rec: ShowRecording; title: string; topic: string; dark?: boolean; onClose: () => void }) {
  const { settings, setSettings } = useSiteSettings();
  const [url, setUrl] = useState('');
  const [state, setState] = useState<'upload' | 'ok' | 'error'>('upload');
  const [error, setError] = useState('');
  const [when, setWhen] = useState('');
  const [planned, setPlanned] = useState('');
  const [busy, setBusy] = useState(false);
  const date = new Date().toLocaleDateString('fr-CA');
  const fileName = `${slug(title)}-${date}.${rec.ext}`;
  const localUrl = useMemo(() => URL.createObjectURL(rec.blob), [rec.blob]);
  useEffect(() => () => URL.revokeObjectURL(localUrl), [localUrl]);

  useEffect(() => {
    let off = false;
    const file = new File([rec.blob], fileName, { type: rec.mime });
    uploadSiteAudio(file, `${title} ${date}`)
      .then((r) => { if (!off) { setUrl(r.url); setState('ok'); } })
      .catch((e) => { if (!off) { setError(e instanceof Error ? e.message : 'Envoi impossible.'); setState('error'); } });
    return () => { off = true; };
  }, [rec.blob]); // eslint-disable-line react-hooks/exhaustive-deps

  async function schedule() {
    if (!url || !when) return;
    const start = new Date(when);
    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 60_000) { setError('Choisissez une date et une heure à venir.'); return; }
    setBusy(true); setError('');
    try {
      const r = radioSettingsOf(settings);
      const p: RadioProgramme = { id: crypto.randomUUID?.() ?? `${Date.now()}`, title: `${title} (rediffusion)`.slice(0, 120), topic, url, startsAt: start.toISOString(), durationSeconds: rec.seconds };
      const next = { ...settings, radio: { ...r, programmes: [...r.programmes, p] } };
      const { error: e } = await supabase!.from('site_settings').upsert({ key: 'public', value: snakify(next) });
      if (e) throw e;
      setSettings(next);
      setPlanned(start.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }));
    } catch (e) { setError(e instanceof Error ? e.message : 'La programmation a échoué.'); } finally { setBusy(false); }
  }

  const box = dark ? 'rounded-3xl border border-gold/40 bg-gold/[0.08] p-4 text-white' : 'rounded border border-gold/50 bg-gold-50 p-4 text-night';
  const sub = dark ? 'text-white/60' : 'text-ink/60';
  const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold';
  const field = dark ? 'rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-white' : 'rounded-xl border border-night/15 bg-white px-3 py-2.5';
  // Sur Supabase, « ?download= » force l'enregistrement du fichier (téléphone, ordinateur).
  const downloadHref = url ? `${url}?download=${encodeURIComponent(fileName)}` : localUrl;

  return (
    <section className={box}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">🎙️ Enregistrement de l’émission · {formatDuration(rec.seconds)}</p>
          <p className={`text-xs ${sub}`}>{state === 'upload' ? 'Mise en ligne en cours…' : state === 'ok' ? '✓ Gardé en ligne : vous pouvez le télécharger ou le repasser.' : 'Pas mis en ligne : téléchargez-le maintenant pour ne pas le perdre.'}</p>
        </div>
        <button type="button" onClick={onClose} className={`p-1 ${sub}`} aria-label="Fermer"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={downloadHref} download={fileName} className={`${btn} bg-gold text-night ${state === 'upload' ? 'pointer-events-none opacity-50' : ''}`}>
          {state === 'upload' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Télécharger
        </a>
      </div>
      {state === 'ok' && (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><CalendarClock className="h-4 w-4" />Repasser en rediffusion</p>
          {planned
            ? <p className="mt-1 text-sm text-emerald-500">✓ Rediffusion programmée {planned}. L’alarme de l’appli préviendra les auditeurs.</p>
            : (
              <div className="mt-2 flex flex-wrap gap-2">
                <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={field} aria-label="Date et heure de la rediffusion" />
                <button type="button" onClick={schedule} disabled={!when || busy} className={`${btn} ${dark ? 'bg-white/10 text-white' : 'bg-[#2b3648] text-white'} disabled:opacity-50`}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}Programmer
                </button>
              </div>
            )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500" role="alert">{error}</p>}
    </section>
  );
}
