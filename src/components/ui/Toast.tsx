import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useI18n } from '@/i18n';

type Tone = 'success' | 'error' | 'info';
interface ToastItem { id: number; tone: Tone; message: string }
const ToastContext = createContext<{ notify: (message: string, tone?: Tone) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { tx } = useI18n();
  const [items, setItems] = useState<ToastItem[]>([]);
  const notify = useCallback((message: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, tone, message }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 5000);
  }, []);
  const icons = { success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, error: <XCircle className="h-5 w-5 text-red-600" />, info: <Info className="h-5 w-5 text-sky-600" /> };
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-night/10 bg-white p-3.5 shadow-lift animate-fade-up" role={t.tone === 'error' ? 'alert' : 'status'}>
            {icons[t.tone]}
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button onClick={() => setItems((x) => x.filter((i) => i.id !== t.id))} aria-label={tx('Fermer la notification', 'Close notification', 'Fechar a notificação')}><X className="h-4 w-4 text-ink/50" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans ToastProvider');
  return ctx;
}
