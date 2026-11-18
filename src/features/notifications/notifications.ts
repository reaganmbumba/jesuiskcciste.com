/**
 * Notifications sur le téléphone (Web Push) côté site.
 *
 * La personne touche « Recevoir les notifications » : le navigateur demande la
 * permission, crée un abonnement (adresse propre à ce téléphone) et le site
 * l'envoie au Worker Cloudflare (/api/notifications/…), qui l'enregistre avec les
 * sujets choisis. Le service worker (public/sw.js) affiche ensuite les messages.
 */
import { useCallback, useEffect, useState } from 'react';
import { VAPID_PUBLIC_KEY, TOPICS, type Topic } from './config';
import { detectPlatform, isAndroidApp, isStandalone } from '@/features/pwa/install';
import type { Locale } from '@/i18n';

export { TOPICS, type Topic };

const API = '/api/notifications';
const TOPICS_KEY = 'kcc.notifications.sujets';
const LANG_KEY = 'kcc.notifications.langue';

/**
 * ok          : le bouton peut fonctionner ici
 * app         : application Google Play (sa fenêtre web ne reçoit pas les notifications)
 * ios-install : iPhone/iPad, il faut d'abord ajouter le site à l'écran d'accueil
 * unsupported : navigateur trop ancien ou navigation privée
 */
export type Support = 'ok' | 'app' | 'ios-install' | 'unsupported';

export function pushSupport(): Support {
  if (typeof window === 'undefined') return 'unsupported';
  if (isAndroidApp()) return 'app';
  const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (detectPlatform() === 'ios' && !isStandalone()) return 'ios-install';
  return ok ? 'ok' : 'unsupported';
}

export function permission(): NotificationPermission | 'unsupported' {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

function keyBytes(b64: string): Uint8Array {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

/** Le service worker du site (enregistré au chargement en production, ici au besoin). */
async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (pushSupport() !== 'ok') return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    return (await reg?.pushManager.getSubscription()) ?? null;
  } catch { return null; }
}

export function savedTopics(): Topic[] {
  try {
    const v = JSON.parse(localStorage.getItem(TOPICS_KEY) ?? 'null');
    if (Array.isArray(v)) return TOPICS.filter((t) => v.includes(t));
  } catch { /* stockage indisponible */ }
  return [...TOPICS];
}

function remember(topics: Topic[], lang: Locale) {
  try { localStorage.setItem(TOPICS_KEY, JSON.stringify(topics)); localStorage.setItem(LANG_KEY, lang); } catch { /* sans importance */ }
}

async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(res.status === 503 ? 'not-ready' : String(data.error ?? res.status));
  return data;
}

async function save(sub: PushSubscription, topics: Topic[], lang: Locale, welcome: boolean) {
  await post('abonnement', { subscription: sub.toJSON(), topics, lang, welcome });
  remember(topics, lang);
}

/** Demande la permission, abonne ce téléphone et enregistre les sujets. */
export async function enableNotifications(topics: Topic[], lang: Locale): Promise<PushSubscription> {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error(perm === 'denied' ? 'denied' : 'dismissed');
  const reg = await registration();
  let sub = await reg.pushManager.getSubscription();
  // Un ancien abonnement fait avec une autre clé ne pourrait rien recevoir : on le remplace.
  const key = sub?.options?.applicationServerKey;
  if (sub && key && new Uint8Array(key).join() !== keyBytes(VAPID_PUBLIC_KEY).join()) { await sub.unsubscribe().catch(() => {}); sub = null; }
  sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) as BufferSource });
  await save(sub, topics, lang, true);
  return sub;
}

export async function updateTopics(sub: PushSubscription, topics: Topic[], lang: Locale) {
  await save(sub, topics, lang, false);
}

export async function disableNotifications(sub: PushSubscription) {
  await post('desabonnement', { endpoint: sub.endpoint }).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}

export async function sendTestNotification(sub: PushSubscription): Promise<boolean> {
  const r = await post('essai', { endpoint: sub.endpoint });
  return r.ok === true;
}

/** État de l'abonnement de ce téléphone, pour les boutons. */
export function useNotifications(locale: Locale) {
  const [support] = useState(pushSupport);
  const [sub, setSub] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(support === 'ok');
  const [perm, setPerm] = useState(permission);
  const [topics, setTopics] = useState<Topic[]>(savedTopics);

  useEffect(() => {
    let alive = true;
    void currentSubscription().then((s) => { if (alive) { setSub(s); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  // La langue du site a changé : les prochains messages arriveront dans la nouvelle langue.
  useEffect(() => {
    if (!sub || perm !== 'granted') return;
    let last: string | null = null;
    try { last = localStorage.getItem(LANG_KEY); } catch { /* rien */ }
    if (last && last !== locale) void updateTopics(sub, savedTopics(), locale).catch(() => {});
  }, [sub, locale, perm]);

  const enable = useCallback(async (chosen: Topic[] = topics) => {
    try {
      const s = await enableNotifications(chosen, locale);
      setSub(s); setTopics(chosen);
      return s;
    } finally { setPerm(permission()); }
  }, [locale, topics]);

  const disable = useCallback(async () => {
    if (sub) await disableNotifications(sub);
    setSub(null);
  }, [sub]);

  const changeTopics = useCallback(async (next: Topic[]) => {
    setTopics(next);
    if (sub) await updateTopics(sub, next, locale);
    else remember(next, locale);
  }, [sub, locale]);

  return { support, subscribed: !!sub, sub, loading, permission: perm, topics, enable, disable, changeTopics };
}
