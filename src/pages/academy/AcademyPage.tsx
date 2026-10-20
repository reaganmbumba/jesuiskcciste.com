import { Award, BookOpen, ClipboardCheck, ShieldCheck, Upload } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { ButtonLink } from '@/components/ui/Button';
import { CourseCard } from '@/components/cards/Cards';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { coursesRepo } from '@/services';

export default function AcademyPage() {
  const { data = [], loading } = useAsync(async () => (await coursesRepo.all()).filter((c) => c.status === 'published'), []);
  const features = [
    { icon: BookOpen, t: 'Modules et leçons', d: 'Textes, vidéos et documents PDF, avec suivi de progression.' },
    { icon: ClipboardCheck, t: 'Examens et QCM', d: 'Correction automatique côté serveur, seuil et tentatives configurables.' },
    { icon: Award, t: 'Certificats vérifiables', d: 'Émis après validation des critères, avec identifiant unique.' },
    { icon: Upload, t: 'Supports validés', d: 'Les contenus sont importés par les formateurs habilités.' },
  ];
  return (
    <>
      <PageHeader eyebrow="Académie KCC" title="Apprendre, grandir et servir" description="Des parcours de formation pour les membres, les responsables, les chorales et les formateurs.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/academie/formations" variant="gold">Voir le catalogue</ButtonLink>
          <ButtonLink to="/academie/verifier" variant="light" icon={<ShieldCheck className="h-4 w-4" />}>Vérifier un certificat</ButtonLink>
        </div>
      </PageHeader>
      <section className="container-page py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft"><Icon className="h-7 w-7 text-gold" /><h2 className="mt-3 font-semibold text-night">{t}</h2><p className="mt-1 text-sm text-ink/60">{d}</p></div>
          ))}
        </div>
        <div className="mt-16">
          <SectionHeading eyebrow="Catalogue" title="Formations disponibles" action={<ButtonLink to="/academie/formations" variant="outline" size="sm">Tout le catalogue</ButtonLink>} />
          {loading ? <Skeleton className="h-80" /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{data.map((c) => <CourseCard key={c.id} c={c} />)}</div>}
        </div>
        <p className="mt-10 rounded-xl bg-white p-4 text-sm text-ink/65 ring-1 ring-night/[0.06]">Aucun contenu doctrinal n’est produit automatiquement par la plateforme. Les supports officiels sont importés et validés par les responsables compétents.</p>
      </section>
    </>
  );
}
