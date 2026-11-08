import { describe, expect, it } from 'vitest';
import { registrationReport } from '@/pages/admin/AdminRegistrations';
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
});
