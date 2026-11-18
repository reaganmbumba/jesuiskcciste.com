import { useRef, useState } from 'react';
import { CalendarClock, Trash2, Upload } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { snakify } from '@/utils/case';
import { formatDuration } from '@/utils/format';
import { uploadSiteAudio } from '@/features/content/siteContent';
import { currentProgramme, radioSettingsOf, upcomingProgrammes, type RadioProgramme } from './radio';
import { LiveBadge } from './RadioUi';

const fmt = (iso: string) => new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const overlaps = (a: RadioProgramme, b: RadioProgramme) => {
  const s1 = new Date(a.startsAt).getTime(); const e1 = s1 + a.durationSeconds * 1000;
  const s2 = new Date(b.startsAt).getTime(); const e2 = s2 + b.durationSeconds * 1000;
  return s1 < e2 && s2 < e1;
};

/**
 * Émissions programmées : l'animateur dépose un enregistrement, choisit le jour et l'heure ;
 * l'émission passe seule à la radio (ordinateur éteint), pour tous les auditeurs en même temps,
 * et l'application Android sonne l'alarme d'annonce.
 */
export function AdminProgrammes() {
  const { settings, setSettings } = useSiteSettings();
  const { notify } = useToast();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [when, setWhen] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const all = radioSettingsOf(settings).programmes;
  const list = upcomingProgrammes(all);
  const now = currentProgramme(all);

  async function saveList(programmes: RadioProgramme[]) {
    const r = radioSettingsOf(settings);
    // Les émissions terminées depuis plus d'un jour sont retirées de la liste.
    const keep = programmes.filter((p) => new Date(p.startsAt).getTime() + p.durationSeconds * 1000 > Date.now() - 86_400_000);
    const next = { ...settings, radio: { ...r, programmes: keep } };
    if (!isDemoMode) {
      const { error } = await supabase!.from('site_settings').upsert({ key: 'public', value: snakify(next) });
      if (error) throw error;
    }
    setSettings(next);
  }

  async function add() {
    if (!title.trim()) return notify('Donnez un nom à l’émission.', 'error');
    if (!when) return notify('Choisissez le jour et l’heure de diffusion.', 'error');
    if (!file) return notify('Choisissez le fichier audio de l’émission (mp3, m4a…).', 'error');
    const start = new Date(when);
    if (Number.isNaN(start.getTime())) return notify('Date ou heure non reconnue.', 'error');
    if (start.getTime() < Date.now() - 60_000) return notify('Cette heure est déjà passée : choisissez une heure à venir.', 'error');
    setBusy(true);
    try {
      const up = await uploadSiteAudio(file, title.trim());
      if (!up.duration) throw new Error('La durée du fichier est illisible : essayez un fichier mp3.');
      const p: RadioProgramme = {
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        title: title.trim().slice(0, 120), topic: topic.trim().slice(0, 3000),
        url: up.url, startsAt: start.toISOString(), durationSeconds: Math.round(up.duration),
      };
      const clash = all.find((x) => overlaps(x, p));
      await saveList([...all, p]);
      setTitle(''); setTopic(''); setWhen(''); setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      notify(clash ? `Émission programmée. Attention : elle chevauche « ${clash.title} » ; la première commencée passe d’abord.` : 'Émission programmée : elle passera seule à l’heure prévue, même ordinateur éteint.');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'L’enregistrement a échoué.', 'error');
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    try { await saveList(all.filter((p) => p.id !== id)); notify('Émission retirée du programme.'); }
    catch (e) { notify(e instanceof Error ? e.message : 'La suppression a échoué.', 'error'); }
  }

  return (
    <Card><CardBody className="space-y-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-night"><CalendarClock className="h-5 w-5 text-gold-600" />Émissions programmées</h2>
      <p className="text-sm text-ink/65">Enregistrez votre émission à l’avance, déposez le fichier et choisissez l’heure : elle passe seule à la radio, pour tous les auditeurs en même temps, <b>même si votre ordinateur est éteint</b>. L’application Android sonne l’alarme d’annonce. Pas d’appels pendant une émission programmée. Si vous faites un vrai direct à la même heure, c’est le direct qui passe.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom de l’émission">{(p) => <Input {...p} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tosungana – rediffusion" />}</Field>
        <Field label="Jour et heure de diffusion" hint="Heure de votre téléphone ou ordinateur.">{(p) => <Input {...p} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />}</Field>
      </div>
      <Field label="Sujet affiché aux auditeurs (facultatif)">{(p) => <Textarea {...p} maxLength={3000} value={topic} onChange={(e) => setTopic(e.target.value)} />}</Field>
      <Field label="Fichier audio de l’émission" hint="mp3 conseillé, 50 Mo au plus (environ 1 h 45 en qualité vocale).">{(p) => (
        <input {...p} ref={fileInput} type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink/80 file:mr-3 file:rounded-xl file:border-0 file:bg-gold/20 file:px-4 file:py-2 file:font-semibold file:text-night" />
      )}</Field>
      <Button onClick={add} loading={busy} icon={<Upload className="h-4 w-4" />}>Programmer l’émission</Button>

      <div className="border-t border-night/[0.06] pt-4">
        <p className="text-sm font-semibold text-night">À l’antenne et à venir</p>
        {list.length ? (
          <ul className="mt-3 space-y-2">
            {list.map((p) => (
              <li key={p.id} className="flex items-start gap-3 rounded-2xl bg-night/[0.03] p-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-night">{p.title || 'Émission programmée'}{now?.id === p.id && <LiveBadge />}</p>
                  <p className="text-xs capitalize text-ink/60">{fmt(p.startsAt)} · {formatDuration(p.durationSeconds)}</p>
                  {p.topic && <p className="mt-1 line-clamp-2 text-xs text-ink/55">{p.topic}</p>}
                </div>
                <button type="button" onClick={() => void remove(p.id)} className="grid h-9 w-9 place-items-center rounded-full text-red-600 hover:bg-red-50" aria-label={`Retirer ${p.title}`}><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-ink/60">Aucune émission programmée.</p>}
      </div>
    </CardBody></Card>
  );
}
