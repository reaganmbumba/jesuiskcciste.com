import { describe, expect, it } from 'vitest';
import { photoReminder, registrationReport } from '@/pages/admin/AdminRegistrations';
import type { Profile } from '@/types';

const m = (id: string, firstName: string, lastName: string, middleName: string | null, city: string) =>
  ({ id, firstName, lastName, middleName, city, country: 'RD Congo', parishId: 'p1', status: 'active', roles: [] } as unknown as Profile);

describe('Rapport des inscriptions pour le groupe WhatsApp', () => {
  it('liste les noms numérotés, le lien d’inscription et le groupe, sans matricule', () => {
    const text = registrationReport([m('1', 'Reagan', 'Mbumba', 'Mbumba', 'Kinshasa'), m('2', 'Grâce', 'Nsimba', null, 'Matadi')], () => 'Paroisse Centre', 'https://www.jesuiskcciste.com');
    expect(text).toContain('1. Mbumba Mbumba Reagan — Paroisse Centre, Kinshasa');
    expect(text).toContain('2. Nsimba Grâce — Paroisse Centre, Matadi');
    expect(text).toContain('les 2 KCCistes');
    expect(text).toContain('https://www.jesuiskcciste.com/matricule');
    expect(text).toContain('chat.whatsapp.com');
    expect(text).not.toMatch(/KCC-/);
  });
  it('signale les inscrits sans photo et prépare un rappel ciblé', () => {
    const avec = { ...m('1', 'Reagan', 'Mbumba', 'Mbumba', 'Kinshasa'), avatarUrl: 'https://x/a.jpg' } as Profile;
    const sans = m('2', 'Grâce', 'Nsimba', null, 'Matadi');
    const text = registrationReport([avec, sans], () => null, 'https://www.jesuiskcciste.com');
    expect(text).toContain('1. Mbumba Mbumba Reagan — Kinshasa\n');
    expect(text).toContain('2. Nsimba Grâce — Matadi 📸 _photo manquante_');
    expect(text).toContain('1 inscrit n’a pas encore de photo');
    const rappel = photoReminder([sans], 'https://www.jesuiskcciste.com');
    expect(rappel).toContain('1. Nsimba Grâce');
    expect(rappel).not.toContain('Reagan');
  });
});
