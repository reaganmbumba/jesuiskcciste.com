import { Link } from 'react-router-dom';
import { Award, Bell, CalendarClock, CalendarDays, CheckCheck, ClipboardCheck, GraduationCap, HandHeart, Megaphone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { listMyNotifications, notificationsRepo } from '@/services';
import { useI18n } from '@/i18n';
import { cn, formatDate } from '@/utils/format';
import type { NotificationKind } from '@/types';

const ICONS: Record<NotificationKind, typeof Bell> = { announcement: Megaphone, event: CalendarDays, schedule_change: CalendarClock, course: GraduationCap, exam_result: ClipboardCheck, certificate: Award, project_update: HandHeart };

export default function NotificationsPage() {
  const { locale } = useI18n();
  const { data = [], loading, setData } = useAsync(listMyNotifications, []);
  const markRead = async (id: string) => { await notificationsRepo.update(id, { read: true }); setData(data.map((n) => (n.id === id ? { ...n, read: true } : n))); };
  const markAll = async () => { await Promise.all(data.filter((n) => !n.read).map((n) => notificationsRepo.update(n.id, { read: true }))); setData(data.map((n) => ({ ...n, read: true }))); };
  if (loading) return <PageLoader />;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between"><h1 className="font-display text-2xl font-semibold text-night">Notifications</h1>{data.some((n) => !n.read) && <Button size="sm" variant="outline" icon={<CheckCheck className="h-4 w-4" />} onClick={markAll}>Tout marquer comme lu</Button>}</div>
      {data.length ? (
        <Card><ul className="divide-y divide-night/[0.06]">
          {data.map((n) => { const Icon = ICONS[n.kind]; return (
            <li key={n.id} className={cn('flex gap-4 px-5 py-4', !n.read && 'bg-gold-50/50')}>
              <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', n.read ? 'bg-mist text-ink/50' : 'bg-night text-gold')}><Icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', n.read ? 'text-ink/80' : 'font-semibold text-night')}>{n.title}</p>
                <p className="text-sm text-ink/60">{n.body}</p>
                <div className="mt-1 flex gap-3 text-xs"><span className="text-ink/45">{formatDate(n.createdAt, locale, { dateStyle: 'medium' })}</span>{n.link && <Link to={n.link} className="link-gold" onClick={() => !n.read && markRead(n.id)}>Ouvrir</Link>}{!n.read && <button className="text-ink/50 hover:text-night" onClick={() => markRead(n.id)}>Marquer comme lu</button>}</div>
              </div>
              {!n.read && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-gold" aria-label="Non lue" />}
            </li>
          ); })}
        </ul></Card>
      ) : <EmptyState icon={<Bell className="h-6 w-6" />} title="Aucune notification." />}
    </div>
  );
}
