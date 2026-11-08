import { useState } from 'react';
import { Check, Copy, IdCard, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { getMyMatricule } from './readerAccess';

/** Carte « Mon matricule » : personnel, visible seulement par le membre. */
export function MyMatriculeCard() {
  const { profile } = useAuth();
  const { tx } = useI18n();
  const [copied, setCopied] = useState(false);
  const active = profile?.status !== 'suspended';
  const { data: matricule, loading } = useAsync(() => (profile ? getMyMatricule(profile.id, active).catch(() => null) : Promise.resolve(null)), [profile?.id, active]);
  if (!profile) return null;
  const copy = async () => {
    if (!matricule) return;
    try { await navigator.clipboard.writeText(matricule); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  return (
    <div className="rounded-2xl border border-gold/30 bg-gold-50 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-night text-gold-200"><IdCard className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">{tx('Mon matricule KCCiste', 'My KCCiste number', 'A minha matrícula KCCista')}</p>
          {loading ? <p className="mt-1 text-ink/50">…</p> : matricule ? (
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-wider text-night">{matricule}</span>
              <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-night ring-1 ring-night/10 hover:ring-gold">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? tx('Copié', 'Copied', 'Copiado') : tx('Copier', 'Copy', 'Copiar')}</button>
            </div>
          ) : <p className="mt-1 text-sm text-ink/70">{tx('Matricule indisponible pour le moment. Réessayez plus tard ou contactez l’administration.', 'Number unavailable right now. Try again later or contact the administration.', 'Matrícula indisponível. Tente mais tarde ou contacte a administração.')}</p>}
          <p className="mt-3 flex gap-2 text-xs text-ink/65"><ShieldAlert className="h-4 w-4 shrink-0 text-gold-700" />{tx('Strictement personnel : ne le partagez pas. Il ouvre la lecture des articles sur un seul téléphone à la fois.', 'Strictly personal: do not share it. It unlocks articles on one phone at a time.', 'Estritamente pessoal: não a partilhe. Abre a leitura dos artigos num só telemóvel de cada vez.')}</p>
        </div>
      </div>
    </div>
  );
}
