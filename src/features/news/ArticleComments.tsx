import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Heart, MessageSquare, Send, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { Paragraphs } from '@/features/forum/ForumUi';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { can } from '@/lib/permissions';
import { formatDate, formatTime } from '@/utils/format';
import type { ArticleComment } from '@/types';
import { addArticleComment, ARTICLE_COMMENT_MAX, deleteArticleComment, getArticleLikes, listArticleComments, setArticleCommentHidden, setArticleLiked } from './articleComments';

/** « J'aime » et commentaires des membres sous une actualité. */
export function ArticleComments({ articleId }: { articleId: string }) {
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const moderator = can(profile, 'moderation');
  const comments = useAsync(() => listArticleComments(articleId, moderator), [articleId, moderator]);
  const [confirm, setConfirm] = useState<ArticleComment | null>(null);
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
  const count = list.filter((c) => !c.isHidden).length;
  return (
    <div className="mt-8 space-y-6">
      <LikeButton articleId={articleId} />
      <section aria-labelledby="article-comments-title" className="rounded-3xl border border-night/[0.06] bg-white p-6 shadow-sm sm:p-8">
        <h2 id="article-comments-title" className="flex items-center gap-2 font-display text-xl font-semibold text-night">
          <MessageSquare className="h-5 w-5 text-gold-600" aria-hidden />
          {count === 0 ? tx('Commentaires', 'Comments', 'Comentários') : count === 1 ? tx('1 commentaire', '1 comment', '1 comentário') : tx(`${count} commentaires`, `${count} comments`, `${count} comentários`)}
        </h2>
        {comments.error ? <div className="mt-4"><ErrorState error={comments.error} onRetry={comments.reload} /></div> : comments.loading ? (
          <div className="mt-5 space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        ) : list.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">{tx('Soyez le premier à donner votre avis sur cette actualité.', 'Be the first to share your view on this news.', 'Seja o primeiro a dar a sua opinião sobre esta notícia.')}</p>
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
                    </div>
                    <p className="text-xs text-ink/50">{formatDate(c.createdAt, locale)} · {formatTime(c.createdAt, locale)}</p>
                    <Paragraphs text={c.body} className="mt-2 space-y-2 break-words text-[15px] leading-relaxed text-ink/85" />
                    {(moderator || own) && (
                      <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                        {moderator && (
                          <button type="button" disabled={busy} className="inline-flex items-center gap-1 text-ink/60 hover:text-night"
                            onClick={() => run(() => setArticleCommentHidden(c, !c.isHidden), c.isHidden ? tx('Commentaire de nouveau visible.', 'Comment visible again.', 'Comentário novamente visível.') : tx('Commentaire masqué.', 'Comment hidden.', 'Comentário ocultado.'))}>
                            {c.isHidden ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}{c.isHidden ? tx('Rendre visible', 'Make visible', 'Tornar visível') : tx('Masquer', 'Hide', 'Ocultar')}
                          </button>
                        )}
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
      <CommentForm articleId={articleId} onPosted={() => void comments.reload()} />
      <ConfirmDialog open={!!confirm} danger loading={busy} onCancel={() => setConfirm(null)}
        onConfirm={async () => { if (confirm) await run(() => deleteArticleComment(confirm), tx('Commentaire supprimé.', 'Comment deleted.', 'Comentário eliminado.')); setConfirm(null); }}
        title={tx('Supprimer ce commentaire ?', 'Delete this comment?', 'Eliminar este comentário?')} confirmLabel={tx('Supprimer', 'Delete', 'Eliminar')}
        message={tx('Le commentaire sera effacé définitivement.', 'The comment will be permanently erased.', 'O comentário será apagado definitivamente.')} />
    </div>
  );
}

function LikeButton({ articleId }: { articleId: string }) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const location = useLocation();
  const likes = useAsync(() => getArticleLikes(articleId, profile?.id), [articleId, profile?.id]);
  const [busy, setBusy] = useState(false);
  const total = likes.data?.likes ?? 0;
  const liked = !!likes.data?.liked;
  const label = total === 0 ? tx('J’aime', 'Like', 'Gosto') : total === 1 ? tx('1 personne aime', '1 person likes this', '1 pessoa gosta') : tx(`${total} personnes aiment`, `${total} people like this`, `${total} pessoas gostam`);

  async function toggle() {
    if (!profile) return;
    setBusy(true);
    try {
      await setArticleLiked(articleId, profile.id, !liked);
      await likes.reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('L’action a échoué.', 'The action failed.', 'A ação falhou.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-night"><Heart className="h-5 w-5 text-red-500" aria-hidden />{label}</span>
        <Link to="/connexion" state={{ from: location.pathname }} className="text-sm font-semibold text-gold-700 underline">{tx('Connectez-vous pour aimer', 'Log in to like', 'Inicie sessão para gostar')}</Link>
      </div>
    );
  }
  return (
    <button type="button" onClick={toggle} disabled={busy || likes.loading} aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${liked ? 'border-red-200 bg-red-50 text-red-700' : 'border-night/10 bg-white text-night hover:border-red-200 hover:text-red-700'}`}>
      <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-red-500'}`} aria-hidden />{label}
    </button>
  );
}

function CommentForm({ articleId, onPosted }: { articleId: string; onPosted: () => void }) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const location = useLocation();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const box = 'rounded-3xl border border-night/[0.06] bg-mist/70 p-6 text-sm text-ink/75 sm:p-8';

  if (!profile) {
    return (
      <div className={box}>
        <p className="font-semibold text-night">{tx('Vous voulez donner votre avis ?', 'Want to share your view?', 'Quer dar a sua opinião?')}</p>
        <p className="mt-1">{tx('Seuls les membres inscrits peuvent commenter. Votre nom et votre paroisse s’afficheront avec votre commentaire.', 'Only registered members can comment. Your name and parish will be shown with your comment.', 'Só os membros inscritos podem comentar. O seu nome e a sua paróquia aparecerão com o seu comentário.')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink to="/connexion" state={{ from: location.pathname }} size="sm">{tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>
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
      await addArticleComment(articleId, body, profile!);
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
      <label htmlFor="article-comment" className="font-display text-lg font-semibold text-night">{tx('Votre avis', 'Your view', 'A sua opinião')}</label>
      <Textarea id="article-comment" className="mt-3" rows={4} maxLength={ARTICLE_COMMENT_MAX} value={body} onChange={(e) => setBody(e.target.value)} placeholder={tx('Écrivez votre commentaire avec respect…', 'Write your comment respectfully…', 'Escreva o seu comentário com respeito…')} />
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
