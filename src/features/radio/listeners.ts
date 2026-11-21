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

/** Un lieu d'écoute : « Kinshasa », « Luanda (Angola) »… et le nombre d'auditeurs. */
export interface RadioPlace { name: string; n: number }
export interface RadioListenerCounts { total: number; live: number; places: RadioPlace[]; livePlaces: RadioPlace[] }
type Meta = { listening?: boolean; live?: boolean; city?: string; country?: string };

/** Ville et pays approximatifs (d'après le réseau, via le site) : demandés une fois par visite. */
let place: { city: string; country: string } | null = null;
let placeAsked = false;
function askPlace() {
  if (placeAsked || typeof fetch === 'undefined') return;
  placeAsked = true;
  try { const v = sessionStorage.getItem('kcc.lieu'); if (v) { place = JSON.parse(v); return; } } catch { /* rien */ }
  fetch('/api/ou').then((r) => (r.ok ? r.json() : null)).then((p: { city?: string; country?: string } | null) => {
    if (!p) return;
    place = { city: String(p.city || '').slice(0, 60), country: String(p.country || '').slice(0, 2) };
    try { sessionStorage.setItem('kcc.lieu', JSON.stringify(place)); } catch { /* rien */ }
    publish();
  }).catch(() => {});
}

const countryName = (code: string) => { try { return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) ?? code; } catch { return code; } };
/** Lieux triés du plus grand au plus petit ; pays du Congo (CD) sans le nom du pays. */
export function groupPlaces(metas: Meta[]): RadioPlace[] {
  const m = new Map<string, number>();
  metas.forEach((x) => {
    const c = (x.country || '').toUpperCase();
    const name = x.city ? (c && c !== 'CD' ? `${x.city} (${countryName(c)})` : x.city) : c ? countryName(c) : 'Lieu inconnu';
    m.set(name, (m.get(name) ?? 0) + 1);
  });
  return [...m].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
}

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
  if (next === counts || (next && counts && JSON.stringify(next) === JSON.stringify(counts))) return;
  counts = next;
  listeners.forEach((l) => l());
}

function sync(ch: RealtimeChannel) {
  const st = ch.presenceState() as Record<string, Meta[]>;
  const all = Object.values(st);
  const on = all.map((v) => v.find((m) => m.listening)).filter((m): m is Meta => !!m);
  const live = all.map((v) => v.find((m) => m.listening && m.live)).filter((m): m is Meta => !!m);
  emit({ total: on.length, live: live.length, places: groupPlaces(on), livePlaces: groupPlaces(live) });
}

/** Annonce (ou retire) cet onglet comme auditeur. */
function publish() {
  if (!channel || !subscribed) return;
  if (me.listening) void channel.track({ listening: true, live: !!me.live, since: new Date().toISOString(), ...(place ? { city: place.city, country: place.country } : {}) });
  else void channel.untrack();
}

let stopTimer: ReturnType<typeof setTimeout> | undefined;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
function update() {
  const needed = me.listening || viewers > 0;
  if (needed) {
    clearTimeout(stopTimer);
    if (!channel && supabase) {
      const ch = supabase.channel(CHANNEL, { config: { presence: { key: listenerId() } } });
      channel = ch;
      ch.on('presence', { event: 'sync' }, () => sync(ch)).subscribe((status) => {
        if (status === 'SUBSCRIBED') { subscribed = true; publish(); }
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          // Coupure (réseau faible, téléphone en veille) : on ferme ce canal et on se reconnecte un peu plus tard.
          subscribed = false;
          if (channel !== ch) return;
          channel = null;
          void supabase?.removeChannel(ch);
          clearTimeout(retryTimer);
          retryTimer = setTimeout(update, 5000);
        }
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

/** Statistiques : « j'écoute » toutes les 5 minutes (une ligne par auditeur et par tranche de 5 min). */
let pingTimer: ReturnType<typeof setInterval> | undefined;
function ping() {
  if (!supabase || !me.listening) return;
  void supabase.rpc('radio_ecoute_ping', { p_visitor: listenerId(), p_city: place?.city ?? null, p_country: place?.country ?? null, p_live: !!me.live }).then(() => {}, () => {});
}
function pinging(on: boolean) {
  clearInterval(pingTimer);
  pingTimer = undefined;
  if (!on) return;
  window.setTimeout(ping, 4000); // le temps de connaître la ville
  pingTimer = setInterval(ping, 4.5 * 60_000);
}

/** Appelé par la radio : cet onglet écoute (et écoute-t-il le direct de l'antenne ?). */
export function useRadioPresence(listening: boolean, live: boolean) {
  useEffect(() => {
    const was = me.listening;
    me = { listening, live: listening && live };
    if (listening) askPlace();
    if (listening !== was || listening) pinging(listening);
    update();
  }, [listening, live]);
  useEffect(() => () => { me = { listening: false, live: false }; pinging(false); update(); }, []);
}

if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !subscribed) { clearTimeout(retryTimer); update(); } });

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
