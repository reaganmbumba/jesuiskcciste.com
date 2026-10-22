import { useParams } from 'react-router-dom';
import { Briefcase, Building2, Layers, Lock, Mail, MapPin, Phone } from 'lucide-react';
import { Avatar } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { ButtonLink } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/lib/permissions';
import { listDirectory } from '@/services';
import { WriteToMemberButton } from '@/features/messages/MessagesUi';
import { useI18n } from '@/i18n';

export default function MemberProfilePage() {
  const { id = '' } = useParams();
  const { profile } = useAuth();
  const { tx } = useI18n();
  const privileged = can(profile, 'members.read_private');
  const { data, loading } = useAsync(async () => {
    if (!profile) return null;
    const row = (await listDirectory(privileged)).find((r) => r.entry.id === id);
    return row ? { raw: row, entry: row.entry } : null;
  }, [id, profile?.id]);

  if (!profile) return <div className="container-page py-16"><EmptyState icon={<Lock className="h-6 w-6" />} title={tx('Profil réservé aux membres connectés', 'Profile for logged-in members only', 'Perfil reservado aos membros com sessão iniciada')} action={<ButtonLink to="/connexion">{tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>} /></div>;
  if (loading) return <PageLoader />;
  if (!data) return <div className="container-page py-16"><EmptyState title={tx('Profil introuvable ou non public.', 'Profile not found or not public.', 'Perfil não encontrado ou não público.')} action={<ButtonLink to="/communaute/annuaire" variant="outline">{tx('Retour à l’annuaire', 'Back to the directory', 'Voltar ao diretório')}</ButtonLink>} /></div>;
  const { entry, raw } = data;
  const rows = [
    { icon: MapPin, label: tx('Localisation', 'Location', 'Localização'), value: [entry.city, entry.country].filter(Boolean).join(', ') },
    { icon: Building2, label: tx('Paroisse', 'Parish', 'Paróquia'), value: entry.parishName },
    { icon: Layers, label: tx('Section', 'Section', 'Secção'), value: entry.sectionName },
    { icon: Briefcase, label: tx('Fonction', 'Role', 'Função'), value: entry.functionTitle },
    { icon: Mail, label: tx('E-mail', 'Email', 'E-mail'), value: entry.email },
    { icon: Phone, label: tx('Téléphone', 'Phone', 'Telefone'), value: entry.phone },
  ];
  return (
    <div className="bg-mist">
      <div className="h-40 bg-gradient-to-br from-night via-night-700 to-night-500" />
      <div className="container-page -mt-16 pb-16">
        <Card>
          <CardBody className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Avatar person={raw} url={entry.avatarUrl} size={104} />
            <div>
              <h1 className="font-display text-3xl font-semibold text-night">{entry.displayName}</h1>
              <p className="text-ink/60">{entry.parishName ?? tx('Rattachement non public', 'Affiliation not public', 'Vínculo não público')}</p>
              <WriteToMemberButton memberId={entry.id} variant="gold" className="mt-4" />
            </div>
          </CardBody>
          <dl className="grid gap-px overflow-hidden rounded-b-2xl border-t border-night/[0.06] bg-night/[0.06] sm:grid-cols-2">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-white px-6 py-4">
                <Icon className="h-5 w-5 text-gold" aria-hidden />
                <div><dt className="text-xs text-ink/50">{label}</dt><dd className="text-sm font-medium text-night">{value || <span className="italic text-ink/40">{tx('Non communiqué', 'Not provided', 'Não indicado')}</span>}</dd></div>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
