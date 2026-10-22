import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Eye, EyeOff, Lock, LockOpen, MessageSquare, Pencil, Pin, PinOff, Send, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { ShareButtons } from '@/components/common/ShareButtons';
import { useAuth } from '@/features/auth/AuthContext';
import { addComment, COMMENT_MAX, deleteComment, deleteTopic, getTopic, listComments, setCommentHidden, updateTopic } from '@/features/forum/forum';
import { Paragraphs, TopicDialog } from '@/features/forum/ForumUi';
import { WriteToMemberButton } from '@/features/messages/MessagesUi';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useI18n } from '@/i18n';
import { can } from '@/lib/permissions';
import { formatDate, formatTime } from '@/utils/format';
import type { ForumComment, ForumTopic } from '@/types';

type Confirm = { kind: 'topic' } | { kind: 'comment'; comment: ForumComment };

/** Un sujet du forum et ses commentaires (nom du membre + paroisse). */
export default function ForumTopicPage() {
  const { id = '' } = useParams();
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const moderator = can(profile, 'moderation');
  const topic = useAsync(() => getTopic(id), [id]);
  const comments = useAsync(() => listComments(id, moderator), [id, moderator]);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [busy, setBusy] = useState(false);
  const t = topic.data;
  usePageMeta({ title: t?.title ?? tx('Forum de discussion', 'Discussion forum', 'Fórum de discussão'), description: t?.body || undefined });

  async function run(action: () => Promise<void>, done: string) {
    setBusy(true);
    try {
      await action();
      notify(done);
      await Promise.all([topic.reload(), comments.reload()]);
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('L’action a échoué.', 'The action failed.', 'A ação falhou.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!confirm) return;
    if (confirm.kind === 'topic') {
      setBusy(true);
      try {
        await deleteTopic(id);
        notify(tx('Sujet supprimé.', 'Topic deleted.', 'Tema eliminado.'));
        navigate('/forum');
      } catch (e) {
        notify(e instanceof Error ? e.message : tx('La suppression a échoué.', 'Deletion failed.', 'A eliminação falhou.'), 'error');
      } finally {
        setBusy(false);
        setConfirm(null);
      }
      return;
    }
    await run(() => deleteComment(confirm.comment), tx('Commentaire supprimé.', 'Comment deleted.', 'Comentário eliminado.'));
    setConfirm(null);
  }

  const back = (
    <Link to="/forum" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
      <ArrowLeft className="h-4 w-4" aria-hidden />{tx('Tous les sujets', 'All topics', 'Todos os temas')}
    </Link>
  );

  return (
    <>
      <header className="relative isolate overflow-hidden bg-night-900 pb-24 pt-10 text-white sm:pb-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial opacity-70" aria-hidden />
        <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-gold/25 blur-[110px]" aria-hidden />
        <div className="container-page">{back}</div>
      </header>

      <section className="container-page relative -mt-20 pb-16">
        <div className="mx-auto max-w-3xl space-y-6">
          {topic.error ? <ErrorState error={topic.error} onRetry={topic.reload} /> : topic.loading ? (
            <Skeleton className="h-64 rounded-3xl" />
          ) : !t ? (
            <EmptyState title={tx('Ce sujet est introuvable.', 'This topic could not be found.', 'Este tema não foi encontrado.')} action={<Link to="/forum" className="text-sm font-semibold text-gold-700 underline">{tx('Voir les sujets', 'See the topics', 'Ver os temas')}</Link>} />
          ) : (
            <>
              <article className="overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-lift">
                <div className="px-6 pb-6 pt-8 sm:px-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow text-gold-600">{tx('Forum de discussion', 'Discussion forum', 'Fórum de discussão')}</span>
                    {t.isPinned && <Badge tone="gold"><Pin className="h-3 w-3" aria-hidden />{tx('Épinglé', 'Pinned', 'Fixado')}</Badge>}
                    {t.isLocked && <Badge><Lock className="h-3 w-3" aria-hidden />{tx('Commentaires fermés', 'Comments closed', 'Comentários fechados')}</Badge>}
                    {t.isHidden && <Badge tone="red"><EyeOff className="h-3 w-3" aria-hidden />{tx('Masqué au public', 'Hidden from the public', 'Oculto ao público')}</Badge>}
                  </div>
                  <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-night sm:text-4xl">{t.title}</h1>
                  <p className="mt-2 text-sm text-ink/55">{tx('Publié par l’administration le', 'Posted by the administration on', 'Publicado pela administração a')} {formatDate(t.createdAt, locale)}</p>
                  {t.body && <Paragraphs text={t.body} className="prose-kcc mt-5" />}
                  <ShareButtons size="sm" url={`/forum/${t.id}`} title={t.title} className="mt-6" />
                </div>
                {moderator && (
                  <div className="flex flex-wrap gap-2 border-t border-night/[0.06] bg-mist/60 px-6 py-4 sm:px-8">
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)} icon={<Pencil className="h-4 w-4" />}>{tx('Modifier', 'Edit', 'Editar')}</Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => updateTopic(t.id, { isPinned: !t.isPinned }), t.isPinned ? tx('Sujet désépinglé.', 'Topic unpinned.', 'Tema desafixado.') : tx('Sujet épinglé.', 'Topic pinned.', 'Tema fixado.'))}
                      icon={t.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}>{t.isPinned ? tx('Désépingler', 'Unpin', 'Desafixar') : tx('Épingler', 'Pin', 'Fixar')}</Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => updateTopic(t.id, { isLocked: !t.isLocked }), t.isLocked ? tx('Commentaires rouverts.', 'Comments reopened.', 'Comentários reabertos.') : tx('Commentaires fermés.', 'Comments closed.', 'Comentários fechados.'))}
                      icon={t.isLocked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}>{t.isLocked ? tx('Rouvrir les commentaires', 'Reopen comments', 'Reabrir comentários') : tx('Fermer les commentaires', 'Close comments', 'Fechar comentários')}</Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => updateTopic(t.id, { isHidden: !t.isHidden }), t.isHidden ? tx('Sujet de nouveau visible.', 'Topic visible again.', 'Tema novamente visível.') : tx('Sujet masqué.', 'Topic hidden.', 'Tema ocultado.'))}
                      icon={t.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}>{t.isHidden ? tx('Rendre visible', 'Make visible', 'Tornar visível') : tx('Masquer', 'Hide', 'Ocultar')}</Button>
                    <Button size="sm" variant="ghost" className="text-red-700" onClick={() => setConfirm({ kind: 'topic' })} icon={<Trash2 className="h-4 w-4" />}>{tx('Supprimer', 'Delete', 'Eliminar')}</Button>
                  </div>
                )}
              </article>

              <CommentList topic={t} comments={comments} moderator={moderator} busy={busy}
                onToggleHidden={(c) => run(() => setCommentHidden(c, !c.isHidden), c.isHidden ? tx('Commentaire de nouveau visible.', 'Comment visible again.', 'Comentário novamente visível.') : tx('Commentaire masqué.', 'Comment hidden.', 'Comentário ocultado.'))}
                onDelete={(c) => setConfirm({ kind: 'comment', comment: c })} />

              <CommentForm topic={t} onPosted={() => void Promise.all([topic.reload(), comments.reload()])} />
            </>
          )}
        </div>
      </section>

      {moderator && t && <TopicDialog open={editing} topic={t} onClose={() => setEditing(false)} onSaved={() => void topic.reload()} />}
      <ConfirmDialog open={!!confirm} danger loading={busy} onCancel={() => setConfirm(null)} onConfirm={confirmDelete}
        title={confirm?.kind === 'topic' ? tx('Supprimer ce sujet ?', 'Delete this topic?', 'Eliminar este tema?') : tx('Supprimer ce commentaire ?', 'Delete this comment?', 'Eliminar este comentário?')}
        confirmLabel={tx('Supprimer', 'Delete', 'Eliminar')}
        message={confirm?.kind === 'topic' ? tx('Le sujet et tous ses commentaires seront effacés définitivement. Pour le retirer seulement du public, utilisez plutôt « Masquer ».', 'The topic and all its comments will be permanently erased. To only remove it from the public, use “Hide” instead.', 'O tema e todos os seus comentários serão apagados definitivamente. Para apenas o retirar do público, use antes «Ocultar».') : tx('Le commentaire sera effacé définitivement.', 'The comment will be permanently erased.', 'O comentário será apagado definitivamente.')} />
    </>
  );
}

function CommentList({ topic, comments, moderator, busy, onToggleHidden, onDelete }: {
  topic: ForumTopic; comments: { data?: ForumComment[]; loading: boolean; error: unknown; reload: () => Promise<void> };
  moderator: boolean; busy: boolean; onToggleHidden: (c: ForumComment) => void; onDelete: (c: ForumComment) => void;
}) {
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const list = comments.data ?? [];
  const count = list.filter((c) => !c.isHidden).length;
  return (
    <section aria-labelledby="comments-title" className="rounded-3xl border border-night/[0.06] bg-white p-6 shadow-sm sm:p-8">
      <h2 id="comments-title" className="flex items-center gap-2 font-display text-xl font-semibold text-night">
        <MessageSquare className="h-5 w-5 text-gold-600" aria-hidden />
        {count === 0 ? tx('Commentaires', 'Comments', 'Comentários') : count === 1 ? tx('1 commentaire', '1 comment', '1 comentário') : tx(`${count} commentaires`, `${count} comments`, `${count} comentários`)}
      </h2>
      {comments.error ? <div className="mt-4"><ErrorState error={comments.error} onRetry={comments.reload} /></div> : comments.loading ? (
        <div className="mt-5 space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">{topic.isLocked ? tx('Aucun commentaire.', 'No comments.', 'Sem comentários.') : tx('Soyez le premier à commenter ce sujet.', 'Be the first to comment on this topic.', 'Seja o primeiro a comentar este tema.')}</p>
      ) : (
        <ol className="mt-5 divide-y divide-night/[0.06]">
          {list.map((c) => {
            const own = !!profile && c.authorId === profile.id;
            const initials = c.authorName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
            return (
              <li key={c.id} className={`flex gap-3 py-5 first:pt-0 last:pb-0 ${c.isHidden ? 'opacity-60' : ''}`}>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-200 to-gold-400 text-sm font-semibold text-night" aria-hidden>{initials || '?'}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <p className="font-semibold text-night">{c.authorName}</p>
                    <p className="inline-flex items-center gap-1 text-sm text-gold-700">
                      <Building2 className="h-3.5 w-3.5" aria-hidden />{c.parishName || tx('Paroisse non indiquée', 'Parish not given', 'Paróquia não indicada')}
                    </p>
                    {c.isHidden && <Badge tone="red">{tx('Masqué', 'Hidden', 'Oculto')}</Badge>}
                    {profile?.status === 'active' && c.authorId && !own && (
                      <WriteToMemberButton compact memberId={c.authorId} label={tx('Écrire en privé', 'Write privately', 'Escrever em privado')} />
                    )}
                  </div>
                  <p className="text-xs text-ink/50">{formatDate(c.createdAt, locale)} · {formatTime(c.createdAt, locale)}</p>
                  <Paragraphs text={c.body} className="mt-2 space-y-2 break-words text-[15px] leading-relaxed text-ink/85" />
                  {(moderator || own) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                      {moderator && <button type="button" disabled={busy} onClick={() => onToggleHidden(c)} className="inline-flex items-center gap-1 text-ink/60 hover:text-night">{c.isHidden ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}{c.isHidden ? tx('Rendre visible', 'Make visible', 'Tornar visível') : tx('Masquer', 'Hide', 'Ocultar')}</button>}
                      <button type="button" disabled={busy} onClick={() => onDelete(c)} className="inline-flex items-center gap-1 text-red-700 hover:text-red-800"><Trash2 className="h-3.5 w-3.5" aria-hidden />{tx('Supprimer', 'Delete', 'Eliminar')}</button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function CommentForm({ topic, onPosted }: { topic: ForumTopic; onPosted: () => void }) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const box = 'rounded-3xl border border-night/[0.06] bg-mist/70 p-6 text-sm text-ink/75 sm:p-8';

  if (topic.isLocked) return <p className={box}><Lock className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden />{tx('Les commentaires sont fermés pour ce sujet.', 'Comments are closed for this topic.', 'Os comentários estão fechados para este tema.')}</p>;
  if (!profile) {
    return (
      <div className={box}>
        <p className="font-semibold text-night">{tx('Vous voulez commenter ?', 'Want to comment?', 'Quer comentar?')}</p>
        <p className="mt-1">{tx('Seuls les membres inscrits peuvent commenter. Votre nom et votre paroisse s’afficheront avec votre commentaire.', 'Only registered members can comment. Your name and parish will be shown with your comment.', 'Só os membros inscritos podem comentar. O seu nome e a sua paróquia aparecerão com o seu comentário.')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink to="/connexion" state={{ from: `/forum/${topic.id}` }} size="sm">{tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>
          <ButtonLink to="/inscription" size="sm" variant="gold">{tx('Créer mon compte', 'Create my account', 'Criar a minha conta')}</ButtonLink>
        </div>
      </div>
    );
  }
  if (profile.status !== 'active') {
    return <p className={box}>{tx('Votre compte est en attente de validation. Vous pourrez commenter dès qu’un responsable l’aura validé.', 'Your account is awaiting approval. You will be able to comment as soon as a leader approves it.', 'A sua conta aguarda validação. Poderá comentar assim que um responsável a validar.')}</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await addComment(topic.id, body, profile!);
      setBody('');
      notify(tx('Commentaire publié.', 'Comment posted.', 'Comentário publicado.'));
      onPosted();
    } catch (err) {
      notify(err instanceof Error ? err.message : tx('L’envoi a échoué.', 'Sending failed.', 'O envio falhou.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-night/[0.06] bg-white p-6 shadow-sm sm:p-8">
      <label htmlFor="forum-comment" className="font-display text-lg font-semibold text-night">{tx('Votre commentaire', 'Your comment', 'O seu comentário')}</label>
      <Textarea id="forum-comment" className="mt-3" rows={4} maxLength={COMMENT_MAX} value={body} onChange={(e) => setBody(e.target.value)} placeholder={tx('Écrivez votre avis avec respect…', 'Share your view respectfully…', 'Escreva a sua opinião com respeito…')} />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink/60">
          {profile.parishId
            ? tx('Votre nom et votre paroisse seront affichés avec ce commentaire.', 'Your name and parish will be shown with this comment.', 'O seu nome e a sua paróquia aparecerão com este comentário.')
            : <>{tx('Votre nom sera affiché. Ajoutez votre paroisse dans ', 'Your name will be shown. Add your parish in ', 'O seu nome aparecerá. Adicione a sua paróquia em ')}<Link to="/espace/profil" className="font-semibold text-gold-700 underline">{tx('Mon profil', 'My profile', 'O meu perfil')}</Link>{tx(' pour qu’elle s’affiche aussi.', ' so it is shown too.', ' para que também apareça.')}</>}
        </p>
        <Button type="submit" size="sm" loading={busy} disabled={!body.trim()} icon={<Send className="h-4 w-4" />}>{tx('Publier', 'Post', 'Publicar')}</Button>
      </div>
    </form>
  );
}
