import { describe, expect, it } from 'vitest';
import { audioFormat, formatSeconds } from '@/features/debates/debates';
import { DEBATE_TOPICS, findDebateTopic } from '@/content/debats';

describe('débats audio', () => {
  it('reconnaît les formats enregistrés par les téléphones', () => {
    expect(audioFormat('audio/webm;codecs=opus')).toEqual({ ext: 'webm', contentType: 'audio/webm' });
    expect(audioFormat('audio/mp4')).toEqual({ ext: 'm4a', contentType: 'audio/mp4' });
  });
  it('accepte une note vocale WhatsApp (.opus) même sans type', () => {
    expect(audioFormat('', 'PTT-20261030-WA0019.opus')).toEqual({ ext: 'ogg', contentType: 'audio/ogg' });
  });
  it('refuse un fichier qui n’est pas un audio', () => {
    expect(audioFormat('image/png', 'photo.png')).toBeNull();
  });
  it('affiche les durées en minutes:secondes', () => {
    expect(formatSeconds(65)).toBe('1:05');
    expect(formatSeconds(0)).toBe('0:00');
  });
  it('a des identifiants de sujet compatibles avec la base', () => {
    for (const t of DEBATE_TOPICS) expect(t.id).toMatch(/^[a-z0-9-]{1,80}$/);
    expect(findDebateTopic('sujet-30-octobre-2026')?.host).toBe('Maman Mam’s');
  });
});
