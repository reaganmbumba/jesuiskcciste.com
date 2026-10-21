/**
 * Informations institutionnelles configurables.
 * En production, ces valeurs sont lues depuis la table `site_settings`
 * (administrables dans Administration > Paramètres). Les valeurs ci-dessous
 * sont des emplacements vides : aucune information officielle n'est inventée.
 */
export interface SiteSettings {
  name: string;
  tagline: string;
  secondaryMessage: string;
  /** Chemin du logo officiel autorisé (ex. /images/logo-officiel.svg). Vide = logotype textuel. */
  officialLogoUrl: string;
  /** Photo communautaire autorisée pour la section d'accueil. */
  heroImageUrl: string;
  contact: { email: string; phone: string; address: string };
  socials: { label: string; url: string }[];
  churchPresentation: string;
}

export const defaultSiteSettings: SiteSettings = {
  name: 'JE SUIS KCCiste',
  tagline: 'Un seul peuple. Une même communauté.',
  secondaryMessage: 'Se connecter, apprendre, servir et faire vivre notre communauté partout dans le monde.',
  officialLogoUrl: '/images/logo-kcc.svg',
  heroImageUrl: '/images/hero-communaute.jpg',
  contact: { email: 'jesuiskcciste@gmail.com', phone: '+243 840 238 592', address: 'Muanda, Kongo-Central, RD Congo' },
  socials: [],
  churchPresentation: '',
};
