import { describe, expect, it } from 'vitest';
import { pagneMessage, PAGNE_MODELS, PAGNE_WHATSAPP } from '@/pages/public/PagnePage';

describe('commande de pagnes', () => {
  it('liste les modèles choisis et calcule le total', () => {
    const [a, b] = PAGNE_MODELS;
    const m = pagneMessage({ name: ' Marie ', phone: '+243 81 000 0000', city: '', message: '', quantities: { [a.key]: 2, [b.key]: 1 } });
    expect(m).toContain(`- ${a.name} : 2`);
    expect(m).toContain(`- ${b.name} : 1`);
    expect(m).toContain('Total : 3 pagnes, 75 $');
    expect(m).toContain('Nom : Marie');
    expect(m).not.toContain('Ville');
  });
  it('ignore les modèles à zéro', () => {
    const m = pagneMessage({ name: 'A', phone: '0810000000', city: '', message: '', quantities: { [PAGNE_MODELS[0].key]: 0, [PAGNE_MODELS[2].key]: 1 } });
    expect(m).not.toContain(PAGNE_MODELS[0].name);
    expect(m).toContain('Total : 1 pagne, 25 $');
  });
  it('envoie au bon numéro WhatsApp', () => {
    expect(PAGNE_WHATSAPP).toBe('243840238592');
  });
});
