import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play, Radio, Settings2, SkipForward, StopCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/Spinner';
import { useI18n } from '@/i18n';
import { formatDuration } from '@/utils/format';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/lib/permissions';
import { useRadio } from '@/features/radio/RadioContext';
import { CallShowButton, KindIcon, LiveBadge, RADIO_NAME, RadioModeChooser } from '@/features/radio/RadioUi';

/** « mardi 27 octobre, 11:30 » à l'heure de Kinshasa. */
function showTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kinshasa' }).format(new Date(iso));
}

export default function RadioPage() {
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const r = useRadio();
  const { prepare } = r;
  useEffect(() => { prepare(); }, [prepare]);
  const songs = r.items.filter((i) => i.kind === 'song').length;
  const sermons = r.items.filter((i) => i.kind === 'sermon').length;
  const pct = r.duration > 0 ? Math.min(100, (r.time / r.duration) * 100) : 0;

  return (
    <div>
      <PageHeader eyebrow={tx('Médias', 'Media', 'Média')} title={RADIO_NAME}
        description={tx('Les chants et les prédications de la communauté en continu et dans un ordre aléatoire, comme à la radio. L’écoute continue pendant que vous visitez le site.', 'The community’s songs and sermons non-stop and in random order, just like the radio. Listening goes on while you browse the site.', 'Os cânticos e as pregações da comunidade sem parar e em ordem aleatória, como na rádio. A escuta continua enquanto navega no site.')}>
        {can(profile, 'settings.manage') && <Link to="/admin/radio" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"><Settings2 className="h-4 w-4" />{tx('Régler la radio', 'Radio settings', 'Configurar a rádio')}</Link>}
      </PageHeader>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-night to-night-700 p-6 text-white shadow-lift sm:p-8">
            <div className="flex items-center gap-5">
              {r.current?.imageUrl
                ? <img src={r.current.imageUrl} alt="" className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-4 ring-gold/40 sm:h-28 sm:w-28" />
                : <span className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 text-night sm:h-28 sm:w-28">{r.current ? <KindIcon item={r.current} className="h-10 w-10" /> : <Radio className="h-10 w-10" aria-hidden />}</span>}
              <div className="min-w-0" aria-live="polite">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-300">
                  {r.onLive && <LiveBadge />}
                  {r.playing && !r.onLive && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" aria-hidden />}
                  {r.active ? (r.playing ? tx('À l’antenne', 'On air', 'No ar') : tx('En pause', 'Paused', 'Em pausa')) : tx('Prête à démarrer', 'Ready to start', 'Pronta a começar')}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold leading-tight sm:text-3xl">{r.current?.title ?? RADIO_NAME}</h2>
                <p className="mt-1 truncate text-sm text-white/65">{r.current?.subtitle ?? (r.liveOn ? `${tx('Émission en direct', 'Live show', 'Emissão em direto')} : ${r.liveTitle}` : null) ?? tx('Appuyez sur « Écouter » pour lancer la radio.', 'Press “Listen” to start the radio.', 'Carregue em «Ouvir» para iniciar a rádio.')}</p>
              </div>
            </div>

            {r.active && !r.onLive && (
              <div className="mt-6">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={tx('Progression du titre', 'Track progress', 'Progresso da faixa')}><div className="h-full bg-gold" style={{ width: `${pct}%` }} /></div>
                <div className="mt-1.5 flex justify-between text-xs tabular-nums text-white/50"><span>{formatDuration(Math.floor(r.time))}</span><span>{r.duration ? formatDuration(Math.floor(r.duration)) : ''}</span></div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={r.toggle} disabled={r.ready && !r.items.length && !r.liveOn}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-night hover:bg-gold-300 disabled:opacity-50">
                {r.active && r.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {r.active && r.playing ? tx('Pause', 'Pause', 'Pausa') : r.loading && !r.ready ? tx('Chargement…', 'Loading…', 'A carregar…') : tx('Écouter', 'Listen', 'Ouvir')}
              </button>
              {r.active && !r.onLive && <button type="button" onClick={r.next} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white/10"><SkipForward className="h-4 w-4" />{tx('Suivant', 'Next', 'Seguinte')}</button>}
              {r.active && <button type="button" onClick={r.stop} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"><StopCircle className="h-4 w-4" />{tx('Arrêter', 'Stop', 'Parar')}</button>}
            </div>

            {r.liveOn && !r.onLive && r.active && <p className="mt-4 text-sm text-white/70">{tx('Le son du direct est coupé pour le moment : la radio y revient d’elle-même dans quelques minutes.', 'The live sound is cut for now: the radio goes back to it by itself in a few minutes.', 'O som do direto está cortado de momento: a rádio volta a ele sozinha dentro de alguns minutos.')}</p>}
            {r.upcomingShow && (
              <p className="mt-4 rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white/80">
                {tx('Émission programmée', 'Scheduled show', 'Emissão programada')} · <span className="font-semibold text-white">{showTime(r.upcomingShow.startsAt, locale)}</span>{tx(' (heure de Kinshasa)', ' (Kinshasa time)', ' (hora de Kinshasa)')} : <span className="font-semibold text-white">{r.upcomingShow.title}</span>. {tx('La radio y passe d’elle-même à l’heure dite.', 'The radio switches to it by itself at that time.', 'A rádio passa para ela sozinha à hora marcada.')}
              </p>
            )}
            {r.callUrl && (
              <div className="mt-6 rounded-2xl bg-white/[0.06] p-4">
                <p className="text-sm text-white/80">{tx('Intervenez en direct : appelez l’émission. La radio se coupe pendant l’appel, vous entendez l’animateur dans l’appel, et tous les auditeurs vous entendent à l’antenne.', 'Join the show live: call in. The radio stops during the call, you hear the host in the call, and every listener hears you on air.', 'Participe em direto: ligue para a emissão. A rádio para durante a chamada, ouve o animador na chamada e todos os ouvintes o ouvem no ar.')}</p>
                <CallShowButton className="mt-3" />
              </div>
            )}
            {!r.onLive && <RadioModeChooser light className="mt-6" />}
            {r.failed && <p className="mt-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-100" role="alert">{tx('Les titres ne se chargent pas. Vérifiez votre connexion Internet puis appuyez de nouveau sur « Écouter ».', 'Tracks are not loading. Check your Internet connection and press “Listen” again.', 'As faixas não carregam. Verifique a ligação à Internet e carregue de novo em «Ouvir».')}</p>}
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-night">{tx('À suivre', 'Up next', 'A seguir')}</h2>
            {r.upcoming.length ? (
              <ol className="mt-3 space-y-3">
                {r.upcoming.map((i) => (
                  <li key={i.key} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-night/[0.06] text-night"><KindIcon item={i} className="h-4 w-4" /></span>
                    <span className="min-w-0"><span className="block truncate text-sm font-medium text-night">{i.title}</span><span className="block truncate text-xs text-ink/55">{i.subtitle}</span></span>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-2 text-sm text-ink/60">{tx('La suite s’affiche ici une fois la radio lancée.', 'What comes next appears here once the radio is playing.', 'O que vem a seguir aparece aqui quando a rádio estiver a tocar.')}</p>}
          </div>
          <div className="rounded-3xl border border-gold/30 bg-gold-50/70 p-5 text-sm text-ink/75">
            <p className="font-semibold text-night">{tx('Au programme', 'On the programme', 'No programa')}</p>
            {!r.ready ? <Skeleton className="mt-2 h-5 w-40" /> : (
              <p className="mt-1">{r.items.length
                ? `${songs} ${songs === 1 ? tx('chant', 'song', 'cântico') : tx('chants', 'songs', 'cânticos')} · ${sermons} ${sermons === 1 ? tx('prédication', 'sermon', 'pregação') : tx('prédications', 'sermons', 'pregações')}`
                : tx('Rien à diffuser pour le moment.', 'Nothing to broadcast for now.', 'Nada para emitir de momento.')}</p>
            )}
            <p className="mt-3">{tx('Une prédication passe après quelques chants. Vous pouvez changer de page : un petit lecteur reste en bas de l’écran.', 'A sermon plays after a few songs. You can change pages: a small player stays at the bottom of the screen.', 'Uma pregação passa depois de alguns cânticos. Pode mudar de página: um pequeno leitor fica no fundo do ecrã.')}</p>
            <p className="mt-3"><Link to="/musique" className="font-semibold text-gold-700 hover:underline">KCC Music</Link> · <Link to="/predications#audio" className="font-semibold text-gold-700 hover:underline">{tx('Prédications audio', 'Audio sermons', 'Pregações em áudio')}</Link></p>
          </div>
        </aside>
      </section>
    </div>
  );
}
