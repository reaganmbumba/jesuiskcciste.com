import type { Profile, RoleKey } from '@/types';

/** Comptes de démonstration (aucun compte réel). */
export const DEMO_ROLES: { role: RoleKey; description: string }[] = [
  { role: 'member', description: 'Espace personnel, formations, certificats.' },
  { role: 'central_admin', description: 'Accès complet à l’administration.' },
  { role: 'parish_leader', description: 'Gestion limitée à sa paroisse.' },
  { role: 'trainer', description: 'Gestion de ses formations uniquement.' },
  { role: 'solidarity_manager', description: 'Projets, contributions et dépenses.' },
  { role: 'music_manager', description: 'Gestion de KCC Music.' },
  { role: 'moderator', description: 'Modération des publications.' },
];

export function buildDemoProfile(role: RoleKey): Profile {
  return {
    id: `demo-${role}`,
    firstName: 'Utilisateur',
    lastName: 'Démo',
    middleName: null,
    avatarUrl: null,
    email: 'demo@exemple.invalid',
    phone: null,
    country: 'RD Congo',
    city: 'Kinshasa',
    parishId: 'par-1',
    sectionId: 'sec-1',
    functionTitle: null,
    status: 'active',
    privacy: { showCity: true, showParish: true, showSection: true, showFunction: true, showPhoto: true, showEmail: false, showPhone: false, listedInDirectory: true },
    roles: role === 'member' ? [{ role: 'member' }] : [{ role: 'member' }, { role, parishId: role === 'parish_leader' ? 'par-1' : null, courseId: role === 'trainer' ? 'crs-1' : null }],
    createdAt: new Date().toISOString(),
  };
}
