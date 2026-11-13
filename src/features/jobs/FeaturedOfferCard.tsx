import { useState } from 'react';
import { CalendarCheck, CalendarClock, ChevronDown, Download, FileText, FlaskConical, HeartPulse, Mail, MapPin, Phone, Share2, ShieldCheck, Stethoscope } from 'lucide-react';
import { useI18n } from '@/i18n';
import { formatDate } from '@/utils/format';
import { JOBS_WHATSAPP_URL } from './jobs';
import type { FeaturedOffer } from './featured';

const SITE_GROUP_URL = 'https://chat.whatsapp.com/K30ogMwHp0Z7qmQwBhgKvH?mode=gi_t';

/** Couleurs de chaque poste (laboratoire en violet, soins en rose). */
const POST_STYLES = [
  { icon: FlaskConical, ring: 'border-violet-200', head: 'from-violet-600 to-indigo-600', dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-800' },
  { icon: Stethoscope, ring: 'border-rose-200', head: 'from-rose-500 to-pink-600', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-800' },
];

export function featuredShareText(o: FeaturedOffer): string {
  const posts = o.posts.map((p) => `• ${p.count} ${p.title}`).join('\n');
  return [
    `🏥 *AVIS DE RECRUTEMENT — ${o.establishment.toUpperCase()} (Muanda)*`,
    '',
    `La ${o.organization} recrute :`,
    posts,
    '',
    `📅 Date limite de dépôt : *30 novembre 2026*`,
    `🗓️ Prise de fonction : 10 décembre 2026`,
    `📧 ${o.email}`,
    `📞 ${o.phone}`,
    'Le recrutement est gratuit : aucun frais de candidature.',
    '',
    `📖 L’offre complète sur le site *JE SUIS KCCiste* :`,
    `https://jesuiskcciste.com/emplois#${o.id}`,
    '',
    `💬 Groupe WhatsApp officiel « Je suis KCCiste » : ${SITE_GROUP_URL}`,
    `💼 Groupe « Je suis KCCiste 4 Opportunité et emploi » : ${JOBS_WHATSAPP_URL}`,
  ].join('\n');
}

/** Grande carte en couleurs d'un avis de recrutement « à la une ». */
export function FeaturedOfferCard({ o }: { o: FeaturedOffer }) {
  const { tx, pick, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const date = (iso: string) => formatDate(iso, locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const daysLeft = Math.max(0, Math.ceil((new Date(`${o.closingDate}T23:59:59+01:00`).getTime() - Date.now()) / 86_400_000));
  const total = o.posts.reduce((n, p) => n + p.count, 0);
  const tel = o.phone.replace(/[\s.()-]/g, '');

  return (
    <article id={o.id} className="scroll-mt-32 overflow-hidden rounded-[2rem] border border-teal-200 bg-white shadow-soft">
      {/* En-tête */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-cyan-700 to-sky-800 px-6 py-8 text-white sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-emerald-300/20" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-amber-400 px-3 py-1 text-teal-950">{tx('Offre à la une', 'Featured offer', 'Oferta em destaque')}</span>
          <span className="rounded-full bg-white/15 px-3 py-1">{tx('Avis de recrutement', 'Recruitment notice', 'Aviso de recrutamento')}</span>
        </div>
        <div className="relative mt-5 flex items-start gap-4">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 sm:flex"><HeartPulse className="h-8 w-8" aria-hidden /></span>
          <div>
            <p className="text-sm font-semibold text-teal-100">{o.organization}</p>
            <h3 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{o.establishment}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-cyan-50/90"><MapPin className="h-4 w-4" aria-hidden />{o.location}</p>
          </div>
        </div>
        <p className="relative mt-5 max-w-3xl text-[15px] leading-relaxed text-white/90">{o.intro}</p>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/[0.12] p-4 ring-1 ring-white/20">
            <p className="text-xs uppercase tracking-wider text-teal-100">{tx('Postes à pourvoir', 'Open positions', 'Vagas')}</p>
            <p className="mt-1 font-display text-3xl font-semibold">{total}</p>
          </div>
          <div className="rounded-2xl bg-amber-400 p-4 text-teal-950">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"><CalendarClock className="h-3.5 w-3.5" aria-hidden />{tx('Date limite', 'Deadline', 'Prazo')}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{date(o.closingDate)}</p>
            <p className="text-xs font-semibold">{daysLeft > 0 ? tx(`Encore ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`, `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`, `Faltam ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`) : tx('Dernier jour', 'Last day', 'Último dia')}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.12] p-4 ring-1 ring-white/20">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-teal-100"><CalendarCheck className="h-3.5 w-3.5" aria-hidden />{tx('Prise de fonction', 'Start date', 'Início de funções')}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{date(o.startDate)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-8 sm:px-10">
        <p className="text-sm text-ink/70">{pick(o.summary)} {locale !== 'fr' && tx('', 'The official notice below is in French.', 'O aviso oficial abaixo está em francês.')}</p>

        {/* Les postes */}
        <div className="grid gap-5 lg:grid-cols-2">
          {o.posts.map((p, i) => {
            const s = POST_STYLES[i % POST_STYLES.length];
            const Icon = s.icon;
            return (
              <section key={p.title} className={`overflow-hidden rounded-3xl border ${s.ring} bg-white`}>
                <div className={`flex items-center gap-3 bg-gradient-to-r ${s.head} px-5 py-4 text-white`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20"><Icon className="h-6 w-6" aria-hidden /></span>
                  <div>
                    <p className="font-display text-3xl font-semibold leading-none">{p.count}</p>
                    <p className="text-sm font-semibold">{p.title}</p>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <p className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${s.chip}`}>{tx('Responsabilités et tâches', 'Duties', 'Responsabilidades')}</p>
                    <ul className="mt-2 space-y-1.5">
                      {(open ? p.tasks : p.tasks.slice(0, 3)).map((t) => <li key={t} className="flex gap-2 text-sm leading-snug text-ink/80"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />{t}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${s.chip}`}>{tx('Qualifications et expériences', 'Qualifications', 'Qualificações')}</p>
                    <ul className="mt-2 space-y-1.5">
                      {(open ? p.qualifications : p.qualifications.slice(0, 2)).map((t) => <li key={t} className="flex gap-2 text-sm leading-snug text-ink/80"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />{t}</li>)}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {open && (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5">
              <p className="flex items-center gap-2 font-semibold text-sky-900"><FileText className="h-4 w-4" aria-hidden />{tx('Composition du dossier de candidature', 'Application file', 'Processo de candidatura')}</p>
              <p className="mt-2 text-sm text-sky-900/80">Chaque candidat devra fournir :</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-sky-950/85">{o.documents.map((d) => <li key={d}>{d}</li>)}</ol>
            </section>
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 font-semibold text-emerald-900"><ShieldCheck className="h-4 w-4" aria-hidden />{tx('Dispositions particulières', 'Special provisions', 'Disposições particulares')}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-emerald-950/85">{o.conditions.map((c) => <li key={c} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{c}</li>)}</ul>
              <p className="mt-3 text-xs text-emerald-900/70">Classification interne : {o.classification}.</p>
            </section>
          </div>
        )}

        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
          className="mx-auto flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-5 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100">
          {open ? tx('Réduire l’offre', 'Show less', 'Mostrar menos') : tx('Lire l’offre complète', 'Read the full offer', 'Ler a oferta completa')}
          <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>

        {/* Comment postuler */}
        <section className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 ring-1 ring-amber-200">
          <p className="font-display text-xl font-semibold text-night">{tx('Comment postuler', 'How to apply', 'Como se candidatar')}</p>
          <p className="mt-1 text-sm text-ink/70">
            Envoyez votre dossier à la direction administrative et des ressources humaines par e-mail, appelez le numéro ci-dessous, ou déposez-le sous pli fermé au {o.depositAt}.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`mailto:${o.email}?subject=${encodeURIComponent('Candidature — Centre Hospitalier La Grâce')}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800">
              <Mail className="h-4 w-4" aria-hidden />{o.email}
            </a>
            <a href={`tel:${tel}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:opacity-90">
              <Phone className="h-4 w-4" aria-hidden />{o.phone}
            </a>
          </div>
          <p className="mt-4 text-sm font-semibold text-amber-900">⚠️ {tx('Le recrutement est gratuit : ne payez aucun frais de candidature.', 'Recruitment is free: never pay any application fee.', 'O recrutamento é gratuito: não pague nenhuma taxa de candidatura.')}</p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-night/[0.06] pt-4">
          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(featuredShareText(o))}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-xs font-semibold text-white hover:opacity-90">
              <Share2 className="h-3.5 w-3.5" aria-hidden />{tx('Partager sur WhatsApp', 'Share on WhatsApp', 'Partilhar no WhatsApp')}
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://jesuiskcciste.com/emplois#${o.id}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1877F2] px-4 text-xs font-semibold text-white hover:opacity-90">
              <Share2 className="h-3.5 w-3.5" aria-hidden />Facebook
            </a>
            <a href={o.poster} download className="inline-flex h-9 items-center gap-1.5 rounded-full border border-night/15 px-4 text-xs font-semibold text-night hover:border-gold">
              <Download className="h-3.5 w-3.5" aria-hidden />{tx('Télécharger l’affiche', 'Download the poster', 'Descarregar o cartaz')}
            </a>
          </div>
          <p className="text-xs text-ink/50">{o.reference} · {o.signedAt} · {o.signedBy}</p>
        </div>
      </div>
    </article>
  );
}
