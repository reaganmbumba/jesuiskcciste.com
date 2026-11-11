import { useEffect, useState } from 'react';
import { repository, type Repository } from '@/services/repository';
import type { JobContractType, JobOffer } from '@/types';
import type { Tri } from '@/i18n';

/**
 * Rubrique « Opportunités et emplois » (/emplois).
 *
 *  - Les offres du jour : jusqu'à 50 offres réelles par jour en RD Congo et
 *    en Angola, lues par le Worker du site (GET /api/emplois, voir
 *    worker/jobs.ts) sur mediacongo.net, Jobartis et ReliefWeb. Chaque offre
 *    garde le lien de l'annonce d'origine ; le site n'en invente aucune.
 *  - Les offres de la communauté : publiées par l'administration
 *    (/admin/emplois, table `job_offers`), avec leur source.
 */

/** Groupe WhatsApp « Je suis KCCiste 4 Opportunité et emploi ». */
export const JOBS_WHATSAPP_URL = 'https://chat.whatsapp.com/DCN3SA5A5R0DZgS994kXnX?s=cl&p=a&iam=2';

export interface DailyJob {
  id: string;
  title: string;
  organization: string | null;
  location: string | null;
  country: string | null;
  remote: boolean;
  category: string | null;
  contract: string | null;
  url: string;
  source: 'mediacongo.net' | 'Jobartis' | 'ReliefWeb';
  postedAt: string | null;
  closingAt: string | null;
}

/** Version de la liste du jour (RD Congo + Angola). */
export const JOBS_FEED_VERSION = 3;

export interface DailyJobs { date: string; generatedAt: string; sources: Record<string, 'ok' | 'off' | 'error'>; jobs: DailyJob[] }

export const SOURCE_LINKS: Record<DailyJob['source'], string> = {
  'mediacongo.net': 'https://www.mediacongo.net/emplois.html',
  Jobartis: 'https://www.jobartis.com/vagas-emprego',
  ReliefWeb: 'https://reliefweb.int/jobs',
};

export const jobOffersRepo: Repository<JobOffer> = repository<JobOffer>('job_offers', [], 'job');

export const CONTRACT_LABELS: Record<JobContractType, Tri> = {
  emploi: { fr: 'Emploi', en: 'Job', pt: 'Emprego' },
  stage: { fr: 'Stage', en: 'Internship', pt: 'Estágio' },
  consultance: { fr: 'Consultance', en: 'Consultancy', pt: 'Consultoria' },
  benevolat: { fr: 'Bénévolat', en: 'Volunteering', pt: 'Voluntariado' },
  bourse: { fr: 'Bourse d’études', en: 'Scholarship', pt: 'Bolsa de estudos' },
  formation: { fr: 'Formation', en: 'Training', pt: 'Formação' },
  autre: { fr: 'Autre opportunité', en: 'Other opportunity', pt: 'Outra oportunidade' },
};

/** Pays et types de contrat que ReliefWeb donne en anglais. */
const TERMS: Record<string, Tri> = {
  'democratic republic of the congo': { fr: 'RD Congo', en: 'DR Congo', pt: 'RD Congo' },
  'rd congo': { fr: 'RD Congo', en: 'DR Congo', pt: 'RD Congo' },
  congo: { fr: 'Congo-Brazzaville', en: 'Congo-Brazzaville', pt: 'Congo-Brazzaville' },
  angola: { fr: 'Angola', en: 'Angola', pt: 'Angola' },
  job: { fr: 'Emploi', en: 'Job', pt: 'Emprego' },
  consultancy: { fr: 'Consultance', en: 'Consultancy', pt: 'Consultoria' },
  internship: { fr: 'Stage', en: 'Internship', pt: 'Estágio' },
  'volunteer opportunity': { fr: 'Bénévolat', en: 'Volunteering', pt: 'Voluntariado' },
  'full-time': { fr: 'Temps plein', en: 'Full-time', pt: 'Tempo inteiro' },
  'part-time': { fr: 'Temps partiel', en: 'Part-time', pt: 'Tempo parcial' },
  contract: { fr: 'Contrat', en: 'Contract', pt: 'Contrato' },
};
/** Traduit chaque élément connu d'une liste « A, B » ; le reste est gardé tel quel. */
export function translateTerms(v: string | null, locale: keyof Tri): string | null {
  if (!v) return v;
  return v.split(/,\s*/).map((x) => TERMS[x.trim().toLowerCase()]?.[locale] ?? x).join(', ');
}

function missingTable(e: unknown): boolean {
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  return code === '42P01' || code === 'PGRST205' || /job_offers.*(does not exist|schema cache)/i.test(msg);
}

/** Une offre est visible tant que sa date limite n'est pas passée. */
export function isOpen(o: Pick<JobOffer, 'closingDate' | 'published'>, now = new Date()): boolean {
  if (!o.published) return false;
  if (!o.closingDate) return true;
  return o.closingDate >= now.toISOString().slice(0, 10);
}

/** Offres de la communauté encore ouvertes, les plus récentes d'abord. Table absente = liste vide. */
export async function listCommunityOffers(): Promise<JobOffer[]> {
  try {
    const all = await jobOffersRepo.all();
    return all.filter((o) => isOpen(o)).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch (e) {
    if (missingTable(e)) return [];
    throw e;
  }
}

/** Lien cliquable pour postuler : adresse web, e-mail ou téléphone ; sinon null (texte affiché tel quel). */
export function applyHref(applyTo: string): string | null {
  const v = applyTo.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v)) return `https://${v}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  const tel = v.replace(/[\s.()-]/g, '');
  if (/^\+?\d{8,15}$/.test(tel)) return `tel:${tel}`;
  return null;
}

export async function fetchDailyJobs(signal?: AbortSignal): Promise<DailyJobs> {
  // « v » change quand le format de la liste change : un téléphone ne réutilise jamais une ancienne liste gardée en mémoire.
  const r = await fetch(`/api/emplois?v=${JOBS_FEED_VERSION}`, { headers: { Accept: 'application/json' }, cache: 'no-cache', signal });
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error('indisponible');
  const data = (await r.json()) as DailyJobs;
  if (!Array.isArray(data.jobs)) throw new Error('indisponible');
  return data;
}

type Load<T> = { data: T | null; error: boolean; loading: boolean };

export function useDailyJobs(): Load<DailyJobs> {
  const [state, setState] = useState<Load<DailyJobs>>({ data: null, error: false, loading: true });
  useEffect(() => {
    const ctrl = new AbortController();
    fetchDailyJobs(ctrl.signal).then(
      (data) => setState({ data, error: false, loading: false }),
      () => { if (!ctrl.signal.aborted) setState({ data: null, error: true, loading: false }); },
    );
    return () => ctrl.abort();
  }, []);
  return state;
}

export function useCommunityOffers(): Load<JobOffer[]> {
  const [state, setState] = useState<Load<JobOffer[]>>({ data: null, error: false, loading: true });
  useEffect(() => {
    let alive = true;
    listCommunityOffers().then(
      (data) => alive && setState({ data, error: false, loading: false }),
      () => alive && setState({ data: [], error: true, loading: false }),
    );
    return () => { alive = false; };
  }, []);
  return state;
}

/** Texte partagé sur WhatsApp ou Facebook pour une offre : l'offre, son lien, puis le site et le groupe. */
export function jobShareText(o: { title: string; organization?: string | null; location?: string | null; country?: string | null; link: string; closing?: string | null }, locale: keyof Tri = 'fr'): string {
  const where = [o.location, o.country && !(o.location ?? '').includes(o.country) ? o.country : null].filter(Boolean).join(', ');
  const L = {
    fr: { offer: 'Offre d’emploi', until: 'Date limite', apply: 'Pour postuler', more: 'Chaque jour, 50 offres en RD Congo et en Angola sur le site JE SUIS KCCiste', group: 'Groupe WhatsApp Je suis KCCiste 4 Opportunité et emploi' },
    en: { offer: 'Job offer', until: 'Deadline', apply: 'To apply', more: 'Every day, 50 job offers in the DR Congo and Angola on the JE SUIS KCCiste website', group: 'WhatsApp group Je suis KCCiste 4 Opportunité et emploi' },
    pt: { offer: 'Oferta de emprego', until: 'Prazo', apply: 'Para se candidatar', more: 'Todos os dias, 50 ofertas na RD Congo e em Angola no site JE SUIS KCCiste', group: 'Grupo WhatsApp Je suis KCCiste 4 Opportunité et emploi' },
  }[locale];
  return [
    `💼 *${L.offer} : ${o.title}*`,
    [o.organization, where].filter(Boolean).join(' · '),
    o.closing ? `${L.until} : ${o.closing}` : '',
    `${L.apply} : ${o.link}`,
    '',
    `${L.more} : https://jesuiskcciste.com/emplois`,
    `${L.group} : ${JOBS_WHATSAPP_URL}`,
  ].filter((l, i) => l !== '' || i === 4).join('\n');
}

/** Message lisible pour l'administration. */
export function jobErrorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (/row-level security|permission denied/i.test(msg) || code === '42501') return 'Votre compte n’a pas le droit de publier des offres (administration centrale requise).';
  if (missingTable(e)) return 'La rubrique n’est pas encore installée dans Supabase : collez le fichier « emplois-a-coller-dans-supabase.sql » dans le SQL Editor, cliquez sur Run, puis réessayez.';
  if (/failed to fetch|network|load failed/i.test(msg)) return 'Connexion interrompue. Vérifiez votre réseau puis réessayez.';
  return msg ? `L’enregistrement a échoué : ${msg}` : 'L’enregistrement a échoué.';
}
