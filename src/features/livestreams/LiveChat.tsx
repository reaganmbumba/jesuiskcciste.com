import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff, Heart, MessageCircle, Send, Users } from 'lucide-react';
import { useOptionalToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/i18n';
import { can } from '@/lib/permissions';
import { cn, formatTime } from '@/utils/format';
import { addLiveComment, connectLive, LIVE_COMMENT_MAX, LIVE_NAME_MAX, listLiveComments, nameColor, setLiveCommentHidden, type LiveComment, type LiveConnection } from './liveChat';

const NAME_KEY = 'kcc.live.name';
const OVERLAY_MS = 16000;   // un commentaire reste 16 s sur la vidéo
const OVERLAY_MAX = 5;

interface Floating { c: LiveComment; at: number }
interface FloatHeart { id: number; x: number; hue: number }

const STYLE = `
@keyframes kccLiveIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes kccHeart{0%{opacity:0;transform:translate(0,0) scale(.6)}15%{opacity:1;transform:translate(0,-20px) scale(1.1)}100%{opacity:0;transform:translate(var(--dx),-220px) scale(.9)}}
.kcc-live-in{animation:kccLiveIn .35s ease-out both}
.kcc-heart{animation:kccHeart 2.4s ease-out forwards}
@media (prefers-reduced-motion:reduce){.kcc-live-in,.kcc-heart{animation:none}}
`;

/**
 * Le lecteur du direct avec ses commentaires : ils défilent sur la vidéo
 * (comme sur TikTok), on commente sous le lecteur, on envoie des cœurs.
 */
export function LiveChat({ since, player }: { since: string; player: ReactNode }) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const toast = useOptionalToast();
  const moderator = can(profile, 'moderation');
  const profileName = profile ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() : '';

  const [all, setAll] = useState<LiveComment[]>([]);
  const [floating, setFloating] = useState<Floating[]>([]);
  const [hearts, setHearts] = useState<FloatHeart[]>([]);
  const [viewers, setViewers] = useState<number | null>(null);
  const [overlay, setOverlay] = useState(true);
  const [showList, setShowList] = useState(false);
  const [name, setName] = useState(() => { try { return localStorage.getItem(NAME_KEY) ?? localStorage.getItem('kcc.debate.name') ?? ''; } catch { return ''; } });
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const conn = useRef<LiveConnection | null>(null);
  const seen = useRef(new Set<string>());
  const heartId = useRef(0);
  const lastHeart = useRef(0);

  const push = useCallback((c: LiveComment, float = true) => {
    if (seen.current.has(c.id)) return;
    seen.current.add(c.id);
    setAll((l) => [...l, c].slice(-300));
    if (float) setFloating((f) => [...f, { c, at: Date.now() }].slice(-OVERLAY_MAX));
  }, []);
  const hide = useCallback((id: string) => {
    setAll((l) => l.filter((c) => c.id !== id));
    setFloating((f) => f.filter((x) => x.c.id !== id));
  }, []);
  const addHeart = useCallback(() => {
    const id = ++heartId.current;
    setHearts((h) => [...h.slice(-24), { id, x: Math.random() * 40 - 20, hue: Math.floor(Math.random() * 40) - 10 }]);
    window.setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 2500);
  }, []);

  useEffect(() => {
    let alive = true;
    listLiveComments(since).then((list) => {
      if (!alive) return;
      list.forEach((c) => push(c, false));
      // Les trois derniers apparaissent aussi sur la vidéo à l'arrivée.
      setFloating(list.slice(-3).map((c) => ({ c, at: Date.now() })));
    }).catch(() => { /* table pas encore créée : on commente quand même */ });
    conn.current = connectLive({ onComment: (c) => push(c), onHide: hide, onHeart: addHeart, onViewers: setViewers });
    return () => { alive = false; conn.current?.close(); conn.current = null; };
  }, [since, push, hide, addHeart]);

  // Les commentaires quittent la vidéo au bout de 16 s.
  useEffect(() => {
    const t = window.setInterval(() => setFloating((f) => (f.some((x) => Date.now() - x.at > OVERLAY_MS) ? f.filter((x) => Date.now() - x.at <= OVERLAY_MS) : f)), 1000);
    return () => window.clearInterval(t);
  }, []);

  const author = profileName || name;
  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    if (author.trim().length < 2) { toast?.notify(tx('Indiquez votre nom (2 lettres au moins).', 'Enter your name (at least 2 letters).', 'Indique o seu nome (2 letras no mínimo).'), 'error'); return; }
    setSending(true);
    try {
      const c = await addLiveComment(author, body);
      push(c);
      setText('');
      if (!profileName) { try { localStorage.setItem(NAME_KEY, name.trim()); } catch { /* stockage indisponible */ } }
    } catch (err) {
      const msg = (err as { message?: string } | null)?.message ?? '';
      toast?.notify(/Patientez|Trop de/.test(msg) ? msg : tx('Le commentaire n’a pas pu être envoyé. Réessayez.', 'The comment could not be sent. Try again.', 'Não foi possível enviar o comentário. Tente de novo.'), 'error');
    } finally { setSending(false); }
  }
  function heart() {
    addHeart();
    const now = Date.now();
    if (now - lastHeart.current > 250) { lastHeart.current = now; conn.current?.sendHeart(); }
  }
  async function moderate(c: LiveComment) {
    try { await setLiveCommentHidden(c.id, true); hide(c.id); conn.current?.sendHide(c.id); }
    catch { toast?.notify(tx('Impossible de masquer ce commentaire.', 'Could not hide this comment.', 'Não foi possível ocultar este comentário.'), 'error'); }
  }

  return (
    <div className="mt-5">
      <style>{STYLE}</style>
      <div className="relative">
        {player}
        {/* Commentaires sur la vidéo */}
        {overlay && (
          <div className="pointer-events-none absolute bottom-12 left-2 right-16 flex max-h-[62%] flex-col justify-end gap-1.5 overflow-hidden sm:bottom-14 sm:left-3 sm:right-24"
            style={{ WebkitMaskImage: 'linear-gradient(transparent, #000 22%)', maskImage: 'linear-gradient(transparent, #000 22%)' }} aria-live="polite">
            {floating.map(({ c }) => (
              <div key={c.id} className="kcc-live-in flex max-w-[92%] items-start gap-2 self-start rounded-2xl bg-black/45 px-2.5 py-1.5 text-white backdrop-blur-sm sm:max-w-[70%]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: nameColor(c.authorName) }} aria-hidden>{c.authorName[0]?.toUpperCase()}</span>
                <span className="min-w-0 text-[13px] leading-snug sm:text-sm">
                  <b className="mr-1.5 font-semibold text-gold-300">{c.authorName}</b>
                  <span className="break-words">{c.body}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        {/* Cœurs */}
        <div className="pointer-events-none absolute bottom-14 right-4 h-0 w-10 sm:right-6" aria-hidden>
          {hearts.map((h) => (
            <Heart key={h.id} className="kcc-heart absolute bottom-0 left-1/2 h-7 w-7 fill-current" style={{ color: `hsl(${350 + h.hue},90%,60%)`, '--dx': `${h.x}px` } as CSSProperties} />
          ))}
        </div>
        {viewers != null && viewers > 0 && (
          <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white sm:left-3 sm:top-3">
            <Users className="h-3.5 w-3.5" aria-hidden />{viewers} {tx(viewers > 1 ? 'spectateurs' : 'spectateur', viewers > 1 ? 'viewers' : 'viewer', viewers > 1 ? 'espectadores' : 'espectador')}
          </span>
        )}
      </div>

      {/* Saisie */}
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        {!profileName && (
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={LIVE_NAME_MAX} placeholder={tx('Votre nom', 'Your name', 'O seu nome')} aria-label={tx('Votre nom', 'Your name', 'O seu nome')}
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-gold-300 focus:outline-none sm:w-40" />
        )}
        <div className="flex flex-1 items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={LIVE_COMMENT_MAX} placeholder={tx('Écrivez un commentaire…', 'Write a comment…', 'Escreva um comentário…')} aria-label={tx('Commentaire', 'Comment', 'Comentário')}
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-gold-300 focus:outline-none" />
          <button type="submit" disabled={sending || !text.trim()} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-night-950 transition hover:bg-gold-300 disabled:opacity-50" aria-label={tx('Envoyer', 'Send', 'Enviar')}>
            <Send className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" onClick={heart} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#ff4d6d] transition hover:bg-white/20 active:scale-95" aria-label={tx('Envoyer un cœur', 'Send a heart', 'Enviar um coração')}>
            <Heart className="h-5 w-5 fill-current" aria-hidden />
          </button>
        </div>
      </form>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
        <button type="button" onClick={() => setOverlay((o) => !o)} className="inline-flex items-center gap-1 hover:text-white">
          {overlay ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
          {overlay ? tx('Masquer les commentaires sur la vidéo', 'Hide comments on the video', 'Ocultar comentários no vídeo') : tx('Afficher les commentaires sur la vidéo', 'Show comments on the video', 'Mostrar comentários no vídeo')}
        </button>
        <button type="button" onClick={() => setShowList((s) => !s)} className="inline-flex items-center gap-1 hover:text-white">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />{tx(`Tous les commentaires (${all.length})`, `All comments (${all.length})`, `Todos os comentários (${all.length})`)}
        </button>
        <span>{tx('Vos commentaires peuvent apparaître dans la vidéo du direct.', 'Your comments may appear in the live video.', 'Os seus comentários podem aparecer no vídeo do direto.')}</span>
      </div>

      {showList && (
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto rounded-2xl bg-white/5 p-3">
          {all.length === 0 && <li className="text-sm text-white/60">{tx('Aucun commentaire pour le moment. Soyez le premier !', 'No comments yet. Be the first!', 'Ainda não há comentários. Seja o primeiro!')}</li>}
          {[...all].reverse().map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: nameColor(c.authorName) }} aria-hidden>{c.authorName[0]?.toUpperCase()}</span>
              <span className="min-w-0 flex-1 text-white/90"><b className="mr-1.5 text-gold-300">{c.authorName}</b>{c.body}<span className="ml-2 text-[11px] text-white/40">{formatTime(c.createdAt)}</span></span>
              {moderator && (
                <button type="button" onClick={() => moderate(c)} className={cn('shrink-0 rounded-lg px-2 py-0.5 text-[11px] text-white/60 ring-1 ring-white/15 hover:text-white')}>{tx('Masquer', 'Hide', 'Ocultar')}</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
