import { Newspaper } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { ButtonLink } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/AuthContext';
import { MyMatriculeCard } from '@/features/news/MyMatriculeCard';
import { useI18n } from '@/i18n';
import SignupPage from '@/pages/auth/SignupPage';

/**
 * Lien à publier dans le groupe WhatsApp : jesuiskcciste.com/matricule.
 * Visiteur → formulaire d'inscription ; membre connecté → son matricule.
 */
export default function MatriculePage() {
  const { profile, loading } = useAuth();
  const { tx } = useI18n();
  if (loading) return <PageLoader />;
  if (!profile) return <SignupPage matricule />;
  return (
    <>
      <PageHeader eyebrow={tx('Accès aux articles', 'Article access', 'Acesso aos artigos')} title={tx('Mon matricule KCCiste', 'My KCCiste number', 'A minha matrícula KCCista')} description={tx('Le matricule personnel ouvre la lecture complète des articles du site.', 'Your personal number unlocks full articles on the site.', 'A matrícula pessoal abre a leitura completa dos artigos.')} share={false} />
      <div className="container-page max-w-2xl space-y-6 py-12">
        <MyMatriculeCard />
        <ButtonLink to="/actualites" icon={<Newspaper className="h-4 w-4" />}>{tx('Lire les articles', 'Read the articles', 'Ler os artigos')}</ButtonLink>
      </div>
    </>
  );
}
