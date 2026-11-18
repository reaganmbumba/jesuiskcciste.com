import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import type { Tri } from '@/i18n';

/** Recensement des fidèles : une fiche par foyer (table `census_households`). */

export type CensusSex = 'M' | 'F';
export type CensusAge = '0-5' | '6-12' | '13-17' | '18-25' | '26-35' | '36-50' | '51-65' | '66+';
export type CensusStatus = 'membre' | 'neophyte' | 'sympathisant';

export interface CensusPerson { name?: string; sex: CensusSex; age: CensusAge; status?: CensusStatus }

export interface CensusInput {
  country: string;
  province?: string;
  city: string;
  parish: string;
  section?: string;
  contactName?: string;
  matricule?: string;
  /** Numéro du foyer : jamais gardé en clair, sert seulement à éviter les doublons. */
  phone?: string;
  /** Nom de la personne qui remplit pour une autre famille. */
  recordedBy?: string;
  people: CensusPerson[];
}

export interface CensusHousehold extends Omit<CensusInput, 'phone'> {
  id: string;
  personCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type CensusResult = 'created' | 'updated' | 'duplicate_phone' | 'duplicate_matricule' | 'duplicate';
export interface CensusPublicStats { people: number; households: number; parishes: number; countries: number }

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

export const CENSUS_AGES: { key: CensusAge; label: Tri }[] = [
  { key: '0-5', label: T('0 à 5 ans', '0 to 5', '0 a 5 anos') },
  { key: '6-12', label: T('6 à 12 ans', '6 to 12', '6 a 12 anos') },
  { key: '13-17', label: T('13 à 17 ans', '13 to 17', '13 a 17 anos') },
  { key: '18-25', label: T('18 à 25 ans', '18 to 25', '18 a 25 anos') },
  { key: '26-35', label: T('26 à 35 ans', '26 to 35', '26 a 35 anos') },
  { key: '36-50', label: T('36 à 50 ans', '36 to 50', '36 a 50 anos') },
  { key: '51-65', label: T('51 à 65 ans', '51 to 65', '51 a 65 anos') },
  { key: '66+', label: T('66 ans et plus', '66 and over', '66 anos ou mais') },
];

export const CENSUS_SEXES: { key: CensusSex; label: Tri }[] = [
  { key: 'M', label: T('Homme', 'Male', 'Homem') },
  { key: 'F', label: T('Femme', 'Female', 'Mulher') },
];

export const CENSUS_STATUSES: { key: CensusStatus; label: Tri }[] = [
  { key: 'membre', label: T('Fidèle (membre)', 'Member', 'Fiel (membro)') },
  { key: 'neophyte', label: T('Néophyte', 'Neophyte', 'Neófito') },
  { key: 'sympathisant', label: T('Sympathisant', 'Sympathiser', 'Simpatizante') },
];

export const CENSUS_MAX_PEOPLE = 30;

/** Pays proposés dans le formulaire (ceux de la liste officielle des paroisses, puis « Autre »). */
export const CENSUS_OTHER_COUNTRY = '__autre__';

// ——— Appels à la base ———

let demoRows: (CensusHousehold & { token: string; phoneKey?: string })[] = [];

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

const notInstalled = (e: { code?: string; message?: string }) => e.code === '42P01' || e.code === 'PGRST205' || e.code === 'PGRST202' || /schema cache|does not exist/i.test(e.message ?? '');

export class CensusNotInstalledError extends Error {
  constructor() { super('Le recensement n’est pas encore ouvert. Réessayez plus tard.'); }
}

const clean = (s?: string) => (s ?? '').trim();
const digits = (s?: string) => (s ?? '').replace(/\D/g, '');

export function toRow(input: CensusInput) {
  return {
    country: clean(input.country), province: clean(input.province), city: clean(input.city), parish: clean(input.parish), section: clean(input.section),
    contact_name: clean(input.contactName), matricule: clean(input.matricule).toUpperCase(), phone: digits(input.phone), recorded_by: clean(input.recordedBy),
    people: input.people.slice(0, CENSUS_MAX_PEOPLE).map((p) => ({ name: clean(p.name) || undefined, sex: p.sex, age: p.age, status: p.status || undefined })),
  };
}

/** Envoie (ou corrige, avec le jeton gardé sur le téléphone) une fiche de recensement. */
export async function submitCensus(input: CensusInput, token?: string | null): Promise<{ status: CensusResult; token?: string }> {
  const row = toRow(input);
  if (isDemoMode) {
    const existing = token ? demoRows.find((r) => r.token === token) : undefined;
    const base = { country: row.country, province: row.province, city: row.city, parish: row.parish, section: row.section, contactName: row.contact_name, matricule: row.matricule, recordedBy: row.recorded_by, people: row.people, personCount: row.people.length };
    if (existing) { Object.assign(existing, base, { updatedAt: new Date().toISOString() }); return { status: 'updated', token: existing.token }; }
    const phoneKey = row.phone.length >= 8 ? row.phone.slice(-9) : undefined;
    if (phoneKey && demoRows.some((r) => r.phoneKey === phoneKey)) return { status: 'duplicate_phone' };
    const t = `demo-${Date.now()}`;
    demoRows = [...demoRows, { ...base, id: t, token: t, phoneKey, createdAt: new Date().toISOString() }];
    return { status: 'created', token: t };
  }
  const { data, error } = await db().rpc('submit_census', { p: row, p_token: token && /^[0-9a-f-]{36}$/i.test(token) ? token : null });
  if (error) {
    if (notInstalled(error)) throw new CensusNotInstalledError();
    throw new Error(error.message);
  }
  const res = data as { status: CensusResult; token?: string };
  return { status: res.status, token: res.token };
}

/** Relit sa propre fiche avec le jeton du téléphone (pour la corriger). */
export async function getCensusEntry(token: string): Promise<CensusInput | null> {
  if (isDemoMode) {
    const r = demoRows.find((x) => x.token === token);
    return r ? { ...r } : null;
  }
  const { data, error } = await db().rpc('get_census_entry', { p_token: token });
  if (error) { if (notInstalled(error)) return null; throw error; }
  if (!data) return null;
  return camelize<CensusInput>(data);
}

/** Totaux publics (aucune donnée personnelle). */
export async function getCensusPublicStats(): Promise<CensusPublicStats | null> {
  if (isDemoMode) return summarize(demoRows).totals;
  const { data, error } = await db().rpc('census_public_stats');
  if (error) return null;
  const d = data as Record<string, number>;
  return { people: Number(d.people) || 0, households: Number(d.households) || 0, parishes: Number(d.parishes) || 0, countries: Number(d.countries) || 0 };
}

/** Administration : toutes les fiches (par paquets de 1 000, limite de Supabase). */
export async function listCensus(): Promise<CensusHousehold[]> {
  if (isDemoMode) return [...demoRows].reverse();
  const all: CensusHousehold[] = [];
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await db().from('census_households')
      .select('id, country, province, city, parish, section, contact_name, matricule, recorded_by, people, person_count, created_at, updated_at')
      .order('created_at', { ascending: false }).range(from, from + 999);
    if (error) throw error;
    all.push(...camelize<CensusHousehold[]>(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return all;
}

export async function deleteCensus(id: string): Promise<void> {
  if (isDemoMode) { demoRows = demoRows.filter((r) => r.id !== id); return; }
  const { error } = await db().from('census_households').delete().eq('id', id);
  if (error) throw error;
}

export function censusErrorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (/row-level security|permission denied/i.test(msg) || code === '42501') return 'Votre compte n’a pas le droit de voir le recensement.';
  if (/schema cache|does not exist/i.test(msg) || code === '42P01' || code === 'PGRST205')
    return 'Le recensement n’est pas encore installé dans Supabase : collez le fichier « recensement-a-coller-dans-supabase.sql » dans le SQL Editor, cliquez sur Run, puis réessayez.';
  return msg || 'L’action a échoué.';
}

// ——— Totaux et graphiques ———

/** Regroupe « Paroisse de Matete (Kinshasa) » et « paroisse de matete  (kinshasa) ». */
export const groupKey = (s?: string | null) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export interface CountRow { label: string; people: number; households: number }

export interface CensusSummary {
  totals: CensusPublicStats;
  byCountry: CountRow[];
  byParish: (CountRow & { country: string })[];
  byAge: Record<CensusAge, number>;
  bySex: Record<CensusSex, number>;
  byStatus: Record<CensusStatus | 'inconnu', number>;
  /** Tranche d'âge × sexe, pour la pyramide des âges. */
  ageSex: Record<CensusAge, Record<CensusSex, number>>;
}

export function summarize(rows: Pick<CensusHousehold, 'country' | 'parish' | 'people'>[]): CensusSummary {
  const countries = new Map<string, CountRow>();
  const parishes = new Map<string, CountRow & { country: string }>();
  const byAge = Object.fromEntries(CENSUS_AGES.map((a) => [a.key, 0])) as Record<CensusAge, number>;
  const ageSex = Object.fromEntries(CENSUS_AGES.map((a) => [a.key, { M: 0, F: 0 }])) as Record<CensusAge, Record<CensusSex, number>>;
  const bySex: Record<CensusSex, number> = { M: 0, F: 0 };
  const byStatus: Record<CensusStatus | 'inconnu', number> = { membre: 0, neophyte: 0, sympathisant: 0, inconnu: 0 };
  let people = 0;
  for (const r of rows) {
    const n = r.people.length;
    people += n;
    const ck = groupKey(r.country);
    const c = countries.get(ck) ?? { label: r.country.trim(), people: 0, households: 0 };
    c.people += n; c.households += 1; countries.set(ck, c);
    const pk = `${ck}|${groupKey(r.parish)}`;
    const p = parishes.get(pk) ?? { label: r.parish.trim(), country: r.country.trim(), people: 0, households: 0 };
    p.people += n; p.households += 1; parishes.set(pk, p);
    for (const person of r.people) {
      if (person.age in byAge) byAge[person.age] += 1;
      if (person.sex === 'M' || person.sex === 'F') {
        bySex[person.sex] += 1;
        if (person.age in ageSex) ageSex[person.age][person.sex] += 1;
      }
      byStatus[person.status && person.status in byStatus ? person.status : 'inconnu'] += 1;
    }
  }
  const sort = <R extends CountRow>(list: R[]) => list.sort((a, b) => b.people - a.people || a.label.localeCompare(b.label, 'fr'));
  return {
    totals: { people, households: rows.length, parishes: parishes.size, countries: countries.size },
    byCountry: sort([...countries.values()]),
    byParish: sort([...parishes.values()]),
    byAge, bySex, byStatus, ageSex,
  };
}

/** Une ligne par personne, pour Excel. */
export function censusPeopleCsv(rows: CensusHousehold[]) {
  const ages = new Map(CENSUS_AGES.map((a) => [a.key, a.label.fr]));
  const statuses = new Map(CENSUS_STATUSES.map((s) => [s.key, s.label.fr]));
  return rows.flatMap((r) => r.people.map((p, i) => ({
    Foyer: r.id.slice(0, 8), Date: r.createdAt.slice(0, 10), Pays: r.country, Province: r.province ?? '', Ville: r.city, Paroisse: r.parish, Section: r.section ?? '',
    'Contact du foyer': r.contactName ?? '', Matricule: r.matricule ?? '', 'Recensé par': r.recordedBy ?? '',
    'N° dans le foyer': i + 1, Prénom: p.name ?? '', Sexe: p.sex === 'M' ? 'Homme' : 'Femme', 'Tranche d’âge': ages.get(p.age) ?? p.age, Statut: p.status ? statuses.get(p.status) ?? p.status : '',
  })));
}

/** Une ligne par paroisse, avec la répartition par âge et par sexe. */
export function censusParishCsv(rows: CensusHousehold[]) {
  const groups = new Map<string, CensusHousehold[]>();
  for (const r of rows) {
    const k = `${groupKey(r.country)}|${groupKey(r.parish)}`;
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  return [...groups.values()].map((list) => {
    const s = summarize(list);
    return {
      Pays: list[0].country, Paroisse: list[0].parish, Foyers: s.totals.households, Personnes: s.totals.people, Hommes: s.bySex.M, Femmes: s.bySex.F,
      ...Object.fromEntries(CENSUS_AGES.map((a) => [a.label.fr, s.byAge[a.key]])),
      Fidèles: s.byStatus.membre, Néophytes: s.byStatus.neophyte, Sympathisants: s.byStatus.sympathisant,
    };
  }).sort((a, b) => b.Personnes - a.Personnes);
}

// ——— Fiches envoyées depuis ce téléphone (pour les corriger) ———

const LOCAL_KEY = 'kcc-recensement-fiches';
export interface LocalCensusEntry { token: string; label: string; people: number; at: string }

export function readLocalEntries(): LocalCensusEntry[] {
  try {
    const v = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => x && typeof x.token === 'string') : [];
  } catch { return []; }
}

export function saveLocalEntry(e: LocalCensusEntry) {
  try {
    const list = [e, ...readLocalEntries().filter((x) => x.token !== e.token)].slice(0, 50);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch { /* stockage indisponible : la fiche est quand même envoyée */ }
}
