import { describe, expect, it } from 'vitest';
import { parseJobartis, parseMediacongo, parseReliefWeb, pickDaily, textOf, type JobItem } from '../../worker/jobs';
import { applyHref, isOpen, jobShareText } from '@/features/jobs/jobs';

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

  it('lit la page des offres de mediacongo.net (RD Congo)', () => {
    const u = 'https://www.mediacongo.net/emploi-societe-45151_inso_deputy_safety_advisor_dsa.html';
    const html = `<table><tr>
      <td><a href="${u}"><img src="logo.png" alt=""></a></td>
      <td><a href="${u}"><b>Deputy Safety Advisor (DSA)</b> <b>OEM45151</b></a></td>
      <td><a href="${u}">INSO (International NGO Safety Organisation)</a></td>
      <td><a href="${u}">Kalemie (Tanganyika)</a></td>
      <td><a href="${u}">09.11.2026</a></td></tr>
      <tr><td><a href="emploi-societe-45138_fhi360_gestionnaire.html">Gestionnaire de la Conformit&eacute; OEM45138</a></td><td><a href="emploi-societe-45138_fhi360_gestionnaire.html">FHI360</a></td><td><a href="emploi-societe-45138_fhi360_gestionnaire.html">Kinshasa</a></td><td><a href="emploi-societe-45138_fhi360_gestionnaire.html">06.11.2026</a></td></tr></table>`;
    const jobs = parseMediacongo(html);
    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({ id: 'mc-45151', title: 'Deputy Safety Advisor (DSA)', organization: 'INSO (International NGO Safety Organisation)', location: 'Kalemie (Tanganyika)', country: 'RD Congo', url: u, source: 'mediacongo.net', postedAt: '2026-11-09T00:00:00Z' });
    expect(jobs[1]).toMatchObject({ title: 'Gestionnaire de la Conformité', organization: 'FHI360', url: 'https://www.mediacongo.net/emploi-societe-45138_fhi360_gestionnaire.html' });
  });

  it('lit la page des offres de Jobartis (Angola)', () => {
    const u = 'https://www.jobartis.com/emprego-kept-people-gestor-banca-consultor-senior';
    const html = `<div>Já só tem <strong>21</strong> dias para se candidatar</div>
      <a href="${u}"></a><h2><a href="${u}">Gestor Banca - Consultor Sénior</a></h2>
      <h5><a href="/empregadores/ucall-human-capital">KEPT PEOPLE</a></h5>
      <ul><li>Luanda, Luanda</li><li>Tempo determinado</li><li>5 anos de experiência exigido</li></ul>
      <ul><li><a href="/vagas-emprego/banca-seguros">Banca, seguros</a></li></ul>
      <div>Já só tem <b>14</b> dias para se candidatar</div>
      <h2><a href="/emprego-empresa-lider-coordenador-de-licitacoes">COORDENADOR DE LICITAÇÕES</a></h2>`;
    const jobs = parseJobartis(html, now);
    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({ title: 'Gestor Banca - Consultor Sénior', organization: 'KEPT PEOPLE', location: 'Luanda, Luanda', contract: 'Tempo determinado', country: 'Angola', url: u, source: 'Jobartis', closingAt: '2026-12-02' });
    expect(jobs[1]).toMatchObject({ title: 'COORDENADOR DE LICITAÇÕES', url: 'https://www.jobartis.com/emprego-empresa-lider-coordenador-de-licitacoes', closingAt: '2026-11-25', organization: null });
  });

  it('décode le texte HTML', () => {
    expect(textOf('<b>Caf&eacute;</b> &amp; th&#233; <i>x</i>')).toBe('Café & thé x');
  });

  it('garde au plus 50 offres, sans doublon : environ 30 RD Congo et 20 Angola', () => {
    const mk = (n: number, ao: boolean): JobItem => ({ id: `${ao}-${n}`, title: `T${n}`, organization: null, location: null, country: ao ? 'Angola' : 'RD Congo', remote: false, category: null, contract: null, url: `https://x/${ao}/${n}`, source: ao ? 'Jobartis' : 'mediacongo.net', postedAt: `2026-11-${String((n % 9) + 1).padStart(2, '0')}`, closingAt: null });
    const rdc = Array.from({ length: 80 }, (_, i) => mk(i, false));
    const ao = Array.from({ length: 60 }, (_, i) => mk(i, true));
    const out = pickDaily(rdc, [...ao, ao[0]]);
    expect(out).toHaveLength(50);
    expect(out.filter((j) => j.country === 'Angola')).toHaveLength(20);
    expect(new Set(out.map((j) => j.url)).size).toBe(50);
    expect(pickDaily([], ao)).toHaveLength(50);
    expect(pickDaily(rdc.slice(0, 10), ao)).toHaveLength(50);
    expect(pickDaily(rdc, ao.slice(0, 5)).filter((j) => j.country === 'RD Congo')).toHaveLength(45);
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

describe('partage d’une offre', () => {
  it('donne l’offre, son lien, le site et le groupe WhatsApp', () => {
    const t = jobShareText({ title: 'Comptable', organization: 'FHI360', location: 'Kinshasa', country: 'RD Congo', link: 'https://exemple.cd/offre', closing: '30 nov. 2026' });
    expect(t).toContain('Comptable');
    expect(t).toContain('FHI360 · Kinshasa, RD Congo');
    expect(t).toContain('https://exemple.cd/offre');
    expect(t).toContain('https://jesuiskcciste.com/emplois');
    expect(t).toContain('https://chat.whatsapp.com/DCN3SA5A5R0DZgS994kXnX');
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
