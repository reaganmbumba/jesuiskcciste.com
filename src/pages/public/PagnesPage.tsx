import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, MessageCircle, Minus, Phone, Plus, ShoppingBag, Truck } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Button, buttonClass } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import {
  emailOrder, MAX_PER_MODEL, newReference, orderErrorText, orderMessage, orderQuantity, orderTotal, PAGNE_MODELS, PAGNE_PRICE,
  saveOrder, STOCK_PHOTOS, usd, validateOrder, whatsappOrderUrl, type OrderInput, type PagneModel,
} from '@/features/pagnes/pagnes';

type Errors = Partial<Record<keyof OrderInput, string>>;

/** Rubrique « Pagnes KCC » : vente par commande à 25 $ le pagne. */
export default function PagnesPage() {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { settings } = useSiteSettings();
  const { notify } = useToast();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [form, setForm] = useState({
    fullName: profile ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() : '',
    phone: '', email: profile?.email ?? '', city: '', country: 'RD Congo', address: '', delivery: 'livraison' as OrderInput['delivery'], note: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [zoom, setZoom] = useState<PagneModel | null>(null);
  const [done, setDone] = useState<{ reference: string; waUrl: string; total: number; quantity: number; received: boolean } | null>(null);

  const items = useMemo(
    () => PAGNE_MODELS.filter((m) => (qty[m.id] ?? 0) > 0).map((m) => ({ model: m.id, label: m.label, quantity: qty[m.id] })),
    [qty],
  );
  const quantity = orderQuantity(items);
  const total = orderTotal(items);

  const setModelQty = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(MAX_PER_MODEL, n)) }));
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const order: OrderInput = { ...form, items };
    const errs = validateOrder(order);
    setErrors(errs);
    if (Object.keys(errs).length) {
      notify(errs.items ?? tx('Vérifiez les champs signalés en rouge.', 'Check the fields marked in red.', 'Verifique os campos assinalados a vermelho.'), 'error');
      if (errs.items) document.getElementById('modeles')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setSending(true);
    const reference = newReference();
    const waUrl = whatsappOrderUrl(settings.contact.phone, orderMessage(reference, order));
    // La commande arrive par la base et par e-mail en même temps ; WhatsApp s'ouvre ensuite.
    // Si la base ou l'e-mail échouent, WhatsApp reste disponible : la commande n'est jamais perdue.
    const [saved, mailed] = await Promise.all([
      saveOrder(reference, order).catch((err) => { console.warn(orderErrorText(err)); return 'failed' as const; }),
      emailOrder(settings.contact.email, reference, order),
    ]);
    setSending(false);
    const received = saved === 'saved' || mailed;
    setDone({ reference, waUrl, total, quantity, received });
    setQty({});
    if (!received) notify(tx('Envoyez la commande sur WhatsApp pour la confirmer.', 'Send the order on WhatsApp to confirm it.', 'Envie a encomenda pelo WhatsApp para a confirmar.'), 'error');
    window.open(waUrl, '_blank', 'noopener');
  }

  return (
    <>
      <PageHeader eyebrow={tx('Boutique', 'Shop', 'Loja')} title={tx('Pagnes KCC', 'KCC wax fabrics', 'Panos KCC')}
        description={tx(
          `Commandez vos pagnes de l’Église Bon Nouveau Message : ${PAGNE_PRICE} $ le pagne. Remplissez le formulaire, nous vous rappelons pour le paiement et la livraison.`,
          `Order your Église Bon Nouveau Message fabrics: $${PAGNE_PRICE} per piece. Fill in the form and we will call you back about payment and delivery.`,
          `Encomende os seus panos da Igreja Bom Novo Mensagem: ${PAGNE_PRICE} $ cada. Preencha o formulário e ligamos-lhe para o pagamento e a entrega.`,
        )}
        image="/images/pagnes/stock-table.webp" />

      <section className="container-page py-12">
        <DemoInline>{tx('Démonstration : la commande n’est pas réellement envoyée.', 'Demo: the order is not really sent.', 'Demonstração: a encomenda não é realmente enviada.')}</DemoInline>

        {/* Comment ça marche */}
        <ol className="mb-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: ShoppingBag, t: tx('1. Choisissez', '1. Choose', '1. Escolha'), d: tx('Les modèles et le nombre de pagnes.', 'The designs and number of pieces.', 'Os modelos e a quantidade.') },
            { icon: MessageCircle, t: tx('2. Commandez', '2. Order', '2. Encomende'), d: tx('Vos coordonnées, puis « Commander » : la commande nous parvient aussitôt.', 'Your details, then “Order”: we receive it at once.', 'Os seus dados e depois «Encomendar»: recebemos de imediato.') },
            { icon: Phone, t: tx('3. On vous rappelle', '3. We call you', '3. Ligamos-lhe'), d: tx('Paiement (Mobile Money, espèces…) et livraison convenus ensemble.', 'Payment (mobile money, cash…) and delivery agreed together.', 'Pagamento e entrega combinados em conjunto.') },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex gap-3 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-night/5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-50 text-gold-700"><Icon className="h-5 w-5" aria-hidden /></span>
              <span><span className="block font-semibold text-night">{t}</span><span className="text-sm text-ink/65">{d}</span></span>
            </li>
          ))}
        </ol>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Modèles */}
          <div id="modeles">
            <h2 className="mb-1 font-display text-2xl font-semibold text-night">{tx('Les modèles', 'The designs', 'Os modelos')}</h2>
            <p className="mb-6 text-sm text-ink/65">{tx(`Chaque pagne : ${PAGNE_PRICE} $. Touchez une image pour l’agrandir.`, `Each piece: $${PAGNE_PRICE}. Tap an image to enlarge it.`, `Cada pano: ${PAGNE_PRICE} $. Toque numa imagem para ampliar.`)}</p>
            {errors.items && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errors.items}</p>}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {PAGNE_MODELS.map((m) => {
                const n = qty[m.id] ?? 0;
                return (
                  <article key={m.id} className={cn('flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 transition', n > 0 ? 'ring-2 ring-gold' : 'ring-night/5')}>
                    <button type="button" onClick={() => setZoom(m)} className="block aspect-square overflow-hidden bg-mist" aria-label={tx(`Agrandir : ${m.label}`, `Enlarge: ${m.label}`, `Ampliar: ${m.label}`)}>
                      <img src={m.image} alt={m.label} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                    </button>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex-1">
                        <h3 className="font-semibold leading-snug text-night">{m.label}</h3>
                        <p className="text-sm font-semibold text-gold-700">{PAGNE_PRICE} $</p>
                        {m.note && <p className="mt-1 text-xs text-ink/60">{m.note}</p>}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-full ring-1 ring-night/12">
                          <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-night hover:bg-night/5 disabled:opacity-40" onClick={() => setModelQty(m.id, n - 1)} disabled={n === 0} aria-label={tx('Retirer un pagne', 'Remove one', 'Retirar um')}><Minus className="h-4 w-4" /></button>
                          <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{n}</span>
                          <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-night hover:bg-night/5" onClick={() => setModelQty(m.id, n + 1)} aria-label={tx('Ajouter un pagne', 'Add one', 'Adicionar um')}><Plus className="h-4 w-4" /></button>
                        </div>
                        {n === 0 && <Button size="sm" variant="outline" onClick={() => setModelQty(m.id, 1)}>{tx('Choisir', 'Select', 'Escolher')}</Button>}
                        {n > 0 && <span className="text-sm font-semibold text-night">{usd(n * PAGNE_PRICE)}</span>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <h2 className="mb-4 mt-12 font-display text-xl font-semibold text-night">{tx('Nos pagnes en photo', 'Our fabrics in pictures', 'Os nossos panos em fotos')}</h2>
            <div className="grid grid-cols-3 gap-3">
              {STOCK_PHOTOS.map((p) => (
                <img key={p.src} src={p.src} alt={p.alt} loading="lazy" className="aspect-[3/4] w-full rounded-xl object-cover shadow-soft" />
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={submit} noValidate className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="commande-titre">
            <Card>
              <CardBody className="space-y-4">
                <h2 id="commande-titre" className="font-display text-2xl font-semibold text-night">{tx('Ma commande', 'My order', 'A minha encomenda')}</h2>

                <div className="rounded-2xl bg-mist p-4 text-sm">
                  {items.length ? (
                    <ul className="space-y-1">
                      {items.map((i) => (
                        <li key={i.model} className="flex justify-between gap-3"><span>{i.quantity} × {i.label}</span><span className="shrink-0 tabular-nums">{usd(i.quantity * PAGNE_PRICE)}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-ink/60">{tx('Aucun pagne choisi pour l’instant.', 'No fabric selected yet.', 'Nenhum pano escolhido ainda.')}</p>
                  )}
                  <div className="mt-3 flex justify-between border-t border-night/10 pt-3 text-base font-semibold text-night">
                    <span>{tx('Total', 'Total', 'Total')} ({quantity})</span><span className="tabular-nums">{usd(total)}</span>
                  </div>
                </div>

                <Field label={tx('Nom complet', 'Full name', 'Nome completo')} required error={errors.fullName}>
                  {(p) => <Input {...p} autoComplete="name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} maxLength={120} />}
                </Field>
                <Field label={tx('Téléphone (WhatsApp)', 'Phone (WhatsApp)', 'Telefone (WhatsApp)')} required error={errors.phone} hint={tx('Nous vous rappelons sur ce numéro.', 'We will call you on this number.', 'Ligamos-lhe para este número.')}>
                  {(p) => <Input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder="+243 8…" value={form.phone} onChange={(e) => set('phone', e.target.value)} maxLength={30} />}
                </Field>
                <Field label={tx('E-mail (facultatif)', 'Email (optional)', 'E-mail (opcional)')} error={errors.email}>
                  {(p) => <Input {...p} type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} maxLength={160} />}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={tx('Ville', 'City', 'Cidade')} required error={errors.city}>
                    {(p) => <Input {...p} autoComplete="address-level2" value={form.city} onChange={(e) => set('city', e.target.value)} maxLength={120} />}
                  </Field>
                  <Field label={tx('Pays', 'Country', 'País')} required error={errors.country}>
                    {(p) => <Input {...p} autoComplete="country-name" value={form.country} onChange={(e) => set('country', e.target.value)} maxLength={80} />}
                  </Field>
                </div>
                <Field label={tx('Réception', 'Delivery', 'Receção')}>
                  {(p) => (
                    <Select {...p} value={form.delivery} onChange={(e) => set('delivery', e.target.value as OrderInput['delivery'])}>
                      <option value="livraison">{tx('Livraison à mon adresse', 'Delivery to my address', 'Entrega na minha morada')}</option>
                      <option value="retrait">{tx('Je viens retirer', 'I will pick up', 'Vou levantar')}</option>
                    </Select>
                  )}
                </Field>
                {form.delivery === 'livraison' && (
                  <Field label={tx('Adresse ou quartier', 'Address or district', 'Morada ou bairro')} required error={errors.address}>
                    {(p) => <Input {...p} autoComplete="street-address" value={form.address} onChange={(e) => set('address', e.target.value)} maxLength={300} />}
                  </Field>
                )}
                <Field label={tx('Remarque', 'Note', 'Observação')} error={errors.note}>
                  {(p) => <Textarea {...p} className="min-h-[80px]" value={form.note} onChange={(e) => set('note', e.target.value)} maxLength={1000}
                    placeholder={tx('Ex. couleur, date souhaitée, autre modèle…', 'E.g. colour, preferred date, other design…', 'Ex.: cor, data desejada, outro modelo…')} />}
                </Field>

                <Button type="submit" variant="gold" size="lg" className="w-full" loading={sending} icon={<ShoppingBag className="h-5 w-5" aria-hidden />}>
                  {tx('Commander', 'Order', 'Encomendar')}{total ? ` — ${usd(total)}` : ''}
                </Button>
                <p className="flex items-start gap-2 text-xs text-ink/60">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {tx('Aucun paiement sur le site : nous vous contactons pour confirmer, payer et organiser la livraison.', 'No payment on the site: we will contact you to confirm, pay and arrange delivery.', 'Nenhum pagamento no site: contactamo-lo para confirmar, pagar e organizar a entrega.')}
                </p>
              </CardBody>
            </Card>
          </form>
        </div>
      </section>

      <Modal open={!!zoom} onClose={() => setZoom(null)} title={zoom?.label ?? ''}>
        {zoom && (
          <div className="space-y-4">
            <img src={zoom.image} alt={zoom.label} className="max-h-[70vh] w-full rounded-xl object-contain" />
            <Button variant="gold" className="w-full" onClick={() => { setModelQty(zoom.id, (qty[zoom.id] ?? 0) + 1); setZoom(null); }}>
              {tx(`Ajouter à ma commande — ${PAGNE_PRICE} $`, `Add to my order — $${PAGNE_PRICE}`, `Adicionar à encomenda — ${PAGNE_PRICE} $`)}
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={!!done} onClose={() => setDone(null)} title={tx('Commande envoyée', 'Order sent', 'Encomenda enviada')}>
        {done && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden />
            <p className="text-ink/80">
              {tx('Merci ! Votre commande', 'Thank you! Your order', 'Obrigado! A sua encomenda')} <strong className="text-night">{done.reference}</strong>{' '}
              ({done.quantity} {tx('pagne(s)', 'piece(s)', 'pano(s)')}, {usd(done.total)}) {done.received
                ? tx('nous est parvenue. Nous vous appelons très vite.', 'has reached us. We will call you very soon.', 'chegou até nós. Ligamos-lhe muito em breve.')
                : tx('est prête : appuyez sur le bouton vert pour nous l’envoyer sur WhatsApp.', 'is ready: press the green button to send it to us on WhatsApp.', 'está pronta: carregue no botão verde para no-la enviar pelo WhatsApp.')}
            </p>
            <a href={done.waUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('primary', 'lg', 'w-full bg-[#1FA855] hover:bg-[#178a45]')}>
              <MessageCircle className="h-5 w-5" aria-hidden /> {done.received ? tx('Envoyer aussi sur WhatsApp', 'Also send on WhatsApp', 'Enviar também pelo WhatsApp') : tx('Envoyer sur WhatsApp', 'Send on WhatsApp', 'Enviar pelo WhatsApp')}
            </a>
            <p className="flex items-center justify-center gap-2 text-sm text-ink/60">
              <Mail className="h-4 w-4" aria-hidden /> {settings.contact.email} · <Phone className="h-4 w-4" aria-hidden /> {settings.contact.phone}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
