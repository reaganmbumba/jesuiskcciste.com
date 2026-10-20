import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, CalendarDays, Camera, Building2, Landmark, ScrollText, Star } from 'lucide-react';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import * as fr from '@/content/doctrine';
import * as en from '@/content/doctrine.en';
import * as pt from '@/content/doctrine.pt';
import type { MultilingualList } from '@/content/doctrine';
import { useI18n, type Tri } from '@/i18n';

const T = (fr: string, en: string, pt: string): Tri => ({ fr, en, pt });

const anchors = [
  { id: 'kcc', label: T('Le KCC', 'The KCC', 'O KCC'), icon: Star },
  { id: 'foi', label: T('Profession de foi', 'Profession of faith', 'Profissão de fé'), icon: BookOpen },
  { id: 'loi', label: T('Alliance et commandements', 'Covenant and commandments', 'Aliança e mandamentos'), icon: ScrollText },
  { id: 'culte', label: T('Sacrements et fêtes', 'Sacraments and feasts', 'Sacramentos e festas'), icon: CalendarDays },
  { id: 'prophete', label: T('Le Prophète', 'The Prophet', 'O Profeta'), icon: Landmark },
  { id: 'archives', label: T('Archives photo', 'Photo archive', 'Arquivo fotográfico'), icon: Camera },
];

const photos = [
  { src: '/images/archives/temple-kcc-assemblee.jpg', alt: T('Assemblée de fidèles devant un temple marqué des lettres KCC', 'Congregation in front of a temple bearing the letters KCC', 'Assembleia de fiéis diante de um templo com as letras KCC'), caption: T('Assemblée devant un temple KCC', 'Congregation in front of a KCC temple', 'Assembleia diante de um templo KCC') },
  { src: '/images/archives/temple-construction.jpg', alt: T('Fidèles devant un grand temple en construction', 'Believers in front of a large temple under construction', 'Fiéis diante de um grande templo em construção'), caption: T('Un temple en construction', 'A temple under construction', 'Um templo em construção') },
  { src: '/images/archives/centre-hospitalier-christ-sante-lemba.jpg', alt: T('Façade du Centre hospitalier Christ-Santé de Lemba, Église Bon Nouveau Message', 'Front of the Christ-Santé hospital centre in Lemba, Église Bon Nouveau Message', 'Fachada do Centro hospitalar Christ-Santé de Lemba, Église Bon Nouveau Message'), caption: T('Centre hospitalier Christ-Santé de Lemba (EBNM)', 'Christ-Santé hospital centre, Lemba (EBNM)', 'Centro hospitalar Christ-Santé de Lemba (EBNM)') },
  { src: '/images/archives/archive-assemblee-noir-et-blanc.jpg', alt: T('Photographie ancienne en noir et blanc d’une grande assemblée', 'Old black-and-white photograph of a large congregation', 'Fotografia antiga a preto e branco de uma grande assembleia'), caption: T('Archive en noir et blanc : une assemblée', 'Black-and-white archive: a congregation', 'Arquivo a preto e branco: uma assembleia') },
];

const langCode = (l: string) => (l.startsWith('English') ? 'en' : l.startsWith('Français') ? 'fr' : l.startsWith('Português') ? 'pt' : undefined);

function LangTabs({ list }: { list: MultilingualList }) {
  const { tx } = useI18n();
  const [lang, setLang] = useState(list.versions[0].lang);
  const current = list.versions.find((v) => v.lang === lang) ?? list.versions[0];
  return (
    <Card id={list.id} className="scroll-mt-32">
      <CardBody>
        <h3 className="font-display text-2xl font-semibold text-night">{list.title}</h3>
        {list.intro && <p className="mt-2 text-sm text-ink/65">{list.intro}</p>}
        <div role="tablist" aria-label={`${tx('Langue', 'Language', 'Idioma')} : ${list.title}`} className="mt-4 flex flex-wrap gap-2">
          {list.versions.map((v) => (
            <button key={v.lang} type="button" role="tab" aria-selected={v.lang === lang} onClick={() => setLang(v.lang)}
              className={`rounded-full border px-3 py-1 text-sm transition ${v.lang === lang ? 'border-gold bg-gold text-night' : 'border-night/10 text-ink/70 hover:border-gold/60'}`}>
              {v.lang}
            </button>
          ))}
        </div>
        <ol className="mt-5 space-y-2.5" lang={langCode(current.lang)}>
          {current.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/85">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-50 text-xs font-semibold text-gold-700">{i + 1}</span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}

/** Doctrine, profession de foi, loi, liturgie et repères historiques de l'EBNM (voir src/content/doctrine.ts). */
export default function DoctrinePage() {
  const { hash } = useLocation();
  const { tx, pick, locale } = useI18n();
  const {
    doctrineSource, feasts, kccApparition, lawTexts, nameOfGod, oracle, professionOfFaith,
    prophetOath, prophetPortrait, prophetTimeline, sabbathService, sacraments, specificities,
  } = pick({ fr, en, pt });
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [hash]);

  return (
    <>
      <PageHeader eyebrow={tx('Le KCCisme', 'KCCism', 'O KCCismo')} title={tx('Doctrine et histoire de l’Église', 'Doctrine and history of the Church', 'Doutrina e história da Igreja')} description={tx('Le message du KCC, la profession de foi, les Paroles de l’Alliance, la liturgie et les grandes dates de l’Église Bon Nouveau Message.', 'The message of the KCC, the profession of faith, the Words of the Covenant, the liturgy and the key dates of the Église Bon Nouveau Message.', 'A mensagem do KCC, a profissão de fé, as Palavras da Aliança, a liturgia e as grandes datas da Église Bon Nouveau Message.')}>
        <nav aria-label={tx('Sections de la page', 'Page sections', 'Secções da página')} className="flex flex-wrap gap-2">
          {anchors.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#${id}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/85 transition hover:border-gold/50 hover:text-white">
              <Icon className="h-4 w-4 text-gold-300" aria-hidden />{pick(label)}
            </a>
          ))}
        </nav>
      </PageHeader>

      <section id="kcc" className="container-page scroll-mt-32 py-14">
        <SectionHeading eyebrow={kccApparition.date} title={kccApparition.title} />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="prose-kcc lg:col-span-3">{kccApparition.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
          <div className="h-fit rounded-3xl bg-night p-6 text-white shadow-lift lg:col-span-2">
            <div className="grid grid-cols-3 gap-3 text-center">
              {kccApparition.letters.map((l, i) => (
                <div key={i} className="rounded-2xl border border-gold/30 bg-white/5 px-2 py-4">
                  <p className="font-display text-5xl font-semibold text-gold">{l.letter}</p>
                  <p className="mt-2 font-semibold">{l.kikongo}</p>
                  <p className="text-xs text-white/60">{l.fr}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center font-display text-lg italic text-white/90">{kccApparition.meaning}</p>
          </div>
        </div>

        <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specificities.map((s) => (
            <div key={s.label} className="rounded-2xl border border-night/[0.06] bg-white p-4 shadow-soft">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">{s.label}</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-night">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardBody>
              <Badge tone="gold">{tx('15 avril 2003', '15 April 2003', '15 de abril de 2003')}</Badge>
              <h3 className="mt-3 font-display text-2xl font-semibold text-night">{oracle.title}</h3>
              <blockquote className="my-5 border-l-4 border-gold pl-4 font-display text-xl italic text-night/85">{oracle.quote}</blockquote>
              <div className="prose-kcc">{oracle.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
              <div className="mt-4 flex flex-wrap gap-1.5">{oracle.attributes.map((a) => <Badge key={a}>{a}</Badge>)}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3 className="font-display text-2xl font-semibold text-night">{nameOfGod.title}</h3>
              <div className="prose-kcc mt-4">{nameOfGod.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section id="foi" className="scroll-mt-32 bg-white py-14">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Croyances', 'Beliefs', 'Crenças')} title={professionOfFaith.title} description={professionOfFaith.rite} />
          <ol className="grid gap-4 md:grid-cols-2">
            {professionOfFaith.articles.map((a, i) => (
              <li key={i} className="flex gap-4 rounded-2xl border border-night/[0.06] bg-mist/60 p-5">
                <span className="font-display text-3xl font-semibold text-gold/80">{i + 1}</span>
                <p className="text-[15px] leading-relaxed text-ink/85">{a}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {professionOfFaith.church.map((c) => (
              <div key={c.t} className="rounded-2xl bg-night p-5 text-white shadow-soft">
                <Building2 className="h-6 w-6 text-gold" aria-hidden />
                <h4 className="mt-2 font-display text-xl font-semibold">{c.t}</h4>
                <p className="mt-1 text-sm text-white/70">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="loi" className="container-page scroll-mt-32 py-14">
        <SectionHeading eyebrow={tx('La Loi', 'The Law', 'A Lei')} title={tx('Alliance, commandements et objectifs', 'Covenant, commandments and aims', 'Aliança, mandamentos e objetivos')} description={tx('Textes officiels, en plusieurs langues.', 'Official texts, in several languages.', 'Textos oficiais, em várias línguas.')} />
        <div className="grid gap-6 lg:grid-cols-2">
          {lawTexts.map((l) => <LangTabs key={l.id + locale} list={l} />)}
          <Card>
            <CardBody>
              <h3 className="font-display text-2xl font-semibold text-night">{prophetOath.title}</h3>
              <div className="prose-kcc mt-4">{prophetOath.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section id="culte" className="scroll-mt-32 bg-white py-14">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Liturgie', 'Liturgy', 'Liturgia')} title={tx('Sacrements, fêtes et culte du sabbat', 'Sacraments, feasts and the Sabbath service', 'Sacramentos, festas e culto do sábado')} />
          <div className="grid gap-4 md:grid-cols-3">
            {sacraments.map((s) => (
              <div key={s.t} className="rounded-2xl border border-night/[0.06] bg-white p-5 shadow-soft">
                <h3 className="font-display text-xl font-semibold text-night">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.d}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-12 font-display text-2xl font-semibold text-night">{tx('Fêtes ecclésiastiques', 'Church feasts', 'Festas eclesiásticas')}</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {feasts.map((f) => (
              <li key={f.t} className="flex gap-4 rounded-2xl border border-gold/25 bg-gold-50/40 p-4">
                <span className="w-20 shrink-0 font-display text-lg font-semibold leading-tight text-gold-700">{f.date}</span>
                <div><p className="font-semibold text-night">{f.t}</p><p className="mt-0.5 text-sm text-ink/65">{f.d}</p></div>
              </li>
            ))}
          </ul>

          <h3 className="mt-12 font-display text-2xl font-semibold text-night">{tx('Déroulement ordinaire du culte du sabbat', 'Usual order of the Sabbath service', 'Ordem habitual do culto do sábado')}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sabbathService.map((p) => (
              <div key={p.part} className="rounded-2xl border border-night/[0.06] bg-mist/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">{p.part}</p>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink/80">{p.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="prophete" className="container-page scroll-mt-32 py-14">
        <SectionHeading eyebrow={tx('Fondateur visible', 'Visible founder', 'Fundador visível')} title={tx('Le Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac', 'The Prophet DIZOLELE-MPUNGU WAFIDUSWA Isaac', 'O Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac')} />
        <div className="grid gap-8 lg:grid-cols-5">
          <figure className="h-fit overflow-hidden rounded-3xl bg-night-900 p-2 shadow-lift lg:col-span-2">
            <img src="/images/archives/prophete-portrait-2005.jpg" alt={tx('Portrait de Son Éminence DIZOLELE-MPUNGU WAFIDUSWA Isaac tenant un micro, devant un fond aux lettres KCC', 'Portrait of His Eminence DIZOLELE-MPUNGU WAFIDUSWA Isaac holding a microphone, in front of a KCC backdrop', 'Retrato de Sua Eminência DIZOLELE-MPUNGU WAFIDUSWA Isaac segurando um microfone, diante de um fundo com as letras KCC')} width={1206} height={1400} loading="lazy" className="w-full rounded-[1.25rem] object-cover" />
            <figcaption className="px-3 pb-2 pt-4 text-white">
              <p className="font-display text-lg font-medium">{tx('Son Éminence', 'His Eminence', 'Sua Eminência')} DIZOLELE-MPUNGU WAFIDUSWA Isaac</p>
              <p className="mt-1 text-sm text-white/60">{tx('Prophète et Fondateur, Chef Spirituel et Représentant légal · photo du 8 mars 2005', 'Prophet and Founder, Spiritual Leader and Legal Representative · photo of 8 March 2005', 'Profeta e Fundador, Chefe Espiritual e Representante legal · foto de 8 de março de 2005')}</p>
            </figcaption>
          </figure>
          <div className="lg:col-span-3">
            <div className="prose-kcc">{prophetPortrait.map((p, i) => <p key={i}>{p}</p>)}</div>
            <ol className="relative mt-8 space-y-6 border-l-2 border-gold/30 pl-6">
              {prophetTimeline.map((e) => (
                <li key={e.year + e.t} className="relative">
                  <span className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full bg-gold ring-4 ring-gold/20" aria-hidden />
                  <p className="text-sm font-semibold text-gold-700">{e.year}</p>
                  <p className="font-semibold text-night">{e.t}</p>
                  <p className="mt-0.5 text-sm text-ink/70">{e.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="archives" className="scroll-mt-32 bg-white py-14">
        <div className="container-page">
          <SectionHeading eyebrow={tx('Archives', 'Archives', 'Arquivo')} title={tx('Archives photographiques', 'Photo archive', 'Arquivo fotográfico')} description={tx('Photos d’archives de l’Église (fonds Reagan MBUMBA).', 'Archive photos of the Church (Reagan MBUMBA collection).', 'Fotos de arquivo da Igreja (fundo Reagan MBUMBA).')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((p) => (
              <figure key={p.src} className="overflow-hidden rounded-2xl border border-night/[0.06] bg-white shadow-soft">
                <img src={p.src} alt={pick(p.alt)} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="p-3 text-sm text-ink/70">{pick(p.caption)}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-8 text-xs text-ink/50">{tx('Source des textes', 'Source of the texts', 'Fonte dos textos')} : {doctrineSource}</p>
        </div>
      </section>
    </>
  );
}
