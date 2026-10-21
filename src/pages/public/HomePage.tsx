import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Building2, CalendarDays, ChevronLeft, ChevronRight, Clock, FileText, GraduationCap, HandHeart, Images, Mail, MapPin, MessageCircle, Mic, Music2, Phone, PlayCircle, ScrollText, Sparkles, Users } from 'lucide-react';
import { KccIcon } from '@/components/common/KccIcon';
import { useI18n, type Tri } from '@/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAsync } from '@/hooks/useAsync';
import { listPublishedAnnouncements, listUpcomingEvents, parishesRepo } from '@/services';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { YouTubeIcon, YouTubeSubscribeButton } from '@/components/common/YouTubeChannel';
import { YOUTUBE_VIDEOS, youtubeWatchUrl } from '@/config/youtube';
import { ShareButtons } from '@/components/common/ShareButtons';
import * as fr from '@/content/doctrine';
import * as en from '@/content/doctrine.en';
import * as pt from '@/content/doctrine.pt';
import type { Announcement } from '@/types';
import { formatDate, formatTime } from '@/utils/format';
import { cn } from '@/utils/format';

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

/** Diapositives de la bannière d'accueil (photos de la communauté, sans symbole religieux). */
const SLIDES: { img: string; title: Tri; accent: Tri; text: Tri; cta: Tri; to: string }[] = [
  { img: '/images/hero-communaute.jpg', title: T('Un seul peuple.', 'One people.', 'Um só povo.'), accent: T('Une même communauté.', 'One community.', 'Uma mesma comunidade.'), text: T('Se connecter, apprendre, servir et faire vivre notre communauté partout dans le monde.', 'Connect, learn, serve and bring our community to life all over the world.', 'Ligar-se, aprender, servir e fazer viver a nossa comunidade em todo o mundo.'), cta: T('Rejoindre la communauté', 'Join the community', 'Juntar-se à comunidade'), to: '/inscription' },
  { img: '/images/archives/temple-construction.jpg', title: T('Bâtir ensemble,', 'Building together,', 'Construir juntos,'), accent: T('de génération en génération.', 'from generation to generation.', 'de geração em geração.'), text: T('Nos paroisses, nos sections et nos projets, en RD Congo et dans la diaspora.', 'Our parishes, sections and projects, in the DR Congo and across the diaspora.', 'As nossas paróquias, secções e projetos, na RD Congo e na diáspora.'), cta: T('Découvrir les paroisses', 'Discover the parishes', 'Descobrir as paróquias'), to: '/paroisses' },
  { img: '/images/archives/archive-assemblee-noir-et-blanc.jpg', title: T('Notre histoire,', 'Our history,', 'A nossa história,'), accent: T('notre héritage.', 'our heritage.', 'a nossa herança.'), text: T('Archives, doctrine et grandes dates de l’Église Bon Nouveau Message.', 'Archives, doctrine and key dates of the Église Bon Nouveau Message.', 'Arquivos, doutrina e grandes datas da Église Bon Nouveau Message.'), cta: T('Lire notre histoire', 'Read our history', 'Ler a nossa história'), to: '/doctrine' },
];

const QUICK: { title: Tri; text: Tri; to: string; icon: typeof Users; from: string; to2: string }[] = [
  { title: T('Nos paroisses', 'Our parishes', 'As paróquias'), text: T('Trouver une paroisse près de chez vous', 'Find a parish near you', 'Encontrar uma paróquia perto de si'), to: '/paroisses', icon: Building2, from: '#3B82F6', to2: '#1E3A8A' },
  { title: T('Agenda', 'Calendar', 'Agenda'), text: T('Cultes, réunions et rendez-vous', 'Services, meetings and events', 'Cultos, reuniões e encontros'), to: '/agenda', icon: CalendarDays, from: '#6366F1', to2: '#312E81' },
  { title: T('Communauté', 'Community', 'Comunidade'), text: T('Membres, sections, jeunesse', 'Members, sections, youth', 'Membros, secções, juventude'), to: '/communaute', icon: Users, from: '#10B981', to2: '#065F46' },
  { title: T('Enseignements', 'Teachings', 'Ensinamentos'), text: T('Doctrine, histoire et catéchisme', 'Doctrine, history and catechism', 'Doutrina, história e catecismo'), to: '/doctrine', icon: BookOpen, from: '#8B5CF6', to2: '#4C1D95' },
  { title: T('Formations', 'Courses', 'Formações'), text: T('L’Académie KCC à votre rythme', 'The KCC Academy at your pace', 'A Academia KCC ao seu ritmo'), to: '/academie', icon: GraduationCap, from: '#F2C063', to2: '#B07A1E' },
  { title: T('Solidarité', 'Solidarity', 'Solidariedade'), text: T('Projets et entraide', 'Projects and mutual aid', 'Projetos e entreajuda'), to: '/solidarite', icon: HandHeart, from: '#FB923C', to2: '#C2410C' },
  { title: T('Musique', 'Music', 'Música'), text: T('Cantiques, chorales et albums', 'Hymns, choirs and albums', 'Hinos, coros e álbuns'), to: '/musique', icon: Music2, from: '#EC4899', to2: '#9D174D' },
  { title: T('Vidéos', 'Videos', 'Vídeos'), text: T('Notre chaîne YouTube', 'Our YouTube channel', 'O nosso canal YouTube'), to: '/videos', icon: PlayCircle, from: '#EF4444', to2: '#7F1D1D' },
  { title: T('Documents', 'Documents', 'Documentos'), text: T('Bibliothèque et publications', 'Library and publications', 'Biblioteca e publicações'), to: '/bibliotheque', icon: FileText, from: '#14B8A6', to2: '#115E59' },
];

/** Rubriques « La Foi » mises en avant sur l'accueil (icônes neutres, sans symbole religieux). */
const FAITH: { title: Tri; text: Tri; to: string; icon: typeof Users }[] = [
  { title: T('Catéchisme', 'Catechism', 'Catecismo'), text: T('Les bases de notre foi, question par question', 'The basics of our faith, question by question', 'As bases da nossa fé, pergunta a pergunta'), to: '/catechisme', icon: BookOpen },
  { title: T('Liturgie et rites', 'Liturgy and rites', 'Liturgia e ritos'), text: T('Le déroulement des cultes et des cérémonies', 'How services and ceremonies unfold', 'O desenrolar dos cultos e cerimónias'), to: '/liturgie', icon: ScrollText },
  { title: T('L’appel du Prophète', 'The Prophet’s calling', 'O chamado do Profeta'), text: T('Les origines du Bon Nouveau Message', 'The origins of the Bon Nouveau Message', 'As origens do Bon Nouveau Message'), to: '/appel-du-prophete', icon: Sparkles },
  { title: T('Prédications', 'Sermons', 'Pregações'), text: T('Enseignements et messages à réécouter', 'Teachings and messages to revisit', 'Ensinamentos e mensagens para rever'), to: '/predications', icon: Mic },
  { title: T('Cantiques', 'Hymns', 'Hinos'), text: T('Les chants de l’assemblée, en plusieurs langues', 'The assembly’s songs, in several languages', 'Os cânticos da assembleia, em várias línguas'), to: '/cantiques', icon: Music2 },
  { title: T('Galerie', 'Gallery', 'Galeria'), text: T('Photos d’hier et d’aujourd’hui', 'Photos from yesterday and today', 'Fotos de ontem e de hoje'), to: '/galerie', icon: Images },
];

const TILES: { img: string; title: Tri; text: Tri; to: string }[] = [
  { img: '/images/accueil/formation.svg', title: T('Formation', 'Learning', 'Formação'), text: T('L’Académie KCC pour tous les âges', 'The KCC Academy for all ages', 'A Academia KCC para todas as idades'), to: '/academie' },
  { img: '/images/accueil/jeunesse.jpg', title: T('Jeunesse et familles', 'Youth and families', 'Juventude e famílias'), text: T('Grandir ensemble dans la communauté', 'Growing together in the community', 'Crescer juntos na comunidade'), to: '/communaute' },
  { img: '/images/accueil/musique.svg', title: T('Musique et chorales', 'Music and choirs', 'Música e coros'), text: T('Écouter et soutenir nos artistes', 'Listen to and support our artists', 'Ouvir e apoiar os nossos artistas'), to: '/musique' },
  { img: '/images/accueil/solidarite.jpg', title: T('Action sociale', 'Social action', 'Ação social'), text: T('Une communauté solidaire, au service de tous', 'A caring community, serving everyone', 'Uma comunidade solidária, ao serviço de todos'), to: '/solidarite' },
];

const GALLERY = [
  '/images/archives/temple-kcc-assemblee.jpg',
  '/images/accueil/jeunesse.jpg',
  '/images/archives/temple-construction.jpg',
  '/images/archives/centre-hospitalier-christ-sante-lemba.jpg',
];

/** Parole du jour : une des dix Paroles de l'Alliance, qui change chaque jour. */
function useWordOfDay() {
  const { locale } = useI18n();
  const src = { fr, en, pt }[locale] ?? fr;
  const list = src.lawTexts[0];
  const items = list.versions[0].items;
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000);
  const i = day % items.length;
  return { text: items[i], ref: `${list.title}, ${i + 1}` };
}

function HeroSlider() {
  const { tx, pick } = useI18n();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % SLIDES.length), 7000);
    return () => window.clearInterval(id);
  }, [paused]);
  return (
    <section className="relative isolate overflow-hidden bg-night-950 text-white" aria-roledescription="carousel" aria-label={tx('À la une', 'Featured', 'Em destaque')} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {SLIDES.map((s, k) => (
        <img key={s.img} src={s.img} alt="" aria-hidden className={cn('absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-1000', k === i ? 'opacity-100' : 'opacity-0')} fetchPriority={k === 0 ? 'high' : 'low'} />
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night-950/95 via-night-900/75 to-night-900/10" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" aria-hidden />
      <div className="container-page flex min-h-[14rem] items-center pb-11 pt-5 sm:min-h-[15rem] lg:min-h-[16rem] lg:pr-[22rem]">
        <div className="max-w-2xl" aria-live="polite">
          <div key={i} className="animate-fade-up">
          <h1 className="font-display text-[1.75rem] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[2.3rem] lg:text-[2.6rem]">
            {pick(SLIDES[i].title)}<br /><span className="italic text-gold-gradient">{pick(SLIDES[i].accent)}</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{pick(SLIDES[i].text)}</p>
          <ButtonLink to={SLIDES[i].to} variant="gold" size="sm" className="mt-4">{pick(SLIDES[i].cta)} <ArrowRight className="h-5 w-5" /></ButtonLink>
          </div>
          <div className="mt-4 flex gap-2.5">
            {SLIDES.map((_, k) => (
              <button key={k} type="button" onClick={() => go(k)} className={cn('h-3 rounded-full transition-all', k === i ? 'w-8 bg-gold' : 'w-3 bg-white/60 hover:bg-white')} aria-label={`${tx('Diapositive', 'Slide', 'Diapositivo')} ${k + 1}`} aria-current={k === i} />
            ))}
          </div>
        </div>
      </div>
      <button type="button" onClick={() => go(i - 1)} className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-night shadow-lift transition hover:bg-white sm:grid" aria-label={tx('Diapositive précédente', 'Previous slide', 'Diapositivo anterior')}><ChevronLeft className="h-5 w-5" /></button>
      <button type="button" onClick={() => go(i + 1)} className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-night shadow-lift transition hover:bg-white sm:grid lg:top-[38%]" aria-label={tx('Diapositive suivante', 'Next slide', 'Diapositivo seguinte')}><ChevronRight className="h-5 w-5" /></button>
    </section>
  );
}

function NewsCard({ a, fallback }: { a: Announcement; fallback: string }) {
  const { tx, locale } = useI18n();
  return (
    <Link to={`/actualites/${a.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-night/[0.06] bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <img src={a.imageUrl || fallback} alt="" loading="lazy" className="h-40 w-full object-cover" />
      <div className="flex flex-1 flex-col p-4">
        <span className="w-fit rounded-md bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{a.category}</span>
        <time dateTime={a.publishedAt} className="mt-2 text-xs text-ink/50">{formatDate(a.publishedAt, locale)}</time>
        <h3 className="mt-1 line-clamp-3 font-display text-lg font-medium leading-snug text-night group-hover:text-gold-700">{a.title}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-ink/60">{a.summary}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-gold-600">{tx('Lire la suite', 'Read more', 'Ler mais')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

function SideTitle({ title, to, link, external }: { title: string; to: string; link: string; external?: boolean }) {
  const cls = 'inline-flex items-center gap-1 text-xs font-semibold text-night-500 hover:text-gold-700';
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-2xl font-medium text-night">{title}</h2>
      {external ? <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>{link} <ArrowRight className="h-3.5 w-3.5" /></a> : <Link to={to} className={cls}>{link} <ArrowRight className="h-3.5 w-3.5" /></Link>}
    </div>
  );
}

export default function HomePage() {
  const { tx, pick, locale } = useI18n();
  const { profile } = useAuth();
  const signedIn = !!profile;
  const word = useWordOfDay();
  const { contact } = useSiteSettings().settings;

  const anns = useAsync(() => listPublishedAnnouncements({ signedIn, limit: 3 }), [signedIn]);
  const events = useAsync(() => Promise.all([listUpcomingEvents({ signedIn, limit: 6 }), parishesRepo.all()]), [signedIn]);
  const upcoming = events.data?.[0] ?? [];
  const parishName = (id: string | null | undefined) => events.data?.[1].find((p) => p.id === id)?.name;

  return (
    <>
      <HeroSlider />

      <div className="container-page relative">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* COLONNE PRINCIPALE */}
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            {/* ACCÈS RAPIDES */}
            <nav aria-label={tx('Accès rapides', 'Quick access', 'Acesso rápido')} className="relative z-10 -mt-10 grid grid-cols-3 overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-lift">
              {QUICK.map(({ title, text, to, icon, from, to2 }, k) => (
                <Link key={to} to={to} className={cn('group flex flex-col items-center gap-2 border-night/[0.06] px-2 py-4 text-center transition hover:bg-gold-50 focus-visible:bg-gold-50 focus-visible:outline-none sm:flex-row sm:gap-3.5 sm:px-4 sm:text-left', k % 3 !== 2 && 'border-r', k < 6 && 'border-b')}>
                  <KccIcon icon={icon} from={from} to={to2} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold leading-tight text-night sm:text-[15px] group-hover:text-gold-700">{pick(title)}</span>
                    <span className="mt-0.5 hidden text-xs leading-snug text-ink/55 sm:block">{pick(text)}</span>
                  </span>
                </Link>
              ))}
            </nav>

            {/* ACTUALITÉS + PAROLE DU JOUR */}
            <section className="mt-12 grid gap-6 xl:grid-cols-12" aria-labelledby="news-title">
              <div className="xl:col-span-8">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <h2 id="news-title" className="font-display text-3xl font-medium text-night">{tx('Actualités', 'News', 'Notícias')}</h2>
                  <Link to="/actualites" className="inline-flex items-center gap-1 text-sm font-semibold text-night-500 hover:text-gold-700">{tx('Toutes les actualités', 'All news', 'Todas as notícias')} <ArrowRight className="h-4 w-4" /></Link>
                </div>
                {anns.error ? <ErrorState error={anns.error} onRetry={anns.reload} /> : anns.loading ? (
                  <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((k) => <Skeleton key={k} className="h-80" />)}</div>
                ) : anns.data?.length ? (
                  <div className="grid gap-4 md:grid-cols-3">{anns.data.map((a, k) => <NewsCard key={a.id} a={a} fallback={GALLERY[k % GALLERY.length]} />)}</div>
                ) : <EmptyState title={tx('Aucune annonce publiée pour le moment.', 'No announcements yet.', 'Ainda não há anúncios publicados.')} />}
              </div>
              <aside className="flex flex-col overflow-hidden rounded-3xl border border-gold/25 bg-gold-50 shadow-soft xl:col-span-4" aria-labelledby="word-title">
                <div className="px-6 pb-3 pt-5">
                  <h2 id="word-title" className="font-display text-2xl font-medium text-night">{tx('Parole du jour', 'Word of the day', 'Palavra do dia')}</h2>
                  <p className="text-xs capitalize text-ink/55">{formatDate(new Date().toISOString(), locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <img src="/images/accueil/parole.svg" alt="" className="aspect-[16/9] w-full object-cover" />
                <div className="flex flex-1 flex-col items-center px-6 py-5 text-center">
                  <p className="font-display text-lg italic leading-snug text-night">« {word.text} »</p>
                  <p className="mt-2 text-xs text-ink/60">{word.ref}</p>
                  <ButtonLink to="/doctrine#loi" variant="gold" size="sm" className="mt-5">{tx('Lire et méditer', 'Read and reflect', 'Ler e meditar')} <ArrowRight className="h-4 w-4" /></ButtonLink>
                </div>
              </aside>
            </section>

            {/* LA FOI */}
            <section className="mt-12" aria-labelledby="faith-title">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{tx('Découvrir', 'Discover', 'Descobrir')}</p>
                  <h2 id="faith-title" className="font-display text-3xl font-medium text-night">{tx('La Foi', 'Our Faith', 'A Fé')}</h2>
                </div>
                <Link to="/doctrine" className="inline-flex items-center gap-1 text-sm font-semibold text-night-500 hover:text-gold-700">{tx('Doctrine et histoire', 'Doctrine and history', 'Doutrina e história')} <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {FAITH.map(({ title, text, to, icon: Icon }) => (
                  <Link key={to} to={to} className="group flex items-start gap-4 rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-night text-gold transition group-hover:bg-gold group-hover:text-night"><Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden /></span>
                    <span className="min-w-0">
                      <span className="block font-display text-lg font-medium leading-tight text-night group-hover:text-gold-700">{pick(title)}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink/60">{pick(text)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* HISTOIRE + MUSIQUE */}
            <section className="mt-12 grid gap-4 md:grid-cols-2" aria-label={tx('À la découverte', 'Explore', 'Explorar')}>
              <Link to="/doctrine#archives" className="group relative isolate flex min-h-[17rem] flex-col justify-end overflow-hidden rounded-3xl bg-night p-6 text-white shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <img src="/images/archives/archive-assemblee-noir-et-blanc.jpg" alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-night-950/95 via-night-950/50 to-night-950/10" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{tx('Archives', 'Archives', 'Arquivos')}</span>
                <span className="mt-1 font-display text-2xl font-medium leading-tight">{tx('Notre histoire en images', 'Our history in pictures', 'A nossa história em imagens')}</span>
                <span className="mt-1 text-sm text-white/75">{tx('Les grandes dates, les assemblées et les bâtisseurs de la communauté.', 'Key dates, assemblies and the builders of the community.', 'As grandes datas, as assembleias e os construtores da comunidade.')}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">{tx('Voir les archives', 'See the archives', 'Ver os arquivos')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
              <div className="relative isolate flex min-h-[17rem] flex-col justify-between overflow-hidden rounded-3xl bg-night p-6 text-white shadow-lift">
                <img src="/images/accueil/musique.svg" alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60" loading="lazy" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-br from-night-950/90 via-night-900/70 to-night-900/30" aria-hidden />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">KCC Music</span>
                  <h3 className="mt-1 font-display text-2xl font-medium leading-tight">{tx('Chorales, cantiques et albums', 'Choirs, hymns and albums', 'Coros, hinos e álbuns')}</h3>
                  <p className="mt-1 text-sm text-white/75">{tx('Écoutez les chorales de la communauté et soutenez nos artistes.', 'Listen to the community’s choirs and support our artists.', 'Ouça os coros da comunidade e apoie os nossos artistas.')}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <ButtonLink to="/musique" variant="gold" size="sm">{tx('Écouter', 'Listen', 'Ouvir')} <ArrowRight className="h-4 w-4" /></ButtonLink>
                  <Link to="/cantiques" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-gold hover:text-gold">{tx('Recueil de cantiques', 'Hymn book', 'Hinário')}</Link>
                </div>
              </div>
            </section>

            {/* ACADÉMIE */}
            <section className="mt-12 flex flex-col gap-5 rounded-3xl border border-gold/25 bg-gold-50 p-6 shadow-soft sm:flex-row sm:items-center" aria-labelledby="academy-title">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-night text-gold"><GraduationCap className="h-8 w-8" strokeWidth={1.6} aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <h2 id="academy-title" className="font-display text-2xl font-medium text-night">{tx('Académie KCC', 'KCC Academy', 'Academia KCC')}</h2>
                <p className="mt-1 text-sm text-ink/65">{tx('Des formations sur la doctrine, l’histoire et la vie de la communauté, à suivre à votre rythme.', 'Courses on doctrine, history and community life, at your own pace.', 'Formações sobre a doutrina, a história e a vida da comunidade, ao seu ritmo.')}</p>
              </div>
              <ButtonLink to="/academie" variant="primary" size="sm" className="shrink-0">{tx('Voir les formations', 'See the courses', 'Ver as formações')} <ArrowRight className="h-4 w-4" /></ButtonLink>
            </section>
          </div>

          {/* COLONNE LATÉRALE */}
          <aside className="space-y-8 lg:col-span-4 lg:-mt-20 xl:col-span-3" aria-label={tx('Informations', 'Information', 'Informações')}>
            <figure className="relative z-10 rounded-3xl border border-night/[0.06] bg-white p-5 shadow-lift">
              <div className="flex items-center gap-4">
                <img src="/images/logo-kcc.svg" alt="" className="h-16 w-16 shrink-0" />
                <blockquote className="font-display text-lg italic leading-snug text-night">« {tx('Un seul peuple. Une même communauté.', 'One people. One community.', 'Um só povo. Uma mesma comunidade.')} »</blockquote>
              </div>
              <figcaption className="mt-3 border-t border-night/[0.06] pt-3 text-sm text-ink/60">{tx('Se connecter, apprendre, servir et grandir ensemble, partout dans le monde.', 'Connect, learn, serve and grow together, all over the world.', 'Ligar-se, aprender, servir e crescer juntos, em todo o mundo.')} <span className="font-semibold text-gold-700">— JE SUIS KCCiste</span></figcaption>
            </figure>

            <section aria-labelledby="sched-title">
              <SideTitle title={tx('Rendez-vous', 'Upcoming', 'Encontros')} to="/agenda" link={tx('Tout l’agenda', 'Full calendar', 'Agenda completa')} />
              <h2 id="sched-title" className="sr-only">{tx('Prochains rendez-vous', 'Upcoming events', 'Próximos encontros')}</h2>
              {events.loading ? <Skeleton className="h-64" /> : upcoming.length ? (
                <ul className="space-y-2.5">
                  {upcoming.slice(0, 4).map((e) => (
                    <li key={e.id}>
                      <Link to={`/agenda/${e.id}`} className="group flex items-center gap-3 rounded-2xl border border-night/[0.06] bg-white p-2.5 shadow-soft transition hover:border-gold/40">
                        <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-night py-2 text-white">
                          <span className="text-[10px] font-semibold uppercase text-gold">{formatDate(e.startsAt, locale, { month: 'short' }, e.timezone)}</span>
                          <span className="font-display text-xl leading-none">{formatDate(e.startsAt, locale, { day: '2-digit' }, e.timezone)}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-night group-hover:text-gold-700">{e.title}</span>
                          <span className="flex items-center gap-1 text-xs text-ink/55"><Clock className="h-3 w-3" aria-hidden />{formatTime(e.startsAt, locale, e.timezone)} · <span className="truncate">{parishName(e.parishId) ?? e.location}</span></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <EmptyState title={tx('Aucun événement à venir.', 'No upcoming events.', 'Nenhum evento previsto.')} />}
            </section>

            <section aria-labelledby="vid-title">
              <SideTitle title={tx('Vidéos', 'Videos', 'Vídeos')} to="/videos" link={tx('Toutes les vidéos', 'All videos', 'Todos os vídeos')} />
              <h2 id="vid-title" className="sr-only">{tx('Vidéos', 'Videos', 'Vídeos')}</h2>
              <ul className="grid grid-cols-3 gap-2">
                {YOUTUBE_VIDEOS.slice(0, 3).map((v) => (
                  <li key={v.id}>
                    <a href={youtubeWatchUrl(v.id)} target="_blank" rel="noopener noreferrer" className="group block">
                      <span className="relative block aspect-video overflow-hidden rounded-xl bg-night">
                        <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                        <span className="absolute inset-0 grid place-items-center"><YouTubeIcon className="h-5 w-7 drop-shadow" /></span>
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[11px] font-medium leading-tight text-night">{pick(v.title)}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <YouTubeSubscribeButton size="sm" className="mt-3 w-full" />
            </section>

            <section aria-labelledby="gal-title">
              <SideTitle title={tx('Galerie photos', 'Photo gallery', 'Galeria de fotos')} to="/galerie" link={tx('Voir la galerie', 'See the gallery', 'Ver a galeria')} />
              <h2 id="gal-title" className="sr-only">{tx('Galerie photos', 'Photo gallery', 'Galeria de fotos')}</h2>
              <div className="grid grid-cols-4 gap-2 lg:grid-cols-2">
                {GALLERY.map((src) => (
                  <Link key={src} to="/galerie" className="block overflow-hidden rounded-xl">
                    <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover transition duration-500 hover:scale-105" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-night p-6 text-white shadow-lift" aria-labelledby="contact-title">
              <h2 id="contact-title" className="font-display text-2xl font-medium">{tx('Nous contacter', 'Contact us', 'Contacte-nos')}</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{contact.address}</li>
                <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /><a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-white">{contact.phone}</a></li>
                <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /><a href={`mailto:${contact.email}`} className="break-all hover:text-white">{contact.email}</a></li>
              </ul>
              <a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-gold-300"><MessageCircle className="h-4 w-4" aria-hidden />{tx('Écrire sur WhatsApp', 'Message us on WhatsApp', 'Escrever no WhatsApp')}</a>
            </section>

            <section className="rounded-3xl border border-gold/25 bg-gold-50 p-6 shadow-soft" aria-labelledby="share-title">
              <h2 id="share-title" className="font-display text-2xl font-medium text-night">{tx('Partager le site', 'Share the website', 'Partilhar o site')}</h2>
              <p className="mt-2 text-sm text-ink/70">{tx('Faites connaître JE SUIS KCCiste autour de vous, sur Facebook, WhatsApp et Instagram.', 'Tell others about JE SUIS KCCiste on Facebook, WhatsApp and Instagram.', 'Dê a conhecer o JE SUIS KCCiste à sua volta, no Facebook, WhatsApp e Instagram.')}</p>
              <ShareButtons url="/" title={tx('JE SUIS KCCiste — La communauté KCCiste', 'JE SUIS KCCiste — The KCCiste community', 'JE SUIS KCCiste — A comunidade KCCiste')} text={tx('Un seul peuple. Une même communauté.', 'One people. One community.', 'Um só povo. Uma mesma comunidade.')} showLabel={false} className="mt-4" />
            </section>
          </aside>
        </div>
      </div>

      {/* GRANDS ÉVÉNEMENTS */}
      <section className="relative isolate mt-14 overflow-hidden py-10 text-white" aria-labelledby="big-title">
        <img src="/images/hero-communaute.jpg" alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night-950/95 via-night-900/85 to-night-800/70" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-grid opacity-40" aria-hidden />
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="big-title" className="font-display text-3xl font-medium sm:text-4xl">{tx('Grands événements à venir', 'Major upcoming events', 'Grandes eventos a seguir')}</h2>
              <p className="mt-1 text-white/70">{tx('Participez aux rendez-vous importants de notre communauté.', 'Take part in the key events of our community.', 'Participe nos encontros importantes da nossa comunidade.')}</p>
            </div>
            <ButtonLink to="/agenda" variant="gold" size="sm">{tx('Voir l’agenda complet', 'See the full calendar', 'Ver a agenda completa')} <ArrowRight className="h-4 w-4" /></ButtonLink>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {events.loading ? [0, 1, 2].map((k) => <Skeleton key={k} className="h-24 bg-white/10" />) : upcoming.slice(0, 3).map((e) => (
              <Link key={e.id} to={`/agenda/${e.id}`} className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-night shadow-lift transition hover:-translate-y-0.5">
                <span className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 py-2.5 text-night">
                  <span className="font-display text-3xl font-medium leading-none">{formatDate(e.startsAt, locale, { day: '2-digit' }, e.timezone)}</span>
                  <span className="text-[11px] font-bold uppercase">{formatDate(e.startsAt, locale, { month: 'short' }, e.timezone)}</span>
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-medium leading-snug group-hover:text-gold-700">{e.title}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-ink/55"><MapPin className="h-3 w-3" aria-hidden />{formatTime(e.startsAt, locale, e.timezone)} · {parishName(e.parishId) ?? e.location}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TUILES */}
      <section className="container-page py-10" aria-label={tx('Nos activités', 'Our activities', 'As nossas atividades')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile) => (
            <Link key={tile.to} to={tile.to} className="group relative isolate flex h-48 items-end overflow-hidden rounded-3xl bg-night p-5 text-white shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              <img src={tile.img} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-night-950/90 via-night-950/40 to-transparent" aria-hidden />
              <span className="flex w-full items-end justify-between gap-3">
                <span>
                  <span className="block font-display text-xl font-medium">{pick(tile.title)}</span>
                  <span className="block text-sm text-white/75">{pick(tile.text)}</span>
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-night transition group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

    </>
  );
}
