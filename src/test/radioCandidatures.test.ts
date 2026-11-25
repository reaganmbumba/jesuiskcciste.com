import { describe, expect, it } from 'vitest';
import { candidaturesTable, emptyCandidature, progressOf, submitCandidature, listCandidatures, toRow, validateCandidature, whatsappTo, type CandidatureInput } from '@/features/radio/candidatures';
import { buildXlsx, colName, crc32 } from '@/utils/xlsx';

const filled = (): CandidatureInput => ({
  ...emptyCandidature(),
  fullName: 'MBUMBA NZUZI Reagan', phone: '+243 840 238 592', showTitle: 'La Parole du matin', showType: 'enseignement',
  days: ['samedi', 'lundi'], startTime: '07:00', endTime: '07:30', duration: 30, frequency: 'hebdomadaire', mode: 'direct', certified: true,
});

describe('formulaire des animateurs radio', () => {
  it('refuse un formulaire vide et nomme chaque champ obligatoire', () => {
    const e = validateCandidature(emptyCandidature());
    expect(Object.keys(e).sort()).toEqual(['certified', 'days', 'duration', 'frequency', 'fullName', 'mode', 'phone', 'showTitle', 'showType'].sort());
  });

  it('accepte un formulaire complet', () => {
    expect(validateCandidature(filled())).toEqual({});
  });

  it('vérifie e-mail, heures et « Autre »', () => {
    const e = validateCandidature({ ...filled(), email: 'pas-un-mail', startTime: '09:00', endTime: '08:00', showType: 'autre', showTypeOther: '' });
    expect(e.email).toBeTruthy();
    expect(e.endTime).toBeTruthy();
    expect(e.showTypeOther).toBeTruthy();
  });

  it('range les jours dans l’ordre de la semaine', () => {
    expect(toRow(filled()).days).toEqual(['lundi', 'samedi']);
  });

  it('calcule la progression', () => {
    expect(progressOf(emptyCandidature()).percent).toBe(0);
    const p = progressOf(filled());
    expect(p.percent).toBeGreaterThan(30);
    expect(p.bySection[6]).toEqual({ filled: 1, total: 1 });
  });

  it('enregistre (mode démonstration) et exporte', async () => {
    const { reference } = await submitCandidature(filled());
    expect(reference).toMatch(/^RKCC-\d{4}$/);
    const rows = await listCandidatures();
    const t = candidaturesTable(rows);
    expect(t[0]['Nom et postnom']).toBe('MBUMBA NZUZI Reagan');
    expect(t[0]['Jours']).toBe('Lundi, Samedi');
    expect(t[0]['Mode d’intervention']).toBe('En direct depuis le domicile');
  });

  it('fait un lien WhatsApp avec l’indicatif', () => {
    expect(whatsappTo('0840 238 592')).toBe('https://wa.me/243840238592');
    expect(whatsappTo('+243 840 238 592')).toBe('https://wa.me/243840238592');
  });
});

describe('fichier Excel', () => {
  it('nomme les colonnes comme Excel', () => {
    expect([colName(0), colName(25), colName(26), colName(27)]).toEqual(['A', 'Z', 'AA', 'AB']);
  });
  it('calcule le CRC32 standard', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
  it('produit un zip xlsx', () => {
    const b = buildXlsx([{ Nom: 'Élise & <Paul>', Durée: 30 }], 'Candidatures');
    expect([b[0], b[1], b[2], b[3]]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    const text = new TextDecoder().decode(b);
    expect(text).toContain('Élise &amp; &lt;Paul&gt;');
    expect(text).toContain('<v>30</v>');
  });
});
