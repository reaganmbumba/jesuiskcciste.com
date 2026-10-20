import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CalendarDays, Church, FileText, Lock, Receipt, Smartphone } from 'lucide-react';
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

const STATUS = { declared: { l: 'Déclarée', t: 'amber' }, pending_verification: { l: 'En vérification', t: 'blue' }, confirmed: { l: 'Confirmée', t: 'green' }, rejected: { l: 'Rejetée', t: 'red' } } as const;

export default function ProjectDetailPage() {
  const { slug = '' } = useParams();
  const { profile } = useAuth();
  const { locale } = useI18n();
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
  if (!data) return <div className="container-page py-16"><EmptyState title="Projet introuvable." action={<ButtonLink to="/solidarite/projets" variant="outline">Tous les projets</ButtonLink>} /></div>;
  const { p, contribs, expenses, parish } = data;
  const pct = percent(p.confirmedAmount, p.goalAmount);
  const mine = contribs.filter((c) => profile && c.contributorId === profile.id);
  const visibleContribs = financeAccess ? contribs : mine;

  const declare = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) { notify('Montant invalide.', 'error'); return; }
    setSaving(true);
    try {
      await declareContribution({ projectId: p.id, contributorId: profile!.id, contributorLabel: `${profile!.firstName} ${profile!.lastName}`, amount: n, currency: p.currency, provider, transactionReference: null });
      notify('Contribution déclarée. Elle sera comptabilisée après vérification par un gestionnaire.', 'info');
      setDeclOpen(false); setAmount(''); void reload();
    } catch (err) { notify(err instanceof Error ? err.message : 'Erreur', 'error'); } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader eyebrow="Projet de solidarité" title={p.name} description={p.summary}>
        <Badge tone={p.status === 'active' ? 'green' : 'gold'}>{p.status === 'active' ? 'En cours' : p.status === 'completed' ? 'Terminé' : p.status}</Badge>
      </PageHeader>
      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DemoInline>Démonstration : montants, contributions et dépenses fictifs.</DemoInline>
          <Card><CardBody><h2 className="font-display text-xl font-semibold text-night">Description</h2><p className="mt-2 text-ink/75">{p.description}</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <p className="flex items-center gap-2"><Church className="h-4 w-4 text-gold" />{parish?.name ?? 'Projet central'}</p>
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />Lancé le {formatDate(p.launchedAt, locale, { dateStyle: 'medium' })}</p>
              {p.deadline && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />Échéance {formatDate(p.deadline, locale, { dateStyle: 'medium' })}</p>}
            </div>
          </CardBody></Card>

          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-night"><Receipt className="h-5 w-5 text-gold" />Historique des dépenses</h2>
            {expenses.length ? (
              <div className="mt-3 overflow-x-auto"><table className="table-kcc"><thead><tr><th>Date</th><th>Libellé</th><th className="text-right">Montant</th><th>Justificatif</th></tr></thead>
                <tbody>{expenses.map((e) => <tr key={e.id}><td>{formatDate(e.spentAt, locale, { dateStyle: 'short' })}</td><td>{e.label}</td><td className="text-right tabular-nums">{formatCurrency(e.amount, e.currency, locale)}</td><td>{e.receiptUrl ? <a className="link-gold" href={e.receiptUrl}>Voir</a> : <span className="text-ink/40">—</span>}</td></tr>)}</tbody>
                <tfoot><tr><td colSpan={2} className="font-semibold">Total des dépenses</td><td className="text-right font-semibold tabular-nums">{formatCurrency(summarizeExpenses(expenses), p.currency, locale)}</td><td /></tr></tfoot>
              </table></div>
            ) : <p className="mt-2 text-sm text-ink/60">Aucune dépense enregistrée pour le moment.</p>}
          </CardBody></Card>

          <Card><CardBody>
            <h2 className="font-display text-xl font-semibold text-night">{financeAccess ? 'Contributions (vue gestionnaire)' : 'Mes contributions à ce projet'}</h2>
            {!profile ? <p className="mt-2 flex items-center gap-2 text-sm text-ink/60"><Lock className="h-4 w-4" />Les contributions individuelles sont confidentielles.</p>
              : visibleContribs.length ? (
                <div className="mt-3 overflow-x-auto"><table className="table-kcc"><thead><tr><th>Date</th>{financeAccess && <th>Contributeur</th>}<th>Moyen</th><th className="text-right">Montant</th><th>Statut</th></tr></thead>
                  <tbody>{visibleContribs.map((c) => <tr key={c.id}><td>{formatDate(c.createdAt, locale, { dateStyle: 'short' })}</td>{financeAccess && <td>{c.contributorLabel}</td>}<td>{PAYMENT_PROVIDERS[c.provider].label}</td><td className="text-right tabular-nums">{formatCurrency(c.amount, c.currency, locale)}</td><td><Badge tone={STATUS[c.status].t}>{STATUS[c.status].l}</Badge></td></tr>)}</tbody></table></div>
              ) : <p className="mt-2 text-sm text-ink/60">Aucune contribution.</p>}
          </CardBody></Card>

          <Card><CardBody>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-night"><FileText className="h-5 w-5 text-gold" />Rapport financier et bilan</h2>
            <p className="mt-2 text-sm text-ink/65">{p.status === 'completed' ? 'Le bilan final sera publié ici par la gestion de la solidarité.' : 'Le rapport financier est mis à jour par les gestionnaires habilités.'}</p>
          </CardBody></Card>
        </div>

        <aside className="space-y-4">
          <Card className="lg:sticky lg:top-24"><CardBody>
            <p className="font-display text-3xl font-semibold text-night">{formatCurrency(p.confirmedAmount, p.currency, locale)}</p>
            <p className="text-sm text-ink/60">confirmés sur {formatCurrency(p.goalAmount, p.currency, locale)}</p>
            <div className="mt-4"><ProgressBar value={pct} /></div>
            <p className="mt-1 text-right text-sm font-semibold text-gold-600">{pct} %</p>
            {p.declaredAmount > p.confirmedAmount && <p className="mt-2 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900"><AlertCircle className="h-4 w-4 shrink-0" />{formatCurrency(p.declaredAmount - p.confirmedAmount, p.currency, locale)} déclarés, en attente de vérification (non comptabilisés).</p>}
            <div className="mt-5 border-t border-night/10 pt-4">
              <h2 className="font-semibold text-night">Modalités de participation</h2>
              <p className="mt-1 text-sm text-ink/65">{p.participationTerms}</p>
              {!onlinePaymentAvailable() && <p className="mt-3 flex gap-2 rounded-xl bg-mist p-3 text-xs text-ink/70"><Smartphone className="h-4 w-4 shrink-0 text-gold-600" />Le paiement en ligne n’est pas encore disponible.</p>}
              {p.status === 'active' && (profile ? <Button variant="outline" className="mt-4 w-full" onClick={() => setDeclOpen(true)}>Déclarer une contribution</Button> : <ButtonLink to="/connexion" variant="outline" className="mt-4 w-full">Se connecter pour contribuer</ButtonLink>)}
            </div>
          </CardBody></Card>
        </aside>
      </section>

      <Modal open={declOpen} onClose={() => setDeclOpen(false)} title="Déclarer une contribution">
        <form onSubmit={declare} className="space-y-4">
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Une déclaration n’est pas un paiement confirmé. Elle sera vérifiée par un gestionnaire habilité avant d’être comptabilisée. Ne communiquez jamais votre code PIN.</p>
          <Field label={`Montant (${p.currency})`} required>{(f) => <Input {...f} type="number" min="1" step="1" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} required />}</Field>
          <Field label="Moyen utilisé" required>{(f) => <Select {...f} value={provider} onChange={(e) => setProvider(e.target.value as PaymentProvider)}>{Object.entries(PAYMENT_PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</Select>}</Field>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeclOpen(false)}>Annuler</Button><Button type="submit" loading={saving}>Déclarer</Button></div>
        </form>
      </Modal>
    </>
  );
}
