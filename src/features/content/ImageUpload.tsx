import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { uploadSiteImage } from './siteContent';

/**
 * Choix d'une photo depuis le téléphone ou l'ordinateur : elle est envoyée
 * tout de suite dans le stockage public et son adresse remplit le champ.
 * On peut aussi coller une adresse d'image existante.
 */
export function ImageUpload({ value, onChange, folder, id }: { value: string; onChange: (url: string, size?: { w: number; h: number }) => void; folder: string; id?: string }) {
  const { notify } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const r = await uploadSiteImage(file, folder);
      onChange(r.url, { w: r.w, h: r.h });
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Envoi de la photo impossible.', 'error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <span className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-mist ring-1 ring-night/10">
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange('')} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-red-700 shadow" aria-label="Retirer la photo"><X className="h-3.5 w-3.5" /></button>
          </span>
        ) : (
          <span className="grid h-20 w-28 shrink-0 place-items-center rounded-xl bg-mist text-ink/40 ring-1 ring-night/10"><ImagePlus className="h-6 w-6" /></span>
        )}
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-night/12 bg-white px-4 py-2 text-sm font-semibold text-night hover:border-gold-400 hover:bg-gold-50 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {busy ? 'Envoi…' : value ? 'Changer la photo' : 'Choisir une photo'}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
      </div>
      <Input id={id} placeholder="ou collez l’adresse d’une image (https://…)" value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
    </div>
  );
}
