import { useState } from 'react';
import { Copy, HandHeart, MessageCircle, Smartphone } from 'lucide-react';
import { Field, Input, Select } from '@/components/ui/Form';
import { MOBILE_PROVIDERS, type MobileProvider } from '@/features/music/shop';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { DONATION_ACCOUNTS, DONATION_OPERATIONS, ONLINE_DONATIONS_OPEN } from '@/content/solidarite';
import { OnlineDonate } from './OnlineDonate';

/** Message WhatsApp qui confirme un don envoyé par Mobile Money. */
export function donationMessage(d: { operation: string; provider: string; amount: string; currency: string; name: string; reference: string }) {
  return [
    'Bonjour JE SUIS KCCiste, je viens d’envoyer un don.',
    `Opération : ${d.operation}`,
    `Moyen : ${d.provider}`,
    `Montant : ${d.amount} ${d.currency}`,
    `Nom : ${d.name.trim() || 'Anonyme'}`,
    d.reference.trim() ? `Référence de la transaction : ${d.reference.trim()}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * Espace « Faire un don » : le donateur choisit son opérateur, voit le numéro où envoyer
 * l'argent, puis confirme son envoi sur WhatsApp. Aucun paiement ne passe par le site.
 */
export function SolidarityDonate({ online = ONLINE_DONATIONS_OPEN }: { online?: boolean }) {
  const { pick, tx } = useI18n();
  const { settings } = useSiteSettings();
  const whatsapp = settings.contact.phone.replace(/\D/g, '');
  const providers = MOBILE_PROVIDERS.filter((p) => DONATION_ACCOUNTS.some((a) => a.provider === p.key));
  const [provider, setProvider] = useState<MobileProvider | null>(providers[0]?.key ?? null);
  const [operation, setOperation] = useState<string>(DONATION_OPERATIONS[0].key);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'online' | 'manual'>(online ? 'online' : 'manual');

  const accounts = DONATION_ACCOUNTS.filter((a) => a.provider === provider);
  const providerLabel = MOBILE_PROVIDERS.find((p) => p.key === provider)?.label ?? '';
  const opLabel = pick(DONATION_OPERATIONS.find((o) => o.key === operation)!.label);

  const copy = (n: string) => {
    void navigator.clipboard?.writeText(n.replace(/\s/g, '')).then(() => { setCopied(n); window.setTimeout(() => setCopied(''), 2000); }, () => {});
  };
  const confirm = () => {
    if (!(Number(amount.replace(',', '.')) > 0)) return setError(tx('Indiquez le montant envoyé.', 'Enter the amount sent.', 'Indique o montante enviado.'));
    setError('');
    const text = donationMessage({ operation: opLabel, provider: providerLabel, amount, currency, name, reference });
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="don" className="scroll-mt-24 overflow-hidden rounded-3xl bg-night text-white shadow-lift">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="p-6 sm:p-8">
          <HandHeart className="h-8 w-8 text-gold" />
          <h2 className="mt-3 font-display text-2xl font-medium sm:text-3xl">{tx('Faire un don', 'Make a donation', 'Fazer um donativo')}</h2>
          {mode === 'online' ? (
            <>
              <p className="mt-2 text-sm text-white/70">{tx(
                'Payez directement depuis votre téléphone : la demande arrive sur votre numéro, vous confirmez avec votre code PIN.',
                'Pay straight from your phone: the request arrives on your number and you confirm with your PIN.',
                'Pague diretamente pelo seu telefone: o pedido chega ao seu número e confirma com o seu PIN.',
              )}</p>
              <Steps steps={[
                tx('Saisissez votre numéro et le montant.', 'Enter your number and the amount.', 'Introduza o seu número e o montante.'),
                tx('Une demande de paiement arrive sur votre téléphone.', 'A payment request arrives on your phone.', 'Um pedido de pagamento chega ao seu telefone.'),
                tx('Tapez votre code PIN : c’est fait.', 'Enter your PIN: done.', 'Introduza o seu PIN: está feito.'),
              ]} />
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-white/70">{tx(
                'Envoyez votre contribution par Mobile Money, puis confirmez-la sur WhatsApp : elle sera ajoutée à la liste publique de l’opération.',
                'Send your contribution by Mobile Money, then confirm it on WhatsApp: it will be added to the operation’s public list.',
                'Envie a sua contribuição por Mobile Money e confirme-a no WhatsApp: será adicionada à lista pública da operação.',
              )}</p>
              <Steps steps={[
                tx('Choisissez l’opérateur et l’opération.', 'Choose the operator and the operation.', 'Escolha a operadora e a operação.'),
                tx('Envoyez l’argent au numéro affiché.', 'Send the money to the number shown.', 'Envie o dinheiro para o número indicado.'),
                tx('Confirmez votre don sur WhatsApp.', 'Confirm your donation on WhatsApp.', 'Confirme o seu donativo no WhatsApp.'),
              ]} />
            </>
          )}
        </div>
        <div className="bg-white p-6 text-ink sm:p-8">
          {online && (
            <div role="tablist" className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-mist p-1 text-xs font-semibold sm:text-sm">
              {([['online', tx('Payer depuis mon téléphone', 'Pay from my phone', 'Pagar pelo meu telefone')], ['manual', tx('Envoyer moi-même', 'Send it myself', 'Enviar eu mesmo')]] as const).map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cn('rounded-full px-3 py-2 transition', mode === k ? 'bg-night text-white' : 'text-ink/70')}>{l}</button>
              ))}
            </div>
          )}
          {online && mode === 'online' ? <OnlineDonate /> : providers.length ? (
            <div className="space-y-4">
              <div role="radiogroup" aria-label={tx('Opérateur', 'Operator', 'Operadora')} className="flex flex-wrap gap-2">
                {providers.map((p) => (
                  <button key={p.key} type="button" role="radio" aria-checked={provider === p.key} onClick={() => setProvider(p.key)}
                    className={cn('rounded-full px-4 py-2 text-sm font-bold ring-offset-2 transition', p.className, provider === p.key ? 'ring-2 ring-night' : 'opacity-60 hover:opacity-100')}>{p.label}</button>
                ))}
              </div>
              {accounts.map((a) => (
                <div key={a.number} className="flex items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 whitespace-nowrap text-base font-semibold text-night sm:text-lg sm:tracking-wide"><Smartphone className="h-4 w-4 text-gold" />{a.number}</p>
                    <p className="text-xs text-ink/60">{tx('Au nom de', 'Account name', 'Em nome de')} {a.holder}</p>
                  </div>
                  <button type="button" onClick={() => copy(a.number)} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-night ring-1 ring-night/10">
                    <Copy className="h-3.5 w-3.5" />{copied === a.number ? tx('Copié', 'Copied', 'Copiado') : tx('Copier', 'Copy', 'Copiar')}
                  </button>
                </div>
              ))}
              <Field label={tx('Opération', 'Operation', 'Operação')}>
                {(p) => <Select {...p} value={operation} onChange={(e) => setOperation(e.target.value)}>{DONATION_OPERATIONS.map((o) => <option key={o.key} value={o.key}>{pick(o.label)}</option>)}</Select>}
              </Field>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <Field label={tx('Montant envoyé', 'Amount sent', 'Montante enviado')} required error={error}>
                  {(p) => <Input {...p} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="20" />}
                </Field>
                <Field label={tx('Devise', 'Currency', 'Moeda')}>
                  {(p) => <Select {...p} value={currency} onChange={(e) => setCurrency(e.target.value)}><option value="USD">$ USD</option><option value="FC">FC</option></Select>}
                </Field>
              </div>
              <Field label={tx('Votre nom (sur la liste)', 'Your name (on the list)', 'O seu nome (na lista)')} hint={tx('Laissez vide pour rester anonyme.', 'Leave empty to stay anonymous.', 'Deixe vazio para ficar anónimo.')}>
                {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
              </Field>
              <Field label={tx('Référence de la transaction', 'Transaction reference', 'Referência da transação')} hint={tx('Facultatif : le code reçu par SMS.', 'Optional: the code received by SMS.', 'Opcional: o código recebido por SMS.')}>
                {(p) => <Input {...p} value={reference} onChange={(e) => setReference(e.target.value)} />}
              </Field>
              <button type="button" onClick={confirm} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-night transition hover:brightness-95">
                <MessageCircle className="h-4 w-4" />{tx('Confirmer mon don sur WhatsApp', 'Confirm my donation on WhatsApp', 'Confirmar o meu donativo no WhatsApp')}
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center">
              <p className="text-sm text-ink/70">{tx(
                'Les numéros Mobile Money pour les dons seront affichés ici très bientôt. En attendant, écrivez-nous sur WhatsApp pour savoir comment contribuer.',
                'The Mobile Money numbers for donations will be shown here very soon. In the meantime, message us on WhatsApp to find out how to contribute.',
                'Os números Mobile Money para donativos serão indicados aqui muito em breve. Entretanto, escreva-nos no WhatsApp para saber como contribuir.',
              )}</p>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-night"><MessageCircle className="h-4 w-4" />{tx('Écrire sur WhatsApp', 'Message us on WhatsApp', 'Escrever no WhatsApp')}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-5 space-y-2 text-sm text-white/80">
      {steps.map((s, i) => <li key={s} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-night">{i + 1}</span>{s}</li>)}
    </ol>
  );
}
