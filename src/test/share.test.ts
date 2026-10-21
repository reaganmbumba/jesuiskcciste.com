import { describe, expect, it } from 'vitest';
import { facebookShareUrl, shareMessage, whatsappShareUrl } from '@/components/common/ShareButtons';
import { WHATSAPP_GROUP_URL } from '@/config/site';

describe('Partage', () => {
  it('cite le site Je suis KCCiste, son adresse et le groupe WhatsApp', () => {
    const m = shareMessage('https://jesuiskcciste.com/doctrine', 'Doctrine', 'fr', 'Le message du KCC');
    expect(m.split('\n').slice(0, 3)).toEqual(['Doctrine', 'Le message du KCC', 'https://jesuiskcciste.com/doctrine']);
    expect(m).toContain('Je suis KCCiste : https://jesuiskcciste.com');
    expect(m).toContain(WHATSAPP_GROUP_URL);
  });

  it('traduit la signature', () => {
    expect(shareMessage('https://x.y', undefined, 'pt')).toContain('Junte-se ao grupo WhatsApp Je suis KCCiste');
    expect(shareMessage('https://x.y', undefined, 'en')).toContain('Join the Je suis KCCiste WhatsApp group');
  });

  it('construit les liens Facebook et WhatsApp', () => {
    expect(facebookShareUrl('https://jesuiskcciste.com/a b')).toBe('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fjesuiskcciste.com%2Fa%20b');
    const wa = whatsappShareUrl('https://jesuiskcciste.com/videos', 'Vidéos');
    expect(wa.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(wa.split('text=')[1])).toContain(WHATSAPP_GROUP_URL);
  });
});
