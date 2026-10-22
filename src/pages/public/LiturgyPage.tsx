import { useState } from 'react';
import { BookOpen, CalendarClock, Info, ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import * as fr from '@/content/liturgie';
import * as en from '@/content/liturgie.en';
import * as pt from '@/content/liturgie.pt';
import type { Rite, RiteText } from '@/content/liturgie';
import { useI18n } from '@/i18n';
import { usePageTexts } from '@/features/content/pageTexts';

const langCode = (l?: string) => (l === 'Lingala' ? 'ln' : l === 'Kikongo' ? 'kg' : l === 'English' ? 'en' : l === 'Português' ? 'pt' : l === 'Français' ? 'fr' : undefined);

/** Les textes d'un rite ; ceux qui existent en plusieurs langues sont présentés en onglets. */
function RiteTexts({ texts }: { texts: RiteText[] }) {
  const { tx } = useI18n();
  const multi = texts.filter((t) => t.tab);
  const [active, setActive] = useState(0);
  const others = texts.filter((t) => !multi.includes(t));
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {multi.length > 1 && (
        <div className="rounded-2xl border border-gold/30 bg-gold-50/40 p-5">
          <div role="tablist" aria-label={tx('Langue du texte', 'Language of the text', 'Língua do texto')} className="flex flex-wrap gap-2">
            {multi.map((t, i) => (
              <button key={t.title} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)}
                className={`rounded-full border px-3 py-1 text-sm transition ${i === active ? 'border-gold bg-gold text-night' : 'border-night/10 bg-white text-ink/70 hover:border-gold/60'}`}>{t.lang}</button>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-700">{multi[active].title}</p>
          <div lang={langCode(multi[active].lang)} className="mt-2 space-y-1 font-display text-lg italic text-night/85">{multi[active].lines.map((l, i) => <p key={i}>{l}</p>)}</div>
          {multi[active].parts?.map((p) => (
            <div key={p.title} lang={langCode(multi[active].lang)} className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-700/80">{p.title}</p>
              <div className="mt-1 space-y-1 font-display text-lg italic text-night/85">{p.lines.map((l, i) => <p key={i}>{l}</p>)}</div>
            </div>
          ))}
        </div>
      )}
      {others.map((t) => (
        <div key={t.title} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">{t.title}</p>
          <div className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-ink/85">{t.lines.map((l, i) => <p key={i}>{l}</p>)}</div>
        </div>
      ))}
    </div>
  );
}

function RiteSection({ rite, index, acclamation }: { rite: Rite; index: number; acclamation: string }) {
  const { tx } = useI18n();
  return (
    <section id={rite.id} className={`scroll-mt-32 py-12 ${index % 2 === 0 ? 'bg-white' : ''}`}>
      <div className="container-page">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-4xl font-semibold text-gold/70">{String(index + 1).padStart(2, '0')}</span>
          {rite.when && <Badge tone="gold"><CalendarClock className="mr-1 inline h-3.5 w-3.5" aria-hidden />{rite.when}</Badge>}
          {rite.bible && <Badge><BookOpen className="mr-1 inline h-3.5 w-3.5" aria-hidden />{rite.bible}</Badge>}
        </div>
        <h2 className="mt-2 font-display text-3xl font-semibold text-night">{rite.title}</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink/75">{rite.summary}</p>

        {rite.programme && (
          <div className={`mt-6 grid gap-4 ${rite.programme.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-4' : rite.programme.length === 2 ? 'sm:grid-cols-2' : ''}`}>
            {rite.programme.map((p, i) => (
              <div key={i} className="rounded-2xl border border-night/[0.06] bg-mist/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">{p.part ?? tx('Déroulement', 'Order of the ceremony', 'Ordem da cerimónia')}</p>
                <ol className={`mt-3 list-decimal space-y-1 pl-5 text-sm text-ink/80 ${!p.part && p.steps.length > 8 ? 'sm:columns-2 sm:gap-8' : ''}`}>{p.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              </div>
            ))}
          </div>
        )}

        {rite.texts && <RiteTexts texts={rite.texts} />}

        {rite.notes && (
          <ul className="mt-6 space-y-2 rounded-2xl bg-night p-5 text-sm text-white/80">
            {rite.notes.map((n) => <li key={n} className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{n}</li>)}
          </ul>
        )}
        {rite.texts && <p className="mt-4 text-sm italic text-gold-700">{acclamation}</p>}
      </div>
    </section>
  );
}

/** Rites et célébrations de l'EBNM (voir src/content/liturgie.ts). */
export default function LiturgyPage() {
  const { tx } = useI18n();
  const { liturgyIntro, rites } = usePageTexts('liturgie', { fr, en, pt });
  return (
    <>
      <PageHeader eyebrow={tx('Liturgie', 'Liturgy', 'Liturgia')} title={tx('Rites et célébrations', 'Rites and celebrations', 'Ritos e celebrações')} description={tx('Le déroulement officiel des cultes et des sacrements de l’Église Bon Nouveau Message, avec leurs prières.', 'The official order of the services and sacraments of the Église Bon Nouveau Message, with their prayers.', 'A ordem oficial dos cultos e sacramentos da Église Bon Nouveau Message, com as suas orações.')}>
        <nav aria-label={tx('Cérémonies', 'Ceremonies', 'Cerimónias')} className="flex flex-wrap gap-2">
          {rites.map((r) => (
            <a key={r.id} href={`#${r.id}`} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/85 transition hover:border-gold/50 hover:text-white">{r.title}</a>
          ))}
        </nav>
      </PageHeader>

      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-5">
          <blockquote className="h-fit rounded-3xl bg-night p-7 font-display text-xl italic leading-relaxed text-white shadow-lift lg:col-span-2">
            <ScrollText className="mb-3 h-6 w-6 text-gold" aria-hidden />« {liturgyIntro.quote} »
          </blockquote>
          <div className="lg:col-span-3">
            <h2 className="font-display text-2xl font-semibold text-night">{liturgyIntro.title}</h2>
            <div className="prose-kcc mt-4">{liturgyIntro.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
            <p className="rounded-2xl border border-gold/30 bg-gold-50/50 px-4 py-3 font-display text-lg italic text-night">{liturgyIntro.acclamation}</p>
          </div>
        </div>
      </section>

      {rites.map((r, i) => <RiteSection key={r.id} rite={r} index={i} acclamation={liturgyIntro.acclamation} />)}

      <p className="container-page pb-12 pt-4 text-xs text-ink/50">{tx('Source', 'Source', 'Fonte')} : {liturgyIntro.source}</p>
    </>
  );
}
