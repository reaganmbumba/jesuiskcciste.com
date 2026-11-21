import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Download, Loader2, X } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatDuration } from '@/utils/format';
import { uploadSiteAudio } from '@/features/content/siteContent';
import { addDraft, scheduleProgramme, updateDraft, whenLabel } from './drafts';
import type { ShowRecording } from './recorder';

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'emission';

/**
 * Après le direct : l'enregistrement est mis en ligne, puis on peut le télécharger
 * (téléphone ou ordinateur) et le programmer en rediffusion.
 */
export function RecordingPanel({ rec, title, topic, dark, onClose, draft = false }: { rec: ShowRecording; title: string; topic: string; dark?: boolean; onClose: () => void; draft?: boolean }) {
  const { settings, setSettings } = useSiteSettings();
  // Émission enregistrée sans diffuser : elle passera pour la première fois, donc pas « (rediffusion) ».
  const [name, setName] = useState(draft ? title : `${title} (rediffusion)`);
  const [url, setUrl] = useState('');
  const [state, setState] = useState<'upload' | 'ok' | 'error'>('upload');
  const [error, setError] = useState('');
  const [when, setWhen] = useState('');
  const [planned, setPlanned] = useState('');
  const [busy, setBusy] = useState(false);
  const date = new Date().toLocaleDateString('fr-CA');
  const fileName = `${slug(title)}-${date}.${rec.ext}`;
  const draftId = useMemo(() => crypto.randomUUID?.() ?? `${Date.now()}`, [rec.blob]);
  const localUrl = useMemo(() => URL.createObjectURL(rec.blob), [rec.blob]);
  useEffect(() => () => URL.revokeObjectURL(localUrl), [localUrl]);

  useEffect(() => {
    let off = false;
    const file = new File([rec.blob], fileName, { type: rec.mime });
    uploadSiteAudio(file, `${title} ${date}`)
      .then((r) => {
        // gardé dans la liste « à programmer » de ce navigateur, pour le programmer plus tard
        if (draft) addDraft({ id: draftId, title, topic, url: r.url, seconds: rec.seconds, recordedAt: new Date().toISOString() });
        if (!off) { setUrl(r.url); setState('ok'); }
      })
      .catch((e) => { if (!off) { setError(e instanceof Error ? e.message : 'Envoi impossible.'); setState('error'); } });
    return () => { off = true; };
  }, [rec.blob]); // eslint-disable-line react-hooks/exhaustive-deps

  async function schedule() {
    if (!url || !when) return;
    setBusy(true); setError('');
    try {
      const start = await scheduleProgramme(settings, setSettings, { title: name.trim() || title, topic, url, seconds: rec.seconds, when });
      if (draft) updateDraft(draftId, { title: name.trim() || title, programmedFor: start.toISOString() });
      setPlanned(whenLabel(start));
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
          <p className="font-semibold">{draft ? '⏺ Émission enregistrée (pas encore diffusée)' : '🎙️ Enregistrement de l’émission'} · {formatDuration(rec.seconds)}</p>
          <p className={`text-xs ${sub}`}>{state === 'upload' ? 'Mise en ligne en cours…' : state === 'ok' ? '✓ Gardé en ligne : vous pouvez le télécharger ou le repasser.' : 'Pas mis en ligne : téléchargez-le maintenant pour ne pas le perdre.'}</p>
        </div>
        <button type="button" onClick={onClose} className={`p-1 ${sub}`} aria-label="Fermer"><X className="h-4 w-4" /></button>
      </div>
      {/* Réécouter avant de programmer */}
      <audio controls preload="metadata" src={localUrl} className="mt-3 w-full" aria-label="Réécouter l’enregistrement" />
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={downloadHref} download={fileName} className={`${btn} bg-gold text-night ${state === 'upload' ? 'pointer-events-none opacity-50' : ''}`}>
          {state === 'upload' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Télécharger
        </a>
      </div>
      {state === 'ok' && (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><CalendarClock className="h-4 w-4" />{draft ? 'Programmer à la radio (et sur YouTube)' : 'Repasser en rediffusion'}</p>
          {planned
            ? <p className="mt-1 text-sm text-emerald-500">✓ {draft ? 'Émission programmée' : 'Rediffusion programmée'} {planned}. Elle passera seule, même ordinateur éteint ; l’alarme de l’appli préviendra les auditeurs.</p>
            : (
              <div className="mt-2 flex flex-wrap gap-2">
                <input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} className={`${field} min-w-0 flex-1 basis-full`} aria-label="Nom affiché aux auditeurs" placeholder="Nom de l’émission" />
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
