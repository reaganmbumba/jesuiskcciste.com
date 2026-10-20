import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/config/env';

/**
 * Client Supabase côté navigateur, initialisé avec la clé publique « anon ».
 * Toutes les autorisations sont appliquées par les politiques RLS en base.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Pas de verrou partagé entre onglets (navigator.locks) : un onglet resté bloqué
        // empêchait tous les autres de lire la session (« Chargement… » sans fin).
        lock: (_name, _acquireTimeout, fn) => fn(),
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase n’est pas configuré (mode démonstration).');
  return supabase;
}
