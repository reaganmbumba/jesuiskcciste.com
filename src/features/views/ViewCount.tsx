import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { recordView, requestViews, subscribeViews, viewPath } from './views';

/** Pages où l'on n'affiche pas de compteur (espaces privés, connexion…). */
const PRIVATE = /^\/(espace|admin|connexion|inscription|mot-de-passe-oublie|acces-refuse)(\/|$)/;

export function useViewCount(path: string | null, record = false): number | null {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    setN(null);
    if (!path) return;
    const off = subscribeViews(path, setN);
    if (record) void recordView(path);
    else requestViews(path);
    return off;
  }, [path, record]);
  return n;
}

/**
 * « 👁 N lectures ». Avec `record`, la visite est comptée.
 * Sans `path`, c'est l'adresse de la page affichée qui est utilisée.
 * N'affiche rien tant que le total est inconnu (ou nul, si `hideZero`).
 */
export function ViewCount({ path, record = false, tone = 'light', hideZero = false, className }: {
  path?: string;
  record?: boolean;
  tone?: 'light' | 'dark';
  hideZero?: boolean;
  className?: string;
}) {
  const { tx, locale } = useI18n();
  const { pathname } = useLocation();
  const target = path ?? viewPath(pathname);
  const n = useViewCount(PRIVATE.test(target) ? null : target, record);
  if (n === null || (hideZero && n < 1)) return null;
  const num = new Intl.NumberFormat(locale === 'en' ? 'en-GB' : locale === 'pt' ? 'pt-PT' : 'fr-FR').format(n);
  const label = n <= 1
    ? tx(`${num} lecture`, `${num} read`, `${num} leitura`)
    : tx(`${num} lectures`, `${num} reads`, `${num} leituras`);
  return (
    <span
      title={tx('Nombre de fois que ce contenu a été vu', 'Number of times this content has been viewed', 'Número de vezes que este conteúdo foi visto')}
      className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium', tone === 'dark' ? 'text-white/70' : 'text-ink/60', className)}
    >
      <Eye className="h-4 w-4" aria-hidden />
      {label}
    </span>
  );
}
