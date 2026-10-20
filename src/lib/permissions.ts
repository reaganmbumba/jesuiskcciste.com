import type { Profile, RoleAssignment, RoleKey } from '@/types';

/**
 * Matrice des permissions côté interface.
 * IMPORTANT : elle ne sert qu'à adapter l'affichage. La sécurité réelle est
 * assurée en base par les politiques RLS et les fonctions SQL `has_permission`
 * (voir supabase/migrations/0002_security.sql). Masquer un bouton ne protège rien.
 */
export type Permission =
  | 'admin.access'
  | 'members.read_private'
  | 'members.manage'
  | 'parishes.manage'
  | 'sections.manage'
  | 'announcements.create'
  | 'announcements.moderate'
  | 'events.manage'
  | 'courses.manage'
  | 'courses.manage_own'
  | 'exams.manage'
  | 'certificates.manage'
  | 'music.manage'
  | 'projects.manage'
  | 'contributions.read'
  | 'contributions.manage'
  | 'expenses.manage'
  | 'moderation'
  | 'settings.manage'
  | 'audit.read';

export const ROLE_LABELS: Record<RoleKey, string> = {
  central_admin: 'Administrateur central',
  parish_leader: 'Responsable de paroisse',
  section_leader: 'Chef de section',
  trainer: 'Formateur',
  music_manager: 'Responsable musical',
  solidarity_manager: 'Gestionnaire de solidarité',
  moderator: 'Modérateur',
  member: 'Membre',
  visitor: 'Visiteur',
};

export const ROLE_PERMISSIONS: Record<RoleKey, Permission[]> = {
  central_admin: [
    'admin.access', 'members.read_private', 'members.manage', 'parishes.manage', 'sections.manage',
    'announcements.create', 'announcements.moderate', 'events.manage', 'courses.manage', 'exams.manage',
    'certificates.manage', 'music.manage', 'projects.manage', 'contributions.read', 'contributions.manage',
    'expenses.manage', 'moderation', 'settings.manage', 'audit.read',
  ],
  // Portée limitée à sa paroisse (contrôlée en base par parish_id).
  parish_leader: ['admin.access', 'members.read_private', 'sections.manage', 'announcements.create', 'events.manage'],
  // Portée limitée à sa section.
  section_leader: ['admin.access', 'announcements.create', 'events.manage'],
  // Uniquement les formations qui lui sont attribuées.
  trainer: ['admin.access', 'courses.manage_own'],
  music_manager: ['admin.access', 'music.manage'],
  solidarity_manager: ['admin.access', 'projects.manage', 'contributions.read', 'contributions.manage', 'expenses.manage'],
  moderator: ['admin.access', 'announcements.moderate', 'moderation'],
  member: [],
  visitor: [],
};

export function permissionsOf(roles: RoleAssignment[]): Set<Permission> {
  const set = new Set<Permission>();
  for (const r of roles) ROLE_PERMISSIONS[r.role]?.forEach((p) => set.add(p));
  return set;
}

export function can(profile: Pick<Profile, 'roles' | 'status'> | null | undefined, permission: Permission): boolean {
  if (!profile || profile.status !== 'active') return false;
  return permissionsOf(profile.roles).has(permission);
}

export function hasRole(profile: Pick<Profile, 'roles'> | null | undefined, role: RoleKey): boolean {
  return !!profile?.roles.some((r) => r.role === role);
}

/** Vérifie une permission sur une ressource rattachée à une paroisse (portée). */
export function canManageParishScoped(
  profile: Pick<Profile, 'roles' | 'status'> | null | undefined,
  parishId: string | null | undefined,
): boolean {
  if (!profile || profile.status !== 'active') return false;
  if (hasRole(profile, 'central_admin')) return true;
  return profile.roles.some((r) => r.role === 'parish_leader' && !!parishId && r.parishId === parishId);
}

/** Un formateur ne gère que les formations qui lui sont attribuées. */
export function canManageCourse(
  profile: Pick<Profile, 'roles' | 'status'> | null | undefined,
  courseId: string,
): boolean {
  if (can(profile, 'courses.manage')) return true;
  return !!profile && profile.status === 'active' && profile.roles.some((r) => r.role === 'trainer' && r.courseId === courseId);
}
