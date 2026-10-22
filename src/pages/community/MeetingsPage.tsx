import { useState } from 'react';
import { CalendarClock, Clock, Globe2, Lock, Mic, MonitorUp, Pencil, Plus, Smartphone, Trash2, Users, Video, VideoOff } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink, buttonClass } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { DemoInline } from '@/components/common/DemoNotice';
import { useAuth } from '@/features/auth/AuthContext';
import { deleteMeeting, joinUrl, listMeetings, listRooms, meetingEnd, meetingErrorText, meetingStatus, OPENS_BEFORE_MIN, setMeetingCancelled, splitMeetings } from '@/features/meetings/meetings';
import { MeetingDialog } from '@/features/meetings/MeetingsUi';
import { Paragraphs } from '@/features/forum/ForumUi';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { can } from '@/lib/permissions';
import { formatDate, formatTime, fullName } from '@/utils/format';
import type { Meeting, MeetingRoom } from '@/types';

/** Réunions en visioconférence : l'administration programme, les membres rejoignent la salle vidéo. */
export default function MeetingsPage() {
  const { tx } = useI18n();
  const { profile } = useAuth();
  const { notify } = useToast();
  const moderator = can(profile, 'moderation');
  const meetings = useAsync(listMeetings, []);
  const { upcoming, past } = splitMeetings(meetings.data ?? []);
  const ids = upcoming.map((m) => m.id).join(',');
  const rooms = useAsync(() => listRooms(ids ? ids.split(',') : []), [ids, profile?.id, profile?.status]);
  const [editing, setEditing] = useState<Meeting | null | 'new'>(null);
  const [removing, setRemoving] = useState<Meeting | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => { void meetings.reload(); void rooms.reload(); };

  async function toggleCancelled(m: Meeting) {
    try {
      await setMeetingCancelled(m.id, !m.isCancelled);
      notify(m.isCancelled ? tx('Réunion rétablie.', 'Meeting restored.', 'Reunião restabelecida.') : tx('Réunion annulée.', 'Meeting cancelled.', 'Reunião cancelada.'));
      reload();
    } catch (e) {
      notify(meetingErrorText(e), 'error');
    }
  }

  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      await deleteMeeting(removing.id);
      notify(tx('Réunion supprimée.', 'Meeting deleted.', 'Reunião eliminada.'));
      setRemoving(null);
      reload();
    } catch (e) {
      notify(meetingErrorText(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  const card = (m: Meeting) => (
    <MeetingCard key={m.id} m={m} room={rooms.data?.find((r) => r.meetingId === m.id)} moderator={moderator}
      onEdit={() => setEditing(m)} onToggle={() => void toggleCancelled(m)} onDelete={() => setRemoving(m)} />
  );

  return (
    <>
      <PageHeader eyebrow={tx('Communauté', 'Community', 'Comunidade')} title={tx('Réunions en vidéo', 'Video meetings', 'Reuniões por vídeo')}
        description={tx('Se réunir en visioconférence, comme sur Zoom, pour partager des sujets entre membres, où que vous soyez.', 'Meet by video call, like on Zoom, to share topics between members, wherever you are.', 'Reunir-se por videoconferência, como no Zoom, para partilhar temas entre membros, onde quer que esteja.')} />

      <section className="container-page py-14">
        <DemoInline>{tx('Démonstration : réunion d’exemple. Les vraies réunions apparaissent dès que l’administration les programme.', 'Demo: sample meeting. Real meetings appear once the administration schedules them.', 'Demonstração: reunião de exemplo. As reuniões reais aparecem quando a administração as agendar.')}</DemoInline>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-ink/70">
            {profile
              ? tx(`La salle s’ouvre ${OPENS_BEFORE_MIN} minutes avant le début. Les heures sont affichées à l’heure de votre appareil.`, `The room opens ${OPENS_BEFORE_MIN} minutes before the start. Times are shown in your device’s time.`, `A sala abre ${OPENS_BEFORE_MIN} minutos antes do início. As horas são mostradas na hora do seu aparelho.`)
              : tx('Tout le monde peut voir le programme. Pour entrer dans une réunion des membres, connectez-vous avec votre compte.', 'Anyone can see the schedule. To join a members’ meeting, log in with your account.', 'Todos podem ver o programa. Para entrar numa reunião de membros, inicie sessão com a sua conta.')}
          </p>
          <div className="flex flex-wrap gap-2">
            {moderator && <Button size="sm" onClick={() => setEditing('new')} icon={<Plus className="h-4 w-4" />}>{tx('Programmer une réunion', 'Schedule a meeting', 'Agendar uma reunião')}</Button>}
            {!profile && <ButtonLink to="/connexion" state={{ from: '/reunions' }} size="sm" variant="outline">{tx('Se connecter', 'Log in', 'Iniciar sessão')}</ButtonLink>}
            {!profile && <ButtonLink to="/inscription" size="sm" variant="gold">{tx('S’inscrire', 'Sign up', 'Inscrever-se')}</ButtonLink>}
          </div>
        </div>

        {meetings.error ? <ErrorState error={meetings.error} onRetry={reload} /> : meetings.loading ? (
          <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}</div>
        ) : upcoming.length === 0 ? (
          <EmptyState icon={<Video className="h-6 w-6" aria-hidden />} title={tx('Aucune réunion prévue pour le moment.', 'No meeting scheduled yet.', 'Ainda não há reuniões agendadas.')}
            description={moderator ? tx('Programmez la première avec le bouton « Programmer une réunion ».', 'Schedule the first one with the “Schedule a meeting” button.', 'Agende a primeira com o botão «Agendar uma reunião».') : tx('Revenez bientôt : les prochaines réunions seront annoncées ici.', 'Come back soon: the next meetings will be announced here.', 'Volte em breve: as próximas reuniões serão anunciadas aqui.')} />
        ) : (
          <ul className="space-y-4">{upcoming.map(card)}</ul>
        )}

        <HowItWorks />

        {past.length > 0 && (
          <details className="mt-10">
            <summary className="cursor-pointer font-display text-lg font-semibold text-night">{tx(`Réunions passées (${past.length})`, `Past meetings (${past.length})`, `Reuniões passadas (${past.length})`)}</summary>
            <ul className="mt-4 space-y-3 opacity-80">{past.map(card)}</ul>
          </details>
        )}
      </section>

      {moderator && <MeetingDialog open={editing !== null} meeting={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={reload} />}
      <ConfirmDialog open={!!removing} danger loading={busy} title={tx('Supprimer la réunion ?', 'Delete the meeting?', 'Eliminar a reunião?')}
        message={tx('Elle disparaîtra du programme. Pour seulement prévenir les membres, préférez « Annuler ».', 'It will disappear from the schedule. To just let members know, use “Cancel” instead.', 'Desaparecerá do programa. Para apenas avisar os membros, prefira «Cancelar».')}
        confirmLabel={tx('Supprimer', 'Delete', 'Eliminar')} onConfirm={() => void remove()} onCancel={() => setRemoving(null)} />
    </>
  );
}

function MeetingCard({ m, room, moderator, onEdit, onToggle, onDelete }: { m: Meeting; room?: MeetingRoom; moderator: boolean; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const { tx, locale } = useI18n();
  const { profile } = useAuth();
  const status = meetingStatus(m);
  const start = new Date(m.startsAt);
  const live = status === 'open' && start <= new Date() && new Date() <= meetingEnd(m);

  let action: React.ReactNode = null;
  if (status === 'cancelled' || status === 'ended') action = null;
  else if (room && (status === 'open' || moderator)) {
    action = (
      <a href={joinUrl(room, profile ? fullName(profile) : undefined)} target="_blank" rel="noopener noreferrer" className={buttonClass(status === 'open' ? 'gold' : 'outline', 'md')}>
        <Video className="h-4 w-4" aria-hidden />{status === 'open' ? tx('Rejoindre la réunion', 'Join the meeting', 'Entrar na reunião') : tx('Ouvrir la salle (admin)', 'Open the room (admin)', 'Abrir a sala (admin)')}
      </a>
    );
  } else if (room) {
    action = <p className="text-sm text-ink/60">{tx(`Le bouton « Rejoindre » apparaîtra ${OPENS_BEFORE_MIN} minutes avant le début.`, `The “Join” button will appear ${OPENS_BEFORE_MIN} minutes before the start.`, `O botão «Entrar» aparecerá ${OPENS_BEFORE_MIN} minutos antes do início.`)}</p>;
  } else if (!profile) {
    action = <ButtonLink to="/connexion" state={{ from: '/reunions' }} variant="outline">{tx('Se connecter pour rejoindre', 'Log in to join', 'Iniciar sessão para entrar')}</ButtonLink>;
  } else {
    action = <p className="text-sm text-ink/60">{tx('Votre compte doit être validé par l’administration pour entrer dans cette réunion.', 'Your account must be approved by the administration to join this meeting.', 'A sua conta tem de ser validada pela administração para entrar nesta reunião.')}</p>;
  }

  return (
    <li className={`rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${m.isCancelled ? 'border-dashed border-night/20' : live ? 'border-gold/60 ring-2 ring-gold/30' : 'border-night/[0.06]'}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-night text-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-300">{formatDate(m.startsAt, locale, { month: 'short' })}</span>
          <span className="font-display text-2xl font-semibold leading-none">{formatDate(m.startsAt, locale, { day: 'numeric' })}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {m.isCancelled ? <Badge tone="red"><VideoOff className="h-3 w-3" aria-hidden />{tx('Annulée', 'Cancelled', 'Cancelada')}</Badge>
              : live ? <Badge tone="green"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />{tx('En cours', 'Live now', 'A decorrer')}</Badge>
              : status === 'open' ? <Badge tone="gold">{tx('Salle ouverte', 'Room open', 'Sala aberta')}</Badge>
              : status === 'ended' ? <Badge>{tx('Terminée', 'Ended', 'Terminada')}</Badge>
              : <Badge tone="blue">{tx('À venir', 'Upcoming', 'Brevemente')}</Badge>}
            {m.audience === 'public'
              ? <Badge><Globe2 className="h-3 w-3" aria-hidden />{tx('Ouverte à tous', 'Open to all', 'Aberta a todos')}</Badge>
              : <Badge><Lock className="h-3 w-3" aria-hidden />{tx('Membres', 'Members', 'Membros')}</Badge>}
          </div>
          <h2 className={`mt-2 font-display text-xl font-semibold leading-snug text-night ${m.isCancelled ? 'line-through decoration-night/30' : ''}`}>{m.title}</h2>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/65">
            <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-gold-700" aria-hidden />{formatDate(m.startsAt, locale, { weekday: 'long', day: 'numeric', month: 'long' })} · {formatTime(m.startsAt, locale)} – {formatTime(meetingEnd(m).toISOString(), locale)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold-700" aria-hidden />{m.durationMinutes < 60 ? `${m.durationMinutes} min` : `${Math.floor(m.durationMinutes / 60)} h${m.durationMinutes % 60 ? ` ${m.durationMinutes % 60}` : ''}`}</span>
            {room?.externalUrl && <span className="inline-flex items-center gap-1.5"><Video className="h-4 w-4 text-gold-700" aria-hidden />{new URL(room.externalUrl).hostname.replace(/^www\./, '')}</span>}
          </p>
          {m.description && <Paragraphs text={m.description} className="mt-3 space-y-2 text-[15px] text-ink/75" />}
          {action && <div className="mt-4">{action}</div>}
          {moderator && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-night/[0.06] pt-4">
              <Button size="sm" variant="outline" onClick={onEdit} icon={<Pencil className="h-4 w-4" />}>{tx('Modifier', 'Edit', 'Editar')}</Button>
              <Button size="sm" variant="outline" onClick={onToggle} icon={m.isCancelled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}>{m.isCancelled ? tx('Rétablir', 'Restore', 'Restabelecer') : tx('Annuler la réunion', 'Cancel meeting', 'Cancelar a reunião')}</Button>
              <Button size="sm" variant="outline" onClick={onDelete} icon={<Trash2 className="h-4 w-4" />}>{tx('Supprimer', 'Delete', 'Eliminar')}</Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function HowItWorks() {
  const { tx } = useI18n();
  const steps = [
    { icon: Users, title: tx('Connectez-vous', 'Log in', 'Inicie sessão'), text: tx('Avec votre compte de membre, puis cliquez sur « Rejoindre la réunion ». Votre nom est déjà rempli.', 'With your member account, then click “Join the meeting”. Your name is already filled in.', 'Com a sua conta de membro, depois clique em «Entrar na reunião». O seu nome já está preenchido.') },
    { icon: Smartphone, title: tx('Sur téléphone', 'On a phone', 'No telemóvel'), text: tx('La première fois, installez l’application gratuite « Jitsi Meet » (Play Store ou App Store) quand elle est proposée.', 'The first time, install the free “Jitsi Meet” app (Play Store or App Store) when offered.', 'Da primeira vez, instale a aplicação gratuita «Jitsi Meet» (Play Store ou App Store) quando for sugerida.') },
    { icon: Mic, title: tx('Caméra et micro', 'Camera and mic', 'Câmara e micro'), text: tx('Autorisez-les quand le navigateur le demande. Coupez votre micro quand vous ne parlez pas.', 'Allow them when the browser asks. Mute your mic when you are not speaking.', 'Autorize-os quando o navegador pedir. Desligue o micro quando não estiver a falar.') },
    { icon: MonitorUp, title: tx('Partager un sujet', 'Share a topic', 'Partilhar um tema'), text: tx('Levez la main, écrivez dans la discussion ou partagez votre écran pour montrer un document.', 'Raise your hand, write in the chat or share your screen to show a document.', 'Levante a mão, escreva no chat ou partilhe o ecrã para mostrar um documento.') },
  ];
  return (
    <section className="mt-12 rounded-3xl bg-mist p-6 sm:p-8" aria-labelledby="how-meetings">
      <h2 id="how-meetings" className="font-display text-xl font-semibold text-night">{tx('Comment ça marche ?', 'How does it work?', 'Como funciona?')}</h2>
      <p className="mt-1 text-sm text-ink/65">{tx('Gratuit, sans abonnement : la salle vidéo s’ouvre dans un nouvel onglet ou dans l’application Jitsi Meet.', 'Free, no subscription: the video room opens in a new tab or in the Jitsi Meet app.', 'Gratuito, sem assinatura: a sala de vídeo abre num novo separador ou na aplicação Jitsi Meet.')}</p>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, k) => (
          <li key={k} className="rounded-2xl bg-white p-5 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700"><Icon className="h-5 w-5" aria-hidden /></span>
            <h3 className="mt-3 font-semibold text-night">{title}</h3>
            <p className="mt-1 text-sm text-ink/65">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
