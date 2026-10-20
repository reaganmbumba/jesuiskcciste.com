import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { coursesRepo, listMyEnrollments } from '@/services';

export default function MyCoursesPage() {
  const { profile } = useAuth();
  const { data, loading } = useAsync(() => Promise.all([listMyEnrollments(profile!.id), coursesRepo.all()]), [profile?.id]);
  if (loading) return <PageLoader />;
  const [enrollments = [], courses = []] = data ?? [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="font-display text-2xl font-semibold text-night">Mes formations</h1><ButtonLink to="/academie/formations" size="sm" variant="outline">Catalogue</ButtonLink></div>
      {enrollments.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {enrollments.map((e) => { const c = courses.find((x) => x.id === e.courseId); if (!c) return null; return (
            <Card key={e.courseId}><CardBody>
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{c.category}</p><h2 className="font-display text-lg font-semibold text-night">{c.title}</h2></div><Badge tone={e.progress >= 100 ? 'green' : 'blue'}>{e.progress >= 100 ? 'Terminée' : 'En cours'}</Badge></div>
              <div className="mt-4"><ProgressBar value={e.progress} /></div>
              <p className="mt-1 text-sm text-ink/60">{e.progress} % complété</p>
              <Link to={`/academie/formations/${c.slug}`} className="link-gold mt-4 inline-block text-sm">{e.progress >= 100 ? 'Revoir la formation' : 'Continuer'}</Link>
            </CardBody></Card>
          ); })}
        </div>
      ) : <EmptyState icon={<GraduationCap className="h-6 w-6" />} title="Vous ne suivez aucune formation." action={<ButtonLink to="/academie/formations">Découvrir les formations</ButtonLink>} />}
    </div>
  );
}
