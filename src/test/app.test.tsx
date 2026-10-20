import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { RequireAuth, RequirePermission } from '@/routes/guards';
import { getQuiz, submitQuiz, verifyCertificate, listPublishedAnnouncements, declareContribution, listProjectContributions } from '@/services';
import { signupStep3 } from '@/features/auth/schemas';
import { useForm } from 'react-hook-form';
import { Checkbox } from '@/components/ui/Form';

function Harness({ initial }: { initial: string }) {
  return (
    <AuthProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/connexion" element={<LoginStub />} />
          <Route path="/acces-refuse" element={<p>refusé</p>} />
          <Route element={<RequireAuth />}><Route path="/espace" element={<p>espace membre</p>} /></Route>
          <Route element={<RequirePermission permission="admin.access" />}><Route path="/admin" element={<p>administration</p>} /></Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}
function LoginStub() {
  const { signInDemo, profile, signOut } = useAuth();
  return (
    <div>
      <p>page connexion</p>
      <button onClick={() => signInDemo('member')}>membre</button>
      <button onClick={() => signInDemo('central_admin')}>admin</button>
      {profile && <button onClick={() => signOut()}>sortir</button>}
    </div>
  );
}

beforeEach(() => sessionStorage.clear());

describe('Protection des routes', () => {
  it('redirige un visiteur vers la connexion', () => {
    render(<Harness initial="/espace" />);
    expect(screen.getByText('page connexion')).toBeInTheDocument();
  });
  it('autorise un membre connecté dans son espace', () => {
    sessionStorage.setItem('kcc.demo.session', JSON.stringify({ id: 'demo-member', firstName: 'A', lastName: 'B', status: 'active', roles: [{ role: 'member' }], privacy: {} }));
    render(<Harness initial="/espace" />);
    expect(screen.getByText('espace membre')).toBeInTheDocument();
  });
  it('refuse l’administration à un simple membre', () => {
    sessionStorage.setItem('kcc.demo.session', JSON.stringify({ id: 'demo-member', firstName: 'A', lastName: 'B', status: 'active', roles: [{ role: 'member' }], privacy: {} }));
    render(<Harness initial="/admin" />);
    expect(screen.getByText('refusé')).toBeInTheDocument();
  });
  it('bloque un compte en attente de validation', () => {
    sessionStorage.setItem('kcc.demo.session', JSON.stringify({ id: 'demo-x', firstName: 'A', lastName: 'B', status: 'pending', roles: [{ role: 'member' }, { role: 'central_admin' }], privacy: {} }));
    render(<Harness initial="/admin" />);
    expect(screen.getByText(/en attente de validation/i)).toBeInTheDocument();
  });
  it('connexion puis déconnexion (démo)', async () => {
    render(<Harness initial="/connexion" />);
    fireEvent.click(screen.getByText('admin'));
    await waitFor(() => expect(sessionStorage.getItem('kcc.demo.session')).toContain('central_admin'));
    fireEvent.click(screen.getByText('sortir'));
    await waitFor(() => expect(sessionStorage.getItem('kcc.demo.session')).toBeNull());
  });
});

describe('Examens (démonstration)', () => {
  it('les questions envoyées au navigateur ne contiennent pas les bonnes réponses', async () => {
    const quiz = await getQuiz('quiz-1');
    expect(JSON.stringify(quiz)).not.toMatch(/correct/i);
  });
  it('soumission, résultat, certificat vérifiable', async () => {
    const r = await submitQuiz('quiz-1', 'u-test', 'Testeur', { q1: 'q1b', q2: 'q2a', q3: 'q3b', q4: 'q4b' });
    expect(r.score).toBe(100);
    expect(r.passed).toBe(true);
    expect(r.certificateCode).toBeTruthy();
    expect((await verifyCertificate(r.certificateCode!))?.holderName).toBe('Testeur');
    await expect(submitQuiz('quiz-1', 'u-test', 'Testeur', {})).rejects.toThrow(/déjà réussi/);
  });
});

describe('Publications et solidarité (démonstration)', () => {
  it('les annonces réservées ne sont pas visibles par un visiteur', async () => {
    const pub = await listPublishedAnnouncements({ signedIn: false });
    const mem = await listPublishedAnnouncements({ signedIn: true });
    expect(pub.every((a) => a.audience === 'public')).toBe(true);
    expect(mem.length).toBeGreaterThan(pub.length);
    expect(mem.some((a) => a.status !== 'published')).toBe(false);
  });
  it('une contribution déclarée reste « déclarée »', async () => {
    const c = await declareContribution({ projectId: 'prj-1', contributorId: 'u', contributorLabel: 'u', amount: 5, currency: 'USD', provider: 'mpesa', transactionReference: null });
    expect(c.status).toBe('declared');
    expect((await listProjectContributions('prj-1')).find((x) => x.id === c.id)?.status).toBe('declared');
  });
});

describe('Validation du formulaire d’inscription', () => {
  it('exige un mot de passe robuste, identique, et le consentement', () => {
    expect(signupStep3.safeParse({ email: 'a@b.cd', password: 'court', confirm: 'court', consent: true }).success).toBe(false);
    expect(signupStep3.safeParse({ email: 'a@b.cd', password: 'MotDePasse123', confirm: 'Autre123456', consent: true }).success).toBe(false);
    expect(signupStep3.safeParse({ email: 'a@b.cd', password: 'MotDePasse123', confirm: 'MotDePasse123', consent: false }).success).toBe(false);
    expect(signupStep3.safeParse({ email: 'a@b.cd', password: 'MotDePasse123', confirm: 'MotDePasse123', consent: true }).success).toBe(true);
  });
});

describe('Case à cocher reliée au formulaire', () => {
  it('transmet la valeur cochée à react-hook-form', async () => {
    let value: unknown;
    function ConsentForm() {
      const { register, handleSubmit } = useForm<{ consent: boolean }>({ defaultValues: { consent: false } });
      return <form onSubmit={handleSubmit((v) => { value = v.consent; })}><Checkbox {...register('consent')} label="J’accepte" /><button type="submit">Envoyer</button></form>;
    }
    render(<ConsentForm />);
    fireEvent.click(screen.getByLabelText('J’accepte'));
    fireEvent.click(screen.getByText('Envoyer'));
    await waitFor(() => expect(value).toBe(true));
  });
});
