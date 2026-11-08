import { useState } from 'react';
import { Camera, ImagePlus, UserRound } from 'lucide-react';
import { useI18n } from '@/i18n';
import { fileToDataUrl, shrinkPhoto } from './photo';

/** Choix de la photo : appareil photo du téléphone ou galerie. */
export function PhotoPicker({ value, onChange, error }: { value: string | null; onChange: (file: File, preview: string) => void; error?: string | null }) {
  const { tx } = useI18n();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    setLocalError(null);
    try {
      const small = await shrinkPhoto(f);
      onChange(small, await fileToDataUrl(small));
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const btn = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-night/15 bg-white px-4 py-2.5 text-sm font-semibold text-night hover:border-gold focus-within:ring-2 focus-within:ring-gold';
  const msg = localError ?? error;
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-night">{tx('Photo de vous', 'Your photo', 'A sua fotografia')} <span className="text-red-600">*</span></p>
      <div className="flex items-center gap-4">
        <span className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full ${msg ? 'ring-2 ring-red-400' : 'ring-1 ring-night/10'} bg-mist`}>
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-ink/30" />}
        </span>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <label className={btn}><Camera className="h-4 w-4" />{busy ? '…' : tx('Prendre une photo', 'Take a photo', 'Tirar fotografia')}
            <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          <label className={btn}><ImagePlus className="h-4 w-4" />{tx('Galerie', 'Gallery', 'Galeria')}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </div>
      </div>
      <p className={`mt-1.5 text-xs ${msg ? 'text-red-600' : 'text-ink/55'}`} role={msg ? 'alert' : undefined}>{msg ?? tx('Obligatoire : une photo nette de votre visage.', 'Required: a clear photo of your face.', 'Obrigatória: uma fotografia nítida do seu rosto.')}</p>
    </div>
  );
}
