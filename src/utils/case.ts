/** Conversion des clés snake_case (PostgreSQL) <-> camelCase (TypeScript). */
const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);
}

export function camelize<T>(input: unknown): T {
  if (Array.isArray(input)) return input.map((v) => camelize(v)) as T;
  if (isPlainObject(input)) {
    return Object.fromEntries(Object.entries(input).map(([k, v]) => [toCamel(k), camelize(v)])) as T;
  }
  return input as T;
}

export function snakify(input: unknown): Record<string, unknown> {
  if (!isPlainObject(input)) return {};
  return Object.fromEntries(Object.entries(input).map(([k, v]) => [toSnake(k), isPlainObject(v) ? snakify(v) : v]));
}
