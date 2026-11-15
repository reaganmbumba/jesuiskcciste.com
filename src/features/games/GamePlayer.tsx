import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Medal, Trophy, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { OfficialParishList, OFFICIAL_PARISH_LIST_ID } from '@/components/common/OfficialParishList';
import { useI18n } from '@/i18n';
import { readPlayer, savePlayer, topScores, validPlayer, cleanPlayer, type GameId, type LeaderboardRow, type Player } from './scores';

/** Joueur gardé dans le téléphone ; null tant qu'il n'a pas donné son nom et sa paroisse. */
export function usePlayer() {
  const [player, setPlayerState] = useState<Player | null>(readPlayer);
  const setPlayer = useCallback((p: Player | null) => {
    if (p) savePlayer(p);
    setPlayerState(p ? cleanPlayer(p) : null);
  }, []);
  return [player, setPlayer] as const;
}

/** Formulaire demandé avant de jouer : nom et paroisse (liste officielle proposée). */
export function PlayerForm({ initial, onSave, onCancel }: { initial?: Player | null; onSave: (p: Player) => void; onCancel?: () => void }) {
  const { tx } = useI18n();
  const [name, setName] = useState(initial?.name ?? '');
  const [parish, setParish] = useState(initial?.parish ?? '');
  const [error, setError] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = { name, parish };
    if (!validPlayer(p)) return setError(true);
    onSave(cleanPlayer(p));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-lift animate-fade-up sm:max-w-sm sm:rounded-3xl sm:pb-5">
        <UserRound className="mx-auto h-9 w-9 text-gold-500" aria-hidden />
        <h2 className="mt-2 text-center font-display text-2xl font-semibold text-night">{tx('Qui joue ?', 'Who is playing?', 'Quem joga?')}</h2>
        <p className="mt-1 text-center text-sm text-ink/65">
          {tx('Votre nom et votre paroisse apparaîtront dans le classement des meilleurs scores.', 'Your name and parish will appear in the best scores ranking.', 'O seu nome e a sua paróquia aparecerão na classificação das melhores pontuações.')}
        </p>
        <div className="mt-4 space-y-3">
          <Field label={tx('Votre nom', 'Your name', 'O seu nome')} required>
            {(f) => <Input {...f} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" placeholder={tx('Ex. : Reagan M.', 'E.g. Reagan M.', 'Ex.: Reagan M.')} />}
          </Field>
          <Field label={tx('Votre paroisse', 'Your parish', 'A sua paróquia')} required hint={tx('Choisissez dans la liste ou écrivez-la.', 'Pick from the list or type it.', 'Escolha na lista ou escreva-a.')}>
            {(f) => <Input {...f} value={parish} onChange={(e) => setParish(e.target.value)} maxLength={120} list={OFFICIAL_PARISH_LIST_ID} placeholder={tx('Ex. : Paroisse de Matete', 'E.g. Matete parish', 'Ex.: Paróquia de Matete')} />}
          </Field>
          <OfficialParishList />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{tx('Indiquez votre nom et votre paroisse (2 lettres au moins).', 'Enter your name and parish (at least 2 letters).', 'Indique o seu nome e a sua paróquia (2 letras pelo menos).')}</p>}
        <Button type="submit" variant="gold" className="mt-4 w-full">{tx('Commencer à jouer', 'Start playing', 'Começar a jogar')}</Button>
        {onCancel && <button type="button" onClick={onCancel} className="mt-2 w-full text-sm text-ink/60 hover:text-night">{tx('Annuler', 'Cancel', 'Cancelar')}</button>}
      </form>
    </div>
  );
}

/** « Joueur : Nom · Paroisse » avec le lien pour changer. */
export function PlayerBadge({ player, onChange }: { player: Player; onChange: () => void }) {
  const { tx } = useI18n();
  return (
    <p className="mb-3 flex flex-wrap items-center justify-center gap-x-2 text-sm text-ink/70">
      <UserRound className="h-4 w-4 text-gold-600" aria-hidden />
      <span><b className="text-night">{player.name}</b> · {player.parish}</span>
      <button type="button" onClick={onChange} className="font-semibold text-gold-700 underline-offset-4 hover:underline">{tx('changer', 'change', 'mudar')}</button>
    </p>
  );
}

/** Les 5 meilleurs joueurs du jeu, rechargés quand `refreshKey` change. */
export function Leaderboard({ game, refreshKey, player }: { game: GameId; refreshKey: number; player: Player | null }) {
  const { tx } = useI18n();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    topScores(game, 5)
      .then((r) => { if (alive) { setRows(r); setFailed(false); } })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [game, refreshKey]);
  const isMe = (r: LeaderboardRow) => !!player && r.playerName.toLowerCase() === player.name.toLowerCase() && r.parish.toLowerCase() === player.parish.toLowerCase();
  const medal = ['text-gold-500', 'text-slate-400', 'text-amber-700'];
  return (
    <div className="rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600"><Trophy className="h-4 w-4" aria-hidden />{tx('Les 5 meilleurs scores', 'Top 5 scores', 'As 5 melhores pontuações')}</p>
      {failed ? (
        <p className="mt-3 text-sm text-ink/60">{tx('Classement indisponible pour le moment.', 'Ranking unavailable for now.', 'Classificação indisponível de momento.')}</p>
      ) : rows === null ? (
        <p className="mt-3 text-sm text-ink/60">{tx('Chargement…', 'Loading…', 'A carregar…')}</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink/60">{tx('Personne encore : terminez un niveau pour être le premier !', 'Nobody yet: finish a level to be the first!', 'Ninguém ainda: termine um nível para ser o primeiro!')}</p>
      ) : (
        <ol className="mt-3 divide-y divide-night/[0.06]">
          {rows.map((r, i) => (
            <li key={`${r.playerName}-${r.parish}`} className={`flex items-center gap-3 py-2.5 ${isMe(r) ? 'rounded-xl bg-gold-50 px-2' : ''}`}>
              <span className="grid w-7 place-items-center font-display text-lg font-semibold text-night/50">
                {i < 3 ? <Medal className={`h-5 w-5 ${medal[i]}`} aria-label={`${i + 1}`} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-night">{r.playerName}</span>
                <span className="block truncate text-xs text-ink/60">{r.parish}</span>
              </span>
              <span className="text-right">
                <span className="block font-display text-lg font-semibold tabular-nums text-night">{r.score}</span>
                <span className="block text-[11px] text-ink/55">{tx('niv.', 'lvl', 'nív.')} {r.level}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
