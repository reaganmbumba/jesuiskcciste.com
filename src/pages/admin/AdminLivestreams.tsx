import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CrudTable } from '@/features/administration/CrudTable';
import { LIVE_BODY_MAX, LIVE_TITLE_MAX, livestreamErrorText, livestreamsRepo, liveStatus, liveWatchUrl, parseYouTubeId } from '@/features/livestreams/livestreams';
import type { Repository } from '@/services/repository';
import { formatDate, formatTime } from '@/utils/format';
import type { Livestream } from '@/types';

const DURATIONS = [60, 90, 120, 150, 180, 240, 300, 360, 480];
const hours = (min: number) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60}` : ''}`);

/** Les erreurs de Supabase deviennent des phrases claires dans le tableau. */
const wrap = <A extends unknown[], R>(fn: (...a: A) => Promise<R>) => async (...a: A): Promise<R> => {
  try {
    return await fn(...a);
  } catch (e) {
    throw new Error(livestreamErrorText(e));
  }
};
const adminRepo: Repository<Livestream> = {
  ...livestreamsRepo,
  all: wrap(livestreamsRepo.all),
  create: wrap(livestreamsRepo.create),
  update: wrap(livestreamsRepo.update),
  remove: wrap(livestreamsRepo.remove),
};

const STATUS: Record<ReturnType<typeof liveStatus>, { label: string; tone: 'red' | 'blue' | 'neutral' | 'amber' }> = {
  live: { label: 'En direct', tone: 'red' },
  upcoming: { label: 'À venir', tone: 'blue' },
  ended: { label: 'Terminé', tone: 'neutral' },
  cancelled: { label: 'Annulé', tone: 'amber' },
};

export default function AdminLivestreams() {
  return (
    <>
      <h1 className="mb-4 font-display text-2xl font-semibold text-night">Directs des cultes (YouTube)</h1>
      <Card className="mb-6">
        <CardBody className="space-y-2 text-sm text-ink/75">
          <p className="font-semibold text-night">Comment programmer un direct</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Dans YouTube Studio, cliquez sur « Créer », puis « Passer au direct », et programmez le direct (titre, date, heure). Mettez-le en « Public » et laissez « Autoriser l’intégration » cochée.</li>
            <li>Copiez le lien du direct que donne YouTube (par exemple https://youtube.com/live/…).</li>
            <li>Ici, cliquez sur « Ajouter », indiquez le titre, la date et l’heure, puis collez le lien. Sans lien, le site affiche le direct en cours de la chaîne.</li>
          </ol>
          <p>Le compte à rebours apparaît sur la page d’accueil et sur la page <Link to="/direct" className="font-semibold text-night-500 underline">Cultes en direct</Link>. À l’heure du début, le lecteur YouTube prend sa place automatiquement.</p>
        </CardBody>
      </Card>
      <CrudTable<Livestream> entity="livestreams" title="Directs programmés" repo={adminRepo} searchFields={['title']} pageSize={20}
        defaults={{ durationMinutes: 180, isCancelled: false }}
        columns={[
          { key: 'startsAt', label: 'Date et heure', render: (l) => <span className="whitespace-nowrap">{formatDate(l.startsAt, 'fr', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {formatTime(l.startsAt)}</span> },
          { key: 'title', label: 'Titre' },
          { key: 'durationMinutes', label: 'Durée', render: (l) => hours(l.durationMinutes) },
          { key: 'youtubeId', label: 'Vidéo YouTube', render: (l) => (
            <a href={liveWatchUrl(l)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-night-500 hover:underline">
              {l.youtubeId ?? 'Direct de la chaîne'} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) },
          { key: 'isCancelled', label: 'Statut', render: (l) => { const s = STATUS[liveStatus(l)]; return <Badge tone={s.tone}>{s.label}</Badge>; } },
        ]}
        formFields={[
          { key: 'title', label: 'Titre du direct', type: 'text', required: true, hint: `Ex. : Culte du Sabbat, Fête du 12 octobre… (${LIVE_TITLE_MAX} caractères au plus)` },
          { key: 'startsAt', label: 'Date et heure du début', type: 'datetime', required: true, hint: 'À l’heure de votre appareil. Chaque visiteur la voit à son heure locale.' },
          { key: 'durationMinutes', label: 'Durée prévue', type: 'select', options: DURATIONS.map((d) => ({ value: String(d), label: hours(d) })) },
          { key: 'youtubeId', label: 'Lien YouTube du direct (facultatif)', type: 'text', full: true, hint: 'Collez le lien donné par YouTube (youtube.com/live/…, youtu.be/…). Laissez vide pour afficher le direct en cours de la chaîne.' },
          { key: 'description', label: 'Message aux fidèles (facultatif)', type: 'textarea', full: true, hint: `Programme, lieu, prédicateur… (${LIVE_BODY_MAX} caractères au plus)` },
          { key: 'isCancelled', label: 'Direct annulé', type: 'checkbox' },
        ]}
        transformBeforeSave={(v) => {
          const title = String(v.title ?? '').trim();
          if (title.length < 3 || title.length > LIVE_TITLE_MAX) throw new Error(`Le titre doit faire entre 3 et ${LIVE_TITLE_MAX} caractères.`);
          const description = typeof v.description === 'string' ? v.description.trim().slice(0, LIVE_BODY_MAX) || null : null;
          let youtubeId: string | null;
          try {
            youtubeId = parseYouTubeId(typeof v.youtubeId === 'string' ? v.youtubeId : null);
          } catch (e) {
            throw new Error(livestreamErrorText(e));
          }
          return { ...v, title, description, youtubeId, durationMinutes: Number(v.durationMinutes) || 180, isCancelled: !!v.isCancelled };
        }}
      />
    </>
  );
}
