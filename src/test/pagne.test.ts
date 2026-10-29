import { describe, expect, it } from 'vitest';
import { pagneMessage, PAGNE_WHATSAPP } from '@/pages/public/PagnePage';

describe('commande de pagne', () => {
  it('écrit le total et omet les champs vides', () => {
    const m = pagneMessage({ name: ' Marie ', phone: '+243 81 000 0000', quantity: 3, city: '', message: '' });
    expect(m).toContain('Nom : Marie');
    expect(m).toContain('Quantité : 3 (total 75 $)');
    expect(m).not.toContain('Ville');
  });
  it('envoie au bon numéro WhatsApp', () => {
    expect(PAGNE_WHATSAPP).toBe('243840238592');
  });
});
