import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { PageHeader, Avatar } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Form';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { ButtonLink } from '@/components/ui/Button';
import { useAsync, useDebounced } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/lib/permissions';
import { listDirectory, parishesRepo, sectionsRepo } from '@/services';

const PAGE_SIZE = 12;

/**
 * Annuaire réservé aux membres connectés. En production, les données
 * proviennent de la vue `directory_entries`, qui applique les choix de
 * confidentialité côté base : les champs masqués ne quittent jamais le serveur.
 */
export default function DirectoryPage() {
  const { profile } = useAuth();
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [parishId, setParishId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [fn, setFn] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounced(q);
  const privileged = can(profile, 'members.read_private');

  const { data, loading, error, reload } = useAsync(async () => {
    if (!profile) return null;
    const [entries, parishes, sections] = await Promise.all([listDirectory(privileged), parishesRepo.all(), sectionsRepo.all()]);
    return { parishes, sections, entries: entries.map((e) => ({ entry: e.entry, raw: e })) };
  }, [profile?.id]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = search.trim().toLowerCase();
    return data.entries.filter(({ entry, raw }) =>
      (!s || entry.displayName.toLowerCase().includes(s)) &&
      (!country || entry.country === country) &&
      (!city || entry.city === city) &&
      (!parishId || (entry.parishName && raw.parishId === parishId)) &&
      (!sectionId || (entry.sectionName && raw.sectionId === sectionId)) &&
      (!fn || entry.functionTitle === fn),
    );
  }, [data, search, country, city, parishId, sectionId, fn]);

  if (!profile) {
    return (
      <>
        <PageHeader eyebrow="Communauté" title="Annuaire des membres" />
        <div className="container-page py-14">
          <EmptyState icon={<Lock className="h-6 w-6" />} title="Annuaire réservé aux membres" description="Pour protéger la vie privée de chacun, l’annuaire n’est accessible qu’après connexion." action={<div className="flex gap-2"><ButtonLink to="/connexion">Se connecter</ButtonLink><ButtonLink to="/inscription" variant="outline">S’inscrire</ButtonLink></div>} />
        </div>
      </>
    );
  }

  const countries = Array.from(new Set(data?.entries.map((e) => e.entry.country) ?? [])).sort();
  const cities = Array.from(new Set(data?.entries.filter((e) => !country || e.entry.country === country).map((e) => e.entry.city).filter(Boolean) as string[])).sort();
  const functions = Array.from(new Set(data?.entries.map((e) => e.entry.functionTitle).filter(Boolean) as string[]));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const reset = (f: () => void) => { f(); setPage(1); };

  return (
    <>
      <PageHeader eyebrow="Communauté" title="Annuaire des membres" description="Seules les informations que chaque membre a choisi de rendre visibles sont affichées." />
      <section className="container-page py-10">
        <div className="mb-6 rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
            <Input value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Rechercher par nom…" className="pl-10" aria-label="Rechercher par nom" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
            <Select aria-label="Pays" value={country} onChange={(e) => reset(() => { setCountry(e.target.value); setCity(''); })}><option value="">Tous les pays</option>{countries.map((c) => <option key={c}>{c}</option>)}</Select>
            <Select aria-label="Ville" value={city} onChange={(e) => reset(() => setCity(e.target.value))}><option value="">Toutes les villes</option>{cities.map((c) => <option key={c}>{c}</option>)}</Select>
            <Select aria-label="Paroisse" value={parishId} onChange={(e) => reset(() => { setParishId(e.target.value); setSectionId(''); })}><option value="">Toutes les paroisses</option>{data?.parishes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
            <Select aria-label="Section" value={sectionId} onChange={(e) => reset(() => setSectionId(e.target.value))}><option value="">Toutes les sections</option>{data?.sections.filter((s) => !parishId || s.parishId === parishId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
            <Select aria-label="Fonction" value={fn} onChange={(e) => reset(() => setFn(e.target.value))} disabled={!functions.length}><option value="">{functions.length ? 'Toutes les fonctions' : 'Fonctions (aucune publique)'}</option>{functions.map((f) => <option key={f}>{f}</option>)}</Select>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/55"><SlidersHorizontal className="h-3.5 w-3.5" /> {filtered.length} membre{filtered.length > 1 ? 's' : ''} {privileged && '· vue responsable (données privées visibles selon votre périmètre)'}</p>
        </div>

        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        ) : pageItems.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map(({ entry, raw }) => (
              <li key={entry.id}>
                <Link to={`/communaute/membres/${entry.id}`} className="flex items-center gap-4 rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft transition hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  <Avatar person={raw} url={entry.avatarUrl} size={52} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-night">{entry.displayName}</p>
                    {entry.parishName && <p className="truncate text-sm text-ink/65">{entry.parishName}{entry.sectionName ? ` · ${entry.sectionName}` : ''}</p>}
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50"><MapPin className="h-3 w-3" />{[entry.city, entry.country].filter(Boolean).join(', ')}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="Aucun membre ne correspond à ces critères." />}
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </section>
    </>
  );
}
