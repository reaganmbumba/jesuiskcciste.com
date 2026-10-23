import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useInstallApp } from './install';

const KEY = 'kcc-install-banner-hidden';
const DAYS = 30;

function hiddenRecently() {
  try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < DAYS * 86_400_000; } catch { return false; }
}

/** Petite barre « Installer l'application » sur téléphone, refermable (cachée 30 jours). */
export function InstallBanner() {
  const { tx } = useI18n();
  const { platform, installed, canPrompt, install } = useInstallApp();
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(true);
  useEffect(() => { setHidden(hiddenRecently()); }, []);

  const mobile = platform !== 'desktop';
  if (hidden || installed || !mobile || pathname === '/application') return null;
  // Android sans proposition du navigateur (Firefox, etc.) : la page d'aide explique quoi faire.
  if (platform === 'android' && !canPrompt) return null;

  const close = () => { setHidden(true); try { localStorage.setItem(KEY, String(Date.now())); } catch { /* navigation privée */ } };
  const label = tx('Installer l’application', 'Install the app', 'Instalar a aplicação');
  return (
    <div className="bg-night text-white">
      <div className="container-page flex items-center gap-3 py-2">
        <img src="/icon-192.png" alt="" className="h-8 w-8 shrink-0 rounded-lg" />
        <p className="min-w-0 flex-1 text-xs leading-snug text-white/85">
          <span className="font-semibold text-white">JE SUIS KCCiste</span> {tx('sur votre écran d’accueil, comme une application.', 'on your home screen, like an app.', 'no seu ecrã inicial, como uma aplicação.')}
        </p>
        {canPrompt ? (
          <button onClick={() => { void install(); }} className="shrink-0 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-night">{label}</button>
        ) : (
          <Link to="/application" className="shrink-0 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-night">{label}</Link>
        )}
        <button onClick={close} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10" aria-label={tx('Fermer', 'Close', 'Fechar')}><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

