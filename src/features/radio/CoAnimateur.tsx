import { useEffect, useRef, useState } from 'react';
import { Check, Copy, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Co-animateur Claude, dans le studio radio, sous le sujet de l'émission.
 * Il garde le fil de l'émission (chansons, appels, sujets de prière, ce qui a été dit) —
 * les chansons et les appels pris à l'antenne s'y notent tout seuls — et propose
 * le texte suivant à lire, comme s'il animait lui-même (worker/assistant.ts).
 */

export type FilType = 'dit' | 'chanson' | 'appel' | 'priere' | 'annonce' | 'note' | 'lu' | 'auto';
export type FilLine = { id: string; h: string; type: FilType; texte: string };

export type CoAnimInfo = {
  titre: string;
  sujet: string;
  /** Sujet affiché aux auditeurs (noté dans le fil quand il change). */
  sujetAffiche?: string;
  animateur: string;
  onAir: boolean;
  recMode: boolean;
  startedAt?: string | null;
  auditeurs: number | null;
  programme: string;
  musique: string;
  antenne: { nom: string; ville: string | null }[];
  attente: { nom: string; ville: string | null }[];
};

const KEY = 'kcc-coanim-fil';
const AUTO_KEY = 'kcc-coanim-auto';

const TYPES: { id: FilType; label: string; hint: string }[] = [
  { id: 'dit', label: 'J’ai dit', hint: 'Ce que vous venez de dire (en quelques mots)' },
  { id: 'chanson', label: 'Chanson', hint: 'Titre — artiste' },
  { id: 'appel', label: 'Appel', hint: 'Prénom, ville, ce qu’il a partagé' },
  { id: 'priere', label: 'Sujet de prière', hint: 'Pour qui, pour quoi' },
  { id: 'annonce', label: 'Annonce', hint: 'Événement, communiqué, rendez-vous' },
  { id: 'note', label: 'Idée', hint: 'Une idée, un thème à aborder' },
];
const LABEL: Record<FilType, string> = { dit: 'Dit', chanson: 'Chanson', appel: 'Appel', priere: 'Prière', annonce: 'Annonce', note: 'Idée', lu: 'Lu', auto: 'Studio' };

const ASKS: { kind: string; label: string }[] = [
  { kind: 'suite', label: '✨ La suite' },
  { kind: 'accueil', label: 'Ouverture' },
  { kind: 'transition', label: 'Transition' },
  { kind: 'chanson', label: 'Présenter la chanson' },
  { kind: 'appel', label: 'Accueillir l’appelant' },
  { kind: 'merci', label: 'Remercier l’appelant' },
  { kind: 'priere', label: 'Prière' },
  { kind: 'relance', label: 'Relance' },
  { kind: 'annonce', label: 'Annonce (n°, site, WhatsApp)' },
  { kind: 'cloture', label: 'Clôture' },
];

const ERRORS: Record<string, string> = {
  'not-configured': 'Le co-animateur n’est pas encore branché : il faut ajouter la clé Claude (ANTHROPIC_API_KEY) dans Cloudflare. Voir le guide.',
  'bad-key': 'La clé Claude enregistrée dans Cloudflare est refusée : vérifiez-la ou créez-en une nouvelle.',
  credit: 'Le compte Claude n’a plus de crédit : rechargez-le sur platform.claude.com (Billing).',
  busy: 'Claude est très sollicité : réessayez dans quelques secondes.',
  forbidden: 'Réservé aux administrateurs du site : reconnectez-vous avec un compte administrateur.',
  refusal: 'Claude n’a pas voulu écrire ce texte : reformulez la demande.',
};

const heure = (d = new Date()) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kinshasa' });
const uid = () => Math.random().toString(36).slice(2, 10);

function loadFil(): FilLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { day: string; fil: FilLine[] } | null;
    // un fil de plus de 12 h appartient à une autre émission
    if (raw && Date.now() - Number(raw.day) < 12 * 3600_000 && Array.isArray(raw.fil)) return raw.fil;
  } catch { /* stockage indisponible */ }
  return [];
}

export function CoAnimateur({ info, dark }: { info: CoAnimInfo; dark?: boolean }) {
  const [fil, setFil] = useState<FilLine[]>(loadFil);
  const [type, setType] = useState<FilType>('dit');
  const [draft, setDraft] = useState('');
  const [demande, setDemande] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [prop, setProp] = useState<{ kind: string; texte: string; ensuite: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [auto, setAuto] = useState(() => { try { return localStorage.getItem(AUTO_KEY) !== '0'; } catch { return true; } });
  const started = useRef<string>('');
  const filRef = useRef(fil);
  filRef.current = fil;
  const infoRef = useRef(info);
  infoRef.current = info;
  const busyRef = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ day: String(started.current || Date.now()), fil })); } catch { /* navigation privée */ }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [fil]);
  useEffect(() => { try { localStorage.setItem(AUTO_KEY, auto ? '1' : '0'); } catch { /* navigation privée */ } }, [auto]);

  const add = (t: FilType, texte: string) => {
    const s = texte.trim();
    if (!s) return;
    setFil((f) => [...f, { id: uid(), h: heure(), type: t, texte: s.slice(0, 600) }].slice(-200));
  };

  // Ce que le studio sait déjà se note tout seul : début, chansons, émission programmée, appels à l'antenne.
  const prev = useRef<{ onAir: boolean; musique: string; programme: string; antenne: Set<string>; sujet: string }>({ onAir: info.onAir, musique: '', programme: '', antenne: new Set(), sujet: info.sujetAffiche ?? '' });
  useEffect(() => {
    const p = prev.current;
    if (info.onAir && !p.onAir) {
      started.current = String(Date.now());
      add('auto', info.recMode ? `Début de l’enregistrement « ${info.titre} »` : `Début du direct « ${info.titre} »`);
    }
    if (!info.onAir && p.onAir) add('auto', 'Fin de l’émission');
    if (info.onAir && info.musique && info.musique !== p.musique) add('chanson', `${info.musique} (musique de fond)`);
    if (info.onAir && info.programme && info.programme !== p.programme) add('auto', `Émission programmée sous la voix : ${info.programme}`);
    const names = new Set(info.antenne.map((a) => `${a.nom}${a.ville ? `, ${a.ville}` : ''}`));
    names.forEach((n) => { if (!p.antenne.has(n)) add('appel', `${n} passe à l’antenne`); });
    const affiche = info.sujetAffiche ?? '';
    if (info.onAir && affiche && affiche !== p.sujet) add('auto', `Sujet affiché : ${affiche.slice(0, 200)}`);
    prev.current = { onAir: info.onAir, musique: info.onAir ? info.musique : '', programme: info.onAir ? info.programme : '', antenne: names, sujet: affiche };
  }, [info.onAir, info.musique, info.programme, info.antenne, info.sujetAffiche]); // eslint-disable-line react-hooks/exhaustive-deps

  async function ask(kind: string, extra = '') {
    if (busyRef.current) return;
    if (!supabase) { setErr('Connexion au site indisponible.'); return; }
    busyRef.current = true;
    setBusy(true);
    setErr('');
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('Session expirée : reconnectez-vous.');
      const i = infoRef.current;
      const who = (l: { nom: string; ville: string | null }[]) => l.map((a) => `${a.nom}${a.ville ? ` (${a.ville})` : ''}`).join(', ');
      const res = await fetch('/api/radio/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          kind,
          demande: extra,
          emission: {
            titre: i.titre, sujet: i.sujet, animateur: i.animateur,
            etat: i.recMode ? 'enregistrement (diffusé plus tard)' : i.onAir ? 'en direct' : 'préparation, hors antenne',
            minutes: i.onAir && i.startedAt ? Math.max(0, Math.round((Date.now() - new Date(i.startedAt).getTime()) / 60000)) : null,
            heure: heure(), auditeurs: i.auditeurs, programme: i.programme, musique: i.musique,
            antenne: who(i.antenne), attente: who(i.attente),
          },
          fil: filRef.current.map(({ h, type: t, texte }) => ({ h, type: LABEL[t], texte })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { texte?: string; ensuite?: string; error?: string };
      if (!res.ok || !data.texte) throw new Error(ERRORS[data.error ?? ''] ?? 'Claude ne répond pas pour le moment : réessayez.');
      setProp({ kind, texte: data.texte, ensuite: data.ensuite ?? '' });
      setCopied(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  // Anticipation : pendant l'émission, dès que le fil bouge, Claude prépare la suite (après 6 s de calme).
  const lastAuto = useRef(0);
  useEffect(() => {
    if (!auto || !info.onAir || !fil.length) return;
    const last = fil[fil.length - 1];
    if (last.type === 'lu') return;
    const t = window.setTimeout(() => {
      if (Date.now() - lastAuto.current < 20_000) return; // pas plus d'une proposition automatique toutes les 20 s
      lastAuto.current = Date.now();
      void ask('suite');
    }, 6000);
    return () => window.clearTimeout(t);
  }, [fil, auto, info.onAir]); // eslint-disable-line react-hooks/exhaustive-deps

  function markRead() {
    if (!prop) return;
    add('lu', prop.texte);
    setProp(null);
  }

  async function copy() {
    if (!prop) return;
    try { await navigator.clipboard.writeText(prop.texte); setCopied(true); } catch { /* presse-papiers refusé */ }
  }

  function newShow() {
    if (fil.length && !window.confirm('Effacer le fil de l’émission précédente ?')) return;
    started.current = String(Date.now());
    setFil([]);
    setProp(null);
  }

  // Styles des deux habillages (studio sombre de l'application, console claire du site)
  const c = dark
    ? { box: 'mt-4 border-t border-white/10 pt-4', muted: 'text-white/55', chip: 'rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/85 hover:bg-white/[0.12] disabled:opacity-40', chipOn: 'rounded-full border border-gold bg-gold px-2.5 py-1 text-xs font-bold text-night', field: 'w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-gold/60', read: 'rounded-2xl border border-gold/50 bg-gold/[0.1] p-4', line: 'border-white/10', btn: 'inline-flex items-center gap-1.5 rounded-xl bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white', main: 'inline-flex items-center gap-1.5 rounded-xl bg-gold px-3 py-2 text-sm font-bold text-night' }
    : { box: 'border-t border-[#e3e8ee] p-3', muted: 'text-ink/55', chip: 'rounded border border-[#d3dae3] bg-white px-2 py-1 text-xs font-semibold text-night hover:bg-[#f2f5f8] disabled:opacity-40', chipOn: 'rounded border border-[#2b3648] bg-[#2b3648] px-2 py-1 text-xs font-bold text-white', field: 'w-full rounded border border-[#d3dae3] px-2.5 py-1.5 text-[13px] outline-none focus:border-[#2b3648]', read: 'rounded border-2 border-gold bg-gold/10 p-3 text-night', line: 'border-[#e3e8ee]', btn: 'inline-flex items-center gap-1.5 rounded border border-[#d3dae3] bg-white px-3 py-1.5 text-sm font-semibold text-night', main: 'inline-flex items-center gap-1.5 rounded bg-[#2b3648] px-3 py-1.5 text-sm font-bold text-white' };

  return (
    <div className={c.box}>
      <div className="flex items-center justify-between gap-2">
        <p className={`flex items-center gap-1.5 text-sm font-bold ${dark ? 'text-gold-300' : 'text-night'}`}><Sparkles className="h-4 w-4" />Co-animateur Claude</p>
        <label className={`flex items-center gap-1.5 text-xs ${c.muted}`}>
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.currentTarget.checked)} className="h-3.5 w-3.5 accent-[#e8b84a]" />Anticiper tout seul
        </label>
      </div>
      <p className={`mt-1 text-xs ${c.muted}`}>Notez ce qui se passe ; Claude prépare le texte suivant à lire. Les chansons et les appels pris à l’antenne se notent tout seuls.</p>

      {/* Proposition à lire */}
      {(prop || busy || err) && (
        <div className={`mt-3 ${c.read}`} aria-live="polite">
          {busy && !prop && <p className={`text-sm ${c.muted}`}>Claude prépare la suite…</p>}
          {err && <p className="text-sm font-semibold text-red-500">{err}</p>}
          {prop && (
            <>
              <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${dark ? 'text-gold-300' : 'text-[#8a6a1c]'}`}>À lire à l’antenne{busy ? ' · nouvelle version en préparation…' : ''}</p>
              <p className="mt-2 whitespace-pre-line text-[17px] leading-relaxed">{prop.texte}</p>
              {prop.ensuite && <p className={`mt-3 text-xs italic ${c.muted}`}>Ensuite : {prop.ensuite}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={markRead} className={c.main}><Check className="h-4 w-4" />C’est lu</button>
                <button type="button" disabled={busy} onClick={() => void ask(prop.kind, demande.trim())} className={c.btn}><RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />Autre version</button>
                <button type="button" onClick={() => void copy()} className={c.btn}><Copy className="h-4 w-4" />{copied ? 'Copié' : 'Copier'}</button>
                <button type="button" onClick={() => setProp(null)} className={c.btn} aria-label="Fermer la proposition"><X className="h-4 w-4" /></button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Demandes */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ASKS.map((a) => (
          <button key={a.kind} type="button" disabled={busy} onClick={() => void ask(a.kind, demande.trim())} className={a.kind === 'suite' ? c.chipOn : c.chip}>{a.label}</button>
        ))}
      </div>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (demande.trim()) void ask('libre', demande.trim()); }}>
        <input className={c.field} maxLength={800} value={demande} onChange={(e) => setDemande(e.target.value)} placeholder="Demande précise (ex. une prière pour les malades, en lingala et français)…" aria-label="Demande précise à Claude" />
        <button type="submit" disabled={busy || !demande.trim()} className={c.main + ' shrink-0 disabled:opacity-40'}>Demander</button>
      </form>

      {/* Fil de l'émission */}
      <div className="mt-4 flex items-center justify-between">
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${c.muted}`}>Fil de l’émission ({fil.length})</p>
        <button type="button" onClick={newShow} className={`text-xs underline ${c.muted}`}>Nouvelle émission</button>
      </div>
      <ol ref={listRef} className="mt-1 max-h-56 space-y-1 overflow-y-auto pr-1 text-sm">
        {!fil.length && <li className={`text-xs ${c.muted}`}>Rien de noté pour le moment.</li>}
        {fil.map((l) => (
          <li key={l.id} className={`group flex gap-2 border-b py-1 ${c.line}`}>
            <span className={`w-10 shrink-0 tabular-nums text-xs ${c.muted}`}>{l.h}</span>
            <span className={`w-16 shrink-0 text-xs font-semibold ${l.type === 'lu' ? c.muted : ''}`}>{LABEL[l.type]}</span>
            <span className={`min-w-0 flex-1 ${l.type === 'lu' ? `line-clamp-2 ${c.muted}` : ''}`}>{l.texte}</span>
            <button type="button" onClick={() => setFil((f) => f.filter((x) => x.id !== l.id))} className={`shrink-0 opacity-50 hover:opacity-100 ${c.muted}`} aria-label="Retirer du fil"><Trash2 className="h-3.5 w-3.5" /></button>
          </li>
        ))}
      </ol>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {TYPES.map((t) => <button key={t.id} type="button" onClick={() => setType(t.id)} className={type === t.id ? c.chipOn : c.chip}>{t.label}</button>)}
      </div>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); add(type, draft); setDraft(''); }}>
        <input className={c.field} maxLength={600} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={TYPES.find((t) => t.id === type)?.hint} aria-label="Noter dans le fil" />
        <button type="submit" disabled={!draft.trim()} className={c.main + ' shrink-0 disabled:opacity-40'}>Noter</button>
      </form>
    </div>
  );
}
