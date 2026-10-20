import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/format';

const control =
  'block w-full rounded-2xl border border-night/12 bg-white px-4 py-3 text-[15px] text-ink shadow-[0_1px_2px_rgba(14,24,48,.04)] placeholder:text-ink/40 transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/20 disabled:bg-mist disabled:text-ink/50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-200';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode;
  className?: string;
}

export function Field({ label, error, hint, required, children, className }: FieldProps) {
  const id = useId();
  const descId = error || hint ? `${id}-desc` : undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label} {required && <span className="text-red-600" aria-hidden>*</span>}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': descId })}
      {error ? (
        <p id={descId} role="alert" className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p id={descId} className="text-xs text-ink/60">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(control, className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(control, 'min-h-[110px]', className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cn(control, 'appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-9', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23202938' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...rest}>
      {children}
    </select>
  );
});

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: string }>(function Checkbox({ label, description, ...rest }, ref) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input ref={ref} id={id} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-night/25 text-night accent-[#101B33] focus:ring-gold" {...rest} />
      <label htmlFor={id} className="text-sm text-ink">
        <span className="font-medium">{label}</span>
        {description && <span className="block text-ink/60">{description}</span>}
      </label>
    </div>
  );
});
