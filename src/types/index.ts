/**
 * Types de domaine JE SUIS KCCiste.
 * Ils reflètent le schéma Supabase décrit dans supabase/migrations.
 */

export type UUID = string;
export type ISODate = string;

export type RoleKey =
  | 'central_admin'
  | 'parish_leader'
  | 'section_leader'
  | 'trainer'
  | 'music_manager'
  | 'solidarity_manager'
  | 'moderator'
  | 'member'
  | 'visitor';

export type AccountStatus = 'pending' | 'active' | 'suspended';

export type Visibility = 'public' | 'members' | 'leaders' | 'private';

export interface RoleAssignment {
  role: RoleKey;
  /** Portée éventuelle : une paroisse, une section ou une formation. */
  parishId?: UUID | null;
  sectionId?: UUID | null;
  courseId?: UUID | null;
}

export interface PrivacySettings {
  showCity: boolean;
  showParish: boolean;
  showSection: boolean;
  showFunction: boolean;
  showPhoto: boolean;
  showEmail: boolean;
  showPhone: boolean;
  listedInDirectory: boolean;
}

export interface Profile {
  id: UUID;
  lastName: string;
  middleName?: string | null; // postnom
  firstName: string;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  country: string;
  city: string;
  parishId?: UUID | null;
  sectionId?: UUID | null;
  functionTitle?: string | null;
  status: AccountStatus;
  privacy: PrivacySettings;
  roles: RoleAssignment[];
  createdAt: ISODate;
}

export interface OrganizationalUnit {
  id: UUID;
  name: string;
  level: string; // ex. « Administration centrale », « Région », configurable
  parentId?: UUID | null;
}

export interface Parish {
  id: UUID;
  name: string;
  description: string;
  country: string;
  city: string;
  address?: string | null;
  unitId?: UUID | null;
  leaderName?: string | null;
}

export interface Section {
  id: UUID;
  parishId: UUID;
  name: string;
  description: string;
  leaderName?: string | null;
}

export type PublicationStatus = 'draft' | 'pending' | 'published' | 'archived';

export interface Announcement {
  id: UUID;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string | null;
  author: string;
  category: string;
  publishedAt: ISODate;
  status: PublicationStatus;
  audience: Visibility;
  pinned: boolean;
  parishId?: UUID | null;
}

export type EventCategory =
  | 'culte'
  | 'reunion'
  | 'formation'
  | 'seminaire'
  | 'conference'
  | 'mariage'
  | 'consolation'
  | 'deuil'
  | 'concert'
  | 'chorale'
  | 'solidarite'
  | 'autre';

export type EventStatus = 'scheduled' | 'postponed' | 'cancelled' | 'archived';

export interface KccEvent {
  id: UUID;
  title: string;
  description: string;
  startsAt: ISODate;
  endsAt?: ISODate | null;
  timezone: string;
  location: string;
  parishId?: UUID | null;
  category: EventCategory;
  posterUrl?: string | null;
  organizer?: string | null;
  status: EventStatus;
  participation: string;
  registrationEnabled: boolean;
  audience: Visibility;
}

export type CourseLevel = 'debutant' | 'intermediaire' | 'avance';
export type CourseAccess = 'open' | 'members' | 'on_request' | 'closed';

export interface Lesson {
  id: UUID;
  title: string;
  kind: 'text' | 'video' | 'pdf';
  durationMinutes: number;
  resourceUrl?: string | null;
  body?: string | null;
}

export interface CourseModule {
  id: UUID;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: UUID;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: CourseLevel;
  estimatedHours: number;
  access: CourseAccess;
  status: PublicationStatus;
  trainerName?: string | null;
  coverUrl?: string | null;
  modules: CourseModule[];
  quizId?: UUID | null;
}

/** Question telle qu'envoyée au navigateur : SANS la bonne réponse. */
export interface PublicQuestion {
  id: UUID;
  prompt: string;
  options: { id: UUID; label: string }[];
}

export interface Quiz {
  id: UUID;
  courseId: UUID;
  title: string;
  passingScore: number; // pourcentage
  maxAttempts: number;
  timeLimitMinutes?: number | null;
  questions: PublicQuestion[];
}

export interface QuestionCorrection {
  questionId: UUID;
  selectedOptionId: UUID | null;
  correctOptionId: UUID;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface QuizAttemptResult {
  attemptId: UUID;
  quizId: UUID;
  score: number; // pourcentage
  passed: boolean;
  correctCount: number;
  total: number;
  attemptNumber: number;
  submittedAt: ISODate;
  corrections: QuestionCorrection[];
  certificateCode?: string | null;
}

export interface Enrollment {
  courseId: UUID;
  progress: number; // 0-100
  completedLessonIds: UUID[];
  startedAt: ISODate;
}

export interface Certificate {
  id: UUID;
  code: string;
  courseId: UUID;
  courseTitle: string;
  holderName: string;
  issuedAt: ISODate;
  score: number;
  revoked: boolean;
}

export interface Artist {
  id: UUID;
  name: string;
  kind: 'artist' | 'choir';
  bio: string;
  parishId?: UUID | null;
  imageUrl?: string | null;
}

export interface Album {
  id: UUID;
  title: string;
  artistId: UUID;
  year?: number | null;
  coverUrl?: string | null;
  priceAmount?: number | null;
  priceCurrency?: 'USD' | 'CDF' | null;
}

export interface Track {
  id: UUID;
  title: string;
  author: string;
  artistId: UUID;
  albumId?: UUID | null;
  category: string;
  durationSeconds: number;
  audioUrl?: string | null;
  videoUrl?: string | null;
  lyrics?: string | null;
  broadcastRights: 'authorized' | 'pending' | 'restricted';
  /** Boutique : prix de vente (vide = pas en vente). */
  priceAmount?: number | null;
  priceCurrency?: 'USD' | 'CDF' | null;
  /** Fichier livré à l'acheteur dans le bucket privé `music` (sinon audioUrl). */
  saleFilePath?: string | null;
}

export type MusicOrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface MusicOrder {
  id: UUID;
  userId: UUID;
  trackId?: UUID | null;
  albumId?: UUID | null;
  itemTitle: string;
  amount: number;
  currency: 'USD' | 'CDF';
  provider: 'mpesa' | 'orange_money' | 'airtel_money';
  phone: string;
  status: MusicOrderStatus;
  gatewayOrderNumber?: string | null;
  providerReference?: string | null;
  createdAt: ISODate;
  paidAt?: ISODate | null;
}

export interface MediaItem {
  id: UUID;
  title: string;
  kind: 'pdf' | 'video' | 'audio' | 'image' | 'document';
  category: string;
  description: string;
  url?: string | null;
  audience: Visibility;
  publishedAt: ISODate;
}

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'suspended' | 'archived';

export interface SolidarityProject {
  id: UUID;
  slug: string;
  name: string;
  summary: string;
  description: string;
  parishId?: UUID | null;
  goalAmount: number;
  currency: 'USD' | 'CDF' | 'EUR';
  confirmedAmount: number;
  declaredAmount: number;
  launchedAt: ISODate;
  deadline?: ISODate | null;
  imageUrl?: string | null;
  status: ProjectStatus;
  participationTerms: string;
}

export type ContributionStatus = 'declared' | 'pending_verification' | 'confirmed' | 'rejected';
export type PaymentProvider = 'mpesa' | 'orange_money' | 'airtel_money' | 'cash' | 'bank';

export interface Contribution {
  id: UUID;
  projectId: UUID;
  contributorId?: UUID | null;
  contributorLabel: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  transactionReference?: string | null;
  status: ContributionStatus;
  createdAt: ISODate;
}

export interface Expense {
  id: UUID;
  projectId: UUID;
  label: string;
  amount: number;
  currency: string;
  spentAt: ISODate;
  receiptUrl?: string | null;
}

export type NotificationKind =
  | 'announcement'
  | 'event'
  | 'schedule_change'
  | 'course'
  | 'exam_result'
  | 'certificate'
  | 'project_update';

export interface AppNotification {
  id: UUID;
  kind: NotificationKind;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  createdAt: ISODate;
}

export interface AuditLog {
  id: UUID;
  actor: string;
  action: string;
  entity: string;
  entityId?: UUID | null;
  createdAt: ISODate;
  details?: string | null;
}

export interface CommunityStats {
  countries: number;
  parishes: number;
  members: number;
  courses: number;
  events: number;
}

// ——— Révérends Apôtres ———
export type ApostleStatus = 'living' | 'deceased';

export interface Apostle {
  id: UUID;
  fullName: string;
  title: string;
  status: ApostleStatus;
  photoUrl?: string | null;
  place?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  bio?: string | null;
  sortOrder: number;
}

export interface ApostlePhotoSubmission {
  id: UUID;
  apostleId: UUID;
  photoPath: string;
  submitterName: string;
  submitterContact?: string | null;
  note?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string | null;
}
