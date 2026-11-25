import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { camelize } from '@/utils/case';
import type { Tri } from '@/i18n';

/**
 * Formulaire d'identification et de disponibilité des animateurs d'émissions
 * radio (/radio/animateurs). Les candidatures arrivent dans la table
 * `radio_candidatures` par la fonction `submit_radio_candidature` (sans compte),
 * et seul le service de programmation (/admin/radio/candidatures) les lit.
 */

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

export const SHOW_TYPES = [
  { key: 'predication', label: T('Prédication', 'Preaching', 'Pregação') },
  { key: 'enseignement', label: T('Enseignement biblique', 'Bible teaching', 'Ensino bíblico') },
  { key: 'evangelisation', label: T('Évangélisation', 'Evangelism', 'Evangelização') },
  { key: 'temoignage', label: T('Témoignage', 'Testimony', 'Testemunho') },
  { key: 'priere', label: T('Prière et intercession', 'Prayer and intercession', 'Oração e intercessão') },
  { key: 'debat', label: T('Débat et échanges', 'Debate and discussion', 'Debate e partilha') },
  { key: 'education', label: T('Éducation spirituelle', 'Spiritual education', 'Educação espiritual') },
  { key: 'informations', label: T('Informations et annonces', 'News and announcements', 'Informações e avisos') },
  { key: 'autre', label: T('Autre', 'Other', 'Outro') },
] as const;
export type ShowType = (typeof SHOW_TYPES)[number]['key'];

export const DAYS = [
  { key: 'lundi', label: T('Lundi', 'Monday', 'Segunda') },
  { key: 'mardi', label: T('Mardi', 'Tuesday', 'Terça') },
  { key: 'mercredi', label: T('Mercredi', 'Wednesday', 'Quarta') },
  { key: 'jeudi', label: T('Jeudi', 'Thursday', 'Quinta') },
  { key: 'vendredi', label: T('Vendredi', 'Friday', 'Sexta') },
  { key: 'samedi', label: T('Samedi', 'Saturday', 'Sábado') },
  { key: 'dimanche', label: T('Dimanche', 'Sunday', 'Domingo') },
] as const;
export type Day = (typeof DAYS)[number]['key'];

export const DURATIONS = [15, 30, 45, 60] as const;
export type Duration = (typeof DURATIONS)[number];

export const FREQUENCIES = [
  { key: 'quotidienne', label: T('Quotidienne', 'Daily', 'Diária') },
  { key: 'hebdomadaire', label: T('Hebdomadaire', 'Weekly', 'Semanal') },
  { key: 'bimensuelle', label: T('Bimensuelle', 'Twice a month', 'Quinzenal') },
  { key: 'occasionnelle', label: T('Occasionnelle', 'Occasional', 'Ocasional') },
] as const;
export type Frequency = (typeof FREQUENCIES)[number]['key'];

export const MODES = [
  { key: 'direct', label: T('En direct depuis le domicile', 'Live from home', 'Em direto a partir de casa'), hint: T('Vous animez en direct avec votre téléphone ou votre ordinateur.', 'You host live from your phone or computer.', 'Anima em direto com o telefone ou o computador.') },
  { key: 'preenregistree', label: T('Émission préenregistrée', 'Pre-recorded show', 'Programa pré-gravado'), hint: T('Vous enregistrez l’émission et l’envoyez ; elle passe à l’heure prévue.', 'You record the show and send it; it airs at the planned time.', 'Grava o programa e envia-o; passa à hora prevista.') },
  { key: 'assistance', label: T('Intervention à distance avec assistance technique', 'Remote, with technical support', 'À distância, com assistência técnica'), hint: T('Un technicien de la radio vous aide à passer à l’antenne.', 'A radio technician helps you go on air.', 'Um técnico da rádio ajuda-o a entrar no ar.') },
] as const;
export type Mode = (typeof MODES)[number]['key'];

export const STATUSES = [
  { key: 'nouvelle', label: 'Nouvelle', tone: 'gold' },
  { key: 'contactee', label: 'Contactée', tone: 'blue' },
  { key: 'retenue', label: 'Retenue', tone: 'green' },
  { key: 'attente', label: 'En attente', tone: 'amber' },
  { key: 'refusee', label: 'Non retenue', tone: 'red' },
] as const;
export type CandidatureStatus = (typeof STATUSES)[number]['key'];

/** Questions Oui / Non (rubriques 3, 4 et 5). */
export const YES_NO_FIELDS = ['otherSlot', 'hasInternet', 'hasDevice', 'hasMicrophone', 'hasExperience', 'respectsCalendar', 'availableForTests'] as const;
export type YesNoField = (typeof YES_NO_FIELDS)[number];

export interface CandidatureInput {
  fullName: string;
  roleTitle?: string;
  phone: string;
  email?: string;
  city?: string;
  showTitle: string;
  showType: ShowType | '';
  showTypeOther?: string;
  showDescription?: string;
  audience?: string;
  days: Day[];
  startTime?: string;
  endTime?: string;
  duration: Duration | null;
  frequency: Frequency | '';
  otherSlot: boolean | null;
  mode: Mode | '';
  hasInternet: boolean | null;
  hasDevice: boolean | null;
  hasMicrophone: boolean | null;
  hasExperience: boolean | null;
  respectsCalendar: boolean | null;
  availableForTests: boolean | null;
  notes?: string;
  certified: boolean;
}

export interface Candidature extends Omit<CandidatureInput, 'certified'> {
  id: string;
  reference: string;
  status: CandidatureStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export const emptyCandidature = (): CandidatureInput => ({
  fullName: '', roleTitle: '', phone: '', email: '', city: '',
  showTitle: '', showType: '', showTypeOther: '', showDescription: '', audience: '',
  days: [], startTime: '', endTime: '', duration: null, frequency: '', otherSlot: null,
  mode: '', hasInternet: null, hasDevice: null, hasMicrophone: null, hasExperience: null,
  respectsCalendar: null, availableForTests: null, notes: '', certified: false,
});

// ——— Vérification ———

const clean = (s?: string | null) => (s ?? '').trim();
export const phoneDigits = (s?: string) => (s ?? '').replace(/\D/g, '');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export type CandidatureErrors = Partial<Record<keyof CandidatureInput, string>>;

/** Champs obligatoires et formats. Renvoie les erreurs (en français). */
export function validateCandidature(v: CandidatureInput, tx: (fr: string, en: string, pt: string) => string = (fr) => fr): CandidatureErrors {
  const e: CandidatureErrors = {};
  if (clean(v.fullName).length < 3) e.fullName = tx('Indiquez votre nom et postnom.', 'Enter your full name.', 'Indique o seu nome completo.');
  const d = phoneDigits(v.phone);
  if (d.length < 9 || d.length > 15) e.phone = tx('Numéro incomplet. Exemple : +243 840 238 592.', 'Incomplete number. Example: +243 840 238 592.', 'Número incompleto. Exemplo: +243 840 238 592.');
  if (clean(v.email) && !EMAIL.test(clean(v.email))) e.email = tx('Adresse e-mail non valide.', 'Invalid e-mail address.', 'Endereço de e-mail inválido.');
  if (clean(v.showTitle).length < 3) e.showTitle = tx('Donnez un titre à votre émission.', 'Give your show a title.', 'Dê um título ao seu programa.');
  if (!v.showType) e.showType = tx('Choisissez le type d’émission.', 'Choose the type of show.', 'Escolha o tipo de programa.');
  else if (v.showType === 'autre' && clean(v.showTypeOther).length < 2) e.showTypeOther = tx('Précisez le type d’émission.', 'Specify the type of show.', 'Especifique o tipo de programa.');
  if (!v.days.length) e.days = tx('Cochez au moins un jour.', 'Tick at least one day.', 'Marque pelo menos um dia.');
  if (clean(v.startTime) && !TIME.test(clean(v.startTime))) e.startTime = tx('Heure non valide.', 'Invalid time.', 'Hora inválida.');
  if (clean(v.endTime) && !TIME.test(clean(v.endTime))) e.endTime = tx('Heure non valide.', 'Invalid time.', 'Hora inválida.');
  if (!e.startTime && !e.endTime && clean(v.startTime) && clean(v.endTime) && clean(v.endTime) <= clean(v.startTime)) e.endTime = tx('L’heure de fin doit être après l’heure de début.', 'End time must be after start time.', 'A hora de fim deve ser depois da hora de início.');
  if (!v.duration) e.duration = tx('Choisissez la durée.', 'Choose the length.', 'Escolha a duração.');
  if (!v.frequency) e.frequency = tx('Choisissez la fréquence.', 'Choose how often.', 'Escolha a frequência.');
  if (!v.mode) e.mode = tx('Choisissez le mode d’intervention.', 'Choose how you will take part.', 'Escolha o modo de participação.');
  if (!v.certified) e.certified = tx('Cochez la déclaration pour envoyer votre candidature.', 'Tick the declaration to send your application.', 'Marque a declaração para enviar a candidatura.');
  return e;
}

/** Rubrique (1 à 6) de chaque champ, pour aller à la première erreur. */
export const FIELD_SECTION: Record<keyof CandidatureInput, number> = {
  fullName: 1, roleTitle: 1, phone: 1, email: 1, city: 1,
  showTitle: 2, showType: 2, showTypeOther: 2, showDescription: 2, audience: 2,
  days: 3, startTime: 3, endTime: 3, duration: 3, frequency: 3, otherSlot: 3,
  mode: 4, hasInternet: 4, hasDevice: 4, hasMicrophone: 4, hasExperience: 4,
  respectsCalendar: 5, availableForTests: 5, notes: 5,
  certified: 6,
};

/** Champs comptés dans la barre de progression (le « Autre » n'y entre que s'il est choisi). */
export function progressOf(v: CandidatureInput): { filled: number; total: number; percent: number; bySection: Record<number, { filled: number; total: number }> } {
  const fields: [keyof CandidatureInput, boolean][] = [
    ['fullName', clean(v.fullName).length >= 3], ['roleTitle', !!clean(v.roleTitle)], ['phone', phoneDigits(v.phone).length >= 9], ['email', !!clean(v.email)], ['city', !!clean(v.city)],
    ['showTitle', clean(v.showTitle).length >= 3], ['showType', !!v.showType], ['showDescription', !!clean(v.showDescription)], ['audience', !!clean(v.audience)],
    ['days', v.days.length > 0], ['startTime', !!clean(v.startTime)], ['endTime', !!clean(v.endTime)], ['duration', !!v.duration], ['frequency', !!v.frequency], ['otherSlot', v.otherSlot !== null],
    ['mode', !!v.mode], ['hasInternet', v.hasInternet !== null], ['hasDevice', v.hasDevice !== null], ['hasMicrophone', v.hasMicrophone !== null], ['hasExperience', v.hasExperience !== null],
    ['respectsCalendar', v.respectsCalendar !== null], ['availableForTests', v.availableForTests !== null], ['notes', !!clean(v.notes)],
    ['certified', v.certified],
  ];
  if (v.showType === 'autre') fields.push(['showTypeOther', clean(v.showTypeOther).length >= 2]);
  const bySection: Record<number, { filled: number; total: number }> = {};
  for (const [k, ok] of fields) {
    const s = FIELD_SECTION[k];
    bySection[s] = bySection[s] ?? { filled: 0, total: 0 };
    bySection[s].total += 1;
    if (ok) bySection[s].filled += 1;
  }
  const filled = fields.filter(([, ok]) => ok).length;
  return { filled, total: fields.length, percent: Math.round((filled / fields.length) * 100), bySection };
}

/** Ligne envoyée à la base (snake_case, textes nettoyés). */
export function toRow(v: CandidatureInput) {
  return {
    full_name: clean(v.fullName), role_title: clean(v.roleTitle), phone: clean(v.phone), email: clean(v.email).toLowerCase(), city: clean(v.city),
    show_title: clean(v.showTitle), show_type: v.showType, show_type_other: v.showType === 'autre' ? clean(v.showTypeOther) : '',
    show_description: clean(v.showDescription), audience: clean(v.audience),
    days: DAYS.map((d) => d.key).filter((d) => v.days.includes(d)), start_time: clean(v.startTime), end_time: clean(v.endTime),
    duration: v.duration, frequency: v.frequency, other_slot: v.otherSlot, mode: v.mode,
    has_internet: v.hasInternet, has_device: v.hasDevice, has_microphone: v.hasMicrophone, has_experience: v.hasExperience,
    respects_calendar: v.respectsCalendar, available_for_tests: v.availableForTests, notes: clean(v.notes), certified: v.certified,
  };
}

// ——— Appels à la base ———

let demoRows: Candidature[] = [];

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

const notInstalled = (e: { code?: string; message?: string }) => e.code === '42P01' || e.code === 'PGRST205' || e.code === 'PGRST202' || /schema cache|does not exist/i.test(e.message ?? '');

export class CandidaturesNotInstalledError extends Error {
  constructor() { super('Le formulaire n’est pas encore ouvert. Réessayez un peu plus tard.'); }
}

const demoReference = () => `RKCC-${String(demoRows.length + 1).padStart(4, '0')}`;

/** Envoie une candidature. Renvoie son numéro (ex. RKCC-0012). */
export async function submitCandidature(v: CandidatureInput): Promise<{ reference: string }> {
  const errs = validateCandidature(v);
  if (Object.keys(errs).length) throw new Error(Object.values(errs)[0]);
  const row = toRow(v);
  if (isDemoMode) {
    const now = new Date().toISOString();
    const reference = demoReference();
    const { certified: _c, ...rest } = camelize<CandidatureInput>(row);
    demoRows = [{ ...rest, id: `demo-${Date.now()}`, reference, status: 'nouvelle', adminNote: null, createdAt: now, updatedAt: now }, ...demoRows];
    return { reference };
  }
  const { data, error } = await db().rpc('submit_radio_candidature', { p: row });
  if (error) {
    if (notInstalled(error)) throw new CandidaturesNotInstalledError();
    throw new Error(error.message);
  }
  return { reference: String((data as { reference?: string } | null)?.reference ?? '') };
}

const COLUMNS = 'id, reference, full_name, role_title, phone, email, city, show_title, show_type, show_type_other, show_description, audience, days, start_time, end_time, duration, frequency, other_slot, mode, has_internet, has_device, has_microphone, has_experience, respects_calendar, available_for_tests, notes, status, admin_note, created_at, updated_at';

/** Service de programmation : toutes les candidatures, les plus récentes d'abord. */
export async function listCandidatures(): Promise<Candidature[]> {
  if (isDemoMode) return [...demoRows];
  const all: Candidature[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await db().from('radio_candidatures').select(COLUMNS).order('created_at', { ascending: false }).range(from, from + 999);
    if (error) throw error;
    all.push(...camelize<Candidature[]>(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return all;
}

export async function updateCandidature(id: string, patch: { status?: CandidatureStatus; adminNote?: string }): Promise<void> {
  if (isDemoMode) {
    demoRows = demoRows.map((r) => (r.id === id ? { ...r, ...(patch.status ? { status: patch.status } : {}), ...(patch.adminNote !== undefined ? { adminNote: patch.adminNote } : {}), updatedAt: new Date().toISOString() } : r));
    return;
  }
  const row: Record<string, unknown> = {};
  if (patch.status) row.status = patch.status;
  if (patch.adminNote !== undefined) row.admin_note = patch.adminNote.trim() || null;
  const { error } = await db().from('radio_candidatures').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteCandidature(id: string): Promise<void> {
  if (isDemoMode) { demoRows = demoRows.filter((r) => r.id !== id); return; }
  const { error } = await db().from('radio_candidatures').delete().eq('id', id);
  if (error) throw error;
}

export function candidaturesErrorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (/row-level security|permission denied/i.test(msg) || code === '42501') return 'Votre compte n’a pas le droit de voir les candidatures.';
  if (/schema cache|does not exist/i.test(msg) || code === '42P01' || code === 'PGRST205')
    return 'Les candidatures ne sont pas encore installées dans Supabase : collez le fichier « animateurs-radio-a-coller-dans-supabase.sql » dans le SQL Editor, cliquez sur Run, puis réessayez.';
  return msg || 'L’action a échoué.';
}

// ——— Libellés et export ———

export const labelOf = <K extends string>(list: readonly { key: K; label: Tri }[], key: string | null | undefined) => list.find((x) => x.key === key)?.label.fr ?? (key || '');
export const showTypeLabel = (r: Pick<Candidature, 'showType' | 'showTypeOther'>) => (r.showType === 'autre' && r.showTypeOther ? `Autre : ${r.showTypeOther}` : labelOf(SHOW_TYPES, r.showType));
export const statusOf = (key: string) => STATUSES.find((s) => s.key === key) ?? STATUSES[0];
const yn = (b: boolean | null | undefined) => (b === true ? 'Oui' : b === false ? 'Non' : '');
export const daysLabel = (days: string[]) => DAYS.filter((d) => days.includes(d.key)).map((d) => d.label.fr).join(', ');
export const slotLabel = (r: Pick<Candidature, 'startTime' | 'endTime'>) => (r.startTime || r.endTime ? `${r.startTime || '?'} – ${r.endTime || '?'}` : '');

/** Une ligne par candidature, colonnes en français (pour Excel et CSV). */
export function candidaturesTable(rows: Candidature[]): Record<string, string | number>[] {
  return rows.map((r) => ({
    'N°': r.reference,
    'Date': r.createdAt.slice(0, 10),
    'Statut': statusOf(r.status).label,
    'Nom et postnom': r.fullName,
    'Fonction': r.roleTitle ?? '',
    'Téléphone / WhatsApp': r.phone,
    'E-mail': r.email ?? '',
    'Ville': r.city ?? '',
    'Titre de l’émission': r.showTitle,
    'Type d’émission': showTypeLabel(r),
    'Présentation et objectifs': r.showDescription ?? '',
    'Public cible': r.audience ?? '',
    'Jours': daysLabel(r.days ?? []),
    'Heure de début': r.startTime ?? '',
    'Heure de fin': r.endTime ?? '',
    'Durée (min)': r.duration ?? '',
    'Fréquence': labelOf(FREQUENCIES, r.frequency),
    'Autre créneau accepté': yn(r.otherSlot),
    'Mode d’intervention': labelOf(MODES, r.mode),
    'Internet stable': yn(r.hasInternet),
    'Smartphone ou ordinateur': yn(r.hasDevice),
    'Micro ou casque': yn(r.hasMicrophone),
    'Expérience radio': yn(r.hasExperience),
    'Respecte le calendrier': yn(r.respectsCalendar),
    'Disponible pour les tests': yn(r.availableForTests),
    'Observations': r.notes ?? '',
    'Note du service': r.adminNote ?? '',
  }));
}

/** Lien WhatsApp direct vers le candidat (numéro congolais à 9 chiffres complété par +243). */
export function whatsappTo(phone: string, text?: string) {
  let d = phoneDigits(phone);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('0')) d = `243${d.slice(1)}`;
  if (d.length === 9) d = `243${d}`;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
