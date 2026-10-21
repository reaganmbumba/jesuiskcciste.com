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
      if (!data?.value) return;
      const db = camelize<Partial<SiteSettings>>(data.value);
      // Un champ de contact laissé vide en base garde la coordonnée officielle par défaut.
      const c = db.contact ?? defaultSiteSettings.contact;
      const contact = { email: c.email || defaultSiteSettings.contact.email, phone: c.phone || defaultSiteSettings.contact.phone, address: c.address || defaultSiteSettings.contact.address };
      setSettings({ ...defaultSiteSettings, ...db, contact });
    });
  }, []);
  return <Ctx.Provider value={{ settings, setSettings }}>{children}</Ctx.Provider>;
}

export const useSiteSettings = () => useContext(Ctx);
