import { describe, expect, it } from 'vitest';
import { worldHourFile } from '@/features/radio/heureMonde';
import { timeAnnouncement } from '@/features/radio/RadioContext';

describe("jingle de l'heure autour du monde", () => {
  it('11 h en RDC en hiver : Los Angeles, 2 h du matin', () => {
    expect(worldHourFile(new Date('2026-11-21T10:00:00Z'))).toBe('/radio/heure-monde/h11-02.mp3');
  });
  it("11 h en RDC en été : Los Angeles, 3 h du matin (heure d'été)", () => {
    expect(worldHourFile(new Date('2027-07-10T10:00:00Z'))).toBe('/radio/heure-monde/h11-03.mp3');
  });
  it('minuit en RDC : Paris, même heure en hiver, 1 h en été', () => {
    expect(worldHourFile(new Date('2026-12-01T23:00:00Z'))).toBe('/radio/heure-monde/h00-00.mp3');
    expect(worldHourFile(new Date('2027-06-01T23:00:00Z'))).toBe('/radio/heure-monde/h00-01.mp3');
  });
  it("a un fichier pour chaque heure de l'année", () => {
    for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2027, 0, 1); t += 3600_000) expect(worldHourFile(new Date(t))).not.toBeNull();
  });
  it("l'heure pile prend le nouveau jingle, les quarts d'heure gardent l'ancienne annonce", () => {
    expect(timeAnnouncement(new Date('2026-11-21T13:00:00Z'))).toEqual(['/radio/heure-monde/h14-08.mp3']);
    expect(timeAnnouncement(new Date('2026-11-21T13:15:00Z'))[0]).toBe('/radio/heure/intro.mp3');
  });
});
