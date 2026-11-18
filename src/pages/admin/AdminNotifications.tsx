import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, Send, XCircle } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/format';

interface PushMessage {
  id: number; key: string | null; topic: string; title: { fr: string }; body: { fr?: string }; url: string;
  status: 'pending' | 'sending' | 'done' | 'cancelled'; sent: number; failed: number; removed: number; created_at: string;
}
interface Stats { total: number; direct: number; communiques: number; predications: number }

const TOPIC_LABEL: Record<string, string> = {
  general: 'Tous les abonnés',
  direct: 'Abonnés « Cultes en direct »',
  communiques: 'Abonnés « Communiqués et actualités »',
  predications: 'Abonnés « Nouvelles prédications »',
};
const STATUS_LABEL: Record<PushMessage['status'], string> = { pending: 'En attente', sending: 'Envoi en cours', done: 'Envoyée', cancelled: 'Annulée' };

const errorMessage = (e: unknown) => (e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : String(e));

async function loadAll(): Promise<{ ready: boolean; stats: Stats | null; messages: PushMessage[] }> {
  const ready = await fetch('/api/notifications/etat').then((r) => r.json()).then((d: { pret?: boolean }) => !!d.pret).catch(() => false);
  if (isDemoMode) return { ready, stats: null, messages: [] };
  const [stats, messages] = await Promise.all([
    supabase!.rpc('push_stats').then(({ data, error }) => (error ? null : (data as Stats))),
    supabase!.from('push_messages').select('id,key,topic,title,body,url,status,sent,failed,removed,created_at').order('id', { ascending: false }).limit(30)
      .then(({ data, error }) => { if (error) throw error; return (data ?? []) as PushMessage[]; }),
  ]);
  return { ready, stats, messages };
}

/** Lance l'envoi par lots jusqu'au bout (chaque appel du Worker envoie un lot). */
async function flush(onProgress: (sent: number) => void): Promise<number> {
  let total = 0;
  for (let i = 0; i < 400; i++) {
    const r = await fetch('/api/notifications/envoyer', { method: 'POST' });
    const d = (await r.json().catch(() => ({}))) as { sent?: number; pending?: boolean; error?: string };
    if (!r.ok) throw new Error(d.error ?? `erreur ${r.status}`);
    total += d.sent ?? 0;
    onProgress(total);
    if (!d.pending) return total;
  }
  return total;
}

/** Envoyer une notification à la main et voir l'historique. */
export default function AdminNotifications() {
  const { notify } = useToast();
  const { data, loading, error, reload } = useAsync(loadAll, []);
  const [topic, setTopic] = useState('general');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [sending, setSending] = useState<number | null>(null);

  const linkOk = /^\/[^\s]*$/.test(url.trim() || '/');

  const send = async () => {
    const t = title.trim();
    if (t.length < 2) { notify('Écrivez un titre (au moins 2 lettres).', 'error'); return; }
    if (!linkOk) { notify('Le lien doit être une page du site qui commence par « / », par exemple /direct ou /actualites.', 'error'); return; }
    if (isDemoMode) { notify('Démonstration : aucune notification envoyée.'); return; }
    if (!window.confirm(`Envoyer « ${t} » à : ${TOPIC_LABEL[topic].toLowerCase()} ?`)) return;
    setSending(0);
    try {
      const { error: e } = await supabase!.from('push_messages').insert({ topic, title: { fr: t }, body: { fr: body.trim() }, url: url.trim() || '/' });
      if (e) throw e;
      const n = await flush(setSending);
      notify(`Notification envoyée à ${n} appareil${n > 1 ? 's' : ''}.`);
      setTitle(''); setBody(''); setUrl('/');
    } catch (e) {
      notify(`L’envoi a échoué : ${errorMessage(e)}`, 'error');
    } finally { setSending(null); reload(); }
  };

  const cancel = async (m: PushMessage) => {
    const { error: e } = await supabase!.from('push_messages').update({ status: 'cancelled' }).eq('id', m.id);
    if (e) notify(`Échec : ${errorMessage(e)}`, 'error'); else reload();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-night">Notifications sur le téléphone</h1>
        <p className="mt-1 text-sm text-ink/65">
          Les fidèles s’abonnent sur <Link to="/notifications" className="font-semibold text-gold-700 hover:underline">la page Notifications</Link> (ou avec le bouton de l’accueil et de la page Direct).
          Le site les prévient tout seul quand un direct commence, quand un communiqué paraît et quand une prédication est ajoutée. Ici, vous pouvez aussi envoyer un message vous-même.
        </p>
      </div>
      <DemoInline />

      {loading ? <Skeleton className="h-24" /> : data && !data.ready && (
        <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Les notifications ne sont pas encore branchées : il manque les clés secrètes <b>VAPID_PRIVATE_KEY</b> et <b>SUPABASE_SERVICE_KEY</b> dans Cloudflare (Worker jesuiskcciste-com › Paramètres › Variables et secrets). Les abonnements et les envois commenceront dès qu’elles seront ajoutées.</p>
        </div>
      )}

      {data?.stats && (
        <div className="grid gap-3 sm:grid-cols-4">
          {([['Abonnés', data.stats.total], ['Directs', data.stats.direct], ['Communiqués', data.stats.communiques], ['Prédications', data.stats.predications]] as const).map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-white p-4 text-center shadow-soft ring-1 ring-night/5"><p className="font-display text-3xl font-semibold text-night">{v}</p><p className="text-xs text-ink/60">{l}</p></div>
          ))}
        </div>
      )}

      <Card><CardBody className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-night"><Bell className="h-5 w-5 text-gold-600" />Envoyer une notification</h2>
        <Field label="Destinataires">{(p) => (
          <Select {...p} value={topic} onChange={(e) => setTopic(e.target.value)}>
            {Object.entries(TOPIC_LABEL).map(([k, l]) => <option key={k} value={k}>{l}{data?.stats ? ` (${k === 'general' ? data.stats.total : data.stats[k as keyof Stats]})` : ''}</option>)}
          </Select>
        )}</Field>
        <Field label="Titre" hint="Court et clair, par exemple « Culte d’action de grâce dimanche à 9 h ».">{(p) => <Input {...p} maxLength={110} value={title} onChange={(e) => setTitle(e.target.value)} />}</Field>
        <Field label="Message (facultatif)" hint="Deux ou trois lignes au plus : le téléphone coupe les textes longs.">{(p) => <Textarea {...p} rows={3} maxLength={300} value={body} onChange={(e) => setBody(e.target.value)} />}</Field>
        <Field label="Page ouverte quand on touche la notification" error={linkOk ? undefined : 'Adresse d’une page du site, commençant par /'} hint="Par exemple /direct, /actualites, /predications ou / pour l’accueil.">{(p) => <Input {...p} value={url} onChange={(e) => setUrl(e.target.value)} />}</Field>

        {(title.trim() || body.trim()) && (
          <div className="flex gap-3 rounded-2xl bg-mist p-4">
            <img src="/icon-192.png" alt="" className="h-10 w-10 rounded-xl" />
            <div className="min-w-0"><p className="text-xs text-ink/50">JE SUIS KCCiste · aperçu</p><p className="truncate text-sm font-semibold text-night">{title.trim() || '…'}</p><p className="line-clamp-2 text-sm text-ink/70">{body.trim()}</p></div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => { void send(); }} loading={sending !== null} disabled={data ? !data.ready : true} icon={<Send className="h-4 w-4" />}>Envoyer maintenant</Button>
          {sending !== null && <span className="text-sm text-ink/60">{sending} envoyée{sending > 1 ? 's' : ''}…</span>}
        </div>
      </CardBody></Card>

      <Card><CardBody>
        <h2 className="mb-3 font-display text-lg font-semibold text-night">Dernières notifications</h2>
        {error ? <p className="text-sm text-red-700">Lecture impossible : {errorMessage(error)}. Le code SQL des notifications a-t-il été collé dans Supabase ?</p>
          : loading ? <Skeleton className="h-24" />
            : !data?.messages.length ? <p className="text-sm text-ink/60">Aucune notification pour l’instant.</p>
              : (
                <ul className="divide-y divide-night/[0.06]">
                  {data.messages.map((m) => (
                    <li key={m.id} className="flex items-start gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-night">{m.title.fr}</p>
                        {m.body?.fr && <p className="line-clamp-2 text-sm text-ink/65">{m.body.fr}</p>}
                        <p className="mt-1 text-xs text-ink/50">
                          {formatDate(m.created_at, 'fr', { dateStyle: 'medium', timeStyle: 'short' })} · {m.key ? 'automatique' : 'envoyée à la main'} · {TOPIC_LABEL[m.topic] ?? m.topic} · {STATUS_LABEL[m.status]} · {m.sent} reçue{m.sent > 1 ? 's' : ''}{m.failed ? ` · ${m.failed} en échec` : ''}{m.removed ? ` · ${m.removed} abonnement${m.removed > 1 ? 's' : ''} expiré${m.removed > 1 ? 's' : ''} retiré${m.removed > 1 ? 's' : ''}` : ''}
                        </p>
                      </div>
                      {(m.status === 'pending' || m.status === 'sending') && (
                        <Button size="sm" variant="ghost" icon={<XCircle className="h-4 w-4" />} onClick={() => { void cancel(m); }}>Annuler</Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
      </CardBody></Card>
    </div>
  );
}
