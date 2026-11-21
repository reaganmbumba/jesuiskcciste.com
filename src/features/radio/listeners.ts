import { useEffect, useSyncExternalStore } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Nombre d'auditeurs de la radio en ce moment (Supabase Realtime « Presence », aucun SQL).
 *
 * - `total` : tous ceux qui écoutent la radio (chants, prédications, émission programmée ou direct).
 * - `live` : ceux qui écoutent l'émission en direct de l'antenne (compteur de l'animateur).
 *
 * Un seul canal par onglet, partagé par tous les compteurs de la page. Chaque navigateur a
 * un identifiant (localStorage) : plusieurs onglets de la même personne ne comptent qu'une fois.
 * Ceux qui regardent la page sans écouter (animateur, curieux) ouvrent le canal sans être comptés.
 * Le canal n'est ouvert que si l'on écoute ou si un compteur est affiché.
 */
const CHANNEL = 'radio:auditeurs';

export interface RadioListenerCounts { total: number; live: number }
type Meta = { listening?: boolean; live?: boolean };

let counts: RadioListenerCounts | null = null;
let channel: RealtimeChannel | null = null;
let subscribed = false;
let me: Meta = { listening: false, live: false };
let viewers = 0;
const listeners = new Set<() => void>();

function listenerId(): string {
  const fresh = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    const k = 'kcc.visitor-id';
    const id = localStorage.getItem(k) || fresh();
    localStorage.setItem(k, id);
    return id;
  } catch {
    return fresh();
  }
}

function emit(next: RadioListenerCounts | null) {
  if (next === counts || (next && counts && next.total === counts.total && next.live === counts.live)) return;
  counts = next;
  listeners.forEach((l) => l());
}

function sync(ch: RealtimeChannel) {
  const st = ch.presenceState() as Record<string, Meta[]>;
  const all = Object.values(st);
  emit({ total: all.filter((v) => v.some((m) => m.listening)).length, live: all.filter((v) => v.some((m) => m.listening && m.live)).length });
}

/** Annonce (ou retire) cet onglet comme auditeur. */
function publish() {
  if (!channel || !subscribed) return;
  if (me.listening) void channel.track({ listening: true, live: !!me.live, since: new Date().toISOString() });
  else void channel.untrack();
}

let stopTimer: ReturnType<typeof setTimeout> | undefined;
function update() {
  const needed = me.listening || viewers > 0;
  if (needed) {
    clearTimeout(stopTimer);
    if (!channel && supabase) {
      const ch = supabase.channel(CHANNEL, { config: { presence: { key: listenerId() } } });
      channel = ch;
      ch.on('presence', { event: 'sync' }, () => sync(ch)).subscribe((status) => {
        if (status === 'SUBSCRIBED') { subscribed = true; publish(); }
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { subscribed = false; emit(null); }
      });
    } else publish();
  } else if (channel) {
    // Petit délai : lors d'un changement de page, le compteur du nouvel écran reprend le même canal.
    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      if (me.listening || viewers > 0 || !channel || !supabase) return;
      void supabase.removeChannel(channel);
      channel = null;
      subscribed = false;
      emit(null);
    }, 3000);
  }
}

/** Appelé par la radio : cet onglet écoute (et écoute-t-il le direct de l'antenne ?). */
export function useRadioPresence(listening: boolean, live: boolean) {
  useEffect(() => {
    me = { listening, live: listening && live };
    update();
  }, [listening, live]);
  useEffect(() => () => { me = { listening: false, live: false }; update(); }, []);
}

function subscribe(l: () => void) {
  listeners.add(l);
  viewers += 1;
  update();
  return () => {
    listeners.delete(l);
    viewers -= 1;
    update();
  };
}

/** Compteurs d'auditeurs (null tant qu'inconnus : mode démonstration, connexion en cours ou impossible). */
export function useRadioListeners(): RadioListenerCounts | null {
  return useSyncExternalStore(subscribe, () => counts, () => null);
}
