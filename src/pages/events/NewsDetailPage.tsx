import { useParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
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
export default function NewsDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { locale } = useI18n();
  const { data, loading } = useAsync(async () => (await listPublishedAnnouncements({ signedIn: !!profile })).find((a) => a.id === id) ?? null, [id, profile?.id]);
  if (loading) return <PageLoader />;
  if (!data) return (
    <div className="container-page py-16">
      <EmptyState icon={<Lock className="h-6 w-6" />} title="Annonce introuvable ou réservée" description={profile ? 'Cette annonce n’existe pas ou ne vous est pas destinée.' : 'Cette annonce est peut-être réservée aux membres. Connectez-vous pour y accéder.'} action={<ButtonLink to={profile ? '/actualites' : '/connexion'} variant="outline">{profile ? 'Toutes les annonces' : 'Se connecter'}</ButtonLink>} />
    </div>
  );
  return (
    <>
      <PageHeader eyebrow={data.category} title={data.title} description={data.summary}>
        <p className="text-sm text-white/65">Publié le {formatDate(data.publishedAt, locale)} · {data.author}</p>
      </PageHeader>
      <article className="container-page max-w-3xl py-12">
        {data.imageUrl && <img src={data.imageUrl} alt="" className="mb-6 w-full rounded-2xl object-cover" loading="lazy" />}
        <Card><CardBody className="prose-kcc">{data.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}</CardBody></Card>
        <ButtonLink to="/actualites" variant="ghost" className="mt-6" icon={<ArrowLeft className="h-4 w-4" />}>Toutes les annonces</ButtonLink>
      </article>
    </>
  );
}
