import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, CalendarClock, ExternalLink, Globe2, MapPin, Search, ShieldAlert, Users } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { formatDate } from '@/utils/format';
import { CONTRACT_LABELS, JOBS_WHATSAPP_URL, SOURCE_LINKS, applyHref, translateTerms, useCommunityOffers, useDailyJobs, type DailyJob } from '@/features/jobs/jobs';
import type { JobOffer } from '@/types';

type Filter = 'all' | 'local' | 'remote';
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3Z" />
    </svg>
  );
}

/** Rubrique « Opportunités et emplois » : offres de la communauté puis les 50 offres du jour. */
export default function JobsPage() {
  const { tx, pick, locale } = useI18n();
  const { profile } = useAuth();
  const daily = useDailyJobs();
  const community = useCommunityOffers();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const jobs = useMemo(() => {
    const list = daily.data?.jobs ?? [];
    const q = norm(query.trim());
    return list.filter((j) => (filter === 'all' || (filter === 'remote' ? j.remote : !j.remote))
      && (!q || norm([j.title, j.organization, j.location, j.country, j.category].filter(Boolean).join(' ')).includes(q)));
  }, [daily.data, filter, query]);
  const counts = { all: daily.data?.jobs.length ?? 0, local: daily.data?.jobs.filter((j) => !j.remote).length ?? 0, remote: daily.data?.jobs.filter((j) => j.remote).length ?? 0 };
  const filters: [Filter, string][] = [
    ['all', tx('Toutes', 'All', 'Todas')],
    ['local', tx('RD Congo et région', 'DR Congo and region', 'RD Congo e região')],
    ['remote', tx('Télétravail', 'Remote', 'Teletrabalho')],
  ];
  const date = (iso: string | null | undefined) => (iso ? formatDate(iso, locale, { day: 'numeric', month: 'short', year: 'numeric' }) : null);

  return (
    <>
      <PageHeader
        eyebrow={tx('Entraide KCCiste', 'KCCist mutual help', 'Entreajuda KCCista')}
        title={tx('Opportunités et emplois', 'Opportunities and jobs', 'Oportunidades e empregos')}
        description={tx(
          'Chaque jour, jusqu’à 50 offres d’emploi réelles, avec le lien de l’annonce d’origine : en RD Congo, dans la région et en télétravail. Plus les opportunités partagées par la communauté.',
          'Every day, up to 50 real job offers, with a link to the original posting: in the DR Congo, the region and remote. Plus the opportunities shared by the community.',
          'Todos os dias, até 50 ofertas de emprego reais, com o link do anúncio original: na RD Congo, na região e em teletrabalho. Mais as oportunidades partilhadas pela comunidade.',
        )}
      >
        <div className="flex flex-wrap gap-3">
          <a href={JOBS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={buttonClass('gold', 'md')}>
            <WhatsAppIcon className="h-4 w-4" />{tx('Rejoindre le groupe WhatsApp', 'Join the WhatsApp group', 'Entrar no grupo WhatsApp')}
          </a>
          {!profile && <Link to="/inscription" className={buttonClass('light', 'md')}>{tx('Créer mon compte sur le site', 'Create my account', 'Criar a minha conta')}</Link>}
        </div>
      </PageHeader>

      <section className="container-page py-10">
        <div className="grid gap-4 rounded-3xl border border-gold/30 bg-gold-50 p-6 sm:grid-cols-[auto,1fr] sm:items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] text-white"><WhatsAppIcon className="h-6 w-6" /></span>
          <div>
            <p className="font-display text-xl font-semibold text-night">{tx('Groupe WhatsApp « Je suis KCCiste 4 Opportunité et emploi »', 'WhatsApp group “Je suis KCCiste 4 Opportunité et emploi”', 'Grupo WhatsApp «Je suis KCCiste 4 Opportunité et emploi»')}</p>
            <p className="mt-1 text-sm text-ink/70">
              {tx('Recevez les offres sur votre téléphone et partagez celles que vous connaissez. ', 'Get the offers on your phone and share the ones you know about. ', 'Receba as ofertas no telemóvel e partilhe as que conhece. ')}
              {profile
                ? tx('Merci d’être connecté au site !', 'Thank you for being signed in!', 'Obrigado por estar ligado ao site!')
                : <>{tx('Vous pouvez aussi ', 'You can also ', 'Também pode ')}<Link to="/connexion" className="font-semibold text-night underline">{tx('vous connecter au site', 'sign in to the site', 'entrar no site')}</Link>{tx(' pour suivre la communauté.', ' to follow the community.', ' para acompanhar a comunidade.')}</>}
            </p>
            <a href={JOBS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline">
              {tx('Rejoindre le groupe', 'Join the group', 'Entrar no grupo')} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {(community.data?.length ?? 0) > 0 && (
        <section className="container-page pb-6">
          <SectionHeading eyebrow={tx('Partagées par la communauté', 'Shared by the community', 'Partilhadas pela comunidade')} title={tx('Opportunités de la communauté', 'Community opportunities', 'Oportunidades da comunidade')} />
          <div className="grid gap-5 lg:grid-cols-2">
            {community.data!.map((o) => <CommunityCard key={o.id} o={o} />)}
          </div>
        </section>
      )}

      <section id="offres-du-jour" className="container-page scroll-mt-32 py-10">
        <SectionHeading
          eyebrow={daily.data ? tx(`Mises à jour le ${date(daily.data.date)}`, `Updated on ${date(daily.data.date)}`, `Atualizadas a ${date(daily.data.date)}`) : tx('Chaque jour', 'Every day', 'Todos os dias')}
          title={tx('Les offres du jour', 'Today’s offers', 'As ofertas do dia')}
          description={tx('Offres publiées par des sites d’emploi reconnus. Cliquez sur une offre pour lire l’annonce complète et postuler sur le site d’origine.', 'Offers posted on recognised job sites. Click an offer to read the full posting and apply on the original site.', 'Ofertas publicadas por sites de emprego reconhecidos. Clique numa oferta para ler o anúncio completo e candidatar-se no site de origem.')}
        />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label={tx('Filtrer', 'Filter', 'Filtrar')} className="flex flex-wrap gap-2">
            {filters.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === k ? 'border-night bg-night text-white' : 'border-night/10 bg-white text-ink/70 hover:border-gold'}`}>
                {label} <span className="opacity-60">({counts[k]})</span>
              </button>
            ))}
          </div>
          <label className="relative block sm:w-72">
            <span className="sr-only">{tx('Rechercher un métier', 'Search a job', 'Procurar uma profissão')}</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tx('Métier, ville, organisation…', 'Job, city, organisation…', 'Profissão, cidade, organização…')}
              className="h-11 w-full rounded-full border border-night/10 bg-white pl-10 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30" />
          </label>
        </div>

        {daily.loading && <p className="rounded-2xl bg-white p-6 text-sm text-ink/60 shadow-soft">{tx('Chargement des offres du jour…', 'Loading today’s offers…', 'A carregar as ofertas do dia…')}</p>}
        {!daily.loading && (daily.error || !daily.data?.jobs.length) && (
          <p className="rounded-2xl bg-white p-6 text-sm text-ink/70 shadow-soft">
            {tx('Les offres du jour ne sont pas disponibles pour le moment. Réessayez un peu plus tard, ou rejoignez le groupe WhatsApp pour les recevoir.', 'Today’s offers are not available right now. Try again a little later, or join the WhatsApp group to receive them.', 'As ofertas do dia não estão disponíveis de momento. Tente mais tarde, ou entre no grupo WhatsApp para recebê-las.')}
          </p>
        )}
        {!!daily.data?.jobs.length && !jobs.length && <p className="rounded-2xl bg-white p-6 text-sm text-ink/60 shadow-soft">{tx('Aucune offre ne correspond à votre recherche.', 'No offer matches your search.', 'Nenhuma oferta corresponde à sua pesquisa.')}</p>}

        <ul className="grid gap-4 md:grid-cols-2">
          {jobs.map((j) => <DailyJobCard key={j.id} j={j} date={date} />)}
        </ul>

        {!!daily.data?.jobs.length && (
          <p className="mt-6 text-xs text-ink/55">
            {tx('Sources : ', 'Sources: ', 'Fontes: ')}
            {(Object.keys(SOURCE_LINKS) as DailyJob['source'][]).filter((s) => daily.data!.jobs.some((j) => j.source === s)).map((s, i) => (
              <span key={s}>{i > 0 && ' · '}<a href={SOURCE_LINKS[s]} target="_blank" rel="noopener noreferrer" className="underline hover:text-night">{s}</a></span>
            ))}
            {tx('. Le site Je suis KCCiste ne recrute pas lui-même et n’est pas responsable de ces offres.', '. The Je suis KCCiste site does not recruit itself and is not responsible for these offers.', '. O site Je suis KCCiste não recruta e não é responsável por estas ofertas.')}
          </p>
        )}

        <div className="mt-8 flex gap-3 rounded-2xl border border-amber-600/20 bg-amber-50 p-5 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>{tx('Attention aux arnaques : un vrai employeur ne demande jamais d’argent pour un emploi, un entretien ou un visa. Ne payez rien et ne donnez pas vos codes Mobile Money.', 'Beware of scams: a real employer never asks for money for a job, an interview or a visa. Never pay and never give your Mobile Money codes.', 'Cuidado com burlas: um verdadeiro empregador nunca pede dinheiro por um emprego, uma entrevista ou um visto. Não pague nada e não dê os seus códigos Mobile Money.')}</p>
        </div>
      </section>
    </>
  );

  function CommunityCard({ o }: { o: JobOffer }) {
    const href = applyHref(o.applyTo);
    return (
      <article className="flex flex-col rounded-3xl border border-night/[0.06] bg-white p-6 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <Badge tone="gold"><Users className="h-3 w-3" aria-hidden />{pick(CONTRACT_LABELS[o.contractType] ?? CONTRACT_LABELS.autre)}</Badge>
          {o.closingDate && <Badge tone="amber"><CalendarClock className="h-3 w-3" aria-hidden />{tx('Jusqu’au ', 'Until ', 'Até ')}{date(o.closingDate)}</Badge>}
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold text-night">{o.title}</h3>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/60">
          <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" aria-hidden />{o.organization}</span>
          {o.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{o.location}</span>}
        </p>
        {o.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/75">{o.description}</p>}
        <div className="mt-auto pt-4">
          <p className="text-sm text-ink/70"><span className="font-semibold text-night">{tx('Pour postuler : ', 'To apply: ', 'Para se candidatar: ')}</span>
            {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="break-all font-semibold text-night-500 underline">{o.applyTo}</a> : o.applyTo}
          </p>
          <p className="mt-1 text-xs text-ink/50">{tx('Source : ', 'Source: ', 'Fonte: ')}{o.source}</p>
        </div>
      </article>
    );
  }
}

function DailyJobCard({ j, date }: { j: DailyJob; date: (iso: string | null) => string | null }) {
  const { tx, locale } = useI18n();
  const posted = date(j.postedAt);
  const closing = date(j.closingAt);
  return (
    <li>
      <a href={j.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lift">
        <div className="flex flex-wrap gap-2">
          {j.remote
            ? <Badge tone="blue"><Globe2 className="h-3 w-3" aria-hidden />{tx('Télétravail', 'Remote', 'Teletrabalho')}</Badge>
            : <Badge tone="green"><MapPin className="h-3 w-3" aria-hidden />{translateTerms(j.country, locale) ?? tx('RD Congo', 'DR Congo', 'RD Congo')}</Badge>}
          {j.contract && <Badge><Briefcase className="h-3 w-3" aria-hidden />{translateTerms(j.contract, locale)}</Badge>}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-night group-hover:underline">{j.title}</h3>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/60">
          {j.organization && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" aria-hidden />{j.organization}</span>}
          {j.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{j.location}</span>}
        </p>
        {j.category && <p className="mt-2 text-xs text-ink/50">{j.category}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs text-ink/55">
          <span>
            {posted && <>{tx('Publiée le ', 'Posted on ', 'Publicada a ')}{posted}</>}
            {closing && <> · <span className="font-semibold text-amber-700">{tx('Clôture le ', 'Closes on ', 'Encerra a ')}{closing}</span></>}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-night-500">{tx('Voir sur ', 'View on ', 'Ver em ')}{j.source}<ExternalLink className="h-3.5 w-3.5" aria-hidden /></span>
        </div>
      </a>
    </li>
  );
}
