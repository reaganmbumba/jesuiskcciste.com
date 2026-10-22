import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { IconAction } from '@/features/administration/CrudTable';
import { diffPage, loadPageText, pageTextKey, plainModule, savePageText, type PageValue } from '@/features/content/pageTexts';
import { isDemoMode } from '@/config/env';
import type { Locale } from '@/i18n';
import * as doctrineFr from '@/content/doctrine';
import * as doctrineEn from '@/content/doctrine.en';
import * as doctrinePt from '@/content/doctrine.pt';
import * as catechismeFr from '@/content/catechisme';
import * as catechismeEn from '@/content/catechisme.en';
import * as catechismePt from '@/content/catechisme.pt';
import * as liturgieFr from '@/content/liturgie';
import * as liturgieEn from '@/content/liturgie.en';
import * as liturgiePt from '@/content/liturgie.pt';
import * as appelFr from '@/content/mon-appel';
import * as appelEn from '@/content/mon-appel.en';
import * as appelPt from '@/content/mon-appel.pt';
import * as predicationsFr from '@/content/predications';
import * as predicationsEn from '@/content/predications.en';
import * as predicationsPt from '@/content/predications.pt';
import * as egliseFr from '@/content/eglise';
import * as egliseEn from '@/content/eglise.en';
import * as eglisePt from '@/content/eglise.pt';
import * as cantiques from '@/content/cantiques';

interface PageDef { key: string; label: string; path: string; modules: Partial<Record<Locale, object>> | object; localized: boolean }
const PAGES: PageDef[] = [
  { key: 'cantiques', label: 'Recueil de cantiques', path: '/cantiques', modules: cantiques, localized: false },
  { key: 'doctrine', label: 'Doctrine et histoire (et page À propos)', path: '/doctrine', modules: { fr: doctrineFr, en: doctrineEn, pt: doctrinePt }, localized: true },
  { key: 'catechisme', label: 'Catéchisme', path: '/catechisme', modules: { fr: catechismeFr, en: catechismeEn, pt: catechismePt }, localized: true },
  { key: 'liturgie', label: 'Rites et célébrations', path: '/liturgie', modules: { fr: liturgieFr, en: liturgieEn, pt: liturgiePt }, localized: true },
  { key: 'mon-appel', label: 'L’appel du Prophète (livre « Mon Appel »)', path: '/appel-du-prophete', modules: { fr: appelFr, en: appelEn, pt: appelPt }, localized: true },
  { key: 'predications', label: 'Prédications et séminaires (textes)', path: '/predications', modules: { fr: predicationsFr, en: predicationsEn, pt: predicationsPt }, localized: true },
  { key: 'eglise', label: 'Enseignements, histoire, chants, caisse sociale', path: '/enseignements', modules: { fr: egliseFr, en: egliseEn, pt: eglisePt }, localized: true },
];
const LANGS: { value: Locale; label: string }[] = [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }, { value: 'pt', label: 'Português' }];

/** Noms lisibles des parties des textes (sinon le nom technique est affiché). */
const LABELS: Record<string, string> = {
  hymns: 'Cantiques', n: 'Numéro', lang: 'Langue', title: 'Titre', lines: 'Lignes', text: 'Texte', paragraphs: 'Paragraphes', intro: 'Introduction',
  items: 'Éléments', q: 'Question', a: 'Réponse', list: 'Liste', id: 'Identifiant (ne pas changer)', quote: 'Citation', date: 'Date', place: 'Lieu',
  year: 'Année', t: 'Titre', d: 'Description', name: 'Nom', label: 'Libellé', note: 'Note', source: 'Source', versions: 'Versions', stanzas: 'Strophes',
  credit: 'Crédit', language: 'Langue', theme: 'Thème', summary: 'Résumé', points: 'Points', subtitle: 'Sous-titre', description: 'Description',
  catechism: 'Questions du catéchisme', catechismIntro: 'Introduction du catéchisme', catechismSource: 'Source', neophytePath: 'Parcours du néophyte',
  rites: 'Rites', liturgyIntro: 'Introduction', callingChapters: 'Chapitres', callingBook: 'Le livre', callingConclusion: 'Conclusion', biography: 'Biographie',
  sermons: 'Prédications', seminars: 'Séminaires', sermonThemes: 'Thèmes', sermonsSource: 'Source', teachings: 'Enseignements', minuteToLearn: 'Une minute pour apprendre',
  prophetHistory: 'Histoire du Prophète', pgmVision: 'Vision PGM', songs: 'Chants', socialFund: 'Caisse d’assistance sociale', doctrineSource: 'Source',
  specificities: 'Spécificités', kccApparition: 'Apparition du KCC', oracle: 'Oracle', professionOfFaith: 'Profession de foi', articles: 'Articles', lawTexts: 'Textes de la Loi',
  sacraments: 'Sacrements', feasts: 'Fêtes', sabbathService: 'Culte du sabbat', prophetOath: 'Serment du Prophète', nameOfGod: 'Nom de Dieu', prophetTimeline: 'Grandes dates du Prophète',
  prophetPortrait: 'Portrait du Prophète', internationalPresence: 'Présence internationale', meaning: 'Signification', rite: 'Rite',
};
const labelOf = (k: string) => LABELS[k] ?? k;

type Path = (string | number)[];
const setAt = (obj: unknown, path: Path, value: unknown): unknown => {
  if (!path.length) return value;
  const [h, ...rest] = path;
  if (Array.isArray(obj)) return obj.map((x, i) => (i === h ? setAt(x, rest, value) : x));
  const o = (obj ?? {}) as Record<string, unknown>;
  return { ...o, [h]: setAt(o[h as string], rest, value) };
};
/** Modèle vide d'un nouvel élément, sur le modèle du premier élément de la liste. */
const blank = (v: unknown, list: unknown[], key?: string): unknown => {
  if (typeof v === 'string') return '';
  if (typeof v === 'number') return key === 'n' ? Math.max(0, ...list.map((x) => Number((x as Record<string, unknown>)?.n) || 0)) + 1 : 0;
  if (typeof v === 'boolean') return false;
  if (Array.isArray(v)) return typeof v[0] === 'string' ? [''] : [];
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'id' ? `nouveau-${Date.now()}` : blank(x, list, k)]));
  return '';
};
const summaryOf = (v: unknown, i: number): string => {
  if (typeof v === 'string') return v.slice(0, 90) || '(vide)';
  if (!v || typeof v !== 'object') return String(v);
  const o = v as Record<string, unknown>;
  const main = ['title', 'q', 'name', 't', 'label', 'lang', 'year', 'date'].map((k) => o[k]).find((x) => typeof x === 'string' && x);
  const num = typeof o.n === 'number' ? `${o.n}. ` : '';
  return `${num}${String(main ?? `Élément ${i + 1}`).slice(0, 90)}`;
};

/** « Textes des pages » : doctrine, catéchisme, rites, cantiques… modifiables sans toucher au code. */
export default function AdminPageTexts() {
  const { notify } = useToast();
  const [pageKey, setPageKey] = useState(PAGES[0].key);
  const [lang, setLang] = useState<Locale>('fr');
  const page = PAGES.find((p) => p.key === pageKey)!;
  const key = pageTextKey(page.key, page.localized ? lang : null);
  const base = useMemo(() => plainModule(page.localized ? ((page.modules as Record<Locale, object>)[lang] ?? (page.modules as Record<Locale, object>).fr) : page.modules), [page, lang]);
  const [draft, setDraft] = useState<PageValue | null>(null);
  const [saved, setSaved] = useState<PageValue>({});
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    let alive = true;
    setDraft(null);
    void loadPageText(key).then((v) => {
      if (!alive) return;
      const over = v ?? {};
      setSaved(over);
      setDraft({ ...base, ...Object.fromEntries(Object.entries(over).filter(([k]) => k in base)) });
    });
    return () => { alive = false; };
  }, [key, base]);

  const changes = draft ? diffPage(base, draft) : {};
  const dirty = draft ? JSON.stringify(changes) !== JSON.stringify(diffPage(base, { ...base, ...saved })) : false;

  const save = async (value: PageValue, msg: string) => {
    setSaving(true);
    try {
      await savePageText(key, value);
      setSaved(value);
      notify(isDemoMode ? `${msg} (démonstration, non enregistré).` : msg);
    } catch (e) {
      notify(e instanceof Error ? `Enregistrement impossible : ${e.message}. Le fichier SQL a-t-il été collé dans Supabase ?` : 'Enregistrement impossible.', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="font-display text-2xl font-semibold text-night">Textes des pages</h1>
        <p className="text-sm text-ink/60">Modifiez les longs textes du site : cantiques, doctrine, catéchisme, rites, livre « Mon Appel »… Ouvrez une partie, changez le texte, puis cliquez sur « Enregistrer ».</p>
      </div>
      <DemoInline />
      <div className="flex flex-col gap-2 md:flex-row">
        <Select aria-label="Page" className="md:w-96" value={pageKey} onChange={(e) => setPageKey(e.target.value)}>{PAGES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</Select>
        {page.localized && <Select aria-label="Langue" className="md:w-48" value={lang} onChange={(e) => setLang(e.target.value as Locale)}>{LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}</Select>}
        <a href={page.path} target="_blank" rel="noreferrer" className="self-center text-sm font-semibold text-gold-700 hover:underline">Voir la page ↗</a>
      </div>
      {!draft ? <Spinner /> : (
        <div className="space-y-3">
          {Object.entries(draft).map(([k, v]) => (
            <Node key={`${key}-${k}`} label={labelOf(k)} value={v} path={[k]} depth={0} modified={k in changes} onChange={(path, val) => setDraft((d) => setAt(d, path, val) as PageValue)} />
          ))}
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-night/10 bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="text-xs text-ink/60">{dirty ? 'Modifications non enregistrées.' : Object.keys(saved).length ? 'Cette page contient des modifications enregistrées.' : 'Texte d’origine.'}</p>
          <div className="flex gap-2">
            {Object.keys(saved).length > 0 && <Button variant="outline" size="sm" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmReset(true)}>Texte d’origine</Button>}
            <Button size="sm" loading={saving} disabled={!dirty} onClick={() => void save(changes, 'Texte enregistré. Il est visible sur le site.')}>Enregistrer</Button>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmReset} danger title="Rétablir le texte d’origine ?" message="Toutes les modifications de cette page (dans cette langue) seront effacées." confirmLabel="Rétablir" loading={saving}
        onConfirm={() => { setConfirmReset(false); setDraft({ ...base }); void save({}, 'Texte d’origine rétabli.'); }} onCancel={() => setConfirmReset(false)} />
    </div>
  );
}

function Node({ label, value, path, depth, modified, onChange }: { label: string; value: unknown; path: Path; depth: number; modified?: boolean; onChange: (path: Path, v: unknown) => void }) {
  const [open, setOpen] = useState(false);
  if (typeof value === 'string') return <TextField label={label} value={value} onChange={(v) => onChange(path, v)} />;
  if (typeof value === 'number') return <label className="block space-y-1"><span className="text-xs font-semibold text-ink/70">{label}</span><Input type="number" value={value} onChange={(e) => onChange(path, Number(e.target.value))} className="w-32" /></label>;
  if (typeof value === 'boolean') return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value} onChange={(e) => onChange(path, e.target.checked)} />{label}</label>;
  if (!value || typeof value !== 'object') return null;
  const head = (
    <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left">
      {open ? <ChevronDown className="h-4 w-4 shrink-0 text-gold-700" /> : <ChevronRight className="h-4 w-4 shrink-0 text-gold-700" />}
      <span className={depth === 0 ? 'font-semibold text-night' : 'text-sm font-semibold text-night'}>{label}</span>
      {Array.isArray(value) && <span className="text-xs text-ink/50">({value.length})</span>}
      {modified && <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-semibold text-gold-700">modifié</span>}
    </button>
  );
  const body = !open ? null : Array.isArray(value)
    ? <ListEditor list={value} path={path} depth={depth} onChange={onChange} />
    : <div className="mt-3 space-y-3">{Object.entries(value).map(([k, v]) => <Node key={k} label={labelOf(k)} value={v} path={[...path, k]} depth={depth + 1} onChange={onChange} />)}</div>;
  return depth === 0 ? <Card><CardBody>{head}{body}</CardBody></Card> : <div className="rounded-xl border border-night/10 p-3">{head}{body}</div>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const long = value.length > 70 || value.includes('\n');
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-ink/70">{label}</span>
      {long ? <Textarea rows={Math.min(12, Math.max(3, Math.ceil(value.length / 90) + value.split('\n').length - 1))} value={value} onChange={(e) => onChange(e.target.value)} />
        : <Input value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

const PAGE_SIZE = 40;

function ListEditor({ list, path, depth, onChange }: { list: unknown[]; path: Path; depth: number; onChange: (path: Path, v: unknown) => void }) {
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const strings = list.every((x) => typeof x === 'string');
  const indexed = list.map((v, i) => ({ v, i }));
  const s = q.trim().toLowerCase();
  const shown = s ? indexed.filter(({ v }) => JSON.stringify(v).toLowerCase().includes(s)) : indexed;
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(path, next);
  };
  const add = () => onChange(path, [...list, list.length ? blank(list[0], list) : '']);
  return (
    <div className="mt-3 space-y-2">
      {list.length > 15 && (
        <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input className="pl-10" placeholder="Rechercher dans la liste…" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE_SIZE); }} /></div>
      )}
      {shown.slice(0, limit).map(({ v, i }) => (
        <div key={i} className="flex items-start gap-1">
          <div className="min-w-0 flex-1">
            {strings ? <TextField label={`${i + 1}.`} value={v as string} onChange={(x) => onChange([...path, i], x)} />
              : <Node label={summaryOf(v, i)} value={v} path={[...path, i]} depth={depth + 1} onChange={onChange} />}
          </div>
          <div className={`flex shrink-0 flex-col sm:flex-row ${strings ? 'pt-5' : ''}`}>
            <IconAction label="Monter" onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></IconAction>
            <IconAction label="Descendre" onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></IconAction>
            <IconAction label="Supprimer" tone="red" onClick={() => (strings && !(v as string) ? onChange(path, list.filter((_, j) => j !== i)) : setToDelete(i))}><Trash2 className="h-4 w-4" /></IconAction>
          </div>
        </div>
      ))}
      {shown.length > limit && <Button variant="ghost" size="sm" onClick={() => setLimit(limit + PAGE_SIZE)}>Afficher plus ({shown.length - limit} restants)</Button>}
      <Button variant="outline" size="sm" icon={<Plus className="h-4 w-4" />} onClick={add}>{strings ? 'Ajouter une ligne' : 'Ajouter un élément'}</Button>
      <ConfirmDialog open={toDelete !== null} danger title="Supprimer cet élément ?" message={toDelete !== null ? `« ${summaryOf(list[toDelete], toDelete)} » sera retiré (effectif après « Enregistrer »).` : ''} confirmLabel="Supprimer"
        onConfirm={() => { onChange(path, list.filter((_, j) => j !== toDelete)); setToDelete(null); }} onCancel={() => setToDelete(null)} />
    </div>
  );
}
