import { useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Nombre d'auditeurs qui écoutent l'émission en direct en ce moment (Supabase Realtime « Presence »).
 * Un auditeur compte quand il écoute réellement le direct (`listening`) ; l'animateur et les
 * curieux ouvrent le canal sans être comptés. Plusieurs onglets du même navigateur ne comptent qu'une fois.
 */
const CHANNEL = 'radio:auditeurs';

function listenerId(): string {
  try {
    const k = 'kcc.visitor-id';
    const id = localStorage.getItem(k) || crypto.randomUUID();
    localStorage.setItem(k, id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function useRadioListeners(listening: boolean, enabled = true): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!supabase || !enabled) return;
    const client = supabase;
    const ch: RealtimeChannel = client.channel(CHANNEL, { config: { presence: { key: listening ? listenerId() : `obs-${Math.random().toString(36).slice(2)}` } } });
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState() as Record<string, { listening?: boolean }[]>;
      setCount(Object.values(st).filter((v) => v.some((m) => m.listening)).length);
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED' && listening) void ch.track({ listening: true, since: new Date().toISOString() });
    });
    return () => { void client.removeChannel(ch); };
  }, [listening, enabled]);
  return count;
}
