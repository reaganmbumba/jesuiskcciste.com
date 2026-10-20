import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, GraduationCap, HandHeart, Megaphone, Music, Church, Search, X } from 'lucide-react';
import { announcementsRepo, coursesRepo, eventsRepo, parishesRepo, projectsRepo, tracksRepo } from '@/services';
import { useAuth } from '@/features/auth/AuthContext';
import { useDebounced } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';

interface Hit { type: string; title: string; to: string; icon: JSX.Element }
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Recherche globale sur les contenus accessibles à l'utilisateur. */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState<Hit[]>([]);
  const debounced = useDebounced(q, 150);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { tx } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    Promise.all([announcementsRepo.all(), eventsRepo.all(), coursesRepo.all(), projectsRepo.all(), parishesRepo.all(), tracksRepo.all()]).then(([a, e, c, p, par, tr]) => {
      const signed = !!profile;
      setIndex([
        ...a.filter((x) => x.status === 'published' && (x.audience === 'public' || signed)).map((x) => ({ type: tx('Annonce', 'Announcement', 'Anúncio'), title: x.title, to: `/actualites/${x.id}`, icon: <Megaphone className="h-4 w-4" /> })),
        ...e.filter((x) => x.audience === 'public' || signed).map((x) => ({ type: tx('Événement', 'Event', 'Evento'), title: x.title, to: `/agenda/${x.id}`, icon: <Calendar className="h-4 w-4" /> })),
        ...c.filter((x) => x.status === 'published').map((x) => ({ type: tx('Formation', 'Course', 'Formação'), title: x.title, to: `/academie/formations/${x.slug}`, icon: <GraduationCap className="h-4 w-4" /> })),
        ...p.map((x) => ({ type: tx('Projet', 'Project', 'Projeto'), title: x.name, to: `/solidarite/projets/${x.slug}`, icon: <HandHeart className="h-4 w-4" /> })),
        ...par.map((x) => ({ type: tx('Paroisse', 'Parish', 'Paróquia'), title: `${x.name} — ${x.city}`, to: `/paroisses/${x.id}`, icon: <Church className="h-4 w-4" /> })),
        ...tr.map((x) => ({ type: tx('Chant', 'Song', 'Cântico'), title: x.title, to: `/musique?titre=${x.id}`, icon: <Music className="h-4 w-4" /> })),
      ]);
    });
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, profile, tx]);

  const results = useMemo(() => {
    const s = norm(debounced.trim());
    if (!s) return index.slice(0, 8);
    return index.filter((h) => norm(h.title).includes(s) || norm(h.type).includes(s)).slice(0, 12);
  }, [debounced, index]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center bg-night/60 p-4 pt-[10vh] backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={tx('Recherche', 'Search', 'Pesquisa')} className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-lift animate-fade-up">
        <div className="flex items-center gap-3 border-b border-night/10 px-4">
          <Search className="h-5 w-5 text-ink/40" aria-hidden />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('Rechercher une annonce, une formation, une paroisse…', 'Search announcements, courses, parishes…', 'Pesquisar anúncios, formações, paróquias…')} className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink/40" aria-label={tx('Termes de recherche', 'Search terms', 'Termos de pesquisa')} />
          <button onClick={onClose} aria-label={tx('Fermer la recherche', 'Close search', 'Fechar a pesquisa')} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-mist"><X className="h-4 w-4" /></button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink/55">{tx('Aucun résultat pour', 'No results for', 'Nenhum resultado para')} « {q} ».</li>}
          {results.map((h) => (
            <li key={h.to}>
              <button onClick={() => { onClose(); setQ(''); navigate(h.to); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-mist focus:bg-mist focus:outline-none">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-50 text-gold-600">{h.icon}</span>
                <span className="flex-1 truncate text-sm font-medium text-night">{h.title}</span>
                <span className="text-xs text-ink/45">{h.type}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
