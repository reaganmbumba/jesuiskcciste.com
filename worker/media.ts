/**
 * Fichiers audio des émissions (/radio/emissions/…) servis « par morceaux » (requêtes Range).
 *
 * Le service des fichiers statiques renvoie toujours le fichier entier : le lecteur ne peut
 * alors pas sauter au milieu, et un auditeur qui arrive 30 minutes après le début repart du
 * début. Ici, on renvoie seulement le morceau demandé (réponse 206), sans charger tout le
 * fichier en mémoire : le flux est lu et les octets avant le morceau sont ignorés.
 */

function slice(body: ReadableStream<Uint8Array>, start: number, end: number): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  let pos = 0;
  return new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) { ctrl.close(); return; }
        const s = pos;
        pos += value.length;
        if (pos <= start) continue;
        const from = Math.max(0, start - s);
        const to = Math.min(value.length, end + 1 - s);
        if (to > from) ctrl.enqueue(value.subarray(from, to));
        if (pos > end) { ctrl.close(); void reader.cancel(); }
        return;
      }
    },
    cancel() { void reader.cancel(); },
  });
}

/** Taille de chaque fichier, mesurée une fois (le service interne ne la donne pas toujours). */
const sizes = new Map<string, number>();

async function sizeOf(url: string, headers: Headers, assets: { fetch(r: Request): Promise<Response> }): Promise<number> {
  const known = sizes.get(url);
  if (known) return known;
  const res = await assets.fetch(new Request(url, { headers }));
  if (!res.ok || !res.body) return 0;
  const reader = res.body.getReader();
  let n = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; n += value.length; }
  if (n) sizes.set(url, n);
  return n;
}

export async function serveMedia(request: Request, assets: { fetch(r: Request): Promise<Response> }): Promise<Response> {
  const range = request.headers.get('Range');
  const headers = new Headers(request.headers);
  headers.delete('Range');
  const res = await assets.fetch(new Request(request.url, { method: request.method, headers }));
  if (!res.ok || !res.body) return res;
  const out = new Headers(res.headers);
  out.set('Accept-Ranges', 'bytes');
  out.set('Cache-Control', 'public, max-age=3600');
  let size = Number(res.headers.get('Content-Length') || 0);
  if (size) sizes.set(request.url, size);
  else if (range) size = await sizeOf(request.url, headers, assets);
  if (size && !range) out.set('Content-Length', String(size));
  const m = range ? /^bytes=(\d*)-(\d*)$/.exec(range.trim()) : null;
  if (!m || !size || request.method !== 'GET') return new Response(res.body, { status: res.status, headers: out });
  let start: number, end: number;
  if (m[1] === '') { const n = Number(m[2]); start = Math.max(0, size - n); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (!Number.isFinite(start) || start >= size || end < start) {
    void res.body.cancel();
    out.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers: out });
  }
  out.set('Content-Range', `bytes ${start}-${end}/${size}`);
  out.set('Content-Length', String(end - start + 1));
  return new Response(slice(res.body, start, end), { status: 206, headers: out });
}
