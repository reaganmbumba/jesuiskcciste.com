import { useMemo, useState } from 'react';
import { Ban, Camera, CheckCircle2, Copy, MessageCircle, Search, Send, UserRoundPlus } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar, StatCard } from '@/components/ui/Misc';
import { Input } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { WHATSAPP_GROUP_URL } from '@/config/site';
import { env, isDemoMode } from '@/config/env';
import { useAuth } from '@/features/auth/AuthContext';
import { adminReaderAction, demoMatricule, listMatricules, matriculeInitials, matriculeMessage, waNumber, type MatriculeRow } from '@/features/news/readerAccess';
import { useAsync } from '@/hooks/useAsync';
import { supabase } from '@/lib/supabase';
import { membersRepo, parishesRepo, writeAudit } from '@/services';
import type { Profile } from '@/types';
import { formatDate } from '@/utils/format';

const SEEN_KEY = 'kcc.admin.inscriptions.vu';
const fullName = (m: Profile) => [m.lastName, m.middleName, m.firstName].filter(Boolean).join(' ');

/**
 * Rapport à coller dans le groupe WhatsApp : noms seulement, jamais les matricules (personnels).
 * Les inscrits sans photo sont signalés, avec un rappel pour l'ajouter.
 */
export function registrationReport(members: Profile[], parishName: (id?: string | null) => string | null, siteUrl: string): string {
  const list = members.map((m, i) => {
    const where = [parishName(m.parishId), m.city].filter(Boolean).join(', ');
    return `${i + 1}. ${fullName(m)}${where ? ` — ${where}` : ''}${m.avatarUrl ? '' : ' 📸 _photo manquante_'}`;
  });
  const missing = members.filter((m) => !m.avatarUrl).length;
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const reminder = missing
    ? `\n\n📸 *${missing} inscrit${missing > 1 ? 's n’ont' : ' n’a'} pas encore de photo.* Connectez-vous sur ${siteUrl} : le site vous demandera d’ajouter votre photo (appareil photo ou galerie).`
    : '';
  return `📋 *JE SUIS KCCiste* — Rapport des inscriptions (${date})\n\nPaix à vous ! Voici les ${members.length} KCCistes déjà enregistrés sur le site :\n\n${list.join('\n')}${reminder}\n\nVous n'êtes pas encore sur la liste ? Inscrivez-vous ici : ${siteUrl}/matricule\n\n🌐 ${siteUrl}\n💬 Groupe : ${WHATSAPP_GROUP_URL}`;
}

/** Rappel ciblé : uniquement les inscrits à qui il manque la photo. */
export function photoReminder(members: Profile[], siteUrl: string): string {
  const list = members.map((m, i) => `${i + 1}. ${fullName(m)}`).join('\n');
  return `📸 *JE SUIS KCCiste* — Photo manquante\n\nPaix à vous ! Ces KCCistes inscrits n’ont pas encore ajouté leur photo :\n\n${list}\n\nC’est simple : connectez-vous sur ${siteUrl}, le site vous demande aussitôt votre photo. Prenez-vous en photo ou choisissez-en une dans la galerie, puis touchez « Enregistrer ».\n\n💬 Groupe : ${WHATSAPP_GROUP_URL}`;
}

export default function AdminRegistrations() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [onlyNoPhoto, setOnlyNoPhoto] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [revoke, setRevoke] = useState<{ m: Profile; to: Profile['status'] } | null>(null);
  const [lastSeen] = useState(() => { try { return localStorage.getItem(SEEN_KEY); } catch { return null; } });
  const { data, loading, reload } = useAsync(async () => {
    const [members, parishes, mats] = await Promise.all([membersRepo.all(), parishesRepo.all(), listMatricules([]).catch(() => ({} as Record<string, MatriculeRow>))]);
    try { localStorage.setItem(SEEN_KEY, new Date().toISOString()); } catch { /* ignore */ }
    return { members: [...members].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')), parishes, mats };
  }, []);
  const parishName = (id?: string | null) => data?.parishes.find((p) => p.id === id)?.name ?? null;
  const matOf = (m: Profile) => data?.mats[m.id]?.matricule ?? (isDemoMode ? demoMatricule(m.id, matriculeInitials(m)) : null);
  const isNew = (m: Profile) => !!m.createdAt && (lastSeen ? m.createdAt > lastSeen : Date.now() - new Date(m.createdAt).getTime() < 48 * 3600e3);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (data?.members ?? []).filter((m) => !onlyNoPhoto || (!m.avatarUrl && m.status !== 'suspended')).filter((m) => !t || `${fullName(m)} ${m.city} ${m.phone ?? ''} ${matOf(m) ?? ''}`.toLowerCase().includes(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, onlyNoPhoto]);
  if (loading || !data) return <PageLoader />;

  const registered = data.members.filter((m) => m.status === 'active' || m.status === 'pending');
  const revoked = data.members.filter((m) => m.status === 'suspended');
  const fresh = data.members.filter(isNew);
  const site = env.siteUrl || 'https://www.jesuiskcciste.com';
  const report = registrationReport(registered, parishName, site);
  const noPhoto = registered.filter((m) => !m.avatarUrl);
  const pending = data.members.filter((m) => m.status === 'pending');
  const sendPhotoReminder = () => window.open(`https://wa.me/?text=${encodeURIComponent(photoReminder(noPhoto, site))}`, '_blank', 'noopener');

  const sendReport = () => window.open(`https://wa.me/?text=${encodeURIComponent(report)}`, '_blank', 'noopener');
  const copyReport = async () => { try { await navigator.clipboard.writeText(report); notify('Rapport copié : collez-le dans le groupe WhatsApp.'); } catch { notify('Copie impossible sur cet appareil.', 'error'); } };
  const sendMatricule = (m: Profile) => {
    const mat = matOf(m);
    if (!mat) { notify('Pas encore de matricule pour ce compte.', 'error'); return; }
    window.open(`https://wa.me/${waNumber(m.phone) ?? ''}?text=${encodeURIComponent(matriculeMessage(m.firstName, mat, env.siteUrl || 'https://www.jesuiskcciste.com'))}`, '_blank', 'noopener');
    void adminReaderAction(m.id, 'envoye').catch(() => undefined);
  };
  /** Validation des comptes « En attente » (un seul ou tous d'un coup). */
  const validate = async (members: Profile[]) => {
    if (!members.length) return;
    setValidating(members.length === 1 ? members[0].id : 'all');
    try {
      const ids = members.map((m) => m.id);
      if (isDemoMode) await Promise.all(ids.map((id) => membersRepo.update(id, { status: 'active' })));
      else {
        const { data: rows, error } = await supabase!.from('profiles').update({ status: 'active' }).in('id', ids).select('id');
        if (error) throw error;
        if (!rows?.length) throw new Error('Modification refusée : ces membres ne sont pas dans votre périmètre.');
      }
      const actor = profile ? `${profile.firstName} ${profile.lastName}` : '';
      await Promise.all(ids.map((id) => writeAudit(actor, 'member.active', 'profiles', id)));
      notify(members.length === 1 ? `${fullName(members[0])} est validé(e).` : `${members.length} membres validés.`);
      setConfirmAll(false);
      reload();
    } catch (e) {
      notify(`Échec : ${e instanceof Error ? e.message : (e as { message?: string })?.message ?? String(e)}`, 'error');
    } finally {
      setValidating(null);
    }
  };
  const applyRevoke = async () => {
    if (!revoke) return;
    try {
      if (isDemoMode) await membersRepo.update(revoke.m.id, { status: revoke.to });
      else {
        const { data: rows, error } = await supabase!.from('profiles').update({ status: revoke.to }).eq('id', revoke.m.id).select('id');
        if (error) throw error;
        if (!rows?.length) throw new Error('Modification refusée : ce membre n’est pas dans votre périmètre.');
      }
      await writeAudit(profile ? `${profile.firstName} ${profile.lastName}` : '', revoke.to === 'suspended' ? 'member.revoke' : 'member.restore', 'profiles', revoke.m.id);
      notify(revoke.to === 'suspended' ? 'Accès révoqué : ce compte ne peut plus lire les articles.' : 'Accès rétabli.');
      setRevoke(null);
      reload();
    } catch (e) {
      notify(`Échec : ${e instanceof Error ? e.message : (e as { message?: string })?.message ?? String(e)}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-night">Inscriptions</h1>
          <p className="text-sm text-ink/60">Tous les KCCistes enregistrés sur le site, du plus récent au plus ancien.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={sendReport} icon={<Send className="h-4 w-4" />}>Envoyer le rapport au groupe</Button>
          <Button variant="outline" onClick={() => void copyReport()} icon={<Copy className="h-4 w-4" />}>Copier</Button>
        </div>
      </div>

      {fresh.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold-50 p-4 text-sm text-night">
          <UserRoundPlus className="h-5 w-5 shrink-0 text-gold-700" />
          <span><b>{fresh.length} nouvelle{fresh.length > 1 ? 's' : ''} inscription{fresh.length > 1 ? 's' : ''}</b> depuis votre dernière visite : {fresh.slice(0, 4).map(fullName).join(', ')}{fresh.length > 4 ? '…' : ''}</span>
        </div>
      )}

      {pending.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-700" />
          <p className="flex-1 text-sm text-night"><b>{pending.length} inscription{pending.length > 1 ? 's' : ''} en attente de validation</b> : {pending.slice(0, 5).map(fullName).join(', ')}{pending.length > 5 ? '…' : ''}</p>
          <Button size="sm" onClick={() => setConfirmAll(true)} loading={validating === 'all'} icon={<CheckCircle2 className="h-4 w-4" />}>Tout valider ({pending.length})</Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<UserRoundPlus className="h-5 w-5" />} label="Inscrits" value={registered.length} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Nouveaux" value={fresh.length} />
        <StatCard icon={<Ban className="h-5 w-5" />} label="Révoqués" value={revoked.length} />
      </div>

      <div className={`flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center ${noPhoto.length ? 'border border-red-200 bg-red-50' : 'border border-emerald-200 bg-emerald-50'}`}>
        <Camera className={`h-5 w-5 shrink-0 ${noPhoto.length ? 'text-red-600' : 'text-emerald-700'}`} />
        <p className="flex-1 text-sm text-night">{noPhoto.length
          ? <><b>{noPhoto.length} inscrit{noPhoto.length > 1 ? 's' : ''} sans photo</b> : {noPhoto.slice(0, 5).map(fullName).join(', ')}{noPhoto.length > 5 ? '…' : ''}</>
          : <b>Tous les inscrits ont leur photo.</b>}</p>
        {noPhoto.length > 0 && <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={onlyNoPhoto ? 'primary' : 'outline'} onClick={() => setOnlyNoPhoto((v) => !v)}>{onlyNoPhoto ? 'Voir tout le monde' : 'Voir la liste'}</Button>
          <Button size="sm" variant="outline" onClick={sendPhotoReminder} icon={<Send className="h-4 w-4" />}>Rappel au groupe</Button>
        </div>}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom, une ville, un matricule…" className="pl-10" />
      </div>

      <ul className="space-y-3">
        {shown.map((m) => {
          const mat = matOf(m);
          const r = data.mats[m.id];
          return (
            <li key={m.id}><Card><CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Avatar person={m} url={m.avatarUrl} size={56} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-night">{fullName(m)}
                    {isNew(m) && <Badge tone="gold">Nouveau</Badge>}
                    {m.status === 'suspended' ? <Badge tone="red">Révoqué</Badge> : m.status === 'pending' ? <Badge tone="amber">En attente</Badge> : <Badge tone="green">Actif</Badge>}
                    {!m.avatarUrl && <Badge tone="red">Photo manquante</Badge>}
                  </p>
                  <p className="text-sm text-ink/60">{[parishName(m.parishId), m.city, m.country].filter(Boolean).join(' · ')}</p>
                  <p className="text-xs text-ink/50">{mat && <span className="mr-2 font-mono font-semibold text-night">{mat}</span>}{m.phone && <span className="mr-2">{m.phone}</span>}Inscrit le {formatDate(m.createdAt, 'fr', { dateStyle: 'medium' })}{r?.deviceLabel ? ` · lit sur ${r.deviceLabel}` : ''}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {m.status === 'pending' && <Button size="sm" onClick={() => void validate([m])} loading={validating === m.id} icon={<CheckCircle2 className="h-4 w-4" />}>Valider</Button>}
                {m.status !== 'suspended' && <Button size="sm" variant="outline" onClick={() => sendMatricule(m)} icon={<MessageCircle className="h-4 w-4" />}>Matricule</Button>}
                {m.status === 'suspended'
                  ? <Button size="sm" variant="outline" onClick={() => setRevoke({ m, to: 'active' })} icon={<CheckCircle2 className="h-4 w-4" />}>Rétablir</Button>
                  : m.id !== profile?.id && <Button size="sm" variant="danger" onClick={() => setRevoke({ m, to: 'suspended' })} icon={<Ban className="h-4 w-4" />}>Révoquer</Button>}
              </div>
            </CardBody></Card></li>
          );
        })}
        {!shown.length && <li className="py-10 text-center text-sm text-ink/55">Aucune inscription trouvée.</li>}
      </ul>

      <ConfirmDialog open={!!revoke} danger={revoke?.to === 'suspended'}
        title={revoke?.to === 'suspended' ? 'Révoquer cet accès ?' : 'Rétablir cet accès ?'}
        message={revoke ? `${fullName(revoke.m)} — ${revoke.to === 'suspended' ? 'le compte est suspendu : il ne peut plus lire les articles ni utiliser son matricule.' : 'le compte redevient actif avec le même matricule.'}` : ''}
        onConfirm={applyRevoke} onCancel={() => setRevoke(null)} />
      <ConfirmDialog open={confirmAll} title={`Valider les ${pending.length} inscriptions en attente ?`}
        message={pending.map(fullName).join(', ')}
        onConfirm={() => validate(pending)} onCancel={() => setConfirmAll(false)} />
    </div>
  );
}
