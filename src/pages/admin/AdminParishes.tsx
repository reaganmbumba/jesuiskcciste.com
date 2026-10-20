import { useState } from 'react';
import { CrudTable, Tabs } from '@/features/administration/CrudTable';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { hasRole } from '@/lib/permissions';
import { parishesRepo, sectionsRepo, unitsRepo } from '@/services';
import type { OrganizationalUnit, Parish, Section } from '@/types';

export default function AdminParishes() {
  const { profile } = useAuth();
  const central = hasRole(profile, 'central_admin');
  const myParishes = profile?.roles.filter((r) => r.role === 'parish_leader').map((r) => r.parishId) ?? [];
  const [tab, setTab] = useState<'parishes' | 'sections' | 'units'>(central ? 'parishes' : 'sections');
  const { data: parishes = [] } = useAsync(() => parishesRepo.all(), [tab]);
  const { data: units = [] } = useAsync(() => unitsRepo.all(), [tab]);
  const tabs = [
    ...(central ? [{ key: 'parishes' as const, label: 'Paroisses' }] : []),
    { key: 'sections' as const, label: 'Sections' },
    ...(central ? [{ key: 'units' as const, label: 'Niveaux d’organisation' }] : []),
  ];
  return (
    <>
      <h1 className="mb-4 font-display text-2xl font-semibold text-night">Paroisses et sections</h1>
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'parishes' && (
        <CrudTable<Parish> entity="parishes" title="Paroisses" repo={parishesRepo} exportName="paroisses" searchFields={['name', 'city', 'country']}
          columns={[{ key: 'name', label: 'Nom' }, { key: 'city', label: 'Ville' }, { key: 'country', label: 'Pays' }, { key: 'leaderName', label: 'Responsable', render: (p) => p.leaderName || <span className="text-ink/40">à désigner</span> }]}
          formFields={[
            { key: 'name', label: 'Nom', type: 'text', required: true }, { key: 'country', label: 'Pays', type: 'text', required: true }, { key: 'city', label: 'Ville', type: 'text', required: true },
            { key: 'address', label: 'Adresse publique (facultatif)', type: 'text' }, { key: 'unitId', label: 'Niveau de rattachement', type: 'select', options: units.map((u) => ({ value: u.id, label: u.name })) },
            { key: 'leaderName', label: 'Responsable autorisé', type: 'text', hint: 'Le compte responsable s’attribue depuis Gestion des membres.' }, { key: 'description', label: 'Description', type: 'textarea' },
          ]}
          defaults={{ description: '' }}
        />
      )}
      {tab === 'sections' && (
        <CrudTable<Section> entity="sections" title="Sections" repo={sectionsRepo} exportName="sections" searchFields={['name']}
          scope={(s) => central || myParishes.includes(s.parishId)}
          filters={[{ key: 'parishId', label: 'Paroisse', options: parishes.filter((p) => central || myParishes.includes(p.id)).map((p) => ({ value: p.id, label: p.name })) }]}
          columns={[{ key: 'name', label: 'Section' }, { key: 'parishId', label: 'Paroisse', render: (s) => parishes.find((p) => p.id === s.parishId)?.name ?? '—' }, { key: 'leaderName', label: 'Responsable', render: (s) => s.leaderName || <span className="text-ink/40">à désigner</span> }]}
          formFields={[
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'parishId', label: 'Paroisse', type: 'select', required: true, options: parishes.filter((p) => central || myParishes.includes(p.id)).map((p) => ({ value: p.id, label: p.name })) },
            { key: 'leaderName', label: 'Chef de section', type: 'text' }, { key: 'description', label: 'Description / programme', type: 'textarea' },
          ]}
          defaults={{ description: '' }}
        />
      )}
      {tab === 'units' && (
        <CrudTable<OrganizationalUnit> entity="organizational_units" title="Niveaux d’organisation" repo={unitsRepo} searchFields={['name', 'level']}
          columns={[{ key: 'name', label: 'Nom' }, { key: 'level', label: 'Niveau' }, { key: 'parentId', label: 'Parent', render: (u) => units.find((x) => x.id === u.parentId)?.name ?? '—' }]}
          formFields={[{ key: 'name', label: 'Nom', type: 'text', required: true }, { key: 'level', label: 'Libellé du niveau', type: 'text', required: true, hint: 'Ex. Administration centrale, Région, District…' }, { key: 'parentId', label: 'Niveau parent', type: 'select', options: units.map((u) => ({ value: u.id, label: u.name })) }]}
        />
      )}
    </>
  );
}
