import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Hourglass, ImagePlus, MapPin, PencilLine } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { ShareButtons } from '@/components/common/ShareButtons';
import { apostlesRepo, yearsLabel } from '@/features/apostles/apostles';
import { ApostlePortrait, ProposeDialog, type ProposeMode } from '@/features/apostles/ApostleUi';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useI18n } from '@/i18n';
import type { Apostle } from '@/types';

/** Profil d'un Révérend Apôtre : photo, identité, paroisse encadrée, consécration. */
export default function ApostleProfilePage() {
  const { id = '' } = useParams();
  const { tx } = useI18n();
  const { data: a, loading, error, reload } = useAsync(() => apostlesRepo.get(id), [id]);
  const [mode, setMode] = useState<ProposeMode | null>(null);
  usePageMeta({ title: a ? `${a.title} ${a.fullName}` : tx('Les Révérends Apôtres', 'The Reverend Apostles', 'Os Reverendos Apóstolos'), description: a?.bio ?? undefined, image: a?.photoUrl });

  const back = (
    <Link to="/apotres" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
      <ArrowLeft className="h-4 w-4" aria-hidden />{tx('Tous les apôtres', 'All apostles', 'Todos os apóstolos')}
    </Link>
  );

  return (
    <>
      <header className="relative isolate overflow-hidden bg-night-900 pb-24 pt-10 text-white sm:pb-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial opacity-70" aria-hidden />
        <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-gold/25 blur-[110px]" aria-hidden />
        <div className="container-page">{back}</div>
      </header>

      <section className="container-page -mt-20 pb-16">
        {error ? <ErrorState error={error} onRetry={reload} /> : loading ? (
          <Skeleton className="mx-auto h-96 max-w-3xl rounded-3xl" />
        ) : !a ? (
          <EmptyState title={tx('Cet apôtre est introuvable.', 'This apostle could not be found.', 'Este apóstolo não foi encontrado.')} action={<Link to="/apotres" className="text-sm font-semibold text-gold-700 underline">{tx('Voir la liste', 'See the list', 'Ver a lista')}</Link>} />
        ) : (
          <Profile apostle={a} onPropose={setMode} />
        )}
      </section>

      {a && <ProposeDialog apostle={mode ? a : null} mode={mode ?? 'info'} onClose={() => setMode(null)} />}
    </>
  );
}

function Profile({ apostle: a, onPropose }: { apostle: Apostle; onPropose: (m: ProposeMode) => void }) {
  const { tx } = useI18n();
  const deceased = a.status === 'deceased';
  const years = yearsLabel(a);
  const unknown = <span className="text-ink/40">{tx('Pas encore renseigné', 'Not yet provided', 'Ainda não indicado')}</span>;
  const facts: { icon: typeof MapPin; label: string; value: React.ReactNode }[] = [
    { icon: MapPin, label: tx('Paroisse qu’il encadre', 'Parish he oversees', 'Paróquia que dirige'), value: a.place || unknown },
    { icon: CalendarDays, label: tx('Date de consécration', 'Consecration date', 'Data de consagração'), value: a.consecrationDate || unknown },
    { icon: Hourglass, label: deceased ? tx('Naissance et décès', 'Birth and death', 'Nascimento e falecimento') : tx('Année de naissance', 'Year of birth', 'Ano de nascimento'), value: deceased && a.deathDate ? `${a.birthYear ? `${a.birthYear} – ` : ''}${tx('décédé le', 'died on', 'falecido a')} ${a.deathDate}` : years || unknown },
  ];
  const incomplete = !a.place || !a.consecrationDate || !years || !a.bio;

  return (
    <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-night/[0.06] bg-white shadow-lift">
      <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
        <ApostlePortrait apostle={a} className="h-44 w-44 text-5xl sm:h-52 sm:w-52" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">{a.title}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-night sm:text-4xl">{a.fullName}</h1>
        {a.status !== 'unknown' && (
          <Badge tone={deceased ? 'neutral' : 'green'} className="mt-3">{deceased ? tx('Décédé', 'Deceased', 'Falecido') : tx('En vie', 'Living', 'Vivo')}</Badge>
        )}
        <ShareButtons size="sm" url={`/apotres/${a.id}`} title={`${a.title} ${a.fullName}`} image={a.photoUrl} className="mt-5 justify-center" />
      </div>

      <dl className="grid border-t border-night/[0.06] sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="flex gap-3 border-b border-night/[0.06] px-6 py-5 sm:border-b-0 sm:border-r last:border-r-0">
            <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">{f.label}</dt>
              <dd className="mt-1 text-[15px] text-night">{f.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {a.bio && <div className="prose-kcc border-t border-night/[0.06] px-6 py-6">{a.bio.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}

      <div className="flex flex-col gap-3 border-t border-night/[0.06] bg-mist/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/70">
          {incomplete || !a.photoUrl
            ? tx('Vous connaissez cet apôtre ? Aidez-nous à compléter son profil.', 'Do you know this apostle? Help us complete his profile.', 'Conhece este apóstolo? Ajude-nos a completar o seu perfil.')
            : tx('Une information à corriger ? Dites-le-nous.', 'Something to correct? Let us know.', 'Algo a corrigir? Diga-nos.')}
        </p>
        <div className="flex flex-wrap gap-2">
          {!a.photoUrl && <Button type="button" size="sm" onClick={() => onPropose('photo')} icon={<ImagePlus className="h-4 w-4" />}>{tx('Envoyer une photo', 'Send a photo', 'Enviar uma foto')}</Button>}
          <Button type="button" size="sm" variant="outline" onClick={() => onPropose('info')} icon={<PencilLine className="h-4 w-4" />}>{tx('Proposer des informations', 'Suggest details', 'Propor informações')}</Button>
        </div>
      </div>
    </article>
  );
}
