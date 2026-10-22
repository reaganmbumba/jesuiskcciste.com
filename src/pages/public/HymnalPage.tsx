import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { ShareButtons } from '@/components/common/ShareButtons';
import * as hymnBook from '@/content/cantiques';
import type { Hymn } from '@/content/cantiques';
import { usePageTexts } from '@/features/content/pageTexts';
import { useI18n } from '@/i18n';

const LANGS = ['Tous', 'Lingala', 'Kikongo'] as const;
const PAGE = 30;

/** Ancre d'un cantique, ex. #cantique-lingala-12 : sert aux liens partagés. */
const hymnId = (h: Hymn) => `cantique-${h.lang.toLowerCase()}-${h.n}`;

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function HymnCard({ h, open }: { h: Hymn; open?: boolean }) {
  const { tx } = useI18n();
  return (
    <details id={hymnId(h)} open={open} className="group scroll-mt-32 rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft open:shadow-lift">
      <summary className="cursor-pointer list-none marker:hidden">
        <span className="flex items-start justify-between gap-3">
          <span>
            <span className="text-xs font-semibold text-gold-700">{h.lang} {tx('n°', 'no.', 'n.º')} {h.n}</span>
            <span className="mt-0.5 block font-display text-lg font-semibold text-night">{h.title}</span>
          </span>
          <span className="mt-1 text-xl text-gold transition group-open:rotate-45" aria-hidden>+</span>
        </span>
      </summary>
      <div className="mt-4 space-y-1 text-[15px] leading-relaxed text-ink/80">
        {h.lines.map((l, i) => {
          const m = /^(Solo|Tous) : (.*)$/i.exec(l);
          return m
            ? <p key={i}><span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gold-700">{m[1].toLowerCase() === 'solo' ? 'Solo' : tx('Tous', 'All', 'Todos')}</span>{m[2]}</p>
            : <p key={i}>{l}</p>;
        })}
      </div>
      <ShareButtons size="sm" url={`/cantiques#${hymnId(h)}`} title={`${h.title} · ${h.lang} ${tx('n°', 'no.', 'n.º')} ${h.n}`} className="mt-4 border-t border-night/[0.06] pt-4" />
    </details>
  );
}

/** Recueil de cantiques lingala et kikongo, avec recherche (voir src/content/cantiques.ts). */
export default function HymnalPage() {
  const { tx } = useI18n();
  const { hymns } = usePageTexts('cantiques', hymnBook, false);
  const [q, setQ] = useState('');
  const [lang, setLang] = useState<(typeof LANGS)[number]>('Tous');
  const [shown, setShown] = useState(PAGE);
  // Lien partagé vers un cantique : on l'affiche, on l'ouvre et on y descend.
  const [target] = useState(() => (typeof window !== 'undefined' ? decodeURIComponent(window.location.hash.slice(1)) : ''));
  useEffect(() => {
    const i = hymns.findIndex((h) => hymnId(h) === target);
    if (i < 0) return;
    setShown((s) => Math.max(s, Math.ceil((i + 1) / PAGE) * PAGE));
    setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: 'start' }), 60);
  }, [target, hymns]);

  const results = useMemo(() => {
    const needle = fold(q.trim());
    return hymns.filter((h) => (lang === 'Tous' || h.lang === lang)
      && (!needle || fold(h.title).includes(needle) || h.lines.some((l) => fold(l).includes(needle))));
  }, [q, lang, hymns]);

  return (
    <>
      <PageHeader eyebrow={tx('Louange', 'Praise', 'Louvor')} title={tx('Recueil de cantiques', 'Hymn book', 'Hinário')} description={tx(`${hymns.length} cantiques de l’Église Bon Nouveau Message, en lingala et en kikongo. Cherchez par titre ou par parole.`, `${hymns.length} hymns of the Église Bon Nouveau Message, in Lingala and Kikongo. Search by title or lyrics.`, `${hymns.length} hinos da Église Bon Nouveau Message, em lingala e kikongo. Pesquise pelo título ou pela letra.`)} />
      <section className="container-page py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">{tx('Rechercher un cantique', 'Search for a hymn', 'Pesquisar um hino')}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder={tx('Ex. : Yawe, alleluya, KCC…', 'e.g. Yawe, alleluya, KCC…', 'Ex.: Yawe, alleluya, KCC…')}
              className="w-full rounded-full border border-night/10 bg-white py-2.5 pl-10 pr-4 text-sm shadow-soft outline-none focus:border-gold" />
          </label>
          <div className="flex gap-2" role="group" aria-label={tx('Langue', 'Language', 'Idioma')}>
            {LANGS.map((l) => (
              <button key={l} type="button" aria-pressed={l === lang} onClick={() => { setLang(l); setShown(PAGE); }}
                className={`rounded-full border px-3.5 py-2 text-sm transition ${l === lang ? 'border-gold bg-gold text-night' : 'border-night/10 bg-white text-ink/70 hover:border-gold/60'}`}>
                {l === 'Tous' ? tx('Tous', 'All', 'Todos') : l}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm text-ink/60" aria-live="polite">{results.length} {results.length > 1 ? tx('cantiques', 'hymns', 'hinos') : tx('cantique', 'hymn', 'hino')}</p>
        <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
          {results.slice(0, shown).map((h) => <HymnCard key={h.lang + h.n} h={h} open={hymnId(h) === target || undefined} />)}
        </div>
        {shown < results.length && (
          <div className="mt-6 text-center">
            <button type="button" onClick={() => setShown((s) => s + PAGE)} className="rounded-full border border-gold px-5 py-2 text-sm font-semibold text-night hover:bg-gold-50">
              {tx('Afficher plus', 'Show more', 'Mostrar mais')}
            </button>
          </div>
        )}
        <p className="mt-10 flex flex-wrap items-center gap-2 text-xs text-ink/50">
          <Badge>{tx('Source', 'Source', 'Fonte')}</Badge> {tx('Recueils de cantiques lingala et kikongo de l’EBNM (archives Reagan MBUMBA).', 'Lingala and Kikongo hymn books of the EBNM (Reagan MBUMBA archives).', 'Hinários em lingala e kikongo da EBNM (arquivo Reagan MBUMBA).')}
        </p>
      </section>
    </>
  );
}
