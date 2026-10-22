import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import type { Meeting } from '@/types';
import { getRoom, MEETING_BODY_MAX, MEETING_TITLE_MAX, meetingErrorText, saveMeeting } from './meetings';

/** Date ISO → valeur d'un champ datetime-local, à l'heure de l'appareil. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Prochaine heure pleine. */
function nextHour(): string {
  const d = new Date(Date.now() + 3600000);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

const DURATIONS = [30, 45, 60, 90, 120, 180, 240];

/** Programmer ou modifier une réunion (modération uniquement). */
export function MeetingDialog({ open, meeting, onClose, onSaved }: { open: boolean; meeting?: Meeting | null; onClose: () => void; onSaved: () => void }) {
  const { tx } = useI18n();
  const { notify } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [audience, setAudience] = useState<Meeting['audience']>('members');
  const [externalUrl, setExternalUrl] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(meeting?.title ?? '');
    setDescription(meeting?.description ?? '');
    setStartsAt(toLocalInput(meeting?.startsAt ?? nextHour()));
    setDuration(meeting?.durationMinutes ?? 60);
    setAudience(meeting?.audience ?? 'members');
    setExternalUrl('');
    if (meeting) void getRoom(meeting.id).then((r) => setExternalUrl(r?.externalUrl ?? '')).catch(() => undefined);
  }, [open, meeting]);

  const valid = title.trim().length >= 3 && !!startsAt && !Number.isNaN(new Date(startsAt).getTime());
  async function save() {
    if (!valid) return;
    setBusy(true);
    try {
      await saveMeeting({ title, description, startsAt, durationMinutes: duration, audience, externalUrl }, meeting);
      notify(meeting ? tx('Réunion modifiée.', 'Meeting updated.', 'Reunião alterada.') : tx('Réunion programmée.', 'Meeting scheduled.', 'Reunião agendada.'));
      onSaved();
      onClose();
    } catch (e) {
      notify(meetingErrorText(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title={meeting ? tx('Modifier la réunion', 'Edit meeting', 'Editar a reunião') : tx('Programmer une réunion', 'Schedule a meeting', 'Agendar uma reunião')}
      footer={<><Button variant="outline" onClick={onClose}>{tx('Annuler', 'Cancel', 'Cancelar')}</Button><Button onClick={save} loading={busy} disabled={!valid}>{meeting ? tx('Enregistrer', 'Save', 'Guardar') : tx('Programmer', 'Schedule', 'Agendar')}</Button></>}>
      <div className="space-y-4">
        <Field label={tx('Titre de la réunion', 'Meeting title', 'Título da reunião')} required>
          {(p) => <Input {...p} value={title} maxLength={MEETING_TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder={tx('Ex. : Réunion de préparation de la fête du 12 octobre', 'E.g.: Preparation meeting for the 12 October feast', 'Ex.: Reunião de preparação da festa de 12 de outubro')} />}
        </Field>
        <Field label={tx('Sujet / ordre du jour (facultatif)', 'Topic / agenda (optional)', 'Tema / ordem do dia (opcional)')} hint={tx('Les sujets qui seront partagés pendant la réunion.', 'The topics that will be shared during the meeting.', 'Os temas que serão partilhados durante a reunião.')}>
          {(p) => <Textarea {...p} rows={5} value={description} maxLength={MEETING_BODY_MAX} onChange={(e) => setDescription(e.target.value)} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={tx('Date et heure de début', 'Start date and time', 'Data e hora de início')} required hint={tx('À l’heure de votre appareil. Chaque membre la verra à son heure locale.', 'In your device’s time. Each member sees it in their local time.', 'Na hora do seu aparelho. Cada membro vê-a na sua hora local.')}>
            {(p) => <Input {...p} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />}
          </Field>
          <Field label={tx('Durée prévue', 'Planned length', 'Duração prevista')}>
            {(p) => (
              <Select {...p} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {DURATIONS.map((d) => <option key={d} value={d}>{d < 60 ? `${d} min` : `${Math.floor(d / 60)} h${d % 60 ? ` ${d % 60}` : ''}`}</option>)}
              </Select>
            )}
          </Field>
        </div>
        <Field label={tx('Qui peut entrer ?', 'Who can join?', 'Quem pode entrar?')}>
          {(p) => (
            <Select {...p} value={audience} onChange={(e) => setAudience(e.target.value as Meeting['audience'])}>
              <option value="members">{tx('Membres inscrits et validés seulement', 'Registered, approved members only', 'Apenas membros inscritos e validados')}</option>
              <option value="public">{tx('Tout le monde, même sans compte', 'Everyone, even without an account', 'Todos, mesmo sem conta')}</option>
            </Select>
          )}
        </Field>
        <Field label={tx('Lien Zoom ou Google Meet (facultatif)', 'Zoom or Google Meet link (optional)', 'Link Zoom ou Google Meet (opcional)')}
          hint={tx('Laissez vide pour utiliser la salle vidéo gratuite du site (Jitsi Meet). Pour la démarrer, la première personne entrée se connecte une fois avec Google : faites-le vous-même quelques minutes avant.', 'Leave empty to use the site’s free video room (Jitsi Meet). To start it, the first person in signs in once with Google: do it yourself a few minutes before.', 'Deixe vazio para usar a sala de vídeo gratuita do site (Jitsi Meet). Para a iniciar, a primeira pessoa a entrar inicia sessão uma vez com o Google: faça-o você mesmo alguns minutos antes.')}>
          {(p) => <Input {...p} type="url" inputMode="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://zoom.us/j/…" />}
        </Field>
      </div>
    </Modal>
  );
}
