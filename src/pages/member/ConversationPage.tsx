import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Building2, Check, CheckCheck, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { deleteMessage, getConversation, listMessages, markConversationRead, MESSAGE_MAX, sendMessage, setBlocked } from '@/features/messages/messages';
import { notifyMessagesChanged } from '@/features/messages/MessagesUi';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useI18n } from '@/i18n';
import { cn, formatDate, formatTime } from '@/utils/format';
import type { PrivateMessage } from '@/types';
import { Initials } from './MessagesPage';

/** Une conversation privée entre deux membres. */
export default function ConversationPage() {
  const { id = '' } = useParams();
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const me = profile!.id;
  const conv = useAsync(() => getConversation(id, me), [id, me]);
  const msgs = useAsync(() => listMessages(id), [id]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: 'block' } | { kind: 'delete'; message: PrivateMessage } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const c = conv.data;
  const list = msgs.data ?? [];
  const { setData: setMsgs } = msgs;
  usePageMeta({ title: c?.otherName ?? tx('Messages privés', 'Private messages', 'Mensagens privadas') });

  // Marque comme lus les messages reçus dès qu'ils s'affichent.
  const unreadFromOther = list.some((m) => m.senderId !== me && !m.readAt);
  useEffect(() => {
    if (!c || !unreadFromOther) return;
    markConversationRead(id, me).then(notifyMessagesChanged).catch(() => undefined);
  }, [c, id, me, unreadFromOther]);

  // Nouveaux messages : actualisation toutes les 10 s quand la page est visible.
  const refresh = useCallback(() => listMessages(id).then(setMsgs).catch(() => undefined), [id, setMsgs]);
  useEffect(() => {
    const timer = window.setInterval(() => document.visibilityState === 'visible' && void refresh(), 10000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const lastId = list.at(-1)?.id;
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastId]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const m = await sendMessage(id, body, me);
      setBody('');
      setMsgs([...list, m]);
    } catch (err) {
      notify(err instanceof Error ? err.message : tx('L’envoi a échoué.', 'Sending failed.', 'O envio falhou.'), 'error');
      void conv.reload();
    } finally {
      setSending(false);
    }
  }

  async function confirmAction() {
    if (!confirm || !c) return;
    setBusy(true);
    try {
      if (confirm.kind === 'delete') {
        await deleteMessage(confirm.message.id);
        setMsgs(list.filter((m) => m.id !== confirm.message.id));
        notify(tx('Message retiré.', 'Message removed.', 'Mensagem retirada.'));
      } else {
        await setBlocked(c.otherId, true, me);
        await conv.reload();
        notify(tx('Membre bloqué.', 'Member blocked.', 'Membro bloqueado.'));
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : tx('L’action a échoué.', 'The action failed.', 'A ação falhou.'), 'error');
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  async function unblock() {
    if (!c) return;
    setBusy(true);
    try {
      await setBlocked(c.otherId, false, me);
      await conv.reload();
      notify(tx('Membre débloqué.', 'Member unblocked.', 'Membro desbloqueado.'));
    } catch (err) {
      notify(err instanceof Error ? err.message : tx('L’action a échoué.', 'The action failed.', 'A ação falhou.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  const back = (
    <Link to="/espace/messages" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-night">
      <ArrowLeft className="h-4 w-4" aria-hidden />{tx('Tous les messages', 'All messages', 'Todas as mensagens')}
    </Link>
  );

  if (conv.error) return <div className="mx-auto max-w-3xl space-y-4">{back}<ErrorState error={conv.error} onRetry={conv.reload} /></div>;
  if (conv.loading) return <div className="mx-auto max-w-3xl space-y-4">{back}<Skeleton className="h-96 rounded-3xl" /></div>;
  if (!c) return <div className="mx-auto max-w-3xl space-y-4">{back}<EmptyState title={tx('Cette conversation est introuvable.', 'This conversation could not be found.', 'Esta conversa não foi encontrada.')} /></div>;

  // Dernier message envoyé par moi : affiche « Lu » ou « Envoyé ».
  const lastMine = [...list].reverse().find((m) => m.senderId === me);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {back}
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-night/[0.06] px-4 py-4 sm:px-6">
          <Initials name={c.otherName} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-semibold text-night">{c.otherName}</h1>
            <p className="flex items-center gap-1 truncate text-sm text-gold-700"><Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />{c.otherParish || tx('Paroisse non indiquée', 'Parish not given', 'Paróquia não indicada')}</p>
          </div>
          {c.blockedByMe
            ? <Button size="sm" variant="outline" loading={busy} onClick={unblock}>{tx('Débloquer', 'Unblock', 'Desbloquear')}</Button>
            : <Button size="sm" variant="ghost" className="text-red-700" onClick={() => setConfirm({ kind: 'block' })} icon={<Ban className="h-4 w-4" />}><span className="hidden sm:inline">{tx('Bloquer', 'Block', 'Bloquear')}</span></Button>}
        </div>

        <div ref={scroller} className="max-h-[60vh] min-h-[16rem] overflow-y-auto bg-mist/60 px-3 py-5 sm:px-6" aria-live="polite">
          <p className="mx-auto mb-5 flex max-w-md items-center justify-center gap-1.5 text-center text-xs text-ink/50">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />{tx('Conversation privée : seuls vous deux pouvez la lire.', 'Private conversation: only the two of you can read it.', 'Conversa privada: só vocês dois a podem ler.')}
          </p>
          {msgs.error ? <ErrorState error={msgs.error} onRetry={msgs.reload} /> : msgs.loading ? (
            <div className="space-y-3"><Skeleton className="h-12 w-2/3 rounded-2xl" /><Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" /></div>
          ) : list.length === 0 ? (
            <p className="text-center text-sm text-ink/55">{tx(`Écrivez votre premier message à ${c.otherName}.`, `Write your first message to ${c.otherName}.`, `Escreva a sua primeira mensagem a ${c.otherName}.`)}</p>
          ) : (
            <ol className="space-y-2">
              {list.map((m, i) => {
                const mine = m.senderId === me;
                const day = new Date(m.createdAt).toDateString();
                const newDay = i === 0 || new Date(list[i - 1].createdAt).toDateString() !== day;
                return (
                  <Fragment key={m.id}>
                    {newDay && <li className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink/40">{formatDate(m.createdAt, locale, { weekday: 'long', day: 'numeric', month: 'long' })}</li>}
                    <li className={cn('group flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
                      {mine && (
                        <button type="button" onClick={() => setConfirm({ kind: 'delete', message: m })} className="mb-1 rounded-full p-1.5 text-ink/30 opacity-100 transition hover:bg-white hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100" aria-label={tx('Retirer ce message', 'Remove this message', 'Retirar esta mensagem')}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      )}
                      <div className={cn('max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%]', mine ? 'rounded-br-md bg-night text-white' : 'rounded-bl-md bg-white text-ink')}>
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{m.body}</p>
                        <p className={cn('mt-1 flex items-center justify-end gap-1 text-[11px]', mine ? 'text-white/55' : 'text-ink/45')}>
                          {formatTime(m.createdAt, locale)}
                          {mine && m.id === lastMine?.id && (m.readAt
                            ? <><CheckCheck className="h-3.5 w-3.5 text-gold-300" aria-hidden />{tx('Lu', 'Read', 'Lida')}</>
                            : <><Check className="h-3.5 w-3.5" aria-hidden />{tx('Envoyé', 'Sent', 'Enviada')}</>)}
                        </p>
                      </div>
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          )}
        </div>

        {c.canSend ? (
          <form onSubmit={send} className="border-t border-night/[0.06] p-3 sm:p-4">
            <label htmlFor="pm-body" className="sr-only">{tx('Votre message', 'Your message', 'A sua mensagem')}</label>
            <div className="flex items-end gap-2">
              <Textarea id="pm-body" rows={2} maxLength={MESSAGE_MAX} value={body} onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void send(); }}
                placeholder={tx('Écrivez votre message…', 'Write your message…', 'Escreva a sua mensagem…')} className="min-h-[3rem] flex-1 resize-none" />
              <Button type="submit" loading={sending} disabled={!body.trim()} icon={<Send className="h-4 w-4" />} aria-label={tx('Envoyer', 'Send', 'Enviar')}>
                <span className="hidden sm:inline">{tx('Envoyer', 'Send', 'Enviar')}</span>
              </Button>
            </div>
          </form>
        ) : (
          <p className="border-t border-night/[0.06] bg-mist/70 p-4 text-center text-sm text-ink/70">
            {c.blockedByMe
              ? tx('Vous avez bloqué ce membre. Débloquez-le pour lui écrire de nouveau.', 'You have blocked this member. Unblock them to write again.', 'Bloqueou este membro. Desbloqueie-o para voltar a escrever.')
              : tx('Ce membre ne reçoit pas de messages privés pour le moment.', 'This member is not receiving private messages at the moment.', 'Este membro não está a receber mensagens privadas de momento.')}
          </p>
        )}
      </Card>

      <ConfirmDialog open={!!confirm} danger loading={busy} onCancel={() => setConfirm(null)} onConfirm={confirmAction}
        title={confirm?.kind === 'block' ? tx(`Bloquer ${c.otherName} ?`, `Block ${c.otherName}?`, `Bloquear ${c.otherName}?`) : tx('Retirer ce message ?', 'Remove this message?', 'Retirar esta mensagem?')}
        confirmLabel={confirm?.kind === 'block' ? tx('Bloquer', 'Block', 'Bloquear') : tx('Retirer', 'Remove', 'Retirar')}
        message={confirm?.kind === 'block'
          ? tx('Ce membre ne pourra plus vous écrire, et vous ne pourrez plus lui écrire. Vous pourrez le débloquer à tout moment.', 'This member will no longer be able to write to you, and you will not be able to write to them. You can unblock them at any time.', 'Este membro deixará de lhe poder escrever, e você também não lhe poderá escrever. Pode desbloqueá-lo a qualquer momento.')
          : tx('Le message sera effacé pour vous deux.', 'The message will be erased for both of you.', 'A mensagem será apagada para os dois.')} />
    </div>
  );
}
