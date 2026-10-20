import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isDemoMode, env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize, snakify } from '@/utils/case';
import type { Profile, RoleKey } from '@/types';
import { buildDemoProfile } from './demoAccounts';

export interface SignUpInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
  phone?: string;
  country: string;
  city: string;
  parishId?: string;
  sectionId?: string;
  consent: boolean;
}

interface AuthValue {
  loading: boolean;
  profile: Profile | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: (role: RoleKey) => void;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);
const DEMO_KEY = 'kcc.demo.session';

function readDemoSession(): Profile | null {
  try {
    const raw = sessionStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

function writeDemoSession(p: Profile | null) {
  try {
    if (p) sessionStorage.setItem(DEMO_KEY, JSON.stringify(p));
    else sessionStorage.removeItem(DEMO_KEY);
  } catch {
    /* ignore */
  }
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase!
    .from('profiles')
    .select('*, roles:role_assignments(role:roles(key), parish_id, section_id, course_id)')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const raw = camelize<Omit<Profile, 'roles'> & { roles: { role: { key: RoleKey }; parishId: string | null; sectionId: string | null; courseId: string | null }[] }>(data);
  return {
    ...raw,
    roles: [{ role: 'member' as RoleKey }, ...raw.roles.map((r) => ({ role: r.role.key, parishId: r.parishId, sectionId: r.sectionId, courseId: r.courseId }))],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => (isDemoMode ? readDemoSession() : null));
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode || !supabase) return;
    let active = true;
    // Filet de sécurité : la page ne doit jamais rester sur « Chargement… ».
    const fallback = setTimeout(() => { if (active) setLoading(false); }, 8000);
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const next = data.session ? await loadProfile(data.session.user.id).catch(() => null) : null;
        if (active) setProfile(next);
      })
      .catch(() => { if (active) setProfile(null); })
      .finally(() => { clearTimeout(fallback); if (active) setLoading(false); });
    // Ne jamais attendre un appel Supabase dans ce callback : il tient le verrou d'auth,
    // et signInWithPassword() resterait bloqué indéfiniment. On diffère donc la lecture du profil.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async () => {
        const next = session ? await loadProfile(session.user.id).catch(() => null) : null;
        if (active) setProfile(next);
      }, 0);
    });
    return () => {
      active = false;
      clearTimeout(fallback);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode) throw new Error('Supabase n’est pas configuré : utilisez un compte de démonstration ci-dessous.');
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Adresse e-mail ou mot de passe incorrect.' : error.message);
    // Profil chargé avant la redirection, sinon les pages protégées renverraient vers /connexion.
    setProfile(await loadProfile(data.user.id).catch(() => null));
  }, []);

  const signInDemo = useCallback((role: RoleKey) => {
    const p = buildDemoProfile(role);
    writeDemoSession(p);
    setProfile(p);
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    if (isDemoMode) {
      // Aucun compte n'est créé : session de démonstration locale, en attente de validation.
      const p: Profile = { ...buildDemoProfile('member'), firstName: input.firstName, lastName: input.lastName, middleName: input.middleName ?? null, email: input.email, phone: input.phone ?? null, country: input.country, city: input.city, parishId: input.parishId ?? null, sectionId: input.sectionId ?? null, status: 'pending' };
      writeDemoSession(p);
      setProfile(p);
      return { needsEmailConfirmation: false };
    }
    const { data, error } = await supabase!.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${env.siteUrl}/connexion`,
        // Lues par le trigger SQL handle_new_user() pour créer le profil (statut « pending »).
        data: { first_name: input.firstName, last_name: input.lastName, middle_name: input.middleName ?? null, phone: input.phone ?? null, country: input.country, city: input.city, parish_id: input.parishId || null, section_id: input.sectionId || null, consent_at: new Date().toISOString() },
      },
    });
    if (error) throw error;
    return { needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      writeDemoSession(null);
      setProfile(null);
      return;
    }
    await supabase!.auth.signOut();
    setProfile(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (isDemoMode) throw new Error('Mode démonstration : aucun e-mail n’est envoyé. Configurez Supabase pour activer la réinitialisation.');
    const { error } = await supabase!.auth.resetPasswordForEmail(email, { redirectTo: `${env.siteUrl}/mot-de-passe-oublie?etape=nouveau` });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (isDemoMode) throw new Error('Mode démonstration : aucun mot de passe n’est enregistré.');
    const { error } = await supabase!.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!profile) return;
      // Les champs administratifs (statut, rôles, fonction) sont refusés par la RLS / trigger côté serveur.
      const { status: _s, roles: _r, functionTitle: _f, id: _i, ...safe } = patch;
      void _s; void _r; void _f; void _i;
      if (isDemoMode) {
        const next = { ...profile, ...safe };
        writeDemoSession(next);
        setProfile(next);
        return;
      }
      const { error } = await supabase!.from('profiles').update(snakify(safe)).eq('id', profile.id);
      if (error) throw error;
      setProfile(await loadProfile(profile.id));
    },
    [profile],
  );

  const value = useMemo<AuthValue>(
    () => ({ loading, profile, isAuthenticated: !!profile, isDemo: isDemoMode, signIn, signInDemo, signUp, signOut, requestPasswordReset, updatePassword, updateProfile }),
    [loading, profile, signIn, signInDemo, signUp, signOut, requestPasswordReset, updatePassword, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
