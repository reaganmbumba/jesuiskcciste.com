import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ImagePlus, MapPin, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { apostlesRepo, sortApostles, yearsLabel } from '@/features/apostles/apostles';
import { ApostlePortrait, ProposeDialog } from '@/features/apostles/ApostleUi';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import type { Apostle, ApostleStatus } from '@/types';

type Filter = ApostleStatus | 'all';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Les Révérends Apôtres de l'Église, en vie et décédés, avec leur photo de profil. */
export default function ApostlesPage() {
  const { tx } = useI18n();
  const { data = [], loading, error, reload } = useAsync(() => apostlesRepo.all().then(sortApostles), []);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [proposeFor, setProposeFor] = useState<Apostle | null>(null);

  const shown = useMemo(() => {
    const s = norm(q.trim());
    return data.filter((a) => (filter === 'all' || a.status === filter) && (!s || norm(`${a.fullName} ${a.place ?? ''}`).includes(s)));
  }, [data, filter, q]);
  const missing = data.filter((a) => !a.photoUrl).length;

  const filters: [Filter, string][] = [
    ['all', tx('Tous', 'All', 'Todos')],
    ['living', tx('En vie', 'Living', 'Vivos')],
    ['deceased', tx('Décédés', 'Deceased', 'Falecidos')],
  ];

  return (
    <>
      <PageHeader eyebrow={tx('Serviteurs de l’Église', 'Servants of the Church', 'Servos da Igreja')} title={tx('Les Révérends Apôtres', 'The Reverend Apostles', 'Os Reverendos Apóstolos')}
        description={tx('Tous les Révérends Apôtres de l’Église Bon Nouveau Message, ceux qui sont en vie et ceux qui sont décédés. Vous avez la photo d’un apôtre ? Envoyez-la : elle sera ajoutée après vérification.', 'All the Reverend Apostles of the Église Bon Nouveau Message, living and deceased. Do you have a photo of an apostle? Send it: it will be added after review.', 'Todos os Reverendos Apóstolos da Église Bon Nouveau Message, vivos e falecidos. Tem a foto de um apóstolo? Envie-a: será adicionada após verificação.')} />

      <section className="container-page py-14">
        <DemoInline>{tx('Démonstration : noms d’exemple. La vraie liste apparaît dès qu’elle est saisie par l’administration.', 'Demo: sample names. The real list appears once the administration enters it.', 'Demonstração: nomes de exemplo. A lista real aparece quando a administração a introduzir.')}</DemoInline>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label={tx('Filtrer', 'Filter', 'Filtrar')} className="flex flex-wrap gap-2">
            {filters.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === k ? 'border-night bg-night text-white' : 'border-night/10 bg-white text-ink/70 hover:border-gold'}`}>{label}</button>
            ))}
          </div>
          <label className="relative block sm:w-72">
            <span className="sr-only">{tx('Rechercher un apôtre', 'Search an apostle', 'Procurar um apóstolo')}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
            <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('Nom ou lieu…', 'Name or place…', 'Nome ou local…')} className="pl-10" />
          </label>
        </div>

        {missing > 0 && !loading && (
          <p className="mb-8 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold-50 px-4 py-3 text-sm text-ink/80">
            <Camera className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
            <span>{tx(`${missing} apôtre(s) n’ont pas encore de photo. Si vous en avez une, touchez « Envoyer une photo » sous son nom.`, `${missing} apostle(s) have no photo yet. If you have one, tap “Send a photo” under their name.`, `${missing} apóstolo(s) ainda não têm foto. Se tiver uma, toque em «Enviar uma foto» por baixo do nome.`)}</span>
          </p>
        )}

        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}</div>
        ) : !shown.length ? (
          <EmptyState title={data.length ? tx('Aucun apôtre ne correspond.', 'No apostle matches.', 'Nenhum apóstolo corresponde.') : tx('La liste des apôtres sera bientôt publiée.', 'The list of apostles will be published soon.', 'A lista dos apóstolos será publicada em breve.')} />
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((a) => <ApostleCard key={a.id} apostle={a} onPropose={() => setProposeFor(a)} />)}
          </ul>
        )}
      </section>

      <ProposeDialog apostle={proposeFor} mode="photo" onClose={() => setProposeFor(null)} />
    </>
  );
}

function ApostleCard({ apostle: a, onPropose }: { apostle: Apostle; onPropose: () => void }) {
  const { tx } = useI18n();
  const deceased = a.status === 'deceased';
  const years = yearsLabel(a);
  return (
    <li id={`apotre-${a.id}`} className="group relative flex scroll-mt-32 flex-col items-center rounded-3xl border border-night/[0.06] bg-white p-4 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <ApostlePortrait apostle={a} className="h-28 w-28 text-3xl sm:h-32 sm:w-32" />
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-600">{a.title}</p>
      <h2 className="mt-1 font-display text-lg font-semibold leading-tight text-night">
        <Link to={`/apotres/${a.id}`} className="after:absolute after:inset-0 after:rounded-3xl group-hover:text-gold-700">{a.fullName}</Link>
      </h2>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {a.status !== 'unknown' && <Badge tone={deceased ? 'neutral' : 'green'}>{deceased ? tx('Décédé', 'Deceased', 'Falecido') : tx('En vie', 'Living', 'Vivo')}</Badge>}
        {years && <Badge>{years}</Badge>}
      </div>
      {a.place && <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink/55"><MapPin className="h-3.5 w-3.5" aria-hidden />{a.place}</p>}
      {!a.photoUrl && (
        <div className="relative z-10 mt-auto w-full pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onPropose} icon={<ImagePlus className="h-4 w-4" />} className="w-full">
            {tx('Envoyer une photo', 'Send a photo', 'Enviar uma foto')}
          </Button>
        </div>
      )}
    </li>
  );
}
