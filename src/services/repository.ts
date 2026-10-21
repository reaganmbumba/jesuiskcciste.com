import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize, snakify } from '@/utils/case';

export interface ListParams<T> {
  search?: string;
  searchFields?: (keyof T)[];
  filters?: Partial<Record<keyof T, unknown>>;
  page?: number;
  pageSize?: number;
  orderBy?: keyof T;
  ascending?: boolean;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Repository<T extends { id: string }> {
  list(params?: ListParams<T>): Promise<Page<T>>;
  all(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(input: Omit<T, 'id'> & { id?: string }): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

/** Latence simulée en démonstration pour rendre visibles les états de chargement. */
const demoDelay = (ms = 180) => (import.meta.env.MODE === 'test' ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function applyListParams<T>(rows: T[], params: ListParams<T> = {}): Page<T> {
  const { search, searchFields, filters, page = 1, pageSize = 20, orderBy, ascending = true } = params;
  let out = rows;
  if (filters) {
    out = out.filter((r) =>
      Object.entries(filters).every(([k, v]) => v === undefined || v === '' || v === null || (r as Record<string, unknown>)[k] === v),
    );
  }
  if (search && searchFields?.length) {
    const q = norm(search.trim());
    out = out.filter((r) => searchFields.some((f) => norm(String((r as Record<string, unknown>)[f as string] ?? '')).includes(q)));
  }
  if (orderBy) {
    out = [...out].sort((a, b) => {
      const av = (a as Record<string, unknown>)[orderBy as string] as string | number;
      const bv = (b as Record<string, unknown>)[orderBy as string] as string | number;
      return (av > bv ? 1 : av < bv ? -1 : 0) * (ascending ? 1 : -1);
    });
  }
  const total = out.length;
  const start = (page - 1) * pageSize;
  return { items: out.slice(start, start + pageSize), total, page, pageSize };
}

/**
 * Dépôt en mémoire (mode démonstration). Les modifications ne vivent que dans
 * l'onglet courant et disparaissent au rechargement : rien n'est persisté.
 */
export function createDemoRepository<T extends { id: string }>(seed: T[], prefix: string): Repository<T> {
  let rows = [...seed];
  let counter = 0;
  return {
    async list(params) {
      await demoDelay();
      return applyListParams(rows, params);
    },
    async all() {
      await demoDelay(60);
      return [...rows];
    },
    async get(id) {
      await demoDelay(60);
      return rows.find((r) => r.id === id) ?? null;
    },
    async create(input) {
      await demoDelay();
      const item = { ...input, id: input.id ?? `${prefix}-demo-${Date.now()}-${++counter}` } as T;
      rows = [item, ...rows];
      return item;
    },
    async update(id, patch) {
      await demoDelay();
      const idx = rows.findIndex((r) => r.id === id);
      if (idx < 0) throw new Error('Élément introuvable');
      rows[idx] = { ...rows[idx], ...patch, id };
      rows = [...rows];
      return rows[idx];
    },
    async remove(id) {
      await demoDelay();
      rows = rows.filter((r) => r.id !== id);
    },
  };
}

/**
 * Dépôt Supabase. Les droits sont vérifiés par les politiques RLS :
 * une requête non autorisée renvoie une erreur ou un résultat vide.
 */
export function createSupabaseRepository<T extends { id: string }>(table: string, select = '*', readonlyKeys: string[] = []): Repository<T> {
  // Champs calculés ou relations imbriquées : jamais envoyés en écriture.
  const writable = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([k]) => !readonlyKeys.includes(k)));
  const db = () => {
    if (!supabase) throw new Error('Supabase non configuré');
    return supabase;
  };
  const snake = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  return {
    async list(params = {}) {
      const { search, searchFields, filters, page = 1, pageSize = 20, orderBy, ascending = true } = params;
      let q = db().from(table).select(select, { count: 'exact' });
      if (filters) for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== '' && v !== null) q = q.eq(snake(k), v);
      if (search && searchFields?.length) {
        const safe = search.replace(/[%,()]/g, ' ').trim();
        q = q.or(searchFields.map((f) => `${snake(String(f))}.ilike.%${safe}%`).join(','));
      }
      if (orderBy) q = q.order(snake(String(orderBy)), { ascending });
      const from = (page - 1) * pageSize;
      const { data, error, count } = await q.range(from, from + pageSize - 1);
      if (error) throw error;
      return { items: camelize<T[]>(data ?? []), total: count ?? 0, page, pageSize };
    },
    async all() {
      const { data, error } = await db().from(table).select(select).limit(1000);
      if (error) throw error;
      return camelize<T[]>(data ?? []);
    },
    async get(id) {
      const { data, error } = await db().from(table).select(select).eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? camelize<T>(data) : null;
    },
    async create(input) {
      const { data, error } = await db().from(table).insert(snakify(writable(input as Record<string, unknown>))).select(select).single();
      if (error) throw error;
      return camelize<T>(data);
    },
    async update(id, patch) {
      const { id: _ignored, ...rest } = patch as Record<string, unknown>;
      void _ignored;
      const { data, error } = await db().from(table).update(snakify(writable(rest))).eq('id', id).select(select).single();
      if (error) throw error;
      return camelize<T>(data);
    },
    async remove(id) {
      const { error } = await db().from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

export function repository<T extends { id: string }>(table: string, seed: T[], prefix: string, select?: string, readonlyKeys?: string[]): Repository<T> {
  return isDemoMode ? createDemoRepository(seed, prefix) : createSupabaseRepository<T>(table, select, readonlyKeys);
}

/** Pages où seules les vraies données de la base doivent apparaître (gestion, inscription, profil). */
const RAW_DATA_PATHS = /^\/(admin|inscription|espace)(\/|$)/;
const wantsRawData = () => typeof window === 'undefined' || RAW_DATA_PATHS.test(window.location.pathname);

/**
 * Ajoute le contenu éditorial de base à un dépôt Supabase : tant que la table
 * est vide, les pages publiques affichent ce contenu au lieu d'une page vide.
 * L'administration, l'inscription et l'espace membre voient toujours la base seule.
 */
export function withEditorial<T extends { id: string }>(repo: Repository<T>, fallback: () => T[]): Repository<T> {
  if (isDemoMode) return repo;
  return {
    ...repo,
    async list(params) {
      const page = await repo.list(params);
      if (page.total > 0 || wantsRawData()) return page;
      return applyListParams(fallback(), params);
    },
    async all() {
      const rows = await repo.all();
      return rows.length || wantsRawData() ? rows : fallback();
    },
    async get(id) {
      const row = await repo.get(id).catch((e) => (fallback().some((r) => r.id === id) ? null : Promise.reject(e)));
      return row ?? fallback().find((r) => r.id === id) ?? null;
    },
  };
}
