import { Link } from 'react-router-dom';
import { ArrowRight, Award, Bell, CalendarDays, Clock, GraduationCap, HandCoins, Megaphone } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Avatar, ProgressBar, StatCard } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/States';
import { AccountStatusBanner } from './AccountStatusBanner';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { coursesRepo, listMyCertificates, listMyEnrollments, listMyNotifications, listPublishedAnnouncements, listUpcomingEvents, parishesRepo, sectionsRepo } from '@/services';
import { useI18n } from '@/i18n';
import { formatDate, formatTime } from '@/utils/format';

export default function MemberDashboard() {
  const { profile } = useAuth();
  const { locale } = useI18n();
  const p = profile!;
  const { data, loading } = useAsync(async () => {
    const [events, anns, enrollments, courses, certs, notifs, parish, section] = await Promise.all([
      listUpcomingEvents({ signedIn: true, limit: 4 }), listPublishedAnnouncements({ signedIn: true, limit: 3 }), listMyEnrollments(p.id), coursesRepo.all(),
      listMyCertificates(p.id), listMyNotifications(), p.parishId ? parishesRepo.get(p.parishId) : null, p.sectionId ? sectionsRepo.get(p.sectionId) : null,
    ]);
    return { events, anns, enrollments, courses, certs, notifs, parish, section };
  }, [p.id]);
  const hour = new Date().getHours();
  const unread = data?.notifs.filter((n) => !n.read).length ?? 0;

  return (
    <div className="space-y-6">
      <AccountStatusBanner />
      <div className="relative overflow-hidden rounded-2xl bg-night p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-gold/20" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,98,.22),transparent_55%)]" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar person={p} url={p.avatarUrl} size={72} />
          <div className="flex-1">
            <p className="text-sm text-gold-200">{hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'},</p>
            <h1 className="font-display text-3xl font-semibold">{p.firstName} {p.lastName}</h1>
            <p className="mt-1 text-sm text-white/65">{data?.parish?.name ?? 'Paroisse non renseignée'}{data?.section ? ` · ${data.section.name}` : ''} · {p.city}, {p.country}</p>
          </div>
          <ButtonLink to="/espace/profil" variant="light" size="sm">Modifier mon profil</ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Formations en cours" value={data?.enrollments.filter((e) => e.progress < 100).length ?? '—'} />
        <StatCard icon={<Award className="h-5 w-5" />} label="Certificats obtenus" value={data?.certs.length ?? '—'} />
        <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Activités à venir" value={data?.events.length ?? '—'} />
        <StatCard icon={<Bell className="h-5 w-5" />} label="Notifications non lues" value={data ? unread : '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardBody>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold text-night">Formations en cours</h2><Link to="/espace/formations" className="link-gold text-sm">Tout voir</Link></div>
          {loading ? <Skeleton className="h-32" /> : data?.enrollments.length ? (
            <ul className="space-y-4">
              {data.enrollments.map((e) => { const c = data.courses.find((x) => x.id === e.courseId); if (!c) return null; return (
                <li key={e.courseId}><Link to={`/academie/formations/${c.slug}`} className="block rounded-xl p-3 hover:bg-mist">
                  <div className="flex items-center justify-between gap-3"><p className="font-semibold text-night">{c.title}</p><span className="text-sm font-semibold text-gold-600">{e.progress} %</span></div>
                  <div className="mt-2"><ProgressBar value={e.progress} label={`Progression ${c.title}`} /></div>
                </Link></li>
              ); })}
            </ul>
          ) : <EmptyState title="Aucune formation en cours." action={<ButtonLink to="/academie/formations" size="sm">Parcourir le catalogue</ButtonLink>} />}
        </CardBody></Card>

        <Card><CardBody>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold text-night">Notifications</h2><Link to="/espace/notifications" className="link-gold text-sm">Tout voir</Link></div>
          {data?.notifs.filter((n) => !n.read).slice(0, 4).map((n) => (
            <Link key={n.id} to={n.link ?? '/espace/notifications'} className="flex gap-3 rounded-xl p-2.5 hover:bg-mist"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" /><span><span className="block text-sm font-semibold text-night">{n.title}</span><span className="block text-xs text-ink/60">{n.body}</span></span></Link>
          ))}
          {data && !unread && <p className="text-sm text-ink/55">Vous êtes à jour.</p>}
        </CardBody></Card>

        <Card className="lg:col-span-2"><CardBody>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold text-night">Prochaines activités</h2><Link to="/agenda" className="link-gold text-sm">Agenda</Link></div>
          <ul className="divide-y divide-night/[0.06]">
            {data?.events.map((e) => (
              <li key={e.id}><Link to={`/agenda/${e.id}`} className="flex items-center gap-4 py-3 hover:text-gold-700">
                <span className="w-14 rounded-lg bg-mist py-1.5 text-center"><span className="block text-[10px] font-semibold uppercase text-gold-600">{formatDate(e.startsAt, locale, { month: 'short' }, e.timezone)}</span><span className="font-display text-lg font-semibold text-night">{formatDate(e.startsAt, locale, { day: '2-digit' }, e.timezone)}</span></span>
                <span className="min-w-0 flex-1"><span className="block truncate font-medium text-night">{e.title}</span><span className="flex items-center gap-1 text-xs text-ink/55"><Clock className="h-3 w-3" />{formatTime(e.startsAt, locale, e.timezone)} · {e.location}</span></span>
                <ArrowRight className="h-4 w-4 text-ink/30" />
              </Link></li>
            ))}
          </ul>
        </CardBody></Card>

        <Card><CardBody>
          <h2 className="mb-4 font-display text-xl font-semibold text-night">Dernières annonces</h2>
          <ul className="space-y-3">{data?.anns.map((a) => <li key={a.id}><Link to={`/actualites/${a.id}`} className="flex gap-3 rounded-xl p-2 hover:bg-mist"><Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span><span className="block text-sm font-medium text-night">{a.title}</span><span className="text-xs text-ink/50">{formatDate(a.publishedAt, locale, { dateStyle: 'medium' })}</span></span></Link></li>)}</ul>
        </CardBody></Card>

        <Card className="lg:col-span-2"><CardBody>
          <h2 className="mb-4 font-display text-xl font-semibold text-night">Certificats et résultats</h2>
          {data?.certs.length ? <ul className="space-y-2">{data.certs.map((c) => <li key={c.id} className="flex items-center justify-between rounded-xl bg-mist px-4 py-3"><span className="font-medium text-night">{c.courseTitle}</span><Badge tone="green">{c.score} %</Badge></li>)}</ul> : <p className="text-sm text-ink/60">Aucun certificat pour le moment. Terminez une formation et réussissez son examen final pour en obtenir un.</p>}
        </CardBody></Card>

        <Card><CardBody>
          <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-semibold text-night"><HandCoins className="h-5 w-5 text-gold" />Mes contributions</h2>
          <p className="text-sm text-ink/60">Visibles uniquement par vous et les gestionnaires habilités.</p>
          <ButtonLink to="/espace/contributions" variant="outline" size="sm" className="mt-4">Consulter</ButtonLink>
        </CardBody></Card>
      </div>
    </div>
  );
}
