import { describe, expect, it } from 'vitest';
import { addArticleComment, deleteArticleComment, getArticleLikes, listArticleComments, setArticleCommentHidden, setArticleLiked } from '@/features/news/articleComments';
import type { Profile } from '@/types';

const member = { id: 'm1', firstName: 'Jean', lastName: 'Nzuzi', parishId: 'par-1', status: 'active', roles: [] } as unknown as Profile;

describe('Commentaires des actualités', () => {
  it('en démonstration : un commentaire affiche le nom et la paroisse, la modération le masque', async () => {
    const c = await addArticleComment('edito-ann-test', '  Amen  ', member);
    expect([c.authorName, c.parishName, c.body]).toEqual(['Jean Nzuzi', 'Paroisse exemple A', 'Amen']);
    expect(await listArticleComments('autre-article')).toEqual([]);
    await setArticleCommentHidden(c, true);
    expect(await listArticleComments('edito-ann-test')).toEqual([]);
    expect(await listArticleComments('edito-ann-test', true)).toHaveLength(1);
    await deleteArticleComment(c);
    expect(await listArticleComments('edito-ann-test', true)).toEqual([]);
  });

  it('en démonstration : « J’aime » s’ajoute une seule fois et se retire', async () => {
    await setArticleLiked('edito-ann-test', 'm1', true);
    await setArticleLiked('edito-ann-test', 'm1', true);
    await setArticleLiked('edito-ann-test', 'm2', true);
    expect(await getArticleLikes('edito-ann-test', 'm1')).toEqual({ likes: 2, liked: true });
    await setArticleLiked('edito-ann-test', 'm1', false);
    expect(await getArticleLikes('edito-ann-test', 'm1')).toEqual({ likes: 1, liked: false });
    expect((await getArticleLikes('edito-ann-test')).liked).toBe(false);
  });
});
