import { Globe2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import * as fr from '@/content/doctrine';
import * as en from '@/content/doctrine.en';
import * as pt from '@/content/doctrine.pt';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { ButtonLink } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { usePageTexts } from '@/features/content/pageTexts';

/**
 * Présentation de l'Église. Le texte saisi par l'administration
 * (Administration > Paramètres > Présentation de l'Église) remplace la
 * présentation de base, tirée des documents officiels (src/content/doctrine*).
 */
export default function AboutPage() {
  const { settings } = useSiteSettings();
  const { tx } = useI18n();
  const d = usePageTexts('doctrine', { fr, en, pt });
  return (
    <>
      <PageHeader eyebrow={tx('À propos', 'About', 'Sobre')} title={tx('L’Église Bon Nouveau Message (EBNM/KCC)', 'The Église Bon Nouveau Message (EBNM/KCC)', 'A Église Bon Nouveau Message (EBNM/KCC)')} description={tx('Présentation officielle, histoire, organisation et contacts institutionnels.', 'Official presentation, history, organisation and institutional contacts.', 'Apresentação oficial, história, organização e contactos institucionais.')} />
      <section className="container-page grid gap-6 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {settings.churchPresentation ? (
            <Card><CardBody className="prose-kcc">{settings.churchPresentation.split('\n').map((p, i) => <p key={i}>{p}</p>)}</CardBody></Card>
          ) : (
            <div className="space-y-6">
              <figure className="overflow-hidden rounded-3xl bg-night shadow-lift">
                <img src="/images/archives/temple-kcc-assemblee.jpg" alt={tx('Assemblée de la communauté devant un bâtiment KCC', 'Community gathering in front of a KCC building', 'Assembleia da comunidade diante de um edifício KCC')} className="aspect-[16/8] w-full object-cover" />
              </figure>
              <Card><CardBody className="prose-kcc">
                <p className="eyebrow text-gold-600">{d.kccApparition.date}</p>
                <h2 className="mt-2 font-display text-3xl font-medium text-night">{d.kccApparition.meaning}</h2>
                {d.prophetPortrait.map((p, i) => <p key={i}>{p}</p>)}
                <p>{d.kccApparition.paragraphs[3]}</p>
              </CardBody></Card>
              <div className="grid gap-4 sm:grid-cols-3">
                {d.professionOfFaith.church.map((c) => (
                  <div key={c.t} className="rounded-2xl bg-night p-5 text-white shadow-soft">
                    <p className="font-display text-2xl text-gold-gradient">{c.t}</p>
                    <p className="mt-1 text-sm text-white/70">{c.d}</p>
                  </div>
                ))}
              </div>
              <Card><CardBody>
                <h2 className="font-display text-2xl font-medium text-night">{tx('L’Église en bref', 'The Church at a glance', 'A Igreja em resumo')}</h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {d.specificities.map((x) => (
                    <div key={x.label} className="rounded-xl bg-mist p-4"><dt className="text-xs font-semibold uppercase tracking-wider text-gold-600">{x.label}</dt><dd className="mt-1 font-semibold text-night">{x.value}</dd></div>
                  ))}
                </dl>
                <h3 className="mt-8 flex items-center gap-2 font-display text-xl font-medium text-night"><Globe2 className="h-5 w-5 text-gold" aria-hidden />{tx('Présence internationale', 'International presence', 'Presença internacional')}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {[tx('RD Congo', 'DR Congo', 'RD Congo'), ...d.internationalPresence].map((x) => <li key={x} className="rounded-full border border-gold/30 bg-gold-50 px-3.5 py-1.5 text-sm text-night">{x}</li>)}
                </ul>
                <p className="mt-6 text-xs text-ink/50">{tx('Source', 'Source', 'Fonte')} : {d.doctrineSource}</p>
              </CardBody></Card>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          {[
            { t: tx('Organisation', 'Organisation', 'Organização'), d: tx('Administration centrale, paroisses, sections et membres. Les niveaux sont configurables.', 'Central administration, parishes, sections and members. Levels can be configured.', 'Administração central, paróquias, secções e membros. Os níveis são configuráveis.') },
            { t: tx('Notre plateforme', 'Our platform', 'A nossa plataforma'), d: tx('JE SUIS KCCiste relie les KCCistes de la RD Congo et de la diaspora autour d’un espace commun.', 'JE SUIS KCCiste connects KCCists in the DR Congo and the diaspora in one shared space.', 'JE SUIS KCCiste liga os KCCistas da RD Congo e da diáspora num espaço comum.') },
            { t: tx('Documents officiels', 'Official documents', 'Documentos oficiais'), d: tx('Les documents validés sont disponibles dans la bibliothèque numérique.', 'Approved documents are available in the digital library.', 'Os documentos validados estão disponíveis na biblioteca digital.') },
          ].map((x) => (
            <Card key={x.t}><CardBody><h2 className="font-display text-lg font-semibold text-night">{x.t}</h2><p className="mt-1 text-sm text-ink/65">{x.d}</p></CardBody></Card>
          ))}
          <div className="rounded-2xl bg-night p-5 text-white shadow-soft sm:p-6"><h2 className="font-display text-lg font-semibold">{tx('Doctrine et histoire', 'Doctrine and history', 'Doutrina e história')}</h2><p className="mt-1 text-sm text-white/70">{tx('Le KCC, la profession de foi, les Paroles de l’Alliance, les fêtes et les grandes dates du Prophète.', 'The KCC, the profession of faith, the Words of the Covenant, the feasts and the key dates of the Prophet.', 'O KCC, a profissão de fé, as Palavras da Aliança, as festas e as grandes datas do Profeta.')}</p><ButtonLink to="/doctrine" variant="gold" size="sm" className="mt-4">{tx('Découvrir', 'Discover', 'Descobrir')}</ButtonLink></div>
          <div className="rounded-2xl bg-night p-5 text-white shadow-soft sm:p-6"><h2 className="font-display text-lg font-semibold">{tx('Enseignements et histoire', 'Teachings and history', 'Ensinamentos e história')}</h2><p className="mt-1 text-sm text-white/70">{tx('La prédication du Sabbat de Nlemba et les récits de l’appel de DIZOLELE Isaac.', 'The Nlemba Sabbath sermon and the accounts of the calling of DIZOLELE Isaac.', 'A pregação do Sábado de Nlemba e os relatos do chamamento de DIZOLELE Isaac.')}</p><ButtonLink to="/enseignements" variant="gold" size="sm" className="mt-4">{tx('Lire', 'Read', 'Ler')}</ButtonLink></div>
        </aside>
      </section>
    </>
  );
}
