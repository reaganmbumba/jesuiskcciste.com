import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, MailCheck } from 'lucide-react';
import { AuthShell } from '@/layouts/AuthShell';
import { Checkbox, Field, Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { DemoInline } from '@/components/common/DemoNotice';
import { useAuth } from '@/features/auth/AuthContext';
import { signupStep1, signupStep2, signupStep3, type SignupValues } from '@/features/auth/schemas';
import { useAsync } from '@/hooks/useAsync';
import { parishesRepo, sectionsRepo } from '@/services';
import { cn } from '@/utils/format';
import type { ZodTypeAny } from 'zod';

const STEPS: { title: string; schema: ZodTypeAny; fields: (keyof SignupValues)[] }[] = [
  { title: 'Identité', schema: signupStep1, fields: ['firstName', 'lastName', 'middleName', 'phone'] },
  { title: 'Rattachement', schema: signupStep2, fields: ['country', 'city', 'parishId', 'sectionId'] },
  { title: 'Compte', schema: signupStep3, fields: ['email', 'password', 'confirm', 'consent'] },
];

/** Inscription progressive en 3 étapes ; le compte est créé « en attente de validation ». */
export default function SignupPage() {
  const { signUp, isDemo } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<'email' | 'pending' | null>(null);
  const [serverError, setServerError] = useState('');
  const { data } = useAsync(() => Promise.all([parishesRepo.all(), sectionsRepo.all()]), []);
  const [parishes = [], sections = []] = data ?? [];
  const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting } } = useForm<SignupValues>({
    mode: 'onTouched',
    resolver: (values, ctx, opts) => zodResolver(STEPS[step].schema)(values, ctx, opts as never),
    defaultValues: { country: 'RD Congo', consent: false as unknown as boolean },
  });
  const parishId = watch('parishId');

  const next = async () => { if (await trigger(STEPS[step].fields)) setStep((s) => s + 1); };
  const onSubmit = handleSubmit(async (v) => {
    setServerError('');
    try {
      const r = await signUp({ ...v, middleName: v.middleName || undefined, phone: v.phone || undefined });
      if (r.needsEmailConfirmation) setDone('email'); else { setDone('pending'); setTimeout(() => navigate('/espace'), 1500); }
    } catch (e) { setServerError(e instanceof Error ? e.message : 'Inscription impossible.'); }
  });

  if (done) return (
    <AuthShell title={done === 'email' ? 'Vérifiez votre boîte e-mail' : 'Demande d’adhésion envoyée'}>
      <div className="rounded-2xl bg-white p-6 text-center shadow-soft">
        <MailCheck className="mx-auto h-10 w-10 text-gold" />
        <p className="mt-3 text-ink/75">{done === 'email' ? 'Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre compte, puis connectez-vous.' : isDemo ? 'Démonstration : aucune donnée n’a été enregistrée. Une session fictive « en attente de validation » a été ouverte dans cet onglet.' : 'Votre compte est en attente de validation par un responsable de votre paroisse.'}</p>
      </div>
    </AuthShell>
  );

  return (
    <AuthShell title="Rejoindre la communauté" subtitle="Trois étapes simples pour créer votre compte JE SUIS KCCiste.">
      <ol className="mb-8 flex items-center gap-2" aria-label="Étapes">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-1 items-center gap-2">
            <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold', i < step ? 'bg-gold text-night' : i === step ? 'bg-night text-white' : 'bg-night/10 text-ink/50')} aria-current={i === step ? 'step' : undefined}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</span>
            <span className={cn('hidden text-sm sm:block', i === step ? 'font-semibold text-night' : 'text-ink/50')}>{s.title}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-night/10" />}
          </li>
        ))}
      </ol>
      {isDemo && <DemoInline>Démonstration : aucun compte réel n’est créé.</DemoInline>}
      <form onSubmit={step === 2 ? onSubmit : (e) => { e.preventDefault(); void next(); }} className="space-y-4" noValidate>
        {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        {step === 0 && (<>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" error={errors.firstName?.message} required>{(p) => <Input {...p} {...register('firstName')} autoComplete="given-name" />}</Field>
            <Field label="Nom" error={errors.lastName?.message} required>{(p) => <Input {...p} {...register('lastName')} autoComplete="family-name" />}</Field>
          </div>
          <Field label="Postnom" hint="Facultatif" error={errors.middleName?.message}>{(p) => <Input {...p} {...register('middleName')} />}</Field>
          <Field label="Téléphone" hint="Facultatif · jamais affiché publiquement par défaut" error={errors.phone?.message}>{(p) => <Input {...p} {...register('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+243 …" />}</Field>
        </>)}
        {step === 1 && (<>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pays" error={errors.country?.message} required>{(p) => <Input {...p} {...register('country')} autoComplete="country-name" />}</Field>
            <Field label="Ville" error={errors.city?.message} required>{(p) => <Input {...p} {...register('city')} autoComplete="address-level2" />}</Field>
          </div>
          <Field label="Paroisse" hint="Votre rattachement sera validé par un responsable.">{(p) => <Select {...p} {...register('parishId')}><option value="">Je ne sais pas / plus tard</option>{parishes.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.city}</option>)}</Select>}</Field>
          <Field label="Section">{(p) => <Select {...p} {...register('sectionId')} disabled={!parishId}><option value="">Aucune / plus tard</option>{sections.filter((s) => s.parishId === parishId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>}</Field>
        </>)}
        {step === 2 && (<>
          <Field label="Adresse e-mail" error={errors.email?.message} required>{(p) => <Input {...p} {...register('email')} type="email" autoComplete="email" inputMode="email" />}</Field>
          <Field label="Mot de passe" hint="10 caractères minimum, avec lettres et chiffres." error={errors.password?.message} required>{(p) => <Input {...p} {...register('password')} type="password" autoComplete="new-password" />}</Field>
          <Field label="Confirmer le mot de passe" error={errors.confirm?.message} required>{(p) => <Input {...p} {...register('confirm')} type="password" autoComplete="new-password" />}</Field>
          <Checkbox {...register('consent')} label="J’accepte les conditions d’utilisation et la politique de confidentialité" description="Vous choisirez ensuite les informations visibles dans l’annuaire." />
          {errors.consent && <p role="alert" className="text-sm text-red-600">{errors.consent.message}</p>}
        </>)}
        <div className="flex gap-3 pt-2">
          {step > 0 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Retour</Button>}
          <Button type="submit" size="lg" className="flex-1" loading={isSubmitting}>{step < 2 ? 'Continuer' : 'Créer mon compte'}</Button>
        </div>
      </form>
      <p className="mt-8 text-center text-sm text-ink/65">Déjà membre ? <Link to="/connexion" className="link-gold">Se connecter</Link> · <Link to="/confidentialite" className="link-gold">Confidentialité</Link></p>
    </AuthShell>
  );
}
