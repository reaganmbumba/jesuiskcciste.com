import { lazy, Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/lib/permissions';

const AdminRadioAntenne = lazy(() => import('@/pages/admin/AdminRadioAntenne'));

const Shell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#070a12] px-5 text-white">
    <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-gold font-display text-lg font-bold tracking-wider text-gold">KCC</span>
    <p className="mt-3 font-display text-2xl font-semibold">Studio Radio KCC</p>
    <div className="mt-6 w-full max-w-sm">{children}</div>
  </div>
);

const Wait = () => <Shell><p className="flex items-center justify-center gap-2 text-white/60"><Loader2 className="h-5 w-5 animate-spin" />Chargement…</p></Shell>;

/**
 * Studio Radio KCC (application de l'animateur) : une seule page, sans le site autour.
 * Connexion intégrée, puis l'antenne en direct au design studio.
 */
export default function StudioAppPage() {
  const { loading, profile, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { document.title = 'Studio Radio KCC'; }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try { await signIn(email.trim(), password); }
    catch (err) { setError(err instanceof Error ? err.message : 'Connexion impossible.'); }
    finally { setBusy(false); }
  }

  if (loading) return <Wait />;
  if (!profile) {
    const field = 'w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white placeholder:text-white/35 outline-none focus:border-gold/60';
    return (
      <Shell>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-center text-sm text-white/60">Connectez-vous avec votre compte animateur de jesuiskcciste.com.</p>
          <input className={field} type="email" autoComplete="email" placeholder="Adresse e-mail" aria-label="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={field} type="password" autoComplete="current-password" placeholder="Mot de passe" aria-label="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 font-semibold text-night disabled:opacity-60">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}Se connecter
          </button>
          <p className="text-center text-xs text-white/40">Mot de passe oublié ? Réinitialisez-le sur jesuiskcciste.com.</p>
        </form>
      </Shell>
    );
  }
  if (!can(profile, 'settings.manage')) {
    return (
      <Shell>
        <p className="text-center text-sm text-white/70">Ce compte n’est pas animateur de la radio. Demandez l’accès à l’administrateur du site.</p>
        <button type="button" onClick={() => void signOut()} className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold"><LogOut className="h-4 w-4" />Changer de compte</button>
      </Shell>
    );
  }
  return <Suspense fallback={<Wait />}><AdminRadioAntenne variant="studio" /></Suspense>;
}
