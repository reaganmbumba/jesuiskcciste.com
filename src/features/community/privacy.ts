import type { Parish, Profile, Section } from '@/types';

export interface DirectoryEntry {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  country: string;
  city: string | null;
  parishName: string | null;
  sectionName: string | null;
  functionTitle: string | null;
  email: string | null;
  phone: string | null;
}

/**
 * Projection d'un profil pour l'annuaire selon les choix de confidentialité.
 * En production, la même règle est appliquée en base par la vue
 * `directory_entries` : le navigateur ne reçoit jamais les champs masqués.
 */
export function toDirectoryEntry(
  p: Profile,
  ctx: { parishes: Parish[]; sections: Section[]; viewerCanSeePrivate?: boolean },
): DirectoryEntry {
  const pr = p.privacy;
  const full = ctx.viewerCanSeePrivate === true;
  return {
    id: p.id,
    displayName: [p.firstName, p.lastName].join(' '),
    avatarUrl: full || pr.showPhoto ? p.avatarUrl ?? null : null,
    country: p.country,
    city: full || pr.showCity ? p.city : null,
    parishName: full || pr.showParish ? ctx.parishes.find((x) => x.id === p.parishId)?.name ?? null : null,
    sectionName: full || pr.showSection ? ctx.sections.find((x) => x.id === p.sectionId)?.name ?? null : null,
    functionTitle: full || pr.showFunction ? p.functionTitle ?? null : null,
    email: full || pr.showEmail ? p.email ?? null : null,
    phone: full || pr.showPhone ? p.phone ?? null : null,
  };
}

/** Seuls les comptes actifs ayant accepté de figurer dans l'annuaire sont listés. */
export function isListable(p: Profile, viewerCanSeePrivate = false) {
  if (viewerCanSeePrivate) return true;
  return p.status === 'active' && p.privacy.listedInDirectory;
}
