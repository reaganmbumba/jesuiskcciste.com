import { useSyncExternalStore } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Nombre de visiteurs présents sur le site en ce moment (connectés ou non),
 * grâce à la « Presence » de Supabase Realtime : aucune table ni SQL n'est nécessaire.
 *
 * Un seul canal est ouvert par onglet, partagé par tous les composants qui affichent le compteur.
 * Chaque navigateur a un identifiant aléatoire (localStorage) : plusieurs onglets ouverts
 * par la même personne ne comptent qu'une fois.
 * Renvoie null tant que le nombre est inconnu (mode démonstration, connexion en cours ou impossible).
 */

const CHANNEL = 'site:en-ligne';
const KEY = 'kcc.visitor-id';

let count: number | null = null;
let channel: RealtimeChannel | null = null;
const listeners = new Set<() => void>();

function visitorId(): string {
  const fresh = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    const known = localStorage.getItem(KEY);
    if (known) return known;
    const id = fresh();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return fresh();
  }
}

function emit(next: number | null) {
  if (next === count) return;
  count = next;
  listeners.forEach((l) => l());
}

function start() {
  if (channel || !supabase) return;
  const client = supabase;
  const ch = client.channel(CHANNEL, { config: { presence: { key: visitorId() } } });
  channel = ch;
  ch.on('presence', { event: 'sync' }, () => emit(Object.keys(ch.presenceState()).length))
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') void ch.track({ since: new Date().toISOString() });
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') emit(null);
    });
}

function stop() {
  if (!channel || !supabase) return;
  void supabase.removeChannel(channel);
  channel = null;
  emit(null);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
    // Petit délai : lors d'un changement de page, le compteur du nouvel écran reprend le même canal.
    setTimeout(() => { if (listeners.size === 0) stop(); }, 3000);
  };
}

export function useOnlineCount(): number | null {
  return useSyncExternalStore(subscribe, () => count, () => null);
}
