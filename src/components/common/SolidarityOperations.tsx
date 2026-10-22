import { CalendarCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { CONTRIBUTIONS, SOLIDARITY_OPERATIONS } from '@/content/solidarite';
import { toContribution, toOperation, useSiteContent, type ContributionLine } from '@/features/content/siteContent';

const BASE_CONTRIBUTIONS: ContributionLine[] = Object.entries(CONTRIBUTIONS).flatMap(([operation, list]) => list.map((c) => ({ ...c, operation })));

/**
 * Opérations « 100 chaises » menées par l'initiative JE SUIS KCCiste.
 * Opérations et listes gérées dans l'administration (« Contenu du site ») :
 * noms et montants seulement, jamais les numéros des contributeurs.
 */
export function SolidarityOperations() {
  const { tx, pick } = useI18n();
  const operations = useSiteContent('operations', toOperation, SOLIDARITY_OPERATIONS) ?? [];
  const contributions = useSiteContent('contributions', toContribution, BASE_CONTRIBUTIONS) ?? [];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {operations.map((o) => (
        <article key={o.key || o.parish} className="flex flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-soft">
          <div className={o.photos.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''}>
            {o.photos.map((src) => <img key={src} src={src} alt={tx(`Paroisse de ${o.parish}`, `${o.parish} parish`, `Paróquia de ${o.parish}`)} loading="lazy" className="h-56 w-full object-cover" />)}
          </div>
          <div className="flex flex-1 flex-col p-6">
            <Badge tone={o.done ? 'gold' : 'green'} className="self-start">{o.done ? tx('Terminé', 'Completed', 'Concluído') : tx('En cours', 'Ongoing', 'Em curso')}</Badge>
            <h3 className="mt-3 font-display text-xl font-medium text-night">{pick(o.t)}</h3>
            <p className="mt-1.5 text-sm text-ink/65">{pick(o.d)}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {o.facts.map((f) => <li key={f.fr} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-night">{pick(f)}</li>)}
            </ul>
            <ContributorList list={contributions.filter((c) => c.operation === o.key)} />
            <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-ink/55"><CalendarCheck className="h-4 w-4 text-gold" />{pick(o.date)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Liste publique des contributions d'une opération (nom et montant, jamais de numéro). */
function ContributorList({ list }: { list: ContributionLine[] }) {
  const { tx } = useI18n();
  if (!list.length) return null;
  return (
    <details className="group mt-4 rounded-2xl bg-mist px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-night">{tx('Voir la liste des contributions', 'See the list of contributions', 'Ver a lista das contribuições')} ({list.length})</summary>
      <ol className="mt-3 max-h-80 divide-y divide-night/[0.06] overflow-y-auto text-sm">
        {list.map((c, i) => <li key={i} className="flex justify-between gap-3 py-1.5"><span className="text-ink/80"><span className="mr-2 text-ink/40">{i + 1}.</span>{c.flag && <span className="mr-1.5" aria-hidden>{c.flag}</span>}{c.name}</span><span className="shrink-0 font-semibold text-night">{c.amount}</span></li>)}
      </ol>
    </details>
  );
}
