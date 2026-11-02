import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { APOSTLE_BIOGRAPHIES, findApostleBiography, findBiographyBySlug } from '@/content/apotres-biographies';
import { apostlesRepo } from '@/features/apostles/apostles';
import { ApostlePortrait } from '@/features/apostles/ApostleUi';
import { BiographyBody } from '@/features/apostles/ApostleBiography';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import NotFoundPage from '@/pages/public/NotFoundPage';

/** Fiche enregistrée (photo, lien vers le profil) correspondant à chaque biographie. */
function useLinkedApostles() {
  const { data = [] } = useAsync(() => apostlesRepo.all().catch(() => []), []);
  return (slug: string) => data.find((a) => findApostleBiography(a.fullName)?.slug === slug);
}

/** Rubrique « Biographies des Révérends Apôtres » : liste, ou une biographie complète. */
export default function ApostleBiographiesPage() {
  const { slug } = useParams();
  return slug ? <Biography slug={slug} /> : <BiographyList />;
}

function BiographyList() {
  const { tx, pick } = useI18n();
  const linked = useLinkedApostles();
  return (
    <>
      <PageHeader eyebrow={tx('Serviteurs de l’Église', 'Servants of the Church', 'Servos da Igreja')} title={tx('Biographies des Révérends Apôtres', 'Biographies of the Reverend Apostles', 'Biografias dos Reverendos Apóstolos')}
        description={tx('La vie, la conversion et le service des Révérends Apôtres de l’Église Bon Nouveau Message. Vous connaissez l’histoire d’un apôtre ? Envoyez-la à la rédaction.', 'The life, conversion and service of the Reverend Apostles of the Église Bon Nouveau Message. Do you know an apostle’s story? Send it to the editorial team.', 'A vida, a conversão e o serviço dos Reverendos Apóstolos da Église Bon Nouveau Message. Conhece a história de um apóstolo? Envie-a à redação.')} />
      <section className="container-page py-12">
        <ul className="grid gap-5 md:grid-cols-2">
          {APOSTLE_BIOGRAPHIES.map((b) => {
            const a = linked(b.slug);
            return (
              <li key={b.slug}>
                <Link to={`/apotres/biographies/${b.slug}`} className="group flex h-full gap-5 rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                  {b.image ? <img src={b.image} alt="" loading="lazy" className="h-24 w-32 shrink-0 rounded-2xl object-cover object-right" /> : a ? <ApostlePortrait apostle={a} className="h-24 w-24 shrink-0 text-2xl" /> : <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700"><UserRound className="h-10 w-10" aria-hidden /></div>}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">{tx('Révérend Apôtre', 'Reverend Apostle', 'Reverendo Apóstolo')}</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-night">{b.name}</h2>
                    <p className="mt-1 text-sm text-ink/65">{b.facts.map((f) => pick(f.value)).slice(0, 2).join(' · ')}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-night group-hover:text-gold-700"><BookOpen className="h-4 w-4" aria-hidden />{tx('Lire la biographie', 'Read the biography', 'Ler a biografia')}<ArrowRight className="h-4 w-4" aria-hidden /></span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-10 rounded-2xl bg-mist px-5 py-4 text-sm text-ink/70">{tx('Vous avez des informations sur la vie d’un autre Révérend Apôtre ? Contactez la rédaction Je suis KCCiste au +243 840 238 592 (WhatsApp).', 'Do you have information about the life of another Reverend Apostle? Contact the Je suis KCCiste editorial team on +243 840 238 592 (WhatsApp).', 'Tem informações sobre a vida de outro Reverendo Apóstolo? Contacte a redação Je suis KCCiste pelo +243 840 238 592 (WhatsApp).')}</p>
      </section>
    </>
  );
}

function Biography({ slug }: { slug: string }) {
  const { tx, pick } = useI18n();
  const bio = findBiographyBySlug(slug);
  const linked = useLinkedApostles();
  if (!bio) return <NotFoundPage />;
  const a = linked(bio.slug);
  return (
    <>
      <PageHeader eyebrow={tx('Biographie', 'Biography', 'Biografia')} title={pick(bio.title)} metaDescription={pick(bio.sections[0].paragraphs[0])} image={bio.image ?? a?.photoUrl}>
        <Link to="/apotres/biographies" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden />{tx('Toutes les biographies', 'All biographies', 'Todas as biografias')}</Link>
      </PageHeader>
      <article className="container-page max-w-3xl py-12">
        {a && (
          <div className="mb-8 flex items-center gap-4">
            <ApostlePortrait apostle={a} className="h-20 w-20 shrink-0 text-2xl" />
            <Link to={`/apotres/${a.id}`} className="text-sm font-semibold text-gold-700 underline">{tx('Voir sa fiche d’apôtre', 'See his apostle profile', 'Ver a sua ficha de apóstolo')}</Link>
          </div>
        )}
        <BiographyBody bio={bio} />
        <p className="mt-10 border-t border-night/[0.06] pt-5 text-sm text-ink/55">{tx('Rédaction', 'Editorial team', 'Redação')} : {bio.credit}. {tx('Une information à compléter ou à corriger ? Écrivez-nous au +243 840 238 592.', 'Something to add or correct? Write to us on +243 840 238 592.', 'Algo a completar ou corrigir? Escreva-nos pelo +243 840 238 592.')}</p>
      </article>
    </>
  );
}
