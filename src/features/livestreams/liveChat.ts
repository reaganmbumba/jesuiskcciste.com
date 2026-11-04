import type { RealtimeChannel } from '@supabase/supabase-js';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';

/**
 * Commentaires du direct (table `live_comments`, un seul espace : « direct »).
 * Ouverts à tous sans compte : la base fixe la date, l'auteur connecté éventuel
 * et limite les envois en rafale. Les nouveaux commentaires arrivent en temps
 * réel (Supabase Realtime) ; les cœurs et le nombre de spectateurs passent par
 * le même canal, sans rien enregistrer.
 */
export interface LiveComment {
  id: string;
  authorName: string;
  body: string;
  isHidden: boolean;
  createdAt: string;
}

export const LIVE_KEY = 'direct';
export const LIVE_COMMENT_MAX = 300;
export const LIVE_NAME_MAX = 40;
const CHANNEL = 'kcc-live';

let demo: LiveComment[] = [];
const demoListeners = new Set<(c: LiveComment) => void>();

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

/** Commentaires publiés depuis `since` (ISO), du plus ancien au plus récent. */
export async function listLiveComments(since: string): Promise<LiveComment[]> {
  if (isDemoMode) return demo.filter((c) => c.createdAt >= since && !c.isHidden);
  const { data, error } = await db().from('live_comments').select('id, author_name, body, is_hidden, created_at')
    .eq('live_key', LIVE_KEY).gte('created_at', since).order('created_at', { ascending: false }).limit(300);
  if (error) throw error;
  return camelize<LiveComment[]>(data ?? []).reverse();
}

export async function addLiveComment(authorName: string, body: string): Promise<LiveComment> {
  const name = authorName.trim().slice(0, LIVE_NAME_MAX);
  const text = body.trim();
  if (name.length < 2) throw new Error('name');
  if (!text) throw new Error('empty');
  if (text.length > LIVE_COMMENT_MAX) throw new Error('too-long');
  if (isDemoMode) {
    const row: LiveComment = { id: `lc-demo-${Date.now()}`, authorName: name, body: text, isHidden: false, createdAt: new Date().toISOString() };
    demo = [...demo, row];
    demoListeners.forEach((l) => l(row));
    return row;
  }
  const { data, error } = await db().from('live_comments').insert({ live_key: LIVE_KEY, author_name: name, body: text })
    .select('id, author_name, body, is_hidden, created_at').single();
  if (error) throw error;
  return camelize<LiveComment>(data);
}

export async function setLiveCommentHidden(id: string, isHidden: boolean): Promise<void> {
  if (isDemoMode) { demo = demo.map((c) => (c.id === id ? { ...c, isHidden } : c)); return; }
  const { error } = await db().from('live_comments').update({ is_hidden: isHidden }).eq('id', id);
  if (error) throw error;
}

export interface LiveHandlers {
  onComment: (c: LiveComment) => void;
  onHide: (id: string) => void;
  onHeart: () => void;
  onViewers: (n: number) => void;
}
export interface LiveConnection { sendHeart: () => void; sendHide: (id: string) => void; close: () => void }

function visitorKey(): string {
  try {
    const k = localStorage.getItem('kcc.visitor-id');
    if (k) return k;
  } catch { /* stockage indisponible */ }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Ouvre le canal temps réel du direct : commentaires, cœurs, masquages et spectateurs. */
export function connectLive(h: LiveHandlers): LiveConnection {
  if (isDemoMode || !supabase) {
    const l = (c: LiveComment) => h.onComment(c);
    demoListeners.add(l);
    h.onViewers(1);
    return { sendHeart: () => {}, sendHide: (id) => h.onHide(id), close: () => { demoListeners.delete(l); } };
  }
  const client = supabase;
  const ch: RealtimeChannel = client.channel(CHANNEL, { config: { broadcast: { self: false }, presence: { key: visitorKey() } } });
  ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_comments', filter: `live_key=eq.${LIVE_KEY}` }, (p) => {
    const c = camelize<LiveComment>(p.new);
    if (!c.isHidden) h.onComment(c);
  })
    .on('broadcast', { event: 'heart' }, () => h.onHeart())
    .on('broadcast', { event: 'hide' }, (p) => { const id = (p.payload as { id?: string } | undefined)?.id; if (id) h.onHide(id); })
    .on('presence', { event: 'sync' }, () => h.onViewers(Object.keys(ch.presenceState()).length))
    .subscribe((status) => { if (status === 'SUBSCRIBED') void ch.track({ since: new Date().toISOString() }); });
  return {
    sendHeart: () => { void ch.send({ type: 'broadcast', event: 'heart', payload: {} }); },
    sendHide: (id) => { void ch.send({ type: 'broadcast', event: 'hide', payload: { id } }); },
    close: () => { void client.removeChannel(ch); },
  };
}

/** Couleur stable pour l'avatar d'un nom. */
export function nameColor(name: string): string {
  const colors = ['#e5484d', '#3fb27f', '#3b82f6', '#d9b25a', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
}
