import { useState } from 'react';
import { ExternalLink, MessageSquare, X } from 'lucide-react';

/**
 * Commentaires du direct YouTube dans le Studio : l'animateur colle le lien de son
 * direct (lien de la vidéo, youtu.be, /live/… ou le lien « overlay » du chat) et voit
 * les commentaires des spectateurs en temps réel, pour les lire à l'antenne.
 */
const KEY = 'kcc-yt-chat';

/** Identifiant de la vidéo (11 caractères) à partir de n'importe quel lien YouTube. */
export function youtubeVideoId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  let u: URL;
  try { u = new URL(s); } catch { return null; }
  if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname)) return null;
  const v = u.searchParams.get('v');
  if (v && /^[\w-]{11}$/.test(v)) return v;
  if (u.hostname.endsWith('youtu.be')) { const id = u.pathname.slice(1, 12); return /^[\w-]{11}$/.test(id) ? id : null; }
  const m = /\/(?:live|embed|shorts)\/([\w-]{11})/.exec(u.pathname);
  if (m) return m[1];
  // lien « live_apps/overlay?id=… » : l'identifiant contient la chaîne puis la vidéo
  const raw = u.searchParams.get('id');
  if (raw) {
    try {
      const b = atob(raw.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (raw.length % 4)) % 4));
      const i = b.indexOf('\x12\x0b');
      if (i >= 0) { const id = b.slice(i + 2, i + 13); if (/^[\w-]{11}$/.test(id)) return id; }
    } catch { /* lien illisible */ }
  }
  return null;
}

export function YouTubeChat({ dark }: { dark?: boolean }) {
  const [link, setLink] = useState(() => { try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; } });
  const [draft, setDraft] = useState('');
  const [err, setErr] = useState('');
  const id = youtubeVideoId(link);

  function save(v: string) {
    setLink(v);
    try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch { /* navigation privée */ }
  }
  function submit() {
    if (!youtubeVideoId(draft)) { setErr('Lien YouTube non reconnu. Collez le lien de votre direct.'); return; }
    setErr(''); save(draft.trim()); setDraft('');
  }

  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300', field: 'rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-white placeholder:text-white/35', sub: 'text-white/55', btn: 'rounded-xl bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-3 text-night', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]', field: 'rounded-lg border border-[#d3dae3] bg-white px-3 py-2', sub: 'text-ink/55', btn: 'rounded border border-[#d3dae3] px-3 py-1.5 text-sm font-semibold' };

  return (
    <section className={c.box}>
      <div className="flex items-center justify-between gap-2">
        <p className={`flex items-center gap-2 ${c.hd}`}><MessageSquare className="h-4 w-4 text-red-500" />Commentaires YouTube</p>
        {id && (
          <span className="flex gap-1">
            <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer" className={c.btn} aria-label="Ouvrir le direct sur YouTube"><ExternalLink className="h-4 w-4" /></a>
            <button type="button" onClick={() => save('')} className={c.btn} aria-label="Changer de direct"><X className="h-4 w-4" /></button>
          </span>
        )}
      </div>
      {id ? (
        <iframe
          title="Commentaires du direct YouTube"
          src={`https://www.youtube.com/live_chat?v=${id}&embed_domain=${encodeURIComponent(window.location.hostname)}`}
          className="mt-3 h-[420px] w-full rounded-xl border-0 bg-white"
        />
      ) : (
        <div className="mt-3 space-y-2">
          <p className={`text-xs ${c.sub}`}>Collez le lien de votre direct YouTube (ou le lien « overlay » du chat) : les commentaires des spectateurs s’afficheront ici en temps réel.</p>
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} placeholder="https://www.youtube.com/live/…" className={c.field + ' min-w-0 flex-1'} aria-label="Lien du direct YouTube" />
            <button type="button" onClick={submit} className="rounded-xl bg-gold px-3 py-2 text-sm font-bold text-night">Afficher</button>
          </div>
          {err && <p className="text-xs text-red-500" role="alert">{err}</p>}
        </div>
      )}
    </section>
  );
}
