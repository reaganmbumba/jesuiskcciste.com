import { Link } from 'react-router-dom';
import { Award, CalendarDays, Church, Clock, GraduationCap, HandCoins, Megaphone, Users } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/Misc';
import { DemoBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { ROLE_LABELS, can } from '@/lib/permissions';
import { announcementsRepo, auditRepo, contributionsRepo, coursesRepo, eventsRepo, membersRepo, parishesRepo } from '@/services';
import { isDemoMode } from '@/config/env';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';

/** Statistiques calculées à partir des données (aucune valeur codée en dur). */
export default function AdminOverview() {
  const { profile } = useAuth();
  const { locale } = useI18n();
  const { data, loading } = useAsync(() => Promise.all([membersRepo.all(), parishesRepo.all(), eventsRepo.all(), coursesRepo.all(), announcementsRepo.all(), contributionsRepo.all(), auditRepo.all()]), []);
  const roles = profile?.roles.filter((r) => r.role !== 'member').map((r) => ROLE_LABELS[r.role]).join(', ');
  if (loading || !data) return <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  const [members, parishes, events, courses, anns, contribs, logs] = data;
  const pendingMembers = members.filter((m) => m.status === 'pending');
  const pendingAnns = anns.filter((a) => a.status === 'pending');
  const toVerify = contribs.filter((c) => c.status === 'declared' || c.status === 'pending_verification');
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-2xl font-semibold text-night">Vue d’ensemble</h1><p className="text-sm text-ink/60">Rôle(s) : {roles || 'Membre'}</p></div>
        {isDemoMode && <span className="flex items-center gap-2 text-xs text-ink/55"><DemoBadge /> Chiffres calculés sur les données fictives</span>}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Membres actifs" value={members.filter((m) => m.status === 'active').length} />
        <StatCard icon={<Church className="h-5 w-5" />} label="Paroisses" value={parishes.length} />
        <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Événements à venir" value={events.filter((e) => e.startsAt > new Date().toISOString() && e.status === 'scheduled').length} />
        <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Formations publiées" value={courses.filter((c) => c.status === 'published').length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardBody>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-night"><Clock className="h-5 w-5 text-gold" />À traiter</h2>
          <ul className="space-y-2 text-sm">
            {can(profile, 'members.read_private') && <li><Link to="/admin/membres" className="flex justify-between rounded-lg bg-mist px-3 py-2 hover:bg-gold-50"><span>Adhésions en attente</span><strong>{pendingMembers.length}</strong></Link></li>}
            {(can(profile, 'announcements.moderate')) && <li><Link to="/admin/annonces" className="flex justify-between rounded-lg bg-mist px-3 py-2 hover:bg-gold-50"><span className="flex items-center gap-1.5"><Megaphone className="h-4 w-4" />Annonces à valider</span><strong>{pendingAnns.length}</strong></Link></li>}
            {can(profile, 'contributions.manage') && <li><Link to="/admin/projets" className="flex justify-between rounded-lg bg-mist px-3 py-2 hover:bg-gold-50"><span className="flex items-center gap-1.5"><HandCoins className="h-4 w-4" />Contributions à vérifier</span><strong>{toVerify.length}</strong></Link></li>}
            {can(profile, 'certificates.manage') && <li><Link to="/admin/certificats" className="flex justify-between rounded-lg bg-mist px-3 py-2 hover:bg-gold-50"><span className="flex items-center gap-1.5"><Award className="h-4 w-4" />Certificats</span><strong>→</strong></Link></li>}
          </ul>
        </CardBody></Card>
        <Card className="lg:col-span-2"><CardBody>
          <h2 className="mb-3 font-semibold text-night">Répartition des membres par pays</h2>
          <ul className="space-y-2">
            {Object.entries(members.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.country]: (acc[m.country] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).map(([country, n]) => (
              <li key={country} className="flex items-center gap-3 text-sm"><span className="w-28 shrink-0 text-ink/70">{country}</span><span className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist"><span className="block h-full rounded-full bg-gradient-to-r from-night to-night-500" style={{ width: `${(n / members.length) * 100}%` }} /></span><span className="w-8 text-right tabular-nums font-semibold text-night">{n}</span></li>
            ))}
          </ul>
        </CardBody></Card>
      </div>
      {can(profile, 'audit.read') && (
        <Card><CardBody>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-night">Activité récente</h2><Link to="/admin/journaux" className="link-gold text-sm">Journaux d’audit</Link></div>
          <ul className="divide-y divide-night/[0.06] text-sm">{logs.slice(0, 5).map((l) => <li key={l.id} className="flex justify-between gap-3 py-2"><span><strong className="text-night">{l.actor}</strong> · <code className="text-xs text-ink/60">{l.action}</code></span><span className="text-ink/50">{formatDate(l.createdAt, locale, { dateStyle: 'short', timeStyle: 'short' })}</span></li>)}</ul>
        </CardBody></Card>
      )}
    </div>
  );
}
