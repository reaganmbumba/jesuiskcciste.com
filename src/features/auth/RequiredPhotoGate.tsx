import { useEffect, useState } from 'react';
import { Check, LogOut } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { uploadAvatar } from '@/services/storage';
import { useI18n } from '@/i18n';
import { useAuth } from './AuthContext';
import { PhotoPicker } from './PhotoPicker';
import { clearPendingPhoto, dataUrlToFile, readPendingPhoto } from './photo';

const NOOP = () => undefined;

/**
 * Photo obligatoire : un compte connecté sans photo doit en ajouter une.
 * La photo choisie à l'inscription est envoyée automatiquement à la première connexion.
 */
export function RequiredPhotoGate() {
  const { profile, updateProfile, signOut } = useAuth();
  const { tx } = useI18n();
  const { notify } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoTried, setAutoTried] = useState<string | null>(null);
  const missing = !!profile && !profile.avatarUrl;

  // Photo prise pendant l'inscription sur cet appareil : envoyée sans rien redemander.
  useEffect(() => {
    if (!missing || !profile || autoTried === profile.id) return;
    setAutoTried(profile.id);
    const pending = readPendingPhoto(profile.email);
    if (!pending) return;
    setSaving(true);
    dataUrlToFile(pending)
      .then((f) => uploadAvatar(profile.id, f))
      .then((url) => updateProfile({ avatarUrl: url }))
      .then(() => clearPendingPhoto(profile.email))
      .catch(() => setPreview(pending))
      .finally(() => setSaving(false));
  }, [missing, profile, autoTried, updateProfile]);

  if (!missing || (saving && !file)) return null;
  const save = async () => {
    if (!profile) return;
    let f = file;
    if (!f && preview?.startsWith('data:')) f = await dataUrlToFile(preview);
    if (!f) { setError(tx('Ajoutez une photo pour continuer.', 'Add a photo to continue.', 'Adicione uma fotografia para continuar.')); return; }
    setSaving(true);
    try {
      const url = await uploadAvatar(profile.id, f);
      await updateProfile({ avatarUrl: url });
      clearPendingPhoto(profile.email);
      notify(tx('Photo enregistrée.', 'Photo saved.', 'Fotografia guardada.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open closable={false} onClose={NOOP} title={tx('Ajoutez votre photo', 'Add your photo', 'Adicione a sua fotografia')}
      footer={<>
        <Button variant="ghost" onClick={() => void signOut()} icon={<LogOut className="h-4 w-4" />}>{tx('Déconnexion', 'Log out', 'Sair')}</Button>
        <Button onClick={() => void save()} loading={saving} icon={<Check className="h-4 w-4" />}>{tx('Enregistrer', 'Save', 'Guardar')}</Button>
      </>}>
      <p className="mb-4 text-sm text-ink/75">{tx('Chaque KCCiste inscrit doit avoir sa photo. Prenez-vous en photo maintenant ou choisissez une photo dans votre galerie.', 'Every registered KCCiste must have a photo. Take a picture now or choose one from your gallery.', 'Cada KCCista inscrito deve ter a sua fotografia. Tire uma agora ou escolha uma da galeria.')}</p>
      <PhotoPicker value={preview} error={error} onChange={(f, url) => { setFile(f); setPreview(url); setError(null); }} />
    </Modal>
  );
}
