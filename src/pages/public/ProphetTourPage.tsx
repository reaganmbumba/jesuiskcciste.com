import { useEffect, useState, type ReactNode } from 'react';
import { BookOpen, CalendarDays, ChevronDown, Clock, MapPin, ScrollText, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { ButtonLink } from '@/components/ui/Button';
import { ShareButtons } from '@/components/common/ShareButtons';
import { prophetTour2012, type TourParish, type TourSermon } from '@/content/tournee-bas-congo-2012';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

const COVER = '/images/predications/tournee-bas-congo-2012.jpg';
const PATH = '/predications/tournee-bas-congo-2012';

/** Tournée du Prophète au Bas-Congo (avril-mai 2012) : prédications par paroisse (voir src/content/tournee-bas-congo-2012.ts). */
export default function ProphetTourPage() {
  const { tx } = useI18n();
  const { intro, conclusion, parishes, totalAttendance } = prophetTour2012;
  const count = parishes.reduce((n, p) => n + p.sermons.length, 0);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 150);
  }, []);

  const stats: [string, string][] = [
    ['15', tx('jours, du 28 avril au 12 mai 2012', 'days, from 28 April to 12 May 2012', 'dias, de 28 de abril a 12 de maio de 2012')],
    [String(parishes.length), tx('localités visitées', 'places visited', 'localidades visitadas')],
    [String(count), tx('prédications, exposés et causeries', 'sermons, talks and discussions', 'pregações, exposições e conversas')],
    [totalAttendance.toLocaleString('fr-FR'), tx('participants comptés', 'participants counted', 'participantes contados')],
  ];

  return (
    <>
      <PageHeader
        eyebrow={tx('Prédications du Prophète', 'The Prophet’s sermons', 'Pregações do Profeta')}
        title={tx('Tournée du Prophète au Bas-Congo', 'The Prophet’s tour of Bas-Congo', 'A digressão do Profeta no Baixo Congo')}
        description={tx(
          'Avril – mai 2012 : pour le 32ᵉ anniversaire de la personnalité civile, le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac visite les paroisses du Bas-Congo. Ses prédications, paroisse par paroisse.',
          'April – May 2012: for the 32nd anniversary of legal recognition, the Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac visits the parishes of Bas-Congo. His sermons, parish by parish (in French).',
          'Abril – maio de 2012: no 32.º aniversário da personalidade civil, o Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac visita as paróquias do Baixo Congo. As suas pregações, paróquia a paróquia (em francês).',
        )}
        image={COVER}
      />

      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([n, t]) => (
            <div key={t} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <p className="font-display text-3xl font-semibold text-night">{n}</p>
              <p className="mt-1 text-sm text-ink/65">{t}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">{tx('Introduction', 'Introduction', 'Introdução')}</p>
            <div className="mt-3 space-y-4 leading-relaxed text-ink/85 sm:text-[17px]">{intro.map((p, i) => <p key={i}>{p}</p>)}</div>
          </div>
          <Itinerary parishes={parishes} />
        </div>
      </section>

      <div className="bg-white">
        {parishes.map((p, i) => <ParishSection key={p.id} parish={p} index={i} />)}
      </div>

      <section className="container-page py-14">
        <div className="mx-auto max-w-3xl rounded-3xl bg-night p-8 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{tx('Conclusion', 'Conclusion', 'Conclusão')}</p>
          <div className="mt-4 space-y-4 leading-relaxed text-white/85">{conclusion.map((p, i) => <p key={i}>{p}</p>)}</div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/predications#ecrites" variant="gold">{tx('Toutes les prédications', 'All sermons', 'Todas as pregações')}</ButtonLink>
            <ButtonLink to="/histoire/reconnaissance-juridique" variant="light">{tx('L’histoire de la reconnaissance juridique', 'The history of legal recognition', 'A história do reconhecimento jurídico')}</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function Itinerary({ parishes }: { parishes: TourParish[] }) {
  const { tx } = useI18n();
  return (
    <aside className="h-fit rounded-3xl border border-night/[0.06] bg-white p-6 shadow-soft">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700"><MapPin className="h-4 w-4" aria-hidden />{tx('L’itinéraire', 'The route', 'O itinerário')}</p>
      <ol className="relative mt-4 space-y-1 border-l-2 border-gold/30 pl-5">
        {parishes.map((p) => {
          const first = p.sermons[0]?.meta.dateLabel ?? '';
          const last = p.sermons[p.sermons.length - 1]?.meta.dateLabel ?? '';
          return (
            <li key={p.id} className="relative">
              <span className="absolute -left-[1.6rem] top-3 h-3 w-3 rounded-full bg-gold ring-4 ring-white" aria-hidden />
              <a href={`#${p.id}`} className="flex items-baseline justify-between gap-3 rounded-xl px-2 py-2 hover:bg-mist">
                <span className="font-semibold text-night">{p.name}</span>
                <span className="text-right text-xs text-ink/55">{first === last ? first : `${first} – ${last}`} · {p.sermons.length}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function ParishSection({ parish: p, index }: { parish: TourParish; index: number }) {
  const { tx } = useI18n();
  return (
    <section id={p.id} className="scroll-mt-28 border-t border-night/[0.06] py-14">
      <div className="container-page">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-5xl font-semibold text-gold/60">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h2 className="font-display text-3xl font-semibold text-night sm:text-4xl">{p.name}</h2>
            <p className="mt-1 text-sm text-ink/60">{p.sermons.length > 1 ? tx(`${p.sermons.length} prédications et exposés`, `${p.sermons.length} sermons and talks`, `${p.sermons.length} pregações e exposições`) : tx('1 prédication', '1 sermon', '1 pregação')}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6">
          {p.sermons.map((s) => <SermonCard key={s.id} sermon={s} />)}
        </div>
      </div>
    </section>
  );
}

function SermonCard({ sermon: s }: { sermon: TourSermon }) {
  const { tx } = useI18n();
  const [open, setOpen] = useState(false);
  const m = s.meta;
  const verses = s.sections.filter((x) => x.kind === 'verses');
  const texts = s.sections.filter((x) => x.kind === 'text');
  const preview = texts[0]?.paras[0] ?? '';

  return (
    <article id={s.id} className="scroll-mt-28 overflow-hidden rounded-3xl border border-night/[0.08] bg-mist/40">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-night/[0.06] bg-white px-6 py-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-gold-700"><CalendarDays className="h-4 w-4" aria-hidden />{m.dateLabel}</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-night">{m.place}</h3>
          {m.occasion && <p className="mt-0.5 text-sm text-ink/65">{m.occasion}</p>}
        </div>
        <dl className="flex flex-wrap gap-2 text-xs">
          {m.text && <Chip icon={<BookOpen className="h-3.5 w-3.5" />} label={tx('Texte', 'Text', 'Texto')} value={m.text} />}
          {m.attendance && <Chip icon={<Users className="h-3.5 w-3.5" />} label={tx('Effectif', 'Attendance', 'Presenças')} value={m.attendance} />}
          {m.time && <Chip icon={<Clock className="h-3.5 w-3.5" />} label={tx('Heure', 'Time', 'Hora')} value={m.time} />}
        </dl>
      </header>

      <div className="px-6 py-6">
        {verses.map((v) => (
          <figure key={v.title} className="mb-6 rounded-2xl border-l-4 border-gold bg-white p-5">
            <figcaption className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold-700"><ScrollText className="h-4 w-4" aria-hidden />{v.title}</figcaption>
            <div className="mt-2 space-y-1.5 font-serif italic leading-relaxed text-ink/80">{v.paras.map((p, i) => <p key={i}>{p}</p>)}</div>
          </figure>
        ))}

        {!open && preview && <p className="leading-relaxed text-ink/80">{preview.length > 320 ? `${preview.slice(0, 320).trimEnd()}…` : preview}</p>}
        {open && texts.map((sec) => (
          <div key={sec.title} className="mt-6 first:mt-0">
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-night">{sec.title}</h4>
            <div className="mt-3 space-y-4 leading-relaxed text-ink/85 sm:text-[17px]">{sec.paras.map((p, i) => <p key={i}>{p}</p>)}</div>
          </div>
        ))}
        {open && s.note && <p className="mt-6 rounded-xl bg-gold/10 p-4 text-sm text-ink/75"><b className="text-night">N.B.</b> {s.note}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {texts.length > 0 && (
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-2 rounded-full border border-night/15 bg-white px-4 py-2 text-sm font-semibold text-night hover:border-gold">
              {open ? tx('Réduire', 'Show less', 'Mostrar menos') : tx('Lire la prédication', 'Read the sermon', 'Ler a pregação')}
              <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} aria-hidden />
            </button>
          )}
          <ShareButtons url={`${PATH}#${s.id}`} title={`${m.place} · ${m.dateLabel}`} text={m.text ? `${tx('Prédication du Prophète', 'Sermon of the Prophet', 'Pregação do Profeta')} · ${m.text}` : undefined} image={COVER} size="sm" showLabel={false} />
        </div>
      </div>
    </article>
  );
}

function Chip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-night/10 bg-mist px-3 py-1">
      <span className="text-gold-700" aria-hidden>{icon}</span>
      <dt className="sr-only">{label}</dt>
      <dd className="font-medium text-ink/75">{value}</dd>
    </div>
  );
}
