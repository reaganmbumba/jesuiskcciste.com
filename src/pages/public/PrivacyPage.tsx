import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { useI18n, type Tri } from '@/i18n';

const CONTACT = 'jesuiskcciste@gmail.com';

const sections: { id: string; title: Tri; body: Tri }[] = [
  { id: 'editeur', title: { fr: 'Qui sommes-nous', en: 'Who we are', pt: 'Quem somos' }, body: {
    fr: `JE SUIS KCCiste (site jesuiskcciste.com et application Android « Je suis KCCiste ») est la plateforme communautaire des fidèles KCCistes, éditée depuis Muanda, Kongo-Central, RD Congo. Contact pour toute question sur vos données : ${CONTACT}.`,
    en: `JE SUIS KCCiste (website jesuiskcciste.com and the “Je suis KCCiste” Android app) is the community platform of KCCiste believers, published from Muanda, Kongo-Central, DR Congo. Contact for any question about your data: ${CONTACT}.`,
    pt: `JE SUIS KCCiste (site jesuiskcciste.com e aplicação Android « Je suis KCCiste ») é a plataforma comunitária dos fiéis KCCistas, editada a partir de Muanda, Kongo-Central, RD Congo. Contacto para qualquer questão sobre os seus dados: ${CONTACT}.` } },
  { id: 'donnees', title: { fr: 'Données collectées', en: 'Data collected', pt: 'Dados recolhidos' }, body: {
    fr: 'Uniquement si vous créez un compte : nom, postnom, prénom, adresse électronique, téléphone, pays, ville, paroisse, section, photo de profil et, après validation, fonction. Un matricule personnel vous est attribué. Ce que vous publiez vous-même : commentaires, messages privés, sujets du forum, commentaires vocaux (le micro n’est utilisé que lorsque vous appuyez sur « enregistrer »), vidéos de challenges. Les cotisations et dons que vous déclarez sont enregistrés avec leur montant. Les mots de passe ne sont jamais stockés en clair : ils sont gérés par le service d’authentification (hachage). La lecture des pages publiques ne demande aucun compte.',
    en: 'Only if you create an account: surname, middle name, first name, email address, phone number, country, city, parish, section, profile photo and, once approved, role. A personal member number is assigned to you. What you post yourself: comments, private messages, forum topics, voice comments (the microphone is only used when you tap “record”), challenge videos. Dues and donations you declare are recorded with their amount. Passwords are never stored in plain text: they are handled by the authentication service (hashing). Reading public pages requires no account.',
    pt: 'Apenas se criar uma conta: apelido, pós-nome, nome próprio, endereço eletrónico, telefone, país, cidade, paróquia, secção, foto de perfil e, após validação, função. É-lhe atribuído um número de membro pessoal. O que publica: comentários, mensagens privadas, tópicos do fórum, comentários de voz (o microfone só é usado quando toca em « gravar »), vídeos de desafios. As quotas e doações que declara são registadas com o montante. As palavras-passe nunca são guardadas em texto simples: são geridas pelo serviço de autenticação (hash). Ler as páginas públicas não exige conta.' } },
  { id: 'appareil', title: { fr: 'Appareil et statistiques', en: 'Device and statistics', pt: 'Dispositivo e estatísticas' }, body: {
    fr: 'Pour réserver les articles à un seul téléphone par membre, un identifiant aléatoire est créé sur votre appareil et associé à votre compte quand vous saisissez votre matricule ; il ne contient aucune information personnelle. Le site compte aussi le nombre de lectures de chaque page et le nombre de visiteurs en ligne, sans vous identifier. Aucune publicité, aucun traceur publicitaire, aucune vente de données.',
    en: 'To keep articles to one phone per member, a random identifier is created on your device and linked to your account when you enter your member number; it contains no personal information. The site also counts how many times each page is read and how many visitors are online, without identifying you. No ads, no advertising trackers, no sale of data.',
    pt: 'Para reservar os artigos a um só telemóvel por membro, é criado um identificador aleatório no seu dispositivo, associado à sua conta quando insere o seu número de membro; não contém nenhuma informação pessoal. O site conta também o número de leituras de cada página e de visitantes em linha, sem o identificar. Sem publicidade, sem rastreadores publicitários, sem venda de dados.' } },
  { id: 'hebergement', title: { fr: 'Hébergement et sécurité', en: 'Hosting and security', pt: 'Alojamento e segurança' }, body: {
    fr: 'Les données sont hébergées par Supabase (base de données et fichiers) et le site par Cloudflare. Tous les échanges sont chiffrés (HTTPS). Les données ne sont partagées avec aucun tiers, sauf obligation légale.',
    en: 'Data is hosted by Supabase (database and files) and the website by Cloudflare. All traffic is encrypted (HTTPS). Data is not shared with any third party, except where required by law.',
    pt: 'Os dados são alojados pela Supabase (base de dados e ficheiros) e o site pela Cloudflare. Todas as trocas são cifradas (HTTPS). Os dados não são partilhados com terceiros, salvo obrigação legal.' } },
  { id: 'visibilite', title: { fr: 'Visibilité et annuaire', en: 'Visibility and directory', pt: 'Visibilidade e diretório' }, body: {
    fr: 'Chaque membre choisit les informations visibles dans l’annuaire. Le téléphone et l’adresse électronique sont masqués par défaut. Un membre peut demander à ne pas figurer dans l’annuaire.',
    en: 'Each member chooses what is visible in the directory. Phone number and email address are hidden by default. A member can ask not to appear in the directory.',
    pt: 'Cada membro escolhe as informações visíveis no diretório. O telefone e o endereço eletrónico estão ocultos por defeito. Um membro pode pedir para não figurar no diretório.' } },
  { id: 'acces', title: { fr: 'Qui accède à quoi', en: 'Who can see what', pt: 'Quem acede a quê' }, body: {
    fr: 'Les accès sont déterminés par rôle (membre, chef de section, responsable de paroisse, formateur, gestionnaire de solidarité, modérateur, administrateur central) et contrôlés dans la base de données. Un responsable n’accède qu’aux données relevant de son périmètre.',
    en: 'Access depends on role (member, section leader, parish leader, trainer, solidarity manager, moderator, central administrator) and is enforced in the database. A leader can only see data within their own scope.',
    pt: 'Os acessos são definidos por função (membro, chefe de secção, responsável de paróquia, formador, gestor de solidariedade, moderador, administrador central) e controlados na base de dados. Um responsável só acede aos dados do seu âmbito.' } },
  { id: 'finances', title: { fr: 'Informations financières', en: 'Financial information', pt: 'Informações financeiras' }, body: {
    fr: 'Les dons et cotisations se font par Mobile Money, en dehors du site : le site n’enregistre jamais de numéro de carte ni de code secret. Les contributions individuelles ne sont visibles que par le contributeur et les gestionnaires habilités. Les rapports publics présentent des montants agrégés.',
    en: 'Donations and dues are paid by Mobile Money, outside the site: the site never records card numbers or PINs. Individual contributions are visible only to the contributor and authorised managers. Public reports show aggregated amounts.',
    pt: 'As doações e quotas são pagas por Mobile Money, fora do site: o site nunca regista números de cartão nem códigos secretos. As contribuições individuais só são visíveis para o contribuinte e os gestores autorizados. Os relatórios públicos apresentam montantes agregados.' } },
  { id: 'consentement', title: { fr: 'Consentement', en: 'Consent', pt: 'Consentimento' }, body: {
    fr: 'Votre consentement est demandé à l’inscription et horodaté. Vous pouvez modifier vos préférences de visibilité et de notification à tout moment.',
    en: 'Your consent is requested at sign-up and time-stamped. You can change your visibility and notification preferences at any time.',
    pt: 'O seu consentimento é pedido na inscrição e registado com data e hora. Pode alterar as suas preferências de visibilidade e de notificação a qualquer momento.' } },
  { id: 'suppression', title: { fr: 'Supprimer votre compte et vos données', en: 'Delete your account and data', pt: 'Eliminar a sua conta e os seus dados' }, body: {
    fr: `Depuis le site ou l’application : connectez-vous, ouvrez « Mon espace » > « Paramètres », puis « Supprimer mon compte ». Sans accès à votre compte, écrivez à ${CONTACT} depuis l’adresse du compte en demandant sa suppression. Votre nom, votre photo, votre adresse électronique, votre téléphone et votre ville sont effacés aussitôt et le compte est désactivé. Pour faire aussi supprimer vos messages et publications, écrivez à ${CONTACT} : c’est fait sous 30 jours. Les données nécessaires aux obligations comptables (contributions confirmées) sont anonymisées plutôt que supprimées.`,
    en: `From the website or the app: sign in, open “My space” > “Settings”, then “Delete my account”. If you cannot access your account, email ${CONTACT} from the account’s address asking for deletion. Your name, photo, email address, phone number and city are erased at once and the account is deactivated. To also have your messages and posts deleted, email ${CONTACT}: it is done within 30 days. Data needed for accounting obligations (confirmed contributions) is anonymised rather than deleted.`,
    pt: `No site ou na aplicação: inicie sessão, abra « O meu espaço » > « Definições » e depois « Eliminar a minha conta ». Sem acesso à conta, escreva para ${CONTACT} a partir do endereço da conta pedindo a eliminação. O seu nome, foto, endereço eletrónico, telefone e cidade são apagados de imediato e a conta é desativada. Para eliminar também as suas mensagens e publicações, escreva para ${CONTACT}: é feito no prazo de 30 dias. Os dados necessários às obrigações contabilísticas (contribuições confirmadas) são anonimizados em vez de eliminados.` } },
  { id: 'enfants', title: { fr: 'Enfants', en: 'Children', pt: 'Crianças' }, body: {
    fr: 'La création d’un compte est réservée aux personnes de 13 ans et plus. Les pages publiques peuvent être lues par toute la famille.',
    en: 'Creating an account is limited to people aged 13 and over. Public pages can be read by the whole family.',
    pt: 'A criação de conta está reservada a pessoas com 13 anos ou mais. As páginas públicas podem ser lidas por toda a família.' } },
  { id: 'conditions', title: { fr: 'Conditions d’utilisation', en: 'Terms of use', pt: 'Condições de utilização' }, body: {
    fr: 'La plateforme est destinée à la vie communautaire. Les contenus publiés sont modérés ; tout contenu offensant peut être signalé à l’administration et retiré. Les œuvres musicales sont diffusées selon les autorisations des ayants droit.',
    en: 'The platform is meant for community life. Published content is moderated; any offensive content can be reported to the administration and removed. Music is shared according to the permissions of the rights holders.',
    pt: 'A plataforma destina-se à vida comunitária. Os conteúdos publicados são moderados; qualquer conteúdo ofensivo pode ser denunciado à administração e retirado. As obras musicais são difundidas segundo as autorizações dos titulares de direitos.' } },
];

export default function PrivacyPage() {
  const { tx, pick } = useI18n();
  return (
    <>
      <PageHeader eyebrow={tx('Vos droits', 'Your rights', 'Os seus direitos')} title={tx('Confidentialité et conditions d’utilisation', 'Privacy and terms of use', 'Privacidade e condições de utilização')} description={tx('Comment le site et l’application JE SUIS KCCiste protègent vos données. Mise à jour : 18 novembre 2026.', 'How the JE SUIS KCCiste website and app protect your data. Updated: 18 November 2026.', 'Como o site e a aplicação JE SUIS KCCiste protegem os seus dados. Atualização: 18 de novembro de 2026.')} />
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
