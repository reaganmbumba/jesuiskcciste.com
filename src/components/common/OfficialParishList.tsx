import { OFFICIAL_PARISHES, PARISH_COUNTRIES } from '@/content/paroisses';

export const OFFICIAL_PARISH_LIST_ID = 'paroisses-officielles';

/** « Paroisse de Matete (Kinshasa) » : nom officiel suivi de la province ou du pays. */
export const officialParishValue = (p: (typeof OFFICIAL_PARISHES)[number]) => `${p.name} (${p.region?.fr ?? PARISH_COUNTRIES[p.country].fr})`;

/** Suggestions de la liste officielle des paroisses, pour un champ texte (attribut list). */
export function OfficialParishList() {
  return (
    <datalist id={OFFICIAL_PARISH_LIST_ID}>
      {OFFICIAL_PARISHES.map((p) => <option key={p.n} value={officialParishValue(p)} />)}
    </datalist>
  );
}
