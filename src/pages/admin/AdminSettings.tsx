import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { snakify } from '@/utils/case';
import { writeAudit } from '@/services';
import { useAuth } from '@/features/auth/AuthContext';

export default function AdminSettings() {
  const { settings, setSettings } = useSiteSettings();
  const { profile } = useAuth();
  const { notify } = useToast();
  const [s, setS] = useState(settings);
  const [saving, setSaving] = useState(false);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    const bad = s.socials.find((x) => x.url && !/^https:\/\//.test(x.url));
    if (bad) { notify('Les liens des réseaux sociaux doivent commencer par https://', 'error'); return; }
    setSaving(true);
    try {
      if (!isDemoMode) {
        const { error } = await supabase!.from('site_settings').upsert({ key: 'public', value: snakify(s) });
        if (error) throw error;
      }
      setSettings(s);
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'settings.update', 'site_settings');
      notify(isDemoMode ? 'Paramètres appliqués dans cet onglet (démonstration, non enregistrés).' : 'Paramètres enregistrés.');
    } catch (err) { notify(err instanceof Error ? err.message : 'Erreur', 'error'); } finally { setSaving(false); }
  };
  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-night">Paramètres de la plateforme</h1>
      <DemoInline />
      <Card><CardBody className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-night">Identité visuelle</h2>
        <Field label="Logo officiel autorisé (URL ou chemin)" hint="Ex. /images/logo-officiel.svg — à importer dans le stockage public. Vide = logotype JE SUIS KCCiste.">{(p) => <Input {...p} value={s.officialLogoUrl} onChange={(e) => setS({ ...s, officialLogoUrl: e.target.value })} />}</Field>
        <Field label="Photo communautaire de la page d’accueil" hint="Photographie autorisée (droit à l’image des personnes représentées).">{(p) => <Input {...p} value={s.heroImageUrl} onChange={(e) => setS({ ...s, heroImageUrl: e.target.value })} />}</Field>
      </CardBody></Card>
      <Card><CardBody className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-night">Contact officiel</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail">{(p) => <Input {...p} type="email" value={s.contact.email} onChange={(e) => setS({ ...s, contact: { ...s.contact, email: e.target.value } })} />}</Field>
          <Field label="Téléphone">{(p) => <Input {...p} type="tel" value={s.contact.phone} onChange={(e) => setS({ ...s, contact: { ...s.contact, phone: e.target.value } })} />}</Field>
        </div>
        <Field label="Adresse">{(p) => <Input {...p} value={s.contact.address} onChange={(e) => setS({ ...s, contact: { ...s.contact, address: e.target.value } })} />}</Field>
      </CardBody></Card>
      <Card><CardBody className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-night">Réseaux sociaux officiels</h2>
        {s.socials.map((x, i) => (
          <div key={i} className="flex gap-2">
            <Input aria-label="Nom du réseau" placeholder="Nom" value={x.label} onChange={(e) => setS({ ...s, socials: s.socials.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)) })} className="w-40" />
            <Input aria-label="Lien" placeholder="https://…" value={x.url} onChange={(e) => setS({ ...s, socials: s.socials.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)) })} />
            <button type="button" onClick={() => setS({ ...s, socials: s.socials.filter((_, j) => j !== i) })} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl hover:bg-red-50" aria-label="Retirer"><Trash2 className="h-4 w-4 text-red-600" /></button>
          </div>
        ))}
        <Button variant="outline" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setS({ ...s, socials: [...s.socials, { label: '', url: '' }] })}>Ajouter un réseau</Button>
      </CardBody></Card>
      <Card><CardBody className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-night">Présentation officielle de l’Église</h2>
        <Field label="Texte validé par les responsables compétents" hint="Affiché sur la page « À propos ». Aucun texte n’est généré automatiquement.">{(p) => <Textarea {...p} rows={8} value={s.churchPresentation} onChange={(e) => setS({ ...s, churchPresentation: e.target.value })} />}</Field>
      </CardBody></Card>
      <div className="flex justify-end"><Button type="submit" loading={saving}>Enregistrer les paramètres</Button></div>
    </form>
  );
}
