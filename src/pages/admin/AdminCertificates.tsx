import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { DemoInline } from '@/components/common/DemoNotice';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { listMyCertificates } from '@/services';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import type { Certificate } from '@/types';

/** Les certificats sont émis uniquement par le serveur (submit_quiz_attempt). L'administration peut les consulter et les révoquer. */
export default function AdminCertificates() {
  const { profile } = useAuth();
  const { locale } = useI18n();
  const { data = [] } = useAsync(async () => {
    if (isDemoMode) return listMyCertificates(profile!.id);
    const { data, error } = await supabase!.from('certificates').select('*').order('issued_at', { ascending: false }).limit(200);
    if (error) throw error;
    return camelize<Certificate[]>(data ?? []);
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-night">Certificats</h1>
      <DemoInline>Démonstration : seuls les certificats obtenus dans cet onglet apparaissent.</DemoInline>
      <Card><CardBody>
        <p className="text-sm text-ink/65">Les certificats ne peuvent pas être créés manuellement : ils sont émis par le système après vérification des critères (leçons terminées, examen réussi au-dessus du seuil). La révocation se fait via la fonction <code>revoke_certificate</code> et est journalisée.</p>
      </CardBody></Card>
      {data.length ? (
        <Card className="overflow-x-auto"><table className="table-kcc"><thead><tr><th>Identifiant</th><th>Titulaire</th><th>Formation</th><th>Date</th><th>Score</th><th>État</th></tr></thead>
          <tbody>{data.map((c) => <tr key={c.id}><td className="font-mono text-xs">{c.code}</td><td>{c.holderName}</td><td>{c.courseTitle}</td><td>{formatDate(c.issuedAt, locale, { dateStyle: 'short' })}</td><td>{c.score} %</td><td><Badge tone={c.revoked ? 'red' : 'green'}>{c.revoked ? 'Révoqué' : 'Valide'}</Badge></td></tr>)}</tbody></table></Card>
      ) : <EmptyState title="Aucun certificat émis." />}
    </div>
  );
}
