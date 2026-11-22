import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Headphones } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/format';
import { listRediffusions, rubriqueOf, RUBRIQUES, type Rediffusion, type Rubrique } from '@/features/radio/rediffusions';

const mins = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)} h ${String(Math.round((s % 3600) / 60)).padStart(2, '0')}` : `${Math.max(1, Math.round(s / 60))} min`);
const date = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa', weekday: 'long', day: 'numeric', month: 'long' });

/** Réécouter les émissions de la radio, classées par rubrique. */
export default function RadioRediffusionsPage() {
  const [list, setList] = useState<Rediffusion[] | null>(null);
  const [err, setErr] = useState('');
  const [rub, setRub] = useState<Rubrique | 'Tout'>('Tout');
  useEffect(() => { listRediffusions().then(setList).catch((e: Error) => setErr(e.message)); }, []);
  const present = useMemo(() => RUBRIQUES.filter((r) => list?.some((x) => rubriqueOf(x) === r)), [list]);
  const shown = (list ?? []).filter((x) => rub === 'Tout' || rubriqueOf(x) === rub);

  return (
    <div>
      <PageHeader eyebrow="Radio Je suis KCCiste" title="Réécouter les émissions"
        description="Les émissions déjà passées à la radio, classées par rubrique : prédications, Journal KCC, Tosungana, prière et autres émissions. Appuyez sur lecture : la radio en direct se met en pause.">
        <Link to="/radio" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"><ArrowLeft className="h-4 w-4" />Retour à la radio en direct</Link>
      </PageHeader>
      <section className="container-page py-8">
        {present.length > 1 && (
          <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Rubriques">
            {(['Tout', ...present] as const).map((r) => (
              <button key={r} type="button" role="tab" aria-selected={rub === r} onClick={() => setRub(r)}
                className={cn('rounded-full px-4 py-2 text-sm font-semibold', rub === r ? 'bg-night text-white' : 'border border-night/15 text-night hover:bg-night/5')}>
                {r}{r !== 'Tout' && <span className="ml-1.5 opacity-60">{list?.filter((x) => rubriqueOf(x) === r).length}</span>}
              </button>
            ))}
          </div>
        )}
        {err && <p className="text-sm text-red-600" role="alert">{err}</p>}
        {!list && !err && <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>}
        {list && !shown.length && <p className="text-ink/60">Aucune émission à réécouter pour le moment.</p>}
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((x) => (
            <li key={x.url} className="rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <p className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gold/20 px-2.5 py-0.5 font-semibold text-gold-800">{rubriqueOf(x)}</span>
                <span className="text-ink/55">{mins(x.durationSeconds)}</span>
              </p>
              <h2 className="mt-2 font-display text-lg font-semibold leading-snug text-night">{x.title}</h2>
              <p className="mt-1 text-xs capitalize text-ink/55">Diffusée le {date(x.firstAired)}</p>
              <audio controls preload="none" src={x.url} className="mt-3 w-full" aria-label={`Écouter ${x.title}`} />
            </li>
          ))}
        </ul>
        <p className="mt-8 flex items-center gap-2 text-sm text-ink/60"><Headphones className="h-4 w-4" />Les nouvelles émissions arrivent ici d’elles-mêmes, une heure après leur diffusion.</p>
      </section>
    </div>
  );
}
