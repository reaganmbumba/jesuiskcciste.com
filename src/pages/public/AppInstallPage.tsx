import { CheckCircle2, Download, Monitor, Share, Smartphone, SquarePlus, MoreVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { useInstallApp, type Platform } from '@/features/pwa/install';
import { cn } from '@/utils/format';

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-4 space-y-3">
      {items.map((s, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-100 text-sm font-bold text-night">{i + 1}</span>
          <span className="pt-0.5">{s}</span>
        </li>
      ))}
    </ol>
  );
}

const Key = ({ children }: { children: ReactNode }) => <span className="inline-flex items-center gap-1 rounded-md bg-mist px-1.5 py-0.5 font-semibold text-night">{children}</span>;

export default function AppInstallPage() {
  const { tx } = useI18n();
  const { platform, installed, canPrompt, install } = useInstallApp();

  const blocks: { id: Platform; icon: typeof Smartphone; title: string; steps: ReactNode[] }[] = [
    { id: 'android', icon: Smartphone, title: tx('Téléphone Android (Samsung, Tecno, Infinix…)', 'Android phone (Samsung, Tecno, Infinix…)', 'Telemóvel Android (Samsung, Tecno, Infinix…)'), steps: [
      tx('Ouvrez jesuiskcciste.com avec Chrome.', 'Open jesuiskcciste.com in Chrome.', 'Abra jesuiskcciste.com no Chrome.'),
      <>{tx('Touchez le menu', 'Tap the menu', 'Toque no menu')} <Key><MoreVertical className="h-4 w-4" /></Key> {tx('en haut à droite.', 'at the top right.', 'no canto superior direito.')}</>,
      <>{tx('Choisissez', 'Choose', 'Escolha')} <Key>{tx('Installer l’application', 'Install app', 'Instalar aplicação')}</Key> {tx('(ou « Ajouter à l’écran d’accueil »), puis confirmez.', '(or “Add to Home screen”), then confirm.', '(ou «Adicionar ao ecrã inicial»), e confirme.')}</>,
    ] },
    { id: 'ios', icon: Smartphone, title: tx('iPhone et iPad', 'iPhone and iPad', 'iPhone e iPad'), steps: [
      tx('Ouvrez jesuiskcciste.com avec Safari.', 'Open jesuiskcciste.com in Safari.', 'Abra jesuiskcciste.com no Safari.'),
      <>{tx('Touchez le bouton Partager', 'Tap the Share button', 'Toque no botão Partilhar')} <Key><Share className="h-4 w-4" /></Key> {tx('en bas de l’écran.', 'at the bottom of the screen.', 'na parte de baixo do ecrã.')}</>,
      <>{tx('Faites défiler et touchez', 'Scroll and tap', 'Deslize e toque em')} <Key><SquarePlus className="h-4 w-4" /> {tx('Sur l’écran d’accueil', 'Add to Home Screen', 'Ecrã principal')}</Key>{tx(', puis « Ajouter ».', ', then “Add”.', ' e depois «Adicionar».')}</>,
    ] },
    { id: 'desktop', icon: Monitor, title: tx('Ordinateur (Chrome ou Edge)', 'Computer (Chrome or Edge)', 'Computador (Chrome ou Edge)'), steps: [
      tx('Ouvrez jesuiskcciste.com.', 'Open jesuiskcciste.com.', 'Abra jesuiskcciste.com.'),
      <>{tx('Cliquez sur l’icône', 'Click the icon', 'Clique no ícone')} <Key><Download className="h-4 w-4" /></Key> {tx('à droite de la barre d’adresse, puis sur « Installer ».', 'on the right of the address bar, then “Install”.', 'à direita da barra de endereço e depois em «Instalar».')}</>,
    ] },
  ];
  const ordered = [...blocks].sort((a, b) => Number(b.id === platform) - Number(a.id === platform));

  return (
    <>
      <PageHeader
        eyebrow={tx('Application', 'App', 'Aplicação')}
        title={tx('JE SUIS KCCiste sur votre téléphone', 'JE SUIS KCCiste on your phone', 'JE SUIS KCCiste no seu telemóvel')}
        description={tx('Installez le site comme une application : une icône sur votre écran d’accueil, l’ouverture en plein écran, et toujours la dernière version. Gratuit, sans passer par une boutique.', 'Install the site as an app: an icon on your home screen, full-screen opening and always the latest version. Free, no app store needed.', 'Instale o site como uma aplicação: um ícone no ecrã inicial, abertura em ecrã inteiro e sempre a versão mais recente. Grátis, sem passar por uma loja.')}
      >
        {installed ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-gold-200"><CheckCircle2 className="h-5 w-5" /> {tx('L’application est installée sur cet appareil.', 'The app is installed on this device.', 'A aplicação está instalada neste aparelho.')}</p>
        ) : canPrompt ? (
          <Button variant="gold" size="lg" icon={<Download className="h-5 w-5" />} onClick={() => { void install(); }}>{tx('Installer l’application', 'Install the app', 'Instalar a aplicação')}</Button>
        ) : null}
      </PageHeader>

      <section className="container-page grid gap-5 py-12 lg:grid-cols-3">
        {ordered.map(({ id, icon: Icon, title, steps }) => (
          <Card key={id} className={cn(id === platform && 'ring-2 ring-gold')}>
            <CardBody>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-night text-gold-200"><Icon className="h-5 w-5" /></span>
                <h2 className="font-display text-xl font-semibold text-night">{title}</h2>
              </div>
              {id === platform && <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">{tx('Votre appareil', 'Your device', 'O seu aparelho')}</p>}
              <Steps items={steps} />
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="container-page pb-16">
        <div className="rounded-3xl bg-mist p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-night">{tx('Fichier Android (APK)', 'Android file (APK)', 'Ficheiro Android (APK)')}</h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-ink/75">{tx('Si l’installation ci-dessus ne marche pas sur votre téléphone Android, téléchargez l’application. Android vous demandera d’autoriser l’installation depuis cette source : acceptez, puis ouvrez le fichier.', 'If the installation above does not work on your Android phone, download the app. Android will ask you to allow installs from this source: accept, then open the file.', 'Se a instalação acima não funcionar no seu telemóvel Android, descarregue a aplicação. O Android vai pedir autorização para instalar desta fonte: aceite e abra o ficheiro.')}</p>
          <a href="/app/android.apk" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-night px-5 text-sm font-semibold text-white hover:bg-night-600"><Download className="h-4 w-4" /> {tx('Télécharger pour Android', 'Download for Android', 'Descarregar para Android')}</a>
        </div>
      </section>
    </>
  );
}
