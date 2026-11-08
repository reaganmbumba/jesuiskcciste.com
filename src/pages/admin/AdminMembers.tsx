import { useState } from 'react';
import { Ban, CheckCircle2, KeyRound, MessageCircle, Smartphone, UserCog } from 'lucide-react';
import { CrudTable, IconAction } from '@/features/administration/CrudTable';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Misc';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { hasRole, ROLE_LABELS } from '@/lib/permissions';
import { membersRepo, parishesRepo, sectionsRepo, writeAudit } from '@/services';
import type { Profile, RoleKey } from '@/types';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { env } from '@/config/env';
import { adminReaderAction, adminSetMatricule, demoMatricule, matriculeInitials, listMatricules, matriculeMessage, type MatriculeRow, waNumber } from '@/features/news/readerAccess';

const STATUS = { active: ['Actif', 'green'], pending: ['En attente', 'amber'], suspended: ['Suspendu', 'red'] } as const;

export default function AdminMembers() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const { data } = useAsync(() => Promise.all([parishesRepo.all(), sectionsRepo.all()]), []);
  const [parishes = [], sections = []] = data ?? [];
  const [roleFor, setRoleFor] = useState<Profile | null>(null);
  const [role, setRole] = useState<RoleKey>('section_leader');
  const [statusChange, setStatusChange] = useState<{ m: Profile; to: Profile['status']; reload: () => void } | null>(null);
  const isCentral = hasRole(profile, 'central_admin');
  const mats = useAsync(() => listMatricules([]).catch(() => ({} as Record<string, MatriculeRow>)), []);
  const matOf = (m: Profile) => mats.data?.[m.id]?.matricule ?? (isDemoMode ? demoMatricule(m.id, matriculeInitials(m)) : null);
  const [editMat, setEditMat] = useState<{ m: Profile; value: string } | null>(null);
  const sendWhatsApp = async (m: Profile) => {
    const mat = matOf(m);
    if (!mat) { notify('Ce membre n’a pas encore de matricule.', 'error'); return; }
    const num = waNumber(m.phone);
    window.open(`https://wa.me/${num ?? ''}?text=${encodeURIComponent(matriculeMessage(m.firstName, mat, env.siteUrl || 'https://www.jesuiskcciste.com'))}`, '_blank', 'noopener');
    if (!num) notify('Pas de numéro dans le profil : choisissez le contact dans WhatsApp.');
    await adminReaderAction(m.id, 'envoye').catch(() => undefined);
    mats.reload();
  };
  const releaseDevice = async (m: Profile) => {
    try { await adminReaderAction(m.id, 'liberer'); notify('Téléphone libéré : le membre peut saisir son matricule sur son nouvel appareil.'); mats.reload(); }
    catch (e) { notify(`Échec : ${e instanceof Error ? e.message : String(e)}`, 'error'); }
  };
  const saveMatricule = async () => {
    if (!editMat) return;
    try { const v = await adminSetMatricule(editMat.m.id, editMat.value); notify(`Matricule enregistré : ${v}`); setEditMat(null); mats.reload(); }
    catch (e) { notify(`Échec : ${e instanceof Error ? e.message : String(e)}`, 'error'); }
  };
  const myParishes = profile?.roles.filter((r) => r.role === 'parish_leader').map((r) => r.parishId);
  const actor = profile ? `${profile.firstName} ${profile.lastName}` : '';

  const applyStatus = async () => {
    if (!statusChange) return;
    try {
      if (isDemoMode) await membersRepo.update(statusChange.m.id, { status: statusChange.to });
      else {
        // « status » est exclu des écritures génériques du dépôt : mise à jour explicite, contrôlée par RLS.
        const { data: rows, error } = await supabase!.from('profiles').update({ status: statusChange.to }).eq('id', statusChange.m.id).select('id');
        if (error) throw error;
        if (!rows?.length) throw new Error('Modification refusée : ce membre n’est pas dans votre périmètre.');
      }
    } catch (e) {
      notify(`Échec : ${e instanceof Error ? e.message : (e as { message?: string })?.message ?? String(e)}`, 'error');
      return;
    }
    await writeAudit(actor, `member.${statusChange.to}`, 'profiles', statusChange.m.id);
    notify(statusChange.to === 'active' ? 'Adhésion validée.' : 'Compte suspendu.');
    statusChange.reload();
    setStatusChange(null);
  };
  const assignRole = async () => {
    if (!roleFor) return;
    if (!isDemoMode) {
      const { error } = await supabase!.rpc('assign_role', { p_user_id: roleFor.id, p_role: role, p_parish_id: roleFor.parishId, p_section_id: roleFor.sectionId });
      if (error) { notify(error.message, 'error'); return; }
    }
    await writeAudit(actor, 'role.assign', 'role_assignments', roleFor.id, role);
    notify(isDemoMode ? `Rôle « ${ROLE_LABELS[role]} » simulé (démonstration).` : 'Rôle attribué.');
    setRoleFor(null);
  };

  return (
    <>
      <CrudTable<Profile>
        entity="profiles" title="Gestion des membres" repo={membersRepo} exportName="membres" canCreate={false} canDelete={isCentral}
        searchFields={['firstName', 'lastName', 'city', 'country']}
        scope={(m) => isCentral || (!!m.parishId && !!myParishes?.includes(m.parishId))}
        filters={[
          { key: 'status', label: 'Statut', options: [{ value: 'active', label: 'Actif' }, { value: 'pending', label: 'En attente' }, { value: 'suspended', label: 'Suspendu' }] },
          { key: 'parishId', label: 'Paroisse', options: parishes.map((p) => ({ value: p.id, label: p.name })) },
        ]}
        columns={[
          { key: 'name', label: 'Membre', render: (m) => <span className="flex items-center gap-3"><Avatar person={m} url={m.avatarUrl} size={32} /><span className="font-medium text-night">{m.firstName} {m.lastName}</span></span>, csv: (m) => `${m.firstName} ${m.lastName}` },
          { key: 'city', label: 'Localisation', render: (m) => `${m.city}, ${m.country}`, csv: (m) => `${m.city}, ${m.country}` },
          { key: 'parishId', label: 'Paroisse', render: (m) => parishes.find((p) => p.id === m.parishId)?.name ?? '—', csv: (m) => parishes.find((p) => p.id === m.parishId)?.name },
          { key: 'sectionId', label: 'Section', render: (m) => sections.find((s) => s.id === m.sectionId)?.name ?? '—', csv: (m) => sections.find((s) => s.id === m.sectionId)?.name },
          { key: 'matricule', label: 'Matricule', render: (m) => { const r = mats.data?.[m.id]; const v = matOf(m); return v ? <span className="block"><span className="font-mono font-semibold text-night">{v}</span>{r?.deviceLabel && <span className="block text-xs text-ink/50">{r.deviceLabel}</span>}{r?.sentAt && <span className="block text-xs text-green-700">Envoyé</span>}</span> : '—'; }, csv: (m) => matOf(m) ?? '' },
          { key: 'status', label: 'Statut', render: (m) => <Badge tone={STATUS[m.status][1]}>{STATUS[m.status][0]}</Badge>, csv: (m) => STATUS[m.status][0] },
        ]}
        formFields={[
          { key: 'functionTitle', label: 'Fonction (validée)', type: 'text', hint: 'Laisser vide si aucune.' },
          { key: 'parishId', label: 'Paroisse', type: 'select', options: parishes.map((p) => ({ value: p.id, label: p.name })) },
          { key: 'sectionId', label: 'Section', type: 'select', options: sections.map((s) => ({ value: s.id, label: s.name })) },
        ]}
        rowActions={(m, reload) => (
          <>
            {m.status !== 'active' && <IconAction label="Valider / réactiver" tone="green" onClick={() => setStatusChange({ m, to: 'active', reload })}><CheckCircle2 className="h-4 w-4" /></IconAction>}
            {m.status === 'active' && <IconAction label="Suspendre" tone="red" onClick={() => setStatusChange({ m, to: 'suspended', reload })}><Ban className="h-4 w-4" /></IconAction>}
            <IconAction label="Envoyer le matricule par WhatsApp" tone="green" onClick={() => void sendWhatsApp(m)}><MessageCircle className="h-4 w-4" /></IconAction>
            {mats.data?.[m.id]?.deviceLabel && <IconAction label="Libérer le téléphone (nouvel appareil)" tone="gold" onClick={() => void releaseDevice(m)}><Smartphone className="h-4 w-4" /></IconAction>}
            {isCentral && <IconAction label="Modifier le matricule" tone="gold" onClick={() => setEditMat({ m, value: matOf(m) ?? '' })}><KeyRound className="h-4 w-4" /></IconAction>}
            <IconAction label="Attribuer un rôle" tone="gold" onClick={() => setRoleFor(m)}><UserCog className="h-4 w-4" /></IconAction>
          </>
        )}
      />
      <ConfirmDialog open={!!statusChange} title={statusChange?.to === 'active' ? 'Valider ce compte ?' : 'Suspendre ce compte ?'} message={statusChange ? `${statusChange.m.firstName} ${statusChange.m.lastName}`.trim() + (statusChange.m.email ? ` — ${statusChange.m.email}` : '') : ''} danger={statusChange?.to === 'suspended'} onConfirm={applyStatus} onCancel={() => setStatusChange(null)} />
      <Modal open={!!editMat} onClose={() => setEditMat(null)} title="Modifier le matricule" footer={<><Button variant="outline" onClick={() => setEditMat(null)}>Annuler</Button><Button onClick={saveMatricule}>Enregistrer</Button></>}>
        <p className="mb-4 text-sm text-ink/70">{editMat?.m.firstName} {editMat?.m.lastName} — par exemple le numéro du registre de l’église. Laisser vide pour un nouveau numéro automatique. Le téléphone autorisé est libéré.</p>
        <Field label="Matricule">{(p) => <Input {...p} value={editMat?.value ?? ''} onChange={(e) => setEditMat((x) => (x ? { ...x, value: e.target.value.toUpperCase() } : x))} placeholder="KCC-MMR-00256" />}</Field>
      </Modal>
      <Modal open={!!roleFor} onClose={() => setRoleFor(null)} title="Attribuer un rôle" footer={<><Button variant="outline" onClick={() => setRoleFor(null)}>Annuler</Button><Button onClick={assignRole}>Attribuer</Button></>}>
        <p className="mb-4 text-sm text-ink/70">{roleFor?.firstName} {roleFor?.lastName} — le rôle est limité au périmètre de sa paroisse ou section. Seul l’administrateur central peut attribuer les rôles transverses.</p>
        <Field label="Rôle">{(p) => <Select {...p} value={role} onChange={(e) => setRole(e.target.value as RoleKey)}>{(Object.keys(ROLE_LABELS) as RoleKey[]).filter((r) => r !== 'visitor' && r !== 'member' && (isCentral || r === 'section_leader')).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</Select>}</Field>
      </Modal>
    </>
  );
}
