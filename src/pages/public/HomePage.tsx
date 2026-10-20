import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Building2, CalendarDays, Disc3, FileText, Globe2, GraduationCap, HandHeart, Mail, MapPin, Music2, Phone, PlayCircle, ScrollText, Users } from 'lucide-react';
import { useI18n, type Tri } from '@/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAsync } from '@/hooks/useAsync';
import { coursesRepo, getCommunityStats, listPublishedAnnouncements, listUpcomingEvents, parishesRepo, projectsRepo } from '@/services';
import { HeroBackdrop } from '@/components/common/HeroBackdrop';
import { YouTubeChannelSection } from '@/components/common/YouTubeChannel';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Misc';
import { DemoBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { AnnouncementCard, CourseCard, EventCard, ProjectCard } from '@/components/cards/Cards';
import { formatDate, formatNumber, formatTime } from '@/utils/format';

const SERVICES: { title: Tri; text: Tri; to: string; icon: typeof Users }[] = [
  { title: { fr: 'Les membres', en: 'Members', pt: 'Os membros' }, text: { fr: 'Un annuaire respectueux de la vie privée pour se retrouver, où que l’on soit.', en: 'A privacy-friendly directory to find one another, wherever you are.', pt: 'Um diretório que respeita a privacidade, para nos encontrarmos onde quer que estejamos.' }, to: '/communaute/annuaire', icon: Users },
  { title: { fr: 'Les formations', en: 'Training', pt: 'As formações' }, text: { fr: 'L’Académie KCC : parcours, examens et certificats vérifiables.', en: 'The KCC Academy: learning paths, exams and verifiable certificates.', pt: 'A Academia KCC: percursos, exames e certificados verificáveis.' }, to: '/academie', icon: GraduationCap },
  { title: { fr: 'Les activités', en: 'Activities', pt: 'As atividades' }, text: { fr: 'Cultes, réunions, séminaires et rassemblements dans un agenda commun.', en: 'Services, meetings, seminars and gatherings in one shared calendar.', pt: 'Cultos, reuniões, seminários e encontros numa agenda comum.' }, to: '/agenda', icon: CalendarDays },
  { title: { fr: 'KCC Music', en: 'KCC Music', pt: 'KCC Music' }, text: { fr: 'Chants, albums, chorales et artistes, dans le respect des droits.', en: 'Songs, albums, choirs and artists, with respect for copyright.', pt: 'Cânticos, álbuns, coros e artistas, respeitando os direitos.' }, to: '/musique', icon: Music2 },
  { title: { fr: 'La solidarité', en: 'Solidarity', pt: 'A solidariedade' }, text: { fr: 'Des projets transparents, suivis et documentés, au service de tous.', en: 'Transparent, tracked and documented projects that serve everyone.', pt: 'Projetos transparentes, acompanhados e documentados, ao serviço de todos.' }, to: '/solidarite', icon: HandHeart },
  { title: { fr: 'Les paroisses', en: 'Parishes', pt: 'As paróquias' }, text: { fr: 'Les paroisses et leurs sections, en RD Congo et dans la diaspora.', en: 'Parishes and their sections, in the DR Congo and across the diaspora.', pt: 'As paróquias e as suas secções, na RD Congo e na diáspora.' }, to: '/paroisses', icon: Building2 },
];

const GALLERY: { src: string; alt: Tri; className: string }[] = [
  { src: '/images/archives/temple-kcc-assemblee.jpg', alt: { fr: 'Grande assemblée de la communauté devant un bâtiment KCC', en: 'Large community gathering in front of a KCC building', pt: 'Grande encontro da comunidade diante de um edifício KCC' }, className: 'sm:col-span-2 sm:row-span-2' },
  { src: '/images/archives/temple-construction.jpg', alt: { fr: 'Membres de la communauté devant un grand bâtiment en construction', en: 'Community members in front of a large building under construction', pt: 'Membros da comunidade diante de um grande edifício em construção' }, className: '' },
  { src: '/images/archives/centre-hospitalier-christ-sante-lemba.jpg', alt: { fr: 'Façade du centre hospitalier de Lemba', en: 'Front of the Lemba hospital centre', pt: 'Fachada do centro hospitalar de Lemba' }, className: '' },
  { src: '/images/archives/archive-assemblee-noir-et-blanc.jpg', alt: { fr: 'Photographie d’archive en noir et blanc d’une famille de la communauté', en: 'Black-and-white archive photograph of a community family', pt: 'Fotografia de arquivo a preto e branco de uma família da comunidade' }, className: 'sm:col-span-2' },
];

const RESOURCES: { title: Tri; text: Tri; to: string; icon: typeof Users }[] = [
  { title: { fr: 'Doctrine et histoire', en: 'Doctrine and history', pt: 'Doutrina e história' }, text: { fr: 'Textes officiels, dates clés et archives.', en: 'Official texts, key dates and archives.', pt: 'Textos oficiais, datas-chave e arquivos.' }, to: '/doctrine', icon: ScrollText },
  { title: { fr: 'Enseignements', en: 'Teachings', pt: 'Ensinamentos' }, text: { fr: 'Messages et enseignements à lire.', en: 'Messages and teachings to read.', pt: 'Mensagens e ensinamentos para ler.' }, to: '/enseignements', icon: BookOpen },
  { title: { fr: 'Cantiques', en: 'Hymns', pt: 'Hinos' }, text: { fr: 'Le recueil des chants de la communauté.', en: 'The community songbook.', pt: 'O hinário da comunidade.' }, to: '/cantiques', icon: Music2 },
  { title: { fr: 'KCC Music', en: 'KCC Music', pt: 'KCC Music' }, text: { fr: 'Albums, chorales et artistes à écouter.', en: 'Albums, choirs and artists to listen to.', pt: 'Álbuns, coros e artistas para ouvir.' }, to: '/musique', icon: Disc3 },
  { title: { fr: 'Bibliothèque', en: 'Library', pt: 'Biblioteca' }, text: { fr: 'Documents et ressources à télécharger.', en: 'Documents and resources to download.', pt: 'Documentos e recursos para descarregar.' }, to: '/bibliotheque', icon: FileText },
];

const VALUES: Tri<string[]> = {
  fr: ['Foi', 'Unité', 'Formation', 'Louange', 'Solidarité', 'Service', 'Diaspora', 'Espérance'],
  en: ['Faith', 'Unity', 'Learning', 'Praise', 'Solidarity', 'Service', 'Diaspora', 'Hope'],
  pt: ['Fé', 'Unidade', 'Formação', 'Louvor', 'Solidariedade', 'Serviço', 'Diáspora', 'Esperança'],
};

export default function HomePage() {
  const { t, tx, pick, locale } = useI18n();
  const { profile } = useAuth();
  const { settings } = useSiteSettings();
  const signedIn = !!profile;

  const stats = useAsync(getCommunityStats, []);
  const anns = useAsync(() => listPublishedAnnouncements({ signedIn, limit: 3 }), [signedIn]);
  const events = useAsync(() => Promise.all([listUpcomingEvents({ signedIn, limit: 4 }), parishesRepo.all()]), [signedIn]);
  const courses = useAsync(async () => (await coursesRepo.all()).filter((c) => c.status === 'published').slice(0, 3), []);
  const projects = useAsync(async () => (await projectsRepo.all()).filter((p) => p.status === 'active').slice(0, 3), []);
  const next = events.data?.[0][0];

  const statItems = stats.data
    ? [
        { label: t('home.stats.countries'), value: stats.data.stats.countries, icon: Globe2 },
        { label: t('home.stats.parishes'), value: stats.data.stats.parishes, icon: Building2 },
        { label: t('home.stats.members'), value: stats.data.stats.members, icon: Users },
        { label: t('home.stats.courses'), value: stats.data.stats.courses, icon: BookOpen },
        { label: t('home.stats.events'), value: stats.data.stats.events, icon: CalendarDays },
      ]
    : [];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-night-950 pb-36 pt-32 text-white sm:pb-40">
        <HeroBackdrop src={settings.heroImageUrl} />
        <div className="container-page relative grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mb-7 inline-flex animate-fade-up items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-1.5 pr-4 text-xs font-medium text-white/80 backdrop-blur-md">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-night">
                KCC
              </span>
              {tx('La communauté KCCiste, partout dans le monde', 'The KCCist community, all over the world', 'A comunidade KCCista, em todo o mundo')}
            </p>
            <h1 className="animate-fade-up font-display text-[3rem] font-medium leading-[0.98] tracking-[-0.03em] [animation-delay:80ms] sm:text-7xl lg:text-[5.6rem]">
              {tx('Un seul peuple.', 'One people.', 'Um só povo.')}<br />
              <span className="animate-shimmer italic text-gold-gradient">{tx('Une même communauté.', 'One community.', 'Uma mesma comunidade.')}</span>
            </h1>
            <p className="mt-7 max-w-xl animate-fade-up text-lg leading-relaxed text-white/70 [animation-delay:160ms] sm:text-xl">{t('hero.subtitle')}</p>
            <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row">
              <ButtonLink to={signedIn ? '/espace' : '/inscription'} variant="gold" size="lg" icon={<Users className="h-5 w-5" />}>{signedIn ? t('nav.mySpace') : t('hero.join')}</ButtonLink>
              <ButtonLink to="/agenda" variant="light" size="lg" className="group">{t('hero.discover')} <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></ButtonLink>
            </div>
            <ul className="mt-12 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/55 [animation-delay:320ms]">
              {[tx('RD Congo & diaspora', 'DR Congo & diaspora', 'RD Congo & diáspora'), tx('Académie et certificats', 'Academy and certificates', 'Academia e certificados'), 'Français · English · Português'].map((x) => (
                <li key={x} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold shadow-glow" aria-hidden />{x}</li>
              ))}
            </ul>
          </div>
          {next && (
            <aside className="relative lg:col-span-5 lg:pl-6" aria-label={tx('Prochain rendez-vous', 'Next event', 'Próximo encontro')}>
              <div className="pointer-events-none absolute -inset-6 hidden rounded-[2.5rem] bg-gradient-to-br from-gold/20 via-transparent to-transparent blur-2xl lg:block" aria-hidden />
              <Link to={`/agenda/${next.id}`} className="group relative block animate-fade-up overflow-hidden rounded-3xl glass p-6 transition duration-500 [animation-delay:300ms] hover:border-gold/30 hover:bg-white/[0.09] sm:p-7 lg:animate-float">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-200">
                    <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-gold" /></span>
                    {tx('Prochain rendez-vous', 'Next event', 'Próximo encontro')}
                  </p>
                  <CalendarDays className="h-5 w-5 text-white/40" aria-hidden />
                </div>
                <div className="mt-6 flex items-start gap-5">
                  <div className="flex w-20 shrink-0 flex-col items-center rounded-2xl bg-gradient-to-b from-gold-300 to-gold-500 py-3 text-night shadow-glow">
                    <span className="text-[11px] font-bold uppercase tracking-wider">{formatDate(next.startsAt, locale, { month: 'short' }, next.timezone)}</span>
                    <span className="font-display text-4xl font-medium leading-none">{formatDate(next.startsAt, locale, { day: '2-digit' }, next.timezone)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-2xl font-medium leading-snug">{next.title}</p>
                    <p className="mt-2 text-sm capitalize text-white/65">{formatDate(next.startsAt, locale, { weekday: 'long' }, next.timezone)} · {formatTime(next.startsAt, locale, next.timezone)}</p>
                    <p className="text-sm text-white/45">{next.location}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-sm font-semibold text-white">{tx('Voir l’événement', 'View event', 'Ver o evento')}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-night transition group-hover:bg-gold"><ArrowRight className="h-4 w-4 transition group-hover:-rotate-45" /></span>
                </div>
              </Link>
            </aside>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night-950/60" aria-hidden />
      </section>

      {/* INDICATEURS */}
      <section className="relative z-10 -mt-24 sm:-mt-28" aria-labelledby="stats-title">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] border border-night/[0.04] bg-white p-5 shadow-lift sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-gold/15 blur-3xl" aria-hidden />
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 id="stats-title" className="font-display text-2xl font-medium text-night">{t('home.stats.title')}</h2>
              {stats.data?.isExample && <span className="flex items-center gap-2 text-xs text-ink/55"><DemoBadge /> {tx('Valeurs d’exemple, non officielles', 'Sample figures, not official', 'Valores de exemplo, não oficiais')}</span>}
            </div>
            {stats.error ? <ErrorState error={stats.error} onRetry={stats.reload} /> : (
              <dl className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-night/[0.07]">
                {stats.loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />) : statItems.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="group flex items-center gap-3 rounded-2xl bg-mist/80 p-3.5 sm:flex-col sm:items-start lg:items-start last:col-span-2 sm:last:col-span-1 lg:rounded-none lg:bg-transparent lg:px-6 lg:py-1 lg:first:pl-0">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-night text-gold transition group-hover:bg-gold group-hover:text-night"><Icon className="h-5 w-5" aria-hidden /></span>
                    <div>
                      <dd className="font-display text-3xl font-medium leading-none tracking-tight text-night sm:text-4xl">{formatNumber(value, locale)}</dd>
                      <dt className="mt-1.5 text-[13px] leading-tight text-ink/55">{label}</dt>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <div className="relative mt-16 overflow-hidden border-y border-night/[0.06] bg-white py-5" aria-hidden>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-2xl italic text-night/70 sm:text-3xl">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10">
              {pick(VALUES).map((w) => (
                <span key={w} className="flex items-center gap-10">{w}<span className="h-2 w-2 rotate-45 bg-gold" /></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section className="py-20 sm:py-28" aria-labelledby="services-title">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Nos espaces', 'Our spaces', 'Os nossos espaços')} title={t('home.services.title')} description={tx('Six espaces pensés pour se connecter, apprendre, servir et grandir ensemble.', 'Six spaces designed to connect, learn, serve and grow together.', 'Seis espaços pensados para nos ligarmos, aprendermos, servirmos e crescermos juntos.')} />
          <h2 id="services-title" className="sr-only">{t('home.services.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {SERVICES.map(({ title, text, to, icon: Icon }, i) => (
              <Link key={to} to={to} className="group relative isolate flex min-h-[15rem] flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white p-7 shadow-soft transition duration-500 hover:-translate-y-1 hover:border-night hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-night-700 via-night-800 to-night-950 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-gold/10 blur-2xl transition duration-500 group-hover:scale-150 group-hover:bg-gold/30" aria-hidden />
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 text-gold-700 ring-1 ring-inset ring-gold/30 transition duration-500 group-hover:from-gold-300 group-hover:to-gold-500 group-hover:text-night"><Icon className="h-6 w-6" aria-hidden /></span>
                  <span className="font-display text-sm italic text-ink/30 transition group-hover:text-gold-200/70">0{i + 1}</span>
                </div>
                <h3 className="mt-auto pt-8 font-display text-2xl font-medium text-night transition-colors group-hover:text-white">{pick(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60 transition-colors group-hover:text-white/65">{pick(text)}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition-colors group-hover:text-gold-300">{tx('Découvrir', 'Discover', 'Descobrir')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ANNONCES */}
      <section className="relative bg-white py-20 sm:py-28" aria-labelledby="ann-title">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Actualités', 'News', 'Notícias')} title={t('home.announcements.title')} action={<ButtonLink to="/actualites" variant="outline" size="sm">{t('common.seeAll')} <ArrowRight className="h-4 w-4" /></ButtonLink>} />
          <h2 id="ann-title" className="sr-only">{t('home.announcements.title')}</h2>
          {anns.error ? <ErrorState error={anns.error} onRetry={anns.reload} /> : anns.loading ? (
            <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-80" />)}</div>
          ) : anns.data?.length ? (
            <div className="grid gap-5 md:grid-cols-3">{anns.data.map((a) => <AnnouncementCard key={a.id} a={a} />)}</div>
          ) : <EmptyState title={tx('Aucune annonce publiée pour le moment.', 'No announcements yet.', 'Ainda não há anúncios publicados.')} />}
        </div>
      </section>

      {/* ÉVÉNEMENTS + FORMATIONS */}
      <section className="py-20 sm:py-28">
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <div aria-labelledby="evt-title">
            <SectionHeading eyebrow={tx('Agenda', 'Calendar', 'Agenda')} title={t('home.events.title')} action={<ButtonLink to="/agenda" variant="outline" size="sm">{t('common.seeAll')}</ButtonLink>} />
            <h2 id="evt-title" className="sr-only">{t('home.events.title')}</h2>
            {events.error ? <ErrorState error={events.error} onRetry={events.reload} /> : events.loading ? (
              <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
            ) : events.data?.[0].length ? (
              <div className="space-y-3">{events.data[0].map((e) => <EventCard key={e.id} e={e} parishes={events.data![1]} />)}</div>
            ) : <EmptyState title={tx('Aucun événement à venir.', 'No upcoming events.', 'Nenhum evento previsto.')} />}
          </div>
          <div aria-labelledby="crs-title">
            <SectionHeading eyebrow={tx('Académie KCC', 'KCC Academy', 'Academia KCC')} title={t('home.courses.title')} action={<ButtonLink to="/academie/formations" variant="outline" size="sm">{t('common.seeAll')}</ButtonLink>} />
            <h2 id="crs-title" className="sr-only">{t('home.courses.title')}</h2>
            {courses.loading ? <Skeleton className="h-96" /> : courses.data?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">{courses.data.slice(0, 2).map((c) => <CourseCard key={c.id} c={c} />)}</div>
            ) : <EmptyState title={tx('Aucune formation publiée.', 'No courses published.', 'Nenhuma formação publicada.')} />}
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <section className="bg-white py-20 sm:py-28" aria-labelledby="gal-title">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Galerie', 'Gallery', 'Galeria')} title={tx('La communauté en images', 'The community in pictures', 'A comunidade em imagens')} description={tx('Rassemblements, bâtiments et moments de vie de la communauté, d’hier à aujourd’hui.', 'Gatherings, buildings and moments of community life, from yesterday to today.', 'Encontros, edifícios e momentos de vida da comunidade, de ontem a hoje.')} action={<ButtonLink to="/doctrine#archives" variant="outline" size="sm">{tx('Toutes les photos', 'All photos', 'Todas as fotos')} <ArrowRight className="h-4 w-4" /></ButtonLink>} />
          <h2 id="gal-title" className="sr-only">{tx('Galerie photos', 'Photo gallery', 'Galeria de fotos')}</h2>
          <div className="grid auto-rows-[11rem] grid-cols-1 gap-4 sm:auto-rows-[13rem] sm:grid-cols-4">
            {GALLERY.map((g) => (
              <Link key={g.src} to="/doctrine#archives" className={`group relative overflow-hidden rounded-3xl bg-night shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${g.className}`}>
                <img src={g.src} alt={pick(g.alt)} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-night-950/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VIDÉOS ET RESSOURCES */}
      <section className="py-20 sm:py-28" aria-labelledby="res-title">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Médias', 'Media', 'Média')} title={tx('Vidéos et ressources', 'Videos and resources', 'Vídeos e recursos')} description={tx('Regarder, lire et écouter : tout ce qu’il faut pour apprendre et partager.', 'Watch, read and listen: everything you need to learn and share.', 'Ver, ler e ouvir: tudo o que é preciso para aprender e partilhar.')} />
          <h2 id="res-title" className="sr-only">{tx('Vidéos et ressources', 'Videos and resources', 'Vídeos e recursos')}</h2>
          <div className="grid gap-6 lg:grid-cols-12">
            <figure className="overflow-hidden rounded-3xl bg-night-950 shadow-lift lg:col-span-7">
              <video controls playsInline preload="none" poster="/images/kcc-explication-apparition-poster.jpg" className="aspect-video w-full">
                <source src="/videos/kcc-explication-apparition.mp4" type="video/mp4" />
              </video>
              <figcaption className="flex items-center gap-3 p-5 text-white">
                <PlayCircle className="h-5 w-5 shrink-0 text-gold" aria-hidden />
                <span className="font-display text-lg">{tx('Le KCC expliqué en animation', 'The KCC explained in animation', 'O KCC explicado em animação')}</span>
              </figcaption>
            </figure>
            <ul className="grid gap-3 lg:col-span-5">
              {RESOURCES.map(({ title, text, to, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} className="group flex items-center gap-4 rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-night text-gold transition group-hover:bg-gold group-hover:text-night"><Icon className="h-5 w-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-night">{pick(title)}</span>
                      <span className="block text-sm text-ink/60">{pick(text)}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-gold-600 transition group-hover:translate-x-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CHAÎNE YOUTUBE */}
      <YouTubeChannelSection showPageLink />

      {/* SOLIDARITÉ */}
      <section className="relative isolate overflow-hidden bg-night-950 py-20 text-white sm:py-28" aria-labelledby="sol-title">
        <div className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-[32rem] w-[32rem] rounded-full bg-gold/20 blur-[130px]" aria-hidden />
        <div className="pointer-events-none absolute -right-20 top-0 -z-10 h-96 w-96 rounded-full bg-[#3b5ea8]/25 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 mask-radial" aria-hidden />
        <div className="container-page relative">
          <SectionHeading light eyebrow={tx('Ensemble', 'Together', 'Juntos')} title={t('home.solidarity.title')} description={tx('Chaque projet affiche son objectif et les montants confirmés. Les contributions simplement déclarées ne sont pas comptabilisées tant qu’elles ne sont pas vérifiées.', 'Each project shows its goal and confirmed amounts. Contributions that are only declared are not counted until they are verified.', 'Cada projeto mostra o seu objetivo e os montantes confirmados. As contribuições apenas declaradas não são contabilizadas enquanto não forem verificadas.')} action={<ButtonLink to="/solidarite/projets" variant="gold" size="sm">{tx('Tous les projets', 'All projects', 'Todos os projetos')}</ButtonLink>} />
          <h2 id="sol-title" className="sr-only">{t('home.solidarity.title')}</h2>
          {projects.data?.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.data.map((p) => <ProjectCard key={p.id} p={p} dark />)}</div>
          ) : projects.loading ? <Skeleton className="h-64 bg-white/10" /> : <EmptyState title={tx('Aucun projet actif.', 'No active projects.', 'Nenhum projeto ativo.')} />}
        </div>
      </section>

      {/* PRÉSENTATION ET CONTACT */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <div className="relative isolate overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-gold-200 via-gold-300 to-gold-500 p-8 shadow-lift sm:p-14 lg:p-16">
            <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full border-[28px] border-white/25" aria-hidden />
            <div className="pointer-events-none absolute -bottom-32 right-24 -z-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-noise opacity-[0.08] mix-blend-multiply" aria-hidden />
            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-4 text-night/70">{tx('Bienvenue', 'Welcome', 'Bem-vindo')}</p>
              <h2 className="font-display text-4xl font-medium leading-[1.05] text-night sm:text-5xl">{tx('Rejoignez la maison numérique des KCCistes.', 'Join the digital home of the KCCists.', 'Junte-se à casa digital dos KCCistas.')}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-night/75 sm:text-lg">{tx('Créez votre compte, rattachez-vous à votre paroisse et à votre section, suivez les formations et restez informé des activités de la communauté.', 'Create your account, link it to your parish and section, follow courses and stay informed about community activities.', 'Crie a sua conta, associe-se à sua paróquia e secção, siga as formações e fique a par das atividades da comunidade.')}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink to="/inscription" size="lg">{t('hero.join')} <ArrowRight className="h-5 w-5" /></ButtonLink>
                <ButtonLink to="/a-propos" variant="outline" size="lg" className="border-night/15 bg-white/50 hover:bg-white">{tx('À propos de l’Église', 'About the Church', 'Sobre a Igreja')}</ButtonLink>
              </div>
            </div>
            <address className="not-italic lg:col-span-5" aria-label={tx('Contact', 'Contact', 'Contacto')}>
              <div className="rounded-3xl bg-night p-7 text-white shadow-lift">
                <p className="eyebrow text-gold">{tx('Contact', 'Contact', 'Contacto')}</p>
                <p className="mt-3 font-display text-2xl">{tx('Écrivez-nous, nous vous répondrons.', 'Write to us, we will answer.', 'Escreva-nos, responderemos.')}</p>
                <ul className="mt-6 space-y-4 text-sm text-white/75">
                  <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{settings.contact.email ? <a className="hover:text-white" href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a> : <span className="italic text-white/45">{t('footer.notConfigured')}</span>}</li>
                  <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{settings.contact.phone ? <a className="hover:text-white" href={`tel:${settings.contact.phone.replace(/\s/g, '')}`}>{settings.contact.phone}</a> : <span className="italic text-white/45">{t('footer.notConfigured')}</span>}</li>
                  <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{settings.contact.address || <span className="italic text-white/45">{t('footer.notConfigured')}</span>}</li>
                </ul>
              </div>
            </address>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
