import { useState, type FormEvent } from 'react';
import { Camera, CheckCircle2, ImagePlus, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import type { Apostle } from '@/types';
import { submitApostleProposal } from './apostles';

export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/** Photo de profil ronde, ou initiales quand l'apôtre n'a pas encore de photo. */
export function ApostlePortrait({ apostle: a, className }: { apostle: Apostle; className?: string }) {
  return a.photoUrl ? (
    <img src={a.photoUrl} alt={a.fullName} loading="lazy" className={cn('rounded-full object-cover ring-4', a.status === 'deceased' ? 'ring-night/15 grayscale-[35%]' : 'ring-gold/40', className)} />
  ) : (
    <span className={cn('grid place-items-center rounded-full bg-gradient-to-br from-night to-night-500 font-display font-semibold text-gold ring-4 ring-night/10', className)} aria-hidden>{initialsOf(a.fullName)}</span>
  );
}

export type ProposeMode = 'photo' | 'info';

const yearOf = (v: string) => (/^\d{4}$/.test(v.trim()) ? Number(v.trim()) : null);

/**
 * Formulaire public : envoyer une photo, ou proposer des informations
 * (paroisse, consécration, années, présentation). Rien n'est publié avant
 * la validation par l'administration.
 */
export function ProposeDialog({ apostle, mode, onClose }: { apostle: Apostle | null; mode: ProposeMode; onClose: () => void }) {
  const { tx } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [place, setPlace] = useState('');
  const [consecration, setConsecration] = useState('');
  const [birth, setBirth] = useState('');
  const [death, setDeath] = useState('');
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const close = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setPlace(''); setConsecration(''); setBirth(''); setDeath(''); setBio('');
    setNote(''); setConsent(false); setSent(false); setErr(null);
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
    if (mode === 'photo' && !file) { setErr(tx('Choisissez une photo.', 'Choose a photo.', 'Escolha uma foto.')); return; }
    if ((birth && !yearOf(birth)) || (death && !yearOf(death))) { setErr(tx('Écrivez les années avec 4 chiffres, par exemple 1975.', 'Write years with 4 digits, e.g. 1975.', 'Escreva os anos com 4 algarismos, por exemplo 1975.')); return; }
    if (name.trim().length < 2) { setErr(tx('Indiquez votre nom.', 'Enter your name.', 'Indique o seu nome.')); return; }
    if (!consent) { setErr(tx('Cochez la case de confirmation.', 'Tick the confirmation box.', 'Marque a caixa de confirmação.')); return; }
    setSending(true); setErr(null);
    try {
      await submitApostleProposal(apostle.id, { name, contact, note }, mode === 'photo'
        ? { file }
        : { info: { place, consecration, birthYear: yearOf(birth), deathYear: yearOf(death), bio } });
      setSent(true);
    } catch (x) {
      const m = x instanceof Error ? x.message : '';
      setErr(m === 'size' ? tx('Photo trop lourde (20 Mo maximum).', 'Photo too large (20 MB maximum).', 'Foto demasiado pesada (20 MB no máximo).')
        : m === 'empty' ? tx('Remplissez au moins une information.', 'Fill in at least one detail.', 'Preencha pelo menos uma informação.')
        : tx('L’envoi a échoué. Vérifiez votre connexion et réessayez.', 'Sending failed. Check your connection and try again.', 'O envio falhou. Verifique a ligação e tente novamente.'));
    } finally { setSending(false); }
  };

  const title = mode === 'photo' ? tx('Envoyer une photo', 'Send a photo', 'Enviar uma foto') : tx('Proposer des informations', 'Suggest details', 'Propor informações');
  return (
    <Modal open={!!apostle} onClose={close} title={title}
      footer={sent ? <Button type="button" onClick={close}>{tx('Fermer', 'Close', 'Fechar')}</Button> : (
        <>
          <Button type="button" variant="ghost" onClick={close}>{tx('Annuler', 'Cancel', 'Cancelar')}</Button>
          <Button type="submit" form="propose-apostle" loading={sending} icon={mode === 'photo' ? <Camera className="h-4 w-4" /> : <Send className="h-4 w-4" />}>{tx('Envoyer', 'Send', 'Enviar')}</Button>
        </>
      )}>
      {sent ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
          <p className="mt-3 font-display text-lg font-semibold text-night">{tx('Merci, c’est bien reçu.', 'Thank you, it has been received.', 'Obrigado, foi recebido.')}</p>
          <p className="mt-1 text-sm text-ink/70">{tx('L’administration va vérifier avant de l’ajouter au profil de l’apôtre.', 'The administration will review it before adding it to the apostle’s profile.', 'A administração vai verificar antes de adicionar ao perfil do apóstolo.')}</p>
        </div>
      ) : (
        <form id="propose-apostle" onSubmit={send} className="space-y-4" noValidate>
          <p className="text-sm text-ink/70">{tx('Pour', 'For', 'Para')} <strong className="text-night">{apostle?.title} {apostle?.fullName}</strong></p>
          {mode === 'photo' ? (
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-night/15 bg-mist/60 p-5 text-center transition hover:border-gold">
              {preview ? <img src={preview} alt="" className="h-36 w-36 rounded-full object-cover ring-4 ring-gold/40" /> : <ImagePlus className="h-10 w-10 text-ink/40" aria-hidden />}
              <span className="text-sm font-medium text-night">{preview ? tx('Changer de photo', 'Change photo', 'Mudar de foto') : tx('Choisir une photo', 'Choose a photo', 'Escolher uma foto')}</span>
              <span className="text-xs text-ink/55">{tx('JPG, PNG ou WebP. Un portrait net, le visage bien visible.', 'JPG, PNG or WebP. A clear portrait with the face visible.', 'JPG, PNG ou WebP. Um retrato nítido, com o rosto bem visível.')}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
            </label>
          ) : (
            <div className="space-y-4 rounded-2xl bg-mist/60 p-4">
              <p className="text-xs text-ink/60">{tx('Remplissez seulement ce que vous savez avec certitude.', 'Only fill in what you know for sure.', 'Preencha apenas o que sabe com certeza.')}</p>
              <Field label={tx('Paroisse qu’il encadre', 'Parish he oversees', 'Paróquia que dirige')}>{(p) => <Input {...p} value={place} onChange={(e) => setPlace(e.target.value)} maxLength={160} />}</Field>
              <Field label={tx('Date de consécration', 'Consecration date', 'Data de consagração')} hint={tx('La date exacte, ou seulement l’année.', 'The exact date, or just the year.', 'A data exata, ou apenas o ano.')}>{(p) => <Input {...p} value={consecration} onChange={(e) => setConsecration(e.target.value)} maxLength={60} placeholder="ex. 12/08/1984" />}</Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={tx('Année de naissance', 'Year of birth', 'Ano de nascimento')}>{(p) => <Input {...p} inputMode="numeric" value={birth} onChange={(e) => setBirth(e.target.value)} maxLength={4} />}</Field>
                <Field label={tx('Année du décès', 'Year of death', 'Ano do falecimento')}>{(p) => <Input {...p} inputMode="numeric" value={death} onChange={(e) => setDeath(e.target.value)} maxLength={4} />}</Field>
              </div>
              <Field label={tx('Quelques mots sur lui', 'A few words about him', 'Algumas palavras sobre ele')}>{(p) => <Textarea {...p} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={2000} />}</Field>
            </div>
          )}
          <Field label={tx('Votre nom', 'Your name', 'O seu nome')} required>{(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />}</Field>
          <Field label={tx('Téléphone ou e-mail (facultatif)', 'Phone or e-mail (optional)', 'Telefone ou e-mail (opcional)')} hint={tx('Seule l’administration le voit, pour vous contacter si besoin.', 'Only the administration sees it, to contact you if needed.', 'Só a administração o vê, para o contactar se necessário.')}>{(p) => <Input {...p} value={contact} onChange={(e) => setContact(e.target.value)} maxLength={160} />}</Field>
          <Field label={tx('Commentaire ou source (facultatif)', 'Comment or source (optional)', 'Comentário ou fonte (opcional)')}>{(p) => <Textarea {...p} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} placeholder={mode === 'photo' ? tx('Ex. année ou lieu de la photo', 'E.g. year or place of the photo', 'Ex. ano ou local da foto') : tx('Ex. comment vous le savez', 'E.g. how you know it', 'Ex. como o sabe')} />}</Field>
          <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} label={mode === 'photo'
            ? tx('Je confirme que cette photo représente bien cet apôtre et que je peux la partager.', 'I confirm this photo shows this apostle and that I may share it.', 'Confirmo que esta foto mostra este apóstolo e que a posso partilhar.')
            : tx('Je confirme que ces informations sont exactes à ma connaissance.', 'I confirm these details are accurate to my knowledge.', 'Confirmo que estas informações são exatas, tanto quanto sei.')} />
          {err && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        </form>
      )}
    </Modal>
  );
}
