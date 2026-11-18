import { PageHeader } from '@/components/ui/Misc';
import { useI18n } from '@/i18n';
import { NotificationSettings } from '@/features/notifications/NotificationsUi';

export default function PushNotificationsPage() {
  const { tx } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow={tx('Application', 'App', 'Aplicação')}
        title={tx('Notifications sur le téléphone', 'Notifications on your phone', 'Notificações no telemóvel')}
        description={tx('Soyez prévenu dès qu’un culte commence en direct, qu’un communiqué paraît ou qu’une nouvelle prédication est ajoutée.', 'Be told as soon as a service starts live, an announcement is published or a new sermon is added.', 'Seja avisado logo que um culto começa em direto, sai um comunicado ou é adicionada uma nova pregação.')}
      />
      <section className="container-page max-w-3xl py-12">
        <NotificationSettings />
      </section>
    </>
  );
}
