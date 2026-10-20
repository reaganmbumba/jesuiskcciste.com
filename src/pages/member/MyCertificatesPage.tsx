import { Award, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { ButtonLink, Button } from '@/components/ui/Button';
import { DemoInline } from '@/components/common/DemoNotice';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { listMyCertificates } from '@/services';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';

export default function MyCertificatesPage() {
  const { profile } = useAuth();
  const { locale } = useI18n();
  const { data = [], loading } = useAsync(() => listMyCertificates(profile!.id), [profile?.id]);
  if (loading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-night">Mes certificats</h1>
      <DemoInline>Démonstration : les certificats obtenus ici n’existent que dans cet onglet.</DemoInline>
      {data.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {data.map((c) => (
            <article key={c.id} className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-white p-6 shadow-soft print:shadow-none">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-[10px] border-gold/10" aria-hidden />
              <Award className="h-10 w-10 text-gold" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Académie KCC · Certificat</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-night">{c.courseTitle}</h2>
              <p className="mt-2 text-sm text-ink/70">Délivré à <strong>{c.holderName}</strong> le {formatDate(c.issuedAt, locale)} · score {c.score} %</p>
              <p className="mt-4 rounded-lg bg-mist px-3 py-2 font-mono text-sm text-night">{c.code}</p>
              <div className="mt-4 flex gap-2 print:hidden">
                <Button size="sm" variant="outline" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Imprimer</Button>
                <Link className="link-gold self-center text-sm" to="/academie/verifier">Vérifier l’authenticité</Link>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState icon={<Award className="h-6 w-6" />} title="Aucun certificat pour le moment" description="Les certificats sont émis automatiquement après validation des critères (leçons terminées et examen réussi)." action={<ButtonLink to="/espace/formations">Mes formations</ButtonLink>} />}
    </div>
  );
}
