import { FileText, Upload } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Présentation de l'Église. Aucun contenu doctrinal ou historique n'est
 * inventé : le texte officiel est saisi par l'administration
 * (Administration > Paramètres > Présentation de l'Église).
 */
export default function AboutPage() {
  const { settings } = useSiteSettings();
  return (
    <>
      <PageHeader eyebrow="À propos" title="L’Église Bon Nouveau Message (EBNM/KCC)" description="Présentation officielle, histoire, organisation et contacts institutionnels." />
      <section className="container-page grid gap-6 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {settings.churchPresentation ? (
            <Card><CardBody className="prose-kcc">{settings.churchPresentation.split('\n').map((p, i) => <p key={i}>{p}</p>)}</CardBody></Card>
          ) : (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="Présentation officielle à publier" description="Cette page est réservée au texte de présentation validé par les responsables compétents. Il se saisit dans l’espace d’administration ; aucun contenu n’est rédigé automatiquement." action={<ButtonLink to="/admin/parametres" variant="outline" size="sm" icon={<Upload className="h-4 w-4" />}>Saisir la présentation (administrateurs)</ButtonLink>} />
          )}
        </div>
        <aside className="space-y-4">
          {[
            { t: 'Organisation', d: 'Administration centrale, paroisses, sections et membres. Les niveaux sont configurables.' },
            { t: 'Notre plateforme', d: 'JE SUIS KCCiste relie les KCCistes de la RD Congo et de la diaspora autour d’un espace commun.' },
            { t: 'Documents officiels', d: 'Les documents validés sont disponibles dans la bibliothèque numérique.' },
          ].map((x) => (
            <Card key={x.t}><CardBody><h2 className="font-display text-lg font-semibold text-night">{x.t}</h2><p className="mt-1 text-sm text-ink/65">{x.d}</p></CardBody></Card>
          ))}
          <div className="rounded-2xl bg-night p-5 text-white shadow-soft sm:p-6"><h2 className="font-display text-lg font-semibold">Doctrine et histoire</h2><p className="mt-1 text-sm text-white/70">Le KCC, la profession de foi, les Paroles de l’Alliance, les fêtes et les grandes dates du Prophète.</p><ButtonLink to="/doctrine" variant="gold" size="sm" className="mt-4">Découvrir</ButtonLink></div>
          <div className="rounded-2xl bg-night p-5 text-white shadow-soft sm:p-6"><h2 className="font-display text-lg font-semibold">Enseignements et histoire</h2><p className="mt-1 text-sm text-white/70">La prédication du Sabbat de Nlemba et les récits de l’appel de DIZOLELE Isaac.</p><ButtonLink to="/enseignements" variant="gold" size="sm" className="mt-4">Lire</ButtonLink></div>
        </aside>
      </section>
    </>
  );
}
