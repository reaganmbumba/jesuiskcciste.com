import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Download, ExternalLink, Globe2, Home, Search, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { StatCard } from '@/components/ui/Misc';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/features/administration/CrudTable';
import {
  CENSUS_AGES, CENSUS_STATUSES, censusErrorText, censusParishCsv, censusPeopleCsv, deleteCensus, groupKey, listCensus, summarize, type CensusHousehold, type CountRow,
} from '@/features/census/census';
import { useAsync } from '@/hooks/useAsync';
import { downloadCsv } from '@/utils/csv';
import { formatDate } from '@/utils/format';

const nf = (n: number) => n.toLocaleString('fr-FR');
const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
const today = () => new Date().toISOString().slice(0, 10);

/** Barre horizontale simple : libellé, barre proportionnelle, valeur. */
function Bars({ rows, max, total, tone = 'bg-gold-500' }: { rows: { label: string; value: number; hint?: string }[]; max?: number; total: number; tone?: string }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto]">
          <span className="truncate text-ink/80" title={r.label}>{r.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-mist"><span className={`block h-full rounded-full ${tone}`} style={{ width: `${(r.value / top) * 100}%` }} /></span>
          <span className="w-24 text-right tabular-nums text-night"><b>{nf(r.value)}</b> <span className="text-xs text-ink/50">{pct(r.value, total)} %</span>{r.hint && <span className="block text-[11px] text-ink/45">{r.hint}</span>}</span>
        </li>
      ))}
    </ul>
  );
}

/** Pyramide des âges : hommes à gauche, femmes à droite. */
function Pyramid({ data }: { data: ReturnType<typeof summarize>['ageSex'] }) {
  const max = Math.max(1, ...CENSUS_AGES.flatMap((a) => [data[a.key].M, data[a.key].F]));
  return (
    <div>
      <div className="mb-2 grid grid-cols-[1fr_6.5rem_1fr] text-xs font-semibold uppercase tracking-wide text-ink/50"><span className="text-right">Hommes</span><span /><span>Femmes</span></div>
      <ul className="space-y-1.5">
        {[...CENSUS_AGES].reverse().map((a) => (
          <li key={a.key} className="grid grid-cols-[1fr_6.5rem_1fr] items-center gap-2 text-sm">
            <span className="flex items-center justify-end gap-2"><span className="tabular-nums text-ink/70">{data[a.key].M}</span><span className="h-4 rounded-l-md bg-night-600" style={{ width: `${(data[a.key].M / max) * 100}%` }} /></span>
            <span className="text-center text-xs text-ink/70">{a.label.fr}</span>
            <span className="flex items-center gap-2"><span className="h-4 rounded-r-md bg-gold-500" style={{ width: `${(data[a.key].F / max) * 100}%` }} /><span className="tabular-nums text-ink/70">{data[a.key].F}</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminCensus() {
  const { notify } = useToast();
  const list = useAsync(() => listCensus(), []);
  const [tab, setTab] = useState<'chiffres' | 'paroisses' | 'fiches'>('chiffres');
  const [country, setCountry] = useState('');
  const [parish, setParish] = useState('');
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<CensusHousehold | null>(null);
  const [deleting, setDeleting] = useState(false);

  const all = useMemo(() => list.data ?? [], [list.data]);
  const countries = useMemo(() => summarize(all).byCountry, [all]);
  const inCountry = useMemo(() => (country ? all.filter((r) => groupKey(r.country) === country) : all), [all, country]);
  const parishes = useMemo(() => summarize(inCountry).byParish, [inCountry]);
  const rows = useMemo(() => {
    const byParish = parish ? inCountry.filter((r) => `${groupKey(r.country)}|${groupKey(r.parish)}` === parish) : inCountry;
    const s = groupKey(q);
    return s ? byParish.filter((r) => groupKey([r.contactName, r.matricule, r.city, r.section, r.recordedBy, ...r.people.map((p) => p.name)].filter(Boolean).join(' ')).includes(s)) : byParish;
  }, [inCountry, parish, q]);
  const sum = useMemo(() => summarize(rows), [rows]);

  if (list.error) return <ErrorState error={new Error(censusErrorText(list.error))} onRetry={list.reload} />;
  if (list.loading) return <Skeleton className="h-64 rounded-2xl" />;

  const t = sum.totals;
  const scope = parish ? parishes.find((p) => `${groupKey(p.country)}|${groupKey(p.label)}` === parish)?.label : country ? countries.find((c) => groupKey(c.label) === country)?.label : 'tous les pays';

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try { await deleteCensus(toDelete.id); notify('Fiche supprimée.'); setToDelete(null); await list.reload(); } catch (e) { notify(censusErrorText(e), 'error'); } finally { setDeleting(false); }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 font-display text-2xl font-semibold text-night">Recensement des fidèles</h1>
          <p className="text-sm text-ink/60">Fiches envoyées depuis <Link to="/recensement" target="_blank" className="inline-flex items-center gap-1 font-semibold text-gold-700">/recensement <ExternalLink className="h-3.5 w-3.5" aria-hidden /></Link>. Le public ne voit que le total.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" icon={<Download className="h-4 w-4" />} disabled={!rows.length} onClick={() => downloadCsv(`recensement-paroisses-${today()}.csv`, censusParishCsv(rows))}>Excel par paroisse</Button>
          <Button size="sm" variant="outline" icon={<Download className="h-4 w-4" />} disabled={!rows.length} onClick={() => downloadCsv(`recensement-personnes-${today()}.csv`, censusPeopleCsv(rows))}>Excel par personne</Button>
        </div>
      </div>

      <Card className="mb-5"><CardBody className="grid gap-3 sm:grid-cols-3">
        <Select aria-label="Pays" value={country} onChange={(e) => { setCountry(e.target.value); setParish(''); }}>
          <option value="">Tous les pays ({countries.length})</option>
          {countries.map((c) => <option key={c.label} value={groupKey(c.label)}>{c.label} ({nf(c.people)})</option>)}
        </Select>
        <Select aria-label="Paroisse" value={parish} onChange={(e) => setParish(e.target.value)}>
          <option value="">Toutes les paroisses ({parishes.length})</option>
          {parishes.map((p) => <option key={`${p.country}|${p.label}`} value={`${groupKey(p.country)}|${groupKey(p.label)}`}>{p.label} ({nf(p.people)})</option>)}
        </Select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
          <Input aria-label="Rechercher" placeholder="Nom, matricule, ville…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        </div>
      </CardBody></Card>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label={`Personnes (${scope})`} value={nf(t.people)} />
        <StatCard icon={<Home className="h-5 w-5" />} label="Foyers" value={nf(t.households)} hint={t.households ? <span className="text-xs text-ink/50">{(t.people / t.households).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} / foyer</span> : undefined} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Paroisses" value={nf(t.parishes)} />
        <StatCard icon={<Globe2 className="h-5 w-5" />} label="Pays" value={nf(t.countries)} />
      </div>

      <Tabs tabs={[{ key: 'chiffres', label: 'Âges, sexe, pays' }, { key: 'paroisses', label: `Par paroisse (${sum.byParish.length})` }, { key: 'fiches', label: `Fiches (${rows.length})` }]} value={tab} onChange={setTab} />

      {!all.length ? (
        <EmptyState title="Aucune fiche pour le moment" description="Partagez le lien jesuiskcciste.com/recensement dans les groupes WhatsApp des paroisses." />
      ) : tab === 'chiffres' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card><CardBody>
            <h2 className="mb-4 font-display text-lg font-semibold text-night">Pyramide des âges</h2>
            <Pyramid data={sum.ageSex} />
            <p className="mt-4 text-sm text-ink/70">Hommes : <b>{nf(sum.bySex.M)}</b> ({pct(sum.bySex.M, t.people)} %) · Femmes : <b>{nf(sum.bySex.F)}</b> ({pct(sum.bySex.F, t.people)} %)</p>
          </CardBody></Card>
          <Card><CardBody>
            <h2 className="mb-4 font-display text-lg font-semibold text-night">Par tranche d’âge</h2>
            <Bars total={t.people} rows={CENSUS_AGES.map((a) => ({ label: a.label.fr, value: sum.byAge[a.key] }))} />
            <h2 className="mb-4 mt-6 font-display text-lg font-semibold text-night">Situation dans l’Église</h2>
            <Bars total={t.people} tone="bg-night-600" rows={[...CENSUS_STATUSES.map((s) => ({ label: s.label.fr, value: sum.byStatus[s.key] })), { label: 'Non précisé', value: sum.byStatus.inconnu }]} />
          </CardBody></Card>
          <Card className="lg:col-span-2"><CardBody>
            <h2 className="mb-4 font-display text-lg font-semibold text-night">Par pays</h2>
            <Bars total={t.people} rows={sum.byCountry.map((c: CountRow) => ({ label: c.label, value: c.people, hint: `${c.households} foyer${c.households > 1 ? 's' : ''}` }))} />
          </CardBody></Card>
        </div>
      ) : tab === 'paroisses' ? (
        <Card><CardBody className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead><tr className="border-b border-night/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="py-2 pr-3">Paroisse</th><th className="py-2 pr-3">Pays</th><th className="py-2 pr-3 text-right">Personnes</th><th className="py-2 pr-3 text-right">Foyers</th>
              <th className="py-2 pr-3 text-right">Hommes</th><th className="py-2 pr-3 text-right">Femmes</th><th className="py-2 pr-3 text-right">0-17 ans</th><th className="py-2 text-right">18 ans et +</th>
            </tr></thead>
            <tbody>
              {sum.byParish.map((p) => {
                const s = summarize(rows.filter((r) => groupKey(r.country) === groupKey(p.country) && groupKey(r.parish) === groupKey(p.label)));
                const young = s.byAge['0-5'] + s.byAge['6-12'] + s.byAge['13-17'];
                return (
                  <tr key={`${p.country}|${p.label}`} className="border-b border-night/[0.05]">
                    <td className="py-2 pr-3 font-medium text-night">{p.label}</td><td className="py-2 pr-3 text-ink/70">{p.country}</td>
                    <td className="py-2 pr-3 text-right font-semibold tabular-nums">{nf(p.people)}</td><td className="py-2 pr-3 text-right tabular-nums">{nf(p.households)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{nf(s.bySex.M)}</td><td className="py-2 pr-3 text-right tabular-nums">{nf(s.bySex.F)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{nf(young)}</td><td className="py-2 text-right tabular-nums">{nf(s.totals.people - young)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody></Card>
      ) : (
        <ol className="space-y-3">
          {rows.slice(0, 300).map((r) => (
            <li key={r.id} className="rounded-2xl border border-night/[0.08] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm"><span className="font-semibold text-night">{r.contactName || 'Foyer sans nom'}</span>{r.matricule && <span className="text-ink/55"> · {r.matricule}</span>}<span className="text-gold-700"> · {r.parish}</span></p>
                <p className="text-xs text-ink/50">{formatDate(r.createdAt)}</p>
              </div>
              <p className="mt-1 text-xs text-ink/60">{[r.section, r.city, r.province, r.country].filter(Boolean).join(', ')}{r.recordedBy && ` · recensé par ${r.recordedBy}`}</p>
              <p className="mt-2 text-sm text-ink/80">
                <b>{r.people.length} personne{r.people.length > 1 ? 's' : ''}</b> : {r.people.map((p) => [p.name, p.sex === 'M' ? 'H' : 'F', CENSUS_AGES.find((a) => a.key === p.age)?.label.fr].filter(Boolean).join(' ')).join(' ; ')}
              </p>
              <div className="mt-3"><Button size="sm" variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => setToDelete(r)}>Supprimer (doublon, erreur)</Button></div>
            </li>
          ))}
          {rows.length > 300 && <p className="text-sm text-ink/60">Seules les 300 premières fiches s’affichent : filtrez par pays ou paroisse, ou téléchargez le fichier Excel.</p>}
          {!rows.length && <EmptyState title="Aucune fiche pour ce filtre" />}
        </ol>
      )}

      <ConfirmDialog open={!!toDelete} title="Supprimer cette fiche ?" danger loading={deleting} confirmLabel="Supprimer" onCancel={() => setToDelete(null)} onConfirm={() => void remove()}
        message={toDelete && <>La fiche de <b>{toDelete.contactName || 'ce foyer'}</b> ({toDelete.people.length} personne{toDelete.people.length > 1 ? 's' : ''}, {toDelete.parish}) sera retirée des totaux. Cette action est définitive.</>} />
    </>
  );
}
