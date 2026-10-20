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
import { useI18n, type Tri } from '@/i18n';

const STEPS: { title: Tri; schema: ZodTypeAny; fields: (keyof SignupValues)[] }[] = [
  { title: { fr: 'Identité', en: 'Identity', pt: 'Identidade' }, schema: signupStep1, fields: ['firstName', 'lastName', 'middleName', 'phone'] },
  { title: { fr: 'Rattachement', en: 'Affiliation', pt: 'Vínculo' }, schema: signupStep2, fields: ['country', 'city', 'parishId', 'sectionId'] },
  { title: { fr: 'Compte', en: 'Account', pt: 'Conta' }, schema: signupStep3, fields: ['email', 'password', 'confirm', 'consent'] },
];

/** Inscription progressive en 3 étapes ; le compte est créé « en attente de validation ». */
export default function SignupPage() {
  const { signUp, isDemo } = useAuth();
  const { tx, pick } = useI18n();
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
    } catch (e) { setServerError(e instanceof Error ? e.message : tx('Inscription impossible.', 'Sign-up failed.', 'Inscrição impossível.')); }
  });

  if (done) return (
    <AuthShell title={done === 'email' ? tx('Vérifiez votre boîte e-mail', 'Check your inbox', 'Verifique a sua caixa de e-mail') : tx('Demande d’adhésion envoyée', 'Membership request sent', 'Pedido de adesão enviado')}>
      <div className="rounded-2xl bg-white p-6 text-center shadow-soft">
        <MailCheck className="mx-auto h-10 w-10 text-gold" />
        <p className="mt-3 text-ink/75">{done === 'email' ? tx('Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre compte, puis connectez-vous.', 'A confirmation link has been sent to you. Click it to activate your account, then log in.', 'Foi-lhe enviada uma ligação de confirmação. Clique nela para ativar a sua conta e depois inicie sessão.') : isDemo ? tx('Démonstration : aucune donnée n’a été enregistrée. Une session fictive « en attente de validation » a été ouverte dans cet onglet.', 'Demo: no data was saved. A sample session “awaiting approval” has been opened in this tab.', 'Demonstração: nenhum dado foi guardado. Foi aberta neste separador uma sessão fictícia «a aguardar validação».') : tx('Votre compte est en attente de validation par un responsable de votre paroisse.', 'Your account is awaiting approval by a leader of your parish.', 'A sua conta aguarda validação por um responsável da sua paróquia.')}</p>
      </div>
    </AuthShell>
  );

  return (
    <AuthShell title={tx('Rejoindre la communauté', 'Join the community', 'Juntar-se à comunidade')} subtitle={tx('Trois étapes simples pour créer votre compte JE SUIS KCCiste.', 'Three simple steps to create your JE SUIS KCCiste account.', 'Três passos simples para criar a sua conta JE SUIS KCCiste.')}>
      <ol className="mb-8 flex items-center gap-2" aria-label={tx('Étapes', 'Steps', 'Passos')}>
        {STEPS.map((s, i) => (
          <li key={s.title.fr} className="flex flex-1 items-center gap-2">
            <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold', i < step ? 'bg-gold text-night' : i === step ? 'bg-night text-white' : 'bg-night/10 text-ink/50')} aria-current={i === step ? 'step' : undefined}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</span>
            <span className={cn('hidden text-sm sm:block', i === step ? 'font-semibold text-night' : 'text-ink/50')}>{pick(s.title)}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-night/10" />}
          </li>
        ))}
      </ol>
      {isDemo && <DemoInline>{tx('Démonstration : aucun compte réel n’est créé.', 'Demo: no real account is created.', 'Demonstração: nenhuma conta real é criada.')}</DemoInline>}
      <form onSubmit={step === 2 ? onSubmit : (e) => { e.preventDefault(); void next(); }} className="space-y-4" noValidate>
        {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        {step === 0 && (<>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tx('Prénom', 'First name', 'Nome próprio')} error={errors.firstName?.message} required>{(p) => <Input {...p} {...register('firstName')} autoComplete="given-name" />}</Field>
            <Field label={tx('Nom', 'Surname', 'Apelido')} error={errors.lastName?.message} required>{(p) => <Input {...p} {...register('lastName')} autoComplete="family-name" />}</Field>
          </div>
          <Field label={tx('Postnom', 'Middle name (postnom)', 'Pós-nome')} hint={tx('Facultatif', 'Optional', 'Facultativo')} error={errors.middleName?.message}>{(p) => <Input {...p} {...register('middleName')} />}</Field>
          <Field label={tx('Téléphone', 'Phone', 'Telefone')} hint={tx('Facultatif · jamais affiché publiquement par défaut', 'Optional · never shown publicly by default', 'Facultativo · nunca mostrado publicamente por defeito')} error={errors.phone?.message}>{(p) => <Input {...p} {...register('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+243 …" />}</Field>
        </>)}
        {step === 1 && (<>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tx('Pays', 'Country', 'País')} error={errors.country?.message} required>{(p) => <Input {...p} {...register('country')} autoComplete="country-name" />}</Field>
            <Field label={tx('Ville', 'City', 'Cidade')} error={errors.city?.message} required>{(p) => <Input {...p} {...register('city')} autoComplete="address-level2" />}</Field>
          </div>
          <Field label={tx('Paroisse', 'Parish', 'Paróquia')} hint={tx('Votre rattachement sera validé par un responsable.', 'Your affiliation will be approved by a leader.', 'O seu vínculo será validado por um responsável.')}>{(p) => <Select {...p} {...register('parishId')}><option value="">{tx('Je ne sais pas / plus tard', 'I don’t know / later', 'Não sei / mais tarde')}</option>{parishes.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.city}</option>)}</Select>}</Field>
          <Field label={tx('Section', tx('Section', 'Section', 'Secção'), 'Secção')}>{(p) => <Select {...p} {...register('sectionId')} disabled={!parishId}><option value="">{tx('Aucune / plus tard', 'None / later', 'Nenhuma / mais tarde')}</option>{sections.filter((s) => s.parishId === parishId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>}</Field>
        </>)}
        {step === 2 && (<>
          <Field label={tx('Adresse e-mail', 'Email address', 'Endereço de e-mail')} error={errors.email?.message} required>{(p) => <Input {...p} {...register('email')} type="email" autoComplete="email" inputMode="email" />}</Field>
          <Field label={tx('Mot de passe', 'Password', 'Palavra-passe')} hint={tx('10 caractères minimum, avec lettres et chiffres.', 'At least 10 characters, with letters and numbers.', 'Mínimo de 10 caracteres, com letras e números.')} error={errors.password?.message} required>{(p) => <Input {...p} {...register('password')} type="password" autoComplete="new-password" />}</Field>
          <Field label={tx('Confirmer le mot de passe', 'Confirm password', 'Confirmar a palavra-passe')} error={errors.confirm?.message} required>{(p) => <Input {...p} {...register('confirm')} type="password" autoComplete="new-password" />}</Field>
          <Checkbox {...register('consent')} label={tx('J’accepte les conditions d’utilisation et la politique de confidentialité', 'I accept the terms of use and the privacy policy', 'Aceito as condições de utilização e a política de privacidade')} description={tx('Vous choisirez ensuite les informations visibles dans l’annuaire.', 'You will then choose what is visible in the directory.', 'Depois escolherá as informações visíveis no diretório.')} />
          {errors.consent && <p role="alert" className="text-sm text-red-600">{errors.consent.message}</p>}
        </>)}
        <div className="flex gap-3 pt-2">
          {step > 0 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>{tx('Retour', 'Back', 'Voltar')}</Button>}
          <Button type="submit" size="lg" className="flex-1" loading={isSubmitting}>{step < 2 ? tx('Continuer', 'Continue', 'Continuar') : tx('Créer mon compte', 'Create my account', 'Criar a minha conta')}</Button>
        </div>
      </form>
      <p className="mt-8 text-center text-sm text-ink/65">{tx('Déjà membre ?', 'Already a member?', 'Já é membro?')} <Link to="/connexion" className="link-gold">{tx('Se connecter', 'Log in', 'Iniciar sessão')}</Link> · <Link to="/confidentialite" className="link-gold">{tx('Confidentialité', 'Privacy', 'Privacidade')}</Link></p>
    </AuthShell>
  );
}
