import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeOff, Lock, MessageSquare, Pin, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { useAuth } from '@/features/auth/AuthContext';
import { listTopics } from '@/features/forum/forum';
import { TopicDialog } from '@/features/forum/ForumUi';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { can } from '@/lib/permissions';
import { formatDate } from '@/utils/format';

/** Forum : l'administration publie les sujets, les membres inscrits les commentent. */
export default function ForumPage() {
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const moderator = can(profile, 'moderation');
  const { data = [], loading, error, reload } = useAsync(() => listTopics(moderator), [moderator]);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader eyebrow={tx('Communauté', 'Community', 'Comunidade')} title={tx('Forum de discussion', 'Discussion forum', 'Fórum de discussão')}
        description={tx('Des sujets proposés par l’administration, commentés par les membres inscrits. Chaque commentaire affiche le nom du membre et sa paroisse.', 'Topics proposed by the administration, discussed by registered members. Each comment shows the member’s name and parish.', 'Temas propostos pela administração, comentados pelos membros inscritos. Cada comentário mostra o nome do membro e a sua paróquia.')} />

      <section className="container-page py-14">
        <DemoInline>{tx('Démonstration : sujet d’exemple. Les vrais sujets apparaissent dès que l’administration les publie.', 'Demo: sample topic. Real topics appear once the administration publishes them.', 'Demonstração: tema de exemplo. Os temas reais aparecem quando a administração os publicar.')}</DemoInline>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink/70">
            {profile
              ? tx('Choisissez un sujet pour lire les commentaires et donner votre avis.', 'Pick a topic to read the comments and share your view.', 'Escolha um tema para ler os comentários e dar a sua opinião.')
              : tx('Tout le monde peut lire. Pour commenter, connectez-vous avec votre compte de membre.', 'Anyone can read. To comment, log in with your member account.', 'Todos podem ler. Para comentar, inicie sessão com a sua conta de membro.')}
          </p>
          <div className="flex flex-wrap gap-2">
            {moderator && <Button size="sm" onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" />}>{tx('Nouveau sujet', 'New topic', 'Novo tema')}</Button>}
            {!profile && <ButtonLink to="/connexion" state={{ from: '/forum' }} size="sm" variant="outline">{tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>}
            {!profile && <ButtonLink to="/inscription" size="sm" variant="gold">{tx('S’inscrire', 'Sign up', 'Inscrever-se')}</ButtonLink>}
          </div>
        </div>

        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}</div>
        ) : data.length === 0 ? (
          <EmptyState icon={<MessageSquare className="h-6 w-6" aria-hidden />} title={tx('Aucun sujet pour le moment.', 'No topics yet.', 'Ainda não há temas.')}
            description={moderator ? tx('Publiez le premier sujet avec le bouton « Nouveau sujet ».', 'Publish the first topic with the “New topic” button.', 'Publique o primeiro tema com o botão «Novo tema».') : tx('Revenez bientôt : les premiers sujets arrivent.', 'Come back soon: the first topics are on their way.', 'Volte em breve: os primeiros temas estão a chegar.')} />
        ) : (
          <ul className="space-y-3">
            {data.map((t) => (
              <li key={t.id}>
                <Link to={`/forum/${t.id}`} className={`card-hover block rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${t.isHidden ? 'border-dashed border-night/20 opacity-70' : 'border-night/[0.06]'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {t.isPinned && <Badge tone="gold"><Pin className="h-3 w-3" aria-hidden />{tx('Épinglé', 'Pinned', 'Fixado')}</Badge>}
                    {t.isLocked && <Badge><Lock className="h-3 w-3" aria-hidden />{tx('Commentaires fermés', 'Comments closed', 'Comentários fechados')}</Badge>}
                    {t.isHidden && <Badge tone="red"><EyeOff className="h-3 w-3" aria-hidden />{tx('Masqué', 'Hidden', 'Oculto')}</Badge>}
                  </div>
                  <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-night">{t.title}</h2>
                  {t.body && <p className="mt-1.5 line-clamp-2 text-[15px] text-ink/70">{t.body}</p>}
                  <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/55">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-gold-700"><MessageSquare className="h-3.5 w-3.5" aria-hidden />
                      {t.commentCount === 0 ? tx('Aucun commentaire', 'No comments', 'Sem comentários') : t.commentCount === 1 ? tx('1 commentaire', '1 comment', '1 comentário') : tx(`${t.commentCount} commentaires`, `${t.commentCount} comments`, `${t.commentCount} comentários`)}
                    </span>
                    <span>{tx('Publié le', 'Posted on', 'Publicado a')} {formatDate(t.createdAt, locale)}</span>
                    {t.lastCommentAt && <span>{tx('Dernier commentaire le', 'Last comment on', 'Último comentário a')} {formatDate(t.lastCommentAt, locale)}</span>}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {moderator && <TopicDialog open={creating} onClose={() => setCreating(false)} onSaved={() => void reload()} />}
    </>
  );
}
