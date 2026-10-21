import { describe, expect, it } from 'vitest';
import { addComment, createTopic, deleteComment, getTopic, listComments, listTopics, setCommentHidden, sortTopics } from '@/features/forum/forum';
import type { ForumTopic, Profile } from '@/types';

const topic = (id: string, createdAt: string, isPinned = false): ForumTopic =>
  ({ id, title: id, body: '', isPinned, isLocked: false, isHidden: false, commentCount: 0, createdAt });

describe('Forum', () => {
  it('met les sujets épinglés en tête, puis les plus récents', () => {
    const out = sortTopics([topic('ancien', '2026-01-01'), topic('epingle', '2025-01-01', true), topic('recent', '2026-06-01')]);
    expect(out.map((t) => t.id)).toEqual(['epingle', 'recent', 'ancien']);
  });

  it('en démonstration : un commentaire affiche le nom et la paroisse du membre, et le compteur suit', async () => {
    const t = await createTopic({ title: 'Sujet de test', body: '' });
    const member = { id: 'm1', firstName: 'Jean', lastName: 'Nzuzi', parishId: 'par-1', status: 'active', roles: [] } as unknown as Profile;
    const c = await addComment(t.id, '  Amen  ', member);
    expect([c.authorName, c.parishName, c.body]).toEqual(['Jean Nzuzi', 'Paroisse exemple A', 'Amen']);
    expect((await getTopic(t.id))?.commentCount).toBe(1);
    await setCommentHidden(c, true);
    expect(await listComments(t.id)).toEqual([]);
    expect((await getTopic(t.id))?.commentCount).toBe(0);
    await deleteComment(c);
    expect(await listComments(t.id, true)).toEqual([]);
    expect((await listTopics())[0].isPinned).toBe(true);
  });
});
