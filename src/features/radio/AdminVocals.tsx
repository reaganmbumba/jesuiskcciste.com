import { useRef, useState, type FormEvent } from 'react';
import { Check, FileAudio, MessageCircle, Mic, Play, RadioTower, Trash2, X } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { cn } from '@/utils/format';
import { audioFormat, formatSeconds } from '@/features/debates/debates';
import { useRadio } from './RadioContext';
import { deleteVocal, isVocalFresh, listAllVocals, sendVocal, updateVocal, VOCAL_DAYS, VOCAL_MAX_BYTES, vocalUrl, type RadioVocal } from './vocals';

const when = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const errMsg = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '');

/**
 * Vocaux des auditeurs dans /admin/radio : écouter, valider ou refuser ceux
 * envoyés depuis le site, ajouter ceux reçus sur WhatsApp, et les jouer à
 * l'antenne pendant le direct.
 */
export function AdminVocals() {
  const { notify } = useToast();
  const radio = useRadio();
  const { data, loading, error, reload } = useAsync(listAllVocals, []);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const list = data ?? [];
  const pending = list.filter((v) => v.status === 'pending');
  const approved = list.filter((v) => v.status === 'approved');
  const rejected = list.filter((v) => v.status === 'rejected');
  const shown = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected;

  const act = async (v: RadioVocal, fn: () => Promise<void>, ok: string) => {
    setBusy(v.id);
    try { await fn(); notify(ok); reload(); } catch (e) { notify(`L’action a échoué${errMsg(e) ? ` : ${errMsg(e)}` : '.'}`, 'error'); } finally { setBusy(null); }
  };

  const tabs = [
    { id: 'pending' as const, label: 'À écouter', n: pending.length },
    { id: 'approved' as const, label: 'Validés', n: approved.length },
    { id: 'rejected' as const, label: 'Refusés', n: rejected.length },
  ];

  return (
    <Card className={pending.length ? 'ring-2 ring-gold' : ''}><CardBody className="space-y-4">
      <h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-night"><Mic className="h-5 w-5 text-gold-600" />Vocaux des auditeurs
        {pending.length > 0 && <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-night">{pending.length} à écouter</span>}
      </h2>
      <p className="text-sm text-ink/65">Les auditeurs envoient un vocal depuis la page Radio. Rien ne passe à l’antenne avant votre validation. Un vocal validé passe tout seul entre les chants pendant {VOCAL_DAYS} jours ; pendant le direct, appuyez sur « Jouer à l’antenne » sur l’ordinateur de diffusion pour le faire entendre à tous.</p>

      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-2xl bg-mist p-1">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={cn('rounded-xl px-2 py-2 text-sm font-semibold transition', tab === t.id ? 'bg-white text-night shadow-sm' : 'text-ink/60')}>
            {t.label} ({t.n})
          </button>
        ))}
      </div>

      {loading && !data ? <Skeleton className="h-24" /> : error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">Les vocaux ne se chargent pas. Si c’est la première fois, collez d’abord le fichier SQL « vocaux-radio-a-coller-dans-supabase.sql » dans Supabase.</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-ink/60">{tab === 'pending' ? 'Aucun vocal en attente.' : tab === 'approved' ? 'Aucun vocal validé.' : 'Aucun vocal refusé.'}</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((v) => (
            <li key={v.id} className="space-y-2 rounded-2xl border border-night/[0.08] p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-night">{v.authorName}{v.place && <span className="font-normal text-ink/60"> · {v.place}</span>}</p>
                <p className="text-xs text-ink/55">
                  {v.source === 'whatsapp' ? <span className="mr-1 inline-flex items-center gap-1 text-emerald-700"><MessageCircle className="h-3 w-3" />WhatsApp</span> : null}
                  {when(v.createdAt)}{v.audioSeconds != null ? ` · ${formatSeconds(v.audioSeconds)}` : ''}
                </p>
              </div>
              {v.note && <p className="rounded-xl bg-mist px-3 py-2 text-sm text-ink/80">« {v.note} »</p>}
              <audio src={vocalUrl(v.audioPath)} controls preload="none" className="w-full" />
              {v.status === 'approved' && (
                <p className="text-xs text-ink/55">
                  {isVocalFresh(v) ? 'Dans la radio automatique.' : `Plus dans la radio automatique (validé il y a plus de ${VOCAL_DAYS} jours).`}
                  {v.airedAt ? ` Joué en direct le ${when(v.airedAt)}.` : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {v.status !== 'approved' && <Button size="sm" icon={<Check className="h-4 w-4" />} loading={busy === v.id} onClick={() => act(v, () => updateVocal(v, { status: 'approved' }), 'Vocal validé : il passe à l’antenne.')}>Valider</Button>}
                {v.status === 'approved' && <PlayOnAir vocal={v} onPlay={() => { if (radio.active && radio.playing && !radio.onLive) radio.toggle(); }} onAired={() => act(v, () => updateVocal(v, { airedAt: new Date().toISOString() }), 'Noté : passé à l’antenne.')} />}
                {v.status === 'pending' && <Button size="sm" variant="outline" icon={<X className="h-4 w-4" />} disabled={busy === v.id} onClick={() => act(v, () => updateVocal(v, { status: 'rejected' }), 'Vocal refusé.')}>Refuser</Button>}
                {v.status === 'approved' && <Button size="sm" variant="outline" icon={<X className="h-4 w-4" />} disabled={busy === v.id} onClick={() => act(v, () => updateVocal(v, { status: 'rejected' }), 'Vocal retiré de l’antenne.')}>Retirer de l’antenne</Button>}
                <Button size="sm" variant="ghost" icon={<Trash2 className="h-4 w-4" />} disabled={busy === v.id} onClick={() => { if (window.confirm(`Supprimer définitivement le vocal de ${v.authorName} ?`)) void act(v, () => deleteVocal(v), 'Vocal supprimé.'); }}>Supprimer</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddWhatsappVocal onAdded={reload} />
    </CardBody></Card>
  );
}

/** Joue le vocal sur cet ordinateur (le son part dans l'émission par la table de mixage), puis le note « passé à l'antenne ». */
function PlayOnAir({ vocal, onPlay, onAired }: { vocal: RadioVocal; onPlay: () => void; onAired: () => void }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const play = () => {
    onPlay();
    const a = ref.current ?? new Audio(vocalUrl(vocal.audioPath));
    ref.current = a;
    a.onended = () => { setPlaying(false); onAired(); };
    a.currentTime = 0;
    void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const stop = () => { ref.current?.pause(); setPlaying(false); };
  return playing
    ? <Button size="sm" variant="danger" icon={<X className="h-4 w-4" />} onClick={stop}>Arrêter</Button>
    : <Button size="sm" icon={<RadioTower className="h-4 w-4" />} onClick={play}>Jouer à l’antenne</Button>;
}

/** Ajoute une note vocale reçue sur WhatsApp (enregistrée sur le téléphone ou l'ordinateur), validée d'office. */
function AddWhatsappVocal({ onAdded }: { onAdded: () => void }) {
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return notify('Indiquez le nom de l’auditeur.', 'error');
    if (!file) return notify('Choisissez la note vocale reçue sur WhatsApp.', 'error');
    if (!audioFormat(file.type, file.name)) return notify('Ce fichier n’est pas un audio reconnu (.opus, .ogg, .m4a, .mp3…).', 'error');
    if (file.size > VOCAL_MAX_BYTES) return notify('Le fichier dépasse 10 Mo.', 'error');
    setSaving(true);
    try {
      await sendVocal({ authorName: name, place, audio: file, audioName: file.name, source: 'whatsapp' });
      notify('Vocal WhatsApp ajouté et validé.');
      setName(''); setPlace(''); setFile(null); setOpen(false);
      onAdded();
    } catch (err) {
      notify(`L’ajout a échoué${errMsg(err) ? ` : ${errMsg(err)}` : '.'}`, 'error');
    } finally { setSaving(false); }
  }

  if (!open) return <Button variant="outline" icon={<MessageCircle className="h-4 w-4" />} onClick={() => setOpen(true)}>Ajouter un vocal reçu sur WhatsApp</Button>;
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-emerald-50/60 p-4">
      <p className="text-sm font-semibold text-night">Vocal reçu sur WhatsApp</p>
      <p className="text-xs text-ink/60">Dans WhatsApp, enregistrez la note vocale (sur téléphone : appui long puis Partager → Enregistrer dans Fichiers ; sur ordinateur : flèche → Télécharger), puis choisissez-la ici.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom de l’auditeur" required>{(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />}</Field>
        <Field label="Paroisse ou ville">{(p) => <Input {...p} value={place} onChange={(e) => setPlace(e.target.value)} maxLength={120} />}</Field>
      </div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-night/15 bg-white px-4 py-4 text-sm font-semibold text-night hover:border-gold">
        <FileAudio className="h-5 w-5 text-gold-600" aria-hidden />{file ? file.name : 'Choisir la note vocale (.opus, .ogg, .m4a, .mp3…)'}
        <input type="file" accept="audio/*,.opus,.ogg,.m4a,.mp3,.aac,.wav,.amr,.3gp" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <div className="flex gap-2">
        <Button type="submit" loading={saving} icon={<Play className="h-4 w-4" />}>Ajouter et valider</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
      </div>
    </form>
  );
}
