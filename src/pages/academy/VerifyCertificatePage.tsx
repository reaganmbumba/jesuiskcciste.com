import { useState, type FormEvent } from 'react';
import { BadgeCheck, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { DemoInline } from '@/components/common/DemoNotice';
import { verifyCertificate } from '@/services';
import type { Certificate } from '@/types';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';

export default function VerifyCertificatePage() {
  const { locale } = useI18n();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Certificate | null | undefined>(undefined);
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^KCC-\d{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(code.trim())) { setError('Format attendu : KCC-AAAA-XXXX-XXXX'); return; }
    setError(''); setLoading(true);
    try { setResult(await verifyCertificate(code)); } catch (err) { setError(err instanceof Error ? err.message : 'Vérification impossible.'); } finally { setLoading(false); }
  };
  return (
    <>
      <PageHeader eyebrow="Académie KCC" title="Vérifier un certificat" description="Saisissez l’identifiant unique figurant sur le certificat pour en confirmer l’authenticité." />
      <section className="container-page max-w-xl py-12">
        <DemoInline>Démonstration : seuls les certificats obtenus dans cet onglet peuvent être vérifiés.</DemoInline>
        <Card><CardBody>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Identifiant du certificat" error={error} required>{(p) => <Input {...p} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="KCC-2026-XXXX-XXXX" className="font-mono" />}</Field>
            <Button type="submit" loading={loading} className="w-full">Vérifier</Button>
          </form>
        </CardBody></Card>
        {result === null && <div role="status" className="mt-6 flex gap-3 rounded-2xl bg-red-50 p-5 text-red-800 ring-1 ring-red-200"><ShieldAlert className="h-6 w-6 shrink-0" /><p>Aucun certificat valide ne correspond à cet identifiant.</p></div>}
        {result && (
          <div role="status" className="mt-6 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
            <p className="flex items-center gap-2 font-semibold text-emerald-800"><BadgeCheck className="h-6 w-6" />{result.revoked ? 'Certificat révoqué' : 'Certificat authentique'}</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-ink/80">
              <dt className="text-ink/55">Titulaire</dt><dd>{result.holderName}</dd>
              <dt className="text-ink/55">Formation</dt><dd>{result.courseTitle}</dd>
              <dt className="text-ink/55">Délivré le</dt><dd>{formatDate(result.issuedAt, locale)}</dd>
              <dt className="text-ink/55">Identifiant</dt><dd className="font-mono">{result.code}</dd>
            </dl>
          </div>
        )}
      </section>
    </>
  );
}
