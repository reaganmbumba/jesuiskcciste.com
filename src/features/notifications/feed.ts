/**
 * Nouveautés livrées avec le site (articles de src/content/editorial.ts, prédications
 * et directs écrits dans le code). Le build les écrit dans dist/notifications-nouveautes.json ;
 * le Worker y cherche chaque minute ce qui vient de paraître pour prévenir les abonnés.
 */
import { editorialAnnouncements } from '@/content/editorial';
import { demoAudioSermons } from '@/services/demo/data';
import { PINNED_LIVESTREAMS } from '@/features/livestreams/livestreams';

type Texts = { fr: string; en?: string; pt?: string };

export interface NotificationFeed {
  articles: { id: string; date: string; title: Texts; summary: Texts; image: string | null }[];
  sermons: { id: string; date: string; title: string; preacher: string }[];
  lives: { id: string; title: string; startsAt: string; durationMinutes: number }[];
}

/** Seuls les éléments des 30 derniers jours sont gardés (le Worker ne regarde que les 2 derniers). */
export function buildNotificationFeed(now = Date.now()): NotificationFeed {
  const recent = (iso: string) => Date.parse(iso) >= now - 30 * 86400000;
  const [fr, en, pt] = (['fr', 'en', 'pt'] as const).map((l) => editorialAnnouncements(l));
  const articles = fr.filter((a) => recent(a.publishedAt)).map((a) => {
    const e = en.find((x) => x.id === a.id);
    const p = pt.find((x) => x.id === a.id);
    return { id: a.id, date: a.publishedAt, title: { fr: a.title, en: e?.title, pt: p?.title }, summary: { fr: a.summary, en: e?.summary, pt: p?.summary }, image: a.imageUrl ?? null };
  });
  return {
    articles,
    sermons: demoAudioSermons.filter((s) => s.published && s.createdAt && recent(s.createdAt)).map((s) => ({ id: s.id, date: s.createdAt ?? '', title: s.title, preacher: [s.preacherTitle, s.preacherName].filter(Boolean).join(' ') })),
    lives: PINNED_LIVESTREAMS.filter((l) => !l.isCancelled && recent(l.startsAt)).map((l) => ({ id: l.id, title: l.title, startsAt: l.startsAt, durationMinutes: l.durationMinutes })),
  };
}
