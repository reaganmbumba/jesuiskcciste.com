import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, Clock, Globe, MapPin, UserCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Spinner';
import { DemoInline } from '@/components/common/DemoNotice';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/features/auth/AuthContext';
import { eventsRepo, parishesRepo } from '@/services';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/config/env';
import { EVENT_CATEGORY_LABELS, EVENT_STATUS } from '@/features/events/labels';
import { useI18n } from '@/i18n';
import { formatDate, formatTime } from '@/utils/format';

export default function EventDetailPage() {
  const { id = '' } = useParams();
  const { profile } = useAuth();
  const { locale } = useI18n();
  const { notify } = useToast();
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { data, loading } = useAsync(async () => {
    const e = await eventsRepo.get(id);
    return { e: e && (e.audience === 'public' || profile) ? e : null, parish: e?.parishId ? await parishesRepo.get(e.parishId) : null };
  }, [id, profile?.id]);
  if (loading) return <PageLoader />;
  if (!data?.e) return <div className="container-page py-16"><EmptyState title="Événement introuvable ou réservé aux membres." action={<ButtonLink to="/agenda" variant="outline">Retour à l’agenda</ButtonLink>} /></div>;
  const e = data.e;
  const st = EVENT_STATUS[e.status];

  const register = async () => {
    setRegistering(true);
    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 400));
        setRegistered(true);
        notify('Démonstration : inscription simulée, rien n’a été enregistré.', 'info');
      } else {
        const { error } = await supabase!.from('event_registrations').insert({ event_id: e.id, user_id: profile!.id });
        if (error) throw error;
        setRegistered(true);
        notify('Votre inscription est enregistrée.');
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Inscription impossible.', 'error');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow={EVENT_CATEGORY_LABELS[e.category]} title={e.title}>
        <div className="flex flex-wrap gap-2"><Badge tone={st.tone}>{st.label}</Badge>{e.audience !== 'public' && <Badge tone="blue">Réservé aux membres</Badge>}</div>
      </PageHeader>
      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {e.posterUrl && <img src={e.posterUrl} alt={`Affiche : ${e.title}`} className="w-full rounded-2xl" loading="lazy" />}
          <Card><CardBody><h2 className="font-display text-xl font-semibold text-night">Description</h2><p className="mt-2 leading-relaxed text-ink/75">{e.description}</p></CardBody></Card>
          <Card><CardBody><h2 className="font-display text-xl font-semibold text-night">Modalités de participation</h2><p className="mt-2 leading-relaxed text-ink/75">{e.participation}</p></CardBody></Card>
        </div>
        <aside className="space-y-4">
          <Card><CardBody className="space-y-3 text-sm">
            <p className="flex gap-3"><CalendarDays className="h-5 w-5 text-gold" /><span className="capitalize">{formatDate(e.startsAt, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, e.timezone)}</span></p>
            <p className="flex gap-3"><Clock className="h-5 w-5 text-gold" />{formatTime(e.startsAt, locale, e.timezone)}{e.endsAt && ` – ${formatTime(e.endsAt, locale, e.timezone)}`}</p>
            <p className="flex gap-3"><Globe className="h-5 w-5 text-gold" />Fuseau : {e.timezone}</p>
            <p className="flex gap-3"><MapPin className="h-5 w-5 text-gold" />{e.location}</p>
            <p className="flex gap-3"><Users className="h-5 w-5 text-gold" />{data.parish?.name ?? 'Organisation centrale'}</p>
            <p className="flex gap-3"><UserCheck className="h-5 w-5 text-gold" />Responsable : {e.organizer || 'à préciser'}</p>
          </CardBody></Card>
          {e.registrationEnabled && e.status === 'scheduled' && (
            <Card><CardBody>
              <h2 className="font-semibold text-night">Inscription</h2>
              {isDemoMode && profile && <div className="mt-3"><DemoInline>Démonstration : l’inscription est simulée et n’est pas enregistrée.</DemoInline></div>}
              {!profile ? <ButtonLink to="/connexion" className="mt-3 w-full">Se connecter pour s’inscrire</ButtonLink>
                : registered ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{isDemoMode ? 'Inscription simulée (démonstration).' : 'Vous êtes inscrit(e) à cet événement.'}</p>
                : <Button className="mt-3 w-full" loading={registering} onClick={register}>S’inscrire à l’événement</Button>}
            </CardBody></Card>
          )}
        </aside>
      </section>
    </>
  );
}
