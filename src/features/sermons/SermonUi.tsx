import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { BookOpen, CalendarDays, Clock, Download, Headphones, MapPin, Search } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/States';
import { ShareButtons } from '@/components/common/ShareButtons';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { cn, formatDate, formatDuration } from '@/utils/format';
import type { AudioSermon } from '@/types';
import { listPublicSermons } from './sermons';

const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Photo ronde du prédicateur, ou ses initiales. */
export function PreacherPortrait({ sermon: s, className }: { sermon: Pick<AudioSermon, 'preacherName' | 'preacherPhotoUrl'>; className?: string }) {
  return s.preacherPhotoUrl ? (
    <img src={s.preacherPhotoUrl} alt={s.preacherName} loading="lazy" className={cn('rounded-full object-cover ring-4 ring-gold/40', className)} />
  ) : (
    <span className={cn('grid place-items-center rounded-full bg-gradient-to-br from-night to-night-500 font-display font-semibold text-gold ring-4 ring-night/10', className)} aria-hidden>{initialsOf(s.preacherName)}</span>
  );
}

/** Une seule prédication à la fois : démarrer un lecteur met les autres en pause. */
const pauseOthers = (e: SyntheticEvent<HTMLAudioElement>) => {
  document.querySelectorAll('audio').forEach((a) => { if (a !== e.currentTarget) a.pause(); });
};

/** Rubrique « Prédications audio » de la page /predications. */
export function AudioSermonsSection() {
  const { tx, locale } = useI18n();
  const { data, loading, error, reload } = useAsync(() => listPublicSermons(), []);
  const [q, setQ] = useState('');
  const sermons = data ?? [];
  // Liens du menu « /predications#audio » : la section n'existe qu'après le chargement.
  const { hash } = useLocation();
  // Lien partagé d'une prédication : /predications/audio/<id>.
  const { id: sharedId } = useParams();
  useEffect(() => {
    if (loading) return;
    const id = sharedId ? `audio-${sharedId}` : decodeURIComponent(hash.slice(1));
    if (id === 'audio' || id.startsWith('audio-') || id === 'ecrites') setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 50);
  }, [loading, hash, sharedId]);
  const shown = useMemo(() => {
    const k = norm(q.trim());
    return k ? sermons.filter((s) => [s.title, s.preacherName, s.preacherTitle, s.parish, s.bibleText].some((v) => v && norm(v).includes(k))) : sermons;
  }, [sermons, q]);

  return (
    <section id="audio" className="scroll-mt-32 bg-white py-14">
      <div className="container-page">
        <SectionHeading eyebrow={tx('À écouter', 'Listen', 'Para ouvir')} title={tx('Prédications audio', 'Audio sermons', 'Pregações em áudio')}
          description={tx('Réécoutez les prédications des serviteurs de l’Église, avec leur paroisse.', 'Listen again to the sermons of the Church’s servants, with their parish.', 'Volte a ouvir as pregações dos servos da Igreja, com a sua paróquia.')} />
        {loading ? <div className="grid place-items-center py-10"><Spinner /></div>
          : error ? <ErrorState error={error} onRetry={reload} />
          : !sermons.length ? (
            <p className="flex items-center gap-3 rounded-3xl border border-dashed border-night/15 bg-mist/60 px-6 py-8 text-sm text-ink/60"><Headphones className="h-5 w-5 shrink-0 text-gold-700" aria-hidden />{tx('Les premières prédications audio arrivent bientôt.', 'The first audio sermons are coming soon.', 'As primeiras pregações em áudio chegam em breve.')}</p>
          ) : (
            <>
              {sermons.length > 4 && (
                <label className="relative mb-6 block max-w-md">
                  <span className="sr-only">{tx('Rechercher une prédication', 'Search a sermon', 'Procurar uma pregação')}</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
                  <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('Prédicateur, paroisse, sujet…', 'Preacher, parish, topic…', 'Pregador, paróquia, tema…')}
                    className="w-full rounded-full border border-night/10 bg-mist py-2.5 pl-11 pr-4 text-sm focus:border-gold focus:outline-none" />
                </label>
              )}
              {!shown.length && <p className="text-sm text-ink/60">{tx('Aucune prédication ne correspond à cette recherche.', 'No sermon matches this search.', 'Nenhuma pregação corresponde a esta pesquisa.')}</p>}
              <div className="grid gap-6 lg:grid-cols-2">
                {shown.map((s) => (
                  <article key={s.id} id={`audio-${s.id}`} className="flex scroll-mt-32 flex-col rounded-3xl border border-night/[0.06] bg-mist/40 p-5 shadow-soft sm:p-6">
                    <div className="flex items-center gap-4">
                      <PreacherPortrait sermon={s} className="h-20 w-20 shrink-0 text-2xl sm:h-24 sm:w-24" />
                      <div className="min-w-0">
                        {s.preacherTitle && <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">{s.preacherTitle}</p>}
                        <p className="font-display text-lg font-semibold leading-tight text-night">{s.preacherName}</p>
                        {s.parish && <p className="mt-1 flex items-start gap-1 text-sm text-ink/60"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{s.parish}</p>}
                      </div>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold text-night">{s.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {s.bibleText && <Badge><BookOpen className="h-3 w-3" aria-hidden />{s.bibleText}</Badge>}
                      {s.preachedOn && <Badge><CalendarDays className="h-3 w-3" aria-hidden />{formatDate(s.preachedOn, locale, { dateStyle: 'long' }, 'UTC')}</Badge>}
                      {!!s.durationSeconds && <Badge><Clock className="h-3 w-3" aria-hidden />{formatDuration(s.durationSeconds)}</Badge>}
                    </div>
                    {s.description && <p className="mt-3 text-sm text-ink/70">{s.description}</p>}
                    {s.audioUrl ? (
                      <audio controls preload="none" src={s.audioUrl} onPlay={pauseOthers} className="mt-4 w-full" aria-label={`${s.title} — ${s.preacherName}`} />
                    ) : (
                      <p className="mt-4 text-xs text-amber-700">{tx('Audio bientôt disponible.', 'Audio coming soon.', 'Áudio disponível em breve.')}</p>
                    )}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-night/[0.06] pt-4">
                      <ShareButtons size="sm" url={`/predications/audio/${s.id}`} title={`${s.title} — ${s.preacherName}`} text={[s.preacherTitle, s.preacherName, s.parish].filter(Boolean).join(' · ')} image={s.preacherPhotoUrl} />
                      {s.audioUrl && (
                        <a href={s.audioUrl} download className="inline-flex items-center gap-1.5 text-xs font-semibold text-night/70 hover:text-gold-700">
                          <Download className="h-4 w-4" aria-hidden />{tx('Télécharger', 'Download', 'Descarregar')}
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
      </div>
    </section>
  );
}
