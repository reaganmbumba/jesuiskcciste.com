import { useEffect, useState } from 'react';
import { Check, Copy, MessageCircle, PenLine } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/i18n';
import { getMyMatricule, matriculeMessage, waNumber } from './readerAccess';

const seenKey = (userId: string) => `kcc.matricule.vu.${userId}`;

/**
 * Dès la connexion, le membre voit son matricule à l'écran (une fois par appareil),
 * peut se l'envoyer sur son WhatsApp, et on lui demande de le noter.
 */
export function MatriculeWelcome() {
  const { profile } = useAuth();
  const { tx } = useI18n();
  const [matricule, setMatricule] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMatricule(null);
    if (!profile || profile.status === 'suspended') return;
    try { if (localStorage.getItem(seenKey(profile.id))) return; } catch { return; }
    let alive = true;
    getMyMatricule(profile.id, true).then((m) => { if (alive && m) setMatricule(m); }).catch(() => undefined);
    return () => { alive = false; };
  }, [profile?.id, profile?.status]);

  if (!profile || !matricule) return null;
  const close = () => {
    try { localStorage.setItem(seenKey(profile.id), new Date().toISOString()); } catch { /* ignore */ }
    setMatricule(null);
  };
  const text = matriculeMessage(profile.firstName, matricule, env.siteUrl || 'https://www.jesuiskcciste.com');
  const num = waNumber(profile.phone);
  const waUrl = `https://wa.me/${num ?? ''}?text=${encodeURIComponent(text)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(matricule); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  return (
    <Modal open onClose={close} title={tx('Votre matricule KCCiste', 'Your KCCiste number', 'A sua matrícula KCCista')}
      footer={<Button onClick={close} icon={<Check className="h-4 w-4" />}>{tx('C’est noté', 'I’ve noted it', 'Já anotei')}</Button>}>
      <p className="text-sm text-ink/75">{tx(`Paix à vous ${profile.firstName} ! Voici votre matricule personnel :`, `Peace be with you ${profile.firstName}! Here is your personal number:`, `A paz esteja consigo ${profile.firstName}! Eis a sua matrícula pessoal:`)}</p>
      <div className="my-4 flex items-center justify-center gap-3 rounded-2xl bg-night px-4 py-5">
        <span className="font-mono text-3xl font-bold tracking-widest text-gold-200">{matricule}</span>
        <button type="button" onClick={copy} aria-label={tx('Copier', 'Copy', 'Copiar')} className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
      </div>
      <p className="flex gap-2 rounded-xl bg-gold-50 p-3 text-sm font-medium text-night"><PenLine className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />{tx('Écrivez-le quelque part (carnet, notes du téléphone). Chaque fois que le site www.jesuiskcciste.com vous le demandera pour lire un article, il suffira de le saisir.', 'Write it down somewhere (notebook, phone notes). Whenever www.jesuiskcciste.com asks for it to read an article, just type it in.', 'Escreva-a algures (caderno, notas do telemóvel). Sempre que o site www.jesuiskcciste.com a pedir para ler um artigo, basta introduzi-la.')}</p>
      <p className="mt-3 text-xs text-ink/60">{tx('Il est strictement personnel : ne le partagez pas. Il ne fonctionne que sur un seul téléphone à la fois.', 'It is strictly personal: do not share it. It works on one phone at a time.', 'É estritamente pessoal: não a partilhe. Só funciona num telemóvel de cada vez.')}</p>
      <a href={waUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:brightness-95">
        <MessageCircle className="h-4 w-4" />{tx('M’envoyer le matricule sur WhatsApp', 'Send the number to my WhatsApp', 'Enviar a matrícula para o meu WhatsApp')}
      </a>
    </Modal>
  );
}
