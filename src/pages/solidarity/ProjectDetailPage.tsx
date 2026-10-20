import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CalendarDays, Building2, FileText, Lock, Receipt, Smartphone } from 'lucide-react';
import { PageHeader, ProgressBar } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/lib/permissions';
import { declareContribution, expensesRepo, getProjectBySlug, listProjectContributions, parishesRepo } from '@/services';
import { summarizeExpenses } from '@/features/solidarity/finance';
import { PAYMENT_PROVIDERS, onlinePaymentAvailable } from '@/features/solidarity/payments';
import { useI18n } from '@/i18n';
import { formatCurrency, formatDate, percent } from '@/utils/format';
import type { PaymentProvider } from '@/types';

const STATUS = {
  declared: { l: { fr: 'Déclarée', en: 'Declared', pt: 'Declarada' }, t: 'amber' },
  pending_verification: { l: { fr: 'En vérification', en: 'Being checked', pt: 'Em verificação' }, t: 'blue' },
  confirmed: { l: { fr: 'Confirmée', en: 'Confirmed', pt: 'Confirmada' }, t: 'green' },
  rejected: { l: { fr: 'Rejetée', en: 'Rejected', pt: 'Rejeitada' }, t: 'red' },
} as const;

export default function ProjectDetailPage() {
  const { slug = '' } = useParams();
  const { profile } = useAuth();
  const { locale, tx, pick } = useI18n();
  const { notify } = useToast();
  const [declOpen, setDeclOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<PaymentProvider>('cash');
  const [saving, setSaving] = useState(false);
  const financeAccess = can(profile, 'contributions.read');
  const { data, loading, reload } = useAsync(async () => {
    const p = await getProjectBySlug(slug);
    if (!p) return null;
    const [contribs, expenses, parish] = await Promise.all([listProjectContributions(p.id), expensesRepo.all(), p.parishId ? parishesRepo.get(p.parishId) : null]);
    return { p, contribs, expenses: expenses.filter((e) => e.projectId === p.id), parish };
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!data) return <div className="container-page py-16"><EmptyState title={tx('Projet introuvable.', 'Project not found.', 'Projeto não encontrado.')} action={<ButtonLink to="/solidarite/projets" variant="outline">{tx('Tous les projets', 'All projects', 'Todos os projetos')}</ButtonLink>} /></div>;
  const { p, contribs, expenses, parish } = data;
  const pct = percent(p.confirmedAmount, p.goalAmount);
  const mine = contribs.filter((c) => profile && c.contributorId === profile.id);
  const visibleContribs = financeAccess ? contribs : mine;

  const declare = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) { notify(tx('Montant invalide.', 'Invalid amount.', 'Montante inválido.'), 'error'); return; }
    setSaving(true);
    try {
      await declareContribution({ projectId: p.id, contributorId: profile!.id, contributorLabel: `${profile!.firstName} ${profile!.lastName}`, amount: n, currency: p.currency, provider, transactionReference: null });
      notify(tx('Contribution déclarée. Elle sera comptabilisée après vérification par un gestionnaire.', 'Contribution declared. It will be counted after a manager has checked it.', 'Contribuição declarada. Será contabilizada após verificação por um gestor.'), 'info');
      setDeclOpen(false); setAmount(''); void reload();
    } catch (err) { notify(err instanceof Error ? err.message : tx('Erreur', 'Error', 'Erro'), 'error'); } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader eyebrow={tx('Projet de solidarité', 'Solidarity project', 'Projeto de solidariedade')} title={p.name} description={p.summary}>
        <Badge tone={p.status === 'active' ? 'green' : 'gold'}>{p.status === 'active' ? tx('En cours', 'Ongoing', 'Em curso') : p.status === 'completed' ? tx('Terminé', 'Completed', 'Concluído') : p.status}</Badge>
      </PageHeader>
      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DemoInline>{tx('Démonstration : montants, contributions et dépenses fictifs.', 'Demo: amounts, contributions and expenses are fictitious.', 'Demonstração: montantes, contribuições e despesas fictícios.')}</DemoInline>
          <Card><CardBody><h2 className="font-display text-xl font-semibold text-night">{tx('Description', tx('Description', 'Description', 'Descrição'), 'Descrição')}</h2><p className="mt-2 text-ink/75">{p.description}</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-gold" />{parish?.name ?? tx('Projet central', 'Central project', 'Projeto central')}</p>
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{tx('Lancé le', 'Launched on', 'Lançado a')} {formatDate(p.launchedAt, locale, { dateStyle: 'medium' })}</p>
              {p.deadline && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{tx('Échéance', 'Deadline', 'Prazo')} {formatDate(p.deadline, locale, { dateStyle: 'medium' })}</p>}
            </div>
          </CardBody></Card>

          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-night"><Receipt className="h-5 w-5 text-gold" />{tx('Historique des dépenses', 'Expense history', 'Histórico de despesas')}</h2>
            {expenses.length ? (
              <div className="mt-3 overflow-x-auto"><table className="table-kcc"><thead><tr><th>{tx('Date', 'Date', 'Data')}</th><th>{tx('Libellé', 'Item', 'Descrição')}</th><th className="text-right">{tx('Montant', 'Amount', 'Montante')}</th><th>{tx('Justificatif', 'Receipt', 'Comprovativo')}</th></tr></thead>
                <tbody>{expenses.map((e) => <tr key={e.id}><td>{formatDate(e.spentAt, locale, { dateStyle: 'short' })}</td><td>{e.label}</td><td className="text-right tabular-nums">{formatCurrency(e.amount, e.currency, locale)}</td><td>{e.receiptUrl ? <a className="link-gold" href={e.receiptUrl}>{tx('Voir', 'View', 'Ver')}</a> : <span className="text-ink/40">—</span>}</td></tr>)}</tbody>
                <tfoot><tr><td colSpan={2} className="font-semibold">{tx('Total des dépenses', 'Total expenses', 'Total das despesas')}</td><td className="text-right font-semibold tabular-nums">{formatCurrency(summarizeExpenses(expenses), p.currency, locale)}</td><td /></tr></tfoot>
              </table></div>
            ) : <p className="mt-2 text-sm text-ink/60">{tx('Aucune dépense enregistrée pour le moment.', 'No expenses recorded yet.', 'Nenhuma despesa registada por agora.')}</p>}
          </CardBody></Card>

          <Card><CardBody>
            <h2 className="font-display text-xl font-semibold text-night">{financeAccess ? tx('Contributions (vue gestionnaire)', 'Contributions (manager view)', 'Contribuições (vista de gestor)') : tx('Mes contributions à ce projet', 'My contributions to this project', 'As minhas contribuições para este projeto')}</h2>
            {!profile ? <p className="mt-2 flex items-center gap-2 text-sm text-ink/60"><Lock className="h-4 w-4" />{tx('Les contributions individuelles sont confidentielles.', 'Individual contributions are confidential.', 'As contribuições individuais são confidenciais.')}</p>
              : visibleContribs.length ? (
                <div className="mt-3 overflow-x-auto"><table className="table-kcc"><thead><tr><th>{tx('Date', 'Date', 'Data')}</th>{financeAccess && <th>{tx('Contributeur', 'Contributor', 'Contribuinte')}</th>}<th>{tx('Moyen', 'Method', 'Meio')}</th><th className="text-right">{tx('Montant', 'Amount', 'Montante')}</th><th>{tx('Statut', 'Status', 'Estado')}</th></tr></thead>
                  <tbody>{visibleContribs.map((c) => <tr key={c.id}><td>{formatDate(c.createdAt, locale, { dateStyle: 'short' })}</td>{financeAccess && <td>{c.contributorLabel}</td>}<td>{PAYMENT_PROVIDERS[c.provider].label}</td><td className="text-right tabular-nums">{formatCurrency(c.amount, c.currency, locale)}</td><td><Badge tone={STATUS[c.status].t}>{pick(STATUS[c.status].l)}</Badge></td></tr>)}</tbody></table></div>
              ) : <p className="mt-2 text-sm text-ink/60">{tx('Aucune contribution.', 'No contributions.', 'Nenhuma contribuição.')}</p>}
          </CardBody></Card>

          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-night"><FileText className="h-5 w-5 text-gold" />{tx('Rapport financier et bilan', 'Financial report and outcome', 'Relatório financeiro e balanço')}</h2>
            <p className="mt-2 text-sm text-ink/65">{p.status === 'completed' ? tx('Le bilan final sera publié ici par la gestion de la solidarité.', 'The final report will be published here by the solidarity team.', 'O balanço final será publicado aqui pela gestão da solidariedade.') : tx('Le rapport financier est mis à jour par les gestionnaires habilités.', 'The financial report is updated by authorised managers.', 'O relatório financeiro é atualizado pelos gestores autorizados.')}</p>
          </CardBody></Card>
        </div>

        <aside className="space-y-4">
          <Card className="lg:sticky lg:top-24"><CardBody>
            <p className="font-display text-3xl font-semibold text-night">{formatCurrency(p.confirmedAmount, p.currency, locale)}</p>
            <p className="text-sm text-ink/60">{tx('confirmés sur', 'confirmed of', 'confirmados de')} {formatCurrency(p.goalAmount, p.currency, locale)}</p>
            <div className="mt-4"><ProgressBar value={pct} /></div>
            <p className="mt-1 text-right text-sm font-semibold text-gold-600">{pct} %</p>
            {p.declaredAmount > p.confirmedAmount && <p className="mt-2 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900"><AlertCircle className="h-4 w-4 shrink-0" />{formatCurrency(p.declaredAmount - p.confirmedAmount, p.currency, locale)} {tx('déclarés, en attente de vérification (non comptabilisés).', 'declared, awaiting verification (not counted).', 'declarados, a aguardar verificação (não contabilizados).')}</p>}
            <div className="mt-5 border-t border-night/10 pt-4">
              <h2 className="font-semibold text-night">{tx('Modalités de participation', 'How to take part', 'Modalidades de participação')}</h2>
              <p className="mt-1 text-sm text-ink/65">{p.participationTerms}</p>
              {!onlinePaymentAvailable() && <p className="mt-3 flex gap-2 rounded-xl bg-mist p-3 text-xs text-ink/70"><Smartphone className="h-4 w-4 shrink-0 text-gold-600" />{tx('Le paiement en ligne n’est pas encore disponible.', 'Online payment is not available yet.', 'O pagamento online ainda não está disponível.')}</p>}
              {p.status === 'active' && (profile ? <Button variant="outline" className="mt-4 w-full" onClick={() => setDeclOpen(true)}>{tx('Déclarer une contribution', 'Declare a contribution', 'Declarar uma contribuição')}</Button> : <ButtonLink to="/connexion" variant="outline" className="mt-4 w-full">{tx('Se connecter pour contribuer', 'Log in to contribute', 'Iniciar sessão para contribuir')}</ButtonLink>)}
            </div>
          </CardBody></Card>
        </aside>
      </section>

      <Modal open={declOpen} onClose={() => setDeclOpen(false)} title={tx('Déclarer une contribution', 'Declare a contribution', 'Declarar uma contribuição')}>
        <form onSubmit={declare} className="space-y-4">
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{tx('Une déclaration n’est pas un paiement confirmé. Elle sera vérifiée par un gestionnaire habilité avant d’être comptabilisée. Ne communiquez jamais votre code PIN.', 'A declaration is not a confirmed payment. It will be checked by an authorised manager before it is counted. Never share your PIN code.', 'Uma declaração não é um pagamento confirmado. Será verificada por um gestor autorizado antes de ser contabilizada. Nunca comunique o seu código PIN.')}</p>
          <Field label={`${tx('Montant', 'Amount', 'Montante')} (${p.currency})`} required>{(f) => <Input {...f} type="number" min="1" step="1" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} required />}</Field>
          <Field label={tx('Moyen utilisé', 'Method used', 'Meio utilizado')} required>{(f) => <Select {...f} value={provider} onChange={(e) => setProvider(e.target.value as PaymentProvider)}>{Object.entries(PAYMENT_PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</Select>}</Field>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeclOpen(false)}>{tx('Annuler', 'Cancel', 'Cancelar')}</Button><Button type="submit" loading={saving}>{tx('Déclarer', 'Declare', 'Declarar')}</Button></div>
        </form>
      </Modal>
    </>
  );
}
