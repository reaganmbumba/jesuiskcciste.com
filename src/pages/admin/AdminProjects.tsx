import { useState } from 'react';
import { CheckCircle2, FileDown, XCircle } from 'lucide-react';
import { CrudTable, IconAction, Tabs } from '@/features/administration/CrudTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { contributionsRepo, expensesRepo, parishesRepo, projectsRepo, writeAudit } from '@/services';
import { PAYMENT_PROVIDERS } from '@/features/solidarity/payments';
import { summarizeContributions, summarizeExpenses } from '@/features/solidarity/finance';
import { downloadCsv } from '@/utils/csv';
import { useI18n } from '@/i18n';
import { formatCurrency, formatDate, percent } from '@/utils/format';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { Contribution, Expense, SolidarityProject } from '@/types';

const C_STATUS = { declared: ['Déclarée', 'amber'], pending_verification: ['En vérification', 'blue'], confirmed: ['Confirmée', 'green'], rejected: ['Rejetée', 'red'] } as const;
const P_STATUS = [{ value: 'draft', label: 'Brouillon' }, { value: 'active', label: 'En cours' }, { value: 'completed', label: 'Terminé' }, { value: 'suspended', label: 'Suspendu' }, { value: 'archived', label: 'Archivé' }];

export default function AdminProjects() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const { locale } = useI18n();
  const [tab, setTab] = useState<'projects' | 'contributions' | 'expenses'>('projects');
  const [confirming, setConfirming] = useState<{ c: Contribution; reload: () => void } | null>(null);
  const [reference, setReference] = useState('');
  const { data } = useAsync(() => Promise.all([projectsRepo.all(), parishesRepo.all(), contributionsRepo.all(), expensesRepo.all()]), [tab]);
  const [projects = [], parishes = [], contribs = [], expenses = []] = data ?? [];
  const actor = profile ? `${profile.firstName} ${profile.lastName}` : '';

  /** Confirmation manuelle : exige une référence (reçu, bordereau). En production : RPC confirm_contribution (rôle vérifié en base). */
  const confirmContribution = async () => {
    if (!confirming) return;
    if (reference.trim().length < 4) { notify('Une référence de transaction ou de reçu est obligatoire.', 'error'); return; }
    if (!isDemoMode) {
      const { error } = await supabase!.rpc('confirm_contribution', { p_contribution_id: confirming.c.id, p_reference: reference.trim() });
      if (error) { notify(error.message, 'error'); return; }
    } else {
      await contributionsRepo.update(confirming.c.id, { status: 'confirmed', transactionReference: reference.trim() });
    }
    await writeAudit(actor, 'contribution.confirm', 'contributions', confirming.c.id, reference.trim());
    notify('Contribution confirmée.'); confirming.reload(); setConfirming(null); setReference('');
  };
  const reject = async (c: Contribution, reload: () => void) => { await contributionsRepo.update(c.id, { status: 'rejected' }); await writeAudit(actor, 'contribution.reject', 'contributions', c.id); notify('Contribution rejetée.'); reload(); };

  const exportReport = (p: SolidarityProject) => {
    const pc = contribs.filter((c) => c.projectId === p.id);
    const pe = expenses.filter((e) => e.projectId === p.id);
    const s = summarizeContributions(pc);
    downloadCsv(`rapport-${p.slug}.csv`, [
      { Rubrique: 'Projet', Libellé: p.name, Montant: '', Devise: p.currency, Statut: p.status },
      { Rubrique: 'Objectif', Libellé: '', Montant: p.goalAmount, Devise: p.currency, Statut: '' },
      { Rubrique: 'Total confirmé', Libellé: '', Montant: s.confirmed, Devise: p.currency, Statut: '' },
      { Rubrique: 'Total déclaré non vérifié', Libellé: '', Montant: s.declared, Devise: p.currency, Statut: '' },
      { Rubrique: 'Total dépenses', Libellé: '', Montant: summarizeExpenses(pe), Devise: p.currency, Statut: '' },
      ...pc.map((c) => ({ Rubrique: 'Contribution', Libellé: c.contributorLabel, Montant: c.amount, Devise: c.currency, Statut: C_STATUS[c.status][0] })),
      ...pe.map((e) => ({ Rubrique: 'Dépense', Libellé: e.label, Montant: e.amount, Devise: e.currency, Statut: formatDate(e.spentAt, locale, { dateStyle: 'short' }) })),
    ]);
  };

  return (
    <>
      <h1 className="mb-4 font-display text-2xl font-semibold text-night">Projets et contributions</h1>
      <Tabs tabs={[{ key: 'projects', label: 'Projets' }, { key: 'contributions', label: 'Contributions' }, { key: 'expenses', label: 'Dépenses' }]} value={tab} onChange={setTab} />
      {tab === 'projects' && (
        <CrudTable<SolidarityProject> entity="projects" title="Projets de solidarité" repo={projectsRepo} exportName="projets" searchFields={['name']}
          columns={[
            { key: 'name', label: 'Projet', render: (p) => <span className="font-medium text-night">{p.name}</span> },
            { key: 'parishId', label: 'Bénéficiaire', render: (p) => parishes.find((x) => x.id === p.parishId)?.name ?? 'Central' },
            { key: 'goalAmount', label: 'Objectif', render: (p) => formatCurrency(p.goalAmount, p.currency, locale) },
            { key: 'confirmedAmount', label: 'Confirmé', render: (p) => `${formatCurrency(p.confirmedAmount, p.currency, locale)} (${percent(p.confirmedAmount, p.goalAmount)} %)` },
            { key: 'status', label: 'Statut', render: (p) => <Badge tone={p.status === 'active' ? 'green' : 'neutral'}>{P_STATUS.find((s) => s.value === p.status)?.label}</Badge> },
          ]}
          formFields={[
            { key: 'name', label: 'Nom', type: 'text', required: true }, { key: 'slug', label: 'Identifiant d’URL', type: 'text', required: true },
            { key: 'summary', label: 'Résumé', type: 'text', required: true, full: true }, { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'parishId', label: 'Paroisse bénéficiaire', type: 'select', options: parishes.map((p) => ({ value: p.id, label: p.name })) },
            { key: 'goalAmount', label: 'Objectif financier', type: 'number', required: true },
            { key: 'currency', label: 'Devise', type: 'select', required: true, options: [{ value: 'USD', label: 'USD' }, { value: 'CDF', label: 'CDF' }, { value: 'EUR', label: 'EUR' }] },
            { key: 'launchedAt', label: 'Date de lancement', type: 'date', required: true }, { key: 'deadline', label: 'Date limite', type: 'date' },
            { key: 'status', label: 'Statut', type: 'select', required: true, options: P_STATUS }, { key: 'imageUrl', label: 'Photo', type: 'image' },
            { key: 'participationTerms', label: 'Modalités de participation', type: 'textarea' },
          ]}
          defaults={{ currency: 'USD', status: 'draft', confirmedAmount: 0, declaredAmount: 0, launchedAt: new Date().toISOString(), participationTerms: 'Le paiement en ligne n’est pas encore disponible.' }}
          rowActions={(p) => <IconAction label="Exporter le rapport financier (CSV)" tone="gold" onClick={() => exportReport(p)}><FileDown className="h-4 w-4" /></IconAction>}
        />
      )}
      {tab === 'contributions' && (
        <CrudTable<Contribution> entity="contributions" title="Contributions" repo={contributionsRepo} exportName="contributions" canCreate={false} canDelete={false} searchFields={['contributorLabel', 'transactionReference']}
          filters={[{ key: 'status', label: 'Statut', options: Object.entries(C_STATUS).map(([v, [l]]) => ({ value: v, label: l })) }, { key: 'projectId', label: 'Projet', options: projects.map((p) => ({ value: p.id, label: p.name })) }]}
          columns={[
            { key: 'createdAt', label: 'Date', render: (c) => formatDate(c.createdAt, locale, { dateStyle: 'short' }) },
            { key: 'projectId', label: 'Projet', render: (c) => projects.find((p) => p.id === c.projectId)?.name ?? '—' },
            { key: 'contributorLabel', label: 'Contributeur' },
            { key: 'provider', label: 'Moyen', render: (c) => PAYMENT_PROVIDERS[c.provider].label },
            { key: 'amount', label: 'Montant', render: (c) => formatCurrency(c.amount, c.currency, locale) },
            { key: 'transactionReference', label: 'Référence', render: (c) => c.transactionReference ? <code className="text-xs">{c.transactionReference}</code> : '—' },
            { key: 'status', label: 'Statut', render: (c) => <Badge tone={C_STATUS[c.status][1]}>{C_STATUS[c.status][0]}</Badge>, csv: (c) => C_STATUS[c.status][0] },
          ]}
          rowActions={(c, reload) => (c.status === 'declared' || c.status === 'pending_verification') ? (
            <>
              <IconAction label="Confirmer après vérification" tone="green" onClick={() => setConfirming({ c, reload })}><CheckCircle2 className="h-4 w-4" /></IconAction>
              <IconAction label="Rejeter" tone="red" onClick={() => reject(c, reload)}><XCircle className="h-4 w-4" /></IconAction>
            </>
          ) : null}
        />
      )}
      {tab === 'expenses' && (
        <CrudTable<Expense> entity="expenses" title="Dépenses" repo={expensesRepo} exportName="depenses" searchFields={['label']}
          filters={[{ key: 'projectId', label: 'Projet', options: projects.map((p) => ({ value: p.id, label: p.name })) }]}
          columns={[{ key: 'spentAt', label: 'Date', render: (e) => formatDate(e.spentAt, locale, { dateStyle: 'short' }) }, { key: 'projectId', label: 'Projet', render: (e) => projects.find((p) => p.id === e.projectId)?.name ?? '—' }, { key: 'label', label: 'Libellé' }, { key: 'amount', label: 'Montant', render: (e) => formatCurrency(e.amount, e.currency, locale) }, { key: 'receiptUrl', label: 'Justificatif', render: (e) => e.receiptUrl ? 'Oui' : <span className="text-amber-700">Manquant</span> }]}
          formFields={[{ key: 'projectId', label: 'Projet', type: 'select', required: true, options: projects.map((p) => ({ value: p.id, label: p.name })) }, { key: 'label', label: 'Libellé', type: 'text', required: true }, { key: 'amount', label: 'Montant', type: 'number', required: true }, { key: 'currency', label: 'Devise', type: 'select', required: true, options: [{ value: 'USD', label: 'USD' }, { value: 'CDF', label: 'CDF' }, { value: 'EUR', label: 'EUR' }] }, { key: 'spentAt', label: 'Date', type: 'date', required: true }, { key: 'receiptUrl', label: 'Pièce justificative (chemin privé)', type: 'text' }]}
          defaults={{ currency: 'USD', spentAt: new Date().toISOString() }}
        />
      )}
      <Modal open={!!confirming} onClose={() => setConfirming(null)} title="Confirmer une contribution" footer={<><Button variant="outline" onClick={() => setConfirming(null)}>Annuler</Button><Button onClick={confirmContribution}>Confirmer</Button></>}>
        <p className="mb-4 text-sm text-ink/70">Ne confirmez qu’après vérification effective (relevé opérateur, reçu signé, relevé bancaire). Une capture d’écran ne suffit pas. Cette action est journalisée.</p>
        <Field label="Référence de transaction ou n° de reçu" required>{(p) => <Input {...p} value={reference} onChange={(e) => setReference(e.target.value)} />}</Field>
      </Modal>
    </>
  );
}
