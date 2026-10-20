import { useState } from 'react';
import { Lock, Trash2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Select } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { passwordSchema } from '@/features/auth/schemas';
import { LOCALES, useI18n, type Locale } from '@/i18n';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { NotificationKind, PrivacySettings } from '@/types';

const PRIVACY_FIELDS: { key: keyof PrivacySettings; label: string; description?: string }[] = [
  { key: 'listedInDirectory', label: 'Apparaître dans l’annuaire', description: 'Si désactivé, seuls les responsables habilités vous voient.' },
  { key: 'showPhoto', label: 'Afficher ma photo' },
  { key: 'showCity', label: 'Afficher ma ville' },
  { key: 'showParish', label: 'Afficher ma paroisse' },
  { key: 'showSection', label: 'Afficher ma section' },
  { key: 'showFunction', label: 'Afficher ma fonction' },
  { key: 'showEmail', label: 'Afficher mon adresse e-mail aux membres', description: 'Désactivé par défaut.' },
  { key: 'showPhone', label: 'Afficher mon téléphone aux membres', description: 'Désactivé par défaut.' },
];
const NOTIF: { key: NotificationKind; label: string }[] = [
  { key: 'announcement', label: 'Nouvelles annonces' }, { key: 'event', label: 'Nouveaux événements' }, { key: 'schedule_change', label: 'Changements de programme' },
  { key: 'course', label: 'Nouvelles formations' }, { key: 'exam_result', label: 'Résultats d’examen' }, { key: 'certificate', label: 'Certificats disponibles' }, { key: 'project_update', label: 'Projets suivis' },
];

export default function SettingsPage() {
  const { profile, updateProfile, updatePassword, signOut } = useAuth();
  const { locale, setLocale } = useI18n();
  const { notify } = useToast();
  const [privacy, setPrivacy] = useState<PrivacySettings>(profile!.privacy);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(Object.fromEntries(NOTIF.map((n) => [n.key, true])));
  const [emailNotif, setEmailNotif] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const savePrivacy = async () => {
    setSaving(true);
    try { await updateProfile({ privacy }); notify(isDemoMode ? 'Préférences appliquées dans cet onglet (démonstration).' : 'Préférences de confidentialité enregistrées.'); } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); } finally { setSaving(false); }
  };
  const savePrefs = async () => {
    if (isDemoMode) { notify('Démonstration : préférences non enregistrées.', 'info'); return; }
    const { error } = await supabase!.from('notification_preferences').upsert(NOTIF.map((n) => ({ user_id: profile!.id, kind: n.key, in_app: prefs[n.key], email: emailNotif && prefs[n.key] })));
    if (error) notify(error.message, 'error'); else notify('Préférences de notification enregistrées.');
  };
  const changePwd = async () => {
    const r = passwordSchema.safeParse(pwd);
    if (!r.success) { setPwdErr(r.error.issues[0].message); return; }
    setPwdErr('');
    try { await updatePassword(pwd); setPwd(''); notify('Mot de passe modifié.'); } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); }
  };
  const requestDeletion = async () => {
    if (isDemoMode) { setDeleteOpen(false); notify('Démonstration : aucune demande envoyée.', 'info'); return; }
    const { error } = await supabase!.rpc('request_account_deletion');
    setDeleteOpen(false);
    if (error) notify(error.message, 'error'); else { notify('Demande de suppression enregistrée. Votre compte sera anonymisé.'); await signOut(); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-night">Paramètres</h1>
      <DemoInline />
      <Card><CardBody>
        <h2 className="font-display text-xl font-semibold text-night">Confidentialité</h2>
        <p className="mt-1 text-sm text-ink/60">Choisissez ce que les autres membres peuvent voir. Ces règles sont appliquées par la base de données.</p>
        <div className="mt-5 space-y-4">{PRIVACY_FIELDS.map((f) => <Checkbox key={f.key} label={f.label} description={f.description} checked={privacy[f.key]} onChange={(e) => setPrivacy({ ...privacy, [f.key]: e.target.checked })} />)}</div>
        <div className="mt-6 flex justify-end"><Button onClick={savePrivacy} loading={saving}>Enregistrer</Button></div>
      </CardBody></Card>

      <Card><CardBody>
        <h2 className="font-display text-xl font-semibold text-night">Notifications</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{NOTIF.map((n) => <Checkbox key={n.key} label={n.label} checked={prefs[n.key]} onChange={(e) => setPrefs({ ...prefs, [n.key]: e.target.checked })} />)}</div>
        <div className="mt-5 border-t border-night/10 pt-4"><Checkbox label="Recevoir aussi par e-mail" description="Nécessite la configuration d’un service d’envoi d’e-mails par l’administration." checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} /></div>
        <p className="mt-3 text-xs text-ink/50">Notifications push : prévues dans une version ultérieure (application installable).</p>
        <div className="mt-5 flex justify-end"><Button onClick={savePrefs}>Enregistrer</Button></div>
      </CardBody></Card>

      <Card><CardBody>
        <h2 className="font-display text-xl font-semibold text-night">Langue</h2>
        <div className="mt-3 max-w-xs"><Field label="Langue de l’interface">{(f) => <Select {...f} value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>{LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</Select>}</Field></div>
      </CardBody></Card>

      <Card><CardBody>
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-night"><Lock className="h-5 w-5 text-gold" />Sécurité</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Nouveau mot de passe" error={pwdErr} className="flex-1">{(f) => <Input {...f} type="password" autoComplete="new-password" value={pwd} onChange={(e) => setPwd(e.target.value)} />}</Field>
          <Button onClick={changePwd} disabled={!pwd}>Modifier</Button>
        </div>
      </CardBody></Card>

      <Card className="border-red-200"><CardBody>
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-red-700"><Trash2 className="h-5 w-5" />Supprimer mon compte</h2>
        <p className="mt-1 text-sm text-ink/65">Vos données personnelles seront supprimées ou anonymisées. Les contributions confirmées sont conservées de manière anonyme pour les obligations comptables.</p>
        <Button variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>Demander la suppression</Button>
      </CardBody></Card>
      <ConfirmDialog open={deleteOpen} danger title="Supprimer votre compte ?" message="Cette action est irréversible. Vous serez déconnecté(e)." confirmLabel="Oui, supprimer" onConfirm={requestDeletion} onCancel={() => setDeleteOpen(false)} />
    </div>
  );
}
