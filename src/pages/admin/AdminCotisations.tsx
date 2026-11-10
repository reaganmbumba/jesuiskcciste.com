import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarCheck, CheckCircle2, Clock, Download, HandCoins, History, MessageCircle, Plus, Search, Send, Settings2, Trash2, Wallet } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar, StatCard } from '@/components/ui/Misc';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { env, isDemoMode } from '@/config/env';
import { useAuth } from '@/features/auth/AuthContext';
import {
  COTISATION_METHODS, CotisationsNotInstalled, DEFAULT_SETTINGS, addMonths, cotisationsCsv, deleteCotisation, formatMoney, getCotisationSettings,
  groupReminder, listCotisations, memberSituation, monthKey, monthLabel, monthsBetween, personalReminder, recordCotisations, saveCotisationSettings, sumByCurrency,
  type Cotisation, type CotisationCurrency, type CotisationMethod, type CotisationSettings, type MemberSituation,
} from '@/features/cotisations/cotisations';
import { demoMatricule, listMatricules, matriculeInitials, waNumber, type MatriculeRow } from '@/features/news/readerAccess';
import { useAsync } from '@/hooks/useAsync';
import { membersRepo, writeAudit } from '@/services';
import type { Profile } from '@/types';
import { cn } from '@/utils/format';

const fullName = (m: Pick<Profile, 'lastName' | 'middleName' | 'firstName'>) => [m.lastName, m.middleName, m.firstName].filter(Boolean).join(' ');
const errMsg = (e: unknown) => (e instanceof Error ? e.message : (e as { message?: string })?.message ?? String(e));
type Filter = 'tous' | 'retard' | 'ajour';
type Line = { m: Profile; mat: string | null; pays: Cotisation[]; s: MemberSituation };

/** Pastilles des 6 derniers mois : vert payé, rouge dû et non payé, gris pas encore dû. */
function MonthChips({ line, months }: { line: Line; months: string[] }) {
  const paid = new Set(line.s.paid);
  return (
    <div className="flex flex-wrap gap-1">
      {months.map((k) => {
        const due = k >= line.s.firstDue;
        const ok = paid.has(k);
        return <span key={k} title={`${monthLabel(k)} : ${ok ? 'payé' : due ? 'non payé' : 'pas dû'}`}
          className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-semibold', ok ? 'bg-emerald-100 text-emerald-800' : due ? 'bg-red-100 text-red-700' : 'bg-mist text-ink/40')}>{monthLabel(k, 'fr', true)}</span>;
      })}
    </div>
  );
}

export default function AdminCotisations() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('tous');
  const [paying, setPaying] = useState<Profile | 'choisir' | null>(null);
  const [history, setHistory] = useState<Line | null>(null);
  const [editSettings, setEditSettings] = useState(false);
  const [toDelete, setToDelete] = useState<Cotisation | null>(null);

  const { data, loading, error, reload } = useAsync(async () => {
    const [members, settings, pays, mats] = await Promise.all([
      membersRepo.all(), getCotisationSettings(), listCotisations(), listMatricules([]).catch(() => ({} as Record<string, MatriculeRow>)),
    ]);
    return { members: members.filter((m) => m.status === 'active' || m.status === 'pending').sort((a, b) => fullName(a).localeCompare(fullName(b), 'fr')), settings, pays, mats };
  }, []);

  const lines: Line[] = useMemo(() => (data?.members ?? []).map((m) => {
    const pays = data!.pays.filter((c) => c.userId === m.id);
    return { m, mat: data!.mats[m.id]?.matricule ?? (isDemoMode ? demoMatricule(m.id, matriculeInitials(m)) : null), pays, s: memberSituation(pays, data!.settings, m.createdAt) };
  }), [data]);

  if (loading) return <PageLoader />;
  if (error instanceof CotisationsNotInstalled) return <NotInstalled />;
  if (error || !data) return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Chargement impossible : {errMsg(error)}</p>;

  const { settings } = data;
  const site = env.siteUrl || 'https://www.jesuiskcciste.com';
  const current = monthKey();
  const last6 = monthsBetween(addMonths(current, -5), current);
  const late = lines.filter((l) => !l.s.upToDate);
  const ok = lines.filter((l) => l.s.upToDate);
  const thisMonth = data.pays.filter((c) => c.month === current);
  const t = q.trim().toLowerCase();
  const shown = lines
    .filter((l) => filter === 'tous' || (filter === 'retard' ? !l.s.upToDate : l.s.upToDate))
    .filter((l) => !t || `${fullName(l.m)} ${l.mat ?? ''} ${l.m.city} ${l.m.phone ?? ''}`.toLowerCase().includes(t));

  const sendGroupReminder = () => {
    const list = [...late].sort((a, b) => b.s.unpaid.length - a.s.unpaid.length).map((l) => ({ name: fullName(l.m), months: l.s.unpaid.length }));
    window.open(`https://wa.me/?text=${encodeURIComponent(groupReminder(list, settings, site))}`, '_blank', 'noopener');
  };
  const sendPersonal = (l: Line) => window.open(`https://wa.me/${waNumber(l.m.phone) ?? ''}?text=${encodeURIComponent(personalReminder(l.m.firstName, l.s, settings, site))}`, '_blank', 'noopener');
  const exportCsv = () => {
    const byId = new Map(lines.map((l) => [l.m.id, l]));
    const rows = [...data.pays].sort((a, b) => a.month.localeCompare(b.month)).map((c) => ({ name: byId.get(c.userId) ? fullName(byId.get(c.userId)!.m) : 'Ancien membre', matricule: byId.get(c.userId)?.mat ?? null, c }));
    const url = URL.createObjectURL(new Blob([cotisationsCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `cotisations-kcc-${current}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCotisation(toDelete.id);
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'cotisation.delete', 'member_cotisations', toDelete.id);
      notify(`Paiement de ${monthLabel(toDelete.month)} supprimé.`);
      setToDelete(null); setHistory(null); reload();
    } catch (e) { notify(`Échec : ${errMsg(e)}`, 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-night">Cotisations mensuelles</h1>
          <p className="text-sm text-ink/60">{formatMoney(settings.monthlyAmount, settings.currency)} par mois depuis {monthLabel(settings.startMonth).toLowerCase()}{settings.purpose ? ` · ${settings.purpose}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPaying('choisir')} icon={<Plus className="h-4 w-4" />}>Enregistrer un paiement</Button>
          <Button variant="outline" onClick={() => setEditSettings(true)} icon={<Settings2 className="h-4 w-4" />}>Réglages</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="À jour" value={ok.length} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="En retard" value={late.length} />
        <StatCard icon={<CalendarCheck className="h-5 w-5" />} label={`Payé pour ${monthLabel(current).toLowerCase()}`} value={`${thisMonth.length} / ${lines.length}`} hint={sumByCurrency(thisMonth)} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Total encaissé" value={sumByCurrency(data.pays)} />
      </div>

      {late.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
          <p className="flex-1 text-sm text-night"><b>{late.length} membre{late.length > 1 ? 's' : ''} en retard</b>, {formatMoney(late.reduce((s, l) => s + l.s.owed, 0), settings.currency)} au total. Le rappel au groupe donne seulement les noms et le nombre de mois.</p>
          <Button size="sm" variant="outline" onClick={sendGroupReminder} icon={<Send className="h-4 w-4" />}>Rappel au groupe</Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom ou un matricule…" className="pl-10" />
        </div>
        <div className="flex gap-2">
          {([['tous', `Tous (${lines.length})`], ['retard', `En retard (${late.length})`], ['ajour', `À jour (${ok.length})`]] as const).map(([k, label]) => (
            <Button key={k} size="sm" variant={filter === k ? 'primary' : 'outline'} onClick={() => setFilter(k)}>{label}</Button>
          ))}
          <Button size="sm" variant="ghost" onClick={exportCsv} icon={<Download className="h-4 w-4" />} aria-label="Télécharger pour Excel">Excel</Button>
        </div>
      </div>

      <ul className="space-y-3">
        {shown.map((l) => (
          <li key={l.m.id}><Card><CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Avatar person={l.m} url={l.m.avatarUrl} size={48} />
              <div className="min-w-0 space-y-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-night">{fullName(l.m)}
                  {l.s.upToDate ? <Badge tone="green">À jour</Badge> : <Badge tone="red">{l.s.unpaid.length} mois dû{l.s.unpaid.length > 1 ? 's' : ''} · {formatMoney(l.s.owed, settings.currency)}</Badge>}
                </p>
                <p className="text-xs text-ink/55">{l.mat && <span className="mr-2 font-mono font-semibold text-night">{l.mat}</span>}{l.s.coveredUntil ? `Payé jusqu’à ${monthLabel(l.s.coveredUntil).toLowerCase()}` : 'Aucun paiement'}</p>
                <MonthChips line={l} months={last6} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setPaying(l.m)} icon={<HandCoins className="h-4 w-4" />}>Paiement</Button>
              <Button size="sm" variant="outline" onClick={() => setHistory(l)} icon={<History className="h-4 w-4" />}>Historique</Button>
              {!l.s.upToDate && <Button size="sm" variant="outline" onClick={() => sendPersonal(l)} icon={<MessageCircle className="h-4 w-4" />}>Rappel</Button>}
            </div>
          </CardBody></Card></li>
        ))}
        {!shown.length && <li className="py-10 text-center text-sm text-ink/55">Aucun membre trouvé.</li>}
      </ul>

      {paying && <PaymentModal members={lines} preset={paying === 'choisir' ? null : paying} settings={settings}
        onClose={() => setPaying(null)}
        onSaved={(msg) => { notify(msg); setPaying(null); reload(); }} />}

      {history && (
        <Modal open onClose={() => setHistory(null)} title={`Historique — ${fullName(history.m)}`} size="lg">
          <div className="space-y-4">
            <p className="text-sm text-ink/65">{history.mat && <span className="mr-2 font-mono font-semibold text-night">{history.mat}</span>}Dû depuis {monthLabel(history.s.firstDue).toLowerCase()} · {history.s.upToDate ? 'à jour' : `non payé : ${history.s.unpaid.map((m) => monthLabel(m)).join(', ')}`}</p>
            {history.pays.length ? (
              <div className="overflow-x-auto"><table className="table-kcc"><thead><tr><th>Mois</th><th className="text-right">Montant</th><th>Moyen</th><th>Payé le</th><th /></tr></thead>
                <tbody>{history.pays.map((c) => (
                  <tr key={c.id}><td className="font-medium">{monthLabel(c.month)}</td><td className="text-right tabular-nums">{formatMoney(c.amount, c.currency)}</td>
                    <td>{COTISATION_METHODS[c.method]}{c.reference ? <span className="block text-xs text-ink/50">{c.reference}</span> : null}{c.note ? <span className="block text-xs text-ink/50">{c.note}</span> : null}</td>
                    <td>{new Date(c.paidOn).toLocaleDateString('fr-FR')}</td>
                    <td><button type="button" onClick={() => setToDelete(c)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label={`Supprimer ${monthLabel(c.month)}`}><Trash2 className="h-4 w-4" /></button></td></tr>
                ))}</tbody></table></div>
            ) : <p className="py-6 text-center text-sm text-ink/55">Aucun paiement enregistré.</p>}
          </div>
        </Modal>
      )}

      {editSettings && <SettingsModal settings={settings} onClose={() => setEditSettings(false)} onSaved={() => { notify('Réglages enregistrés.'); setEditSettings(false); reload(); }} />}

      <ConfirmDialog open={!!toDelete} danger title="Supprimer ce paiement ?" confirmLabel="Supprimer"
        message={toDelete ? `${monthLabel(toDelete.month)} — ${formatMoney(toDelete.amount, toDelete.currency)}. À faire seulement en cas d’erreur de saisie.` : ''}
        onConfirm={() => void confirmDelete()} onCancel={() => setToDelete(null)} />
    </div>
  );
}

function PaymentModal({ members, preset, settings, onClose, onSaved }: { members: Line[]; preset: Profile | null; settings: CotisationSettings; onClose: () => void; onSaved: (msg: string) => void }) {
  const { profile } = useAuth();
  const [who, setWho] = useState<string>(preset?.id ?? '');
  const [find, setFind] = useState('');
  const line = members.find((l) => l.m.id === who) ?? null;
  // Mois proposés : les mois dus non payés, puis le mois en cours et les 11 suivants (paiement d'avance).
  const options = useMemo(() => {
    if (!line) return [];
    const paid = new Set(line.s.paid);
    const future = monthsBetween(monthKey(), addMonths(monthKey(), 11));
    return [...new Set([...line.s.unpaid, ...future])].filter((m) => !paid.has(m)).sort();
  }, [line]);
  const [months, setMonths] = useState<string[]>(() => {
    const l = members.find((x) => x.m.id === preset?.id);
    return l ? [l.s.unpaid[0] ?? options[0] ?? monthKey()].filter(Boolean) : [];
  });
  const [amount, setAmount] = useState(String(settings.monthlyAmount));
  const [currency, setCurrency] = useState<CotisationCurrency>(settings.currency);
  const [method, setMethod] = useState<CotisationMethod>('orange_money');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const pick = (id: string) => {
    setWho(id);
    const l = members.find((x) => x.m.id === id);
    const paid = new Set(l?.s.paid ?? []);
    const first = l?.s.unpaid[0] ?? monthsBetween(monthKey(), addMonths(monthKey(), 11)).find((m) => !paid.has(m));
    setMonths(first ? [first] : []);
  };
  const toggle = (m: string) => setMonths((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m].sort()));
  const n = Number(amount.replace(',', '.'));
  const t = find.trim().toLowerCase();
  const matches = t ? members.filter((l) => `${fullName(l.m)} ${l.mat ?? ''}`.toLowerCase().includes(t)).slice(0, 6) : [];

  const save = async () => {
    if (!line) { setErr('Choisissez le membre.'); return; }
    setSaving(true); setErr('');
    try {
      await recordCotisations({ userId: line.m.id, months, amount: n, currency, method, reference, note, paidOn });
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', 'cotisation.record', 'member_cotisations', line.m.id);
      onSaved(`${fullName(line.m)} : ${months.length} mois enregistré${months.length > 1 ? 's' : ''} (${formatMoney(n * months.length, currency)}).`);
    } catch (e) { setErr(errMsg(e)); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="Enregistrer une cotisation" size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => void save()} loading={saving} disabled={!line || !months.length || !(n > 0)}>Enregistrer{months.length > 0 && n > 0 ? ` · ${formatMoney(n * months.length, currency)}` : ''}</Button></>}>
      <div className="space-y-5">
        {line ? (
          <div className="flex items-center gap-3 rounded-2xl bg-mist p-3">
            <Avatar person={line.m} url={line.m.avatarUrl} size={40} />
            <div className="min-w-0 flex-1"><p className="font-semibold text-night">{fullName(line.m)}</p><p className="font-mono text-xs text-ink/60">{line.mat ?? 'Matricule inconnu'}</p></div>
            {!preset && <Button size="sm" variant="ghost" onClick={() => { setWho(''); setMonths([]); }}>Changer</Button>}
          </div>
        ) : (
          <Field label="Membre (nom ou matricule)" required>
            {(p) => <div className="space-y-2">
              <Input {...p} value={find} onChange={(e) => setFind(e.target.value)} placeholder="Ex. KCC-MMR-00256 ou Mbumba" autoComplete="off" />
              {matches.length > 0 && <ul className="divide-y divide-night/5 rounded-2xl border border-night/10 bg-white">
                {matches.map((l) => <li key={l.m.id}><button type="button" onClick={() => pick(l.m.id)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-gold-50">
                  <span className="font-medium text-night">{fullName(l.m)}</span><span className="font-mono text-xs text-ink/55">{l.mat}</span></button></li>)}
              </ul>}
              {t && !matches.length && <p className="text-sm text-ink/55">Aucun membre trouvé.</p>}
            </div>}
          </Field>
        )}

        {line && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Mois payés <span className="text-red-600">*</span></p>
            <div className="flex flex-wrap gap-2">
              {options.map((m) => {
                const on = months.includes(m);
                const overdue = line.s.unpaid.includes(m);
                return <button key={m} type="button" onClick={() => toggle(m)} aria-pressed={on}
                  className={cn('rounded-xl border px-3 py-1.5 text-sm font-medium transition', on ? 'border-night bg-night text-white' : overdue ? 'border-red-300 bg-red-50 text-red-700 hover:border-red-500' : 'border-night/12 bg-white text-ink hover:border-gold')}>{monthLabel(m)}</button>;
              })}
            </div>
            <p className="text-xs text-ink/55">En rouge : mois en retard. Vous pouvez cocher plusieurs mois (paiement de retard ou d’avance).</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Montant par mois" required>{(p) => <Input {...p} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />}</Field>
          <Field label="Monnaie">{(p) => <Select {...p} value={currency} onChange={(e) => setCurrency(e.target.value as CotisationCurrency)}><option value="USD">Dollars ($)</option><option value="CDF">Francs congolais (FC)</option></Select>}</Field>
          <Field label="Moyen de paiement">{(p) => <Select {...p} value={method} onChange={(e) => setMethod(e.target.value as CotisationMethod)}>{Object.entries(COTISATION_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>}</Field>
          <Field label="Payé le">{(p) => <Input {...p} type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />}</Field>
          <Field label="Référence (facultatif)" className="sm:col-span-2">{(p) => <Input {...p} value={reference} maxLength={100} onChange={(e) => setReference(e.target.value)} placeholder="N° de transaction Orange Money / M-Pesa" />}</Field>
        </div>
        <Field label="Note (facultatif)">{(p) => <Textarea {...p} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} className="min-h-[70px]" placeholder="Ex. payé par son frère, reçu de main à main…" />}</Field>
        {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      </div>
    </Modal>
  );
}

function SettingsModal({ settings, onClose, onSaved }: { settings: CotisationSettings; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState(String(settings.monthlyAmount));
  const [currency, setCurrency] = useState<CotisationCurrency>(settings.currency);
  const [start, setStart] = useState(settings.startMonth);
  const [purpose, setPurpose] = useState(settings.purpose);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const save = async () => {
    const n = Number(amount.replace(',', '.'));
    if (!(n >= 0) || !/^\d{4}-\d{2}$/.test(start)) { setErr('Vérifiez le montant et le mois de départ.'); return; }
    setSaving(true); setErr('');
    try { await saveCotisationSettings({ monthlyAmount: n, currency, startMonth: start, purpose }); onSaved(); } catch (e) { setErr(errMsg(e)); } finally { setSaving(false); }
  };
  return (
    <Modal open onClose={onClose} title="Réglages des cotisations"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => void save()} loading={saving}>Enregistrer</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Montant mensuel" required>{(p) => <Input {...p} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />}</Field>
          <Field label="Monnaie">{(p) => <Select {...p} value={currency} onChange={(e) => setCurrency(e.target.value as CotisationCurrency)}><option value="USD">Dollars ($)</option><option value="CDF">Francs congolais (FC)</option></Select>}</Field>
        </div>
        <Field label="Premier mois de cotisation" hint="Un membre inscrit plus tard ne doit qu’à partir de son mois d’inscription.">{(p) => <Input {...p} type="month" value={start} onChange={(e) => setStart(e.target.value)} />}</Field>
        <Field label="À quoi sert la cotisation">{(p) => <Input {...p} value={purpose} maxLength={300} onChange={(e) => setPurpose(e.target.value)} />}</Field>
        {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      </div>
    </Modal>
  );
}

function NotInstalled() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-night">Cotisations mensuelles</h1>
      <Card><CardBody className="space-y-2 text-sm text-ink/75">
        <p className="font-semibold text-night">Une dernière étape : installer les cotisations dans la base de données.</p>
        <p>Ouvrez Supabase → SQL Editor, collez le fichier « cotisations-a-coller-dans-supabase.sql » puis touchez « Run ». Rechargez ensuite cette page.</p>
        <p className="text-xs text-ink/50">Réglages par défaut : {formatMoney(DEFAULT_SETTINGS.monthlyAmount, DEFAULT_SETTINGS.currency)} par mois, modifiables ici ensuite.</p>
      </CardBody></Card>
    </div>
  );
}
