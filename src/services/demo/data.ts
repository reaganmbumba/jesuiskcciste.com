/**
 * ⚠️ DONNÉES DE DÉMONSTRATION — ENTIÈREMENT FICTIVES.
 *
 * Ces données servent uniquement à présenter l'interface lorsque Supabase
 * n'est pas configuré. Elles ne représentent aucune personne, paroisse,
 * statistique, transaction ou communication officielle réelle.
 * Aucun nom de dirigeant n'est renseigné : les champs « responsable » restent
 * vides jusqu'à leur saisie par l'administration.
 */
import type {
  Album, Apostle, ApostlePhotoSubmission, Announcement, AppNotification, Artist, AuditLog, Certificate, Contribution, Course, Enrollment,
  Expense, KccEvent, MediaItem, OrganizationalUnit, Parish, Profile, Section, SolidarityProject, Track,
} from '@/types';

const now = new Date();
const inDays = (d: number, h = 10, m = 0) => {
  const x = new Date(now);
  x.setDate(x.getDate() + d);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};

export const DEMO_STATS_LABEL = 'Valeurs d’exemple — non officielles';

export const demoUnits: OrganizationalUnit[] = [
  { id: 'unit-central', name: 'Administration centrale', level: 'Administration centrale', parentId: null },
];

export const demoParishes: Parish[] = [
  { id: 'par-1', name: 'Paroisse exemple A', description: 'Fiche de paroisse de démonstration. La description officielle sera saisie par l’administration.', country: 'RD Congo', city: 'Kinshasa', address: null, unitId: 'unit-central', leaderName: null },
  { id: 'par-2', name: 'Paroisse exemple B', description: 'Fiche de paroisse de démonstration.', country: 'RD Congo', city: 'Lubumbashi', address: null, unitId: 'unit-central', leaderName: null },
  { id: 'par-3', name: 'Paroisse exemple C', description: 'Fiche de paroisse de démonstration.', country: 'RD Congo', city: 'Kisangani', address: null, unitId: 'unit-central', leaderName: null },
  { id: 'par-4', name: 'Paroisse exemple D', description: 'Fiche de paroisse de démonstration (diaspora).', country: 'Belgique', city: 'Bruxelles', address: null, unitId: 'unit-central', leaderName: null },
  { id: 'par-5', name: 'Paroisse exemple E', description: 'Fiche de paroisse de démonstration (diaspora).', country: 'Angola', city: 'Luanda', address: null, unitId: 'unit-central', leaderName: null },
  { id: 'par-6', name: 'Paroisse exemple F', description: 'Fiche de paroisse de démonstration (diaspora).', country: 'France', city: 'Paris', address: null, unitId: 'unit-central', leaderName: null },
];

export const demoSections: Section[] = [
  { id: 'sec-1', parishId: 'par-1', name: 'Section Jeunesse (exemple)', description: 'Section de démonstration.', leaderName: null },
  { id: 'sec-2', parishId: 'par-1', name: 'Section Mamans (exemple)', description: 'Section de démonstration.', leaderName: null },
  { id: 'sec-3', parishId: 'par-1', name: 'Chorale (exemple)', description: 'Section de démonstration.', leaderName: null },
  { id: 'sec-4', parishId: 'par-2', name: 'Section Jeunesse (exemple)', description: 'Section de démonstration.', leaderName: null },
  { id: 'sec-5', parishId: 'par-4', name: 'Section Diaspora (exemple)', description: 'Section de démonstration.', leaderName: null },
];

const defaultPrivacy = { showCity: true, showParish: true, showSection: true, showFunction: true, showPhoto: true, showEmail: false, showPhone: false, listedInDirectory: true };

const firstNames = ['Grâce', 'Daniel', 'Esther', 'Joël', 'Ruth', 'Samuel', 'Naomie', 'David', 'Sarah', 'Josué', 'Débora', 'Caleb', 'Rebecca', 'Elie', 'Miriam', 'Timothée', 'Lydia', 'Nathan', 'Anne', 'Gédéon', 'Rachel', 'Benjamin', 'Priscille', 'Isaac'];
const lastNames = ['Exemple', 'Démo', 'Fictif', 'Modèle'];

export const demoMembers: Profile[] = firstNames.map((fn, i) => {
  const parish = demoParishes[i % demoParishes.length];
  const section = demoSections.find((s) => s.parishId === parish.id);
  return {
    id: `mem-${i + 1}`,
    firstName: fn,
    lastName: lastNames[i % lastNames.length],
    middleName: null,
    avatarUrl: null,
    email: `membre${i + 1}@exemple.invalid`,
    phone: '+000 000 000 000',
    country: parish.country,
    city: parish.city,
    parishId: parish.id,
    sectionId: section?.id ?? null,
    functionTitle: null,
    status: i === 5 ? 'pending' : i === 11 ? 'suspended' : 'active',
    privacy: { ...defaultPrivacy, listedInDirectory: i % 7 !== 3, showCity: i % 5 !== 2 },
    roles: [{ role: 'member' }],
    createdAt: inDays(-200 + i * 5),
  };
});

export const demoAnnouncements: Announcement[] = [
  { id: 'ann-1', title: '[Exemple] Ouverture de la plateforme JE SUIS KCCiste', summary: 'Annonce de démonstration présentant le fonctionnement des publications.', content: 'Ce texte est un exemple. Les annonces officielles sont rédigées, validées et publiées par les responsables autorisés depuis l’espace d’administration.', author: 'Équipe JE SUIS KCCiste (démo)', category: 'Plateforme', publishedAt: inDays(-1), status: 'published', audience: 'public', pinned: true, imageUrl: null },
  { id: 'ann-2', title: '[Exemple] Inscriptions à l’Académie KCC', summary: 'Exemple d’annonce liée à une formation.', content: 'Annonce fictive servant à illustrer la mise en page.', author: 'Équipe JE SUIS KCCiste (démo)', category: 'Formation', publishedAt: inDays(-4), status: 'published', audience: 'public', pinned: false, imageUrl: null },
  { id: 'ann-3', title: '[Exemple] Programme des chorales', summary: 'Exemple d’annonce destinée aux membres.', content: 'Annonce fictive réservée aux membres connectés.', author: 'Équipe JE SUIS KCCiste (démo)', category: 'Musique', publishedAt: inDays(-7), status: 'published', audience: 'members', pinned: false, imageUrl: null },
  { id: 'ann-4', title: '[Exemple] Point d’étape d’un projet de solidarité', summary: 'Exemple de mise à jour de projet.', content: 'Annonce fictive.', author: 'Équipe JE SUIS KCCiste (démo)', category: 'Solidarité', publishedAt: inDays(-10), status: 'published', audience: 'public', pinned: false, imageUrl: null },
  { id: 'ann-5', title: '[Exemple] Brouillon en attente de validation', summary: 'Exemple de publication non encore validée.', content: 'Brouillon fictif.', author: 'Équipe JE SUIS KCCiste (démo)', category: 'Plateforme', publishedAt: inDays(0), status: 'pending', audience: 'public', pinned: false, imageUrl: null },
];

export const demoEvents: KccEvent[] = [
  { id: 'evt-1', title: '[Exemple] Culte dominical', description: 'Événement de démonstration.', startsAt: inDays(3, 9), endsAt: inDays(3, 12), timezone: 'Africa/Kinshasa', location: 'Kinshasa', parishId: 'par-1', category: 'culte', organizer: null, status: 'scheduled', participation: 'Entrée libre (exemple).', registrationEnabled: false, audience: 'public' },
  { id: 'evt-2', title: '[Exemple] Répétition générale des chorales', description: 'Événement de démonstration.', startsAt: inDays(5, 15), endsAt: inDays(5, 18), timezone: 'Africa/Lubumbashi', location: 'Lubumbashi', parishId: 'par-2', category: 'chorale', organizer: null, status: 'scheduled', participation: 'Réservé aux choristes (exemple).', registrationEnabled: true, audience: 'members' },
  { id: 'evt-3', title: '[Exemple] Séminaire de formation des responsables', description: 'Événement de démonstration.', startsAt: inDays(9, 10), endsAt: inDays(9, 16), timezone: 'Africa/Kinshasa', location: 'Kinshasa', parishId: 'par-1', category: 'seminaire', organizer: null, status: 'scheduled', participation: 'Sur inscription (exemple).', registrationEnabled: true, audience: 'public' },
  { id: 'evt-4', title: '[Exemple] Rencontre de la diaspora', description: 'Événement de démonstration.', startsAt: inDays(14, 14), endsAt: inDays(14, 18), timezone: 'Europe/Brussels', location: 'Bruxelles', parishId: 'par-4', category: 'reunion', organizer: null, status: 'scheduled', participation: 'Ouvert à tous (exemple).', registrationEnabled: true, audience: 'public' },
  { id: 'evt-5', title: '[Exemple] Journée de solidarité', description: 'Événement de démonstration.', startsAt: inDays(20, 8), endsAt: inDays(20, 13), timezone: 'Africa/Kinshasa', location: 'Kisangani', parishId: 'par-3', category: 'solidarite', organizer: null, status: 'postponed', participation: 'Bénévoles bienvenus (exemple).', registrationEnabled: false, audience: 'public' },
  { id: 'evt-6', title: '[Exemple] Concert de louange', description: 'Événement de démonstration.', startsAt: inDays(27, 17), endsAt: inDays(27, 20), timezone: 'Africa/Luanda', location: 'Luanda', parishId: 'par-5', category: 'concert', organizer: null, status: 'scheduled', participation: 'Entrée libre (exemple).', registrationEnabled: false, audience: 'public' },
];

export const demoCourses: Course[] = [
  {
    id: 'crs-1', slug: 'prise-en-main-kcc-connect', title: 'Prise en main de JE SUIS KCCiste', summary: 'Apprendre à utiliser la plateforme : profil, confidentialité, agenda et formations.',
    description: 'Formation de démonstration, non doctrinale, consacrée à l’utilisation de la plateforme.', category: 'Plateforme', level: 'debutant', estimatedHours: 1, access: 'open', status: 'published', trainerName: null, coverUrl: null, quizId: 'quiz-1',
    modules: [
      { id: 'mod-1', title: 'Votre compte', lessons: [
        { id: 'les-1', title: 'Compléter son profil', kind: 'text', durationMinutes: 5, body: 'Depuis « Mon profil », renseignez vos informations et votre paroisse. Les responsables valident ensuite votre rattachement.' },
        { id: 'les-2', title: 'Régler sa confidentialité', kind: 'text', durationMinutes: 5, body: 'Dans « Paramètres », choisissez les informations visibles dans l’annuaire. Téléphone et e-mail sont masqués par défaut.' },
      ] },
      { id: 'mod-2', title: 'La vie de la communauté', lessons: [
        { id: 'les-3', title: 'Suivre l’agenda', kind: 'text', durationMinutes: 5, body: 'L’agenda affiche les événements dans le fuseau horaire de leur lieu.' },
        { id: 'les-4', title: 'Suivre une formation', kind: 'text', durationMinutes: 5, body: 'Chaque formation contient des modules, des leçons et, parfois, un examen final.' },
      ] },
    ],
  },
  {
    id: 'crs-2', slug: 'animer-une-section', title: 'Animer une section', summary: 'Organisation de réunions, comptes rendus et suivi des membres.',
    description: 'Contenu de démonstration. Les supports officiels sont importés par les formateurs habilités.', category: 'Leadership', level: 'intermediaire', estimatedHours: 4, access: 'members', status: 'published', trainerName: null, coverUrl: null, quizId: null,
    modules: [{ id: 'mod-3', title: 'Module exemple', lessons: [{ id: 'les-5', title: 'Leçon exemple', kind: 'pdf', durationMinutes: 20, resourceUrl: null, body: 'Support PDF à importer par le formateur.' }] }],
  },
  {
    id: 'crs-3', slug: 'technique-vocale-chorale', title: 'Technique vocale pour chorales', summary: 'Respiration, justesse et travail d’ensemble.',
    description: 'Contenu de démonstration.', category: 'Musique', level: 'debutant', estimatedHours: 6, access: 'members', status: 'published', trainerName: null, coverUrl: null, quizId: null,
    modules: [{ id: 'mod-4', title: 'Module exemple', lessons: [{ id: 'les-6', title: 'Vidéo exemple', kind: 'video', durationMinutes: 15, resourceUrl: null, body: 'Vidéo à importer par le formateur.' }] }],
  },
  {
    id: 'crs-4', slug: 'gestion-projets-solidarite', title: 'Gérer un projet de solidarité', summary: 'Budget, transparence, pièces justificatives et rapport final.',
    description: 'Contenu de démonstration.', category: 'Solidarité', level: 'avance', estimatedHours: 5, access: 'on_request', status: 'published', trainerName: null, coverUrl: null, quizId: null,
    modules: [{ id: 'mod-5', title: 'Module exemple', lessons: [{ id: 'les-7', title: 'Leçon exemple', kind: 'text', durationMinutes: 20, body: 'Contenu à importer.' }] }],
  },
];

export const demoEnrollments: Enrollment[] = [
  { courseId: 'crs-1', progress: 50, completedLessonIds: ['les-1', 'les-2'], startedAt: inDays(-6) },
  { courseId: 'crs-3', progress: 0, completedLessonIds: [], startedAt: inDays(-2) },
];

export const demoCertificates: Certificate[] = [];

export const demoArtists: Artist[] = [
  { id: 'art-patrick-beckham', name: 'Patrick Beckham', kind: 'artist', bio: 'Artiste de la communauté KCCiste.', parishId: null },
  { id: 'art-ebnm', name: 'Ensemble EBNM / KCC', kind: 'choir', bio: 'Cantiques d’ensemble de l’Église Bon Nouveau Message (KCC).', parishId: null, imageUrl: '/images/logo-kcc.png' },
  { id: 'art-1', name: 'Chorale exemple A', kind: 'choir', bio: 'Fiche chorale de démonstration.', parishId: 'par-1' },
  { id: 'art-2', name: 'Chorale exemple B', kind: 'choir', bio: 'Fiche chorale de démonstration.', parishId: 'par-2' },
  { id: 'art-3', name: 'Artiste exemple', kind: 'artist', bio: 'Fiche artiste de démonstration.', parishId: 'par-4' },
];

export const demoAlbums: Album[] = [
  { id: 'alb-cantiques-5', title: 'Sélection cantiques d’ensemble – Volume 5', artistId: 'art-ebnm', year: null, coverUrl: '/images/logo-kcc.png', priceAmount: 3, priceCurrency: 'USD' },
  { id: 'alb-1', title: 'Album de démonstration', artistId: 'art-1', year: 2026 },
  { id: 'alb-2', title: 'Enregistrements exemple', artistId: 'art-3', year: 2025 },
];

export const demoTracks: Track[] = [
  { id: 'trk-cantiques-5', title: 'Sélection cantiques d’ensemble – Volume 5', author: 'EBNM / KCC', artistId: 'art-ebnm', albumId: 'alb-cantiques-5', category: 'Cantiques', durationSeconds: 618, audioUrl: '/audio/cantiques-ensemble-volume-5.mp3', broadcastRights: 'authorized', lyrics: null },
  { id: 'trk-masina', title: 'Masina', author: 'EBNM / KCC', artistId: 'art-ebnm', albumId: null, category: 'Chants', durationSeconds: 332, audioUrl: '/audio/masina-ebnm-kcc.mp3', broadcastRights: 'authorized', lyrics: null, priceAmount: 1, priceCurrency: 'USD' },
  { id: 'trk-merci-maman', title: 'Merci Maman', author: 'Patrick Beckham', artistId: 'art-patrick-beckham', albumId: null, category: 'Chants', durationSeconds: 231, audioUrl: '/audio/merci-maman-patrick-beckham.mp3', broadcastRights: 'authorized', lyrics: null, priceAmount: 2500, priceCurrency: 'CDF' },
  { id: 'trk-seigneur-gueris', title: 'Seigneur, guéris ce qu’ils ont détruit en moi', author: 'Auteur à préciser', artistId: 'art-ebnm', albumId: null, category: 'Prière', durationSeconds: 61, audioUrl: '/audio/seigneur-gueris-ce-quils-ont-detruit-en-moi.mp3', broadcastRights: 'authorized', lyrics: null },
  { id: 'trk-1', title: 'Titre de démonstration 1', author: 'Auteur à renseigner', artistId: 'art-1', albumId: 'alb-1', category: 'Louange', durationSeconds: 8, audioUrl: '/audio/demo-tone.wav', broadcastRights: 'authorized', lyrics: null },
  { id: 'trk-2', title: 'Titre de démonstration 2', author: 'Auteur à renseigner', artistId: 'art-1', albumId: 'alb-1', category: 'Adoration', durationSeconds: 8, audioUrl: '/audio/demo-tone.wav', broadcastRights: 'authorized', lyrics: null },
  { id: 'trk-3', title: 'Titre de démonstration 3', author: 'Auteur à renseigner', artistId: 'art-2', albumId: null, category: 'Louange', durationSeconds: 8, audioUrl: '/audio/demo-tone.wav', broadcastRights: 'pending', lyrics: null },
  { id: 'trk-4', title: 'Titre de démonstration 4', author: 'Auteur à renseigner', artistId: 'art-3', albumId: 'alb-2', category: 'Méditation', durationSeconds: 8, audioUrl: '/audio/demo-tone.wav', broadcastRights: 'restricted', lyrics: null },
];

export const demoMedia: MediaItem[] = [
  { id: 'med-1', title: 'Guide d’utilisation (exemple)', kind: 'pdf', category: 'Plateforme', description: 'Document de démonstration.', audience: 'public', publishedAt: inDays(-3) },
  { id: 'med-2', title: 'Support de formation (exemple)', kind: 'pdf', category: 'Académie', description: 'Document réservé aux membres (démonstration).', audience: 'members', publishedAt: inDays(-8) },
  { id: 'med-3', title: 'Rapport d’activité (exemple)', kind: 'document', category: 'Rapports', description: 'Document réservé aux responsables (démonstration).', audience: 'leaders', publishedAt: inDays(-15) },
];

export const demoProjects: SolidarityProject[] = [
  { id: 'prj-1', slug: 'operation-100-chaises', name: 'Opération 100 chaises', summary: 'Équiper une salle de réunion en chaises.', description: 'Projet présenté à titre d’exemple. Les montants affichés sont fictifs.', parishId: 'par-1', goalAmount: 2500, currency: 'USD', confirmedAmount: 1150, declaredAmount: 1400, launchedAt: inDays(-30), deadline: inDays(60), status: 'active', participationTerms: 'Le paiement en ligne n’est pas encore disponible. Les modalités officielles seront publiées par la gestion de la solidarité.' },
  { id: 'prj-2', slug: 'soutien-aux-familles', name: 'Aide aux familles en difficulté', summary: 'Soutien ponctuel aux familles accompagnées.', description: 'Projet de démonstration.', parishId: 'par-2', goalAmount: 5000, currency: 'USD', confirmedAmount: 1800, declaredAmount: 1800, launchedAt: inDays(-45), deadline: inDays(90), status: 'active', participationTerms: 'Modalités à définir par l’administration.' },
  { id: 'prj-3', slug: 'equipement-sonorisation', name: 'Acquisition d’équipements de sonorisation', summary: 'Matériel pour les activités des chorales.', description: 'Projet de démonstration.', parishId: 'par-3', goalAmount: 3200, currency: 'USD', confirmedAmount: 3200, declaredAmount: 3200, launchedAt: inDays(-120), deadline: inDays(-10), status: 'completed', participationTerms: 'Projet clôturé.' },
];

export const demoContributions: Contribution[] = [
  { id: 'ctb-1', projectId: 'prj-1', contributorLabel: 'Contribution exemple 1', amount: 500, currency: 'USD', provider: 'cash', status: 'confirmed', transactionReference: null, createdAt: inDays(-20) },
  { id: 'ctb-2', projectId: 'prj-1', contributorLabel: 'Contribution exemple 2', amount: 650, currency: 'USD', provider: 'bank', status: 'confirmed', transactionReference: 'DEMO-0002', createdAt: inDays(-12) },
  { id: 'ctb-3', projectId: 'prj-1', contributorLabel: 'Contribution exemple 3', amount: 250, currency: 'USD', provider: 'mpesa', status: 'declared', transactionReference: null, createdAt: inDays(-2) },
  { id: 'ctb-4', projectId: 'prj-2', contributorLabel: 'Contribution exemple 4', amount: 1800, currency: 'USD', provider: 'cash', status: 'confirmed', transactionReference: null, createdAt: inDays(-30) },
];

export const demoExpenses: Expense[] = [
  { id: 'exp-1', projectId: 'prj-3', label: 'Achat de matériel (exemple)', amount: 2900, currency: 'USD', spentAt: inDays(-15) },
  { id: 'exp-2', projectId: 'prj-3', label: 'Transport (exemple)', amount: 300, currency: 'USD', spentAt: inDays(-14) },
];

export const demoNotifications: AppNotification[] = [
  { id: 'not-1', kind: 'announcement', title: 'Nouvelle annonce', body: '[Exemple] Ouverture de la plateforme JE SUIS KCCiste', link: '/actualites/ann-1', read: false, createdAt: inDays(-1) },
  { id: 'not-2', kind: 'event', title: 'Nouvel événement', body: '[Exemple] Séminaire de formation des responsables', link: '/agenda/evt-3', read: false, createdAt: inDays(-2) },
  { id: 'not-3', kind: 'course', title: 'Nouvelle formation', body: 'Prise en main de JE SUIS KCCiste', link: '/academie/formations/prise-en-main-kcc-connect', read: true, createdAt: inDays(-6) },
  { id: 'not-4', kind: 'project_update', title: 'Mise à jour d’un projet suivi', body: 'Opération 100 chaises', link: '/solidarite/projets/operation-100-chaises', read: true, createdAt: inDays(-9) },
];

export const demoAuditLogs: AuditLog[] = [
  { id: 'log-1', actor: 'Compte démo', action: 'announcement.publish', entity: 'announcements', entityId: 'ann-1', createdAt: inDays(-1), details: 'Exemple de journal' },
  { id: 'log-2', actor: 'Compte démo', action: 'member.validate', entity: 'profiles', entityId: 'mem-3', createdAt: inDays(-3), details: 'Exemple de journal' },
  { id: 'log-3', actor: 'Compte démo', action: 'contribution.confirm', entity: 'contributions', entityId: 'ctb-2', createdAt: inDays(-12), details: 'Exemple de journal' },
];

// Exemples fictifs : la vraie liste des Révérends Apôtres est saisie dans /admin/apotres.
export const demoApostles: Apostle[] = [
  { id: 'apo-1', fullName: 'Apôtre exemple A', title: 'Révérend Apôtre', status: 'living', photoUrl: null, place: 'Kinshasa', sortOrder: 1 },
  { id: 'apo-2', fullName: 'Apôtre exemple B', title: 'Révérend Apôtre', status: 'deceased', photoUrl: null, place: 'Matadi', deathYear: 2010, sortOrder: 2 },
];
export const demoApostleSubmissions: ApostlePhotoSubmission[] = [];
