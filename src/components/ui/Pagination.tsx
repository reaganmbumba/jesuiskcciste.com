import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  return (
    <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-sm text-ink/60">
        Page <strong className="text-night">{page}</strong> sur {pages} · {total} résultat{total > 1 ? 's' : ''}
      </p>
      <div className="flex gap-2">
        <button className="grid h-10 w-10 place-items-center rounded-xl border border-night/15 bg-white hover:border-gold disabled:opacity-40" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Page précédente">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-xl border border-night/15 bg-white hover:border-gold disabled:opacity-40" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Page suivante">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
