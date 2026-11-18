import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Globe2, Home, Pencil, Plus, Send, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Select } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { ShareButtons } from '@/components/common/ShareButtons';
import { officialParishValue } from '@/components/common/OfficialParishList';
import { OFFICIAL_PARISHES, PARISH_COUNTRIES, type ParishCountry } from '@/content/paroisses';
import { useAuth } from '@/features/auth/AuthContext';
import { getMyMatricule } from '@/features/news/readerAccess';
import {
  CENSUS_AGES, CENSUS_MAX_PEOPLE, CENSUS_OTHER_COUNTRY, CENSUS_SEXES, CENSUS_STATUSES, getCensusEntry, getCensusPublicStats, readLocalEntries, saveLocalEntry, submitCensus,
  type CensusAge, type CensusInput, type CensusPerson, type CensusResult, type CensusSex, type CensusStatus, type LocalCensusEntry,
} from '@/features/census/census';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { parishesRepo } from '@/services';
import { cn } from '@/utils/format';

type PersonDraft = { name: string; sex: CensusSex | ''; age: CensusAge | ''; status: CensusStatus | '' };
const emptyPerson = (): PersonDraft => ({ name: '', sex: '', age: '', status: '' });

interface Draft {
  countryCode: string; otherCountry: string; province: string; city: string; parish: string; section: string;
  contactName: string; matricule: string; phone: string; forOther: boolean; recordedBy: string; consent: boolean; website: string;
  people: PersonDraft[];
}
const emptyDraft = (): Draft => ({
  countryCode: '', otherCountry: '', province: '', city: '', parish: '', section: '', contactName: '', matricule: '', phone: '', forOther: false, recordedBy: '', consent: false, website: '',
  people: [emptyPerson()],
});

const COUNTRY_CODES = Object.keys(PARISH_COUNTRIES) as ParishCountry[];
/** Le pays est enregistré sous son nom français, pour que les totaux se regroupent quelle que soit la langue. */
const countryCodeOf = (label: string) => COUNTRY_CODES.find((c) => Object.values(PARISH_COUNTRIES[c]).some((l) => l.toLowerCase() === label.trim().toLowerCase()));

/** Recensement des fidèles : un formulaire simple, par foyer, sans compte. */
export default function CensusPage() {
  const { tx, locale } = useI18n();
  const { notify } = useToast();
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const [v, setV] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [done, setDone] = useState<{ status: CensusResult; people: number } | null>(null);
  const [mine, setMine] = useState<LocalCensusEntry[]>(() => readLocalEntries());
  const stats = useAsync(() => getCensusPublicStats(), [done]);
  const L = <T extends { label: { fr: string; en: string; pt: string } }>(x: T) => x.label[locale];

  // Membre connecté : nom, pays, ville, paroisse et matricule pré-remplis.
  useEffect(() => {
    if (!profile || params.get('modifier')) return;
    let stop = false;
    void (async () => {
      const [mat, parish] = await Promise.all([
        getMyMatricule(profile.id, profile.status === 'active').catch(() => null),
        profile.parishId ? parishesRepo.get(profile.parishId).catch(() => null) : null,
      ]);
      if (stop) return;
      const code = countryCodeOf(profile.country ?? '');
      setV((x) => (x.contactName || x.parish ? x : {
        ...x,
        contactName: [profile.lastName, profile.middleName, profile.firstName].filter(Boolean).join(' '),
        matricule: mat ?? '',
        countryCode: code ?? (profile.country ? CENSUS_OTHER_COUNTRY : ''),
        otherCountry: code ? '' : profile.country ?? '',
        city: profile.city ?? '',
        parish: (parish as { name?: string } | null)?.name ?? '',
        people: [{ ...x.people[0], name: profile.firstName ?? '' }, ...x.people.slice(1)],
      }));
    })();
    return () => { stop = true; };
  }, [profile, params]);

  // Correction d'une fiche déjà envoyée depuis ce téléphone (?modifier=<jeton>).
  useEffect(() => {
    const t = params.get('modifier');
    if (!t) return;
    void getCensusEntry(t).then((e) => {
      if (!e) { notify(tx('Fiche introuvable sur ce téléphone.', 'Entry not found on this phone.', 'Ficha não encontrada neste telefone.'), 'error'); return; }
      const code = countryCodeOf(e.country);
      setToken(t);
      setDone(null);
      setV({
        ...emptyDraft(), countryCode: code ?? CENSUS_OTHER_COUNTRY, otherCountry: code ? '' : e.country, province: e.province ?? '', city: e.city, parish: e.parish, section: e.section ?? '',
        contactName: e.contactName ?? '', matricule: e.matricule ?? '', forOther: !!e.recordedBy, recordedBy: e.recordedBy ?? '', consent: true,
        people: e.people.map((p) => ({ name: p.name ?? '', sex: p.sex, age: p.age, status: p.status ?? '' })),
      });
    }).catch(() => notify(tx('Impossible de relire la fiche.', 'Could not load the entry.', 'Não foi possível ler a ficha.'), 'error'));
  }, [params, notify, tx]);

  const parishOptions = useMemo(() => {
    const list = v.countryCode && v.countryCode !== CENSUS_OTHER_COUNTRY ? OFFICIAL_PARISHES.filter((p) => p.country === v.countryCode) : OFFICIAL_PARISHES;
    return list.map(officialParishValue);
  }, [v.countryCode]);

  const set = <K extends keyof Draft>(k: K, value: Draft[K]) => setV((x) => ({ ...x, [k]: value }));
  const setPerson = (i: number, patch: Partial<PersonDraft>) => setV((x) => ({ ...x, people: x.people.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));
  const addPerson = () => setV((x) => (x.people.length >= CENSUS_MAX_PEOPLE ? x : { ...x, people: [...x.people, emptyPerson()] }));
  const removePerson = (i: number) => setV((x) => ({ ...x, people: x.people.filter((_, j) => j !== i) }));

  const country = v.countryCode === CENSUS_OTHER_COUNTRY ? v.otherCountry.trim() : v.countryCode ? PARISH_COUNTRIES[v.countryCode as ParishCountry].fr : '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (country.length < 2) errs.country = tx('Choisissez le pays.', 'Choose the country.', 'Escolha o país.');
    if (v.city.trim().length < 2) errs.city = tx('Indiquez la ville.', 'Enter the city.', 'Indique a cidade.');
    if (v.parish.trim().length < 2) errs.parish = tx('Indiquez la paroisse.', 'Enter the parish.', 'Indique a paróquia.');
    v.people.forEach((p, i) => {
      if (!p.sex) errs[`sex${i}`] = tx('Choisissez.', 'Choose.', 'Escolha.');
      if (!p.age) errs[`age${i}`] = tx('Choisissez.', 'Choose.', 'Escolha.');
    });
    if (v.forOther && v.recordedBy.trim().length < 2) errs.recordedBy = tx('Indiquez votre nom.', 'Enter your name.', 'Indique o seu nome.');
    if (!v.consent) errs.consent = tx('Cochez la case pour envoyer.', 'Tick the box to send.', 'Marque a caixa para enviar.');
    setErrors(errs);
    if (Object.keys(errs).length) {
      notify(tx('Il manque des informations (en rouge).', 'Some information is missing (in red).', 'Faltam informações (a vermelho).'), 'error');
      return;
    }
    if (v.website) { setDone({ status: 'created', people: v.people.length }); return; }
    const input: CensusInput = {
      country, province: v.province, city: v.city, parish: v.parish, section: v.section, contactName: v.contactName, matricule: v.matricule, phone: v.phone,
      recordedBy: v.forOther ? v.recordedBy : '', people: v.people.map((p) => ({ name: p.name, sex: p.sex as CensusSex, age: p.age as CensusAge, status: (p.status || undefined) as CensusPerson['status'] })),
    };
    setBusy(true);
    try {
      const res = await submitCensus(input, token);
      if (res.token) {
        const label = [v.contactName.trim() || v.people[0]?.name.trim() || tx('Foyer', 'Household', 'Agregado'), v.parish.trim()].filter(Boolean).join(' · ');
        saveLocalEntry({ token: res.token, label, people: v.people.length, at: new Date().toISOString() });
        setMine(readLocalEntries());
      }
      setDone({ status: res.status, people: v.people.length });
      if (res.status === 'created' || res.status === 'updated') {
        setToken(null);
        if (params.get('modifier')) setParams({}, { replace: true });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      notify(err instanceof Error ? err.message : tx('Envoi impossible.', 'Could not send.', 'Envio impossível.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const another = (keepPlace: boolean) => {
    setDone(null); setToken(null); setErrors({});
    setV((x) => ({ ...emptyDraft(), ...(keepPlace ? { countryCode: x.countryCode, otherCountry: x.otherCountry, province: x.province, city: x.city, parish: x.parish, section: x.section, forOther: x.forOther, recordedBy: x.recordedBy } : {}) }));
  };

  const s = stats.data;
  return (
    <>
      <PageHeader
        eyebrow={tx('Recensement des fidèles', 'Census of the faithful', 'Recenseamento dos fiéis')}
        title={tx('Faites-vous compter', 'Be counted', 'Faça-se contar')}
        description={tx(
          'Aidez l’Église à savoir combien nous sommes, dans chaque paroisse, dans chaque pays et à chaque âge. Une seule fiche par foyer : vous pouvez y inscrire toute votre famille.',
          'Help the Church know how many we are, in each parish, each country and at every age. One form per household: you can include your whole family.',
          'Ajude a Igreja a saber quantos somos, em cada paróquia, em cada país e em cada idade. Uma só ficha por agregado: pode incluir toda a sua família.')} />

      <section className="container-page grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="min-w-0">
          {done ? (
            <Result done={done} onAnother={another} />
          ) : (
            <form onSubmit={submit} noValidate className="space-y-8">
              {token && (
                <p className="rounded-2xl border border-gold-300 bg-gold-50 px-4 py-3 text-sm text-night">
                  <Pencil className="mr-1.5 inline h-4 w-4" aria-hidden />{tx('Vous corrigez une fiche déjà envoyée. Elle sera remplacée.', 'You are correcting an entry already sent. It will be replaced.', 'Está a corrigir uma ficha já enviada. Ela será substituída.')}
                </p>
              )}

              <fieldset className="space-y-4 rounded-3xl border border-night/[0.08] bg-white p-5 shadow-sm sm:p-7">
                <legend className="px-2 font-display text-xl font-semibold text-night">1. {tx('Où priez-vous ?', 'Where do you worship?', 'Onde ora?')}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={tx('Pays', 'Country', 'País')} required error={errors.country}>
                    {(p) => (
                      <Select {...p} value={v.countryCode} onChange={(e) => set('countryCode', e.target.value)}>
                        <option value="">{tx('Choisir…', 'Choose…', 'Escolher…')}</option>
                        {COUNTRY_CODES.map((c) => <option key={c} value={c}>{PARISH_COUNTRIES[c][locale]}</option>)}
                        <option value={CENSUS_OTHER_COUNTRY}>{tx('Autre pays', 'Other country', 'Outro país')}</option>
                      </Select>
                    )}
                  </Field>
                  {v.countryCode === CENSUS_OTHER_COUNTRY && (
                    <Field label={tx('Nom du pays', 'Country name', 'Nome do país')} required error={errors.country}>{(p) => <Input {...p} value={v.otherCountry} onChange={(e) => set('otherCountry', e.target.value)} maxLength={80} />}</Field>
                  )}
                  <Field label={tx('Province ou région (facultatif)', 'Province or region (optional)', 'Província ou região (facultativo)')}>{(p) => <Input {...p} value={v.province} onChange={(e) => set('province', e.target.value)} maxLength={120} placeholder={tx('Ex. Kongo Central', 'E.g. Kongo Central', 'Ex. Kongo Central')} />}</Field>
                  <Field label={tx('Ville', 'City', 'Cidade')} required error={errors.city}>{(p) => <Input {...p} value={v.city} onChange={(e) => set('city', e.target.value)} maxLength={120} autoComplete="address-level2" />}</Field>
                  <Field label={tx('Paroisse', 'Parish', 'Paróquia')} required error={errors.parish} hint={tx('Commencez à écrire : la liste officielle s’affiche.', 'Start typing: the official list appears.', 'Comece a escrever: aparece a lista oficial.')}>
                    {(p) => <Input {...p} value={v.parish} onChange={(e) => set('parish', e.target.value)} maxLength={160} list="recensement-paroisses" />}
                  </Field>
                  <Field label={tx('Section ou sous-section (facultatif)', 'Section or sub-section (optional)', 'Secção ou subsecção (facultativo)')}>{(p) => <Input {...p} value={v.section} onChange={(e) => set('section', e.target.value)} maxLength={160} />}</Field>
                </div>
                <datalist id="recensement-paroisses">{parishOptions.map((o) => <option key={o} value={o} />)}</datalist>
              </fieldset>

              <fieldset className="space-y-4 rounded-3xl border border-night/[0.08] bg-white p-5 shadow-sm sm:p-7">
                <legend className="px-2 font-display text-xl font-semibold text-night">2. {tx('Le foyer', 'The household', 'O agregado')}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={tx('Nom du responsable du foyer (facultatif)', 'Name of the head of household (optional)', 'Nome do responsável do agregado (facultativo)')} hint={tx('NOM Postnom Prénom', 'SURNAME Middle name First name', 'APELIDO Nome do meio Nome')}>
                    {(p) => <Input {...p} value={v.contactName} onChange={(e) => set('contactName', e.target.value)} maxLength={160} autoComplete="name" />}
                  </Field>
                  <Field label={tx('Matricule KCC (facultatif)', 'KCC member number (optional)', 'Matrícula KCC (facultativo)')} hint={tx('Ex. KCC-MMR-00256', 'E.g. KCC-MMR-00256', 'Ex. KCC-MMR-00256')}>
                    {(p) => <Input {...p} value={v.matricule} onChange={(e) => set('matricule', e.target.value)} maxLength={40} autoCapitalize="characters" />}
                  </Field>
                  {!token && (
                    <Field label={tx('Téléphone du foyer (facultatif)', 'Household phone (optional)', 'Telefone do agregado (facultativo)')} className="sm:col-span-2"
                      hint={tx('Il sert seulement à éviter qu’un foyer soit compté deux fois. Il n’est pas enregistré en clair et personne ne pourra le lire.', 'Only used so a household is not counted twice. It is not stored in readable form and nobody can read it.', 'Serve apenas para evitar que um agregado seja contado duas vezes. Não é guardado de forma legível e ninguém o poderá ler.')}>
                      {(p) => <Input {...p} type="tel" inputMode="tel" value={v.phone} onChange={(e) => set('phone', e.target.value)} maxLength={20} autoComplete="tel" />}
                    </Field>
                  )}
                </div>
                <Checkbox checked={v.forOther} onChange={(e) => set('forOther', e.target.checked)}
                  label={tx('Je remplis cette fiche pour une autre famille', 'I am filling in this form for another family', 'Estou a preencher esta ficha para outra família')}
                  description={tx('Par exemple une famille sans téléphone de votre paroisse.', 'For example a family in your parish without a phone.', 'Por exemplo uma família da sua paróquia sem telefone.')} />
                {v.forOther && (
                  <Field label={tx('Votre nom (recenseur)', 'Your name (census taker)', 'O seu nome (recenseador)')} required error={errors.recordedBy}>{(p) => <Input {...p} value={v.recordedBy} onChange={(e) => set('recordedBy', e.target.value)} maxLength={160} />}</Field>
                )}
              </fieldset>

              <fieldset className="space-y-4 rounded-3xl border border-night/[0.08] bg-white p-5 shadow-sm sm:p-7">
                <legend className="px-2 font-display text-xl font-semibold text-night">3. {tx('Les personnes du foyer', 'People in the household', 'As pessoas do agregado')} <span className="text-base font-normal text-ink/50">({v.people.length})</span></legend>
                <p className="text-sm text-ink/60">{tx('Ajoutez chaque personne qui vit avec vous et fréquente l’Église, enfants compris. Le prénom est facultatif.', 'Add each person who lives with you and attends the Church, children included. The first name is optional.', 'Acrescente cada pessoa que vive consigo e frequenta a Igreja, incluindo as crianças. O nome é facultativo.')}</p>
                <ol className="space-y-3">
                  {v.people.map((person, i) => (
                    <li key={i} className="rounded-2xl border border-night/[0.08] bg-mist/50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-night">{i === 0 ? tx('Personne 1 (responsable)', 'Person 1 (head)', 'Pessoa 1 (responsável)') : tx(`Personne ${i + 1}`, `Person ${i + 1}`, `Pessoa ${i + 1}`)}</p>
                        {v.people.length > 1 && (
                          <button type="button" onClick={() => removePerson(i)} className="inline-flex items-center gap-1 text-sm text-red-700 hover:text-red-900">
                            <Trash2 className="h-4 w-4" aria-hidden />{tx('Retirer', 'Remove', 'Retirar')}
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label={tx('Prénom (facultatif)', 'First name (optional)', 'Nome (facultativo)')}>{(p) => <Input {...p} value={person.name} onChange={(e) => setPerson(i, { name: e.target.value })} maxLength={80} />}</Field>
                        <Field label={tx('Sexe', 'Sex', 'Sexo')} required error={errors[`sex${i}`]}>
                          {(p) => <Select {...p} value={person.sex} onChange={(e) => setPerson(i, { sex: e.target.value as CensusSex })}><option value="">…</option>{CENSUS_SEXES.map((x) => <option key={x.key} value={x.key}>{L(x)}</option>)}</Select>}
                        </Field>
                        <Field label={tx('Âge', 'Age', 'Idade')} required error={errors[`age${i}`]}>
                          {(p) => <Select {...p} value={person.age} onChange={(e) => setPerson(i, { age: e.target.value as CensusAge })}><option value="">…</option>{CENSUS_AGES.map((x) => <option key={x.key} value={x.key}>{L(x)}</option>)}</Select>}
                        </Field>
                        <Field label={tx('Situation (facultatif)', 'Status (optional)', 'Situação (facultativo)')}>
                          {(p) => <Select {...p} value={person.status} onChange={(e) => setPerson(i, { status: e.target.value as CensusStatus })}><option value="">—</option>{CENSUS_STATUSES.map((x) => <option key={x.key} value={x.key}>{L(x)}</option>)}</Select>}
                        </Field>
                      </div>
                    </li>
                  ))}
                </ol>
                {v.people.length < CENSUS_MAX_PEOPLE && (
                  <Button variant="outline" icon={<Plus className="h-4 w-4" />} onClick={addPerson}>{tx('Ajouter une personne', 'Add a person', 'Acrescentar uma pessoa')}</Button>
                )}
              </fieldset>

              <div className="space-y-4 rounded-3xl border border-night/[0.08] bg-mist/60 p-5 sm:p-7">
                <Checkbox checked={v.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent}
                  label={tx('J’accepte que ces informations servent au recensement de l’Église', 'I agree that this information is used for the Church census', 'Aceito que estas informações sirvam para o recenseamento da Igreja')}
                  description={tx('Seule l’administration de l’Église peut lire les fiches. Seuls des totaux (sans nom) sont montrés au public.', 'Only the Church administration can read the forms. Only totals (without names) are shown publicly.', 'Só a administração da Igreja pode ler as fichas. Só os totais (sem nomes) são mostrados ao público.')} />
                {errors.consent && <p role="alert" className="text-sm text-red-600">{errors.consent}</p>}
                <p className="text-xs text-ink/60">
                  {tx('Pour en savoir plus :', 'To learn more:', 'Para saber mais:')} <Link to="/confidentialite" className="font-semibold text-gold-700 underline">{tx('politique de confidentialité', 'privacy policy', 'política de privacidade')}</Link>.
                </p>
                <div className="hidden" aria-hidden><label>Site web<input tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set('website', e.target.value)} /></label></div>
                <Button type="submit" size="lg" loading={busy} disabled={busy} icon={<Send className="h-4 w-4" />}>
                  {token ? tx('Enregistrer la correction', 'Save the correction', 'Guardar a correção') : tx('Envoyer la fiche', 'Send the form', 'Enviar a ficha')}
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl bg-night-900 p-6 text-white shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">{tx('Déjà recensés', 'Counted so far', 'Já recenseados')}</p>
            <p className="mt-2 font-display text-5xl font-semibold">{s ? s.people.toLocaleString(locale) : '…'}</p>
            <p className="text-sm text-white/70">{tx('fidèles', 'faithful', 'fiéis')}</p>
            <dl className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
              <Mini icon={<Home className="h-4 w-4" />} value={s?.households} label={tx('foyers', 'households', 'agregados')} />
              <Mini icon={<ClipboardList className="h-4 w-4" />} value={s?.parishes} label={tx('paroisses', 'parishes', 'paróquias')} />
              <Mini icon={<Globe2 className="h-4 w-4" />} value={s?.countries} label={tx('pays', 'countries', 'países')} />
            </dl>
          </div>
          {mine.length > 0 && (
            <div className="rounded-3xl border border-night/[0.08] bg-white p-5 shadow-sm">
              <p className="font-display text-lg font-semibold text-night">{tx('Envoyées depuis ce téléphone', 'Sent from this phone', 'Enviadas deste telefone')}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {mine.map((m) => (
                  <li key={m.token} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-ink/80"><Users className="mr-1 inline h-4 w-4 text-gold-600" aria-hidden />{m.label} ({m.people})</span>
                    <button type="button" onClick={() => setParams({ modifier: m.token })} className="shrink-0 font-semibold text-gold-700 hover:text-night">{tx('Corriger', 'Edit', 'Corrigir')}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-3xl border border-night/[0.08] bg-white p-5 text-sm text-ink/70 shadow-sm">
            <p className="font-semibold text-night">{tx('Pourquoi ce recensement ?', 'Why this census?', 'Porquê este recenseamento?')}</p>
            <p className="mt-2">{tx('Pour mieux organiser les paroisses, les sections, l’encadrement des jeunes et des néophytes, et l’entraide entre fidèles.', 'To better organise parishes, sections, the care of young people and neophytes, and mutual help between the faithful.', 'Para organizar melhor as paróquias, as secções, o acompanhamento dos jovens e dos neófitos, e a entreajuda entre fiéis.')}</p>
          </div>
        </aside>
      </section>
    </>
  );
}

function Mini({ icon, value, label }: { icon: JSX.Element; value?: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.07] px-2 py-3">
      <span className="mx-auto flex w-fit text-gold-300" aria-hidden>{icon}</span>
      <dd className="mt-1 font-display text-xl font-semibold">{value ?? '…'}</dd>
      <dt className="text-xs text-white/65">{label}</dt>
    </div>
  );
}

function Result({ done, onAnother }: { done: { status: CensusResult; people: number }; onAnother: (keepPlace: boolean) => void }) {
  const { tx } = useI18n();
  const ok = done.status === 'created' || done.status === 'updated';
  const text = {
    created: tx(`Merci ! Votre foyer (${done.people} personne${done.people > 1 ? 's' : ''}) est recensé.`, `Thank you! Your household (${done.people} ${done.people > 1 ? 'people' : 'person'}) has been counted.`, `Obrigado! O seu agregado (${done.people} pessoa${done.people > 1 ? 's' : ''}) foi recenseado.`),
    updated: tx('Merci, la fiche a été corrigée.', 'Thank you, the entry has been corrected.', 'Obrigado, a ficha foi corrigida.'),
    duplicate_phone: tx('Ce numéro de téléphone a déjà été recensé. Pour corriger la fiche, utilisez le téléphone qui l’a envoyée (bouton « Corriger »), ou écrivez à l’administration.', 'This phone number has already been counted. To correct the entry, use the phone that sent it (“Edit” button), or contact the administration.', 'Este número de telefone já foi recenseado. Para corrigir a ficha, use o telefone que a enviou (botão «Corrigir»), ou escreva à administração.'),
    duplicate_matricule: tx('Ce matricule a déjà été recensé. Chaque fidèle n’est compté qu’une fois.', 'This member number has already been counted. Each person is counted only once.', 'Esta matrícula já foi recenseada. Cada fiel só é contado uma vez.'),
    duplicate: tx('Une fiche avec le même nom, la même paroisse et le même âge existe déjà. Votre foyer est sans doute déjà compté.', 'An entry with the same name, parish and age already exists. Your household is probably already counted.', 'Já existe uma ficha com o mesmo nome, paróquia e idade. O seu agregado provavelmente já foi contado.'),
  }[done.status];
  return (
    <div role="status" className={cn('rounded-3xl border p-6 sm:p-8', ok ? 'border-emerald-200 bg-emerald-50' : 'border-gold-300 bg-gold-50')}>
      {ok && <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />}
      <p className="mt-3 font-display text-2xl font-semibold text-night">{text}</p>
      {ok && <p className="mt-2 text-ink/70">{tx('Invitez votre famille et votre paroisse à se faire recenser aussi.', 'Invite your family and parish to be counted too.', 'Convide a sua família e a sua paróquia a recensear-se também.')}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button icon={<Plus className="h-4 w-4" />} className="h-auto min-h-11 whitespace-normal py-2.5 text-left" onClick={() => onAnother(true)}>{tx('Recenser une autre famille (même paroisse)', 'Count another family (same parish)', 'Recensear outra família (mesma paróquia)')}</Button>
        <Button variant="outline" onClick={() => onAnother(false)}>{tx('Nouvelle fiche vide', 'New blank form', 'Nova ficha vazia')}</Button>
      </div>
      <div className="mt-6">
        <ShareButtons url="/recensement" title={tx('Recensement des fidèles KCC : faites-vous compter', 'KCC census of the faithful: be counted', 'Recenseamento dos fiéis KCC: faça-se contar')}
          text={tx('Une fiche par foyer, en 2 minutes, sur le site Je suis KCCiste.', 'One form per household, in 2 minutes, on the Je suis KCCiste website.', 'Uma ficha por agregado, em 2 minutos, no site Je suis KCCiste.')} />
      </div>
    </div>
  );
}
