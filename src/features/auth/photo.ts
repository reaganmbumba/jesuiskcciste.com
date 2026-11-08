/**
 * Photo de profil obligatoire : réduction côté navigateur (JPEG ~640 px) et
 * mise de côté pendant l'inscription, le temps que le compte soit confirmé
 * (le stockage n'accepte l'envoi qu'une fois connecté).
 */

const PENDING_KEY = (email: string) => `kcc.photo.inscription.${email.trim().toLowerCase()}`;

/** Réduit l'image (photo de téléphone de plusieurs Mo) en JPEG léger. */
export async function shrinkPhoto(file: File, max = 640): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('Choisissez une photo (JPG, PNG…).');
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!blob) throw new Error('conversion');
    return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
  } catch {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 2 * 1024 * 1024) return file;
    throw new Error('Cette photo ne peut pas être lue. Essayez une autre photo (JPG ou PNG).');
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export async function dataUrlToFile(dataUrl: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
}

export function savePendingPhoto(email: string, dataUrl: string) {
  try { localStorage.setItem(PENDING_KEY(email), dataUrl); } catch { /* stockage plein ou bloqué : la photo sera redemandée */ }
}

export function readPendingPhoto(email?: string | null): string | null {
  if (!email) return null;
  try { return localStorage.getItem(PENDING_KEY(email)); } catch { return null; }
}

export function clearPendingPhoto(email?: string | null) {
  if (!email) return;
  try { localStorage.removeItem(PENDING_KEY(email)); } catch { /* ignore */ }
}
