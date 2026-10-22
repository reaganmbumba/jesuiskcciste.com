import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Smartphone, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
import { Spinner } from '@/components/ui/Spinner';
import { MOBILE_PROVIDERS, detectProvider, normalizePhone, type MobileProvider } from '@/features/music/shop';
import { getDonationStatus, startDonation } from '@/features/solidarity/donations';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { DONATION_OPERATIONS } from '@/content/solidarite';

type Step = 'form' | 'waiting' | 'paid' | 'failed' | 'timeout';
const POLL_MS = 4000;
const POLL_MAX_MS = 3 * 60 * 1000;

/**
 * Don payé depuis le site : le donateur saisit son numéro, reçoit la demande de
 * paiement sur son téléphone (FlexPay) et la confirme avec son code PIN.
 */
export function OnlineDonate() {
  const { pick, tx } = useI18n();
  const [provider, setProvider] = useState<MobileProvider>('mpesa');
  const [phone, setPhone] = useState('');
  const [operation, setOperation] = useState<string>(DONATION_OPERATIONS[0].key);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD');
  const [name, setName] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onPhone = (v: string) => {
    setPhone(v);
    const p = detectProvider(v);
    if (p) setProvider(p);
  };

  const poll = (donationId: string, token: string, startedAt: number) => {
    timer.current = window.setTimeout(async () => {
      const s = await getDonationStatus(donationId, token).catch(() => 'pending' as const);
      if (s === 'paid' || s === 'failed') return setStep(s);
      if (Date.now() - startedAt > POLL_MAX_MS) return setStep('timeout');
      poll(donationId, token, startedAt);
    }, POLL_MS);
  };

  const submit = async () => {
    const value = Number(amount.replace(/\s/g, '').replace(',', '.'));
    if (!normalizePhone(phone)) return setError(tx('Numéro invalide. Exemple : 081 234 5678.', 'Invalid number. Example: 081 234 5678.', 'Número inválido. Exemplo: 081 234 5678.'));
    if (!(value > 0)) return setError(tx('Indiquez le montant de votre don.', 'Enter the amount of your donation.', 'Indique o montante do seu donativo.'));
    setError(''); setBusy(true);
    try {
      const r = await startDonation({ operation, provider, phone, amount: value, currency, donorName: name });
      setStep('waiting');
      poll(r.donationId, r.token, Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (step !== 'form') {
    const done = step === 'paid';
    return (
      <div className="flex h-full flex-col items-center justify-center py-6 text-center">
        {step === 'waiting' ? <Spinner label={tx('En attente…', 'Waiting…', 'A aguardar…')} /> : done ? <CheckCircle2 className="h-12 w-12 text-green-600" /> : <XCircle className="h-12 w-12 text-red-600" />}
        <p className="mt-4 font-display text-xl text-night">{
          step === 'waiting' ? tx('Confirmez sur votre téléphone', 'Confirm on your phone', 'Confirme no seu telefone')
          : done ? tx('Merci pour votre don !', 'Thank you for your donation!', 'Obrigado pelo seu donativo!')
          : step === 'timeout' ? tx('Pas encore de confirmation', 'No confirmation yet', 'Ainda sem confirmação')
          : tx('Le paiement n’a pas abouti', 'The payment did not go through', 'O pagamento não foi concluído')
        }</p>
        <p className="mt-2 max-w-sm text-sm text-ink/65">{
          step === 'waiting' ? tx('Une demande de paiement a été envoyée. Tapez votre code PIN pour valider le don.', 'A payment request has been sent. Enter your PIN to approve the donation.', 'Foi enviado um pedido de pagamento. Introduza o seu PIN para validar o donativo.')
          : done ? tx('Votre contribution a bien été reçue. Elle sera ajoutée à la liste de l’opération.', 'Your contribution has been received. It will be added to the operation’s list.', 'A sua contribuição foi recebida. Será adicionada à lista da operação.')
          : step === 'timeout' ? tx('Si vous avez confirmé, le don sera bien enregistré. Sinon, vous pouvez réessayer.', 'If you confirmed, the donation will be recorded. Otherwise, you can try again.', 'Se confirmou, o donativo será registado. Caso contrário, pode tentar de novo.')
          : tx('Aucun montant n’a été prélevé. Vous pouvez réessayer.', 'Nothing was charged. You can try again.', 'Nada foi cobrado. Pode tentar de novo.')
        }</p>
        {step !== 'waiting' && <Button variant="outline" className="mt-5" onClick={() => setStep('form')}>{done ? tx('Faire un autre don', 'Make another donation', 'Fazer outro donativo') : tx('Réessayer', 'Try again', 'Tentar de novo')}</Button>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label={tx('Opérateur', 'Operator', 'Operadora')} className="flex flex-wrap gap-2">
        {MOBILE_PROVIDERS.map((p) => (
          <button key={p.key} type="button" role="radio" aria-checked={provider === p.key} onClick={() => setProvider(p.key)}
            className={cn('rounded-full px-4 py-2 text-sm font-bold ring-offset-2 transition', p.className, provider === p.key ? 'ring-2 ring-night' : 'opacity-60 hover:opacity-100')}>{p.label}</button>
        ))}
      </div>
      <Field label={tx('Votre numéro Mobile Money', 'Your Mobile Money number', 'O seu número Mobile Money')} required hint={tx('Vous recevrez la demande de paiement sur ce téléphone.', 'You will receive the payment request on this phone.', 'Receberá o pedido de pagamento neste telefone.')}>
        {(p) => <Input {...p} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => onPhone(e.target.value)} placeholder="081 234 5678" />}
      </Field>
      <Field label={tx('Opération', 'Operation', 'Operação')}>
        {(p) => <Select {...p} value={operation} onChange={(e) => setOperation(e.target.value)}>{DONATION_OPERATIONS.map((o) => <option key={o.key} value={o.key}>{pick(o.label)}</option>)}</Select>}
      </Field>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field label={tx('Montant', 'Amount', 'Montante')} required>
          {(p) => <Input {...p} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="20" />}
        </Field>
        <Field label={tx('Devise', 'Currency', 'Moeda')}>
          {(p) => <Select {...p} value={currency} onChange={(e) => setCurrency(e.target.value as 'USD' | 'CDF')}><option value="USD">$ USD</option><option value="CDF">FC</option></Select>}
        </Field>
      </div>
      <Field label={tx('Votre nom (sur la liste)', 'Your name (on the list)', 'O seu nome (na lista)')} hint={tx('Laissez vide pour rester anonyme.', 'Leave empty to stay anonymous.', 'Deixe vazio para ficar anónimo.')}>
        {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
      </Field>
      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <Button variant="gold" className="w-full" onClick={submit} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}{tx('Recevoir la demande sur mon téléphone', 'Send the request to my phone', 'Receber o pedido no meu telefone')}
      </Button>
    </div>
  );
}
