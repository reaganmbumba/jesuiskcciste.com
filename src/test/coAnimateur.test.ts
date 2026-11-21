import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildPrompt, handleAssistant, KINDS } from '../../worker/assistant';

const env = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' };
const req = (body: unknown, token = 'tok') => new Request('https://jesuiskcciste.com/api/radio/assistant', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

afterEach(() => vi.unstubAllGlobals());

describe('co-animateur Claude (worker)', () => {
  it('construit la demande avec le fil et les informations de l’émission', () => {
    const p = buildPrompt({
      kind: 'priere',
      emission: { titre: 'Tosungana', sujet: 'La foi', animateur: 'Reagan', etat: 'en direct', minutes: 12, heure: '08:30', auditeurs: 14, antenne: 'Marie (Boma)' },
      fil: [{ h: '08:20', type: 'Chanson', texte: 'Mono Nzambi — Chorale' }, { h: '08:25', type: 'Prière', texte: 'Pour Maman Ruth, malade' }],
    })!;
    expect(p).toContain('Émission : Tosungana');
    expect(p).toContain('[08:25] Prière : Pour Maman Ruth, malade');
    expect(p).toContain('Auditeurs à l’antenne maintenant : Marie (Boma)');
    expect(p).toContain(KINDS.priere);
  });

  it('refuse une demande inconnue ou une demande libre vide, et borne le fil', () => {
    expect(buildPrompt({ kind: 'pirate' })).toBeNull();
    expect(buildPrompt({ kind: 'libre', demande: '  ' })).toBeNull();
    const p = buildPrompt({ kind: 'suite', fil: Array.from({ length: 300 }, (_, i) => ({ h: '08:00', type: 'Dit', texte: `ligne ${i}` })) })!;
    expect(p).not.toContain('ligne 0\n');
    expect(p).toContain('ligne 299');
  });

  it('réservé aux administrateurs, puis signale la clé manquante', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('false')));
    expect((await handleAssistant(req({ kind: 'suite' }), env)).status).toBe(403);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('true')));
    const r = await handleAssistant(req({ kind: 'suite' }), env);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: 'not-configured' });
  });
});
