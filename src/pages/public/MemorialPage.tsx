import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, Feather, Flame, MapPin, Newspaper, Send } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Paragraphs } from '@/features/forum/ForumUi';
import { useAsync } from '@/hooks/useAsync';
import { useI18n, type Locale } from '@/i18n';
import { formatDate } from '@/utils/format';
import { addCondolence, CONDOLENCE_MAX, getMemorial, listCondolences, listPublicMemorials, type Memorial } from '@/features/memorial/memorial';

const dateText = (d: string, locale: Locale) => formatDate(d, locale, { dateStyle: 'long' }, 'UTC');
const yearOf = (d?: string | null) => (d ? d.slice(0, 4) : '');

/** « 1945 – 2026 », ou « † 2026 » si seule l'année du départ est connue. */
function years(m: Memorial) {
  const end = yearOf(m.deathDate ?? m.burialDate);
  const start = yearOf(m.birthDate);
  return start && end ? `${start} – ${end}` : end ? `† ${end}` : '';
}

function Portrait({ m, className }: { m: Memorial; className: string }) {
  if (m.photoUrl) return <img src={m.photoUrl} alt={m.fullName} loading="lazy" className={`object-cover ${className}`} />;
  const initials = m.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  return <div className={`grid place-items-center bg-night-800 font-display text-4xl text-gold-200 ${className}`} aria-hidden>{initials}</div>;
}

/** Mémorial : liste des fidèles rappelés à Dieu, ou page d'hommage de l'un d'eux. */
export default function MemorialPage() {
  const { slug } = useParams();
  return slug ? <MemorialDetail slug={slug} /> : <MemorialList />;
}

function MemorialList() {
  const { tx, locale } = useI18n();
  const list = useAsync(() => listPublicMemorials(locale), [locale]);
  return (
    <>
      <PageHeader
        eyebrow={tx('En mémoire', 'In memory', 'Em memória')}
        title={tx('Mémorial', 'Memorial', 'Memorial')}
        description={tx('Nous gardons le souvenir des fidèles de l’Église Bon Nouveau Message (KCC) rappelés à Dieu. Laissez un message de condoléances à leur famille.', 'We remember the faithful of the Bon Nouveau Message Church (KCC) who have been called home to God. Leave a message of condolence for their family.', 'Guardamos a memória dos fiéis da Igreja Bon Nouveau Message (KCC) chamados para junto de Deus. Deixe uma mensagem de condolências à sua família.')}
        image={list.data?.[0]?.photoUrl ?? undefined} />
      <section className="container-page py-10 sm:py-14">
        {list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : list.loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-96 rounded-3xl" />)}</div>
        ) : !list.data?.length ? (
          <EmptyState icon={<Flame className="h-6 w-6" aria-hidden />} title={tx('Aucune fiche pour le moment', 'No entries yet', 'Ainda sem fichas')} />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.data.map((m) => (
              <li key={m.slug}>
                <Link to={`/memorial/${m.slug}`} className="group block overflow-hidden rounded-3xl border border-night/[0.08] bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
                  <Portrait m={m} className="aspect-square w-full grayscale-[35%] transition group-hover:grayscale-0" />
                  <div className="p-5 text-center">
                    {m.honorific && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">{m.honorific}</p>}
                    <p className="mt-1 font-display text-xl font-semibold text-night">{m.fullName}</p>
                    {years(m) && <p className="mt-1 text-sm text-ink/60">{years(m)}</p>}
                    {(m.parish || m.city) && <p className="mt-2 text-sm text-ink/70">{[m.parish, m.city].filter(Boolean).join(', ')}</p>}
                    {m.epitaph && <p className="mt-3 font-display text-[15px] italic text-ink/70">« {m.epitaph} »</p>}
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 group-hover:text-night"><Feather className="h-4 w-4" aria-hidden />{tx('Lire l’hommage et laisser un message', 'Read the tribute and leave a message', 'Ler a homenagem e deixar uma mensagem')}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function MemorialDetail({ slug }: { slug: string }) {
  const { tx, locale } = useI18n();
  const item = useAsync(() => getMemorial(slug, locale), [slug, locale]);
  const m = item.data;
  if (item.loading) return <section className="container-page py-16"><Skeleton className="h-[28rem] rounded-3xl" /></section>;
  if (item.error) return <section className="container-page py-16"><ErrorState error={item.error} onRetry={item.reload} /></section>;
  if (!m) {
    return (
      <section className="container-page py-16">
        <EmptyState title={tx('Fiche introuvable', 'Entry not found', 'Ficha não encontrada')} action={<Link to="/memorial" className="font-semibold text-gold-700">{tx('Retour au Mémorial', 'Back to the Memorial', 'Voltar ao Memorial')}</Link>} />
      </section>
    );
  }
  const name = [m.honorific, m.fullName].filter(Boolean).join(' ');
  const summary = [m.epitaph, [m.parish, m.city].filter(Boolean).join(', ')].filter(Boolean).join(' · ');
  return (
    <>
      <PageHeader eyebrow={tx('Mémorial', 'Memorial', 'Memorial')} title={name} description={years(m) || undefined}
        metaDescription={summary || tx('Page d’hommage du Mémorial Je suis KCCiste.', 'Tribute page of the Je suis KCCiste Memorial.', 'Página de homenagem do Memorial Je suis KCCiste.')} image={m.photoUrl}>
        <Link to="/memorial" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden />{tx('Tous les fidèles du Mémorial', 'Everyone in the Memorial', 'Todos os fiéis do Memorial')}</Link>
      </PageHeader>
      <section className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <aside className="space-y-5">
          <Portrait m={m} className="aspect-square w-full rounded-3xl shadow-soft ring-1 ring-night/10" />
          <div className="flex items-center justify-center gap-2 text-gold-600" aria-hidden><Flame className="h-5 w-5" /></div>
          <dl className="space-y-3 rounded-3xl border border-night/[0.08] bg-white p-5 text-sm shadow-sm">
            {m.birthDate && <Fact icon={<CalendarDays className="h-4 w-4" />} label={tx('Naissance', 'Born', 'Nascimento')} value={dateText(m.birthDate, locale)} />}
            {m.deathDate && <Fact icon={<CalendarDays className="h-4 w-4" />} label={tx('Rappelé(e) à Dieu', 'Called home to God', 'Chamado(a) para Deus')} value={dateText(m.deathDate, locale)} />}
            {m.burialDate && <Fact icon={<CalendarDays className="h-4 w-4" />} label={tx('Inhumation', 'Burial', 'Sepultamento')} value={dateText(m.burialDate, locale)} />}
            {m.parish && <Fact icon={<Building2 className="h-4 w-4" />} label={tx('Paroisse', 'Parish', 'Paróquia')} value={m.parish} />}
            {m.city && <Fact icon={<MapPin className="h-4 w-4" />} label={tx('Ville', 'City', 'Cidade')} value={m.city} />}
          </dl>
          {m.articleUrl && (
            <Link to={m.articleUrl} className="flex items-center gap-2 rounded-2xl border border-night/[0.08] bg-white px-4 py-3 text-sm font-semibold text-night shadow-sm hover:border-gold-400">
              <Newspaper className="h-4 w-4 text-gold-600" aria-hidden />{tx('Lire le communiqué de la famille', 'Read the family’s announcement', 'Ler o comunicado da família')}
            </Link>
          )}
        </aside>
        <div className="min-w-0 space-y-10">
          {m.epitaph && <blockquote className="border-l-4 border-gold-400 pl-5 font-display text-2xl italic leading-snug text-night">« {m.epitaph} »</blockquote>}
          {m.biography && (
            <article>
              <h2 className="font-display text-2xl font-semibold text-night">{tx('Sa vie', 'Life', 'A sua vida')}</h2>
              <Paragraphs text={m.biography} className="mt-4 space-y-4 text-[16px] leading-relaxed text-ink/85" />
            </article>
          )}
          <Condolences slug={m.slug} name={m.fullName} />
        </div>
      </section>
    </>
  );
}

function Fact({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-gold-600" aria-hidden>{icon}</span>
      <div><dt className="text-xs uppercase tracking-wide text-ink/50">{label}</dt><dd className="font-medium text-night">{value}</dd></div>
    </div>
  );
}

function Condolences({ slug, name }: { slug: string; name: string }) {
  const { tx, locale } = useI18n();
  const { notify } = useToast();
  const list = useAsync(() => listCondolences(slug), [slug]);
  const [v, setV] = useState({ authorName: '', authorParish: '', message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (v.authorName.trim().length < 2) errs.authorName = tx('Indiquez votre nom.', 'Enter your name.', 'Indique o seu nome.');
    if (v.message.trim().length < 3) errs.message = tx('Écrivez votre message.', 'Write your message.', 'Escreva a sua mensagem.');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Champ invisible rempli : envoi automatique (robot), on ne l'enregistre pas.
    if (v.website) { setSent(true); return; }
    setBusy(true);
    try {
      await addCondolence({ memorialSlug: slug, authorName: v.authorName, authorParish: v.authorParish, message: v.message });
      setSent(true);
      setV({ authorName: '', authorParish: '', message: '', website: '' });
    } catch (err) {
      notify(err instanceof Error ? err.message : tx('Envoi impossible.', 'Could not send.', 'Envio impossível.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const items = list.data ?? [];
  return (
    <section aria-labelledby="condoleances-title" className="space-y-6">
      <h2 id="condoleances-title" className="font-display text-2xl font-semibold text-night">
        {tx('Messages de condoléances', 'Messages of condolence', 'Mensagens de condolências')}{items.length > 0 && <span className="ml-2 text-base font-normal text-ink/50">({items.length})</span>}
      </h2>
      {list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : list.loading ? <Skeleton className="h-24 rounded-2xl" /> : items.length === 0 ? (
        <p className="text-sm text-ink/60">{tx(`Soyez le premier à laisser un message en mémoire de ${name}.`, `Be the first to leave a message in memory of ${name}.`, `Seja o primeiro a deixar uma mensagem em memória de ${name}.`)}</p>
      ) : (
        <ol className="space-y-4">
          {items.map((c) => (
            <li key={c.id} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-sm">
              <Paragraphs text={c.message} className="space-y-2 break-words text-[15px] leading-relaxed text-ink/85" />
              <p className="mt-3 text-sm"><span className="font-semibold text-night">{c.authorName}</span>{c.authorParish && <span className="text-gold-700"> · {c.authorParish}</span>}<span className="text-ink/45"> · {formatDate(c.createdAt, locale)}</span></p>
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-3xl border border-night/[0.08] bg-mist/60 p-5 sm:p-7">
        <h3 className="font-display text-xl font-semibold text-night">{tx('Laisser un message', 'Leave a message', 'Deixar uma mensagem')}</h3>
        <p className="mt-1 text-sm text-ink/60">{tx('Votre message sera publié après relecture par l’administration du site.', 'Your message will be published after review by the site administrators.', 'A sua mensagem será publicada depois de revista pela administração do site.')}</p>
        {sent ? (
          <div role="status" className="mt-5 rounded-2xl border border-gold-300 bg-white p-5 text-sm text-night">
            <p className="font-semibold">{tx('Merci, votre message a bien été reçu.', 'Thank you, your message has been received.', 'Obrigado, a sua mensagem foi recebida.')}</p>
            <p className="mt-1 text-ink/70">{tx('Il apparaîtra ici dès qu’il aura été validé.', 'It will appear here once it has been approved.', 'Aparecerá aqui assim que for aprovada.')}</p>
            <button type="button" className="mt-3 font-semibold text-gold-700 hover:text-night" onClick={() => setSent(false)}>{tx('Écrire un autre message', 'Write another message', 'Escrever outra mensagem')}</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={tx('Votre nom', 'Your name', 'O seu nome')} required error={errors.authorName}>{(p) => <Input {...p} value={v.authorName} onChange={set('authorName')} maxLength={120} autoComplete="name" />}</Field>
            <Field label={tx('Votre paroisse (facultatif)', 'Your parish (optional)', 'A sua paróquia (facultativo)')}>{(p) => <Input {...p} value={v.authorParish} onChange={set('authorParish')} maxLength={160} />}</Field>
            <Field label={tx('Votre message', 'Your message', 'A sua mensagem')} required error={errors.message} hint={`${v.message.length} / ${CONDOLENCE_MAX}`} className="sm:col-span-2">
              {(p) => <Textarea {...p} rows={4} value={v.message} onChange={set('message')} maxLength={CONDOLENCE_MAX} placeholder={tx('Paix à son âme. Toutes nos condoléances à la famille…', 'May they rest in peace. Our deepest condolences to the family…', 'Paz à sua alma. As nossas sentidas condolências à família…')} />}
            </Field>
            <div className="hidden" aria-hidden><label>Site web<input tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} /></label></div>
            <div className="sm:col-span-2"><Button type="submit" loading={busy} disabled={busy} icon={<Send className="h-4 w-4" />}>{tx('Envoyer mon message', 'Send my message', 'Enviar a minha mensagem')}</Button></div>
          </form>
        )}
      </div>
    </section>
  );
}
