import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CrudTable } from '@/features/administration/CrudTable';
import { CONTRACT_LABELS, isOpen, jobErrorText, jobOffersRepo } from '@/features/jobs/jobs';
import type { Repository } from '@/services/repository';
import { formatDate } from '@/utils/format';
import type { JobContractType, JobOffer } from '@/types';

const wrap = <A extends unknown[], R>(fn: (...a: A) => Promise<R>) => async (...a: A): Promise<R> => {
  try {
    return await fn(...a);
  } catch (e) {
    throw new Error(jobErrorText(e));
  }
};
const adminRepo: Repository<JobOffer> = {
  ...jobOffersRepo,
  list: wrap(jobOffersRepo.list),
  all: wrap(jobOffersRepo.all),
  create: wrap(jobOffersRepo.create),
  update: wrap(jobOffersRepo.update),
  remove: wrap(jobOffersRepo.remove),
};

const req = (v: unknown, min: number, max: number, label: string) => {
  const s = String(v ?? '').trim();
  if (s.length < min || s.length > max) throw new Error(`${label} : entre ${min} et ${max} caractères.`);
  return s;
};

export default function AdminJobs() {
  return (
    <>
      <h1 className="mb-4 font-display text-2xl font-semibold text-night">Opportunités et emplois</h1>
      <Card className="mb-6">
        <CardBody className="space-y-2 text-sm text-ink/75">
          <p className="font-semibold text-night">Deux sortes d’offres sur la page <Link to="/emplois" className="text-night-500 underline">Opportunités et emplois</Link></p>
          <ul className="list-disc space-y-1 pl-5">
            <li><span className="font-semibold">Les offres du jour</span> arrivent seules, chaque jour (jusqu’à 50) : offres réelles de sites d’emploi reconnus, avec le lien de l’annonce d’origine. Rien à faire ici.</li>
            <li><span className="font-semibold">Les offres de la communauté</span> sont celles que vous ajoutez ci-dessous : une affiche reçue d’une entreprise, une offre partagée dans le groupe WhatsApp… Indiquez toujours d’où vient l’offre et comment postuler.</li>
          </ul>
          <p>Une offre disparaît toute seule de la page après sa date limite.</p>
        </CardBody>
      </Card>
      <CrudTable<JobOffer> entity="job_offers" title="Offres de la communauté" repo={adminRepo} searchFields={['title', 'organization']} pageSize={20}
        defaults={{ contractType: 'emploi', published: true }}
        columns={[
          { key: 'title', label: 'Offre' },
          { key: 'organization', label: 'Employeur' },
          { key: 'contractType', label: 'Type', render: (o) => CONTRACT_LABELS[o.contractType]?.fr ?? o.contractType },
          { key: 'closingDate', label: 'Date limite', render: (o) => (o.closingDate ? formatDate(o.closingDate, 'fr', { day: 'numeric', month: 'short', year: 'numeric' }) : '—') },
          { key: 'published', label: 'Statut', render: (o) => (isOpen(o) ? <Badge tone="green">En ligne</Badge> : <Badge>{o.published ? 'Expirée' : 'Masquée'}</Badge>) },
        ]}
        formFields={[
          { key: 'title', label: 'Intitulé du poste', type: 'text', required: true, hint: 'Ex. : Comptable, Chauffeur, Stage en informatique…' },
          { key: 'organization', label: 'Employeur', type: 'text', required: true },
          { key: 'location', label: 'Lieu', type: 'text', hint: 'Ex. : Kinshasa / Gombe, Matadi, télétravail…' },
          { key: 'contractType', label: 'Type d’opportunité', type: 'select', options: (Object.keys(CONTRACT_LABELS) as JobContractType[]).map((k) => ({ value: k, label: CONTRACT_LABELS[k].fr })) },
          { key: 'closingDate', label: 'Date limite pour postuler', type: 'date' },
          { key: 'applyTo', label: 'Comment postuler', type: 'text', required: true, full: true, hint: 'Lien de l’offre, adresse e-mail ou numéro de téléphone.' },
          { key: 'source', label: 'Source de l’offre', type: 'text', required: true, full: true, hint: 'Ex. : Affiche de l’entreprise, site officiel, communiqué reçu le 11/11/2026…' },
          { key: 'description', label: 'Description (facultatif)', type: 'textarea', full: true, hint: 'Missions, profil recherché, documents à envoyer… (5 000 caractères au plus)' },
          { key: 'published', label: 'Publier sur le site', type: 'checkbox' },
        ]}
        transformBeforeSave={(v) => ({
          ...v,
          title: req(v.title, 3, 200, 'Intitulé'),
          organization: req(v.organization, 2, 200, 'Employeur'),
          applyTo: req(v.applyTo, 3, 500, 'Comment postuler'),
          source: req(v.source, 2, 300, 'Source'),
          location: String(v.location ?? '').trim() || null,
          description: String(v.description ?? '').trim().slice(0, 5000) || null,
          closingDate: v.closingDate || null,
          contractType: (v.contractType as string) || 'emploi',
          published: !!v.published,
        })}
      />
    </>
  );
}
