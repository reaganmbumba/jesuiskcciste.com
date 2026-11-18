import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, BellRing, CheckCircle2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Form';
import { useOptionalToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/format';
import { sendTestNotification, TOPICS, useNotifications, type Topic } from './notifications';

type Tx = (fr: string, en: string, pt: string) => string;

export function topicLabel(t: Topic, tx: Tx): { label: string; description: string } {
  switch (t) {
    case 'direct': return { label: tx('Cultes en direct', 'Live services', 'Cultos em direto'), description: tx('Quand un culte ou une fête commence en direct.', 'When a service or feast starts live.', 'Quando um culto ou uma festa começa em direto.') };
    case 'communiques': return { label: tx('Communiqués et actualités', 'Announcements and news', 'Comunicados e notícias'), description: tx('Quand un communiqué ou un article paraît.', 'When an announcement or article is published.', 'Quando sai um comunicado ou um artigo.') };
    case 'predications': return { label: tx('Nouvelles prédications', 'New sermons', 'Novas pregações'), description: tx('Quand une prédication audio est ajoutée.', 'When an audio sermon is added.', 'Quando é adicionada uma pregação áudio.') };
  }
}

/** Message clair pour les erreurs d'activation. */
function errorText(e: unknown, tx: Tx): string {
  const m = e instanceof Error ? e.message : '';
  if (m === 'denied') return tx('Les notifications sont bloquées pour ce site. Ouvrez les réglages du navigateur (le cadenas à côté de l’adresse) et autorisez les notifications.', 'Notifications are blocked for this site. Open the browser settings (the padlock next to the address) and allow notifications.', 'As notificações estão bloqueadas para este site. Abra as definições do navegador (o cadeado ao lado do endereço) e permita as notificações.');
  if (m === 'dismissed') return tx('Vous n’avez pas encore donné la permission. Touchez à nouveau le bouton puis « Autoriser ».', 'You have not given permission yet. Tap the button again, then “Allow”.', 'Ainda não deu permissão. Toque de novo no botão e depois em «Permitir».');
  if (m === 'not-ready') return tx('Les notifications seront disponibles très bientôt : l’administration termine leur mise en place.', 'Notifications will be available very soon: the administration is finishing the setup.', 'As notificações estarão disponíveis muito em breve: a administração está a terminar a configuração.');
  return tx('L’activation n’a pas abouti. Vérifiez votre connexion internet et réessayez.', 'Turning on failed. Check your internet connection and try again.', 'A ativação falhou. Verifique a ligação à internet e tente de novo.');
}

/**
 * Petit encadré « Être prévenu » (accueil, page Direct). Un seul toucher suffit :
 * tous les sujets sont choisis, la page /notifications permet de les régler.
 */
export function NotifyCard({ className, context = 'home' }: { className?: string; context?: 'home' | 'live' | 'page' }) {
  const { tx, locale } = useI18n();
  const toast = useOptionalToast();
  const n = useNotifications(locale);
  const [busy, setBusy] = useState(false);
  if (n.support === 'unsupported' || n.loading || (context === 'home' && n.subscribed)) return null;

  const title = context === 'live'
    ? tx('Être prévenu quand le culte commence', 'Get notified when the service starts', 'Ser avisado quando o culto começa')
    : tx('Recevoir les notifications', 'Get notifications', 'Receber notificações');
  const text = tx('Une alerte sur votre téléphone pour les cultes en direct, les communiqués et les nouvelles prédications.', 'An alert on your phone for live services, announcements and new sermons.', 'Um alerta no telemóvel para os cultos em direto, os comunicados e as novas pregações.');

  const enable = async () => {
    setBusy(true);
    try { await n.enable(); toast?.notify(tx('Notifications activées. Un message d’essai arrive sur votre téléphone.', 'Notifications on. A test message is on its way to your phone.', 'Notificações ativadas. Uma mensagem de teste está a caminho.')); }
    catch (e) { toast?.notify(errorText(e, tx), 'error'); }
    finally { setBusy(false); }
  };

  return (
    <section className={cn('rounded-3xl border border-gold/25 bg-gold-50 p-6 shadow-soft', className)} aria-labelledby={`notify-${context}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-night text-gold-200">{n.subscribed ? <BellRing className="h-5 w-5" aria-hidden /> : <Bell className="h-5 w-5" aria-hidden />}</span>
        <div className="min-w-0">
          <h2 id={`notify-${context}`} className="font-display text-xl font-medium text-night">{n.subscribed ? tx('Notifications activées', 'Notifications are on', 'Notificações ativadas') : title}</h2>
          <p className="mt-1 text-sm text-ink/70">{n.subscribed ? tx('Vous serez prévenu sur cet appareil.', 'You will be notified on this device.', 'Será avisado neste aparelho.') : text}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {n.subscribed ? (
          <Link to="/notifications" className="text-sm font-semibold text-night underline decoration-gold underline-offset-4">{tx('Choisir les sujets', 'Choose topics', 'Escolher os temas')}</Link>
        ) : n.support === 'ok' ? (
          <Button variant="primary" size="sm" loading={busy} icon={<Bell className="h-4 w-4" />} onClick={() => { void enable(); }}>{tx('Activer les notifications', 'Turn on notifications', 'Ativar as notificações')}</Button>
        ) : (
          <ButtonLink to="/notifications" variant="primary" size="sm" icon={<Bell className="h-4 w-4" />}>{tx('Comment les recevoir', 'How to get them', 'Como recebê-las')}</ButtonLink>
        )}
      </div>
    </section>
  );
}

/** Le réglage complet (page /notifications). */
export function NotificationSettings() {
  const { tx, locale } = useI18n();
  const toast = useOptionalToast();
  const n = useNotifications(locale);
  const [busy, setBusy] = useState<'on' | 'off' | 'test' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (what: 'on' | 'off' | 'test', fn: () => Promise<unknown>) => {
    setBusy(what); setError(null);
    try { await fn(); } catch (e) { setError(errorText(e, tx)); } finally { setBusy(null); }
  };

  const toggle = (t: Topic, on: boolean) => {
    const next = on ? TOPICS.filter((k) => k === t || n.topics.includes(k)) : n.topics.filter((k) => k !== t);
    void n.changeTopics(next).then(() => n.subscribed && toast?.notify(tx('Vos choix sont enregistrés.', 'Your choices are saved.', 'As suas escolhas foram guardadas.'))).catch((e) => setError(errorText(e, tx)));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-night/5 sm:p-8">
        <div className="flex items-center gap-3">
          <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', n.subscribed ? 'bg-emerald-600 text-white' : 'bg-night text-gold-200')}>{n.subscribed ? <BellRing className="h-6 w-6" aria-hidden /> : <Bell className="h-6 w-6" aria-hidden />}</span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-night">{n.subscribed ? tx('Les notifications sont activées sur cet appareil', 'Notifications are on for this device', 'As notificações estão ativadas neste aparelho') : tx('Activer les notifications', 'Turn on notifications', 'Ativar as notificações')}</h2>
            <p className="mt-1 text-sm text-ink/65">{tx('Gratuit, sans inscription. Vous pouvez arrêter à tout moment.', 'Free, no sign-up. You can stop at any time.', 'Grátis, sem inscrição. Pode parar a qualquer momento.')}</p>
          </div>
        </div>

        <fieldset className="mt-6 space-y-4">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">{tx('Je veux être prévenu pour', 'Notify me about', 'Quero ser avisado de')}</legend>
          {TOPICS.map((t) => {
            const l = topicLabel(t, tx);
            return <Checkbox key={t} label={l.label} description={l.description} checked={n.topics.includes(t)} onChange={(e) => toggle(t, e.currentTarget.checked)} />;
          })}
        </fieldset>

        {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          {n.support !== 'ok' ? null : n.subscribed ? (
            <>
              <Button variant="outline" loading={busy === 'test'} icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => { void run('test', async () => { if (n.sub && await sendTestNotification(n.sub)) toast?.notify(tx('Message d’essai envoyé.', 'Test message sent.', 'Mensagem de teste enviada.')); else throw new Error('test'); }); }}>{tx('Envoyer un essai', 'Send a test', 'Enviar um teste')}</Button>
              <Button variant="ghost" loading={busy === 'off'} icon={<BellOff className="h-4 w-4" />} onClick={() => { void run('off', n.disable); }}>{tx('Arrêter les notifications', 'Stop notifications', 'Parar as notificações')}</Button>
            </>
          ) : (
            <Button variant="gold" size="lg" loading={busy === 'on'} disabled={!n.topics.length || n.loading} icon={<Bell className="h-5 w-5" />} onClick={() => { void run('on', () => n.enable(n.topics)); }}>{tx('Recevoir les notifications', 'Get notifications', 'Receber notificações')}</Button>
          )}
        </div>
        {n.support === 'ok' && !n.subscribed && n.permission === 'denied' && (
          <p className="mt-4 text-sm text-ink/70">{errorText(new Error('denied'), tx)}</p>
        )}
      </div>

      {n.support === 'app' && (
        <Help title={tx('Dans l’application Google Play', 'In the Google Play app', 'Na aplicação Google Play')}>
          {tx('L’application ne peut pas encore afficher les notifications : elles arriveront avec une prochaine version. En attendant, ouvrez jesuiskcciste.com/notifications dans Chrome et touchez « Recevoir les notifications ».', 'The app cannot show notifications yet: they will come with a future version. Meanwhile, open jesuiskcciste.com/notifications in Chrome and tap “Get notifications”.', 'A aplicação ainda não pode mostrar notificações: chegarão numa próxima versão. Entretanto, abra jesuiskcciste.com/notifications no Chrome e toque em «Receber notificações».')}
        </Help>
      )}
      {n.support === 'ios-install' && (
        <Help title={tx('Sur iPhone et iPad', 'On iPhone and iPad', 'No iPhone e iPad')}>
          {tx('Apple n’envoie les notifications qu’aux sites ajoutés à l’écran d’accueil (iOS 16.4 ou plus récent). Dans Safari, touchez Partager puis « Sur l’écran d’accueil », ouvrez JE SUIS KCCiste depuis la nouvelle icône et revenez sur cette page.', 'Apple only sends notifications to sites added to the Home Screen (iOS 16.4 or later). In Safari, tap Share then “Add to Home Screen”, open JE SUIS KCCiste from the new icon and come back to this page.', 'A Apple só envia notificações a sites adicionados ao ecrã principal (iOS 16.4 ou mais recente). No Safari, toque em Partilhar e depois em «Ecrã principal», abra JE SUIS KCCiste pelo novo ícone e volte a esta página.')}
          {' '}<Link to="/application" className="font-semibold text-night underline decoration-gold underline-offset-4">{tx('Voir les étapes', 'See the steps', 'Ver os passos')}</Link>
        </Help>
      )}
      {n.support === 'unsupported' && (
        <Help title={tx('Navigateur non compatible', 'Browser not supported', 'Navegador não compatível')}>
          {tx('Ce navigateur ne reçoit pas les notifications (ou vous êtes en navigation privée). Ouvrez le site avec Chrome, Edge, Firefox ou Samsung Internet.', 'This browser cannot receive notifications (or you are in private browsing). Open the site in Chrome, Edge, Firefox or Samsung Internet.', 'Este navegador não recebe notificações (ou está em navegação privada). Abra o site no Chrome, Edge, Firefox ou Samsung Internet.')}
        </Help>
      )}

      <Help title={tx('Bon à savoir', 'Good to know', 'Bom saber')}>
        {tx('Les notifications arrivent même quand le site est fermé, tant que le téléphone est connecté à internet. Pour les arrêter, touchez « Arrêter les notifications » ici, ou appuyez longuement sur une notification reçue.', 'Notifications arrive even when the site is closed, as long as the phone is online. To stop them, tap “Stop notifications” here, or long-press a notification you received.', 'As notificações chegam mesmo com o site fechado, desde que o telemóvel esteja ligado à internet. Para as parar, toque em «Parar as notificações» aqui, ou mantenha premida uma notificação recebida.')}
      </Help>
    </div>
  );
}

function Help({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-mist p-6">
      <h3 className="font-display text-lg font-semibold text-night">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/75">{children}</p>
    </div>
  );
}
