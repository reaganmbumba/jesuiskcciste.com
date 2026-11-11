import { describe, expect, it } from 'vitest';
import { parseJobicy, parseReliefWeb, pickDaily, type JobItem } from '../../worker/jobs';
import { applyHref, isOpen } from '@/features/jobs/jobs';

const now = new Date('2026-11-11T08:00:00Z');

describe('offres du jour (worker)', () => {
  it('lit ReliefWeb, garde le lien d’origine et écarte les offres closes ou sans lien', () => {
    const jobs = parseReliefWeb({
      data: [
        { id: 1, fields: { title: 'Chargé de protection', url_alias: 'https://reliefweb.int/job/1/charge', source: [{ name: 'UNHCR' }], date: { created: '2026-11-10T10:00:00Z', closing: '2026-11-25T00:00:00Z' }, city: [{ name: 'Goma' }], country: [{ name: 'Democratic Republic of the Congo' }], type: [{ name: 'Job' }] } },
        { id: 2, fields: { title: 'Offre close', url: 'https://reliefweb.int/job/2', date: { created: '2026-10-01T00:00:00Z', closing: '2026-10-20T00:00:00Z' } } },
        { id: 3, fields: { title: 'Sans lien' } },
      ],
    }, now);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({ title: 'Chargé de protection', organization: 'UNHCR', location: 'Goma', url: 'https://reliefweb.int/job/1/charge', source: 'ReliefWeb', remote: false });
  });

  it('lit Jobicy et met d’abord les offres ouvertes au monde entier', () => {
    const jobs = parseJobicy({ jobs: [
      { id: 7, url: 'https://jobicy.com/jobs/7', jobTitle: 'Dev &amp; Ops', companyName: 'A', jobGeo: 'USA', pubDate: '2026-11-10' },
      { id: 8, url: 'https://jobicy.com/jobs/8', jobTitle: 'Support', companyName: 'B', jobGeo: 'Anywhere', jobIndustry: ['Customer Success'], pubDate: '2026-11-10' },
      { id: 9, jobTitle: 'Sans lien' },
    ] });
    expect(jobs.map((j) => j.id)).toEqual(['jy-8', 'jy-7']);
    expect(jobs[1].title).toBe('Dev & Ops');
    expect(jobs[0].category).toBe('Customer Success');
  });

  it('garde au plus 50 offres, sans doublon, avec une part de télétravail', () => {
    const mk = (n: number, remote: boolean): JobItem => ({ id: `${remote}-${n}`, title: `T${n}`, organization: null, location: null, country: null, remote, category: null, contract: null, url: `https://x/${remote}/${n}`, source: remote ? 'Jobicy' : 'ReliefWeb', postedAt: `2026-11-${String((n % 9) + 1).padStart(2, '0')}`, closingAt: null });
    const local = Array.from({ length: 80 }, (_, i) => mk(i, false));
    const remote = Array.from({ length: 30 }, (_, i) => mk(i, true));
    const out = pickDaily(local, [...remote, remote[0]]);
    expect(out).toHaveLength(50);
    expect(out.filter((j) => j.remote)).toHaveLength(15);
    expect(new Set(out.map((j) => j.url)).size).toBe(50);
    expect(pickDaily([], remote)).toHaveLength(30);
    expect(pickDaily(local.slice(0, 10), remote)).toHaveLength(40);
  });
});

describe('offres de la communauté', () => {
  it('reconnaît un lien, un e-mail ou un téléphone pour postuler', () => {
    expect(applyHref('https://exemple.cd/offre')).toBe('https://exemple.cd/offre');
    expect(applyHref('rh@exemple.cd')).toBe('mailto:rh@exemple.cd');
    expect(applyHref('+243 840 000 000')).toBe('tel:+243840000000');
    expect(applyHref('Déposer le CV au bureau')).toBeNull();
  });
  it('masque une offre après sa date limite', () => {
    expect(isOpen({ published: true, closingDate: '2026-11-11' }, now)).toBe(true);
    expect(isOpen({ published: true, closingDate: '2026-11-10' }, now)).toBe(false);
    expect(isOpen({ published: false, closingDate: null }, now)).toBe(false);
  });
});

describe('traduction des termes ReliefWeb', () => {
  it('traduit les pays et types connus', async () => {
    const { translateTerms } = await import('@/features/jobs/jobs');
    expect(translateTerms('Democratic Republic of the Congo, Angola', 'fr')).toBe('RD Congo, Angola');
    expect(translateTerms('Consultancy', 'pt')).toBe('Consultoria');
    expect(translateTerms('Freelance', 'fr')).toBe('Freelance');
  });
});
