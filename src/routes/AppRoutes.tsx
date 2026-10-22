import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  Bell, Award, BarChart3, BookOpenCheck, CalendarDays, Building2, FileClock, GraduationCap, HandCoins, HandHeart,
  LayoutDashboard, Megaphone, Medal, MessageCircle, Mic, Music2, Settings, ShieldCheck, ShoppingBag, User, Users,
  LayoutGrid,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout, type SideItem } from '@/layouts/DashboardLayout';
import { RedirectIfAuthenticated, RequireAuth, RequirePermission } from './guards';
import { useAuth } from '@/features/auth/AuthContext';
import { can, type Permission } from '@/lib/permissions';
import { useUnreadMessages } from '@/features/messages/MessagesUi';
import { useI18n } from '@/i18n';

// Découpage du code par page (chargement différé).
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const TeachingsPage = lazy(() => import('@/pages/public/TeachingsPage'));
const DoctrinePage = lazy(() => import('@/pages/public/DoctrinePage'));
const HymnalPage = lazy(() => import('@/pages/public/HymnalPage'));
const CatechismPage = lazy(() => import('@/pages/public/CatechismPage'));
const LiturgyPage = lazy(() => import('@/pages/public/LiturgyPage'));
const CallingPage = lazy(() => import('@/pages/public/CallingPage'));
const SermonsPage = lazy(() => import('@/pages/public/SermonsPage'));
const GalleryPage = lazy(() => import('@/pages/public/GalleryPage'));
const ApostlesPage = lazy(() => import('@/pages/public/ApostlesPage'));
const ApostleProfilePage = lazy(() => import('@/pages/public/ApostleProfilePage'));
const VideosPage = lazy(() => import('@/pages/public/VideosPage'));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/public/ForbiddenPage'));
const CommunityPage = lazy(() => import('@/pages/community/CommunityPage'));
const DirectoryPage = lazy(() => import('@/pages/community/DirectoryPage'));
const MemberProfilePage = lazy(() => import('@/pages/community/MemberProfilePage'));
const ParishesPage = lazy(() => import('@/pages/community/ParishesPage'));
const ParishDetailPage = lazy(() => import('@/pages/community/ParishDetailPage'));
const SectionsPage = lazy(() => import('@/pages/community/SectionsPage'));
const ForumPage = lazy(() => import('@/pages/community/ForumPage'));
const ForumTopicPage = lazy(() => import('@/pages/community/ForumTopicPage'));
const NewsPage = lazy(() => import('@/pages/events/NewsPage'));
const NewsDetailPage = lazy(() => import('@/pages/events/NewsDetailPage'));
const AgendaPage = lazy(() => import('@/pages/events/AgendaPage'));
const EventDetailPage = lazy(() => import('@/pages/events/EventDetailPage'));
const AcademyPage = lazy(() => import('@/pages/academy/AcademyPage'));
const CatalogPage = lazy(() => import('@/pages/academy/CatalogPage'));
const CourseDetailPage = lazy(() => import('@/pages/academy/CourseDetailPage'));
const ExamPage = lazy(() => import('@/pages/academy/ExamPage'));
const VerifyCertificatePage = lazy(() => import('@/pages/academy/VerifyCertificatePage'));
const MusicPage = lazy(() => import('@/pages/music/MusicPage'));
const ArtistsPage = lazy(() => import('@/pages/music/ArtistsPage'));
const LibraryPage = lazy(() => import('@/pages/music/LibraryPage'));
const SolidarityPage = lazy(() => import('@/pages/solidarity/SolidarityPage'));
const ProjectsPage = lazy(() => import('@/pages/solidarity/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/solidarity/ProjectDetailPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const MemberDashboard = lazy(() => import('@/pages/member/MemberDashboard'));
const MyProfilePage = lazy(() => import('@/pages/member/MyProfilePage'));
const MyParishPage = lazy(() => import('@/pages/member/MyParishPage'));
const MyCoursesPage = lazy(() => import('@/pages/member/MyCoursesPage'));
const MyActivitiesPage = lazy(() => import('@/pages/member/MyActivitiesPage'));
const MyCertificatesPage = lazy(() => import('@/pages/member/MyCertificatesPage'));
const MyContributionsPage = lazy(() => import('@/pages/member/MyContributionsPage'));
const MyPurchasesPage = lazy(() => import('@/pages/member/MyPurchasesPage'));
const MessagesPage = lazy(() => import('@/pages/member/MessagesPage'));
const ConversationPage = lazy(() => import('@/pages/member/ConversationPage'));
const NotificationsPage = lazy(() => import('@/pages/member/NotificationsPage'));
const SettingsPage = lazy(() => import('@/pages/member/SettingsPage'));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminMembers = lazy(() => import('@/pages/admin/AdminMembers'));
const AdminParishes = lazy(() => import('@/pages/admin/AdminParishes'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminAnnouncements = lazy(() => import('@/pages/admin/AdminAnnouncements'));
const AdminCourses = lazy(() => import('@/pages/admin/AdminCourses'));
const AdminCertificates = lazy(() => import('@/pages/admin/AdminCertificates'));
const AdminMedia = lazy(() => import('@/pages/admin/AdminMedia'));
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'));
const AdminApostles = lazy(() => import('@/pages/admin/AdminApostles'));
const AdminSermons = lazy(() => import('@/pages/admin/AdminSermons'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminAudit = lazy(() => import('@/pages/admin/AdminAudit'));
const AdminSiteContent = lazy(() => import('@/pages/admin/AdminSiteContent'));

const MEMBER_MENU: SideItem[] = [
  { to: '/espace', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/espace/profil', label: 'Mon profil', icon: User },
  { to: '/espace/paroisse', label: 'Ma paroisse', icon: Building2 },
  { to: '/espace/formations', label: 'Mes formations', icon: GraduationCap },
  { to: '/espace/activites', label: 'Mes activités', icon: CalendarDays },
  { to: '/espace/certificats', label: 'Mes certificats', icon: Award },
  { to: '/espace/contributions', label: 'Mes contributions', icon: HandCoins },
  { to: '/espace/achats', label: 'Mes achats', icon: ShoppingBag },
  { to: '/espace/messages', label: 'Messages', icon: MessageCircle },
  { to: '/espace/notifications', label: 'Notifications', icon: Bell },
  { to: '/espace/parametres', label: 'Paramètres', icon: Settings },
];

const ADMIN_MENU: (SideItem & { permission: Permission })[] = [
  { to: '/admin', label: 'Vue d’ensemble', icon: BarChart3, end: true, permission: 'admin.access' },
  { to: '/admin/contenu', label: 'Contenu du site', icon: LayoutGrid, permission: 'settings.manage' },
  { to: '/admin/membres', label: 'Membres', icon: Users, permission: 'members.read_private' },
  { to: '/admin/paroisses', label: 'Paroisses et sections', icon: Building2, permission: 'sections.manage' },
  { to: '/admin/annonces', label: 'Annonces', icon: Megaphone, permission: 'announcements.create' },
  { to: '/admin/evenements', label: 'Événements', icon: CalendarDays, permission: 'events.manage' },
  { to: '/admin/formations', label: 'Formations et examens', icon: BookOpenCheck, permission: 'courses.manage_own' },
  { to: '/admin/certificats', label: 'Certificats', icon: Award, permission: 'certificates.manage' },
  { to: '/admin/medias', label: 'Musique : chants et albums', icon: Music2, permission: 'music.manage' },
  { to: '/admin/projets', label: 'Projets et contributions', icon: HandHeart, permission: 'projects.manage' },
  { to: '/admin/apotres', label: 'Révérends Apôtres', icon: Medal, permission: 'settings.manage' },
  { to: '/admin/predications', label: 'Prédications audio', icon: Mic, permission: 'settings.manage' },
  { to: '/admin/journaux', label: 'Journaux d’audit', icon: FileClock, permission: 'audit.read' },
  { to: '/admin/parametres', label: 'Paramètres', icon: ShieldCheck, permission: 'settings.manage' },
];

function MemberShell() {
  const { tx } = useI18n();
  const unread = useUnreadMessages();
  const items = MEMBER_MENU.map((i) => (i.to === '/espace/messages' ? { ...i, label: tx('Messages privés', 'Private messages', 'Mensagens privadas'), badge: unread } : i));
  return <DashboardLayout items={items} title="Mon espace" />;
}

function AdminShell() {
  const { profile } = useAuth();
  const items = ADMIN_MENU.filter((i) => can(profile, i.permission) || (i.permission === 'courses.manage_own' && can(profile, 'courses.manage')) || (i.permission === 'announcements.create' && can(profile, 'announcements.moderate')));
  return <DashboardLayout items={items} title="Administration" variant="admin" />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="a-propos" element={<AboutPage />} />
        <Route path="enseignements" element={<TeachingsPage />} />
        <Route path="doctrine" element={<DoctrinePage />} />
        <Route path="cantiques" element={<HymnalPage />} />
        <Route path="catechisme" element={<CatechismPage />} />
        <Route path="liturgie" element={<LiturgyPage />} />
        <Route path="appel-du-prophete" element={<CallingPage />} />
        <Route path="predications" element={<SermonsPage />} />
        <Route path="galerie" element={<GalleryPage />} />
        <Route path="apotres" element={<ApostlesPage />} />
        <Route path="apotres/:id" element={<ApostleProfilePage />} />
        <Route path="videos" element={<VideosPage />} />
        <Route path="communaute" element={<CommunityPage />} />
        <Route path="communaute/annuaire" element={<DirectoryPage />} />
        <Route path="communaute/membres/:id" element={<MemberProfilePage />} />
        <Route path="paroisses" element={<ParishesPage />} />
        <Route path="paroisses/:id" element={<ParishDetailPage />} />
        <Route path="sections" element={<SectionsPage />} />
        <Route path="forum" element={<ForumPage />} />
        <Route path="forum/:id" element={<ForumTopicPage />} />
        <Route path="actualites" element={<NewsPage />} />
        <Route path="actualites/:id" element={<NewsDetailPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="agenda/:id" element={<EventDetailPage />} />
        <Route path="academie" element={<AcademyPage />} />
        <Route path="academie/formations" element={<CatalogPage />} />
        <Route path="academie/formations/:slug" element={<CourseDetailPage />} />
        <Route path="academie/verifier" element={<VerifyCertificatePage />} />
        <Route element={<RequireAuth />}>
          <Route path="academie/examens/:quizId" element={<ExamPage />} />
        </Route>
        <Route path="musique" element={<MusicPage />} />
        <Route path="musique/artistes" element={<ArtistsPage />} />
        <Route path="bibliotheque" element={<LibraryPage />} />
        <Route path="solidarite" element={<SolidarityPage />} />
        <Route path="solidarite/projets" element={<ProjectsPage />} />
        <Route path="solidarite/projets/:slug" element={<ProjectDetailPage />} />
        <Route path="confidentialite" element={<PrivacyPage />} />
        <Route path="acces-refuse" element={<ForbiddenPage />} />
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="connexion" element={<LoginPage />} />
          <Route path="inscription" element={<SignupPage />} />
        </Route>
        <Route path="mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="espace" element={<MemberShell />}>
          <Route index element={<MemberDashboard />} />
          <Route path="profil" element={<MyProfilePage />} />
          <Route path="paroisse" element={<MyParishPage />} />
          <Route path="formations" element={<MyCoursesPage />} />
          <Route path="activites" element={<MyActivitiesPage />} />
          <Route path="certificats" element={<MyCertificatesPage />} />
          <Route path="contributions" element={<MyContributionsPage />} />
          <Route path="achats" element={<MyPurchasesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:id" element={<ConversationPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="parametres" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<RequirePermission permission="admin.access" />}>
        <Route path="admin" element={<AdminShell />}>
          <Route index element={<AdminOverview />} />
          <Route element={<RequirePermission permission="members.read_private" />}><Route path="membres" element={<AdminMembers />} /></Route>
          <Route element={<RequirePermission permission="sections.manage" />}><Route path="paroisses" element={<AdminParishes />} /></Route>
          <Route path="annonces" element={<AdminAnnouncements />} />
          <Route element={<RequirePermission permission="events.manage" />}><Route path="evenements" element={<AdminEvents />} /></Route>
          <Route path="formations" element={<AdminCourses />} />
          <Route element={<RequirePermission permission="certificates.manage" />}><Route path="certificats" element={<AdminCertificates />} /></Route>
          <Route element={<RequirePermission permission="music.manage" />}><Route path="medias" element={<AdminMedia />} /></Route>
          <Route element={<RequirePermission permission="projects.manage" />}><Route path="projets" element={<AdminProjects />} /></Route>
          <Route element={<RequirePermission permission="settings.manage" />}><Route path="apotres" element={<AdminApostles />} /></Route>
          <Route element={<RequirePermission permission="settings.manage" />}><Route path="predications" element={<AdminSermons />} /></Route>
          <Route element={<RequirePermission permission="settings.manage" />}><Route path="contenu" element={<AdminSiteContent />} /></Route>
          <Route element={<RequirePermission permission="audit.read" />}><Route path="journaux" element={<AdminAudit />} /></Route>
          <Route element={<RequirePermission permission="settings.manage" />}><Route path="parametres" element={<AdminSettings />} /></Route>
        </Route>
      </Route>
    </Routes>
  );
}
