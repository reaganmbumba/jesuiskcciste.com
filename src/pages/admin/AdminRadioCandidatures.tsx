import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ChevronDown, Copy, Download, ExternalLink, FileSpreadsheet, Headphones, Inbox, MessageCircle, Mic, Search, Send, Trash2, UserCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { StatCard } from '@/components/ui/Misc';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { whatsappShareUrl } from '@/components/common/ShareButtons';
import { PUBLIC_SITE_URL } from '@/config/site';
import {
  DAYS, FREQUENCIES, MODES, SHOW_TYPES, STATUSES, candidaturesErrorText, candidaturesTable, daysLabel, deleteCandidature, labelOf, listCandidatures,
  showTypeLabel, slotLabel, statusOf, updateCandidature, whatsappTo, type Candidature, type CandidatureStatus,
} from '@/features/radio/candidatures';
import { useAsync } from '@/hooks/useAsync';
import { downloadCsv } from '@/utils/csv';
import { downloadXlsx } from '@/utils/xlsx';
import { formatDate } from '@/utils/format';

const FORM_URL = `${PUBLIC_SITE_URL}/radio/animateurs`;
const today = () => new Date().toISOString().slice(0, 10);
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const yn = (b: boolean | null | undefined) => (b === true ? 'Oui' : b === false ? 'Non' : '—');

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-ink">{value === null || value === undefined || value === '' ? '—' : value}</dd>
    </div>
  );
}

function Row({ r, onChanged, onDelete }: { r: Candidature; onChanged: (r: Candidature) => void; onDelete: (r: Candidature) => void }) {
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(r.adminNote ?? '');
  const [saving, setSaving] = useState(false);
  const st = statusOf(r.status);

  const save = async (patch: { status?: CandidatureStatus; adminNote?: string }) => {
    setSaving(true);
    try {
      await updateCandidature(r.id, patch);
      onChanged({ ...r, ...(patch.status ? { status: patch.status } : {}), ...(patch.adminNote !== undefined ? { adminNote: patch.adminNote.trim() || null } : {}) });
      notify('Enregistré.');
    } catch (e) { notify(candidaturesErrorText(e), 'error'); } finally { setSaving(false); }
  };

  const hello = `Bonjour ${r.fullName}, ici le service de programmation de Radio KCC. Merci pour votre candidature ${r.reference} (émission « ${r.showTitle} »).`;
  return (
    <li className="overflow-hidden rounded-2xl border border-night/[0.08] bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-start gap-4 p-4 text-left hover:bg-mist/40 sm:p-5">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-night text-gold-300 sm:flex"><Mic className="h-5 w-5" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={st.tone}>{st.label}</Badge>
            <span className="text-xs font-semibold tabular-nums text-ink/50">{r.reference}</span>
            <span className="text-xs text-ink/45">· {formatDate(r.createdAt)}</span>
          </div>
          <p className="mt-1.5 font-display text-lg font-semibold leading-tight text-night">{r.showTitle}</p>
          <p className="mt-0.5 text-sm text-ink/70"><b className="text-ink">{r.fullName}</b>{r.roleTitle && ` · ${r.roleTitle}`}{r.city && ` · ${r.city}`}</p>
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/60">
            <span>{showTypeLabel(r)}</span>
            <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" aria-hidden />{daysLabel(r.days)}{slotLabel(r) && ` · ${slotLabel(r)}`} · {r.duration} min</span>
            <span>{labelOf(MODES, r.mode)}</span>
          </p>
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-ink/40 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open && (
        <div className="space-y-5 border-t border-night/[0.06] bg-mist/30 p-4 sm:p-5">
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Info label="Téléphone / WhatsApp" value={r.phone} />
            <Info label="E-mail" value={r.email} />
            <Info label="Ville" value={r.city} />
            <Info label="Type d’émission" value={showTypeLabel(r)} />
            <Info label="Public cible" value={r.audience} />
            <Info label="Fréquence" value={labelOf(FREQUENCIES, r.frequency)} />
            <Info label="Jours" value={daysLabel(r.days)} />
            <Info label="Horaire souhaité" value={slotLabel(r)} />
            <Info label="Durée" value={`${r.duration} minutes`} />
            <Info label="Autre créneau accepté" value={yn(r.otherSlot)} />
            <Info label="Mode d’intervention" value={labelOf(MODES, r.mode)} />
            <Info label="Internet stable" value={yn(r.hasInternet)} />
            <Info label="Smartphone ou ordinateur" value={yn(r.hasDevice)} />
            <Info label="Micro ou casque" value={yn(r.hasMicrophone)} />
            <Info label="Expérience radio" value={yn(r.hasExperience)} />
            <Info label="Respecte le calendrier" value={yn(r.respectsCalendar)} />
            <Info label="Disponible pour les tests" value={yn(r.availableForTests)} />
          </dl>
          {r.showDescription && <div><p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Présentation et objectifs</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{r.showDescription}</p></div>}
          {r.notes && <div><p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Observations</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{r.notes}</p></div>}

          <div className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-night/[0.06] sm:grid-cols-[14rem_minmax(0,1fr)]">
            <label className="text-sm font-medium text-ink">Suivi
              <Select className="mt-1.5" value={r.status} disabled={saving} onChange={(e) => void save({ status: e.target.value as CandidatureStatus })}>
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </Select>
            </label>
            <label className="text-sm font-medium text-ink">Note du service (visible seulement ici)
              <Textarea className="mt-1.5 min-h-[70px]" rows={2} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} placeholder="Ex. Test prévu jeudi 18 h, créneau du samedi 7 h…" />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button size="sm" disabled={saving || note === (r.adminNote ?? '')} onClick={() => void save({ adminNote: note })}>Enregistrer la note</Button>
              <a href={whatsappTo(r.phone, hello)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1FA855] px-4 py-2 text-sm font-semibold text-white hover:bg-[#178a45]"><MessageCircle className="h-4 w-4" />Écrire sur WhatsApp</a>
              <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 rounded-full border border-night/15 px-4 py-2 text-sm font-semibold text-night hover:bg-mist">Appeler</a>
              <Button size="sm" variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(r)}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

/** Service de programmation : candidatures des animateurs d'émissions radio. */
export default function AdminRadioCandidatures() {
  const { notify } = useToast();
  const list = useAsync(() => listCandidatures(), []);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [day, setDay] = useState('');
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<Candidature | null>(null);
  const [deleting, setDeleting] = useState(false);

  const all = useMemo(() => list.data ?? [], [list.data]);
  const rows = useMemo(() => {
    const s = norm(q.trim());
    return all.filter((r) => (!status || r.status === status) && (!type || r.showType === type) && (!day || r.days.includes(day as Candidature['days'][number]))
      && (!s || norm([r.reference, r.fullName, r.phone, r.email, r.city, r.roleTitle, r.showTitle, r.audience].filter(Boolean).join(' ')).includes(s)));
  }, [all, status, type, day, q]);

  if (list.error) return <ErrorState error={new Error(candidaturesErrorText(list.error))} onRetry={list.reload} />;
  if (list.loading) return <Skeleton className="h-64 rounded-2xl" />;

  const count = (k: CandidatureStatus) => all.filter((r) => r.status === k).length;
  const changed = (r: Candidature) => list.setData(all.map((x) => (x.id === r.id ? r : x)));
  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try { await deleteCandidature(toDelete.id); list.setData(all.filter((x) => x.id !== toDelete.id)); notify('Candidature supprimée.'); setToDelete(null); } catch (e) { notify(candidaturesErrorText(e), 'error'); } finally { setDeleting(false); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(FORM_URL); notify('Lien copié.'); } catch { notify(FORM_URL); }
  };
  const share = whatsappShareUrl(FORM_URL, 'Radio KCC : formulaire des animateurs d’émissions', 'fr',
    'Vous souhaitez présenter une émission sur Radio KCC, depuis chez vous ou en émission préenregistrée ? Remplissez le formulaire d’identification et de disponibilité des animateurs.');
  const table = () => candidaturesTable(rows);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 font-display text-2xl font-semibold text-night">Radio : candidatures des animateurs</h1>
          <p className="text-sm text-ink/60">Réponses au formulaire <Link to="/radio/animateurs" target="_blank" className="inline-flex items-center gap-1 font-semibold text-gold-700">/radio/animateurs <ExternalLink className="h-3.5 w-3.5" aria-hidden /></Link>. Seuls les administrateurs voient cette page.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" icon={<FileSpreadsheet className="h-4 w-4" />} disabled={!rows.length} onClick={() => downloadXlsx(`candidatures-animateurs-radio-${today()}.xlsx`, table(), 'Candidatures')}>Excel</Button>
          <Button size="sm" variant="outline" icon={<Download className="h-4 w-4" />} disabled={!rows.length} onClick={() => downloadCsv(`candidatures-animateurs-radio-${today()}.csv`, table())}>CSV</Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Candidatures" value={all.length} />
        <StatCard icon={<Inbox className="h-5 w-5" />} label="Nouvelles (à traiter)" value={count('nouvelle')} />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Retenues" value={count('retenue')} />
        <StatCard icon={<Headphones className="h-5 w-5" />} label="En direct / préenregistrées" value={`${all.filter((r) => r.mode === 'direct').length} / ${all.filter((r) => r.mode === 'preenregistree').length}`} />
      </div>

      <Card className="mb-5"><CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-night">Lien du formulaire à partager</p>
          <p className="truncate text-sm text-ink/60">{FORM_URL}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" variant="outline" icon={<Copy className="h-4 w-4" />} onClick={() => void copy()}>Copier le lien</Button>
          <a href={share} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1FA855] px-4 py-2 text-sm font-semibold text-white hover:bg-[#178a45]"><Send className="h-4 w-4" />Partager sur WhatsApp</a>
        </div>
      </CardBody></Card>

      <Card className="mb-5"><CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select aria-label="Statut" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts ({all.length})</option>
          {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label} ({count(s.key)})</option>)}
        </Select>
        <Select aria-label="Type d’émission" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous les types</option>
          {SHOW_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label.fr} ({all.filter((r) => r.showType === t.key).length})</option>)}
        </Select>
        <Select aria-label="Jour" value={day} onChange={(e) => setDay(e.target.value)}>
          <option value="">Tous les jours</option>
          {DAYS.map((d) => <option key={d.key} value={d.key}>{d.label.fr} ({all.filter((r) => r.days.includes(d.key)).length})</option>)}
        </Select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
          <Input aria-label="Rechercher" placeholder="Nom, n°, téléphone, titre…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        </div>
      </CardBody></Card>

      {!all.length ? (
        <EmptyState title="Aucune candidature pour le moment" description="Partagez le lien du formulaire dans les groupes WhatsApp : les réponses arriveront ici." />
      ) : (
        <>
          <p className="mb-3 text-sm text-ink/60">{rows.length} candidature{rows.length > 1 ? 's' : ''} affichée{rows.length > 1 ? 's' : ''}. Les boutons Excel et CSV téléchargent la liste affichée (avec les filtres).</p>
          <ul className="space-y-3">
            {rows.map((r) => <Row key={r.id} r={r} onChanged={changed} onDelete={setToDelete} />)}
          </ul>
          {!rows.length && <EmptyState title="Aucune candidature pour ce filtre" />}
        </>
      )}

      <ConfirmDialog open={!!toDelete} title="Supprimer cette candidature ?" danger loading={deleting} confirmLabel="Supprimer" onCancel={() => setToDelete(null)} onConfirm={() => void remove()}
        message={toDelete && <>La candidature <b>{toDelete.reference}</b> de <b>{toDelete.fullName}</b> (« {toDelete.showTitle} ») sera effacée définitivement.</>} />
    </>
  );
}
