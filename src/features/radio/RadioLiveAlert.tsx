import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Radio, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useRadio } from './RadioContext';
import { fetchRadioSettings, radioSettingsOf, type RadioSettings } from './radio';
import { pendingRadioAlert, playAlertChime, radioAlertMessage, speakAlert, type RadioAlert } from './radioAlert';

const STORE = 'kcc-radio-alertes';
const CHECK_MS = 15_000;
const FETCH_MS = 60_000;

const memory = new Set<string>();
function seenKeys(): Set<string> {
  try { for (const k of JSON.parse(localStorage.getItem(STORE) || '[]') as string[]) memory.add(k); } catch { /* stockage bloqué */ }
  return memory;
}
function markSeen(key: string) {
  memory.add(key);
  try { localStorage.setItem(STORE, JSON.stringify([...memory].slice(-60))); } catch { /* stockage bloqué */ }
}

/** Pages où l'alerte ne s'ouvre pas : l'antenne et le studio (l'animateur est à l'antenne). */
const QUIET = ['/radio/studio', '/radio/plateau', '/admin/radio'];

/**
 * Fenêtre « Paix, Reagan ! L'émission … commence » sur toutes les pages du site et de l'application,
 * avec sonnerie puis message dit à voix haute. « Écouter » ouvre la radio en plein écran.
 */
export function RadioLiveAlert() {
  const { locale } = useI18n();
  const lang = locale === 'en' || locale === 'pt' ? locale : 'fr';
  const { profile } = useAuth();
  const { settings } = useSiteSettings();
  const r = useRadio();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [remote, setRemote] = useState<RadioSettings | null>(null);
  const radio = useMemo(() => remote ?? radioSettingsOf(settings), [remote, settings]);
  const [alert, setAlert] = useState<RadioAlert | null>(null);
  const ctx = useRef({ radio, pathname, onLive: r.onLive, open: false });
  ctx.current = { radio, pathname, onLive: r.onLive, open: !!alert };

  // On relit le programme de la radio chaque minute (page visible).
  useEffect(() => {
    const load = () => { if (document.visibilityState === 'visible') void fetchRadioSettings().then((s) => { if (s) setRemote(s); }).catch(() => undefined); };
    load();
    const t = setInterval(load, FETCH_MS);
    document.addEventListener('visibilitychange', load);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', load); };
  }, []);

  // Toutes les 15 s, et dès que le programme est relu : une émission commence-t-elle ?
  const checkRef = useRef(() => {});
  useEffect(() => {
    const check = () => {
      const c = ctx.current;
      if (c.open || document.visibilityState !== 'visible' || QUIET.some((p) => c.pathname.startsWith(p))) return;
      const seen = seenKeys();
      const a = pendingRadioAlert(c.radio, Date.now(), (k) => seen.has(k));
      if (!a) return;
      markSeen(a.key);
      // Déjà à l'écoute du direct (ou sur la radio plein écran) : rien à annoncer.
      if (a.kind === 'start' && (c.onLive || c.pathname.startsWith('/radio/app'))) return;
      setAlert(a);
    };
    checkRef.current = check;
    check();
    const t = setInterval(check, CHECK_MS);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { checkRef.current(); }, [radio]);

  const msg = alert ? radioAlertMessage(alert, profile?.firstName, lang) : null;
  // Sonnerie d'abord, puis le message à voix haute.
  useEffect(() => {
    if (!msg) return;
    const wait = playAlertChime();
    const t = window.setTimeout(() => speakAlert(`${msg.greeting} ${msg.text}`, lang), wait);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert?.key]);

  if (!alert || !msg) return null;
  const close = () => { try { window.speechSynthesis?.cancel(); } catch { /* */ } setAlert(null); };
  const listen = () => {
    close();
    if (alert.kind === 'start' && !r.active) r.start('all');
    navigate('/radio/app');
  };
  const L = (fr: string, en: string, pt: string) => (lang === 'en' ? en : lang === 'pt' ? pt : fr);

  return (
    <div role="alertdialog" aria-live="assertive" aria-label={msg.greeting} className="fixed inset-x-0 bottom-0 z-[70] flex justify-center p-3 sm:bottom-4">
      <style>{`@keyframes kcc-ring{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(5deg)}}`}</style>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gold/40 bg-[#0b1224] text-white shadow-2xl">
        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600" style={{ animation: 'kcc-ring 1s ease-in-out 3' }}>
            <Radio className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">
              {alert.kind === 'start' ? L('🔴 En direct maintenant', '🔴 Live now', '🔴 Em direto agora') : L('⏰ Bientôt en direct', '⏰ Live soon', '⏰ Em direto em breve')}
            </p>
            <p className="mt-1 font-display text-lg font-semibold">{msg.greeting}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/85">{msg.text}</p>
          </div>
          <button type="button" onClick={close} aria-label={L('Fermer', 'Close', 'Fechar')} className="rounded-full p-1 text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2 border-t border-white/10 p-3">
          <button type="button" onClick={listen} className="flex-1 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-night">
            {alert.kind === 'start' ? L('🎧 Écouter maintenant', '🎧 Listen now', '🎧 Ouvir agora') : L('📻 Ouvrir la radio', '📻 Open the radio', '📻 Abrir a rádio')}
          </button>
          <button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:text-white">
            {L('Plus tard', 'Later', 'Mais tarde')}
          </button>
        </div>
      </div>
    </div>
  );
}
