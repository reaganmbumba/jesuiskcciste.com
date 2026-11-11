import { Link } from 'react-router-dom';
import { Heart, Trophy } from 'lucide-react';
import { CHALLENGES } from '@/content/challenges';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

/** Encadré d'accueil : le challenge en cours (le plus récent). */
export function HomeChallengeBlock({ className }: { className?: string }) {
  const { tx, pick } = useI18n();
  const c = CHALLENGES[0];
  if (!c) return null;
  return (
    <section className={cn('flex flex-col gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#881337] to-night p-5 text-white shadow-lift sm:flex-row sm:items-center sm:p-6', className)} aria-labelledby="challenge-home-title">
      <img src={c.image} alt="" loading="lazy" className="hidden h-24 w-[4.5rem] shrink-0 rounded-2xl object-cover object-top ring-2 ring-gold/60 sm:block" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200"><Trophy className="h-3.5 w-3.5" aria-hidden />{tx('Challenge du jour', 'Challenge of the day', 'Desafio do dia')}</p>
        <h2 id="challenge-home-title" className="mt-1 font-display text-xl font-semibold">« {c.song} »</h2>
        <p className="mt-1 text-sm text-white/75">{tx('Chantez-la à votre tour, envoyez votre vidéo et votez pour la meilleure version.', 'Sing it yourself, send your video and vote for the best version.', 'Cante-a também, envie o seu vídeo e vote na melhor versão.')}</p>
        <span className="sr-only">{pick(c.title)}</span>
      </div>
      <Link to={`/challenges/${c.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-night hover:bg-gold-300">
        <Heart className="h-4 w-4" aria-hidden />{tx('Participer et voter', 'Take part and vote', 'Participar e votar')}
      </Link>
    </section>
  );
}
