import { describe, expect, it } from 'vitest';
import { buildCorpus } from '@/features/assistant/corpus';
import { buildIndex, highlight, search, stem, SUGGESTIONS, words } from '@/features/assistant/search';

const fr = buildIndex(buildCorpus('fr'));

describe('Assistant KCC', () => {
  it('replie les accents et retire les mots vides', () => {
    expect(words('Que dit le Catéchisme sur le baptême ?')).toEqual(['catechisme', 'bapteme']);
    expect(stem('commandements')).toBe(stem('commandement'));
  });

  it('trouve la réponse du catéchisme sur le pardon des péchés', () => {
    const r = search(fr, 'Comment l’Éternel pardonne-t-il les péchés ?');
    expect(r.confident).toBe(true);
    expect(r.hits[0].passage.url).toBe('/catechisme#croyances');
  });

  it('signale qu’un mot absent des textes est remplacé par ses équivalents', () => {
    const r = search(fr, 'Que dit le catéchisme sur le baptême ?');
    expect(r.missing[0]).toMatchObject({ word: 'baptême' });
    expect(r.missing[0].replacedBy).toContain('onction');
    expect(r.hits[0].passage.source).toMatch(/^Catéchisme/);
  });

  it('dit qu’il ne sait pas quand la question sort des textes', () => {
    expect(search(fr, 'Quel est le prix du pétrole ?').confident).toBe(false);
    expect(search(fr, 'football').hits).toHaveLength(0);
    expect(search(fr, '???').confident).toBe(false);
  });

  it('répond aux questions proposées, dans les trois langues', () => {
    for (const locale of ['fr', 'en', 'pt'] as const) {
      const ix = locale === 'fr' ? fr : buildIndex(buildCorpus(locale));
      for (const q of SUGGESTIONS[locale]) expect(search(ix, q).confident, `${locale}: ${q}`).toBe(true);
    }
  });

  it('ne contient pas le texte réservé du livre « Le KCCisme »', () => {
    const corpus = buildCorpus('fr');
    expect(corpus.every((p) => p.url !== '/livre-kccisme')).toBe(true);
    expect(corpus.every((p) => p.url.startsWith('/'))).toBe(true);
    expect(new Set(corpus.map((p) => p.id)).size).toBe(corpus.length);
  });

  it('surligne les mots de la recherche', () => {
    const parts = highlight('Les sacrements de l’Église', [stem('sacrements')]);
    expect(parts.filter((p) => p.on).map((p) => p.t)).toEqual(['sacrements']);
  });
});
