import { describe, expect, it } from 'vitest';
import { baseRows, toContribution, toGallery, toOperation, toVideo, tri, youtubeIdFrom } from '@/features/content/siteContent';
import { galleryPhotos } from '@/content/galerie';
import { YOUTUBE_VIDEOS } from '@/config/youtube';
import { CONTRIBUTIONS, SOLIDARITY_OPERATIONS } from '@/content/solidarite';

describe('contenu du site modifiable', () => {
  it('reconnaît les liens YouTube collés', () => {
    for (const l of ['https://youtu.be/iy940YMSrgE?si=x', 'https://www.youtube.com/watch?v=iy940YMSrgE&t=3', 'https://youtube.com/shorts/iy940YMSrgE', 'iy940YMSrgE']) expect(youtubeIdFrom(l)).toBe('iy940YMSrgE');
    expect(youtubeIdFrom('https://www.youtube.com/@Jesuiskcciste')).toBeNull();
  });
  it('reprend le français quand une traduction est vide', () => {
    expect(tri({ fr: 'Bonjour', en: '', pt: 'Olá' })).toEqual({ fr: 'Bonjour', en: 'Bonjour', pt: 'Olá' });
  });
  it('relit à l’identique le contenu livré avec le site', () => {
    const rows = baseRows();
    const of = (c: string) => rows.filter((r) => r.collection === c).map((r) => r.data);
    expect(of('gallery').map(toGallery)).toEqual(galleryPhotos);
    expect(of('videos').map(toVideo)).toEqual(YOUTUBE_VIDEOS);
    expect(of('operations').map(toOperation)).toEqual(SOLIDARITY_OPERATIONS);
    expect(of('contributions').map(toContribution).filter((c) => c.operation === 'luanika')).toHaveLength(CONTRIBUTIONS.luanika.length);
  });
});
