import { describe, expect, it } from 'vitest';
import { newReference, orderMessage, orderTotal, validateOrder, whatsappNumber, whatsappOrderUrl, type OrderInput } from '@/features/pagnes/pagnes';

const order: OrderInput = {
  fullName: 'Jean Mbala', phone: '0812345678', email: '', city: 'Kinshasa', country: 'RD Congo', address: 'Gombe',
  delivery: 'livraison', note: '', items: [{ model: 'oracle-2003', label: 'Oracle — 15 avril 2003', quantity: 2 }, { model: 'kcc-68-ans', label: '68 ans', quantity: 1 }],
};

describe('pagnes', () => {
  it('compte 25 $ par pagne', () => {
    expect(orderTotal(order.items)).toBe(75);
  });

  it('met les numéros au format WhatsApp', () => {
    expect(whatsappNumber('+243 840 238 592')).toBe('243840238592');
    expect(whatsappNumber('0812345678')).toBe('243812345678');
    expect(whatsappNumber('00351 912 345 678')).toBe('351912345678');
  });

  it('écrit la commande dans le message WhatsApp', () => {
    const msg = orderMessage('PGN-ABC234', order);
    expect(msg).toContain('PGN-ABC234');
    expect(msg).toContain('2 × Oracle — 15 avril 2003');
    expect(msg).toContain('75 $');
    expect(msg).toContain('Jean Mbala');
    expect(whatsappOrderUrl('+243 840 238 592', msg)).toMatch(/^https:\/\/wa\.me\/243840238592\?text=/);
  });

  it('refuse une commande incomplète', () => {
    expect(validateOrder(order)).toEqual({});
    const e = validateOrder({ ...order, fullName: '', phone: '12', items: [], address: '' });
    expect(Object.keys(e).sort()).toEqual(['address', 'fullName', 'items', 'phone']);
    expect(validateOrder({ ...order, items: [{ model: 'autre', label: 'Autre', quantity: 1 }] }).note).toBeTruthy();
  });

  it('génère une référence valide pour la base', () => {
    expect(newReference()).toMatch(/^PGN-[A-Z0-9]{6,12}$/);
  });
});
