import { describe, expect, it } from 'vitest';
import { canAttempt, generateCertificateCode, gradeAnswers } from '@/features/academy/grading';
import { isListable, toDirectoryEntry } from '@/features/community/privacy';
import { canConfirmContribution, summarizeContributions } from '@/features/solidarity/finance';
import { can, canManageCourse, canManageParishScoped } from '@/lib/permissions';
import { toCsv } from '@/utils/csv';
import { camelize, snakify } from '@/utils/case';
import { applyListParams } from '@/services/repository';
import { buildDemoProfile } from '@/features/auth/demoAccounts';
import { demoParishes, demoSections } from '@/services/demo/data';
import type { Contribution, Profile } from '@/types';

describe('Académie — correction des examens', () => {
  const key = { q1: { correct: 'a' }, q2: { correct: 'b' }, q3: { correct: 'c' }, q4: { correct: 'd' } };
  it('calcule le score et la réussite selon le seuil', () => {
    const r = gradeAnswers(['q1', 'q2', 'q3', 'q4'], { q1: 'a', q2: 'b', q3: 'c', q4: 'x' }, key, 70);
    expect(r.correctCount).toBe(3);
    expect(r.score).toBe(75);
    expect(r.passed).toBe(true);
  });
  it('compte les questions sans réponse comme fausses', () => {
    const r = gradeAnswers(['q1', 'q2'], { q1: 'a' }, key, 70);
    expect(r.score).toBe(50);
    expect(r.passed).toBe(false);
    expect(r.corrections[1].selectedOptionId).toBeNull();
  });
  it('refuse une question sans barème', () => {
    expect(() => gradeAnswers(['zz'], {}, key, 50)).toThrow();
  });
  it('limite le nombre de tentatives et bloque après réussite', () => {
    expect(canAttempt(2, 3, false).allowed).toBe(true);
    expect(canAttempt(3, 3, false).allowed).toBe(false);
    expect(canAttempt(0, 3, true).allowed).toBe(false);
    expect(canAttempt(99, 0, false).allowed).toBe(true); // 0 = illimité
  });
  it('génère un code de certificat vérifiable', () => {
    expect(generateCertificateCode(() => 0.5, 2026)).toMatch(/^KCC-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
});

describe('Confidentialité des profils', () => {
  const member: Profile = { ...buildDemoProfile('member'), id: 'x', email: 'x@ex.invalid', phone: '+243', functionTitle: 'Choriste' };
  it('masque e-mail et téléphone par défaut', () => {
    const e = toDirectoryEntry(member, { parishes: demoParishes, sections: demoSections });
    expect(e.email).toBeNull();
    expect(e.phone).toBeNull();
    expect(e.parishName).toBe('Paroisse exemple A');
  });
  it('respecte les choix du membre', () => {
    const e = toDirectoryEntry({ ...member, privacy: { ...member.privacy, showCity: false, showFunction: false } }, { parishes: demoParishes, sections: demoSections });
    expect(e.city).toBeNull();
    expect(e.functionTitle).toBeNull();
  });
  it('les responsables habilités voient les coordonnées', () => {
    expect(toDirectoryEntry(member, { parishes: demoParishes, sections: demoSections, viewerCanSeePrivate: true }).phone).toBe('+243');
  });
  it('exclut les comptes non listés, en attente ou suspendus', () => {
    expect(isListable({ ...member, privacy: { ...member.privacy, listedInDirectory: false } })).toBe(false);
    expect(isListable({ ...member, status: 'pending' })).toBe(false);
    expect(isListable({ ...member, status: 'suspended' })).toBe(false);
    expect(isListable(member)).toBe(true);
  });
});

describe('Rôles et permissions', () => {
  it('un membre n’accède pas à l’administration', () => {
    expect(can(buildDemoProfile('member'), 'admin.access')).toBe(false);
  });
  it('un compte suspendu perd ses droits', () => {
    expect(can({ ...buildDemoProfile('central_admin'), status: 'suspended' }, 'admin.access')).toBe(false);
  });
  it('un responsable de paroisse est limité à sa paroisse', () => {
    const leader = buildDemoProfile('parish_leader'); // paroisse par-1
    expect(canManageParishScoped(leader, 'par-1')).toBe(true);
    expect(canManageParishScoped(leader, 'par-2')).toBe(false);
  });
  it('un formateur ne gère que ses formations', () => {
    const trainer = buildDemoProfile('trainer'); // formation crs-1
    expect(canManageCourse(trainer, 'crs-1')).toBe(true);
    expect(canManageCourse(trainer, 'crs-2')).toBe(false);
  });
  it('un gestionnaire de solidarité ne gère ni examens ni musique', () => {
    const s = buildDemoProfile('solidarity_manager');
    expect(can(s, 'projects.manage')).toBe(true);
    expect(can(s, 'exams.manage')).toBe(false);
    expect(can(s, 'music.manage')).toBe(false);
  });
});

describe('Solidarité', () => {
  const c = (amount: number, status: Contribution['status'], provider: Contribution['provider'] = 'cash'): Contribution => ({ id: String(Math.random()), projectId: 'p', contributorLabel: '', amount, currency: 'USD', provider, status, createdAt: '' });
  it('distingue montants déclarés et confirmés', () => {
    const s = summarizeContributions([c(100, 'confirmed'), c(50, 'declared'), c(20, 'rejected')]);
    expect(s.confirmed).toBe(100);
    expect(s.declared).toBe(50);
  });
  it('une déclaration de paiement mobile ne peut être confirmée sans vérification opérateur', () => {
    expect(canConfirmContribution(c(10, 'declared', 'mpesa'), false, true)).toBe(false);
    expect(canConfirmContribution(c(10, 'declared', 'mpesa'), true, false)).toBe(true);
    expect(canConfirmContribution(c(10, 'declared', 'cash'), false, false)).toBe(false);
    expect(canConfirmContribution(c(10, 'confirmed', 'cash'), false, true)).toBe(false);
  });
});

describe('Utilitaires', () => {
  it('neutralise l’injection de formules dans les CSV', () => {
    expect(toCsv([{ a: '=HYPERLINK("x")' }])).toContain(`'=HYPERLINK`);
  });
  it('convertit snake_case et camelCase', () => {
    expect(camelize<{ firstName: string; privacy: { showCity: boolean } }>({ first_name: 'A', privacy: { show_city: true } })).toEqual({ firstName: 'A', privacy: { showCity: true } });
    expect(snakify({ parishId: 'p', privacy: { showCity: true } })).toEqual({ parish_id: 'p', privacy: { show_city: true } });
  });
  it('filtre, recherche (sans accents) et pagine', () => {
    const rows = [{ id: '1', name: 'Église', c: 'a' }, { id: '2', name: 'Chorale', c: 'b' }, { id: '3', name: 'Eglise B', c: 'a' }];
    const p = applyListParams(rows, { search: 'eglise', searchFields: ['name'], filters: { c: 'a' }, pageSize: 1 });
    expect(p.total).toBe(2);
    expect(p.items).toHaveLength(1);
  });
});
