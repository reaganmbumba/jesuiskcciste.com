import { Lock } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <section className="container-page py-24 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-50 text-gold-600"><Lock className="h-8 w-8" /></div>
      <h1 className="mt-5 font-display text-3xl font-semibold text-night">Accès non autorisé</h1>
      <p className="mx-auto mt-2 max-w-md text-ink/70">Votre rôle ne permet pas d’accéder à cette section. Si vous pensez qu’il s’agit d’une erreur, contactez votre responsable.</p>
      <ButtonLink to="/espace" className="mt-6">Retour à mon espace</ButtonLink>
    </section>
  );
}
