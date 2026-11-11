import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { BookOpen, Eye, EyeOff, Lock, LockOpen, Minus, Phone, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Button, buttonClass } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

/**
 * Le livre « Le KCCisme » (doctrine de l'EBNM/KCC), lisible avec un code d'accès.
 * Le texte n'est pas dans le code du site : il est publié chiffré
 * (public/livres/kccisme-v2.enc.json, AES-GCM, clé dérivée du code par PBKDF2-SHA256)
 * et n'est déchiffré que dans le navigateur de la personne qui saisit le bon code.
 * Le code n'est écrit nulle part dans le dépôt.
 */

const COVER = '/images/livres/kccisme-couverture.jpg';
const SHARE_IMAGE = '/images/livres/kccisme-annonce.jpg';
const DATA_URL = '/livres/kccisme-v2.enc.json'; // nouveau nom à chaque changement de code (évite l'ancien fichier en cache)
const STORE_KEY = 'kcc.kccisme.code';
const CONTACT_NAME = 'Reagan MBUMBA';
const CONTACT_PHONE = '+243 840 238 592';
const CONTACT_TEL = '+243840238592';

type Block = [kind: 'h2' | 'h3' | 'p' | 'li' | 'oli' | 'note', html: string];
interface Chapter { id: string; title: string; blocks: Block[] }
interface Book { title: string; chapters: Chapter[] }
interface Sealed { v: number; iter: number; salt: string; iv: string; data: string }

const fromB64 = (s: string): ArrayBuffer => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer as ArrayBuffer;

async function openBook(code: string): Promise<Book> {
  const sealed = (await (await fetch(DATA_URL, { cache: 'force-cache' })).json()) as Sealed;
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: fromB64(sealed.salt), iterations: sealed.iter, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt'],
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(sealed.iv) }, key, fromB64(sealed.data));
  return JSON.parse(new TextDecoder().decode(plain)) as Book;
}

function readStored() {
  try { return localStorage.getItem(STORE_KEY) ?? ''; } catch { return ''; }
}
function store(code: string | null) {
  try {
    if (code) localStorage.setItem(STORE_KEY, code);
    else localStorage.removeItem(STORE_KEY);
  } catch { /* stockage indisponible */ }
}

export default function KccismeBookPage() {
  const { tx } = useI18n();
  const [book, setBook] = useState<Book | null>(null);
  const [checking, setChecking] = useState(() => !!readStored());

  // Code déjà saisi sur cet appareil : le livre s'ouvre directement.
  useEffect(() => {
    const saved = readStored();
    if (!saved) return;
    openBook(saved).then(setBook).catch(() => store(null)).finally(() => setChecking(false));
  }, []);

  return (
    <>
      <PageHeader
        eyebrow={tx('Livre de la doctrine', 'Doctrine book', 'Livro da doutrina')}
        title={tx('Le KCCisme', 'Le KCCisme', 'Le KCCisme')}
        description={tx(
          'La doctrine de l’Église Bon Nouveau Message (KCC), par le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac : l’Éternel, le vrai Dieu, les croyances, l’enseignement, les sacrements, la liturgie, les fêtes, les commandements et la discipline.',
          'The doctrine of the Église Bon Nouveau Message (KCC), by the Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac: the Eternal, the true God, beliefs, teaching, sacraments, liturgy, feasts, commandments and discipline (in French).',
          'A doutrina da Église Bon Nouveau Message (KCC), pelo Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac: o Eterno, o verdadeiro Deus, as crenças, o ensino, os sacramentos, a liturgia, as festas, os mandamentos e a disciplina (em francês).',
        )}
        image={SHARE_IMAGE}
      />
      {book
        ? <Reader book={book} onLock={() => { store(null); setBook(null); }} />
        : <Gate checking={checking} onOpen={(b, code) => { store(code); setBook(b); }} />}
    </>
  );
}

function Gate({ checking, onOpen }: { checking: boolean; onOpen: (b: Book, code: string) => void }) {
  const { tx } = useI18n();
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim();
    if (!c) return;
    setBusy(true);
    setError('');
    try {
      onOpen(await openBook(c), c);
    } catch {
      setError(tx('Code incorrect. Vérifiez les majuscules et les signes, ou appelez le contact ci-dessous.', 'Wrong code. Check capital letters and symbols, or call the contact below.', 'Código incorreto. Verifique as maiúsculas e os sinais, ou ligue para o contacto abaixo.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container-page py-12">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <img src={COVER} alt={tx('Couverture du livre Le KCCisme', 'Cover of the book Le KCCisme', 'Capa do livro Le KCCisme')} className="mx-auto w-full max-w-sm rounded-md shadow-lift" />
        <div className="rounded-3xl border border-night/10 bg-white p-7 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-night text-gold"><Lock className="h-6 w-6" aria-hidden /></span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-night">{tx('Lecture avec code d’accès', 'Reading with an access code', 'Leitura com código de acesso')}</h2>
          <p className="mt-2 text-ink/70">{tx('Entrez le code pour ouvrir le livre. Sur cet appareil, il ne vous sera plus demandé.', 'Enter the code to open the book. It will not be asked again on this device.', 'Introduza o código para abrir o livro. Neste aparelho, não voltará a ser pedido.')}</p>
          {checking ? (
            <p className="mt-6 text-sm text-ink/60">{tx('Ouverture du livre…', 'Opening the book…', 'A abrir o livro…')}</p>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <label htmlFor="kccisme-code" className="block text-sm font-semibold text-night">{tx('Code d’accès', 'Access code', 'Código de acesso')}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input id="kccisme-code" type={show ? 'text' : 'password'} value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false}
                    className="w-full rounded-xl border border-night/15 bg-white px-4 py-3 pr-11 text-night outline-none focus:border-gold focus:ring-2 focus:ring-gold/30" />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink/50 hover:text-night" aria-label={show ? tx('Masquer le code', 'Hide the code', 'Ocultar o código') : tx('Afficher le code', 'Show the code', 'Mostrar o código')}>
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <Button type="submit" variant="gold" loading={busy} icon={<LockOpen className="h-4 w-4" />}>{tx('Ouvrir', 'Open', 'Abrir')}</Button>
              </div>
              {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}
            </form>
          )}
          <div className="mt-7 rounded-2xl bg-gold/10 p-4">
            <p className="text-sm font-semibold text-night">{tx('Vous n’avez pas le code ?', 'No code yet?', 'Não tem o código?')}</p>
            <p className="mt-1 text-sm text-ink/70">{tx(`Appelez ${CONTACT_NAME} au`, `Call ${CONTACT_NAME} on`, `Ligue para ${CONTACT_NAME}:`)} <span className="font-semibold text-night">{CONTACT_PHONE}</span></p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${CONTACT_TEL}`} className={buttonClass('outline', 'sm')}><Phone className="h-4 w-4" aria-hidden />{tx('Appeler', 'Call', 'Ligar')}</a>
              <a href={`https://wa.me/${CONTACT_TEL.slice(1)}?text=${encodeURIComponent('Bonjour, je souhaite le code d’accès pour lire le livre « Le KCCisme » sur jesuiskcciste.com.')}`} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'sm')}>WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const SIZES = ['text-[15px]', 'text-base', 'text-[17px]', 'text-lg', 'text-xl'];

function Reader({ book, onLock }: { book: Book; onLock: () => void }) {
  const { tx } = useI18n();
  const [size, setSize] = useState(1);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 100);
  }, []);

  return (
    <section className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
          <img src={COVER} alt="" className="hidden w-40 rounded shadow-soft lg:block" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">{tx('Sommaire', 'Contents', 'Índice')}</p>
          <nav className="mt-2 flex flex-wrap gap-2 lg:flex-col lg:gap-0.5" aria-label={tx('Sommaire du livre', 'Book contents', 'Índice do livro')}>
            {book.chapters.map((c) => (
              <a key={c.id} href={`#${c.id}`} className="rounded-full border border-night/10 bg-white px-3 py-1 text-sm text-ink/70 hover:border-gold hover:text-night lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-2">{c.title}</a>
            ))}
          </nav>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink/60">{tx('Taille du texte', 'Text size', 'Tamanho do texto')}</span>
            <button type="button" onClick={() => setSize((s) => Math.max(0, s - 1))} className="rounded-lg border border-night/10 bg-white p-1.5 text-night" aria-label={tx('Réduire le texte', 'Smaller text', 'Texto menor')}><Minus className="h-4 w-4" /></button>
            <button type="button" onClick={() => setSize((s) => Math.min(SIZES.length - 1, s + 1))} className="rounded-lg border border-night/10 bg-white p-1.5 text-night" aria-label={tx('Agrandir le texte', 'Larger text', 'Texto maior')}><Plus className="h-4 w-4" /></button>
          </div>
          <button type="button" onClick={onLock} className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink/50 hover:text-night"><Lock className="h-3.5 w-3.5" aria-hidden />{tx('Fermer le livre sur cet appareil', 'Close the book on this device', 'Fechar o livro neste aparelho')}</button>
        </aside>

        <article className={cn('min-w-0 max-w-3xl leading-relaxed text-ink/90', SIZES[size])}>
          <div className="mb-10 flex items-center gap-3 rounded-2xl bg-night p-5 text-white">
            <BookOpen className="h-6 w-6 shrink-0 text-gold" aria-hidden />
            <p className="text-sm text-white/80">{tx('Le KCCisme · DIZOLELE-MPUNGU WAFIDUSWA Isaac, Prophète de l’Éternel', 'Le KCCisme · DIZOLELE-MPUNGU WAFIDUSWA Isaac, Prophet of the Eternal', 'Le KCCisme · DIZOLELE-MPUNGU WAFIDUSWA Isaac, Profeta do Eterno')}</p>
          </div>
          {book.chapters.map((c) => <ChapterView key={c.id} chapter={c} />)}
        </article>
      </div>
    </section>
  );
}

function ChapterView({ chapter }: { chapter: Chapter }) {
  const groups = useMemo(() => {
    const out: (Block | Block[])[] = [];
    for (const b of chapter.blocks) {
      const last = out[out.length - 1];
      if (b[0] === 'li' || b[0] === 'oli') {
        if (Array.isArray(last) && Array.isArray(last[0]) && (last as Block[])[0][0] === b[0]) (last as Block[]).push(b);
        else out.push([b]);
      } else out.push(b);
    }
    return out;
  }, [chapter]);

  const html = (h: string) => ({ __html: h });
  const render = (g: Block | Block[], i: number): ReactNode => {
    if (Array.isArray(g[0])) {
      const items = (g as Block[]).map((b, j) => <li key={j} dangerouslySetInnerHTML={html(b[1])} />);
      return (g as Block[])[0][0] === 'oli'
        ? <ol key={i} className="my-4 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-gold-700">{items}</ol>
        : <ul key={i} className="my-4 list-disc space-y-2 pl-6 marker:text-gold-700">{items}</ul>;
    }
    const [kind, h] = g as Block;
    if (kind === 'h2') return <h3 key={i} className="mt-10 font-display text-2xl font-semibold text-night" dangerouslySetInnerHTML={html(h)} />;
    if (kind === 'h3') return <h4 key={i} className="mt-8 text-lg font-semibold text-gold-700" dangerouslySetInnerHTML={html(h)} />;
    if (kind === 'note') return <p key={i} className="my-2 border-l-2 border-gold/50 pl-3 text-[0.85em] text-ink/60" dangerouslySetInnerHTML={html(h)} />;
    return <p key={i} className="my-4" dangerouslySetInnerHTML={html(h)} />;
  };

  return (
    <section id={chapter.id} className="scroll-mt-28 border-t border-night/10 pt-10 first:border-0 first:pt-0">
      <h2 className="font-display text-3xl font-semibold text-night sm:text-4xl">{chapter.title}</h2>
      {groups.map(render)}
    </section>
  );
}
