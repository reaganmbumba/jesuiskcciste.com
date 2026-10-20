import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, FlaskConical } from 'lucide-react';
import { AuthShell } from '@/layouts/AuthShell';
import { Field, Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema } from '@/features/auth/schemas';
import { DEMO_ROLES } from '@/features/auth/demoAccounts';
import { ROLE_LABELS } from '@/lib/permissions';
import type { z } from 'zod';
import { useI18n } from '@/i18n';

export default function LoginPage() {
  const { signIn, signInDemo, isDemo } = useAuth();
  const { tx } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/espace';
  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (v) => {
    setServerError('');
    try { await signIn(v.email, v.password); navigate(from, { replace: true }); } catch (e) { setServerError(e instanceof Error ? e.message : tx('Connexion impossible.', 'Login failed.', 'Não foi possível iniciar sessão.')); }
  });

  return (
    <AuthShell title={tx('Connexion', 'Log in', 'Iniciar sessão')} subtitle={tx('Heureux de vous revoir dans la communauté.', 'Good to see you back in the community.', 'Que bom vê-lo de volta à comunidade.')}>
      {isDemo && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><FlaskConical className="h-4 w-4" />{tx('Mode démonstration', 'Demo mode', 'Modo de demonstração')}</p>
          <p className="mt-1 text-xs text-amber-900/80">{tx('Supabase n’est pas configuré. Explorez la plateforme avec un compte fictif :', 'Supabase is not set up. Explore the platform with a sample account:', 'O Supabase não está configurado. Explore a plataforma com uma conta fictícia:')}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ROLES.map((r) => (
              <button key={r.role} onClick={() => { signInDemo(r.role); navigate(r.role === 'member' ? '/espace' : '/admin', { replace: true }); }} className="rounded-xl bg-white px-3 py-2 text-left text-xs ring-1 ring-amber-200 transition hover:ring-gold" title={r.description}>
                <span className="block font-semibold text-night">{ROLE_LABELS[r.role]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <Field label={tx('Adresse e-mail', 'Email address', 'Endereço de e-mail')} error={errors.email?.message} required>{(p) => <Input {...p} {...register('email')} type="email" autoComplete="email" inputMode="email" />}</Field>
        <Field label={tx('Mot de passe', 'Password', 'Palavra-passe')} error={errors.password?.message} required>{(p) => (
          <div className="relative">
            <Input {...p} {...register('password')} type={show ? 'text' : 'password'} autoComplete="current-password" className="pr-11" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink/50 hover:bg-mist" aria-label={show ? tx('Masquer le mot de passe', 'Hide password', 'Ocultar a palavra-passe') : tx('Afficher le mot de passe', 'Show password', 'Mostrar a palavra-passe')}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        )}</Field>
        <div className="text-right"><Link to="/mot-de-passe-oublie" className="link-gold text-sm">{tx('Mot de passe oublié ?', 'Forgot your password?', 'Esqueceu a palavra-passe?')}</Link></div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={isDemo}>{tx('Se connecter', 'Log in', 'Iniciar sessão')}</Button>
        {isDemo && <p className="text-center text-xs text-ink/50">{tx('La connexion par e-mail sera active dès que Supabase sera configuré.', 'Email login will work as soon as Supabase is set up.', 'O início de sessão por e-mail ficará ativo assim que o Supabase estiver configurado.')}</p>}
      </form>
      <p className="mt-8 text-center text-sm text-ink/65">{tx('Pas encore membre ?', 'Not a member yet?', 'Ainda não é membro?')} <Link to="/inscription" className="link-gold">{tx('Créer un compte', 'Create an account', 'Criar uma conta')}</Link></p>
    </AuthShell>
  );
}
