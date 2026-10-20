import { FileText, Upload } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { ButtonLink } from '@/components/ui/Button';
import { useI18n } from '@/i18n';

/**
 * Présentation de l'Église. Aucun contenu doctrinal ou historique n'est
 * inventé : le texte officiel est saisi par l'administration
 * (Administration > Paramètres > Présentation de l'Église).
 */
export default function AboutPage() {
  const { settings } = useSiteSettings();
  const { tx } = useI18n();
  return (
    <>
      <PageHeader eyebrow={tx('À propos', 'About', 'Sobre')} title={tx('L’Église Bon Nouveau Message (EBNM/KCC)', 'The Église Bon Nouveau Message (EBNM/KCC)', 'A Église Bon Nouveau Message (EBNM/KCC)')} description={tx('Présentation officielle, histoire, organisation et contacts institutionnels.', 'Official presentation, history, organisation and institutional contacts.', 'Apresentação oficial, história, organização e contactos institucionais.')} />
      <section className="container-page grid gap-6 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {settings.churchPresentation ? (
            <Card><CardBody className="prose-kcc">{settings.churchPresentation.split('\n').map((p, i) => <p key={i}>{p}</p>)}</CardBody></Card>
          ) : (
            <EmptyState icon={<FileText className="h-6 w-6" />} title={tx('Présentation officielle à publier', 'Official presentation to be published', 'Apresentação oficial a publicar')} description={tx('Cette page est réservée au texte de présentation validé par les responsables compétents. Il se saisit dans l’espace d’administration ; aucun contenu n’est rédigé automatiquement.', 'This page is reserved for the presentation text approved by the competent leaders. It is entered in the administration area; no content is written automatically.', 'Esta página está reservada ao texto de apresentação validado pelos responsáveis competentes. É introduzido na área de administração; nenhum conteúdo é redigido automaticamente.')} action={<ButtonLink to="/admin/parametres" variant="outline" size="sm" icon={<Upload className="h-4 w-4" />}>{tx('Saisir la présentation (administrateurs)', 'Enter the presentation (administrators)', 'Introduzir a apresentação (administradores)')}</ButtonLink>} />
          )}
        </div>
        <aside className="space-y-4">
          {[
            { t: tx('Organisation', 'Organisation', 'Organização'), d: tx('Administration centrale, paroisses, sections et membres. Les niveaux sont configurables.', 'Central administration, parishes, sections and members. Levels can be configured.', 'Administração central, paróquias, secções e membros. Os níveis são configuráveis.') },
            { t: tx('Notre plateforme', 'Our platform', 'A nossa plataforma'), d: tx('JE SUIS KCCiste relie les KCCistes de la RD Congo et de la diaspora autour d’un espace commun.', 'JE SUIS KCCiste connects KCCists in the DR Congo and the diaspora in one shared space.', 'JE SUIS KCCiste liga os KCCistas da RD Congo e da diáspora num espaço comum.') },
            { t: tx('Documents officiels', 'Official documents', 'Documentos oficiais'), d: tx('Les documents validés sont disponibles dans la bibliothèque numérique.', 'Approved documents are available in the digital library.', 'Os documentos validados estão disponíveis na biblioteca digital.') },
          ].map((x) => (
            <Card key={x.t}><CardBody><h2 className="font-display text-lg font-semibold text-night">{x.t}</h2><p className="mt-1 text-sm text-ink/65">{x.d}</p></CardBody></Card>
          ))}
          <div className="rounded-2xl bg-night p-5 text-white shadow-soft sm:p-6"><h2 className="font-display text-lg font-semibold">{tx('Doctrine et histoire', 'Doctrine and history', 'Doutrina e história')}</h2><p className="mt-1 text-sm text-white/70">{tx('Le KCC, la profession de foi, les Paroles de l’Alliance, les fêtes et les grandes dates du Prophète.', 'The KCC, the profession of faith, the Words of the Covenant, the feasts and the key dates of the Prophet.', 'O KCC, a profissão de fé, as Palavras da Aliança, as festas e as grandes datas do Profeta.')}</p><ButtonLink to="/doctrine" variant="gold" size="sm" className="mt-4">{tx('Découvrir', 'Discover', 'Descobrir')}</ButtonLink></div>
          <div className="rounded-2xl bg-night p-5 text-white shadow-soft sm:p-6"><h2 className="font-display text-lg font-semibold">{tx('Enseignements et histoire', 'Teachings and history', 'Ensinamentos e história')}</h2><p className="mt-1 text-sm text-white/70">{tx('La prédication du Sabbat de Nlemba et les récits de l’appel de DIZOLELE Isaac.', 'The Nlemba Sabbath sermon and the accounts of the calling of DIZOLELE Isaac.', 'A pregação do Sábado de Nlemba e os relatos do chamamento de DIZOLELE Isaac.')}</p><ButtonLink to="/enseignements" variant="gold" size="sm" className="mt-4">{tx('Lire', 'Read', 'Ler')}</ButtonLink></div>
        </aside>
      </section>
    </>
  );
}
