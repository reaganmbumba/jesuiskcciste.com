import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Music2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAsync } from '@/hooks/useAsync';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { snakify } from '@/utils/case';
import { writeAudit } from '@/services';
import { useAuth } from '@/features/auth/AuthContext';
import { loadRadioCatalog, radioSettingsOf, type RadioItem, type RadioSettings } from '@/features/radio/radio';
import { RADIO_NAME } from '@/features/radio/RadioUi';

/** Ce que la radio diffuse : chants, prédications, et titres retirés de l'antenne. */
export default function AdminRadio() {
  const { settings, setSettings } = useSiteSettings();
  const { profile } = useAuth();
  const { notify } = useToast();
  const [r, setR] = useState<RadioSettings>(() => radioSettingsOf(settings));
  const [saving, setSaving] = useState(false);
  const { data: catalog, loading } = useAsync(loadRadioCatalog, []);

  const toggleItem = (key: string, on: boolean) =>
    setR({ ...r, excluded: on ? r.excluded.filter((k) => k !== key) : [...r.excluded, key] });

  const save = async () => {
    setSaving(true);
    try {
      // On ne garde que les retraits de titres qui existent encore.
      const keys = new Set((catalog ?? []).map((i) => i.key));
      const radio = { ...r, excluded: catalog ? r.excluded.filter((k) => keys.has(k)) : r.excluded };
      const next = { ...settings, radio };
      if (!isDemoMode) {
        const { error } = await supabase!.from('site_settings').upsert({ key: 'public', value: snakify(next) });
        if (error) throw error;
      }
      setSettings(next);
      setR(radio);
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'settings.update', 'radio');
      notify(isDemoMode ? 'Réglages appliqués dans cet onglet (démonstration, non enregistrés).' : 'Réglages de la radio enregistrés.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : '';
      notify(msg ? `L’enregistrement a échoué : ${msg}` : 'L’enregistrement a échoué.', 'error');
    } finally { setSaving(false); }
  };

  const section = (kind: RadioItem['kind'], enabled: boolean) => {
    const list = (catalog ?? []).filter((i) => i.kind === kind);
    if (loading) return <Skeleton className="h-24" />;
    if (!list.length) return <p className="text-sm text-ink/60">{kind === 'song' ? 'Aucun chant à diffusion autorisée avec un fichier audio.' : 'Aucune prédication publiée avec un fichier audio.'}</p>;
    return (
      <ul className={enabled ? 'space-y-2' : 'pointer-events-none space-y-2 opacity-50'}>
        {list.map((i) => (
          <li key={i.key}><Checkbox label={i.title} description={i.subtitle} checked={!r.excluded.includes(i.key)} onChange={(e) => toggleItem(i.key, e.currentTarget.checked)} /></li>
        ))}
      </ul>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-night">{RADIO_NAME}</h1>
        <p className="mt-1 text-sm text-ink/65">La radio enchaîne en aléatoire les chants à diffusion autorisée (l’extrait public pour les chants en vente) et les prédications audio publiées. Choisissez ce qui passe à l’antenne. <Link to="/radio" className="font-semibold text-gold-700 hover:underline">Ouvrir la radio</Link></p>
      </div>
      <DemoInline />
      <Card><CardBody className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-night"><Music2 className="h-5 w-5 text-gold-600" />Chants</h2>
        <Checkbox label="Diffuser les chants" description="Décocher pour une radio uniquement de prédications." checked={r.songs} onChange={(e) => setR({ ...r, songs: e.currentTarget.checked })} />
        {section('song', r.songs)}
        <p className="text-xs text-ink/55">Un nouveau chant ajouté dans « Musique : chants et albums » passe à l’antenne automatiquement s’il a la diffusion autorisée.</p>
      </CardBody></Card>
      <Card><CardBody className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-night"><Mic className="h-5 w-5 text-gold-600" />Prédications</h2>
        <Checkbox label="Diffuser les prédications" description="Une prédication passe après chaque série de 3 chants." checked={r.sermons} onChange={(e) => setR({ ...r, sermons: e.currentTarget.checked })} />
        {section('sermon', r.sermons)}
        <p className="text-xs text-ink/55">Une nouvelle prédication publiée dans « Prédications audio » passe à l’antenne automatiquement.</p>
      </CardBody></Card>
      <div className="flex justify-end"><Button onClick={save} loading={saving}>Enregistrer les réglages</Button></div>
    </div>
  );
}
