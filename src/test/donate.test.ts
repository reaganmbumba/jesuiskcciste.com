import { describe, expect, it } from 'vitest';
import { donationMessage } from '@/components/common/SolidarityDonate';
import { DONATION_ACCOUNTS } from '@/content/solidarite';

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
