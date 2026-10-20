import { useState } from 'react';
import { Download, File, FileText, Film, Image, Lock, Music } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/lib/permissions';
import { mediaRepo } from '@/services';
import { useI18n } from '@/i18n';
import { cn, formatDate } from '@/utils/format';
import type { MediaItem } from '@/types';

const icons: Record<MediaItem['kind'], typeof File> = { pdf: FileText, video: Film, audio: Music, image: Image, document: File };
const AUD = { public: 'Public', members: 'Membres', leaders: 'Responsables', private: 'Privé' };

/**
 * Bibliothèque : documents publics séparés des documents réservés.
 * En production les fichiers réservés sont servis par URL signée depuis un
 * bucket privé (storage policies), jamais par lien public.
 */
export default function LibraryPage() {
  const { profile } = useAuth();
  const { locale } = useI18n();
  const leader = can(profile, 'admin.access');
  const [tab, setTab] = useState<'public' | 'members' | 'leaders'>('public');
  const { data = [], loading } = useAsync(() => mediaRepo.all(), []);
  const allowed = (a: MediaItem['audience']) => a === 'public' || (a === 'members' && !!profile) || (a === 'leaders' && leader);
  const list = data.filter((m) => m.audience === tab);
  return (
    <>
      <PageHeader eyebrow="Médias" title="Bibliothèque numérique" description="Documents, supports de formation, vidéos et rapports, classés selon leur niveau d’accès." />
      <section className="container-page py-10">
        <div className="mb-6 inline-flex rounded-xl bg-white p-1 ring-1 ring-night/10" role="tablist">
          {(['public', 'members', 'leaders'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium', tab === t ? 'bg-night text-white' : 'text-ink/70')}>{!allowed(t) && <Lock className="h-3.5 w-3.5" />}{t === 'public' ? 'Publics' : t === 'members' ? 'Membres' : 'Responsables'}</button>
          ))}
        </div>
        {!allowed(tab) ? <EmptyState icon={<Lock className="h-6 w-6" />} title="Accès réservé" description={tab === 'members' ? 'Connectez-vous pour consulter les documents réservés aux membres.' : 'Ces documents sont réservés aux responsables habilités.'} />
          : loading ? <Skeleton className="h-60" /> : list.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {list.map((m) => { const Icon = icons[m.kind]; return (
                <li key={m.id} className="flex items-start gap-4 rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600"><Icon className="h-6 w-6" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-night">{m.title}</h2><Badge>{AUD[m.audience]}</Badge></div>
                    <p className="mt-1 text-sm text-ink/60">{m.description}</p>
                    <p className="mt-2 text-xs text-ink/45">{m.category} · {formatDate(m.publishedAt, locale)}</p>
                  </div>
                  {m.url ? <a href={m.url} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-mist" aria-label={`Télécharger ${m.title}`}><Download className="h-5 w-5 text-night" /></a> : <span className="text-xs italic text-ink/40">Fichier à importer</span>}
                </li>
              ); })}
            </ul>
          ) : <EmptyState title="Aucun document dans cette catégorie." />}
      </section>
    </>
  );
}
