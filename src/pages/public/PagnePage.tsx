import { useState, type FormEvent } from 'react';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { useI18n } from '@/i18n';

/** Numéro WhatsApp qui reçoit les commandes de pagne. */
export const PAGNE_WHATSAPP = '243840238592';
export const PAGNE_PRICE_USD = 25;

const PHOTOS = [
  { src: '/images/galerie/mamans-pagne-kcc.jpg', w: 1400, h: 944 },
  { src: '/images/galerie/maman-pagne-kcc.jpg', w: 948, h: 1400 },
];

export interface PagneOrder { name: string; phone: string; quantity: number; city: string; message: string }

/** Message WhatsApp envoyé au vendeur pour une commande de pagne. */
export function pagneMessage(o: PagneOrder) {
  const qty = Math.max(1, Math.floor(o.quantity) || 1);
  return [
    'Bonjour JE SUIS KCCiste, je souhaite commander le pagne KCC.',
    `Nom : ${o.name.trim()}`,
    `Téléphone : ${o.phone.trim()}`,
    `Quantité : ${qty} (total ${qty * PAGNE_PRICE_USD} $)`,
    o.city.trim() ? `Ville ou paroisse : ${o.city.trim()}` : '',
    o.message.trim() ? `Message : ${o.message.trim()}` : '',
  ].filter(Boolean).join('\n');
}

export default function PagnePage() {
  const { tx } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const qty = Math.max(1, Math.floor(Number(quantity)) || 1);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, '').length < 8) {
      return setError(tx('Indiquez votre nom et un numéro de téléphone valide.', 'Enter your name and a valid phone number.', 'Indique o seu nome e um número de telefone válido.'));
    }
    setError('');
    const text = pagneMessage({ name, phone, quantity: qty, city, message });
    window.open(`https://wa.me/${PAGNE_WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <PageHeader
        eyebrow={tx('Boutique', 'Shop', 'Loja')}
        title={tx('Pagne KCC', 'KCC cloth', 'Pano KCC')}
        description={tx(
          `Le pagne officiel aux couleurs du KCC est disponible à ${PAGNE_PRICE_USD} dollars. Remplissez le formulaire : votre commande nous arrive sur WhatsApp.`,
          `The official cloth in KCC colours is available for ${PAGNE_PRICE_USD} dollars. Fill in the form: your order reaches us on WhatsApp.`,
          `O pano oficial nas cores do KCC está disponível por ${PAGNE_PRICE_USD} dólares. Preencha o formulário: a sua encomenda chega-nos pelo WhatsApp.`,
        )}
        image={PHOTOS[0].src}
      />
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-14">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {PHOTOS.map((p) => (
              <img key={p.src} src={p.src} width={p.w} height={p.h} loading="lazy" alt={tx('Mamans en pagne KCC', 'Mothers wearing KCC cloth', 'Mamãs com pano KCC')} className="h-64 w-full rounded-3xl object-cover sm:h-80" />
            ))}
          </div>
          <div className="flex items-center justify-between rounded-3xl bg-night px-5 py-4 text-white">
            <span className="flex items-center gap-2 font-semibold"><ShoppingBag className="h-5 w-5 text-gold" aria-hidden /> {tx('Prix du pagne', 'Price of the cloth', 'Preço do pano')}</span>
            <span className="font-display text-2xl text-gold">{PAGNE_PRICE_USD} $</span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-night/[0.06] bg-white p-6 shadow-lift sm:p-8" noValidate>
          <h2 className="font-display text-2xl font-medium text-night">{tx('Commander ou me contacter', 'Order or contact me', 'Encomendar ou contactar-me')}</h2>
          <Field label={tx('Nom complet', 'Full name', 'Nome completo')} required>
            {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />}
          </Field>
          <Field label={tx('Téléphone ou WhatsApp', 'Phone or WhatsApp', 'Telefone ou WhatsApp')} required>
            {(p) => <Input {...p} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+243 …" required />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tx('Quantité', 'Quantity', 'Quantidade')}>
              {(p) => <Input {...p} value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min={1} inputMode="numeric" />}
            </Field>
            <Field label={tx('Ville ou paroisse', 'City or parish', 'Cidade ou paróquia')}>
              {(p) => <Input {...p} value={city} onChange={(e) => setCity(e.target.value)} />}
            </Field>
          </div>
          <Field label={tx('Message', 'Message', 'Mensagem')}>
            {(p) => <Textarea {...p} value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />}
          </Field>
          <p className="text-sm text-ink/70">{tx('Total', 'Total', 'Total')} : <strong className="text-night">{qty * PAGNE_PRICE_USD} $</strong></p>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-night">
            <MessageCircle className="h-5 w-5" aria-hidden /> {tx('Envoyer sur WhatsApp', 'Send on WhatsApp', 'Enviar pelo WhatsApp')}
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
