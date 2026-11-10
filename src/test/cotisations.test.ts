import { describe, expect, it } from 'vitest';
import { addMonths, priceText, cotisationsCsv, groupReminder, memberSituation, monthsBetween, sumByCurrency, type Cotisation, type CotisationSettings } from '@/features/cotisations/cotisations';

const settings: CotisationSettings = { amountUsd: 2, amountCdf: 5000, startMonth: '2026-09', purpose: 'Assistance' };
const now = new Date(2026, 11, 15); // décembre 2026

describe('cotisations mensuelles', () => {
  it('compte les mois', () => {
    expect(monthsBetween('2026-11', '2027-02')).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
    expect(monthsBetween('2027-01', '2026-12')).toEqual([]);
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });

  it('calcule le retard depuis le mois de départ', () => {
    const s = memberSituation([{ month: '2026-09' }, { month: '2026-11' }], settings, '2026-01-10T00:00:00Z', now);
    expect(s.due).toEqual(['2026-09', '2026-10', '2026-11', '2026-12']);
    expect(s.unpaid).toEqual(['2026-10', '2026-12']);
    expect(priceText(settings, s.unpaid.length)).toMatch(/^4 \$ ou 10\s000 FC$/);
    expect(s.upToDate).toBe(false);
  });

  it('ne compte pas les mois avant l’inscription, et accepte l’avance', () => {
    const s = memberSituation([{ month: '2026-11' }, { month: '2026-12' }, { month: '2027-01' }], settings, '2026-11-20T10:00:00', now);
    expect(s.firstDue).toBe('2026-11');
    expect(s.upToDate).toBe(true);
    expect(s.coveredUntil).toBe('2027-01');
  });

  it('additionne par monnaie', () => {
    expect(sumByCurrency([{ amount: 5, currency: 'USD' }, { amount: 5, currency: 'USD' }, { amount: 14000, currency: 'CDF' }])).toMatch(/^10 \$ \+ 14\s000 FC$/);
    expect(sumByCurrency([])).toBe('0');
  });

  it('le rappel au groupe ne donne ni matricule ni numéro', () => {
    const msg = groupReminder([{ name: 'Mbumba Reagan', months: 2 }], settings, 'https://www.jesuiskcciste.com');
    expect(msg).toContain('Mbumba Reagan — 2 mois');
    expect(msg).not.toMatch(/KCC-/);
  });

  it('exporte un tableau pour Excel', () => {
    const c: Cotisation = { id: '1', userId: 'u', month: '2026-11', amount: 2.5, currency: 'USD', method: 'mpesa', reference: 'TX"1', note: null, paidOn: '2026-11-05', createdAt: '' };
    const csv = cotisationsCsv([{ name: 'A', matricule: 'KCC-A-00001', c }]);
    expect(csv.split('\r\n')[1]).toBe('"Novembre 2026";"A";"KCC-A-00001";"2,5";"USD";"M-Pesa";"TX""1";"2026-11-05";""');
  });
});
