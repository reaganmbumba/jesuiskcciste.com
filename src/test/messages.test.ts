import { describe, expect, it } from 'vitest';
import { listConversations, listMessages, markConversationRead, searchRecipients, sendMessage, setBlocked, startConversation, unreadCount } from '@/features/messages/messages';

// Mode démonstration (aucune base configurée pendant les tests).
describe('Messages privés (démonstration)', () => {
  const me = 'demo-member';

  it('affiche une conversation d’exemple avec un message non lu, puis la marque comme lue', async () => {
    const [c] = await listConversations(me);
    expect(c.otherName).toBe('Grâce Exemple');
    expect(await unreadCount(me)).toBe(1);
    await markConversationRead(c.id, me);
    expect(await unreadCount(me)).toBe(0);
  });

  it('ouvre une seule conversation par membre et y envoie un message', async () => {
    const id = await startConversation('mem-2', me);
    expect(await startConversation('mem-2', me)).toBe(id);
    await sendMessage(id, '  Bonjour  ', me);
    const msgs = await listMessages(id);
    expect(msgs.at(-1)).toMatchObject({ body: 'Bonjour', senderId: me });
    expect((await listConversations(me))[0].id).toBe(id);
  });

  it('cherche les destinataires par nom (2 lettres minimum)', async () => {
    expect(await searchRecipients('D', me)).toEqual([]);
    expect((await searchRecipients('Daniel', me)).map((r) => r.id)).toEqual(['mem-2']);
  });

  it('refuse les comptes non actifs et bloque l’envoi après un blocage', async () => {
    await expect(startConversation('mem-6', me)).rejects.toThrow(); // compte en attente
    const id = await startConversation('mem-3', me);
    await setBlocked('mem-3', true, me);
    expect((await listConversations(me)).find((c) => c.id === id)).toMatchObject({ canSend: false, blockedByMe: true });
    await expect(sendMessage(id, 'Encore', me)).rejects.toThrow();
    await setBlocked('mem-3', false, me);
    await expect(sendMessage(id, 'Encore', me)).resolves.toBeTruthy();
  });
});
