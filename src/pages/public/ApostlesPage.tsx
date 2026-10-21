import { useMemo, useState, type FormEvent } from 'react';
import { Camera, CheckCircle2, ImagePlus, MapPin, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { apostlesRepo, sortApostles, submitApostlePhoto } from '@/features/apostles/apostles';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import type { Apostle, ApostleStatus } from '@/types';

type Filter = ApostleStatus | 'all';

const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Les Révérends Apôtres de l'Église, en vie et décédés, avec leur photo de profil. */
export default function ApostlesPage() {
  const { tx } = useI18n();
  const { data = [], loading, error, reload } = useAsync(() => apostlesRepo.all().then(sortApostles), []);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [proposeFor, setProposeFor] = useState<Apostle | null>(null);

  const shown = useMemo(() => {
    const s = norm(q.trim());
    return data.filter((a) => (filter === 'all' || a.status === filter) && (!s || norm(`${a.fullName} ${a.place ?? ''}`).includes(s)));
  }, [data, filter, q]);
  const missing = data.filter((a) => !a.photoUrl).length;

  const filters: [Filter, string][] = [
    ['all', tx('Tous', 'All', 'Todos')],
    ['living', tx('En vie', 'Living', 'Vivos')],
    ['deceased', tx('Décédés', 'Deceased', 'Falecidos')],
  ];

  return (
    <>
      <PageHeader eyebrow={tx('Serviteurs de l’Église', 'Servants of the Church', 'Servos da Igreja')} title={tx('Les Révérends Apôtres', 'The Reverend Apostles', 'Os Reverendos Apóstolos')}
        description={tx('Tous les Révérends Apôtres de l’Église Bon Nouveau Message, ceux qui sont en vie et ceux qui sont décédés. Vous avez la photo d’un apôtre ? Envoyez-la : elle sera ajoutée après vérification.', 'All the Reverend Apostles of the Église Bon Nouveau Message, living and deceased. Do you have a photo of an apostle? Send it: it will be added after review.', 'Todos os Reverendos Apóstolos da Église Bon Nouveau Message, vivos e falecidos. Tem a foto de um apóstolo? Envie-a: será adicionada após verificação.')} />

      <section className="container-page py-14">
        <DemoInline>{tx('Démonstration : noms d’exemple. La vraie liste apparaît dès qu’elle est saisie par l’administration.', 'Demo: sample names. The real list appears once the administration enters it.', 'Demonstração: nomes de exemplo. A lista real aparece quando a administração a introduzir.')}</DemoInline>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label={tx('Filtrer', 'Filter', 'Filtrar')} className="flex flex-wrap gap-2">
            {filters.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === k ? 'border-night bg-night text-white' : 'border-night/10 bg-white text-ink/70 hover:border-gold'}`}>{label}</button>
            ))}
          </div>
          <label className="relative block sm:w-72">
            <span className="sr-only">{tx('Rechercher un apôtre', 'Search an apostle', 'Procurar um apóstolo')}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
            <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('Nom ou lieu…', 'Name or place…', 'Nome ou local…')} className="pl-10" />
          </label>
        </div>

        {missing > 0 && !loading && (
          <p className="mb-8 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold-50 px-4 py-3 text-sm text-ink/80">
            <Camera className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
            <span>{tx(`${missing} apôtre(s) n’ont pas encore de photo. Si vous en avez une, touchez « Envoyer une photo » sous son nom.`, `${missing} apostle(s) have no photo yet. If you have one, tap “Send a photo” under their name.`, `${missing} apóstolo(s) ainda não têm foto. Se tiver uma, toque em «Enviar uma foto» por baixo do nome.`)}</span>
          </p>
        )}

        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}</div>
        ) : !shown.length ? (
          <EmptyState title={data.length ? tx('Aucun apôtre ne correspond.', 'No apostle matches.', 'Nenhum apóstolo corresponde.') : tx('La liste des apôtres sera bientôt publiée.', 'The list of apostles will be published soon.', 'A lista dos apóstolos será publicada em breve.')} />
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((a) => <ApostleCard key={a.id} apostle={a} onPropose={() => setProposeFor(a)} />)}
          </ul>
        )}
      </section>

      <ProposePhotoDialog apostle={proposeFor} onClose={() => setProposeFor(null)} />
    </>
  );
}

function ApostleCard({ apostle: a, onPropose }: { apostle: Apostle; onPropose: () => void }) {
  const { tx } = useI18n();
  const deceased = a.status === 'deceased';
  const years = a.birthYear || a.deathYear ? `${a.birthYear ?? '…'} – ${a.deathYear ?? (deceased ? '…' : '')}`.trim() : null;
  return (
    <li id={`apotre-${a.id}`} className="flex scroll-mt-32 flex-col items-center rounded-3xl border border-night/[0.06] bg-white p-4 text-center shadow-soft sm:p-5">
      <div className="relative">
        {a.photoUrl ? (
          <img src={a.photoUrl} alt={a.fullName} loading="lazy" width={128} height={128} className={`h-28 w-28 rounded-full object-cover ring-4 sm:h-32 sm:w-32 ${deceased ? 'ring-night/15 grayscale-[35%]' : 'ring-gold/40'}`} />
        ) : (
          <span className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-night to-night-500 font-display text-3xl font-semibold text-gold ring-4 ring-night/10 sm:h-32 sm:w-32" aria-hidden>{initialsOf(a.fullName)}</span>
        )}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-600">{a.title}</p>
      <h2 className="mt-1 font-display text-lg font-semibold leading-tight text-night">{a.fullName}</h2>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        <Badge tone={deceased ? 'neutral' : 'green'}>{deceased ? tx('Décédé', 'Deceased', 'Falecido') : tx('En vie', 'Living', 'Vivo')}</Badge>
        {years && <Badge>{years}</Badge>}
      </div>
      {a.place && <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink/55"><MapPin className="h-3.5 w-3.5" aria-hidden />{a.place}</p>}
      {a.bio && <p className="mt-2 line-clamp-4 text-sm text-ink/70">{a.bio}</p>}
      {!a.photoUrl && (
        <div className="mt-auto w-full pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onPropose} icon={<ImagePlus className="h-4 w-4" />} className="w-full">
            {tx('Envoyer une photo', 'Send a photo', 'Enviar uma foto')}
          </Button>
        </div>
      )}
    </li>
  );
}

function ProposePhotoDialog({ apostle, onClose }: { apostle: Apostle | null; onClose: () => void }) {
  const { tx } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const close = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setNote(''); setConsent(false); setSent(false); setErr(null);
    onClose();
  };

  const pickFile = (f: File | null) => {
    setErr(null);
    if (preview) URL.revokeObjectURL(preview);
    if (f && !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setFile(null); setPreview(null);
      setErr(tx('Format non pris en charge : choisissez une photo JPG, PNG ou WebP.', 'Unsupported format: choose a JPG, PNG or WebP photo.', 'Formato não suportado: escolha uma foto JPG, PNG ou WebP.'));
      return;
    }
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!apostle) return;
    if (!file) { setErr(tx('Choisissez une photo.', 'Choose a photo.', 'Escolha uma foto.')); return; }
    if (name.trim().length < 2) { setErr(tx('Indiquez votre nom.', 'Enter your name.', 'Indique o seu nome.')); return; }
    if (!consent) { setErr(tx('Cochez la case de confirmation.', 'Tick the confirmation box.', 'Marque a caixa de confirmação.')); return; }
    setSending(true); setErr(null);
    try {
      await submitApostlePhoto(apostle.id, file, { name, contact, note });
      setSent(true);
    } catch (x) {
      const m = x instanceof Error ? x.message : '';
      setErr(m === 'size' ? tx('Photo trop lourde (20 Mo maximum).', 'Photo too large (20 MB maximum).', 'Foto demasiado pesada (20 MB no máximo).')
        : tx('L’envoi a échoué. Vérifiez votre connexion et réessayez.', 'Sending failed. Check your connection and try again.', 'O envio falhou. Verifique a ligação e tente novamente.'));
    } finally { setSending(false); }
  };

  return (
    <Modal open={!!apostle} onClose={close} title={tx('Envoyer une photo', 'Send a photo', 'Enviar uma foto')}
      footer={sent ? <Button type="button" onClick={close}>{tx('Fermer', 'Close', 'Fechar')}</Button> : (
        <>
          <Button type="button" variant="ghost" onClick={close}>{tx('Annuler', 'Cancel', 'Cancelar')}</Button>
          <Button type="submit" form="propose-photo" loading={sending} icon={<Camera className="h-4 w-4" />}>{tx('Envoyer', 'Send', 'Enviar')}</Button>
        </>
      )}>
      {sent ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
          <p className="mt-3 font-display text-lg font-semibold text-night">{tx('Merci, la photo a bien été reçue.', 'Thank you, the photo has been received.', 'Obrigado, a foto foi recebida.')}</p>
          <p className="mt-1 text-sm text-ink/70">{tx('L’administration va la vérifier avant de l’ajouter au profil de l’apôtre.', 'The administration will review it before adding it to the apostle’s profile.', 'A administração vai verificá-la antes de a adicionar ao perfil do apóstolo.')}</p>
        </div>
      ) : (
        <form id="propose-photo" onSubmit={send} className="space-y-4" noValidate>
          <p className="text-sm text-ink/70">{tx('Photo de', 'Photo of', 'Foto de')} <strong className="text-night">{apostle?.title} {apostle?.fullName}</strong></p>
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-night/15 bg-mist/60 p-5 text-center transition hover:border-gold">
            {preview ? <img src={preview} alt="" className="h-36 w-36 rounded-full object-cover ring-4 ring-gold/40" /> : <ImagePlus className="h-10 w-10 text-ink/40" aria-hidden />}
            <span className="text-sm font-medium text-night">{preview ? tx('Changer de photo', 'Change photo', 'Mudar de foto') : tx('Choisir une photo', 'Choose a photo', 'Escolher uma foto')}</span>
            <span className="text-xs text-ink/55">{tx('JPG, PNG ou WebP. Un portrait net, le visage bien visible.', 'JPG, PNG or WebP. A clear portrait with the face visible.', 'JPG, PNG ou WebP. Um retrato nítido, com o rosto bem visível.')}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
          </label>
          <Field label={tx('Votre nom', 'Your name', 'O seu nome')} required>{(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />}</Field>
          <Field label={tx('Téléphone ou e-mail (facultatif)', 'Phone or e-mail (optional)', 'Telefone ou e-mail (opcional)')} hint={tx('Seule l’administration le voit, pour vous contacter si besoin.', 'Only the administration sees it, to contact you if needed.', 'Só a administração o vê, para o contactar se necessário.')}>{(p) => <Input {...p} value={contact} onChange={(e) => setContact(e.target.value)} maxLength={160} />}</Field>
          <Field label={tx('Commentaire (facultatif)', 'Comment (optional)', 'Comentário (opcional)')}>{(p) => <Textarea {...p} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} placeholder={tx('Ex. année ou lieu de la photo', 'E.g. year or place of the photo', 'Ex. ano ou local da foto')} />}</Field>
          <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} label={tx('Je confirme que cette photo représente bien cet apôtre et que je peux la partager.', 'I confirm this photo shows this apostle and that I may share it.', 'Confirmo que esta foto mostra este apóstolo e que a posso partilhar.')} />
          {err && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        </form>
      )}
    </Modal>
  );
}
