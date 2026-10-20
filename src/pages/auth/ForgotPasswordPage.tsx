import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthShell } from '@/layouts/AuthShell';
import { Field, Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { passwordSchema } from '@/features/auth/schemas';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const isNewPasswordStep = params.get('etape') === 'nouveau';
  const { requestPasswordReset, updatePassword } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const request = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Adresse e-mail invalide.'); return; }
    setLoading(true);
    try { await requestPasswordReset(email); setSent(true); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur'); } finally { setLoading(false); }
  };
  const save = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    const r = passwordSchema.safeParse(pwd);
    if (!r.success) { setError(r.error.issues[0].message); return; }
    setLoading(true);
    try { await updatePassword(pwd); notify('Mot de passe mis à jour.'); navigate('/espace'); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur'); } finally { setLoading(false); }
  };

  if (isNewPasswordStep) return (
    <AuthShell title="Nouveau mot de passe">
      <form onSubmit={save} className="space-y-4" noValidate>
        <Field label="Nouveau mot de passe" hint="10 caractères minimum, avec lettres et chiffres." error={error} required>{(p) => <Input {...p} type="password" autoComplete="new-password" value={pwd} onChange={(e) => setPwd(e.target.value)} />}</Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Enregistrer</Button>
      </form>
    </AuthShell>
  );
  return (
    <AuthShell title="Mot de passe oublié" subtitle="Recevez un lien sécurisé pour définir un nouveau mot de passe.">
      {sent ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-soft"><MailCheck className="mx-auto h-10 w-10 text-gold" /><p className="mt-3 text-ink/75">Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d’être envoyé.</p></div>
      ) : (
        <form onSubmit={request} className="space-y-4" noValidate>
          <Field label="Adresse e-mail" error={error} required>{(p) => <Input {...p} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Envoyer le lien</Button>
        </form>
      )}
      <p className="mt-8 text-center text-sm"><Link to="/connexion" className="link-gold">Retour à la connexion</Link></p>
    </AuthShell>
  );
}
