import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { useI18n } from '@/i18n';

export default function NotFoundPage() {
  const { tx } = useI18n();
  return (
    <section className="relative overflow-hidden bg-night py-28 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,98,.18),transparent_60%)]" aria-hidden />
      <div className="container-page relative">
        <Compass className="mx-auto h-12 w-12 text-gold" aria-hidden />
        <p className="mt-6 font-display text-7xl font-semibold text-gold">404</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{tx('Cette page est introuvable', 'Page not found', 'Página não encontrada')}</h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">{tx('Le lien est peut-être incorrect, ou le contenu a été déplacé ou archivé.', 'The link may be wrong, or the content has been moved or archived.', 'A ligação pode estar incorreta, ou o conteúdo foi movido ou arquivado.')}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink to="/" variant="gold">{tx('Retour à l’accueil', 'Back to home', 'Voltar ao início')}</ButtonLink>
          <ButtonLink to="/agenda" variant="light">{tx('Voir l’agenda', 'View the calendar', 'Ver a agenda')}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
