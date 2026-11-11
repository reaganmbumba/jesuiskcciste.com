import { describe, expect, it } from 'vitest';
import { cleanTiktokUrl, tiktokVideoId, videoFormat } from '@/features/challenges/challenges';
import { CHALLENGES, findChallenge } from '@/content/challenges';

describe('challenges', () => {
  it('reconnaît les vidéos des téléphones', () => {
    expect(videoFormat('video/mp4')).toEqual({ ext: 'mp4', contentType: 'video/mp4' });
    expect(videoFormat('video/quicktime')).toEqual({ ext: 'mov', contentType: 'video/quicktime' });
    expect(videoFormat('', 'VID-20261111-WA0003.mp4')).toEqual({ ext: 'mp4', contentType: 'video/mp4' });
    expect(videoFormat('image/jpeg', 'photo.jpg')).toBeNull();
  });
  it('nettoie les liens TikTok copiés', () => {
    expect(cleanTiktokUrl('Regardez https://www.tiktok.com/@silviambongo/video/7412345678901234567?is_from_webapp=1 !'))
      .toBe('https://www.tiktok.com/@silviambongo/video/7412345678901234567');
    expect(cleanTiktokUrl('vm.tiktok.com/ZMabc123/')).toBe('https://vm.tiktok.com/ZMabc123/');
    expect(cleanTiktokUrl('https://youtube.com/watch?v=1')).toBeNull();
    expect(tiktokVideoId('https://www.tiktok.com/@a/video/7412345678901234567')).toBe('7412345678901234567');
    expect(tiktokVideoId('https://vm.tiktok.com/ZMabc123/')).toBeNull();
  });
  it('a des identifiants compatibles avec la base', () => {
    for (const c of CHALLENGES) {
      expect(c.id).toMatch(/^[a-z0-9-]{1,80}$/);
      for (const f of c.featured) expect(f.id).toMatch(/^[a-z0-9-]{1,80}$/);
    }
    expect(findChallenge('libondeli-na-ngai')?.song).toBe('Libondeli na ngai');
  });
});
