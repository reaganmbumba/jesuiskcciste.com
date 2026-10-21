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
import { eventCategoryLabel, eventStatus } from '@/features/events/labels';
import { useI18n } from '@/i18n';
import { formatDate, formatTime } from '@/utils/format';

export default function EventDetailPage() {
  const { id = '' } = useParams();
  const { profile } = useAuth();
  const { locale, tx } = useI18n();
  const { notify } = useToast();
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { data, loading } = useAsync(async () => {
    const e = await eventsRepo.get(id);
    return { e: e && (e.audience === 'public' || profile) ? e : null, parish: e?.parishId ? await parishesRepo.get(e.parishId) : null };
  }, [id, profile?.id]);
  if (loading) return <PageLoader />;
  if (!data?.e) return <div className="container-page py-16"><EmptyState title={tx('Événement introuvable ou réservé aux membres.', 'Event not found or for members only.', 'Evento não encontrado ou reservado aos membros.')} action={<ButtonLink to="/agenda" variant="outline">{tx('Retour à l’agenda', 'Back to the calendar', 'Voltar à agenda')}</ButtonLink>} /></div>;
  const e = data.e;
  const st = eventStatus(e.status, locale);

  const register = async () => {
    setRegistering(true);
    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 400));
        setRegistered(true);
        notify(tx('Démonstration : inscription simulée, rien n’a été enregistré.', 'Demo: registration simulated, nothing was saved.', 'Demonstração: inscrição simulada, nada foi guardado.'), 'info');
      } else {
        const { error } = await supabase!.from('event_registrations').insert({ event_id: e.id, user_id: profile!.id });
        if (error) throw error;
        setRegistered(true);
        notify(tx('Votre inscription est enregistrée.', 'Your registration has been saved.', 'A sua inscrição foi registada.'));
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : tx('Inscription impossible.', 'Registration failed.', 'Inscrição impossível.'), 'error');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <>
      <PageHeader image={e.posterUrl} eyebrow={eventCategoryLabel(e.category, locale)} title={e.title} metaDescription={e.description}>
        <div className="flex flex-wrap gap-2"><Badge tone={st.tone}>{st.label}</Badge>{e.audience !== 'public' && <Badge tone="blue">{tx('Réservé aux membres', 'Members only', 'Reservado aos membros')}</Badge>}</div>
      </PageHeader>
      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {e.posterUrl && <img src={e.posterUrl} alt={`${tx('Affiche', 'Poster', 'Cartaz')} : ${e.title}`} className="w-full rounded-2xl" loading="lazy" />}
          <Card><CardBody><h2 className="font-display text-xl font-semibold text-night">{tx('Description', tx('Description', 'Description', 'Descrição'), 'Descrição')}</h2><p className="mt-2 leading-relaxed text-ink/75">{e.description}</p></CardBody></Card>
          <Card><CardBody><h2 className="font-display text-xl font-semibold text-night">{tx('Modalités de participation', 'How to take part', 'Modalidades de participação')}</h2><p className="mt-2 leading-relaxed text-ink/75">{e.participation}</p></CardBody></Card>
        </div>
        <aside className="space-y-4">
          <Card><CardBody className="space-y-3 text-sm">
            <p className="flex gap-3"><CalendarDays className="h-5 w-5 text-gold" /><span className="capitalize">{formatDate(e.startsAt, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, e.timezone)}</span></p>
            <p className="flex gap-3"><Clock className="h-5 w-5 text-gold" />{formatTime(e.startsAt, locale, e.timezone)}{e.endsAt && ` – ${formatTime(e.endsAt, locale, e.timezone)}`}</p>
            <p className="flex gap-3"><Globe className="h-5 w-5 text-gold" />{tx('Fuseau', 'Time zone', 'Fuso horário')} : {e.timezone}</p>
            <p className="flex gap-3"><MapPin className="h-5 w-5 text-gold" />{e.location}</p>
            <p className="flex gap-3"><Users className="h-5 w-5 text-gold" />{data.parish?.name ?? tx('Organisation centrale', 'Central organisation', 'Organização central')}</p>
            <p className="flex gap-3"><UserCheck className="h-5 w-5 text-gold" />{tx('Responsable', 'Organiser', 'Responsável')} : {e.organizer || tx('à préciser', 'to be confirmed', 'a indicar')}</p>
          </CardBody></Card>
          {e.registrationEnabled && e.status === 'scheduled' && (
            <Card><CardBody>
              <h2 className="font-semibold text-night">{tx('Inscription', 'Registration', 'Inscrição')}</h2>
              {isDemoMode && profile && <div className="mt-3"><DemoInline>{tx('Démonstration : l’inscription est simulée et n’est pas enregistrée.', 'Demo: registration is simulated and not saved.', 'Demonstração: a inscrição é simulada e não é guardada.')}</DemoInline></div>}
              {!profile ? <ButtonLink to="/connexion" className="mt-3 w-full">{tx('Se connecter pour s’inscrire', 'Log in to register', 'Iniciar sessão para se inscrever')}</ButtonLink>
                : registered ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{isDemoMode ? tx('Inscription simulée (démonstration).', 'Registration simulated (demo).', 'Inscrição simulada (demonstração).') : tx('Vous êtes inscrit(e) à cet événement.', 'You are registered for this event.', 'Está inscrito(a) neste evento.')}</p>
                : <Button className="mt-3 w-full" loading={registering} onClick={register}>{tx('S’inscrire à l’événement', 'Register for the event', 'Inscrever-se no evento')}</Button>}
            </CardBody></Card>
          )}
        </aside>
      </section>
    </>
  );
}
