import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import type { ForumTopic } from '@/types';
import { createTopic, TOPIC_BODY_MAX, TOPIC_TITLE_MAX, updateTopic } from './forum';

/** Publier un nouveau sujet ou modifier un sujet existant (modération uniquement). */
export function TopicDialog({ open, topic, onClose, onSaved }: { open: boolean; topic?: ForumTopic | null; onClose: () => void; onSaved: (t?: ForumTopic) => void }) {
  const { tx } = useI18n();
  const { notify } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(topic?.title ?? '');
    setBody(topic?.body ?? '');
    setPinned(topic?.isPinned ?? false);
  }, [open, topic]);

  const valid = title.trim().length >= 3;
  async function save() {
    if (!valid) return;
    setBusy(true);
    try {
      if (topic) {
        await updateTopic(topic.id, { title, body, isPinned: pinned });
        onSaved();
      } else {
        onSaved(await createTopic({ title, body, isPinned: pinned }));
      }
      notify(topic ? tx('Sujet modifié.', 'Topic updated.', 'Tema alterado.') : tx('Sujet publié.', 'Topic published.', 'Tema publicado.'));
      onClose();
    } catch (e) {
      notify(e instanceof Error ? e.message : tx('L’enregistrement a échoué.', 'Saving failed.', 'A gravação falhou.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title={topic ? tx('Modifier le sujet', 'Edit topic', 'Editar o tema') : tx('Nouveau sujet', 'New topic', 'Novo tema')}
      footer={<><Button variant="outline" onClick={onClose}>{tx('Annuler', 'Cancel', 'Cancelar')}</Button><Button onClick={save} loading={busy} disabled={!valid}>{topic ? tx('Enregistrer', 'Save', 'Guardar') : tx('Publier', 'Publish', 'Publicar')}</Button></>}>
      <div className="space-y-4">
        <Field label={tx('Titre du sujet', 'Topic title', 'Título do tema')} required>
          {(p) => <Input {...p} value={title} maxLength={TOPIC_TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder={tx('Ex. : Comment vivez-vous le Sabbat ?', 'E.g.: How do you live the Sabbath?', 'Ex.: Como vive o Sábado?')} />}
        </Field>
        <Field label={tx('Texte (facultatif)', 'Text (optional)', 'Texto (opcional)')} hint={tx('Présentez la question à discuter.', 'Introduce the question to discuss.', 'Apresente a questão a discutir.')}>
          {(p) => <Textarea {...p} rows={7} value={body} maxLength={TOPIC_BODY_MAX} onChange={(e) => setBody(e.target.value)} />}
        </Field>
        <Checkbox checked={pinned} onChange={(e) => setPinned(e.target.checked)} label={tx('Épingler en haut de la liste', 'Pin to the top of the list', 'Fixar no topo da lista')} />
      </div>
    </Modal>
  );
}

/** Les paragraphes d'un texte saisi (lignes vides = nouveau paragraphe). */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return <div className={className}>{text.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>;
}
