import { CalendarCheck, CheckCircle2, Clock, MessageCircle, Phone } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { env } from '@/config/env';
import { DONATION_ACCOUNTS } from '@/content/solidarite';
import { useAuth } from '@/features/auth/AuthContext';
import {
  COTISATION_METHODS, CotisationsNotInstalled, formatMoney, getCotisationSettings, listCotisations, memberSituation, monthKey, monthLabel, monthsBetween, proofMessage,
} from '@/features/cotisations/cotisations';
import { getMyMatricule, waNumber } from '@/features/news/readerAccess';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

const PROVIDER_LABEL: Record<string, string> = { orange_money: 'Orange Money', mpesa: 'M-Pesa', airtel_money: 'Airtel Money' };

/** « Mes cotisations » : les mois payés du membre, ce qui reste, et comment payer. */
export default function MyCotisationsPage() {
  const { profile } = useAuth();
  const { tx, locale } = useI18n();
  const { data, loading, error } = useAsync(async () => {
    if (!profile) return null;
    const [settings, pays, matricule] = await Promise.all([getCotisationSettings(), listCotisations(profile.id), getMyMatricule(profile.id, profile.status !== 'suspended').catch(() => null)]);
    return { settings, pays, matricule };
  }, [profile?.id]);

  if (loading) return <PageLoader />;
  const title = <h1 className="font-display text-2xl font-semibold text-night">{tx('Mes cotisations', 'My monthly dues', 'As minhas quotas')}</h1>;
  if (error instanceof CotisationsNotInstalled || !profile) return <div className="space-y-4">{title}<p className="text-sm text-ink/65">{tx('Le suivi des cotisations ouvre bientôt.', 'Dues tracking opens soon.', 'O acompanhamento das quotas abre em breve.')}</p></div>;
  if (error || !data) return <div className="space-y-4">{title}<p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{tx('Chargement impossible. Réessayez plus tard.', 'Could not load. Try again later.', 'Não foi possível carregar. Tente mais tarde.')}</p></div>;

  const { settings, pays, matricule } = data;
  const s = memberSituation(pays, settings, profile.createdAt);
  const year = monthKey().slice(0, 4);
  const yearMonths = monthsBetween(`${year}-01`, `${year}-12`);
  const paid = new Set(s.paid);
  const current = monthKey();
  const name = [profile.lastName, profile.middleName, profile.firstName].filter(Boolean).join(' ');
  const site = env.siteUrl || 'https://www.jesuiskcciste.com';
  const treasurer = waNumber(DONATION_ACCOUNTS[0]?.number) ?? '';
  const sendProof = () => window.open(`https://wa.me/${treasurer}?text=${encodeURIComponent(proofMessage(name, matricule, s.unpaid.length ? s.unpaid : [current], site))}`, '_blank', 'noopener');
  const loc = locale as 'fr' | 'en' | 'pt';

  return (
    <div className="space-y-6">
      {title}
      <p className="text-sm text-ink/65">{formatMoney(settings.monthlyAmount, settings.currency)} {tx('par mois', 'per month', 'por mês')}{settings.purpose ? ` · ${settings.purpose}` : ''}. {tx('Seuls vous et l’administration voyez ces informations.', 'Only you and the administration can see this.', 'Só você e a administração veem estas informações.')}</p>

      <div className={cn('flex items-start gap-4 rounded-2xl border p-5', s.upToDate ? 'border-emerald-200 bg-emerald-50' : 'border-amber-300 bg-amber-50')}>
        {s.upToDate ? <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-700" /> : <Clock className="h-7 w-7 shrink-0 text-amber-700" />}
        <div className="min-w-0 space-y-1">
          <p className="font-display text-lg font-semibold text-night">{s.upToDate ? tx('Vous êtes à jour. Merci !', 'You are up to date. Thank you!', 'Está em dia. Obrigado!') : tx(`${s.unpaid.length} mois à régler`, `${s.unpaid.length} month(s) due`, `${s.unpaid.length} mês(es) em atraso`)}</p>
          <p className="text-sm text-ink/70">{s.upToDate
            ? (s.coveredUntil ? tx(`Payé jusqu’à ${monthLabel(s.coveredUntil, loc).toLowerCase()}.`, `Paid until ${monthLabel(s.coveredUntil, loc)}.`, `Pago até ${monthLabel(s.coveredUntil, loc).toLowerCase()}.`) : tx('Aucun mois dû pour le moment.', 'Nothing due yet.', 'Nada em dívida por agora.'))
            : `${s.unpaid.map((m) => monthLabel(m, loc)).join(', ')} — ${formatMoney(s.owed, settings.currency)}`}</p>
          {matricule && <p className="text-xs text-ink/55">{tx('Matricule', 'Number', 'Matrícula')} <span className="font-mono font-semibold text-night">{matricule}</span></p>}
        </div>
      </div>

      <Card><CardBody className="space-y-3">
        <p className="flex items-center gap-2 font-semibold text-night"><CalendarCheck className="h-5 w-5 text-gold-700" />{year}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {yearMonths.map((m) => {
            const due = m >= s.firstDue && m <= current;
            const ok = paid.has(m);
            return (
              <div key={m} className={cn('rounded-xl border px-2 py-2 text-center', ok ? 'border-emerald-200 bg-emerald-50' : due ? 'border-red-200 bg-red-50' : 'border-night/8 bg-mist/60')}>
                <p className="text-xs font-semibold text-night">{monthLabel(m, loc, true)}</p>
                <p className={cn('text-[11px]', ok ? 'text-emerald-700' : due ? 'text-red-600' : 'text-ink/40')}>{ok ? tx('Payé', 'Paid', 'Pago') : due ? tx('À payer', 'Due', 'Por pagar') : '—'}</p>
              </div>
            );
          })}
        </div>
      </CardBody></Card>

      <Card><CardBody className="space-y-3">
        <p className="font-semibold text-night">{tx('Comment payer', 'How to pay', 'Como pagar')}</p>
        <ul className="space-y-2">
          {DONATION_ACCOUNTS.map((a) => (
            <li key={a.number} className="flex flex-wrap items-center gap-2 text-sm"><Phone className="h-4 w-4 text-gold-700" /><b>{PROVIDER_LABEL[a.provider] ?? a.provider}</b><span className="font-mono">{a.number}</span><span className="text-ink/55">({a.holder})</span></li>
          ))}
        </ul>
        <p className="text-sm text-ink/65">{tx('Après le paiement, envoyez la preuve (capture ou numéro de transaction) sur WhatsApp. L’administration l’enregistre et le mois passe au vert ici.', 'After paying, send the proof (screenshot or transaction number) on WhatsApp. The administration records it and the month turns green here.', 'Depois de pagar, envie o comprovativo (captura ou número da transação) por WhatsApp. A administração regista-o e o mês fica verde aqui.')}</p>
        <Button onClick={sendProof} icon={<MessageCircle className="h-4 w-4" />}>{tx('Envoyer ma preuve de paiement', 'Send my proof of payment', 'Enviar o meu comprovativo')}</Button>
      </CardBody></Card>

      <div className="space-y-2">
        <p className="font-semibold text-night">{tx('Historique', 'History', 'Histórico')}</p>
        {pays.length ? (
          <Card className="overflow-x-auto"><table className="table-kcc"><thead><tr><th>{tx('Mois', 'Month', 'Mês')}</th><th className="text-right">{tx('Montant', 'Amount', 'Montante')}</th><th>{tx('Moyen', 'Method', 'Meio')}</th><th>{tx('Payé le', 'Paid on', 'Pago em')}</th></tr></thead>
            <tbody>{pays.map((c) => <tr key={c.id}><td className="font-medium">{monthLabel(c.month, loc)}</td><td className="text-right tabular-nums">{formatMoney(c.amount, c.currency)}</td><td>{COTISATION_METHODS[c.method]}</td><td>{new Date(c.paidOn).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td></tr>)}</tbody>
          </table></Card>
        ) : <p className="rounded-2xl bg-mist p-4 text-sm text-ink/60">{tx('Aucun paiement enregistré pour le moment.', 'No payment recorded yet.', 'Nenhum pagamento registado por agora.')}</p>}
      </div>
    </div>
  );
}
