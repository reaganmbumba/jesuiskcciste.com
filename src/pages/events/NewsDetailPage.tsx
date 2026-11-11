import { useParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { ShareButtons } from '@/components/common/ShareButtons';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { ButtonLink } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { ArticleComments } from '@/features/news/ArticleComments';
import { MatriculeGate } from '@/features/news/MatriculeGate';
import { excerptLength, getReaderStatus, isPublicArticle } from '@/features/news/readerAccess';
import { can } from '@/lib/permissions';
import { listPublishedAnnouncements } from '@/services';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';

/** Une publication privée n'est pas accessible par lien public (filtrage par audience, RLS en production). */

/** Une ligne courte entièrement en majuscules est un intertitre. */
const isHeading = (p: string) => p.length > 3 && p.length < 90 && /\p{L}/u.test(p) && p === p.toUpperCase();
export default function NewsDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { locale, tx } = useI18n();
  const { data, loading } = useAsync(async () => (await listPublishedAnnouncements({ signedIn: !!profile })).find((a) => a.id === id) ?? null, [id, profile?.id]);
  // Les communiqués sont pour tout le monde ; le reste demande le matricule sur cet appareil.
  const isPublic = !data || isPublicArticle(data);
  const reader = useAsync(
    () => (isPublic ? Promise.resolve('ok' as const) : getReaderStatus(!!profile, can(profile, 'announcements.create'), profile?.status === 'active' || profile?.status === 'pending').catch(() => 'matricule_requis' as const)),
    [isPublic, profile?.id, profile?.status],
  );
  if (loading || (!isPublic && reader.loading && !reader.data)) return <PageLoader />;
  if (!data) return (
    <div className="container-page py-16">
      <EmptyState icon={<Lock className="h-6 w-6" />} title={tx('Annonce introuvable ou réservée', 'Announcement not found or restricted', 'Anúncio não encontrado ou reservado')} description={profile ? tx('Cette annonce n’existe pas ou ne vous est pas destinée.', 'This announcement does not exist or is not meant for you.', 'Este anúncio não existe ou não se destina a si.') : tx('Cette annonce est peut-être réservée aux membres. Connectez-vous pour y accéder.', 'This announcement may be for members only. Log in to view it.', 'Este anúncio pode estar reservado aos membros. Inicie sessão para aceder.')} action={<ButtonLink to={profile ? '/actualites' : '/connexion'} variant="outline">{profile ? tx('Toutes les annonces', 'All announcements', 'Todos os anúncios') : tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>} />
    </div>
  );
  const paragraphs = data.content.split('\n');
  const locked = !isPublic && reader.data !== 'ok';
  let shown = paragraphs;
  if (locked) {
    const keep = excerptLength(paragraphs);
    let seen = 0;
    const cut = paragraphs.findIndex((p) => p.trim() && !isHeading(p) && ++seen > keep);
    shown = cut === -1 ? paragraphs.slice(0, 1) : paragraphs.slice(0, cut);
    // Ne pas finir l'extrait sur un intertitre.
    while (shown.length > 1 && (!shown[shown.length - 1].trim() || isHeading(shown[shown.length - 1]))) shown = shown.slice(0, -1);
  }
  return (
    <>
      <PageHeader image={data.imageUrl} eyebrow={data.category} title={data.title} description={data.summary}>
        <p className="text-sm text-white/65">{tx('Publié le', 'Published on', 'Publicado a')} {formatDate(data.publishedAt, locale)} · {data.author}</p>
      </PageHeader>
      <article className="container-page max-w-3xl py-12">
        {data.videoUrl
          ? <video src={data.videoUrl} poster={data.imageUrl ?? undefined} controls playsInline preload="metadata" className="mb-6 w-full rounded-2xl bg-black" />
          : data.gallery?.length
            ? <div className="mb-6 grid gap-3 sm:grid-cols-3">{data.gallery.map((src) => <a key={src} href={src} target="_blank" rel="noreferrer"><img src={src} alt="" className="aspect-[3/4] w-full rounded-2xl object-cover" loading="lazy" /></a>)}</div>
            : data.imageUrl && <img src={data.imageUrl} alt="" className="mb-6 w-full rounded-2xl object-cover" loading="lazy" />}
        <Card className={locked ? 'relative overflow-hidden' : undefined}>
          <CardBody className="prose-kcc [overflow-wrap:anywhere]">{shown.map((p, i) => (isHeading(p) ? <h3 key={i} className="!mt-7 text-sm font-bold tracking-wide text-night">{p}</h3> : <p key={i}>{p}</p>))}</CardBody>
          {locked && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" aria-hidden />}
        </Card>
        {locked && reader.data && <MatriculeGate status={reader.data} onUnlocked={reader.reload} />}
        <ShareButtons title={data.title} text={data.summary} image={data.imageUrl} className="mt-6" />
        <ArticleComments articleId={data.id} />
        <ButtonLink to="/actualites" variant="ghost" className="mt-6" icon={<ArrowLeft className="h-4 w-4" />}>{tx('Toutes les annonces', 'All announcements', 'Todos os anúncios')}</ButtonLink>
      </article>
    </>
  );
}
