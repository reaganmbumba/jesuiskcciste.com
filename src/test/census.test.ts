import { describe, expect, it } from 'vitest';
import { censusParishCsv, censusPeopleCsv, summarize, toRow, type CensusHousehold } from '@/features/census/census';

const rows: CensusHousehold[] = [
  { id: 'a1', createdAt: '2026-11-18T10:00:00Z', country: 'RD Congo', city: 'Kinshasa', parish: 'Paroisse de Matete (Kinshasa)', personCount: 3,
    people: [{ sex: 'M', age: '36-50', status: 'membre' }, { sex: 'F', age: '36-50', status: 'membre' }, { sex: 'F', age: '0-5' }] },
  { id: 'b2', createdAt: '2026-11-18T11:00:00Z', country: 'RD Congo ', city: 'Kinshasa', parish: 'paroisse de  Matete (kinshasa)', personCount: 1,
    people: [{ sex: 'M', age: '18-25', status: 'neophyte' }] },
  { id: 'c3', createdAt: '2026-11-18T12:00:00Z', country: 'Angola', city: 'Luanda', parish: 'Paroisse de Luanda', personCount: 1, people: [{ sex: 'F', age: '66+' }] },
];

describe('recensement', () => {
  it('compte les personnes par pays, paroisse, âge et sexe', () => {
    const s = summarize(rows);
    expect(s.totals).toEqual({ people: 5, households: 3, parishes: 2, countries: 2 });
    expect(s.byCountry[0]).toMatchObject({ label: 'RD Congo', people: 4, households: 2 });
    expect(s.byParish[0]).toMatchObject({ people: 4, households: 2 });
    expect(s.bySex).toEqual({ M: 2, F: 3 });
    expect(s.byAge['36-50']).toBe(2);
    expect(s.ageSex['36-50']).toEqual({ M: 1, F: 1 });
    expect(s.byStatus).toEqual({ membre: 2, neophyte: 1, sympathisant: 0, inconnu: 2 });
  });

  it('prépare la fiche : seulement les chiffres du téléphone, prénoms vides retirés', () => {
    const r = toRow({ country: ' RD Congo ', city: 'Boma', parish: 'P', phone: '+243 81-234', matricule: 'kcc-mmr-1', people: [{ name: '  ', sex: 'M', age: '0-5' }] });
    expect(r.phone).toBe('24381234');
    expect(r.matricule).toBe('KCC-MMR-1');
    expect(r.people[0].name).toBeUndefined();
  });

  it('exporte une ligne par personne et une ligne par paroisse', () => {
    expect(censusPeopleCsv(rows)).toHaveLength(5);
    const byParish = censusParishCsv(rows);
    expect(byParish).toHaveLength(2);
    expect(byParish[0]).toMatchObject({ Personnes: 4, Hommes: 2, Femmes: 2, Foyers: 2 });
  });
});
