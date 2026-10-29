import { useState, type FormEvent } from 'react';
import { MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

/** Numéro WhatsApp qui reçoit les commandes de pagne. */
export const PAGNE_WHATSAPP = '243840238592';
export const PAGNE_PRICE_USD = 25;

export interface PagneModel { key: string; name: string; image: string }

/** Modèles proposés (chaque pagne : 25 $). */
export const PAGNE_MODELS: PagneModel[] = [
  { key: 'hommage', name: 'Hommage au Prophète — Mission accomplie (92 ans)', image: '/images/pagne/hommage-mission-accomplie.jpg' },
  { key: 'bo-nsomi', name: 'Bo Nsomi — 30 avril 1980', image: '/images/pagne/bo-nsomi.jpg' },
  { key: 'oracle', name: 'Oracle — 15 avril 2003', image: '/images/pagne/oracle.jpg' },
  { key: 'apparition', name: 'Apparition de KCC — 12 avril 1958', image: '/images/pagne/apparition-kcc.jpg' },
  { key: 'convocation', name: 'La Sainte Convocation', image: '/images/pagne/sainte-convocation.jpg' },
  { key: 'monekene', name: 'KCC Monekene — 8 mars 1955', image: '/images/pagne/kcc-monekene.jpg' },
];

const STOCK = [
  { src: '/images/pagne/stock-table.jpg', w: 1080, h: 809 },
  { src: '/images/pagne/stock-table-2.jpg', w: 768, h: 1024 },
  { src: '/images/pagne/stock-pile.jpg', w: 768, h: 1024 },
];

export interface PagneOrder { name: string; phone: string; city: string; message: string; quantities: Record<string, number> }

export function orderLines(quantities: Record<string, number>) {
  return PAGNE_MODELS.map((m) => ({ model: m, qty: Math.max(0, Math.floor(quantities[m.key] ?? 0)) })).filter((l) => l.qty > 0);
}

/** Message WhatsApp envoyé au vendeur pour une commande de pagnes. */
export function pagneMessage(o: PagneOrder) {
  const lines = orderLines(o.quantities);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return [
    'Bonjour JE SUIS KCCiste, je souhaite commander des pagnes KCC.',
    ...lines.map((l) => `- ${l.model.name} : ${l.qty}`),
    `Total : ${count} pagne${count > 1 ? 's' : ''}, ${count * PAGNE_PRICE_USD} $`,
    `Nom : ${o.name.trim()}`,
    `Téléphone : ${o.phone.trim()}`,
    o.city.trim() ? `Ville ou paroisse : ${o.city.trim()}` : '',
    o.message.trim() ? `Message : ${o.message.trim()}` : '',
  ].filter(Boolean).join('\n');
}

export default function PagnePage() {
  const { tx } = useI18n();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const lines = orderLines(quantities);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const change = (key: string, delta: number) => setQuantities((q) => ({ ...q, [key]: Math.max(0, (q[key] ?? 0) + delta) }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (count === 0) return setError(tx('Choisissez au moins un modèle avec le bouton +.', 'Choose at least one design with the + button.', 'Escolha pelo menos um modelo com o botão +.'));
    if (!name.trim() || phone.replace(/\D/g, '').length < 8) {
      return setError(tx('Indiquez votre nom et un numéro de téléphone valide.', 'Enter your name and a valid phone number.', 'Indique o seu nome e um número de telefone válido.'));
    }
    setError('');
    const text = pagneMessage({ name, phone, city, message, quantities });
    window.open(`https://wa.me/${PAGNE_WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <PageHeader
        eyebrow={tx('Boutique', 'Shop', 'Loja')}
        title={tx('Pagnes KCC', 'KCC cloths', 'Panos KCC')}
        description={tx(
          `Choisissez vos modèles et le nombre de pagnes : ${PAGNE_PRICE_USD} dollars le pagne. Votre commande nous arrive sur WhatsApp.`,
          `Choose your designs and how many cloths you want: ${PAGNE_PRICE_USD} dollars each. Your order reaches us on WhatsApp.`,
          `Escolha os seus modelos e o número de panos: ${PAGNE_PRICE_USD} dólares cada. A sua encomenda chega-nos pelo WhatsApp.`,
        )}
        image={STOCK[0].src}
      />
      <section className="container-page py-10 lg:py-14">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {STOCK.map((p) => (
            <img key={p.src} src={p.src} width={p.w} height={p.h} loading="lazy" alt={tx('Pagnes KCC disponibles', 'KCC cloths available', 'Panos KCC disponíveis')} className="h-36 w-full rounded-2xl object-cover sm:h-72" />
          ))}
        </div>

        <h2 className="mt-10 font-display text-2xl font-medium text-night sm:text-3xl">{tx('1. Choisissez vos modèles', '1. Choose your designs', '1. Escolha os seus modelos')}</h2>
        <p className="mt-1 text-sm text-ink/60">{tx(`${PAGNE_PRICE_USD} $ le pagne. Touchez + pour ajouter.`, `$${PAGNE_PRICE_USD} per cloth. Tap + to add.`, `${PAGNE_PRICE_USD} $ cada pano. Toque em + para adicionar.`)}</p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {PAGNE_MODELS.map((m) => {
            const q = quantities[m.key] ?? 0;
            return (
              <li key={m.key} className={cn('overflow-hidden rounded-3xl border bg-white transition', q > 0 ? 'border-gold shadow-lift' : 'border-night/[0.06]')}>
                <img src={m.image} width={1024} height={1024} loading="lazy" alt={m.name} className="aspect-square w-full object-cover" />
                <div className="space-y-3 p-3 sm:p-4">
                  <p className="min-h-[2.5rem] text-sm font-semibold leading-snug text-night">{m.name}</p>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => change(m.key, -1)} disabled={q === 0} className="grid h-10 w-10 place-items-center rounded-full bg-mist text-night disabled:opacity-40" aria-label={tx(`Retirer un pagne ${m.name}`, `Remove one ${m.name}`, `Retirar um ${m.name}`)}><Minus className="h-4 w-4" /></button>
                    <span className="font-display text-xl text-night" aria-live="polite">{q}</span>
                    <button type="button" onClick={() => change(m.key, 1)} className="grid h-10 w-10 place-items-center rounded-full bg-gold text-night" aria-label={tx(`Ajouter un pagne ${m.name}`, `Add one ${m.name}`, `Adicionar um ${m.name}`)}><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <form onSubmit={submit} className="mx-auto mt-10 max-w-2xl space-y-4 rounded-3xl border border-night/[0.06] bg-white p-6 shadow-lift sm:p-8" noValidate>
          <h2 className="font-display text-2xl font-medium text-night">{tx('2. Vos coordonnées', '2. Your details', '2. Os seus dados')}</h2>
          <div className="rounded-2xl bg-night px-4 py-3 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold"><ShoppingBag className="h-4 w-4 text-gold" aria-hidden /> {tx('Votre commande', 'Your order', 'A sua encomenda')}</p>
            {lines.length === 0
              ? <p className="mt-1 text-sm text-white/60">{tx('Aucun modèle choisi pour l’instant.', 'No design chosen yet.', 'Nenhum modelo escolhido por agora.')}</p>
              : <ul className="mt-2 space-y-1 text-sm text-white/80">{lines.map((l) => <li key={l.model.key} className="flex justify-between gap-3"><span>{l.model.name}</span><span>× {l.qty}</span></li>)}</ul>}
            <p className="mt-2 border-t border-white/10 pt-2 text-right font-semibold text-gold">{count} × {PAGNE_PRICE_USD} $ = {count * PAGNE_PRICE_USD} $</p>
          </div>
          <Field label={tx('Nom complet', 'Full name', 'Nome completo')} required>
            {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />}
          </Field>
          <Field label={tx('Téléphone ou WhatsApp', 'Phone or WhatsApp', 'Telefone ou WhatsApp')} required>
            {(p) => <Input {...p} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+243 …" required />}
          </Field>
          <Field label={tx('Ville ou paroisse', 'City or parish', 'Cidade ou paróquia')}>
            {(p) => <Input {...p} value={city} onChange={(e) => setCity(e.target.value)} />}
          </Field>
          <Field label={tx('Message (un autre modèle vu sur les photos, livraison…)', 'Message (another design from the photos, delivery…)', 'Mensagem (outro modelo das fotos, entrega…)')}>
            {(p) => <Textarea {...p} value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />}
          </Field>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-night">
            <MessageCircle className="h-5 w-5" aria-hidden /> {tx('Envoyer ma commande sur WhatsApp', 'Send my order on WhatsApp', 'Enviar a minha encomenda pelo WhatsApp')}
          </button>
          <p className="text-xs text-ink/55">{tx(
            'WhatsApp s’ouvre avec votre commande déjà écrite : touchez « Envoyer » pour nous la faire parvenir.',
            'WhatsApp opens with your order already written: tap “Send” to deliver it to us.',
            'O WhatsApp abre com a sua encomenda já escrita: toque em «Enviar» para no-la fazer chegar.',
          )}</p>
        </form>
      </section>
    </>
  );
}
