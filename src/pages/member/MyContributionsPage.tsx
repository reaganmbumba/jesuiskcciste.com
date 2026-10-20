import { HandCoins } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { ButtonLink } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { contributionsRepo, projectsRepo } from '@/services';
import { PAYMENT_PROVIDERS } from '@/features/solidarity/payments';
import { useI18n } from '@/i18n';
import { formatCurrency, formatDate } from '@/utils/format';

const ST = { declared: ['Déclarée', 'amber'], pending_verification: ['En vérification', 'blue'], confirmed: ['Confirmée', 'green'], rejected: ['Rejetée', 'red'] } as const;

export default function MyContributionsPage() {
  const { profile } = useAuth();
  const { locale } = useI18n();
  const { data, loading } = useAsync(() => Promise.all([contributionsRepo.all(), projectsRepo.all()]), []);
  if (loading) return <PageLoader />;
  const [contribs = [], projects = []] = data ?? [];
  // En production, la RLS ne renvoie que les contributions de l'utilisateur.
  const mine = contribs.filter((c) => c.contributorId === profile?.id);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-night">Mes contributions</h1>
      <p className="text-sm text-ink/65">Ces informations ne sont visibles que par vous et les gestionnaires de solidarité habilités. Une contribution déclarée n’est comptabilisée qu’après vérification.</p>
      {mine.length ? (
        <Card className="overflow-x-auto"><table className="table-kcc"><thead><tr><th>Date</th><th>Projet</th><th>Moyen</th><th className="text-right">Montant</th><th>Statut</th></tr></thead>
          <tbody>{mine.map((c) => <tr key={c.id}><td>{formatDate(c.createdAt, locale, { dateStyle: 'short' })}</td><td>{projects.find((p) => p.id === c.projectId)?.name}</td><td>{PAYMENT_PROVIDERS[c.provider].label}</td><td className="text-right tabular-nums">{formatCurrency(c.amount, c.currency, locale)}</td><td><Badge tone={ST[c.status][1]}>{ST[c.status][0]}</Badge></td></tr>)}</tbody>
        </table></Card>
      ) : <EmptyState icon={<HandCoins className="h-6 w-6" />} title="Aucune contribution" action={<ButtonLink to="/solidarite/projets">Voir les projets</ButtonLink>} />}
    </div>
  );
}
