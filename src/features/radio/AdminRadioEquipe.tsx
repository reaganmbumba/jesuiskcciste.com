import { useEffect, useState } from 'react';
import { UserMinus, Users } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

type Host = { id: string; name: string | null; since: string; lastLive: string | null; shows: number; hours: number };
const d = (iso: string | null) => (iso ? new Date(iso).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

/** Administration : les animateurs de la radio, leur activité, et le retrait de l'accès. */
export function AdminRadioEquipe() {
  const { notify } = useToast();
  const [hosts, setHosts] = useState<Host[] | null>(null);
  const load = () => { void supabase?.rpc('radio_equipe').then(({ data, error }) => { if (error) notify(error.message, 'error'); else setHosts((data ?? []) as Host[]); }); };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function remove(h: Host) {
    if (!window.confirm(`Retirer l’accès au Studio à ${h.name || 'cet animateur'} ? Il ne pourra plus passer à l’antenne. Son compte sur le site reste ouvert, et vous pourrez lui redonner l’accès avec un nouveau code.`)) return;
    const { error } = await supabase!.rpc('radio_animateur_retirer', { p_user: h.id });
    if (error) { notify(error.message, 'error'); return; }
    notify(`Accès retiré à ${h.name || 'l’animateur'}.`);
    load();
  }

  return (
    <Card>
      <CardBody>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-night"><Users className="h-5 w-5 text-gold-600" />Équipe des animateurs</h2>
        <p className="mt-1 text-sm text-ink/60">Les personnes qui ont l’accès au Studio, avec leur activité à l’antenne.</p>
        {!hosts ? <p className="mt-3 text-sm text-ink/50">Chargement…</p> : !hosts.length ? <p className="mt-3 text-sm text-ink/60">Aucun animateur pour l’instant : créez des codes d’invitation ci-dessus.</p> : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-ink/50"><th className="py-2 pr-3">Animateur</th><th className="pr-3">Depuis</th><th className="pr-3">Dernier direct</th><th className="pr-3">Directs</th><th className="pr-3">Heures</th><th /></tr></thead>
              <tbody>
                {hosts.map((h) => (
                  <tr key={h.id} className="border-t border-night/5">
                    <td className="py-2 pr-3 font-semibold text-night">{h.name || 'Sans nom'}</td>
                    <td className="pr-3 text-ink/70">{d(h.since)}</td>
                    <td className="pr-3 text-ink/70">{d(h.lastLive)}</td>
                    <td className="pr-3 tabular-nums">{h.shows}</td>
                    <td className="pr-3 tabular-nums">{h.hours}</td>
                    <td className="text-right"><button type="button" onClick={() => void remove(h)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"><UserMinus className="h-3.5 w-3.5" />Retirer l’accès</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
