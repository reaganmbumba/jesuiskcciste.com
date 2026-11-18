import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, FileAudio, MessageCircle, Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { useAuth } from '@/features/auth/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { AudioRecorder, canRecord, type Recording } from '@/features/debates/AudioRecorder';
import { audioFormat } from '@/features/debates/debates';
import { radioSettingsOf, vocalWhatsappUrl } from './radio';
import { useRadio } from './RadioContext';
import { sendVocal, VOCAL_MAX_BYTES, VOCAL_NOTE_MAX } from './vocals';

const NAME_KEY = 'kcc.debate.name';
const PLACE_KEY = 'kcc.radio.place';
type Mode = 'voice' | 'file';

const read = (k: string) => { try { return localStorage.getItem(k) ?? ''; } catch { return ''; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } };

/**
 * « Votre voix à l'antenne » : l'auditeur enregistre un vocal (ou choisit une
 * note vocale déjà enregistrée), qui attend la validation de l'animateur.
 * Si un numéro WhatsApp est réglé, un bouton propose aussi d'envoyer le vocal par WhatsApp.
 */
export function SendVocalCard({ className }: { className?: string }) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { settings } = useSiteSettings();
  const wa = vocalWhatsappUrl(radioSettingsOf(settings).vocalWhatsapp);
  const { active, playing, toggle } = useRadio();
  const recordable = canRecord();
  const [mode, setMode] = useState<Mode>(recordable ? 'voice' : 'file');
  const [name, setName] = useState(() => read(NAME_KEY));
  const [place, setPlace] = useState(() => read(PLACE_KEY));
  const [recording, setRecording] = useState<Recording | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!name && profile) setName([profile.firstName, profile.lastName].filter(Boolean).join(' '));
  }, [profile, name]);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  function pickFile(f: File | null) {
    setError('');
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl('');
    setFile(null);
    if (!f) return;
    if (!audioFormat(f.type, f.name)) return setError(tx('Ce fichier n’est pas un audio reconnu (note vocale WhatsApp, mp3, m4a…).', 'This file is not a recognised audio (WhatsApp voice note, mp3, m4a…).', 'Este ficheiro não é um áudio reconhecido (nota de voz WhatsApp, mp3, m4a…).'));
    if (f.size > VOCAL_MAX_BYTES) return setError(tx('Le fichier dépasse 10 Mo.', 'The file is larger than 10 MB.', 'O ficheiro ultrapassa 10 MB.'));
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const audio = mode === 'voice' ? recording?.blob ?? null : file;
    if (name.trim().length < 2) return setError(tx('Indiquez votre nom.', 'Enter your name.', 'Indique o seu nome.'));
    if (!audio) return setError(mode === 'voice' ? tx('Enregistrez d’abord votre vocal.', 'Record your voice message first.', 'Grave primeiro a sua mensagem de voz.') : tx('Choisissez d’abord un fichier audio.', 'Choose an audio file first.', 'Escolha primeiro um ficheiro áudio.'));
    setError('');
    setSending(true);
    try {
      let seconds: number | null = mode === 'voice' ? recording?.seconds ?? null : null;
      if (mode === 'file' && fileUrl) seconds = await durationOf(fileUrl);
      await sendVocal({ authorName: name, place, note, audio, audioName: file?.name, audioSeconds: seconds });
      write(NAME_KEY, name.trim());
      write(PLACE_KEY, place.trim());
      if (recording) URL.revokeObjectURL(recording.url);
      setRecording(null);
      pickFile(null);
      setNote('');
      setSent(true);
    } catch (err) {
      const m = err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : '';
      setError(m === 'too-big' ? tx('Le fichier dépasse 10 Mo.', 'The file is larger than 10 MB.', 'O ficheiro ultrapassa 10 MB.')
        : m === 'format' ? tx('Format audio non reconnu.', 'Audio format not recognised.', 'Formato de áudio não reconhecido.')
          : m || tx('L’envoi a échoué. Vérifiez votre connexion puis réessayez.', 'Sending failed. Check your connection and try again.', 'O envio falhou. Verifique a ligação e tente de novo.'));
    } finally {
      setSending(false);
    }
  }

  const tabs: { id: Mode; label: string; icon: typeof Mic }[] = [
    ...(recordable ? [{ id: 'voice' as const, label: tx('Enregistrer', 'Record', 'Gravar'), icon: Mic }] : []),
    { id: 'file', label: tx('Fichier audio', 'Audio file', 'Ficheiro áudio'), icon: FileAudio },
  ];

  return (
    <div id="vocal" className={cn('scroll-mt-24 rounded-3xl border border-night/[0.06] bg-white p-6 shadow-lift', className)}>
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-night"><Mic className="h-5 w-5 text-gold-600" aria-hidden />{tx('Votre voix à l’antenne', 'Your voice on air', 'A sua voz no ar')}</h2>
      <p className="mt-1 text-sm text-ink/65">{tx('Un témoignage, une prière, une dédicace, une question à l’animateur : envoyez un vocal. Après écoute par l’équipe de la radio, il passe à l’antenne, en direct ou entre les chants.', 'A testimony, a prayer, a dedication, a question for the host: send a voice message. Once the radio team has listened to it, it goes on air, live or between songs.', 'Um testemunho, uma oração, uma dedicatória, uma pergunta ao animador: envie uma mensagem de voz. Depois de ouvida pela equipa da rádio, passa no ar, em direto ou entre os cânticos.')}</p>

      {sent ? (
        <div className="mt-5 space-y-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
          <p className="flex items-start gap-2 font-semibold"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />{tx('Merci ! Votre vocal est bien arrivé.', 'Thank you! Your voice message has arrived.', 'Obrigado! A sua mensagem de voz chegou.')}</p>
          <p>{tx('L’équipe de la radio va l’écouter. S’il est retenu, vous l’entendrez à l’antenne dans les prochains jours.', 'The radio team will listen to it. If it is chosen, you will hear it on air in the coming days.', 'A equipa da rádio vai ouvi-la. Se for escolhida, vai ouvi-la no ar nos próximos dias.')}</p>
          <button type="button" onClick={() => setSent(false)} className="font-semibold text-night underline">{tx('Envoyer un autre vocal', 'Send another voice message', 'Enviar outra mensagem de voz')}</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tx('Votre nom', 'Your name', 'O seu nome')} required>
              {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />}
            </Field>
            <Field label={tx('Paroisse ou ville (facultatif)', 'Parish or town (optional)', 'Paróquia ou cidade (opcional)')}>
              {(p) => <Input {...p} value={place} onChange={(e) => setPlace(e.target.value)} maxLength={120} placeholder={tx('ex. Paroisse de Boma', 'e.g. Boma parish', 'ex. Paróquia de Boma')} />}
            </Field>
          </div>
          {tabs.length > 1 && (
            <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-mist p-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setError(''); }}
                  className={cn('flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition', mode === id ? 'bg-white text-night shadow-sm' : 'text-ink/60')}>
                  <Icon className="h-4 w-4" aria-hidden />{label}
                </button>
              ))}
            </div>
          )}
          {mode === 'voice' && <AudioRecorder value={recording} onChange={setRecording} onStart={() => { if (active && playing) toggle(); }} />}
          {mode === 'file' && (
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-night/15 px-4 py-5 text-sm font-semibold text-night hover:border-gold">
                <FileAudio className="h-5 w-5 text-gold-600" aria-hidden />
                {file ? file.name : tx('Choisir un audio (note vocale WhatsApp, mp3…)', 'Choose an audio (WhatsApp voice note, mp3…)', 'Escolher um áudio (nota de voz WhatsApp, mp3…)')}
                <input type="file" accept="audio/*,.opus,.ogg,.m4a,.mp3,.aac,.wav,.amr,.3gp" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
              </label>
              {fileUrl && <audio src={fileUrl} controls preload="metadata" className="w-full" />}
              <p className="text-xs text-ink/50">{tx('10 Mo maximum.', '10 MB maximum.', 'Máximo 10 MB.')}</p>
            </div>
          )}
          <Field label={tx('Un mot pour l’animateur (facultatif)', 'A note for the host (optional)', 'Uma nota para o animador (opcional)')}>
            {(p) => <Textarea {...p} value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={VOCAL_NOTE_MAX} />}
          </Field>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <Button type="submit" loading={sending} className="w-full" icon={<Send className="h-4 w-4" />}>{tx('Envoyer mon vocal à la radio', 'Send my voice message to the radio', 'Enviar a minha mensagem de voz à rádio')}</Button>
          <p className="text-xs text-ink/50">{tx('En envoyant, vous acceptez que votre vocal et votre nom passent à l’antenne. Rien n’est diffusé sans avoir été écouté par l’équipe.', 'By sending, you agree that your voice message and your name may go on air. Nothing is broadcast without being heard by the team first.', 'Ao enviar, aceita que a sua mensagem de voz e o seu nome passem no ar. Nada é emitido sem ser ouvido pela equipa.')}</p>
        </form>
      )}

      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100">
          <MessageCircle className="h-4 w-4" aria-hidden />{tx('Ou envoyez votre vocal sur WhatsApp', 'Or send your voice message on WhatsApp', 'Ou envie a sua mensagem de voz pelo WhatsApp')}
        </a>
      )}
    </div>
  );
}

function durationOf(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const a = new Audio();
    const done = (v: number | null) => { a.src = ''; resolve(v); };
    a.preload = 'metadata';
    a.onloadedmetadata = () => done(Number.isFinite(a.duration) ? a.duration : null);
    a.onerror = () => done(null);
    window.setTimeout(() => done(null), 4000);
    a.src = url;
  });
}
