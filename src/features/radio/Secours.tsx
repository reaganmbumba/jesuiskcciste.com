import { useEffect, useState } from 'react';
import { ChevronDown, WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/utils/format';

type Conn = { effectiveType?: string; downlink?: number; addEventListener?: (t: string, f: () => void) => void; removeEventListener?: (t: string, f: () => void) => void };
const conn = () => (navigator as Navigator & { connection?: Conn }).connection;

/** Studio : état de la connexion et que faire si elle tombe pendant un direct. */
export function Secours({ dark }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [net, setNet] = useState(() => ({ type: conn()?.effectiveType ?? '', mbps: conn()?.downlink ?? 0 }));
  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    const ch = () => setNet({ type: conn()?.effectiveType ?? '', mbps: conn()?.downlink ?? 0 });
    window.addEventListener('online', up); window.addEventListener('offline', up); conn()?.addEventListener?.('change', ch);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', up); conn()?.removeEventListener?.('change', ch); };
  }, []);
  const weak = !online || net.type === '2g' || net.type === 'slow-2g' || (net.mbps > 0 && net.mbps < 0.5);
  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300', sub: 'text-white/65' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-3 text-night', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]', sub: 'text-ink/70' };
  return (
    <section className={cn(c.box, weak && 'ring-2 ring-red-500')}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn('flex w-full items-center justify-between gap-2', c.hd)}>
        <span className="flex items-center gap-2">
          {online ? <Wifi className={cn('h-4 w-4', weak ? 'text-red-500' : 'text-emerald-500')} /> : <WifiOff className="h-4 w-4 text-red-500" />}
          Connexion : {!online ? 'coupée' : weak ? 'faible' : 'bonne'}{net.mbps ? ` · ${net.mbps} Mb/s` : ''}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>
      {(open || !online) && (
        <div className={cn('mt-3 space-y-2 text-sm', c.sub)}>
          <p className="font-semibold">Avant le direct</p>
          <ul className="list-disc space-y-0.5 pl-5">
            <li>Gardez deux connexions prêtes : le Wi-Fi (ou la box) et les données d’un téléphone d’un autre réseau (Vodacom, Orange, Airtel…).</li>
            <li>Activez le partage de connexion de ce deuxième téléphone et vérifiez qu’il a assez de forfait (une heure de direct ≈ 30 à 60 Mo, plus si vous avez beaucoup d’invités).</li>
            <li>Branchez le téléphone ou l’ordinateur sur le secteur.</li>
          </ul>
          <p className="font-semibold">Si la connexion tombe pendant le direct</p>
          <ol className="list-decimal space-y-0.5 pl-5">
            <li>Ne fermez pas le Studio : passez tout de suite sur la connexion de secours (Wi-Fi du deuxième téléphone).</li>
            <li>Une coupure de moins de 2 minutes ne se voit presque pas : le direct reprend tout seul.</li>
            <li>Au-delà de 3 minutes, la radio reprend d’elle-même chants et émissions programmées. Terminez puis relancez le direct quand la connexion revient.</li>
            <li>Après un retour, lancez un jingle ou un chant le temps de reprendre votre souffle.</li>
          </ol>
        </div>
      )}
    </section>
  );
}
