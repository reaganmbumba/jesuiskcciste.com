import { useState, type FormEvent } from 'react';
import { Camera } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Misc';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { parishesRepo, sectionsRepo } from '@/services';
import { uploadAvatar } from '@/services/storage';

export default function MyProfilePage() {
  const { profile, updateProfile } = useAuth();
  const { notify } = useToast();
  const p = profile!;
  const [form, setForm] = useState({ firstName: p.firstName, lastName: p.lastName, middleName: p.middleName ?? '', phone: p.phone ?? '', country: p.country, city: p.city, parishId: p.parishId ?? '', sectionId: p.sectionId ?? '' });
  const [saving, setSaving] = useState(false);
  const { data } = useAsync(() => Promise.all([parishesRepo.all(), sectionsRepo.all()]), []);
  const [parishes = [], sections = []] = data ?? [];
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) { notify('Nom et prénom sont requis.', 'error'); return; }
    setSaving(true);
    try {
      await updateProfile({ ...form, middleName: form.middleName || null, phone: form.phone || null, parishId: form.parishId || null, sectionId: form.sectionId || null });
      notify(profile && profile.id.startsWith('demo') ? 'Profil mis à jour dans cet onglet (démonstration, non enregistré).' : 'Profil enregistré.');
    } catch (err) { notify(err instanceof Error ? err.message : 'Erreur', 'error'); } finally { setSaving(false); }
  };
  const onAvatar = async (file?: File) => {
    if (!file) return;
    try { const url = await uploadAvatar(p.id, file); await updateProfile({ avatarUrl: url }); notify('Photo mise à jour.'); } catch (err) { notify(err instanceof Error ? err.message : 'Erreur', 'error'); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-night">Mon profil</h1>
      <DemoInline />
      <Card><CardBody className="flex items-center gap-5">
        <Avatar person={p} url={p.avatarUrl} size={80} />
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-night/15 px-4 py-2 text-sm font-semibold hover:border-gold focus-within:ring-2 focus-within:ring-gold">
            <Camera className="h-4 w-4" /> Changer la photo
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onAvatar(e.target.files?.[0])} />
          </label>
          <p className="mt-1 text-xs text-ink/55">Facultatif · JPG, PNG ou WebP · 2 Mo maximum</p>
        </div>
      </CardBody></Card>
      <Card><CardBody>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" required>{(f) => <Input {...f} value={form.firstName} onChange={set('firstName')} />}</Field>
          <Field label="Nom" required>{(f) => <Input {...f} value={form.lastName} onChange={set('lastName')} />}</Field>
          <Field label="Postnom">{(f) => <Input {...f} value={form.middleName} onChange={set('middleName')} />}</Field>
          <Field label="Téléphone">{(f) => <Input {...f} type="tel" value={form.phone} onChange={set('phone')} />}</Field>
          <Field label="Pays" required>{(f) => <Input {...f} value={form.country} onChange={set('country')} />}</Field>
          <Field label="Ville" required>{(f) => <Input {...f} value={form.city} onChange={set('city')} />}</Field>
          <Field label="Paroisse" hint="Un changement de paroisse est soumis à validation.">{(f) => <Select {...f} value={form.parishId} onChange={(e) => setForm((x) => ({ ...x, parishId: e.target.value, sectionId: '' }))}><option value="">—</option>{parishes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</Select>}</Field>
          <Field label="Section">{(f) => <Select {...f} value={form.sectionId} onChange={set('sectionId')}><option value="">—</option>{sections.filter((s) => s.parishId === form.parishId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>}</Field>
          <Field label="Adresse e-mail" hint="Modifiable depuis les paramètres de sécurité.">{(f) => <Input {...f} value={p.email ?? ''} disabled />}</Field>
          <Field label="Fonction" hint="Attribuée par un responsable après validation.">{(f) => <Input {...f} value={p.functionTitle ?? 'Aucune'} disabled />}</Field>
          <div className="sm:col-span-2 flex justify-end"><Button type="submit" loading={saving}>Enregistrer</Button></div>
        </form>
      </CardBody></Card>
    </div>
  );
}
