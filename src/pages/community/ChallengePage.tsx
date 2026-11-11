import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Eye, EyeOff, Film, Heart, Link2, Music2, Send, Trash2, Trophy, Video } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import {
  addChallengeEntry, castVote, CHALLENGE_NOTE_MAX, CHALLENGE_VIDEO_MAX_BYTES, cleanTiktokUrl, deleteChallengeEntry, listChallengeEntries,
  myVote, setChallengeEntryHidden, tiktokVideoId, videoFormat, videoUrl, voteCounts, type ChallengeEntry,
} from '@/features/challenges/challenges';
import { findChallenge, type Challenge } from '@/content/challenges';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { can } from '@/lib/permissions';
import { cn, formatDate } from '@/utils/format';
import NotFoundPage from '@/pages/public/NotFoundPage';

export default function ChallengePage() {
  const { id } = useParams();
  const challenge = findChallenge(id);
  if (!challenge) return <NotFoundPage />;
  return <ChallengeView challenge={challenge} />;
}

/** Une vidéo du challenge : mise en avant (dans le code) ou envoyée depuis le site. */
interface Card {
  key: string;
  authorName: string;
  place: string | null;
  note: string | null;
  video: string | null;
  poster?: string;
  tiktokUrl: string | null;
  tiktokHandle?: string;
  createdAt: string | null;
  entry?: ChallengeEntry;
}

function ChallengeView({ challenge }: { challenge: Challenge }) {
  const { tx, pick, locale } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const moderator = can(profile, 'moderation');
  const entries = useAsync(() => listChallengeEntries(challenge.id, moderator), [challenge.id, moderator]);
  const counts = useAsync(() => voteCounts(challenge.id), [challenge.id]);
  const [voted, setVoted] = useState<string | null>(() => myVote(challenge.id));
  const [voting, setVoting] = useState('');
  const [confirm, setConfirm] = useState<ChallengeEntry | null>(null);
  const [busy, setBusy] = useState(false);

  const cards = useMemo<Card[]>(() => {
    const votes = counts.data ?? {};
    const list: Card[] = [
      ...challenge.featured.map((f) => ({ key: f.id, authorName: f.authorName, place: null, note: null, video: f.video, poster: f.poster, tiktokUrl: null, tiktokHandle: f.tiktokHandle, createdAt: null })),
      ...(entries.data ?? []).map((e) => ({ key: e.id, authorName: e.authorName, place: e.place, note: e.note, video: e.videoPath ? videoUrl(e.videoPath) : null, tiktokUrl: e.tiktokUrl, createdAt: e.createdAt, entry: e })),
    ];
    // Classement : le plus de voix d'abord ; à égalité, l'ordre d'arrivée est gardé.
    return list.map((c, i) => ({ c, i })).sort((a, b) => (votes[b.c.key] ?? 0) - (votes[a.c.key] ?? 0) || a.i - b.i).map(({ c }) => c);
  }, [challenge.featured, entries.data, counts.data]);

  const totalVotes = Object.values(counts.data ?? {}).reduce((s, n) => s + n, 0);
  const leader = totalVotes > 0 ? cards[0]?.key : null;

  async function vote(key: string) {
    setVoting(key);
    try {
      const r = await castVote(challenge.id, key);
      if (r === 'already') {
        notify(tx('Vous avez déjà voté pour ce challenge depuis ce téléphone.', 'You have already voted in this challenge from this phone.', 'Já votou neste desafio a partir deste telefone.'), 'error');
      } else {
        setVoted(key);
        notify(tx('Merci ! Votre vote est compté.', 'Thank you! Your vote is counted.', 'Obrigado! O seu voto foi contado.'));
      }
      await counts.reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('Le vote a échoué.', 'The vote failed.', 'O voto falhou.'), 'error');
    } finally {
      setVoting('');
    }
  }

  async function run(action: () => Promise<void>, done: string) {
    setBusy(true);
    try {
      await action();
      notify(done);
      await entries.reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('L’action a échoué.', 'The action failed.', 'A ação falhou.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow={tx('Challenge — label Je suis KCCiste', 'Challenge — Je suis KCCiste label', 'Desafio — editora Je suis KCCiste')} title={pick(challenge.title)} description={pick(challenge.intro)} image={challenge.shareImage}>
        <ol className="grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            challenge.songAudio ? [Music2, tx('Écoutez la chanson', 'Listen to the song', 'Ouça a canção')] : [Film, tx('Regardez les vidéos', 'Watch the videos', 'Veja os vídeos')],
            [Video, tx('Filmez votre version', 'Film your version', 'Filme a sua versão')],
            [Send, tx('Envoyez-la ici', 'Send it here', 'Envie-a aqui')],
            [Heart, tx('Votez', 'Vote', 'Vote')],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof Music2;
            return (
              <li key={i} className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-semibold ring-1 ring-white/15">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-night">{i + 1}</span>
                <I className="h-4 w-4 shrink-0 text-gold-200" aria-hidden /><span>{label as string}</span>
              </li>
            );
          })}
        </ol>
        <a href="#participer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-night hover:bg-gold-300">
          <Video className="h-4 w-4" aria-hidden />{tx('Envoyer ma vidéo', 'Send my video', 'Enviar o meu vídeo')}
        </a>
        {challenge.songAudio && (
          <div className="mt-4 max-w-2xl rounded-3xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gold-200"><Music2 className="h-4 w-4" aria-hidden />{challenge.song}</p>
            <audio src={challenge.songAudio} controls preload="metadata" className="w-full" />
          </div>
        )}
      </PageHeader>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1.5fr_1fr] lg:py-14">
        <section aria-labelledby="challenge-entries-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="challenge-entries-title" className="flex items-center gap-2 font-display text-2xl font-semibold text-night">
              <Film className="h-5 w-5 text-gold-600" aria-hidden />
              {tx(`${cards.length} participation${cards.length > 1 ? 's' : ''}`, `${cards.length} entr${cards.length > 1 ? 'ies' : 'y'}`, `${cards.length} participaç${cards.length > 1 ? 'ões' : 'ão'}`)}
            </h2>
            <p className="text-sm text-ink/60">{tx(`${totalVotes} vote${totalVotes > 1 ? 's' : ''}`, `${totalVotes} vote${totalVotes === 1 ? '' : 's'}`, `${totalVotes} voto${totalVotes === 1 ? '' : 's'}`)} · {tx('une voix par téléphone', 'one vote per phone', 'um voto por telefone')}</p>
          </div>
          {entries.error ? <div className="mt-4"><ErrorState error={entries.error} onRetry={entries.reload} /></div> : (
            <ul className="mt-5 grid gap-5 sm:grid-cols-2">
              {cards.map((c) => {
                const n = counts.data?.[c.key] ?? 0;
                const mine = voted === c.key;
                const id = c.tiktokUrl ? tiktokVideoId(c.tiktokUrl) : null;
                return (
                  <li key={c.key} className={cn('overflow-hidden rounded-3xl border bg-white shadow-soft', leader === c.key ? 'border-gold ring-2 ring-gold/40' : 'border-night/[0.06]', c.entry?.isHidden && 'opacity-60')}>
                    <div className="relative bg-night">
                      {c.video ? (
                        <video src={c.video} poster={c.poster} controls playsInline preload={c.poster ? 'none' : 'metadata'} className="aspect-[9/16] w-full object-contain" />
                      ) : id ? (
                        <iframe src={`https://www.tiktok.com/embed/v2/${id}`} title={`TikTok — ${c.authorName}`} allow="encrypted-media; fullscreen" loading="lazy" className="aspect-[9/16] w-full border-0 bg-white" />
                      ) : c.tiktokUrl ? (
                        <a href={c.tiktokUrl} target="_blank" rel="noopener noreferrer" className="grid aspect-[4/3] w-full place-items-center bg-gradient-to-br from-night-700 to-night-950 p-6 text-center text-white">
                          <span><Video className="mx-auto mb-3 h-10 w-10 text-gold-300" aria-hidden /><span className="font-semibold">{tx('Regarder sur TikTok', 'Watch on TikTok', 'Ver no TikTok')}</span></span>
                        </a>
                      ) : null}
                      {leader === c.key && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-night"><Trophy className="h-3.5 w-3.5" aria-hidden />{tx('En tête', 'Leading', 'Na frente')}</span>}
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <p className="flex flex-wrap items-center gap-2 font-semibold text-night">{c.authorName}{c.entry?.isHidden && <Badge tone="red">{tx('Masquée', 'Hidden', 'Oculta')}</Badge>}</p>
                        <p className="text-xs text-ink/55">
                          {c.tiktokHandle ? <a href={`https://www.tiktok.com/@${c.tiktokHandle}`} target="_blank" rel="noopener noreferrer" className="underline">{tx('Vidéo TikTok de', 'TikTok video by', 'Vídeo TikTok de')} @{c.tiktokHandle}</a>
                            : [c.place, c.createdAt && formatDate(c.createdAt, locale)].filter(Boolean).join(' · ')}
                        </p>
                        {c.note && <p className="mt-2 break-words text-sm text-ink/80">{c.note}</p>}
                      </div>
                      <button type="button" onClick={() => vote(c.key)} disabled={!!voted || !!voting || counts.loading}
                        className={cn('flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition',
                          mine ? 'bg-gold text-night' : voted ? 'bg-mist text-ink/50' : 'bg-night text-white hover:bg-night-700')}>
                        {mine ? <Check className="h-4 w-4" aria-hidden /> : <Heart className="h-4 w-4" aria-hidden />}
                        {mine ? tx('Votre vote', 'Your vote', 'O seu voto') : voting === c.key ? tx('Vote…', 'Voting…', 'A votar…') : tx('Voter', 'Vote', 'Votar')}
                        <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">{n}</span>
                      </button>
                      {moderator && c.entry && (
                        <div className="flex flex-wrap gap-3 text-xs font-semibold">
                          <button type="button" disabled={busy} className="inline-flex items-center gap-1 text-ink/60 hover:text-night"
                            onClick={() => { const e = c.entry!; void run(() => setChallengeEntryHidden(e, !e.isHidden), e.isHidden ? tx('Vidéo de nouveau visible.', 'Video visible again.', 'Vídeo novamente visível.') : tx('Vidéo masquée.', 'Video hidden.', 'Vídeo ocultado.')); }}>
                            {c.entry.isHidden ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}{c.entry.isHidden ? tx('Rendre visible', 'Make visible', 'Tornar visível') : tx('Masquer', 'Hide', 'Ocultar')}
                          </button>
                          <button type="button" disabled={busy} onClick={() => setConfirm(c.entry!)} className="inline-flex items-center gap-1 text-red-700 hover:text-red-800"><Trash2 className="h-3.5 w-3.5" aria-hidden />{tx('Supprimer', 'Delete', 'Eliminar')}</button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
              {entries.loading && [0, 1].map((i) => <li key={`s${i}`}><Skeleton className="aspect-[9/16] rounded-3xl" /></li>)}
            </ul>
          )}
        </section>
        <div id="participer" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <EntryForm challenge={challenge} onPosted={() => void entries.reload()} />
        </div>
      </section>
      <ConfirmDialog open={!!confirm} danger loading={busy} onCancel={() => setConfirm(null)}
        onConfirm={async () => { if (confirm) await run(() => deleteChallengeEntry(confirm), tx('Participation supprimée.', 'Entry deleted.', 'Participação eliminada.')); setConfirm(null); }}
        title={tx('Supprimer cette participation ?', 'Delete this entry?', 'Eliminar esta participação?')} confirmLabel={tx('Supprimer', 'Delete', 'Eliminar')}
        message={tx('La vidéo sera effacée définitivement.', 'The video will be permanently erased.', 'O vídeo será apagado definitivamente.')} />
    </>
  );
}

type Mode = 'file' | 'tiktok';
const NAME_KEY = 'kcc.debate.name';

function EntryForm({ challenge, onPosted }: { challenge: Challenge; onPosted: () => void }) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const [mode, setMode] = useState<Mode>('file');
  const [name, setName] = useState(() => { try { return localStorage.getItem(NAME_KEY) ?? ''; } catch { return ''; } });
  const [place, setPlace] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'' | 'upload' | 'save'>('');

  useEffect(() => {
    if (!name && profile) setName([profile.firstName, profile.lastName].filter(Boolean).join(' '));
  }, [profile, name]);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const tooBig = tx('La vidéo dépasse 50 Mo. Envoyez une vidéo plus courte (1 minute suffit), ou partagez-la d’abord sur WhatsApp puis enregistrez-la : elle devient plus légère.', 'The video is larger than 50 MB. Send a shorter video (1 minute is enough), or share it on WhatsApp first and save it: it becomes lighter.', 'O vídeo ultrapassa 50 MB. Envie um vídeo mais curto (1 minuto chega), ou partilhe-o primeiro no WhatsApp e guarde-o: fica mais leve.');

  function pickFile(f: File | null) {
    setError('');
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl('');
    setFile(null);
    if (!f) return;
    if (!videoFormat(f.type, f.name)) return setError(tx('Ce fichier n’est pas une vidéo reconnue (mp4, mov…).', 'This file is not a recognised video (mp4, mov…).', 'Este ficheiro não é um vídeo reconhecido (mp4, mov…).'));
    if (f.size > CHALLENGE_VIDEO_MAX_BYTES) return setError(tooBig);
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError(tx('Indiquez votre nom.', 'Enter your name.', 'Indique o seu nome.'));
    if (mode === 'file' && !file) return setError(tx('Choisissez d’abord votre vidéo.', 'Choose your video first.', 'Escolha primeiro o seu vídeo.'));
    if (mode === 'tiktok' && !cleanTiktokUrl(tiktok)) return setError(tx('Collez le lien de votre vidéo TikTok (bouton « Partager » puis « Copier le lien »).', 'Paste the link to your TikTok video (“Share” then “Copy link”).', 'Cole a ligação do seu vídeo TikTok («Partilhar» e depois «Copiar ligação»).'));
    setError('');
    try {
      await addChallengeEntry({ challengeId: challenge.id, authorName: name, place, note, video: mode === 'file' ? file : null, tiktokUrl: mode === 'tiktok' ? tiktok : '' }, setStep);
      try { localStorage.setItem(NAME_KEY, name.trim()); } catch { /* stockage indisponible */ }
      pickFile(null);
      setTiktok('');
      setNote('');
      notify(tx('Bravo ! Votre vidéo est publiée. Partagez la page pour recevoir des votes.', 'Well done! Your video is published. Share the page to get votes.', 'Parabéns! O seu vídeo foi publicado. Partilhe a página para receber votos.'));
      onPosted();
    } catch (err) {
      const m = err instanceof Error ? err.message : '';
      setError(m === 'too-big' ? tooBig
        : m === 'format' ? tx('Format vidéo non reconnu.', 'Video format not recognised.', 'Formato de vídeo não reconhecido.')
          : m === 'tiktok' ? tx('Ce lien n’est pas un lien TikTok.', 'This is not a TikTok link.', 'Esta ligação não é do TikTok.')
            : m || tx('L’envoi a échoué. Vérifiez votre connexion puis réessayez.', 'Sending failed. Check your connection and try again.', 'O envio falhou. Verifique a ligação e tente de novo.'));
    } finally {
      setStep('');
    }
  }

  const tabs: { id: Mode; label: string; icon: typeof Video }[] = [
    { id: 'file', label: tx('Ma vidéo', 'My video', 'O meu vídeo'), icon: Video },
    { id: 'tiktok', label: tx('Lien TikTok', 'TikTok link', 'Ligação TikTok'), icon: Link2 },
  ];

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl border border-night/[0.06] bg-white p-6 shadow-lift">
      <div>
        <h2 className="font-display text-xl font-semibold text-night">{tx('Participer au challenge', 'Take part in the challenge', 'Participar no desafio')}</h2>
        <p className="mt-1 text-sm text-ink/60">{tx(`Chantez « ${challenge.song} » et envoyez votre vidéo.`, `Sing “${challenge.song}” and send your video.`, `Cante «${challenge.song}» e envie o seu vídeo.`)}</p>
      </div>
      <Field label={tx('Votre nom', 'Your name', 'O seu nome')} required>
        {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />}
      </Field>
      <Field label={tx('Ville ou paroisse (facultatif)', 'City or parish (optional)', 'Cidade ou paróquia (opcional)')}>
        {(p) => <Input {...p} value={place} onChange={(e) => setPlace(e.target.value)} maxLength={80} />}
      </Field>
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-mist p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setError(''); }}
            className={cn('flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition', mode === id ? 'bg-white text-night shadow-sm' : 'text-ink/60')}>
            <Icon className="h-4 w-4" aria-hidden />{label}
          </button>
        ))}
      </div>
      {mode === 'file' ? (
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-night/15 px-4 py-5 text-center text-sm font-semibold text-night hover:border-gold">
            <Video className="h-5 w-5 shrink-0 text-gold-600" aria-hidden />
            <span className="break-all">{file ? file.name : tx('Filmer ou choisir une vidéo', 'Film or choose a video', 'Filmar ou escolher um vídeo')}</span>
            <input type="file" accept="video/*,.mp4,.mov,.3gp,.webm" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
          </label>
          {fileUrl && <video src={fileUrl} controls playsInline className="max-h-80 w-full rounded-2xl bg-night" />}
          <p className="text-xs text-ink/50">{tx('50 Mo maximum, soit environ 1 minute de vidéo.', '50 MB maximum, about 1 minute of video.', 'Máximo 50 MB, cerca de 1 minuto de vídeo.')}</p>
        </div>
      ) : (
        <Field label={tx('Lien de votre vidéo TikTok', 'Link to your TikTok video', 'Ligação do seu vídeo TikTok')} hint={tx('Sur TikTok : « Partager » puis « Copier le lien ».', 'On TikTok: “Share” then “Copy link”.', 'No TikTok: «Partilhar» e depois «Copiar ligação».')}>
          {(p) => <Input {...p} value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="https://www.tiktok.com/@…" inputMode="url" />}
        </Field>
      )}
      <Field label={tx('Un mot (facultatif)', 'A note (optional)', 'Uma nota (opcional)')}>
        {(p) => <Textarea {...p} value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={CHALLENGE_NOTE_MAX} />}
      </Field>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={!!step} className="w-full" icon={<Send className="h-4 w-4" />}>
        {step === 'upload' ? tx('Envoi de la vidéo…', 'Uploading the video…', 'A enviar o vídeo…') : tx('Publier ma participation', 'Publish my entry', 'Publicar a minha participação')}
      </Button>
      <p className="text-xs text-ink/50">{tx('Les vidéos sont publiques. Les administrateurs peuvent retirer une vidéo déplacée.', 'Videos are public. Administrators may remove an inappropriate video.', 'Os vídeos são públicos. Os administradores podem retirar um vídeo inadequado.')}</p>
    </form>
  );
}
