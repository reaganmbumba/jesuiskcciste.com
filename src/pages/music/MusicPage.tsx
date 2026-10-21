import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Disc3, Mic2, Music2, Play, Search, ShoppingBag } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { albumsRepo, artistsRepo, tracksRepo } from '@/services';
import { AudioPlayer } from '@/features/music/AudioPlayer';
import { cn, formatDuration } from '@/utils/format';
import { CoverArt } from '@/components/cards/Cards';
import { useI18n } from '@/i18n';
import { YouTubeMoreVideos } from '@/components/common/YouTubeChannel';
import { BuyButton, ProviderBadges, PurchaseDialog, type SaleItem } from '@/features/music/PurchaseDialog';
import { isForSale } from '@/features/music/shop';
import { ShareButtons } from '@/components/common/ShareButtons';

const RIGHTS = {
  authorized: { label: { fr: 'Diffusion autorisée', en: 'Broadcast allowed', pt: 'Difusão autorizada' }, tone: 'green' },
  pending: { label: { fr: 'Autorisation en attente', en: 'Permission pending', pt: 'Autorização pendente' }, tone: 'amber' },
  restricted: { label: { fr: 'Diffusion restreinte', en: 'Restricted broadcast', pt: 'Difusão restrita' }, tone: 'red' },
} as const;

export default function MusicPage() {
  const [params] = useSearchParams();
  const { tx, pick } = useI18n();
  const [buying, setBuying] = useState<SaleItem | null>(null);
  const { data, loading } = useAsync(() => Promise.all([tracksRepo.all(), artistsRepo.all(), albumsRepo.all()]), []);
  const [tracks = [], artists = [], albums = []] = data ?? [];
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  useEffect(() => { const t = params.get('titre'); if (t) setCurrentId(t); }, [params]);
  const list = useMemo(() => tracks.filter((t) => (!cat || t.category === cat) && (!q || `${t.title} ${t.author} ${artists.find((a) => a.id === t.artistId)?.name}`.toLowerCase().includes(q.toLowerCase()))), [tracks, artists, q, cat]);
  const current = tracks.find((t) => t.id === currentId) ?? null;
  const idx = list.findIndex((t) => t.id === currentId);
  const forSale = tracks.some((t) => isForSale(t) && t.broadcastRights === 'authorized') || albums.some(isForSale);
  const cats = Array.from(new Set(tracks.map((t) => t.category)));

  return (
    <div className={current ? 'pb-24' : ''}>
      <PageHeader eyebrow={tx('Médias', 'Media', 'Média')} title="KCC Music" description={tx('Chants, albums, chorales et artistes de la communauté, diffusés avec l’autorisation des ayants droit.', 'Songs, albums, choirs and artists of the community, shared with the permission of the rights holders.', 'Cânticos, álbuns, coros e artistas da comunidade, difundidos com autorização dos titulares de direitos.')}>
        <div className="flex flex-wrap gap-3"><Link to="/musique/artistes" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"><Mic2 className="h-4 w-4" />{tx('Artistes et chorales', 'Artists and choirs', 'Artistas e coros')}</Link><Link to="/enseignements#pgm" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"><Music2 className="h-4 w-4" />{tx('Vision PGM et paroles', 'PGM vision and lyrics', 'Visão PGM e letras')}</Link></div>
      </PageHeader>
      <section className="container-page grid gap-8 py-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_200px]">
            <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input className="pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('Titre, auteur, chorale…', 'Title, author, choir…', 'Título, autor, coro…')} aria-label={tx('Rechercher un chant', 'Search for a song', 'Pesquisar um cântico')} /></div>
            <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label={tx('Catégorie', 'Category', 'Categoria')}><option value="">{tx('Toutes les catégories', 'All categories', 'Todas as categorias')}</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
          </div>
          {current && (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gold/30 bg-gold-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 truncate text-sm text-ink/70">{tx('En écoute', 'Now playing', 'A ouvir')} : <span className="font-semibold text-night">{current.title}</span></p>
              <ShareButtons size="sm" url={`/musique?titre=${encodeURIComponent(current.id)}`} title={`${current.title} · KCC Music`} />
            </div>
          )}
          {loading ? <Skeleton className="h-72" /> : list.length ? (
            <ol className="overflow-hidden rounded-2xl border border-night/[0.06] bg-white shadow-soft">
              {list.map((t, i) => {
                const artist = artists.find((a) => a.id === t.artistId);
                const r = RIGHTS[t.broadcastRights];
                return (
                  <li key={t.id} className={cn('flex items-center gap-3 border-b border-night/[0.05] px-4 py-3 last:border-0', currentId === t.id && 'bg-gold-50')}>
                    <span className="w-5 text-right text-sm tabular-nums text-ink/40">{i + 1}</span>
                    <button onClick={() => setCurrentId(t.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night text-gold hover:bg-deep" aria-label={`${tx('Écouter', 'Play', 'Ouvir')} ${t.title}`}><Play className="h-4 w-4" /></button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-night">{t.title}</p>
                      <p className="truncate text-xs text-ink/55">{artist?.name} · {t.author}</p>
                    </div>
                    <span className="hidden sm:block"><Badge tone={r.tone}>{pick(r.label)}</Badge></span>
                    <span className="text-xs tabular-nums text-ink/50">{formatDuration(t.durationSeconds)}</span>
                    {isForSale(t) && t.broadcastRights === 'authorized' && <BuyButton compact item={{ type: 'track', id: t.id, title: t.title, subtitle: artist?.name, amount: t.priceAmount!, currency: t.priceCurrency! }} onBuy={setBuying} />}
                  </li>
                );
              })}
            </ol>
          ) : <EmptyState icon={<Music2 className="h-6 w-6" />} title={tx('Aucun titre ne correspond.', 'No matching track.', 'Nenhuma faixa corresponde.')} />}
        </div>
        <aside className="space-y-6">
          <div>
            <h2 className="mb-3 font-display text-xl font-semibold text-night">{tx('Albums', 'Albums', 'Álbuns')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {albums.map((a) => (
                <div key={a.id} className="overflow-hidden rounded-xl bg-white shadow-soft">
                  {a.coverUrl ? <img src={a.coverUrl} alt="" className="aspect-square w-full object-cover" loading="lazy" /> : <CoverArt seed={a.id} icon={<Disc3 />} className="aspect-square" />}
                  <div className="p-3"><p className="truncate text-sm font-semibold text-night">{a.title}</p><p className="truncate text-xs text-ink/55">{artists.find((x) => x.id === a.artistId)?.name}{a.year ? ` · ${a.year}` : ''}</p>
                    {isForSale(a) && <div className="mt-2"><BuyButton compact item={{ type: 'album', id: a.id, title: a.title, subtitle: artists.find((x) => x.id === a.artistId)?.name, amount: a.priceAmount!, currency: a.priceCurrency! }} onBuy={setBuying} /></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gold/40 bg-gold-50/70 p-5">
            <p className="flex items-center gap-2 font-semibold text-night"><ShoppingBag className="h-5 w-5 text-gold-600" />{tx('Boutique musicale', 'Music shop', 'Loja de música')}</p>
            <p className="mt-1 text-sm text-ink/70">{forSale
              ? tx('Achetez les chants et albums marqués d’un prix et soutenez les artistes et chorales de la communauté. Paiement sécurisé depuis votre téléphone, téléchargement immédiat.', 'Buy the songs and albums showing a price and support the community’s artists and choirs. Secure payment from your phone, instant download.', 'Compre os cânticos e álbuns com preço e apoie os artistas e coros da comunidade. Pagamento seguro pelo telemóvel, descarga imediata.')
              : tx('Bientôt : achat des chants et albums de la communauté, payés depuis votre téléphone.', 'Coming soon: buy the community’s songs and albums, paid from your phone.', 'Em breve: compra dos cânticos e álbuns da comunidade, pagos pelo telemóvel.')}</p>
            <ProviderBadges className="mt-3" />
          </div>
        </aside>
      </section>
      <div className="container-page pb-12"><YouTubeMoreVideos /></div>
      <PurchaseDialog item={buying} onClose={() => setBuying(null)} />
      <AudioPlayer track={current} artistName={artists.find((a) => a.id === current?.artistId)?.name} onPrev={() => idx > 0 && setCurrentId(list[idx - 1].id)} onNext={() => idx >= 0 && idx < list.length - 1 && setCurrentId(list[idx + 1].id)} />
    </div>
  );
}
