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
  /** Radio Je suis KCCiste : ce que l'administration laisse passer à l'antenne. */
  radio?: { songs: boolean; sermons: boolean; excluded: string[] };
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

/** Groupe WhatsApp « Je suis KCCiste », rappelé dans chaque message de partage. */
export const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/K30ogMwHp0Z7qmQwBhgKvH?mode=gi_t';
/** Adresse publique du site, citée dans les messages de partage. */
export const PUBLIC_SITE_URL = 'https://jesuiskcciste.com';
