import { supabase } from '@/lib/supabase';

/** Dédicaces et intentions de prière écrites par les auditeurs, lues à l'antenne par l'animateur. */
export type DedicaceKind = 'dedicace' | 'priere';
export interface Dedicace {
  id: string;
  kind: DedicaceKind;
  authorName: string;
  place: string | null;
  recipient: string | null;
  message: string;
  status: 'nouveau' | 'lu' | 'ecarte';
  createdAt: string;
}

function visitor(): string {
  try {
    const k = 'kcc.visitor-id';
    const id = localStorage.getItem(k) || (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(k, id);
    return id;
  } catch { return ''; }
}

export async function sendDedicace(d: { kind: DedicaceKind; authorName: string; place: string; recipient: string; message: string }) {
  if (!supabase) throw new Error('La radio n’est pas connectée.');
  const { error } = await supabase.rpc('radio_dedicace_envoyer', {
    p: { kind: d.kind, author_name: d.authorName, place: d.place, recipient: d.recipient, message: d.message, visitor: visitor() },
  });
  if (error) throw new Error(error.message);
}

type Row = { id: string; kind: DedicaceKind; author_name: string; place: string | null; recipient: string | null; message: string; status: Dedicace['status']; created_at: string };

/** Pour le Studio : les messages du jour (nouveaux d'abord). */
export async function listDedicaces(): Promise<Dedicace[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('radio_dedicaces').select('id,kind,author_name,place,recipient,message,status,created_at')
    .gt('created_at', new Date(Date.now() - 2 * 86_400_000).toISOString()).neq('status', 'ecarte').order('created_at', { ascending: true }).limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((r) => ({ id: r.id, kind: r.kind, authorName: r.author_name, place: r.place, recipient: r.recipient, message: r.message, status: r.status, createdAt: r.created_at }));
}

export async function markDedicace(id: string, status: 'lu' | 'ecarte' | 'nouveau') {
  const { error } = await supabase!.from('radio_dedicaces').update({ status, read_at: status === 'lu' ? new Date().toISOString() : null }).eq('id', id);
  if (error) throw new Error(error.message);
}
