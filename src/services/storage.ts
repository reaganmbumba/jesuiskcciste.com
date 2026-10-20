import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';

const MAX_AVATAR = 2 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Téléversement de la photo de profil dans le bucket « avatars ».
 * La politique de stockage n'autorise l'écriture que dans le dossier <user_id>/.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Format non pris en charge (JPG, PNG ou WebP).');
  if (file.size > MAX_AVATAR) throw new Error('Image trop lourde (2 Mo maximum).');
  if (isDemoMode) return URL.createObjectURL(file); // aperçu local uniquement
  const path = `${userId}/avatar-${Date.now()}.${file.type.split('/')[1]}`;
  const { error } = await supabase!.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return supabase!.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

/** Documents réservés : URL signée à durée limitée depuis un bucket privé. */
export async function getPrivateDocumentUrl(path: string, expiresInSeconds = 300): Promise<string> {
  if (isDemoMode) throw new Error('Démonstration : aucun fichier privé n’est disponible.');
  const { data, error } = await supabase!.storage.from('documents-private').createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
