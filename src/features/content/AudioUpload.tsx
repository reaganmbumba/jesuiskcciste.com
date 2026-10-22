import { useRef, useState } from 'react';
import { Loader2, Music2 } from 'lucide-react';
import { Input } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { AUDIO_ACCEPT } from '@/features/sermons/sermons';
import { uploadSiteAudio } from './siteContent';

/**
 * Choix d'un chant depuis le téléphone ou l'ordinateur (MP3, audio WhatsApp…) :
 * il est envoyé tout de suite et son adresse remplit le champ, avec sa durée.
 */
export function AudioUpload({ value, onChange, title, id }: { value: string; onChange: (url: string, duration?: number | null) => void; title: string; id?: string }) {
  const { notify } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const r = await uploadSiteAudio(file, title || file.name.replace(/\.[^.]+$/, ''));
      onChange(r.url, r.duration);
      notify('Chant envoyé. Pensez à cliquer sur « Enregistrer ».');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Envoi du chant impossible.', 'error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  return (
    <div className="space-y-2">
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-night/12 bg-white px-4 py-2 text-sm font-semibold text-night hover:border-gold-400 hover:bg-gold-50 disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music2 className="h-4 w-4" />}
        {busy ? 'Envoi en cours… (patientez)' : value ? 'Remplacer le fichier audio' : 'Choisir le fichier audio (MP3, audio WhatsApp…)'}
      </button>
      <input ref={input} type="file" accept={AUDIO_ACCEPT} className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
      {value && <audio controls preload="none" src={value} className="h-10 w-full" />}
      <Input id={id} placeholder="ou collez l’adresse d’un fichier audio" value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
    </div>
  );
}
