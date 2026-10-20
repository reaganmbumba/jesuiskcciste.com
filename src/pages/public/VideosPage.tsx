import { PageHeader } from '@/components/ui/Misc';
import { YouTubeChannelSection, YouTubeSubscribeButton } from '@/components/common/YouTubeChannel';
import { useI18n } from '@/i18n';

export default function VideosPage() {
  const { tx } = useI18n();
  return (
    <>
      <PageHeader eyebrow={tx('Médias', 'Media', 'Média')} title={tx('Vidéos', 'Videos', 'Vídeos')} description={tx('Les vidéos de la communauté sont publiées sur notre chaîne YouTube « Je suis KCCiste ». Chaque abonnement et chaque partage aide la chaîne à grandir.', 'The community’s videos are published on our YouTube channel “Je suis KCCiste”. Every subscription and every share helps the channel grow.', 'Os vídeos da comunidade são publicados no nosso canal YouTube «Je suis KCCiste». Cada subscrição e cada partilha ajuda o canal a crescer.')}>
        <YouTubeSubscribeButton />
      </PageHeader>
      <YouTubeChannelSection />
    </>
  );
}
