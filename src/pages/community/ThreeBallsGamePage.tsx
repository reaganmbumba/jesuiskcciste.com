import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Lightbulb, Plus, RotateCcw, Sparkles, Star, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ViewCount } from '@/features/views/ViewCount';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/Button';
import { ShareButtons } from '@/components/common/ShareButtons';
import { useI18n } from '@/i18n';
import { FAMILY_LABEL, GAME_WORDS } from '@/content/jeu-trois-signes';
import type { Sign } from '@/features/games/threeSigns';
import {
  CAPACITY, POINTS_PER_TUBE, canMove, createLevel, findHint, isCleared, move, setsForLevel, solve, type Tubes,
} from '@/features/games/threeBalls';

const BEST_KEY = 'kcc-trois-balles-record';
const LEVEL_KEY = 'kcc-trois-balles-niveau';
const SHARE_IMAGE = '/images/jeux/trois-balles-partage.jpg';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readNumber(k: string): number {
  try { return Number(localStorage.getItem(k)) || 0; } catch { return 0; }
}
function saveNumber(k: string, v: number) {
  try { localStorage.setItem(k, String(v)); } catch { /* navigation privée */ }
}

/** Les trois balles : la lettre, le nom kikongo et le dégradé de la sphère. */
const BALLS: Record<Sign, { letter: string; name: string; ball: string; text: string }> = {
  0: { letter: 'K', name: 'Nkanda', ball: 'radial-gradient(circle at 35% 30%, #FCF8EE 0%, #E5C680 28%, #C49643 62%, #7F5E26 100%)', text: 'text-night' },
  1: { letter: 'C', name: 'Wambote', ball: 'radial-gradient(circle at 35% 30%, #7C9BD1 0%, #2A4573 35%, #13223F 75%, #060C1A 100%)', text: 'text-gold-200' },
  2: { letter: 'C', name: 'Wampa', ball: 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FCF8EE 40%, #EFDBA8 80%, #C49643 100%)', text: 'text-night-700' },
};

function Ball({ sign, className = '' }: { sign: Sign; className?: string }) {
  const b = BALLS[sign];
  return (
    <span
      className={`relative grid aspect-square w-full place-items-center rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,.25),0_4px_10px_-4px_rgba(0,0,0,.6)] ${className}`}
      style={{ background: b.ball }}
      aria-label={`${b.letter} ${b.name}`}
    >
      <span className={`font-display text-[clamp(1.05rem,5.2vw,1.6rem)] font-semibold leading-none ${b.text}`}>{b.letter}</span>
      <span className="pointer-events-none absolute left-[22%] top-[14%] h-[18%] w-[30%] rounded-full bg-white/50 blur-[1px]" aria-hidden />
    </span>
  );
}

type Phase = 'play' | 'won';

/** « Le jeu des trois balles » : ranger les balles K, C, C dans les tubes pour former KCC de bas en haut. */
export default function ThreeBallsGamePage() {
  const { tx, pick } = useI18n();
  const [level, setLevel] = useState(() => readNumber(LEVEL_KEY));
  const [tubes, setTubes] = useState<Tubes>(() => createLevel(setsForLevel(readNumber(LEVEL_KEY))));
  const [start, setStart] = useState<Tubes>(tubes);
  const [history, setHistory] = useState<Tubes[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [crushing, setCrushing] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readNumber(BEST_KEY));
  const [phase, setPhase] = useState<Phase>('play');
  const [popup, setPopup] = useState<{ id: number; text: string } | null>(null);
  const [stuck, setStuck] = useState(false);
  const [extraTube, setExtraTube] = useState(false);

  const sets = setsForLevel(level);
  const par = useMemo(() => solve(start)?.length ?? sets * 4, [start, sets]);
  const lesson = GAME_WORDS[level % GAME_WORDS.length];
  const stars = moves <= par ? 3 : moves <= Math.ceil(par * 1.5) ? 2 : 1;

  useEffect(() => { if (score > best) { setBest(score); saveNumber(BEST_KEY, score); } }, [score, best]);

  const startLevel = useCallback((next: number) => {
    const t = createLevel(setsForLevel(next));
    setLevel(next);
    saveNumber(LEVEL_KEY, next);
    setTubes(t);
    setStart(t);
    setHistory([]);
    setSelected(null);
    setHint(null);
    setMoves(0);
    setPhase('play');
    setStuck(false);
    setExtraTube(false);
  }, []);

  const restart = () => {
    setTubes(start);
    setExtraTube(false);
    setHistory([]);
    setSelected(null);
    setHint(null);
    setMoves(0);
    setStuck(false);
  };

  const undo = () => {
    if (busy || history.length === 0) return;
    setTubes(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setSelected(null);
    setHint(null);
    setStuck(false);
  };

  const doMove = async (from: number, to: number) => {
    if (!canMove(tubes, from, to)) {
      setShake(to);
      setTimeout(() => setShake(null), 380);
      setSelected(null);
      return;
    }
    setBusy(true);
    setSelected(null);
    setHint(null);
    const before = tubes;
    // On montre d'abord la balle posée, puis l'écrasement.
    const placed = before.map((t) => [...t]);
    placed[to].push(placed[from].pop() as Sign);
    setTubes(placed);
    setHistory((h) => [...h, before]);
    const used = moves + 1;
    setMoves(used);
    const { tubes: after, crushed } = move(before, from, to);
    if (crushed.length > 0) {
      await wait(220);
      setCrushing(crushed);
      const pts = crushed.length * POINTS_PER_TUBE;
      setScore((s) => s + pts);
      setPopup({ id: Date.now(), text: `KCC ! +${pts}` });
      await wait(480);
      setCrushing([]);
      setTubes(after);
      // Un tube écrasé ne se défait pas : on vide l'historique pour garder les points honnêtes.
      setHistory([]);
    }
    setBusy(false);
    if (isCleared(after)) {
      const s = used <= par ? 3 : used <= Math.ceil(par * 1.5) ? 2 : 1;
      const bonus = 100 + s * 50;
      setScore((v) => v + bonus);
      setPhase('won');
      return;
    }
    setStuck(solve(after, 40000) === null);
  };

  const onTube = (i: number) => {
    if (busy || phase !== 'play') return;
    if (selected === null) {
      if (tubes[i].length > 0) setSelected(i);
      return;
    }
    if (selected === i) return setSelected(null);
    void doMove(selected, i);
  };

  /** Un tube vide en plus, une fois par niveau. */
  const addTube = () => {
    if (busy || extraTube || phase !== 'play') return;
    setTubes((t) => [...t, []]);
    setHistory((h) => h.map((t) => [...t, []]));
    setExtraTube(true);
    setStuck(false);
    setHint(null);
  };

  const showHint = () => {
    // L'indice lève la balle à déplacer et fait briller le tube où la poser.
    const h = findHint(tubes);
    setHint(h);
    setSelected(h ? h[0] : null);
    if (!h) setStuck(true);
  };

  const title = tx('Le jeu des trois balles', 'The three balls game', 'O jogo das três bolas');
  usePageMeta({
    title,
    description: tx(
      'Rangez les balles K, C et C dans les tubes : dès qu’un tube forme KCC (Nkanda au fond, puis Wambote, puis Wampa), il s’écrase et rapporte des points.',
      'Sort the K, C and C balls into the tubes: as soon as a tube spells KCC (Nkanda at the bottom, then Wambote, then Wampa), it is crushed and scores points.',
      'Arrume as bolas K, C e C nos tubos: assim que um tubo forma KCC (Nkanda no fundo, depois Wambote, depois Wampa), é esmagado e dá pontos.',
    ),
    image: SHARE_IMAGE,
  });
  const shareText = tx(
    `J’ai atteint le niveau ${level + 1} avec ${score} points au Jeu des trois balles KCC. Range les balles et construis le KCC !`,
    `I reached level ${level + 1} with ${score} points in the KCC three balls game. Sort the balls and build the KCC!`,
    `Cheguei ao nível ${level + 1} com ${score} pontos no Jogo das três bolas KCC. Arrume as bolas e construa o KCC!`,
  );

  return (
    <>
      <header className="relative isolate overflow-hidden bg-night-900 py-5 text-white sm:py-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial opacity-60" aria-hidden />
        <div className="container-page flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-gold-300"><Link to="/jeux" className="hover:text-gold-200">{tx('Jeux pour apprendre', 'Games to learn', 'Jogos para aprender')}</Link></p>
            <h1 className="mt-1 font-display text-[1.7rem] font-medium leading-tight sm:text-4xl">{title}</h1>
            <ViewCount path="/jeux/trois-balles" record tone="dark" className="mt-1" />
          </div>
          <ShareButtons title={title} text={shareText} image={SHARE_IMAGE} tone="dark" size="sm" showLabel={false} />
        </div>
      </header>

      <section className="container-page py-4 sm:py-10">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,480px)_1fr] lg:items-start">
          <div className="mx-auto w-full max-w-[480px]">
            <div className="mb-3 grid grid-cols-4 gap-2 text-center">
              <Stat label={tx('Niveau', 'Level', 'Nível')} value={level + 1} />
              <Stat label={tx('Points', 'Points', 'Pontos')} value={score} />
              <Stat label={tx('Coups', 'Moves', 'Jogadas')} value={moves} />
              <Stat label={tx('Record', 'Best', 'Recorde')} value={best} />
            </div>

            <div className="relative overflow-hidden rounded-[1.6rem] bg-night-900 px-3 pb-6 pt-10 shadow-lift sm:px-5">
              <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 mask-radial" aria-hidden />
              <p className="relative mb-6 text-center text-sm text-white/70">
                {tx(`Formez ${sets} KCC de bas en haut`, `Build ${sets} KCC from bottom to top`, `Forme ${sets} KCC de baixo para cima`)}
              </p>
              <div className="relative mx-auto grid max-w-[420px] justify-center gap-x-3 gap-y-12" style={{ gridTemplateColumns: `repeat(${Math.min(tubes.length, 5)}, minmax(0, 64px))` }}>
                {tubes.map((tube, i) => {
                  const isSel = selected === i;
                  const isHint = hint !== null && hint[1] === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onTube(i)}
                      aria-label={`${tx('Tube', 'Tube', 'Tubo')} ${i + 1}`}
                      className={[
                        'relative flex flex-col-reverse items-center gap-1 rounded-b-[2rem] rounded-t-lg border-2 border-white/70 bg-white/[0.06] px-1.5 pb-1.5 pt-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300',
                        isSel ? 'border-gold-300 bg-gold/10' : '',
                        isHint ? 'kcc-hint' : '',
                        shake === i ? 'kcc-shake' : '',
                        crushing.includes(i) ? 'kcc-tube-glow' : '',
                      ].join(' ')}
                      style={{ height: `calc(${CAPACITY} * (min(64px, 15vw) - 8px) + 26px)` }}
                    >
                      <span className="pointer-events-none absolute -top-1 left-1/2 h-1.5 w-[110%] -translate-x-1/2 rounded-full bg-gold-400" aria-hidden />
                      {tube.map((s, j) => {
                        const top = j === tube.length - 1;
                        return (
                          <Ball
                            key={j}
                            sign={s}
                            className={[
                              'transition-transform duration-200',
                              isSel && top ? '-translate-y-[calc(100%+18px)]' : '',
                              crushing.includes(i) ? 'kcc-crush' : '',
                            ].join(' ')}
                          />
                        );
                      })}
                    </button>
                  );
                })}
              </div>

              {popup && (
                <span key={popup.id} className="kcc-popup pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-display text-4xl font-semibold text-gold-300 drop-shadow-[0_2px_8px_rgba(0,0,0,.6)]" onAnimationEnd={() => setPopup(null)}>
                  {popup.text}
                </span>
              )}

              {stuck && phase === 'play' && (
                <p className="relative mt-6 rounded-2xl bg-ember/15 px-3 py-2 text-center text-sm text-white">
                  {tx('Impasse : annulez un coup, ajoutez un tube ou recommencez le niveau.', 'Dead end: undo a move, add a tube or restart the level.', 'Beco sem saída: anule uma jogada, junte um tubo ou recomece o nível.')}
                </p>
              )}

              {phase === 'won' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-night-950/80 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-xs rounded-3xl bg-white p-5 text-center shadow-lift animate-fade-up">
                    <div className="flex justify-center gap-1" aria-label={`${stars}/3`}>
                      {[1, 2, 3].map((n) => <Star key={n} className={`h-8 w-8 ${n <= stars ? 'fill-gold-400 text-gold-500' : 'text-night/20'}`} aria-hidden />)}
                    </div>
                    <p className="mt-2 font-display text-2xl font-semibold text-night">{tx(`Niveau ${level + 1} réussi !`, `Level ${level + 1} cleared!`, `Nível ${level + 1} concluído!`)}</p>
                    <p className="text-sm text-ink/65">{tx(`${moves} coups`, `${moves} moves`, `${moves} jogadas`)}</p>
                    <div className="mt-4 rounded-2xl bg-mist p-3 text-left">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-700">{pick(FAMILY_LABEL[lesson.family])} · {pick(lesson.word)}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink/80">{pick(lesson.lesson)}</p>
                    </div>
                    <Button variant="gold" className="mt-4 w-full" icon={<ArrowRight className="h-4 w-4" aria-hidden />} onClick={() => startLevel(level + 1)}>
                      {tx('Niveau suivant', 'Next level', 'Nível seguinte')}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" icon={<Undo2 className="h-4 w-4" aria-hidden />} onClick={undo} disabled={busy || history.length === 0 || phase !== 'play'}>
                {tx('Annuler', 'Undo', 'Anular')}
              </Button>
              <Button variant="outline" size="sm" icon={<Lightbulb className="h-4 w-4" aria-hidden />} onClick={showHint} disabled={busy || phase !== 'play'}>
                {tx('Indice', 'Hint', 'Dica')}
              </Button>
              <Button variant="outline" size="sm" icon={<Plus className="h-4 w-4" aria-hidden />} onClick={addTube} disabled={busy || extraTube || phase !== 'play'}>
                {tx('+ 1 tube', '+ 1 tube', '+ 1 tubo')}
              </Button>
              <Button variant="outline" size="sm" icon={<RotateCcw className="h-4 w-4" aria-hidden />} onClick={restart} disabled={busy || phase !== 'play'}>
                {tx('Recommencer', 'Restart', 'Recomeçar')}
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl bg-night-900 p-5 text-white shadow-soft">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300"><Sparkles className="h-4 w-4" aria-hidden />{tx('Comment jouer', 'How to play', 'Como jogar')}</p>
              <div className="mt-4 flex items-end justify-center gap-5">
                <div className="flex w-14 flex-col-reverse gap-1 rounded-b-[1.6rem] rounded-t-md border-2 border-white/70 p-1.5">
                  {([0, 1, 2] as Sign[]).map((s) => <Ball key={s} sign={s} />)}
                </div>
                <ul className="space-y-2 text-sm">
                  <li><b className="text-gold-200">3.</b> C Wampa · {tx('Nouveau', 'New', 'Novo')}</li>
                  <li><b className="text-gold-200">2.</b> C Wambote · {tx('Bon', 'Good', 'Bom')}</li>
                  <li><b className="text-gold-200">1.</b> K Nkanda · {tx('Message', 'Message', 'Mensagem')}</li>
                </ul>
              </div>
              <ul className="mt-5 space-y-1.5 text-sm text-white/75">
                <li>{tx('• Touchez un tube pour prendre la balle du haut, puis un autre tube pour la poser.', '• Tap a tube to pick up its top ball, then another tube to drop it.', '• Toque num tubo para pegar na bola de cima e depois noutro tubo para a pousar.')}</li>
                <li>{tx('• Chaque tube contient 3 balles. Construisez KCC de bas en haut : Nkanda au fond, Wambote au milieu, Wampa en haut.', '• Each tube holds 3 balls. Build KCC from bottom to top: Nkanda at the bottom, Wambote in the middle, Wampa on top.', '• Cada tubo leva 3 bolas. Construa KCC de baixo para cima: Nkanda no fundo, Wambote no meio, Wampa em cima.')}</li>
                <li>{tx(`• Dès qu’un tube forme KCC, il s’écrase : +${POINTS_PER_TUBE} points.`, `• As soon as a tube spells KCC, it is crushed: +${POINTS_PER_TUBE} points.`, `• Assim que um tubo forma KCC, é esmagado: +${POINTS_PER_TUBE} pontos.`)}</li>
                <li>{tx('• Écrasez tout pour passer au niveau suivant. Pas de chrono, des niveaux sans fin. Moins de coups = plus d’étoiles.', '• Crush everything to reach the next level. No timer, endless levels. Fewer moves = more stars.', '• Esmague tudo para passar ao nível seguinte. Sem cronómetro, níveis sem fim. Menos jogadas = mais estrelas.')}</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <p className="mb-3 text-sm font-semibold text-night">{tx('Défiez vos amis avec votre niveau', 'Challenge your friends with your level', 'Desafie os seus amigos com o seu nível')}</p>
              <ShareButtons url="/jeux/trois-balles" title={title} text={shareText} image={SHARE_IMAGE} showLabel={false} />
              <Link to="/jeux/trois-signes" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-night hover:text-gold-700">
                {tx('Essayer aussi le jeu des trois signes', 'Also try the three signs game', 'Experimente também o jogo dos três sinais')} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white px-1 py-2 shadow-soft">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">{label}</p>
      <p className="font-display text-xl font-semibold leading-tight text-night tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}
