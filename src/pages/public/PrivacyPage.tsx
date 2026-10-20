import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { useI18n, type Tri } from '@/i18n';

const sections: { id: string; title: Tri; body: Tri }[] = [
  { id: 'donnees', title: { fr: 'Données collectées', en: 'Data collected', pt: 'Dados recolhidos' }, body: {
    fr: 'Nom, postnom, prénom, coordonnées, pays, ville, paroisse, section et, après validation, fonction. La photo est facultative. Les mots de passe ne sont jamais stockés en clair : ils sont gérés par le service d’authentification (hachage).',
    en: 'Surname, middle name, first name, contact details, country, city, parish, section and, once approved, role. A photo is optional. Passwords are never stored in plain text: they are handled by the authentication service (hashing).',
    pt: 'Apelido, pós-nome, nome próprio, contactos, país, cidade, paróquia, secção e, após validação, função. A foto é facultativa. As palavras-passe nunca são guardadas em texto simples: são geridas pelo serviço de autenticação (hash).' } },
  { id: 'visibilite', title: { fr: 'Visibilité et annuaire', en: 'Visibility and directory', pt: 'Visibilidade e diretório' }, body: {
    fr: 'Chaque membre choisit les informations visibles dans l’annuaire. Le téléphone et l’adresse électronique sont masqués par défaut. Un membre peut demander à ne pas figurer dans l’annuaire.',
    en: 'Each member chooses what is visible in the directory. Phone number and email address are hidden by default. A member can ask not to appear in the directory.',
    pt: 'Cada membro escolhe as informações visíveis no diretório. O telefone e o endereço eletrónico estão ocultos por defeito. Um membro pode pedir para não figurar no diretório.' } },
  { id: 'acces', title: { fr: 'Qui accède à quoi', en: 'Who can see what', pt: 'Quem acede a quê' }, body: {
    fr: 'Les accès sont déterminés par rôle (membre, chef de section, responsable de paroisse, formateur, gestionnaire de solidarité, modérateur, administrateur central) et contrôlés dans la base de données. Un responsable n’accède qu’aux données relevant de son périmètre.',
    en: 'Access depends on role (member, section leader, parish leader, trainer, solidarity manager, moderator, central administrator) and is enforced in the database. A leader can only see data within their own scope.',
    pt: 'Os acessos são definidos por função (membro, chefe de secção, responsável de paróquia, formador, gestor de solidariedade, moderador, administrador central) e controlados na base de dados. Um responsável só acede aos dados do seu âmbito.' } },
  { id: 'finances', title: { fr: 'Informations financières', en: 'Financial information', pt: 'Informações financeiras' }, body: {
    fr: 'Les contributions individuelles ne sont visibles que par le contributeur et les gestionnaires habilités. Les rapports publics présentent des montants agrégés.',
    en: 'Individual contributions are visible only to the contributor and authorised managers. Public reports show aggregated amounts.',
    pt: 'As contribuições individuais só são visíveis para o contribuinte e os gestores autorizados. Os relatórios públicos apresentam montantes agregados.' } },
  { id: 'consentement', title: { fr: 'Consentement', en: 'Consent', pt: 'Consentimento' }, body: {
    fr: 'Votre consentement est demandé à l’inscription et horodaté. Vous pouvez modifier vos préférences de visibilité et de notification à tout moment.',
    en: 'Your consent is requested at sign-up and time-stamped. You can change your visibility and notification preferences at any time.',
    pt: 'O seu consentimento é pedido na inscrição e registado com data e hora. Pode alterar as suas preferências de visibilidade e de notificação a qualquer momento.' } },
  { id: 'suppression', title: { fr: 'Suppression et anonymisation', en: 'Deletion and anonymisation', pt: 'Eliminação e anonimização' }, body: {
    fr: 'Vous pouvez demander la suppression de votre compte depuis vos paramètres. Les données nécessaires aux obligations comptables (contributions confirmées) sont anonymisées plutôt que supprimées.',
    en: 'You can ask for your account to be deleted from your settings. Data needed for accounting obligations (confirmed contributions) is anonymised rather than deleted.',
    pt: 'Pode pedir a eliminação da sua conta nas suas definições. Os dados necessários às obrigações contabilísticas (contribuições confirmadas) são anonimizados em vez de eliminados.' } },
  { id: 'conditions', title: { fr: 'Conditions d’utilisation', en: 'Terms of use', pt: 'Condições de utilização' }, body: {
    fr: 'La plateforme est destinée à la vie communautaire. Les contenus publiés sont modérés. Les œuvres musicales sont diffusées selon les autorisations des ayants droit. Les mentions légales complètes (éditeur, hébergeur, contact) sont à compléter par l’administration.',
    en: 'The platform is meant for community life. Published content is moderated. Music is shared according to the permissions of the rights holders. The full legal notice (publisher, host, contact) is to be completed by the administration.',
    pt: 'A plataforma destina-se à vida comunitária. Os conteúdos publicados são moderados. As obras musicais são difundidas segundo as autorizações dos titulares de direitos. O aviso legal completo (editor, alojamento, contacto) deve ser completado pela administração.' } },
];

export default function PrivacyPage() {
  const { tx, pick } = useI18n();
  return (
    <>
      <PageHeader eyebrow={tx('Vos droits', 'Your rights', 'Os seus direitos')} title={tx('Confidentialité et conditions d’utilisation', 'Privacy and terms of use', 'Privacidade e condições de utilização')} description={tx('Comment JE SUIS KCCiste protège vos données. Texte de base à faire valider par l’administration et, si nécessaire, par un conseil juridique.', 'How JE SUIS KCCiste protects your data. Draft text to be approved by the administration and, if needed, by a legal adviser.', 'Como o JE SUIS KCCiste protege os seus dados. Texto de base a validar pela administração e, se necessário, por um consultor jurídico.')} />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-4">
        <nav className="hidden lg:block" aria-label={tx('Sommaire', 'Contents', 'Índice')}>
          <ul className="sticky top-24 space-y-1 text-sm">{sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-ink/70 hover:bg-white hover:text-night">{pick(s.title)}</a></li>)}</ul>
        </nav>
        <div className="space-y-4 lg:col-span-3">
          {sections.map((s) => (
            <Card key={s.id} id={s.id} className="scroll-mt-24"><CardBody><h2 className="font-display text-xl font-semibold text-night">{pick(s.title)}</h2><p className="mt-2 leading-relaxed text-ink/75">{pick(s.body)}</p></CardBody></Card>
          ))}
        </div>
      </section>
    </>
  );
}
