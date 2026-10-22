import { Archive, Send } from 'lucide-react';
import { CrudTable, IconAction } from '@/features/administration/CrudTable';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { can, canManageCourse } from '@/lib/permissions';
import { coursesRepo, writeAudit } from '@/services';
import { ACCESS_LABELS, LEVEL_LABELS } from '@/features/academy/labels';
import { Navigate } from 'react-router-dom';
import type { Course } from '@/types';

const STATUS = { draft: ['Brouillon', 'neutral'], pending: ['En validation', 'amber'], published: ['Publiée', 'green'], archived: ['Archivée', 'neutral'] } as const;

/** Espace formateur : un formateur ne voit et ne modifie que les formations qui lui sont attribuées. */
export default function AdminCourses() {
  const { profile } = useAuth();
  const { notify } = useToast();
  if (!can(profile, 'courses.manage') && !can(profile, 'courses.manage_own')) return <Navigate to="/acces-refuse" replace />;
  const actor = profile ? `${profile.firstName} ${profile.lastName}` : '';
  const setStatus = async (c: Course, status: Course['status'], reload: () => void) => { await coursesRepo.update(c.id, { status }); await writeAudit(actor, `course.${status}`, 'courses', c.id); notify('Statut mis à jour.'); reload(); };
  return (
    <div className="space-y-6">
      <CrudTable<Course>
        entity="courses" title="Formations" repo={coursesRepo} exportName="formations" canDelete={can(profile, 'courses.manage')} canCreate={can(profile, 'courses.manage')}
        searchFields={['title', 'category']} scope={(c) => canManageCourse(profile, c.id)}
        filters={[{ key: 'status', label: 'Statut', options: Object.entries(STATUS).map(([v, [l]]) => ({ value: v, label: l })) }]}
        columns={[
          { key: 'title', label: 'Formation', render: (c) => <span className="font-medium text-night">{c.title}</span> },
          { key: 'category', label: 'Catégorie' }, { key: 'level', label: 'Niveau', render: (c) => LEVEL_LABELS[c.level] },
          { key: 'access', label: 'Accès', render: (c) => ACCESS_LABELS[c.access].label },
          { key: 'modules', label: 'Modules', render: (c) => c.modules.length, csv: (c) => c.modules.length },
          { key: 'status', label: 'Statut', render: (c) => <Badge tone={STATUS[c.status][1]}>{STATUS[c.status][0]}</Badge>, csv: (c) => STATUS[c.status][0] },
        ]}
        formFields={[
          { key: 'title', label: 'Titre', type: 'text', required: true, full: true }, { key: 'slug', label: 'Identifiant d’URL', type: 'text', required: true, hint: 'Lettres minuscules et tirets.' },
          { key: 'category', label: 'Catégorie', type: 'text', required: true }, { key: 'summary', label: 'Résumé', type: 'text', required: true, full: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'level', label: 'Niveau', type: 'select', required: true, options: Object.entries(LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l })) },
          { key: 'estimatedHours', label: 'Durée estimée (heures)', type: 'number', required: true },
          { key: 'access', label: 'Accessibilité', type: 'select', required: true, options: Object.entries(ACCESS_LABELS).map(([v, a]) => ({ value: v, label: a.label })) },
          { key: 'trainerName', label: 'Formateur', type: 'text' }, { key: 'coverUrl', label: 'Image de couverture', type: 'image' },
        ]}
        defaults={{ status: 'draft', level: 'debutant', access: 'members', estimatedHours: 1, modules: [], description: '' }}
        transformBeforeSave={(v) => ({ ...v, slug: String(v.slug ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
        rowActions={(c, reload) => (
          <>
            {c.status !== 'published' && <IconAction label={can(profile, 'courses.manage') ? 'Publier' : 'Soumettre pour validation'} tone="green" onClick={() => setStatus(c, can(profile, 'courses.manage') ? 'published' : 'pending', reload)}><Send className="h-4 w-4" /></IconAction>}
            {c.status !== 'archived' && <IconAction label="Archiver" onClick={() => setStatus(c, 'archived', reload)}><Archive className="h-4 w-4" /></IconAction>}
          </>
        )}
      />
      <Card><CardBody>
        <h2 className="font-display text-lg font-semibold text-night">Modules, leçons et examens</h2>
        <p className="mt-1 text-sm text-ink/65">Le schéma de base de données gère modules, leçons (texte, vidéo, PDF), examens, questions, choix, explications, seuil de réussite et nombre de tentatives (tables course_modules, lessons, quizzes, questions, question_options). L’éditeur visuel de modules et de questions est la prochaine étape de développement ; en attendant, ces éléments se saisissent depuis le tableau Supabase ou par import SQL des supports validés.</p>
      </CardBody></Card>
    </div>
  );
}
