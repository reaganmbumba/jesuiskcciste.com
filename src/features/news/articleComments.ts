import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { demoParishes } from '@/services/demo/data';
import { camelize } from '@/utils/case';
import { fullName } from '@/utils/format';
import type { ArticleComment, ArticleLikes, Profile } from '@/types';

/**
 * Commentaires et « J'aime » sous les actualités (tables `article_comments`
 * et `article_likes`). Comme au forum, les droits sont vérifiés en base :
 * seuls les membres validés commentent, le nom + la paroisse affichés sont
 * recopiés du profil, et le public ne voit que le total des « J'aime ».
 */

export const ARTICLE_COMMENT_MAX = 3000;

let demoComments: ArticleComment[] = [];
let demoLikes: { articleId: string; userId: string }[] = [];

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

export async function listArticleComments(articleId: string, includeHidden = false): Promise<ArticleComment[]> {
  if (isDemoMode) return demoComments.filter((c) => c.articleId === articleId && (includeHidden || !c.isHidden));
  const { data, error } = await db().from('article_comments').select('*').eq('article_id', articleId).order('created_at', { ascending: true }).limit(1000);
  if (error) throw error;
  return camelize<ArticleComment[]>(data ?? []);
}

/** Le nom et la paroisse sont fixés par la base ; en démonstration on les reprend du profil. */
export async function addArticleComment(articleId: string, body: string, author: Profile): Promise<ArticleComment> {
  const text = body.trim();
  if (!text) throw new Error('empty');
  if (isDemoMode) {
    const c: ArticleComment = {
      id: `ac-demo-${Date.now()}`, articleId, authorId: author.id, authorName: fullName(author),
      parishName: demoParishes.find((p) => p.id === author.parishId)?.name ?? null, body: text, isHidden: false, createdAt: new Date().toISOString(),
    };
    demoComments = [...demoComments, c];
    return c;
  }
  const { data, error } = await db().from('article_comments').insert({ article_id: articleId, body: text }).select('*').single();
  if (error) throw error;
  return camelize<ArticleComment>(data);
}

export async function setArticleCommentHidden(c: ArticleComment, isHidden: boolean): Promise<void> {
  if (isDemoMode) {
    demoComments = demoComments.map((x) => (x.id === c.id ? { ...x, isHidden } : x));
    return;
  }
  const { error } = await db().from('article_comments').update({ is_hidden: isHidden }).eq('id', c.id);
  if (error) throw error;
}

export async function deleteArticleComment(c: ArticleComment): Promise<void> {
  if (isDemoMode) {
    demoComments = demoComments.filter((x) => x.id !== c.id);
    return;
  }
  const { error } = await db().from('article_comments').delete().eq('id', c.id);
  if (error) throw error;
}

export async function getArticleLikes(articleId: string, userId?: string | null): Promise<ArticleLikes> {
  if (isDemoMode) {
    const rows = demoLikes.filter((l) => l.articleId === articleId);
    return { likes: rows.length, liked: !!userId && rows.some((l) => l.userId === userId) };
  }
  const { data, error } = await db().rpc('article_like_summary', { p_article_id: articleId });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as { likes?: number; liked?: boolean } | null;
  return { likes: row?.likes ?? 0, liked: !!row?.liked };
}

/** Ajoute ou retire le « J'aime » de la personne connectée. */
export async function setArticleLiked(articleId: string, userId: string, liked: boolean): Promise<void> {
  if (isDemoMode) {
    demoLikes = demoLikes.filter((l) => !(l.articleId === articleId && l.userId === userId));
    if (liked) demoLikes = [...demoLikes, { articleId, userId }];
    return;
  }
  const q = liked
    ? db().from('article_likes').upsert({ article_id: articleId, user_id: userId }, { onConflict: 'article_id,user_id', ignoreDuplicates: true })
    : db().from('article_likes').delete().eq('article_id', articleId).eq('user_id', userId);
  const { error } = await q;
  if (error) throw error;
}
