import { viewPath } from '@/features/views/views';

describe('compteur de lectures', () => {
  it('compte la même page avec ou sans « / » final ni paramètres', () => {
    expect(viewPath('/actualites/abc/')).toBe('/actualites/abc');
    expect(viewPath('/predications?x=1#audio')).toBe('/predications');
    expect(viewPath('/')).toBe('/');
  });
});
