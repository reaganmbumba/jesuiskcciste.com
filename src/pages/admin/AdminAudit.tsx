import { CrudTable } from '@/features/administration/CrudTable';
import { auditRepo } from '@/services';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';
import type { AuditLog } from '@/types';

/** Journal d'audit en lecture seule (en production : écrit par triggers SQL, non modifiable). */
export default function AdminAudit() {
  const { locale } = useI18n();
  return (
    <CrudTable<AuditLog> entity="audit_logs" title="Journaux d’audit" repo={auditRepo} exportName="journal-audit" canCreate={false} canDelete={false} pageSize={20}
      searchFields={['actor', 'action', 'entity']}
      columns={[
        { key: 'createdAt', label: 'Date', render: (l) => formatDate(l.createdAt, locale, { dateStyle: 'short', timeStyle: 'medium' }) },
        { key: 'actor', label: 'Auteur' }, { key: 'action', label: 'Action', render: (l) => <code className="text-xs">{l.action}</code> },
        { key: 'entity', label: 'Table' }, { key: 'entityId', label: 'Élément', render: (l) => <code className="text-xs">{l.entityId ?? '—'}</code> }, { key: 'details', label: 'Détails' },
      ]}
    />
  );
}
