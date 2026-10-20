import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthShell } from '@/layouts/AuthShell';
import { Field, Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { passwordSchema } from '@/features/auth/schemas';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';

export default function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const { tx } = useI18n();
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
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError(tx('Adresse e-mail invalide.', 'Invalid email address.', 'Endereço de e-mail inválido.')); return; }
    setLoading(true);
    try { await requestPasswordReset(email); setSent(true); } catch (err) { setError(err instanceof Error ? err.message : tx('Erreur', 'Error', 'Erro')); } finally { setLoading(false); }
  };
  const save = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    const r = passwordSchema.safeParse(pwd);
    if (!r.success) { setError(r.error.issues[0].message); return; }
    setLoading(true);
    try { await updatePassword(pwd); notify(tx('Mot de passe mis à jour.', 'Password updated.', 'Palavra-passe atualizada.')); navigate('/espace'); } catch (err) { setError(err instanceof Error ? err.message : tx('Erreur', 'Error', 'Erro')); } finally { setLoading(false); }
  };

  if (isNewPasswordStep) return (
    <AuthShell title={tx('Nouveau mot de passe', 'New password', 'Nova palavra-passe')}>
      <form onSubmit={save} className="space-y-4" noValidate>
        <Field label={tx('Nouveau mot de passe', 'New password', 'Nova palavra-passe')} hint={tx('10 caractères minimum, avec lettres et chiffres.', 'At least 10 characters, with letters and numbers.', 'Mínimo de 10 caracteres, com letras e números.')} error={error} required>{(p) => <Input {...p} type="password" autoComplete="new-password" value={pwd} onChange={(e) => setPwd(e.target.value)} />}</Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>{tx('Enregistrer', 'Save', 'Guardar')}</Button>
      </form>
    </AuthShell>
  );
  return (
    <AuthShell title={tx('Mot de passe oublié', 'Forgot password', 'Esqueceu a palavra-passe')} subtitle={tx('Recevez un lien sécurisé pour définir un nouveau mot de passe.', 'Get a secure link to set a new password.', 'Receba uma ligação segura para definir uma nova palavra-passe.')}>
      {sent ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-soft"><MailCheck className="mx-auto h-10 w-10 text-gold" /><p className="mt-3 text-ink/75">{tx('Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d’être envoyé.', 'If an account exists for this address, a reset email has just been sent.', 'Se existir uma conta para este endereço, acaba de ser enviado um e-mail de reposição.')}</p></div>
      ) : (
        <form onSubmit={request} className="space-y-4" noValidate>
          <Field label={tx('Adresse e-mail', 'Email address', 'Endereço de e-mail')} error={error} required>{(p) => <Input {...p} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>{tx('Envoyer le lien', 'Send the link', 'Enviar a ligação')}</Button>
        </form>
      )}
      <p className="mt-8 text-center text-sm"><Link to="/connexion" className="link-gold">{tx('Retour à la connexion', 'Back to login', 'Voltar ao início de sessão')}</Link></p>
    </AuthShell>
  );
}
