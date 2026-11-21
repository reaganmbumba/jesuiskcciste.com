import { useState, type FormEvent } from 'react';
import { CheckCircle2, Heart, Send } from 'lucide-react';
import { cn } from '@/utils/format';
import { sendDedicace, type DedicaceKind } from './dedicaces';

const read = (k: string) => { try { return localStorage.getItem(k) ?? ''; } catch { return ''; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* rien */ } };

/** Formulaire de l'auditeur : une dédicace ou une intention de prière, lue à l'antenne. */
export function DedicaceForm({ className }: { className?: string }) {
  const [kind, setKind] = useState<DedicaceKind>('dedicace');
  const [name, setName] = useState(() => read('kcc.debate.name'));
  const [place, setPlace] = useState(() => read('kcc.radio.place'));
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) return setError('Indiquez votre nom.');
    if (message.trim().length < 3) return setError(kind === 'priere' ? 'Écrivez votre intention de prière.' : 'Écrivez votre dédicace.');
    setBusy(true);
    try {
      await sendDedicace({ kind, authorName: name, place, recipient, message });
      write('kcc.debate.name', name.trim()); write('kcc.radio.place', place.trim());
      setSent(true); setMessage(''); setRecipient('');
    } catch (err) { setError(err instanceof Error ? err.message : 'L’envoi a échoué. Réessayez.'); } finally { setBusy(false); }
  }

  const field = 'w-full rounded-xl border border-night/15 bg-white px-3 py-2.5 text-[15px] text-night placeholder:text-ink/40';
  if (sent) {
    return (
      <div className={cn('rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900', className)} role="status">
        <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" />Merci, votre message est arrivé au Studio.</p>
        <p className="mt-1">L’animateur le lira à l’antenne pendant une émission. Paix à vous !</p>
        <button type="button" onClick={() => setSent(false)} className="mt-3 font-semibold text-emerald-800 underline">Écrire un autre message</button>
      </div>
    );
  }
  return (
    <form onSubmit={(e) => void submit(e)} className={cn('space-y-3 text-left', className)}>
      <p className="flex items-center gap-2 font-semibold text-night"><Heart className="h-4 w-4 text-gold-600" />Dédicace ou intention de prière</p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de message">
        {([['dedicace', 'Dédicace'], ['priere', 'Intention de prière']] as const).map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
            className={cn('rounded-xl px-3 py-2 text-sm font-semibold', kind === k ? 'bg-gold text-night' : 'border border-night/15 text-ink/70')}>{label}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Votre nom" className={field} aria-label="Votre nom" />
        <input value={place} onChange={(e) => setPlace(e.target.value)} maxLength={80} placeholder="Paroisse ou ville" className={field} aria-label="Paroisse ou ville" />
      </div>
      {kind === 'dedicace' && <input value={recipient} onChange={(e) => setRecipient(e.target.value)} maxLength={120} placeholder="Pour qui ? (ex. ma maman, la chorale de Masina)" className={field} aria-label="Pour qui" />}
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={600} rows={3}
        placeholder={kind === 'priere' ? 'Votre intention : pour quoi voulez-vous que l’on prie ?' : 'Votre message, et un chant que vous aimeriez entendre'} className={field} aria-label="Message" />
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-night px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        <Send className="h-4 w-4" />{busy ? 'Envoi…' : 'Envoyer au Studio'}
      </button>
    </form>
  );
}
