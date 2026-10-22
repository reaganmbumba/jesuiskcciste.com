import { CalendarCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { CONTRIBUTIONS } from '@/content/solidarite';

/**
 * Opérations « 100 chaises » menées par l'initiative JE SUIS KCCiste.
 * Chiffres repris des listes finales publiées dans les groupes WhatsApp :
 * seuls les totaux sont affichés, jamais les noms ni les numéros des contributeurs.
 */
export function SolidarityOperations() {
  const { tx } = useI18n();
  const operations = [
    {
      done: true,
      key: 'luanika' as const,
      parish: 'Luanika',
      photos: ['/images/solidarite/luanika-eglise.jpg', '/images/solidarite/luanika-facade.jpg'],
      t: tx('Opération 100 chaises — Paroisse de Luanika', 'Operation 100 Chairs — Luanika parish', 'Operação 100 cadeiras — Paróquia de Luanika'),
      d: tx(
        'Dans cette paroisse rurale du Kongo-Central, les fidèles s’asseyaient sur des bancs en bambou. Grâce à la mobilisation des KCCistes de plusieurs pays, l’objectif a été dépassé : 150 chaises en plastique ont été achetées à Lufu puis transportées jusqu’à Luanika.',
        'In this rural parish of Kongo-Central, the faithful used to sit on bamboo benches. Thanks to KCCistes from several countries, the goal was exceeded: 150 plastic chairs were bought in Lufu and carried all the way to Luanika.',
        'Nesta paróquia rural do Kongo-Central, os fiéis sentavam-se em bancos de bambu. Graças à mobilização dos KCCistas de vários países, o objetivo foi ultrapassado: 150 cadeiras de plástico foram compradas em Lufu e transportadas até Luanika.',
      ),
      facts: [
        tx('150 chaises remises', '150 chairs delivered', '150 cadeiras entregues'),
        tx('73 contributeurs', '73 contributors', '73 contribuidores'),
        tx('1 326,60 $ + 584 000 FC collectés', '$1,326.60 + 584,000 FC raised', '1 326,60 $ + 584 000 FC recolhidos'),
      ],
      date: tx('Remise officielle le dimanche 13 septembre 2026', 'Official handover on Sunday 13 September 2026', 'Entrega oficial no domingo, 13 de setembro de 2026'),
    },
    {
      done: false,
      key: 'ngidinga' as const,
      parish: 'Ngidinga',
      photos: ['/images/solidarite/ngidinga-bancs-bambou.jpg'],
      t: tx('Opération 100 chaises — Paroisse de Ngidinga', 'Operation 100 Chairs — Ngidinga parish', 'Operação 100 cadeiras — Paróquia de Ngidinga'),
      d: tx(
        'Après Luanika, la paroisse sœur de Ngidinga : les fidèles y prient encore assis sur des bambous posés sur des briques. La collecte continue pour leur offrir 100 chaises.',
        'After Luanika, our sister parish of Ngidinga: the faithful still pray sitting on bamboo poles laid on bricks. The collection continues to give them 100 chairs.',
        'Depois de Luanika, a paróquia irmã de Ngidinga: os fiéis ainda rezam sentados em bambus apoiados em tijolos. A recolha continua para lhes oferecer 100 cadeiras.',
      ),
      facts: [
        tx('Objectif : 100 chaises', 'Goal: 100 chairs', 'Objetivo: 100 cadeiras'),
        tx('38 contributions', '38 contributions', '38 contribuições'),
        tx('942 $ + 316 000 FC collectés', '$942 + 316,000 FC raised', '942 $ + 316 000 FC recolhidos'),
      ],
      date: tx('Liste arrêtée au 19 octobre 2026 · achat et remise des chaises en préparation', 'List as of 19 October 2026 · purchase and handover of the chairs being prepared', 'Lista de 19 de outubro de 2026 · compra e entrega das cadeiras em preparação'),
    },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {operations.map((o) => (
        <article key={o.parish} className="flex flex-col overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-soft">
          <div className={o.photos.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''}>
            {o.photos.map((src) => <img key={src} src={src} alt={tx(`Paroisse de ${o.parish}`, `${o.parish} parish`, `Paróquia de ${o.parish}`)} loading="lazy" className="h-56 w-full object-cover" />)}
          </div>
          <div className="flex flex-1 flex-col p-6">
            <Badge tone={o.done ? 'gold' : 'green'} className="self-start">{o.done ? tx('Terminé', 'Completed', 'Concluído') : tx('En cours', 'Ongoing', 'Em curso')}</Badge>
            <h3 className="mt-3 font-display text-xl font-medium text-night">{o.t}</h3>
            <p className="mt-1.5 text-sm text-ink/65">{o.d}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {o.facts.map((f) => <li key={f} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-night">{f}</li>)}
            </ul>
            <ContributorList parish={o.key} />
            <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-ink/55"><CalendarCheck className="h-4 w-4 text-gold" />{o.date}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Liste publique des contributions d'une opération (nom et montant, jamais de numéro). */
function ContributorList({ parish }: { parish: keyof typeof CONTRIBUTIONS }) {
  const { tx } = useI18n();
  const list = CONTRIBUTIONS[parish];
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
