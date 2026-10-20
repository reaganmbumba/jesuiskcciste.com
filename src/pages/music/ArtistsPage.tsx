import { Mic2, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { CoverArt } from '@/components/cards/Cards';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { artistsRepo, parishesRepo, tracksRepo } from '@/services';

export default function ArtistsPage() {
  const { data, loading } = useAsync(() => Promise.all([artistsRepo.all(), parishesRepo.all(), tracksRepo.all()]), []);
  const [artists = [], parishes = [], tracks = []] = data ?? [];
  return (
    <>
      <PageHeader eyebrow="KCC Music" title="Artistes et chorales" />
      <section className="container-page py-10">
        {loading ? <Skeleton className="h-64" /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((a) => (
              <article key={a.id} className="overflow-hidden rounded-2xl border border-night/[0.06] bg-white shadow-soft">
                {a.imageUrl ? <img src={a.imageUrl} alt="" className="h-40 w-full object-cover" loading="lazy" /> : <CoverArt seed={a.id} icon={a.kind === 'choir' ? <Users /> : <Mic2 />} className="h-40" />}
                <div className="p-5">
                  <Badge tone="gold">{a.kind === 'choir' ? 'Chorale' : 'Artiste'}</Badge>
                  <h2 className="mt-2 font-display text-xl font-semibold text-night">{a.name}</h2>
                  <p className="mt-1 text-sm text-ink/60">{a.bio}</p>
                  <p className="mt-3 text-xs text-ink/50">{parishes.find((p) => p.id === a.parishId)?.name} · {tracks.filter((t) => t.artistId === a.id).length} titre(s)</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
