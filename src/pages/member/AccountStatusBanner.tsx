import { Clock, ShieldOff } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export function AccountStatusBanner() {
  const { profile } = useAuth();
  if (!profile || profile.status === 'active') return null;
  const pending = profile.status === 'pending';
  return (
    <div role="status" className={`flex gap-3 rounded-2xl p-4 ${pending ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200' : 'bg-red-50 text-red-800 ring-1 ring-red-200'}`}>
      {pending ? <Clock className="h-5 w-5 shrink-0" /> : <ShieldOff className="h-5 w-5 shrink-0" />}
      <p className="text-sm">{pending ? 'Votre adhésion est en attente de validation par un responsable. Certaines fonctionnalités (formations réservées, annuaire complet) seront disponibles après validation.' : 'Votre compte est suspendu. Contactez votre responsable de paroisse.'}</p>
    </div>
  );
}
