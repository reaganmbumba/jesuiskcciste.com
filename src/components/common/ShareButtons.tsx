import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { useOptionalToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { PUBLIC_SITE_URL, WHATSAPP_GROUP_URL } from '@/config/site';
import type { Locale } from '@/i18n';

/* Logos des réseaux (tracés simplifiés, couleur héritée). */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Adresse absolue à partager : `url` relative ou absolue, sinon la page courante. */
export function absoluteShareUrl(url?: string): string {
  const here = typeof window !== 'undefined' ? window.location.href : 'https://jesuiskcciste.com/';
  if (!url) return here;
  try {
    return new URL(url, here).toString();
  } catch {
    return here;
  }
}

export function facebookShareUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** Pied de chaque partage : nom du site, son adresse et le groupe WhatsApp. */
export function shareSignature(locale: Locale = 'fr') {
  const lines = {
    fr: [`Partagé depuis le site Je suis KCCiste : ${PUBLIC_SITE_URL}`, `Rejoignez le groupe WhatsApp Je suis KCCiste : ${WHATSAPP_GROUP_URL}`],
    en: [`Shared from the Je suis KCCiste website: ${PUBLIC_SITE_URL}`, `Join the Je suis KCCiste WhatsApp group: ${WHATSAPP_GROUP_URL}`],
    pt: [`Partilhado a partir do site Je suis KCCiste: ${PUBLIC_SITE_URL}`, `Junte-se ao grupo WhatsApp Je suis KCCiste: ${WHATSAPP_GROUP_URL}`],
  }[locale];
  return lines.join('\n');
}

const excerpt = (s: string, max = 180) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

/** Message complet : titre, court extrait, lien du contenu, puis la signature du site. */
export function shareMessage(url: string, title?: string, locale: Locale = 'fr', text?: string) {
  const head = [title, text && text !== title ? excerpt(text) : undefined].filter(Boolean);
  return [...head, url, '', shareSignature(locale)].join('\n');
}

export function whatsappShareUrl(url: string, title?: string, locale: Locale = 'fr', text?: string) {
  return `https://wa.me/?text=${encodeURIComponent(shareMessage(url, title, locale, text))}`;
}

/** Vrai sur téléphone ou tablette, où la feuille de partage du système propose Instagram. */
function canUseNativeShare() {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Repli pour les navigateurs sans presse-papiers asynchrone.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

interface ShareButtonsProps {
  /** Lien à partager (relatif ou absolu). Par défaut : la page courante. */
  url?: string;
  /** Titre repris dans le message WhatsApp et la feuille de partage. */
  title?: string;
  /** Texte d'accompagnement pour la feuille de partage du téléphone. */
  text?: string;
  /** `dark` : sur fond bleu nuit (en-têtes) ; `light` : sur fond clair (cartes). */
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md';
  /** Affiche « Partager » devant les boutons. */
  showLabel?: boolean;
  className?: string;
}

/** Boutons de partage Facebook, WhatsApp, Instagram et copie du lien. */
export function ShareButtons({ url, title, text, tone = 'light', size = 'md', showLabel = true, className }: ShareButtonsProps) {
  const { tx, locale } = useI18n();
  const toast = useOptionalToast();
  const [copied, setCopied] = useState(false);
  const href = () => absoluteShareUrl(url);

  const message = () => shareMessage(href(), title, locale, text);
  // Copie le message complet (titre, lien, nom du site et groupe WhatsApp).
  const copyLink = async (notice: string) => {
    const ok = await copyText(message());
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    toast?.notify(ok ? notice : tx('Impossible de copier le lien.', 'Could not copy the link.', 'Não foi possível copiar a ligação.'), ok ? 'success' : 'error');
  };

  // Instagram n'a pas d'adresse de partage web : feuille de partage du téléphone, sinon copie du lien.
  const shareInstagram = async () => {
    if (canUseNativeShare()) {
      try {
        await navigator.share({ title, text: message() });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    await copyLink(tx(
      'Message copié (lien, site Je suis KCCiste et groupe WhatsApp). Ouvrez Instagram et collez-le dans une story, un message ou une légende.',
      'Message copied (link, Je suis KCCiste website and WhatsApp group). Open Instagram and paste it into a story, a message or a caption.',
      'Mensagem copiada (ligação, site Je suis KCCiste e grupo WhatsApp). Abra o Instagram e cole-a numa story, numa mensagem ou numa legenda.',
    ));
  };

  const shareNative = async () => {
    try {
      await navigator.share({ title, text: message() });
    } catch {
      /* partage annulé */
    }
  };

  const dark = tone === 'dark';
  const btn = cn(
    'inline-grid shrink-0 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
    size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
    dark ? 'border border-white/20 text-white hover:border-gold hover:bg-white/10 hover:text-gold-200' : 'border border-night/10 bg-white text-night hover:border-gold hover:text-gold-700',
  );
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]';
  const shareOn = (network: string) => `${tx('Partager sur', 'Share on', 'Partilhar no')} ${network}`;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group" aria-label={tx('Partager', 'Share', 'Partilhar')}>
      {showLabel && <span className={cn('mr-1 text-xs font-semibold uppercase tracking-[0.14em]', dark ? 'text-gold-300' : 'text-gold-700')}>{tx('Partager', 'Share', 'Partilhar')}</span>}
      <a className={btn} href={facebookShareUrl(href())} target="_blank" rel="noopener noreferrer" aria-label={shareOn('Facebook')} title="Facebook"
        onClick={(e) => {
          e.currentTarget.href = facebookShareUrl(href());
          // Facebook ne permet pas de préremplir le texte : on copie le message pour qu'il soit collé dans la publication.
          void copyText(message()).then((ok) => ok && toast?.notify(tx(
            'Message copié : collez-le dans votre publication Facebook pour citer le site Je suis KCCiste et le groupe WhatsApp.',
            'Message copied: paste it into your Facebook post to mention the Je suis KCCiste website and WhatsApp group.',
            'Mensagem copiada: cole-a na sua publicação do Facebook para citar o site Je suis KCCiste e o grupo WhatsApp.',
          ), 'info'));
        }}>
        <FacebookIcon className={icon} />
      </a>
      <a className={btn} href={whatsappShareUrl(href(), title, locale, text)} target="_blank" rel="noopener noreferrer" aria-label={shareOn('WhatsApp')} title="WhatsApp"
        onClick={(e) => { e.currentTarget.href = whatsappShareUrl(href(), title, locale, text); }}>
        <WhatsAppIcon className={icon} />
      </a>
      <button type="button" className={btn} onClick={shareInstagram} aria-label={shareOn('Instagram')} title="Instagram">
        <InstagramIcon className={icon} />
      </button>
      <button type="button" className={btn} onClick={() => copyLink(tx('Lien copié, avec le site Je suis KCCiste et le groupe WhatsApp.', 'Link copied, with the Je suis KCCiste website and WhatsApp group.', 'Ligação copiada, com o site Je suis KCCiste e o grupo WhatsApp.'))} aria-label={tx('Copier le lien', 'Copy link', 'Copiar a ligação')} title={tx('Copier le lien', 'Copy link', 'Copiar a ligação')}>
        {copied ? <Check className={icon} /> : <Link2 className={icon} />}
      </button>
      {canUseNativeShare() && (
        <button type="button" className={btn} onClick={shareNative} aria-label={tx('Plus d’options de partage', 'More sharing options', 'Mais opções de partilha')} title={tx('Plus', 'More', 'Mais')}>
          <Share2 className={icon} />
        </button>
      )}
    </div>
  );
}
