import { ViewCount } from '@/features/views/ViewCount';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Lightbulb, RotateCcw, Sparkles, Trophy, ArrowRight, Shuffle } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/Button';
import { ShareButtons } from '@/components/common/ShareButtons';
import { useI18n } from '@/i18n';
import { FAMILY_LABEL, GAME_WORDS } from '@/content/jeu-trois-signes';
import {
  areNeighbours, createBoard, findHint, letterIndexes, movesForWord, normalizeWord, resolve, revealLetters, stepPoints, swapCells,
  type Board, type Cell, type Sign,
} from '@/features/games/threeSigns';

const BEST_KEY = 'kcc-trois-signes-record';
const SHARE_IMAGE = '/images/jeux/trois-signes-partage.jpg';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const key = (r: number, c: number) => `${r}:${c}`;

function readBest(): number {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
}
function saveBest(v: number) {
  try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* navigation privée */ }
}

/** Les trois signes : la lettre, son nom kikongo et sa couleur. */
const SIGNS: Record<Sign, { letter: string; name: string; tile: string; sub: string }> = {
  0: { letter: 'K', name: 'Nkanda', tile: 'bg-gradient-to-b from-gold-200 to-gold-500 text-night ring-1 ring-inset ring-white/50 shadow-[0_6px_14px_-6px_rgba(166,123,48,.9)]', sub: 'text-night/70' },
  1: { letter: 'C', name: 'Wambote', tile: 'bg-gradient-to-b from-night-500 to-night-800 text-gold-200 ring-1 ring-inset ring-gold/40 shadow-[0_6px_14px_-6px_rgba(10,18,38,.9)]', sub: 'text-gold-200/80' },
  2: { letter: 'C', name: 'Wampa', tile: 'bg-gradient-to-b from-white to-gold-50 text-night-700 ring-2 ring-inset ring-gold-400 shadow-[0_6px_14px_-6px_rgba(14,24,48,.45)]', sub: 'text-gold-700' },
};

type Phase = 'play' | 'won' | 'lost';

/** « Le jeu des trois signes » : construire KCC avec les signes Nkanda, Wambote, Wampa pour découvrir les mots de la foi. */
export default function ThreeSignsGamePage() {
  const { tx, pick } = useI18n();
  const [level, setLevel] = useState(0);
  const entry = GAME_WORDS[level % GAME_WORDS.length];
  const word = pick(entry.word);
  const totalLetters = useMemo(() => letterIndexes(word).length, [word]);

  const [board, setBoard] = useState<Board>(() => createBoard());
  const [selected, setSelected] = useState<Cell | null>(null);
  const [crushing, setCrushing] = useState<Set<string>>(new Set());
  const [falling, setFalling] = useState<Set<string>>(new Set());
  const [shaking, setShaking] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [levelStartScore, setLevelStartScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [moves, setMoves] = useState(() => movesForWord(word));
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<Phase>('play');
  const [popup, setPopup] = useState<{ id: number; text: string } | null>(null);
  const [kccTotal, setKccTotal] = useState(0);
  const [guess, setGuess] = useState('');
  const [guessWrong, setGuessWrong] = useState(false);
  const [guessOpen, setGuessOpen] = useState(false);
  const pointer = useRef<{ cell: Cell; x: number; y: number; done: boolean } | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout>>();

  const revealedRef = useRef(revealed);
  revealedRef.current = revealed;

  // Changement de langue : le mot change, on recommence sa découverte.
  useEffect(() => { setRevealed(new Set()); }, [word]);

  useEffect(() => { if (score > best) { setBest(score); saveBest(score); } }, [score, best]);

  // Indice automatique après 10 secondes sans jouer.
  useEffect(() => {
    clearTimeout(idle.current);
    if (phase !== 'play' || busy) return;
    idle.current = setTimeout(() => {
      const h = findHint(board);
      if (h) setHint(new Set(h.map(([r, c]) => key(r, c))));
    }, 10000);
    return () => clearTimeout(idle.current);
  }, [board, phase, busy]);

  const startLevel = useCallback((next: number, keepScore: number) => {
    const w = pick(GAME_WORDS[next % GAME_WORDS.length].word);
    setLevel(next);
    setBoard(createBoard());
    setMoves(movesForWord(w));
    setRevealed(new Set());
    setPhase('play');
    setSelected(null);
    setHint(new Set());
    setGuess('');
    setGuessWrong(false);
    setGuessOpen(false);
    setScore(keepScore);
    setLevelStartScore(keepScore);
  }, [pick]);

  const finishWord = useCallback((movesLeft: number, extraLetters = 0) => {
    const bonus = 100 + movesLeft * 10 + extraLetters * 20;
    setScore((s) => s + bonus);
    setPopup({ id: Date.now(), text: `+${bonus}` });
    setPhase('won');
  }, []);

  const trySwap = useCallback(async (a: Cell, b: Cell) => {
    if (busy || phase !== 'play' || !areNeighbours(a, b)) return;
    setSelected(null);
    setHint(new Set());
    const swapped = swapCells(board, a, b);
    const steps = resolve(swapped);
    if (steps.length === 0) {
      // Aucun KCC : les signes reviennent à leur place.
      const s = new Set([key(...a), key(...b)]);
      setShaking(s);
      setTimeout(() => setShaking(new Set()), 380);
      return;
    }
    setBusy(true);
    setBoard(swapped);
    await wait(140);
    let gained = 0;
    let kccs = 0;
    let current = swapped;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setCrushing(new Set(step.crushed.map(([r, c]) => key(r, c))));
      const pts = stepPoints(step, i);
      gained += pts;
      kccs += step.kccCount;
      setPopup({ id: Date.now() + i, text: i > 0 ? `+${pts} ×${i + 1}` : `+${pts}` });
      await wait(340);
      setCrushing(new Set());
      setFalling(new Set(step.moved.map(([r, c]) => key(r, c))));
      setBoard(step.board);
      current = step.board;
      await wait(300);
      setFalling(new Set());
    }
    // Plus aucun coup possible : on mélange.
    if (!findHint(current)) setBoard(createBoard());
    const nextRevealed = revealLetters(word, revealedRef.current, kccs);
    const movesLeft = moves - 1;
    setScore((s) => s + gained);
    setKccTotal((t) => t + kccs);
    setRevealed(nextRevealed);
    setMoves(movesLeft);
    setBusy(false);
    if (nextRevealed.size >= totalLetters) finishWord(movesLeft);
    else if (movesLeft <= 0) setPhase('lost');
  }, [board, busy, phase, word, moves, totalLetters, finishWord]);

  const onTap = (cell: Cell) => {
    if (busy || phase !== 'play') return;
    if (!selected) return setSelected(cell);
    if (selected[0] === cell[0] && selected[1] === cell[1]) return setSelected(null);
    if (areNeighbours(selected, cell)) void trySwap(selected, cell);
    else setSelected(cell);
  };

  const onPointerDown = (cell: Cell, e: ReactPointerEvent) => {
    pointer.current = { cell, x: e.clientX, y: e.clientY, done: false };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const p = pointer.current;
    if (!p || p.done) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    p.done = true;
    const [r, c] = p.cell;
    const target: Cell = Math.abs(dx) > Math.abs(dy) ? [r, c + Math.sign(dx)] : [r + Math.sign(dy), c];
    if (target[0] >= 0 && target[1] >= 0 && target[0] < board.length && target[1] < board.length) void trySwap(p.cell, target);
  };
  const onPointerUp = (cell: Cell) => {
    const p = pointer.current;
    pointer.current = null;
    if (p && !p.done) onTap(cell);
  };

  const showHint = () => {
    const h = findHint(board);
    if (h) setHint(new Set(h.map(([r, c]) => key(r, c))));
  };

  const submitGuess = (e: FormEvent) => {
    e.preventDefault();
    if (phase !== 'play' || !guess.trim()) return;
    if (normalizeWord(guess) === normalizeWord(word)) {
      const hidden = totalLetters - revealed.size;
      setRevealed(new Set(letterIndexes(word)));
      finishWord(moves, hidden);
    } else {
      setGuessWrong(true);
      setTimeout(() => setGuessWrong(false), 900);
    }
  };

  const title = tx('Le jeu des trois signes', 'The three signs game', 'O jogo dos três sinais');
  usePageMeta({ title, description: tx(
          'Échangez deux signes voisins pour écrire K-C-C. Chaque KCC s’écrase, rapporte des points et découvre une lettre du mot caché : noms bibliques, attributs de l’Éternel et mots de la foi KCC.',
          'Swap two neighbouring signs to spell K-C-C. Each KCC is crushed, scores points and reveals a letter of the hidden word: Bible names, attributes of the Eternal and words of the KCC faith.',
          'Troque dois sinais vizinhos para escrever K-C-C. Cada KCC é esmagado, dá pontos e revela uma letra da palavra escondida: nomes bíblicos, atributos do Eterno e palavras da fé KCC.',
        ), image: SHARE_IMAGE });

  const shareText = tx(
    `J’ai fait ${score} points au Jeu des trois signes KCC (niveau ${level + 1}). Construis le KCC et découvre les mots de la foi !`,
    `I scored ${score} points in the KCC three signs game (level ${level + 1}). Build the KCC and discover the words of the faith!`,
    `Fiz ${score} pontos no Jogo dos três sinais KCC (nível ${level + 1}). Construa o KCC e descubra as palavras da fé!`,
  );

  return (
    <>
      <header className="relative isolate overflow-hidden bg-night-900 py-5 text-white sm:py-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial opacity-60" aria-hidden />
        <div className="container-page flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-gold-300">{tx('Jeux pour apprendre', 'Games to learn', 'Jogos para aprender')}</p>
            <h1 className="mt-1 font-display text-[1.7rem] font-medium leading-tight sm:text-4xl">{title}</h1>
            <ViewCount path="/jeux/trois-signes" record tone="dark" className="mt-1" />
          </div>
          <ShareButtons title={title} text={shareText} image={SHARE_IMAGE} tone="dark" size="sm" showLabel={false} />
        </div>
      </header>

      <section className="container-page py-4 sm:py-10">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,440px)_1fr] lg:items-start">
          {/* Plateau */}
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <Stat label={tx('Points', 'Points', 'Pontos')} value={score} />
              <Stat label={tx('Coups', 'Moves', 'Jogadas')} value={moves} warn={moves <= 3 && phase === 'play'} />
              <Stat label={tx('Record', 'Best', 'Recorde')} value={best} />
            </div>

            <div className="mb-3 rounded-3xl border border-night/[0.06] bg-white p-4 shadow-soft sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                  {tx('Niveau', 'Level', 'Nível')} {level + 1} · {pick(FAMILY_LABEL[entry.family])}
                </p>
                <span className="text-xs text-ink/60">{revealed.size}/{totalLetters}</span>
              </div>
              <p className="mt-1 text-[15px] font-medium leading-snug text-night">{pick(entry.clue)}</p>
              <div className="mt-3 flex flex-wrap gap-1" aria-live="polite">
                {[...word].map((ch, i) => {
                  const isLetter = /\p{L}/u.test(ch);
                  if (!isLetter) return <span key={i} className="grid h-9 w-3 place-items-center font-display text-xl text-night/50">{ch}</span>;
                  const shown = revealed.has(i);
                  return (
                    <span key={i} className={`grid h-9 w-8 place-items-center rounded-lg border-2 font-display text-lg font-semibold transition ${shown ? 'kcc-letter border-gold-400 bg-gold-50 text-night' : 'border-night/15 bg-mist text-transparent'}`}>
                      {shown ? ch : '·'}
                    </span>
                  );
                })}
              </div>
              {!guessOpen ? (
                <button type="button" onClick={() => setGuessOpen(true)} disabled={phase !== 'play'} className="mt-3 text-sm font-semibold text-gold-700 underline-offset-4 hover:underline disabled:opacity-50">
                  {tx('Je connais le mot (+20 points par lettre cachée)', 'I know the word (+20 points per hidden letter)', 'Eu sei a palavra (+20 pontos por letra escondida)')}
                </button>
              ) : (
              <form onSubmit={submitGuess} className="mt-3 flex gap-2">
                <input
                  autoFocus
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={phase !== 'play'}
                  placeholder={tx('Je connais le mot…', 'I know the word…', 'Eu sei a palavra…')}
                  aria-label={tx('Proposer le mot', 'Guess the word', 'Propor a palavra')}
                  className={`h-11 min-w-0 flex-1 rounded-full border bg-white px-4 text-sm uppercase outline-none focus:border-gold-400 ${guessWrong ? 'kcc-shake border-red-400' : 'border-night/12'}`}
                />
                <Button type="submit" variant="primary" disabled={phase !== 'play' || !guess.trim()}>{tx('Valider', 'Check', 'Validar')}</Button>
              </form>
              )}
            </div>

            <div className="relative overflow-hidden rounded-[1.6rem] bg-night-900 p-2 shadow-lift sm:p-3" onPointerMove={onPointerMove} onPointerLeave={() => { pointer.current = null; }}>
              <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-grid opacity-40 mask-radial" aria-hidden />
              <div className="relative grid touch-none select-none gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))` }} role="grid" aria-label={tx('Grille des signes', 'Grid of signs', 'Grelha dos sinais')}>
                {board.map((row, r) => row.map((s, c) => {
                  const k = key(r, c);
                  const sign = SIGNS[s];
                  const isSel = selected?.[0] === r && selected?.[1] === c;
                  return (
                    <button
                      key={k}
                      type="button"
                      role="gridcell"
                      aria-label={`${sign.letter} ${sign.name}`}
                      onPointerDown={(e) => onPointerDown([r, c], e)}
                      onPointerUp={() => onPointerUp([r, c])}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap([r, c]); } }}
                      className={[
                        'relative flex aspect-square flex-col items-center justify-center rounded-xl transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300',
                        sign.tile,
                        isSel ? 'scale-[1.08] ring-4 ring-gold-300 z-10' : '',
                        crushing.has(k) ? 'kcc-crush z-10' : '',
                        falling.has(k) ? 'kcc-fall' : '',
                        shaking.has(k) ? 'kcc-shake' : '',
                        hint.has(k) && !isSel ? 'kcc-hint' : '',
                      ].join(' ')}
                    >
                      <span className="font-display text-[clamp(1.1rem,6vw,1.75rem)] font-semibold leading-none">{sign.letter}</span>
                      <span className={`mt-0.5 text-[clamp(6px,1.9vw,9px)] font-semibold uppercase tracking-wide ${sign.sub}`}>{sign.name}</span>
                    </button>
                  );
                }))}
              </div>

              {popup && (
                <span key={popup.id} className="kcc-popup pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 font-display text-4xl font-semibold text-gold-300 drop-shadow-[0_2px_8px_rgba(0,0,0,.6)]" onAnimationEnd={() => setPopup(null)}>
                  {popup.text}
                </span>
              )}

              {phase !== 'play' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[1.6rem] bg-night-950/80 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-xs rounded-3xl bg-white p-5 text-center shadow-lift animate-fade-up">
                    {phase === 'won' ? <Trophy className="mx-auto h-9 w-9 text-gold-500" aria-hidden /> : <RotateCcw className="mx-auto h-9 w-9 text-night/60" aria-hidden />}
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{pick(FAMILY_LABEL[entry.family])}</p>
                    <p className="mt-1 font-display text-3xl font-semibold text-night">{word}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink/75">{pick(entry.lesson)}</p>
                    <p className="mt-3 text-sm font-semibold text-night">
                      {phase === 'won'
                        ? tx('Bravo, mot découvert !', 'Well done, word found!', 'Parabéns, palavra descoberta!')
                        : tx('Plus de coups… Réessayez !', 'Out of moves… Try again!', 'Sem jogadas… Tente de novo!')}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      {phase === 'won' ? (
                        <Button variant="gold" icon={<ArrowRight className="h-4 w-4" aria-hidden />} onClick={() => startLevel(level + 1, score)}>
                          {tx('Niveau suivant', 'Next level', 'Nível seguinte')}
                        </Button>
                      ) : (
                        <>
                          <Button variant="gold" icon={<RotateCcw className="h-4 w-4" aria-hidden />} onClick={() => startLevel(level, levelStartScore)}>
                            {tx('Rejouer ce niveau', 'Replay this level', 'Repetir este nível')}
                          </Button>
                          <Button variant="outline" onClick={() => startLevel(level + 1, levelStartScore)}>
                            {tx('Passer au mot suivant', 'Skip to the next word', 'Passar à palavra seguinte')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" icon={<Lightbulb className="h-4 w-4" aria-hidden />} onClick={showHint} disabled={busy || phase !== 'play'}>
                {tx('Indice', 'Hint', 'Dica')}
              </Button>
              <Button variant="outline" size="sm" icon={<Shuffle className="h-4 w-4" aria-hidden />} onClick={() => startLevel(0, 0)} disabled={busy}>
                {tx('Nouvelle partie', 'New game', 'Novo jogo')}
              </Button>
            </div>
          </div>

          {/* Règles et partage */}
          <div className="space-y-5">

            <div className="rounded-3xl bg-night-900 p-5 text-white shadow-soft">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300"><Sparkles className="h-4 w-4" aria-hidden />{tx('Les trois signes', 'The three signs', 'Os três sinais')}</p>
              <ul className="mt-3 grid grid-cols-3 gap-2">
                {([0, 1, 2] as Sign[]).map((s) => (
                  <li key={s} className="text-center">
                    <span className={`mx-auto grid h-12 w-12 place-items-center rounded-xl font-display text-2xl font-semibold ${SIGNS[s].tile}`}>{SIGNS[s].letter}</span>
                    <p className="mt-1.5 text-sm font-semibold">{SIGNS[s].name}</p>
                    <p className="text-xs text-white/60">{[tx('Message', 'Message', 'Mensagem'), tx('Bon', 'Good', 'Bom'), tx('Nouveau', 'New', 'Novo')][s]}</p>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 space-y-1.5 text-sm text-white/75">
                <li>{tx('• Lisez dans l’ordre : Nkanda, Wambote, Wampa, de gauche à droite ou de haut en bas.', '• Read in order: Nkanda, Wambote, Wampa, left to right or top to bottom.', '• Leia por ordem: Nkanda, Wambote, Wampa, da esquerda para a direita ou de cima para baixo.')}</li>
                <li>{tx('• Glissez un signe ou touchez deux signes voisins pour les échanger.', '• Swipe a sign or tap two neighbouring signs to swap them.', '• Deslize um sinal ou toque em dois sinais vizinhos para os trocar.')}</li>
                <li>{tx('• 30 points par KCC, doublés puis triplés quand ils s’enchaînent.', '• 30 points per KCC, doubled then tripled when they chain.', '• 30 pontos por KCC, duplicados e triplicados em cadeia.')}</li>
                <li>{tx('• Mot découvert : 100 points + 10 par coup restant.', '• Word found: 100 points + 10 per move left.', '• Palavra descoberta: 100 pontos + 10 por jogada restante.')}</li>
              </ul>
              <p className="mt-4 text-xs text-white/50">{tx(`KCC construits : ${kccTotal}`, `KCC built: ${kccTotal}`, `KCC construídos: ${kccTotal}`)}</p>
            </div>

            <div className="rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft">
              <p className="mb-3 text-sm font-semibold text-night">{tx('Défiez vos amis avec votre score', 'Challenge your friends with your score', 'Desafie os seus amigos com a sua pontuação')}</p>
              <ShareButtons url="/jeux/trois-signes" title={tx('Le jeu des trois signes KCC', 'The KCC three signs game', 'O jogo dos três sinais KCC')} text={shareText} image={SHARE_IMAGE} showLabel={false} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={`rounded-2xl px-2 py-2 shadow-soft ${warn ? 'bg-ember/15 ring-1 ring-ember/50' : 'bg-white'}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/55">{label}</p>
      <p className="font-display text-2xl font-semibold leading-tight text-night tabular-nums">{value}</p>
    </div>
  );
}
