import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { KeyRound, LockKeyhole, Smartphone } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/i18n';
import { claimReaderDevice, type ReaderStatus } from './readerAccess';

/** Encadré affiché à la fin de l'extrait : demande le matricule pour lire la suite. */
export function MatriculeGate({ status, onUnlocked }: { status: ReaderStatus; onUnlocked: () => void }) {
  const { profile } = useAuth();
  const { tx } = useI18n();
  const location = useLocation();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await claimReaderDevice(value, profile.id);
      onUnlocked();
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setError(m.includes('matricule_incorrect')
        ? tx('Ce matricule ne correspond pas à votre compte. Retrouvez-le dans « Mon espace ».', 'This number does not match your account. You can find it in “My space”.', 'Esta matrícula não corresponde à sua conta. Encontre-a em «O meu espaço».')
        : m.includes('compte_non_valide')
          ? tx('Votre compte est suspendu.', 'Your account is suspended.', 'A sua conta está suspensa.')
          : tx('Vérification impossible pour le moment. Réessayez.', 'Verification failed. Please try again.', 'Não foi possível verificar. Tente novamente.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl bg-night p-6 text-white sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,98,.25),transparent_60%)]" aria-hidden />
      <div className="relative">
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 text-gold-200"><LockKeyhole className="h-5 w-5" /></span>
        <h2 className="font-display text-2xl font-semibold">{tx('La suite est réservée aux KCCistes', 'The rest is for KCCistes only', 'O resto é reservado aos KCCistas')}</h2>

        {status === 'visiteur' && (
          <>
            <p className="mt-2 text-sm text-white/75">{tx('Connectez-vous puis saisissez votre matricule personnel pour lire tout l’article. Pas encore de matricule ? Inscrivez-vous : il s’affiche aussitôt à l’écran.', 'Log in, then enter your personal member number to read the whole article. No number yet? Sign up: it is shown on screen right away.', 'Inicie sessão e introduza a sua matrícula pessoal para ler o artigo completo. Ainda sem matrícula? Inscreva-se: aparece logo no ecrã.')}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink to="/connexion" state={{ from: location.pathname }} variant="gold">{tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>
              <ButtonLink to="/matricule" variant="light">{tx('Obtenir mon matricule', 'Get my number', 'Obter a minha matrícula')}</ButtonLink>
            </div>
          </>
        )}

        {status === 'non_valide' && (
          <p className="mt-2 text-sm text-white/75">{tx('Votre compte est suspendu. Contactez l’administration de l’église.', 'Your account is suspended. Please contact the church administration.', 'A sua conta está suspensa. Contacte a administração da igreja.')}</p>
        )}

        {(status === 'matricule_requis' || status === 'autre_appareil') && (
          <form onSubmit={submit} className="mt-2">
            {status === 'autre_appareil'
              ? <p className="flex gap-2 rounded-xl bg-amber-400/15 p-3 text-sm text-amber-100"><Smartphone className="mt-0.5 h-4 w-4 shrink-0" />{tx('Votre compte lit déjà les articles sur un autre appareil. Un seul téléphone est autorisé : si vous saisissez votre matricule ici, l’autre appareil sera bloqué.', 'Your account is already reading on another device. Only one phone is allowed: entering your number here will lock the other device.', 'A sua conta já lê os artigos noutro aparelho. Só um telemóvel é autorizado: se introduzir aqui a matrícula, o outro será bloqueado.')}</p>
              : <p className="text-sm text-white/75">{tx('Saisissez votre matricule personnel. Il ne fonctionne que sur un seul téléphone à la fois : ne le partagez pas.', 'Enter your personal member number. It works on one phone at a time: do not share it.', 'Introduza a sua matrícula pessoal. Só funciona num telemóvel de cada vez: não a partilhe.')}</p>}
            <label className="mt-4 block text-sm font-medium text-white/85" htmlFor="matricule">{tx('Mon matricule', 'My member number', 'A minha matrícula')}</label>
            <div className="mt-1.5 flex flex-col gap-3 sm:flex-row">
              <Input id="matricule" value={value} onChange={(e) => setValue(e.target.value.toUpperCase())} placeholder="KCC-00012" autoComplete="off" autoCapitalize="characters" className="!bg-white text-night sm:max-w-xs" />
              <Button type="submit" variant="gold" disabled={busy || !value.trim()} icon={<KeyRound className="h-4 w-4" />}>{busy ? tx('Vérification…', 'Checking…', 'A verificar…') : tx('Lire la suite', 'Read more', 'Ler o resto')}</Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
            <p className="mt-4 text-xs text-white/55">{tx('Matricule oublié ?', 'Forgot your number?', 'Esqueceu a matrícula?')} <a href="/matricule" className="font-semibold text-gold-200 underline">{tx('Le revoir ici', 'See it here', 'Veja-a aqui')}</a></p>
          </form>
        )}
      </div>
    </div>
  );
}
