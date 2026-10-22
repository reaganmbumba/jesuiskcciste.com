import { Archive, CalendarClock, XCircle } from 'lucide-react';
import { CrudTable, IconAction } from '@/features/administration/CrudTable';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { hasRole } from '@/lib/permissions';
import { eventsRepo, parishesRepo, writeAudit } from '@/services';
import { EVENT_CATEGORY_LABELS, EVENT_STATUS } from '@/features/events/labels';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';
import type { KccEvent } from '@/types';

const TZ = ['Africa/Kinshasa', 'Africa/Lubumbashi', 'Africa/Luanda', 'Africa/Johannesburg', 'Europe/Brussels', 'Europe/Paris', 'Europe/London', 'America/New_York', 'America/Toronto'];

export default function AdminEvents() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const { locale } = useI18n();
  const { data: parishes = [] } = useAsync(() => parishesRepo.all(), []);
  const central = hasRole(profile, 'central_admin');
  const scoped = profile?.roles.filter((r) => r.role === 'parish_leader' || r.role === 'section_leader').map((r) => r.parishId) ?? [];
  const actor = profile ? `${profile.firstName} ${profile.lastName}` : '';
  const setStatus = async (e: KccEvent, status: KccEvent['status'], reload: () => void) => {
    await eventsRepo.update(e.id, { status }); await writeAudit(actor, `event.${status}`, 'events', e.id); notify(`Événement : ${EVENT_STATUS[status].label.toLowerCase()}.`); reload();
  };
  return (
    <CrudTable<KccEvent>
      entity="events" title="Gestion des événements" repo={eventsRepo} exportName="evenements"
      searchFields={['title', 'location']}
      scope={(e) => central || (!!e.parishId && scoped.includes(e.parishId))}
      filters={[{ key: 'category', label: 'Catégorie', options: Object.entries(EVENT_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })) }, { key: 'status', label: 'Statut', options: Object.entries(EVENT_STATUS).map(([v, s]) => ({ value: v, label: s.label })) }]}
      columns={[
        { key: 'title', label: 'Titre', render: (e) => <span className="font-medium text-night">{e.title}</span> },
        { key: 'startsAt', label: 'Date', render: (e) => formatDate(e.startsAt, locale, { dateStyle: 'short', timeStyle: 'short' }, e.timezone) },
        { key: 'category', label: 'Catégorie', render: (e) => EVENT_CATEGORY_LABELS[e.category] },
        { key: 'parishId', label: 'Paroisse', render: (e) => parishes.find((p) => p.id === e.parishId)?.name ?? 'Central' },
        { key: 'status', label: 'Statut', render: (e) => <Badge tone={EVENT_STATUS[e.status].tone}>{EVENT_STATUS[e.status].label}</Badge>, csv: (e) => EVENT_STATUS[e.status].label },
      ]}
      formFields={[
        { key: 'title', label: 'Titre', type: 'text', required: true, full: true }, { key: 'description', label: 'Description', type: 'textarea', required: true },
        { key: 'startsAt', label: 'Début', type: 'datetime', required: true }, { key: 'endsAt', label: 'Fin', type: 'datetime' },
        { key: 'timezone', label: 'Fuseau horaire', type: 'select', required: true, options: TZ.map((t) => ({ value: t, label: t })) }, { key: 'location', label: 'Lieu', type: 'text', required: true },
        { key: 'parishId', label: 'Paroisse organisatrice', type: 'select', options: parishes.filter((p) => central || scoped.includes(p.id)).map((p) => ({ value: p.id, label: p.name })) },
        { key: 'category', label: 'Catégorie', type: 'select', required: true, options: Object.entries(EVENT_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })) },
        { key: 'organizer', label: 'Responsable', type: 'text' }, { key: 'posterUrl', label: 'Affiche', type: 'image' },
        { key: 'audience', label: 'Visibilité', type: 'select', required: true, options: [{ value: 'public', label: 'Public' }, { value: 'members', label: 'Membres' }] },
        { key: 'status', label: 'Statut', type: 'select', required: true, options: Object.entries(EVENT_STATUS).map(([v, s]) => ({ value: v, label: s.label })) },
        { key: 'participation', label: 'Modalités de participation', type: 'textarea' }, { key: 'registrationEnabled', label: 'Activer le formulaire d’inscription', type: 'checkbox' },
      ]}
      defaults={{ timezone: 'Africa/Kinshasa', status: 'scheduled', audience: 'public', category: 'culte', registrationEnabled: false, participation: '' }}
      rowActions={(e, reload) => (
        <>
          {e.status === 'scheduled' && <IconAction label="Reporter" tone="gold" onClick={() => setStatus(e, 'postponed', reload)}><CalendarClock className="h-4 w-4" /></IconAction>}
          {e.status !== 'cancelled' && e.status !== 'archived' && <IconAction label="Annuler" tone="red" onClick={() => setStatus(e, 'cancelled', reload)}><XCircle className="h-4 w-4" /></IconAction>}
          {e.status !== 'archived' && <IconAction label="Archiver" onClick={() => setStatus(e, 'archived', reload)}><Archive className="h-4 w-4" /></IconAction>}
        </>
      )}
    />
  );
}
