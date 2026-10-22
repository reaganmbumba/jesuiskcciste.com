import { describe, expect, it } from 'vitest';
import { audioTypeOf, checkAudio, errorText, sortSermons } from '@/features/sermons/sermons';
import type { AudioSermon } from '@/types';

const file = (name: string, size = 1000, type = '') => Object.defineProperty(new File(['x'], name, { type }), 'size', { value: size });

describe('Prédications audio', () => {
  it('reconnaît les audios WhatsApp (.mpeg) comme MP3, même annoncés en vidéo', () => {
    expect(audioTypeOf(file('WhatsApp Audio.mpeg', 1000, 'video/mpeg'))).toBe('audio/mpeg');
    expect(audioTypeOf(file('predication.M4A'))).toBe('audio/mp4');
    expect(audioTypeOf(file('note.opus'))).toBe('audio/ogg');
    expect(audioTypeOf(file('photo.jpg'))).toBeNull();
  });

  it('refuse un format inconnu ou un fichier de plus de 50 Mo', () => {
    expect(checkAudio(file('a.mp3', 10 * 1048576))).toBeNull();
    expect(checkAudio(file('a.mp3', 60 * 1048576))).toMatch(/50 Mo/);
    expect(checkAudio(file('a.pdf'))).toMatch(/Format/);
  });

  it('classe les plus récentes en premier', () => {
    const s = (id: string, preachedOn: string | null, createdAt: string) => ({ id, title: id, preacherName: 'X', published: true, preachedOn, createdAt }) as AudioSermon;
    expect(sortSermons([s('a', '2025-01-01', '2026-10-01'), s('b', null, '2026-10-20'), s('c', '2026-03-01', '2026-01-01')]).map((x) => x.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('Messages d’erreur des prédications', () => {
  it('lit les erreurs Supabase qui ne sont pas des Error', () => {
    expect(errorText({ message: 'relation "public.audio_sermons" does not exist', code: '42P01' })).toMatch(/pas encore installée/);
    expect(errorText({ message: 'new row violates row-level security policy', code: '42501' })).toMatch(/droit/);
    expect(errorText({ message: 'Bucket not found' })).toMatch(/pas encore installée/);
    expect(errorText({ message: 'autre chose', code: 'X1' })).toBe('Échec de l’envoi : autre chose (X1)');
    expect(errorText('?')).toBe('Échec de l’envoi.');
  });
});
