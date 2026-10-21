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
  if (loading) return <PageLoader />;
  if (!data) return (
    <div className="container-page py-16">
      <EmptyState icon={<Lock className="h-6 w-6" />} title={tx('Annonce introuvable ou réservée', 'Announcement not found or restricted', 'Anúncio não encontrado ou reservado')} description={profile ? tx('Cette annonce n’existe pas ou ne vous est pas destinée.', 'This announcement does not exist or is not meant for you.', 'Este anúncio não existe ou não se destina a si.') : tx('Cette annonce est peut-être réservée aux membres. Connectez-vous pour y accéder.', 'This announcement may be for members only. Log in to view it.', 'Este anúncio pode estar reservado aos membros. Inicie sessão para aceder.')} action={<ButtonLink to={profile ? '/actualites' : '/connexion'} variant="outline">{profile ? tx('Toutes les annonces', 'All announcements', 'Todos os anúncios') : tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>} />
    </div>
  );
  return (
    <>
      <PageHeader image={data.imageUrl} eyebrow={data.category} title={data.title} description={data.summary}>
        <p className="text-sm text-white/65">{tx('Publié le', 'Published on', 'Publicado a')} {formatDate(data.publishedAt, locale)} · {data.author}</p>
      </PageHeader>
      <article className="container-page max-w-3xl py-12">
        {data.imageUrl && <img src={data.imageUrl} alt="" className="mb-6 w-full rounded-2xl object-cover" loading="lazy" />}
        <Card><CardBody className="prose-kcc">{data.content.split('\n').map((p, i) => (isHeading(p) ? <h3 key={i} className="!mt-7 text-sm font-bold tracking-wide text-night">{p}</h3> : <p key={i}>{p}</p>))}</CardBody></Card>
        <ShareButtons title={data.title} text={data.summary} className="mt-6" />
        <ButtonLink to="/actualites" variant="ghost" className="mt-6" icon={<ArrowLeft className="h-4 w-4" />}>{tx('Toutes les annonces', 'All announcements', 'Todos os anúncios')}</ButtonLink>
      </article>
    </>
  );
}
