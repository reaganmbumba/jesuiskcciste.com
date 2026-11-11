import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Copy, Heart, MessageCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Form';
import { MOBILE_PROVIDERS, type MobileProvider } from '@/features/music/shop';
import { toDonationAccount, useSiteContent } from '@/features/content/siteContent';
import { DONATION_ACCOUNTS } from '@/content/solidarite';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useI18n, type Tri } from '@/i18n';
import { cn } from '@/utils/format';

type Frequency = 'once' | 'monthly';
type Currency = 'CDF' | 'USD';

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

/** Montants proposés, comme sur les grands formulaires de dons. */
const PRESETS: Record<Currency, number[]> = {
  CDF: [5000, 10000, 20000, 50000, 100000, 200000],
  USD: [5, 10, 20, 50, 100, 200],
};
const DEFAULT_AMOUNT: Record<Currency, number> = { CDF: 20000, USD: 10 };

/** À quoi le don est destiné (« Désignation »). */
export const DONATION_DESIGNATIONS: { key: string; label: Tri }[] = [
  { key: 'eglise', label: T('Œuvre de l’Église (besoin le plus urgent)', 'The Church’s work (most urgent need)', 'Obra da Igreja (necessidade mais urgente)') },
  { key: 'ngidinga', label: T('Opération 100 chaises — Ngidinga', 'Operation 100 Chairs — Ngidinga', 'Operação 100 cadeiras — Ngidinga') },
  { key: 'caisse', label: T('Caisse d’assistance sociale (deuil et maladie)', 'Social assistance fund (bereavement and illness)', 'Caixa de assistência social (luto e doença)') },
  { key: 'medias', label: T('Site, radio et cultes en direct', 'Website, radio and live services', 'Site, rádio e cultos em direto') },
];

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ');
const short = (n: number, c: Currency) => (c === 'CDF' ? (n >= 1000 ? `${n / 1000} k` : String(n)) : `${n} $`);
const money = (n: number, c: Currency) => (c === 'CDF' ? `${fmt(n)} FC` : `${fmt(n)} $`);
const parse = (s: string) => Number(s.replace(/[\s  ]/g, '').replace(',', '.'));

/**
 * Page « Faire un don » : don ponctuel ou mensuel, montants proposés en francs congolais
 * (ou en dollars), désignation, dédicace et commentaire. L'argent est envoyé par Mobile Money
 * aux numéros gérés dans l'administration, puis le don est confirmé sur WhatsApp.
 * Aucun paiement ne passe par le site.
 */
export default function DonatePage() {
  const { pick, tx } = useI18n();
  usePageMeta({ title: tx('Faire un don', 'Make a donation', 'Fazer um donativo') });
  const { settings } = useSiteSettings();
  const whatsapp = settings.contact.phone.replace(/\D/g, '');
  const donationAccounts = useSiteContent('donation_accounts', toDonationAccount, DONATION_ACCOUNTS) ?? [];
  const providers = MOBILE_PROVIDERS.filter((p) => donationAccounts.some((a) => a.provider === p.key));

  const [frequency, setFrequency] = useState<Frequency>('once');
  const [currency, setCurrency] = useState<Currency>('CDF');
  const [amountText, setAmountText] = useState(fmt(DEFAULT_AMOUNT.CDF));
  const [designation, setDesignation] = useState(DONATION_DESIGNATIONS[0].key);
  const [dedicate, setDedicate] = useState(false);
  const [dedicationKind, setDedicationKind] = useState<'honneur' | 'memoire'>('honneur');
  const [dedicationName, setDedicationName] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'form' | 'pay'>('form');
  const [provider, setProvider] = useState<MobileProvider | null>(null);
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  const firstProvider = providers[0]?.key ?? null;
  useEffect(() => { if (!provider && firstProvider) setProvider(firstProvider); }, [provider, firstProvider]);
  useEffect(() => { if (step === 'pay') document.getElementById('formulaire-don')?.scrollIntoView({ block: 'start' }); }, [step]);

  const amount = parse(amountText);
  const designationLabel = pick(DONATION_DESIGNATIONS.find((d) => d.key === designation)!.label);
  const providerLabel = MOBILE_PROVIDERS.find((p) => p.key === provider)?.label ?? '';
  const accounts = donationAccounts.filter((a) => a.provider === provider);
  const monthly = frequency === 'monthly';

  const changeCurrency = (c: Currency) => { setCurrency(c); setAmountText(fmt(DEFAULT_AMOUNT[c])); };
  const next = () => {
    if (!(amount > 0)) return setError(tx('Choisissez ou saisissez un montant.', 'Choose or enter an amount.', 'Escolha ou introduza um montante.'));
    if (dedicate && !dedicationName.trim()) return setError(tx('Indiquez le nom de la personne à qui vous dédiez ce don.', 'Enter the name of the person you are dedicating this gift to.', 'Indique o nome da pessoa a quem dedica este donativo.'));
    setError(''); setStep('pay');
  };
  const copy = (n: string) => {
    void navigator.clipboard?.writeText(n.replace(/\s/g, '')).then(() => { setCopied(n); window.setTimeout(() => setCopied(''), 2000); }, () => {});
  };

  const message = useMemo(() => [
    `Bonjour JE SUIS KCCiste, je viens d’envoyer un don${monthly ? ' mensuel' : ''}.`,
    `Montant : ${money(amount || 0, currency)}${monthly ? ' par mois' : ''}`,
    `Pour : ${DONATION_DESIGNATIONS.find((d) => d.key === designation)!.label.fr}`,
    `Moyen : ${providerLabel}`,
    dedicate && dedicationName.trim() ? `Don dédié ${dedicationKind === 'memoire' ? 'à la mémoire de' : 'en l’honneur de'} : ${dedicationName.trim()}` : '',
    `Nom : ${name.trim() || 'Anonyme'}`,
    reference.trim() ? `Référence de la transaction : ${reference.trim()}` : '',
    comment.trim() ? `Commentaire : ${comment.trim()}` : '',
    monthly ? 'Merci de me rappeler chaque mois.' : '',
  ].filter(Boolean).join('\n'), [amount, currency, designation, providerLabel, dedicate, dedicationKind, dedicationName, name, reference, comment, monthly, pick]);

  const confirm = () => window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');

  const choice = (active: boolean) => cn(
    'rounded-2xl border px-3 py-3 text-[15px] font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/30',
    active ? 'border-night bg-night/[0.04] text-night ring-1 ring-night' : 'border-night/15 bg-white text-ink hover:border-night/40',
  );

  return (
    <section className="bg-mist py-8 sm:py-12">
      <div className="container-page">
        <div className="mx-auto grid max-w-5xl gap-4 overflow-hidden rounded-[2rem] bg-white p-3 shadow-lift sm:p-4 lg:grid-cols-[1.25fr_1fr]">
          {/* Présentation */}
          <div className="order-last flex flex-col lg:order-none">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-night">
              <img src="/images/galerie/foule-assemblee.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <span className="inline-block rounded-md bg-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-night sm:text-sm">{tx('Soutenir l’œuvre de l’Église', 'Support the Church’s work', 'Apoiar a obra da Igreja')}</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col px-2 pb-2 pt-5 sm:px-4">
              <div className="flex items-center gap-3">
                <img src="/images/logo-kcc.png" alt="" className="h-12 w-12" />
                <div className="leading-tight">
                  <p className="font-display text-lg font-semibold text-night">JE SUIS KCCiste</p>
                  <p className="text-xs text-ink/60">Église Bon Nouveau Message (KCC)</p>
                </div>
              </div>
              <h1 className="mt-5 font-display text-2xl font-medium text-night sm:text-3xl">{tx('Votre don fait avancer l’œuvre', 'Your gift moves the work forward', 'O seu donativo faz avançar a obra')}</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{tx(
                'Chaises et équipement des paroisses, entraide en cas de deuil ou de maladie, cultes en direct, radio et site de la communauté : chaque don, petit ou grand, sert directement la vie de l’Église. Les contributions aux opérations sont publiées en toute transparence.',
                'Chairs and equipment for parishes, mutual aid in times of bereavement or illness, live services, radio and the community website: every gift, small or large, goes straight into the life of the Church. Contributions to operations are published transparently.',
                'Cadeiras e equipamento para as paróquias, entreajuda em caso de luto ou doença, cultos em direto, rádio e site da comunidade: cada donativo, pequeno ou grande, serve diretamente a vida da Igreja. As contribuições às operações são publicadas com transparência.',
              )}</p>
              <Link to="/solidarite" className="mt-4 self-start text-sm font-semibold text-night underline underline-offset-4 hover:text-gold-700">{tx('Voir nos opérations et les listes de contributions', 'See our operations and contribution lists', 'Ver as nossas operações e as listas de contribuições')}</Link>
              <p className="mt-auto flex flex-wrap gap-x-2 gap-y-1 pt-6 text-xs text-ink/55">
                <Link to="/confidentialite" className="underline hover:text-night">{tx('Confidentialité', 'Privacy', 'Privacidade')}</Link><span aria-hidden>·</span>
                <Link to="/solidarite" className="underline hover:text-night">{tx('Solidarité KCC', 'KCC Solidarity', 'Solidariedade KCC')}</Link><span aria-hidden>·</span>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-night">{tx('Une question ? WhatsApp', 'A question? WhatsApp', 'Uma pergunta? WhatsApp')}</a>
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <div id="formulaire-don" className="flex scroll-mt-24 flex-col rounded-3xl border border-night/10 p-5 sm:p-6">
            <p className="flex items-center gap-2 font-semibold text-night"><ShieldCheck className="h-6 w-6 text-emerald-600" />{tx('Don direct par Mobile Money', 'Direct gift by Mobile Money', 'Donativo direto por Mobile Money')}</p>

            {step === 'form' ? (
              <div className="mt-5 flex flex-1 flex-col gap-4">
                <div role="radiogroup" aria-label={tx('Fréquence', 'Frequency', 'Frequência')} className="grid grid-cols-2 gap-2">
                  {([['once', tx('Ponctuel', 'One-off', 'Pontual')], ['monthly', tx('Mensuel', 'Monthly', 'Mensal')]] as const).map(([k, l]) => (
                    <button key={k} type="button" role="radio" aria-checked={frequency === k} onClick={() => setFrequency(k)} className={cn(choice(frequency === k), 'inline-flex items-center justify-center gap-1.5', frequency === k && 'bg-gold-50')}>
                      {k === 'monthly' && <Heart className={cn('h-4 w-4', frequency === k ? 'fill-rose-500 text-rose-500' : 'text-rose-400')} />}{l}
                    </button>
                  ))}
                </div>

                <div role="radiogroup" aria-label={tx('Montant', 'Amount', 'Montante')} className="grid grid-cols-3 gap-2">
                  {PRESETS[currency].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={amount === n} onClick={() => { setAmountText(fmt(n)); setError(''); }} className={choice(amount === n)}>{short(n, currency)}</button>
                  ))}
                </div>

                <div className={cn('flex items-center rounded-2xl border bg-white pr-2 transition focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/20', error && !(amount > 0) ? 'border-red-500' : 'border-night/15')}>
                  <input inputMode="numeric" aria-label={tx('Autre montant', 'Other amount', 'Outro montante')} value={amountText} onChange={(e) => { setAmountText(e.target.value); setError(''); }}
                    className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-3 text-2xl font-medium text-night focus:outline-none" />
                  <label className="relative flex items-center text-sm font-semibold text-ink/70">
                    <span className="sr-only">{tx('Devise', 'Currency', 'Moeda')}</span>
                    <select value={currency} onChange={(e) => changeCurrency(e.target.value as Currency)} className="cursor-pointer appearance-none rounded-xl bg-transparent py-2 pl-2 pr-6 focus:outline-none">
                      <option value="CDF">CDF</option><option value="USD">USD</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1 h-4 w-4" />
                  </label>
                </div>

                <label className="relative block rounded-2xl border border-night/15 bg-white px-4 pb-2 pt-6 focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/20">
                  <span className="absolute left-4 top-2 text-xs text-ink/60">{tx('Désignation', 'Designation', 'Designação')}</span>
                  <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[15px] text-night focus:outline-none">
                    {DONATION_DESIGNATIONS.map((d) => <option key={d.key} value={d.key}>{pick(d.label)}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 text-ink/50" />
                </label>

                <label className="flex cursor-pointer items-center gap-3 text-[15px] text-ink">
                  <input type="checkbox" checked={dedicate} onChange={(e) => setDedicate(e.target.checked)} className="h-5 w-5 rounded border-night/30 accent-night" />
                  {tx('Dédier ce don', 'Dedicate this gift', 'Dedicar este donativo')}
                </label>
                {dedicate && (
                  <div className="space-y-2 rounded-2xl bg-mist p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {([['honneur', tx('En l’honneur de', 'In honour of', 'Em honra de')], ['memoire', tx('À la mémoire de', 'In memory of', 'Em memória de')]] as const).map(([k, l]) => (
                        <button key={k} type="button" aria-pressed={dedicationKind === k} onClick={() => setDedicationKind(k)} className={cn('rounded-xl px-3 py-2 font-medium transition', dedicationKind === k ? 'bg-night text-white' : 'bg-white text-ink/80')}>{l}</button>
                      ))}
                    </div>
                    <Input aria-label={tx('Nom de la personne', 'Person’s name', 'Nome da pessoa')} placeholder={tx('Nom de la personne', 'Person’s name', 'Nome da pessoa')} value={dedicationName} onChange={(e) => { setDedicationName(e.target.value); setError(''); }} />
                  </div>
                )}

                <Input aria-label={tx('Votre nom', 'Your name', 'O seu nome')} placeholder={tx('Votre nom (facultatif)', 'Your name (optional)', 'O seu nome (opcional)')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />

                <div className="mt-auto space-y-3 pt-2">
                  {showComment ? (
                    <Textarea aria-label={tx('Commentaire', 'Comment', 'Comentário')} placeholder={tx('Votre commentaire ou intention de prière', 'Your comment or prayer intention', 'O seu comentário ou intenção de oração')} value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[80px]" autoFocus />
                  ) : (
                    <button type="button" onClick={() => setShowComment(true)} className="text-sm text-ink underline underline-offset-4 hover:text-night">{tx('Ajouter un commentaire', 'Add a comment', 'Adicionar um comentário')}</button>
                  )}
                  {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                  <button type="button" onClick={next} className="w-full rounded-2xl bg-night px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-night-700">
                    {monthly ? tx('Faire un don mensuel', 'Give monthly', 'Fazer um donativo mensal') : tx('Faire un don', 'Make a donation', 'Fazer um donativo')}
                    {amount > 0 && <span className="text-gold-200"> · {money(amount, currency)}</span>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-1 flex-col gap-4">
                <button type="button" onClick={() => setStep('form')} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ink/70 hover:text-night"><ArrowLeft className="h-4 w-4" />{tx('Modifier mon don', 'Change my gift', 'Alterar o meu donativo')}</button>
                <div className="rounded-2xl bg-night p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.16em] text-gold-200">{monthly ? tx('Don mensuel', 'Monthly gift', 'Donativo mensal') : tx('Don ponctuel', 'One-off gift', 'Donativo pontual')}</p>
                  <p className="mt-1 font-display text-3xl">{money(amount, currency)}{monthly && <span className="text-base text-white/70"> / {tx('mois', 'month', 'mês')}</span>}</p>
                  <p className="mt-1 text-sm text-white/75">{designationLabel}</p>
                  {dedicate && dedicationName.trim() && <p className="mt-1 text-sm text-white/75">{dedicationKind === 'memoire' ? tx('À la mémoire de', 'In memory of', 'Em memória de') : tx('En l’honneur de', 'In honour of', 'Em honra de')} {dedicationName.trim()}</p>}
                </div>

                {providers.length ? (
                  <>
                    <p className="text-sm font-semibold text-night">1. {tx('Envoyez votre don à ce numéro', 'Send your gift to this number', 'Envie o seu donativo para este número')}</p>
                    <div role="radiogroup" aria-label={tx('Opérateur', 'Operator', 'Operadora')} className="flex flex-wrap gap-2">
                      {providers.map((p) => (
                        <button key={p.key} type="button" role="radio" aria-checked={provider === p.key} onClick={() => setProvider(p.key)}
                          className={cn('rounded-full px-4 py-2 text-sm font-bold ring-offset-2 transition', p.className, provider === p.key ? 'ring-2 ring-night' : 'opacity-60 hover:opacity-100')}>{p.label}</button>
                      ))}
                    </div>
                    {accounts.map((a) => (
                      <div key={a.number} className="flex items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 whitespace-nowrap text-base font-semibold text-night sm:text-lg"><Smartphone className="h-4 w-4 text-gold" />{a.number}</p>
                          <p className="text-xs text-ink/60">{tx('Au nom de', 'Account name', 'Em nome de')} {a.holder}</p>
                        </div>
                        <button type="button" onClick={() => copy(a.number)} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-night ring-1 ring-night/10">
                          {copied === a.number ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied === a.number ? tx('Copié', 'Copied', 'Copiado') : tx('Copier', 'Copy', 'Copiar')}
                        </button>
                      </div>
                    ))}
                    {monthly && <p className="text-xs text-ink/65">{tx('Don mensuel : renvoyez ce montant chaque mois au même numéro. Vous pouvez demander un rappel sur WhatsApp.', 'Monthly gift: send this amount every month to the same number. You can ask for a reminder on WhatsApp.', 'Donativo mensal: envie este montante todos os meses para o mesmo número. Pode pedir um lembrete no WhatsApp.')}</p>}
                    <p className="text-sm font-semibold text-night">2. {tx('Confirmez votre don sur WhatsApp', 'Confirm your gift on WhatsApp', 'Confirme o seu donativo no WhatsApp')}</p>
                    <Input aria-label={tx('Référence de la transaction', 'Transaction reference', 'Referência da transação')} placeholder={tx('Référence reçue par SMS (facultatif)', 'Reference received by SMS (optional)', 'Referência recebida por SMS (opcional)')} value={reference} onChange={(e) => setReference(e.target.value)} />
                    <button type="button" onClick={confirm} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-[15px] font-semibold text-night transition hover:brightness-95">
                      <MessageCircle className="h-5 w-5" />{tx('J’ai envoyé : confirmer sur WhatsApp', 'I’ve sent it: confirm on WhatsApp', 'Já enviei: confirmar no WhatsApp')}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-ink/70">{tx('Les numéros Mobile Money pour les dons seront affichés ici très bientôt. En attendant, écrivez-nous sur WhatsApp.', 'The Mobile Money numbers for donations will be shown here very soon. In the meantime, message us on WhatsApp.', 'Os números Mobile Money para donativos serão indicados aqui muito em breve. Entretanto, escreva-nos no WhatsApp.')}</p>
                    <button type="button" onClick={confirm} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-[15px] font-semibold text-night"><MessageCircle className="h-5 w-5" />{tx('Écrire sur WhatsApp', 'Message us on WhatsApp', 'Escrever no WhatsApp')}</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
