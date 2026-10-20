import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/format';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.005em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 select-none whitespace-nowrap';
const variants: Record<Variant, string> = {
  primary: 'bg-night text-white shadow-[0_8px_24px_-12px_rgba(14,24,48,.6)] hover:-translate-y-0.5 hover:bg-night-600 hover:shadow-lift active:translate-y-0',
  gold: 'bg-gradient-to-b from-gold-300 to-gold-500 text-night shadow-glow ring-1 ring-inset ring-white/30 hover:-translate-y-0.5 hover:from-gold-200 hover:to-gold-400 active:translate-y-0',
  outline: 'border border-night/12 bg-white/80 text-night backdrop-blur hover:border-gold-400 hover:bg-gold-50',
  ghost: 'text-night hover:bg-night/5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  light: 'border border-white/25 bg-white/[0.08] text-white backdrop-blur-md hover:border-white/45 hover:bg-white/15',
};
const sizes: Record<Size, string> = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-5 text-sm', lg: 'h-[3.25rem] px-7 text-[15px]' };

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({ variant = 'primary', size = 'md', className, icon, children, ...rest }: LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
