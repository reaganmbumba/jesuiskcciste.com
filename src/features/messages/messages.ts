import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { demoMembers, demoParishes } from '@/services/demo/data';
import { camelize } from '@/utils/case';
import { fullName } from '@/utils/format';
import type { MessageRecipient, PrivateConversation, PrivateMessage } from '@/types';

/**
 * Messages privés entre membres (tables `private_conversations`,
 * `private_messages` et `private_message_blocks`). Les droits sont vérifiés
 * en base : seuls les deux participants lisent une conversation, seuls les
 * membres validés écrivent, et chacun peut refuser les messages ou bloquer
 * un membre. Le nom et la paroisse de l'interlocuteur viennent de la base.
 */

export const MESSAGE_MAX = 3000;

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

// ——— Démonstration (en mémoire, propre à l'onglet) ———
interface DemoConv { id: string; a: string; b: string; lastMessageAt: string | null; createdAt: string }
let demoConvs: DemoConv[] = [];
let demoMsgs: PrivateMessage[] = [];
let demoBlocks: { blocker: string; blocked: string }[] = [];
let demoSeededFor: string | null = null;

const now = () => new Date().toISOString();
const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();
const demoMember = (id: string) => demoMembers.find((m) => m.id === id);
const demoParishName = (id?: string | null) => demoParishes.find((p) => p.id === id)?.name ?? null;

function seedDemo(me: string) {
  if (demoSeededFor === me) return;
  demoSeededFor = me;
  const other = demoMembers[0];
  demoConvs = [{ id: 'conv-demo-1', a: me, b: other.id, lastMessageAt: ago(42), createdAt: ago(60 * 26) }];
  demoMsgs = [
    { id: 'pm-demo-1', conversationId: 'conv-demo-1', senderId: me, body: 'Bonjour, que la paix soit avec vous ! (message d’exemple)', readAt: ago(60 * 25), createdAt: ago(60 * 26) },
    { id: 'pm-demo-2', conversationId: 'conv-demo-1', senderId: other.id, body: 'Amen ! Merci pour votre message. Ceci est une conversation de démonstration.', readAt: null, createdAt: ago(42) },
  ];
  demoBlocks = [];
}

const demoBlocked = (me: string, other: string) => demoBlocks.some((b) => (b.blocker === me && b.blocked === other) || (b.blocker === other && b.blocked === me));
const demoCanSend = (me: string, other: string) => {
  const m = demoMember(other);
  return !!m && m.status === 'active' && m.privacy.acceptMessages !== false && !demoBlocked(me, other);
};

function demoView(c: DemoConv, me: string): PrivateConversation {
  const otherId = c.a === me ? c.b : c.a;
  const other = demoMember(otherId);
  const msgs = demoMsgs.filter((m) => m.conversationId === c.id);
  const last = msgs.at(-1);
  return {
    id: c.id, otherId, otherName: other ? fullName(other) : 'Membre', otherParish: demoParishName(other?.parishId),
    lastMessageAt: c.lastMessageAt, lastBody: last?.body ?? null, lastSenderId: last?.senderId ?? null,
    unreadCount: msgs.filter((m) => !m.readAt && m.senderId !== me).length,
    canSend: demoCanSend(me, otherId), blockedByMe: demoBlocks.some((b) => b.blocker === me && b.blocked === otherId),
  };
}

// ——— API ———

/** Boîte de réception, la conversation la plus récente d'abord. */
export async function listConversations(me: string): Promise<PrivateConversation[]> {
  if (isDemoMode) {
    seedDemo(me);
    return demoConvs.filter((c) => c.a === me || c.b === me)
      .sort((x, y) => (y.lastMessageAt ?? y.createdAt).localeCompare(x.lastMessageAt ?? x.createdAt))
      .map((c) => demoView(c, me));
  }
  const { data, error } = await db().rpc('my_private_conversations');
  if (error) throw error;
  return camelize<PrivateConversation[]>(data ?? []);
}

export async function getConversation(id: string, me: string): Promise<PrivateConversation | null> {
  return (await listConversations(me)).find((c) => c.id === id) ?? null;
}

export async function listMessages(conversationId: string): Promise<PrivateMessage[]> {
  if (isDemoMode) return demoMsgs.filter((m) => m.conversationId === conversationId);
  const { data, error } = await db().from('private_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(1000);
  if (error) throw error;
  return camelize<PrivateMessage[]>(data ?? []);
}

/** Ouvre (ou retrouve) la conversation avec un membre ; renvoie son identifiant. */
export async function startConversation(otherId: string, me: string): Promise<string> {
  if (isDemoMode) {
    seedDemo(me);
    const existing = demoConvs.find((c) => (c.a === me && c.b === otherId) || (c.b === me && c.a === otherId));
    if (existing) return existing.id;
    if (otherId === me || !demoCanSend(me, otherId)) throw new Error('Ce membre ne reçoit pas de messages privés.');
    const c: DemoConv = { id: `conv-demo-${Date.now()}`, a: me, b: otherId, lastMessageAt: null, createdAt: now() };
    demoConvs = [c, ...demoConvs];
    return c.id;
  }
  const { data, error } = await db().rpc('start_private_conversation', { p_member: otherId });
  if (error) throw error;
  return data as string;
}

export async function sendMessage(conversationId: string, body: string, me: string): Promise<PrivateMessage> {
  const text = body.trim();
  if (!text) throw new Error('empty');
  if (isDemoMode) {
    const c = demoConvs.find((x) => x.id === conversationId);
    if (!c || !demoCanSend(me, c.a === me ? c.b : c.a)) throw new Error('Ce membre ne reçoit pas de messages privés.');
    const m: PrivateMessage = { id: `pm-demo-${Date.now()}`, conversationId, senderId: me, body: text, readAt: null, createdAt: now() };
    demoMsgs = [...demoMsgs, m];
    demoConvs = demoConvs.map((x) => (x.id === conversationId ? { ...x, lastMessageAt: m.createdAt } : x));
    return m;
  }
  const { data, error } = await db().from('private_messages').insert({ conversation_id: conversationId, body: text }).select('*').single();
  if (error) throw error;
  return camelize<PrivateMessage>(data);
}

/** Retire un message que l'on a envoyé. */
export async function deleteMessage(id: string): Promise<void> {
  if (isDemoMode) {
    demoMsgs = demoMsgs.filter((m) => m.id !== id);
    return;
  }
  const { error } = await db().from('private_messages').delete().eq('id', id);
  if (error) throw error;
}

export async function markConversationRead(conversationId: string, me: string): Promise<void> {
  if (isDemoMode) {
    demoMsgs = demoMsgs.map((m) => (m.conversationId === conversationId && m.senderId !== me && !m.readAt ? { ...m, readAt: now() } : m));
    return;
  }
  const { error } = await db().rpc('mark_private_conversation_read', { p_conversation: conversationId });
  if (error) throw error;
}

export async function unreadCount(me: string): Promise<number> {
  if (isDemoMode) {
    seedDemo(me);
    return demoMsgs.filter((m) => !m.readAt && m.senderId !== me && demoConvs.some((c) => c.id === m.conversationId && (c.a === me || c.b === me))).length;
  }
  const { data, error } = await db().rpc('unread_private_message_count');
  if (error) throw error;
  return (data as number) ?? 0;
}

/** Destinataires possibles (2 lettres minimum) : membres validés qui acceptent les messages. */
export async function searchRecipients(query: string, me: string): Promise<MessageRecipient[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  if (isDemoMode) {
    const s = q.toLowerCase();
    return demoMembers
      .filter((m) => m.id !== me && fullName(m).toLowerCase().includes(s) && demoCanSend(me, m.id))
      .slice(0, 20)
      .map((m) => ({ id: m.id, displayName: fullName(m), parishName: demoParishName(m.parishId) }));
  }
  const { data, error } = await db().rpc('search_message_recipients', { p_query: q });
  if (error) throw error;
  return camelize<MessageRecipient[]>(data ?? []);
}

/** Bloquer un membre l'empêche de vous écrire (et vous de lui écrire). */
export async function setBlocked(otherId: string, blocked: boolean, me: string): Promise<void> {
  if (isDemoMode) {
    demoBlocks = demoBlocks.filter((b) => !(b.blocker === me && b.blocked === otherId));
    if (blocked) demoBlocks = [...demoBlocks, { blocker: me, blocked: otherId }];
    return;
  }
  const { error } = await db().rpc('set_private_message_block', { p_member: otherId, p_blocked: blocked });
  if (error) throw error;
}
