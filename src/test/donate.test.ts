import { describe, expect, it } from 'vitest';
import { donationMessage } from '@/components/common/SolidarityDonate';
import { CONTRIBUTIONS, DONATION_ACCOUNTS } from '@/content/solidarite';

describe('dons Solidarité', () => {
  it('compose le message WhatsApp de confirmation', () => {
    const m = donationMessage({ operation: 'Ngidinga', provider: 'Orange Money', amount: '20', currency: 'USD', name: ' ', reference: 'AB12' });
    expect(m).toContain('Montant : 20 USD');
    expect(m).toContain('Nom : Anonyme');
    expect(m).toContain('Référence de la transaction : AB12');
  });
  it('omet la référence vide', () => {
    expect(donationMessage({ operation: 'x', provider: 'y', amount: '1', currency: 'FC', name: 'Jean', reference: '' })).not.toContain('Référence');
  });
  it('affiche des numéros au format international', () => {
    for (const a of DONATION_ACCOUNTS) expect(a.number.replace(/\s/g, '')).toMatch(/^\+243\d{9}$/);
  });
});

describe('listes publiques des contributions', () => {
  it('contient les 73 contributeurs de Luanika', () => {
    expect(CONTRIBUTIONS.luanika).toHaveLength(73);
    expect(CONTRIBUTIONS.ngidinga).toHaveLength(38);
  });
  it('affiche des totaux égaux à la somme des lignes', () => {
    const sum = (l: { amount: string }[], cur: string) => l.filter((c) => c.amount.endsWith(cur)).reduce((t, c) => t + Number(c.amount.replace(cur, '').replace(/\s/g, '').replace(',', '.')), 0);
    expect([sum(CONTRIBUTIONS.luanika, '$'), sum(CONTRIBUTIONS.luanika, 'FC')]).toEqual([1326.6, 584000]);
    expect([sum(CONTRIBUTIONS.ngidinga, '$'), sum(CONTRIBUTIONS.ngidinga, 'FC')]).toEqual([942, 316000]);
  });
  it('ne publie aucun numéro de téléphone', () => {
    for (const c of [...CONTRIBUTIONS.luanika, ...CONTRIBUTIONS.ngidinga]) expect(`${c.name} ${c.amount}`).not.toMatch(/\d{8,}|\+\d/);
  });
});
