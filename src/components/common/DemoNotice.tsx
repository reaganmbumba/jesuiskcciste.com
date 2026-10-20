import { FlaskConical } from 'lucide-react';
import { isDemoMode } from '@/config/env';
import { useI18n } from '@/i18n';

/** Bandeau affiché tant que Supabase n'est pas configuré. */
export function DemoBanner() {
  const { tx } = useI18n();
  if (!isDemoMode) return null;
  return (
    <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 text-amber-900">
      <p className="container-page flex items-center justify-center gap-2 py-1 text-center text-[11px] font-medium sm:text-xs">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {tx('Mode démonstration : données fictives, aucune information n’est enregistrée en base de données.', 'Demo mode: sample data, nothing is saved to the database.', 'Modo de demonstração: dados fictícios, nada é guardado na base de dados.')}
      </p>
    </div>
  );
}

export function DemoInline({ children }: { children?: React.ReactNode }) {
  if (!isDemoMode) return null;
  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900" role="note">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children ?? 'Démonstration : les modifications restent dans cet onglet et ne sont pas enregistrées.'}</span>
    </div>
  );
}
