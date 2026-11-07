import { useEffect } from 'react';
import { ChevronDown, FileText, Info, Landmark, Quote, ScrollText, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { ButtonLink } from '@/components/ui/Button';
import { civilChapters, civilTimeline, type HistoryBlock, type HistoryChapter } from '@/content/personnalite-civile';
import { useI18n } from '@/i18n';

const COVER = '/images/histoire/reconnaissance-juridique.jpg';

/**
 * « Le chemin de la reconnaissance juridique » : l'histoire de l'obtention de la
 * personnalité civile de l'Église (1966-1980), avec chronologie, documents
 * d'archives et récit par période (voir src/content/personnalite-civile.ts).
 */
export default function CivilRecognitionPage() {
  const { tx } = useI18n();

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 150);
  }, []);

  const facts: [string, string][] = [
    ['1966', tx('premiers conseils pour demander la personnalité civile', 'first advice to apply for legal status', 'primeiros conselhos para pedir a personalidade civil')],
    ['4', tx('requêtes déposées : 1968, 1972, 1976 et 1979', 'applications filed: 1968, 1972, 1976 and 1979', 'pedidos apresentados: 1968, 1972, 1976 e 1979')],
    ['1972', tx('dissolution de plein droit et début de la clandestinité', 'automatic dissolution and the start of clandestine life', 'dissolução automática e início da clandestinidade')],
    ['30.04.1980', tx('ordonnance n° 128/80 accordant la personnalité civile', 'ordinance no. 128/80 granting legal status', 'decreto n.º 128/80 que concede a personalidade civil')],
  ];

  return (
    <>
      <PageHeader
        eyebrow={tx('Histoire de l’Église', 'Church history', 'História da Igreja')}
        title={tx('Le chemin de la reconnaissance juridique', 'The road to legal recognition', 'O caminho do reconhecimento jurídico')}
        description={tx(
          'De 1966 à 1980 : requêtes, dissolution, arrestations et persévérance, jusqu’à l’ordonnance du 30 avril 1980 qui accorde la personnalité civile à l’Église.',
          'From 1966 to 1980: applications, dissolution, arrests and perseverance, until the ordinance of 30 April 1980 granting the Church legal status (text in French).',
          'De 1966 a 1980: pedidos, dissolução, prisões e perseverança, até ao decreto de 30 de abril de 1980 que concede a personalidade civil à Igreja (texto em francês).',
        )}
        image={COVER}
      />

      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(([n, t]) => (
            <div key={n} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <p className="font-display text-3xl font-semibold text-night">{n}</p>
              <p className="mt-1 text-sm text-ink/65">{t}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm leading-relaxed text-ink/80">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden />
          <p>{tx(
            'Ce récit reprend le document historique de l’Église sur l’obtention de la personnalité civile. À l’époque, l’Église s’appelait Église Universelle de Douze Apôtres (EUDA, EUDAC), puis Communauté de Douze Apôtres au Zaïre (C.D.A.Z.) ; elle est aujourd’hui l’Église Bon Nouveau Message (KCC). Les noms, les titres et les termes de l’époque sont conservés, de même que le texte des documents officiels cités.',
            'This account follows the Church’s historical document on obtaining legal status. At the time, the Church was called Église Universelle de Douze Apôtres (EUDA, EUDAC), then Communauté de Douze Apôtres au Zaïre (C.D.A.Z.); today it is the Église Bon Nouveau Message (KCC). The names, titles and wording of the time are kept, as is the text of the official documents quoted.',
            'Este relato segue o documento histórico da Igreja sobre a obtenção da personalidade civil. Na época, a Igreja chamava-se Église Universelle de Douze Apôtres (EUDA, EUDAC), depois Communauté de Douze Apôtres au Zaïre (C.D.A.Z.); hoje é a Église Bon Nouveau Message (KCC). Os nomes, títulos e termos da época são mantidos, tal como o texto dos documentos oficiais citados.',
          )}</p>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">{tx('Chronologie', 'Timeline', 'Cronologia')}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-night">{tx('Quatorze années de démarches', 'Fourteen years of efforts', 'Catorze anos de diligências')}</h2>
          <ol className="relative mt-8 grid gap-x-10 gap-y-5 border-l-2 border-gold/30 pl-6 md:grid-cols-2 md:border-0 md:pl-0">
            {civilTimeline.map((e) => (
              <li key={e.date} className="relative md:border-l-2 md:border-gold/30 md:pl-6">
                <span className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full bg-gold ring-4 ring-white md:-left-[0.45rem]" aria-hidden />
                <p className="text-sm font-semibold text-gold-700">{e.date}</p>
                <p className="mt-0.5 text-ink/80">{e.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">{tx('Le récit', 'The story', 'O relato')}</p>
            <nav className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1" aria-label={tx('Parties du récit', 'Parts of the story', 'Partes do relato')}>
              {civilChapters.map((c) => (
                <a key={c.id} href={`#${c.id}`} className="group rounded-full border border-night/10 bg-white px-3 py-1 text-sm text-ink/70 hover:border-gold hover:text-night lg:flex lg:gap-3 lg:rounded-xl lg:border-0 lg:bg-transparent lg:px-2 lg:py-2">
                  <span className="hidden font-display font-semibold text-gold-700 lg:inline">{c.n}</span>
                  <span>{c.title}<span className="hidden text-xs text-ink/50 lg:block">{c.period}</span></span>
                </a>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 max-w-3xl">
            {civilChapters.map((c) => <Chapter key={c.id} chapter={c} />)}
            <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-night p-7 text-white">
              <div className="max-w-lg">
                <p className="font-display text-2xl text-gold">{tx('Le 30 avril, jour de mémoire', '30 April, a day of remembrance', '30 de abril, dia de memória')}</p>
                <p className="mt-1 text-sm text-white/70">{tx('La Fête de la Reconnaissance juridique rappelle chaque année ce chemin parcouru.', 'The Feast of Legal Recognition recalls this journey every year.', 'A Festa do Reconhecimento Jurídico recorda todos os anos este caminho.')}</p>
              </div>
              <ButtonLink to="/doctrine" variant="gold">{tx('Les fêtes de l’Église', 'The Church’s feasts', 'As festas da Igreja')}</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Chapter({ chapter: c }: { chapter: HistoryChapter }) {
  return (
    <section id={c.id} className="scroll-mt-28 border-t border-night/10 pt-12 first:border-0 first:pt-0 [&+section]:mt-14">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-5xl font-semibold text-gold/70">{c.n}</span>
        <div>
          <h2 className="font-display text-3xl font-semibold text-night sm:text-4xl">{c.title}</h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-gold-700">{c.period}</p>
        </div>
      </div>
      <div className="mt-6 leading-relaxed text-ink/85 sm:text-[17px]">
        {c.blocks.map((b, i) => <Block key={i} block={b} />)}
      </div>
    </section>
  );
}

type Doc = { title: string; sub: string | null; lines: string[] };
type QuoteData = { text: string; by: string | null };
type Collapse = { title: string; items: string[] };
type Group = { title: string; items: string[] };

function Block({ block }: { block: HistoryBlock }) {
  const { tx } = useI18n();
  const kind = block[0];
  const text = block[1] as string;
  const items = block[1] as string[];
  const doc = block[1] as Doc;
  const quote = block[1] as QuoteData;
  const coll = block[1] as Collapse;
  const groups = block[1] as Group[];
  switch (kind) {
    case 'h2':
      return <h3 className="mt-12 font-display text-2xl font-semibold text-night">{text}</h3>;
    case 'h3':
      return <h4 className="mt-9 text-lg font-semibold text-gold-700">{text}</h4>;
    case 'p':
      return <p className="my-4">{text}</p>;
    case 'note':
      return <p className="my-3 border-l-2 border-gold/40 pl-3 text-sm text-ink/55">{text}</p>;
    case 'list':
      return <ul className="my-4 list-disc space-y-1.5 pl-6 marker:text-gold-700">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
    case 'lines':
      return (
        <div className="my-5 space-y-2 rounded-2xl border-l-4 border-gold/60 bg-mist/60 px-5 py-4">
          {items.map((x, i) => <p key={i} className="flex gap-2"><span className="text-gold-700" aria-hidden>—</span><span>{x}</span></p>)}
        </div>
      );
    case 'quote':
      return (
        <figure className="my-6 rounded-2xl bg-night p-6 text-white">
          <Quote className="h-6 w-6 text-gold" aria-hidden />
          <blockquote className="mt-2 font-display text-2xl italic leading-snug text-gold-200">« {quote.text} »</blockquote>
          {quote.by && <figcaption className="mt-2 text-sm text-white/60">{quote.by}</figcaption>}
        </figure>
      );
    case 'doc':
      return (
        <figure className="my-7 overflow-hidden rounded-2xl border border-[#e6dcc2] bg-[#fbf7ec] shadow-soft">
          <figcaption className="flex items-start gap-3 border-b border-[#e6dcc2] bg-[#f4ecd6] px-5 py-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-700">{tx('Document d’archive', 'Archive document', 'Documento de arquivo')}</p>
              <p className="font-semibold leading-snug text-night">{doc.title}</p>
              {doc.sub && <p className="text-xs text-ink/55">{doc.sub}</p>}
            </div>
          </figcaption>
          <div className="space-y-2 px-5 py-4 font-serif text-[15px] leading-relaxed text-ink/80">
            {doc.lines.map((x, i) => <p key={i}>{x}</p>)}
          </div>
        </figure>
      );
    case 'collapse':
      return (
        <details className="group my-5 rounded-2xl border border-night/10 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-semibold text-night">
            <span className="flex items-center gap-2"><ScrollText className="h-4 w-4 text-gold-700" aria-hidden />{coll.title} ({coll.items.length})</span>
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden />
          </summary>
          <ol className="grid gap-x-6 gap-y-1 border-t border-night/10 px-5 py-4 text-sm text-ink/75 sm:grid-cols-2">
            {coll.items.map((x, i) => <li key={i}><span className="mr-1 text-ink/40">{i + 1}.</span>{x}</li>)}
          </ol>
        </details>
      );
    case 'people':
      return (
        <div className="my-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-night"><Users className="h-4 w-4 text-gold-700" aria-hidden />{tx('Les cadres de l’Église dans l’administration', 'Church members serving in the administration', 'Os quadros da Igreja na administração')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((g) => (
              <div key={g.title} className="rounded-2xl border border-night/[0.06] bg-white p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700"><Landmark className="h-3.5 w-3.5" aria-hidden />{g.title}</p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink/75">{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}
