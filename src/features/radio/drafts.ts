import { supabase } from '@/lib/supabase';
import { radioSettingsOf, type RadioProgramme } from './radio';
import type { SiteSettings } from '@/config/site';

/**
 * Émissions enregistrées sans diffuser (« brouillons ») : le fichier est en ligne, et on garde
 * dans ce navigateur la liste de celles qui restent à programmer, pour le faire plus tard.
 */
export type RadioDraft = { id: string; title: string; topic: string; url: string; seconds: number; recordedAt: string; programmedFor?: string };

const KEY = 'kcc-radio-brouillons';

export function loadDrafts(): RadioDraft[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((d) => d && typeof d.url === 'string' && typeof d.id === 'string') : [];
  } catch { return []; }
}

function save(list: RadioDraft[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50))); } catch { /* navigation privée */ }
  try { window.dispatchEvent(new Event(KEY)); } catch { /* hors navigateur */ }
}

export function addDraft(d: RadioDraft) { save([d, ...loadDrafts().filter((x) => x.id !== d.id)]); }
export function updateDraft(id: string, patch: Partial<RadioDraft>) { save(loadDrafts().map((d) => (d.id === id ? { ...d, ...patch } : d))); }
export function removeDraft(id: string) { save(loadDrafts().filter((d) => d.id !== id)); }
export const DRAFTS_EVENT = KEY;


/** Ajoute l'émission à la grille (fonction radio_programme_add, ouverte aux animateurs radio). */
export async function scheduleProgramme(settings: SiteSettings, setSettings: (s: SiteSettings) => void, input: { title: string; topic: string; url: string; seconds: number; when: string }): Promise<Date> {
  const start = new Date(input.when);
  if (!input.when || Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 60_000) throw new Error('Choisissez une date et une heure à venir.');
  if (!(input.seconds > 0)) throw new Error('Durée de l’enregistrement inconnue.');
  const r = radioSettingsOf(settings);
  const p: RadioProgramme = { id: crypto.randomUUID?.() ?? `${Date.now()}`, title: input.title.trim().slice(0, 120) || 'Émission', topic: input.topic.slice(0, 3000), url: input.url, startsAt: start.toISOString(), durationSeconds: Math.round(input.seconds) };
  const { error } = await supabase!.rpc('radio_programme_add', { p });
  if (error) throw error;
  const next = { ...settings, radio: { ...r, programmes: [...r.programmes, p] } };
  setSettings(next);
  return start;
}

export const whenLabel = (d: Date | string) => new Date(d).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
