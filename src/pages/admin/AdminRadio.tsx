import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Music2, Newspaper, Phone, Radio } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input } from '@/components/ui/Form';
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
import { isLiveOn, loadRadioCatalog, newCallRoomUrl, parseCallUrl, parseStreamUrl, radioSettingsOf, type RadioItem, type RadioSettings } from '@/features/radio/radio';
import { LiveBadge, RADIO_NAME } from '@/features/radio/RadioUi';
import { JITSI_DOMAIN } from '@/features/meetings/meetings';

/** Ce que la radio diffuse : chants, prédications, et titres retirés de l'antenne. */
export default function AdminRadio() {
  const { settings, setSettings } = useSiteSettings();
  const { profile } = useAuth();
  const { notify } = useToast();
  const [r, setR] = useState<RadioSettings>(() => radioSettingsOf(settings));
  const [saving, setSaving] = useState(false);
  const { data: catalog, loading } = useAsync(loadRadioCatalog, []);
  const on = isLiveOn(radioSettingsOf(settings).live);

  const toggleItem = (key: string, on: boolean) =>
    setR({ ...r, excluded: on ? r.excluded.filter((k) => k !== key) : [...r.excluded, key] });

  const save = async (patch: Partial<RadioSettings['live']> = {}) => {
    let live: RadioSettings['live'];
    try {
      const url = parseStreamUrl(r.live.url) ?? '';
      const callUrl = parseCallUrl(r.live.callUrl) ?? '';
      live = { ...r.live, url, callUrl, title: r.live.title.trim(), ...patch };
    } catch (e) {
      notify((e as Error).message === 'call'
        ? 'Lien d’appel non reconnu : collez un lien https (salle Jitsi…) ou un numéro WhatsApp avec l’indicatif, par exemple +243 840 238 592.'
        : 'Adresse du flux non reconnue : elle doit commencer par https:// (copiez le lien d’écoute donné par Caster.fm ou Zeno.fm).', 'error');
      return;
    }
    if (live.onAir && !live.url) { notify('Indiquez d’abord l’adresse du flux audio (Caster.fm, Zeno.fm…), puis passez en direct.', 'error'); return; }
    setSaving(true);
    try {
      // On ne garde que les retraits de titres qui existent encore.
      const keys = new Set((catalog ?? []).map((i) => i.key));
      const radio = { ...r, live, excluded: catalog ? r.excluded.filter((k) => keys.has(k)) : r.excluded };
      const next = { ...settings, radio };
      if (!isDemoMode) {
        const { error } = await supabase!.from('site_settings').upsert({ key: 'public', value: snakify(next) });
        if (error) throw error;
      }
      setSettings(next);
      setR(radio);
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'settings.update', 'radio');
      notify(isDemoMode ? 'Réglages appliqués dans cet onglet (démonstration, non enregistrés).'
        : patch.onAir === true ? 'Vous êtes en direct : les auditeurs basculent sur l’émission dans la minute.'
          : patch.onAir === false ? 'Direct terminé : la radio reprend les chants et prédications.' : 'Réglages de la radio enregistrés.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : '';
      notify(msg ? `L’enregistrement a échoué : ${msg}` : 'L’enregistrement a échoué.', 'error');
    } finally { setSaving(false); }
  };

  const section = (kind: RadioItem['kind'], enabled: boolean) => {
    const list = (catalog ?? []).filter((i) => i.kind === kind);
    if (loading) return <Skeleton className="h-24" />;
    if (!list.length) return <p className="text-sm text-ink/60">{kind === 'song' ? 'Aucun chant à diffusion autorisée avec un fichier audio.' : kind === 'news' ? 'Aucun journal de moins de 7 jours.' : 'Aucune prédication publiée avec un fichier audio.'}</p>;
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
      <Card className={on ? 'ring-2 ring-red-500' : ''}><CardBody className="space-y-4">
        <h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-night"><Radio className="h-5 w-5 text-gold-600" />Émission en direct {on && <LiveBadge />}</h2>
        <p className="text-sm text-ink/65">Diffusez avec votre ordinateur vers un flux audio gratuit (Caster.fm ou Zeno.fm), puis appuyez sur « Passer en direct » : la radio de chaque auditeur bascule sur votre émission dans la minute, et revient aux chants quand vous terminez (ou seule au bout de 6 h).</p>
        <Field label="Adresse du flux audio" hint="Donnée par votre hébergeur de radio : sur Caster.fm, l’adresse « Stream URL » ou « Direct link » ; sur Zeno.fm, la « Stream URL ». Elle doit commencer par https://. À remplir une seule fois.">{(p) => <Input {...p} inputMode="url" placeholder="https://…" value={r.live.url} onChange={(e) => setR({ ...r, live: { ...r.live, url: e.target.value } })} />}</Field>
        <Field label="Nom de l’émission" hint="Affiché aux auditeurs, par exemple « La voix du KCC avec Reagan ».">{(p) => <Input {...p} maxLength={120} value={r.live.title} onChange={(e) => setR({ ...r, live: { ...r.live, title: e.target.value } })} />}</Field>
        <Field label="Appels des auditeurs (facultatif)" hint="Lien d’une salle d’appel (bouton ci-dessous) ou numéro WhatsApp avec l’indicatif. Pendant le direct, le bouton « Appeler l’émission » s’affiche sur la radio. Vide = pas d’appels.">{(p) => (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input {...p} placeholder="https://meet.jit.si/… ou +243…" value={r.live.callUrl} onChange={(e) => setR({ ...r, live: { ...r.live, callUrl: e.target.value } })} />
            <Button type="button" variant="outline" icon={<Phone className="h-4 w-4" />} onClick={() => setR({ ...r, live: { ...r.live, callUrl: newCallRoomUrl(JITSI_DOMAIN) } })}>Créer une salle d’appel</Button>
          </div>
        )}</Field>
        {r.live.callUrl && /^https:\/\//.test(r.live.callUrl) && !/wa\.me/.test(r.live.callUrl) && <p className="text-xs text-ink/60">Avant l’émission, ouvrez vous-même <a href={r.live.callUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-700 hover:underline">la salle d’appel</a> sur l’ordinateur de diffusion (connexion Google demandée une fois par Jitsi) : les auditeurs qui appellent vous y rejoignent.</p>}
        <div className="flex flex-wrap gap-3">
          {on
            ? <Button variant="danger" onClick={() => save({ onAir: false })} loading={saving}>Terminer le direct</Button>
            : <Button onClick={() => save({ onAir: true, startedAt: new Date().toISOString() })} loading={saving} icon={<Radio className="h-4 w-4" />}>Passer en direct</Button>}
        </div>
      </CardBody></Card>
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
      <Card><CardBody className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-night"><Newspaper className="h-5 w-5 text-gold-600" />Journal parlé</h2>
        <Checkbox label="Diffuser le journal" description="Le journal de la semaine ouvre chaque tour de radio, avant les chants et les prédications." checked={r.news} onChange={(e) => setR({ ...r, news: e.currentTarget.checked })} />
        {section('news', r.news)}
      </CardBody></Card>
      <div className="flex justify-end"><Button onClick={() => save()} loading={saving}>Enregistrer les réglages</Button></div>
    </div>
  );
}
