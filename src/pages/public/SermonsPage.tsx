import { useState } from 'react';
import { BookOpen, CalendarDays, MapPin, Mic } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import * as fr from '@/content/predications';
import * as en from '@/content/predications.en';
import * as pt from '@/content/predications.pt';
import type { Sermon } from '@/content/predications';
import { useI18n } from '@/i18n';

type Filter = Sermon['theme'] | 'all';

/** Prédications et séminaires du Chef Spirituel (voir src/content/predications.ts). */
export default function SermonsPage() {
  const { tx, pick } = useI18n();
  const { seminars, sermonThemes, sermons, sermonsSource } = pick({ fr, en, pt });
  const [filter, setFilter] = useState<Filter>('all');
  const shown = filter === 'all' ? sermons : sermons.filter((s) => s.theme === filter);
  const filters: [Filter, string][] = [['all', tx('Toutes', 'All', 'Todas')], ...(Object.entries(sermonThemes) as [Filter, string][])];

  return (
    <>
      <PageHeader eyebrow={tx('Parole de l’Éternel', 'Word of the Eternal', 'Palavra do Eterno')} title={tx('Prédications et séminaires', 'Sermons and seminars', 'Pregações e seminários')} description={tx('L’enseignement de Son Éminence le Chef Spirituel, tiré des notes de prédications et des rapports de séminaires de l’Église (2003-2015).', 'The teaching of His Eminence the Spiritual Leader, taken from the Church’s sermon notes and seminar reports (2003-2015).', 'O ensino de Sua Eminência o Chefe Espiritual, tirado das notas de pregações e dos relatórios de seminários da Igreja (2003-2015).')} />

      <section className="container-page py-14">
        <div role="tablist" aria-label={tx('Thèmes', 'Themes', 'Temas')} className="mb-8 flex flex-wrap gap-2">
          {filters.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === k ? 'border-night bg-night text-white' : 'border-night/10 bg-white text-ink/70 hover:border-gold'}`}>{label}</button>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {shown.map((s) => (
            <article key={s.id} id={s.id} className="flex scroll-mt-32 flex-col rounded-3xl border border-night/[0.06] bg-white p-6 shadow-soft">
              <div className="flex flex-wrap gap-2">
                <Badge tone="gold">{sermonThemes[s.theme]}</Badge>
                <Badge><BookOpen className="h-3 w-3" aria-hidden />{s.text}</Badge>
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold text-night">{s.title}</h2>
              {(s.date || s.place) && (
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/55">
                  {s.date && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden />{s.date}</span>}
                  {s.place && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{s.place}</span>}
                </p>
              )}
              <p className="my-4 rounded-2xl bg-night px-4 py-3 font-display text-lg italic text-white">{s.keyPoint}</p>
              <div className="prose-kcc">{s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="seminaires" className="scroll-mt-32 bg-white py-14">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Formation', 'Training', 'Formação')} title={tx('Les séminaires du Chef Spirituel', 'The Spiritual Leader’s seminars', 'Os seminários do Chefe Espiritual')} description={tx('Pour former les serviteurs, les mamans et la jeunesse au KCCisme.', 'To train servants, mothers and young people in KCCism.', 'Para formar os servos, as mamãs e a juventude no KCCismo.')} />
          <ol className="relative mx-auto max-w-3xl space-y-6 border-l-2 border-gold/30 pl-6">
            {seminars.map((s) => (
              <li key={s.date} className="relative">
                <span className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full bg-gold ring-4 ring-gold/20" aria-hidden />
                <p className="text-sm font-semibold text-gold-700">{s.date}</p>
                <p className="font-semibold text-night">{s.title}</p>
                <p className="flex items-center gap-1 text-xs text-ink/50"><MapPin className="h-3.5 w-3.5" aria-hidden />{s.place}</p>
                <p className="mt-1 text-sm text-ink/70">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 flex items-center gap-2 text-xs text-ink/50"><Mic className="h-4 w-4" aria-hidden />{tx('Source', 'Source', 'Fonte')} : {sermonsSource}</p>
        </div>
      </section>
    </>
  );
}
