import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, EyeOff, Facebook, FileAudio, Headphones, Keyboard, MessageCircle, MessageSquare, Mic, Send, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { Paragraphs } from '@/features/forum/ForumUi';
import { AudioRecorder, canRecord, type Recording } from '@/features/debates/AudioRecorder';
import {
  addDebateComment, audioFormat, audioUrl, DEBATE_AUDIO_MAX_BYTES, DEBATE_TEXT_MAX, deleteDebateComment, formatSeconds,
  listDebateComments, setDebateCommentHidden, type DebateComment,
} from '@/features/debates/debates';
import { findDebateTopic, type DebateTopic } from '@/content/debats';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { can } from '@/lib/permissions';
import { cn, formatDate, formatTime } from '@/utils/format';
import NotFoundPage from '@/pages/public/NotFoundPage';

export default function DebatePage() {
  const { id } = useParams();
  const topic = findDebateTopic(id);
  if (!topic) return <NotFoundPage />;
  return <Debate topic={topic} />;
}

function Debate({ topic }: { topic: DebateTopic }) {
  const { tx, pick, locale } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const moderator = can(profile, 'moderation');
  const comments = useAsync(() => listDebateComments(topic.id, moderator), [topic.id, moderator]);
  const [confirm, setConfirm] = useState<DebateComment | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>, done: string) {
    setBusy(true);
    try {
      await action();
      notify(done);
      await comments.reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('L’action a échoué.', 'The action failed.', 'A ação falhou.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  const list = comments.data ?? [];
  const visible = list.filter((c) => !c.isHidden);
  const voices = visible.filter((c) => c.audioPath).length;

  return (
    <>
      <PageHeader eyebrow={tx('Débats audio — animé par', 'Audio debate — hosted by', 'Debate em áudio — animado por') + ' ' + topic.host} title={pick(topic.title)} metaDescription={pick(topic.intro)} image={topic.shareImage} share={false}>
        <div className="max-w-2xl space-y-4">
          <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gold-200"><Headphones className="h-4 w-4" aria-hidden />{tx('Écoutez le sujet', 'Listen to the topic', 'Ouça o tema')}</p>
            {topic.video
              ? <video src={topic.video} poster={topic.image} controls playsInline preload="metadata" className="w-full rounded-2xl" />
              : <audio src={topic.audio} controls preload="metadata" className="w-full" />}
          </div>
          <ShareAudio topic={topic} />
          <p className="text-[15px] leading-relaxed text-white/70">{pick(topic.intro)}</p>
        </div>
      </PageHeader>
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_1.1fr] lg:py-14">
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-night text-white shadow-lift">
            <img src={topic.image} alt={tx('Je suis KCCiste 3 Mariage — Sujet du jour', 'Je suis KCCiste 3 Mariage — Topic of the day', 'Je suis KCCiste 3 Mariage — Tema do dia')} className="w-full" />
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-lg font-bold text-night" aria-hidden>M</div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">{tx('Animé par', 'Hosted by', 'Animado por')}</p>
                  <p className="font-display text-xl">{topic.host}</p>
                </div>
              </div>
              <p className="text-sm text-white/70">{pick(topic.hostRole)}</p>
              <p className="text-xs text-white/50">{formatDate(topic.date, locale)}</p>
            </div>
          </div>
          <CommentForm topicId={topic.id} onPosted={() => void comments.reload()} />
        </div>

        <section aria-labelledby="debate-comments-title" className="rounded-3xl border border-night/[0.06] bg-white p-6 shadow-sm sm:p-8">
          <h2 id="debate-comments-title" className="flex items-center gap-2 font-display text-xl font-semibold text-night">
            <MessageSquare className="h-5 w-5 text-gold-600" aria-hidden />
            {visible.length === 0 ? tx('Avis des participants', 'Participants’ views', 'Opiniões dos participantes') : tx(`${visible.length} avis`, `${visible.length} views`, `${visible.length} opiniões`)}
            {voices > 0 && <span className="text-sm font-normal text-ink/55">· {tx(`${voices} en vocal`, `${voices} by voice`, `${voices} por voz`)}</span>}
          </h2>
          {comments.error ? <div className="mt-4"><ErrorState error={comments.error} onRetry={comments.reload} /></div> : comments.loading ? (
            <div className="mt-5 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : list.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">{tx('Soyez la première personne à donner votre avis sur ce sujet.', 'Be the first to share your view on this topic.', 'Seja a primeira pessoa a dar a sua opinião sobre este tema.')}</p>
          ) : (
            <ol className="mt-5 divide-y divide-night/[0.06]">
              {list.map((c) => {
                const initials = c.authorName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
                return (
                  <li key={c.id} className={cn('flex gap-3 py-5 first:pt-0 last:pb-0', c.isHidden && 'opacity-60')}>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-200 to-gold-400 text-sm font-semibold text-night" aria-hidden>{initials || '?'}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <p className="font-semibold text-night">{c.authorName}</p>
                        {c.audioPath && <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700"><Mic className="h-3.5 w-3.5" aria-hidden />{tx('Vocal', 'Voice', 'Voz')}{c.audioSeconds ? ` · ${formatSeconds(c.audioSeconds)}` : ''}</span>}
                        {c.isHidden && <Badge tone="red">{tx('Masqué', 'Hidden', 'Oculto')}</Badge>}
                      </div>
                      <p className="text-xs text-ink/50">{formatDate(c.createdAt, locale)} · {formatTime(c.createdAt, locale)}</p>
                      {c.audioPath && <audio src={audioUrl(c.audioPath)} controls preload="none" className="mt-2 w-full" />}
                      {c.body && <Paragraphs text={c.body} className="mt-2 space-y-2 break-words text-[15px] leading-relaxed text-ink/85" />}
                      {moderator && (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                          <button type="button" disabled={busy} className="inline-flex items-center gap-1 text-ink/60 hover:text-night"
                            onClick={() => run(() => setDebateCommentHidden(c, !c.isHidden), c.isHidden ? tx('Avis de nouveau visible.', 'View visible again.', 'Opinião novamente visível.') : tx('Avis masqué.', 'View hidden.', 'Opinião ocultada.'))}>
                            {c.isHidden ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}{c.isHidden ? tx('Rendre visible', 'Make visible', 'Tornar visível') : tx('Masquer', 'Hide', 'Ocultar')}
                          </button>
                          <button type="button" disabled={busy} onClick={() => setConfirm(c)} className="inline-flex items-center gap-1 text-red-700 hover:text-red-800"><Trash2 className="h-3.5 w-3.5" aria-hidden />{tx('Supprimer', 'Delete', 'Eliminar')}</button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </section>
      <ConfirmDialog open={!!confirm} danger loading={busy} onCancel={() => setConfirm(null)}
        onConfirm={async () => { if (confirm) await run(() => deleteDebateComment(confirm), tx('Avis supprimé.', 'View deleted.', 'Opinião eliminada.')); setConfirm(null); }}
        title={tx('Supprimer cet avis ?', 'Delete this view?', 'Eliminar esta opinião?')} confirmLabel={tx('Supprimer', 'Delete', 'Eliminar')}
        message={tx('L’avis et son audio seront effacés définitivement.', 'The view and its audio will be permanently erased.', 'A opinião e o seu áudio serão apagados definitivamente.')} />
    </>
  );
}

type Mode = 'voice' | 'file' | 'text';
const NAME_KEY = 'kcc.debate.name';

function CommentForm({ topicId, onPosted }: { topicId: string; onPosted: () => void }) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const recordable = canRecord();
  const [mode, setMode] = useState<Mode>(recordable ? 'voice' : 'file');
  const [name, setName] = useState(() => { try { return localStorage.getItem(NAME_KEY) ?? ''; } catch { return ''; } });
  const [recording, setRecording] = useState<Recording | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

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
    if (!audioFormat(f.type, f.name)) return setError(tx('Ce fichier n’est pas un audio reconnu (mp3, m4a, ogg, opus, wav…).', 'This file is not a recognised audio (mp3, m4a, ogg, opus, wav…).', 'Este ficheiro não é um áudio reconhecido (mp3, m4a, ogg, opus, wav…).'));
    if (f.size > DEBATE_AUDIO_MAX_BYTES) return setError(tx('Le fichier dépasse 10 Mo.', 'The file is larger than 10 MB.', 'O ficheiro ultrapassa 10 MB.'));
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const audio = mode === 'voice' ? recording?.blob ?? null : mode === 'file' ? file : null;
    if (name.trim().length < 2) return setError(tx('Indiquez votre nom.', 'Enter your name.', 'Indique o seu nome.'));
    if (!audio && !text.trim()) {
      return setError(mode === 'voice' ? tx('Enregistrez d’abord votre vocal.', 'Record your voice message first.', 'Grave primeiro a sua mensagem de voz.')
        : mode === 'file' ? tx('Choisissez d’abord un fichier audio.', 'Choose an audio file first.', 'Escolha primeiro um ficheiro áudio.')
          : tx('Écrivez votre commentaire.', 'Write your comment.', 'Escreva o seu comentário.'));
    }
    setError('');
    setSending(true);
    try {
      let seconds: number | null = mode === 'voice' ? recording?.seconds ?? null : null;
      if (mode === 'file' && fileUrl) seconds = await durationOf(fileUrl);
      await addDebateComment({ topicId, authorName: name, body: text, audio, audioName: file?.name, audioSeconds: seconds });
      try { localStorage.setItem(NAME_KEY, name.trim()); } catch { /* stockage indisponible */ }
      if (recording) URL.revokeObjectURL(recording.url);
      setRecording(null);
      pickFile(null);
      setText('');
      notify(tx('Merci ! Votre avis est publié.', 'Thank you! Your view is published.', 'Obrigado! A sua opinião foi publicada.'));
      onPosted();
    } catch (err) {
      const m = err instanceof Error ? err.message : '';
      setError(m === 'too-big' ? tx('Le fichier dépasse 10 Mo.', 'The file is larger than 10 MB.', 'O ficheiro ultrapassa 10 MB.')
        : m === 'format' ? tx('Format audio non reconnu.', 'Audio format not recognised.', 'Formato de áudio não reconhecido.')
          : m || tx('L’envoi a échoué. Vérifiez votre connexion puis réessayez.', 'Sending failed. Check your connection and try again.', 'O envio falhou. Verifique a ligação e tente de novo.'));
    } finally {
      setSending(false);
    }
  }

  const tabs: { id: Mode; label: string; icon: typeof Mic }[] = [
    ...(recordable ? [{ id: 'voice' as const, label: tx('Vocal', 'Voice', 'Voz'), icon: Mic }] : []),
    { id: 'file', label: tx('Fichier audio', 'Audio file', 'Ficheiro áudio'), icon: FileAudio },
    { id: 'text', label: tx('Texte', 'Text', 'Texto'), icon: Keyboard },
  ];

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl border border-night/[0.06] bg-white p-6 shadow-lift">
      <h2 className="font-display text-xl font-semibold text-night">{tx('Donnez votre avis', 'Share your view', 'Dê a sua opinião')}</h2>
      <Field label={tx('Votre nom', 'Your name', 'O seu nome')} required>
        {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />}
      </Field>
      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-2xl bg-mist p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setError(''); }}
            className={cn('flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition', mode === id ? 'bg-white text-night shadow-sm' : 'text-ink/60')}>
            <Icon className="h-4 w-4" aria-hidden />{label}
          </button>
        ))}
      </div>
      {mode === 'voice' && <AudioRecorder value={recording} onChange={setRecording} />}
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
      <Field label={mode === 'text' ? tx('Votre commentaire', 'Your comment', 'O seu comentário') : tx('Un mot écrit (facultatif)', 'A written note (optional)', 'Uma nota escrita (opcional)')}>
        {(p) => <Textarea {...p} value={text} onChange={(e) => setText(e.target.value)} rows={mode === 'text' ? 5 : 2} maxLength={DEBATE_TEXT_MAX} />}
      </Field>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={sending} className="w-full" icon={<Send className="h-4 w-4" />}>{tx('Publier mon avis', 'Publish my view', 'Publicar a minha opinião')}</Button>
      <p className="text-xs text-ink/50">{tx('Les avis sont publics. Les administrateurs peuvent retirer un message déplacé.', 'Views are public. Administrators may remove an inappropriate message.', 'As opiniões são públicas. Os administradores podem retirar uma mensagem inadequada.')}</p>
    </form>
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

/**
 * Partage de l'audio lui-même : sur téléphone, la feuille de partage envoie le fichier MP3
 * (il arrive dans WhatsApp comme un audio à écouter), accompagné du lien pour répondre.
 * Sans partage de fichier possible, on envoie le lien, dont l'aperçu montre le bouton ▶.
 */
function ShareAudio({ topic }: { topic: DebateTopic }) {
  const { tx, pick } = useI18n();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const url = `${window.location.origin}/debats/${topic.id}`;
  const text = `🎧 ${pick(topic.title)} — ${tx('animé par', 'hosted by', 'animado por')} ${topic.host}\n${tx('Écoutez et donnez votre avis en vocal :', 'Listen and share your view by voice:', 'Ouça e dê a sua opinião por voz:')} ${url}`;

  async function shareAudio() {
    setBusy(true);
    try {
      const src = topic.video ?? topic.audio;
      const blob = await fetch(src).then((r) => { if (!r.ok) throw new Error('media'); return r.blob(); });
      const file = topic.video ? new File([blob], `${topic.id}.mp4`, { type: 'video/mp4' }) : new File([blob], `${topic.id}.mp3`, { type: 'audio/mpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={shareAudio} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-night disabled:opacity-60">
        <MessageCircle className="h-4 w-4" aria-hidden />{busy ? tx('Préparation…', 'Preparing…', 'A preparar…') : topic.video ? tx('Partager la vidéo sur WhatsApp', 'Share the video on WhatsApp', 'Partilhar o vídeo no WhatsApp') : tx('Partager l’audio sur WhatsApp', 'Share the audio on WhatsApp', 'Partilhar o áudio no WhatsApp')}
      </button>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white">
        <Facebook className="h-4 w-4" aria-hidden />Facebook
      </a>
      <button type="button" onClick={() => { void navigator.clipboard?.writeText(url).then(() => notify(tx('Lien copié.', 'Link copied.', 'Ligação copiada.'))); }} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20">
        {tx('Copier le lien', 'Copy link', 'Copiar ligação')}
      </button>
    </div>
  );
}
