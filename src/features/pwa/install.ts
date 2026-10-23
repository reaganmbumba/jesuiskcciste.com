import { useEffect, useState } from 'react';

/** Événement « beforeinstallprompt » (Chrome, Edge, Samsung Internet). */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Enregistre le service worker et garde la proposition d'installation pour le bouton « Installer ». */
export function setupInstall() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as InstallPromptEvent; notify(); });
  window.addEventListener('appinstalled', () => { deferred = null; notify(); });
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* site utilisable sans */ }); });
  }
}

export type Platform = 'ios' | 'android' | 'desktop';

export function detectPlatform(ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''): Platform {
  // Les iPad récents se présentent comme un Mac : on les reconnaît à l'écran tactile.
  const touchMac = /Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || touchMac) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

/** Vrai quand le site est ouvert comme application (icône de l'écran d'accueil ou appli Android). */
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true || /KCCisteApp|wv\)/.test(navigator.userAgent);
}

export function useInstallApp() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  const platform = detectPlatform();
  return {
    platform,
    installed: isStandalone(),
    /** Le navigateur peut installer d'un seul clic (Android, ordinateur). */
    canPrompt: deferred !== null,
    async install() {
      if (!deferred) return false;
      const e = deferred;
      await e.prompt();
      const { outcome } = await e.userChoice;
      deferred = null;
      notify();
      return outcome === 'accepted';
    },
  };
}
