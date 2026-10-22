import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Lock, MessageCircle, PenSquare, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Form';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { listConversations, searchRecipients, startConversation } from '@/features/messages/messages';
import { MESSAGES_CHANGED } from '@/features/messages/MessagesUi';
import { useAsync, useDebounced } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useI18n, type Locale } from '@/i18n';
import { cn, formatDate, formatTime } from '@/utils/format';
import type { MessageRecipient } from '@/types';

export const nameInitials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

/** Heure si aujourd'hui, sinon date courte. */
export function shortWhen(iso: string, locale: Locale) {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString() ? formatTime(iso, locale) : formatDate(iso, locale, { day: 'numeric', month: 'short' });
}

export function Initials({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span aria-hidden className={cn('grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-200 to-gold-400 font-semibold text-night', size === 'sm' ? 'h-10 w-10 text-sm' : 'h-12 w-12')}>
      {nameInitials(name)}
    </span>
  );
}

/** Boîte de réception des messages privés. */
export default function MessagesPage() {
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const me = profile!.id;
  const active = profile!.status === 'active';
  const [composing, setComposing] = useState(false);
  const { data, loading, error, reload, setData } = useAsync(() => listConversations(me), [me]);
  usePageMeta({ title: tx('Messages privés', 'Private messages', 'Mensagens privadas') });

  useEffect(() => {
    // Actualisation discrète (sans squelette de chargement).
    const refresh = () => void listConversations(me).then(setData).catch(() => undefined);
    const timer = window.setInterval(() => document.visibilityState === 'visible' && refresh(), 30000);
    window.addEventListener(MESSAGES_CHANGED, refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MESSAGES_CHANGED, refresh);
    };
  }, [me, setData]);

  const list = data ?? [];
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-night">{tx('Messages privés', 'Private messages', 'Mensagens privadas')}</h1>
          <p className="mt-1 text-sm text-ink/60">{tx('Seuls vous et votre interlocuteur lisez ces messages.', 'Only you and the other member can read these messages.', 'Só você e o seu interlocutor leem estas mensagens.')}</p>
        </div>
        {active && !composing && <Button size="sm" onClick={() => setComposing(true)} icon={<PenSquare className="h-4 w-4" />}>{tx('Nouveau message', 'New message', 'Nova mensagem')}</Button>}
      </div>

      {!active && (
        <p className="rounded-2xl border border-gold/30 bg-gold-50 p-4 text-sm text-ink/80">
          <Lock className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden />
          {tx('Votre compte est en attente de validation. Vous pourrez écrire aux membres dès qu’un responsable l’aura validé.', 'Your account is awaiting approval. You will be able to write to members as soon as a leader approves it.', 'A sua conta aguarda validação. Poderá escrever aos membros assim que um responsável a validar.')}
        </p>
      )}

      {composing && <NewMessage onClose={() => setComposing(false)} />}

      {error ? <ErrorState error={error} onRetry={reload} /> : loading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={<MessageCircle className="h-6 w-6" />} title={tx('Aucun message pour le moment.', 'No messages yet.', 'Ainda não há mensagens.')}
          description={tx('Écrivez à un membre avec « Nouveau message », depuis l’annuaire ou depuis le forum.', 'Write to a member with “New message”, from the directory or from the forum.', 'Escreva a um membro com «Nova mensagem», a partir do diretório ou do fórum.')}
          action={<Link to="/communaute/annuaire" className="text-sm font-semibold text-gold-700 underline">{tx('Ouvrir l’annuaire', 'Open the directory', 'Abrir o diretório')}</Link>} />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-night/[0.06]">
            {list.map((c) => {
              const unread = c.unreadCount > 0;
              const mine = c.lastSenderId === me;
              return (
                <li key={c.id}>
                  <Link to={`/espace/messages/${c.id}`} className={cn('flex items-center gap-3 px-4 py-4 transition hover:bg-mist sm:px-5', unread && 'bg-gold-50/50')}>
                    <Initials name={c.otherName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={cn('truncate text-night', unread ? 'font-bold' : 'font-semibold')}>{c.otherName}</p>
                        {c.lastMessageAt && <span className={cn('shrink-0 text-xs', unread ? 'font-semibold text-gold-700' : 'text-ink/45')}>{shortWhen(c.lastMessageAt, locale)}</span>}
                      </div>
                      {c.otherParish && <p className="flex items-center gap-1 truncate text-xs text-gold-700"><Building2 className="h-3 w-3 shrink-0" aria-hidden />{c.otherParish}</p>}
                      <div className="mt-0.5 flex items-center justify-between gap-3">
                        <p className={cn('truncate text-sm', unread ? 'font-medium text-night' : 'text-ink/60')}>
                          {c.lastBody ? <>{mine && <span className="text-ink/45">{tx('Vous : ', 'You: ', 'Você: ')}</span>}{c.lastBody}</> : <span className="italic text-ink/45">{tx('Aucun message', 'No messages', 'Sem mensagens')}</span>}
                        </p>
                        {unread && <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-night" aria-label={tx(`${c.unreadCount} non lu(s)`, `${c.unreadCount} unread`, `${c.unreadCount} não lida(s)`)}>{c.unreadCount}</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

/** Recherche d'un membre par son nom pour lui écrire. */
function NewMessage({ onClose }: { onClose: () => void }) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [opening, setOpening] = useState<string | null>(null);
  const search = useDebounced(q);
  const results = useAsync<MessageRecipient[]>(() => searchRecipients(search, profile!.id), [search]);
  const short = search.trim().length < 2;

  async function open(r: MessageRecipient) {
    setOpening(r.id);
    try {
      navigate(`/espace/messages/${await startConversation(r.id, profile!.id)}`);
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('Impossible d’écrire à ce membre.', 'Unable to write to this member.', 'Não é possível escrever a este membro.'), 'error');
      setOpening(null);
    }
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg font-semibold text-night">{tx('À qui voulez-vous écrire ?', 'Who do you want to write to?', 'A quem quer escrever?')}</p>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-ink/60 hover:bg-mist" aria-label={tx('Fermer', 'Close', 'Fechar')}><X className="h-5 w-5" /></button>
      </div>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" placeholder={tx('Nom du membre…', 'Member’s name…', 'Nome do membro…')} aria-label={tx('Rechercher un membre par son nom', 'Search a member by name', 'Pesquisar um membro pelo nome')} />
      </div>
      <div className="mt-3">
        {short ? <p className="text-sm text-ink/55">{tx('Tapez au moins deux lettres du nom.', 'Type at least two letters of the name.', 'Escreva pelo menos duas letras do nome.')}</p>
          : results.loading ? <Skeleton className="h-14 rounded-2xl" />
          : results.error ? <ErrorState error={results.error} onRetry={results.reload} />
          : !results.data?.length ? <p className="text-sm text-ink/55">{tx('Aucun membre trouvé.', 'No member found.', 'Nenhum membro encontrado.')}</p>
          : (
            <ul className="divide-y divide-night/[0.06]">
              {results.data.map((r) => (
                <li key={r.id}>
                  <button type="button" disabled={!!opening} onClick={() => open(r)} className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-mist disabled:opacity-60">
                    <Initials name={r.displayName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-night">{r.displayName}</span>
                      <span className="block truncate text-xs text-ink/55">{r.parishName || tx('Paroisse non indiquée', 'Parish not given', 'Paróquia não indicada')}</span>
                    </span>
                    <MessageCircle className={cn('h-5 w-5 text-gold-600', opening === r.id && 'animate-pulse')} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
      </div>
    </Card>
  );
}
