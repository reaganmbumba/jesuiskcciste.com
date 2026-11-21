import { supabase } from '@/lib/supabase';

/** Émission déjà diffusée, à réécouter. */
export interface Rediffusion { url: string; title: string; durationSeconds: number; firstAired: string; lastAired: string }

export const RUBRIQUES = ['Prédications', 'Journal KCC', 'Tosungana', 'Prière', 'Émissions'] as const;
export type Rubrique = (typeof RUBRIQUES)[number];

/** Rubrique d'après le titre et le fichier. */
export function rubriqueOf(r: Pick<Rediffusion, 'title' | 'url'>): Rubrique {
  const t = `${r.title} ${r.url}`.toLowerCase();
  if (/journal/.test(t)) return 'Journal KCC';
  if (/tosungana/.test(t)) return 'Tosungana';
  if (/pri[eè]re|mabondeli/.test(t)) return 'Prière';
  if (/pr[ée]dication|proph[èe]te|\/predications\//.test(t)) return 'Prédications';
  return 'Émissions';
}

type Row = { url: string; title: string; duration_seconds: number; first_aired: string; last_aired: string };
export async function listRediffusions(): Promise<Rediffusion[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('radio_rediffusions').select('url,title,duration_seconds,first_aired,last_aired').order('first_aired', { ascending: false }).limit(300);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((r) => ({ url: r.url, title: r.title, durationSeconds: r.duration_seconds, firstAired: r.first_aired, lastAired: r.last_aired }));
}
