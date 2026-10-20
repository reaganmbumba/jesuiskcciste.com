import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-ink/60">
      <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-night/[0.06] ${className}`} aria-hidden />;
}
