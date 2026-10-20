import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultSiteSettings, type SiteSettings } from '@/config/site';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';

interface Value { settings: SiteSettings; setSettings: (s: SiteSettings) => void }
const Ctx = createContext<Value>({ settings: defaultSiteSettings, setSettings: () => {} });

/** Paramètres institutionnels (contact, réseaux, logo) lus depuis `site_settings`. */
export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('site_settings').select('value').eq('key', 'public').maybeSingle().then(({ data }) => {
      if (data?.value) setSettings({ ...defaultSiteSettings, ...camelize<Partial<SiteSettings>>(data.value) });
    });
  }, []);
  return <Ctx.Provider value={{ settings, setSettings }}>{children}</Ctx.Provider>;
}

export const useSiteSettings = () => useContext(Ctx);
