import { Clock, ShieldOff } from 'lucide-react';
import type { AccountStatus } from '@/types';
import { ButtonLink } from '@/components/ui/Button';

export function AccountStatusNotice({ status }: { status: AccountStatus }) {
  const pending = status === 'pending';
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-night/10 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gold-50 text-gold-600">{pending ? <Clock className="h-7 w-7" /> : <ShieldOff className="h-7 w-7" />}</div>
        <h1 className="font-display text-2xl font-semibold text-night">{pending ? 'Adhésion en attente de validation' : 'Compte suspendu'}</h1>
        <p className="mt-2 text-ink/70">
          {pending
            ? 'Votre demande d’adhésion a été reçue. Un responsable de votre paroisse doit la valider avant l’accès à cet espace.'
            : 'Votre compte est actuellement suspendu. Contactez votre responsable de paroisse ou l’administration.'}
        </p>
        <ButtonLink to="/espace" variant="outline" className="mt-6">Retour à mon espace</ButtonLink>
      </div>
    </div>
  );
}
