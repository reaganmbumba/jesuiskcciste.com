import { describe, expect, it } from 'vitest';
import { detectProvider, isForSale, normalizePhone, priceLabel } from '@/features/music/shop';

describe('boutique KCC Music', () => {
  it('normalise les numéros congolais', () => {
    expect(normalizePhone('081 234 5678')).toBe('243812345678');
    expect(normalizePhone('+243 97-123-4567')).toBe('243971234567');
    expect(normalizePhone('00243841234567')).toBe('243841234567');
    expect(normalizePhone('812345678')).toBe('243812345678');
    expect(normalizePhone('08123')).toBeNull();
  });

  it('reconnaît l’opérateur par le préfixe', () => {
    expect(detectProvider('0821234567')).toBe('mpesa');
    expect(detectProvider('0891234567')).toBe('orange_money');
    expect(detectProvider('0991234567')).toBe('airtel_money');
    expect(detectProvider('0901234567')).toBeNull(); // Africell : non pris en charge
  });

  it('n’affiche « Acheter » qu’avec un prix et une devise', () => {
    expect(isForSale({ priceAmount: 1, priceCurrency: 'USD' })).toBe(true);
    expect(isForSale({ priceAmount: null, priceCurrency: 'USD' })).toBe(false);
    expect(isForSale({ priceAmount: 2, priceCurrency: null })).toBe(false);
  });

  it('formate les prix', () => {
    expect(priceLabel(1.5, 'USD', 'en')).toBe('US$1.50');
    expect(priceLabel(2500, 'CDF', 'fr')).toMatch(/2\s?500/);
  });
});
