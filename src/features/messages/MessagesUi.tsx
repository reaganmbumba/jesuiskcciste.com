import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { startConversation, unreadCount } from './messages';

/** Événement envoyé quand des messages viennent d'être lus (rafraîchit les pastilles). */
export const MESSAGES_CHANGED = 'kcc:messages-changed';
export const notifyMessagesChanged = () => window.dispatchEvent(new Event(MESSAGES_CHANGED));

/** Nombre de messages privés non lus, actualisé chaque minute et au retour sur l'onglet. */
export function useUnreadMessages(): number {
  const { profile } = useAuth();
  const [count, setCount] = useState(0);
  const active = profile?.status === 'active';
  const me = profile?.id;

  const refresh = useCallback(() => {
    if (!active || !me) return;
    unreadCount(me).then(setCount).catch(() => undefined);
  }, [active, me]);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    refresh();
    const timer = window.setInterval(refresh, 60000);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener(MESSAGES_CHANGED, refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(MESSAGES_CHANGED, refresh);
    };
  }, [active, refresh]);

  return count;
}

/** Bouton « Écrire un message » vers un membre (ouvre ou retrouve la conversation). */
export function WriteToMemberButton({ memberId, size = 'sm', variant = 'outline', className, label, compact }: {
  memberId: string; size?: 'sm' | 'md' | 'lg'; variant?: 'primary' | 'outline' | 'gold' | 'ghost'; className?: string; label?: string;
  /** Simple lien texte (ex. sous un commentaire du forum). */
  compact?: boolean;
}) {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const text = label ?? tx('Écrire un message', 'Send a message', 'Enviar uma mensagem');
  const icon = <MessageCircle className="h-4 w-4" />;

  if (profile?.id === memberId) return null;
  if (!profile) return <ButtonLink to="/connexion" state={{ from: `/espace/messages` }} size={size} variant={variant} className={className} icon={icon}>{text}</ButtonLink>;
  if (profile.status !== 'active') {
    return <Button size={size} variant={variant} className={className} icon={icon} disabled title={tx('Disponible dès que votre compte est validé.', 'Available once your account is approved.', 'Disponível assim que a sua conta for validada.')}>{text}</Button>;
  }

  async function open() {
    setBusy(true);
    try {
      const id = await startConversation(memberId, profile!.id);
      navigate(`/espace/messages/${id}`);
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('Impossible d’écrire à ce membre.', 'Unable to write to this member.', 'Não é possível escrever a este membro.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <button type="button" disabled={busy} onClick={open} className={cn('inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-800 disabled:opacity-60', className)}>
        <MessageCircle className={cn('h-3.5 w-3.5', busy && 'animate-pulse')} aria-hidden />{text}
      </button>
    );
  }
  return <Button size={size} variant={variant} className={className} icon={icon} loading={busy} onClick={open}>{text}</Button>;
}
