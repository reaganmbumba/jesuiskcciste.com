import { CheckCircle2, Pin, PinOff, Archive } from 'lucide-react';
import { CrudTable, IconAction } from '@/features/administration/CrudTable';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { can, hasRole } from '@/lib/permissions';
import { announcementsRepo, parishesRepo, writeAudit } from '@/services';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';
import type { Announcement } from '@/types';

const STATUS = { draft: ['Brouillon', 'neutral'], pending: ['En attente', 'amber'], published: ['Publiée', 'green'], archived: ['Archivée', 'neutral'] } as const;
const AUD = [{ value: 'public', label: 'Public' }, { value: 'members', label: 'Membres' }, { value: 'leaders', label: 'Responsables' }];

export default function AdminAnnouncements() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const { locale } = useI18n();
  const { data: parishes = [] } = useAsync(() => parishesRepo.all(), []);
  const moderator = can(profile, 'announcements.moderate');
  const central = hasRole(profile, 'central_admin');
  const myParishes = profile?.roles.filter((r) => r.role === 'parish_leader').map((r) => r.parishId) ?? [];
  const actor = profile ? `${profile.firstName} ${profile.lastName}` : '';
  const act = async (a: Announcement, patch: Partial<Announcement>, action: string, msg: string, reload: () => void) => {
    await announcementsRepo.update(a.id, patch); await writeAudit(actor, action, 'announcements', a.id); notify(msg); reload();
  };
  return (
    <CrudTable<Announcement>
      entity="announcements" title="Annonces et publications" repo={announcementsRepo} exportName="annonces"
      searchFields={['title', 'category', 'author']}
      scope={(a) => moderator || central || (!!a.parishId && myParishes.includes(a.parishId))}
      filters={[{ key: 'status', label: 'Statut', options: Object.entries(STATUS).map(([v, [l]]) => ({ value: v, label: l })) }, { key: 'audience', label: 'Audience', options: AUD }]}
      columns={[
        { key: 'title', label: 'Titre', render: (a) => <span className="flex items-center gap-2 font-medium text-night">{a.pinned && <Pin className="h-3.5 w-3.5 text-gold" />}{a.title}</span> },
        { key: 'category', label: 'Catégorie' },
        { key: 'audience', label: 'Audience', render: (a) => AUD.find((x) => x.value === a.audience)?.label },
        { key: 'status', label: 'Statut', render: (a) => <Badge tone={STATUS[a.status][1]}>{STATUS[a.status][0]}</Badge>, csv: (a) => STATUS[a.status][0] },
        { key: 'publishedAt', label: 'Date', render: (a) => formatDate(a.publishedAt, locale, { dateStyle: 'short' }) },
      ]}
      formFields={[
        { key: 'title', label: 'Titre', type: 'text', required: true, full: true }, { key: 'summary', label: 'Résumé', type: 'text', required: true, full: true },
        { key: 'content', label: 'Contenu', type: 'textarea', required: true }, { key: 'category', label: 'Catégorie', type: 'text', required: true },
        { key: 'author', label: 'Auteur', type: 'text', required: true }, { key: 'audience', label: 'Audience autorisée', type: 'select', required: true, options: AUD },
        { key: 'parishId', label: 'Paroisse concernée', type: 'select', options: parishes.filter((p) => central || moderator || myParishes.includes(p.id)).map((p) => ({ value: p.id, label: p.name })) },
        { key: 'imageUrl', label: 'Photo', type: 'image' },
        { key: 'status', label: 'Statut', type: 'select', required: true, hint: moderator ? undefined : 'Sans droit de modération, la publication passe par « En attente ».', options: moderator ? Object.entries(STATUS).map(([v, [l]]) => ({ value: v, label: l })) : [{ value: 'draft', label: 'Brouillon' }, { value: 'pending', label: 'Soumettre pour validation' }] },
      ]}
      defaults={{ status: moderator ? 'draft' : 'pending', audience: 'public', pinned: false, author: actor, publishedAt: new Date().toISOString() }}
      rowActions={(a, reload) => (
        <>
          {moderator && a.status === 'pending' && <IconAction label="Valider et publier" tone="green" onClick={() => act(a, { status: 'published', publishedAt: new Date().toISOString() }, 'announcement.publish', 'Annonce publiée.', reload)}><CheckCircle2 className="h-4 w-4" /></IconAction>}
          {central && a.status === 'published' && <IconAction label={a.pinned ? 'Désépingler' : 'Épingler'} tone="gold" onClick={() => act(a, { pinned: !a.pinned }, 'announcement.pin', a.pinned ? 'Annonce désépinglée.' : 'Annonce épinglée.', reload)}>{a.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}</IconAction>}
          {moderator && a.status !== 'archived' && <IconAction label="Archiver" onClick={() => act(a, { status: 'archived', pinned: false }, 'announcement.archive', 'Annonce archivée.', reload)}><Archive className="h-4 w-4" /></IconAction>}
        </>
      )}
    />
  );
}
