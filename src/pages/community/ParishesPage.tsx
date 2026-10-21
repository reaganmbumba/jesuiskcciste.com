import { useMemo, useState } from 'react';
import { Globe2, MapPin, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Input } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/States';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { OFFICIAL_PARISHES, PARISH_COUNTRIES, type OfficialParish, type ParishCountry, type ParishKind } from '@/content/paroisses';

const COUNTRY_ORDER = Object.keys(PARISH_COUNTRIES) as ParishCountry[];
const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Liste officielle des paroisses, classée par pays (et par province en RD Congo). */
export default function ParishesPage() {
  const { tx, locale } = useI18n();
  const [q, setQ] = useState('');
  const [country, setCountry] = useState<ParishCountry | ''>('');
  const [kind, setKind] = useState<ParishKind | ''>('');

  const kindLabel = (k: ParishKind) => ({
    paroisse: tx('Paroisse', 'Parish', 'Paróquia'),
    section: tx('Section autonome', 'Autonomous section', 'Secção autónoma'),
    extension: tx('Extension', 'Extension', 'Extensão'),
    other: '',
  })[k];

  const list = useMemo(() => {
    const needle = normalize(q.trim());
    return OFFICIAL_PARISHES.filter((p) =>
      (!country || p.country === country) && (!kind || p.kind === kind)
      && (!needle || normalize(`${p.name} ${p.region?.[locale] ?? ''} ${PARISH_COUNTRIES[p.country][locale]}`).includes(needle)));
  }, [q, country, kind, locale]);

  const groups = useMemo(() => COUNTRY_ORDER.map((c) => {
    const items = list.filter((p) => p.country === c);
    const regions = new Map<string, OfficialParish[]>();
    for (const p of items) {
      const key = p.region?.[locale] ?? '';
      regions.set(key, [...(regions.get(key) ?? []), p]);
    }
    return { country: c, items, regions: [...regions.entries()] };
  }).filter((g) => g.items.length), [list, locale]);

  const countFor = (c: ParishCountry) => OFFICIAL_PARISHES.filter((p) => p.country === c).length;
  const chip = (active: boolean) => cn('shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition',
    active ? 'bg-night text-white ring-night' : 'bg-white text-ink/75 ring-night/10 hover:ring-night/25');

  return (
    <>
      <PageHeader
        eyebrow={tx('Communauté', 'Community', 'Comunidade')}
        title={tx('Paroisses', 'Parishes', 'Paróquias')}
        description={tx(
          `Les ${OFFICIAL_PARISHES.length} paroisses, sections autonomes et extensions de l’Église Bon Nouveau Message (KCC), dans ${COUNTRY_ORDER.length} pays.`,
          `The ${OFFICIAL_PARISHES.length} parishes, autonomous sections and extensions of the Église Bon Nouveau Message (KCC), in ${COUNTRY_ORDER.length} countries.`,
          `As ${OFFICIAL_PARISHES.length} paróquias, secções autónomas e extensões da Église Bon Nouveau Message (KCC), em ${COUNTRY_ORDER.length} países.`,
        )}
      />
      <section className="container-page py-10">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <Input className="pl-10" placeholder={tx('Nom, ville ou pays…', 'Name, city or country…', 'Nome, cidade ou país…')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={tx('Rechercher une paroisse', 'Search for a parish', 'Pesquisar uma paróquia')} />
        </div>
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label={tx('Pays', 'Country', 'País')}>
          <button type="button" className={chip(!country)} onClick={() => setCountry('')}>{tx('Tous les pays', 'All countries', 'Todos os países')} <span className="opacity-60">{OFFICIAL_PARISHES.length}</span></button>
          {COUNTRY_ORDER.map((c) => (
            <button key={c} type="button" className={chip(country === c)} onClick={() => setCountry(country === c ? '' : c)} aria-pressed={country === c}>
              {PARISH_COUNTRIES[c][locale]} <span className="opacity-60">{countFor(c)}</span>
            </button>
          ))}
        </div>
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label={tx('Type', 'Type', 'Tipo')}>
          {(['', 'paroisse', 'section', 'extension'] as const).map((k) => (
            <button key={k || 'all'} type="button" className={cn(chip(kind === k), 'px-3 py-1 text-xs')} onClick={() => setKind(k)} aria-pressed={kind === k}>
              {k ? kindLabel(k) : tx('Tous les types', 'All types', 'Todos os tipos')}
            </button>
          ))}
        </div>

        {groups.length ? (
          <div className="space-y-12">
            {groups.map((g) => (
              <section key={g.country} aria-labelledby={`pays-${g.country}`}>
                <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-night/10 pb-2">
                  <h2 id={`pays-${g.country}`} className="flex items-center gap-2 font-display text-2xl font-semibold text-night"><Globe2 className="h-5 w-5 text-gold-600" />{PARISH_COUNTRIES[g.country][locale]}</h2>
                  <span className="text-sm text-ink/55">{g.items.length}</span>
                </div>
                <div className="space-y-6">
                  {g.regions.map(([region, items]) => (
                    <div key={region || 'all'}>
                      {region && <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-ink/60"><MapPin className="h-4 w-4" />{region} <span className="font-normal normal-case text-ink/45">· {items.length}</span></h3>}
                      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((p) => (
                          <li key={p.n} className="flex items-center gap-3 rounded-xl border border-night/[0.06] bg-white px-4 py-3 shadow-soft">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-night text-xs font-semibold text-gold" title={tx('Numéro dans la liste officielle', 'Number in the official list', 'Número na lista oficial')}>{p.n}</span>
                            <p className="min-w-0 font-medium leading-snug text-night">{p.name}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : <EmptyState title={tx('Aucune paroisse ne correspond.', 'No matching parish.', 'Nenhuma paróquia corresponde.')} />}
      </section>
    </>
  );
}
