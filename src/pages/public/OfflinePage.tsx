import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, Music2, Pause, Play, Trash2, Wifi } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import {
  formatBytes, offlineSupported, reconcile, removeAll, removeOffline, storageEstimate, useOfflineItems, useOnline,
  type OfflineItem, type OfflineKind,
} from '@/features/offline/offline';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const ORDER: OfflineKind[] = ['livre', 'chant', 'recueil'];

/** « Mes téléchargements » : tout ce qui est gardé sur le téléphone, à écouter ou lire sans internet. */
export default function OfflinePage() {
  const { tx, locale } = useI18n();
  const items = useOfflineItems();
  const online = useOnline();
  const [estimate, setEstimate] = useState<{ usage: number; quota: number } | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => { void reconcile(); }, []);
  useEffect(() => { void storageEstimate().then(setEstimate); }, [items]);

  const sorted = [...items].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.url.localeCompare(b.url));
  const playable = sorted.filter((i) => i.kind !== 'recueil');
  const total = items.reduce((n, i) => n + (i.bytes || 0), 0);

  const play = (it: OfflineItem) => {
    const a = audio.current;
    if (!a) return;
    if (current === it.url) { if (a.paused) void a.play().catch(() => {}); else a.pause(); return; }
    a.src = it.url;
    setCurrent(it.url);
    void a.play().catch(() => setPlaying(false));
  };
  const next = () => {
    const i = playable.findIndex((p) => p.url === current);
    if (i >= 0 && i + 1 < playable.length) play(playable[i + 1]);
  };

  const groups: { kind: OfflineKind; title: string; icon: JSX.Element }[] = [
    { kind: 'livre', title: tx('Livre audio « Le KCCisme »', 'Audiobook “Le KCCisme”', 'Audiolivro «Le KCCisme»'), icon: <Headphones className="h-5 w-5" aria-hidden /> },
    { kind: 'chant', title: tx('Chants', 'Songs', 'Cânticos'), icon: <Music2 className="h-5 w-5" aria-hidden /> },
    { kind: 'recueil', title: tx('Textes', 'Texts', 'Textos'), icon: <BookOpen className="h-5 w-5" aria-hidden /> },
  ];
  const now = sorted.find((i) => i.url === current);

  return (
    <div className={current ? 'pb-28' : ''}>
      <PageHeader share={false} views={false}
        eyebrow={tx('Hors connexion', 'Offline', 'Offline')}
        title={tx('Mes téléchargements', 'My downloads', 'As minhas descargas')}
        description={tx('Ce que vous avez gardé sur ce téléphone s’écoute et se lit sans internet, et sans consommer de données.', 'What you kept on this phone plays and reads without internet, and without using data.', 'O que guardou neste telemóvel ouve-se e lê-se sem internet e sem gastar dados.')} />

      <section className="container-page py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {online && (
            <p className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><Wifi className="h-5 w-5 shrink-0" aria-hidden />{tx('Vous êtes connecté. Un téléchargement ne commence que lorsque vous appuyez sur son bouton, avec la taille affichée avant. Préférez le Wi-Fi.', 'You are online. A download only starts when you press its button, with the size shown first. Wi-Fi is best.', 'Está ligado. Uma descarga só começa quando carrega no botão, com o tamanho mostrado antes. Prefira o Wi-Fi.')}</p>
          )}

          {!offlineSupported() ? (
            <p className="rounded-2xl bg-white p-5 text-sm text-ink/70 shadow-soft">{tx('Ce navigateur ne permet pas de garder des fichiers hors ligne. Essayez Chrome, ou installez l’application.', 'This browser cannot keep files offline. Try Chrome, or install the app.', 'Este navegador não permite guardar ficheiros offline. Experimente o Chrome, ou instale a aplicação.')} <Link to="/application" className="font-semibold text-gold-700 underline">{tx('Application téléphone', 'Phone app', 'Aplicação')}</Link></p>
          ) : !items.length ? (
            <div className="rounded-2xl bg-white p-6 shadow-soft">
              <p className="font-display text-xl font-semibold text-night">{tx('Rien n’est encore téléchargé', 'Nothing downloaded yet', 'Ainda nada descarregado')}</p>
              <p className="mt-2 text-sm text-ink/70">{tx('Appuyez sur le bouton de téléchargement (flèche vers le bas) à côté d’un chapitre ou d’un chant, quand vous avez internet (de préférence en Wi-Fi).', 'Press the download button (down arrow) next to a chapter or a song while you have internet (Wi-Fi if possible).', 'Carregue no botão de descarga (seta para baixo) ao lado de um capítulo ou cântico quando tiver internet (de preferência Wi-Fi).')}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Link to="/livre-kccisme" className="rounded-full bg-night px-4 py-2 font-semibold text-gold hover:bg-deep">{tx('Livre audio « Le KCCisme »', 'Audiobook “Le KCCisme”', 'Audiolivro «Le KCCisme»')}</Link>
                <Link to="/musique" className="rounded-full border border-night/10 px-4 py-2 font-semibold text-night hover:border-gold">{tx('Chants (KCC Music)', 'Songs (KCC Music)', 'Cânticos (KCC Music)')}</Link>
                <Link to="/cantiques" className="rounded-full border border-night/10 px-4 py-2 font-semibold text-night hover:border-gold">{tx('Recueil de cantiques', 'Hymn book', 'Hinário')}</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/70">
                <p>{tx(`${items.length} élément(s) · ${formatBytes(total, locale)} sur ce téléphone`, `${items.length} item(s) · ${formatBytes(total, locale)} on this phone`, `${items.length} elemento(s) · ${formatBytes(total, locale)} neste telemóvel`)}
                  {estimate && <span className="text-ink/50"> · {tx(`place libre : ${formatBytes(Math.max(0, estimate.quota - estimate.usage), locale)}`, `free space: ${formatBytes(Math.max(0, estimate.quota - estimate.usage), locale)}`, `espaço livre: ${formatBytes(Math.max(0, estimate.quota - estimate.usage), locale)}`)}</span>}
                </p>
                {confirmAll ? (
                  <span className="flex gap-2">
                    <button type="button" onClick={() => { audio.current?.pause(); setCurrent(null); setConfirmAll(false); void removeAll(); }} className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">{tx('Oui, tout supprimer', 'Yes, delete all', 'Sim, apagar tudo')}</button>
                    <button type="button" onClick={() => setConfirmAll(false)} className="rounded-full border border-night/10 px-3 py-1.5 text-xs font-semibold">{tx('Annuler', 'Cancel', 'Cancelar')}</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmAll(true)} className="inline-flex items-center gap-1.5 rounded-full border border-night/10 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:border-red-300 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" aria-hidden />{tx('Tout supprimer', 'Delete all', 'Apagar tudo')}</button>
                )}
              </div>

              {groups.map((g) => {
                const list = sorted.filter((i) => i.kind === g.kind);
                if (!list.length) return null;
                return (
                  <div key={g.kind} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                    <h2 className="flex items-center gap-2 border-b border-night/[0.06] px-4 py-3 font-display text-lg font-semibold text-night"><span className="text-gold-600">{g.icon}</span>{g.title}</h2>
                    <ul>
                      {list.map((it) => {
                        const on = current === it.url && playing;
                        return (
                          <li key={it.url} className={cn('flex items-center gap-3 border-b border-night/[0.05] px-4 py-3 last:border-0', current === it.url && 'bg-gold-50')}>
                            {it.kind === 'recueil' ? (
                              <Link to={it.page ?? '/'} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night text-gold hover:bg-deep" aria-label={tx(`Ouvrir ${it.title}`, `Open ${it.title}`, `Abrir ${it.title}`)}><BookOpen className="h-4 w-4" /></Link>
                            ) : (
                              <button type="button" onClick={() => play(it)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night text-gold hover:bg-deep" aria-label={on ? tx('Pause', 'Pause', 'Pausa') : `${tx('Écouter', 'Play', 'Ouvir')} ${it.title}`}>
                                {on ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </button>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-night">{it.title}</p>
                              <p className="truncate text-xs text-ink/55">{[it.kind === 'chant' ? it.group : null, it.seconds ? clock(it.seconds) : null, it.bytes ? formatBytes(it.bytes, locale) : null].filter(Boolean).join(' · ')}</p>
                            </div>
                            <button type="button" onClick={() => { if (current === it.url) { audio.current?.pause(); setCurrent(null); } void removeOffline(it.url); }}
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-red-50 hover:text-red-600" aria-label={tx(`Supprimer ${it.title} du téléphone`, `Remove ${it.title} from the phone`, `Apagar ${it.title} do telemóvel`)}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              <p className="text-xs text-ink/50">{tx('Les téléchargements restent sur ce téléphone tant que vous ne videz pas les données du navigateur ou de l’application.', 'Downloads stay on this phone unless you clear the browser’s or app’s data.', 'As descargas ficam neste telemóvel enquanto não apagar os dados do navegador ou da aplicação.')}</p>
            </>
          )}
        </div>
      </section>

      <div className={cn('fixed inset-x-0 bottom-[5.5rem] z-40 border-t border-white/10 bg-night/95 text-white backdrop-blur lg:bottom-0', !now && 'hidden')}>
        <div className="container-page flex items-center gap-3 py-2">
          <p className="hidden min-w-0 max-w-[40%] truncate text-sm font-semibold text-gold-200 sm:block">{now?.title}</p>
          <audio ref={audio} controls className="h-10 min-w-0 flex-1" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); next(); }} />
        </div>
      </div>
    </div>
  );
}
