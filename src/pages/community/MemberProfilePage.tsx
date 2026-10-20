import { useParams } from 'react-router-dom';
import { Briefcase, Church, Layers, Lock, Mail, MapPin, Phone } from 'lucide-react';
import { Avatar } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { ButtonLink } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/lib/permissions';
import { listDirectory } from '@/services';

export default function MemberProfilePage() {
  const { id = '' } = useParams();
  const { profile } = useAuth();
  const privileged = can(profile, 'members.read_private');
  const { data, loading } = useAsync(async () => {
    if (!profile) return null;
    const row = (await listDirectory(privileged)).find((r) => r.entry.id === id);
    return row ? { raw: row, entry: row.entry } : null;
  }, [id, profile?.id]);

  if (!profile) return <div className="container-page py-16"><EmptyState icon={<Lock className="h-6 w-6" />} title="Profil réservé aux membres connectés" action={<ButtonLink to="/connexion">Se connecter</ButtonLink>} /></div>;
  if (loading) return <PageLoader />;
  if (!data) return <div className="container-page py-16"><EmptyState title="Profil introuvable ou non public." action={<ButtonLink to="/communaute/annuaire" variant="outline">Retour à l’annuaire</ButtonLink>} /></div>;
  const { entry, raw } = data;
  const rows = [
    { icon: MapPin, label: 'Localisation', value: [entry.city, entry.country].filter(Boolean).join(', ') },
    { icon: Church, label: 'Paroisse', value: entry.parishName },
    { icon: Layers, label: 'Section', value: entry.sectionName },
    { icon: Briefcase, label: 'Fonction', value: entry.functionTitle },
    { icon: Mail, label: 'E-mail', value: entry.email },
    { icon: Phone, label: 'Téléphone', value: entry.phone },
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
              <p className="text-ink/60">{entry.parishName ?? 'Rattachement non public'}</p>
            </div>
          </CardBody>
          <dl className="grid gap-px overflow-hidden rounded-b-2xl border-t border-night/[0.06] bg-night/[0.06] sm:grid-cols-2">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-white px-6 py-4">
                <Icon className="h-5 w-5 text-gold" aria-hidden />
                <div><dt className="text-xs text-ink/50">{label}</dt><dd className="text-sm font-medium text-night">{value || <span className="italic text-ink/40">Non communiqué</span>}</dd></div>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
