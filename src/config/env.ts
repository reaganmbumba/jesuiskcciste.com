/**
 * Lecture centralisée des variables d'environnement publiques.
 * Seules les variables préfixées VITE_ sont exposées au navigateur :
 * n'y placez jamais de secret (clé service_role, clés marchandes, etc.).
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const env = {
  supabaseUrl: url?.trim() || '',
  supabaseAnonKey: anonKey?.trim() || '',
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) || (typeof window !== 'undefined' ? window.location.origin : ''),
};

/** Vrai lorsque Supabase est réellement configuré. Sinon l'application fonctionne en mode démonstration. */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/** Mode démonstration : données fictives, aucune écriture persistante. */
export const isDemoMode = !isSupabaseConfigured;
