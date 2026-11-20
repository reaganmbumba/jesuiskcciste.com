import { describe, expect, it } from 'vitest';
import { youtubeVideoId } from '@/features/radio/YouTubeChat';

describe('youtubeVideoId', () => {
  it('lit le lien « overlay » du chat', () => {
    expect(youtubeVideoId('https://www.youtube.com/live_apps/overlay?id=ChhVQ2c0SGRvOVhFWDhPSTdNUUg2NGlYMmcSCzRGOGVQUzNVQzlW')).toBe('4F8ePS3UC9V');
  });
  it('lit les liens habituels', () => {
    expect(youtubeVideoId('https://www.youtube.com/watch?v=4F8ePS3UC9V')).toBe('4F8ePS3UC9V');
    expect(youtubeVideoId('https://youtu.be/4F8ePS3UC9V?si=x')).toBe('4F8ePS3UC9V');
    expect(youtubeVideoId('https://www.youtube.com/live/4F8ePS3UC9V')).toBe('4F8ePS3UC9V');
    expect(youtubeVideoId('4F8ePS3UC9V')).toBe('4F8ePS3UC9V');
  });
  it('refuse le reste', () => {
    expect(youtubeVideoId('https://example.com/watch?v=4F8ePS3UC9V')).toBeNull();
    expect(youtubeVideoId('bonjour')).toBeNull();
  });
});
