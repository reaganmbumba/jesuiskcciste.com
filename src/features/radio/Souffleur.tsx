import { useState } from 'react';
import { ChevronDown, Loader2, Sparkles, MessageSquareQuote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/format';

/**
 * Souffleur d'antenne : des phrases prêtes en bon français pour chaque moment du direct
 * (remplies avec le nom de l'émission et le sujet), et un assistant IA qui reformule
 * ce que l'animateur veut dire, ou propose des idées.
 */
const PHRASES: { moment: string; lignes: string[] }[] = [
  { moment: 'Ouverture', lignes: [
    'Paix à vous, chers auditeurs de Radio Je suis KCCiste ! Il est {heure}, et vous écoutez {emission}.',
    'Bienvenue à vous qui nous rejoignez, au pays comme dans la diaspora. Aujourd’hui, nous parlons de : {sujet}.',
    'Installez-vous confortablement et restez avec nous : l’émission commence.',
  ] },
  { moment: 'Vers un chant', lignes: [
    'Avant de continuer, écoutons ensemble un chant. Restez avec nous.',
    'Laissons la louange monter vers l’Éternel avec ce chant. On se retrouve juste après.',
    'Un chant pour méditer ce que nous venons d’entendre.',
  ] },
  { moment: 'Après le chant', lignes: [
    'Vous êtes toujours sur Radio Je suis KCCiste. Paix à vous ! Nous reprenons {emission}.',
    'Merci pour ce beau chant. Revenons à notre sujet : {sujet}.',
  ] },
  { moment: 'Invité', lignes: [
    'J’ai la joie d’accueillir un invité sur le plateau. Paix à vous, et bienvenue sur Radio Je suis KCCiste. Présentez-vous à nos auditeurs.',
    'Merci pour ce témoignage. Une dernière question avant de nous quitter…',
    'Merci d’avoir été avec nous aujourd’hui. Que l’Éternel vous garde.',
  ] },
  { moment: 'Appels', lignes: [
    'Les lignes sont ouvertes : touchez « Appeler l’émission » sur la page de la radio ou dans l’application.',
    'Nous avons un appel. Paix à vous, vous êtes à l’antenne : donnez-nous votre nom et votre paroisse.',
    'Merci pour votre appel, et restez à l’écoute.',
  ] },
  { moment: 'Dédicaces', lignes: [
    'Une dédicace nous est parvenue. Elle vient de… de la paroisse de… et elle est pour…',
    'Une intention de prière nous est parvenue. Prions ensemble l’Éternel pour cette intention.',
    'Vous aussi, envoyez vos dédicaces et vos intentions de prière depuis la page de la radio.',
  ] },
  { moment: 'Gagner du temps', lignes: [
    'Prenons un instant pour bien comprendre cela.',
    'Autrement dit…',
    'C’est un point important, j’y reviens.',
    'Je vous laisse méditer cette parole.',
  ] },
  { moment: 'Annonces', lignes: [
    'Partagez la radio autour de vous : jesuiskcciste.com/radio, ou l’application Radio KCC.',
    'Vous avez manqué une émission ? Réécoutez-la sur la page des rediffusions.',
  ] },
  { moment: 'Clôture', lignes: [
    'Nous arrivons à la fin de {emission}. Merci de nous avoir suivis.',
    'Que l’Éternel vous bénisse et vous garde. Paix à vous !',
    'Restez sur Radio Je suis KCCiste : la musique continue.',
  ] },
];

const MODES = [
  ['reformuler', 'En bon français'],
  ['idees', 'Des idées'],
  ['questions', 'Questions à l’invité'],
  ['transition', 'Transition chant'],
  ['cloture', 'Conclure'],
] as const;

export function Souffleur({ title, topic, dark }: { title: string; topic: string; dark?: boolean }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<'phrases' | 'ia'>('phrases');
  const [moment, setMoment] = useState(PHRASES[0].moment);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState('');
  const [answer, setAnswer] = useState('');
  const [err, setErr] = useState('');
  const fill = (l: string) => l
    .replace('{emission}', title.trim() || 'notre émission')
    .replace('{sujet}', (topic.trim().split(/\n/)[0] || 'le sujet du jour').slice(0, 160))
    .replace('{heure}', new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h '));

  async function ask(mode: string) {
    setErr(''); setAnswer(''); setBusy(mode);
    try {
      const { data } = await supabase!.auth.getSession();
      const r = await fetch('/api/souffleur', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` }, body: JSON.stringify({ mode, text, title, topic }) });
      const j = (await r.json().catch(() => ({}))) as { text?: string; error?: string };
      if (r.status === 503 && j.error === 'no_key') throw new Error('L’assistant IA n’est pas encore activé : la clé ANTHROPIC_API_KEY doit être ajoutée dans Cloudflare (secret du site).');
      if (!r.ok || !j.text) throw new Error(j.error === 'vide' ? 'Écrivez d’abord ce que vous voulez dire, ou remplissez le sujet de l’émission.' : 'L’assistant ne répond pas pour le moment. Réessayez.');
      setAnswer(j.text);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Erreur'); } finally { setBusy(''); }
  }

  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300', sub: 'text-white/55', chip: 'bg-white/[0.08] text-white/80', on: 'bg-gold text-night', line: 'bg-white/[0.05]', field: 'w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-white placeholder:text-white/35' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-3 text-night', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]', sub: 'text-ink/55', chip: 'border border-[#d3dae3] text-night', on: 'bg-gold text-night', line: 'bg-[#f3f6f9]', field: 'w-full rounded border border-[#d3dae3] px-3 py-2' };
  const cur = PHRASES.find((p) => p.moment === moment) ?? PHRASES[0];
  return (
    <section className={c.box}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn('flex w-full items-center justify-between gap-2', c.hd)}>
        <span className="flex items-center gap-2"><MessageSquareQuote className="h-4 w-4 text-gold" />Souffleur d’antenne</span>
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-1.5" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'phrases'} onClick={() => setTab('phrases')} className={cn('rounded-xl px-3 py-2 text-sm font-semibold', tab === 'phrases' ? c.on : c.chip)}>Phrases prêtes</button>
            <button type="button" role="tab" aria-selected={tab === 'ia'} onClick={() => setTab('ia')} className={cn('inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold', tab === 'ia' ? c.on : c.chip)}><Sparkles className="h-4 w-4" />Assistant IA</button>
          </div>
          {tab === 'phrases' ? (
            <>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {PHRASES.map((p) => <button key={p.moment} type="button" onClick={() => setMoment(p.moment)} className={cn('rounded-full px-3 py-1 text-xs font-semibold', moment === p.moment ? c.on : c.chip)}>{p.moment}</button>)}
              </div>
              <ul className="mt-3 space-y-2">
                {cur.lignes.map((l) => <li key={l} className={cn('rounded-2xl px-3 py-2.5 text-[17px] leading-snug', c.line)}>{fill(l)}</li>)}
              </ul>
            </>
          ) : (
            <div className="mt-3 space-y-2">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1500} placeholder="Écrivez ce que vous voulez dire, même en lingala ou en français approximatif…" className={c.field} />
              <div className="flex flex-wrap gap-1.5">
                {MODES.map(([m, l]) => (
                  <button key={m} type="button" disabled={!!busy} onClick={() => void ask(m)} className={cn('inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold disabled:opacity-50', m === 'reformuler' ? c.on : c.chip)}>
                    {busy === m && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{l}
                  </button>
                ))}
              </div>
              <p className={cn('text-xs', c.sub)}>Les idées utilisent aussi le titre et le sujet de l’émission. Relisez toujours avant de lire à l’antenne.</p>
              {err && <p className="text-sm text-red-500" role="alert">{err}</p>}
              {answer && <div className={cn('whitespace-pre-line rounded-2xl px-3 py-3 text-[17px] leading-snug', c.line)}>{answer}</div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
