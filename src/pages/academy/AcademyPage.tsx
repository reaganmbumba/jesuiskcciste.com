import { Award, BookOpen, ClipboardCheck, ShieldCheck, Upload } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { ButtonLink } from '@/components/ui/Button';
import { CourseCard } from '@/components/cards/Cards';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { coursesRepo } from '@/services';
import { useI18n } from '@/i18n';

export default function AcademyPage() {
  const { tx } = useI18n();
  const { data = [], loading } = useAsync(async () => (await coursesRepo.all()).filter((c) => c.status === 'published'), []);
  const features = [
    { icon: BookOpen, t: tx('Modules et leçons', 'Modules and lessons', 'Módulos e lições'), d: tx('Textes, vidéos et documents PDF, avec suivi de progression.', 'Texts, videos and PDF documents, with progress tracking.', 'Textos, vídeos e documentos PDF, com acompanhamento do progresso.') },
    { icon: ClipboardCheck, t: tx('Examens et QCM', 'Exams and quizzes', 'Exames e testes'), d: tx('Correction automatique côté serveur, seuil et tentatives configurables.', 'Automatic server-side marking, with configurable pass mark and attempts.', 'Correção automática no servidor, com nota mínima e tentativas configuráveis.') },
    { icon: Award, t: tx('Certificats vérifiables', 'Verifiable certificates', 'Certificados verificáveis'), d: tx('Émis après validation des critères, avec identifiant unique.', 'Issued once the criteria are met, with a unique ID.', 'Emitidos após validação dos critérios, com identificador único.') },
    { icon: Upload, t: tx('Supports validés', 'Approved materials', 'Materiais validados'), d: tx('Les contenus sont importés par les formateurs habilités.', 'Content is uploaded by authorised trainers.', 'Os conteúdos são importados pelos formadores autorizados.') },
  ];
  return (
    <>
      <PageHeader eyebrow={tx('Académie KCC', 'KCC Academy', 'Academia KCC')} title={tx('Apprendre, grandir et servir', 'Learn, grow and serve', 'Aprender, crescer e servir')} description={tx('Des parcours de formation pour les membres, les responsables, les chorales et les formateurs.', 'Learning paths for members, leaders, choirs and trainers.', 'Percursos de formação para membros, responsáveis, coros e formadores.')}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/academie/formations" variant="gold">{tx('Voir le catalogue', 'View the catalogue', 'Ver o catálogo')}</ButtonLink>
          <ButtonLink to="/academie/verifier" variant="light" icon={<ShieldCheck className="h-4 w-4" />}>{tx('Vérifier un certificat', 'Verify a certificate', 'Verificar um certificado')}</ButtonLink>
        </div>
      </PageHeader>
      <section className="container-page py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft"><Icon className="h-7 w-7 text-gold" /><h2 className="mt-3 font-semibold text-night">{t}</h2><p className="mt-1 text-sm text-ink/60">{d}</p></div>
          ))}
        </div>
        <div className="mt-16">
          <SectionHeading eyebrow={tx('Catalogue', tx('Catalogue', 'Catalogue', 'Catálogo'), 'Catálogo')} title={tx('Formations disponibles', 'Available courses', 'Formações disponíveis')} action={<ButtonLink to="/academie/formations" variant="outline" size="sm">{tx('Tout le catalogue', 'Full catalogue', 'Todo o catálogo')}</ButtonLink>} />
          {loading ? <Skeleton className="h-80" /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{data.map((c) => <CourseCard key={c.id} c={c} />)}</div>}
        </div>
        <p className="mt-10 rounded-xl bg-white p-4 text-sm text-ink/65 ring-1 ring-night/[0.06]">{tx('Aucun contenu doctrinal n’est produit automatiquement par la plateforme. Les supports officiels sont importés et validés par les responsables compétents.', 'The platform never generates doctrinal content automatically. Official materials are uploaded and approved by the competent leaders.', 'A plataforma não produz automaticamente nenhum conteúdo doutrinal. Os materiais oficiais são importados e validados pelos responsáveis competentes.')}</p>
      </section>
    </>
  );
}
