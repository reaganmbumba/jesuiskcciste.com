import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Check, CheckCircle2, ClipboardCheck, Headphones, Link2, Mic, Radio, Send, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { whatsappShareUrl } from '@/components/common/ShareButtons';
import {
  DAYS, DURATIONS, FIELD_SECTION, FREQUENCIES, MODES, SHOW_TYPES, emptyCandidature, progressOf, submitCandidature, validateCandidature,
  type CandidatureErrors, type CandidatureInput, type Day, type YesNoField,
} from '@/features/radio/candidatures';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/i18n';
import { PUBLIC_SITE_URL } from '@/config/site';
import { cn } from '@/utils/format';

export const RADIO_FORM_PATH = '/radio/animateurs';
const DRAFT_KEY = 'kcc-radio-candidature-brouillon';

function readDraft(): CandidatureInput | null {
  try {
    const v = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
    return v && typeof v === 'object' && Array.isArray(v.days) ? { ...emptyCandidature(), ...v, certified: false } : null;
  } catch { return null; }
}
function saveDraft(v: CandidatureInput | null) {
  try {
    if (v) localStorage.setItem(DRAFT_KEY, JSON.stringify(v));
    else localStorage.removeItem(DRAFT_KEY);
  } catch { /* stockage indisponible */ }
}

/** Oui / Non en deux gros boutons. */
function YesNo({ label, value, onChange, hint }: { label: string; value: boolean | null; onChange: (v: boolean) => void; hint?: string }) {
  const { tx } = useI18n();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-night/[0.08] bg-mist/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-ink/55">{hint}</p>}
      </div>
      <div role="radiogroup" aria-label={label} className="grid shrink-0 grid-cols-2 gap-2 sm:w-52">
        {[true, false].map((b) => (
          <button key={String(b)} type="button" role="radio" aria-checked={value === b} onClick={() => onChange(b)}
            className={cn('rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/30',
              value === b ? (b ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm' : 'border-night bg-night text-white shadow-sm') : 'border-night/15 bg-white text-ink/75 hover:border-night/40')}>
            {b ? tx('Oui', 'Yes', 'Sim') : tx('Non', 'No', 'Não')}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Carte d'une rubrique, numérotée, avec sa coche quand elle est complète. */
function Section({ n, id, icon, title, subtitle, complete, children }: { n: number; id: string; icon: ReactNode; title: string; subtitle?: string; complete: boolean; children: ReactNode }) {
  return (
    <fieldset id={id} className="scroll-mt-56 rounded-3xl border border-night/[0.08] bg-white p-5 shadow-sm sm:p-8">
      <legend className="sr-only">{n}. {title}</legend>
      <div className="mb-6 flex items-start gap-4">
        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold transition', complete ? 'bg-emerald-600 text-white' : 'bg-night text-gold-300')}>
          {complete ? <Check className="h-6 w-6" aria-hidden /> : n}
        </span>
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-1.5 text-gold-700">{icon}<span>Rubrique {n}</span></p>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-night sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink/60">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

const SECTION_IDS = ['identification', 'emission', 'disponibilites', 'moyens', 'engagement', 'validation'];

/**
 * Formulaire d'identification et de disponibilité des animateurs d'émissions
 * radio : six rubriques, barre de progression, vérification des champs
 * obligatoires, enregistrement réel dans Supabase.
 */
export default function RadioHostFormPage() {
  const { tx, locale } = useI18n();
  const { notify } = useToast();
  const { profile } = useAuth();
  const [v, setV] = useState<CandidatureInput>(() => readDraft() ?? emptyCandidature());
  const [errors, setErrors] = useState<CandidatureErrors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string; name: string; title: string } | null>(null);
  const [trap, setTrap] = useState('');
  const top = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(72);

  // La barre de progression se colle juste sous l'en-tête du site (dont la hauteur varie avec les bandeaux).
  useEffect(() => {
    const h = document.querySelector<HTMLElement>('header.sticky');
    if (!h || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setHeaderH(Math.round(h.getBoundingClientRect().height)));
    ro.observe(h);
    return () => ro.disconnect();
  }, []);

  // Membre connecté : nom, téléphone, e-mail et ville pré-remplis.
  useEffect(() => {
    if (!profile) return;
    setV((x) => (x.fullName || x.phone ? x : {
      ...x,
      fullName: [profile.lastName, profile.middleName, profile.firstName].filter(Boolean).join(' '),
      phone: (profile as { phone?: string | null }).phone ?? '',
      email: (profile as { email?: string | null }).email ?? '',
      city: profile.city ?? '',
    }));
  }, [profile]);

  // Brouillon gardé sur le téléphone : rien n'est perdu si la connexion coupe.
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => saveDraft(v), 400);
    return () => clearTimeout(t);
  }, [v, done]);

  const set = <K extends keyof CandidatureInput>(k: K, value: CandidatureInput[K]) => {
    setV((x) => ({ ...x, [k]: value }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const toggleDay = (d: Day) => set('days', v.days.includes(d) ? v.days.filter((x) => x !== d) : [...v.days, d]);
  const yn = (k: YesNoField) => ({ value: v[k], onChange: (b: boolean) => set(k, b) });

  const progress = useMemo(() => progressOf(v), [v]);
  const sectionDone = (n: number) => {
    const s = progress.bySection[n];
    return !!s && s.filled === s.total;
  };
  const L = (x: { label: { fr: string; en: string; pt: string } }) => x.label[locale];

  const goTo = (n: number) => document.getElementById(SECTION_IDS[n - 1])?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateCandidature(v, tx);
    setErrors(errs);
    const keys = Object.keys(errs) as (keyof CandidatureInput)[];
    if (keys.length) {
      notify(tx(`Il manque ${keys.length} information${keys.length > 1 ? 's' : ''} (en rouge).`, `${keys.length} item${keys.length > 1 ? 's' : ''} missing (in red).`, `Faltam ${keys.length} informaç${keys.length > 1 ? 'ões' : 'ão'} (a vermelho).`), 'error');
      goTo(Math.min(...keys.map((k) => FIELD_SECTION[k])));
      return;
    }
    if (trap) { setDone({ reference: '', name: v.fullName, title: v.showTitle }); return; }
    setBusy(true);
    try {
      const res = await submitCandidature(v);
      setDone({ reference: res.reference, name: v.fullName.trim(), title: v.showTitle.trim() });
      saveDraft(null);
      setV(emptyCandidature());
      top.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      notify(err instanceof Error ? err.message : tx('Envoi impossible. Vérifiez la connexion et réessayez.', 'Could not send. Check your connection and try again.', 'Envio impossível. Verifique a ligação e tente de novo.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const shareTitle = tx('Radio KCC : formulaire des animateurs d’émissions', 'Radio KCC: form for show hosts', 'Rádio KCC: formulário dos animadores');
  const shareText = tx(
    'Vous souhaitez présenter une émission sur Radio KCC, depuis chez vous ou en émission préenregistrée ? Remplissez le formulaire d’identification et de disponibilité des animateurs.',
    'Would you like to host a show on Radio KCC, from home or pre-recorded? Fill in the host identification and availability form.',
    'Quer apresentar um programa na Rádio KCC, a partir de casa ou pré-gravado? Preencha o formulário de identificação e disponibilidade dos animadores.');
  const waUrl = whatsappShareUrl(`${PUBLIC_SITE_URL}${RADIO_FORM_PATH}`, shareTitle, locale, shareText);

  return (
    <>
      <div ref={top} />
      <PageHeader
        eyebrow={tx('Radio KCC · Service de programmation', 'Radio KCC · Programming service', 'Rádio KCC · Serviço de programação')}
        title={tx('Formulaire d’identification et de disponibilité des animateurs d’émissions radio', 'Radio show host identification and availability form', 'Formulário de identificação e disponibilidade dos animadores de programas de rádio')}
        description={tx(
          'Frères et sœurs, vous souhaitez contribuer à la programmation de notre radio en présentant une émission depuis votre domicile, ou en proposant une émission préenregistrée ? Présentez-vous ici : le service de programmation vous recontactera.',
          'Brothers and sisters, would you like to contribute to our radio’s programming by hosting a show from home, or by sending a pre-recorded show? Introduce yourself here: the programming service will get back to you.',
          'Irmãos e irmãs, querem contribuir para a programação da nossa rádio apresentando um programa a partir de casa, ou propondo um programa pré-gravado? Apresentem-se aqui: o serviço de programação entrará em contacto.')}
        image="/images/radio/partage-radio-kcc.jpg"
        share={false} />

      {done ? (
        <section className="container-page py-10 sm:py-14">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-emerald-600/20 bg-white shadow-lift">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-8 text-center text-white sm:px-10">
              <CheckCircle2 className="mx-auto h-14 w-14" aria-hidden />
              <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">{tx('Candidature bien reçue', 'Application received', 'Candidatura recebida')}</h2>
              <p className="mt-2 text-white/85">{tx('Merci', 'Thank you', 'Obrigado')} {done.name} !</p>
            </div>
            <div className="space-y-5 px-6 py-7 sm:px-10">
              {done.reference && (
                <div className="rounded-2xl border border-gold-300 bg-gold-50 px-5 py-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">{tx('Numéro de votre candidature', 'Your application number', 'Número da sua candidatura')}</p>
                  <p className="mt-1 font-display text-3xl font-semibold tracking-wide text-night">{done.reference}</p>
                </div>
              )}
              <p className="text-[15px] leading-relaxed text-ink/80">
                {tx('Votre proposition', 'Your proposal', 'A sua proposta')} « <b>{done.title}</b> » {tx('est enregistrée et transmise au service de programmation de Radio KCC. Il vous contactera sur WhatsApp ou par téléphone pour convenir du créneau et, si besoin, d’un test technique. Gardez ce numéro pour le suivi.', 'has been saved and sent to the Radio KCC programming service. They will contact you on WhatsApp or by phone to agree on the slot and, if needed, a technical test. Keep this number for follow-up.', 'foi registada e enviada ao serviço de programação da Rádio KCC. Entrará em contacto por WhatsApp ou telefone para combinar o horário e, se preciso, um teste técnico. Guarde este número.')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setDone(null)} variant="outline">{tx('Envoyer une autre proposition', 'Send another proposal', 'Enviar outra proposta')}</Button>
                <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1FA855] px-5 py-3 text-sm font-semibold text-white hover:bg-[#178a45]"><Send className="h-4 w-4" />{tx('Inviter d’autres frères et sœurs', 'Invite others', 'Convidar outros')}</a>
                <Link to="/radio" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-night hover:bg-mist"><Headphones className="h-4 w-4" />{tx('Écouter la radio', 'Listen to the radio', 'Ouvir a rádio')}</Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Barre de progression, toujours visible */}
          <div style={{ top: headerH }} className="sticky z-30 border-b border-night/[0.06] bg-white/90 backdrop-blur-xl">
            <div className="container-page py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-night">{tx('Progression du remplissage', 'Form progress', 'Progresso do preenchimento')}</span>
                <span className="tabular-nums font-semibold text-gold-700">{progress.percent} %</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-label={tx('Progression du remplissage', 'Form progress', 'Progresso do preenchimento')}>
                <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-emerald-500 transition-all duration-500" style={{ width: `${Math.max(3, progress.percent)}%` }} />
              </div>
              <nav aria-label={tx('Rubriques', 'Sections', 'Secções')} className="-mx-1 mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
                {[tx('Identité', 'Identity', 'Identidade'), tx('Émission', 'Show', 'Programa'), tx('Horaires', 'Schedule', 'Horários'), tx('Technique', 'Equipment', 'Técnica'), tx('Engagement', 'Commitment', 'Compromisso'), tx('Validation', 'Confirm', 'Validação')].map((label, i) => (
                  <button key={label} type="button" onClick={() => goTo(i + 1)}
                    className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition', sectionDone(i + 1) ? 'bg-emerald-50 text-emerald-700' : 'bg-mist text-ink/70 hover:bg-night/10')}>
                    {sectionDone(i + 1) ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span className="tabular-nums">{i + 1}</span>}{label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <section className="container-page grid gap-8 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <form onSubmit={submit} noValidate className="min-w-0 space-y-6">
              <p className="text-sm text-ink/60"><span className="text-red-600">*</span> {tx('Champ obligatoire. Vos réponses sont gardées sur ce téléphone jusqu’à l’envoi.', 'Required field. Your answers are kept on this device until you send.', 'Campo obrigatório. As respostas ficam neste telefone até ao envio.')}</p>

              <Section n={1} id={SECTION_IDS[0]} icon={<UserRound className="h-3.5 w-3.5" />} title={tx('Identification du candidat', 'Applicant details', 'Identificação do candidato')} complete={sectionDone(1)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={tx('Nom et postnom', 'Full name', 'Nome completo')} required error={errors.fullName} className="sm:col-span-2">
                    {(p) => <Input {...p} value={v.fullName} onChange={(e) => set('fullName', e.target.value)} maxLength={120} autoComplete="name" placeholder={tx('Ex. MBUMBA NZUZI Reagan', 'E.g. MBUMBA NZUZI Reagan', 'Ex. MBUMBA NZUZI Reagan')} />}
                  </Field>
                  <Field label={tx('Fonction ou responsabilité', 'Role or responsibility', 'Função ou responsabilidade')} hint={tx('Ex. Prédicateur, diacre, chantre, responsable de jeunesse…', 'E.g. preacher, deacon, choir leader, youth leader…', 'Ex. pregador, diácono, cantor, responsável da juventude…')}>
                    {(p) => <Input {...p} value={v.roleTitle} onChange={(e) => set('roleTitle', e.target.value)} maxLength={160} />}
                  </Field>
                  <Field label={tx('Ville ou lieu de résidence', 'City or place of residence', 'Cidade ou local de residência')}>
                    {(p) => <Input {...p} value={v.city} onChange={(e) => set('city', e.target.value)} maxLength={160} autoComplete="address-level2" />}
                  </Field>
                  <Field label={tx('Numéro de téléphone / WhatsApp', 'Phone / WhatsApp number', 'Telefone / WhatsApp')} required error={errors.phone} hint={tx('Avec l’indicatif du pays, ex. +243 840 238 592.', 'With the country code, e.g. +243 840 238 592.', 'Com o indicativo, ex. +244 923 000 000.')}>
                    {(p) => <Input {...p} type="tel" inputMode="tel" value={v.phone} onChange={(e) => set('phone', e.target.value)} maxLength={30} autoComplete="tel" placeholder="+243 …" />}
                  </Field>
                  <Field label={tx('Adresse e-mail (facultatif)', 'E-mail address (optional)', 'E-mail (facultativo)')} error={errors.email}>
                    {(p) => <Input {...p} type="email" inputMode="email" value={v.email} onChange={(e) => set('email', e.target.value)} maxLength={160} autoComplete="email" />}
                  </Field>
                </div>
              </Section>

              <Section n={2} id={SECTION_IDS[1]} icon={<Mic className="h-3.5 w-3.5" />} title={tx('Proposition d’émission', 'Show proposal', 'Proposta de programa')} complete={sectionDone(2)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={tx('Titre de l’émission envisagée', 'Planned show title', 'Título do programa')} required error={errors.showTitle} className="sm:col-span-2">
                    {(p) => <Input {...p} value={v.showTitle} onChange={(e) => set('showTitle', e.target.value)} maxLength={160} placeholder={tx('Ex. La Parole du matin', 'E.g. Morning Word', 'Ex. A Palavra da manhã')} />}
                  </Field>
                  <Field label={tx('Type d’émission', 'Type of show', 'Tipo de programa')} required error={errors.showType}>
                    {(p) => (
                      <Select {...p} value={v.showType} onChange={(e) => set('showType', e.target.value as CandidatureInput['showType'])}>
                        <option value="">{tx('Choisir…', 'Choose…', 'Escolher…')}</option>
                        {SHOW_TYPES.map((t) => <option key={t.key} value={t.key}>{L(t)}</option>)}
                      </Select>
                    )}
                  </Field>
                  <Field label={tx('Public cible', 'Target audience', 'Público-alvo')} hint={tx('Ex. jeunes, mamans, néophytes, tous les fidèles…', 'E.g. youth, mothers, newcomers, everyone…', 'Ex. jovens, mães, neófitos, todos…')}>
                    {(p) => <Input {...p} value={v.audience} onChange={(e) => set('audience', e.target.value)} maxLength={300} />}
                  </Field>
                  {v.showType === 'autre' && (
                    <Field label={tx('Précisez le type d’émission', 'Specify the type of show', 'Especifique o tipo')} required error={errors.showTypeOther} className="sm:col-span-2">
                      {(p) => <Input {...p} value={v.showTypeOther} onChange={(e) => set('showTypeOther', e.target.value)} maxLength={120} />}
                    </Field>
                  )}
                  <Field label={tx('Présentation de l’émission et de ses objectifs', 'Show description and goals', 'Apresentação do programa e objetivos')} className="sm:col-span-2" hint={`${(v.showDescription ?? '').length} / 3000`}>
                    {(p) => <Textarea {...p} rows={5} value={v.showDescription} onChange={(e) => set('showDescription', e.target.value)} maxLength={3000} placeholder={tx('De quoi parlera l’émission ? Que voulez-vous apporter aux auditeurs ?', 'What will the show be about? What do you want to bring listeners?', 'De que falará o programa? O que quer trazer aos ouvintes?')} />}
                  </Field>
                </div>
              </Section>

              <Section n={3} id={SECTION_IDS[2]} icon={<CalendarClock className="h-3.5 w-3.5" />} title={tx('Disponibilités horaires', 'Availability', 'Disponibilidade')} subtitle={tx('Heure de Kinshasa.', 'Kinshasa time.', 'Hora de Kinshasa.')} complete={sectionDone(3)}>
                <div>
                  <p className="text-sm font-medium text-ink">{tx('Jours disponibles', 'Available days', 'Dias disponíveis')} <span className="text-red-600" aria-hidden>*</span></p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {DAYS.map((d) => {
                      const on = v.days.includes(d.key);
                      return (
                        <label key={d.key} className={cn('flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition', on ? 'border-night bg-night text-white' : 'border-night/15 bg-white text-ink/80 hover:border-night/40')}>
                          <input type="checkbox" className="h-4 w-4 accent-[#C9A227]" checked={on} onChange={() => toggleDay(d.key)} />
                          {L(d)}
                        </label>
                      );
                    })}
                  </div>
                  {errors.days && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.days}</p>}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={tx('Heure de début souhaitée', 'Preferred start time', 'Hora de início')} error={errors.startTime}>
                    {(p) => <Input {...p} type="time" value={v.startTime} onChange={(e) => set('startTime', e.target.value)} />}
                  </Field>
                  <Field label={tx('Heure de fin souhaitée', 'Preferred end time', 'Hora de fim')} error={errors.endTime}>
                    {(p) => <Input {...p} type="time" value={v.endTime} onChange={(e) => set('endTime', e.target.value)} />}
                  </Field>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{tx('Durée souhaitée', 'Preferred length', 'Duração')} <span className="text-red-600" aria-hidden>*</span></p>
                  <div role="radiogroup" className="mt-2 grid grid-cols-4 gap-2">
                    {DURATIONS.map((d) => (
                      <button key={d} type="button" role="radio" aria-checked={v.duration === d} onClick={() => set('duration', d)}
                        className={cn('rounded-xl border py-3 text-center transition', v.duration === d ? 'border-gold-500 bg-gold-50 text-night ring-2 ring-gold/40' : 'border-night/15 bg-white text-ink/75 hover:border-night/40')}>
                        <span className="block font-display text-xl font-semibold">{d}</span><span className="text-xs">minutes</span>
                      </button>
                    ))}
                  </div>
                  {errors.duration && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.duration}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{tx('Fréquence', 'Frequency', 'Frequência')} <span className="text-red-600" aria-hidden>*</span></p>
                  <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {FREQUENCIES.map((f) => (
                      <button key={f.key} type="button" role="radio" aria-checked={v.frequency === f.key} onClick={() => set('frequency', f.key)}
                        className={cn('rounded-xl border px-3 py-2.5 text-sm font-semibold transition', v.frequency === f.key ? 'border-gold-500 bg-gold-50 text-night ring-2 ring-gold/40' : 'border-night/15 bg-white text-ink/75 hover:border-night/40')}>
                        {L(f)}
                      </button>
                    ))}
                  </div>
                  {errors.frequency && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.frequency}</p>}
                </div>
                <YesNo label={tx('Pouvez-vous accepter un autre créneau horaire ?', 'Could you accept another time slot?', 'Pode aceitar outro horário?')} {...yn('otherSlot')} />
              </Section>

              <Section n={4} id={SECTION_IDS[3]} icon={<Headphones className="h-3.5 w-3.5" />} title={tx('Moyens techniques', 'Equipment', 'Meios técnicos')} complete={sectionDone(4)}>
                <div>
                  <p className="text-sm font-medium text-ink">{tx('Mode d’intervention', 'How will you take part?', 'Modo de participação')} <span className="text-red-600" aria-hidden>*</span></p>
                  <div role="radiogroup" className="mt-2 grid gap-2 md:grid-cols-3">
                    {MODES.map((m) => (
                      <button key={m.key} type="button" role="radio" aria-checked={v.mode === m.key} onClick={() => set('mode', m.key)}
                        className={cn('rounded-2xl border p-4 text-left transition', v.mode === m.key ? 'border-gold-500 bg-gold-50 ring-2 ring-gold/40' : 'border-night/15 bg-white hover:border-night/40')}>
                        <span className="flex items-center gap-2 text-sm font-semibold text-night">
                          <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', v.mode === m.key ? 'border-gold-600 bg-gold-500' : 'border-night/25')}>{v.mode === m.key && <Check className="h-3 w-3 text-white" />}</span>
                          {L(m)}
                        </span>
                        <span className="mt-1.5 block text-xs leading-relaxed text-ink/60">{m.hint[locale]}</span>
                      </button>
                    ))}
                  </div>
                  {errors.mode && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.mode}</p>}
                </div>
                <div className="space-y-2.5">
                  <YesNo label={tx('Disposez-vous d’une connexion Internet stable ?', 'Do you have a stable Internet connection?', 'Tem uma ligação à Internet estável?')} {...yn('hasInternet')} />
                  <YesNo label={tx('Disposez-vous d’un smartphone ou d’un ordinateur ?', 'Do you have a smartphone or computer?', 'Tem um smartphone ou computador?')} {...yn('hasDevice')} />
                  <YesNo label={tx('Disposez-vous d’un microphone ou d’un casque audio ?', 'Do you have a microphone or headset?', 'Tem um microfone ou auscultadores?')} {...yn('hasMicrophone')} />
                  <YesNo label={tx('Avez-vous déjà une expérience dans l’animation radiophonique ?', 'Have you hosted radio before?', 'Já tem experiência de animação de rádio?')} {...yn('hasExperience')} />
                </div>
              </Section>

              <Section n={5} id={SECTION_IDS[4]} icon={<ClipboardCheck className="h-3.5 w-3.5" />} title={tx('Engagement', 'Commitment', 'Compromisso')} complete={sectionDone(5)}>
                <div className="space-y-2.5">
                  <YesNo label={tx('Êtes-vous disposé(e) à respecter le calendrier hebdomadaire de programmation ?', 'Will you follow the weekly programme schedule?', 'Está disposto(a) a respeitar o calendário semanal?')} {...yn('respectsCalendar')} />
                  <YesNo label={tx('Êtes-vous disponible pour les répétitions ou tests techniques ?', 'Are you available for rehearsals or technical tests?', 'Está disponível para ensaios ou testes técnicos?')} {...yn('availableForTests')} />
                </div>
                <Field label={tx('Observations ou autres propositions', 'Remarks or other suggestions', 'Observações ou outras propostas')} hint={`${(v.notes ?? '').length} / 3000`}>
                  {(p) => <Textarea {...p} rows={4} value={v.notes} onChange={(e) => set('notes', e.target.value)} maxLength={3000} />}
                </Field>
              </Section>

              <Section n={6} id={SECTION_IDS[5]} icon={<ShieldCheck className="h-3.5 w-3.5" />} title={tx('Validation', 'Confirmation', 'Validação')} complete={sectionDone(6)}>
                <label className={cn('flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition', v.certified ? 'border-emerald-600 bg-emerald-50/60' : errors.certified ? 'border-red-400 bg-red-50/40' : 'border-night/15 bg-mist/40 hover:border-night/30')}>
                  <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-[#059669]" checked={v.certified} onChange={(e) => set('certified', e.target.checked)} />
                  <span className="font-display text-[17px] italic leading-relaxed text-night">
                    « {tx('Je certifie que les informations fournies sont exactes et je m’engage à respecter les horaires et les dispositions organisationnelles de la radio.', 'I certify that the information provided is accurate and I undertake to respect the radio’s schedules and organisational arrangements.', 'Certifico que as informações fornecidas são exatas e comprometo-me a respeitar os horários e as disposições organizacionais da rádio.')} »
                  </span>
                </label>
                {errors.certified && <p role="alert" className="text-sm text-red-600">{errors.certified}</p>}
                {/* Piège à robots : invisible pour les personnes */}
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={trap} onChange={(e) => setTrap(e.target.value)} name="site_web" />
                <Button type="submit" size="lg" loading={busy} icon={<Send className="h-5 w-5" />} className="w-full justify-center py-4 text-base tracking-wide">
                  {tx('SOUMETTRE MA CANDIDATURE', 'SUBMIT MY APPLICATION', 'SUBMETER A MINHA CANDIDATURA')}
                </Button>
                <p className="text-center text-xs text-ink/55">{tx('Vos informations ne sont visibles que par le service de programmation de la radio.', 'Your details are only visible to the radio programming service.', 'Os seus dados só são vistos pelo serviço de programação da rádio.')}</p>
              </Section>
            </form>

            <aside className="space-y-5 lg:sticky lg:top-56 lg:self-start">
              <div className="rounded-3xl bg-gradient-to-br from-night to-night-700 p-6 text-white shadow-lift">
                <Radio className="h-8 w-8 text-gold-300" aria-hidden />
                <p className="mt-3 font-display text-lg font-semibold">{tx('Comment ça se passe ?', 'How does it work?', 'Como funciona?')}</p>
                <ol className="mt-3 space-y-2.5 text-sm text-white/80">
                  {[tx('Vous remplissez ce formulaire (5 minutes).', 'You fill in this form (5 minutes).', 'Preenche este formulário (5 minutos).'),
                    tx('Le service de programmation étudie votre proposition.', 'The programming service reviews your proposal.', 'O serviço de programação analisa a proposta.'),
                    tx('Il vous contacte sur WhatsApp pour fixer le créneau et faire un test.', 'They contact you on WhatsApp to set the slot and run a test.', 'Contacta-o por WhatsApp para marcar o horário e fazer um teste.'),
                    tx('Votre émission passe sur Radio KCC.', 'Your show airs on Radio KCC.', 'O seu programa passa na Rádio KCC.')].map((s, i) => (
                    <li key={i} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-xs font-bold text-gold-300">{i + 1}</span><span>{s}</span></li>
                  ))}
                </ol>
              </div>
              <div className="rounded-3xl border border-night/[0.08] bg-white p-6 shadow-sm">
                <p className="flex items-center gap-2 font-semibold text-night"><Link2 className="h-4 w-4 text-gold-600" />{tx('Partager le formulaire', 'Share the form', 'Partilhar o formulário')}</p>
                <p className="mt-1 text-sm text-ink/60">{tx('Envoyez-le aux frères et sœurs qui ont une émission à proposer.', 'Send it to those who have a show to propose.', 'Envie-o a quem tem um programa a propor.')}</p>
                <a href={waUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1FA855] px-5 py-3 text-sm font-semibold text-white hover:bg-[#178a45]"><Send className="h-4 w-4" />{tx('Partager sur WhatsApp', 'Share on WhatsApp', 'Partilhar no WhatsApp')}</a>
              </div>
            </aside>
          </section>
        </>
      )}

      {/* Signature demandée en fin de formulaire */}
      <section className="bg-night">
        <div className="container-page py-12 text-center sm:py-16">
          <Sparkles className="mx-auto h-7 w-7 text-gold-300" aria-hidden />
          <p className="mt-4 font-display text-2xl font-semibold tracking-[0.12em] text-gold-gradient sm:text-3xl">RADIO KCC – {tx('SERVICE DE PROGRAMMATION', 'PROGRAMMING SERVICE', 'SERVIÇO DE PROGRAMAÇÃO')}</p>
          <p className="mx-auto mt-3 max-w-xl text-[15px] italic text-white/75 sm:text-lg">{tx('Ensemble, organisons une programmation radiophonique structurée, régulière et de qualité.', 'Together, let us build a structured, regular, high-quality radio programme.', 'Juntos, organizemos uma programação de rádio estruturada, regular e de qualidade.')}</p>
        </div>
      </section>
    </>
  );
}
