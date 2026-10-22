import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { demoParishes } from '@/services/demo/data';
import { camelize } from '@/utils/case';
import { fullName } from '@/utils/format';
import type { ForumComment, ForumTopic, Profile } from '@/types';

/**
 * Forum de discussion (tables `forum_topics` et `forum_comments`).
 * Les droits sont vérifiés en base : seule la modération publie des sujets,
 * seuls les membres validés commentent, et le nom + la paroisse affichés
 * sont recopiés du profil par la base au moment de l'envoi.
 */

export const TOPIC_TITLE_MAX = 200;
export const TOPIC_BODY_MAX = 10000;
export const COMMENT_MAX = 3000;

const now = () => new Date().toISOString();
const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

let demoTopics: ForumTopic[] = [
  {
    id: 'forum-demo-1', title: 'Bienvenue sur le forum de la communauté (exemple)',
    body: 'Ceci est un sujet de démonstration. Une fois le site relié à la base de données, l’administration publiera ici les sujets de discussion et les membres inscrits pourront les commenter.',
    isPinned: true, isLocked: false, isHidden: false, commentCount: 2, lastCommentAt: ago(1), createdAt: ago(3),
  },
];
let demoComments: ForumComment[] = [
  { id: 'fc-demo-1', topicId: 'forum-demo-1', authorId: 'demo-a', authorName: 'Membre exemple', parishName: demoParishes[0]?.name, body: 'Merci pour cet espace d’échange !', isHidden: false, createdAt: ago(2) },
  { id: 'fc-demo-2', topicId: 'forum-demo-1', authorId: 'demo-b', authorName: 'Autre membre', parishName: demoParishes[4]?.name, body: 'Que Dieu bénisse la communauté.', isHidden: false, createdAt: ago(1) },
];

function refreshDemoCounts(topicId: string) {
  const visible = demoComments.filter((c) => c.topicId === topicId && !c.isHidden);
  demoTopics = demoTopics.map((t) => (t.id === topicId ? { ...t, commentCount: visible.length, lastCommentAt: visible.at(-1)?.createdAt ?? null } : t));
}

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

/** Épinglés d'abord, puis du plus récent au plus ancien. */
export function sortTopics(list: ForumTopic[]): ForumTopic[] {
  return [...list].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt.localeCompare(a.createdAt));
}

/** Liste des sujets (la base cache les sujets masqués à ceux qui ne modèrent pas). */
export async function listTopics(includeHidden = false): Promise<ForumTopic[]> {
  if (isDemoMode) return sortTopics(demoTopics.filter((t) => includeHidden || !t.isHidden));
  const { data, error } = await db().from('forum_topics').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return camelize<ForumTopic[]>(data ?? []);
}

export async function getTopic(id: string): Promise<ForumTopic | null> {
  if (isDemoMode) return demoTopics.find((t) => t.id === id) ?? null;
  const { data, error } = await db().from('forum_topics').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? camelize<ForumTopic>(data) : null;
}

export async function createTopic(input: { title: string; body: string; isPinned?: boolean }): Promise<ForumTopic> {
  const row = { title: input.title.trim(), body: input.body.trim(), isPinned: !!input.isPinned };
  if (isDemoMode) {
    const t: ForumTopic = { id: `forum-demo-${Date.now()}`, ...row, isLocked: false, isHidden: false, commentCount: 0, lastCommentAt: null, createdAt: now() };
    demoTopics = [t, ...demoTopics];
    return t;
  }
  const { data, error } = await db().from('forum_topics').insert({ title: row.title, body: row.body, is_pinned: row.isPinned }).select('*').single();
  if (error) throw error;
  return camelize<ForumTopic>(data);
}

type TopicPatch = Partial<Pick<ForumTopic, 'title' | 'body' | 'isPinned' | 'isLocked' | 'isHidden'>>;

export async function updateTopic(id: string, patch: TopicPatch): Promise<void> {
  if (isDemoMode) {
    demoTopics = demoTopics.map((t) => (t.id === id ? { ...t, ...patch } : t));
    return;
  }
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title.trim();
  if (patch.body !== undefined) row.body = patch.body.trim();
  if (patch.isPinned !== undefined) row.is_pinned = patch.isPinned;
  if (patch.isLocked !== undefined) row.is_locked = patch.isLocked;
  if (patch.isHidden !== undefined) row.is_hidden = patch.isHidden;
  const { error } = await db().from('forum_topics').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteTopic(id: string): Promise<void> {
  if (isDemoMode) {
    demoTopics = demoTopics.filter((t) => t.id !== id);
    demoComments = demoComments.filter((c) => c.topicId !== id);
    return;
  }
  const { error } = await db().from('forum_topics').delete().eq('id', id);
  if (error) throw error;
}

export async function listComments(topicId: string, includeHidden = false): Promise<ForumComment[]> {
  if (isDemoMode) return demoComments.filter((c) => c.topicId === topicId && (includeHidden || !c.isHidden));
  const { data, error } = await db().from('forum_comments').select('*').eq('topic_id', topicId).order('created_at', { ascending: true }).limit(1000);
  if (error) throw error;
  return camelize<ForumComment[]>(data ?? []);
}

/** Le nom et la paroisse sont fixés par la base ; en démonstration on les reprend du profil. */
export async function addComment(topicId: string, body: string, author: Profile): Promise<ForumComment> {
  const text = body.trim();
  if (!text) throw new Error('empty');
  if (isDemoMode) {
    const c: ForumComment = {
      id: `fc-demo-${Date.now()}`, topicId, authorId: author.id, authorName: fullName(author),
      parishName: demoParishes.find((p) => p.id === author.parishId)?.name ?? null, body: text, isHidden: false, createdAt: now(),
    };
    demoComments = [...demoComments, c];
    refreshDemoCounts(topicId);
    return c;
  }
  const { data, error } = await db().from('forum_comments').insert({ topic_id: topicId, body: text }).select('*').single();
  if (error) throw error;
  return camelize<ForumComment>(data);
}

export async function setCommentHidden(c: ForumComment, isHidden: boolean): Promise<void> {
  if (isDemoMode) {
    demoComments = demoComments.map((x) => (x.id === c.id ? { ...x, isHidden } : x));
    refreshDemoCounts(c.topicId);
    return;
  }
  const { error } = await db().from('forum_comments').update({ is_hidden: isHidden }).eq('id', c.id);
  if (error) throw error;
}

export async function deleteComment(c: ForumComment): Promise<void> {
  if (isDemoMode) {
    demoComments = demoComments.filter((x) => x.id !== c.id);
    refreshDemoCounts(c.topicId);
    return;
  }
  const { error } = await db().from('forum_comments').delete().eq('id', c.id);
  if (error) throw error;
}
