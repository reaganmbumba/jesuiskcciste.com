import { useEffect, useRef, useState } from 'react';
import { Download, Link2, MessageCircleQuestion, Share2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { ButtonLink, buttonClass } from '@/components/ui/Button';
import { ShareButtons, absoluteShareUrl, shareSignature } from '@/components/common/ShareButtons';
import { useOptionalToast } from '@/components/ui/Toast';
import { PROPHET_NAME, prophetWords, type ProphetWord, type ProphetWordKind } from '@/content/paroles-prophete';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';

type Format = 'yt' | 'wa';
const pad = (n: number) => String(n).padStart(2, '0');
const imageOf = (w: ProphetWord, f: Format) => `/images/paroles-prophete/${f}-${pad(w.n)}.jpg`;
const anchorOf = (w: ProphetWord) => `parole-${w.n}`;

/** Peut-on joindre une image au partage (téléphone ou tablette avec la feuille de partage du système) ? */
function canShareFiles() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Fichiers préparés à l'avance : la feuille de partage doit s'ouvrir juste après le toucher. */
const fileCache = new Map<string, Promise<File | null>>();
function prepareFile(src: string, name: string) {
  let p = fileCache.get(src);
  if (!p) {
    p = fetch(src)
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => (b ? new File([b], name, { type: 'image/jpeg' }) : null))
      .catch(() => null);
    fileCache.set(src, p);
  }
  return p;
}

/** Rubrique « Paroles du Prophète » : 20 paroles, leur explication et l'envoi avec l'image (voir src/content/paroles-prophete.ts). */
export default function ProphetWordsPage() {
  const { tx } = useI18n();
  const [filter, setFilter] = useState<ProphetWordKind | 'all'>('all');

  const kindLabel = (k: ProphetWordKind) => ({
    parole: tx('Parole du Prophète', 'Word of the Prophet', 'Palavra do Profeta'),
    priere: tx('Prière du Prophète', 'Prayer of the Prophet', 'Oração do Profeta'),
    eternel: tx('L’Éternel au Prophète', 'The Eternal to the Prophet', 'O Eterno ao Profeta'),
    vision: tx('Vision du Prophète', 'Vision of the Prophet', 'Visão do Profeta'),
    psaume: tx('Psaume 136 : 1', 'Psalm 136:1', 'Salmo 136:1'),
  })[k];

  // Arrivée par un lien partagé (#parole-7) : on va directement à la parole.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    return () => clearTimeout(t);
  }, []);

  const filters: { key: ProphetWordKind | 'all'; label: string }[] = [
    { key: 'all', label: tx('Toutes', 'All', 'Todas') },
    { key: 'parole', label: tx('Paroles', 'Words', 'Palavras') },
    { key: 'priere', label: tx('Prières', 'Prayers', 'Orações') },
    { key: 'eternel', label: tx('L’Éternel au Prophète', 'The Eternal to the Prophet', 'O Eterno ao Profeta') },
    { key: 'vision', label: tx('Visions', 'Visions', 'Visões') },
  ];
  const list = prophetWords.filter((w) => filter === 'all' || w.kind === filter || (filter === 'vision' && w.kind === 'psaume'));

  return (
    <>
      <PageHeader
        eyebrow={tx('Enseignement', 'Teaching', 'Ensino')}
        title={tx('Paroles du Prophète', 'Words of the Prophet', 'Palavras do Profeta')}
        description={tx(
          `20 paroles tirées du livre « Mon Appel » du Prophète ${PROPHET_NAME}, avec l’explication de chacune et l’image à partager sur WhatsApp, Facebook et les autres réseaux.`,
          `20 words from the book “Mon Appel” by the Prophet ${PROPHET_NAME}, each with its explanation and an image to share on WhatsApp, Facebook and other networks.`,
          `20 palavras do livro «Mon Appel» do Profeta ${PROPHET_NAME}, cada uma com a sua explicação e a imagem para partilhar no WhatsApp, Facebook e outras redes.`,
        )}
        image={imageOf(prophetWords[0], 'yt')}
      />

      <section className="container-page py-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [tx('1 · Choisir le format', '1 · Pick the format', '1 · Escolher o formato'), tx('Format large (YouTube, Facebook) ou plein écran (statut WhatsApp).', 'Wide (YouTube, Facebook) or full screen (WhatsApp status).', 'Largo (YouTube, Facebook) ou ecrã inteiro (estado do WhatsApp).')],
            [tx('2 · Partager', '2 · Share', '2 · Partilhar'), tx('Sur téléphone, « Partager l’image et le texte » ouvre le menu : choisissez WhatsApp, un groupe ou un statut.', 'On a phone, “Share the image and text” opens the menu: pick WhatsApp, a group or a status.', 'No telemóvel, «Partilhar a imagem e o texto» abre o menu: escolha o WhatsApp, um grupo ou um estado.')],
            [tx('3 · C’est envoyé', '3 · Sent', '3 · Enviado'), tx('L’image part avec la parole, l’explication, la question pour le groupe et le lien du site.', 'The image goes with the word, the explanation, the question for the group and the website link.', 'A imagem segue com a palavra, a explicação, a pergunta para o grupo e a ligação do site.')],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-night/10 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">{t}</p>
              <p className="mt-1 text-sm text-ink/70">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={tx('Filtrer', 'Filter', 'Filtrar')}>
          {filters.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}
              className={cn('rounded-full border px-4 py-1.5 text-sm font-semibold transition', filter === f.key ? 'border-night bg-night text-gold' : 'border-night/10 bg-white text-ink/70 hover:border-gold')}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-12">
          {list.map((w) => <WordCard key={w.n} word={w} label={kindLabel(w.kind)} />)}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-night p-7 text-white">
          <div className="max-w-xl">
            <p className="font-display text-2xl text-gold">{tx('Lire tout le récit', 'Read the full story', 'Ler todo o relato')}</p>
            <p className="mt-1 text-sm text-white/70">{tx('Ces paroles viennent du livre « Mon Appel » : le récit complet est à lire et à télécharger sur le site.', 'These words come from the book “Mon Appel”: the full story can be read and downloaded on the site.', 'Estas palavras vêm do livro «Mon Appel»: o relato completo pode ser lido e descarregado no site.')}</p>
          </div>
          <ButtonLink to="/appel-du-prophete" variant="gold">{tx('L’appel du Prophète', 'The Prophet’s calling', 'O chamamento do Profeta')}</ButtonLink>
        </div>
      </section>
    </>
  );
}

function WordCard({ word: w, label }: { word: ProphetWord; label: string }) {
  const { tx, locale } = useI18n();
  const toast = useOptionalToast();
  const [format, setFormat] = useState<Format>('yt');
  const ref = useRef<HTMLElement>(null);
  const native = canShareFiles();

  const who = w.kind === 'parole' || w.kind === 'priere'
    ? `Prophète ${PROPHET_NAME}`
    : w.kind === 'psaume' ? `Lu par le Prophète ${PROPHET_NAME}` : `Reçue par le Prophète ${PROPHET_NAME}`;
  const pageUrl = absoluteShareUrl(`/paroles-du-prophete#${anchorOf(w)}`);
  const caption = [
    `*${label.toUpperCase()}* (${w.n}/20)`,
    '',
    `_« ${w.text} »_`,
    '',
    `✍️ ${who}`,
    `📖 ${w.source}`,
    '',
    w.explanation,
    '',
    `💬 ${w.question}`,
    '',
    pageUrl,
    '',
    shareSignature(locale),
  ].join('\n');
  const fileName = `Parole-du-Prophete-${pad(w.n)}${format === 'wa' ? '-plein-ecran' : ''}.jpg`;
  const src = imageOf(w, format);

  // L'image est préparée quand la fiche approche de l'écran, pour un partage immédiat.
  useEffect(() => {
    if (!native || !ref.current) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) void prepareFile(src, fileName);
    }, { rootMargin: '400px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [native, src, fileName]);

  const shareWithImage = async () => {
    const file = await prepareFile(src, fileName);
    try {
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: caption, title: label });
        return;
      }
      await navigator.share({ text: caption, title: label });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank', 'noopener');
    }
  };

  const copy = async () => {
    const ok = await copyText(caption);
    toast?.notify(ok ? tx('Texte copié : collez-le en légende de l’image.', 'Text copied: paste it as the image caption.', 'Texto copiado: cole-o como legenda da imagem.') : tx('Impossible de copier le texte.', 'Could not copy the text.', 'Não foi possível copiar o texto.'), ok ? 'success' : 'error');
  };

  return (
    <article ref={ref} id={anchorOf(w)} className="grid scroll-mt-32 gap-6 border-t border-night/10 pt-10 lg:grid-cols-[1.15fr_1fr]">
      <div className="min-w-0">
        <div className="flex justify-center overflow-hidden rounded-2xl bg-night shadow-lift">
          <img src={src} alt={`${label} ${w.n} : « ${w.text} »`} loading="lazy" className={format === 'wa' ? 'max-h-[560px] w-auto' : 'h-auto w-full'} />
        </div>
        <div className="mt-3 inline-flex rounded-full border border-night/10 bg-white p-1" role="group" aria-label={tx('Format de l’image', 'Image format', 'Formato da imagem')}>
          {(['yt', 'wa'] as Format[]).map((f) => (
            <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)}
              className={cn('rounded-full px-3 py-1 text-xs font-semibold transition', format === f ? 'bg-night text-gold' : 'text-ink/60 hover:text-night')}>
              {f === 'yt' ? tx('Format large', 'Wide', 'Largo') : tx('Plein écran WhatsApp', 'WhatsApp full screen', 'Ecrã inteiro WhatsApp')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-display text-3xl font-semibold text-gold-700">{pad(w.n)}</span>
          <span className="rounded-full bg-gold/90 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-night">{label}</span>
        </div>
        <blockquote className="font-display text-2xl italic leading-snug text-night">« {w.text} »</blockquote>
        <p className="text-sm text-gold-700">{who} · <span className="italic text-ink/60">{w.source}</span></p>
        <p className="leading-relaxed text-ink/80">{w.explanation}</p>
        <p className="flex gap-2 text-sm text-ink/70"><MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden /><span><b className="text-night">{tx('Question pour le groupe :', 'Question for the group:', 'Pergunta para o grupo:')}</b> {w.question}</span></p>

        <div className="mt-2 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#128C7E]">{tx('Partager cette parole', 'Share this word', 'Partilhar esta palavra')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {native ? (
              <button type="button" onClick={shareWithImage} className={cn(buttonClass('primary'), '!bg-[#25D366] !text-[#05210f] hover:!bg-[#1ebe5a]')}>
                <Share2 className="h-4 w-4" aria-hidden />{tx('Partager l’image et le texte', 'Share the image and text', 'Partilhar a imagem e o texto')}
              </button>
            ) : (
              <a href={`https://wa.me/?text=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" className={cn(buttonClass('primary'), '!bg-[#25D366] !text-[#05210f] hover:!bg-[#1ebe5a]')}>
                <Share2 className="h-4 w-4" aria-hidden />{tx('Envoyer le texte sur WhatsApp', 'Send the text on WhatsApp', 'Enviar o texto no WhatsApp')}
              </a>
            )}
            <a href={src} download={fileName} className={buttonClass('outline')}><Download className="h-4 w-4" aria-hidden />{tx('Télécharger l’image', 'Download the image', 'Descarregar a imagem')}</a>
            <button type="button" onClick={copy} className={buttonClass('ghost')}><Link2 className="h-4 w-4" aria-hidden />{tx('Copier le texte', 'Copy the text', 'Copiar o texto')}</button>
          </div>
          {!native && <p className="mt-2 text-xs text-ink/60">{tx('Sur ordinateur, téléchargez l’image puis joignez-la dans WhatsApp. Sur téléphone, le bouton envoie directement l’image avec le texte.', 'On a computer, download the image then attach it in WhatsApp. On a phone, the button sends the image with the text directly.', 'No computador, descarregue a imagem e anexe-a no WhatsApp. No telemóvel, o botão envia diretamente a imagem com o texto.')}</p>}
          <ShareButtons url={`/paroles-du-prophete#${anchorOf(w)}`} title={`${label} (${w.n}/20)`} text={`« ${w.text} »`} image={src} size="sm" className="mt-3" />
        </div>
      </div>
    </article>
  );
}
