import type { ReactNode } from 'react';
import { HeroBackdrop } from '@/components/common/HeroBackdrop';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { settings } = useSiteSettings();
  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-night lg:block">
        <HeroBackdrop src={settings.heroImageUrl} />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="font-display text-5xl font-medium leading-[1.05] tracking-tight">Un seul peuple.<br /><span className="italic text-gold-gradient">Une même communauté.</span></p>
          <p className="mt-4 max-w-md text-white/70">{settings.secondaryMessage}</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <h1 className="font-display text-4xl font-medium tracking-tight text-night">{title}</h1>
          {subtitle && <p className="mt-2 text-ink/65">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
