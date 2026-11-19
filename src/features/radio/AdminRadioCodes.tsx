import { useEffect, useState } from 'react';
import { KeyRound, Plus } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

type Code = { code: string; note: string | null; utilise_par: string | null; utilise_le: string | null };
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const part = () => Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => ALPHA[n % ALPHA.length]).join('');

/**
 * Codes d'invitation des animateurs radio : la personne crée son compte sur le site,
 * puis saisit le code dans le Studio (/radio/studio). Elle n'obtient que l'antenne de la radio.
 */
export function AdminRadioCodes() {
  const { notify } = useToast();
  const [codes, setCodes] = useState<Code[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('radio_codes').select('code, note, utilise_par, utilise_le').order('cree_le');
    const list = (data ?? []) as Code[];
    setCodes(list);
    const ids = list.map((c) => c.utilise_par).filter(Boolean) as string[];
    if (ids.length) {
      const { data: p } = await supabase.from('profiles').select('id, first_name, last_name').in('id', ids);
      setNames(Object.fromEntries((p ?? []).map((x: { id: string; first_name: string; last_name: string }) => [x.id, `${x.first_name ?? ''} ${x.last_name ?? ''}`.trim()])));
    }
  };
  useEffect(() => { void load(); }, []);

  async function addFive() {
    setBusy(true);
    try {
      const rows = Array.from({ length: 5 }, (_, i) => ({ code: `KCC-${part()}-${part()}`, note: `Animateur ${codes.length + i + 1}` }));
      const { error } = await supabase!.from('radio_codes').insert(rows);
      if (error) throw error;
      await load();
      notify('5 nouveaux codes créés.');
    } catch (e) { notify(e instanceof Error ? e.message : 'Erreur', 'error'); } finally { setBusy(false); }
  }

  const free = codes.filter((c) => !c.utilise_par).length;
  return (
    <Card><CardBody className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-night"><KeyRound className="h-5 w-5 text-gold-600" />Codes des animateurs radio</h2>
      <p className="text-sm text-ink/65">Donnez un code à chaque animateur. Il crée son compte sur le site, ouvre l’appli <b>Studio Radio KCC</b> (ou jesuiskcciste.com/radio/studio), se connecte et saisit le code : il peut alors faire son émission, et rien d’autre sur le site. Un code ne sert qu’une fois. {free} code{free > 1 ? 's' : ''} libre{free > 1 ? 's' : ''}.</p>
      <div className="max-h-80 overflow-y-auto rounded-xl border border-night/10">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-night/[0.04] text-left text-xs text-ink/60"><tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Utilisé par</th></tr></thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.code} className="border-t border-night/[0.06]">
                <td className="px-3 py-1.5 font-mono">{c.code}</td>
                <td className="px-3 py-1.5">{c.utilise_par ? <>{names[c.utilise_par] || 'Compte'} <span className="text-xs text-ink/50">· {c.utilise_le ? new Date(c.utilise_le).toLocaleDateString('fr-FR') : ''}</span></> : <span className="text-emerald-700">Libre</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" size="sm" variant="outline" icon={<Plus className="h-4 w-4" />} loading={busy} onClick={addFive}>Créer 5 codes de plus</Button>
    </CardBody></Card>
  );
}
