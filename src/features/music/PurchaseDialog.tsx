import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, Download, Lock, ShoppingBag, Smartphone, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/AuthContext';
import { isDemoMode } from '@/config/env';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import {
  MOBILE_PROVIDERS, detectProvider, getDownloads, getOrderStatus, normalizePhone, priceLabel, startCheckout,
  type DownloadFile, type MobileProvider,
} from './shop';

export interface SaleItem { type: 'track' | 'album'; id: string; title: string; subtitle?: string; amount: number; currency: string }

type Step = 'form' | 'waiting' | 'paid' | 'failed' | 'timeout';
const POLL_MS = 4000;
const POLL_MAX_MS = 3 * 60 * 1000;

/** Logos texte des opérateurs, aux couleurs de chaque marque. */
export function ProviderBadges({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {MOBILE_PROVIDERS.map((p) => <span key={p.key} className={cn('rounded-md px-2 py-0.5 text-[11px] font-bold tracking-tight', p.className)}>{p.label}</span>)}
    </div>
  );
}

/** Bouton « Acheter » affiché à côté d'un titre ou d'un album en vente. */
export function BuyButton({ item, onBuy, compact }: { item: SaleItem; onBuy: (i: SaleItem) => void; compact?: boolean }) {
  const { locale, tx } = useI18n();
  return (
    <button onClick={() => onBuy(item)} className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 font-semibold text-night ring-1 ring-inset ring-white/30 hover:from-gold-200 hover:to-gold-400', compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm')} aria-label={`${tx('Acheter', 'Buy', 'Comprar')} ${item.title} (${priceLabel(item.amount, item.currency, locale)})`}>
      <ShoppingBag className="h-3.5 w-3.5" />{compact ? priceLabel(item.amount, item.currency, locale) : `${tx('Acheter', 'Buy', 'Comprar')} · ${priceLabel(item.amount, item.currency, locale)}`}
    </button>
  );
}

export function PurchaseDialog({ item, onClose }: { item: SaleItem | null; onClose: () => void }) {
  const { profile } = useAuth();
  const { locale, tx } = useI18n();
  const location = useLocation();
  const [provider, setProvider] = useState<MobileProvider | null>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const timer = useRef<number>();

  useEffect(() => {
    setStep('form'); setError(''); setOrderId(null); setFiles([]); setBusy(false);
    setPhone((p) => p || profile?.phone || '');
    return () => window.clearTimeout(timer.current);
  }, [item?.id, profile?.phone]);

  // L'opérateur se déduit du numéro saisi (081 → M-Pesa, 084 → Orange, 097 → Airtel).
  useEffect(() => { const d = detectProvider(phone); if (d) setProvider(d); }, [phone]);

  const finish = async (id: string) => {
    setStep('paid');
    try { setFiles(await getDownloads(id)); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };

  const poll = (id: string, startedAt: number) => {
    timer.current = window.setTimeout(async () => {
      try {
        const s = await getOrderStatus(id);
        if (s === 'paid') return finish(id);
        if (s === 'failed' || s === 'cancelled') return setStep('failed');
      } catch { /* on réessaie */ }
      if (Date.now() - startedAt > POLL_MAX_MS) setStep('timeout');
      else poll(id, startedAt);
    }, POLL_MS);
  };

  const pay = async () => {
    if (!item) return;
    setError('');
    const normalized = normalizePhone(phone);
    if (!provider) return setError(tx('Choisissez votre opérateur.', 'Choose your operator.', 'Escolha a sua operadora.'));
    if (!normalized) return setError(tx('Numéro invalide. Exemple : 081 234 5678.', 'Invalid number. Example: 081 234 5678.', 'Número inválido. Exemplo: 081 234 5678.'));
    const expected = detectProvider(phone);
    if (expected !== provider) return setError(tx(`Ce numéro n’est pas un numéro ${MOBILE_PROVIDERS.find((p) => p.key === provider)!.label}.`, `This is not a ${MOBILE_PROVIDERS.find((p) => p.key === provider)!.label} number.`, `Este número não é ${MOBILE_PROVIDERS.find((p) => p.key === provider)!.label}.`));
    setBusy(true);
    try {
      const r = await startCheckout({ itemType: item.type, itemId: item.id, provider, phone: normalized });
      setOrderId(r.orderId);
      if (r.status === 'paid') await finish(r.orderId);
      else { setStep('waiting'); poll(r.orderId, Date.now()); }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  };

  if (!item) return null;
  const price = priceLabel(item.amount, item.currency, locale);
  const providerLabel = MOBILE_PROVIDERS.find((p) => p.key === provider)?.label ?? 'Mobile Money';

  return (
    <Modal open={!!item} onClose={onClose} title={tx('Acheter', 'Buy', 'Comprar')}>
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gold-50 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-night text-gold"><ShoppingBag className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-night">{item.title}</p>
          <p className="truncate text-xs text-ink/60">{item.type === 'album' ? tx('Album complet', 'Full album', 'Álbum completo') : tx('Titre', 'Track', 'Faixa')}{item.subtitle ? ` · ${item.subtitle}` : ''}</p>
        </div>
        <span className="text-lg font-bold tabular-nums text-night">{price}</span>
      </div>

      {!profile ? (
        <div className="space-y-4 text-center">
          <Lock className="mx-auto h-8 w-8 text-gold-600" />
          <p className="text-sm text-ink/70">{tx('Connectez-vous pour acheter : vos achats restent disponibles dans votre espace, sur tous vos appareils.', 'Log in to buy: your purchases stay available in your account, on all your devices.', 'Inicie sessão para comprar: as suas compras ficam disponíveis na sua conta, em todos os seus dispositivos.')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink to="/connexion" state={{ from: location.pathname }}>{tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>
            <ButtonLink to="/inscription" variant="outline">{tx('Créer un compte', 'Create an account', 'Criar uma conta')}</ButtonLink>
          </div>
        </div>
      ) : step === 'form' ? (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-ink">{tx('Payer avec', 'Pay with', 'Pagar com')}</p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={tx('Opérateur', 'Operator', 'Operadora')}>
              {MOBILE_PROVIDERS.map((p) => (
                <button key={p.key} role="radio" aria-checked={provider === p.key} onClick={() => setProvider(p.key)} className={cn('rounded-xl px-2 py-3 text-center text-sm font-bold transition', provider === p.key ? cn(p.className, 'ring-4 ring-gold/40') : 'bg-mist text-ink/70 hover:bg-night/5')}>{p.label}</button>
              ))}
            </div>
          </div>
          <Field label={tx('Numéro de téléphone Mobile Money', 'Mobile Money phone number', 'Número de telefone Mobile Money')} hint={tx('Numéro de la RD Congo, par exemple 081 234 5678.', 'DR Congo number, for example 081 234 5678.', 'Número da RD Congo, por exemplo 081 234 5678.')}>
            {(a) => <Input {...a} type="tel" inputMode="tel" autoComplete="tel" placeholder="081 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />}
          </Field>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button variant="gold" className="w-full" loading={busy} onClick={pay} icon={<Smartphone className="h-4 w-4" />}>{tx(`Payer ${price}`, `Pay ${price}`, `Pagar ${price}`)}</Button>
          <p className="text-center text-xs text-ink/55">{tx('Vous recevrez une demande sur votre téléphone : confirmez avec votre code PIN. Nous ne voyons jamais votre code.', 'You will get a request on your phone: confirm with your PIN. We never see your PIN.', 'Receberá um pedido no seu telefone: confirme com o seu PIN. Nunca vemos o seu PIN.')}{isDemoMode ? tx(' (Démonstration : aucun débit.)', ' (Demo: nothing is charged.)', ' (Demonstração: nada é cobrado.)') : ''}</p>
        </div>
      ) : step === 'waiting' ? (
        <div className="space-y-4 py-2 text-center">
          <Spinner label={tx('En attente de votre confirmation…', 'Waiting for your confirmation…', 'A aguardar a sua confirmação…')} />
          <p className="text-sm text-ink/70">{tx(`Une demande ${providerLabel} de ${price} a été envoyée sur votre téléphone. Saisissez votre code PIN pour confirmer.`, `A ${providerLabel} request for ${price} was sent to your phone. Enter your PIN to confirm.`, `Foi enviado para o seu telefone um pedido ${providerLabel} de ${price}. Introduza o seu PIN para confirmar.`)}</p>
        </div>
      ) : step === 'paid' ? (
        <div className="space-y-4">
          <p className="flex items-center gap-2 font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" />{tx('Paiement confirmé. Merci pour votre soutien !', 'Payment confirmed. Thank you for your support!', 'Pagamento confirmado. Obrigado pelo seu apoio!')}</p>
          {files.length ? (
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.url}><a href={f.url} download className="flex items-center gap-3 rounded-xl border border-night/10 px-4 py-3 text-sm font-medium text-night hover:bg-gold-50"><Download className="h-4 w-4 text-gold-600" /><span className="truncate">{f.title}</span></a></li>
              ))}
            </ul>
          ) : !error && <Spinner />}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <p className="text-xs text-ink/55">{tx('Vous retrouverez ce téléchargement à tout moment dans votre espace, rubrique « Mes achats ».', 'You can download it again at any time from your account, under “My purchases”.', 'Pode voltar a descarregar a qualquer momento na sua conta, em “As minhas compras”.')}</p>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-600" />
          <p className="text-sm text-ink/70">{step === 'failed'
            ? tx('Le paiement n’a pas abouti (annulé, solde insuffisant ou délai dépassé). Aucun montant n’a été débité.', 'The payment did not go through (cancelled, insufficient balance or timed out). Nothing was charged.', 'O pagamento não foi concluído (cancelado, saldo insuficiente ou tempo esgotado). Nada foi cobrado.')
            : tx('Nous n’avons pas encore reçu la confirmation de l’opérateur. Si vous avez validé, l’achat apparaîtra dans « Mes achats » dès sa confirmation.', 'We have not yet received the operator’s confirmation. If you approved it, the purchase will appear in “My purchases” once confirmed.', 'Ainda não recebemos a confirmação da operadora. Se aprovou, a compra aparecerá em “As minhas compras” assim que for confirmada.')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => { setStep('form'); setError(''); }}>{tx('Réessayer', 'Try again', 'Tentar novamente')}</Button>
            {orderId && step === 'timeout' && <ButtonLink to="/espace/achats" variant="outline">{tx('Mes achats', 'My purchases', 'As minhas compras')}</ButtonLink>}
          </div>
        </div>
      )}
    </Modal>
  );
}
