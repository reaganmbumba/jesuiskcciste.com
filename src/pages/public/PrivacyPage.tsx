import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';

const sections = [
  { id: 'donnees', title: 'Données collectées', body: 'Nom, postnom, prénom, coordonnées, pays, ville, paroisse, section et, après validation, fonction. La photo est facultative. Les mots de passe ne sont jamais stockés en clair : ils sont gérés par le service d’authentification (hachage).' },
  { id: 'visibilite', title: 'Visibilité et annuaire', body: 'Chaque membre choisit les informations visibles dans l’annuaire. Le téléphone et l’adresse électronique sont masqués par défaut. Un membre peut demander à ne pas figurer dans l’annuaire.' },
  { id: 'acces', title: 'Qui accède à quoi', body: 'Les accès sont déterminés par rôle (membre, chef de section, responsable de paroisse, formateur, gestionnaire de solidarité, modérateur, administrateur central) et contrôlés dans la base de données. Un responsable n’accède qu’aux données relevant de son périmètre.' },
  { id: 'finances', title: 'Informations financières', body: 'Les contributions individuelles ne sont visibles que par le contributeur et les gestionnaires habilités. Les rapports publics présentent des montants agrégés.' },
  { id: 'consentement', title: 'Consentement', body: 'Votre consentement est demandé à l’inscription et horodaté. Vous pouvez modifier vos préférences de visibilité et de notification à tout moment.' },
  { id: 'suppression', title: 'Suppression et anonymisation', body: 'Vous pouvez demander la suppression de votre compte depuis vos paramètres. Les données nécessaires aux obligations comptables (contributions confirmées) sont anonymisées plutôt que supprimées.' },
  { id: 'conditions', title: 'Conditions d’utilisation', body: 'La plateforme est destinée à la vie communautaire. Les contenus publiés sont modérés. Les œuvres musicales sont diffusées selon les autorisations des ayants droit. Les mentions légales complètes (éditeur, hébergeur, contact) sont à compléter par l’administration.' },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Vos droits" title="Confidentialité et conditions d’utilisation" description="Comment JE SUIS KCCiste protège vos données. Texte de base à faire valider par l’administration et, si nécessaire, par un conseil juridique." />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-4">
        <nav className="hidden lg:block" aria-label="Sommaire">
          <ul className="sticky top-24 space-y-1 text-sm">{sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-ink/70 hover:bg-white hover:text-night">{s.title}</a></li>)}</ul>
        </nav>
        <div className="space-y-4 lg:col-span-3">
          {sections.map((s) => (
            <Card key={s.id} id={s.id} className="scroll-mt-24"><CardBody><h2 className="font-display text-xl font-semibold text-night">{s.title}</h2><p className="mt-2 leading-relaxed text-ink/75">{s.body}</p></CardBody></Card>
          ))}
        </div>
      </section>
    </>
  );
}
